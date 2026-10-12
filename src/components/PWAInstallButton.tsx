import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

interface Props {
  lang?: 'fr' | 'ar' | 'en';
}

export const PWAInstallButton: React.FC<Props> = ({ lang = 'fr' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const label = lang === 'ar' ? 'تثبيت التطبيق' : lang === 'en' ? 'Install App' : 'Installer l\'app';
  const iosLabel = lang === 'ar' ? 'تثبيت على iPad/iPhone' : lang === 'en' ? 'Install on iOS' : 'Installer sur iPad/iPhone';

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors whitespace-nowrap"
        title="Installer l'application pour un accès hors ligne direct"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{iosLabel}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl text-slate-900 border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold">
                  {lang === 'ar' ? 'تثبيت على iPad / iPhone' : lang === 'en' ? 'Install on iPhone / iPad' : 'Installation sur iPad / iPhone'}
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 text-xs text-slate-600 space-y-2">
                <p>
                  1. {lang === 'ar' ? 'اضغط على زر المشاركة (Share) أسفل متصفح Safari.' : lang === 'en' ? 'Tap the Share icon in Safari toolbar.' : 'Appuyez sur le bouton Partager dans Safari.'}
                </p>
                <p>
                  2. {lang === 'ar' ? 'اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).' : lang === 'en' ? 'Select "Add to Home Screen".' : 'Sélectionnez "Sur l\'écran d\'accueil".'}
                </p>
                <p className="text-emerald-700 font-medium">
                  {lang === 'ar' ? '✓ يعمل بكفاءة تامة بدون اتصال بالإنترنت في الفصول الدراسية.' : lang === 'en' ? '✓ Fully functional offline in classrooms.' : '✓ Fonctionne 100% hors ligne en classe sans connexion.'}
                </p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                {lang === 'ar' ? 'فهمت' : lang === 'en' ? 'Got it' : 'Compris'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
