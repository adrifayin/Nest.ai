# NEST.ai - AI-Powered Learning Platform

A full-stack AI-powered education platform that enables contextual learning through video-based content and AI-assisted doubt solving. Built according to the NEST.ai Prototype PRD.

## 🎯 Features

### Core Features
- **Netflix-style Video Feed**: Browse and discover educational videos with a modern, intuitive interface
- **Video Player with Tracking**: Watch videos with automatic progress tracking and watch history
- **AI Study Area**: Context-aware chatbot that answers questions based on watched videos and uploaded documents
- **Document Management**: Upload and manage PDF, DOCX, PPTX, and TXT documents
- **User Authentication**: Secure JWT-based authentication system
- **My Space**: Personal dashboard for uploaded content, watch history, and documents

### AI Capabilities
- **Speech-to-Text**: Automatic video transcription using OpenAI Whisper
- **Context-Aware Q&A**: AI assistant that understands what you've learned
- **Vector Search**: Semantic search through learning materials using embeddings
- **Personalized Responses**: Answers based on your specific learning context

## 🏗️ Architecture

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (development) / PostgreSQL (production)
- **AI/ML**: 
  - OpenAI Whisper for transcription
  - Sentence Transformers for embeddings
  - ChromaDB for vector storage
- **Authentication**: JWT tokens

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Video Player**: React Player
- **Routing**: React Router v6

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- FFmpeg (for video processing)
- Git

### Installing FFmpeg

**Windows:**
```bash
# Using chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd nest.ai
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
# Windows:
copy .env.example .env
# macOS/Linux:
cp .env.example .env

# Edit .env and set your SECRET_KEY
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

## 🏃 Running the Application

### Start Backend Server

```bash
cd backend
python run.py
```

The backend will run on `http://localhost:8000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

### Access the Application

Open your browser and navigate to `http://localhost:5173`

## 📁 Project Structure

```
nest.ai/
├── backend/
│   ├── app/
│   │   ├── routers/          # API route handlers
│   │   ├── services/          # Business logic services
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── database.py        # Database configuration
│   │   ├── auth.py            # Authentication utilities
│   │   └── main.py            # FastAPI app
│   ├── uploads/               # Uploaded files (created automatically)
│   ├── requirements.txt       # Python dependencies
│   └── run.py                 # Server entry point
│
├── frontend/
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/       # Reusable components
│   │   ├── contexts/          # React contexts
│   │   ├── api/               # API client functions
│   │   └── App.jsx            # Main app component
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Videos
- `GET /api/videos` - List videos (with filters)
- `GET /api/videos/{id}` - Get video details
- `POST /api/videos/upload` - Upload video
- `GET /api/videos/my/uploaded` - Get user's videos
- `POST /api/videos/{id}/watch` - Record watch progress
- `GET /api/videos/my/history` - Get watch history

### Documents
- `GET /api/documents` - List user's documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/{id}` - Get document details
- `DELETE /api/documents/{id}` - Delete document

### Study Area
- `POST /api/study/chat` - Send chat message
- `GET /api/study/history` - Get chat history
- `GET /api/study/context` - Get learning context

## 🎨 Usage Guide

### 1. Create an Account
- Navigate to the signup page
- Enter your email, password, and name
- You'll be automatically logged in

### 2. Upload Content
- Go to "My Space"
- Click "Upload Video" or "Upload Document"
- Fill in the required information
- Wait for processing (videos are automatically transcribed)

### 3. Watch and Learn
- Browse videos on the Home page
- Click any video to watch
- Your progress is automatically tracked

### 4. Ask Questions
- Go to "Study Area"
- Ask questions about videos you've watched or documents you've uploaded
- The AI will provide context-aware answers

## 🔧 Configuration

### Backend Environment Variables (.env)
```env
DATABASE_URL=sqlite:///./nest_ai.db
SECRET_KEY=your-secret-key-here
HOST=0.0.0.0
PORT=8000
```

### Frontend Configuration
The frontend is configured to proxy API requests to `http://localhost:8000` (see `vite.config.js`)

## 🧪 Development

### Backend Development
```bash
cd backend
python run.py  # Runs with auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Runs with hot module replacement
```

## 📝 Notes

- **First Run**: The database will be created automatically on first run
- **Video Processing**: Large videos may take time to process and transcribe
- **AI Model**: The default Whisper model is "base" - change in `video_service.py` for better accuracy
- **Storage**: Uploaded files are stored in `backend/uploads/`

## 🚧 Future Enhancements

Based on the PRD, future features may include:
- Advanced AI tutoring with LLM integration
- Personalized learning paths
- Collaborative learning spaces
- Teacher dashboards
- Mobile application
- Advanced analytics

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

## 📞 Support

For issues or questions, please open an issue on the repository.

---

Built with ❤️ for the NEST.ai project

