"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, X } from "lucide-react";

type Notification = {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error("Bildirimler yüklenemedi", err);
      }
    };
    fetchNotifications();

    // Check every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      try {
        await fetch("/api/notifications", { method: "PATCH" });
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        console.error("Bildirimler okundu işaretlenemedi", err);
      }
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleOpen}
        aria-label="Bildirimleri aç" aria-expanded={isOpen}
        className="relative rounded-none border border-[#2a3038] bg-[#12161b] p-3 transition-colors hover:border-[#ff543b]/50 group"
      >
        <Bell className="w-5 h-5 text-[#dde2e9] group-hover:text-[#ff6c55] transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 flex h-5 w-5 items-center justify-center rounded-none bg-[#ff543b] text-xs font-semibold text-[#090b0e] shadow-lg">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-5 top-40 mt-3 bg-[#12161b] border border-white/10 rounded-none shadow-2xl overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in duration-200 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:w-80">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20">
            <h3 className="font-semibold text-[#f7f8fa] text-base tracking-tight">Bildirimler</h3>
            <button onClick={() => setIsOpen(false)} className="text-[#adb5c0] hover:text-[#f7f8fa] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-[#adb5c0] text-sm">
                Yeni bir bildirim olduğunda burada göreceksin.
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-none flex gap-3 transition-colors ${notification.isRead ? "hover:bg-white/5 opacity-70" : "bg-white/5 border border-white/5"}`}
                  >
                    <div className="text-sm text-[#f7f8fa] leading-relaxed">
                      {notification.message}
                      <div className="text-xs text-[#adb5c0] mt-1 uppercase tracking-widest font-mono">
                        {new Date(notification.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
