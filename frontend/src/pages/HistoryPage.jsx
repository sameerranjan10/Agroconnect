import { useState, useEffect, useCallback } from 'react'
import { History, Sprout, Bug, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import predictionService from '../services/predictionService'
import toast from 'react-hot-toast'

const SEVERITY_BADGE = {
  none:     'badge-healthy',
  mild:     'badge-mild',
  moderate: 'badge-moderate',
  severe:   'badge-severe',
}

function PredictionCard({ pred }) {
  const isCrop    = pred.prediction_type === 'crop'
  const isHealthy = pred.result?.is_healthy
  const severity  = pred.result?.severity

  return (
    <div className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      {/* Icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5
        ${isCrop ? 'bg-green-100' : 'bg-orange-100'}`}>
        {isCrop
          ? <Sprout className="w-5 h-5 text-green-700" />
          : <Bug    className="w-5 h-5 text-orange-700" />
        }
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-gray-900 capitalize">{pred.top_result}</p>
          {!isCrop && severity && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_BADGE[severity] || ''}`}>
              {severity}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 mt-0.5">
          {isCrop
            ? `Soil: N${pred.input_data?.nitrogen} P${pred.input_data?.phosphorus} K${pred.input_data?.potassium} · pH ${pred.input_data?.ph}`
            : pred.image_filename || 'Leaf image'
          }
        </p>

        {/* Confidence bar */}
        <div className="flex items-center gap-2 mt-2">
          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${isCrop ? 'bg-agro-500' : isHealthy ? 'bg-green-500' : 'bg-orange-500'}`}
              style={{ width: `${Math.round(pred.confidence * 100)}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">{Math.round(pred.confidence * 100)}% confidence</span>
        </div>
      </div>

      {/* Date + type */}
      <div className="text-right shrink-0">
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium
          ${isCrop ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
          {isCrop ? 'Crop AI' : 'Disease AI'}
        </span>
        <p className="text-xs text-gray-400 mt-1.5">
          {new Date(pred.created_at).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
          })}
        </p>
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const [predictions, setPredictions] = useState([])
  const [pagination, setPagination]   = useState({ total: 0, page: 1, pages: 1 })
  const [filter, setFilter]           = useState('all')    // 'all' | 'crop' | 'disease'
  const [loading, setLoading]         = useState(true)
  const [page, setPage]               = useState(1)
  const PER_PAGE = 10

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const data = await predictionService.getHistory({
        type: filter === 'all' ? null : filter,
        page,
        perPage: PER_PAGE,
      })
      setPredictions(data.data)
      setPagination(data.pagination)
    } catch {
      toast.error('Failed to load prediction history.')
    } finally {
      setLoading(false)
    }
  }, [filter, page])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const handleFilterChange = (f) => {
    setFilter(f)
    setPage(1)
  }

  const FILTER_OPTIONS = [
    { key: 'all',     label: 'All Predictions' },
    { key: 'crop',    label: '🌾 Crop AI' },
    { key: 'disease', label: '🔬 Disease AI' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <History className="w-7 h-7 text-agro-600" /> Prediction History
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {pagination.total} total prediction{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          {FILTER_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${filter === key
                  ? 'bg-agro-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-4 border-agro-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : predictions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-300 gap-2">
            <History className="w-12 h-12 opacity-30" />
            <p className="text-sm text-gray-400">No predictions found</p>
          </div>
        ) : (
          predictions.map((pred) => <PredictionCard key={pred.id} pred={pred} />)
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-1 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
              disabled={page === pagination.pages}
              className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-1 disabled:opacity-40"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
