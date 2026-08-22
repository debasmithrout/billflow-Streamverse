// src/pages/admin/SeriesCMS.jsx
import { useEffect, useState } from "react";
import { 
  getSeries, createSeries, updateSeries, deleteSeries,
  getSeasons, createSeason, updateSeason, deleteSeason,
  getEpisodes, createEpisode, updateEpisode, deleteEpisode,
  uploadMediaFile
} from "../../services/cmsService";
import useToast from "../../hooks/useToast";
import { 
  Tv, Layers, Play, Plus, PlusCircle, Trash2, Edit2, 
  X, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SeriesCMS() {
  const { showToast } = useToast();
  const [seriesList, setSeriesList] = useState([]);
  const [search, setSearch] = useState("");

  // Selection states for hierarchy drill-down
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);

  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);

  // Modal control states
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState(null);

  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState(null);

  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState(null);

  const [uploadingField, setUploadingField] = useState(null);

  // Form states
  const [seriesFormData, setSeriesFormData] = useState({
    title: "", slug: "", description: "", short_description: "",
    genres: "", languages: "English", poster: "", banner: "",
    thumbnail: "", trailer_url: "", is_featured: false, is_published: false
  });

  const [seasonFormData, setSeasonFormData] = useState({
    season_number: 1, title: "", description: "", poster: "", order: 1
  });

  const [episodeFormData, setEpisodeFormData] = useState({
    episode_number: 1, title: "", description: "", runtime: "45m",
    thumbnail: "", video_url: "", preview_image: "", is_published: false
  });

  const fetchSeries = async () => {
    try {
      const data = await getSeries({ search });
      setSeriesList(data);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load TV Series list");
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchSeries();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch Seasons when Series changes
  const handleSelectSeries = async (series) => {
    setSelectedSeries(series);
    setSelectedSeason(null);
    setEpisodes([]);
    try {
      const data = await getSeasons(series.id);
      setSeasons(data);
    } catch {
      showToast("error", "Failed to load seasons");
    }
  };

  // Fetch Episodes when Season changes
  const handleSelectSeason = async (season) => {
    setSelectedSeason(season);
    try {
      const data = await getEpisodes(season.id);
      setEpisodes(data);
    } catch {
      showToast("error", "Failed to load episodes");
    }
  };

  // --- SERIES ACTIONS ---
  const openAddSeries = () => {
    setEditingSeries(null);
    setSeriesFormData({
      title: "", slug: "", description: "", short_description: "",
      genres: "", languages: "English", poster: "", banner: "",
      thumbnail: "", trailer_url: "", is_featured: false, is_published: false
    });
    setIsSeriesModalOpen(true);
  };

  const openEditSeries = (series) => {
    setEditingSeries(series);
    setSeriesFormData({
      title: series.title || "",
      slug: series.slug || "",
      description: series.description || "",
      short_description: series.short_description || "",
      genres: Array.isArray(series.genres) ? series.genres.join(", ") : "",
      languages: Array.isArray(series.languages) ? series.languages.join(", ") : "English",
      poster: series.poster || "",
      banner: series.banner || "",
      thumbnail: series.thumbnail || "",
      trailer_url: series.trailer_url || "",
      is_featured: !!series.is_featured,
      is_published: !!series.is_published
    });
    setIsSeriesModalOpen(true);
  };

  const handleSeriesSubmit = async (e) => {
    e.preventDefault();
    const genresList = seriesFormData.genres ? seriesFormData.genres.split(",").map(g => g.trim()).filter(Boolean) : [];
    const langsList = seriesFormData.languages ? seriesFormData.languages.split(",").map(l => l.trim()).filter(Boolean) : ["English"];

    const payload = { ...seriesFormData, genres: genresList, languages: langsList };

    try {
      if (editingSeries) {
        await updateSeries(editingSeries.id, payload);
        showToast("success", "Series updated successfully");
      } else {
        await createSeries(payload);
        showToast("success", "Series created successfully");
      }
      setIsSeriesModalOpen(false);
      fetchSeries();
    } catch {
      showToast("error", "Failed to save series");
    }
  };

  const handleDeleteSeries = async (id) => {
    if (!confirm("Are you sure? Deleting this Series will cascade delete all Seasons and Episodes.")) return;
    try {
      await deleteSeries(id);
      showToast("success", "Series deleted successfully");
      if (selectedSeries?.id === id) {
        setSelectedSeries(null);
        setSelectedSeason(null);
        setSeasons([]);
        setEpisodes([]);
      }
      fetchSeries();
    } catch {
      showToast("error", "Failed to delete series");
    }
  };

  // --- SEASONS ACTIONS ---
  const openAddSeason = () => {
    setEditingSeason(null);
    setSeasonFormData({ season_number: seasons.length + 1, title: "", description: "", poster: "", order: seasons.length + 1 });
    setIsSeasonModalOpen(true);
  };

  const handleSeasonSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...seasonFormData, series_id: selectedSeries.id };
    try {
      if (editingSeason) {
        await updateSeason(editingSeason.id, payload);
        showToast("success", "Season updated");
      } else {
        await createSeason(payload);
        showToast("success", "Season created");
      }
      setIsSeasonModalOpen(false);
      handleSelectSeries(selectedSeries);
    } catch {
      showToast("error", "Failed to save season");
    }
  };

  const handleDeleteSeason = async (id) => {
    if (!confirm("Delete this season? This will delete all episodes inside.")) return;
    try {
      await deleteSeason(id);
      showToast("success", "Season deleted");
      handleSelectSeries(selectedSeries);
    } catch {
      showToast("error", "Failed to delete season");
    }
  };

  // --- EPISODES ACTIONS ---
  const openAddEpisode = () => {
    setEditingEpisode(null);
    setEpisodeFormData({
      episode_number: episodes.length + 1, title: "", description: "",
      runtime: "45m", thumbnail: "", video_url: "", preview_image: "", is_published: false
    });
    setIsEpisodeModalOpen(true);
  };

  const openEditEpisode = (ep) => {
    setEditingEpisode(ep);
    setEpisodeFormData({
      episode_number: ep.episode_number,
      title: ep.title,
      description: ep.description || "",
      runtime: ep.runtime || "45m",
      thumbnail: ep.thumbnail || "",
      video_url: ep.video_url || "",
      preview_image: ep.preview_image || "",
      is_published: !!ep.is_published
    });
    setIsEpisodeModalOpen(true);
  };

  const handleEpisodeSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...episodeFormData, season_id: selectedSeason.id };
    try {
      if (editingEpisode) {
        await updateEpisode(editingEpisode.id, payload);
        showToast("success", "Episode updated");
      } else {
        await createEpisode(payload);
        showToast("success", "Episode created");
      }
      setIsEpisodeModalOpen(false);
      handleSelectSeason(selectedSeason);
    } catch {
      showToast("error", "Failed to save episode");
    }
  };

  const handleDeleteEpisode = async (id) => {
    if (!confirm("Delete this episode?")) return;
    try {
      await deleteEpisode(id);
      showToast("success", "Episode deleted");
      handleSelectSeason(selectedSeason);
    } catch {
      showToast("error", "Failed to delete episode");
    }
  };

  const handleInlineUpload = async (fieldName, category, file, targetForm) => {
    if (!file) return;
    try {
      setUploadingField(fieldName);
      const res = await uploadMediaFile(category, file);
      
      if (targetForm === "series") {
        setSeriesFormData(prev => ({ ...prev, [fieldName]: res.filepath }));
      } else if (targetForm === "season") {
        setSeasonFormData(prev => ({ ...prev, [fieldName]: res.filepath }));
      } else if (targetForm === "episode") {
        setEpisodeFormData(prev => ({ ...prev, [fieldName]: res.filepath }));
      }
      showToast("success", "Asset uploaded successfully");
    } catch {
      showToast("error", "Asset upload failed");
    } finally {
      setUploadingField(null);
    }
  };

  return (
    <div className="space-y-6 text-white min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">TV Series Console</h1>
          <p className="text-sm text-zinc-400 mt-1">Hierarchical control grid for managing Series, Season cards, and Episode video files.</p>
        </div>
        <button
          onClick={openAddSeries}
          className="py-3 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Create TV Series
        </button>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Series List */}
        <div className="border border-white/5 bg-zinc-900/40 backdrop-blur-md rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Tv className="w-4 h-4 text-purple-400" />
              1. TV Series
            </h2>
            <span className="text-[10px] bg-purple-600/10 text-purple-400 px-2 py-0.5 rounded font-mono font-bold">
              {seriesList.length} total
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search series..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchSeries()}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/5 bg-zinc-950 text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-1 adm-scrollbar">
            {seriesList.map((series) => (
              <div
                key={series.id}
                onClick={() => handleSelectSeries(series)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center group ${
                  selectedSeries?.id === series.id
                    ? "bg-purple-600/10 border-purple-500 text-purple-400"
                    : "border-white/5 bg-zinc-950/40 text-zinc-300 hover:border-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-12 bg-zinc-950 rounded-lg overflow-hidden border border-white/5 flex-shrink-0">
                    {series.poster ? (
                      <img src={`${import.meta.env.VITE_API_URL || "http://localhost:8000"}${series.poster}`} className="w-full h-full object-cover" />
                    ) : (
                      <Tv className="w-4 h-4 text-zinc-700 m-auto" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold truncate max-w-[140px]">{series.title}</h3>
                    <p className="text-[9px] text-zinc-500 mt-0.5">{series.genres?.slice(0, 2).join(", ")}</p>
                  </div>
                </div>

                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditSeries(series); }}
                    className="p-1 rounded bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteSeries(series.id); }}
                    className="p-1 rounded bg-red-600/10 border border-red-500/20 hover:bg-red-600 text-red-400 hover:text-white cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Seasons List */}
        <div className="border border-white/5 bg-zinc-900/40 backdrop-blur-md rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              2. Seasons
            </h2>
            {selectedSeries && (
              <button
                onClick={openAddSeason}
                className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Add Season
              </button>
            )}
          </div>

          {!selectedSeries ? (
            <div className="border border-dashed border-white/5 rounded-xl py-12 text-center text-zinc-600 text-xs">
              <Tv className="w-8 h-8 mx-auto opacity-20 mb-2" />
              Select a series to manage seasons
            </div>
          ) : seasons.length === 0 ? (
            <div className="border border-dashed border-white/5 rounded-xl py-12 text-center text-zinc-600 text-xs">
              No seasons added yet
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-1 adm-scrollbar">
              {seasons.map((season) => (
                <div
                  key={season.id}
                  onClick={() => handleSelectSeason(season)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center group ${
                    selectedSeason?.id === season.id
                      ? "bg-purple-600/10 border-purple-500 text-purple-400"
                      : "border-white/5 bg-zinc-950/40 text-zinc-300 hover:border-white/10"
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold">Season {season.season_number}</h4>
                    <p className="text-[9px] text-zinc-500 mt-0.5">{season.title || "No season title"}</p>
                  </div>

                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSeason(season);
                        setSeasonFormData({
                          season_number: season.season_number,
                          title: season.title || "",
                          description: season.description || "",
                          poster: season.poster || "",
                          order: season.order || 0
                        });
                        setIsSeasonModalOpen(true);
                      }}
                      className="p-1 rounded bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteSeason(season.id); }}
                      className="p-1 rounded bg-red-600/10 border border-red-500/20 hover:bg-red-600 text-red-400 hover:text-white cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 3: Episodes List */}
        <div className="border border-white/5 bg-zinc-900/40 backdrop-blur-md rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Play className="w-4 h-4 text-purple-400" />
              3. Episodes
            </h2>
            {selectedSeason && (
              <button
                onClick={openAddEpisode}
                className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Add Episode
              </button>
            )}
          </div>

          {!selectedSeason ? (
            <div className="border border-dashed border-white/5 rounded-xl py-12 text-center text-zinc-600 text-xs">
              <Layers className="w-8 h-8 mx-auto opacity-20 mb-2" />
              Select a season to view episodes
            </div>
          ) : episodes.length === 0 ? (
            <div className="border border-dashed border-white/5 rounded-xl py-12 text-center text-zinc-600 text-xs">
              No episodes in this season
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-1 adm-scrollbar">
              {episodes.map((ep) => (
                <div
                  key={ep.id}
                  className="p-3 rounded-xl border border-white/5 bg-zinc-950/40 text-zinc-300 flex justify-between items-start group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-10 bg-zinc-900 rounded overflow-hidden flex-shrink-0 border border-white/5">
                      {ep.thumbnail ? (
                        <img src={`${import.meta.env.VITE_API_URL || "http://localhost:8000"}${ep.thumbnail}`} className="w-full h-full object-cover" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-zinc-700 m-auto" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">Ep {ep.episode_number}: {ep.title}</h4>
                      <p className="text-[9px] text-zinc-500 mt-0.5">{ep.runtime || "45m"}</p>
                    </div>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditEpisode(ep)}
                      className="p-1 rounded bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteEpisode(ep.id)}
                      className="p-1 rounded bg-red-600/10 border border-red-500/20 hover:bg-red-600 text-red-400 hover:text-white cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* --- MODAL 1: SERIES FORM --- */}
      <AnimatePresence>
        {isSeriesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSeriesModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl h-[85vh] overflow-y-auto border border-white/10 bg-zinc-950 rounded-2xl p-6 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">{editingSeries ? "Edit TV Series" : "Create TV Series"}</h2>
                <button onClick={() => setIsSeriesModalOpen(false)} className="p-1.5 rounded-lg border border-white/5 hover:bg-zinc-900 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSeriesSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Title</label>
                    <input type="text" value={seriesFormData.title} onChange={e => setSeriesFormData({...seriesFormData, title: e.target.value})} className="w-full p-2 rounded bg-zinc-900 border border-white/5 text-xs text-white" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Slug</label>
                    <input type="text" value={seriesFormData.slug} onChange={e => setSeriesFormData({...seriesFormData, slug: e.target.value})} className="w-full p-2 rounded bg-zinc-900 border border-white/5 text-xs text-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Genres (Comma separated)</label>
                  <input type="text" value={seriesFormData.genres} onChange={e => setSeriesFormData({...seriesFormData, genres: e.target.value})} className="w-full p-2 rounded bg-zinc-900 border border-white/5 text-xs text-white" placeholder="Drama, Action, Mystery" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Full Description</label>
                  <textarea value={seriesFormData.description} onChange={e => setSeriesFormData({...seriesFormData, description: e.target.value})} rows={3} className="w-full p-2 rounded bg-zinc-900 border border-white/5 text-xs text-white" />
                </div>

                {/* File Upload Configuration */}
                <div className="space-y-2 p-3 bg-zinc-900/40 border border-white/5 rounded-xl">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Media Files (Path or Upload)</span>
                  
                  {[
                    { label: "Poster Path", name: "poster", cat: "series" },
                    { label: "Banner Path", name: "banner", cat: "banners" },
                    { label: "Thumbnail Path", name: "thumbnail", cat: "thumbnails" },
                    { label: "Trailer Path", name: "trailer_url", cat: "trailers" }
                  ].map((field) => (
                    <div key={field.name} className="flex gap-2 items-center">
                      <span className="text-[10px] text-zinc-500 w-24">{field.label}</span>
                      <input type="text" value={seriesFormData[field.name]} onChange={e => setSeriesFormData({...seriesFormData, [field.name]: e.target.value})} className="flex-1 p-1.5 rounded bg-zinc-950 border border-white/5 text-[10px] font-mono text-zinc-300" />
                      <input type="file" onChange={(e) => handleInlineUpload(field.name, field.cat, e.target.files[0], "series")} id={`file-${field.name}`} className="hidden" />
                      <label htmlFor={`file-${field.name}`} className="p-1.5 border border-white/5 rounded text-[10px] text-purple-400 cursor-pointer hover:bg-purple-600 hover:text-white">
                        {uploadingField === field.name ? "..." : "Upload"}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={seriesFormData.is_featured} onChange={e => setSeriesFormData({...seriesFormData, is_featured: e.target.checked})} className="rounded bg-zinc-900 text-purple-600 border-white/5" />
                    <span className="text-xs">Featured Title</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={seriesFormData.is_published} onChange={e => setSeriesFormData({...seriesFormData, is_published: e.target.checked})} className="rounded bg-zinc-900 text-purple-600 border-white/5" />
                    <span className="text-xs">Publish Immediately</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button type="button" onClick={() => setIsSeriesModalOpen(false)} className="py-2.5 px-4 rounded bg-zinc-900 border border-white/5 text-xs">Cancel</button>
                  <button type="submit" className="py-2.5 px-4 rounded bg-purple-600 text-xs font-bold">Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL 2: SEASON FORM --- */}
      <AnimatePresence>
        {isSeasonModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80" onClick={() => setIsSeasonModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="relative w-full max-w-md border border-white/10 bg-zinc-950 rounded-2xl p-6 space-y-4"
            >
              <h2 className="text-base font-bold">{editingSeason ? "Edit Season Card" : "Add Season"}</h2>
              
              <form onSubmit={handleSeasonSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1">Season Number</label>
                  <input type="number" value={seasonFormData.season_number} onChange={e => setSeasonFormData({...seasonFormData, season_number: parseInt(e.target.value) || 1})} className="w-full p-2 bg-zinc-900 border border-white/5 text-xs" required />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1">Title (Optional)</label>
                  <input type="text" value={seasonFormData.title} onChange={e => setSeasonFormData({...seasonFormData, title: e.target.value})} className="w-full p-2 bg-zinc-900 border border-white/5 text-xs" placeholder="e.g. The End of Everything" />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1">Description</label>
                  <textarea value={seasonFormData.description} onChange={e => setSeasonFormData({...seasonFormData, description: e.target.value})} rows={2} className="w-full p-2 bg-zinc-900 border border-white/5 text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1">Order Index</label>
                  <input type="number" value={seasonFormData.order} onChange={e => setSeasonFormData({...seasonFormData, order: parseInt(e.target.value) || 0})} className="w-full p-2 bg-zinc-900 border border-white/5 text-xs" />
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsSeasonModalOpen(false)} className="py-2 px-3 bg-zinc-900 border border-white/5 rounded text-xs">Cancel</button>
                  <button type="submit" className="py-2 px-3 bg-purple-600 rounded text-xs font-bold">Save Season</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL 3: EPISODE FORM --- */}
      <AnimatePresence>
        {isEpisodeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80" onClick={() => setIsEpisodeModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="relative w-full max-w-lg h-[80vh] overflow-y-auto border border-white/10 bg-zinc-950 rounded-2xl p-6 space-y-4"
            >
              <h2 className="text-base font-bold">{editingEpisode ? "Edit Episode Details" : "Add Episode"}</h2>
              
              <form onSubmit={handleEpisodeSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Episode Number</label>
                    <input type="number" value={episodeFormData.episode_number} onChange={e => setEpisodeFormData({...episodeFormData, episode_number: parseInt(e.target.value) || 1})} className="w-full p-2 bg-zinc-900 border border-white/5 text-xs" required />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Title</label>
                    <input type="text" value={episodeFormData.title} onChange={e => setEpisodeFormData({...episodeFormData, title: e.target.value})} className="w-full p-2 bg-zinc-900 border border-white/5 text-xs" required />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1">Description</label>
                  <textarea value={episodeFormData.description} onChange={e => setEpisodeFormData({...episodeFormData, description: e.target.value})} rows={3} className="w-full p-2 bg-zinc-900 border border-white/5 text-xs" />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1">Runtime</label>
                  <input type="text" value={episodeFormData.runtime} onChange={e => setEpisodeFormData({...episodeFormData, runtime: e.target.value})} className="w-full p-2 bg-zinc-900 border border-white/5 text-xs" />
                </div>

                {/* Media inline uploads */}
                <div className="space-y-2 p-3 bg-zinc-900/40 border border-white/5 rounded-xl">
                  <span className="text-[10px] font-bold text-zinc-400 block mb-1">Episode Video & Thumbnail</span>
                  
                  {[
                    { label: "Thumbnail Path", name: "thumbnail", cat: "thumbnails" },
                    { label: "Preview Image", name: "preview_image", cat: "episodes" },
                    { label: "Video Source path", name: "video_url", cat: "episodes" }
                  ].map((field) => (
                    <div key={field.name} className="flex gap-2 items-center">
                      <span className="text-[10px] text-zinc-500 w-24">{field.label}</span>
                      <input type="text" value={episodeFormData[field.name]} onChange={e => setEpisodeFormData({...episodeFormData, [field.name]: e.target.value})} className="flex-1 p-1.5 rounded bg-zinc-950 border border-white/5 text-[10px] font-mono text-zinc-300" />
                      <input type="file" onChange={(e) => handleInlineUpload(field.name, field.cat, e.target.files[0], "episode")} id={`file-ep-${field.name}`} className="hidden" />
                      <label htmlFor={`file-ep-${field.name}`} className="p-1.5 border border-white/5 rounded text-[10px] text-purple-400 cursor-pointer hover:bg-purple-600 hover:text-white">
                        {uploadingField === field.name ? "..." : "Upload"}
                      </label>
                    </div>
                  ))}
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input type="checkbox" checked={episodeFormData.is_published} onChange={e => setEpisodeFormData({...episodeFormData, is_published: e.target.checked})} className="rounded bg-zinc-900 border-white/5 text-purple-600" />
                  <span className="text-xs">Published & Visible</span>
                </label>

                <div className="flex justify-end gap-2 pt-4">
                  <button type="button" onClick={() => setIsEpisodeModalOpen(false)} className="py-2 px-3 bg-zinc-900 border border-white/5 rounded text-xs">Cancel</button>
                  <button type="submit" className="py-2 px-3 bg-purple-600 rounded text-xs font-bold">Save Episode</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
