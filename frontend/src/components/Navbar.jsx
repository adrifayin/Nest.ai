import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, GraduationCap, User, LogOut } from 'lucide-react'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold text-white">NEST.ai</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-1 text-gray-300 hover:text-white transition"
            >
              <BookOpen className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link
              to="/study"
              className="flex items-center space-x-1 text-gray-300 hover:text-white transition"
            >
              <GraduationCap className="h-5 w-5" />
              <span>Study Area</span>
            </Link>
            <Link
              to="/my-space"
              className="flex items-center space-x-1 text-gray-300 hover:text-white transition"
            >
              <User className="h-5 w-5" />
              <span>My Space</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                {user?.full_name || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-300 hover:text-white transition"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

