import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Droplets, MapPin, Sun, Wind, AlertTriangle, ThermometerSun } from 'lucide-react'

// WMO Weather interpretation codes mapping
const getWeatherIcon = (code, isDay = 1) => {
  if (code === 0) return isDay ? <Sun className="w-full h-full text-amber-400" /> : <Cloud className="w-full h-full text-slate-300" />
  if (code >= 1 && code <= 3) return isDay ? <CloudSun className="w-full h-full text-amber-300" /> : <Cloud className="w-full h-full text-slate-400" />
  if (code >= 45 && code <= 48) return <CloudFog className="w-full h-full text-slate-400" />
  if (code >= 51 && code <= 55) return <CloudDrizzle className="w-full h-full text-sky-400" />
  if (code >= 61 && code <= 65) return <CloudRain className="w-full h-full text-blue-500" />
  if (code >= 71 && code <= 77) return <CloudSnow className="w-full h-full text-white" />
  if (code >= 80 && code <= 82) return <CloudRain className="w-full h-full text-blue-600" />
  if (code >= 95 && code <= 99) return <CloudLightning className="w-full h-full text-purple-500" />
  return <Cloud className="w-full h-full text-stone-400" />
}

const getWeatherDescription = (code) => {
  if (code === 0) return 'Clear Sky'
  if (code >= 1 && code <= 3) return 'Partly Cloudy'
  if (code >= 45 && code <= 48) return 'Foggy'
  if (code >= 51 && code <= 55) return 'Drizzle'
  if (code >= 61 && code <= 65) return 'Rain'
  if (code >= 71 && code <= 77) return 'Snow'
  if (code >= 80 && code <= 82) return 'Heavy Rain Showers'
  if (code >= 95 && code <= 99) return 'Thunderstorm'
  return 'Unknown'
}

export default function SmartWeatherDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Coordinates for Punjab, India as default
    const fetchWeather = async () => {
      try {
        setLoading(true)
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=30.9010&longitude=75.8573&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto')
        if (!res.ok) throw new Error('Weather API error')
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error(err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchWeather()
  }, [])

  if (loading) {
    return (
      <div className="w-full rounded-3xl bg-stone-100/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 p-8 min-h-[400px] flex items-center justify-center animate-pulse">
        <div className="flex flex-col items-center">
          <Cloud className="w-12 h-12 text-stone-300 dark:text-stone-600 mb-4" />
          <p className="text-stone-400">Loading live weather data...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="w-full rounded-3xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-8 text-center">
        <p className="text-red-500">Failed to load weather data.</p>
      </div>
    )
  }

  const { current, daily } = data
  const isDay = current.is_day
  
  // Theme styling based on weather and time
  let bgGradient = 'from-sky-400 to-blue-600'
  if (!isDay) bgGradient = 'from-slate-800 to-slate-950'
  else if (current.weather_code === 0) bgGradient = 'from-amber-400 to-orange-500'
  else if (current.weather_code >= 61) bgGradient = 'from-slate-600 to-slate-800'

  // Generate alerts based on current conditions
  const alerts = []
  if (current.temperature_2m > 38) alerts.push({ type: 'danger', msg: 'Heatwave Alert: Ensure adequate crop hydration.' })
  if (current.wind_speed_10m > 30) alerts.push({ type: 'warning', msg: 'High Wind Warning: Secure tall crops.' })
  if (current.precipitation > 10) alerts.push({ type: 'info', msg: 'Heavy Rainfall: Watch for waterlogging.' })

  return (
    <div className="w-full bg-white dark:bg-[#0a0f0d] rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row relative">
      {/* ── Left Side: Current Conditions ─────────────────────────────── */}
      <div className={`md:w-5/12 lg:w-1/3 p-8 lg:p-10 bg-gradient-to-br ${bgGradient} text-white flex flex-col justify-between relative overflow-hidden`}>
        {/* Subtle decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 flex justify-between items-start mb-8">
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-medium">
            <MapPin className="w-4 h-4" />
            Punjab, India
          </div>
          <span className="text-sm font-medium opacity-80 mt-1">Live</span>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center mb-10">
          <div className="w-32 h-32 mb-6 drop-shadow-2xl">
            {getWeatherIcon(current.weather_code, isDay)}
          </div>
          <h1 className="text-7xl font-display font-bold tracking-tighter mb-2">
            {Math.round(current.temperature_2m)}°
          </h1>
          <p className="text-xl font-medium tracking-wide">
            {getWeatherDescription(current.weather_code)}
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-2 bg-black/20 backdrop-blur-md rounded-2xl p-4">
          <div className="flex flex-col items-center justify-center text-center">
            <Droplets className="w-5 h-5 mb-1 opacity-70" />
            <span className="text-xs opacity-70 mb-0.5">Humidity</span>
            <span className="font-bold">{current.relative_humidity_2m}%</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center border-x border-white/20">
            <Wind className="w-5 h-5 mb-1 opacity-70" />
            <span className="text-xs opacity-70 mb-0.5">Wind</span>
            <span className="font-bold">{current.wind_speed_10m} km/h</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <CloudRain className="w-5 h-5 mb-1 opacity-70" />
            <span className="text-xs opacity-70 mb-0.5">Rainfall</span>
            <span className="font-bold">{current.precipitation} mm</span>
          </div>
        </div>
      </div>

      {/* ── Right Side: Forecast & Alerts ──────────────────────────────── */}
      <div className="flex-1 p-8 lg:p-10 flex flex-col bg-stone-50 dark:bg-dashboard-card relative">
        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-8 space-y-3">
            {alerts.map((alert, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 p-4 rounded-2xl border ${
                  alert.type === 'danger' ? 'bg-red-50 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' : 
                  alert.type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 
                  'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20'
                }`}
              >
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">{alert.msg}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Forecast Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-xl text-stone-800 dark:text-stone-100">7-Day Forecast</h3>
        </div>

        {/* Forecast Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {daily.time.slice(1).map((dateStr, i) => {
            const date = new Date(dateStr)
            const dayName = i === 0 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' })
            return (
              <div 
                key={dateStr} 
                className="bg-white dark:bg-dashboard-surface border border-stone-100 dark:border-dashboard-border rounded-2xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
              >
                <span className="text-sm font-semibold text-stone-500 dark:text-stone-400 mb-3">{dayName}</span>
                <div className="w-12 h-12 mb-3">
                  {getWeatherIcon(daily.weather_code[i+1], 1)}
                </div>
                <div className="flex items-center gap-2 mb-2 w-full justify-center">
                  <span className="font-bold text-stone-800 dark:text-stone-200">{Math.round(daily.temperature_2m_max[i+1])}°</span>
                  <span className="text-stone-400 dark:text-stone-500 text-sm">{Math.round(daily.temperature_2m_min[i+1])}°</span>
                </div>
                {daily.precipitation_probability_max[i+1] > 20 && (
                  <div className="flex items-center gap-1 text-xs font-medium text-sky-500 bg-sky-50 dark:bg-sky-500/10 px-2 py-1 rounded-md">
                    <Droplets className="w-3 h-3" />
                    {daily.precipitation_probability_max[i+1]}%
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
