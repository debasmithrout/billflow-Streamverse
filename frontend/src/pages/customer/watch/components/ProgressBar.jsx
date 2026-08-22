// src/pages/customer/watch/components/ProgressBar.jsx
import { useRef, useState, useCallback, useEffect } from "react";
import { Film } from "lucide-react";

export default function ProgressBar({ 
  currentTime, 
  duration, 
  onChange,
  onScrubbingStateChange = () => {},
  storyboard = null,
  videoUrl = null
}) {
  const progressRef = useRef(null);
  const previewVideoRef = useRef(null);
  const [hoverPercent, setHoverPercent] = useState(null);
  const [hoverTime, setHoverTime] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Storyboard and Preview Video status states (Reset during render on prop change to satisfy eslint)
  const [prevImageUrl, setPrevImageUrl] = useState(storyboard?.imageUrl);
  const [spriteImageLoaded, setSpriteImageLoaded] = useState(false);
  const [spriteImageFailed, setSpriteImageFailed] = useState(false);

  const [prevVideoUrl, setPrevVideoUrl] = useState(videoUrl);
  const [previewFailed, setPreviewFailed] = useState(false);

  if (storyboard?.imageUrl !== prevImageUrl) {
    setPrevImageUrl(storyboard?.imageUrl);
    setSpriteImageLoaded(false);
    setSpriteImageFailed(false);
  }

  if (videoUrl !== prevVideoUrl) {
    setPrevVideoUrl(videoUrl);
    setPreviewFailed(false);
  }

  useEffect(() => {
    if (!storyboard?.imageUrl) return;

    let active = true;
    const img = new Image();
    img.src = storyboard.imageUrl;
    img.onload = () => {
      if (active) {
        setSpriteImageLoaded(true);
        setSpriteImageFailed(false);
      }
    };
    img.onerror = () => {
      if (active) {
        setSpriteImageLoaded(false);
        setSpriteImageFailed(true);
      }
    };
    return () => {
      active = false;
    };
  }, [storyboard?.imageUrl]);

  useEffect(() => {
    if (previewVideoRef.current && hoverTime !== null) {
      previewVideoRef.current.currentTime = hoverTime;
    }
  }, [hoverTime]);

  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = useCallback((secs) => {
    if (isNaN(secs)) return "00:00";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    const mm = m < 10 ? `0${m}` : m;
    const ss = s < 10 ? `0${s}` : s;
    if (h > 0) {
      return `${h}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
  }, []);

  const handlePointerDown = (e) => {
    if (!progressRef.current || duration <= 0) return;
    
    // Set pointer capture to track drags outside progress bar bounds
    progressRef.current.setPointerCapture(e.pointerId);
    setIsDragging(true);
    onScrubbingStateChange(true);

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const seekPercent = Math.max(0, Math.min(1, clickX / width));
    
    const activeTooltipWidth = (storyboard && spriteImageLoaded && !spriteImageFailed) ? storyboard.frameWidth : 112;
    const halfWidth = activeTooltipWidth / 2;
    const clampedX = Math.max(halfWidth, Math.min(width - halfWidth, clickX));

    setHoverPercent(seekPercent * 100);
    setHoverTime(seekPercent * duration);
    setTooltipPos(clampedX);
    onChange(seekPercent * duration);
  };

  const handlePointerMove = (e) => {
    if (!progressRef.current || duration <= 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const width = rect.width;
    const seekPercent = Math.max(0, Math.min(1, hoverX / width));

    const activeTooltipWidth = (storyboard && spriteImageLoaded && !spriteImageFailed) ? storyboard.frameWidth : 112;
    const halfWidth = activeTooltipWidth / 2;
    const clampedX = Math.max(halfWidth, Math.min(width - halfWidth, hoverX));

    setHoverPercent(seekPercent * 100);
    setHoverTime(seekPercent * duration);
    setTooltipPos(clampedX);

    if (isDragging) {
      onChange(seekPercent * duration);
    }
  };

  const handlePointerUp = (e) => {
    if (isDragging) {
      try {
        progressRef.current.releasePointerCapture(e.pointerId);
      } catch (err) {
        console.warn("Failed to release pointer capture:", err);
      }
      setIsDragging(false);
      onScrubbingStateChange(false);
    }
  };

  const handlePointerCancel = (e) => {
    if (isDragging) {
      try {
        progressRef.current.releasePointerCapture(e.pointerId);
      } catch (err) {
        console.warn("Failed to release pointer capture:", err);
      }
      setIsDragging(false);
      onScrubbingStateChange(false);
      setHoverPercent(null);
      setHoverTime(null);
    }
  };

  const leftPos = tooltipPos;

  // Sprite frames columns and rows calculations
  let col = 0;
  let row = 0;
  if (storyboard && hoverTime !== null) {
    const interval = storyboard.interval || 10;
    const columns = storyboard.columns || 5;
    const frameIndex = Math.floor(hoverTime / interval);
    col = frameIndex % columns;
    row = Math.floor(frameIndex / columns);
  }

  return (
    <div
      role="slider"
      aria-label="Video timeline scrubber"
      aria-valuenow={Math.round(currentTime)}
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      className="w-full py-3 cursor-pointer group flex items-center relative select-none pointer-events-auto touch-none"
      ref={progressRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={() => {
        if (!isDragging) {
          setHoverPercent(null);
          setHoverTime(null);
        }
      }}
    >
      {/* Time Hover Tooltip */}
      {hoverTime !== null && (
        <div
          className="absolute -top-32 transform -translate-x-1/2 bg-zinc-950/95 border border-white/10 p-1.5 rounded-xl text-[10px] font-black text-white pointer-events-none shadow-2xl backdrop-blur-md z-50 flex flex-col items-center gap-1.5 transition-all duration-75"
          style={{ left: `${leftPos}px` }}
        >
          {/* Real Storyboard Frame Preview */}
          {storyboard && spriteImageLoaded && !spriteImageFailed ? (
            <div
              className="rounded-lg overflow-hidden border border-white/10 shadow-2xl relative bg-zinc-900"
              style={{
                backgroundImage: `url(${storyboard.imageUrl})`,
                backgroundPosition: `-${col * storyboard.frameWidth}px -${row * storyboard.frameHeight}px`,
                width: `${storyboard.frameWidth}px`,
                height: `${storyboard.frameHeight}px`,
                backgroundSize: `${storyboard.frameWidth * storyboard.columns}px ${storyboard.frameHeight * (storyboard.rows || Math.ceil((duration / (storyboard.interval || 10)) / storyboard.columns))}px`,
              }}
            />
          ) : videoUrl && !previewFailed ? (
            <div className="w-28 h-16 bg-zinc-900 rounded-lg overflow-hidden border border-white/5 relative">
              <video
                ref={previewVideoRef}
                src={videoUrl}
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
                style={{ pointerEvents: "none" }}
                onError={() => setPreviewFailed(true)}
              />
            </div>
          ) : (
            /* Mini Preview Thumbnail Placeholder Fallback */
            <div className="w-28 h-16 bg-zinc-900 rounded-lg overflow-hidden border border-white/5 flex items-center justify-center relative">
              <Film className="w-5 h-5 text-white/20" />
              <span className="absolute bottom-1 right-1 text-[8px] px-1 py-0.2 rounded bg-black/70 text-zinc-400">
                Preview
              </span>
            </div>
          )}
          <span className="text-xs font-mono font-bold tracking-tight">{formatTime(hoverTime)}</span>
        </div>
      )}

      {/* Scrubber Track */}
      <div className="w-full h-1 bg-white/20 rounded-full group-hover:h-1.5 transition-all relative overflow-hidden">
        {/* Hover Highlight */}
        {hoverPercent !== null && (
          <div
            className="absolute top-0 bottom-0 left-0 bg-white/15 pointer-events-none rounded-full"
            style={{ width: `${hoverPercent}%` }}
          />
        )}

        {/* Current Active Progress */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-purple-600 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Scrubber Handle Node */}
      <div
        className="absolute w-3 h-3 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md shadow-black/50"
        style={{ left: `calc(${percent}% - 6px)` }}
      />
    </div>
  );
}
