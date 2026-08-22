// src/utils/contentHelper.js
import * as mockData from "../constants/mockData";

/**
 * Searches across all mockData exports to find a movie or series by ID.
 * Returns the object with a normalized `type` property ("movie" or "series").
 */
// Mapping for legacy lookups to resolve to stable IDs
export const ID_NORM_MAP = {
  "cw1": "stranger-things", "ps1": "stranger-things", "fo1": "stranger-things",
  "cw2": "the-boys", "ps2": "the-boys", "fo2": "the-boys", "le1": "the-boys",
  "cw6": "house-of-the-dragon", "ps3": "house-of-the-dragon", "fo3": "house-of-the-dragon", "le3": "house-of-the-dragon",
  "ps4": "the-mandalorian", "fo4": "the-mandalorian", "le4": "the-mandalorian",
  "jw4": "john-wick-4", "t1": "john-wick-4", "a3": "john-wick-4",
  "opp": "oppenheimer", "t2": "oppenheimer", "top4": "oppenheimer",
  "dune2": "dune-part-two", "t3": "dune-part-two", "top2": "dune-part-two", "wl2": "dune-part-two",
  "deadpool": "deadpool-and-wolverine", "t4": "deadpool-and-wolverine", "top1": "deadpool-and-wolverine",
  "t5": "the-batman", "top5": "the-batman", "movies_hero": "the-batman",
  "cw5": "top-gun-maverick", "t7": "top-gun-maverick", "top6": "top-gun-maverick", "a5": "top-gun-maverick",
  "cw3": "inception", "r3": "inception", "wl1": "inception",
  "cw4": "breaking-bad", "ps6": "breaking-bad", "cr1": "breaking-bad", "fv2": "breaking-bad",
  "b2": "dangal",
  // Pulp Fiction
  "h7": "pulp-fiction", "tr4": "pulp-fiction",
  // The Godfather
  "r4": "the-godfather", "h1": "the-godfather", "tr2": "the-godfather", "fv5": "the-godfather",
  // Interstellar
  "r1": "interstellar", "h2": "interstellar", "tr6": "interstellar", "fv3": "interstellar",
  // The Dark Knight
  "r2": "the-dark-knight", "h3": "the-dark-knight", "a4": "the-dark-knight", "tr3": "the-dark-knight", "fv1": "the-dark-knight",
  // Avengers: Endgame
  "r5": "avengers-endgame", "h6": "avengers-endgame",
  // Parasite
  "r6": "parasite", "wl4": "parasite",
  // Schindler's List
  "h4": "schindlers-list", "tr5": "schindlers-list",
  // The Matrix
  "h5": "the-matrix", "wl6": "the-matrix",
  // Attack on Titan
  "an1": "attack-on-titan", "fv4": "attack-on-titan",
  // Demon Slayer
  "an3": "demon-slayer", "wl5": "demon-slayer",
  // Narcos
  "cr4": "narcos", "wl3": "narcos",
  // Inside Out 2
  "n3": "inside-out-2", "top3": "inside-out-2"
};

export function normalizeContentId(id) {
  if (!id) return "";
  const cleanId = String(id).toLowerCase();
  return ID_NORM_MAP[cleanId] || cleanId;
}

export function dedupeContentByCanonicalId(items) {
  if (!items || !Array.isArray(items)) return [];
  const seen = new Set();
  const result = [];
  for (const item of items) {
    if (!item) continue;
    const id = item.id || "unknown";
    const canonicalId = normalizeContentId(id);
    if (!seen.has(canonicalId)) {
      seen.add(canonicalId);
      result.push(item);
    }
  }
  return result;
}

