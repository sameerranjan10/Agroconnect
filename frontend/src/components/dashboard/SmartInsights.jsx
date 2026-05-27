import { Lightbulb, Sprout, TrendingUp, Shield } from 'lucide-react'

const INSIGHTS = [
  { id: 1, icon: Sprout, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', title: 'Crop Rotation', desc: 'Consider planting legumes next season to restore soil nitrogen levels.' },
  { id: 2, icon: TrendingUp, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', title: 'Price Alert', desc: 'Tomato prices are expected to rise by 15% next week due to high demand.' },
  { id: 3, icon: Lightbulb, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20', title: 'Smart Irrigation', desc: 'Reduce watering by 20% this week. Moisture levels remain optimal.' },
  { id: 4, icon: Shield, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', title: 'Pest Risk', desc: 'Low risk of locusts in your region. Standard preventative measures apply.' }
]

export default function SmartInsights() {
  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-stone-700 dark:text-stone-200 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-emerald-400" />
          AI Smart Insights
        </h3>
      </div>
      
      <div className="grid sm:grid-cols-2 gap-4">
        {INSIGHTS.map((insight) => (
          <div key={insight.id} className="p-4 rounded-xl bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-dashboard-border hover:border-emerald-500/30 transition-colors group">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg border ${insight.color}`}>
                <insight.icon className="w-4 h-4" />
              </div>
              <h4 className="font-medium text-sm text-stone-700 dark:text-stone-200">{insight.title}</h4>
            </div>
            <p className="text-xs text-stone-400 dark:text-stone-500 dark:text-stone-400 leading-relaxed group-hover:text-stone-600 dark:text-stone-300 transition-colors">
              {insight.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
