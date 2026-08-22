// src/services/seriesService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

/**
 * Returns a mockup dataset of seasons and episodes for local development.
 * Automatically maps to the local development MP4 movies so offline playback works.
 */
const getDevMockSeasonsAndEpisodes = (seriesId) => {
  return [
    {
      id: `${seriesId}_s1`,
      seasonNumber: 1,
      title: "Season 1",
      episodes: [
        {
          id: `${seriesId}_s1_e1`,
          episodeNumber: 1,
          title: "Chapter One: The Awakening",
          description: "An unexpected dimensional rift is detected in orbit, sending ripples through global communication systems.",
          runtime: "45m",
          thumbnail: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
          videoUrl: "/media/movies/john_wick_4.mp4",
          skipIntroStart: 5,
          skipIntroEnd: 15,
          skipRecapStart: 0,
          skipRecapEnd: 5,
          skipCreditsStart: 110,
          subtitles: [
            { label: "English", src: "/media/subtitles/english.vtt", srclang: "en", default: true },
            { label: "Spanish", src: "/media/subtitles/spanish.vtt", srclang: "es" }
          ],
          audioTracks: [
            { label: "English (Atmos)", lang: "en" },
            { label: "Hindi (Stereo)", lang: "hi" }
          ]
        },
        {
          id: `${seriesId}_s1_e2`,
          episodeNumber: 2,
          title: "Chapter Two: Signals in the Dark",
          description: "A specialized rescue shuttle attempts to cross the quantum bridge but gets separated.",
          runtime: "48m",
          thumbnail: "https://image.tmdb.org/t/p/w500/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg",
          videoUrl: "/media/movies/john_wick_4.mp4",
          skipIntroStart: 10,
          skipIntroEnd: 22,
          subtitles: [
            { label: "English", src: "/media/subtitles/english.vtt", srclang: "en", default: true }
          ]
        },
        {
          id: `${seriesId}_s1_e3`,
          episodeNumber: 3,
          title: "Chapter Three: Horizon Zero",
          description: "Time slippage begins to affect the crew's memories as they prepare for a desperate escape.",
          runtime: "52m",
          thumbnail: "https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg",
          videoUrl: "/media/movies/john_wick_4.mp4",
          skipIntroStart: 8,
          skipIntroEnd: 20
        }
      ]
    },
    {
      id: `${seriesId}_s2`,
      seasonNumber: 2,
      title: "Season 2",
      episodes: [
        {
          id: `${seriesId}_s2_e1`,
          episodeNumber: 1,
          title: "Chapter Four: Paradox Loop",
          description: "Trapped inside a temporal pocket, the survivors must send a message backward in time.",
          runtime: "44m",
          thumbnail: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
          videoUrl: "/media/movies/john_wick_4.mp4"
        },
        {
          id: `${seriesId}_s2_e2`,
          episodeNumber: 2,
          title: "Chapter Five: Gravity Rift",
          description: "The crew discovers the shocking source of the gravitational anomalies tearing space apart.",
          runtime: "50m",
          thumbnail: "https://image.tmdb.org/t/p/w500/kEl2t3OhXc3Zb9FBh1AuYzRTgZp.jpg",
          videoUrl: "/media/movies/john_wick_4.mp4"
        }
      ]
    }
  ];
};

export const seriesService = {
  /**
   * Fetches seasons and episodes list for a series.
   * Leverages a local fallback if backend endpoint isn't fully seeded.
   */
  async getSeasonsAndEpisodes(seriesId) {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        return getDevMockSeasonsAndEpisodes(seriesId);
      }
      
      // 1. Fetch seasons from backend
      const seasonsRes = await axios.get(`${API_URL}/admin/seasons/?series_id=${seriesId}`, getHeaders());
      const seasonsList = seasonsRes.data;
      
      if (!seasonsList || seasonsList.length === 0) {
        return getDevMockSeasonsAndEpisodes(seriesId);
      }
      
      // 2. Fetch episodes for each season
      const enrichedSeasons = await Promise.all(
        seasonsList.map(async (season) => {
          const epRes = await axios.get(`${API_URL}/admin/episodes/?season_id=${season.id}`, getHeaders());
          return {
            id: String(season.id),
            seasonNumber: season.season_number,
            title: season.title,
            description: season.description,
            poster: season.poster,
            order: season.order,
            episodes: (epRes.data || []).map((ep) => ({
              id: String(ep.id),
              episodeNumber: ep.episode_number,
              title: ep.title,
              description: ep.description,
              runtime: ep.runtime,
              thumbnail: ep.thumbnail,
              videoUrl: ep.video_url,
              previewImage: ep.preview_image,
              isPublished: ep.is_published,
              skipIntroStart: ep.skip_intro_start || null,
              skipIntroEnd: ep.skip_intro_end || null,
              skipRecapStart: ep.skip_recap_start || null,
              skipRecapEnd: ep.skip_recap_end || null,
              skipCreditsStart: ep.skip_credits_start || null,
              subtitles: ep.subtitles || [
                { label: "English", src: "/media/subtitles/english.vtt", srclang: "en", default: true }
              ],
              audioTracks: ep.audioTracks || [
                { label: "English (Atmos)", lang: "en" }
              ]
            }))
          };
        })
      );
      
      return enrichedSeasons;
    } catch (err) {
      console.warn("API load failed for series seasons. Falling back to dev mockup.", err);
      return getDevMockSeasonsAndEpisodes(seriesId);
    }
  }
};
