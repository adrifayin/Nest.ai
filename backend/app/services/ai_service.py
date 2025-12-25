"""
AI service for Study Area chatbot
"""

from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from app.models import User, Video, Document, WatchHistory, ChatHistory
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
import os


class AIService:
    """AI service for contextual Q&A"""
    
    def __init__(self):
        """Initialize AI models and vector store"""
        # Initialize sentence transformer for embeddings
        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Initialize ChromaDB for vector storage
        chroma_dir = os.path.join(os.getcwd(), "chroma_db")
        os.makedirs(chroma_dir, exist_ok=True)
        
        self.client = chromadb.PersistentClient(
            path=chroma_dir,
            settings=Settings(anonymized_telemetry=False)
        )
    
    def get_user_context(self, user_id: int, db: Session) -> Dict:
        """Get user's learning context (watched videos, uploaded documents)"""
        # Get watched videos
        watch_history = db.query(WatchHistory).filter(
            WatchHistory.user_id == user_id
        ).order_by(WatchHistory.last_watched_at.desc()).limit(10).all()
        
        watched_videos = []
        for watch in watch_history:
            video = db.query(Video).filter(Video.id == watch.video_id).first()
            if video and video.transcript:
                watched_videos.append({
                    "id": video.id,
                    "title": video.title,
                    "transcript": video.transcript,
                    "subject": video.subject,
                    "topic": video.topic
                })
        
        # Get user's documents
        documents = db.query(Document).filter(
            Document.owner_id == user_id
        ).all()
        
        user_docs = []
        for doc in documents:
            if doc.content:
                user_docs.append({
                    "id": doc.id,
                    "title": doc.title,
                    "content": doc.content,
                    "type": doc.file_type
                })
        
        return {
            "watched_videos": watched_videos,
            "documents": user_docs
        }
    
    def store_context(self, user_id: int, context_type: str, context_id: int, 
                     content: str, metadata: Dict = None):
        """Store context in vector database"""
        collection_name = f"user_{user_id}_context"
        
        try:
            collection = self.client.get_or_create_collection(
                name=collection_name,
                metadata={"user_id": user_id}
            )
            
            # Generate embedding
            embedding = self.embedder.encode(content).tolist()
            
            # Store in ChromaDB
            collection.add(
                embeddings=[embedding],
                documents=[content],
                ids=[f"{context_type}_{context_id}"],
                metadatas=[{
                    "type": context_type,
                    "id": context_id,
                    **(metadata or {})
                }]
            )
        except Exception as e:
            print(f"Error storing context: {e}")
    
    def search_relevant_context(self, user_id: int, query: str, top_k: int = 3) -> List[Dict]:
        """Search for relevant context based on query"""
        collection_name = f"user_{user_id}_context"
        
        try:
            collection = self.client.get_or_create_collection(
                name=collection_name,
                metadata={"user_id": user_id}
            )
            
            # Generate query embedding
            query_embedding = self.embedder.encode(query).tolist()
            
            # Search
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k
            )
            
            contexts = []
            if results['documents'] and len(results['documents'][0]) > 0:
                for i, doc in enumerate(results['documents'][0]):
                    contexts.append({
                        "content": doc,
                        "metadata": results['metadatas'][0][i] if results['metadatas'] else {}
                    })
            
            return contexts
        except Exception as e:
            print(f"Error searching context: {e}")
            return []
    
    def generate_response(self, query: str, contexts: List[Dict]) -> str:
        """Generate AI response based on query and context"""
        # Simple context-aware response generation
        # In production, use a proper LLM like Llama, GPT, etc.
        
        if not contexts:
            return self._default_response(query)
        
        # Build context string
        context_text = "\n\n".join([
            f"From {ctx['metadata'].get('type', 'source')}:\n{ctx['content'][:500]}"
            for ctx in contexts[:2]
        ])
        
        # Simple template-based response (replace with actual LLM)
        response = f"""Based on the content you've been learning:

{context_text}

Regarding your question "{query}": 

This is a simplified response. In production, this would use a proper language model like Llama or GPT to generate detailed, contextual answers based on your learning materials.

Key points from your learning context:
- The content covers topics you've been studying
- This answer is based on videos and documents you've accessed
- Continue learning to get more personalized responses
"""
        
        return response
    
    def _default_response(self, query: str) -> str:
        """Default response when no context is available"""
        return f"""I'm your AI study assistant! I can help answer questions based on:
- Videos you've watched
- Documents you've uploaded

To get better, personalized answers:
1. Watch some videos on the platform
2. Upload documents you're studying
3. Ask me questions related to what you've learned

Your question: "{query}"

Once you start learning on the platform, I'll be able to provide context-aware answers!"""

