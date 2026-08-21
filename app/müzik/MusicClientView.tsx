"use client";

import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import QueueList from "@/components/QueueList";

export default function MusicClientView({ session }: { session: any }) {
  const [refreshQueue, setRefreshQueue] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshQueue((prev) => prev + 1);
  };

  return (
    <>
      {session && session.user && session.user.uploadCredits > 0 ? (
        <UploadForm onUploadSuccess={handleUploadSuccess} />
      ) : session?.user ? (
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200">
          <p className="font-semibold text-orange-700 dark:text-orange-300">
            Yükleme hakkınız bitmiş. Radyodan 10 şarkı dinleyerek yeni bir hak kazanabilirsiniz.
          </p>
        </div>
      ) : null}

      <QueueList refreshTrigger={refreshQueue} />
    </>
  );
}
