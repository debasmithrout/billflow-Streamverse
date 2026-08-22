// src/services/cmsService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

// --- MOVIES ---
export const getMovies = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.genre) params.append("genre", filters.genre);
  if (filters.is_published !== undefined) params.append("is_published", filters.is_published);
  const response = await axios.get(`${API_URL}/admin/movies/?${params.toString()}`, getHeaders());
  return response.data;
};

export const getMovieById = async (id) => {
  const response = await axios.get(`${API_URL}/admin/movies/${id}`, getHeaders());
  return response.data;
};

export const createMovie = async (data) => {
  const response = await axios.post(`${API_URL}/admin/movies/`, data, getHeaders());
  return response.data;
};

export const updateMovie = async (id, data) => {
  const response = await axios.put(`${API_URL}/admin/movies/${id}`, data, getHeaders());
  return response.data;
};

export const deleteMovie = async (id) => {
  const response = await axios.delete(`${API_URL}/admin/movies/${id}`, getHeaders());
  return response.data;
};

export const publishMovie = async (id, isPublished) => {
  const response = await axios.patch(`${API_URL}/admin/movies/${id}/publish?is_published=${isPublished}`, {}, getHeaders());
  return response.data;
};

// --- SERIES ---
export const getSeries = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.is_published !== undefined) params.append("is_published", filters.is_published);
  const response = await axios.get(`${API_URL}/admin/series/?${params.toString()}`, getHeaders());
  return response.data;
};

export const getSeriesById = async (id) => {
  const response = await axios.get(`${API_URL}/admin/series/${id}`, getHeaders());
  return response.data;
};

export const createSeries = async (data) => {
  const response = await axios.post(`${API_URL}/admin/series/`, data, getHeaders());
  return response.data;
};

export const updateSeries = async (id, data) => {
  const response = await axios.put(`${API_URL}/admin/series/${id}`, data, getHeaders());
  return response.data;
};

export const deleteSeries = async (id) => {
  const response = await axios.delete(`${API_URL}/admin/series/${id}`, getHeaders());
  return response.data;
};

export const publishSeries = async (id, isPublished) => {
  const response = await axios.patch(`${API_URL}/admin/series/${id}/publish?is_published=${isPublished}`, {}, getHeaders());
  return response.data;
};

// --- SEASONS ---
export const getSeasons = async (seriesId) => {
  const response = await axios.get(`${API_URL}/admin/seasons/?series_id=${seriesId}`, getHeaders());
  return response.data;
};

export const createSeason = async (data) => {
  const response = await axios.post(`${API_URL}/admin/seasons/`, data, getHeaders());
  return response.data;
};

export const updateSeason = async (id, data) => {
  const response = await axios.put(`${API_URL}/admin/seasons/${id}`, data, getHeaders());
  return response.data;
};

export const deleteSeason = async (id) => {
  const response = await axios.delete(`${API_URL}/admin/seasons/${id}`, getHeaders());
  return response.data;
};

// --- EPISODES ---
export const getEpisodes = async (seasonId) => {
  const response = await axios.get(`${API_URL}/admin/episodes/?season_id=${seasonId}`, getHeaders());
  return response.data;
};

export const createEpisode = async (data) => {
  const response = await axios.post(`${API_URL}/admin/episodes/`, data, getHeaders());
  return response.data;
};

export const updateEpisode = async (id, data) => {
  const response = await axios.put(`${API_URL}/admin/episodes/${id}`, data, getHeaders());
  return response.data;
};

export const deleteEpisode = async (id) => {
  const response = await axios.delete(`${API_URL}/admin/episodes/${id}`, getHeaders());
  return response.data;
};

export const publishEpisode = async (id, isPublished) => {
  const response = await axios.patch(`${API_URL}/admin/episodes/${id}/publish?is_published=${isPublished}`, {}, getHeaders());
  return response.data;
};

// --- MEDIA LIBRARY ---
export const getMediaLibrary = async (category = '', search = '') => {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (search) params.append("search", search);
  const response = await axios.get(`${API_URL}/admin/media/?${params.toString()}`, getHeaders());
  return response.data;
};

export const uploadMediaFile = async (category, file) => {
  const formData = new FormData();
  formData.append("file", file);
  
  const headers = getHeaders();
  headers.headers['Content-Type'] = 'multipart/form-data';
  
  const response = await axios.post(
    `${API_URL}/admin/media/upload?category=${category}`,
    formData,
    headers
  );
  return response.data;
};

export const deleteMediaItem = async (id) => {
  const response = await axios.delete(`${API_URL}/admin/media/${id}`, getHeaders());
  return response.data;
};
