import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import Logo from '../Logo'

export default function DashboardSidebar({ items, activeItem, onItemClick, collapsed, onToggleCollapse, user }) {
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => onToggleCollapse()}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className="fixed top-0 left-0 bottom-0 bg-gradient-to-b from-dashboard-surface to-dashboard-bg border-r border-dashboard-border z-50 flex flex-col"
        animate={{ width: collapsed ? 72 : 280, x: typeof window !== 'undefined' && window.innerWidth < 768 ? (collapsed ? -280 : 0) : 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
      >
        {/* Header */}
        <div className="h-16 flex items-center px-4 shrink-0 justify-between relative z-10 border-b border-dashboard-border/50">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <Logo className="h-8 w-auto shrink-0 text-emerald-500" />
            <AnimatePresence mode="popLayout">
              {!collapsed && (
                <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="font-display font-bold text-xl text-stone-100">
                  AgroConnect
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <button onClick={() => onToggleCollapse()} className="md:hidden p-2 text-stone-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <div className="flex-1 py-6 px-3 overflow-y-auto dash-scroll space-y-1 relative z-10">
          {items.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onItemClick(item.id); if(window.innerWidth < 768) onToggleCollapse(); }}
                className={`w-full relative group flex items-center p-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-emerald-500/10 text-emerald-400 glow-border' : 'text-stone-400 hover:text-emerald-300 hover:bg-white/5'}`}
                title={collapsed ? item.label : ''}
              >
                {isActive && (
                  <motion.div layoutId="activeNavIndicator" className="absolute left-0 w-1 top-2 bottom-2 bg-emerald-500 rounded-r-full" />
                )}
                <item.icon className={`w-5 h-5 shrink-0 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
                
                <AnimatePresence mode="popLayout">
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0, w: 0 }} animate={{ opacity: 1, w: 'auto' }} exit={{ opacity: 0, w: 0 }} className="font-medium text-sm whitespace-nowrap overflow-hidden flex-1 text-left">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {!collapsed && item.badge && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-dashboard-border/50 bg-dashboard-bg/50 shrink-0 relative z-10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/50 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shrink-0">
              {getInitials(user?.name)}
            </div>
            <AnimatePresence mode="popLayout">
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                  <p className="text-sm font-medium text-stone-200 truncate w-32">{user?.name || 'User'}</p>
                  <p className="text-[10px] text-emerald-500/80 font-bold tracking-wider uppercase">{user?.role}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-emerald-900/5 blur-[100px] pointer-events-none rounded-full translate-y-1/2" />
      </motion.aside>
    </>
  )
}
