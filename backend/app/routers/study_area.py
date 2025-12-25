"""
Study Area (AI Chatbot) routes
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, ChatHistory
from app.schemas import ChatMessage, ChatResponse, ChatHistoryResponse
from app.services.ai_service import AIService

router = APIRouter()
ai_service = AIService()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    message: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message to the AI study assistant"""
    # Search for relevant context
    contexts = ai_service.search_relevant_context(
        current_user.id,
        message.message,
        top_k=3
    )
    
    # Generate response
    response_text = ai_service.generate_response(message.message, contexts)
    
    # Determine context used
    context_used = None
    if contexts:
        context_used = contexts[0]['metadata'].get('type', 'general')
    
    # Save to chat history
    chat_entry = ChatHistory(
        user_id=current_user.id,
        message=message.message,
        response=response_text,
        context_type=message.context_type or context_used,
        context_id=message.context_id
    )
    db.add(chat_entry)
    db.commit()
    
    return ChatResponse(
        response=response_text,
        context_used=context_used
    )


@router.get("/history", response_model=List[ChatHistoryResponse])
async def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50
):
    """Get chat history"""
    history = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id
    ).order_by(ChatHistory.created_at.desc()).limit(limit).all()
    
    return [ChatHistoryResponse.from_orm(entry) for entry in reversed(history)]


@router.get("/context")
async def get_learning_context(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's learning context summary"""
    context = ai_service.get_user_context(current_user.id, db)
    return context

