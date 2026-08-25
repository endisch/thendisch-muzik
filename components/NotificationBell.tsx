"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, X } from "lucide-react";
import Link from "next/link";

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
        className="relative p-2.5 bg-zinc-900/50 backdrop-blur-md border border-white/[0.06] hover:border-[#D4AF37]/50 transition-colors rounded-xl group"
      >
        <Bell className="w-5 h-5 text-zinc-300 group-hover:text-[#D4AF37] transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-lg">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-[#121318] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20">
            <h3 className="font-bold text-white text-sm tracking-wide">Bildirimler</h3>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-sm">
                Henüz bir bildirim yok.
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-3 rounded-xl flex gap-3 transition-colors ${notification.isRead ? "hover:bg-white/5 opacity-70" : "bg-white/5 border border-white/5"}`}
                  >
                    <div className="text-sm text-zinc-200 leading-snug">
                      {notification.message}
                      <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-mono">
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
