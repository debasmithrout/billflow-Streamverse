// src/hooks/usePlayNavigation.js
import { useNavigate } from "react-router-dom";

/**
 * Custom hook to provide a unified navigation handler for playback actions.
 * Automatically determines if content is a "movie" or "series" if type is not specified.
 */
export default function usePlayNavigation() {
  const navigate = useNavigate();

  const playContent = (item) => {
    if (!item) return;

    let type = item.type;
    const id = item.id || "";

    // Determine type dynamically if not explicitly specified
    if (!type) {
      if (
        item.season !== undefined ||
        item.seasons !== undefined ||
        item.episode !== undefined ||
        item.episodes !== undefined ||
        id.startsWith("ps") ||
        id.startsWith("an") ||
        id.startsWith("kd") ||
        id.startsWith("cr") ||
        id.startsWith("le") ||
        id === "tvshows_hero"
      ) {
        type = "series";
      } else {
        type = "movie";
      }
    }

    const cleanType = type === "series" ? "series" : "movie";
    const itemId = id || "unknown";
    navigate(`/customer/watch/${cleanType}/${itemId}`);
  };

  return playContent;
}
