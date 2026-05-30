import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Search, Bell, User, Settings } from "lucide-react"

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function DockMorph({ items, activeItem, onItemClick, onMoreClick, className, position = "bottom" }) {
  const [hovered, setHovered] = React.useState(null)

  const dockItems =
    items && items.length > 0
      ? items
      : [
          { icon: Home, label: "Home", onClick: () => alert("Home clicked") },
          { icon: Search, label: "Search", onClick: () => alert("Search clicked") },
          { icon: Bell, label: "Notifications", onClick: () => alert("Notifications clicked") },
          { icon: User, label: "Profile", onClick: () => alert("Profile clicked") },
          { icon: Settings, label: "Settings", onClick: () => alert("Settings clicked") },
        ]

  // Position classes
  const positionClasses = {
    bottom: "fixed bottom-6 left-1/2 -translate-x-1/2",
    top: "fixed top-6 left-1/2 -translate-x-1/2",
    left: "fixed left-6 top-1/2 -translate-y-1/2 flex-col",
  }

  return (
    <div
      className={cn(
        "z-50 flex items-center justify-center",
        positionClasses[position],
        className
      )}
    >
      <div
        className={cn(
          "relative flex items-center gap-6 p-3 rounded-3xl",
          position === "left" ? "flex-col gap-4 px-4 py-8" : "flex-row",
          "bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl shadow-lg border",
          "dark:border-white/10 border-black/10"
        )}
      >
        {dockItems.map((item, i) => {
          const isActive = activeItem === item.id;
          const IconComponent = item.icon;
          
          return (
            <div key={item.id || item.label} className="relative group">
              <div
                className="relative flex items-center justify-center"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Morphic glass bubble */}
                <AnimatePresence>
                  {(hovered === i || isActive) && (
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1.4, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      }}
                      className={cn(
                        "absolute inset-0 rounded-full -z-10",
                        "bg-gradient-to-tr from-emerald-500/40 via-emerald-500/20 to-transparent",
                        "backdrop-blur-2xl",
                        "shadow-md dark:shadow-emerald-500/20"
                      )}
                    />
                  )}
                </AnimatePresence>

                {/* Icon button */}
                <button
                  className={cn(
                    "relative z-10 p-2 rounded-full hover:scale-110 transition-transform flex items-center justify-center outline-none",
                    isActive ? "text-emerald-600 dark:text-emerald-400" : "text-stone-700 dark:text-stone-300 hover:text-emerald-500 dark:hover:text-emerald-400"
                  )}
                  onClick={() => {
                    if (item.onClick) item.onClick();
                    else if (item.isMore && onMoreClick) onMoreClick();
                    else if (onItemClick && item.id) onItemClick(item.id);
                  }}
                >
                  <IconComponent className="h-6 w-6" />
                </button>
              </div>

              {/* Tooltip Content */}
              <div
                className={cn(
                  "absolute opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
                  "bg-stone-800 dark:bg-stone-100 text-stone-100 dark:text-stone-800 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-50",
                  position === "left" ? "left-full ml-4 top-1/2 -translate-y-1/2" : "bottom-full mb-4 left-1/2 -translate-x-1/2"
                )}
              >
                {item.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
