from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app import models  # noqa: F401  (ensures models are registered on Base.metadata)
from app.routers import auth, inventory, prediction, dashboard, analytics, alerts, assistant, reports

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description=(
        "AI-powered produce shelf-life & spoilage prediction platform for warehouses, "
        "supermarkets, distributors, and farmers."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": settings.APP_NAME}


app.include_router(auth)
app.include_router(inventory)
app.include_router(prediction)
app.include_router(dashboard)
app.include_router(analytics)
app.include_router(alerts)
app.include_router(assistant)
app.include_router(reports)
