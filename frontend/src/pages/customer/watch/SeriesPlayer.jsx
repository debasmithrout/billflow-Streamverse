// src/pages/customer/watch/SeriesPlayer.jsx
import { useEffect, useState } from "react";
import { seriesService } from "../../../services/seriesService";
import { watchProgressService } from "../../../services/watchProgressService";
import PlayerEngine from "./components/PlayerEngine";
import EpisodeSidebar from "./components/EpisodeSidebar";
import LoadingScreen from "./components/LoadingScreen";

export default function SeriesPlayer({ content }) {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadSeriesData() {
      try {
        const seasonsData = await seriesService.getSeasonsAndEpisodes(content.id);
        if (!active) return;
        
        setSeasons(seasonsData);

        // 1. Resolve which episode to play first (last watched or S1:E1)
        let initialEpisode = null;

        // Priority 1: Check if an episode was explicitly requested via shared link
        if (content.episodeNumber != null) {
          for (const s of seasonsData) {
            const ep = s.episodes.find(e => e.episodeNumber === content.episodeNumber);
            if (ep) {
              initialEpisode = ep;
              break;
            }
          }
        }

        // Priority 2: last watched / continue watching
        if (!initialEpisode) {
          const continueWatchingList = watchProgressService.getContinueWatchingList() || [];
          const seriesEpisodes = continueWatchingList.filter(item => item.contentId.startsWith(content.id + "_"));
          
          if (seriesEpisodes.length > 0) {
            // Sort by lastWatched descending to get the most recent
            seriesEpisodes.sort((a, b) => b.lastWatched - a.lastWatched);
            const lastWatchedId = seriesEpisodes[0].contentId;
            
            // Find matching episode in loaded seasons structure
            for (const s of seasonsData) {
              const ep = s.episodes.find(e => e.id === lastWatchedId);
              if (ep) {
                initialEpisode = ep;
                break;
              }
            }
          }
        }

        // Fallback to S1:E1
        if (!initialEpisode && seasonsData.length > 0 && seasonsData[0].episodes.length > 0) {
          initialEpisode = seasonsData[0].episodes[0];
        }

        setCurrentEpisode(initialEpisode);
      } catch (err) {
        console.error("Failed to load series structure", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSeriesData();
    return () => { active = false; };
  }, [content.id, content.episodeNumber]);

  const handleEpisodeSelect = (ep) => {
    setCurrentEpisode(ep);
    setIsSidebarOpen(false);
  };

  // Find next episode in order to support Auto Next Episode countdown
  const getNextEpisode = () => {
    if (!currentEpisode || seasons.length === 0) return null;
    
    // Find active season index and active episode index
    for (let sIdx = 0; sIdx < seasons.length; sIdx++) {
      const season = seasons[sIdx];
      const epIdx = season.episodes.findIndex(e => e.id === currentEpisode.id);
      
      if (epIdx !== -1) {
        // If there's another episode in the same season
        if (epIdx < season.episodes.length - 1) {
          return season.episodes[epIdx + 1];
        }
        // Otherwise, check if there's a next season
        if (sIdx < seasons.length - 1 && seasons[sIdx + 1].episodes.length > 0) {
          return seasons[sIdx + 1].episodes[0];
        }
      }
    }
    return null;
  };

  if (loading) return <LoadingScreen />;

  const nextEpisode = getNextEpisode();

  // Normalize current episode metadata to match PlayerEngine content shape
  const playerContent = currentEpisode ? {
    id: currentEpisode.id,
    sharedTime: content.sharedTime,
    title: `${content.title} - S${currentEpisode.id.match(/_s(\d+)_/)?.[1] || 1}:E${currentEpisode.episodeNumber}`,
    episodeTitle: currentEpisode.title,
    poster: currentEpisode.thumbnail || content.poster,
    videoUrl: currentEpisode.videoUrl,
    type: "series",
    duration: 2700, // standard duration fallback
    subtitles: currentEpisode.subtitles || [],
    audioTracks: currentEpisode.audioTracks || [],
    skipIntroStart: currentEpisode.skipIntroStart,
    skipIntroEnd: currentEpisode.skipIntroEnd,
    skipRecapStart: currentEpisode.skipRecapStart,
    skipRecapEnd: currentEpisode.skipRecapEnd,
    skipCreditsStart: currentEpisode.skipCreditsStart,
    nextEpisode: nextEpisode ? {
      id: nextEpisode.id,
      title: nextEpisode.title,
      thumbnail: nextEpisode.thumbnail,
      episodeNumber: nextEpisode.episodeNumber,
      seasonNumber: nextEpisode.id.match(/_s(\d+)_/)?.[1] || 1
    } : null
  } : null;

  return (
    <div className="w-full h-screen overflow-hidden bg-black relative flex">
      {playerContent ? (
        <PlayerEngine
          content={playerContent}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          sidebarComponent={
            isSidebarOpen && (
              <EpisodeSidebar
                seasons={seasons}
                currentEpisode={currentEpisode}
                onEpisodeSelect={handleEpisodeSelect}
                onClose={() => setIsSidebarOpen(false)}
              />
            )
          }
          onLoadNextEpisode={() => {
            if (nextEpisode) handleEpisodeSelect(nextEpisode);
          }}
        />
      ) : (
        <div className="m-auto text-zinc-500 text-sm">No episodes configured.</div>
      )}
    </div>
  );
}
