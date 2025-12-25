import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyVideos, getWatchHistory, uploadVideo, uploadDocument, getDocuments, deleteDocument } from '../api/api'
import { Upload, Video, FileText, History, Trash2, Play } from 'lucide-react'

const MySpace = () => {
  const [activeTab, setActiveTab] = useState('videos')
  const [myVideos, setMyVideos] = useState([])
  const [watchHistory, setWatchHistory] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showVideoUpload, setShowVideoUpload] = useState(false)
  const [showDocUpload, setShowDocUpload] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    try {
      setLoading(true)
      if (activeTab === 'videos') {
        const videos = await getMyVideos()
        setMyVideos(videos)
      } else if (activeTab === 'history') {
        const history = await getWatchHistory()
        setWatchHistory(history)
      } else if (activeTab === 'documents') {
        const docs = await getDocuments()
        setDocuments(docs)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVideoUpload = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const file = formData.get('file')
    const title = formData.get('title')
    const description = formData.get('description')
    const subject = formData.get('subject')
    const topic = formData.get('topic')
    const level = formData.get('level')

    if (!file || !title) {
      alert('Please provide a file and title')
      return
    }

    try {
      setUploading(true)
      await uploadVideo(file, { title, description, subject, topic, level })
      setShowVideoUpload(false)
      e.target.reset()
      loadData()
      alert('Video uploaded successfully!')
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDocUpload = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const file = formData.get('file')
    const title = formData.get('title')

    if (!file || !title) {
      alert('Please provide a file and title')
      return
    }

    try {
      setUploading(true)
      await uploadDocument(file, title)
      setShowDocUpload(false)
      e.target.reset()
      loadData()
      alert('Document uploaded successfully!')
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDoc = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      await deleteDocument(id)
      loadData()
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete document')
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My Space</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('videos')}
            className={`pb-4 px-4 font-medium transition ${
              activeTab === 'videos'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              My Videos
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-4 px-4 font-medium transition ${
              activeTab === 'history'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Watch History
            </div>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-4 px-4 font-medium transition ${
              activeTab === 'documents'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </div>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16">
            <div className="text-xl">Loading...</div>
          </div>
        ) : (
          <>
            {/* My Videos Tab */}
            {activeTab === 'videos' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">My Uploaded Videos</h2>
                  <button
                    onClick={() => setShowVideoUpload(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition"
                  >
                    <Upload className="h-5 w-5" />
                    Upload Video
                  </button>
                </div>

                {myVideos.length === 0 ? (
                  <div className="text-center py-16 bg-gray-900 rounded-lg">
                    <Video className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-400">No videos uploaded yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {myVideos.map((video) => (
                      <div
                        key={video.id}
                        onClick={() => navigate(`/video/${video.id}`)}
                        className="cursor-pointer group"
                      >
                        <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden mb-2">
                          {video.thumbnail_path ? (
                            <img
                              src={`http://localhost:8000/${video.thumbnail_path}`}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Play className="h-12 w-12 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm">{video.title}</h3>
                        <p className="text-xs text-gray-400 mt-1">{video.views_count || 0} views</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Watch History Tab */}
            {activeTab === 'history' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Watch History</h2>
                {watchHistory.length === 0 ? (
                  <div className="text-center py-16 bg-gray-900 rounded-lg">
                    <History className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-400">No watch history yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {watchHistory.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => item.video && navigate(`/video/${item.video.id}`)}
                        className="bg-gray-900 rounded-lg p-4 cursor-pointer hover:bg-gray-800 transition"
                      >
                        {item.video && (
                          <div className="flex gap-4">
                            <div className="w-32 aspect-video bg-gray-800 rounded flex-shrink-0">
                              {item.video.thumbnail_path ? (
                                <img
                                  src={`http://localhost:8000/${item.video.thumbnail_path}`}
                                  alt={item.video.title}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Play className="h-8 w-8 text-gray-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">{item.video.title}</h3>
                              <div className="flex gap-4 text-sm text-gray-400">
                                <span>Watched: {formatDuration(item.watch_duration)}</span>
                                <span>Progress: {item.completion_percentage.toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">My Documents</h2>
                  <button
                    onClick={() => setShowDocUpload(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition"
                  >
                    <Upload className="h-5 w-5" />
                    Upload Document
                  </button>
                </div>

                {documents.length === 0 ? (
                  <div className="text-center py-16 bg-gray-900 rounded-lg">
                    <FileText className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-400">No documents uploaded yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-gray-900 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-primary-500" />
                          <div>
                            <h3 className="font-semibold">{doc.title}</h3>
                            <p className="text-sm text-gray-400">{doc.file_type.toUpperCase()}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Video Upload Modal */}
        {showVideoUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Upload Video</h2>
              <form onSubmit={handleVideoUpload}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Video File</label>
                    <input type="file" name="file" accept="video/*" required className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      name="description"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      rows="3"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Topic</label>
                      <input
                        type="text"
                        name="topic"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Level</label>
                    <select
                      name="level"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    >
                      <option value="">Select Level</option>
                      <option value="Elementary">Elementary</option>
                      <option value="High School">High School</option>
                      <option value="College">College</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowVideoUpload(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Document Upload Modal */}
        {showDocUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Upload Document</h2>
              <form onSubmit={handleDocUpload}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Document File</label>
                    <input
                      type="file"
                      name="file"
                      accept=".pdf,.docx,.pptx,.txt"
                      required
                      className="w-full"
                    />
                    <p className="text-xs text-gray-400 mt-1">Supported: PDF, DOCX, PPTX, TXT</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowDocUpload(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MySpace

