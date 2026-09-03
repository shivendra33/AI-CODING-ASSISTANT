from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.middleware.rate_limit import RateLimitMiddleware
from app.routes import ai, auth, conversations, dashboard, snippets


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Secure API backend for an AI-powered coding assistant.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    RateLimitMiddleware,
    requests=settings.rate_limit_requests,
    window_seconds=settings.rate_limit_window_seconds,
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def health_check():
    return {"status": "ok", "app": settings.app_name}


app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(ai.router, prefix=settings.api_prefix)
app.include_router(conversations.router, prefix=settings.api_prefix)
app.include_router(snippets.router, prefix=settings.api_prefix)
app.include_router(dashboard.router, prefix=settings.api_prefix)

