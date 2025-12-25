"""
Video routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List
import os
import shutil
from pathlib import Path

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, Video, WatchHistory
from app.schemas import VideoCreate, VideoResponse, VideoListResponse, WatchHistoryCreate, WatchHistoryResponse
from app.services.video_service import VideoService

router = APIRouter()
video_service = VideoService()


@router.post("/upload", response_model=VideoResponse, status_code=status.HTTP_201_CREATED)
async def upload_video(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    subject: Optional[str] = Form(None),
    topic: Optional[str] = Form(None),
    level: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload and process a video"""
    # Create upload directory
    upload_dir = Path("uploads/videos")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Save file
    file_path = upload_dir / f"{current_user.id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Get video duration
    duration = video_service.get_video_duration(str(file_path))
    
    # Generate thumbnail
    thumbnail_dir = Path("uploads/thumbnails")
    thumbnail_dir.mkdir(parents=True, exist_ok=True)
    thumbnail_path = thumbnail_dir / f"{file_path.stem}.jpg"
    video_service.generate_thumbnail(str(file_path), str(thumbnail_path))
    
    # Create video record
    db_video = Video(
        title=title,
        description=description,
        file_path=str(file_path),
        thumbnail_path=str(thumbnail_path) if thumbnail_path.exists() else None,
        duration=duration,
        subject=subject,
        topic=topic,
        level=level,
        uploader_id=current_user.id
    )
    db.add(db_video)
    db.commit()
    db.refresh(db_video)
    
    # Transcribe video in background (async processing)
    try:
        transcription = video_service.transcribe_video(str(file_path))
        db_video.transcript = transcription.get("text", "")
        db.commit()
        
        # Store transcript in AI context
        from app.services.ai_service import AIService
        ai_service = AIService()
        if db_video.transcript:
            ai_service.store_context(
                current_user.id,
                "video",
                db_video.id,
                db_video.transcript,
                {"title": title, "subject": subject, "topic": topic}
            )
    except Exception as e:
        print(f"Error transcribing video: {e}")
    
    # Add uploader name
    response = VideoResponse.from_orm(db_video)
    response.uploader_name = current_user.full_name or current_user.email
    return response


@router.get("/", response_model=VideoListResponse)
async def list_videos(
    subject: Optional[str] = None,
    topic: Optional[str] = None,
    level: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """List all videos with optional filters"""
    query = db.query(Video)
    
    if subject:
        query = query.filter(Video.subject == subject)
    if topic:
        query = query.filter(Video.topic == topic)
    if level:
        query = query.filter(Video.level == level)
    
    total = query.count()
    videos = query.order_by(Video.created_at.desc()).offset(skip).limit(limit).all()
    
    video_responses = []
    for video in videos:
        vr = VideoResponse.from_orm(video)
        if video.uploader:
            vr.uploader_name = video.uploader.full_name or video.uploader.email
        video_responses.append(vr)
    
    return VideoListResponse(videos=video_responses, total=total)


@router.get("/{video_id}", response_model=VideoResponse)
async def get_video(
    video_id: int,
    db: Session = Depends(get_db)
):
    """Get video details"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Increment view count
    video.views_count += 1
    db.commit()
    
    response = VideoResponse.from_orm(video)
    if video.uploader:
        response.uploader_name = video.uploader.full_name or video.uploader.email
    return response


@router.get("/my/uploaded", response_model=List[VideoResponse])
async def get_my_videos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's uploaded videos"""
    videos = db.query(Video).filter(Video.uploader_id == current_user.id).all()
    
    video_responses = []
    for video in videos:
        vr = VideoResponse.from_orm(video)
        vr.uploader_name = current_user.full_name or current_user.email
        video_responses.append(vr)
    
    return video_responses


@router.post("/{video_id}/watch", response_model=WatchHistoryResponse)
async def record_watch(
    video_id: int,
    watch_data: WatchHistoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record watch history"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Check if watch history exists
    existing = db.query(WatchHistory).filter(
        WatchHistory.user_id == current_user.id,
        WatchHistory.video_id == video_id
    ).first()
    
    if existing:
        existing.watch_duration = watch_data.watch_duration
        existing.completion_percentage = watch_data.completion_percentage
        db.commit()
        db.refresh(existing)
        return WatchHistoryResponse.from_orm(existing)
    else:
        watch_history = WatchHistory(
            user_id=current_user.id,
            video_id=video_id,
            watch_duration=watch_data.watch_duration,
            completion_percentage=watch_data.completion_percentage
        )
        db.add(watch_history)
        db.commit()
        db.refresh(watch_history)
        return WatchHistoryResponse.from_orm(watch_history)


@router.get("/my/history", response_model=List[WatchHistoryResponse])
async def get_watch_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's watch history"""
    history = db.query(WatchHistory).filter(
        WatchHistory.user_id == current_user.id
    ).order_by(WatchHistory.last_watched_at.desc()).all()
    
    history_responses = []
    for h in history:
        hr = WatchHistoryResponse.from_orm(h)
        if h.video:
            hr.video = VideoResponse.from_orm(h.video)
        history_responses.append(hr)
    
    return history_responses

