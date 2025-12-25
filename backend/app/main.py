"""
Main FastAPI application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import engine, Base
from app.routers import auth, videos, documents, study_area, users

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NEST.ai API",
    description="AI-powered Education Platform Backend",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(videos.router, prefix="/api/videos", tags=["Videos"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(study_area.router, prefix="/api/study", tags=["Study Area"])

# Mount static files for uploaded content
os.makedirs("uploads/videos", exist_ok=True)
os.makedirs("uploads/documents", exist_ok=True)
os.makedirs("uploads/thumbnails", exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/")
async def root():
    return {"message": "NEST.ai API", "version": "1.0.0"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

