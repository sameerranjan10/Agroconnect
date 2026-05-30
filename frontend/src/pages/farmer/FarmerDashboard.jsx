import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Sprout, ShoppingCart, Package, Brain, CloudSun, TrendingUp, Newspaper, BarChart3, Settings, Edit3, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { productsAPI, ordersAPI, usersAPI, aiAPI } from '../../services/api'
import DashboardLayout from '../../layouts/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import WelcomeHero from '../../components/dashboard/WelcomeHero'
import WeatherWidget from '../../components/dashboard/WeatherWidget'
import SmartWeatherDashboard from '../../components/dashboard/SmartWeatherDashboard'
import NewsFeed from '../../components/dashboard/NewsFeed'
import SmartInsights from '../../components/dashboard/SmartInsights'
import { DashboardSkeleton } from '../../components/dashboard/LoadingSkeleton'
import EmptyState from '../../components/dashboard/EmptyState'
import { RevenueChart, OrderStatusChart, PriceTrendChart } from '../../components/charts/RevenueChart'
import toast from 'react-hot-toast'

const SIDEBAR_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',         icon: LayoutDashboard },
  { id: 'crops',      label: 'My Crops',           icon: Sprout },
  { id: 'sell',       label: 'Sell Product',       icon: ShoppingCart },
  { id: 'orders',     label: 'Orders',             icon: Package },
  { id: 'ai',         label: 'AI Recommendations', icon: Brain },
  { id: 'weather',    label: 'Weather',            icon: CloudSun },
  { id: 'prices',     label: 'Market Prices',      icon: TrendingUp },
  { id: 'news',       label: 'News & Trends',      icon: Newspaper },
  { id: 'analytics',  label: 'Analytics',          icon: BarChart3 },
  { id: 'settings',   label: 'Settings',           icon: Settings },
]

const DOCK_ITEMS = [
  SIDEBAR_ITEMS.find(i => i.id === 'dashboard'),
  SIDEBAR_ITEMS.find(i => i.id === 'news'),
  SIDEBAR_ITEMS.find(i => i.id === 'ai'),
  SIDEBAR_ITEMS.find(i => i.id === 'orders'),
]

const CATEGORIES = ['Grain', 'Vegetable', 'Fruit', 'Cash', 'Pulse', 'Spice', 'Other']
const UNITS = ['kg', 'quintal', 'tonne', 'litre', 'piece', 'dozen', 'bag']
const ORDER_STATUS = ['PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED']

