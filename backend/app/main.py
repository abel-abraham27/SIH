import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db
from app.api.v1 import (
    auth,
    students,
    skills,
    assessments,
    opportunities,
    applications,
    learning,
    portfolios,
    faculty,
    analytics,
    recruiters,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    init_db()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="COGNIBRIDGE Academia-Industry Collaboration Platform API",
    lifespan=lifespan,
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers under /api/v1
api_prefix = settings.API_V1_PREFIX
app.include_router(auth.router, prefix=api_prefix)
app.include_router(students.router, prefix=api_prefix)
app.include_router(skills.router, prefix=api_prefix)
app.include_router(assessments.router, prefix=api_prefix)
app.include_router(opportunities.router, prefix=api_prefix)
app.include_router(applications.router, prefix=api_prefix)
app.include_router(learning.router, prefix=api_prefix)
app.include_router(portfolios.router, prefix=api_prefix)
app.include_router(faculty.router, prefix=api_prefix)
app.include_router(analytics.router, prefix=api_prefix)
app.include_router(recruiters.router, prefix=api_prefix)


@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
