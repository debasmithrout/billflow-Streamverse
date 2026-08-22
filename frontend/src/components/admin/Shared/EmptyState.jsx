// src/components/admin/Shared/EmptyState.jsx

export default function EmptyState({ message, iconType = "default" }) {
  const renderIcon = () => {
    switch (iconType) {
      case "activity":
        return (
          <svg className="w-8 h-8 text-gray-650" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "chart":
        return (
          <svg className="w-8 h-8 text-gray-655" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-gray-650" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-zinc-950/40 border border-white/5 text-center space-y-3">
      <div className="p-3 bg-white/5 rounded-full">
        {renderIcon()}
      </div>
      <p className="text-xs font-medium text-gray-400">{message}</p>
    </div>
  );
}
