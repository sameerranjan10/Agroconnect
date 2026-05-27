import { Cloud, Droplets, Wind, Thermometer, CloudSun } from 'lucide-react'

export default function WeatherWidget() {
  return (
    <div className="glass-card p-6 flex flex-col h-full bg-gradient-to-br from-white dark:from-dashboard-card to-stone-100 dark:to-dashboard-surface">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-stone-700 dark:text-stone-200">Local Weather</h3>
        <span className="text-xs text-stone-400 dark:text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-white/5 px-2 py-1 rounded-full">Punjab</span>
      </div>

      <div className="flex items-center gap-6 mb-6">
        <div className="text-emerald-400 p-4 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 shadow-inner">
          <CloudSun className="w-12 h-12" />
        </div>
        <div>
          <div className="text-4xl font-display font-bold text-stone-800 dark:text-stone-100">28°C</div>
          <div className="text-stone-400 dark:text-stone-500 dark:text-stone-400 text-sm mt-1">Partly Cloudy</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-dashboard-border rounded-xl p-3 flex items-center gap-3">
          <Droplets className="w-5 h-5 text-sky-400" />
          <div>
            <div className="text-xs text-stone-400 dark:text-stone-500">Humidity</div>
            <div className="text-sm font-semibold text-stone-700 dark:text-stone-200">65%</div>
          </div>
        </div>
        <div className="bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-dashboard-border rounded-xl p-3 flex items-center gap-3">
          <Wind className="w-5 h-5 text-stone-400 dark:text-stone-500 dark:text-stone-400" />
          <div>
            <div className="text-xs text-stone-400 dark:text-stone-500">Wind</div>
            <div className="text-sm font-semibold text-stone-700 dark:text-stone-200">12 km/h</div>
          </div>
        </div>
      </div>

      <div className="mt-auto bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/20 rounded-bl-full blur-xl pointer-events-none" />
        <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Farming Tip</p>
        <p className="text-sm text-stone-600 dark:text-stone-300">Perfect conditions for sowing wheat. Ground moisture is optimal.</p>
      </div>
    </div>
  )
}
