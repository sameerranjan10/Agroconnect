import { useState, useEffect } from 'react'
import { Cloud, Droplets, Wind, CloudSun, Loader2, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun, MapPin } from 'lucide-react'
import { weatherAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const getWeatherIcon = (iconId) => {
  if (!iconId) return <Cloud className="w-8 h-8 text-stone-400" />
  const type = iconId.slice(0, 2)
  const isDay = iconId.endsWith('d')
  
  if (type === '01') return isDay ? <Sun className="w-8 h-8 text-amber-400" /> : <Cloud className="w-8 h-8 text-slate-300" />
  if (type === '02' || type === '03' || type === '04') return isDay ? <CloudSun className="w-8 h-8 text-amber-400" /> : <Cloud className="w-8 h-8 text-slate-400" />
  if (type === '09' || type === '10') return <CloudRain className="w-8 h-8 text-blue-500" />
  if (type === '11') return <CloudLightning className="w-8 h-8 text-purple-500" />
  if (type === '13') return <CloudSnow className="w-8 h-8 text-white" />
  if (type === '50') return <CloudFog className="w-8 h-8 text-slate-400" />
  return <Cloud className="w-8 h-8 text-stone-400" />
}

export default function WeatherWidget() {
  const { user } = useAuth()
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.latitude && user?.longitude) {
      setLoading(true)
      weatherAPI.getDashboard(user.latitude, user.longitude)
        .then(res => {
          setWeather({
            city: res.data.location,
            temperature: Math.round(res.data.temperature),
            humidity: res.data.humidity,
            windSpeed: res.data.wind_speed,
            description: res.data.description,
            icon: res.data.icon,
            advisory: res.data.ai_advisory
          })
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false))
    }
  }, [user])

  if (!user?.latitude || !user?.longitude) {
    return (
      <div className="glass-card p-4 flex flex-col h-full border border-stone-200 dark:border-stone-800 justify-center items-center text-center">
        <MapPin className="w-6 h-6 text-stone-400 mb-2" />
        <h3 className="font-semibold text-stone-700 dark:text-stone-200 text-sm">Local Weather</h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">Set location in Settings.</p>
      </div>
    )
  }

  if (loading || !weather) {
    return (
      <div className="glass-card p-4 flex flex-col h-full border border-stone-200 dark:border-stone-800">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400 m-auto" />
      </div>
    )
  }

  return (
    <div className="glass-card p-4 flex flex-col h-full border border-stone-200 dark:border-stone-800 rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-stone-700 dark:text-stone-200 text-sm">Local Weather</h3>
        <span className="text-[10px] text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-white/5 px-2 py-1 rounded-full truncate max-w-[120px]">
          {weather.city}, India
        </span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="text-emerald-400 p-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
          {getWeatherIcon(weather.icon)}
        </div>
        <div>
          <div className="text-3xl font-display font-bold text-stone-800 dark:text-stone-100">{weather.temperature}°C</div>
          <div className="text-stone-400 dark:text-stone-500 text-xs mt-0.5 capitalize">{weather.description}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-dashboard-border rounded-lg p-2.5 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-sky-400" />
          <div>
            <div className="text-[10px] text-stone-400 dark:text-stone-500">Humidity</div>
            <div className="text-xs font-semibold text-stone-700 dark:text-stone-200">{weather.humidity}%</div>
          </div>
        </div>
        <div className="bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-dashboard-border rounded-lg p-2.5 flex items-center gap-2">
          <Wind className="w-4 h-4 text-stone-400 dark:text-stone-500" />
          <div>
            <div className="text-[10px] text-stone-400 dark:text-stone-500">Wind</div>
            <div className="text-xs font-semibold text-stone-700 dark:text-stone-200">{weather.windSpeed} m/s</div>
          </div>
        </div>
      </div>

      {/* Show AI Advisories (Limited to 2 for space) */}
      {weather.advisory && weather.advisory.length > 0 && (
        <div className="mt-auto space-y-2">
          {weather.advisory.slice(0, 2).map((item, index) => (
            <div key={index} className={`border rounded-lg p-2.5 ${
              item.type === 'danger' ? 'bg-red-50 border-red-100 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300' :
              item.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300' :
              item.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300' :
              'bg-sky-50 border-sky-100 text-sky-700 dark:bg-sky-500/10 dark:border-sky-500/20 dark:text-sky-300'
            }`}>
              <h4 className="text-[11px] font-semibold mb-0.5">{item.title}</h4>
              <p className="text-[10px] opacity-90">{item.action}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
