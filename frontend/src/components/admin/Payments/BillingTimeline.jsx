// src/components/admin/Payments/BillingTimeline.jsx

export default function BillingTimeline({ timeline = [], loading = false }) {
  const getIcon = (iconName) => {
    switch (iconName) {
      case "create":
        return (
          <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-gray-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
        );
      case "trial":
        return (
          <div className="w-6 h-6 rounded-full bg-red-650/15 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case "invoice":
        return (
          <div className="w-6 h-6 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case "success":
        return (
          <div className="w-6 h-6 rounded-full bg-green-500/15 border border-green-500/20 text-green-500 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case "failed":
        return (
          <div className="w-6 h-6 rounded-full bg-red-650/15 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case "refund":
        return (
          <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-gray-400 flex items-center justify-center shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          </div>
        );
    }
  };

  return (
    <div className="relative pl-4 space-y-6">
      
      {/* Loading animation indicators */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="flex gap-4">
            <div className="w-6 h-6 bg-zinc-800 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 pt-1">
              <div className="h-3.5 bg-zinc-800 rounded-lg w-1/3" />
              <div className="h-3 bg-zinc-900 rounded-lg w-2/3" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-6 h-6 bg-zinc-800 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 pt-1">
              <div className="h-3.5 bg-zinc-800 rounded-lg w-1/4" />
              <div className="h-3 bg-zinc-900 rounded-lg w-1/2" />
            </div>
          </div>
        </div>
      ) : timeline.length === 0 ? (
        <p className="text-[11px] text-gray-500 italic leading-relaxed pl-1.5">No billing timeline events recorded.</p>
      ) : (
        <div className="relative border-l border-zinc-800 space-y-6 ml-3 pl-6">
          {timeline.map((event, idx) => (
            <div key={event.id || idx} className="relative group">
              
              {/* Event Icon anchored left absolute */}
              <div className="absolute -left-[37px] top-0 bg-[#050505] p-0.5 rounded-full z-10 transition-transform group-hover:scale-105">
                {getIcon(event.icon)}
              </div>

              {/* Event Details Card */}
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-bold text-gray-200 group-hover:text-white transition-colors">
                    {event.title}
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono">
                    {event.date} • {event.time}
                  </span>
                </div>
                <p className="text-[10px] text-gray-550 font-light leading-relaxed">
                  {event.description}
                </p>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
