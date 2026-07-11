# RipeCrate — Backend API

FastAPI backend for the RipeCrate AI Cold Chain Intelligence Platform.

## Stack

- **FastAPI** + **Uvicorn**
- **SQLAlchemy** + SQLite (dev) / PostgreSQL (prod)
- **scikit-learn** + **XGBoost** — shelf-life & spoilage ML models
- **ReportLab** — PDF report generation
- **JWT** authentication

## Local Development

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API docs available at `http://localhost:8000/docs`

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | SQLAlchemy DB URL | `sqlite:///./ripecrate.db` |
| `JWT_SECRET_KEY` | Secret for JWT signing | *(must set in prod)* |
| `ENV` | `development` or `production` | `development` |
| `CORS_ORIGINS` | JSON array of allowed origins | `["http://localhost:5173"]` |
| `ML_MODELS_DIR` | Path to trained model files | `ml/models` |

## Render Deployment

1. Connect this repo to [Render](https://render.com)
2. Render auto-detects `render.yaml` — no manual config needed
3. Set `JWT_SECRET_KEY` as a secret env var in the Render dashboard
4. Set `CORS_ORIGINS` to your Vercel frontend URL:
   ```
   ["https://your-app.vercel.app"]
   ```

## ML Training

```bash
cd backend
python ml/train_model.py
```

Trained models saved to `ml/models/`.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/dashboard/summary` | Executive KPIs |
| GET | `/api/inventory` | List batches |
| POST | `/api/inventory` | Add batch |
| POST | `/api/predictions` | Run ML prediction |
| GET | `/api/alerts` | List alerts |
| PATCH | `/api/alerts/{id}/read` | Mark alert read |
| GET | `/api/analytics/overview` | Analytics data |
| GET | `/api/reports/summary-pdf` | Download PDF report |
| POST | `/api/assistant/ask` | AI chatbot |
| GET | `/api/health` | Health check |
