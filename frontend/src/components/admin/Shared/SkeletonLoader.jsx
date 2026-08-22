// src/components/admin/Shared/SkeletonLoader.jsx

export function AdminStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-28 bg-zinc-900 border border-white/5 rounded-2xl p-6" />
      ))}
    </div>
  );
}

export function AdminChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
      <div className="h-80 bg-zinc-900 border border-white/5 rounded-2xl" />
      <div className="h-80 bg-zinc-900 border border-white/5 rounded-2xl" />
    </div>
  );
}

export function AdminActivitySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-5 bg-zinc-800 rounded-lg w-32" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-14 bg-zinc-900 border border-white/5 rounded-xl w-full" />
      ))}
    </div>
  );
}

export function AdminStatusSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
      <div className="h-64 bg-zinc-900 border border-white/5 rounded-2xl" />
      <div className="h-64 bg-zinc-900 border border-white/5 rounded-2xl" />
      <div className="h-64 bg-zinc-900 border border-white/5 rounded-2xl" />
    </div>
  );
}
