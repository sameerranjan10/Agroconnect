import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import predictionService from '../services/predictionService'
import { Sprout, Bug, History, TrendingUp, ChevronRight, Leaf } from 'lucide-react'

const QUICK_ACTIONS = [
  {
    to: '/predict-crop',
    icon: Sprout,
    title: 'Crop Recommendation',
    desc: 'Get AI-powered crop suggestions based on your soil data',
    color: 'bg-green-50 text-green-700 border-green-200',
    iconBg: 'bg-green-100',
  },
  {
    to: '/disease-detection',
    icon: Bug,
    title: 'Disease Detection',
    desc: 'Upload a leaf photo to detect plant diseases instantly',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    iconBg: 'bg-orange-100',
  },
  {
    to: '/history',
    icon: History,
    title: 'Prediction History',
    desc: 'Review all your past AI predictions and insights',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100',
  },
]

function StatCard({ label, value, sub }) {
  return (
    <div className="card flex flex-col gap-1">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ total: 0, crops: 0, diseases: 0 })
  const [recentPredictions, setRecentPredictions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allData, cropData, diseaseData] = await Promise.all([
          predictionService.getHistory({ perPage: 5 }),
          predictionService.getHistory({ type: 'crop', perPage: 1 }),
          predictionService.getHistory({ type: 'disease', perPage: 1 }),
        ])
        setStats({
          total:    allData.pagination.total,
          crops:    cropData.pagination.total,
          diseases: diseaseData.pagination.total,
        })
        setRecentPredictions(allData.data)
      } catch {
        // silently fail — user may have 0 predictions
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Hero greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {user?.location ? `Farming in ${user.location}` : 'Welcome to AgroConnect'}
          {user?.farm_size_acres ? ` · ${user.farm_size_acres} acres` : ''}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Predictions"  value={stats.total}    sub="all time" />
        <StatCard label="Crop Recommendations" value={stats.crops}  sub="AI suggestions" />
        <StatCard label="Disease Scans"       value={stats.diseases} sub="leaf images analysed" />
      </div>

      {/* Quick actions */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-agro-600" /> Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {QUICK_ACTIONS.map(({ to, icon: Icon, title, desc, color, iconBg }) => (
          <Link
            key={to}
            to={to}
            className={`card border hover:shadow-md transition-shadow flex items-start gap-4 ${color}`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs mt-0.5 opacity-80 leading-relaxed">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 opacity-60" />
          </Link>
        ))}
      </div>

      {/* Recent predictions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Leaf className="w-5 h-5 text-agro-600" /> Recent Predictions
        </h2>
        <Link to="/history" className="text-sm text-agro-700 font-medium hover:underline">
          View all
        </Link>
      </div>

      {loading ? (
        <div className="card flex items-center justify-center h-32">
          <div className="w-6 h-6 border-4 border-agro-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : recentPredictions.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <Leaf className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No predictions yet</p>
          <p className="text-sm mt-1">Use Crop AI or Disease AI above to get started</p>
        </div>
      ) : (
        <div className="card divide-y divide-gray-100 p-0 overflow-hidden">
          {recentPredictions.map((pred) => (
            <Link
              key={pred.id}
              to={`/history`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold
                ${pred.prediction_type === 'crop' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {pred.prediction_type === 'crop' ? '🌾' : '🔬'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm capitalize">{pred.top_result}</p>
                <p className="text-xs text-gray-400">{pred.prediction_type} · {Math.round(pred.confidence * 100)}% confidence</p>
              </div>
              <p className="text-xs text-gray-400 shrink-0">
                {new Date(pred.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
