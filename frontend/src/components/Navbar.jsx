import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Leaf, LogOut, User, BarChart2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-agro-700 text-lg">
            <Leaf className="w-6 h-6" />
            AgroConnect
          </Link>

          {/* Nav links */}
          {user && (
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link to="/dashboard" className="hover:text-agro-700 transition-colors">Dashboard</Link>
              <Link to="/predict-crop" className="hover:text-agro-700 transition-colors">Crop AI</Link>
              <Link to="/disease-detection" className="hover:text-agro-700 transition-colors">Disease AI</Link>
              <Link to="/history" className="hover:text-agro-700 transition-colors flex items-center gap-1">
                <BarChart2 className="w-4 h-4" /> History
              </Link>
            </div>
          )}

          {/* Right side */}
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-700 hover:text-agro-700">
                <div className="w-8 h-8 bg-agro-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-agro-700" />
                </div>
                <span className="hidden sm:block font-medium">{user.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm text-gray-600 hover:text-agro-700 font-medium">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
