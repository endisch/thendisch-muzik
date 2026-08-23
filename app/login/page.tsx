"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Music2, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [isArtistApplication, setIsArtistApplication] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await signIn("credentials", { email, password, redirect: false });
        if (res?.error) {
          if (res.error.includes("doğrulanmamış")) {
            // Need verification
            setIsVerificationStep(true);
            setIsLogin(false);
          } else {
            setError(res.error);
          }
        } else {
          router.push("/muzik");
          router.refresh();
        }
      } else {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email, 
            password, 
            name, 
            isArtistApplication,
            instagramUrl,
            spotifyUrl,
            youtubeUrl
          })
        });
        const data = await res.json();
        if (res.ok && data.requiresVerification) {
          setIsVerificationStep(true);
        } else if (!res.ok) {
          setError(data.error || "Kayıt olurken bir hata oluştu");
        }
      }
    } catch (err) {
      setError("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode })
      });
      const data = await res.json();
      
      if (res.ok) {
        // Verification success, now auto-login
        const loginRes = await signIn("credentials", { email, password, redirect: false });
        if (loginRes?.error) {
          setError("Doğrulama başarılı ancak giriş yapılamadı. Lütfen giriş yapın.");
          setIsVerificationStep(false);
          setIsLogin(true);
        } else {
          router.push("/muzik");
          router.refresh();
        }
      } else {
        setError(data.error || "Doğrulama kodu geçersiz.");
      }
    } catch (err) {
      setError("Doğrulama sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0C10] p-4 relative overflow-hidden selection:bg-[#D4AF37]/30">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="bg-[#121318]/80 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/5 relative z-10">
        
        {isVerificationStep ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30">
                <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-center text-white mb-2 tracking-tight">Doğrulama</h2>
            <p className="text-center text-zinc-400 text-sm mb-8 leading-relaxed">
              <strong className="text-[#D4AF37]">{email}</strong> adresine 6 haneli bir onay kodu gönderdik. Lütfen hesabınızı aktifleştirmek için kodu girin.
            </p>

            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-6 text-center text-sm font-semibold">{error}</div>}

            <form onSubmit={handleVerifySubmit} className="flex flex-col gap-6">
              <input 
                type="text" 
                placeholder="000000" 
                maxLength={6}
                value={verificationCode} 
                onChange={(e) => setVerificationCode(e.target.value)} 
                className="bg-black/50 text-white px-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 border border-white/5 text-center text-3xl tracking-[1em] font-mono font-bold" 
                required 
              />
              <button type="submit" disabled={loading} className="w-full bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] disabled:opacity-50 tracking-widest uppercase flex justify-center items-center gap-2">
                {loading ? "Doğrulanıyor..." : "Doğrula ve Gir"} <ArrowRight className="w-5 h-5" />
              </button>
            </form>
            <button onClick={() => setIsVerificationStep(false)} className="w-full mt-6 text-zinc-500 text-sm hover:text-white transition-colors">
              Geri Dön
            </button>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-black text-center text-white mb-2 tracking-tight">
              {isLogin ? "Giriş Yap" : "Kayıt Ol"}
            </h2>
            {!isLogin && (
              <p className="text-center text-zinc-400 text-sm mb-6">
                VIP Lounge ayrıcalıklarına katıl.
              </p>
            )}
            
            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-6 text-center text-sm font-semibold">{error}</div>}
            
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              {!isLogin && (
                <>
                  <input type="text" placeholder="Kullanıcı Adı" value={name} onChange={(e) => setName(e.target.value)} className="bg-black/50 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] border border-white/5" />
                  
                  <div className="mt-2 mb-2 p-5 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer text-white font-medium">
                      <input type="checkbox" checked={isArtistApplication} onChange={(e) => setIsArtistApplication(e.target.checked)} className="w-5 h-5 accent-[#D4AF37] bg-black border-white/10 rounded" />
                      <Music2 className="w-5 h-5 text-[#D4AF37]" />
                      Sanatçı Olarak Başvur
                    </label>
                    
                    {isArtistApplication && (
                      <div className="flex flex-col gap-3 mt-2 animate-in slide-in-from-top-2 duration-300">
                        <p className="text-xs text-zinc-400 leading-relaxed">Doğrulanmış sanatçı rozeti ve özel ayrıcalıklar için sosyal medya hesaplarınızı ekleyin.</p>
                        <input type="url" placeholder="Instagram Profil Linki" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} className="bg-black/50 text-white px-4 py-3 text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] border border-white/5" required />
                        <input type="url" placeholder="Spotify Sanatçı Linki" value={spotifyUrl} onChange={(e) => setSpotifyUrl(e.target.value)} className="bg-black/50 text-white px-4 py-3 text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] border border-white/5" required />
                        <input type="url" placeholder="YouTube Kanal Linki" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} className="bg-black/50 text-white px-4 py-3 text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] border border-white/5" required />
                      </div>
                    )}
                  </div>
                </>
              )}

              <input type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/50 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] border border-white/5" required />
              <input type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black/50 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] border border-white/5" required />
              
              <button type="submit" disabled={loading} className="bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] disabled:opacity-50 mt-2 uppercase tracking-widest text-sm">
                {loading ? "Bekleniyor..." : (isLogin ? "Giriş Yap" : "Kayıt Ol")}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-between opacity-50">
              <hr className="w-full border-zinc-700" />
              <span className="px-4 text-zinc-500 text-sm font-semibold uppercase tracking-widest">veya</span>
              <hr className="w-full border-zinc-700" />
            </div>

            <button onClick={() => signIn("google", { callbackUrl: "/muzik" })} className="w-full mt-6 flex items-center justify-center gap-3 bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google ile Devam Et
            </button>

            <p className="mt-8 text-center text-zinc-400 text-sm font-medium">
              {isLogin ? "Hesabın yok mu?" : "Zaten hesabın var mı?"}
              <button onClick={() => setIsLogin(!isLogin)} className="text-[#D4AF37] hover:text-[#F3E5AB] ml-2 font-bold hover:underline">
                {isLogin ? "Kayıt Ol" : "Giriş Yap"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
