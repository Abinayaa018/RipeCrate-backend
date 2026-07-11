"""
RipeCrate ML Training Pipeline
Trains two models from perishable_goods_management.csv:
  1. Spoilage classifier  -> was_spoiled (binary)
  2. Shelf-life regressor -> days_until_expiry (continuous)

Both are saved as joblib pipelines. Feature importance is exported to JSON.
"""
import json
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.metrics import (
    accuracy_score, roc_auc_score,
    mean_absolute_error, r2_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

try:
    from xgboost import XGBClassifier, XGBRegressor
    XGB_OK = True
except ImportError:
    XGB_OK = False

ROOT = Path(__file__).resolve().parent
MODEL_DIR = ROOT / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
DATA_PATH = ROOT / "datasets" / "raw" / "perishable_goods_management.csv"

# ── Feature sets ──────────────────────────────────────────────────────────────
NUMERIC_FEATURES = [
    "storage_temp", "temp_deviation", "spoilage_sensitivity",
    "temp_abuse_events", "distribution_hours", "handling_score",
    "packaging_score", "shelf_life_days", "days_remaining_at_purchase",
    "daily_demand", "demand_variability", "supplier_score",
    "day_of_week", "is_weekend", "month",
]
CAT_FEATURES = ["category", "region", "quality_grade"]

SPOILAGE_TARGET = "was_spoiled"
SHELF_TARGET = "days_until_expiry"


def load_and_clean(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    print(f"Loaded {len(df):,} rows × {df.shape[1]} cols")

    # Drop leakage columns (post-sale outcomes)
    leakage = [
        "record_id", "product_id", "store_id", "supplier_id",
        "transaction_date", "expiration_date",
        "units_sold", "units_wasted", "waste_pct",
        "revenue", "waste_cost", "profit", "profit_margin_pct",
        "markdown_applied", "discount_pct", "selling_price",
        "base_price", "cost_price", "initial_quantity",
        "spoilage_risk",  # direct proxy of target
    ]
    df.drop(columns=[c for c in leakage if c in df.columns], inplace=True)

    # Fill missing
    for c in df.select_dtypes(include=[np.number]).columns:
        df[c] = df[c].fillna(df[c].median())
    for c in df.select_dtypes(include=["object", "category"]).columns:
        df[c] = df[c].fillna("unknown")

    return df


def build_preprocessor(num_cols, cat_cols):
    return ColumnTransformer([
        ("num", StandardScaler(), num_cols),
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
    ])


def train_classifier(X_train, X_test, y_train, y_test, num_cols, cat_cols):
    pre = build_preprocessor(num_cols, cat_cols)

    models = {
        "gb": GradientBoostingClassifier(
            n_estimators=300, max_depth=5, learning_rate=0.08,
            subsample=0.8, min_samples_leaf=20, random_state=42,
        ),
    }
    if XGB_OK:
        models["xgb"] = XGBClassifier(
            n_estimators=400, max_depth=6, learning_rate=0.07,
            subsample=0.8, colsample_bytree=0.8,
            use_label_encoder=False, eval_metric="logloss",
            random_state=42, n_jobs=-1,
        )

    best_pipe, best_auc, best_name = None, 0.0, ""
    for name, clf in models.items():
        pipe = Pipeline([("pre", pre), ("clf", clf)])
        pipe.fit(X_train, y_train)
        proba = pipe.predict_proba(X_test)[:, 1]
        auc = roc_auc_score(y_test, proba)
        acc = accuracy_score(y_test, pipe.predict(X_test))
        print(f"  [{name}] AUC={auc:.4f}  ACC={acc:.4f}")
        if auc > best_auc:
            best_auc, best_pipe, best_name = auc, pipe, name

    print(f"  Best classifier: {best_name}  AUC={best_auc:.4f}")
    return best_pipe, best_auc


def train_regressor(X_train, X_test, y_train, y_test, num_cols, cat_cols):
    pre = build_preprocessor(num_cols, cat_cols)

    models = {
        "gb": GradientBoostingRegressor(
            n_estimators=300, max_depth=5, learning_rate=0.08,
            subsample=0.8, min_samples_leaf=20, random_state=42,
        ),
    }
    if XGB_OK:
        models["xgb"] = XGBRegressor(
            n_estimators=400, max_depth=6, learning_rate=0.07,
            subsample=0.8, colsample_bytree=0.8,
            random_state=42, n_jobs=-1,
        )

    best_pipe, best_r2, best_name = None, -999.0, ""
    for name, reg in models.items():
        pipe = Pipeline([("pre", pre), ("reg", reg)])
        pipe.fit(X_train, y_train)
        preds = pipe.predict(X_test)
        mae = mean_absolute_error(y_test, preds)
        r2 = r2_score(y_test, preds)
        print(f"  [{name}] MAE={mae:.3f}  R²={r2:.4f}")
        if r2 > best_r2:
            best_r2, best_pipe, best_name = r2, pipe, name

    print(f"  Best regressor: {best_name}  R²={best_r2:.4f}")
    return best_pipe, best_r2


def extract_feature_importance(pipe, num_cols, cat_cols, top_n=10):
    try:
        pre = pipe.named_steps["pre"]
        estimator = pipe.named_steps.get("clf") or pipe.named_steps.get("reg")
        importances = estimator.feature_importances_

        # Reconstruct feature names after OHE
        ohe = pre.named_transformers_["cat"]
        cat_names = list(ohe.get_feature_names_out(cat_cols))
        all_names = list(num_cols) + cat_names

        pairs = sorted(zip(all_names, importances), key=lambda x: x[1], reverse=True)
        return [{"feature": n, "importance": round(float(v), 5)} for n, v in pairs[:top_n]]
    except Exception:
        return []


def main():
    df = load_and_clean(DATA_PATH)

    available_num = [c for c in NUMERIC_FEATURES if c in df.columns]
    available_cat = [c for c in CAT_FEATURES if c in df.columns]
    features = available_num + available_cat

    print(f"\nFeatures used ({len(features)}): {features}")

    X = df[features]
    y_cls = df[SPOILAGE_TARGET].astype(int)
    y_reg = df[SHELF_TARGET].clip(lower=0)

    X_tr, X_te, yc_tr, yc_te, yr_tr, yr_te = train_test_split(
        X, y_cls, y_reg, test_size=0.2, random_state=42, stratify=y_cls
    )

    print("\n-- Training spoilage classifier --")
    clf_pipe, clf_auc = train_classifier(X_tr, X_te, yc_tr, yc_te, available_num, available_cat)

    print("\n-- Training shelf-life regressor --")
    reg_pipe, reg_r2 = train_regressor(X_tr, X_te, yr_tr, yr_te, available_num, available_cat)

    # Save models
    clf_path = MODEL_DIR / "spoilage_classifier.joblib"
    reg_path = MODEL_DIR / "shelf_life_regressor.joblib"
    joblib.dump(clf_pipe, clf_path)
    joblib.dump(reg_pipe, reg_path)
    print(f"\nSaved: {clf_path}")
    print(f"Saved: {reg_path}")

    # Feature importance
    clf_importance = extract_feature_importance(clf_pipe, available_num, available_cat)
    reg_importance = extract_feature_importance(reg_pipe, available_num, available_cat)

    meta = {
        "numeric_features": available_num,
        "cat_features": available_cat,
        "spoilage_classifier": {
            "path": str(clf_path.name),
            "roc_auc": round(clf_auc, 4),
            "feature_importance": clf_importance,
        },
        "shelf_life_regressor": {
            "path": str(reg_path.name),
            "r2_score": round(reg_r2, 4),
            "feature_importance": reg_importance,
        },
    }

    meta_path = MODEL_DIR / "model_meta.json"
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)
    print(f"Saved: {meta_path}")
    print("\nTraining complete")
    print(json.dumps({"auc": round(clf_auc, 4), "r2": round(reg_r2, 4)}, indent=2))
    return meta


if __name__ == "__main__":
    main()
