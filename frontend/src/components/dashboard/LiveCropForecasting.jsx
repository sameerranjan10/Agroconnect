import { useState } from 'react'
import { Brain } from 'lucide-react'
import { aiAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function LiveCropForecasting() {
  const [cropForm, setCropForm] = useState({
    nitrogen: 60, phosphorus: 40, potassium: 40,
    temperature: 25, humidity: 65, ph: 6.5, rainfall: 120,
  })
  const [cropResult,  setCropResult]  = useState(null)
  const [cropLoading, setCropLoading] = useState(false)

  const setCrop  = (k) => (e) => setCropForm(f  => ({ ...f, [k]: e.target.value }))

  const handleCropSubmit = async (e) => {
    e.preventDefault()
    setCropLoading(true)
    setCropResult(null)
    try {
      const payload = Object.fromEntries(
        Object.entries(cropForm).map(([k, v]) => [k, parseFloat(v)])
      )
      const { data } = await aiAPI.recommendCrop(payload)
      setCropResult(data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'AI service unavailable.')
    } finally { setCropLoading(false) }
  }

  return (
    <div className="md:col-span-2 bg-gradient-to-br from-purple-600 to-indigo-800 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-purple-900/20 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Brain className="w-6 h-6" />
          </div>
          <h3 className="font-display text-2xl font-bold">Live AI Crop Forecasting</h3>
        </div>
        {cropResult && (
          <button onClick={() => setCropResult(null)} className="text-sm font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
            Reset
          </button>
        )}
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {!cropResult ? (
            <motion.form 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleCropSubmit} 
              className="space-y-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[['nitrogen','N'],['phosphorus','P'],['potassium','K'],['ph','pH']].map(([k,label]) => (
                  <div key={k} className="bg-white/10 p-3 rounded-xl border border-white/10">
                    <label className="block text-xs text-purple-200 mb-1 font-semibold">{label}</label>
                    <input type="number" step="0.1" value={cropForm[k]} onChange={setCrop(k)} className="w-full bg-transparent border-b border-purple-300/30 text-white font-bold focus:outline-none focus:border-white pb-1" />
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {[['temperature','Temp (°C)'],['humidity','Humidity (%)'],['rainfall','Rain (mm)']].map(([k,label]) => (
                  <div key={k} className="bg-white/10 p-3 rounded-xl border border-white/10">
                    <label className="block text-xs text-purple-200 mb-1 font-semibold">{label}</label>
                    <input type="number" step="0.1" value={cropForm[k]} onChange={setCrop(k)} className="w-full bg-transparent border-b border-purple-300/30 text-white font-bold focus:outline-none focus:border-white pb-1" />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <p className="text-sm text-purple-100 max-w-[60%] hidden md:block">
                  Input your soil and weather data above to get a personalized, real-time crop recommendation using our ML models.
                </p>
                <button type="submit" disabled={cropLoading} className="w-full md:w-auto bg-white text-purple-700 hover:bg-purple-50 px-6 py-3 rounded-xl font-bold transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
                  {cropLoading ? 'Analysing...' : 'Run Full Analysis'}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10"
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 text-center md:text-left">
                  <p className="text-purple-200 text-sm font-semibold uppercase tracking-wider mb-1">Recommended Crop</p>
                  <h4 className="font-display text-4xl font-bold text-white capitalize mb-4">
                    {cropResult.recommended_crop}
                  </h4>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {cropResult.alternatives?.slice(0, 2).map(a => (
                      <span key={a} className="bg-white/10 border border-white/20 text-xs px-3 py-1.5 rounded-full capitalize">
                        Alt: {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex-1 w-full bg-white/10 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-purple-200 text-sm">AI Confidence</span>
                    <span className="text-2xl font-bold">{Math.round(cropResult.confidence * 100)}%</span>
                  </div>
                  <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${cropResult.confidence * 100}%` }} 
                      className={`h-full rounded-full ${cropResult.confidence > 0.8 ? 'bg-emerald-400' : 'bg-amber-400'}`} 
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-purple-900/40 rounded-xl border border-purple-500/30">
                <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-1">Expert Tip</p>
                <p className="text-sm text-purple-100 leading-relaxed">{cropResult.tips}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
