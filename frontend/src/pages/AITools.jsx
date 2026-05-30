/**
 * AgroConnect - AI Tools Page
 * Crop Recommendation + Price Prediction interfaces
 */
import { useState } from 'react'
import { aiAPI } from '../services/api'
import toast from 'react-hot-toast'

const SEASONS  = ['Kharif', 'Rabi', 'Zaid']
const QUALITIES = ['Low', 'Medium', 'High']
const LOCATIONS = [
  'Maharashtra','Punjab','Uttar Pradesh','Andhra Pradesh','Karnataka',
  'Tamil Nadu','West Bengal','Rajasthan','Gujarat','Madhya Pradesh',
  'Bihar','Telangana','Haryana','Odisha','Kerala','Other',
]
const CROPS = [
  'rice','wheat','maize','sugarcane','cotton','soybean','groundnut',
  'chickpea','lentil','mango','banana','tomato','onion','potato','coffee',
]

const TREND_ICONS = { Rising: '📈', Falling: '📉', Stable: '📊' }
const TREND_COLORS = {
  Rising:  'text-forest-600 bg-forest-50 border-forest-200 dark:bg-forest-900/30 dark:border-forest-700/50 dark:text-forest-400',
  Falling: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700/50 dark:text-red-400',
  Stable:  'text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-900/30 dark:border-sky-700/50 dark:text-sky-400',
}

