import { useState, useRef, useCallback } from 'react'
import { Bug, Upload, X, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react'
import predictionService from '../services/predictionService'
import toast from 'react-hot-toast'

const SEVERITY_STYLES = {
  none:     { bar: 'bg-green-500',  badge: 'badge-healthy',  label: 'Healthy' },
  mild:     { bar: 'bg-yellow-400', badge: 'badge-mild',     label: 'Mild'    },
  moderate: { bar: 'bg-orange-500', badge: 'badge-moderate', label: 'Moderate'},
  severe:   { bar: 'bg-red-600',    badge: 'badge-severe',   label: 'Severe'  },
}

export default function DiseaseDetectionPage() {
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)
  const inputRef = useRef(null)

  const applyFile = (f) => {
    if (!f) return
    if (!f.type.startsWith('image/')) {
      toast.error('Please upload a JPEG or PNG image.')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('Image must be smaller than 10 MB.')
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
  }

  const onFileInput = (e) => applyFile(e.target.files[0])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    applyFile(e.dataTransfer.files[0])
  }, [])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (!file) { toast.error('Please select an image first.'); return }
    setLoading(true)
    setResult(null)
    try {
      const data = await predictionService.detectDisease(file)
      setResult(data.data.ml_result)
      toast.success('Analysis complete!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Detection failed. Is the ML service running?')
    } finally {
      setLoading(false)
    }
  }

  const sev = result ? SEVERITY_STYLES[result.severity] || SEVERITY_STYLES.none : null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bug className="w-7 h-7 text-orange-600" /> Disease Detection AI
        </h1>
        <p className="text-gray-500 mt-1">
          Upload a clear photo of a plant leaf to detect diseases and get treatment advice.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Upload panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            {/* Drop zone */}
            {!preview ? (
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3
                  cursor-pointer transition-colors py-12 px-6 text-center
                  ${dragging
                    ? 'border-agro-500 bg-agro-50'
                    : 'border-gray-300 hover:border-agro-400 hover:bg-gray-50'
                  }`}
              >
                <Upload className="w-10 h-10 text-gray-300" />
                <div>
                  <p className="font-medium text-gray-600">Drop your leaf image here</p>
                  <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                  <p className="text-xs text-gray-400 mt-1">JPEG / PNG · max 10 MB</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={preview}
                  alt="Leaf preview"
                  className="w-full h-56 object-cover rounded-xl"
                />
                <button
                  onClick={clearFile}
                  className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center
                             hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="mt-3 text-sm text-gray-600 truncate">{file?.name}</div>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onFileInput}
              className="hidden"
            />

            <button
              onClick={handleSubmit}
              disabled={!file || loading}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing…</>
                : <><Bug className="w-4 h-4" /> Detect Disease</>
              }
            </button>

            {/* Tips */}
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 space-y-1">
              <p className="font-semibold mb-1">📸 Photo Tips</p>
              <p>• Use a single, clearly visible leaf</p>
              <p>• Photograph in natural daylight</p>
              <p>• Ensure the leaf fills the frame</p>
              <p>• Avoid blurry or dark images</p>
            </div>
          </div>
        </div>

        {/* Result panel */}
        <div className="lg:col-span-3">
          {loading && (
            <div className="card flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
              <Loader2 className="w-10 h-10 animate-spin text-agro-400" />
              <p className="text-sm">Scanning leaf for diseases…</p>
            </div>
          )}

          {!loading && !result && (
            <div className="card flex flex-col items-center justify-center h-64 text-gray-300">
              <Bug className="w-14 h-14 mb-2 opacity-30" />
              <p className="text-sm text-gray-400">Upload a leaf image to see analysis</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              {/* Status card */}
              <div className={`card flex items-start gap-4 border-2
                ${result.is_healthy ? 'border-green-300 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                {result.is_healthy
                  ? <ShieldCheck className="w-8 h-8 text-green-600 shrink-0 mt-0.5" />
                  : <AlertTriangle className="w-8 h-8 text-red-500 shrink-0 mt-0.5" />
                }
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-900">{result.detected_disease}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sev.badge}`}>
                      {sev.label}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${sev.bar}`}
                        style={{ width: `${Math.round(result.confidence * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-12 text-right">
                      {Math.round(result.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Model confidence</p>
                </div>
              </div>

              {/* Treatment suggestions */}
              {!result.is_healthy && (
                <div className="card">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
                    <span>💊</span> Treatment Suggestions
                  </h3>
                  <ul className="space-y-2">
                    {result.treatment_suggestions.map((t, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-orange-500 mt-0.5 shrink-0">▸</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prevention measures */}
              <div className="card">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
                  <span>🛡️</span> Preventive Measures
                </h3>
                <ul className="space-y-2">
                  {result.preventive_measures.map((m, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-agro-500 mt-0.5 shrink-0">✓</span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
