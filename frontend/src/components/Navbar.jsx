/**
 * AgroConnect - Navbar
 */
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, isAuth, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  const navLink = (to, label) => {
    const active = location.pathname === to
    return (
      <Link
        to={to}
        className={`text-sm font-medium transition-colors duration-150 ${
          active ? 'text-forest-700' : 'text-stone-600 hover:text-forest-700'
        }`}
        onClick={() => setOpen(false)}
      >
        {label}
      </Link>
    )
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-earth-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="text-2xl">🌱</span>
            <span className="font-display font-bold text-xl text-stone-800 group-hover:text-forest-700 transition-colors">
              AgroConnect
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLink('/', 'Home')}
            {navLink('/marketplace', 'Marketplace')}
            {isAuth && user?.role === 'FARMER' && navLink('/dashboard', 'Dashboard')}
            {isAuth && navLink('/ai-tools', 'AI Tools')}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuth ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-earth-50 rounded-lg border border-earth-100">
                  <div className={`w-2 h-2 rounded-full ${user?.role === 'FARMER' ? 'bg-forest-500' : 'bg-sky-500'}`} />
                  <span className="text-sm font-medium text-stone-700 max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <span className="badge bg-earth-100 text-earth-700 text-[10px]">
                    {user?.role}
                  </span>
                </div>
                <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login"    className="btn-secondary text-sm py-2 px-4">Login</Link>
                <Link to="/register" className="btn-primary  text-sm py-2 px-4">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-earth-100 transition-colors"
          >
            <div className={`w-5 h-0.5 bg-stone-700 transition-all ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-5 h-0.5 bg-stone-700 my-1 transition-all ${open ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-stone-700 transition-all ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-earth-100 bg-white px-4 py-4 space-y-3">
          {navLink('/', 'Home')}
          {navLink('/marketplace', 'Marketplace')}
          {isAuth && user?.role === 'FARMER' && navLink('/dashboard', 'Dashboard')}
          {isAuth && navLink('/ai-tools', 'AI Tools')}
          <div className="pt-2 border-t border-earth-100 space-y-2">
            {isAuth ? (
              <button onClick={handleLogout} className="w-full btn-secondary text-sm">Logout</button>
            ) : (
              <>
                <Link to="/login"    onClick={() => setOpen(false)} className="block w-full btn-secondary text-sm text-center">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="block w-full btn-primary  text-sm text-center">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
