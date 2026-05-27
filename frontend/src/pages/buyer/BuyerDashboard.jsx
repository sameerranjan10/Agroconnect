import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Store, Heart, Package, Users, TrendingUp, Sparkles, MapPin, BarChart3, Settings, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { productsAPI, ordersAPI, usersAPI } from '../../services/api'
import DashboardLayout from '../../layouts/DashboardLayout'
import { DashboardSkeleton } from '../../components/dashboard/LoadingSkeleton'
import EmptyState from '../../components/dashboard/EmptyState'
import { RevenueChart, OrderStatusChart, PriceTrendChart } from '../../components/charts/RevenueChart'
import OrderModal from '../../components/OrderModal'
import toast from 'react-hot-toast'

const SIDEBAR_ITEMS = [
  { id: 'marketplace', label: 'Marketplace',      icon: Store },
  { id: 'saved',       label: 'Saved Products',   icon: Heart },
  { id: 'orders',      label: 'Orders',           icon: Package },
  { id: 'suppliers',   label: 'Suppliers',        icon: Users },
  { id: 'trends',      label: 'Price Trends',     icon: TrendingUp },
  { id: 'recommend',   label: 'Recommendations',  icon: Sparkles },
  { id: 'nearby',      label: 'Nearby Farmers',   icon: MapPin },
  { id: 'analytics',   label: 'Analytics',        icon: BarChart3 },
  { id: 'settings',    label: 'Settings',         icon: Settings },
]

const CATEGORIES = ['All', 'Grain', 'Vegetable', 'Fruit', 'Cash', 'Pulse', 'Spice']

