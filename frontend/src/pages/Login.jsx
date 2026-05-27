/**
 * AgroConnect - Login Page
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import Logo from '../components/Logo'
import { GoogleLogin } from '@react-oauth/google'

export default function Login() {
  const { login, loginWithGoogle } = useAuth()
  const navigate  = useNavigate()
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}! 🌱`)
      navigate(user.role === 'FARMER' ? '/farmer/dashboard' : '/buyer/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-[90vh] flex items-center justify-center px-4 py-16 page-enter relative bg-cover bg-center"
      style={{ backgroundImage: "url('/login_bg.jpg')" }}
    >
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-stone-900/60 dark:bg-stone-950/80 backdrop-blur-sm" />

      <div className="w-full max-w-md relative z-10">

        <div className="text-center mb-8">
          <Logo className="h-20 w-auto mx-auto drop-shadow-md" />
          <h1 className="font-display text-3xl font-bold text-white drop-shadow-md mt-3">Welcome back</h1>
          <p className="text-stone-200 drop-shadow-sm mt-2">Sign in to your AgroConnect account</p>
        </div>

        <div className="rounded-2xl p-6 sm:p-8 bg-white/10 dark:bg-stone-950/40 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label text-white/95 dark:text-stone-200 font-semibold drop-shadow-sm">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                className="input bg-white/90 focus:bg-white dark:bg-stone-900/80 dark:focus:bg-stone-900"
                placeholder="farmer@example.com"
                required
              />
            </div>

            <div>
              <label className="label text-white/95 dark:text-stone-200 font-semibold drop-shadow-sm">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                className="input bg-white/90 focus:bg-white dark:bg-stone-900/80 dark:focus:bg-stone-900"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In'}
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
                  const user = await loginWithGoogle(credentialResponse.credential, 'BUYER')
                  toast.success(`Welcome back, ${user.name}! 🌱`)
                  navigate(user.role === 'FARMER' ? '/farmer/dashboard' : '/buyer/dashboard')
                } catch (err) {
                  toast.error('Google login failed')
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
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
