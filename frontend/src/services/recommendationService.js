// src/services/recommendationService.js
import * as mockData from "../constants/mockData";
import { calculateContentScore, calculateTrendingScore } from "../utils/contentScoring";
import { watchProgressService } from "./watchProgressService";
import { normalizeContentId } from "../utils/contentHelper";

const NORMALIZE_MAP = {
  "stranger things": { id: "stranger-things", type: "series" },
  "the boys": { id: "the-boys", type: "series" },
  "house of the dragon": { id: "house-of-the-dragon", type: "series" },
  "house of dragon": { id: "house-of-the-dragon", type: "series" },
  "the mandalorian": { id: "the-mandalorian", type: "series" },
  "loki": { id: "loki", type: "series" },
  "breaking bad": { id: "breaking-bad", type: "series" },
  "john wick: chapter 4": { id: "john-wick-4", type: "movie" },
  "oppenheimer": { id: "oppenheimer", type: "movie" },
  "dune: part two": { id: "dune-part-two", type: "movie" },
  "deadpool & wolverine": { id: "deadpool-and-wolverine", type: "movie" },
  "the batman": { id: "the-batman", type: "movie" },
  "top gun: maverick": { id: "top-gun-maverick", type: "movie" },
  "avatar: the way of water": { id: "avatar-way-of-water", type: "movie" },
  "inception": { id: "inception", type: "movie" },
  "interstellar": { id: "interstellar", type: "movie" },
  "the dark knight": { id: "the-dark-knight", type: "movie" },
  "the godfather": { id: "the-godfather", type: "movie" },
  "avengers: endgame": { id: "avengers-endgame", type: "movie" },
  "parasite": { id: "parasite", type: "movie" },
  "inside out 2": { id: "inside-out-2", type: "movie" },
  "dangal": { id: "dangal", type: "movie" },
  "schindler's list": { id: "schindlers-list", type: "movie" },
  "pulp fiction": { id: "pulp-fiction", type: "movie" },
  "the matrix": { id: "the-matrix", type: "movie" },
  "attack on titan": { id: "attack-on-titan", type: "series" },
  "demon slayer": { id: "demon-slayer", type: "series" },
  "narcos": { id: "narcos", type: "series" }
};

// Centralized cache to build a flat list of catalog items (never mutated)
const getCatalog = () => {
  const allItems = [
    ...(mockData.HERO_SLIDES || []),
    ...(mockData.TRENDING_MOVIES || []),
    ...(mockData.NEW_RELEASES || []),
    ...(mockData.POPULAR_SHOWS || []),
    ...(mockData.RECOMMENDED || []),
    ...(mockData.TOP_10 || []),
    ...(mockData.FEATURED_ORIGINALS || []),
    ...(mockData.HOLLYWOOD_MOVIES || []),
    ...(mockData.BOLLYWOOD_MOVIES || []),
    ...(mockData.ACTION_MOVIES || []),
    ...(mockData.TOP_RATED_MOVIES || [])
  ];

  const seen = new Set();
  const catalog = [];

  for (const item of allItems) {
    if (!item) continue;

    const titleClean = (item.title || "").trim().toLowerCase();
    const norm = NORMALIZE_MAP[titleClean];
    const stableId = norm ? norm.id : item.id;
    const stableType = norm ? norm.type : (item.type || "movie");
    const stableTitle = norm ? (titleClean === "house of dragon" ? "House of the Dragon" : item.title) : item.title;

    if (!stableId || seen.has(stableId)) continue;
    seen.add(stableId);

    catalog.push({
      ...item,
      id: stableId,
      title: stableTitle,
      type: stableType
    });
  }

  return catalog;
};

