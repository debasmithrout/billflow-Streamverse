// src/pages/customer/watch/components/VolumeControl.jsx
import { useState } from "react";

export default function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
}) {
  const [sliderHover, setSliderHover] = useState(false);

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    onVolumeChange(val);
  };

  return (
    <div
      className="flex items-center gap-1.5 group/volume relative pointer-events-auto"
      onMouseEnter={() => setSliderHover(true)}
      onMouseLeave={() => setSliderHover(false)}
    >
      {/* Mute/Volume Icon Button */}
      <button
        onClick={onMuteToggle}
        className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all flex items-center justify-center cursor-pointer active:scale-90"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted || volume === 0 ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : volume < 0.5 ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.071 4.929a10 10 0 010 14.142" />
          </svg>
        )}
      </button>

      {/* Expandable slider input container */}
      <div
        className={`overflow-hidden transition-all duration-300 flex items-center h-5 ${
          sliderHover ? "w-20 sm:w-24 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={handleSliderChange}
          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500 outline-none"
          style={{
            background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`,
          }}
        />
      </div>
    </div>
  );
}
