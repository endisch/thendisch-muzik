"use client";

import { useEffect, useState, useRef } from "react";
import { Send, MessageSquare, CheckCircle2, ShieldAlert, Trash2, Shield, Clock, Music, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type ChatMessage = {
  id: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
    isVerifiedArtist: boolean;
  };
};

// Admin Moderasyon Özeti Tipi
type ModSummary = {
  id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  uploadCredits: number;
  chatTimeoutUntil: string | null;
  createdAt: string;
  messages: { id: string; text: string; createdAt: string }[];
  songs: { id: string; title: string; createdAt: string }[];
};

export default function LiveChat() {
  const { data: session } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [input, setInput] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Moderasyon State'leri
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; userId: string; userName: string } | null>(null);
  const [activeModal, setActiveModal] = useState<"PROFILE" | "MESSAGES" | "SONGS" | "TIMEOUT" | null>(null);
  const [modData, setModData] = useState<ModSummary | null>(null);
  const [modLoading, setModLoading] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        const fetchedMessages = Array.isArray(data) ? data : data.messages;
        if (data.onlineCount !== undefined) {
          setOnlineCount(data.onlineCount);
        }
        setMessages((prev) => {
          if (prev.length === fetchedMessages.length && prev[prev.length - 1]?.id === fetchedMessages[fetchedMessages.length - 1]?.id) {
            return prev;
          }
          return fetchedMessages;
        });
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Sayfa geneli tıklamada context menüyü kapat
  useEffect(() => {
    const closeContextMenu = () => setContextMenu(null);
    document.addEventListener("click", closeContextMenu);
    return () => document.removeEventListener("click", closeContextMenu);
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const text = input.trim();
    setInput("");

    // Optimistic UI
    const tempId = Math.random().toString();
    const user = session?.user as any;
    if (user) {
      setMessages((prev) => [...prev, {
        id: tempId,
        text,
        createdAt: new Date().toISOString(),
        user: {
          id: user.id,
          name: user.name,
          image: user.image,
          role: user.role || "USER",
          isVerifiedArtist: user.isVerifiedArtist || false
        }
      }]);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.error) {
        // Hata varsa (örn. susturulduysa) alert ver ve optimistic mesajı sil
        alert(data.error);
        setMessages((prev) => prev.filter(m => m.id !== tempId));
      }
    } catch (e) {}
  };

  const deleteMessage = async (id: string) => {
    setMessages((prev) => prev.filter(msg => msg.id !== id));
    try {
      await fetch(`/api/chat?id=${id}`, { method: "DELETE" });
    } catch (e) {}
  };

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const handleContextMenu = (e: React.MouseEvent, userId: string, userName: string) => {
    if (!isAdmin) return;
    e.preventDefault(); // Sağ tık menüsünü engelle
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, userId, userName });
  };

  const openModModal = async (type: "PROFILE" | "MESSAGES" | "SONGS" | "TIMEOUT") => {
    if (!contextMenu) return;
    setActiveModal(type);
    setModLoading(true);
    try {
      const res = await fetch(`/api/admin/chat-user/${contextMenu.userId}`);
      if (res.ok) {
        const data = await res.json();
        setModData(data);
      }
    } catch (e) {
      alert("Kullanıcı verisi alınamadı.");
    } finally {
      setModLoading(false);
    }
  };

  const handleTimeout = async (minutes: number) => {
    if (!modData) return;
    try {
      const res = await fetch("/api/admin/chat-timeout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: modData.id, durationMinutes: minutes })
      });
      if (res.ok) {
        alert("Kullanıcı başarıyla susturuldu.");
        setActiveModal(null);
      }
    } catch (e) {
      alert("Susturma işlemi başarısız.");
    }
  };

  return (
    <div className="relative z-20 flex h-[640px] sm:h-[700px] w-full flex-col overflow-hidden rounded-none border border-[#2a3038] bg-[#12161b]">

      {/* Context Menu (Sağ Tık) */}
      {contextMenu?.visible && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 bg-[#090b0e] border border-white/10 rounded-none shadow-2xl w-56 py-2 overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-2 border-b border-white/5 mb-1">
            <p className="text-xs font-semibold text-[#b8bec8]">Kullanıcı</p>
            <p className="text-sm font-semibold text-[#ff6c55] truncate">{contextMenu.userName}</p>
          </div>
          <button onClick={() => openModModal("PROFILE")} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-sm text-[#dde2e9] font-medium transition-colors text-left w-full"><Shield className="w-4 h-4 text-emerald-500" /> Profil özeti</button>
          <button onClick={() => openModModal("MESSAGES")} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-sm text-[#dde2e9] font-medium transition-colors text-left w-full"><MessageSquare className="w-4 h-4 text-[#b8bec8]" /> Mesaj geçmişi</button>
          <button onClick={() => openModModal("SONGS")} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-sm text-[#dde2e9] font-medium transition-colors text-left w-full"><Music className="w-4 h-4 text-[#b8bec8]" /> Yüklenen parçalar</button>
          <div className="border-t border-white/5 my-1"></div>
          <button onClick={() => openModModal("TIMEOUT")} className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 text-sm text-red-500 font-medium transition-colors text-left w-full"><Clock className="w-4 h-4" /> Mesaj yazmasını engelle</button>
        </div>
      )}

      {/* Moderasyon Modalı */}
      {activeModal && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#12161b] border border-white/10 rounded-none w-full max-w-md max-h-[90%] flex flex-col shadow-2xl overflow-hidden relative">
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#090b0e]">
              <h3 className="font-semibold text-[#f7f8fa] text-lg">
                {activeModal === "PROFILE" && "Kullanıcı özeti"}
                {activeModal === "MESSAGES" && "Son 50 mesaj"}
                {activeModal === "SONGS" && "Yüklenen parçalar"}
                {activeModal === "TIMEOUT" && "Sohbet erişimi"}
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-none transition-colors text-[#b8bec8]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
              {modLoading ? (
                <div className="flex items-center justify-center h-40 text-[#ff6c55] animate-pulse font-semibold">Bilgiler yükleniyor…</div>
              ) : modData ? (
                <div className="flex flex-col gap-4">
                  {/* Profil Detayları */}
                  <div className="flex items-center gap-4 bg-black/50 p-4 rounded-none border border-white/5 mb-4">
                    <div className="w-12 h-12 rounded-none bg-[#1b222c] shrink-0 border border-[#ff543b]/30 flex items-center justify-center overflow-hidden text-[#ff6c55] font-semibold text-xl">
                      {modData.image ? <img src={modData.image} alt="Profil fotoğrafı" className="w-full h-full object-cover" /> : modData.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#f7f8fa] text-lg">{modData.name}</h4>
                      <p className="text-xs text-[#adb5c0] font-mono">{modData.email}</p>
                    </div>
                  </div>

                  {activeModal === "PROFILE" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 p-4 rounded-none border border-white/5">
                        <p className="text-xs text-[#adb5c0] uppercase tracking-widest mb-1">Yetki</p>
                        <p className="font-semibold text-[#f7f8fa]">{modData.role}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-none border border-white/5">
                        <p className="text-xs text-[#adb5c0] uppercase tracking-widest mb-1">Yükleme hakkı</p>
                        <p className="font-semibold text-[#ff6c55]">{modData.uploadCredits}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-none border border-white/5 col-span-2">
                        <p className="text-xs text-[#adb5c0] uppercase tracking-widest mb-1">Sohbet erişimi</p>
                        {modData.chatTimeoutUntil && new Date(modData.chatTimeoutUntil) > new Date() ? (
                          <p className="font-semibold text-red-500">Mesaj yazma engeli (bitiş: {new Date(modData.chatTimeoutUntil).toLocaleString("tr-TR")})</p>
                        ) : (
                          <p className="font-semibold text-emerald-500">Açık</p>
                        )}
                      </div>
                    </div>
                  )}

                  {activeModal === "MESSAGES" && (
                    <div className="flex flex-col gap-2">
                      {modData.messages.length === 0 ? (
                        <p className="text-[#adb5c0] text-center py-4 text-sm font-medium">Henüz bir mesaj paylaşmamış.</p>
                      ) : (
                        modData.messages.map(m => (
                          <div key={m.id} className="bg-white/5 p-3 rounded-none border border-white/5">
                            <p className="text-sm text-[#dde2e9]">{m.text}</p>
                            <p className="text-xs text-[#adb5c0] mt-2">{new Date(m.createdAt).toLocaleString("tr-TR")}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeModal === "SONGS" && (
                    <div className="flex flex-col gap-2">
                      {modData.songs.length === 0 ? (
                        <p className="text-[#adb5c0] text-center py-4 text-sm font-medium">Henüz bir parça yüklememiş.</p>
                      ) : (
                        modData.songs.map(s => (
                          <div key={s.id} className="bg-white/5 p-3 rounded-none border border-white/5 flex items-center gap-3">
                            <Music className="w-4 h-4 text-[#ff6c55]" />
                            <div className="flex-1 truncate">
                              <p className="text-sm font-semibold text-[#dde2e9] truncate">{s.title}</p>
                              <p className="text-xs text-[#adb5c0] mt-1">{new Date(s.createdAt).toLocaleDateString("tr-TR")}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeModal === "TIMEOUT" && (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-[#b8bec8] mb-2">Bu kişinin mesaj yazmasını ne kadar süre engellemek istiyorsun?</p>
                      <button onClick={() => handleTimeout(15)} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-4 rounded-none font-semibold text-sm transition-all text-center">15 dakika engelle</button>
                      <button onClick={() => handleTimeout(60)} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-4 rounded-none font-semibold text-sm transition-all text-center">1 saat engelle</button>
                      <button onClick={() => handleTimeout(1440)} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-4 rounded-none font-semibold text-sm transition-all text-center">24 saat engelle</button>
                      <button onClick={() => handleTimeout(0)} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 py-4 rounded-none font-semibold text-sm transition-all text-center mt-4">Engeli kaldır</button>
                    </div>
                  )}

                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}


      <div className="relative p-5 border-b border-white/[0.08] bg-[#090b0e] flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#f7f8fa] tracking-tight flex items-center gap-2">
            Stüdyo <span className="text-[#ff6c55]">sohbeti</span>
          </h2>
          <p className="text-xs uppercase tracking-widest text-[#adb5c0] mt-1">Canlı Sohbet</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-none bg-[#ff543b] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-none bg-[#ff543b]" />
          </span>
          <span className="text-xs uppercase tracking-wider font-semibold text-[#adb5c0]">{onlineCount} çevrim içi</span>
        </div>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#adb5c0] text-sm font-medium">Sohbet henüz başlamadı.</div>
        ) : (
          messages.map((msg, idx) => {
            const isMyMsg = session?.user?.name === msg.user.name;

            return (
              <div key={msg.id || idx} className={`flex gap-3 group ${isMyMsg ? 'flex-row-reverse' : ''}`}>
                <div
                  className="w-8 h-8 rounded-none bg-[#1b222c] shrink-0 border border-white/5 overflow-hidden flex items-center justify-center cursor-pointer hover:border-[#ff543b] transition-colors"
                  onClick={() => router.push(`/user/${msg.user.id}`)}
                  onContextMenu={(e) => handleContextMenu(e, msg.user.id, msg.user.name || "Anonim")}
                >
                  {msg.user.image ? (
                    <img src={msg.user.image} alt="Profil fotoğrafı" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold text-[#ff6c55]">{msg.user.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className={`flex flex-col max-w-[75%] ${isMyMsg ? 'items-end' : 'items-start'}`}>
                  <div
                    className="flex items-center gap-1.5 mb-1 cursor-pointer"
                    onClick={() => router.push(`/user/${msg.user.id}`)}
                    onContextMenu={(e) => handleContextMenu(e, msg.user.id, msg.user.name || "Anonim")}
                  >
                    <span className="text-xs text-[#adb5c0] font-medium hover:text-[#f7f8fa] transition-colors">{msg.user.name}</span>
                    {msg.user.isVerifiedArtist && <span title="Doğrulanmış Sanatçı"><CheckCircle2 className="w-3 h-3 text-[#ff6c55]" /></span>}
                    {msg.user.role === "ADMIN" && <span title="Yönetici"><ShieldAlert className="w-3 h-3 text-red-500" /></span>}
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && !isMyMsg && (
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-[#adb5c0] hover:text-red-500 hover:bg-red-500/10 rounded-none transition-all"
                        title="Mesajı Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <div className={`px-4 py-2.5 rounded-none break-words text-sm leading-6 ${isMyMsg ? 'bg-[#ff543b]/15 text-[#f7f8fa] border border-[#ff543b]/30 font-medium' : 'bg-white/[0.04] text-[#dde2e9] border border-white/[0.02]'}`}>
                      {msg.text}
                    </div>

                    {isAdmin && isMyMsg && (
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-[#adb5c0] hover:text-red-500 hover:bg-red-500/10 rounded-none transition-all"
                        title="Mesajı Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-white/[0.05] bg-[#090b0e]">
        {session?.user ? (
          <form onSubmit={sendMessage} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={200}
              placeholder="Sohbete bir şeyler yaz…"
              className="w-full rounded-none border border-white/[0.08] bg-black/30 px-4 py-3.5 pr-12 text-sm text-[#f7f8fa] transition-colors focus:border-[#ff543b]/50 focus:bg-black/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Mesajı gönder"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-none bg-[#ff543b] text-[#090b0e] transition-colors disabled:bg-zinc-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4 translate-x-px translate-y-px" />
            </button>
          </form>
        ) : (
          <div className="text-center text-xs text-[#adb5c0] p-3 bg-white/[0.02] rounded-none border border-white/[0.02]">
            Sohbete katılmak için <a href="/login" className="text-[#ff6c55] font-semibold hover:underline">giriş yap</a>
          </div>
        )}
      </div>
    </div>
  );
}
