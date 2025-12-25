"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# Video schemas
class VideoBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject: Optional[str] = None
    topic: Optional[str] = None
    level: Optional[str] = None


class VideoCreate(VideoBase):
    pass


class VideoResponse(VideoBase):
    id: int
    file_path: str
    thumbnail_path: Optional[str] = None
    duration: Optional[float] = None
    uploader_id: int
    views_count: int
    created_at: datetime
    uploader_name: Optional[str] = None

    class Config:
        from_attributes = True


class VideoListResponse(BaseModel):
    videos: List[VideoResponse]
    total: int


# Document schemas
class DocumentBase(BaseModel):
    title: str


class DocumentCreate(DocumentBase):
    pass


class DocumentResponse(DocumentBase):
    id: int
    file_path: str
    file_type: str
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Watch History schemas
class WatchHistoryCreate(BaseModel):
    video_id: int
    watch_duration: float
    completion_percentage: float


class WatchHistoryResponse(BaseModel):
    id: int
    video_id: int
    watch_duration: float
    completion_percentage: float
    last_watched_at: datetime
    video: Optional[VideoResponse] = None

    class Config:
        from_attributes = True


# Study Area schemas
class ChatMessage(BaseModel):
    message: str
    context_type: Optional[str] = None  # "video", "document", "general"
    context_id: Optional[int] = None


class ChatResponse(BaseModel):
    response: str
    context_used: Optional[str] = None


class ChatHistoryResponse(BaseModel):
    id: int
    message: str
    response: str
    context_type: Optional[str] = None
    context_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

