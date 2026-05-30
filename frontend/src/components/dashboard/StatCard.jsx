import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import AnimatedCounter from './AnimatedCounter'

export default function StatCard({ icon: Icon, label, value, trend, trendUp, color = 'emerald' }) {
  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    sky: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-hover p-4 aspect-square flex flex-col justify-center items-center text-center rounded-2xl border border-stone-200 dark:border-stone-800 relative"
    >
      <div className={`p-2.5 rounded-xl ${colorMap[color]} border shadow-inner mb-3`}>
        <Icon className="w-6 h-6" />
      </div>
      
      <div className="w-full">
        <div className="text-2xl sm:text-3xl font-display font-bold text-stone-800 dark:text-stone-100 tracking-tight leading-none mb-1.5">
          {typeof value === 'number' ? (
            <AnimatedCounter value={value} prefix={label.toLowerCase().includes('revenue') ? '₹' : ''} />
          ) : (
            value
          )}
        </div>
        <h3 className="text-stone-400 dark:text-stone-500 font-medium text-[10px] sm:text-xs uppercase tracking-wider line-clamp-1">{label}</h3>
      </div>

      {trend && (
        <div className={`absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${trendUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        </div>
      )}
    </motion.div>
  )
}
