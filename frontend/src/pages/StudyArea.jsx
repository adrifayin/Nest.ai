import { useState, useEffect, useRef } from 'react'
import { sendChatMessage, getChatHistory } from '../api/api'
import { Send, Bot, User } from 'lucide-react'

const StudyArea = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadChatHistory()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatHistory = async () => {
    try {
      setLoadingHistory(true)
      const history = await getChatHistory()
      setMessages(history.map((h) => ({
        id: h.id,
        message: h.message,
        response: h.response,
        isUser: true,
        timestamp: h.created_at,
      })).flatMap((h) => [
        { ...h, isUser: true },
        { id: h.id + '_response', message: h.response, isUser: false, timestamp: h.created_at },
      ]))
    } catch (error) {
      console.error('Failed to load chat history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    // Add user message
    const newUserMessage = {
      id: Date.now(),
      message: userMessage,
      isUser: true,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, newUserMessage])

    try {
      const response = await sendChatMessage(userMessage)
      
      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        message: response.response,
        isUser: false,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage = {
        id: Date.now() + 1,
        message: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  if (loadingHistory) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading chat history...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-screen">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 p-6">
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary-500" />
            <div>
              <h1 className="text-2xl font-bold">Study Area</h1>
              <p className="text-sm text-gray-400">
                Ask questions about videos you've watched or documents you've uploaded
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <Bot className="h-16 w-16 text-gray-700 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
              <p className="text-gray-400">
                Ask me anything about the videos you've watched or documents you've uploaded.
                I'll provide context-aware answers based on your learning materials.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!msg.isUser && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    msg.isUser
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>
                {msg.isUser && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-gray-900 border-t border-gray-800 p-4">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about what you've learned..."
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="h-5 w-5" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default StudyArea

