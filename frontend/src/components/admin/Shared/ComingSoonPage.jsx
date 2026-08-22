// src/components/admin/Shared/ComingSoonPage.jsx
import { useNavigate } from "react-router-dom";

export default function ComingSoonPage({ title, description, icon }) {
  const navigate = useNavigate();

  return (
    <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 animate-fade-in max-w-md mx-auto">
      {/* Icon Area */}
      <div className="w-20 h-20 bg-red-600/10 rounded-2xl border border-red-650/20 flex items-center justify-center text-red-500 shadow-lg shadow-red-600/5">
        {icon ? (
          icon
        ) : (
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
        <p className="text-xs text-gray-500 font-light leading-relaxed">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate("/admin")}
        className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white rounded-xl border border-white/5 transition-all shadow-md active:scale-98 cursor-pointer focus:outline-none"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
