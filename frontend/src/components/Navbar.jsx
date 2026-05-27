import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
    const isHash = to.startsWith('#')
    const dest = isHash && location.pathname !== '/' ? '/' + to : to
    const active = location.pathname === to || location.hash === to

    return (
      <a
        href={dest}
        className={`block md:inline-block text-lg md:text-sm font-medium transition-all duration-150 py-3.5 px-4 md:py-0 md:px-0 rounded-xl md:rounded-none cursor-pointer ${
          active
            ? 'text-forest-700 dark:text-forest-400 bg-forest-50/50 dark:bg-forest-900/20 md:bg-transparent md:dark:bg-transparent font-semibold'
            : 'text-stone-600 hover:text-forest-700 dark:text-stone-300 dark:hover:text-forest-400 hover:bg-earth-50 dark:hover:bg-stone-800 md:hover:bg-transparent md:dark:hover:bg-transparent'
        }`}
        onClick={(e) => {
          setOpen(false)
          if (!isHash) {
            e.preventDefault()
            navigate(to)
          }
        }}
      >
        {label}
      </a>
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
            {navLink('#features', 'Features')}
            {navLink('#about', 'About Us')}
            {navLink('#intelligence', 'Intelligence')}
            {navLink('/buyer/dashboard', 'Marketplace')}
            {isAuth && user?.role === 'FARMER' && navLink('/farmer/dashboard', 'Dashboard')}
            {isAuth && navLink('/ai-tools', 'AI Tools')}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-all duration-300 group overflow-hidden border border-transparent dark:border-stone-700 hover:shadow-inner"
              aria-label="Toggle theme"
            >
              <div className="relative z-10 transform transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400 drop-shadow-sm" /> : <Moon className="w-5 h-5 text-indigo-500 drop-shadow-sm" />}
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
              className="relative p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-all duration-300 group overflow-hidden border border-transparent dark:border-stone-700 hover:shadow-inner"
            >
              <div className="relative z-10 transform transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400 drop-shadow-sm" /> : <Moon className="w-5 h-5 text-indigo-500 drop-shadow-sm" />}
              </div>
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
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-earth-100 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-3">
              {navLink('/', 'Home')}
              {navLink('#features', 'Features')}
              {navLink('#about', 'About Us')}
              {navLink('#intelligence', 'Intelligence')}
              {navLink('/buyer/dashboard', 'Marketplace')}
              {isAuth && user?.role === 'FARMER' && navLink('/farmer/dashboard', 'Dashboard')}
              {isAuth && navLink('/ai-tools', 'AI Tools')}
              <div className="pt-4 mt-2 border-t border-earth-100 dark:border-stone-800 space-y-3">
                {isAuth ? (
                  <button onClick={handleLogout} className="w-full btn-secondary text-base py-3">Logout</button>
                ) : (
                  <>
                    <Link to="/login"    onClick={() => setOpen(false)} className="block w-full btn-secondary text-base py-3 text-center">Login</Link>
                    <Link to="/register" onClick={() => setOpen(false)} className="block w-full btn-primary  text-base py-3 text-center">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
