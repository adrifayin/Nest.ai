import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import StudyArea from './pages/StudyArea'
import MySpace from './pages/MySpace'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VideoPlayer from './pages/VideoPlayer'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black text-white">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/video/:id"
              element={
                <PrivateRoute>
                  <VideoPlayer />
                </PrivateRoute>
              }
            />
            <Route
              path="/study"
              element={
                <PrivateRoute>
                  <StudyArea />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-space"
              element={
                <PrivateRoute>
                  <MySpace />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

