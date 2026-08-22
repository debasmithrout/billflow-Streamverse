// src/pages/customer/watch/components/PlayerLayout.jsx
import { useNavigate } from "react-router-dom";

export default function PlayerLayout({ title, children }) {
  const navigate = useNavigate();

  return (
    <div className="relative w-screen h-screen bg-black text-white flex flex-col justify-between select-none overflow-hidden">
      {/* Top Cinematic Overlay / Header */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center gap-4 transition-opacity duration-300 hover:opacity-100 opacity-90">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center cursor-pointer group"
          aria-label="Go Back"
        >
          <svg
            className="w-5 h-5 text-white transform group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-black text-purple-400">
            Now Streaming
          </span>
          <h1 className="text-lg font-black tracking-tight leading-none text-white mt-0.5">
            {title || "StreamVerse Premium"}
          </h1>
        </div>
      </header>

      {/* Main Player Screen Area */}
      <div className="flex-1 w-full h-full flex items-center justify-center relative bg-zinc-950">
        {children}
      </div>
    </div>
  );
}
