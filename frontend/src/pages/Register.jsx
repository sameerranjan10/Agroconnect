/**
 * AgroConnect - Register Page
 */
import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
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
      navigate(user.role === 'FARMER' ? '/dashboard' : '/marketplace')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 page-enter">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <span className="text-5xl">🌱</span>
          <h1 className="font-display text-3xl font-bold text-stone-800 dark:text-stone-100 mt-3">Create your account</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2">Join the smart agriculture revolution</p>
        </div>

        <div className="card p-8">
          {/* Role toggle */}
          <div className="mb-6">
            <label className="label">I am a…</label>
            <div className="grid grid-cols-2 gap-3">
              {['FARMER', 'BUYER'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role }))}
                  className={`py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                    form.role === role
                      ? role === 'FARMER'
                        ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400'
                        : 'border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400'
                      : 'border-earth-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:border-earth-300 dark:hover:border-stone-600'
                  }`}
                >
                  {role === 'FARMER' ? '👨‍🌾 Farmer' : '🛒 Buyer'}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  className="input"
                  placeholder="Ramesh Kumar"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  className="input"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="label">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  className="input"
                  placeholder="Min. 6 characters"
                  required
                />
              </div>

              <div>
                <label className="label">Phone (optional)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  className="input"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="label">Location (optional)</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={set('location')}
                  className="input"
                  placeholder="Maharashtra"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-stone-500 dark:text-stone-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-forest-600 dark:text-forest-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
