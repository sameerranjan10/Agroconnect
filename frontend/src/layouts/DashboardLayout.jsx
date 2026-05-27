import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import DashboardNavbar from '../components/dashboard/DashboardNavbar'
import { useAuth } from '../context/AuthContext'

export default function DashboardLayout({ children, sidebarItems, activeSidebarItem, onSidebarItemClick, pageTitle, pageSubtitle }) {
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check mobile
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setCollapsed(true)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Ensure dark mode body style is active for dashboard
    document.body.style.backgroundColor = '#0a0f0d'
    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])

  return (
    <div className="min-h-screen bg-dashboard-bg text-stone-100 flex overflow-hidden">
      
      <DashboardSidebar 
        items={sidebarItems}
        activeItem={activeSidebarItem}
        onItemClick={onSidebarItemClick}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        user={user}
      />

      <div 
        className="flex-1 flex flex-col min-h-screen transition-all duration-300 relative"
        style={{ marginLeft: isMobile ? 0 : (collapsed ? 72 : 280) }}
      >
        <DashboardNavbar 
          title={pageTitle}
          subtitle={pageSubtitle}
          onMenuClick={() => setCollapsed(false)}
          user={user}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-dashboard-bg pt-16 relative dash-scroll">
          {/* Subtle background grain for texture */}
          <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-grain z-0"></div>
          
          <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto relative z-10 min-h-[calc(100vh-4rem)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSidebarItem}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
