// src/pages/customer/watch/components/PlayerBottomBar.jsx
import { useRef, useEffect } from "react";
import { Share2 } from "lucide-react";
import ProgressBar from "./ProgressBar";
import PlaybackControls from "./PlaybackControls";
import VolumeControl from "./VolumeControl";
import TimeDisplay from "./TimeDisplay";
import SettingsMenu from "./SettingsMenu";
import { buildShareUrl } from "../../../../utils/contentHelper";

export default function PlayerBottomBar({
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
  isSeries = false,
  isSidebarOpen = false,
  onToggleSidebar = () => {},
  subtitleTracks = [],
  audioTracks = [],
  currentQuality = "Auto",
  availableQualities = [],
  onQualityChange = () => {},
  availableAudios = [],
  showSettings = false,
  setShowSettings = () => {},
  onScrubbingStateChange = () => {}
}) {
  const settingsRef = useRef(null);

  // Close settings dropup when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setShowSettings]);

  const handleSubtitleShortcut = () => {
    // Quick toggle between English and Off
    const nextSub = activeSubtitle === "English" ? "Off" : "English";
    onSubtitleChange(nextSub);
  };

  const handleShareClick = async () => {
    const shareUrl = buildShareUrl(content, currentTime);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: content?.title || "StreamVerse Video",
          text: `Watch ${content?.title || "this content"} on StreamVerse`,
          url: shareUrl
        });
        onShowToast("Shared");
      } catch (err) {
        if (err.name !== "AbortError") {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        onShowToast("Link copied");
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
      });
  };

  return (
    <footer className="absolute bottom-0 left-0 right-0 z-40 p-6 sm:p-8 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-2 select-none">
      {/* 1. Scrubber Timeline */}
      <ProgressBar
        currentTime={currentTime}
        duration={duration}
        onChange={onTimeSeek}
        onScrubbingStateChange={onScrubbingStateChange}
        storyboard={content?.storyboard}
        videoUrl={videoUrl}
      />

      {/* 2. Controls Panel */}
      <div className="flex items-center justify-between mt-1">
        {/* Left Section: Controls & Time & Volume */}
        <div className="flex items-center gap-4 sm:gap-6">
          <PlaybackControls
            isPlaying={isPlaying}
            onPlayToggle={onPlayToggle}
            onRewind={onRewind}
            onForward={onForward}
          />
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={onVolumeChange}
            onMuteToggle={onMuteToggle}
          />
          <TimeDisplay currentTime={currentTime} duration={duration} />
        </div>

        {/* Right Section: Subtitle, Settings, Share, Fullscreen */}
        <div className="flex items-center gap-3 sm:gap-4 relative">
          {/* Episodes List Drawer Toggle (only for TV Series) */}
          {isSeries && (
            <button
              onClick={onToggleSidebar}
              className={`p-2 rounded-full hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer active:scale-90 pointer-events-auto ${
                isSidebarOpen ? "text-purple-400 bg-white/5" : "text-white/80 hover:text-white"
              }`}
              title="Episodes"
              aria-label="Toggle episode sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Subtitles Quick Toggle */}
          <button
            onClick={handleSubtitleShortcut}
            className={`p-2 rounded-full hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer active:scale-90 pointer-events-auto ${
              activeSubtitle !== "Off" ? "text-purple-400" : "text-white/80 hover:text-white"
            }`}
            title="Toggle English Subtitles"
            aria-label="Toggle subtitles"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </button>

          {/* Settings Trigger */}
          <div ref={settingsRef} className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer active:scale-90 pointer-events-auto ${
                showSettings ? "text-purple-400 bg-white/5" : "text-white/80 hover:text-white"
              }`}
              title="Playback Settings"
              aria-label="Playback settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {showSettings && (
              <SettingsMenu
                playbackSpeed={playbackSpeed}
                onSpeedChange={onSpeedChange}
                activeSubtitle={activeSubtitle}
                onSubtitleChange={onSubtitleChange}
                activeAudio={activeAudio}
                onAudioChange={onAudioChange}
                isBuffering={isBuffering}
                onBufferingToggle={onBufferingToggle}
                onClose={() => setShowSettings(false)}
                subtitleTracks={subtitleTracks}
                audioTracks={audioTracks}
                currentQuality={currentQuality}
                availableQualities={availableQualities}
                onQualityChange={onQualityChange}
                availableAudios={availableAudios}
              />
            )}
          </div>

          {/* Picture-in-Picture Trigger */}
          {isPiPSupported && (
            <button
              onClick={onPiPToggle}
              className={`p-2 rounded-full hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer active:scale-90 pointer-events-auto ${
                isPiP ? "text-purple-400" : "text-white/80 hover:text-white"
              }`}
              title={isPiP ? "Exit Picture-in-Picture" : "Picture-in-Picture"}
              aria-label="Toggle picture-in-picture"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <rect x="11" y="10" width="9" height="7" rx="1" />
              </svg>
            </button>
          )}

          {/* Share Trigger */}
          <button
            onClick={handleShareClick}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all flex items-center justify-center cursor-pointer active:scale-90 pointer-events-auto"
            title="Share with current timestamp"
            aria-label="Share video link"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={onFullscreenToggle}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all flex items-center justify-center cursor-pointer active:scale-90 pointer-events-auto"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 14h6v6M10 14L4 20M20 14h-6v6M14 14l6 6M4 10h6V4M10 10L4 4M20 10h-6V4M14 10l6-6" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
}
