# NEST.ai Setup Guide

## Quick Start

### Step 1: Backend Setup

```bash
# Navigate to backend directory
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

# Create .env file
# Windows:
copy .env.example .env
# macOS/Linux:
cp .env.example .env

# Edit .env file and set SECRET_KEY (use a random string)
# Example: SECRET_KEY=your-super-secret-key-here-change-this
```

### Step 2: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Step 3: Install FFmpeg

**Windows:**
- Download from https://ffmpeg.org/download.html
- Or use: `choco install ffmpeg`

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

### Step 4: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
python run.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 5: Access the Application

Open your browser and go to: `http://localhost:5173`

## First Time Setup Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] FFmpeg installed and in PATH
- [ ] Backend virtual environment created and activated
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] .env file created with SECRET_KEY
- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 5173

## Troubleshooting

### Backend Issues

**Import Errors:**
- Make sure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

**Database Errors:**
- Delete `nest_ai.db` and restart (for SQLite)
- Check DATABASE_URL in .env

**FFmpeg Not Found:**
- Verify FFmpeg is installed: `ffmpeg -version`
- Add FFmpeg to your system PATH

### Frontend Issues

**Module Not Found:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

**API Connection Errors:**
- Verify backend is running on port 8000
- Check CORS settings in `backend/app/main.py`

### Video Processing Issues

**Transcription Fails:**
- Check video file format (MP4 recommended)
- Ensure video has audio track
- Check backend logs for errors

**Upload Fails:**
- Check file size limits
- Verify uploads directory exists
- Check file permissions

## Production Deployment

For production deployment:

1. **Backend:**
   - Use PostgreSQL instead of SQLite
   - Set strong SECRET_KEY
   - Configure proper CORS origins
   - Use production WSGI server (Gunicorn + Uvicorn)

2. **Frontend:**
   - Build: `npm run build`
   - Serve static files with Nginx or similar

3. **Environment Variables:**
   - Set all required environment variables
   - Use secure secret management

## Need Help?

Check the main README.md for detailed documentation.

