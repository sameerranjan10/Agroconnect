import { motion } from 'framer-motion'

const NEWS_ITEMS = [
  { id: 1, category: 'Market', categoryColor: 'amber', title: 'Wheat procurement surges across Northern states', summary: 'FCI reports a 15% increase in wheat procurement this season compared to last year.', time: '2 hours ago' },
  { id: 2, category: 'Weather', categoryColor: 'sky', title: 'Early monsoon predicted for Western coastal regions', summary: 'IMD forecasts early arrival of monsoon, advising farmers to prep for Kharif season.', time: '5 hours ago' },
  { id: 3, category: 'Tech', categoryColor: 'emerald', title: 'New drone subsidy scheme announced', summary: 'Government announces 50% subsidy for agriculture drones to boost precision farming.', time: '1 day ago' },
  { id: 4, category: 'Policy', categoryColor: 'purple', title: 'MSP hiked for Kharif crops', summary: 'Cabinet approves higher Minimum Support Prices for 14 mandated Kharif crops.', time: '2 days ago' }
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
}

export default function NewsFeed() {
  const getColorClasses = (color) => {
    const map = {
      amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    }
    return map[color] || map.emerald
  }

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-stone-200">Agriculture News & Trends</h3>
      </div>
      
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 flex-1 overflow-y-auto dash-scroll pr-2">
        {NEWS_ITEMS.map((news) => (
          <motion.div key={news.id} variants={item} className="p-4 rounded-xl bg-white/5 border border-dashboard-border hover:bg-white/10 transition-colors cursor-pointer group">
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getColorClasses(news.categoryColor)}`}>
                {news.category}
              </span>
              <span className="text-xs text-stone-500">{news.time}</span>
            </div>
            <h4 className="font-medium text-stone-200 text-sm mb-1 group-hover:text-emerald-400 transition-colors">{news.title}</h4>
            <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">{news.summary}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
