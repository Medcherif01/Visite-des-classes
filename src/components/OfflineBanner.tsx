import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { SyncStats } from '../types';

interface Props {
  isOnline: boolean;
  syncStats: SyncStats;
  isSyncing: boolean;
  onSync: () => void;
  lang?: 'fr' | 'ar' | 'en';
}

export const OfflineBanner: React.FC<Props> = ({
  isOnline,
  syncStats,
  isSyncing,
  onSync,
  lang = 'fr',
}) => {
  // If online and no pending items, show a subtle quiet indicator only or hide
  if (isOnline && syncStats.pendingCount === 0) {
    return null;
  }

  return (
    <div
      className={`w-full py-2 px-4 transition-all text-xs font-medium border-b flex items-center justify-between gap-3 ${
        !isOnline
          ? 'bg-amber-50 text-amber-900 border-amber-200'
          : 'bg-blue-50 text-blue-900 border-blue-200'
      }`}
    >
      <div className="flex items-center gap-2 max-w-2xl">
        {!isOnline ? (
          <div className="flex items-center gap-1.5 font-semibold text-amber-800">
            <WifiOff className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              {lang === 'ar'
                ? 'وضع غير متصل بالإنترنت: يتم حفظ جميع تقييماتك محلياً بأمان تام.'
                : lang === 'en'
                ? 'Offline Mode: All class observations are saved safely in local storage.'
                : 'Mode Hors Ligne : Toutes vos observations de classe sont sécurisées localement sur cet appareil.'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 font-semibold text-blue-800">
            <Clock className="w-4 h-4 shrink-0 text-blue-600" />
            <span>
              {lang === 'ar'
                ? `هناك ${syncStats.pendingCount} تقييم جاهز للمزامنة مع الخادم.`
                : lang === 'en'
                ? `${syncStats.pendingCount} observation(s) pending cloud sync.`
                : `${syncStats.pendingCount} visite(s) enregistrée(s) hors ligne prête(s) à être synchronisée(s).`}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {syncStats.pendingCount > 0 && isOnline && (
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>
              {isSyncing
                ? lang === 'ar'
                  ? 'جاري المزامنة...'
                  : lang === 'en'
                  ? 'Syncing...'
                  : 'Synchronisation...'
                : lang === 'ar'
                ? 'مزامنة الآن'
                : lang === 'en'
                ? 'Sync Now'
                : 'Synchroniser maintenant'}
            </span>
          </button>
        )}

        {!isOnline && (
          <span className="text-[11px] text-amber-700 px-2 py-0.5 rounded-md bg-amber-100/80">
            {lang === 'ar' ? 'المزامنة تلقائية عند عودة الشبكة' : lang === 'en' ? 'Auto-sync on reconnect' : 'Sync auto au rétablissement'}
          </span>
        )}
      </div>
    </div>
  );
};
