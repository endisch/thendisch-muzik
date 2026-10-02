"use client";

import { BrandIcon } from "@/components/BrandIcon";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Music2, ArrowRight, ShieldCheck } from "lucide-react";
import { SiteNavigation } from "@/components/SiteNavigation";

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
    <div className="min-h-screen flex flex-col bg-[#090b0e] selection:bg-[#ff543b]/30">
      <SiteNavigation />
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:py-16 relative overflow-hidden">

      <div className="bg-[#12161b] p-6 sm:p-10 rounded-none w-full max-w-lg border border-white/[0.12] relative z-10">

        {isVerificationStep ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-none bg-[#ff543b]/10 flex items-center justify-center border border-[#ff543b]/30">
                <ShieldCheck className="w-8 h-8 text-[#ff6c55]" />
              </div>
            </div>
            <h1 className="text-3xl font-semibold text-center text-[#f7f8fa] mb-3 tracking-tight">E-postanı doğrula</h1>
            <p className="text-center text-[#adb5c0] text-base mb-8 leading-relaxed">
              <strong className="text-[#ff6c55] break-all">{email}</strong> adresine 6 haneli bir kod gönderdik. Hesabını etkinleştirmek için kodu gir.
            </p>

            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-none mb-6 text-center text-base font-semibold">{error}</div>}

            <form onSubmit={handleVerifySubmit} className="flex flex-col gap-6">
              <input
                type="text"
                aria-label="E-posta doğrulama kodu"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="bg-[#090b0e] text-[#f7f8fa] px-4 py-4 rounded-none focus:outline-none focus:ring-2 focus:ring-[#ff543b]/50 border border-white/[0.12] text-center text-2xl sm:text-3xl tracking-[0.45em] font-mono font-semibold"
                required
              />
              <button type="submit" disabled={loading} className="w-full bg-[#ff543b] hover:bg-[#ff6c55] text-[#090b0e] font-semibold py-4 rounded-none transition-all shadow-none hover:shadow-none disabled:opacity-50 tracking-wide flex justify-center items-center gap-2">
                {loading ? "Doğrulanıyor..." : "Doğrula ve giriş yap"} <ArrowRight className="w-5 h-5" />
              </button>
            </form>
            <button onClick={() => setIsVerificationStep(false)} className="w-full mt-6 text-[#adb5c0] text-base hover:text-[#f7f8fa] transition-colors">
              Geri dön
            </button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-semibold text-center text-[#f7f8fa] mb-3 tracking-tight">
              {isLogin ? "Giriş yap" : "Hesap oluştur"}
            </h1>
            {!isLogin && (
              <p className="text-center text-[#adb5c0] text-base mb-6">
                Hesabını oluştur, müzik topluluğuna katıl.
              </p>
            )}

            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-none mb-6 text-center text-base font-semibold">{error}</div>}

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              {!isLogin && (
                <>
                  <input type="text" placeholder="Kullanıcı adı" value={name} onChange={(e) => setName(e.target.value)} className="bg-[#090b0e] text-[#f7f8fa] px-4 py-3.5 rounded-none focus:outline-none focus:ring-1 focus:ring-[#ff543b] border border-white/5" />

                  <div className="mt-2 mb-2 p-5 rounded-none border border-[#ff543b]/20 bg-[#ff543b]/5 flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer text-[#f7f8fa] font-medium">
                      <input type="checkbox" checked={isArtistApplication} onChange={(e) => setIsArtistApplication(e.target.checked)} className="w-5 h-5 accent-[#ff543b] bg-black border-white/10 rounded-none" />
                      <Music2 className="w-5 h-5 text-[#ff6c55]" />
                      Sanatçı olarak başvur
                    </label>

                    {isArtistApplication && (
                      <div className="flex flex-col gap-3 mt-2 animate-in slide-in-from-top-2 duration-300">
                        <p className="text-sm text-[#adb5c0] leading-relaxed">Sanatçı başvurun için sosyal medya hesaplarını ekle.</p>
                        <input type="url" placeholder="Instagram profil bağlantısı" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} className="bg-[#090b0e] text-[#f7f8fa] px-4 py-3 text-base rounded-none focus:outline-none focus:ring-1 focus:ring-[#ff543b] border border-white/5" required />
                        <input type="url" placeholder="Spotify sanatçı bağlantısı" value={spotifyUrl} onChange={(e) => setSpotifyUrl(e.target.value)} className="bg-[#090b0e] text-[#f7f8fa] px-4 py-3 text-base rounded-none focus:outline-none focus:ring-1 focus:ring-[#ff543b] border border-white/5" required />
                        <input type="url" placeholder="YouTube kanal bağlantısı" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} className="bg-[#090b0e] text-[#f7f8fa] px-4 py-3 text-base rounded-none focus:outline-none focus:ring-1 focus:ring-[#ff543b] border border-white/5" required />
                      </div>
                    )}
                  </div>
                </>
              )}

              <input type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-[#090b0e] text-[#f7f8fa] px-4 py-3.5 rounded-none focus:outline-none focus:ring-1 focus:ring-[#ff543b] border border-white/5" required />
              <input type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-[#090b0e] text-[#f7f8fa] px-4 py-3.5 rounded-none focus:outline-none focus:ring-1 focus:ring-[#ff543b] border border-white/5" required />

              <button type="submit" disabled={loading} className="bg-[#ff543b] hover:bg-[#ff6c55] text-[#090b0e] font-semibold py-4 rounded-none transition-all shadow-none hover:shadow-none disabled:opacity-50 mt-2 tracking-wide text-base">
                {loading ? "Bekleniyor..." : (isLogin ? "Giriş yap" : "Hesap oluştur")}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-between">
              <hr className="w-full border-white/15" />
              <span className="px-4 text-[#adb5c0] text-base font-semibold tracking-wide">veya</span>
              <hr className="w-full border-white/15" />
            </div>

            <button onClick={() => signIn("google", { callbackUrl: "/muzik" })} className="w-full mt-6 flex items-center justify-center gap-3 bg-white text-black font-bold py-3.5 rounded-none hover:bg-gray-200 transition-colors">
              <BrandIcon name="google" className="w-6 h-6" />
              Google ile devam et
            </button>

            <p className="mt-8 text-center text-[#adb5c0] text-base font-medium">
              {isLogin ? "Hesabın yok mu?" : "Zaten hesabın var mı?"}
              <button onClick={() => setIsLogin(!isLogin)} className="text-[#ff6c55] hover:text-[#ff6c55] ml-2 font-bold hover:underline">
                {isLogin ? "Hesap oluştur" : "Giriş yap"}
              </button>
            </p>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
