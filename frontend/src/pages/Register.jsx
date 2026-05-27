/**
 * AgroConnect - Register Page
 */
import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import Logo from '../components/Logo'
import { GoogleLogin } from '@react-oauth/google'

export default function Register() {
  const { register, loginWithGoogle } = useAuth()
  const navigate     = useNavigate()
  const [params]     = useSearchParams()

  const [form,    setForm]    = useState({
    name: '', email: '', password: '', role: params.get('role') || 'BUYER',
    phone: '', location: '',
  })
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const user = await register(form)
      toast.success(`Welcome to AgroConnect, ${user.name}! 🌱`)
      navigate(user.role === 'FARMER' ? '/farmer/dashboard' : '/buyer/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-[90vh] flex items-center justify-center px-4 py-16 page-enter relative bg-cover bg-center"
      style={{ backgroundImage: "url('/register_bg.jpg')" }}
    >
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-stone-900/50 dark:bg-stone-950/75 backdrop-blur-[3px]" />

      <div className="w-full max-w-lg relative z-10">

        <div className="text-center mb-8">
          <Logo className="h-20 w-auto mx-auto drop-shadow-md" />
          <h1 className="font-display text-3xl font-bold text-white drop-shadow-md mt-3">Create your account</h1>
          <p className="text-stone-200 dark:text-stone-300 drop-shadow-sm mt-2">Join the smart agriculture revolution</p>
        </div>

        <div className="card p-8 bg-white/10 dark:bg-stone-950/30 backdrop-blur-xl shadow-2xl border border-white/15 dark:border-white/5">
          {/* Role toggle */}
          <div className="mb-6">
            <label className="label text-white/95 dark:text-stone-200 font-semibold drop-shadow-sm">I am a…</label>
            <div className="grid grid-cols-2 gap-3">
              {['FARMER', 'BUYER'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role }))}
                  className={`py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                    form.role === role
                      ? role === 'FARMER'
                        ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400 font-semibold'
                        : 'border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 font-semibold'
                      : 'border-white/15 dark:border-white/5 bg-white/5 dark:bg-black/15 text-white/90 dark:text-stone-300 hover:bg-white/10 dark:hover:bg-black/25'
                  }`}
                >
                  {role === 'FARMER' ? '👨‍🌾 Farmer' : '🛒 Buyer'}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label text-white/95 dark:text-stone-200 font-semibold drop-shadow-sm">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  className="input bg-white/90 focus:bg-white dark:bg-stone-900/80 dark:focus:bg-stone-900"
                  placeholder="Ramesh Kumar"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label text-white/95 dark:text-stone-200 font-semibold drop-shadow-sm">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  className="input bg-white/90 focus:bg-white dark:bg-stone-900/80 dark:focus:bg-stone-900"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label text-white/95 dark:text-stone-200 font-semibold drop-shadow-sm">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  className="input bg-white/90 focus:bg-white dark:bg-stone-900/80 dark:focus:bg-stone-900"
                  placeholder="Min. 6 characters"
                  required
                />
              </div>

              <div>
                <label className="label text-white/95 dark:text-stone-200 font-semibold drop-shadow-sm">Phone (optional)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  className="input bg-white/90 focus:bg-white dark:bg-stone-900/80 dark:focus:bg-stone-900"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="label text-white/95 dark:text-stone-200 font-semibold drop-shadow-sm">Location (optional)</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={set('location')}
                  className="input bg-white/90 focus:bg-white dark:bg-stone-900/80 dark:focus:bg-stone-900"
                  placeholder="Maharashtra"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base mt-2 shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          {/* Google Sign In */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20 dark:border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-stone-900/30 px-2.5 py-0.5 rounded text-white/60 dark:text-stone-400 font-semibold tracking-wider backdrop-blur-sm">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const user = await loginWithGoogle(credentialResponse.credential, form.role)
                  toast.success(`Welcome to AgroConnect, ${user.name}! 🌱`)
                  navigate(user.role === 'FARMER' ? '/farmer/dashboard' : '/buyer/dashboard')
                } catch (err) {
                  toast.error('Google registration failed')
                }
              }}
              onError={() => {
                toast.error('Google authentication failed')
              }}
              theme="outline"
              shape="pill"
              size="large"
              width="320px"
            />
          </div>

          <p className="text-center text-white/80 dark:text-stone-300 text-sm mt-8 drop-shadow-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-300 hover:text-amber-200 dark:text-forest-400 dark:hover:text-forest-300 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
