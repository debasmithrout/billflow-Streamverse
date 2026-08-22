// src/storage/watchStorage.js
import { normalizeContentId, ID_NORM_MAP } from "../utils/contentHelper";

const PROGRESS_KEY = "streamverse_watch_progress";
const HISTORY_KEY = "streamverse_watch_history";

/**
 * Isolated storage adapter. Can be replaced with IndexedDB, backend api, or cloud storage.
 */
export const watchStorage = {
  // --- Progress Storage ---
  getProgress(contentId) {
    try {
      const canonicalId = normalizeContentId(contentId);
      const data = localStorage.getItem(PROGRESS_KEY);
      if (!data) return null;
      const progressMap = JSON.parse(data);
      
      if (progressMap[canonicalId]) {
        return progressMap[canonicalId];
      }
      
      // Fallback: check if legacy alias exist and migrate
      const aliases = Object.keys(ID_NORM_MAP).filter(
        (key) => ID_NORM_MAP[key] === canonicalId
      );
      for (const alias of aliases) {
        if (progressMap[alias]) {
          const item = progressMap[alias];
          progressMap[canonicalId] = { ...item, contentId: canonicalId };
          delete progressMap[alias];
          localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressMap));
          return progressMap[canonicalId];
        }
      }
      return null;
    } catch (err) {
      console.error("Failed to read watch progress from storage:", err);
      return null;
    }
  },

  getAllProgress() {
    try {
      const data = localStorage.getItem(PROGRESS_KEY);
      if (!data) return {};
      const progressMap = JSON.parse(data);
      
      const normalizedMap = {};
      let hasChanges = false;
      
      for (const key of Object.keys(progressMap)) {
        const canonicalId = normalizeContentId(key);
        if (key !== canonicalId) {
          hasChanges = true;
        }
        
        if (normalizedMap[canonicalId]) {
          const existing = normalizedMap[canonicalId];
          const current = progressMap[key];
          if (current.lastWatched > existing.lastWatched) {
            normalizedMap[canonicalId] = { ...current, contentId: canonicalId };
          }
        } else {
          normalizedMap[canonicalId] = { ...progressMap[key], contentId: canonicalId };
        }
      }
      
      if (hasChanges) {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(normalizedMap));
      }
      return normalizedMap;
    } catch (err) {
      console.error("Failed to read all watch progress from storage:", err);
      return {};
    }
  },

  saveProgress(contentId, progressItem) {
    try {
      const canonicalId = normalizeContentId(contentId);
      const data = localStorage.getItem(PROGRESS_KEY);
      const progressMap = data ? JSON.parse(data) : {};
      progressMap[canonicalId] = {
        ...progressItem,
        contentId: canonicalId
      };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressMap));
    } catch (err) {
      console.error("Failed to save watch progress to storage:", err);
    }
  },

  deleteProgress(contentId) {
    try {
      const canonicalId = normalizeContentId(contentId);
      const data = localStorage.getItem(PROGRESS_KEY);
      if (!data) return;
      const progressMap = JSON.parse(data);
      delete progressMap[canonicalId];
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressMap));
    } catch (err) {
      console.error("Failed to delete watch progress from storage:", err);
    }
  },

  // --- Watch History Storage ---
  getHistory() {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      if (!data) return [];
      const historyList = JSON.parse(data);
      
      const normalizedList = [];
      const seen = new Set();
      let hasChanges = false;
      
      for (const item of historyList) {
        if (!item || !item.contentId) continue;
        const canonicalId = normalizeContentId(item.contentId);
        if (item.contentId !== canonicalId) {
          hasChanges = true;
        }
        
        if (!seen.has(canonicalId)) {
          seen.add(canonicalId);
          normalizedList.push({
            ...item,
            contentId: canonicalId
          });
        } else {
          hasChanges = true;
        }
      }
      
      if (hasChanges) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(normalizedList));
      }
      return normalizedList;
    } catch (err) {
      console.error("Failed to read watch history from storage:", err);
      return [];
    }
  },

  saveHistoryItem(historyItem) {
    try {
      const canonicalId = normalizeContentId(historyItem.contentId);
      const data = localStorage.getItem(HISTORY_KEY);
      let historyList = data ? JSON.parse(data) : [];
      
      const normalizedHistoryItem = {
        ...historyItem,
        contentId: canonicalId
      };
      
      historyList = historyList.filter((item) => normalizeContentId(item.contentId) !== canonicalId);
      historyList.unshift(normalizedHistoryItem);
      
      localStorage.setItem(HISTORY_KEY, JSON.stringify(historyList));
    } catch (err) {
      console.error("Failed to save watch history item to storage:", err);
    }
  },
};
