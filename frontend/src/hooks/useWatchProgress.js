// src/hooks/useWatchProgress.js
import { useCallback } from "react";
import { watchProgressService } from "../services/watchProgressService";

/**
 * Custom React hook for tracking and persisting video watch progress.
 * Decouples the UI component from the backend/storage implementation.
 */
export default function useWatchProgress(contentId, contentType) {
  // Fetch progress for this title
  const getProgress = useCallback(() => {
    if (!contentId) return null;
    return watchProgressService.getProgress(contentId);
  }, [contentId]);

  // Persist current playback offset
  const saveProgress = useCallback(
    (currentTime, duration) => {
      if (
        !contentId ||
        !contentType ||
        currentTime == null ||
        duration == null ||
        isNaN(currentTime) ||
        isNaN(duration)
      ) {
        return;
      }

      watchProgressService.saveProgress({
        contentId,
        contentType,
        currentTime,
        duration,
      });
    },
    [contentId, contentType]
  );

  return {
    getProgress,
    saveProgress,
  };
}
