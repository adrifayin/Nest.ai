import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactPlayer from 'react-player'
import { getVideo, recordWatch } from '../api/api'
import { ArrowLeft, Clock } from 'lucide-react'

const VideoPlayer = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [playedSeconds, setPlayedSeconds] = useState(0)
  const [duration, setDuration] = useState(0)
  const playerRef = useRef(null)
  const watchIntervalRef = useRef(null)

  useEffect(() => {
    loadVideo()
    return () => {
      if (watchIntervalRef.current) {
        clearInterval(watchIntervalRef.current)
      }
    }
  }, [id])

  useEffect(() => {
    // Track watch progress every 10 seconds
    if (duration > 0) {
      watchIntervalRef.current = setInterval(() => {
        const completion = (playedSeconds / duration) * 100
        recordWatchProgress(playedSeconds, completion)
      }, 10000)
    }

    return () => {
      if (watchIntervalRef.current) {
        clearInterval(watchIntervalRef.current)
      }
    }
  }, [playedSeconds, duration])

  const loadVideo = async () => {
    try {
      setLoading(true)
      const data = await getVideo(id)
      setVideo(data)
    } catch (error) {
      console.error('Failed to load video:', error)
    } finally {
      setLoading(false)
    }
  }

  const recordWatchProgress = async (watchDuration, completionPercentage) => {
    try {
      await recordWatch(parseInt(id), watchDuration, completionPercentage)
    } catch (error) {
      console.error('Failed to record watch progress:', error)
    }
  }

  const handleProgress = (state) => {
    setPlayedSeconds(state.playedSeconds)
  }

  const handleDuration = (dur) => {
    setDuration(dur)
  }

  const handleEnded = () => {
    // Record final watch progress
    recordWatchProgress(duration, 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading video...</div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Video not found</div>
      </div>
    )
  }

  const videoUrl = `http://localhost:8000/${video.file_path}`

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-16 z-40 bg-black border-b border-gray-800 px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
              <ReactPlayer
                ref={playerRef}
                url={videoUrl}
                controls
                width="100%"
                height="100%"
                onProgress={handleProgress}
                onDuration={handleDuration}
                onEnded={handleEnded}
                config={{
                  file: {
                    attributes: {
                      controlsList: 'nodownload',
                    },
                  },
                }}
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-4">{video.title}</h1>
              {video.description && (
                <p className="text-gray-300 mb-4">{video.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                {video.subject && (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Subject:</span>
                    <span>{video.subject}</span>
                  </div>
                )}
                {video.topic && (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Topic:</span>
                    <span>{video.topic}</span>
                  </div>
                )}
                {video.level && (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Level:</span>
                    <span>{video.level}</span>
                  </div>
                )}
                {video.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{Math.floor(video.duration / 60)}:{(video.duration % 60).toFixed(0).padStart(2, '0')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Video Info</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Uploaded by:</span>
                  <p className="text-white">{video.uploader_name || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Views:</span>
                  <p className="text-white">{video.views_count || 0}</p>
                </div>
                {video.transcript && (
                  <div>
                    <span className="text-gray-400">Transcript available</span>
                    <p className="text-xs text-gray-500 mt-1">
                      This video has been transcribed and can be used in Study Area
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer

