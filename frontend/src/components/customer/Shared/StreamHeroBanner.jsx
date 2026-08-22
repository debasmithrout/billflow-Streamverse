// src/components/customer/Shared/StreamHeroBanner.jsx
import { useState, useEffect } from "react";
import { HERO_SLIDES } from "../../../constants/mockData";
import usePlayNavigation from "../../../hooks/usePlayNavigation";
import { useModal } from "../../../context/ModalContext";

const PlayIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);
const InfoIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const StarIcon = () => (
  <svg className="w-3 h-3 fill-current text-yellow-400" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export default function StreamHeroBanner({ id, title: customTitle, description: customDesc, backdrop: customBackdrop, genre: customGenre, rating: customRating, year: customYear, runtime: customRuntime, primaryBtnText = "Play Now", showSlides = true }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imgError, setImgError] = useState(false);

  const playContent = usePlayNavigation();
  const { openContentDetails } = useModal();
  const slide = HERO_SLIDES[activeSlide];


  // If custom props provided, use them; otherwise use slide data
  const resolvedId  = id             || slide.id;
  const title       = customTitle    || slide.title;
  const description = customDesc     || slide.description;
  const backdrop    = customBackdrop || slide.backdrop;
  const genre       = customGenre    || slide.genre;
  const rating      = customRating   || slide.rating;
  const year        = customYear     || slide.year;
  const runtime     = customRuntime  || slide.runtime;
  const badge       = slide.badge;
  const status      = slide.status;

  const cleanBtnText = (primaryBtnText || "").replace(/^[▶\s]+/g, "");

  useEffect(() => {
    if (!showSlides || customTitle) return;
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
        setIsTransitioning(false);
        setImgError(false);
      }, 300);
    }, 7000);
    return () => clearInterval(timer);
  }, [showSlides, customTitle]);

  const handleSlideChange = (idx) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSlide(idx);
      setIsTransitioning(false);
      setImgError(false);
    }, 200);
  };

  return (
    <div className="sv-hero rounded-3xl overflow-hidden" style={{ minHeight: "420px", maxHeight: "520px", height: "clamp(380px, 40vw, 520px)" }}>
      {/* Background */}
      <div
        className="sv-hero-bg transition-opacity duration-700"
        style={{
          opacity: isTransitioning ? 0 : 1,
        }}
      >
        {imgError ? (
          /* Fallback gradient when image not loaded */
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-slate-900 to-black" />
        ) : (
          <img
            src={backdrop}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {/* Gradient overlays */}
      <div className="sv-hero-overlay-left" />
      <div className="sv-hero-overlay-bottom" />
      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#080811]/60 to-transparent" />

      {/* Content */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 max-w-2xl"
        style={{ opacity: isTransitioning ? 0 : 1, transition: "opacity 0.4s ease" }}
      >
        {/* Status + Badge */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {status && (
            <span className="sv-badge sv-badge-live text-[8px]">
              🔴 {status}
            </span>
          )}
          {badge && (
            <span className="sv-badge sv-badge-purple">
              {badge}
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-none tracking-tight mb-3"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}
        >
          {title}
        </h1>

        {/* Meta row */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {rating && (
            <div className="sv-rating">
              <StarIcon /> <span className="text-xs font-bold text-yellow-400">{rating}</span>
            </div>
          )}
          {year && <span className="text-xs text-white/60 font-medium">{year}</span>}
          {runtime && (
            <span className="text-xs text-white/60 font-medium border-l border-white/20 pl-3">{runtime}</span>
          )}
          {genre && genre.map && genre.map((g, i) => (
            <span key={i} className="text-xs text-white/60 border border-white/15 px-2 py-0.5 rounded-full">
              {g}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-sm text-white/70 leading-relaxed mb-6 line-clamp-2 max-w-lg">
          {description}
        </p>

        {/* Action buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => playContent({ id: resolvedId, title, type: id === "tvshows_hero" || resolvedId.startsWith("ps") ? "series" : "movie" })}
            className="sv-btn-white text-sm px-6 py-3 cursor-pointer"
          >
            <PlayIcon /> {cleanBtnText}
          </button>
          <button 
            onClick={() => openContentDetails({
              id: resolvedId,
              title,
              description,
              backdrop,
              genre,
              rating,
              year,
              runtime,
              badge,
              type: id === "tvshows_hero" || resolvedId.startsWith("ps") ? "series" : "movie"
            })}
            className="sv-btn-secondary text-sm px-5 py-3 cursor-pointer"
          >
            <InfoIcon /> More Info
          </button>
          <button
            className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-purple-600/30 hover:border-purple-500/40 transition-all"
            title="Add to My List"
          >
            <PlusIcon />
          </button>
        </div>
      </div>

      {/* Slide indicators */}
      {showSlides && !customTitle && (
        <div className="absolute bottom-6 right-8 flex items-center gap-2">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleSlideChange(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === activeSlide
                  ? "w-6 h-2 bg-purple-500"
                  : "w-2 h-2 bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
