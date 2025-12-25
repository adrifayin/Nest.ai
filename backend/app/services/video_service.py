"""
Video processing services
"""

import os
import whisper
from pathlib import Path
from typing import Optional
import subprocess
from PIL import Image
import cv2


class VideoService:
    """Service for video processing and transcription"""
    
    def __init__(self, model_size: str = "base"):
        """Initialize with Whisper model"""
        self.model_size = model_size
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load Whisper model"""
        print(f"Loading Whisper model: {self.model_size}...")
        self.model = whisper.load_model(self.model_size)
        print("Model loaded!")
    
    def extract_audio(self, video_path: str, audio_path: str) -> str:
        """Extract audio from video using ffmpeg"""
        try:
            subprocess.run(
                [
                    "ffmpeg", "-i", video_path,
                    "-vn", "-acodec", "libmp3lame",
                    "-y", audio_path
                ],
                check=True,
                capture_output=True
            )
            return audio_path
        except subprocess.CalledProcessError as e:
            raise Exception(f"Failed to extract audio: {e}")
    
    def transcribe_video(self, video_path: str, language: Optional[str] = None) -> dict:
        """Transcribe video to text"""
        # Extract audio first
        audio_path = video_path.replace(".mp4", ".mp3").replace(".mov", ".mp3")
        self.extract_audio(video_path, audio_path)
        
        # Transcribe
        result = self.model.transcribe(audio_path, language=language)
        
        # Clean up audio file
        if os.path.exists(audio_path):
            os.remove(audio_path)
        
        return result
    
    def generate_thumbnail(self, video_path: str, thumbnail_path: str, time_offset: float = 1.0) -> str:
        """Generate thumbnail from video"""
        try:
            cap = cv2.VideoCapture(video_path)
            cap.set(cv2.CAP_PROP_POS_MSEC, time_offset * 1000)
            ret, frame = cap.read()
            
            if ret:
                cv2.imwrite(thumbnail_path, frame)
            else:
                # Fallback: use first frame
                cap.set(cv2.CAP_PROP_POS_MSEC, 0)
                ret, frame = cap.read()
                if ret:
                    cv2.imwrite(thumbnail_path, frame)
            
            cap.release()
            return thumbnail_path
        except Exception as e:
            print(f"Error generating thumbnail: {e}")
            return None
    
    def get_video_duration(self, video_path: str) -> float:
        """Get video duration in seconds"""
        try:
            result = subprocess.run(
                [
                    "ffprobe", "-v", "error", "-show_entries",
                    "format=duration", "-of", "default=noprint_wrappers=1:nokey=1",
                    video_path
                ],
                capture_output=True,
                text=True
            )
            return float(result.stdout.strip())
        except Exception:
            return 0.0

