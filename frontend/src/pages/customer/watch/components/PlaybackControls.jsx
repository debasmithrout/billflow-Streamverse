// src/pages/customer/watch/components/PlaybackControls.jsx
export default function PlaybackControls({ isPlaying, onPlayToggle, onRewind, onForward }) {
  return (
    <div className="flex items-center gap-4 pointer-events-auto">
      {/* Rewind 10s */}
      <button
        onClick={onRewind}
        className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all flex items-center justify-center cursor-pointer active:scale-90 group"
        title="Rewind 10 seconds"
      >
        <svg
          className="w-5 h-5 transform group-active:-rotate-45 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12.5 20.5A8.5 8.5 0 1121 12m-3-3l3 3m0 0l3-3"
          />
          <text
            x="12.5"
            y="15"
            fontSize="7.5"
            fontWeight="black"
            fill="currentColor"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
          >
            10
          </text>
        </svg>
      </button>

      {/* Main Play / Pause */}
      <button
        onClick={onPlayToggle}
        className="p-2.5 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition-all flex items-center justify-center cursor-pointer active:scale-95"
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Forward 10s */}
      <button
        onClick={onForward}
        className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all flex items-center justify-center cursor-pointer active:scale-90 group"
        title="Forward 10 seconds"
      >
        <svg
          className="w-5 h-5 transform group-active:rotate-45 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.5 20.5a8.5 8.5 0 10-8.5-8.5m3-3l-3 3m0 0l-3-3"
          />
          <text
            x="11.5"
            y="15"
            fontSize="7.5"
            fontWeight="black"
            fill="currentColor"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
          >
            10
          </text>
        </svg>
      </button>
    </div>
  );
}
