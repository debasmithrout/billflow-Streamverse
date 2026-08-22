// src/pages/customer/watch/components/NotFoundContent.jsx
import { useNavigate } from "react-router-dom";

export default function NotFoundContent({ message = "The requested title could not be found." }) {
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-white p-6 gap-6 text-center select-none">
      <span className="text-5xl" role="img" aria-label="Warning">
        ⚠️
      </span>
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">
          Content Unavailable
        </h2>
        <p className="text-xs text-white/40 max-w-sm mt-2">
          {message}
        </p>
      </div>
      <button
        onClick={() => navigate("/customer")}
        className="sv-btn-primary py-2.5 px-6 text-xs font-bold transition-all transform active:scale-98"
      >
        Return to Dashboard
      </button>
    </div>
  );
}
