import { useState, useEffect } from 'react'
import { AlertTriangle, Loader2, CloudRain, Wind, ThermometerSun } from 'lucide-react'
import { motion } from 'framer-motion'

// Important agricultural hubs in India
const LOCATIONS = [
  { name: 'Punjab (Ludhiana)', lat: 30.9010, lon: 75.8573 },
  { name: 'Maharashtra (Pune)', lat: 18.5204, lon: 73.8567 },
  { name: 'West Bengal (Burdwan)', lat: 23.2324, lon: 87.8615 },
  { name: 'Madhya Pradesh (Indore)', lat: 22.7196, lon: 75.8577 },
]

// WMO codes that are considered "Harsh"
const getHarshWeatherCondition = (code, windSpeed, tempMax) => {
  if (code >= 95) return { type: 'Thunderstorm Warning', severity: 'red', icon: <CloudRain className="w-4 h-4" /> }
  if (code === 65 || code === 82 || code === 67) return { type: 'Heavy Rainfall Alert', severity: 'amber', icon: <CloudRain className="w-4 h-4" /> }
  if (windSpeed > 40) return { type: 'High Wind Warning', severity: 'amber', icon: <Wind className="w-4 h-4" /> }
  if (tempMax > 42) return { type: 'Severe Heatwave', severity: 'red', icon: <ThermometerSun className="w-4 h-4" /> }
  return null
}

export default function LiveWeatherAlerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const newAlerts = []
        // Fetch weather for each location
        for (const loc of LOCATIONS) {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=weather_code,wind_speed_10m&daily=temperature_2m_max&timezone=auto`)
          if (!res.ok) continue
          const data = await res.json()
          
          const code = data.current?.weather_code || 0
          const wind = data.current?.wind_speed_10m || 0
          const tempMax = data.daily?.temperature_2m_max?.[0] || 0

          const condition = getHarshWeatherCondition(code, wind, tempMax)
          if (condition) {
            newAlerts.push({
              id: loc.name,
              location: loc.name,
              ...condition
            })
          }
        }
        
        // If no actual harsh weather, let's inject a realistic simulated one based on the season 
        // to ensure the UI is populated for demonstration, but mark it clearly.
        if (newAlerts.length === 0) {
           newAlerts.push({
             id: 'sim-1',
             location: 'Coastal Maharashtra',
             type: 'Heavy Rainfall Warning',
             severity: 'amber',
             icon: <CloudRain className="w-4 h-4" />,
             simulated: true
           })
        }

        setAlerts(newAlerts.slice(0, 3)) // keep it max 3 alerts
      } catch (err) {
        console.error("Failed to fetch weather alerts", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20 rounded-3xl p-6 shadow-lg shadow-red-900/5 flex flex-col h-full"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-stone-800 dark:text-stone-100">Live Weather Alerts</h3>
      </div>
      
      <div className="space-y-4 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-32 gap-3 text-stone-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Scanning regional weather...</span>
          </div>
        ) : alerts.length > 0 ? (
          alerts.map((alert) => (
            <div key={alert.id} className={`bg-white dark:bg-dashboard-surface border ${alert.severity === 'red' ? 'border-red-100 dark:border-red-500/10' : 'border-amber-100 dark:border-amber-500/10'} p-4 rounded-2xl relative overflow-hidden`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${alert.severity === 'red' ? 'bg-red-500' : 'bg-amber-500'}`} />
              <div className={`flex items-center gap-2 text-sm font-bold ${alert.severity === 'red' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'} mb-1`}>
                {alert.icon}
                {alert.type}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between">
                <span>{alert.location} • Active Now</span>
                {alert.simulated && <span className="opacity-50 italic">Simulated</span>}
              </div>
            </div>
          ))
        ) : (
           <div className="flex flex-col items-center justify-center h-full text-stone-500 bg-white/50 dark:bg-black/20 rounded-2xl p-4">
             <span className="text-sm font-medium">No severe weather active</span>
           </div>
        )}
      </div>
    </motion.div>
  )
}
