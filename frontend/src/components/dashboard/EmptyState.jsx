import { motion } from 'framer-motion'

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[400px]"
    >
      <div className="w-20 h-20 bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-dashboard-border rounded-3xl flex items-center justify-center mb-6 shadow-inner">
        <Icon className="w-10 h-10 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
      </div>
      
      <h3 className="font-display text-2xl font-bold text-stone-700 dark:text-stone-200 mb-2">{title}</h3>
      <p className="text-stone-400 dark:text-stone-500 dark:text-stone-400 max-w-md mx-auto mb-8 leading-relaxed">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="btn-primary flex items-center gap-2"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  )
}
