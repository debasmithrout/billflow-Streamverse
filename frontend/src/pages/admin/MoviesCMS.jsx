// src/pages/admin/MoviesCMS.jsx
import { useEffect, useState } from "react";
import { getMovies, createMovie, updateMovie, deleteMovie, publishMovie } from "../../services/cmsService";
import { uploadMediaFile } from "../../services/cmsService";
import useToast from "../../hooks/useToast";
import { 
  Film, Search, Filter, PlusCircle, Trash2, Edit2, 
  Upload, Eye, Clock, Check, X, RefreshCw, Star, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MoviesCMS() {
  const { showToast } = useToast();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [isPublished, setIsPublished] = useState("");

  // Modal / Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [uploadingField, setUploadingField] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    short_description: "",
    genres: "",
    language: "English",
    release_date: "",
    runtime: "2h 00m",
    age_rating: "PG-13",
    imdb_rating: 7.0,
    cast: "",
    director: "",
    producer: "",
    studio: "",
    country: "United States",
    poster: "",
    banner: "",
    thumbnail: "",
    trailer_url: "",
    video_url: "",
    is_featured: false,
    is_trending: false,
    is_popular: false,
    is_new_release: false,
    is_premium_only: false,
    is_published: false,
    visibility: "public"
  });

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (search) filters.search = search;
      if (genre) filters.genre = genre;
      if (isPublished !== "") filters.is_published = isPublished === "true";
      
      const data = await getMovies(filters);
      setMovies(data);
    } catch (err) {
      showToast("error", "Failed to load movie catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [genre, isPublished]);

  const openAddModal = () => {
    setEditingMovie(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      short_description: "",
      genres: "",
      language: "English",
      release_date: "",
      runtime: "2h 00m",
      age_rating: "PG-13",
      imdb_rating: 7.0,
      cast: "",
      director: "",
      producer: "",
      studio: "",
      country: "United States",
      poster: "",
      banner: "",
      thumbnail: "",
      trailer_url: "",
      video_url: "",
      is_featured: false,
      is_trending: false,
      is_popular: false,
      is_new_release: false,
      is_premium_only: false,
      is_published: false,
      visibility: "public"
    });
    setIsModalOpen(true);
  };

  const openEditModal = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title || "",
      slug: movie.slug || "",
      description: movie.description || "",
      short_description: movie.short_description || "",
      genres: Array.isArray(movie.genres) ? movie.genres.join(", ") : "",
      language: movie.language || "English",
      release_date: movie.release_date || "",
      runtime: movie.runtime || "2h 00m",
      age_rating: movie.age_rating || "PG-13",
      imdb_rating: movie.imdb_rating || 7.0,
      cast: movie.cast || "",
      director: movie.director || "",
      producer: movie.producer || "",
      studio: movie.studio || "",
      country: movie.country || "United States",
      poster: movie.poster || "",
      banner: movie.banner || "",
      thumbnail: movie.thumbnail || "",
      trailer_url: movie.trailer_url || "",
      video_url: movie.video_url || "",
      is_featured: !!movie.is_featured,
      is_trending: !!movie.is_trending,
      is_popular: !!movie.is_popular,
      is_new_release: !!movie.is_new_release,
      is_premium_only: !!movie.is_premium_only,
      is_published: !!movie.is_published,
      visibility: movie.visibility || "public"
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleFileUpload = async (fieldName, category, file) => {
    if (!file) return;
    try {
      setUploadingField(fieldName);
      const res = await uploadMediaFile(category, file);
      setFormData(prev => ({
        ...prev,
        [fieldName]: res.filepath
      }));
      showToast("success", `File uploaded and set to ${fieldName}`);
    } catch (err) {
      showToast("error", "Asset upload failed");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      showToast("warning", "Title is required");
      return;
    }

    // Process genres
    const genreList = formData.genres
      ? formData.genres.split(",").map(g => g.trim()).filter(Boolean)
      : [];

    const payload = {
      ...formData,
      genres: genreList,
      imdb_rating: parseFloat(formData.imdb_rating) || 0.0,
      release_date: formData.release_date || null
    };

    try {
      if (editingMovie) {
        await updateMovie(editingMovie.id, payload);
        showToast("success", "Movie updated successfully");
      } else {
        await createMovie(payload);
        showToast("success", "Movie created successfully");
      }
      setIsModalOpen(false);
      fetchMovies();
    } catch (err) {
      showToast("error", err.response?.data?.detail || "Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;
    try {
      await deleteMovie(id);
      showToast("success", "Movie deleted successfully");
      fetchMovies();
    } catch (err) {
      showToast("error", "Failed to delete movie");
    }
  };

  const handleTogglePublish = async (movie) => {
    try {
      const updatedStatus = !movie.is_published;
      await publishMovie(movie.id, updatedStatus);
      showToast("success", `Movie ${updatedStatus ? "published" : "unpublished"} successfully`);
      fetchMovies();
    } catch (err) {
      showToast("error", "Failed to toggle status");
    }
  };

  return (
    <div className="space-y-6 text-white min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Movie Catalog CMS</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage streaming paths, featured badges, content ratings, and details.</p>
        </div>
        <button
          onClick={openAddModal}
          className="py-3 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all transform active:scale-98 cursor-pointer flex items-center gap-2 shadow-lg shadow-purple-600/10"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Movie
        </button>
      </div>

      {/* Filters HUD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border border-white/5 bg-zinc-900/40 backdrop-blur-md p-4 rounded-2xl">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchMovies()}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/5 bg-zinc-950 text-white text-xs focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Genre Filter */}
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-full p-3 rounded-xl border border-white/5 bg-zinc-950 text-zinc-400 text-xs focus:outline-none focus:border-purple-500 transition-colors"
        >
          <option value="">All Genres</option>
          <option value="Action">Action</option>
          <option value="Sci-Fi">Sci-Fi</option>
          <option value="Drama">Drama</option>
          <option value="Thriller">Thriller</option>
          <option value="Comedy">Comedy</option>
        </select>

        {/* Publish Status Filter */}
        <select
          value={isPublished}
          onChange={(e) => setIsPublished(e.target.value)}
          className="w-full p-3 rounded-xl border border-white/5 bg-zinc-950 text-zinc-400 text-xs focus:outline-none focus:border-purple-500 transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
      </div>

      {/* Movie Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-zinc-900/40 border border-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="border border-white/5 bg-zinc-900/20 rounded-2xl py-16 text-center text-zinc-500">
          <Film className="w-12 h-12 mx-auto text-zinc-700 mb-3" />
          <p className="text-sm font-semibold">No movies found in the catalog</p>
          <p className="text-xs text-zinc-600 mt-1">Create a new entry to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <div 
              key={movie.id} 
              className="border border-white/5 bg-zinc-900/30 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-purple-500/30 transition-all shadow-xl"
            >
              {/* Card Banner */}
              <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden">
                {movie.banner ? (
                  <img 
                    src={`${import.meta.env.VITE_API_URL || "http://localhost:8000"}${movie.banner}`} 
                    alt={movie.title} 
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700">
                    <Film className="w-12 h-12 opacity-30" />
                  </div>
                )}
                
                {/* Imdb / Premium floating pills */}
                <div className="absolute top-4 left-4 flex gap-1.5">
                  <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-black/60 text-yellow-400 backdrop-blur-sm">
                    <Star className="w-2.5 h-2.5 fill-yellow-400 stroke-yellow-400" />
                    {movie.imdb_rating}
                  </span>
                  {movie.is_premium_only && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-600 text-white backdrop-blur-sm">
                      PREMIUM
                    </span>
                  )}
                </div>

                {/* Status indicator */}
                <span className={`absolute top-4 right-4 text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
                  movie.is_published 
                    ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}>
                  {movie.is_published ? "PUBLISHED" : "DRAFT"}
                </span>
              </div>

              {/* Description Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white tracking-tight leading-tight group-hover:text-purple-400 transition-colors">
                    {movie.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-1">
                    {movie.genres?.map(g => (
                      <span key={g} className="text-[10px] text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-white/5">
                        {g}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {movie.description || "No description provided."}
                  </p>

                  <div className="flex gap-4 pt-2 text-[10px] text-zinc-500 font-medium border-t border-white/5">
                    <span>{movie.runtime || "N/A"}</span>
                    <span>{movie.language || "N/A"}</span>
                    <span>{movie.age_rating || "N/A"}</span>
                  </div>
                </div>

                {/* Operations */}
                <div className="flex justify-between items-center gap-2 mt-5 pt-3 border-t border-white/5">
                  <button
                    onClick={() => handleTogglePublish(movie)}
                    className={`py-1.5 px-3 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                      movie.is_published 
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20" 
                        : "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
                    }`}
                  >
                    {movie.is_published ? "Unpublish" : "Publish"}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(movie)}
                      className="p-2 rounded-lg border border-white/5 hover:border-purple-500/30 hover:bg-purple-600/10 text-zinc-400 hover:text-purple-400 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(movie.id)}
                      className="p-2 rounded-lg border border-white/5 hover:border-red-500/30 hover:bg-red-600/10 text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Add Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-4xl h-[90vh] overflow-y-auto border border-white/10 bg-zinc-950 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold">{editingMovie ? "Edit Movie Details" : "Add New Movie"}</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Fill out catalog details and video streaming routes.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Section 1: Title and Slug */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Movie Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      required
                      placeholder="e.g. Interstellar"
                      className="w-full p-2.5 rounded-xl border border-white/5 bg-zinc-900 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">URL Slug (Auto-generated if empty)</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleFormChange}
                      placeholder="e.g. interstellar"
                      className="w-full p-2.5 rounded-xl border border-white/5 bg-zinc-900 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Descriptions */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Short Description</label>
                    <input
                      type="text"
                      name="short_description"
                      value={formData.short_description}
                      onChange={handleFormChange}
                      placeholder="A short tagline for card descriptions..."
                      className="w-full p-2.5 rounded-xl border border-white/5 bg-zinc-900 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Full Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows={3}
                      placeholder="Detailed movie summary..."
                      className="w-full p-2.5 rounded-xl border border-white/5 bg-zinc-900 text-white text-xs focus:outline-none focus:border-purple-500 resize-y"
                    />
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Genres (Comma separated)</label>
                    <input
                      type="text"
                      name="genres"
                      value={formData.genres}
                      onChange={handleFormChange}
                      placeholder="Sci-Fi, Action, Drama"
                      className="w-full p-2.5 rounded-xl border border-white/5 bg-zinc-900 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Language</label>
                    <input
                      type="text"
                      name="language"
                      value={formData.language}
                      onChange={handleFormChange}
                      className="w-full p-2.5 rounded-xl border border-white/5 bg-zinc-900 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Release Date</label>
                    <input
                      type="date"
                      name="release_date"
                      value={formData.release_date}
                      onChange={handleFormChange}
                      className="w-full p-2.5 rounded-xl border border-white/5 bg-zinc-900 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Runtime</label>
                    <input
                      type="text"
                      name="runtime"
                      value={formData.runtime}
                      onChange={handleFormChange}
                      className="w-full p-2.5 rounded-xl border border-white/5 bg-zinc-900 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Age Rating</label>
                    <input
                      type="text"
                      name="age_rating"
                      value={formData.age_rating}
                      onChange={handleFormChange}
                      className="w-full p-2.5 rounded-xl border border-white/5 bg-zinc-900 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">IMDB Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      name="imdb_rating"
                      value={formData.imdb_rating}
                      onChange={handleFormChange}
                      className="w-full p-2.5 rounded-xl border border-white/5 bg-zinc-900 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Director</label>
                    <input
                      type="text"
                      name="director"
                      value={formData.director}
                      onChange={handleFormChange}
                      className="w-full p-2.5 rounded-xl border border-white/5 bg-zinc-900 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleFormChange}
                      className="w-full p-2.5 rounded-xl border border-white/5 bg-zinc-900 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Media Links and Direct Uploads */}
                <div className="space-y-4 bg-zinc-900/20 border border-white/5 p-4 rounded-xl">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Info className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">Media Assets Configuration</span>
                  </div>

                  {/* Direct upload rows */}
                  {[
                    { label: "Poster URL Path", name: "poster", cat: "posters" },
                    { label: "Banner URL Path", name: "banner", cat: "banners" },
                    { label: "Thumbnail URL Path", name: "thumbnail", cat: "thumbnails" },
                    { label: "Trailer URL Path", name: "trailer_url", cat: "trailers" },
                    { label: "Video Source URL Path", name: "video_url", cat: "movies" }
                  ].map((field) => (
                    <div key={field.name} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                      <span className="text-xs text-zinc-400 font-bold">{field.label}</span>
                      <div className="sm:col-span-2 flex gap-2">
                        <input
                          type="text"
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleFormChange}
                          placeholder={`/uploads/${field.cat}/...`}
                          className="flex-1 p-2 bg-zinc-900 border border-white/5 rounded-lg text-xs text-zinc-300 font-mono"
                        />
                        <div className="relative">
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload(field.name, field.cat, e.target.files[0])}
                            className="hidden"
                            id={`file-upload-${field.name}`}
                          />
                          <label
                            htmlFor={`file-upload-${field.name}`}
                            className="p-2 border border-white/5 hover:border-purple-500 hover:bg-purple-600/10 text-purple-400 hover:text-white rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {uploadingField === field.name ? (
                              <div className="w-3.5 h-3.5 border-2 border-t-transparent border-purple-400 rounded-full animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5" />
                            )}
                            Upload
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Flags Checkboxes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-zinc-900/20 border border-white/5 rounded-xl">
                  {[
                    { label: "Featured Title", name: "is_featured" },
                    { label: "Trending Rail", name: "is_trending" },
                    { label: "Popular Rail", name: "is_popular" },
                    { label: "New Release", name: "is_new_release" },
                    { label: "Premium Subscription Only", name: "is_premium_only" },
                    { label: "Publish Immediately", name: "is_published" }
                  ].map((flag) => (
                    <label key={flag.name} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name={flag.name}
                        checked={formData[flag.name]}
                        onChange={handleFormChange}
                        className="rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500 h-4 w-4"
                      />
                      <span className="text-xs text-zinc-300 font-semibold">{flag.label}</span>
                    </label>
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="py-3 px-6 rounded-xl border border-white/5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-purple-600/10"
                  >
                    {editingMovie ? "Save Changes" : "Create Movie"}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
