// src/pages/customer/watch/components/PlayerControls.jsx
import { useEffect, useState, useRef } from "react";
import PlayerTopBar from "./PlayerTopBar";
import PlayerBottomBar from "./PlayerBottomBar";

export default function PlayerControls({
  content,
  currentTime,
  duration,
  videoUrl = null,
  isPlaying,
  volume,
  isMuted,
  playbackSpeed,
  activeSubtitle,
  activeAudio,
  isBuffering,
  isFullscreen,
  isPiPSupported = false,
  isPiP = false,
  onPlayToggle,
  onRewind,
  onForward,
  onVolumeChange,
  onMuteToggle,
  onSpeedChange,
  onSubtitleChange,
  onAudioChange,
  onBufferingToggle,
  onFullscreenToggle,
  onPiPToggle = () => {},
  onShowToast = () => {},
  onTimeSeek,
  isSidebarOpen = false,
  onToggleSidebar = () => {},
  currentQuality = "Auto",
  availableQualities = [],
  onQualityChange = () => {},
  availableAudios = []
}) {
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const timerRef = useRef(null);
  const clickTimeoutRef = useRef(null);

  const [prevPlaying, setPrevPlaying] = useState(isPlaying);
  const [prevBuffering, setPrevBuffering] = useState(isBuffering);

  // Reset visibility during render when play states toggle
  if (isPlaying !== prevPlaying || isBuffering !== prevBuffering) {
    setPrevPlaying(isPlaying);
    setPrevBuffering(isBuffering);
    setControlsVisible(true);
  }

  // Auto-hide controls and mouse cursor after 3 seconds of inactivity (only when playing and no active menu/scrubbing is open)
  const resetTimer = () => {
    setControlsVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    const isMenuOpen = isSidebarOpen || showSettings || isScrubbing;

    if (isPlaying && !isBuffering && !isMenuOpen) {
      timerRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    }
  };

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const isMenuOpen = isSidebarOpen || showSettings || isScrubbing;

    if (isPlaying && !isBuffering && !isMenuOpen) {
      timerRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, isBuffering, isSidebarOpen, showSettings, isScrubbing]);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  const handleMouseMove = () => {
    resetTimer();
  };

  const handleOverlayClick = () => {
    if (!controlsVisible) {
      setControlsVisible(true);
      resetTimer();
      return;
    }

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      onFullscreenToggle();
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        onPlayToggle();
        clickTimeoutRef.current = null;
      }, 250);
    }
  };

  return (
    <div
      className={`absolute inset-0 w-full h-full z-30 transition-all duration-500 flex flex-col justify-between select-none pointer-events-none ${
        controlsVisible ? "opacity-100" : "opacity-0"
      } ${isPlaying && !controlsVisible ? "cursor-none" : "cursor-default"}`}
      onMouseMove={handleMouseMove}
    >
      {/* 1. Gradient Overlay (Cinema shadow) */}
      <div
        className={`absolute inset-0 bg-black/30 pointer-events-none transition-opacity duration-500 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* 2. Top Bar */}
      <PlayerTopBar
        title={content.title}
        year={content.year}
        rating={content.rating}
        runtime={content.runtime}
        activeSubtitle={activeSubtitle}
        activeAudio={activeAudio}
      />

      {/* 3. Center Click-To-Play & Buffering State Overlay */}
      <div
        onClick={handleOverlayClick}
        className="absolute inset-0 flex items-center justify-center pointer-events-auto cursor-pointer z-10"
      >
        {isBuffering ? (
          /* Buffer spinner */
          <div className="p-5 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm pointer-events-none flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
            <span className="text-[9px] font-black text-purple-400 tracking-widest uppercase mt-1">
              Buffering
            </span>
          </div>
        ) : (
          /* Play/Pause Animation feedback */
          <div
            className={`w-20 h-20 rounded-full bg-black/50 border border-white/10 backdrop-blur-xs flex items-center justify-center text-white transition-all duration-300 transform ${
              isPlaying ? "scale-90 opacity-0" : "scale-100 opacity-100 hover:scale-105 hover:bg-black/60"
            }`}
          >
            {isPlaying ? (
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 fill-current translate-x-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* 4. Bottom Controls */}
      <PlayerBottomBar
        content={content}
        currentTime={currentTime}
        duration={duration}
        videoUrl={videoUrl}
        isPlaying={isPlaying}
        volume={volume}
        isMuted={isMuted}
        playbackSpeed={playbackSpeed}
        activeSubtitle={activeSubtitle}
        activeAudio={activeAudio}
        isBuffering={isBuffering}
        isFullscreen={isFullscreen}
        isPiPSupported={isPiPSupported}
        isPiP={isPiP}
        onPlayToggle={onPlayToggle}
        onRewind={onRewind}
        onForward={onForward}
        onVolumeChange={onVolumeChange}
        onMuteToggle={onMuteToggle}
        onSpeedChange={onSpeedChange}
        onSubtitleChange={onSubtitleChange}
        onAudioChange={onAudioChange}
        onBufferingToggle={onBufferingToggle}
        onFullscreenToggle={onFullscreenToggle}
        onPiPToggle={onPiPToggle}
        onShowToast={onShowToast}
        onTimeSeek={onTimeSeek}
        isSeries={content.type === "series"}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={onToggleSidebar}
        subtitleTracks={content.subtitles}
        audioTracks={content.audioTracks}
        currentQuality={currentQuality}
        availableQualities={availableQualities}
        onQualityChange={onQualityChange}
        availableAudios={availableAudios}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        onScrubbingStateChange={setIsScrubbing}
      />
    </div>
  );
}