export function findContentById(id) {
  if (!id) return null;

  const targetId = normalizeContentId(id);

  const matchId = (itemId) => {
    if (!itemId) return false;
    return normalizeContentId(itemId) === targetId;
  };

  // 1. Check HERO_SLIDES (all are movies)
  let found = mockData.HERO_SLIDES?.find((x) => matchId(x.id));
  if (found) {
    return { ...found, type: found.type || "movie" };
  }

  // 2. Check CONTINUE_WATCHING (already has type)
  found = mockData.CONTINUE_WATCHING?.find((x) => matchId(x.id));
  if (found) {
    return { ...found };
  }

  // 3. Check TRENDING_MOVIES
  found = mockData.TRENDING_MOVIES?.find((x) => matchId(x.id));
  if (found) {
    return { ...found, type: "movie" };
  }

  // 4. Check NEW_RELEASES
  found = mockData.NEW_RELEASES?.find((x) => matchId(x.id));
  if (found) {
    return { ...found, type: "movie" };
  }

  // 5. Check POPULAR_SHOWS
  found = mockData.POPULAR_SHOWS?.find((x) => matchId(x.id));
  if (found) {
    return { ...found, type: "series" };
  }

  // 6. Check ANIME_SHOWS
  found = mockData.ANIME_SHOWS?.find((x) => matchId(x.id));
  if (found) {
    return { ...found, type: "series" };
  }

  // 7. Check KDRAMA_SHOWS
  found = mockData.KDRAMA_SHOWS?.find((x) => matchId(x.id));
  if (found) {
    return { ...found, type: "series" };
  }

  // 8. Check CRIME_SHOWS
  found = mockData.CRIME_SHOWS?.find((x) => matchId(x.id));
  if (found) {
    return { ...found, type: "series" };
  }

  // 9. Check LATEST_EPISODES
  found = mockData.LATEST_EPISODES?.find((x) => matchId(x.id));
  if (found) {
    return { ...found, type: "series" };
  }

  // 10. Check MY_LIST_WATCH_LATER
  found = mockData.MY_LIST_WATCH_LATER?.find((x) => matchId(x.id));
  if (found) {
    return { ...found, type: found.type || "movie" };
  }

  // 11. Check MY_LIST_FAVORITES
  found = mockData.MY_LIST_FAVORITES?.find((x) => matchId(x.id));
  if (found) {
    return { ...found, type: found.type || "movie" };
  }

  // 12. Check TOP_10 (all mock items in India Top 10 are movies)
  found = mockData.TOP_10?.find((x) => matchId(x.id));
  if (found) {
    return { ...found, type: "movie" };
  }

  // 12a. Check HOLLYWOOD_MOVIES
  found = mockData.HOLLYWOOD_MOVIES?.find((x) => matchId(x.id));
  if (found) {
    return { ...found, type: "movie" };
  }

  // 12b. Check BOLLYWOOD_MOVIES
  found = mockData.BOLLYWOOD_MOVIES?.find((x) => matchId(x.id));
  if (found) {
    return { ...found, type: "movie" };
  }

  // 12c. Check ACTION_MOVIES
  found = mockData.ACTION_MOVIES?.find((x) => matchId(x.id));
  if (found) {
    return { ...found, type: "movie" };
  }

  // 12d. Check TOP_RATED_MOVIES
  found = mockData.TOP_RATED_MOVIES?.find((x) => matchId(x.id));
  if (found) {
    return { ...found, type: "movie" };
  }

  // 13. Check TVSHOWS_HERO and MOVIES_HERO mapped items
  if (matchId("movies_hero")) {
    return { ...mockData.MOVIES_HERO, id: "movies_hero", type: "movie" };
  }
  if (matchId("tvshows_hero")) {
    return { ...mockData.TVSHOWS_HERO, id: "tvshows_hero", type: "series" };
  }
  if (matchId("infinite_horizons")) {
    return {
      id: "infinite_horizons",
      title: "Infinite Horizons",
      description: "Start streaming our latest sci-fi mystery original today. A stranded astronaut discovers a quantum rift in deep orbit, setting off a chain reaction that threatens Earth's timeline.",
      type: "movie",
      poster: null
    };
  }

  return null;
}

export function buildShareUrl(content, currentTime) {
  const origin = window.location.origin;
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.delete("t");

  const t = Math.round(currentTime);
  if (t > 0) {
    searchParams.set("t", t);
  }
  const queryString = searchParams.toString();
  const querySuffix = queryString ? `?${queryString}` : "";

  if (content?.type === "series") {
    const idParts = (content.id || "").split("_");
    const seriesId = idParts[0] || "unknown";
    const epNum = content.episodeNumber || (content.id || "").match(/_e(\d+)$/)?.[1] || "1";
    return `${origin}/customer/watch/series/${seriesId}/episode/${epNum}${querySuffix}`;
  }

  return `${origin}/customer/watch/movie/${content?.id || "unknown"}${querySuffix}`;
}
