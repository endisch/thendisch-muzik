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
    <div className="flex flex-col h-[700px] w-full bg-[#121318]/50 backdrop-blur-xl border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl relative z-20">
      
      {/* Context Menu (Sağ Tık) */}
      {contextMenu?.visible && (
        <div 
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 bg-[#0B0C10] border border-white/10 rounded-2xl shadow-2xl w-56 py-2 overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-2 border-b border-white/5 mb-1">
            <p className="text-xs font-bold text-zinc-400">Hedef Kullanıcı</p>
            <p className="text-sm font-black text-[#D4AF37] truncate">{contextMenu.userName}</p>
          </div>
          <button onClick={() => openModModal("PROFILE")} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-sm text-zinc-300 font-medium transition-colors text-left w-full"><Shield className="w-4 h-4 text-emerald-500" /> Profil Özeti</button>
          <button onClick={() => openModModal("MESSAGES")} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-sm text-zinc-300 font-medium transition-colors text-left w-full"><MessageSquare className="w-4 h-4 text-blue-500" /> Mesaj Geçmişi</button>
          <button onClick={() => openModModal("SONGS")} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-sm text-zinc-300 font-medium transition-colors text-left w-full"><Music className="w-4 h-4 text-purple-500" /> Yüklediği Şarkılar</button>
          <div className="border-t border-white/5 my-1"></div>
          <button onClick={() => openModModal("TIMEOUT")} className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 text-sm text-red-500 font-medium transition-colors text-left w-full"><Clock className="w-4 h-4" /> Kullanıcıyı Sustur</button>
        </div>
      )}

      {/* Moderasyon Modalı */}
      {activeModal && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121318] border border-white/10 rounded-3xl w-full max-w-md max-h-[90%] flex flex-col shadow-2xl overflow-hidden relative">
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#1A1C23]">
              <h3 className="font-black text-white text-lg">
                {activeModal === "PROFILE" && "Kullanıcı Özeti"}
                {activeModal === "MESSAGES" && "Son 50 Mesajı"}
                {activeModal === "SONGS" && "Yüklediği Şarkılar"}
                {activeModal === "TIMEOUT" && "Susturma (Timeout)"}
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
              {modLoading ? (
                <div className="flex items-center justify-center h-40 text-[#D4AF37] animate-pulse font-bold">Veriler Yükleniyor...</div>
              ) : modData ? (
                <div className="flex flex-col gap-4">
                  {/* Profil Detayları */}
                  <div className="flex items-center gap-4 bg-black/50 p-4 rounded-2xl border border-white/5 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 shrink-0 border border-[#D4AF37]/30 flex items-center justify-center overflow-hidden text-[#D4AF37] font-black text-xl">
                      {modData.image ? <img src={modData.image} alt="Avatar" className="w-full h-full object-cover" /> : modData.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{modData.name}</h4>
                      <p className="text-xs text-zinc-500 font-mono">{modData.email}</p>
                    </div>
                  </div>

                  {activeModal === "PROFILE" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Yetki</p>
                        <p className="font-bold text-white">{modData.role}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Şarkı Kredisi</p>
                        <p className="font-bold text-[#D4AF37]">{modData.uploadCredits}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 col-span-2">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Ceza Durumu</p>
                        {modData.chatTimeoutUntil && new Date(modData.chatTimeoutUntil) > new Date() ? (
                          <p className="font-bold text-red-500">Susturuldu (Bitiş: {new Date(modData.chatTimeoutUntil).toLocaleString("tr-TR")})</p>
                        ) : (
                          <p className="font-bold text-emerald-500">Temiz</p>
                        )}
                      </div>
                    </div>
                  )}

                  {activeModal === "MESSAGES" && (
                    <div className="flex flex-col gap-2">
                      {modData.messages.length === 0 ? (
                        <p className="text-zinc-500 text-center py-4 text-sm font-medium">Hiç mesajı yok.</p>
                      ) : (
                        modData.messages.map(m => (
                          <div key={m.id} className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <p className="text-sm text-zinc-300">{m.text}</p>
                            <p className="text-[10px] text-zinc-600 mt-2">{new Date(m.createdAt).toLocaleString("tr-TR")}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeModal === "SONGS" && (
                    <div className="flex flex-col gap-2">
                      {modData.songs.length === 0 ? (
                        <p className="text-zinc-500 text-center py-4 text-sm font-medium">Yüklediği şarkı yok.</p>
                      ) : (
                        modData.songs.map(s => (
                          <div key={s.id} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                            <Music className="w-4 h-4 text-[#D4AF37]" />
                            <div className="flex-1 truncate">
                              <p className="text-sm font-bold text-zinc-300 truncate">{s.title}</p>
                              <p className="text-[10px] text-zinc-600 mt-1">{new Date(s.createdAt).toLocaleDateString("tr-TR")}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeModal === "TIMEOUT" && (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-zinc-400 mb-2">Kullanıcının sohbete mesaj yazmasını ne kadar süreliğine engellemek istiyorsunuz?</p>
                      <button onClick={() => handleTimeout(15)} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-4 rounded-2xl font-black text-sm transition-all text-center">15 Dakika Sustur</button>
                      <button onClick={() => handleTimeout(60)} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-4 rounded-2xl font-black text-sm transition-all text-center">1 Saat Sustur</button>
                      <button onClick={() => handleTimeout(1440)} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-4 rounded-2xl font-black text-sm transition-all text-center">24 Saat Sustur</button>
                      <button onClick={() => handleTimeout(0)} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 py-4 rounded-2xl font-black text-sm transition-all text-center mt-4">Cezayı Kaldır</button>
                    </div>
                  )}
                  
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}


      <div className="relative p-5 border-b border-white/[0.05] bg-gradient-to-b from-[#1A1C23] to-transparent flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            VIP <span className="text-[#D4AF37]">Lounge</span>
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Canlı Sohbet</p>
        </div>
        <div className="absolute top-4 right-5 flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500">{onlineCount} Aktif</span>
        </div>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-600 text-sm font-medium">Sohbet henüz başlamadı.</div>
        ) : (
          messages.map((msg, idx) => {
            const isMyMsg = session?.user?.name === msg.user.name;

            return (
              <div key={msg.id || idx} className={`flex gap-3 group ${isMyMsg ? 'flex-row-reverse' : ''}`}>
                <div 
                  className="w-8 h-8 rounded-full bg-zinc-800 shrink-0 border border-white/5 overflow-hidden flex items-center justify-center cursor-pointer hover:border-[#D4AF37] transition-colors"
                  onClick={() => router.push(`/user/${msg.user.id}`)}
                  onContextMenu={(e) => handleContextMenu(e, msg.user.id, msg.user.name || "Anonim")}
                >
                  {msg.user.image ? (
                    <img src={msg.user.image} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-[#D4AF37]">{msg.user.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className={`flex flex-col max-w-[75%] ${isMyMsg ? 'items-end' : 'items-start'}`}>
                  <div 
                    className="flex items-center gap-1.5 mb-1 cursor-pointer"
                    onClick={() => router.push(`/user/${msg.user.id}`)}
                    onContextMenu={(e) => handleContextMenu(e, msg.user.id, msg.user.name || "Anonim")}
                  >
                    <span className="text-[10px] text-zinc-500 font-medium hover:text-white transition-colors">{msg.user.name}</span>
                    {msg.user.isVerifiedArtist && <span title="Doğrulanmış Sanatçı"><CheckCircle2 className="w-3 h-3 text-[#D4AF37]" /></span>}
                    {msg.user.role === "ADMIN" && <span title="Yönetici"><ShieldAlert className="w-3 h-3 text-red-500" /></span>}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isAdmin && !isMyMsg && (
                      <button 
                        onClick={() => deleteMessage(msg.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Mesajı Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMyMsg ? 'bg-[#D4AF37] text-black rounded-tr-sm font-medium' : 'bg-white/[0.04] text-zinc-300 rounded-tl-sm border border-white/[0.02]'}`}>
                      {msg.text}
                    </div>

                    {isAdmin && isMyMsg && (
                      <button 
                        onClick={() => deleteMessage(msg.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
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

      <div className="p-4 border-t border-white/[0.05] bg-[#0B0C10]">
        {session?.user ? (
          <form onSubmit={sendMessage} className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={200}
              placeholder="Mesajınızı yazın..." 
              className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm rounded-full px-5 py-3.5 pr-12 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.05] transition-all"
            />
            <button 
              type="submit" 
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#D4AF37] text-black rounded-full disabled:opacity-50 disabled:bg-zinc-700 transition-colors"
            >
              <Send className="w-4 h-4 translate-x-px translate-y-px" />
            </button>
          </form>
        ) : (
          <div className="text-center text-xs text-zinc-500 p-3 bg-white/[0.02] rounded-xl border border-white/[0.02]">
            Sohbete katılmak için <a href="/login" className="text-[#D4AF37] font-bold hover:underline">Giriş Yapın</a>
          </div>
        )}
      </div>
    </div>
  );
}
