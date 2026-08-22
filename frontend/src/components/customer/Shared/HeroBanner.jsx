import { useEffect, useState } from "react";
import { getFeaturedContent } from "../../../services/customerService";
import usePlayNavigation from "../../../hooks/usePlayNavigation";

export default function HeroBanner() {
  const [featured, setFeatured] = useState(null);
  const playContent = usePlayNavigation();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await getFeaturedContent();
        setFeatured(data);
      } catch (err) {
        console.error("Error loading featured content:", err);
      }
    };
    fetchFeatured();
  }, []);

  if (!featured) return <div className="h-64 bg-zinc-900 border border-white/5 rounded-2xl animate-pulse" />;

  return (
    <div className="relative rounded-2xl overflow-hidden aspect-video max-h-[360px] w-full border border-white/5 shadow-2xl">
      {/* Visual gradients overlay simulating theatrical display */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/50 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/35 z-10" />
      
      {/* Cover artwork placeholder gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${featured.gradient} -z-10`} />

      {/* Cinematic details */}
      <div className="absolute inset-0 z-20 p-6 sm:p-10 flex flex-col justify-end items-start space-y-4 max-w-lg">
        <span className="px-2.5 py-0.5 rounded-md bg-red-600 text-[10px] font-black tracking-wider uppercase text-white shadow-md shadow-red-600/30">
          {featured.badge}
        </span>
        <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-none">
          {featured.title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
          {featured.description}
        </p>
        
        <button
          type="button"
          onClick={() => playContent({ ...featured, id: "infinite_horizons", type: "movie" })}
          className="px-6 py-2.5 bg-white hover:bg-gray-200 text-black font-bold rounded-xl text-sm transition-all active:scale-98 cursor-pointer flex items-center gap-2.5 shadow-lg shadow-white/5"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          Resume Watching
        </button>
      </div>
    </div>
  );
}
