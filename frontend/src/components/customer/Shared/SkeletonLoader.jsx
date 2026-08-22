// src/components/customer/Shared/SkeletonLoader.jsx

export function PageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Title */}
      <div className="h-8 bg-zinc-800 rounded-lg w-1/4" />
      
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 h-64 bg-zinc-900 border border-white/5 rounded-2xl p-6" />
        <div className="h-64 bg-zinc-900 border border-white/5 rounded-2xl p-6" />
      </div>
    </div>
  );
}

export function MovieRailSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header */}
      <div className="h-5 bg-zinc-800 rounded-lg w-32" />
      
      {/* Rail items */}
      <div className="flex space-x-4 overflow-hidden pb-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex-none w-40 sm:w-48 aspect-[2/3] bg-zinc-900 border border-white/5 rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}

export function SubscriptionSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-28 bg-zinc-900 border border-white/5 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-96 bg-zinc-900 border border-white/5 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function InvoiceTableSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-12 bg-zinc-900 border border-white/5 rounded-xl w-full" />
      ))}
    </div>
  );
}
