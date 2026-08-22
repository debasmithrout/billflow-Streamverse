// src/pages/customer/watch/components/LoadingScreen.jsx
export default function LoadingScreen() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-white gap-4 select-none">
      {/* Premium Circular Loader Animation */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin" />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-bold text-white tracking-wide">
          Initializing Stream
        </h3>
        <p className="text-[10px] text-white/40 mt-1">
          Securing connection to premium servers...
        </p>
      </div>
    </div>
  );
}
