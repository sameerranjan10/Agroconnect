import { useState } from 'react'
import { Sprout, Info, CheckCircle } from 'lucide-react'
import predictionService from '../services/predictionService'
import toast from 'react-hot-toast'

const FIELDS = [
  { name: 'nitrogen',    label: 'Nitrogen (N)',    unit: 'kg/ha', min: 0,   max: 140, step: 1,   tip: 'Primary nutrient for leaf growth' },
  { name: 'phosphorus',  label: 'Phosphorus (P)',  unit: 'kg/ha', min: 5,   max: 145, step: 1,   tip: 'Promotes root development' },
  { name: 'potassium',   label: 'Potassium (K)',   unit: 'kg/ha', min: 5,   max: 205, step: 1,   tip: 'Improves disease resistance' },
  { name: 'temperature', label: 'Temperature',     unit: '°C',    min: 8,   max: 44,  step: 0.1, tip: 'Average temperature of your region' },
  { name: 'humidity',    label: 'Humidity',        unit: '%',     min: 14,  max: 100, step: 0.1, tip: 'Average relative humidity' },
  { name: 'ph',          label: 'Soil pH',         unit: '',      min: 3.5, max: 9.5, step: 0.1, tip: '7 is neutral; most crops prefer 5.5–7.5' },
  { name: 'rainfall',    label: 'Annual Rainfall', unit: 'mm',    min: 20,  max: 300, step: 1,   tip: 'Total annual rainfall in your area' },
]

const INITIAL = { nitrogen: '', phosphorus: '', potassium: '', temperature: '', humidity: '', ph: '', rainfall: '' }

function ConfidenceBadge({ value }) {
  const pct = Math.round(value * 100)
  const color = pct >= 80 ? 'text-green-700 bg-green-100' : pct >= 60 ? 'text-yellow-700 bg-yellow-100' : 'text-red-700 bg-red-100'
  return <span className={`px-2.5 py-0.5 rounded-full text-sm font-semibold ${color}`}>{pct}% confidence</span>
}

export default function CropPredictionPage() {
  const [form, setForm]       = useState(INITIAL)
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [errors, setErrors]   = useState({})

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setErrors((p) => ({ ...p, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    FIELDS.forEach(({ name, min, max, label }) => {
      const v = parseFloat(form[name])
      if (form[name] === '' || isNaN(v)) errs[name] = `${label} is required`
      else if (v < min || v > max)        errs[name] = `Must be between ${min} and ${max}`
    })
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setResult(null)
    try {
      const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, parseFloat(v)]))
      const data = await predictionService.predictCrop(payload)
      setResult(data.data.ml_result)
      toast.success('Prediction complete!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Prediction failed. Is the ML service running?')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => { setForm(INITIAL); setResult(null); setErrors({}) }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sprout className="w-7 h-7 text-agro-600" /> Crop Recommendation AI
        </h1>
        <p className="text-gray-500 mt-1">Enter your soil and climate data to get personalised crop suggestions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Form */}
        <div className="lg:col-span-3 card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FIELDS.map(({ name, label, unit, min, max, step, tip }) => (
                <div key={name}>
                  <label className="label flex items-center gap-1.5">
                    {label} {unit && <span className="text-gray-400 font-normal">({unit})</span>}
                    <span className="text-gray-400 cursor-help" title={tip}>
                      <Info className="w-3.5 h-3.5" />
                    </span>
                  </label>
                  <input
                    type="number"
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={`${min}–${max}`}
                    min={min} max={max} step={step}
                    className={`input-field ${errors[name] ? 'border-red-400' : ''}`}
                  />
                  {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Analysing…' : 'Get Recommendation'}
              </button>
              <button type="button" onClick={handleReset} className="btn-secondary px-4">
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Result panel */}
        <div className="lg:col-span-2 space-y-4">
          {loading && (
            <div className="card flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
              <div className="w-8 h-8 border-4 border-agro-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">AI is thinking…</p>
            </div>
          )}

          {result && !loading && (
            <>
              {/* Top recommendation */}
              <div className="card border-2 border-agro-400 bg-agro-50">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-agro-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-agro-700 uppercase tracking-wide mb-1">
                      Recommended Crop
                    </p>
                    <h2 className="text-2xl font-bold text-gray-900 capitalize">{result.recommended_crop}</h2>
                    <div className="mt-2">
                      <ConfidenceBadge value={result.confidence} />
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-700 leading-relaxed border-t border-agro-200 pt-3">
                  {result.advice}
                </p>
              </div>

              {/* Top 5 alternatives */}
              <div className="card">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  All Suggestions
                </p>
                <div className="space-y-2">
                  {result.top_crops.map(({ crop, probability }, i) => (
                    <div key={crop} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-0.5">
                          <span className="text-sm capitalize font-medium">{crop}</span>
                          <span className="text-xs text-gray-500">{Math.round(probability * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-agro-500 rounded-full transition-all duration-500"
                            style={{ width: `${probability * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {!result && !loading && (
            <div className="card flex flex-col items-center justify-center h-48 text-gray-300">
              <Sprout className="w-12 h-12 mb-2" />
              <p className="text-sm text-gray-400">Fill in the form to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
