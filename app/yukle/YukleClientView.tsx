"use client";

import UploadForm from "@/components/UploadForm";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function YukleClientView({ session }: { session: any }) {
  const router = useRouter();
  const user = session?.user;

  // Upload Permission Logic
  let canUpload = false;
  let uploadMessage = "";

  if (user) {
    if (user.role === "ARTIST" && user.isVerifiedArtist) {
      canUpload = true; 
    } else if (user.uploadCredits > 0) {
      canUpload = true;
    } else {
      uploadMessage = "Yükleme hakkınız bitmiş. Radyodan 10 şarkı dinleyerek yeni bir hak kazanabilirsiniz.";
    }
  }

  const handleUploadSuccess = () => {
    // Navigate back to muzik page after successful upload
    router.push("/muzik");
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <p className="text-zinc-400 font-medium mb-6">Şarkı yüklemek için önce giriş yapmalısınız.</p>
        <Link href="/login" className="bg-[#D4AF37] text-black px-8 py-3 rounded-full font-bold tracking-widest uppercase transition-all hover:bg-[#F3E5AB]">
          Giriş Yap
        </Link>
      </div>
    );
  }

  if (!canUpload) {
    return (
      <div className="text-center py-12">
        <div className="inline-block bg-zinc-900/50 border border-white/5 p-6 rounded-2xl">
          <p className="font-medium text-zinc-300">
            {uploadMessage}
          </p>
        </div>
      </div>
    );
  }

  return <UploadForm onUploadSuccess={handleUploadSuccess} />;
}
