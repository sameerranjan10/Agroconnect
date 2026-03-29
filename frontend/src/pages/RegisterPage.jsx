import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Leaf, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const INITIAL = {
  name: '', email: '', password: '',
  phone: '', location: '', farm_size_acres: '',
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]       = useState(INITIAL)
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setErrors((p) => ({ ...p, [e.target.name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name     = 'Name is required'
    if (!form.email.trim()) e.email    = 'Email is required'
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (!/\d/.test(form.password))    e.password = 'Password must contain a number'
    return e
  }

  const handleSubmit = async (evt) => {
    evt.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const payload = { ...form }
    if (payload.farm_size_acres) payload.farm_size_acres = parseFloat(payload.farm_size_acres)
    else delete payload.farm_size_acres

    setLoading(true)
    try {
      await register(payload)
      toast.success('Account created! Welcome to AgroConnect 🌱')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.'
      const fieldErrors = err.response?.data?.errors || {}
      toast.error(msg)
      setErrors(fieldErrors)
    } finally {
      setLoading(false)
    }
  }

  const field = (name, label, type = 'text', placeholder = '') => (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type={name === 'password' && !showPwd ? 'password' : type === 'password' ? 'text' : type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`input-field ${name === 'password' ? 'pr-10' : ''} ${errors[name] ? 'border-red-400' : ''}`}
        />
        {name === 'password' && (
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-agro-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-agro-600 rounded-2xl mb-4">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1 text-sm">Join thousands of smart farmers</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {field('name',     'Full name',       'text',   'Ravi Kumar')}
            {field('email',    'Email address',   'email',  'ravi@farm.com')}
            {field('password', 'Password',        'password', 'Min 8 chars, include a number')}
            {field('phone',    'Phone (optional)','tel',    '+91 9876543210')}
            {field('location', 'Village / City (optional)', 'text', 'Punjab')}

            <div>
              <label className="label">Farm size in acres (optional)</label>
              <input
                type="number"
                name="farm_size_acres"
                value={form.farm_size_acres}
                onChange={handleChange}
                placeholder="e.g. 5"
                min="0"
                step="0.1"
                className="input-field"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-agro-700 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
