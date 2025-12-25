import axios from 'axios'

const API_BASE_URL = '/api'

// Videos
export const getVideos = async (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.subject) params.append('subject', filters.subject)
  if (filters.topic) params.append('topic', filters.topic)
  if (filters.level) params.append('level', filters.level)
  if (filters.skip) params.append('skip', filters.skip)
  if (filters.limit) params.append('limit', filters.limit)

  const response = await axios.get(`${API_BASE_URL}/videos?${params}`)
  return response.data
}

export const getVideo = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/videos/${id}`)
  return response.data
}

export const uploadVideo = async (file, metadata) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', metadata.title)
  if (metadata.description) formData.append('description', metadata.description)
  if (metadata.subject) formData.append('subject', metadata.subject)
  if (metadata.topic) formData.append('topic', metadata.topic)
  if (metadata.level) formData.append('level', metadata.level)

  const response = await axios.post(`${API_BASE_URL}/videos/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const recordWatch = async (videoId, watchDuration, completionPercentage) => {
  const response = await axios.post(`${API_BASE_URL}/videos/${videoId}/watch`, {
    video_id: videoId,
    watch_duration: watchDuration,
    completion_percentage: completionPercentage,
  })
  return response.data
}

export const getMyVideos = async () => {
  const response = await axios.get(`${API_BASE_URL}/videos/my/uploaded`)
  return response.data
}

export const getWatchHistory = async () => {
  const response = await axios.get(`${API_BASE_URL}/videos/my/history`)
  return response.data
}

// Documents
export const uploadDocument = async (file, title) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', title)

  const response = await axios.post(`${API_BASE_URL}/documents/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const getDocuments = async () => {
  const response = await axios.get(`${API_BASE_URL}/documents`)
  return response.data
}

export const deleteDocument = async (id) => {
  await axios.delete(`${API_BASE_URL}/documents/${id}`)
}

// Study Area
export const sendChatMessage = async (message, contextType, contextId) => {
  const response = await axios.post(`${API_BASE_URL}/study/chat`, {
    message,
    context_type: contextType,
    context_id: contextId,
  })
  return response.data
}

export const getChatHistory = async () => {
  const response = await axios.get(`${API_BASE_URL}/study/history`)
  return response.data
}

export const getLearningContext = async () => {
  const response = await axios.get(`${API_BASE_URL}/study/context`)
  return response.data
}

