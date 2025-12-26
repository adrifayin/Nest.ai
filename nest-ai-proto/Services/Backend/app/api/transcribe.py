from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
import uuid
import shutil
from typing import Dict, Optional
import asyncio

from app.workers.worker_transcribe import transcribe_audio_task, get_task_status

router = APIRouter()

# Storage for transcription jobs (in production, use Redis or database)
transcription_jobs: Dict[str, dict] = {}

UPLOAD_DIR = Path("uploads")
ALLOWED_EXTENSIONS = {".mp3", ".mp4", ".wav", ".m4a", ".webm", ".ogg", ".flac"}

@router.post("/transcribe")
async def upload_and_transcribe(file: UploadFile = File(...)):
    """
    Upload an audio or video file and start transcription
    
    Returns job_id to check status
    """
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file_ext} not supported. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Generate unique job ID
    job_id = str(uuid.uuid4())
    
    # Save uploaded file
    file_path = UPLOAD_DIR / f"{job_id}{file_ext}"
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Create job record
    transcription_jobs[job_id] = {
        "job_id": job_id,
        "filename": file.filename,
        "status": "queued",
        "progress": 0,
        "result": None,
        "error": None
    }
    
    # Start transcription task asynchronously
    asyncio.create_task(process_transcription(job_id, str(file_path)))
    
    return {
        "job_id": job_id,
        "filename": file.filename,
        "status": "queued",
        "message": "File uploaded successfully. Transcription queued."
    }

@router.get("/transcribe/{job_id}")
async def get_transcription_status(job_id: str):
    """
    Check the status of a transcription job
    """
    if job_id not in transcription_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return transcription_jobs[job_id]

@router.get("/transcribe/{job_id}/result")
async def get_transcription_result(job_id: str):
    """
    Get the full transcription result
    """
    if job_id not in transcription_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = transcription_jobs[job_id]
    
    if job["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Transcription not ready. Current status: {job['status']}"
        )
    
    return {
        "job_id": job_id,
        "filename": job["filename"],
        "transcription": job["result"],
        "status": "completed"
    }

async def process_transcription(job_id: str, file_path: str):
    """
    Process transcription in background
    """
    try:
        # Update status to processing
        transcription_jobs[job_id]["status"] = "processing"
        transcription_jobs[job_id]["progress"] = 10
        
        # Run transcription (blocking operation)
        result = await asyncio.to_thread(transcribe_audio_task, file_path)
        
        # Update job with result
        transcription_jobs[job_id]["status"] = "completed"
        transcription_jobs[job_id]["progress"] = 100
        transcription_jobs[job_id]["result"] = result
        
    except Exception as e:
        # Handle errors
        transcription_jobs[job_id]["status"] = "failed"
        transcription_jobs[job_id]["error"] = str(e)
        transcription_jobs[job_id]["progress"] = 0
