// src/pages/customer/watch/components/SettingsMenu.jsx
import { useState } from "react";

export default function SettingsMenu({
  playbackSpeed,
  onSpeedChange,
  activeSubtitle,
  onSubtitleChange,
  activeAudio,
  onAudioChange,
  isBuffering,
  onBufferingToggle,
  onClose,
  subtitleTracks = [],
  audioTracks = [],
  currentQuality = "Auto",
  availableQualities = [],
  onQualityChange = () => {},
  availableAudios = []
}) {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const speeds = [0.5, 1, 1.25, 1.5, 2];
  
  const subtitles = ["Off", ...(subtitleTracks || []).map(t => t.label)];
    
  const audios = availableAudios.length > 0
    ? availableAudios
    : (audioTracks || []).map(t => t.label);

  const qualities = availableQualities.length > 0 ? availableQualities : ["Auto"];

  return (
    <div
      className="absolute right-0 bottom-14 w-64 rounded-2xl p-4 z-50 border border-white/10 shadow-2xl backdrop-blur-xl animate-fade-in pointer-events-auto"
      style={{
        background: "rgba(10, 10, 20, 0.92)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)",
      }}
    >
      {/* Title */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/5 mb-3">
        <h4 className="text-xs font-black tracking-wider text-purple-400 uppercase">
          Playback Settings
        </h4>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white text-xs cursor-pointer"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4 text-left">
        {/* Playback Speed */}
        <div>
          <label className="text-[9px] font-bold text-white/50 uppercase tracking-widest block mb-1.5">
            Speed
          </label>
          <div className="flex flex-wrap gap-1">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  playbackSpeed === s
                    ? "bg-purple-600 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Quality Selector */}
        {qualities && qualities.length > 1 && (
          <div>
            <label className="text-[9px] font-bold text-white/50 uppercase tracking-widest block mb-1.5">
              Quality
            </label>
            <div className="flex flex-wrap gap-1">
              {qualities.map((q) => (
                <button
                  key={q}
                  onClick={() => onQualityChange(q)}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    currentQuality === q
                      ? "bg-purple-600 text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subtitles Selector */}
        <div>
          <label className="text-[9px] font-bold text-white/50 uppercase tracking-widest block mb-1.5">
            Subtitles
          </label>
          <div className="flex flex-wrap gap-1">
            {subtitles.map((sub) => (
              <button
                key={sub}
                onClick={() => onSubtitleChange(sub)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  activeSubtitle === sub
                    ? "bg-purple-600 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Track Selector */}
        {audios && audios.length > 1 && (
          <div>
            <label className="text-[9px] font-bold text-white/50 uppercase tracking-widest block mb-1.5">
              Audio
            </label>
            <div className="flex flex-col gap-1">
              {audios.map((aud) => (
                <button
                  key={aud}
                  onClick={() => onAudioChange(aud)}
                  className={`w-full px-2 py-1.5 rounded text-left text-[10px] font-medium transition-all cursor-pointer ${
                    activeAudio === aud
                      ? "bg-purple-600/30 text-purple-200 border border-purple-500/30"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent"
                  }`}
                >
                  {aud}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Help */}
        <div className="pt-2 border-t border-white/5">
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="w-full flex items-center justify-between text-[10px] font-bold text-white/70 hover:text-white uppercase tracking-wider cursor-pointer"
          >
            <span>Keyboard Shortcuts</span>
            <span className="text-purple-400 font-mono text-xs">{showShortcuts ? "▲" : "▼"}</span>
          </button>
          
          {showShortcuts && (
            <div className="mt-2 space-y-1.5 bg-black/40 rounded-xl p-2.5 border border-white/5 text-[9px] font-medium text-white/80 font-mono">
              <div className="flex justify-between">
                <span className="text-purple-300">Space</span>
                <span>Play / Pause</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">← →</span>
                <span>Seek ±5s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">↑ ↓</span>
                <span>Volume ±10%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">M</span>
                <span>Mute / Unmute</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">F</span>
                <span>Fullscreen</span>
              </div>
            </div>
          )}
        </div>

        {/* Buffer Simulation Toggle */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-white">Simulate Buffering</p>
            <p className="text-[8px] text-white/30">Test the buffering screen state</p>
          </div>
          <button
            onClick={onBufferingToggle}
            className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 cursor-pointer ${
              isBuffering ? "bg-purple-600" : "bg-zinc-800"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-all transform duration-300 ${
                isBuffering ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
