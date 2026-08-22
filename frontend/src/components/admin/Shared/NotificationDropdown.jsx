import { useState, useEffect, useRef } from "react";
import { useAdminTheme } from "../../../context/AdminThemeContext";
import { Bell, CheckCheck } from "lucide-react";
import { getNotifications, markNotificationsAsRead } from "../../../services/adminService";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error("Error loading admin notifications:", err);
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const updated = await markNotificationsAsRead();
      setNotifications(updated);
    } catch (err) {
      console.error("Error marking admin notifications as read:", err);
    }
  };

  const { theme } = useAdminTheme();
  const isLight = theme === "light";

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition-colors cursor-pointer focus:outline-none"
        style={{ background: isOpen ? "rgba(255,255,255,0.07)" : "transparent", color: "#64748B" }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#94A3B8"; }}
        onMouseLeave={e => { if (!isOpen) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748B"; } }}
        aria-label="Admin Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className="absolute flex items-center justify-center rounded-full text-[9px] font-black"
            style={{
              top: "5px",
              right: "5px",
              width: "16px",
              height: "16px",
              background: "#EF4444",
              color: "#fff",
              border: "2px solid #09090B"
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 rounded-2xl shadow-2xl adm-fadein"
          style={{
            width: "340px",
            background: isLight ? "var(--notification-bg)" : "#0F172A",
            opacity: 1,
            backdropFilter: isLight ? "blur(24px)" : "none",
            border: isLight ? "1px solid var(--notification-border)" : "1px solid rgba(255, 255, 255, 0.08)",
            transformOrigin: "top right",
            zIndex: 1050
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--notification-divider)" }}
          >
            <div className="flex items-center gap-2">
              <Bell size={14} style={{ color: "#3B82F6" }} />
              <h3 className="text-sm font-bold" style={{ color: "var(--notification-title)" }}>Notifications</h3>
              {unreadCount > 0 && (
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                  style={{ background: "var(--notification-badge-bg)", color: "var(--notification-badge-color)", border: "1px solid var(--notification-badge-border)" }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[10px] font-semibold cursor-pointer focus:outline-none transition-colors"
                style={{ color: "#3B82F6" }}
                onMouseEnter={e => e.currentTarget.style.color = "#60A5FA"}
                onMouseLeave={e => e.currentTarget.style.color = "#3B82F6"}
              >
                <CheckCheck size={11} />
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="py-1 overflow-y-auto" style={{ maxHeight: "300px" }}>
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={28} style={{ color: "#1E293B", margin: "0 auto 10px" }} />
                <p className="text-xs" style={{ color: "var(--notification-message)" }}>No notifications</p>
              </div>
            ) : (
              notifications.map((n, idx) => (
                <div
                  key={n.id || idx}
                  className="px-4 py-3 flex gap-3 items-start transition-colors cursor-pointer"
                  style={{ borderBottom: "1px solid var(--notification-divider)", opacity: n.read ? 0.65 : 1 }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--notification-hover)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {/* Indicator dot */}
                  <div
                    className="mt-1 flex-shrink-0 rounded-full"
                    style={{ width: "6px", height: "6px", background: n.read ? "rgba(255,255,255,0.1)" : "#3B82F6" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-xs font-semibold truncate" style={{ color: n.read ? "var(--notification-read)" : "var(--notification-title)" }}>
                        {n.title}
                      </h4>
                      <span className="text-[9px] font-mono flex-shrink-0" style={{ color: "var(--notification-message)" }}>
                        {n.date}
                      </span>
                    </div>
                    <p className="text-[11px] mt-0.5 leading-normal" style={{ color: "var(--notification-message)" }}>
                      {n.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
