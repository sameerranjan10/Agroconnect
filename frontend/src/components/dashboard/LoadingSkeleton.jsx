export function CardSkeleton() {
  return (
    <div className="glass-card p-6 h-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="w-12 h-12 rounded-2xl skeleton" />
        <div className="w-16 h-6 rounded-full skeleton" />
      </div>
      <div className="mt-4">
        <div className="w-24 h-4 rounded skeleton mb-2" />
        <div className="w-32 h-8 rounded skeleton" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="glass-card p-6">
      <div className="w-48 h-6 rounded skeleton mb-6" />
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl skeleton shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="w-1/3 h-4 rounded skeleton" />
              <div className="w-1/4 h-3 rounded skeleton" />
            </div>
            <div className="w-24 h-8 rounded-full skeleton" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="w-full h-40 rounded-3xl skeleton" />
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      
      {/* Charts/Tables */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="glass-card p-6 h-96 flex flex-col">
            <div className="w-48 h-6 rounded skeleton mb-8" />
            <div className="flex-1 rounded-xl skeleton" />
          </div>
        </div>
        <div className="lg:col-span-1">
          <TableSkeleton rows={4} />
        </div>
      </div>
    </div>
  )
}
