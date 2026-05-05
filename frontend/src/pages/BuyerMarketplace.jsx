/**
 * AgroConnect - Buyer Marketplace Page
 */
import { useState, useEffect, useCallback } from 'react'
import { productsAPI, ordersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/ProductCard'
import OrderModal  from '../components/OrderModal'
import { PageLoader } from '../components/Spinner'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'Grain', 'Vegetable', 'Fruit', 'Cash', 'Pulse', 'Spice']
const STATUS_COLORS = {
  PENDING:   'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-sky-100 text-sky-700',
  SHIPPED:   'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-forest-100 text-forest-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default function BuyerMarketplace() {
  const { isAuth, user } = useAuth()
  const [tab,        setTab]        = useState('browse')   // browse | orders
  const [products,   setProducts]   = useState([])
  const [orders,     setOrders]     = useState([])
  const [total,      setTotal]      = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [category,   setCategory]   = useState('All')
  const [orderItem,  setOrderItem]  = useState(null)   // product to order

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        ...(search   ? { search } : {}),
        ...(category !== 'All' ? { category } : {}),
        limit: 40,
      }
      const { data } = await productsAPI.list(params)
      setProducts(data.products)
      setTotal(data.total)
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }, [search, category])

  const fetchOrders = useCallback(async () => {
    if (!isAuth || user?.role !== 'BUYER') return
    try {
      const { data } = await ordersAPI.buyerOrders()
      setOrders(data.orders)
    } catch {}
  }, [isAuth, user])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { fetchOrders()   }, [fetchOrders])

  const handleOrderSuccess = () => {
    fetchProducts()
    fetchOrders()
    if (isAuth && user?.role === 'BUYER') setTab('orders')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-enter">

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-stone-800">Marketplace 🛒</h1>
        <p className="text-stone-500 mt-1">
          {total} products available directly from farmers across India
        </p>
      </div>

      {/* Tabs (only for buyers) */}
      {isAuth && user?.role === 'BUYER' && (
        <div className="flex gap-1 mb-6 bg-earth-100 p-1 rounded-xl w-fit">
          {[{ key: 'browse', label: '🌾 Browse' }, { key: 'orders', label: '📦 My Orders' }].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key ? 'bg-white text-sky-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Browse Tab ───────────────────────────────────────────────────── */}
      {tab === 'browse' && (
        <>
          {/* Search + Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9"
                placeholder="Search crops, vegetables…"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    category === c
                      ? 'bg-forest-600 text-white'
                      : 'bg-white border border-earth-200 text-stone-600 hover:border-forest-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <PageLoader />
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-3">🌾</div>
              <p className="text-stone-500">No products found. Try adjusting your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onBuy={isAuth && user?.role === 'BUYER' ? setOrderItem : null}
                />
              ))}
            </div>
          )}

          {!isAuth && (
            <div className="mt-8 card p-6 text-center max-w-md mx-auto">
              <p className="text-stone-600 font-medium">Ready to buy?</p>
              <p className="text-stone-400 text-sm mt-1 mb-4">Create a buyer account to place orders directly with farmers.</p>
              <a href="/register?role=BUYER" className="btn-primary inline-block">
                Sign up as Buyer →
              </a>
            </div>
          )}
        </>
      )}

      {/* ── Orders Tab ───────────────────────────────────────────────────── */}
      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 && (
            <div className="card p-12 text-center">
              <div className="text-5xl mb-3">📦</div>
              <p className="text-stone-500">No orders yet. Browse the marketplace and place your first order!</p>
              <button onClick={() => setTab('browse')} className="btn-primary mt-4">Browse Products</button>
            </div>
          )}
          {orders.map(o => (
            <div key={o.id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-stone-800">Order #{o.id}</h3>
                  <span className={`badge ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                </div>
                <p className="text-sm text-stone-600 mt-1 font-medium">
                  {o.product?.title}
                </p>
                <p className="text-sm text-stone-500">
                  {o.quantity} {o.product?.unit} · ₹{o.total_price}
                </p>
                {o.product?.farmer && (
                  <p className="text-xs text-stone-400 mt-0.5">
                    Farmer: {o.product.farmer.name} · {o.product.farmer.location}
                  </p>
                )}
                <p className="text-xs text-stone-400 mt-0.5">
                  {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-forest-700">₹{o.total_price}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Modal */}
      {orderItem && (
        <OrderModal
          product={orderItem}
          onClose={() => setOrderItem(null)}
          onSuccess={handleOrderSuccess}
        />
      )}
    </div>
  )
}
