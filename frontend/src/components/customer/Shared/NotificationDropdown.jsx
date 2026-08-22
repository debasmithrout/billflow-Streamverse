// src/components/customer/Shared/NotificationDropdown.jsx
import { useState, useEffect, useRef } from "react";
import { getNotifications, markNotificationsAsRead } from "../../../services/customerService";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    // Fetch notifications initially
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const updated = await markNotificationsAsRead();
      setNotifications(updated);
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer relative transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full animate-pulse" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl p-4 z-50 animate-fade-in origin-top-right">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
            <h3 className="text-sm font-bold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase tracking-wider cursor-pointer focus:outline-none transition-colors"
              >
                Mark All As Read
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent pr-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                No new notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl border transition-colors ${
                    n.read 
                      ? "bg-zinc-900/20 border-white/5 text-gray-400" 
                      : "bg-zinc-900/60 border-red-500/10 text-white shadow-sm shadow-red-500/5"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-bold text-gray-200">{n.title}</h4>
                    <span className="text-[9px] text-gray-500 font-mono shrink-0">{n.date}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-light mt-1 leading-normal">
                    {n.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
