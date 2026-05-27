import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const QUOTES = [
  "The farmer has to be an optimist or he wouldn't still be a farmer.",
  "Agriculture is the most healthful, most useful and most noble employment of man.",
  "To forget how to dig the earth and to tend the soil is to forget ourselves.",
  "The discovery of agriculture was the first big step toward a civilized life.",
  "Cultivators of the earth are the most valuable citizens."
]

export default function WelcomeHero({ userName, role }) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Get a random quote based on the day to keep it consistent
  const quote = QUOTES[new Date().getDay() % QUOTES.length]

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-3xl p-6 md:p-8 mb-6 bg-gradient-to-br from-emerald-600 via-forest-600 to-forest-800 border border-emerald-500/30 shadow-xl shadow-emerald-900/20"
    >
      {/* Decorative background circles */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white opacity-[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50 pointer-events-none mix-blend-overlay [mask-image:linear-gradient(to_left,black,transparent)]" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/20 dark:bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/90 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3 h-3 text-emerald-300" />
            {role} Portal
          </div>
          <h2 className="font-display text-2xl md:text-4xl font-bold text-white mb-2">
            {getGreeting()}, <span className="text-emerald-200">{userName?.split(' ')[0] || 'User'}</span> 👋
          </h2>
          <p className="text-emerald-50/80 text-sm md:text-base max-w-xl italic">
            "{quote}"
          </p>
        </div>
      </div>
    </motion.div>
  )
}
