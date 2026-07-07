# RIPECRATE

Repository split into two deployments:

- `backend/` — FastAPI backend, deploy to Render. See `backend/render.yaml`.
- `frontend/` — React + Vite frontend, deploy to Vercel (separate repo `RipeCrate-frontend`).

Structure (backend):

backend/
├── app/ (FastAPI app)
│   ├── api/ (API routers)
│   ├── core/ (config, logging)
│   ├── models/
│   ├── schemas/
│   ├── services/
│   └── main.py
├── ml/
│   ├── datasets/
│   │   ├── raw/
│   │   └── processed/
│   ├── models/
│   ├── train_model.py
│   ├── evaluate.py
│   └── predict.py
├── requirements.txt
└── render.yaml

Deployment notes:
- Backend: set environment variables on Render (`DATABASE_URL`, `JWT_SECRET_KEY`, `ENV`).
- Frontend: deploy `frontend` repository to Vercel; build command `npm run build`.

ML notes:
- Use `backend/ml/train_model.py` to train the model using `backend/ml/datasets/raw/perishable_goods_management.csv`.
- Trained model saved to `backend/ml/models/best_model.joblib`.

To run locally (backend):

```powershell
Set-Location backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

To run local training:

```powershell
Set-Location backend
python ml\train_model.py
```
