// src/pages/customer/watch/Watch.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { findContentById, normalizeContentId } from "../../../utils/contentHelper";
import { DEV_VIDEO_URLS, DEV_VIDEO_SOURCES, DEV_AUDIO_SOURCES } from "../../../config/devConfig";
import LoadingScreen from "./components/LoadingScreen";
import NotFoundContent from "./components/NotFoundContent";
import MoviePlayer from "./MoviePlayer";
import SeriesPlayer from "./SeriesPlayer";

// Utility to parse human-readable runtimes (e.g. "2h 49m" -> 10140 seconds)
function parseRuntime(str) {
  if (!str) return 7200;
  const hoursMatch = str.match(/(\d+)h/);
  const minsMatch = str.match(/(\d+)m/);
  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const mins = minsMatch ? parseInt(minsMatch[1]) : 0;
  if (hours === 0 && mins === 0) return 7200;
  return hours * 3600 + mins * 60;
}

export default function Watch({ type }) {
  const { id, epNum } = useParams();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);
  const [prevId, setPrevId] = useState(id);
  const [prevEpNum, setPrevEpNum] = useState(epNum);

  if (id !== prevId || epNum !== prevEpNum) {
    setPrevId(id);
    setPrevEpNum(epNum);
    setLoading(true);
    setContent(null);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const found = findContentById(id);
      setContent(found);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [id, epNum]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!content) {
    return (
      <NotFoundContent
        message={`The content with ID "${id}" could not be found in our library.`}
      />
    );
  }

  // Resolve dynamic videoUrl based on devConfig overrides in local dev mode
  const resolvedType = type || content.type || "movie";
  const isDev = import.meta.env.DEV;
  const normalizedId = normalizeContentId(id);
  const devUrl = isDev ? (DEV_VIDEO_URLS[normalizedId] || DEV_VIDEO_URLS[id]) : null;
  let resolvedVideoUrl = content.videoUrl || devUrl || null;
  const devSources = isDev ? (DEV_VIDEO_SOURCES[normalizedId] || DEV_VIDEO_SOURCES[id]) : null;
  let resolvedVideoSources = content.videoSources || devSources || null;
  const devAudioSources = isDev ? (DEV_AUDIO_SOURCES[normalizedId] || DEV_AUDIO_SOURCES[id]) : null;
  let resolvedAudioSources = content.audioSources || devAudioSources || null;

  // Check if resolvedVideoUrl is a serialized JSON array representing quality sources
  if (resolvedVideoUrl && typeof resolvedVideoUrl === "string" && resolvedVideoUrl.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(resolvedVideoUrl);
      if (Array.isArray(parsed)) {
        const validSources = parsed.filter(s => s && typeof s === "object" && s.quality && s.url);
        if (validSources.length > 0) {
          resolvedVideoSources = validSources;
          resolvedVideoUrl = validSources[0].url;
        }
      }
    } catch (e) {
      console.warn("Failed to parse JSON videoUrl, falling back to raw string:", e);
    }
  }

  // Prepend backend base URL to relative /uploads/ paths
  const backendBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  if (resolvedVideoUrl && resolvedVideoUrl.startsWith("/uploads")) {
    resolvedVideoUrl = `${backendBaseUrl}${resolvedVideoUrl}`;
  }

  if (resolvedVideoSources && Array.isArray(resolvedVideoSources)) {
    resolvedVideoSources = resolvedVideoSources.map(s => {
      if (s.url && s.url.startsWith("/uploads")) {
        return { ...s, url: `${backendBaseUrl}${s.url}` };
      }
      return s;
    });
  }

  if (resolvedAudioSources) {
    const formatted = {};
    Object.keys(resolvedAudioSources).forEach(lang => {
      formatted[lang] = {};
      Object.keys(resolvedAudioSources[lang]).forEach(qual => {
        let url = resolvedAudioSources[lang][qual];
        if (url && url.startsWith("/uploads")) {
          url = `${backendBaseUrl}${url}`;
        }
        formatted[lang][qual] = url;
      });
    });
    resolvedAudioSources = formatted;
  }

  // Extract shared timestamp (?t=) safely
  const searchParams = new URLSearchParams(window.location.search);
  const sharedTimeStr = searchParams.get("t");
  const sharedTime = sharedTimeStr ? parseInt(sharedTimeStr) : null;

  // Normalize content prop schema
  const normalizedContent = {
    id,
    episodeNumber: epNum ? parseInt(epNum) : null,
    sharedTime: (sharedTime != null && !isNaN(sharedTime) && sharedTime >= 0) ? sharedTime : null,
    title: content.title || (resolvedType === "series" ? "Premium Series" : "Premium Movie"),
    poster: content.poster || null,
    year: content.year || content.season || "",
    rating: content.rating || "",
    runtime: content.runtime || (content.episodes ? `${content.episodes} Episodes` : ""),
    type: resolvedType,
    duration: content.runtime ? parseRuntime(content.runtime) : 7200,
    videoUrl: resolvedVideoUrl,
    videoSources: resolvedVideoSources,
    audioSources: resolvedAudioSources,
    subtitles: content.subtitles || [],
    audioTracks: content.audioTracks || [],
    storyboard: content.storyboard || null
  };

  return resolvedType === "series" ? (
    <SeriesPlayer content={normalizedContent} />
  ) : (
    <MoviePlayer content={normalizedContent} />
  );
}
