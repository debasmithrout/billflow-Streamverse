// src/pages/customer/watch/components/VideoPlaceholder.jsx
import { useState } from "react";

export default function VideoPlaceholder({ poster, isPlaying, isBuffering }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {/* Cinematic Poster background */}
      {!imgError && poster ? (
        <div className="relative w-full h-full">
          <img
            src={poster}
            alt="Cinematic Video Content"
            className={`w-full h-full object-cover select-none pointer-events-none transition-all duration-[2000ms] ${
              isPlaying && !isBuffering ? "scale-[1.04] blur-xs brightness-90" : "scale-100 brightness-75"
            }`}
            onError={() => setImgError(true)}
          />
          {/* Subtle vignette/cinematic shadow overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
          <div className="absolute inset-0 bg-radial-vignette" />
        </div>
      ) : (
        /* Fallback premium space gradient */
        <div className="w-full h-full bg-gradient-to-br from-purple-950 via-zinc-950 to-black relative">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="text-4xl" role="img" aria-label="Logo">
              🎬
            </span>
            <span className="text-xs text-white/20 tracking-widest font-black uppercase">
              StreamVerse Engine Viewport
            </span>
          </div>
        </div>
      )}

      {/* Screen glow simulation when playing */}
      {isPlaying && !isBuffering && (
        <div className="absolute inset-0 bg-purple-500/5 mix-blend-color-dodge pointer-events-none animate-pulse duration-3000" />
      )}
    </div>
  );
}
