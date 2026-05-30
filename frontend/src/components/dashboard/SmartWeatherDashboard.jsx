import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, 
  Droplets, MapPin, Sun, Wind, AlertTriangle, ThermometerSun, BrainCircuit, Activity
} from 'lucide-react'
import { weatherAPI, usersAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

// OpenWeather icon mapping helper
const getWeatherIcon = (iconId, sizeClass = "w-full h-full") => {
  if (!iconId) return <Cloud className={`${sizeClass} text-stone-400`} />
  // 01d = clear, 02d = few clouds, 03d/04d = scattered/broken, 09d/10d = rain, 11d = thunderstorm, 13d = snow, 50d = mist
  const type = iconId.slice(0, 2)
  const isDay = iconId.endsWith('d')
  
  if (type === '01') return isDay ? <Sun className={`${sizeClass} text-amber-400`} /> : <Cloud className={`${sizeClass} text-slate-300`} />
  if (type === '02' || type === '03' || type === '04') return isDay ? <CloudSun className={`${sizeClass} text-amber-300`} /> : <Cloud className={`${sizeClass} text-slate-400`} />
  if (type === '09' || type === '10') return <CloudRain className={`${sizeClass} text-blue-500`} />
  if (type === '11') return <CloudLightning className={`${sizeClass} text-purple-500`} />
  if (type === '13') return <CloudSnow className={`${sizeClass} text-white`} />
  if (type === '50') return <CloudFog className={`${sizeClass} text-slate-400`} />
  return <Cloud className={`${sizeClass} text-stone-400`} />
}

export default function SmartWeatherDashboard() {
  const { user, setUser } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // Location selection state
  const [locationForm, setLocationForm] = useState({ state: '', district: '' })
  
  const fetchWeatherData = async (lat, lon) => {
    try {
      setLoading(true)
      const res = await weatherAPI.getDashboard(lat, lon)
      setData(res.data)
    } catch (err) {
      toast.error('Failed to load weather data.')
    } finally {
      setLoading(false)
    }
  }

  // Attempt to load from user profile on mount
  useEffect(() => {
    if (user?.latitude && user?.longitude) {
      fetchWeatherData(user.latitude, user.longitude)
    }
  }, [user])

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      toast.loading('Locating...', { id: 'geo' })
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          toast.success('Location found!', { id: 'geo' })
          const lat = pos.coords.latitude
          const lon = pos.coords.longitude
          try {
             const { data: updatedUser } = await usersAPI.updateProfile({ latitude: lat, longitude: lon })
             setUser(updatedUser)
          } catch(e) { } 
          fetchWeatherData(lat, lon)
        },
        (err) => toast.error('Location access denied', { id: 'geo' })
      )
    } else {
      toast.error('Geolocation not supported')
    }
  }

  const handleManualLocationSubmit = async (e) => {
    e.preventDefault()
    // Simulated coords for manual entry
    const mockLat = 22.9868
    const mockLon = 87.8550
    toast.success('Simulated location set to: ' + locationForm.district)
    fetchWeatherData(mockLat, mockLon)
  }

  // If no data and no user lat/lon, show Location Selector
  if (!data && !loading && (!user?.latitude || !user?.longitude)) {
    return (
      <div className="w-full max-w-lg mx-auto bg-white dark:bg-dashboard-card rounded-3xl p-8 border border-stone-200 dark:border-stone-800 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full mb-4">
            <MapPin className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-display mb-2 text-stone-800 dark:text-stone-100">Set Your Location</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm">We need your location to provide accurate weather intelligence and farming recommendations.</p>
        </div>

        <button 
          onClick={handleGeolocation}
          className="w-full mb-6 btn-primary py-3 flex items-center justify-center gap-2 text-lg"
        >
          <MapPin className="w-5 h-5" />
          Use Current Location
        </button>

        <div className="relative flex items-center py-5">
          <div className="flex-grow border-t border-stone-200 dark:border-stone-700"></div>
          <span className="flex-shrink-0 mx-4 text-stone-400 text-sm">OR</span>
          <div className="flex-grow border-t border-stone-200 dark:border-stone-700"></div>
        </div>

        <form onSubmit={handleManualLocationSubmit} className="space-y-4">
          <div>
            <label className="dash-label">State</label>
            <input required type="text" className="dash-input" placeholder="e.g. Maharashtra" value={locationForm.state} onChange={e => setLocationForm(f => ({...f, state: e.target.value}))} />
          </div>
          <div>
            <label className="dash-label">District</label>
            <input required type="text" className="dash-input" placeholder="e.g. Pune" value={locationForm.district} onChange={e => setLocationForm(f => ({...f, district: e.target.value}))} />
          </div>
          <button type="submit" className="w-full py-3 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl font-bold transition-colors">
            Set Location Manually
          </button>
        </form>
      </div>
    )
  }

  if (loading || !data) {
    return (
      <div className="w-full rounded-3xl bg-stone-100/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 p-8 min-h-[400px] flex items-center justify-center animate-pulse">
        <div className="flex flex-col items-center">
          <Cloud className="w-12 h-12 text-stone-300 dark:text-stone-600 mb-4" />
          <p className="text-stone-400">Loading intelligence...</p>
        </div>
      </div>
    )
  }

  const { location, temperature, humidity, wind_speed, description, icon, ai_advisory } = data
  const isDay = icon?.endsWith('d')
  
  // Theme styling based on weather and time
  let bgGradient = 'from-sky-400 to-blue-600'
  if (!isDay) bgGradient = 'from-slate-800 to-slate-950'
  else if (icon?.startsWith('01')) bgGradient = 'from-amber-400 to-orange-500' // Clear
  else if (icon?.startsWith('09') || icon?.startsWith('10')) bgGradient = 'from-slate-600 to-slate-800' // Rain

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full bg-white dark:bg-[#0a0f0d] rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col lg:flex-row relative">
        
        {/* ── Left Side: Current Conditions ─────────────────────────────── */}
        <div className={`lg:w-2/5 p-8 lg:p-10 bg-gradient-to-br ${bgGradient} text-white flex flex-col justify-between relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="relative z-10 flex justify-between items-start mb-8">
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer hover:bg-black/30 transition-colors" onClick={() => setUser(u => ({...u, latitude: null, longitude: null}))}>
              <MapPin className="w-4 h-4" />
              {location || 'Current Location'}
            </div>
            <span className="text-sm font-medium opacity-80 mt-1">Live Update</span>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center mb-10">
            <div className="w-32 h-32 mb-6 drop-shadow-2xl">
              {getWeatherIcon(icon, "w-full h-full")}
            </div>
            <h1 className="text-7xl font-display font-bold tracking-tighter mb-2">
              {Math.round(temperature)}°
            </h1>
            <p className="text-xl font-medium tracking-wide capitalize">
              {description}
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-3">
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
              <Droplets className="w-6 h-6 text-sky-300" />
              <div>
                <div className="text-xs opacity-70">Humidity</div>
                <div className="font-bold text-lg">{humidity}%</div>
              </div>
            </div>
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
              <Wind className="w-6 h-6 text-stone-300" />
              <div>
                <div className="text-xs opacity-70">Wind Speed</div>
                <div className="font-bold text-lg">{wind_speed} m/s</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Side: AI Advisory ──────────────────────────────── */}
        <div className="flex-1 p-8 lg:p-10 flex flex-col bg-stone-50 dark:bg-dashboard-card relative overflow-y-auto">
          
          {/* AI Advisory Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-display font-bold text-xl text-stone-800 dark:text-stone-100">Farming Recommendations</h3>
            </div>
            
            <div className="space-y-3">
              {ai_advisory?.map((adv, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex flex-col p-4 rounded-2xl border ${
                    adv.type === 'danger' ? 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20' : 
                    adv.type === 'warning' ? 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20' : 
                    adv.type === 'success' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20' :
                    'bg-sky-50 border-sky-200 dark:bg-sky-500/10 dark:border-sky-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-bold text-sm ${
                      adv.type === 'danger' ? 'text-red-800 dark:text-red-400' :
                      adv.type === 'warning' ? 'text-amber-800 dark:text-amber-400' :
                      adv.type === 'success' ? 'text-emerald-800 dark:text-emerald-400' :
                      'text-sky-800 dark:text-sky-400'
                    }`}>
                      {adv.title}
                    </span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300 text-sm font-medium ml-1">→ {adv.action}</p>
                </motion.div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
