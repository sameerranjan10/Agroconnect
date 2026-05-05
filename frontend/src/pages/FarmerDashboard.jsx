/**
 * AgroConnect - Farmer Dashboard
 */
import { useState, useEffect, useCallback } from 'react'
import { productsAPI, ordersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'

const CATEGORIES = ['Grain', 'Vegetable', 'Fruit', 'Cash', 'Pulse', 'Spice', 'Other']
const UNITS      = ['kg', 'quintal', 'tonne', 'litre', 'piece', 'dozen', 'bag']
const ORDER_STATUS = ['PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED']

const STATUS_COLORS = {
  PENDING:   'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-sky-100 text-sky-700',
  SHIPPED:   'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-forest-100 text-forest-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const EMPTY_FORM = {
  title: '', description: '', price: '', quantity: '',
  unit: 'kg', category: 'Grain', location: '', image_url: '',
}

export default function FarmerDashboard() {
  const { user } = useAuth()
  const [tab,       setTab]       = useState('products')   // products | orders | add
  const [products,  setProducts]  = useState([])
  const [orders,    setOrders]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [editId,    setEditId]    = useState(null)
  const [saving,    setSaving]    = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, oRes] = await Promise.all([
        productsAPI.myList(),
        ordersAPI.farmerOrders(),
      ])
      setProducts(pRes.data.products)
      setOrders(oRes.data.orders)
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        price:    parseFloat(form.price),
        quantity: parseFloat(form.quantity),
      }
      if (editId) {
        await productsAPI.update(editId, payload)
        toast.success('Product updated!')
      } else {
        await productsAPI.create(payload)
        toast.success('Product listed! 🌾')
      }
      setForm(EMPTY_FORM)
      setEditId(null)
      setTab('products')
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleEdit = (p) => {
    setForm({
      title: p.title, description: p.description || '', price: p.price,
      quantity: p.quantity, unit: p.unit, category: p.category || 'Grain',
      location: p.location || '', image_url: p.image_url || '',
    })
    setEditId(p.id)
    setTab('add')
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await productsAPI.delete(id)
      toast.success('Product removed')
      fetchAll()
    } catch { toast.error('Delete failed') }
  }

  const handleStatusChange = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, status)
      toast.success(`Order marked ${status}`)
      fetchAll()
    } catch { toast.error('Status update failed') }
  }

  // Summary stats
  const totalRevenue = orders
    .filter(o => o.status === 'DELIVERED')
    .reduce((s, o) => s + o.total_price, 0)
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length

  if (loading) return <Spinner size="lg" className="mt-20" />

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 page-enter">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-stone-800">
          Farmer Dashboard 👨‍🌾
        </h1>
        <p className="text-stone-500 mt-1">Welcome back, {user?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'My Products',   value: products.length,          icon: '🌾', color: 'text-forest-600' },
          { label: 'Total Orders',  value: orders.length,            icon: '📦', color: 'text-sky-600'    },
          { label: 'Pending',       value: pendingOrders,            icon: '⏳', color: 'text-amber-600'  },
          { label: 'Revenue (₹)',   value: totalRevenue.toFixed(0),  icon: '💰', color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-stone-500 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-earth-100 p-1 rounded-xl w-fit">
        {[
          { key: 'products', label: '🌾 My Products' },
          { key: 'orders',   label: '📦 Orders' },
          { key: 'add',      label: editId ? '✏️ Edit Product' : '➕ Add Product' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); if (t.key !== 'add') { setEditId(null); setForm(EMPTY_FORM) } }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? 'bg-white text-forest-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Products Tab ─────────────────────────────────────────────────── */}
      {tab === 'products' && (
        <div className="space-y-3">
          {products.length === 0 && (
            <div className="card p-12 text-center">
              <div className="text-5xl mb-3">🌾</div>
              <p className="text-stone-500">No products yet. Start by adding your first listing!</p>
              <button onClick={() => setTab('add')} className="btn-primary mt-4">Add Product</button>
            </div>
          )}
          {products.map(p => (
            <div key={p.id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-stone-800">{p.title}</h3>
                  <span className={`badge ${p.is_available ? 'bg-forest-100 text-forest-700' : 'bg-red-100 text-red-600'}`}>
                    {p.is_available ? 'Active' : 'Unavailable'}
                  </span>
                  {p.category && <span className="badge bg-earth-100 text-earth-700">{p.category}</span>}
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-stone-500">
                  <span>₹{p.price}/{p.unit}</span>
                  <span>{p.quantity} {p.unit} left</span>
                  {p.location && <span>📍 {p.location}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(p)} className="btn-secondary text-sm py-1.5 px-3">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="btn-danger text-sm py-1.5 px-3">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Orders Tab ───────────────────────────────────────────────────── */}
      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 && (
            <div className="card p-12 text-center">
              <div className="text-5xl mb-3">📦</div>
              <p className="text-stone-500">No orders yet. List products to start receiving orders.</p>
            </div>
          )}
          {orders.map(o => (
            <div key={o.id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-stone-800">Order #{o.id}</h3>
                  <span className={`badge ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                </div>
                <p className="text-sm text-stone-500 mt-1">
                  {o.product?.title} · {o.quantity} {o.product?.unit}
                </p>
                <p className="text-sm text-stone-600 font-medium mt-0.5">₹{o.total_price}</p>
                {o.buyer && (
                  <p className="text-xs text-stone-400 mt-0.5">Buyer: {o.buyer.name} · {o.buyer.phone || o.buyer.email}</p>
                )}
                {o.notes && <p className="text-xs text-stone-400 italic mt-0.5">"{o.notes}"</p>}
              </div>
              <select
                value={o.status}
                onChange={(e) => handleStatusChange(o.id, e.target.value)}
                className="input w-auto text-sm py-1.5"
              >
                {ORDER_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* ── Add/Edit Product Tab ─────────────────────────────────────────── */}
      {tab === 'add' && (
        <div className="card p-6 max-w-2xl">
          <h2 className="font-display text-xl font-bold text-stone-800 mb-5">
            {editId ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Product Title *</label>
                <input value={form.title} onChange={set('title')} className="input" placeholder="Basmati Rice Grade A" required />
              </div>
              <div className="col-span-2">
                <label className="label">Description</label>
                <textarea value={form.description} onChange={set('description')} className="input resize-none" rows={3} placeholder="Describe your product quality, harvest date, etc." />
              </div>
              <div>
                <label className="label">Price (₹ per unit) *</label>
                <input type="number" step="0.01" min="0" value={form.price} onChange={set('price')} className="input" placeholder="25.00" required />
              </div>
              <div>
                <label className="label">Available Quantity *</label>
                <input type="number" step="0.1" min="0" value={form.quantity} onChange={set('quantity')} className="input" placeholder="500" required />
              </div>
              <div>
                <label className="label">Unit</label>
                <select value={form.unit} onChange={set('unit')} className="input">
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Category</label>
                <select value={form.category} onChange={set('category')} className="input">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Location</label>
                <input value={form.location} onChange={set('location')} className="input" placeholder="Nashik, Maharashtra" />
              </div>
              <div>
                <label className="label">Image URL (optional)</label>
                <input value={form.image_url} onChange={set('image_url')} className="input" placeholder="https://…" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setTab('products'); setEditId(null); setForm(EMPTY_FORM) }} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving…' : editId ? 'Update Product' : 'List Product'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
