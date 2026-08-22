// src/pages/admin/MediaLibrary.jsx
import { useEffect, useState } from "react";
import { getMediaLibrary, uploadMediaFile, deleteMediaItem } from "../../services/cmsService";
import useToast from "../../hooks/useToast";
import { 
  Image, Film, FileText, Search, Filter, PlusCircle, 
  Trash2, Copy, Check, Clock, ShieldCheck, Eye, HardDrive, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MediaLibrary() {
  const { showToast } = useToast();
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // File Upload states
  const [uploadCategory, setUploadCategory] = useState("posters");
  const [selectedFile, setSelectedFile] = useState(null);

  const categories = [
    { value: "", label: "All Categories" },
    { value: "movies", label: "Movies" },
    { value: "series", label: "Series Posters" },
    { value: "episodes", label: "Episodes" },
    { value: "trailers", label: "Trailers" },
    { value: "posters", label: "Movie Posters" },
    { value: "banners", label: "Banners" },
    { value: "thumbnails", label: "Thumbnails" },
    { value: "subtitles", label: "Subtitles" }
  ];

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const data = await getMediaLibrary(category, search);
      setMediaItems(data);
    } catch (err) {
      showToast("error", "Failed to load media library assets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLibrary();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast("warning", "Please select a file to upload");
      return;
    }

    try {
      setUploading(true);
      await uploadMediaFile(uploadCategory, selectedFile);
      showToast("success", "Media asset uploaded successfully!");
      setSelectedFile(null);
      // Reset input element
      document.getElementById("file-input").value = "";
      fetchLibrary();
    } catch (err) {
      showToast("error", err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this media asset? This will also remove the physical file from disk.")) return;
    try {
      await deleteMediaItem(id);
      showToast("success", "Media asset deleted successfully");
      fetchLibrary();
    } catch (err) {
      showToast("error", "Failed to delete media asset");
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("success", "Copied filepath to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getMediaPreview = (item) => {
    const isImage = item.content_type.startsWith("image/");
    const isVideo = item.content_type.startsWith("video/");
    const serverUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const fullUrl = `${serverUrl}${item.filepath}`;

    if (isImage) {
      return (
        <img 
          src={fullUrl} 
          alt={item.filename} 
          className="w-full h-full object-cover rounded-lg"
        />
      );
    } else if (isVideo) {
      return (
        <div className="relative w-full h-full bg-zinc-950 flex items-center justify-center rounded-lg">
          <Film className="w-10 h-10 text-purple-400/40" />
          <video src={fullUrl} className="absolute inset-0 w-full h-full object-cover opacity-0 hover:opacity-100 transition-opacity rounded-lg" muted playsInline />
        </div>
      );
    } else {
      return (
        <div className="w-full h-full bg-zinc-900 flex items-center justify-center rounded-lg">
          <FileText className="w-10 h-10 text-zinc-500" />
        </div>
      );
    }
  };

  return (
    <div className="space-y-6 text-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Media Library</h1>
          <p className="text-sm text-zinc-400 mt-1">Upload and manage static movie assets, trailers, thumbnails, and banners.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchLibrary}
            className="p-2.5 rounded-xl border border-white/5 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid: Upload Widget and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Form Widget */}
        <div className="lg:col-span-1 border border-white/5 bg-zinc-900/40 backdrop-blur-md rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <PlusCircle className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold">Upload New Media</h2>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Asset Category</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/5 bg-zinc-950 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              >
                {categories.filter(c => c.value).map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Select File</label>
              <input
                type="file"
                id="file-input"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full text-xs text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Supports images, MP4, WebM up to local filesystem limits.</p>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-purple-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                  Uploading Asset...
                </>
              ) : (
                <>Upload Asset</>
              )}
            </button>
          </form>
        </div>

        {/* Filters and Search */}
        <div className="lg:col-span-2 border border-white/5 bg-zinc-900/40 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold">Search & Filters</h2>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search by filename..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/5 bg-zinc-950 text-white text-xs focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Search
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Category Filter</label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        category === cat.value
                          ? "bg-purple-600/10 border-purple-500 text-purple-400"
                          : "border-white/5 bg-zinc-950 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          <div className="flex items-center gap-4 border-t border-white/5 pt-4 mt-4">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <HardDrive className="w-4 h-4" />
              <span>Storage quota: Unlimited (Local Dev)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Media Items Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-zinc-900/40 border border-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : mediaItems.length === 0 ? (
        <div className="border border-white/5 bg-zinc-900/20 rounded-2xl py-16 text-center text-zinc-500">
          <Image className="w-12 h-12 mx-auto text-zinc-700 mb-3" />
          <p className="text-sm font-semibold">No media assets found</p>
          <p className="text-xs text-zinc-600 mt-1">Upload posters or videos to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaItems.map((item) => (
            <div 
              key={item.id} 
              className="group relative aspect-square border border-white/5 bg-zinc-900/30 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/5"
            >
              {/* Media Preview Container */}
              <div className="relative flex-1 p-2">
                <div className="w-full h-full rounded-lg overflow-hidden bg-zinc-950">
                  {getMediaPreview(item)}
                </div>

                {/* Floating Category Tag */}
                <span className="absolute top-4 left-4 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-black/60 text-purple-400 border border-purple-500/20 backdrop-blur-sm">
                  {item.category}
                </span>

                {/* Hover Delete Action Overlay */}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg cursor-pointer hover:bg-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Asset Information Footer */}
              <div className="bg-zinc-950/80 p-3.5 border-t border-white/5 flex flex-col gap-1.5">
                <p className="text-[11px] font-bold truncate text-white/95" title={item.filename}>
                  {item.filename}
                </p>
                
                <div className="flex justify-between items-center text-[10px] text-zinc-500">
                  <span>{formatSize(item.file_size)}</span>
                  <span>{formatDate(item.created_at)}</span>
                </div>

                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={item.filepath}
                    readOnly
                    className="flex-1 bg-zinc-900 border border-white/5 rounded px-2 py-1 text-[9px] font-mono text-zinc-400 select-all focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(item.filepath, item.id)}
                    className="p-1 rounded bg-purple-600/10 border border-purple-500/20 hover:bg-purple-600 text-purple-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-2.5 h-2.5" />
                    ) : (
                      <Copy className="w-2.5 h-2.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
