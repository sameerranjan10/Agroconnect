/**
 * AgroConnect - Product Card
 */
import { Link } from 'react-router-dom'

const CATEGORY_COLORS = {
  Grain:     'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  Vegetable: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  Fruit:     'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  Cash:      'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
  Pulse:     'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
  Spice:     'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
}

const CROP_EMOJIS = {
  rice: '🌾', wheat: '🌾', maize: '🌽', sugarcane: '🎋', cotton: '🌿',
  soybean: '🫘', groundnut: '🥜', chickpea: '🫘', lentil: '🫘',
  mango: '🥭', banana: '🍌', tomato: '🍅', onion: '🧅', potato: '🥔',
  coffee: '☕', default: '🌿',
}

function getEmoji(title = '') {
  const lower = title.toLowerCase()
  for (const [key, emoji] of Object.entries(CROP_EMOJIS)) {
    if (lower.includes(key)) return emoji
  }
  return CROP_EMOJIS.default
}

export default function ProductCard({ product, onBuy }) {
  const categoryClass = CATEGORY_COLORS[product.category] || 'bg-earth-100 text-earth-700'

  return (
    <div className="card overflow-hidden flex flex-col group animate-fade-in">
      {/* Image / Emoji banner */}
      <div className="relative h-40 bg-gradient-to-br from-forest-50 to-earth-100 dark:from-stone-800 dark:to-stone-700 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
            {getEmoji(product.title)}
          </span>
        )}
        <div className="absolute top-3 left-3">
          {product.category && (
            <span className={`badge ${categoryClass}`}>{product.category}</span>
          )}
        </div>
        {!product.is_available && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <Link to={`/products/${product.id}`}>
            <h3 className="font-display font-semibold text-stone-800 dark:text-stone-100 text-lg leading-snug hover:text-forest-700 dark:hover:text-forest-400 transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1 line-clamp-2">
            {product.description || 'Fresh from the farm, quality guaranteed.'}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-stone-400 dark:text-stone-500 text-xs">
            <span>📍</span>
            <span>{product.location || product.farmer?.location || 'India'}</span>
          </div>
          {product.farmer && (
            <div className="flex items-center gap-1.5 mt-1 text-stone-400 dark:text-stone-500 text-xs">
              <span>👨‍🌾</span>
              <span>{product.farmer.name}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-earth-100 dark:border-stone-700 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-forest-700 dark:text-forest-400">₹{product.price}</span>
            <span className="text-stone-400 dark:text-stone-500 text-sm">/{product.unit}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-stone-400 dark:text-stone-500">Available</span>
            <p className="text-sm font-medium text-stone-700 dark:text-stone-300">{product.quantity} {product.unit}</p>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Link to={`/products/${product.id}`} className="flex-1 btn-secondary text-center text-sm py-2">
            View
          </Link>
          {onBuy && product.is_available && (
            <button
              onClick={() => onBuy(product)}
              className="flex-1 btn-primary text-sm py-2"
            >
              Buy Now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
