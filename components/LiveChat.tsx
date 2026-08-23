"use client";

import { useEffect, useState, useRef } from "react";
import { Send, MessageSquare, X, CheckCircle2, ShieldAlert } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => {
          if (!isOpen && data.length > 0 && prev.length > 0) {
            const newMsgs = data.filter((d: any) => !prev.some(p => p.id === d.id));
            if (newMsgs.length > 0) setUnreadCount(c => c + newMsgs.length);
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
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

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
      // Will be refreshed by polling anyway
    } catch (e) {
      // Handle error visually if needed
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-500 hover:scale-105 active:scale-95 ${isOpen ? 'bg-zinc-800 text-white' : 'bg-[#D4AF37] text-black hover:bg-[#F3E5AB]'}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-[#0B0C10]/95 backdrop-blur-3xl border-l border-white/[0.05] z-40 flex flex-col transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 border-b border-white/[0.05] bg-gradient-to-b from-[#121318] to-transparent">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            VIP <span className="text-[#D4AF37]">Lounge</span>
            <span className="relative flex h-2 w-2 ml-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D4AF37] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#D4AF37]" />
            </span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Müzik tutkunlarıyla canlı sohbet</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-zinc-600 text-sm font-medium">Sohbet henüz başlamadı.</div>
          ) : (
            messages.map((msg, idx) => {
              // Actually we don't have msg.userId in GET, we just use optimistic id matching or name matching for display styling. Let's just style them uniquely.
              const isMyMsg = session?.user?.name === msg.user.name;

              return (
                <div key={msg.id || idx} className={`flex gap-3 ${isMyMsg ? 'flex-row-reverse' : ''}`}>
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
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMyMsg ? 'bg-[#D4AF37] text-black rounded-tr-sm font-medium' : 'bg-white/[0.04] text-zinc-300 rounded-tl-sm border border-white/[0.02]'}`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
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
    </>
  );
}