export const recommendationService = {
  /**
   * Helper to deduplicate content items.
   * Checks ID first, then checks unique key (slug preferred, falling back to normalized title).
   */
  deduplicateContent(list) {
    if (!list || !Array.isArray(list)) return [];

    const seenIds = new Set();
    const unique = [];

    for (const item of list) {
      if (!item || !item.id) continue;
      const canonicalId = normalizeContentId(item.id);

      if (seenIds.has(canonicalId)) {
        continue;
      }

      seenIds.add(canonicalId);
      unique.push(item);
    }

    return unique;
  },

  /**
   * Helper to filter out specified content IDs from a list.
   */
  excludeContent(list, excludedIds = []) {
    if (!list || !Array.isArray(list)) return [];
    if (!excludedIds || excludedIds.length === 0) return list;

    const excludeSet = new Set(excludedIds.map(id => String(id).toLowerCase()));

    return list.filter(item => {
      if (!item || !item.id) return false;
      const itemId = String(item.id).toLowerCase();
      return !excludeSet.has(itemId);
    });
  },

  /**
   * Recommends items similar to the last watched item in the user's history.
   * Accepts an optional list of excluded IDs to prevent cross-rail duplication.
   */
  getBecauseYouWatched(limit = 10, excludeIds = []) {
    const history = watchProgressService.getWatchHistoryList() || [];
    const catalog = getCatalog();

    if (history.length === 0) {
      const scored = catalog.map(item => ({
        item,
        score: calculateTrendingScore(item, [])
      }));
      scored.sort((a, b) => b.score - a.score);
      
      const list = this.deduplicateContent(scored.map(x => x.item));
      const excludedList = this.excludeContent(list, excludeIds);
      const finalItems = excludedList.length >= 5 ? excludedList : list;

      return {
        basedOn: null,
        items: finalItems.slice(0, limit)
      };
    }

    const latest = history[0];

    const scored = catalog
      .filter(item => item.id !== latest.id)
      .map(item => ({
        item,
        score: calculateContentScore(item, latest, history)
      }));

    scored.sort((a, b) => b.score - a.score);

    let list = scored.map(x => x.item);
    list = this.deduplicateContent(list);

    const combinedExcludes = [...excludeIds, latest.id];
    const excludedList = this.excludeContent(list, combinedExcludes);
    // Threshold fallback check (needs 5+ items)
    const finalItems = excludedList.length >= 5 ? excludedList : list;

    return {
      basedOn: latest,
      items: finalItems.slice(0, limit)
    };
  },

  /**
   * Returns items similar to the specified item (excluding itself).
   */
  getMoreLikeThis(itemId, limit = 10) {
    const catalog = getCatalog();
    const target = catalog.find(x => x.id === itemId);
    if (!target) return [];

    const history = watchProgressService.getWatchHistoryList() || [];

    const scored = catalog
      .filter(item => item.id !== itemId)
      .map(item => ({
        item,
        score: calculateContentScore(item, target, history)
      }));

    scored.sort((a, b) => b.score - a.score);

    let list = scored.map(x => x.item);
    list = this.deduplicateContent(list);

    return list.slice(0, limit);
  },

  /**
   * Returns top trending items based on popularity flags.
   */
  getTrending(limit = 10, excludeIds = []) {
    const catalog = getCatalog();
    const history = watchProgressService.getWatchHistoryList() || [];

    const scored = catalog.map(item => ({
      item,
      score: calculateTrendingScore(item, history)
    }));

    scored.sort((a, b) => b.score - a.score);

    let list = scored.map(x => x.item);
    list = this.deduplicateContent(list);

    const excludedList = this.excludeContent(list, excludeIds);
    const finalItems = excludedList.length >= 5 ? excludedList : list;

    return finalItems.slice(0, limit);
  },

  /**
   * Returns recently added titles.
   */
  getRecentlyAdded(limit = 10, excludeIds = []) {
    const catalog = getCatalog();
    const list = [...catalog];

    list.sort((a, b) => {
      const aNew = a.badge === "NEW" ? 1 : 0;
      const bNew = b.badge === "NEW" ? 1 : 0;
      if (aNew !== bNew) return bNew - aNew;

      const aYear = parseInt(a.year || 0);
      const bYear = parseInt(b.year || 0);
      return bYear - aYear;
    });

    const uniqueList = this.deduplicateContent(list);

    const excludedList = this.excludeContent(uniqueList, excludeIds);
    const finalItems = excludedList.length >= 5 ? excludedList : uniqueList;

    return finalItems.slice(0, limit);
  },

  /**
   * Returns highest-rated popular items.
   */
  getPopular(limit = 10, excludeIds = []) {
    const catalog = getCatalog();
    const list = [...catalog];

    list.sort((a, b) => {
      const aRating = parseFloat(a.rating || 0.0);
      const bRating = parseFloat(b.rating || 0.0);
      return bRating - aRating;
    });

    const uniqueList = this.deduplicateContent(list);

    const excludedList = this.excludeContent(uniqueList, excludeIds);
    const finalItems = excludedList.length >= 5 ? excludedList : uniqueList;

    return finalItems.slice(0, limit);
  },

  /**
   * Returns recently watched items in history.
   */
  getRecentlyWatched(limit = 10) {
    const history = watchProgressService.getWatchHistoryList() || [];
    const uniqueList = this.deduplicateContent(history);
    return uniqueList.slice(0, limit);
  }
};

