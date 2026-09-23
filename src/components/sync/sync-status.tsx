"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { getSyncEngine } from "@/features/sync/sync-engine";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/offline/database";

export function SyncStatus() {
  const [isOnline, setIsOnline] = useState(true);
  
  // Use dexie hook to monitor the pending queue
  const pendingCount = useLiveQuery(
    () => db.sync_queue.where('status').equals('PENDING').count(),
    []
  ) || 0;

  useEffect(() => {
    // Initialize sync engine which sets up listeners
    getSyncEngine();

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && pendingCount === 0) {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-3 py-1.5 rounded-full bg-muted/50 border">
        <Cloud className="h-3.5 w-3.5 text-green-500" />
        Synced
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-yellow-600 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
        <CloudOff className="h-3.5 w-3.5" />
        Offline ({pendingCount} pending)
      </div>
    );
  }

  // Online but with pending items
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-primary px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
      Syncing {pendingCount} items...
    </div>
  );
}
