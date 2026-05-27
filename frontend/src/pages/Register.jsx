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
      <div className="absolute inset-0 bg-stone-900/60 dark:bg-stone-950/80 backdrop-blur-sm" />

      <div className="w-full max-w-lg relative z-10">

        <div className="text-center mb-8">
          <Logo className="h-20 w-auto mx-auto drop-shadow-md" />
          <h1 className="font-display text-3xl font-bold text-white drop-shadow-md mt-3">Create your account</h1>
          <p className="text-stone-200 drop-shadow-sm mt-2">Join the smart agriculture revolution</p>
        </div>

        <div className="rounded-2xl p-6 sm:p-8 bg-white/10 dark:bg-stone-950/40 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-white/10">
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
                        ? 'border-emerald-500 bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/30'
                        : 'border-sky-500 bg-sky-500 text-white font-semibold shadow-lg shadow-sky-500/30'
                      : 'border-white/20 bg-white/5 text-stone-300 hover:bg-white/10 hover:text-white'
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
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-white/20 dark:border-white/10" />
            <span className="px-4 text-xs uppercase text-stone-300 font-semibold tracking-wider">Or continue with</span>
            <div className="flex-grow border-t border-white/20 dark:border-white/10" />
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
            />
          </div>

          <p className="text-center text-stone-200 text-sm mt-8 drop-shadow-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
