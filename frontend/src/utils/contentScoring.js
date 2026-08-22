// src/utils/contentScoring.js

/**
 * Calculates a match score between a candidate content item and a target content item.
 * Scoring ranges from 0 to 100+, used to sort recommendations.
 * 
 * Weights:
 * - Genre overlap (40 pts)
 * - Content type (20 pts)
 * - Language (15 pts)
 * - Cast/Director intersection (15 pts)
 * - Popularity/IMDB rating (10 pts)
 * - Completed watch history penalty (-25 pts)
 */
export function calculateContentScore(candidate, target, watchHistory = []) {
  if (!candidate || !target || candidate.id === target.id) return 0;

  let score = 0;

  // 1. Genre overlap (Max 40 points)
  const candidateGenres = parseGenres(candidate.genre || candidate.genres);
  const targetGenres = parseGenres(target.genre || target.genres);
  if (candidateGenres.length > 0 && targetGenres.length > 0) {
    const intersection = candidateGenres.filter(g => targetGenres.includes(g));
    const overlapRatio = intersection.length / Math.max(candidateGenres.length, targetGenres.length);
    score += Math.round(overlapRatio * 40);
  }

  // 2. Content Type Match (Max 20 points)
  const candidateType = candidate.type || (candidate.episodes ? "series" : "movie");
  const targetType = target.type || (target.episodes ? "series" : "movie");
  if (candidateType === targetType) {
    score += 20;
  }

  // 3. Language Match (Max 15 points)
  const candidateLang = (candidate.language || candidate.languages || "English").toLowerCase();
  const targetLang = (target.language || target.languages || "English").toLowerCase();
  if (candidateLang === targetLang) {
    score += 15;
  }

  // 4. Cast & Director Match (Max 15 points)
  const candidateCrew = parseCrew(candidate.cast, candidate.director);
  const targetCrew = parseCrew(target.cast, target.director);
  if (candidateCrew.length > 0 && targetCrew.length > 0) {
    const intersection = candidateCrew.filter(c => targetCrew.includes(c));
    if (intersection.length > 0) {
      score += 15;
    }
  }

  // 5. Popularity/Rating factor (Max 10 points)
  const rating = parseFloat(candidate.rating || 0.0);
  if (rating > 0) {
    // Maps a 0.0-10.0 scale rating directly to 0-10 points
    score += Math.round(rating);
  }

  // 6. Watch History Penalty (Subtract 25 points if already watched and completed)
  const historyRecord = watchHistory.find(item => item.contentId === candidate.id);
  if (historyRecord) {
    const completion = Math.round((historyRecord.currentTime / historyRecord.duration) * 100);
    if (completion >= 90) {
      score -= 25; // Already finished, recommend something new!
    }
  }

  return score;
}

/**
 * Calculates a trending score for an item based on views, rating, and watch completion.
 */
export function calculateTrendingScore(item, watchHistory = []) {
  if (!item) return 0;

  let score = 0;

  // Rating contributes up to 30 points
  const rating = parseFloat(item.rating || 0.0);
  score += Math.round(rating * 3);

  // Mock views (or popularity flag) contributes up to 50 points
  if (item.badge === "HOT" || item.rank != null) {
    score += 40;
  } else if (item.badge === "NEW") {
    score += 30;
  }

  // Completion rate inside watch history contributes up to 20 points
  const historyRecord = watchHistory.find(h => h.contentId === item.id);
  if (historyRecord) {
    const completion = Math.round((historyRecord.currentTime / historyRecord.duration) * 100);
    score += Math.round((completion / 100) * 20);
  }

  return score;
}

// Helpers
function parseGenres(genreField) {
  if (!genreField) return [];
  if (Array.isArray(genreField)) {
    return genreField.map(g => g.trim().toLowerCase());
  }
  return String(genreField)
    .replace(/\//g, ",")
    .replace(/•/g, ",")
    .split(",")
    .map(g => g.trim().toLowerCase())
    .filter(Boolean);
}

function parseCrew(castField, directorField) {
  const crew = [];
  if (castField) {
    if (Array.isArray(castField)) {
      crew.push(...castField.map(c => c.trim().toLowerCase()));
    } else {
      crew.push(...String(castField).split(",").map(c => c.trim().toLowerCase()));
    }
  }
  if (directorField) {
    crew.push(String(directorField).trim().toLowerCase());
  }
  return crew.filter(Boolean);
}
