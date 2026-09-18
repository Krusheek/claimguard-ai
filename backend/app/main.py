from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import init_db
from .config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown

app = FastAPI(title="ClaimGuard AI API", lifespan=lifespan)

# CORS middleware allowing specific origins to support credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .api import upload, analysis, reports

app.include_router(upload.router)
app.include_router(analysis.router)
app.include_router(reports.router)

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {
        "project": "ClaimGuard AI",
        "description": "API for processing and analyzing medical claims."
    }
