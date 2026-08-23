"use client";

import { useEffect, useState, useRef } from "react";
import { Send, MessageSquare, CheckCircle2, ShieldAlert, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

type ChatMessage = {
  id: string;
  text: string;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
    role: string;
    isVerifiedArtist: boolean;
  };
};

export default function LiveChat() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => {
          if (prev.length === data.length && prev[prev.length - 1]?.id === data[data.length - 1]?.id) {
            return prev;
          }
          return data;
        });
      }
    } catch (e) {
      // sessizce hata
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2500); // Poll every 2.5s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Scroll to bottom logically
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
          name: user.name,
          image: user.image,
          role: user.role || "USER",
          isVerifiedArtist: user.isVerifiedArtist || false
        }
      }]);
    }

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
    } catch (e) {
      // Handle error visually if needed
    }
  };

  const deleteMessage = async (id: string) => {
    // Optimistic delete
    setMessages((prev) => prev.filter(msg => msg.id !== id));
    
    try {
      await fetch(`/api/chat?id=${id}`, {
        method: "DELETE"
      });
    } catch (e) {
      console.error("Failed to delete message");
    }
  };

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <div className="flex flex-col h-[700px] w-full bg-[#121318]/50 backdrop-blur-xl border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl relative z-20">
      <div className="p-5 border-b border-white/[0.05] bg-gradient-to-b from-[#1A1C23] to-transparent flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            VIP <span className="text-[#D4AF37]">Lounge</span>
            <span className="relative flex h-2 w-2 ml-1">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D4AF37] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#D4AF37]" />
            </span>
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Canlı Sohbet</p>
        </div>
        <MessageSquare className="w-5 h-5 text-[#D4AF37]/50" />
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-600 text-sm font-medium">Sohbet henüz başlamadı.</div>
        ) : (
          messages.map((msg, idx) => {
            const isMyMsg = session?.user?.name === msg.user.name;

            return (
              <div key={msg.id || idx} className={`flex gap-3 group ${isMyMsg ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-zinc-800 shrink-0 border border-white/5 overflow-hidden flex items-center justify-center">
                  {msg.user.image ? (
                    <img src={msg.user.image} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-[#D4AF37]">{msg.user.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className={`flex flex-col max-w-[75%] ${isMyMsg ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] text-zinc-500 font-medium">{msg.user.name}</span>
                    {msg.user.isVerifiedArtist && <span title="Doğrulanmış Sanatçı"><CheckCircle2 className="w-3 h-3 text-[#D4AF37]" /></span>}
                    {msg.user.role === "ADMIN" && <span title="Yönetici"><ShieldAlert className="w-3 h-3 text-red-500" /></span>}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* If Admin and not my message, show trash icon on hover */}
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

                    {/* If Admin and IS my message, show trash icon on the left (since flex-row-reverse reverses layout) */}
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
