import whisper
import torch
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global model instance (loaded once on startup)
model = None

def load_whisper_model(model_name: str = "base"):
    """
    Load Whisper model on worker startup
    Uses 'base' model by default for balance between speed and accuracy
    """
    global model
    
    if model is None:
        logger.info(f"Loading Whisper model: {model_name}")
        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {device}")
        
        model = whisper.load_model(model_name, device=device)
        logger.info(f"Whisper model {model_name} loaded successfully")
    
    return model

def transcribe_audio_task(file_path: str, language: str = None) -> dict:
    """
    Transcribe audio/video file using Whisper
    
    Args:
        file_path: Path to audio/video file
        language: Optional language code (en, es, fr, etc.). Auto-detect if None
    
    Returns:
        Dictionary with transcription text and metadata
    """
    try:
        # Ensure model is loaded
        whisper_model = load_whisper_model()
        
        logger.info(f"Starting transcription for: {file_path}")
        
        # Transcribe with Whisper
        transcribe_options = {
            "verbose": False,
            "task": "transcribe"
        }
        
        if language:
            transcribe_options["language"] = language
        
        result = whisper_model.transcribe(file_path, **transcribe_options)
        
        logger.info(f"Transcription completed for: {file_path}")
        
        # Extract and structure the result
        return {
            "text": result["text"].strip(),
            "language": result.get("language", "unknown"),
            "segments": [
                {
                    "start": seg["start"],
                    "end": seg["end"],
                    "text": seg["text"].strip()
                }
                for seg in result.get("segments", [])
            ]
        }
        
    except Exception as e:
        logger.error(f"Transcription failed for {file_path}: {str(e)}")
        raise

def get_task_status(task_id: str):
    """
    Get status of a transcription task
    This is a placeholder - in production use Celery task.AsyncResult
    """
    # Placeholder for task status checking
    return {"status": "unknown"}

# Pre-load model on module import (optional - can be lazy loaded)
# Uncomment to pre-load on startup:
# load_whisper_model()
