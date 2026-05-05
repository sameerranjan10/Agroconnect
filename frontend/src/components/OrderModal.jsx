/**
 * AgroConnect - Order Modal
 * Shown when a buyer clicks "Buy Now" on a product.
 */
import { useState } from 'react'
import { ordersAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function OrderModal({ product, onClose, onSuccess }) {
  const [qty,     setQty]     = useState(1)
  const [notes,   setNotes]   = useState('')
  const [loading, setLoading] = useState(false)

  const total = (qty * product.price).toFixed(2)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (qty <= 0 || qty > product.quantity) {
      toast.error(`Quantity must be between 1 and ${product.quantity}`)
      return
    }
    setLoading(true)
    try {
      await ordersAPI.place({ product_id: product.id, quantity: qty, notes })
      toast.success('Order placed successfully! 🎉')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="p-6">
          <div className="flex justify-between items-start mb-5">
            <div>
              <h2 className="font-display text-xl font-bold text-stone-800 dark:text-stone-100">Place Order</h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm mt-0.5">{product.title}</p>
            </div>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 text-xl leading-none">×</button>
          </div>

          <div className="bg-earth-50 dark:bg-stone-900/50 rounded-xl p-4 mb-5 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500 dark:text-stone-400">Price per {product.unit}</span>
              <span className="font-semibold text-stone-800 dark:text-stone-100">₹{product.price}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500 dark:text-stone-400">Available</span>
              <span className="font-semibold text-stone-800 dark:text-stone-100">{product.quantity} {product.unit}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Quantity ({product.unit})</label>
              <input
                type="number"
                min="0.1"
                max={product.quantity}
                step="0.1"
                value={qty}
                onChange={(e) => setQty(parseFloat(e.target.value))}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input resize-none"
                rows={2}
                placeholder="Any special instructions…"
              />
            </div>

            <div className="bg-forest-50 dark:bg-forest-900/20 rounded-xl p-3 flex justify-between items-center">
              <span className="text-stone-600 dark:text-stone-300 font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-forest-700 dark:text-forest-400">₹{total}</span>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 btn-primary">
                {loading ? 'Placing…' : 'Confirm Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
