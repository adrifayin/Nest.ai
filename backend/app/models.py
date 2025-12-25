"""
Database models
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, Float, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    videos = relationship("Video", back_populates="uploader")
    documents = relationship("Document", back_populates="owner")
    watch_history = relationship("WatchHistory", back_populates="user")
    chat_history = relationship("ChatHistory", back_populates="user")


class Video(Base):
    """Video model"""
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    file_path = Column(String, nullable=False)
    thumbnail_path = Column(String, nullable=True)
    duration = Column(Float, nullable=True)  # in seconds
    subject = Column(String, nullable=True)
    topic = Column(String, nullable=True)
    level = Column(String, nullable=True)  # e.g., "High School", "College"
    transcript = Column(Text, nullable=True)
    transcript_embeddings = Column(JSON, nullable=True)  # Store embeddings for AI context
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    views_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    uploader = relationship("User", back_populates="videos")
    watch_history = relationship("WatchHistory", back_populates="video")


class Document(Base):
    """Document model"""
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # pdf, docx, pptx, txt
    content = Column(Text, nullable=True)  # Extracted text content
    content_embeddings = Column(JSON, nullable=True)  # Store embeddings for AI context
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="documents")


class WatchHistory(Base):
    """Watch history model"""
    __tablename__ = "watch_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False)
    watch_duration = Column(Float, default=0)  # seconds watched
    completion_percentage = Column(Float, default=0)  # 0-100
    last_watched_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="watch_history")
    video = relationship("Video", back_populates="watch_history")


class ChatHistory(Base):
    """Chat history for Study Area"""
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    context_type = Column(String, nullable=True)  # "video", "document", "general"
    context_id = Column(Integer, nullable=True)  # video_id or document_id
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="chat_history")

