// src/hooks/useRecommendations.js
import { useState, useEffect } from "react";
import { recommendationService } from "../services/recommendationService";

export function useBecauseYouWatched(limit = 10) {
  const [data, setData] = useState({ basedOn: null, items: [] });

  useEffect(() => {
    const res = recommendationService.getBecauseYouWatched(limit);
    setData(res);
  }, [limit]);

  return data;
}

export function useMoreLikeThis(itemId, limit = 10) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (itemId) {
      const res = recommendationService.getMoreLikeThis(itemId, limit);
      setItems(res);
    }
  }, [itemId, limit]);

  return items;
}

export function useTrending(limit = 10) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const res = recommendationService.getTrending(limit);
    setItems(res);
  }, [limit]);

  return items;
}

export function useRecentlyAdded(limit = 10) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const res = recommendationService.getRecentlyAdded(limit);
    setItems(res);
  }, [limit]);

  return items;
}

export function usePopular(limit = 10) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const res = recommendationService.getPopular(limit);
    setItems(res);
  }, [limit]);

  return items;
}

export function useRecentlyWatched(limit = 10) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const res = recommendationService.getRecentlyWatched(limit);
    setItems(res);
  }, [limit]);

  return items;
}
