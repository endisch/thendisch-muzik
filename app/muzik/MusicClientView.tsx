"use client";

import { useState } from "react";
import QueueList from "@/components/QueueList";

export default function MusicClientView({ session }: { session: any }) {
  const [refreshQueue, setRefreshQueue] = useState(0);

  return (
    <div className="w-full mt-12">
      <QueueList refreshTrigger={refreshQueue} />
    </div>
  );
}
