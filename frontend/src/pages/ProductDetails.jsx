/**
 * AgroConnect - Product Details Page
 */
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { productsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import OrderModal from '../components/OrderModal'
import { PageLoader } from '../components/Spinner'
import toast from 'react-hot-toast'

export default function ProductDetails() {
  const { id }          = useParams()
  const { isAuth, user } = useAuth()
  const navigate        = useNavigate()
  const [product,  setProduct]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [ordering, setOrdering] = useState(false)

  useEffect(() => {
    productsAPI.get(id)
      .then(r => setProduct(r.data))
      .catch(() => { toast.error('Product not found'); navigate('/marketplace') })
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) return <PageLoader />
  if (!product) return null

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 page-enter">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-400 mb-6">
        <Link to="/marketplace" className="hover:text-forest-700 transition-colors">Marketplace</Link>
        <span>/</span>
        <span className="text-stone-700">{product.title}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-forest-50 to-earth-100 flex items-center justify-center h-80 md:h-96">
          {product.image_url ? (
            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-9xl">🌾</span>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-3xl font-bold text-stone-800 leading-tight">
              {product.title}
            </h1>
            <span className={`badge mt-1 whitespace-nowrap ${product.is_available ? 'bg-forest-100 text-forest-700' : 'bg-red-100 text-red-600'}`}>
              {product.is_available ? '✓ In Stock' : 'Out of Stock'}
            </span>
          </div>

          {product.category && (
            <span className="badge bg-earth-100 text-earth-700 mt-2">{product.category}</span>
          )}

          <div className="mt-5 flex items-end gap-2">
            <span className="text-4xl font-bold text-forest-700">₹{product.price}</span>
            <span className="text-stone-400 text-lg pb-0.5">per {product.unit}</span>
          </div>

          <p className="text-stone-600 mt-4 leading-relaxed">
            {product.description || 'Fresh produce directly from the farm. Quality guaranteed.'}
          </p>

          <div className="mt-5 space-y-2.5 text-sm">
            <div className="flex items-center gap-2 text-stone-600">
              <span className="text-base">📦</span>
              <span>Available: <strong>{product.quantity} {product.unit}</strong></span>
            </div>
            {product.location && (
              <div className="flex items-center gap-2 text-stone-600">
                <span className="text-base">📍</span>
                <span>Location: <strong>{product.location}</strong></span>
              </div>
            )}
            {product.farmer && (
              <div className="flex items-center gap-2 text-stone-600">
                <span className="text-base">👨‍🌾</span>
                <span>Farmer: <strong>{product.farmer.name}</strong></span>
                {product.farmer.location && <span className="text-stone-400">· {product.farmer.location}</span>}
              </div>
            )}
            <div className="flex items-center gap-2 text-stone-400">
              <span className="text-base">🗓️</span>
              <span>Listed: {new Date(product.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3">
            {isAuth && user?.role === 'BUYER' && product.is_available ? (
              <button onClick={() => setOrdering(true)} className="btn-primary py-3 text-base">
                🛒 Buy Now
              </button>
            ) : !isAuth ? (
              <Link to="/register?role=BUYER" className="btn-primary py-3 text-base text-center">
                Sign up to Buy
              </Link>
            ) : null}
            <Link to="/marketplace" className="btn-secondary py-3 text-base text-center">
              ← Back to Marketplace
            </Link>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {ordering && (
        <OrderModal
          product={product}
          onClose={() => setOrdering(false)}
          onSuccess={() => navigate('/marketplace')}
        />
      )}
    </div>
  )
}
