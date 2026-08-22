// src/pages/customer/watch/components/EpisodeSidebar.jsx
import { useState, useEffect } from "react";
import { X, Play, Clock, CheckCircle } from "lucide-react";
import { watchProgressService } from "../../../../services/watchProgressService";

export default function EpisodeSidebar({
  seasons,
  currentEpisode,
  onEpisodeSelect,
  onClose
}) {
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(1);

  // Auto-set selected season to match current playing episode's season on mount
  useEffect(() => {
    if (currentEpisode && currentEpisode.id) {
      // Expected id format: "seriesId_s{num}_e{num}"
      const match = currentEpisode.id.match(/_s(\d+)_/);
      if (match) {
        const seasonNum = parseInt(match[1]) || 1;
        Promise.resolve().then(() => {
          setSelectedSeasonNumber(seasonNum);
        });
      }
    }
  }, [currentEpisode]);

  const activeSeason = seasons.find(s => s.seasonNumber === selectedSeasonNumber) || seasons[0];
  const seasonEpisodes = activeSeason ? activeSeason.episodes : [];

  // Helper to read watch progress for an episode card
  const getEpisodeProgress = (epId) => {
    const progress = watchProgressService.getProgress(epId);
    if (!progress) return null;
    return Math.round((progress.currentTime / progress.duration) * 100);
  };

  return (
    <div className="absolute top-0 right-0 w-80 sm:w-96 h-full bg-zinc-950/98 border-l border-white/10 backdrop-blur-xl flex flex-col z-50 pointer-events-auto shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-black uppercase tracking-wider text-purple-200">
            Episodes
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Season Selector */}
      <div className="p-4 border-b border-white/5 flex-shrink-0">
        <select
          value={selectedSeasonNumber}
          onChange={(e) => setSelectedSeasonNumber(parseInt(e.target.value) || 1)}
          className="w-full p-2.5 rounded-xl border border-white/5 bg-zinc-900 text-xs font-bold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
        >
          {seasons.map((s) => (
            <option key={s.id} value={s.seasonNumber}>
              Season {s.seasonNumber} {s.title ? `(${s.title})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Episode Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 adm-scrollbar">
        {seasonEpisodes.map((ep) => {
          const isCurrent = currentEpisode?.id === ep.id;
          const progressPercent = getEpisodeProgress(ep.id);
          const isCompleted = progressPercent !== null && progressPercent >= 95;

          return (
            <div
              key={ep.id}
              onClick={() => onEpisodeSelect(ep)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 text-left ${
                isCurrent
                  ? "bg-purple-600/10 border-purple-500 text-purple-200"
                  : "border-white/5 bg-zinc-900/30 hover:border-white/10 hover:bg-zinc-900/60 text-zinc-300"
              }`}
            >
              {/* Left Column: Thumbnail & watched progress bar */}
              <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-zinc-950 flex-shrink-0 border border-white/5">
                {ep.thumbnail ? (
                  <img
                    src={ep.thumbnail}
                    alt={ep.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Play className="w-4 h-4 text-zinc-700 m-auto" />
                )}

                {/* Progress bar overlay at bottom */}
                {progressPercent !== null && !isCompleted && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div 
                      className="h-full bg-purple-500" 
                      style={{ width: `${progressPercent}%` }} 
                    />
                  </div>
                )}

                {/* Checkmark overlay if completed */}
                {isCompleted && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                )}
              </div>

              {/* Right Column: Title and Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold truncate">
                    {ep.episodeNumber}. {ep.title}
                  </h4>
                  <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {ep.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 text-[9px] text-zinc-500 mt-1.5 font-mono">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{ep.runtime}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