const STATUS_COLORS = {
  PENDING:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CONFIRMED: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  SHIPPED:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
  DELIVERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function BuyerDashboard() {
  const { user, setUser } = useAuth()
  const [activeSection, setActiveSection] = useState('marketplace')
  
  // Data State
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  
  // Buyer specifics
  const [savedProducts, setSavedProducts] = useState(JSON.parse(localStorage.getItem('agroconnect_saved_products') || '[]'))
  const [orderItem, setOrderItem] = useState(null)
  
  // Settings State
  const [settingsForm, setSettingsForm] = useState({ name: user?.name || '', phone: user?.phone || '', location: user?.location || '', bio: user?.bio || '' })
  const [saving, setSaving] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        ...(search ? { search } : {}),
        ...(category !== 'All' ? { category } : {}),
        limit: 40,
      }
      const { data } = await productsAPI.list(params)
      setProducts(data.products)
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }, [search, category])

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await ordersAPI.buyerOrders()
      setOrders(data.orders)
    } catch {}
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { fetchOrders() }, [fetchOrders])

  const toggleSave = (id) => {
    const newSaved = savedProducts.includes(id) 
      ? savedProducts.filter(pId => pId !== id)
      : [...savedProducts, id]
    setSavedProducts(newSaved)
    localStorage.setItem('agroconnect_saved_products', JSON.stringify(newSaved))
  }

  const handleSettingsSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await usersAPI.updateMe(settingsForm)
      setUser(data)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const getRating = (id) => (((id * 7 + 3) % 10) / 10 + 4.0).toFixed(1)

  const renderSection = () => {
    if (loading && products.length === 0) return <DashboardSkeleton />

    switch (activeSection) {
      case 'marketplace':
      case 'recommend':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100">
                  {activeSection === 'recommend' ? 'Recommended for You' : 'Marketplace'}
                </h2>
                <p className="text-stone-400 dark:text-stone-500 dark:text-stone-400 text-sm">Source directly from farmers</p>
              </div>
              {activeSection === 'marketplace' && (
                <div className="w-full md:w-auto relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500 dark:text-stone-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search crops..." className="dash-input pl-10 w-full md:w-64" />
                </div>
              )}
            </div>

            {activeSection === 'marketplace' && (
              <div className="flex gap-2 overflow-x-auto pb-2 dash-scroll mb-6">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${category === c ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-stone-100 dark:bg-white/5 text-stone-400 dark:text-stone-500 dark:text-stone-400 border-stone-200 dark:border-dashboard-border hover:bg-stone-200 dark:bg-white/10 hover:text-stone-600 dark:text-stone-300'}`}>
                    {c}
                  </button>
                ))}
              </div>
            )}

            {products.length === 0 ? (
              <EmptyState icon={Store} title="No products found" description="Try adjusting your search or category filters." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(activeSection === 'recommend' ? products.slice(0, 8) : products).map(p => (
                  <div key={p.id} className="glass-card-hover flex flex-col h-full overflow-hidden relative">
                    {activeSection === 'recommend' && (
                      <div className="absolute top-3 left-3 z-10 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-lg"><Sparkles className="w-3 h-3" /> AI Match</div>
                    )}
                    <button onClick={() => toggleSave(p.id)} className="absolute top-3 right-3 z-10 p-2 bg-white/50 TEMP_PLACEHOLDER_bg-white dark:bg-dashboard-card/50 backdrop-blur-md rounded-full hover:bg-white dark:bg-dashboard-card transition-colors">
                      <Heart className={`w-4 h-4 transition-colors ${savedProducts.includes(p.id) ? 'fill-rose-500 text-rose-500' : 'text-stone-600 dark:text-stone-300'}`} />
                    </button>
                    <div className="h-40 bg-gradient-to-br from-emerald-900/30 to-forest-900/30 flex items-center justify-center border-b border-stone-200 dark:border-dashboard-border">
                      <Store className="w-12 h-12 text-emerald-500/50" />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-stone-800 dark:text-stone-100 line-clamp-1">{p.title}</h3>
                        <div className="font-display font-bold text-lg text-emerald-400">₹{p.price}</div>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-amber-400 text-sm">★</span>
                        <span className="text-stone-600 dark:text-stone-300 text-xs font-medium">{getRating(p.id)}</span>
                        <span className="text-stone-400 dark:text-stone-500 text-[10px] ml-1">(Verified)</span>
                      </div>
                      <div className="text-xs text-stone-400 dark:text-stone-500 dark:text-stone-400 mb-4 space-y-1">
                        <p className="flex items-center gap-1"><Users className="w-3 h-3" /> {p.farmer?.name}</p>
                        <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.farmer?.location || 'India'}</p>
                        <p className="flex items-center gap-1"><Package className="w-3 h-3" /> {p.quantity} {p.unit} available</p>
                      </div>
                      <button onClick={() => setOrderItem(p)} className="w-full mt-auto py-2.5 rounded-xl border border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-400 text-sm font-semibold transition-all">
                        Buy Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'saved':
        const saved = products.filter(p => savedProducts.includes(p.id))
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100">Saved Products</h2>
              <p className="text-stone-400 dark:text-stone-500 dark:text-stone-400 text-sm">Your shortlisted items</p>
            </div>
            
            {saved.length === 0 ? (
              <EmptyState icon={Heart} title="No saved products" description="Browse the marketplace and click the heart icon to save products here for later." actionLabel="Browse Marketplace" onAction={() => setActiveSection('marketplace')} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {saved.map(p => (
                  <div key={p.id} className="glass-card p-4 flex gap-4 items-center relative group">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-900/30 to-forest-900/30 flex items-center justify-center shrink-0 border border-stone-200 dark:border-dashboard-border">
                      <Store className="w-6 h-6 text-emerald-500/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-stone-800 dark:text-stone-100 truncate">{p.title}</h3>
                      <p className="font-display font-bold text-emerald-400">₹{p.price}</p>
                      <button onClick={() => toggleSave(p.id)} className="text-[10px] text-rose-400 uppercase font-bold tracking-wider hover:text-rose-300 mt-1">Remove</button>
                    </div>
                    <button onClick={() => setOrderItem(p)} className="p-2 rounded-lg bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-dashboard-border text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-colors shrink-0">
                      <Package className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'orders':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100">My Orders</h2>
              <p className="text-stone-400 dark:text-stone-500 dark:text-stone-400 text-sm">Track your purchases</p>
            </div>
            
            {orders.length === 0 ? (
              <EmptyState icon={Package} title="No orders yet" description="Your purchase history will appear here once you buy a product from a farmer." actionLabel="Start Shopping" onAction={() => setActiveSection('marketplace')} />
            ) : (
              <div className="space-y-4">
                {orders.map(o => (
                  <div key={o.id} className="glass-card p-5 flex flex-col md:flex-row md:items-center gap-5 relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${STATUS_COLORS[o.status].split(' ')[0]}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-stone-700 dark:text-stone-200 text-lg">Order #{o.id}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                      </div>
                      <p className="font-medium text-emerald-400 mb-1">{o.product?.title}</p>
                      <p className="text-sm text-stone-400 dark:text-stone-500 dark:text-stone-400">Qty: {o.quantity} {o.product?.unit} • Farmer: {o.product?.farmer?.name}</p>
                      <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-2 uppercase tracking-wider">{new Date(o.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-left md:text-right border-t md:border-t-0 md:border-l border-stone-200 dark:border-dashboard-border pt-4 md:pt-0 md:pl-5">
                      <p className="text-xs text-stone-400 dark:text-stone-500 dark:text-stone-400 mb-1">Total Paid</p>
                      <div className="text-2xl font-display font-bold text-stone-800 dark:text-stone-100">₹{o.total_price}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'suppliers':
        // Extract unique farmers
        const farmersMap = new Map()
        products.forEach(p => {
          if (p.farmer) {
            if (!farmersMap.has(p.farmer.id)) farmersMap.set(p.farmer.id, { ...p.farmer, count: 0 })
            farmersMap.get(p.farmer.id).count++
          }
        })
        const farmers = Array.from(farmersMap.values())
        
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100">My Suppliers</h2>
              <p className="text-stone-400 dark:text-stone-500 dark:text-stone-400 text-sm">Farmers you can source from</p>
            </div>
            
            {farmers.length === 0 ? (
              <EmptyState icon={Users} title="No suppliers found" description="Explore the marketplace to find farmers." />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {farmers.map((f, i) => (
                  <div key={i} className="glass-card-hover p-5 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xl mb-4">
                      {f.name ? f.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'F'}
                    </div>
                    <h3 className="font-semibold text-stone-800 dark:text-stone-100">{f.name}</h3>
                    <p className="text-xs text-stone-400 dark:text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {f.location || 'India'}</p>
                    <div className="mt-4 pt-4 border-t border-stone-200 dark:border-dashboard-border w-full flex justify-between items-center">
                      <span className="text-sm font-medium text-stone-600 dark:text-stone-300">{f.count} products</span>
                      <button onClick={() => { setSearch(f.name); setActiveSection('marketplace') }} className="text-xs font-bold text-emerald-400 hover:text-emerald-300">View All</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'trends':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100">Price Trends</h2>
              <p className="text-stone-400 dark:text-stone-500 dark:text-stone-400 text-sm">Make informed buying decisions</p>
            </div>
            <PriceTrendChart />
          </div>
        )

      case 'nearby':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100">Nearby Farmers</h2>
              <p className="text-stone-400 dark:text-stone-500 dark:text-stone-400 text-sm">Source locally to reduce logistics costs</p>
            </div>
            <div className="glass-card h-64 bg-stone-100/50 TEMP_PLACEHOLDER_bg-stone-100 dark:bg-dashboard-surface/50 border-dashed border-2 border-stone-200 dark:border-dashboard-border rounded-3xl flex items-center justify-center flex-col text-stone-400 dark:text-stone-500 mb-6">
              <MapPin className="w-12 h-12 mb-2 opacity-50" />
              <p>Map visualization coming soon</p>
            </div>
            <EmptyState icon={MapPin} title="Location access needed" description="Please enable location services to see farmers in your area." />
          </div>
        )

      case 'analytics':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100">Analytics</h2>
              <p className="text-stone-400 dark:text-stone-500 dark:text-stone-400 text-sm">Your purchasing metrics</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <RevenueChart title="Spending Overview" />
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
            <form onSubmit={handleSettingsSubmit} className="glass-card p-6 space-y-5">
              <div>
                <label className="dash-label">Business Name / Full Name</label>
                <input required type="text" className="dash-input" value={settingsForm.name} onChange={e => setSettingsForm(f => ({...f, name: e.target.value}))} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="dash-label">Phone</label>
                  <input type="tel" className="dash-input" value={settingsForm.phone} onChange={e => setSettingsForm(f => ({...f, phone: e.target.value}))} />
                </div>
                <div>
                  <label className="dash-label">Location</label>
                  <input type="text" className="dash-input" value={settingsForm.location} onChange={e => setSettingsForm(f => ({...f, location: e.target.value}))} />
                </div>
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
    <>
      <DashboardLayout
        sidebarItems={SIDEBAR_ITEMS}
        activeSidebarItem={activeSection}
        onSidebarItemClick={setActiveSection}
        pageTitle={SIDEBAR_ITEMS.find(i => i.id === activeSection)?.label || 'Marketplace'}
        pageSubtitle="Buyer Portal"
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
      
      {orderItem && (
        <OrderModal 
          product={orderItem}
          onClose={() => setOrderItem(null)}
          onSuccess={() => {
            fetchOrders()
            setActiveSection('orders')
          }}
        />
      )}
    </>
  )
}