const STATUS_COLORS = {
  PENDING:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CONFIRMED: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  SHIPPED:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
  DELIVERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function FarmerDashboard() {
  const { user, setUser } = useAuth()
  const [activeSection, setActiveSection] = useState('dashboard')
  
  // Data State
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Product Form State
  const [productForm, setProductForm] = useState({ title: '', description: '', price: '', quantity: '', unit: 'kg', category: 'Grain', location: user?.location || '', image_url: '' })
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  // AI Form State
  const [aiForm, setAiForm] = useState({ nitrogen: 60, phosphorus: 40, potassium: 40, temperature: 25, humidity: 65, ph: 6.5, rainfall: 120 })
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  // Settings State
  const [settingsForm, setSettingsForm] = useState({ 
    name: user?.name || '', 
    phone: user?.phone || '', 
    location: user?.location || '', 
    state: user?.state || '',
    district: user?.district || '',
    village: user?.village || '',
    latitude: user?.latitude || '',
    longitude: user?.longitude || '',
    bio: user?.bio || '' 
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [prodRes, orderRes] = await Promise.all([
        productsAPI.myList(),
        ordersAPI.farmerOrders()
      ])
      setProducts(prodRes.data.products)
      setOrders(orderRes.data.orders)
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Calculated stats
  const totalRevenue = orders.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + o.total_price, 0)
  const activeProducts = products.length
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...productForm, price: parseFloat(productForm.price), quantity: parseFloat(productForm.quantity) }
      if (editId) {
        await productsAPI.update(editId, payload)
        toast.success('Product updated successfully')
      } else {
        await productsAPI.create(payload)
        toast.success('Product added successfully')
      }
      setProductForm({ title: '', description: '', price: '', quantity: '', unit: 'kg', category: 'Grain', location: user?.location || '', image_url: '' })
      setEditId(null)
      fetchData()
      setActiveSection('crops')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await productsAPI.delete(id)
      toast.success('Product deleted')
      fetchData()
    } catch {
      toast.error('Failed to delete product')
    }
  }

  const handleStatusChange = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, status)
      toast.success('Order status updated')
      fetchData()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleAiSubmit = async (e) => {
    e.preventDefault()
    setAiLoading(true)
    try {
      const payload = Object.fromEntries(Object.entries(aiForm).map(([k, v]) => [k, parseFloat(v)]))
      const { data } = await aiAPI.recommendCrop(payload)
      setAiResult(data)
    } catch (err) {
      toast.error('AI service unavailable')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSettingsSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await usersAPI.updateProfile(settingsForm)
      setUser(data)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const renderSection = () => {
    if (loading) return <DashboardSkeleton />

    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <WelcomeHero userName={user?.name} role="Farmer" />
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <StatCard icon={TrendingUp} label="Total Revenue" value={totalRevenue || 0} trend="+18%" trendUp={true} color="emerald" />
              <StatCard icon={Sprout} label="Active Crops" value={activeProducts} color="sky" />
              <StatCard icon={Package} label="Pending Orders" value={pendingOrders} trend={pendingOrders > 0 ? "Requires action" : "All clear"} trendUp={pendingOrders === 0} color="amber" />
              <StatCard icon={BarChart3} label="Monthly Growth" value="18.2%" trend="+2.4%" trendUp={true} color="purple" />
            </div>

            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2"><RevenueChart /></div>
              <div className="lg:col-span-1"><WeatherWidget /></div>
            </div>

            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2 glass-card p-4 h-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-stone-700 dark:text-stone-200">Recent Orders</h3>
                  <button onClick={() => setActiveSection('orders')} className="text-sm text-emerald-400 hover:text-emerald-300">View All</button>
                </div>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-stone-400 dark:text-stone-500">No recent orders.</div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map(o => (
                      <div key={o.id} className="flex justify-between items-center p-3 rounded-xl bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-dashboard-border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-dashboard-surface flex items-center justify-center text-lg shrink-0">📦</div>
                          <div>
                            <p className="font-medium text-stone-700 dark:text-stone-200 text-sm">{o.product?.title}</p>
                            <p className="text-xs text-stone-400 dark:text-stone-500">Order #{o.id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-stone-700 dark:text-stone-200 text-sm">₹{o.total_price}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="lg:col-span-1"><SmartInsights /></div>
            </div>
          </div>
        )

      case 'crops':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100">My Crops</h2>
                <p className="text-stone-400 dark:text-stone-500 dark:text-stone-400 text-sm">Manage your product listings</p>
              </div>
              <button onClick={() => { setEditId(null); setProductForm({ title: '', description: '', price: '', quantity: '', unit: 'kg', category: 'Grain', location: user?.location || '', image_url: '' }); setActiveSection('sell') }} className="btn-primary flex items-center gap-2">
                <Sprout className="w-4 h-4" /> Add Product
              </button>
            </div>
            
            {products.length === 0 ? (
              <EmptyState icon={Sprout} title="No crops listed yet" description="Start selling your produce directly to buyers across India. Add your first product to get started." actionLabel="Add Product" onAction={() => setActiveSection('sell')} />
            ) : (
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                {products.map(p => (
                  <div key={p.id} className="glass-card-hover p-4 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-stone-800 dark:text-stone-100">{p.title}</h3>
                        <span className="text-xs bg-stone-200 dark:bg-white/10 text-stone-600 dark:text-stone-300 px-2 py-1 rounded-md">{p.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-display font-bold text-xl text-emerald-400">₹{p.price}</div>
                        <div className="text-xs text-stone-400 dark:text-stone-500 dark:text-stone-400">per {p.unit}</div>
                      </div>
                    </div>
                    <div className="text-sm text-stone-400 dark:text-stone-500 dark:text-stone-400 mb-4 flex-1 line-clamp-2">{p.description}</div>
                    <div className="flex justify-between items-center pt-4 border-t border-stone-200 dark:border-dashboard-border">
                      <div className="text-sm font-medium text-stone-600 dark:text-stone-300">Stock: {p.quantity} {p.unit}</div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditId(p.id); setProductForm(p); setActiveSection('sell') }} className="p-2 text-stone-400 dark:text-stone-500 dark:text-stone-400 hover:text-sky-400 bg-stone-100 dark:bg-white/5 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-stone-400 dark:text-stone-500 dark:text-stone-400 hover:text-red-400 bg-stone-100 dark:bg-white/5 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'sell':
        return (
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100">{editId ? 'Edit Product' : 'Add New Product'}</h2>
              <p className="text-stone-400 dark:text-stone-500 dark:text-stone-400 text-sm">List your produce on the marketplace</p>
            </div>
            
            <form onSubmit={handleProductSubmit} className="glass-card p-4 space-y-5">
              <div>
                <label className="dash-label">Product Title</label>
                <input required type="text" className="dash-input" value={productForm.title} onChange={e => setProductForm(f => ({...f, title: e.target.value}))} placeholder="e.g., Organic Basmati Rice" />
              </div>
              <div>
                <label className="dash-label">Description</label>
                <textarea required rows="3" className="dash-input resize-none" value={productForm.description} onChange={e => setProductForm(f => ({...f, description: e.target.value}))} placeholder="Describe quality, variety, etc." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="dash-label">Price (₹)</label>
                  <input required type="number" step="0.01" min="0" className="dash-input" value={productForm.price} onChange={e => setProductForm(f => ({...f, price: e.target.value}))} />
                </div>
                <div>
                  <label className="dash-label">Unit</label>
                  <select className="dash-input" value={productForm.unit} onChange={e => setProductForm(f => ({...f, unit: e.target.value}))}>
                    {UNITS.map(u => <option key={u} value={u} className="bg-white dark:bg-dashboard-card text-stone-700 dark:text-stone-200">{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="dash-label">Available Quantity</label>
                  <input required type="number" step="0.01" min="0" className="dash-input" value={productForm.quantity} onChange={e => setProductForm(f => ({...f, quantity: e.target.value}))} />
                </div>
                <div>
                  <label className="dash-label">Category</label>
                  <select className="dash-input" value={productForm.category} onChange={e => setProductForm(f => ({...f, category: e.target.value}))}>
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-white dark:bg-dashboard-card text-stone-700 dark:text-stone-200">{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : (editId ? 'Update Product' : 'List Product')}</button>
                <button type="button" onClick={() => setActiveSection('crops')} className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-dashboard-border text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:bg-white/5 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        )

      case 'orders':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100">Orders Management</h2>
              <p className="text-stone-400 dark:text-stone-500 dark:text-stone-400 text-sm">Track and fulfill buyer orders</p>
            </div>
            
            {orders.length === 0 ? (
              <EmptyState icon={Package} title="No orders yet" description="When buyers place orders for your products, they will appear here." />
            ) : (
              <div className="space-y-4">
                {orders.map(o => (
                  <div key={o.id} className="glass-card p-4 flex flex-col md:flex-row md:items-center gap-5 relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${STATUS_COLORS[o.status].split(' ')[0]}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-stone-700 dark:text-stone-200 text-lg">Order #{o.id}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                      </div>
                      <p className="font-medium text-emerald-400 mb-1">{o.product?.title}</p>
                      <p className="text-sm text-stone-400 dark:text-stone-500 dark:text-stone-400">Qty: {o.quantity} {o.product?.unit} • Buyer: {o.buyer?.name} ({o.buyer?.phone})</p>
                    </div>
                    <div className="flex flex-col md:items-end gap-3 border-t md:border-t-0 md:border-l border-stone-200 dark:border-dashboard-border pt-4 md:pt-0 md:pl-5">
                      <div className="text-xl font-display font-bold text-stone-800 dark:text-stone-100">₹{o.total_price}</div>
                      <select 
                        value={o.status} 
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-dashboard-border rounded-lg px-3 py-1.5 text-sm text-stone-600 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {ORDER_STATUS.map(s => <option key={s} value={s} className="bg-white dark:bg-dashboard-card">{s}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'ai':
        return (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                <Brain className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="font-display text-3xl font-bold text-stone-800 dark:text-stone-100">AI Crop Advisor</h2>
              <p className="text-stone-400 dark:text-stone-500 dark:text-stone-400 mt-2 max-w-lg mx-auto">Enter your soil and climate data to get personalized, AI-driven crop recommendations for maximum yield.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              <form onSubmit={handleAiSubmit} className="glass-card p-4 space-y-5">
                <div>
                  <h4 className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wider">Soil Nutrients</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['nitrogen','phosphorus','potassium'].map(k => (
                      <div key={k}>
                        <label className="dash-label capitalize">{k.slice(0,1)}</label>
                        <input type="number" className="dash-input text-sm py-1.5" value={aiForm[k]} onChange={e => setAiForm(f => ({...f, [k]: e.target.value}))} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wider">Climate</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="dash-label">Temp (°C)</label>
                      <input type="number" className="dash-input text-sm py-1.5" value={aiForm.temperature} onChange={e => setAiForm(f => ({...f, temperature: e.target.value}))} />
                    </div>
                    <div>
                      <label className="dash-label">Rain (mm)</label>
                      <input type="number" className="dash-input text-sm py-1.5" value={aiForm.rainfall} onChange={e => setAiForm(f => ({...f, rainfall: e.target.value}))} />
                    </div>
                    <div>
                      <label className="dash-label">Humidity %</label>
                      <input type="number" className="dash-input text-sm py-1.5" value={aiForm.humidity} onChange={e => setAiForm(f => ({...f, humidity: e.target.value}))} />
                    </div>
                    <div>
                      <label className="dash-label">Soil pH</label>
                      <input type="number" className="dash-input text-sm py-1.5" value={aiForm.ph} onChange={e => setAiForm(f => ({...f, ph: e.target.value}))} />
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={aiLoading} className="btn-primary w-full py-3 shadow-lg shadow-emerald-900/20 glow-border">
                  {aiLoading ? 'Analyzing...' : 'Get Recommendation'}
                </button>
              </form>

              <div className="glass-card p-4 flex flex-col justify-center">
                {!aiResult && !aiLoading && (
                  <div className="text-center opacity-50">
                    <Sprout className="w-16 h-16 mx-auto mb-4 text-stone-400 dark:text-stone-500" />
                    <p className="text-stone-400 dark:text-stone-500 dark:text-stone-400">Run the analysis to see results</p>
                  </div>
                )}
                {aiLoading && (
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-stone-400 dark:text-stone-500 dark:text-stone-400 animate-pulse">Processing ML models...</p>
                  </div>
                )}
                {aiResult && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-1">Recommended Crop</h3>
                    <div className="font-display text-4xl font-bold text-emerald-400 capitalize mb-6">{aiResult.recommended_crop}</div>
                    
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-stone-400 dark:text-stone-500 dark:text-stone-400">AI Confidence</span>
                        <span className="font-bold text-stone-700 dark:text-stone-200">{Math.round(aiResult.confidence * 100)}%</span>
                      </div>
                      <div className="h-2 bg-stone-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${aiResult.confidence * 100}%` }} className="h-full bg-emerald-500 rounded-full" />
                      </div>
                    </div>
                    
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Farming Tip</p>
                      <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">{aiResult.tips}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )

      case 'weather':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100">Weather & Calendar</h2>
              <p className="text-stone-400 dark:text-stone-500 text-sm">Farm planning tools and 7-day forecast</p>
            </div>
            
            <SmartWeatherDashboard />

            <div className="glass-card p-4">
              <h3 className="font-semibold text-stone-700 dark:text-stone-200 mb-4">Upcoming Tasks</h3>
              <div className="space-y-3">
                {['Prepare soil for Kharif sowing', 'Schedule irrigation for Plot B', 'Procure seeds for upcoming season'].map((t, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-stone-100 dark:bg-white/5 rounded-xl border border-stone-200 dark:border-dashboard-border">
                    <div className="w-5 h-5 rounded-full border-2 border-stone-500" />
                    <span className="text-sm text-stone-600 dark:text-stone-300">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'prices':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100">Market Prices</h2>
              <p className="text-stone-400 dark:text-stone-500 dark:text-stone-400 text-sm">Analyze market trends</p>
            </div>
            <PriceTrendChart />
          </div>
        )

      case 'news':
        return (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div>
              <h2 className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100">News & Trends</h2>
              <p className="text-stone-400 dark:text-stone-500 dark:text-stone-400 text-sm">Stay updated with agriculture news</p>
            </div>
            <NewsFeed />
          </div>
        )

      case 'analytics':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100">Analytics</h2>
              <p className="text-stone-400 dark:text-stone-500 dark:text-stone-400 text-sm">Your performance metrics</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
              <RevenueChart />
              <OrderStatusChart />
            </div>
          </div>
        )

      case 'settings':
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100">Settings</h2>
              <p className="text-stone-400 dark:text-stone-500 dark:text-stone-400 text-sm">Manage your profile</p>
            </div>
            <form onSubmit={handleSettingsSubmit} className="glass-card p-4 space-y-5">
              <div>
                <label className="dash-label">Full Name</label>
                <input required type="text" className="dash-input" value={settingsForm.name} onChange={e => setSettingsForm(f => ({...f, name: e.target.value}))} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="dash-label">Phone</label>
                  <input type="tel" className="dash-input" value={settingsForm.phone} onChange={e => setSettingsForm(f => ({...f, phone: e.target.value}))} />
                </div>
                <div>
                  <label className="dash-label">Village</label>
                  <input type="text" className="dash-input" value={settingsForm.village} onChange={e => setSettingsForm(f => ({...f, village: e.target.value}))} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="dash-label">District</label>
                  <input type="text" className="dash-input" value={settingsForm.district} onChange={e => setSettingsForm(f => ({...f, district: e.target.value}))} />
                </div>
                <div>
                  <label className="dash-label">State</label>
                  <input type="text" className="dash-input" value={settingsForm.state} onChange={e => setSettingsForm(f => ({...f, state: e.target.value}))} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
                <div>
                  <label className="dash-label">Latitude</label>
                  <input type="number" step="any" className="dash-input" value={settingsForm.latitude} onChange={e => setSettingsForm(f => ({...f, latitude: e.target.value}))} />
                </div>
                <div>
                  <label className="dash-label">Longitude</label>
                  <input type="number" step="any" className="dash-input" value={settingsForm.longitude} onChange={e => setSettingsForm(f => ({...f, longitude: e.target.value}))} />
                </div>
                <div className="sm:col-span-2">
                  <button type="button" onClick={() => {
                    if (navigator.geolocation) {
                      toast.loading('Fetching location...', { id: 'geo' })
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setSettingsForm(f => ({...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude}))
                          toast.success('Location fetched!', { id: 'geo' })
                        },
                        (err) => toast.error('Failed to get location', { id: 'geo' })
                      )
                    }
                  }} className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2 w-full">
                    📍 Use Current Location
                  </button>
                </div>
              </div>
              <div>
                <label className="dash-label">Bio</label>
                <textarea rows="3" className="dash-input resize-none" value={settingsForm.bio} onChange={e => setSettingsForm(f => ({...f, bio: e.target.value}))} />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full py-2.5">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        )

      default: return null
    }
  }

  return (
    <DashboardLayout
      sidebarItems={SIDEBAR_ITEMS}
      dockItems={DOCK_ITEMS}
      activeSidebarItem={activeSection}
      onSidebarItemClick={setActiveSection}
      pageTitle={SIDEBAR_ITEMS.find(i => i.id === activeSection)?.label || 'Dashboard'}
      pageSubtitle="Farmer Portal"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderSection()}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  )
}
