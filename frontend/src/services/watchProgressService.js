// src/services/watchProgressService.js
import { watchStorage } from "../storage/watchStorage";
import { findContentById } from "../utils/contentHelper";

// Utility to format remaining play duration
function formatRemaining(seconds) {
  if (seconds <= 0) return null;
  const m = Math.ceil(seconds / 60);
  if (m < 60) {
    return `${m}m remaining`;
  }
  const h = Math.floor(m / 60);
  const rm = m % 60;
  if (rm === 0) return `${h}h remaining`;
  return `${h}h ${rm}m remaining`;
}

export const watchProgressService = {
  // Get active watch progress details for a title
  getProgress(contentId) {
    const progress = watchStorage.getProgress(contentId);
    if (!progress) return null;
    return {
      currentTime: progress.currentTime,
      duration: progress.duration,
      percentage: Math.round((progress.currentTime / progress.duration) * 100),
      lastWatched: progress.lastWatched,
    };
  },

  // Save progress. If watched percentage is >95%, content is saved to History as Completed and removed from Continue Watching.
  saveProgress({ contentId, contentType, currentTime, duration }) {
    if (!contentId || duration == null || isNaN(duration) || duration <= 0) return;

    const cleanTime = Math.max(0, Math.floor(currentTime));

    // 1. Progress is NEVER saved for videos watched less than 5 seconds.
    // Also, "Restart From Beginning" (currentTime = 0) clears active progress correctly.
    if (cleanTime < 5) {
      watchStorage.deleteProgress(contentId);
      return;
    }

    // 2. Progress is NOT written repeatedly if current playback time has not changed.
    const existing = watchStorage.getProgress(contentId);
    if (existing && Math.abs(existing.currentTime - cleanTime) < 1) {
      return;
    }

    const percentage = (cleanTime / duration) * 100;
    const lastWatched = Date.now();

    if (percentage >= 95) {
      // 1. Save to Watch History as COMPLETED
      watchStorage.saveHistoryItem({
        contentId,
        contentType,
        currentTime: cleanTime,
        duration,
        lastWatched,
        completionPercentage: Math.round(percentage),
        watchStatus: "completed",
      });

      // 2. Remove from active Continue Watching list
      watchStorage.deleteProgress(contentId);
    } else {
      // 3. Save to active progress
      watchStorage.saveProgress(contentId, {
        contentId,
        contentType,
        currentTime: cleanTime,
        duration,
        lastWatched,
        completionPercentage: Math.round(percentage),
        watchStatus: "watching",
      });

      // Also write/update history entry for active tracking
      watchStorage.saveHistoryItem({
        contentId,
        contentType,
        currentTime: cleanTime,
        duration,
        lastWatched,
        completionPercentage: Math.round(percentage),
        watchStatus: "watching",
      });
    }
  },

  // Retrieve active Continue Watching list (newest first)
  getContinueWatchingList() {
    const allProgressMap = watchStorage.getAllProgress();
    const progressList = Object.values(allProgressMap);

    // Sort by last watched descending
    progressList.sort((a, b) => b.lastWatched - a.lastWatched);

    return progressList
      .map((item) => {
        const percentage = Math.round((item.currentTime / item.duration) * 100);
        if (percentage >= 95) return null; // Automatically remove completed titles!

        let metadata = findContentById(item.contentId);
        
        // Resolve TV episodes (e.g. "seriesId_s1_e2")
        const isEpisode = item.contentId.includes("_s");
        if (!metadata && isEpisode) {
          const parentId = item.contentId.split("_s")[0];
          const parent = findContentById(parentId);
          if (parent) {
            const sMatch = item.contentId.match(/_s(\d+)_/);
            const eMatch = item.contentId.match(/_e(\d+)$/);
            const sNum = sMatch ? sMatch[1] : "1";
            const eNum = eMatch ? eMatch[1] : "1";
            
            metadata = {
              ...parent,
              id: parentId,
              episodeId: item.contentId,
              title: `${parent.title} (S${sNum}:E${eNum})`,
              type: "series"
            };
          }
        }

        if (!metadata) return null;

        return {
          ...metadata,
          progress: percentage,
          remaining: formatRemaining(item.duration - item.currentTime),
          lastWatched: item.lastWatched,
        };
      })
      .filter(Boolean);
  },

  // Retrieve Watch History list (newest first)
  getWatchHistoryList() {
    const history = watchStorage.getHistory();

    return history
      .map((item) => {
        const metadata = findContentById(item.contentId);
        if (!metadata) return null;

        const percentage = Math.round((item.currentTime / item.duration) * 100);
        return {
          ...metadata,
          progress: percentage,
          lastWatched: item.lastWatched,
          watchStatus: item.watchStatus,
          completed: item.watchStatus === "completed",
        };
      })
      .filter(Boolean);
  },
};
