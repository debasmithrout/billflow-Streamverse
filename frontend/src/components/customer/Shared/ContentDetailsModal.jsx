// src/components/customer/Shared/ContentDetailsModal.jsx
import { X, Play, Star, Clock, User, Film } from "lucide-react";
import usePlayNavigation from "../../../hooks/usePlayNavigation";
import { useMoreLikeThis } from "../../../hooks/useRecommendations";
import ContentRail from "./ContentRail";
import { motion, AnimatePresence } from "framer-motion";

export default function ContentDetailsModal({ item, onClose }) {
  const playContent = usePlayNavigation();
  const similarItems = useMoreLikeThis(item?.id, 6);

  if (!item) return null;

  // Setup mock crew defaults if missing
  const director = item.director || "Christopher Nolan";
  const cast = item.cast || ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"];
  const durationText = item.runtime || "2h 49m";
  const backdrop = item.backdrop || item.poster || "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Dark overlay backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
      />

      {/* Modal Dialog Card */}
      <div 
        className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10 pointer-events-auto my-8 animate-fade-in"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Backdrop Image & Banner */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-black">
          <img 
            src={backdrop} 
            alt={item.title} 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          
          {/* Metadata content overlaid on banner bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex flex-col gap-3 text-left">
            <div className="flex items-center gap-2">
              <span className="sv-badge sv-badge-purple uppercase tracking-wider text-[10px]">
                {item.type || "Movie"}
              </span>
              {item.badge && (
                <span className="sv-badge sv-badge-blue text-[10px]">
                  {item.badge}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {item.title}
            </h2>

            <div className="flex items-center gap-3 text-xs text-white/70 font-medium">
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                {item.rating || "8.5"}
              </span>
              <span>•</span>
              <span>{item.year || item.season || "2024"}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {durationText}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Description and Crew lists */}
        <div className="p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Description Column */}
            <div className="md:col-span-2 space-y-4">
              <p className="text-sm text-zinc-300 leading-relaxed">
                {item.description || "Start streaming this blockbuster title today. A grand cinematic journey with stellar performances and cutting-edge visual displays that will leave you absolutely wowed."}
              </p>
              
              <button
                onClick={() => {
                  onClose();
                  playContent(item);
                }}
                className="sv-btn-primary flex items-center gap-2 py-3 px-8 rounded-xl font-extrabold text-sm tracking-wide shadow-lg shadow-purple-600/30"
              >
                <Play className="w-4 h-4 fill-current" />
                Play Now
              </button>
            </div>

            {/* Crew Column */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3.5 text-xs text-zinc-400">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-400 block tracking-widest mb-1">
                  Director
                </span>
                <p className="text-white font-medium flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-white/50" />
                  {director}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-purple-400 block tracking-widest mb-1">
                  Cast
                </span>
                <div className="space-y-1 text-white font-medium">
                  {cast.map((actor, idx) => (
                    <p key={idx} className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-white/50" />
                      {actor}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. More Like This Content Rail */}
          {similarItems.length > 0 && (
            <div className="border-t border-white/5 pt-6">
              <ContentRail
                title="More Like This"
                items={similarItems}
                cardSize="sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
