import { useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storage';
import { SyncStats } from '../types';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [syncStats, setSyncStats] = useState<SyncStats>(() => storage.getSyncStats());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const refreshSyncStats = useCallback(() => {
    setSyncStats(storage.getSyncStats());
  }, []);

  const triggerSync = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    try {
      await storage.syncPendingEvaluations();
      refreshSyncStats();
    } catch (e) {
      console.error('Sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, refreshSyncStats]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      refreshSyncStats();
      // Auto-sync when reconnecting
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      refreshSyncStats();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshSyncStats, triggerSync]);

  return {
    isOnline,
    syncStats,
    isSyncing,
    triggerSync,
    refreshSyncStats,
  };
}
