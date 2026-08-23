"use client";

import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import QueueList from "@/components/QueueList";
import { CheckCircle2 } from "lucide-react";

export default function MusicClientView({ session }: { session: any }) {
  const [refreshQueue, setRefreshQueue] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshQueue((prev) => prev + 1);
  };

  const user = session?.user;

  // Upload Permission Logic
  let canUpload = false;
  let uploadMessage = "";

  if (user) {
    if (user.role === "ARTIST" && user.isVerifiedArtist) {
      // API level limits this to 1 per day, but we'll show the form and let API block if exceeded today.
      canUpload = true; 
    } else if (user.uploadCredits > 0) {
      canUpload = true;
    } else {
      uploadMessage = "Yükleme hakkınız bitmiş. Radyodan 10 şarkı dinleyerek yeni bir hak kazanabilirsiniz.";
    }
  }

  return (
    <>
      {user && (user.role === "ARTIST" && user.isVerifiedArtist) && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
          <div>
            <h4 className="text-emerald-500 font-bold text-sm tracking-wide uppercase">Doğrulanmış Sanatçı</h4>
            <p className="text-zinc-400 text-xs mt-0.5">Müziklerinizi doğrudan topluluğa ulaştırabilirsiniz. (Günlük 1 hak)</p>
          </div>
        </div>
      )}

      {canUpload ? (
        <UploadForm onUploadSuccess={handleUploadSuccess} />
      ) : user ? (
        <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-2xl">
          <p className="font-semibold text-zinc-400 text-sm">
            {uploadMessage}
          </p>
        </div>
      ) : null}

      <QueueList refreshTrigger={refreshQueue} />
    </>
  );
}
