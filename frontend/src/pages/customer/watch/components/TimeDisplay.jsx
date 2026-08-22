// src/pages/customer/watch/components/TimeDisplay.jsx
export default function TimeDisplay({ currentTime, duration }) {
  const formatTime = (secs) => {
    if (isNaN(secs)) return "00:00";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    const mm = m < 10 ? `0${m}` : m;
    const ss = s < 10 ? `0${s}` : s;
    if (h > 0) {
      return `${h}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  return (
    <div className="text-xs text-white/70 font-semibold font-mono tracking-wider select-none">
      <span>{formatTime(currentTime)}</span>
      <span className="mx-1 text-white/30">/</span>
      <span>{formatTime(duration)}</span>
    </div>
  );
}
