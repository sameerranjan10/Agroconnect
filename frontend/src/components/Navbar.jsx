/**
 * AgroConnect - Navbar
 */
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function Navbar() {
  const { user, isAuth, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  const handleLogout = () => { logout(); navigate('/') }

  const navLink = (to, label) => {
    const active = location.pathname === to
    return (
      <Link
        to={to}
        className={`block md:inline-block text-base md:text-sm font-medium transition-all duration-150 py-2.5 px-4 md:py-0 md:px-0 rounded-xl md:rounded-none ${
          active
            ? 'text-forest-700 dark:text-forest-400 bg-forest-50/50 dark:bg-forest-900/20 md:bg-transparent md:dark:bg-transparent font-semibold'
            : 'text-stone-600 hover:text-forest-700 dark:text-stone-300 dark:hover:text-forest-400 hover:bg-earth-50 dark:hover:bg-stone-800 md:hover:bg-transparent md:dark:hover:bg-transparent'
        }`}
        onClick={() => setOpen(false)}
      >
        {label}
      </Link>
    )
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-earth-100 dark:border-stone-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <Logo className="h-9 w-auto" />
            <span className="font-display font-bold text-xl text-stone-800 dark:text-stone-100 group-hover:text-forest-700 dark:group-hover:text-forest-400 transition-colors">
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
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-stone-600 hover:bg-earth-100 dark:text-stone-300 dark:hover:bg-stone-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {isAuth ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-earth-50 dark:bg-stone-800 rounded-lg border border-earth-100 dark:border-stone-700">
                  <div className={`w-2 h-2 rounded-full ${user?.role === 'FARMER' ? 'bg-forest-500' : 'bg-sky-500'}`} />
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-200 max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <span className="badge bg-earth-100 text-earth-700 dark:bg-stone-700 dark:text-stone-300 text-[10px]">
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

          {/* Mobile hamburger & Theme Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-stone-600 hover:bg-earth-100 dark:text-stone-300 dark:hover:bg-stone-800 transition-colors"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg hover:bg-earth-100 dark:hover:bg-stone-800 transition-colors"
            >
              <div className={`w-5 h-0.5 bg-stone-700 dark:bg-stone-300 transition-all ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
              <div className={`w-5 h-0.5 bg-stone-700 dark:bg-stone-300 my-1 transition-all ${open ? 'opacity-0' : ''}`} />
              <div className={`w-5 h-0.5 bg-stone-700 dark:bg-stone-300 transition-all ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-earth-100 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 py-4 space-y-3">
          {navLink('/', 'Home')}
          {navLink('/marketplace', 'Marketplace')}
          {isAuth && user?.role === 'FARMER' && navLink('/dashboard', 'Dashboard')}
          {isAuth && navLink('/ai-tools', 'AI Tools')}
          <div className="pt-2 border-t border-earth-100 dark:border-stone-800 space-y-2">
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