function ConfidenceMeter({ value }) {
  const pct = Math.round(value * 100)
  const color = pct > 80 ? 'bg-forest-500' : pct > 60 ? 'bg-amber-500' : 'bg-red-400'
  return (
    <div className="mt-1">
      <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
        <span>Confidence</span><span>{pct}%</span>
      </div>
      <div className="h-2 bg-earth-100 dark:bg-stone-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function AITools() {
  const [activeTool, setActiveTool] = useState('crop')   // crop | price

  // ── Crop state ────────────────────────────────────────────────────────
  const [cropForm, setCropForm] = useState({
    nitrogen: 60, phosphorus: 40, potassium: 40,
    temperature: 25, humidity: 65, ph: 6.5, rainfall: 120,
  })
  const [cropResult,  setCropResult]  = useState(null)
  const [cropLoading, setCropLoading] = useState(false)

  // ── Price state ───────────────────────────────────────────────────────
  const [priceForm, setPriceForm] = useState({
    crop_type: 'rice', location: 'Maharashtra',
    quantity: 100, season: 'Kharif', quality: 'Medium',
  })
  const [priceResult,  setPriceResult]  = useState(null)
  const [priceLoading, setPriceLoading] = useState(false)

  const setCrop  = (k) => (e) => setCropForm(f  => ({ ...f, [k]: e.target.value }))
  const setPrice = (k) => (e) => setPriceForm(f => ({ ...f, [k]: e.target.value }))

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
      toast.error(err.response?.data?.detail || 'AI service unavailable. Ensure models are trained.')
    } finally { setCropLoading(false) }
  }

  const handlePriceSubmit = async (e) => {
    e.preventDefault()
    setPriceLoading(true)
    setPriceResult(null)
    try {
      const { data } = await aiAPI.predictPrice({
        ...priceForm, quantity: parseFloat(priceForm.quantity),
      })
      setPriceResult(data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'AI service unavailable. Ensure models are trained.')
    } finally { setPriceLoading(false) }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 page-enter">

      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-5xl">🤖</span>
        <h1 className="font-display text-3xl font-bold text-stone-800 dark:text-stone-100 mt-3">AI Farming Tools</h1>
        <p className="text-stone-500 dark:text-stone-400 mt-2 max-w-lg mx-auto">
          Leverage machine learning to make smarter decisions — from crop selection to fair pricing.
        </p>
      </div>

      {/* Tool Switcher */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-10">
        {[
          { key: 'crop',  icon: '🌱', label: 'Crop Advisor',       desc: 'What should I grow?' },
          { key: 'price', icon: '💰', label: 'Price Predictor',    desc: 'What price should I expect?' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTool(t.key)}
            className={`w-full max-w-md sm:max-w-xs rounded-2xl border-2 p-4 text-left transition-all ${
              activeTool === t.key
                ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/30'
                : 'border-earth-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-forest-300 dark:hover:border-forest-500'
            }`}
          >
            <div className="text-3xl mb-2">{t.icon}</div>
            <div className={`font-semibold ${activeTool === t.key ? 'text-forest-700 dark:text-forest-400' : 'text-stone-700 dark:text-stone-300'}`}>
              {t.label}
            </div>
            <div className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{t.desc}</div>
          </button>
        ))}
      </div>

      {/* ── Crop Recommendation ──────────────────────────────────────────── */}
      {activeTool === 'crop' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold text-stone-800 dark:text-stone-100 mb-1">Soil & Weather Data</h2>
            <p className="text-stone-400 dark:text-stone-500 text-sm mb-5">Enter your field conditions for a personalised recommendation.</p>

            <form onSubmit={handleCropSubmit} className="space-y-4">
              {/* Soil NPK */}
              <div>
                <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">Soil Nutrients (kg/ha)</p>
                <div className="grid grid-cols-3 gap-3">
                  {[['nitrogen','N'],['phosphorus','P'],['potassium','K']].map(([k,label]) => (
                    <div key={k}>
                      <label className="label text-xs">{label}</label>
                      <input type="number" step="1" min="0" max="200"
                        value={cropForm[k]} onChange={setCrop(k)} className="input text-sm py-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Climate */}
              <div>
                <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">Climate Conditions</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">Temperature (°C)</label>
                    <input type="number" step="0.1" min="-10" max="55"
                      value={cropForm.temperature} onChange={setCrop('temperature')} className="input text-sm py-2" />
                  </div>
                  <div>
                    <label className="label text-xs">Humidity (%)</label>
                    <input type="number" step="1" min="0" max="100"
                      value={cropForm.humidity} onChange={setCrop('humidity')} className="input text-sm py-2" />
                  </div>
                  <div>
                    <label className="label text-xs">Soil pH</label>
                    <input type="number" step="0.1" min="0" max="14"
                      value={cropForm.ph} onChange={setCrop('ph')} className="input text-sm py-2" />
                  </div>
                  <div>
                    <label className="label text-xs">Rainfall (mm/yr)</label>
                    <input type="number" step="1" min="0" max="3000"
                      value={cropForm.rainfall} onChange={setCrop('rainfall')} className="input text-sm py-2" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={cropLoading} className="w-full btn-primary py-3">
                {cropLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    Analysing…
                  </span>
                ) : '🌱 Get Recommendation'}
              </button>
            </form>
          </div>

          {/* Result */}
          <div>
            {!cropResult && !cropLoading && (
              <div className="card p-5 sm:p-8 h-full flex flex-col items-center justify-center text-center">
                <span className="text-6xl mb-4 opacity-30">🌱</span>
                <p className="text-stone-400 dark:text-stone-500">Fill in your soil and weather data, then click <strong>Get Recommendation</strong>.</p>
              </div>
            )}
            {cropLoading && (
              <div className="card p-5 sm:p-8 h-full flex flex-col items-center justify-center gap-4">
                <div className="text-5xl animate-pulse-slow">🤖</div>
                <p className="text-stone-500 dark:text-stone-400">AI is analysing your field conditions…</p>
              </div>
            )}
            {cropResult && (
              <div className="card p-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center text-2xl">🌾</div>
                  <div>
                    <p className="text-xs text-stone-400 dark:text-stone-500 font-medium uppercase tracking-wide">Recommended Crop</p>
                    <h3 className="font-display text-2xl font-bold text-forest-700 dark:text-forest-400 capitalize">
                      {cropResult.recommended_crop}
                    </h3>
                  </div>
                </div>

                <ConfidenceMeter value={cropResult.confidence} />

                <div className="mt-5 p-4 bg-forest-50 dark:bg-forest-900/20 rounded-xl border border-forest-100 dark:border-forest-700/50">
                  <p className="text-xs font-semibold text-forest-700 dark:text-forest-400 uppercase tracking-wide mb-1">Farming Tip</p>
                  <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">{cropResult.tips}</p>
                </div>

                {cropResult.alternatives?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">Alternatives</p>
                    <div className="flex gap-2 flex-wrap">
                      {cropResult.alternatives.map(a => (
                        <span key={a} className="badge bg-earth-100 text-earth-700 dark:bg-stone-800 dark:text-stone-300 capitalize">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Price Prediction ─────────────────────────────────────────────── */}
      {activeTool === 'price' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold text-stone-800 dark:text-stone-100 mb-1">Market Parameters</h2>
            <p className="text-stone-400 dark:text-stone-500 text-sm mb-5">Provide crop details to estimate a fair market price.</p>

            <form onSubmit={handlePriceSubmit} className="space-y-4">
              <div>
                <label className="label">Crop Type</label>
                <select value={priceForm.crop_type} onChange={setPrice('crop_type')} className="input capitalize">
                  {CROPS.map(c => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Market Location</label>
                <select value={priceForm.location} onChange={setPrice('location')} className="input">
                  {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Quantity (kg)</label>
                  <input type="number" step="1" min="1"
                    value={priceForm.quantity} onChange={setPrice('quantity')} className="input" />
                </div>
                <div>
                  <label className="label">Season</label>
                  <select value={priceForm.season} onChange={setPrice('season')} className="input">
                    {SEASONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Quality Grade</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {QUALITIES.map(q => (
                    <button
                      key={q} type="button"
                      onClick={() => setPriceForm(f => ({ ...f, quality: q }))}
                      className={`py-2 rounded-xl border text-sm font-medium transition-all ${
                        priceForm.quality === q
                          ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400'
                          : 'border-earth-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:border-forest-300 dark:hover:border-forest-500'
                      }`}
                    >
                      {q === 'Low' ? '⭐' : q === 'Medium' ? '⭐⭐' : '⭐⭐⭐'} {q}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={priceLoading} className="w-full btn-primary py-3">
                {priceLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    Predicting…
                  </span>
                ) : '💰 Predict Price'}
              </button>
            </form>
          </div>

          {/* Result */}
          <div>
            {!priceResult && !priceLoading && (
              <div className="card p-5 sm:p-8 h-full flex flex-col items-center justify-center text-center">
                <span className="text-6xl mb-4 opacity-30">💰</span>
                <p className="text-stone-400 dark:text-stone-500">Configure the parameters and click <strong>Predict Price</strong> to get a market estimate.</p>
              </div>
            )}
            {priceLoading && (
              <div className="card p-5 sm:p-8 h-full flex flex-col items-center justify-center gap-4">
                <div className="text-5xl animate-pulse-slow">🤖</div>
                <p className="text-stone-500 dark:text-stone-400">Analysing market data…</p>
              </div>
            )}
            {priceResult && (
              <div className="card p-6 animate-slide-up space-y-5">
                <div>
                  <p className="text-xs text-stone-400 dark:text-stone-500 font-medium uppercase tracking-wide">Predicted Price</p>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="font-display text-4xl font-bold text-forest-700 dark:text-forest-400">
                      ₹{priceResult.predicted_price}
                    </span>
                    <span className="text-stone-400 dark:text-stone-500 pb-1">/kg</span>
                  </div>
                </div>

                {/* Range bar */}
                <div className="bg-earth-50 dark:bg-stone-900/50 rounded-xl p-4 border border-earth-100 dark:border-stone-700/50">
                  <div className="flex justify-between text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">
                    <span>Min: ₹{priceResult.min_price}</span>
                    <span>Max: ₹{priceResult.max_price}</span>
                  </div>
                  <div className="relative h-3 bg-earth-200 dark:bg-stone-800 rounded-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-forest-500 rounded-full" />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-forest-600 rounded-full shadow"
                      style={{
                        left: `${((priceResult.predicted_price - priceResult.min_price) /
                                  (priceResult.max_price  - priceResult.min_price)) * 100}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  </div>
                  <p className="text-xs text-stone-400 dark:text-stone-500 text-center mt-2">Price range per kg</p>
                </div>

                <ConfidenceMeter value={priceResult.confidence} />

                {/* Trend badge */}
                <div className={`flex items-center gap-3 rounded-xl border p-3 ${TREND_COLORS[priceResult.market_trend]}`}>
                  <span className="text-2xl">{TREND_ICONS[priceResult.market_trend]}</span>
                  <div>
                    <p className="font-semibold text-sm">Market Trend: {priceResult.market_trend}</p>
                    <p className="text-xs opacity-80">{priceResult.recommendation}</p>
                  </div>
                </div>

                {/* Total for quantity */}
                <div className="bg-stone-50 dark:bg-stone-900/30 rounded-xl p-3 border border-stone-100 dark:border-stone-700 flex justify-between items-center">
                  <span className="text-sm text-stone-500 dark:text-stone-400">Est. for {priceForm.quantity} kg</span>
                  <span className="font-bold text-stone-800 dark:text-stone-100">
                    ₹{(priceResult.predicted_price * parseFloat(priceForm.quantity)).toFixed(0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info cards */}
      <div className="mt-12 grid md:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-gradient-to-br from-forest-50 to-green-50 dark:from-forest-900/30 dark:to-green-900/30 border border-forest-100 dark:border-forest-700/30 p-5">
          <h3 className="font-semibold text-forest-800 dark:text-forest-300 mb-2">🔬 How Crop AI Works</h3>
          <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
            A Random Forest classifier trained on soil (N, P, K, pH) and climate (temperature, humidity, rainfall)
            data recommends the most suitable crop with confidence scores. Accuracy: ~98%.
          </p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 border border-sky-100 dark:border-sky-700/30 p-5">
          <h3 className="font-semibold text-sky-800 dark:text-sky-300 mb-2">📈 How Price AI Works</h3>
          <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
            A Gradient Boosting regressor predicts market prices based on crop type, location,
            season, quality grade, and quantity. Prices reflect real Indian wholesale market patterns.
          </p>
        </div>
      </div>
    </div>
  )
}
