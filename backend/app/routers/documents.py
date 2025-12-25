"""
Document routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from pathlib import Path

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, Document
from app.schemas import DocumentCreate, DocumentResponse
from app.services.document_service import DocumentService

router = APIRouter()
document_service = DocumentService()

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".pptx", ".txt"}


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload and process a document"""
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not supported. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Create upload directory
    upload_dir = Path("uploads/documents")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Save file
    file_path = upload_dir / f"{current_user.id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract text content
    file_type = file_ext[1:]  # Remove the dot
    content = document_service.extract_text(str(file_path), file_type)
    
    # Create document record
    db_document = Document(
        title=title,
        file_path=str(file_path),
        file_type=file_type,
        content=content,
        owner_id=current_user.id
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    # Store document in AI context
    if content:
        from app.services.ai_service import AIService
        ai_service = AIService()
        ai_service.store_context(
            current_user.id,
            "document",
            db_document.id,
            content,
            {"title": title, "type": file_type}
        )
    
    return DocumentResponse.from_orm(db_document)


@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List current user's documents"""
    documents = db.query(Document).filter(
        Document.owner_id == current_user.id
    ).order_by(Document.created_at.desc()).all()
    
    return [DocumentResponse.from_orm(doc) for doc in documents]


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get document details"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check ownership
    if document.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return DocumentResponse.from_orm(document)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a document"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if document.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Delete file
    if os.path.exists(document.file_path):
        os.remove(document.file_path)
    
    db.delete(document)
    db.commit()
    return None

