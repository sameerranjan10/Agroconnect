/**
 * AgroConnect - Home Page
 */
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Globe, Bot, ArrowRight, Brain, Newspaper, AlertTriangle, Landmark } from 'lucide-react'
import Logo from '../components/Logo'
import LiveCropForecasting from '../components/dashboard/LiveCropForecasting'
import LiveWeatherAlerts from '../components/dashboard/LiveWeatherAlerts'

const GithubIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
)

const TwitterIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
  </svg>
)

const InstagramIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
  </svg>
)

const LinkedinIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
  </svg>
)



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
      <section className="relative overflow-hidden py-12 md:py-28 px-4">
        {/* Background decorations with subtle pulse animations */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-forest-100 dark:bg-forest-900/30 rounded-full blur-[80px] -translate-y-1/3 translate-x-1/3" 
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-earth-200 dark:bg-earth-900/30 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3" 
          />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-8">
          
          {/* Left Text Content */}
          <div className="flex-1 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 bg-forest-50 dark:bg-forest-900/40 border border-forest-200 dark:border-forest-700/50 text-forest-700 dark:text-forest-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 bg-forest-500 rounded-full animate-pulse" />
              Smart Agriculture for Modern India
            </div>

            <h1 className="font-display text-4xl md:text-5xl xl:text-6xl font-bold text-stone-800 dark:text-stone-100 leading-tight mb-6">
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

            <p className="text-stone-500 dark:text-stone-400 text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              AgroConnect bridges farmers and buyers across India. Get AI-powered crop
              recommendations, fair price predictions, and a trusted marketplace — all in one platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              {isAuth ? (
                user?.role === 'FARMER' ? (
                  <Link to="/farmer/dashboard" className="btn-primary text-base px-8 py-3">
                    Go to Dashboard →
                  </Link>
                ) : (
                  <Link to="/buyer/dashboard" className="btn-primary text-base px-8 py-3">
                    Browse Marketplace →
                  </Link>
                )
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-base px-8 py-3 shadow-lg shadow-forest-500/20">
                    Start for Free →
                  </Link>
                  <Link to="/marketplace" className="btn-secondary text-base px-8 py-3">
                    Browse Products
                  </Link>
                </>
              )}
            </div>

            {/* Crop tags */}
            <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-2">
              {CROPS.map((c) => (
                <span key={c} className="px-3 py-1.5 bg-white dark:bg-stone-800 border border-earth-200 dark:border-stone-700 rounded-full text-sm text-stone-600 dark:text-stone-300 shadow-sm">
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Right Image Illustration */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none relative z-10 hidden lg:block">
            {/* Background glow for the illustration */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-200/20 to-amber-200/20 dark:from-emerald-900/20 dark:to-amber-900/20 blur-3xl rounded-full" />
            <img 
              src="/Farmers market-bro.svg" 
              alt="Farmers market illustration" 
              className="w-full h-auto relative drop-shadow-2xl animate-[fadeIn_1.5s_ease-out_forwards] opacity-0" 
            />
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-12 md:py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="section-title">Everything you need to grow</h2>
            <p className="text-stone-500 dark:text-stone-400 mt-4 max-w-xl mx-auto text-lg">
              Cutting-edge tools designed for India's agriculture ecosystem.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div 
                key={f.title} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`rounded-3xl bg-gradient-to-br ${f.color} p-5 md:p-8 border border-earth-100 dark:border-stone-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <span className="badge bg-white dark:bg-stone-800 text-forest-700 dark:text-forest-400 border border-forest-200 dark:border-forest-700 text-xs mb-3">
                  {f.badge}
                </span>
                <h3 className="font-display font-bold text-stone-800 dark:text-stone-100 mt-2 text-xl">{f.title}</h3>
                <p className="text-stone-500 dark:text-stone-400 text-sm md:text-base mt-3 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Us ─────────────────────────────────────────────────────── */}
      <section id="about" className="py-12 md:py-24 px-4 bg-white/60 dark:bg-stone-900/60 border-y border-earth-100 dark:border-stone-800 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16">
          
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="flex-1"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-6">
              About AgroConnect
            </div>
            <h2 className="section-title mb-6 text-4xl">Empowering India's Agriculture</h2>
            <p className="text-stone-500 dark:text-stone-400 text-lg leading-relaxed mb-6">
              AgroConnect was built with a single mission: to revolutionize the traditional agricultural supply chain. We empower farmers with AI-driven insights and connect them directly with verified buyers.
            </p>
            <p className="text-stone-500 dark:text-stone-400 text-lg leading-relaxed mb-8">
              By cutting out middlemen, we ensure that farmers get the true value for their hard work, and buyers get the freshest produce at fair, transparent prices.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <span className="font-bold">✓</span>
                </div>
                <span className="font-medium text-stone-800 dark:text-stone-200">Zero hidden fees or middlemen commissions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <span className="font-bold">✓</span>
                </div>
                <span className="font-medium text-stone-800 dark:text-stone-200">100% verified farmer and buyer network</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <span className="font-bold">✓</span>
                </div>
                <span className="font-medium text-stone-800 dark:text-stone-200">Real-time market price predictions via AI</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="flex-1 relative w-full hidden md:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-forest-500/20 to-amber-500/20 rounded-3xl blur-3xl -z-10" />
            <img 
              src="/Farmer-rafiki.svg" 
              alt="Farmer presentation illustration" 
              className="w-full h-auto relative drop-shadow-2xl animate-[fadeIn_1.5s_ease-out_forwards] opacity-0" 
            />
          </motion.div>

        </div>
      </section>

      {/* ── AgroConnect Intelligence ─────────────────────────────────────── */}
      <section id="intelligence" className="py-12 md:py-24 px-4 bg-stone-50 dark:bg-[#0a0f0d] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 dark:bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-6">
              Platform V2 Preview
            </div>
            <h2 className="section-title mb-4">AgroConnect Intelligence</h2>
            <p className="text-stone-500 dark:text-stone-400 text-lg max-w-2xl mx-auto">
              Real-time trends, AI forecasting, and essential updates to keep your agribusiness one step ahead.
            </p>
          </motion.div>

          {/* Bento Box Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* AI Insights (Large Card) - Now Live! */}
            <LiveCropForecasting />

            {/* Weather Alerts - Now Live! */}
            <LiveWeatherAlerts />

            {/* Latest News */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-dashboard-surface border border-earth-100 dark:border-stone-800 rounded-3xl p-6 shadow-xl shadow-earth-200/20 dark:shadow-black/20"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl">
                    <Newspaper className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-stone-800 dark:text-stone-100">Market News</h3>
                </div>
                <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">Live</span>
              </div>
              <ul className="space-y-4">
                <li className="pb-4 border-b border-stone-100 dark:border-stone-800">
                  <p className="text-sm font-semibold text-stone-700 dark:text-stone-200 hover:text-emerald-500 transition-colors cursor-pointer line-clamp-2">
                    MSP for Kharif crops increased by 5-7% for the upcoming 2024 season.
                  </p>
                  <p className="text-xs text-stone-400 mt-2">2 hours ago</p>
                </li>
                <li>
                  <p className="text-sm font-semibold text-stone-700 dark:text-stone-200 hover:text-emerald-500 transition-colors cursor-pointer line-clamp-2">
                    Export ban on non-basmati white rice lifted conditionally for 5 countries.
                  </p>
                  <p className="text-xs text-stone-400 mt-2">5 hours ago</p>
                </li>
              </ul>
            </motion.div>

            {/* Gov Schemes */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="md:col-span-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-5 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-lg shadow-emerald-900/5"
            >
              <div className="w-16 h-16 shrink-0 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                <Landmark className="w-8 h-8" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-xl text-stone-800 dark:text-stone-100 mb-2">PM-Kisan Scheme Updates</h3>
                <p className="text-stone-500 dark:text-stone-400 text-sm md:text-base leading-relaxed">
                  The 16th installment of PM-Kisan is now being processed. Ensure your e-KYC is completed before the end of the month to receive the ₹2,000 direct benefit transfer.
                </p>
              </div>
              <button className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-emerald-600/20">
                Check Eligibility
              </button>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 mb-8 relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
          className="max-w-5xl mx-auto bg-gradient-to-br from-forest-600 to-forest-800 rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-forest-900/20"
        >
          <div className="absolute inset-0 opacity-10 bg-grain" />
          
          <div className="flex flex-col md:flex-row items-center">
            {/* Left Image Illustration */}
            <div className="w-full md:w-2/5 p-8 relative flex justify-center items-center bg-white/5 backdrop-blur-sm border-r border-white/10 hidden md:flex">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-200/20 to-amber-200/20 blur-3xl rounded-full" />
              <img 
                src="/Farmer-cuate.svg" 
                alt="Farmer illustration" 
                className="w-full max-w-xs h-auto relative drop-shadow-2xl animate-[fadeIn_1.5s_ease-out_forwards] opacity-0" 
              />
            </div>

            {/* Right Text Content */}
            <div className="w-full md:w-3/5 p-10 md:p-12 text-center md:text-left relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4 relative">
                Ready to transform your farm?
              </h2>
              <p className="text-forest-100 text-lg mb-8 relative max-w-xl mx-auto md:mx-0">
                Join thousands of farmers already earning more and buyers saving more on every purchase.
              </p>
              {!isAuth && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start relative">
                  <Link to="/register?role=FARMER" className="bg-white text-forest-700 hover:bg-earth-50 font-semibold px-8 py-3 rounded-xl transition-colors shadow-lg">
                    Join as Farmer
                  </Link>
                  <Link to="/register?role=BUYER" className="bg-forest-500 hover:bg-forest-400 text-white font-semibold px-8 py-3 rounded-xl transition-colors border border-forest-400 shadow-lg">
                    Join as Buyer
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Premium Footer ───────────────────────────────────────────────── */}
      <footer className="bg-white dark:bg-stone-900 border-t border-earth-100 dark:border-stone-800 pt-12 md:pt-20 pb-8 md:pb-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Brand & Description */}
            <div className="flex flex-col gap-6">
              <Logo className="h-8 w-auto" />
              <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
                AgroConnect bridges the gap between farmers and buyers using AI-driven insights, ensuring fair trade and sustainable agriculture across India.
              </p>
              <div className="flex items-center gap-4">
                <a href="https://github.com/sameerranjan10" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center text-stone-500 hover:bg-forest-50 hover:text-forest-600 dark:hover:bg-forest-500/20 dark:hover:text-forest-400 transition-colors">
                  <GithubIcon className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/unisam_10/?__pwa=1" className="w-10 h-10 rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center text-stone-500 hover:bg-forest-50 hover:text-forest-600 dark:hover:bg-forest-500/20 dark:hover:text-forest-400 transition-colors">
                  <InstagramIcon className="w-5 h-5" />
                </a>
                <a href="https://www.linkedin.com/in/sameer-ranjan-nayak-963657328/" className="w-10 h-10 rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center text-stone-500 hover:bg-forest-50 hover:text-forest-600 dark:hover:bg-forest-500/20 dark:hover:text-forest-400 transition-colors">
                  <LinkedinIcon className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-6 uppercase tracking-wider text-sm">Quick Links</h3>
              <ul className="flex flex-col gap-4 text-stone-500 dark:text-stone-400 text-sm">
                <li><Link to="/marketplace" className="hover:text-forest-600 dark:hover:text-forest-400 transition-colors">Marketplace</Link></li>
                <li><Link to="/farmer/dashboard" className="hover:text-forest-600 dark:hover:text-forest-400 transition-colors">Farmer Dashboard</Link></li>
                <li><Link to="/buyer/dashboard" className="hover:text-forest-600 dark:hover:text-forest-400 transition-colors">Buyer Portal</Link></li>
                <li><Link to="#" className="hover:text-forest-600 dark:hover:text-forest-400 transition-colors">Pricing & Fees</Link></li>
                <li><Link to="#" className="hover:text-forest-600 dark:hover:text-forest-400 transition-colors">About Us</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-6 uppercase tracking-wider text-sm">Contact Us</h3>
              <ul className="flex flex-col gap-4 text-stone-500 dark:text-stone-400 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-forest-500" />
                  <span>009 Omnagar, Gunupur<br/>Rayagada, Odisha 765022</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 shrink-0 text-forest-500" />
                  <span>+91 1800-123-4567</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 shrink-0 text-forest-500" />
                  <span>sameerranjan499@gmail.com</span>
                </li>
              </ul>
            </div>

            {/* Newsletter & Tools */}
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-4 uppercase tracking-wider text-sm">Newsletter</h3>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-forest-500 transition-colors"
                  />
                  <button className="bg-forest-600 hover:bg-forest-700 text-white rounded-lg px-3 py-2 flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-earth-100 dark:border-stone-800 flex flex-col gap-3">
                <button className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 px-4 py-2 rounded-lg transition-colors w-fit">
                  <Bot className="w-4 h-4" />
                  Ask AI Assistant
                </button>
                <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-sm mt-1">
                  <Globe className="w-4 h-4" />
                  <select className="bg-transparent border-none focus:outline-none cursor-pointer hover:text-stone-800 dark:hover:text-stone-200 transition-colors font-medium">
                    <option value="en">English (India)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                    <option value="mr">मराठी (Marathi)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-earth-100 dark:border-stone-800 text-stone-400 dark:text-stone-500 text-sm gap-4">
            <p>AgroConnect © 2024. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="#" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">Privacy Policy</Link>
              <Link to="#" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">Terms of Service</Link>
              <Link to="#" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
