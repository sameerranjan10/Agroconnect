/**
 * AgroConnect - Login Page
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
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
      navigate(user.role === 'FARMER' ? '/dashboard' : '/marketplace')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 page-enter">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <span className="text-5xl">🌱</span>
          <h1 className="font-display text-3xl font-bold text-stone-800 dark:text-stone-100 mt-3">Welcome back</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2">Sign in to your AgroConnect account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                className="input"
                placeholder="farmer@example.com"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Quick demo accounts */}
          <div className="mt-6 p-4 bg-earth-50 dark:bg-stone-900/50 rounded-xl border border-earth-100 dark:border-stone-700">
            <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">Demo Accounts</p>
            <div className="space-y-1 text-xs text-stone-500 dark:text-stone-400">
              <p>🌾 Farmer: farmer@demo.com / demo123</p>
              <p>🛒 Buyer: buyer@demo.com / demo123</p>
            </div>
          </div>

          <p className="text-center text-stone-500 dark:text-stone-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-forest-600 dark:text-forest-400 font-medium hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
