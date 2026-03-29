import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import authService from '../services/authService'
import { User, MapPin, Phone, Crop, Calendar, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name:           user?.name           || '',
    phone:          user?.phone          || '',
    location:       user?.location       || '',
    farm_size_acres: user?.farm_size_acres || '',
  })

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSave = async () => {
    setLoading(true)
    try {
      const payload = { ...form }
      if (payload.farm_size_acres) payload.farm_size_acres = parseFloat(payload.farm_size_acres)
      else delete payload.farm_size_acres
      const data = await authService.updateProfile(payload)
      updateUser(data.data.user)
      toast.success('Profile updated!')
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setForm({
      name:            user?.name           || '',
      phone:           user?.phone          || '',
      location:        user?.location       || '',
      farm_size_acres: user?.farm_size_acres || '',
    })
    setEditing(false)
  }

  const infoRow = (Icon, label, value) => (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
      <span className="text-sm text-gray-500 w-32 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 font-medium">{value || '—'}</span>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="card">
        {/* Avatar + name header */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-agro-100 rounded-full flex items-center justify-center text-2xl font-bold text-agro-700">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium
              ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-agro-100 text-agro-700'}`}>
              {user?.role}
            </span>
          </div>
          {user?.is_verified && (
            <CheckCircle className="w-5 h-5 text-agro-500 ml-auto" title="Verified" />
          )}
        </div>

        {/* Read mode */}
        {!editing && (
          <>
            <div className="space-y-0">
              {infoRow(Phone,    'Phone',      user?.phone)}
              {infoRow(MapPin,   'Location',   user?.location)}
              {infoRow(Crop || User,  'Farm size', user?.farm_size_acres ? `${user.farm_size_acres} acres` : null)}
              {infoRow(Calendar, 'Member since', user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                : null
              )}
              {infoRow(User,     'Last login',  user?.last_login
                ? new Date(user.last_login).toLocaleString('en-IN')
                : null
              )}
            </div>
            <button onClick={() => setEditing(true)} className="btn-primary mt-6">
              Edit Profile
            </button>
          </>
        )}

        {/* Edit mode */}
        {editing && (
          <div className="space-y-4">
            {[
              { name: 'name',     label: 'Full name',    type: 'text',   placeholder: 'Ravi Kumar' },
              { name: 'phone',    label: 'Phone',        type: 'tel',    placeholder: '+91 9876543210' },
              { name: 'location', label: 'Village/City', type: 'text',   placeholder: 'Punjab' },
            ].map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="label">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="input-field"
                />
              </div>
            ))}

            <div>
              <label className="label">Farm size (acres)</label>
              <input
                type="number"
                name="farm_size_acres"
                value={form.farm_size_acres}
                onChange={handleChange}
                placeholder="e.g. 5"
                min="0" step="0.1"
                className="input-field"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={loading} className="btn-primary flex-1">
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
              <button onClick={handleCancel} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
