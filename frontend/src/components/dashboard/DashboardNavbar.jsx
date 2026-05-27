import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Bell, Sun, Moon, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Logo from '../Logo'

export default function DashboardNavbar({ title, subtitle, onMenuClick, user }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-dashboard-surface/80 backdrop-blur-xl border-b border-dashboard-border z-40 flex items-center justify-between px-4 lg:px-8">
      {/* Left side */}
      <div className="flex items-center gap-4 md:ml-[280px] transition-all duration-300">
        <button onClick={onMenuClick} className="md:hidden p-2 text-stone-400 hover:text-white hover:bg-white/5 rounded-xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div className="hidden sm:block">
          <h1 className="font-display text-lg font-bold text-stone-100">{title}</h1>
          {subtitle && <p className="text-xs text-stone-400 font-medium">{subtitle}</p>}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input type="text" placeholder="Search..." className="bg-white/5 border border-dashboard-border rounded-xl pl-9 pr-4 py-1.5 text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 w-64 transition-all" />
        </div>

        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="p-2 text-stone-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false) }} className="relative p-2 text-stone-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
          <AnimatePresence>
            {showNotifs && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 glass-card p-4 shadow-2xl origin-top-right">
                <h3 className="text-sm font-semibold text-stone-200 mb-3">Notifications</h3>
                <div className="space-y-3">
                  <div className="flex gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">🌱</div>
                    <div>
                      <p className="text-stone-300">Welcome to your new dashboard!</p>
                      <p className="text-xs text-stone-500">Just now</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button onClick={() => { setShowProfile(!showProfile); setShowNotifs(false) }} className="flex items-center gap-2 hover:bg-white/5 rounded-full p-1 pr-3 transition-colors">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              {getInitials(user?.name)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-stone-200 leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">{user?.role || 'User'}</p>
            </div>
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 mt-2 w-48 glass-card py-2 shadow-2xl origin-top-right">
                <div className="px-4 py-2 border-b border-dashboard-border/50 mb-1 sm:hidden">
                  <p className="text-sm font-medium text-stone-200">{user?.name}</p>
                  <p className="text-xs text-emerald-400 uppercase">{user?.role}</p>
                </div>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
