import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu } from 'lucide-react'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import DashboardNavbar from '../components/dashboard/DashboardNavbar'
import DockMorph from '../components/dashboard/DockMorph'
import { useAuth } from '../context/AuthContext'

export default function DashboardLayout({ children, sidebarItems, dockItems: customDockItems, activeSidebarItem, onSidebarItemClick, pageTitle, pageSubtitle }) {
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
    // Ensure dashboard specific body styles if needed (cleanup on unmount)
    document.body.classList.add('dashboard-active')
    return () => {
      document.body.classList.remove('dashboard-active')
    }
  }, [])

  // Prepare dock items (top 4 + a "More" menu, or custom items)
  const dockItems = useMemo(() => {
    if (customDockItems && customDockItems.length > 0) {
      return [
        ...customDockItems,
        { id: 'more-menu', label: 'More', icon: Menu, isMore: true }
      ];
    }
    if (!sidebarItems || sidebarItems.length === 0) return [];
    const top4 = sidebarItems.slice(0, 4);
    return [
      ...top4,
      { id: 'more-menu', label: 'More', icon: Menu, isMore: true }
    ];
  }, [sidebarItems, customDockItems]);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-dashboard-bg text-stone-900 dark:text-stone-100 flex overflow-hidden transition-colors duration-300">
      <div className="hidden md:block">
        <DashboardSidebar 
          items={sidebarItems}
          activeItem={activeSidebarItem}
          onItemClick={onSidebarItemClick}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          user={user}
        />
      </div>

      {/* Mobile Sidebar Overlay (for when 'More' is clicked) */}
      <div className="md:hidden">
        <DashboardSidebar 
          items={sidebarItems}
          activeItem={activeSidebarItem}
          onItemClick={onSidebarItemClick}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          user={user}
        />
      </div>

      <div 
        className="flex-1 flex flex-col min-h-screen transition-all duration-300 relative"
        style={{ marginLeft: isMobile ? 0 : (collapsed ? 72 : 280) }}
      >
        <DashboardNavbar 
          title={pageTitle}
          subtitle={pageSubtitle}
          onMenuClick={() => setCollapsed(false)}
          user={user}
          hideHamburgerOnMobile={true}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-stone-50 dark:bg-dashboard-bg pt-16 pb-24 md:pb-0 relative dash-scroll transition-colors duration-300">
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
        
        {/* Android UI / Mobile Dock */}
        {isMobile && (
          <DockMorph 
            items={dockItems}
            activeItem={activeSidebarItem}
            onItemClick={onSidebarItemClick}
            onMoreClick={() => setCollapsed(prev => !prev)}
          />
        )}
      </div>
    </div>
  )
}
