// src/constants/mockData.js
// Centralized streaming content data for StreamVerse UI

export const HERO_SLIDES = [
  {
    id: "jw4",
    title: "John Wick: Chapter 4",
    tagline: "No way back. One way forward.",
    description: "John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face a new enemy with powerful alliances across the globe.",
    backdrop: "https://image.tmdb.org/t/p/original/sP7MVWz9Fi5nkLmRCNKXnlcKkdb.jpg",
    poster:    "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    gradient:  "from-slate-900 via-neutral-900 to-zinc-900",
    badge:     "StreamVerse Original",
    genre:     ["Action", "Thriller"],
    rating:    "7.8",
    year:      2023,
    runtime:   "2h 49m",
    status:    "NOW PLAYING",
  },
  {
    id: "opp",
    title: "Oppenheimer",
    tagline: "The world forever changes.",
    description: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    backdrop: "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    poster:    "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    gradient:  "from-orange-950 via-amber-950 to-slate-900",
    badge:     "Award Winner",
    genre:     ["Drama", "History"],
    rating:    "8.4",
    year:      2023,
    runtime:   "3h 0m",
    status:    "CRITICALLY ACCLAIMED",
  },
  {
    id: "dune2",
    title: "Dune: Part Two",
    tagline: "Long live the fighters.",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    backdrop: "https://image.tmdb.org/t/p/original/5aUVLiqcW0kFTBfGsCWjvLas91w.jpg",
    poster:    "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    gradient:  "from-amber-950 via-stone-900 to-slate-900",
    badge:     "Epic Adventure",
    genre:     ["Sci-Fi", "Adventure"],
    rating:    "8.5",
    year:      2024,
    runtime:   "2h 46m",
    status:    "BLOCKBUSTER",
  },
  {
    id: "deadpool",
    title: "Deadpool & Wolverine",
    tagline: "Come together.",
    description: "Deadpool is offered a chance to join the Marvel Cinematic Universe, but requires a partner. He recruits the reclusive Logan.",
    backdrop: "https://image.tmdb.org/t/p/original/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg",
    poster:    "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    gradient:  "from-red-950 via-slate-900 to-zinc-900",
    badge:     "Fan Favorite",
    genre:     ["Action", "Comedy", "Superhero"],
    rating:    "7.7",
    year:      2024,
    runtime:   "2h 7m",
    status:    "TRENDING",
  },
];

export const CONTINUE_WATCHING = [
  {
    id: "stranger-things",
    title: "Stranger Things",
    subtitle: "S4 • E7 — The Massacre at Hawkins Lab",
    poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    progress: 62,
    remaining: "38 min left",
    type: "series",
  },
  {
    id: "the-boys",
    title: "The Boys",
    subtitle: "S3 • E5 — The Last Time to Look on This World of Lies",
    poster: "https://image.tmdb.org/t/p/w500/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg",
    progress: 45,
    remaining: "55 min left",
    type: "series",
  },
  {
    id: "inception",
    title: "Inception",
    subtitle: "Movie • Paused",
    poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    progress: 80,
    remaining: "29 min left",
    type: "movie",
  },
  {
    id: "breaking-bad",
    title: "Breaking Bad",
    subtitle: "S5 • E14 — Ozymandias",
    poster: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    progress: 30,
    remaining: "42 min left",
    type: "series",
  },
  {
    id: "top-gun-maverick",
    title: "Top Gun: Maverick",
    subtitle: "Movie • Paused",
    poster: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    progress: 55,
    remaining: "52 min left",
    type: "movie",
  },
  {
    id: "house-of-the-dragon",
    title: "House of the Dragon",
    subtitle: "S2 • E3 — The Burning Mill",
    poster: "https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg",
    progress: 20,
    remaining: "47 min left",
    type: "series",
  },
];

