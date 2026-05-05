export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`${sizes[size]} animate-spin rounded-full border-2 border-earth-200 border-t-forest-600`} />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <span className="text-4xl animate-pulse-slow">🌱</span>
      <Spinner size="lg" />
      <p className="text-stone-400 text-sm">Loading…</p>
    </div>
  )
}
