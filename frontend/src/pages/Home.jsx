/**
 * AgroConnect - Home Page
 */
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const STATS = [
  { label: 'Farmers',   value: '12,000+', icon: '👨‍🌾' },
  { label: 'Products',  value: '45,000+', icon: '🌾' },
  { label: 'Buyers',    value: '8,500+',  icon: '🛒' },
  { label: 'States',    value: '28',      icon: '📍' },
]

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI Crop Advisor',
    desc: 'Get personalized crop recommendations based on your soil composition, rainfall, and temperature data.',
    color: 'from-forest-50 to-green-50 dark:from-forest-900/40 dark:to-green-900/40',
    badge: 'AI Powered',
  },
  {
    icon: '📊',
    title: 'Price Intelligence',
    desc: 'Predict fair market prices before you sell or buy. Make data-driven decisions every time.',
    color: 'from-sky-50 to-blue-50 dark:from-sky-900/40 dark:to-blue-900/40',
    badge: 'ML Model',
  },
  {
    icon: '🛡️',
    title: 'Verified Network',
    desc: 'Every farmer and buyer is verified. Trade with confidence on a trusted platform.',
    color: 'from-earth-50 to-amber-50 dark:from-amber-900/40 dark:to-stone-800/40',
    badge: 'Trusted',
  },
  {
    icon: '⚡',
    title: 'Direct Trade',
    desc: 'Cut out the middlemen. Farmers earn more, buyers pay less. Everyone wins.',
    color: 'from-rose-50 to-pink-50 dark:from-rose-900/40 dark:to-pink-900/40',
    badge: 'Fair Trade',
  },
]

const CROPS = ['🌾 Rice', '🌽 Maize', '🥭 Mango', '🍅 Tomato', '🥔 Potato', '🧅 Onion', '🫘 Soybean', '☕ Coffee']

export default function Home() {
  const { isAuth, user } = useAuth()

  return (
    <div className="page-enter">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 md:py-28 px-4">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-forest-100 dark:bg-forest-900/30 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-earth-200 dark:bg-earth-900/30 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/3" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-forest-50 dark:bg-forest-900/40 border border-forest-200 dark:border-forest-700/50 text-forest-700 dark:text-forest-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-forest-500 rounded-full animate-pulse" />
            Smart Agriculture for Modern India
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-stone-800 dark:text-stone-100 leading-tight mb-6">
            From{' '}
            <span className="text-forest-600 dark:text-forest-400 relative">
              Farm
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" preserveAspectRatio="none">
                <path d="M0,5 Q50,0 100,5 Q150,10 200,5" stroke="#2d9b5a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              </svg>
            </span>
            {' '}to{' '}
            <span className="text-earth-600 dark:text-earth-400">Market</span>,<br />Powered by AI
          </h1>

          <p className="text-stone-500 dark:text-stone-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            AgroConnect bridges farmers and buyers across India. Get AI-powered crop
            recommendations, fair price predictions, and a trusted marketplace — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isAuth ? (
              user?.role === 'FARMER' ? (
                <Link to="/dashboard" className="btn-primary text-base px-8 py-3">
                  Go to Dashboard →
                </Link>
              ) : (
                <Link to="/marketplace" className="btn-primary text-base px-8 py-3">
                  Browse Marketplace →
                </Link>
              )
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base px-8 py-3">
                  Start for Free →
                </Link>
                <Link to="/marketplace" className="btn-secondary text-base px-8 py-3">
                  Browse Products
                </Link>
              </>
            )}
          </div>

          {/* Crop tags */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {CROPS.map((c) => (
              <span key={c} className="px-3 py-1.5 bg-white dark:bg-stone-800 border border-earth-200 dark:border-stone-700 rounded-full text-sm text-stone-600 dark:text-stone-300 shadow-sm">
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="py-12 border-y border-earth-100 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="font-display text-3xl font-bold text-stone-800 dark:text-stone-100">{s.value}</div>
              <div className="text-stone-500 dark:text-stone-400 text-sm mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Everything you need to grow</h2>
            <p className="text-stone-500 dark:text-stone-400 mt-3 max-w-xl mx-auto">
              Cutting-edge tools designed for India's agriculture ecosystem.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className={`rounded-2xl bg-gradient-to-br ${f.color} p-5 border border-earth-100 dark:border-stone-700/50`}>
                <div className="text-4xl mb-3">{f.icon}</div>
                <span className="badge bg-white dark:bg-stone-800 text-forest-700 dark:text-forest-400 border border-forest-200 dark:border-forest-700 text-xs mb-2">
                  {f.badge}
                </span>
                <h3 className="font-display font-bold text-stone-800 dark:text-stone-100 mt-2 text-lg">{f.title}</h3>
                <p className="text-stone-500 dark:text-stone-400 text-sm mt-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 mb-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-forest-600 to-forest-800 rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-grain" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4 relative">
            Ready to transform your farm?
          </h2>
          <p className="text-forest-100 text-lg mb-8 relative max-w-xl mx-auto">
            Join thousands of farmers already earning more and buyers saving more on every purchase.
          </p>
          {!isAuth && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center relative">
              <Link to="/register?role=FARMER" className="bg-white text-forest-700 hover:bg-earth-50 font-semibold px-8 py-3 rounded-xl transition-colors">
                Join as Farmer
              </Link>
              <Link to="/register?role=BUYER" className="bg-forest-500 hover:bg-forest-400 text-white font-semibold px-8 py-3 rounded-xl transition-colors border border-forest-400">
                Join as Buyer
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-earth-100 dark:border-stone-800 py-8 text-center text-stone-400 dark:text-stone-500 text-sm">
        <span>🌱 AgroConnect © 2024 · Connecting India's farms to markets</span>
      </footer>
    </div>
  )
}
