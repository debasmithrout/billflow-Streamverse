// src/pages/customer/watch/components/PlayerEngine.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Play } from "lucide-react";
import NotFoundContent from "./NotFoundContent";
import PlayerControls from "./PlayerControls";
import useWatchProgress from "../../../../hooks/useWatchProgress";

const isHlsSource = (url) => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.includes(".m3u8") || lowerUrl.includes("application/x-mpegurl") || lowerUrl.includes("vnd.apple.mpegurl");
};

let HlsModule = null;
const loadHls = async () => {
  if (!HlsModule) {
    HlsModule = await import("hls.js");
  }
  return HlsModule.default;
};

export default function PlayerEngine({
  content,
  isSidebarOpen = false,
  onToggleSidebar = () => {},
  sidebarComponent = null,
  onLoadNextEpisode = () => {}
}) {
  const playerRef = useRef(null);
  const videoRef = useRef(null);

  // Core Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(content?.duration || 7200);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVideoError, setIsVideoError] = useState(false);

  // Tracks Selection
  const [activeSubtitle, setActiveSubtitle] = useState(() => {
    if (content?.subtitles && Array.isArray(content.subtitles)) {
      const defaultSub = content.subtitles.find(s => s.default);
      if (defaultSub) return defaultSub.label;
    }
    return "Off";
  });
  const [activeAudio, setActiveAudio] = useState("English (Atmos)");
  const [activeLanguage, setActiveLanguage] = useState("Hindi");

  // Adaptive Streaming & Quality States
  const [currentQuality, setCurrentQuality] = useState(() => {
    return content?.audioSources ? "1080p" : "Auto";
  });
  const [availableQualities, setAvailableQualities] = useState([]);
  const [availableAudios, setAvailableAudios] = useState([]);

  const hlsRef = useRef(null);
  const hlsLevelsRef = useRef([]);
  const lastTimeRef = useRef(0);
  const wasPlayingRef = useRef(false);

  // Skip Timings Overlay State
  const [activeSkipType, setActiveSkipType] = useState(null); // "intro", "recap", "credits"
  const [skipTargetTime, setSkipTargetTime] = useState(null);

  // Next Episode Autoplay State
  const [showNextCountdown, setShowNextCountdown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(10);
  const countdownIntervalRef = useRef(null);

  // Picture-in-Picture State
  const [isPiP, setIsPiP] = useState(false);
  const isPiPSupported = typeof document !== "undefined" && document.pictureInPictureEnabled;

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error("Picture-in-Picture failed:", err);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPiP = () => setIsPiP(true);
    const handleLeavePiP = () => setIsPiP(false);

    video.addEventListener("enterpictureinpicture", handleEnterPiP);
    video.addEventListener("leavepictureinpicture", handleLeavePiP);

    return () => {
      video.removeEventListener("enterpictureinpicture", handleEnterPiP);
      video.removeEventListener("leavepictureinpicture", handleLeavePiP);
    };
  }, []);

  // Initialize Isolated Watch Progress Hook
  const { getProgress, saveProgress } = useWatchProgress(content?.id, content?.type);

  // Resume Watching Prompt State (Initialized dynamically on mount)
  const [savedProgress, setSavedProgress] = useState(() => {
    const saved = getProgress();
    if (!saved) return null;
    const totalDuration = content?.duration || saved.duration || 0;
    if (saved.currentTime > 5 && (totalDuration <= 0 || saved.currentTime < totalDuration - 10)) {
      return saved;
    }
    return null;
  });
  const [showResumePrompt, setShowResumePrompt] = useState(() => {
    if (content?.sharedTime != null) return false;
    return !!savedProgress;
  });

  // Adjust states during render when content ID changes (avoids setState in effect linter error)
  const [prevContentId, setPrevContentId] = useState(content?.id);
  const [hasAppliedSharedTime, setHasAppliedSharedTime] = useState(false);

  if (content?.id !== prevContentId) {
    setPrevContentId(content?.id);
    setHasAppliedSharedTime(false);
    
    const newProgress = getProgress();
    const totalDuration = content?.duration || newProgress?.duration || 0;
    const isValidProgress = newProgress && newProgress.currentTime > 5 && (totalDuration <= 0 || newProgress.currentTime < totalDuration - 10);
    setSavedProgress(isValidProgress ? newProgress : null);
    setShowResumePrompt(content?.sharedTime == null && !!isValidProgress);

    if (content?.subtitles && Array.isArray(content.subtitles)) {
      const defaultSub = content.subtitles.find(s => s.default);
      setActiveSubtitle(defaultSub ? defaultSub.label : "Off");
    } else {
      setActiveSubtitle("Off");
    }
  }

  // Apply shared time if available once video state allows
  useEffect(() => {
    if (videoRef.current && content?.sharedTime != null && !hasAppliedSharedTime) {
      if (videoRef.current.readyState >= 1) {
        const targetTime = Math.min(content.sharedTime, videoRef.current.duration || content.duration || 7200);
        videoRef.current.currentTime = targetTime;
        setCurrentTime(targetTime);
        setHasAppliedSharedTime(true);
        setIsPlaying(true);
      }
    }
  }, [content?.sharedTime, hasAppliedSharedTime, content?.duration]);

  // Toast Notification State
  const toastTimeoutRef = useRef(null);
  const [toastMessage, setToastMessage] = useState(null);

  const handleShowToast = (msg) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // 1A. Autoplay Next Episode countdown effect
  useEffect(() => {
    if (!showNextCountdown) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      return;
    }

    countdownIntervalRef.current = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          setShowNextCountdown(false);
          onLoadNextEpisode();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [showNextCountdown, onLoadNextEpisode]);

  // 1. Sync play/pause state with video element
  useEffect(() => {
    if (!videoRef.current || showResumePrompt) return;
    if (isPlaying) {
      videoRef.current.play().catch((err) => {
        console.warn("Playback play request failed:", err);
        setIsPlaying(false);
      });
    } else {
      videoRef.current.pause();
      // Save progress immediately on pause
      saveProgress(videoRef.current.currentTime, videoRef.current.duration);
    }
  }, [isPlaying, showResumePrompt, saveProgress]);

  // 2. Save progress periodically every 10 seconds while playing
  useEffect(() => {
    if (!isPlaying || isBuffering || showResumePrompt) return;

    const interval = setInterval(() => {
      if (videoRef.current) {
        saveProgress(videoRef.current.currentTime, videoRef.current.duration);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isPlaying, isBuffering, showResumePrompt, saveProgress]);

  // 3. Save progress on page unload (tab close / reload)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (videoRef.current && !showResumePrompt) {
        saveProgress(videoRef.current.currentTime, videoRef.current.duration);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [showResumePrompt, saveProgress]);

  // 4. Save progress on component unmount (route change)
  useEffect(() => {
    const currentVideo = videoRef.current;
    return () => {
      if (currentVideo && !showResumePrompt) {
        saveProgress(currentVideo.currentTime, currentVideo.duration);
      }
    };
  }, [showResumePrompt, saveProgress]);

  // 6. Sync volume & mute state with video element
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = volume;
    videoRef.current.muted = isMuted;
  }, [volume, isMuted]);

  // 7. Sync playback rate with video element
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  const destroyHls = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  };

  // Resolve current sources list
  const getSourcesList = useCallback(() => {
    if (content?.videoSources && Array.isArray(content.videoSources) && content.videoSources.length > 0) {
      return content.videoSources;
    }
    if (content?.videoUrl) {
      return [{ quality: "Auto", url: content.videoUrl, type: isHlsSource(content.videoUrl) ? "application/x-mpegURL" : "video/mp4" }];
    }
    return [];
  }, [content.videoSources, content.videoUrl]);

  const sourcesList = getSourcesList();
  
  let resolvedActiveUrl = "";
  if (content?.audioSources) {
    let q = currentQuality;
    const availableQuals = Object.keys(content.audioSources[activeLanguage] || {});
    if (q === "Auto") {
      q = availableQuals.includes("1080p") ? "1080p" : (availableQuals[0] || "");
    }
    resolvedActiveUrl = content.audioSources[activeLanguage]?.[q] || "";
  } else if (sourcesList.length > 0) {
    const hlsSource = sourcesList.find(s => isHlsSource(s.url));
    if (hlsSource) {
      resolvedActiveUrl = hlsSource.url;
    } else {
      const matched = sourcesList.find(s => s.quality === currentQuality) || sourcesList[0];
      resolvedActiveUrl = matched ? matched.url : "";
    }
  }

  const isHls = isHlsSource(resolvedActiveUrl);
  
  const resolvedQualities = content?.audioSources
    ? Object.keys(content.audioSources[activeLanguage] || {})
    : (isHls
        ? (availableQualities.length > 0 ? availableQualities : ["Auto"])
        : Array.from(new Set(sourcesList.map(s => s.quality).filter(Boolean))));

  const resolvedAudios = content?.audioSources
    ? Object.keys(content.audioSources)
    : (isHls ? availableAudios : []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !resolvedActiveUrl) return;

    destroyHls();
    setIsVideoError(false);

    if (isHls) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = resolvedActiveUrl;
        Promise.resolve().then(() => {
          setAvailableQualities(["Auto"]);
        });
      } else {
        let active = true;
        let mediaRecoveryCount = 0;
        loadHls().then((HlsClass) => {
          if (!active || !videoRef.current) return;
          if (!HlsClass.isSupported()) {
            console.error("Hls.js is not supported in this browser.");
            setIsVideoError(true);
            return;
          }

          const hls = new HlsClass({
            autoStartLoad: true,
            capLevelToPlayerSize: false,
          });

          hlsRef.current = hls;

          const updateAudioTracks = () => {
            if (!active) return;
            const audioTracks = hls.audioTracks || [];
            const getAudioLabel = (t) => {
              if (!t) return "Unknown";
              const lang = (t.lang || "").toLowerCase();
              if (lang === "hin" || lang === "hindi") return "Hindi";
              if (lang === "eng" || lang === "english") return "English";
              return t.name || t.lang || "Unknown";
            };
            const audioLabels = audioTracks.map(getAudioLabel);
            setAvailableAudios(audioLabels);
            if (audioLabels.length > 0) {
              const currentTrackIdx = hls.audioTrack;
              const currentTrackName = getAudioLabel(audioTracks[currentTrackIdx]) || audioLabels[0];
              setActiveAudio(currentTrackName);
            }
          };

          hls.on(HlsClass.Events.MANIFEST_PARSED, () => {
            if (!active) return;
            
            const levels = hls.levels || [];
            hlsLevelsRef.current = levels.map((lvl, idx) => {
              const height = lvl.height || 0;
              const label = height > 0 ? `${height}p` : `Level ${idx + 1}`;
              return { index: idx, label, height };
            });

            const qualityLabels = ["Auto", ...hlsLevelsRef.current.map(l => l.label)];
            setAvailableQualities(qualityLabels);

            updateAudioTracks();
          });

          hls.on(HlsClass.Events.AUDIO_TRACKS_UPDATED, () => {
            updateAudioTracks();
          });

          hls.on(HlsClass.Events.ERROR, (event, data) => {
            if (!active) return;
            if (data.fatal) {
              switch (data.type) {
                case HlsClass.ErrorTypes.NETWORK_ERROR:
                  console.warn("HLS network error, trying to recover...", data);
                  hls.startLoad();
                  break;
                case HlsClass.ErrorTypes.MEDIA_ERROR:
                  mediaRecoveryCount++;
                  if (mediaRecoveryCount <= 3) {
                    console.warn(`HLS media error (attempt ${mediaRecoveryCount}/3), trying to recover...`, data);
                    hls.recoverMediaError();
                  } else {
                    console.error("Fatal HLS error: too many media recovery attempts.", data);
                    setIsVideoError(true);
                    destroyHls();
                  }
                  break;
                default:
                  console.error("Fatal HLS error, cannot recover.", data);
                  setIsVideoError(true);
                  destroyHls();
                  break;
              }
            }
          });

          hls.loadSource(resolvedActiveUrl);
          hls.attachMedia(video);
        }).catch(err => {
          console.error("Hls.js dynamic loading failed", err);
          setIsVideoError(true);
        });

        return () => {
          active = false;
        };
      }
    } else {
      video.src = resolvedActiveUrl;
    }
  }, [resolvedActiveUrl, isHls]);

  useEffect(() => {
    return () => {
      destroyHls();
    };
  }, []);

  const syncSubtitles = useCallback(() => {
    if (!videoRef.current) return;
    const tracks = videoRef.current.textTracks;
    let found = false;
    for (let i = 0; i < tracks.length; i++) {
      if (tracks[i].label === activeSubtitle) {
        tracks[i].mode = "showing";
        found = true;
      } else {
        tracks[i].mode = "disabled";
      }
    }
    if (!found && activeSubtitle !== "Off") {
      setActiveSubtitle("Off");
    }
  }, [activeSubtitle]);

  // 7A. Sync active subtitle track with native video element textTracks
  useEffect(() => {
    syncSubtitles();
  }, [activeSubtitle, syncSubtitles]);

  const handleQualityChange = (qualityLabel) => {
    if (qualityLabel === currentQuality) return;

    if (!isHlsSource(resolvedActiveUrl)) {
      if (videoRef.current) {
        lastTimeRef.current = videoRef.current.currentTime;
        wasPlayingRef.current = !videoRef.current.paused;
      }
      setCurrentQuality(qualityLabel);
    } else {
      setCurrentQuality(qualityLabel);
      if (hlsRef.current) {
        if (qualityLabel === "Auto") {
          hlsRef.current.currentLevel = -1;
        } else {
          const levelIdx = hlsLevelsRef.current.findIndex(l => l.label === qualityLabel);
          if (levelIdx !== -1) {
            hlsRef.current.currentLevel = levelIdx;
          }
        }
      }
    }
  };

  const handleAudioChange = (audioLabel) => {
    if (content?.audioSources) {
      if (audioLabel === activeLanguage) return;
      if (videoRef.current) {
        lastTimeRef.current = videoRef.current.currentTime;
        wasPlayingRef.current = !videoRef.current.paused;
      }
      setActiveLanguage(audioLabel);
      return;
    }

    if (audioLabel === activeAudio) return;
    setActiveAudio(audioLabel);

    if (hlsRef.current) {
      const tracks = hlsRef.current.audioTracks || [];
      const getAudioLabel = (t) => {
        if (!t) return "";
        const lang = (t.lang || "").toLowerCase();
        if (lang === "hin" || lang === "hindi") return "Hindi";
        if (lang === "eng" || lang === "english") return "English";
        return t.name || t.lang || "";
      };
      const trackIdx = tracks.findIndex(t => getAudioLabel(t) === audioLabel);
      if (trackIdx !== -1) {
        hlsRef.current.audioTrack = trackIdx;
      }
    } else if (videoRef.current && videoRef.current.audioTracks) {
      const nativeTracks = Array.from(videoRef.current.audioTracks);
      const getAudioLabel = (t) => {
        if (!t) return "";
        const lang = (t.language || t.lang || "").toLowerCase();
        if (lang === "hin" || lang === "hindi") return "Hindi";
        if (lang === "eng" || lang === "english") return "English";
        return t.label || t.language || "";
      };
      nativeTracks.forEach((t) => {
        t.enabled = (getAudioLabel(t) === audioLabel);
      });
    }
  };

  // 8. Browser Fullscreen API Integration
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!playerRef.current) return;

    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable full-screen mode:", err.message);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // 9. HTML5 Event Handlers
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = Math.floor(videoRef.current.currentTime);
    setCurrentTime(time);

    // Skip Intro Check
    if (content.skipIntroStart != null && content.skipIntroEnd != null && 
        time >= content.skipIntroStart && time < content.skipIntroEnd) {
      setActiveSkipType("intro");
      setSkipTargetTime(content.skipIntroEnd);
    }
    // Skip Recap Check
    else if (content.skipRecapStart != null && content.skipRecapEnd != null && 
             time >= content.skipRecapStart && time < content.skipRecapEnd) {
      setActiveSkipType("recap");
      setSkipTargetTime(content.skipRecapEnd);
    }
    // Skip Credits Check
    else if (content.skipCreditsStart != null && time >= content.skipCreditsStart) {
      setActiveSkipType("credits");
      setSkipTargetTime(duration);
    }
    else {
      setActiveSkipType(null);
      setSkipTargetTime(null);
    }
  };

  const handleDurationChange = () => {
    if (!videoRef.current) return;
    const newDuration = videoRef.current.duration;
    if (newDuration && !isNaN(newDuration)) {
      setDuration(Math.floor(newDuration));
    }
  };

  const handleLoadedMetadata = () => {
    handleDurationChange();
    
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }

    // Restore state after MP4 quality switch
    if (lastTimeRef.current > 0) {
      if (videoRef.current) {
        videoRef.current.currentTime = lastTimeRef.current;
        lastTimeRef.current = 0;
        
        if (wasPlayingRef.current) {
          videoRef.current.play().catch(err => console.warn(err));
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
        }
      }
      syncSubtitles();
      return;
    }

    if (content?.sharedTime != null && !hasAppliedSharedTime && videoRef.current) {
      const targetTime = Math.min(content.sharedTime, videoRef.current.duration || content.duration || 7200);
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
      setHasAppliedSharedTime(true);
      setIsPlaying(true);
    }

    // Read native audio tracks for Safari/WebKit/native HLS support
    if (videoRef.current && videoRef.current.audioTracks && videoRef.current.audioTracks.length > 0) {
      const nativeTracks = Array.from(videoRef.current.audioTracks);
      const getAudioLabel = (t) => {
        if (!t) return "Unknown";
        const lang = (t.language || t.lang || "").toLowerCase();
        if (lang === "hin" || lang === "hindi") return "Hindi";
        if (lang === "eng" || lang === "english") return "English";
        return t.label || t.language || "Unknown";
      };
      const audioLabels = nativeTracks.map(getAudioLabel);
      setAvailableAudios(audioLabels);
      
      const activeTrack = nativeTracks.find(t => t.enabled) || nativeTracks[0];
      if (activeTrack) {
        setActiveAudio(getAudioLabel(activeTrack));
      }
    }

    syncSubtitles();
  };

  const handleWaiting = () => {
    setIsBuffering(true);
  };

  const handlePlaying = () => {
    setIsBuffering(false);
    setIsPlaying(true);
  };

  const handleCanPlay = () => {
    setIsBuffering(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    // Explicitly update completion status
    saveProgress(duration, duration);

    if (content.type === "series" && content.nextEpisode) {
      setShowNextCountdown(true);
      setCountdownSeconds(10);
    } else {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
      setCurrentTime(0);
    }
  };

  const handleVideoError = (e) => {
    console.error("HTML5 Video Error Event:", e);
    setIsVideoError(true);
  };

  // 10. Playback Seek Controls
  const handleSeek = (newTime) => {
    const cleanTime = Math.max(0, Math.min(duration, Math.floor(newTime)));
    setCurrentTime(cleanTime);
    if (videoRef.current) {
      videoRef.current.currentTime = cleanTime;
    }
  };

  const durationRef = useRef(duration);
  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  const handleRewind = () => {
    if (videoRef.current) {
      const targetTime = Math.max(0, videoRef.current.currentTime - 10);
      videoRef.current.currentTime = targetTime;
      setCurrentTime(Math.floor(targetTime));
    }
  };

  const handleForward = () => {
    if (videoRef.current) {
      const targetTime = Math.min(durationRef.current, videoRef.current.currentTime + 10);
      videoRef.current.currentTime = targetTime;
      setCurrentTime(Math.floor(targetTime));
    }
  };

  // 11. Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "SELECT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        case "arrowleft":
          e.preventDefault();
          if (videoRef.current) {
            const targetTime = Math.max(0, videoRef.current.currentTime - 10);
            videoRef.current.currentTime = targetTime;
            setCurrentTime(Math.floor(targetTime));
          }
          break;
        case "arrowright":
          e.preventDefault();
          if (videoRef.current) {
            const targetTime = Math.min(durationRef.current, videoRef.current.currentTime + 10);
            videoRef.current.currentTime = targetTime;
            setCurrentTime(Math.floor(targetTime));
          }
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          setIsMuted((prev) => !prev);
          break;
        case "arrowup":
          e.preventDefault();
          setVolume((prev) => {
            const nextVolume = Math.min(1.0, prev + 0.1);
            if (videoRef.current) videoRef.current.volume = nextVolume;
            return nextVolume;
          });
          setIsMuted(false);
          break;
        case "arrowdown":
          e.preventDefault();
          setVolume((prev) => {
            const nextVolume = Math.max(0.0, prev - 0.1);
            if (videoRef.current) videoRef.current.volume = nextVolume;
            return nextVolume;
          });
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const formatTime = (secs) => {
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
  };

  // Early return if no streaming source has been configured
  const hasSource = content?.videoUrl || (content?.videoSources && content.videoSources.length > 0);
  if (!hasSource) {
    return (
      <NotFoundContent
        message={`No streaming source has been configured for "${content?.title || "this content"}".`}
      />
    );
  }

  // Early return if video playback fails
  if (isVideoError) {
    return (
      <NotFoundContent
        message={`Failed to load the video stream for "${content?.title || "this content"}". Please verify the source URL.`}
      />
    );
  }

  return (
    <div
      ref={playerRef}
      className="relative w-full h-full bg-black text-white flex items-center justify-center overflow-hidden select-none"
    >
      {/* Real HTML5 Video element */}
      <video
        ref={videoRef}
        poster={content.poster}
        className="w-full h-full object-contain pointer-events-auto"
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onCanPlay={handleCanPlay}
        onEnded={handleEnded}
        onError={handleVideoError}
        onDoubleClick={toggleFullscreen}
        playsInline
      >
        {content.subtitles && content.subtitles.map((sub, idx) => (
          <track
            key={idx}
            kind="subtitles"
            label={sub.label}
            src={sub.src}
            srcLang={sub.srclang}
            default={activeSubtitle === sub.label}
          />
        ))}
      </video>

      {/* Unified Player HUD Overlay */}
      <PlayerControls
        content={content}
        currentTime={currentTime}
        duration={duration}
        videoUrl={resolvedActiveUrl}
        isPlaying={isPlaying}
        volume={volume}
        isMuted={isMuted}
        playbackSpeed={playbackSpeed}
        activeSubtitle={activeSubtitle}
        activeAudio={content?.audioSources ? activeLanguage : activeAudio}
        isBuffering={isBuffering}
        isFullscreen={isFullscreen}
        isPiPSupported={isPiPSupported}
        isPiP={isPiP}
        onPlayToggle={() => setIsPlaying(!isPlaying)}
        onRewind={handleRewind}
        onForward={handleForward}
        onVolumeChange={(val) => {
          setVolume(val);
          setIsMuted(val === 0);
        }}
        onMuteToggle={() => setIsMuted(!isMuted)}
        onSpeedChange={setPlaybackSpeed}
        onSubtitleChange={setActiveSubtitle}
        onAudioChange={handleAudioChange}
        onBufferingToggle={() => setIsBuffering(!isBuffering)}
        onFullscreenToggle={toggleFullscreen}
        onPiPToggle={togglePiP}
        onShowToast={handleShowToast}
        onTimeSeek={handleSeek}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={onToggleSidebar}
        currentQuality={currentQuality}
        availableQualities={resolvedQualities}
        onQualityChange={handleQualityChange}
        availableAudios={resolvedAudios}
      />

      {/* Skip Button Overlay */}
      {activeSkipType && (
        <button
          onClick={() => {
            if (skipTargetTime != null) {
              handleSeek(skipTargetTime);
            }
            setActiveSkipType(null);
            setSkipTargetTime(null);
          }}
          className="absolute bottom-24 right-8 z-40 py-2.5 px-6 rounded-xl border border-white/10 bg-black/80 hover:bg-white/10 text-white text-xs font-bold transition-all shadow-2xl backdrop-blur-sm pointer-events-auto cursor-pointer animate-fade-in flex items-center gap-1.5 uppercase tracking-wider"
        >
          <span>Skip {activeSkipType}</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Render collapsible episode drawer inside the player viewport */}
      {sidebarComponent}

      {/* 12. Resume Watching Dialog Overlay */}
      {showResumePrompt && savedProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg animate-fade-in pointer-events-auto p-4 overflow-y-auto">
          <div className="max-w-md w-full my-auto p-5 sm:p-8 rounded-3xl border border-white/10 bg-zinc-900/90 text-center shadow-2xl flex flex-col items-center gap-4 sm:gap-6 max-h-[90vh] overflow-y-auto">
            {/* Title / Icon */}
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white tracking-tight">Resume Watching?</h3>
              <p className="text-xs text-white/50 px-2 leading-relaxed">
                You watched this recently. Would you like to resume from where you left off?
              </p>
            </div>

            <div className="w-full flex flex-col gap-2.5">
              <button
                onClick={() => {
                  const targetTime = savedProgress.currentTime;
                  if (videoRef.current) {
                    videoRef.current.currentTime = targetTime;
                  }
                  setCurrentTime(targetTime);
                  setShowResumePrompt(false);
                  setIsPlaying(true);
                }}
                className="w-full py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all transform active:scale-98 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
              >
                Resume from {formatTime(savedProgress.currentTime)}
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                  }
                  setCurrentTime(0);
                  setShowResumePrompt(false);
                  setIsPlaying(true);
                  // Force clear progress in storage immediately
                  saveProgress(0, duration);
                }}
                className="w-full py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-bold transition-all transform active:scale-98 cursor-pointer border border-white/5"
              >
                Restart from Beginning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 13. Auto Next Episode countdown overlay */}
      {showNextCountdown && content.nextEpisode && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg animate-fade-in pointer-events-auto">
          <div className="max-w-md w-full mx-4 p-6 sm:p-8 rounded-3xl border border-white/10 bg-zinc-900/90 text-center shadow-2xl flex flex-col items-center gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                Next Episode Up
              </span>
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                S{content.nextEpisode.seasonNumber}:E{content.nextEpisode.episodeNumber} - {content.nextEpisode.title}
              </h3>
            </div>

            {/* Thumbnail Preview */}
            <div className="w-48 h-28 bg-zinc-950 rounded-xl overflow-hidden border border-white/5 shadow-lg relative flex items-center justify-center">
              {content.nextEpisode.thumbnail ? (
                <img src={content.nextEpisode.thumbnail} className="w-full h-full object-cover" />
              ) : (
                <Play className="w-6 h-6 text-zinc-700" />
              )}
              {/* Circular countdown overlay */}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin absolute" />
                <span className="text-lg font-black text-white z-10">{countdownSeconds}</span>
              </div>
            </div>

            <div className="w-full flex gap-3">
              <button
                onClick={() => {
                  setShowNextCountdown(false);
                  onLoadNextEpisode();
                }}
                className="flex-1 py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all transform active:scale-98 cursor-pointer shadow-lg shadow-purple-600/20"
              >
                Play Now
              </button>
              
              <button
                onClick={() => {
                  setShowNextCountdown(false);
                }}
                className="flex-1 py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-bold transition-all transform active:scale-98 cursor-pointer border border-white/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-50 py-2.5 px-5 rounded-xl border border-white/10 bg-zinc-950/95 text-white text-xs font-bold transition-all shadow-2xl backdrop-blur-md flex items-center gap-2 animate-fade-in pointer-events-none">
          <span className="text-purple-400">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