export const TRENDING_MOVIES = [
  { id: "t1", title: "John Wick: Chapter 4", year: 2023, rating: "7.8", genre: "Action", poster: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg" },
  { id: "t2", title: "Oppenheimer",          year: 2023, rating: "8.4", genre: "Drama",  poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
  { id: "t3", title: "Dune: Part Two",       year: 2024, rating: "8.5", genre: "Sci-Fi", poster: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg" },
  { id: "t4", title: "Deadpool & Wolverine", year: 2024, rating: "7.7", genre: "Action", poster: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg" },
  { id: "t5", title: "The Batman",           year: 2022, rating: "7.8", genre: "Thriller",poster:"https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg" },
  { id: "t6", title: "Guardians Vol. 3",     year: 2023, rating: "7.9", genre: "Action", poster: "https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg" },
  { id: "t7", title: "Top Gun: Maverick",    year: 2022, rating: "8.3", genre: "Action", poster: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg" },
  { id: "t8", title: "Avatar: The Way of Water", year:2022, rating:"7.6", genre:"Sci-Fi",poster:"https://image.tmdb.org/t/p/w500/qnzQm0PCVnSyv1dqpVmRgMWHbLD.jpg" },
];

export const NEW_RELEASES = [
  { id: "n1", title: "Alien: Romulus",        year: 2024, rating: "7.3", genre: "Sci-Fi",  poster: "https://image.tmdb.org/t/p/w500/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg" },
  { id: "n2", title: "Twisters",              year: 2024, rating: "7.1", genre: "Action",  poster: "https://www.themoviedb.org/t/p/w1280/pjnD08FlMAIXsfOLKQbvmO0f0MD.jpg" },
  { id: "n3", title: "Inside Out 2",          year: 2024, rating: "7.8", genre: "Animation",poster:"https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg" },
  { id: "n4", title: "Kingdom of the Planet of the Apes", year:2024,rating:"7.0",genre:"Sci-Fi",poster:"https://image.tmdb.org/t/p/w500/gKkl37BQuKTanygYQG1pyYgLVgf.jpg"},
  { id: "n5", title: "Bad Boys: Ride or Die", year: 2024, rating: "6.9", genre: "Action",  poster: "https://www.themoviedb.org/t/p/w1280/oGythE98MYleE6mZlGs5oBGkux1.jpg" },
  { id: "n6", title: "A Quiet Place: Day One",year: 2024, rating: "7.1", genre: "Horror",  poster: "https://image.tmdb.org/t/p/w500/hU42CRk14JuPEdqZG3AWmagiPAP.jpg" },
];

export const POPULAR_SHOWS = [
  { id: "stranger-things", title: "Stranger Things",   season: "S4", episodes: 9,  rating: "8.7", genre: "Sci-Fi",   poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg", type: "series" },
  { id: "the-boys",          title: "The Boys",          season: "S4", episodes: 8,  rating: "8.7", genre: "Action",   poster: "https://image.tmdb.org/t/p/w500/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg", type: "series" },
  { id: "house-of-the-dragon",title: "House of the Dragon",season:"S2",episodes: 8,  rating: "8.4", genre: "Fantasy",  poster: "https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg", type: "series" },
  { id: "the-mandalorian",   title: "The Mandalorian",   season: "S3", episodes: 8,  rating: "8.5", genre: "Sci-Fi",   poster: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg", type: "series" },
  { id: "loki",              title: "Loki",              season: "S2", episodes: 6,  rating: "8.2", genre: "Adventure",poster: "https://image.tmdb.org/t/p/w500/kEl2t3OhXc3Zb9FBh1AuYzRTgZp.jpg", type: "series" },
  { id: "breaking-bad",      title: "Breaking Bad",      season: "S5", episodes: 16, rating: "9.5", genre: "Crime",    poster: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg", type: "series" },
];

export const RECOMMENDED = [
  { id: "r1", title: "Interstellar",      year: 2014, rating: "8.7", genre: "Sci-Fi",   match: "98%", poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
  { id: "r2", title: "The Dark Knight",   year: 2008, rating: "9.0", genre: "Thriller", match: "97%", poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
  { id: "r3", title: "Inception",         year: 2010, rating: "8.8", genre: "Sci-Fi",   match: "95%", poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg" },
  { id: "r4", title: "The Godfather",     year: 1972, rating: "9.2", genre: "Crime",    match: "92%", poster: "https://image.tmdb.org/t/p/w500/wWJbBo5yjw22AIjE8isBFoiBI3S.jpg" },
  { id: "r5", title: "Avengers: Endgame", year: 2019, rating: "8.4", genre: "Action",   match: "90%", poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg" },
  { id: "r6", title: "Parasite",          year: 2019, rating: "8.5", genre: "Thriller", match: "88%", poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg" },
];

export const TOP_10 = [
  { id: "top1", rank: 1, title: "Deadpool & Wolverine", poster: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg", genre: "Action" },
  { id: "top2", rank: 2, title: "Dune: Part Two",       poster: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg", genre: "Sci-Fi" },
  { id: "top3", rank: 3, title: "Inside Out 2",         poster: "https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg", genre: "Animation" },
  { id: "top4", rank: 4, title: "Oppenheimer",          poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", genre: "Drama" },
  { id: "top5", rank: 5, title: "The Batman",           poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg", genre: "Thriller" },
  { id: "top6", rank: 6, title: "Top Gun: Maverick",    poster: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg", genre: "Action" },
];

export const FEATURED_ORIGINALS = [
  { id: "stranger-things", title: "Stranger Things",   badge: "ORIGINAL",  rating: "8.7", genre: "Sci-Fi / Horror",  poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg", type: "series" },
  { id: "the-boys",          title: "The Boys",          badge: "EXCLUSIVE", rating: "8.7", genre: "Action / Satire",  poster: "https://image.tmdb.org/t/p/w500/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg", type: "series" },
  { id: "house-of-the-dragon",title: "House of the Dragon", badge: "ORIGINAL",  rating: "8.4", genre: "Fantasy / Drama",  poster: "https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg", type: "series" },
  { id: "the-mandalorian",   title: "The Mandalorian",   badge: "EXCLUSIVE", rating: "8.5", genre: "Sci-Fi / Adventure",poster:"https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg", type: "series" },
];

export const GENRES = [
  { id: "g1",  label: "Action",    emoji: "⚡" },
  { id: "g2",  label: "Drama",     emoji: "🎭" },
  { id: "g3",  label: "Comedy",    emoji: "😄" },
  { id: "g4",  label: "Sci-Fi",    emoji: "🚀" },
  { id: "g5",  label: "Thriller",  emoji: "🔪" },
  { id: "g6",  label: "Horror",    emoji: "👻" },
  { id: "g7",  label: "Romance",   emoji: "💖" },
  { id: "g8",  label: "Animation", emoji: "🎨" },
  { id: "g9",  label: "Anime",     emoji: "🗡️" },
  { id: "g10", label: "Crime",     emoji: "🔍" },
  { id: "g11", label: "Adventure", emoji: "🗺️" },
  { id: "g12", label: "Fantasy",   emoji: "🐉" },
];

// ── Movies Page ───────────────────────────────────────────────

export const MOVIES_HERO = {
  title: "Interstellar",
  description: "When Earth becomes uninhabitable, humanity sends a team of astronauts through a wormhole in search of a new home.",
  backdrop: "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
  rating: "8.7",
  year: 2014,
  runtime: "2h 49m",
  genre: ["Sci-Fi", "Drama", "Adventure"],
};

export const HOLLYWOOD_MOVIES = [
  { id: "h1", title: "The Godfather",      year: 1972, rating: "9.2", genre: "Crime",    poster: "https://image.tmdb.org/t/p/w500/wWJbBo5yjw22AIjE8isBFoiBI3S.jpg" },
  { id: "h2", title: "Interstellar",       year: 2014, rating: "8.7", genre: "Sci-Fi",   poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
  { id: "h3", title: "The Dark Knight",    year: 2008, rating: "9.0", genre: "Thriller", poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
  { id: "h4", title: "Schindler's List",   year: 1993, rating: "9.0", genre: "Drama",    poster: "https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg" },
  { id: "h5", title: "The Matrix",         year: 1999, rating: "8.7", genre: "Sci-Fi",   poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg" },
  { id: "h6", title: "Avengers: Endgame",  year: 2019, rating: "8.4", genre: "Action",   poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg" },
  { id: "h7", title: "Pulp Fiction",       year: 1994, rating: "8.9", genre: "Crime",    poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg" },
  { id: "h8", title: "Fight Club",         year: 1999, rating: "8.8", genre: "Drama",    poster: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg" },
];

export const BOLLYWOOD_MOVIES = [
  { id: "b1", title: "3 Idiots",         year: 2009, rating: "8.4", genre: "Comedy",  poster: "https://image.tmdb.org/t/p/w500/66A9MqXOyVFCssoloscw79z8Tew.jpg" },
  { id: "b2", title: "Dangal",           year: 2016, rating: "8.4", genre: "Drama",   poster: "https://image.tmdb.org/t/p/w500/cJRPOLEexI7qp2DKtFfCh7YaaUG.jpg" },
  { id: "b3", title: "Lagaan",           year: 2001, rating: "8.1", genre: "Drama",   poster: "https://image.tmdb.org/t/p/w500/z82yWJJ6MJzBjGMfioNcs3KnY5U.jpg" },
  { id: "b4", title: "PK",               year: 2014, rating: "8.2", genre: "Comedy",  poster: "https://image.tmdb.org/t/p/w500/i9V1uuUzJFPjdXOg6knfHci8Mha.jpg" },
  { id: "b5", title: "Taare Zameen Par", year: 2007, rating: "8.5", genre: "Drama",   poster: "https://www.themoviedb.org/t/p/w1280/puHRt6Raovm5ujGCdwLWvRv4NHU.jpg" },
  { id: "b6", title: "Gully Boy",        year: 2019, rating: "7.9", genre: "Drama",   poster: "https://www.themoviedb.org/t/p/w1280/sapDHjqx958rkycX9A7PvIe0fBb.jpg" },
];

export const ACTION_MOVIES = [
  { id: "a1", title: "Mad Max: Fury Road",    year: 2015, rating: "8.1", genre: "Action", poster: "https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg" },
  { id: "a2", title: "Mission: Impossible DR",year: 2023, rating: "7.7", genre: "Action", poster: "https://image.tmdb.org/t/p/w500/NNxYkU70HPurnNCSiCjYAmacwm.jpg" },
  { id: "a3", title: "John Wick: Chapter 4",  year: 2023, rating: "7.8", genre: "Action", poster: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg" },
  { id: "a4", title: "The Dark Knight",       year: 2008, rating: "9.0", genre: "Action", poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
  { id: "a5", title: "Top Gun: Maverick",     year: 2022, rating: "8.3", genre: "Action", poster: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg" },
  { id: "a6", title: "Gladiator",             year: 2000, rating: "8.5", genre: "Action", poster: "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg" },
];

export const TOP_RATED_MOVIES = [
  { id: "tr1", title: "The Shawshank Redemption", year: 1994, rating: "9.3", genre: "Drama",  poster: "https://image.tmdb.org/t/p/w500/lyQBXzOQSuE59IsHyhrp0qIiPAz.jpg" },
  { id: "tr2", title: "The Godfather",             year: 1972, rating: "9.2", genre: "Crime",  poster: "https://image.tmdb.org/t/p/w500/wWJbBo5yjw22AIjE8isBFoiBI3S.jpg" },
  { id: "tr3", title: "The Dark Knight",           year: 2008, rating: "9.0", genre: "Action", poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
  { id: "tr4", title: "Pulp Fiction",              year: 1994, rating: "8.9", genre: "Crime",  poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg" },
  { id: "tr5", title: "Schindler's List",          year: 1993, rating: "9.0", genre: "Drama",  poster: "https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg" },
  { id: "tr6", title: "Interstellar",              year: 2014, rating: "8.7", genre: "Sci-Fi", poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
];

// ── TV Shows Page ─────────────────────────────────────────────

export const TVSHOWS_HERO = {
  title: "Stranger Things",
  description: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
  backdrop: "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
  rating: "8.7",
  seasons: 4,
  episodes: 34,
  genre: ["Sci-Fi", "Horror", "Drama"],
};

export const ANIME_SHOWS = [
  { id: "an1", title: "Attack on Titan",       season: "Final", episodes: 87, rating: "9.0", genre: "Action/Drama",  poster: "https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg" },
  { id: "an2", title: "One Piece",              season: "S1",    episodes: 1000,rating:"9.0", genre: "Adventure",    poster: "https://image.tmdb.org/t/p/w500/zGDhn834DojaLU7KkczgWWk75ET.jpg" },
  { id: "an3", title: "Demon Slayer",           season: "S4",    episodes: 48, rating: "8.7", genre: "Action/Fantasy",poster:"https://image.tmdb.org/t/p/w500/7QG4nyCN0kv5SLTXMCDc8QiUY0a.jpg" },
  { id: "an4", title: "Death Note",             season: "S1",    episodes: 37, rating: "9.0", genre: "Thriller",     poster: "https://image.tmdb.org/t/p/w500/my3wzNVRGTCpaApDXJXcLDsgbE3.jpg" },
  { id: "an5", title: "Fullmetal Alchemist: Brotherhood", season:"S1",episodes:64,rating:"9.1",genre:"Action/Fantasy",poster:"https://image.tmdb.org/t/p/w500/5ZFUEOULaVml7pQuXxhpR2SmVUw.jpg" },
  { id: "an6", title: "Jujutsu Kaisen",         season: "S2",    episodes: 47, rating: "8.8", genre: "Action",       poster: "https://image.tmdb.org/t/p/w500/1xDA3DOsdIl9qMz0tufvwLLRJ1N.jpg" },
];

export const KDRAMA_SHOWS = [
  { id: "kd1", title: "Squid Game",        season: "S2", episodes: 9, rating: "8.0", genre: "Thriller",  poster: "https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg" },
  { id: "kd2", title: "Crash Landing on You",season:"S1",episodes:16,rating:"8.7", genre: "Romance",   poster: "https://image.tmdb.org/t/p/w500/fgBNLPr6mC8pxuR79ENAJY4nBmj.jpg" },
  { id: "kd3", title: "Vincenzo",          season: "S1", episodes: 20, rating: "8.3", genre: "Action",   poster: "https://image.tmdb.org/t/p/w500/eiJeWeCAEZAmRppnXHiTWDcCd3Q.jpg" },
  { id: "kd4", title: "Extraordinary Attorney Woo",season:"S1",episodes:16,rating:"8.7",genre:"Drama",  poster: "https://image.tmdb.org/t/p/w500/zuNOQVI4rEaqwknrfQUVKtlKE2C.jpg" },
];

export const CRIME_SHOWS = [
  { id: "cr1", title: "Breaking Bad",   season:"S5",episodes:62,rating:"9.5",genre:"Crime/Drama",poster:"https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg" },
  { id: "cr2", title: "Better Call Saul",season:"S6",episodes:63,rating:"9.0",genre:"Crime/Drama",poster:"https://image.tmdb.org/t/p/w500/fStn66ZiVMawCPpax22i7Gjyqem.jpg" },
  { id: "cr3", title: "True Detective",  season:"S4",episodes:8, rating:"8.9",genre:"Crime",     poster:"https://image.tmdb.org/t/p/w500/dC7jkj2g1aU8sxKqM6D4g44xA6w.jpg" },
  { id: "cr4", title: "Narcos",          season:"S3",episodes:30,rating:"8.8",genre:"Crime",     poster:"https://image.tmdb.org/t/p/w500/rTmal9fDbwh5F0waol2hq35U4ah.jpg" },
  { id: "cr5", title: "Money Heist",     season:"S5",episodes:41,rating:"8.3",genre:"Crime",     poster:"https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg" },
  { id: "cr6", title: "Peaky Blinders",  season:"S6",episodes:36,rating:"8.8",genre:"Crime",     poster:"https://image.tmdb.org/t/p/w500/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg" },
];

export const LATEST_EPISODES = [
  { id: "the-boys",  episode: "S4 • E8", releaseDate: "Jul 18, 2024",   poster: "https://image.tmdb.org/t/p/w500/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg", type: "series" },
  { id: "loki",      episode: "S2 • E6", releaseDate: "Nov 9, 2023",    poster: "https://image.tmdb.org/t/p/w500/kEl2t3OhXc3Zb9FBh1AuYzRTgZp.jpg", type: "series" },
  { id: "house-of-the-dragon", title: "House of the Dragon", episode: "S2 • E8", releaseDate: "Aug 4, 2024", poster: "https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg", type: "series" },
  { id: "the-mandalorian", episode: "S3 • E8", releaseDate: "Apr 19, 2023", poster: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg", type: "series" },
];

// ── My List Page ──────────────────────────────────────────────

export const MY_LIST_WATCH_LATER = [
  { id: "wl1", title: "Inception",         year: 2010, rating: "8.8", genre: "Sci-Fi",  poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", type: "movie" },
  { id: "wl2", title: "Dune: Part Two",    year: 2024, rating: "8.5", genre: "Sci-Fi",  poster: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg", type: "movie" },
  { id: "wl3", title: "Narcos",            year: 2015, rating: "8.8", genre: "Crime",   poster: "https://image.tmdb.org/t/p/w500/rTmal9fDbwh5F0waol2hq35U4ah.jpg", type: "series" },
  { id: "wl4", title: "Parasite",          year: 2019, rating: "8.5", genre: "Thriller",poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", type: "movie" },
  { id: "wl5", title: "Demon Slayer",      year: 2019, rating: "8.7", genre: "Anime",   poster: "https://image.tmdb.org/t/p/w500/7QG4nyCN0kv5SLTXMCDc8QiUY0a.jpg", type: "series" },
  { id: "wl6", title: "The Matrix",        year: 1999, rating: "8.7", genre: "Sci-Fi",  poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", type: "movie" },
];

export const MY_LIST_FAVORITES = [
  { id: "fv1", title: "The Dark Knight",    year: 2008, rating: "9.0", genre: "Thriller",poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", type: "movie" },
  { id: "fv2", title: "Breaking Bad",       year: 2008, rating: "9.5", genre: "Crime",   poster: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg", type: "series" },
  { id: "fv3", title: "Interstellar",       year: 2014, rating: "8.7", genre: "Sci-Fi",  poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", type: "movie" },
  { id: "fv4", title: "Attack on Titan",    year: 2013, rating: "9.0", genre: "Anime",   poster: "https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg", type: "series" },
  { id: "fv5", title: "The Godfather",      year: 1972, rating: "9.2", genre: "Crime",   poster: "https://image.tmdb.org/t/p/w500/wWJbBo5yjw22AIjE8isBFoiBI3S.jpg", type: "movie" },
];

export const MY_COLLECTIONS = [
  { id: "col1", name: "Marvel Collection",   count: 12, color: "from-red-600 to-rose-700",    emoji: "⚡" },
  { id: "col2", name: "Weekend Watch",       count: 8,  color: "from-blue-600 to-indigo-700", emoji: "🎬" },
  { id: "col3", name: "Anime Favorites",     count: 15, color: "from-purple-600 to-violet-700",emoji:"🗡️" },
  { id: "col4", name: "Sci-Fi Collection",   count: 10, color: "from-cyan-600 to-teal-700",   emoji: "🚀" },
  { id: "col5", name: "Action Marathon",     count: 6,  color: "from-orange-600 to-amber-700", emoji: "💥" },
];
