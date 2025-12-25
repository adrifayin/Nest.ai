import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getVideos } from '../api/api'
import { Play, Clock } from 'lucide-react'

const Home = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ subject: '', topic: '', level: '' })
  const navigate = useNavigate()

  useEffect(() => {
    loadVideos()
  }, [filters])

  const loadVideos = async () => {
    try {
      setLoading(true)
      const data = await getVideos(filters)
      setVideos(data.videos || [])
    } catch (error) {
      console.error('Failed to load videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading videos...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Discover Learning</h1>

        {/* Filters */}
        <div className="mb-8 flex gap-4 flex-wrap">
          <select
            value={filters.subject}
            onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          >
            <option value="">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="History">History</option>
            <option value="Literature">Literature</option>
            <option value="Computer Science">Computer Science</option>
          </select>

          <select
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value })}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          >
            <option value="">All Levels</option>
            <option value="Elementary">Elementary</option>
            <option value="High School">High School</option>
            <option value="College">College</option>
          </select>
        </div>

        {/* Video Grid */}
        {videos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No videos found. Upload some content to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                onClick={() => navigate(`/video/${video.id}`)}
                className="group cursor-pointer transform transition-transform hover:scale-105"
              >
                <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden mb-2">
                  {video.thumbnail_path ? (
                    <img
                      src={`http://localhost:8000/${video.thumbnail_path}`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
                      <Play className="h-12 w-12 text-white opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                    <Play className="h-16 w-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary-400 transition">
                  {video.title}
                </h3>
                {video.subject && (
                  <p className="text-xs text-gray-400 mt-1">{video.subject}</p>
                )}
                {video.views_count > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{video.views_count} views</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home

