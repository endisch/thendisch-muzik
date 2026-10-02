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
        <p className="text-[#adb5c0] font-medium mb-6">Şarkı yüklemek için önce giriş yapmalısınız.</p>
        <Link href="/login" className="bg-[#ff543b] text-[#090b0e] px-8 py-3 rounded-none font-bold tracking-wide transition-all hover:bg-[#ff6c55]">
          Giriş yap
        </Link>
      </div>
    );
  }

  if (!canUpload) {
    return (
      <div className="text-center py-12">
        <div className="inline-block bg-[#090b0e] border border-white/[0.12] p-6 rounded-none">
          <p className="font-medium text-[#f7f8fa]">
            {uploadMessage}
          </p>
        </div>
      </div>
    );
  }

  return <UploadForm onUploadSuccess={handleUploadSuccess} />;
}
