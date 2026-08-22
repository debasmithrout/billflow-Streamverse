// src/components/customer/Shared/MovieRail.jsx
import EmptyState from "./EmptyState";
import usePlayNavigation from "../../../hooks/usePlayNavigation";

export default function MovieRail({ title, items = [], emptyMessage = "No Content Available", iconType = "default" }) {
  const playContent = usePlayNavigation();

  if (!items || items.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
        <EmptyState message={emptyMessage} iconType={iconType} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {items.map((item, idx) => (
          <div
            key={idx}
            onClick={() => playContent(item)}
            className="flex-none w-40 sm:w-48 aspect-[2/3] rounded-xl relative overflow-hidden group cursor-pointer border border-white/5 transition-all duration-300 hover:scale-102 hover:border-red-600/30"
          >
            {/* Poster Gradient cover artwork */}
            <div className={`absolute inset-0 bg-gradient-to-tr ${item.gradient} group-hover:opacity-90 transition-opacity duration-300`} />
            
            {/* Play Overlay (Visible on Hover) */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/50 scale-75 group-hover:scale-100 transition-transform duration-300">
                <svg className="w-6 h-6 text-white fill-current translate-x-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            {/* Title & Category Details */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/35 p-4 flex flex-col justify-between z-10">
              <div className="flex justify-end">
                <span className="text-[9px] font-bold text-gray-300 px-1.5 py-0.5 bg-black/45 rounded border border-white/5 uppercase">
                  {item.badge}
                </span>
              </div>
              <div className="space-y-1.5">
                <h4 className="text-xs sm:text-sm font-black text-white leading-tight group-hover:text-red-500 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[9px] text-gray-400 font-light">{item.category}</p>
              </div>
            </div>

            {/* Progress Bar (For Continue Watching) */}
            {item.progress !== undefined && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800 z-30">
                <div 
                  className="h-full bg-red-600 transition-all"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
