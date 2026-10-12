import React from 'react';
import { User, SyncStats } from '../types';
import {
  GraduationCap,
  PlusCircle,
  FileText,
  Sliders,
  Users,
  Wifi,
  WifiOff,
  LogOut,
  RefreshCw,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface Props {
  currentUser: User | null;
  currentTab: 'dashboard' | 'new-evaluation' | 'grids' | 'teachers' | 'analytics';
  onSelectTab: (tab: 'dashboard' | 'new-evaluation' | 'grids' | 'teachers' | 'analytics') => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  isOnline: boolean;
  syncStats: SyncStats;
  isSyncing: boolean;
  onSync: () => void;
  lang: 'fr' | 'ar' | 'en';
  onSetLang: (lang: 'fr' | 'ar' | 'en') => void;
}

export const Navbar: React.FC<Props> = ({
  currentUser,
  currentTab,
  onSelectTab,
  onOpenLogin,
  onLogout,
  isOnline,
  syncStats,
  isSyncing,
  onSync,
  lang,
  onSetLang,
}) => {
  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return {
          label: lang === 'ar' ? 'إدارة' : lang === 'en' ? 'Admin' : 'Direction',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'coordinator':
        return {
          label: lang === 'ar' ? 'منسق' : lang === 'en' ? 'Coordinator' : 'Coordinateur',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'teacher':
        return {
          label: lang === 'ar' ? 'معلم' : lang === 'en' ? 'Teacher' : 'Enseignant',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      default:
        return { label: 'Visiteur', color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const roleInfo = getRoleBadge(currentUser?.role);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Single text element Brand Zone with School Emblem */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-hidden"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-700/20 group-hover:bg-blue-800 transition-colors">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">
                  EduVisite
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider leading-tight">
                  {lang === 'ar' ? 'التقييم البيداغوجي' : lang === 'en' ? 'Classroom Assessment' : 'Suivi Pédagogique'}
                </span>
              </div>
            </button>

            {/* Offline/Online mini badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
              }`}
              title={isOnline ? 'Connecté' : 'Hors ligne - Stockage local actif'}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-600" />
                  <span className="hidden md:inline">En ligne</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-600" />
                  <span>Hors ligne</span>
                </>
              )}
            </div>
          </div>

          {/* Zone 2: Navigation Links (concise, single-line text links) */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-600">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-slate-100 text-blue-700 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {lang === 'ar' ? 'لوحة القيادة' : lang === 'en' ? 'Dashboard' : 'Tableau de bord'}
            </button>

            {currentUser?.role !== 'teacher' && (
              <button
                onClick={() => onSelectTab('new-evaluation')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  currentTab === 'new-evaluation'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-blue-600" />
                <span>{lang === 'ar' ? 'زيارة جديدة' : lang === 'en' ? 'New Observation' : 'Nouvelle Visite'}</span>
              </button>
            )}

            {currentUser?.role !== 'teacher' && (
              <button
                onClick={() => onSelectTab('teachers')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  currentTab === 'teachers'
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'ar' ? 'إدارة المعلمين' : lang === 'en' ? 'Teachers & Access' : 'Enseignants & Accès'}</span>
              </button>
            )}

            <button
              onClick={() => onSelectTab('grids')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                currentTab === 'grids'
                  ? 'bg-slate-100 text-blue-700 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>{lang === 'ar' ? 'شبكات التقييم' : lang === 'en' ? 'Rubrics' : 'Grilles & Critères'}</span>
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onSelectTab('analytics')}
                className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  currentTab === 'analytics'
                    ? 'bg-slate-100 text-blue-700 font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {lang === 'ar' ? 'الإحصاءات العامة' : lang === 'en' ? 'School Analytics' : 'Statistiques Établissement'}
              </button>
            )}
          </nav>

          {/* Zone 3: Actions (Language, PWA Install, User Profile & Role Switch) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Install PWA Button */}
            <PWAInstallButton lang={lang} />

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => onSetLang('fr')}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  lang === 'fr' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => onSetLang('ar')}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  lang === 'ar' ? 'bg-white text-blue-800 shadow-xs font-arabic' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                عربي
              </button>
              <button
                onClick={() => onSetLang('en')}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  lang === 'en' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
            </div>

            {/* User Session & Role Badge & Logout */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer text-left"
                  title="Session permanente active • Cliquez pour changer de profil"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                    {currentUser.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                      <span>{currentUser.username}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Connecté en continu"></span>
                    </span>
                    <span className="text-[10px] text-slate-500 leading-tight">
                      {roleInfo.label} • Permanent
                    </span>
                  </div>
                </button>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50 transition cursor-pointer text-xs font-semibold"
                  title={lang === 'ar' ? 'تسجيل الخروج وإنهاء الجلسة الدائمة' : 'Déconnexion (Terminer la session permanente)'}
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-red-600" />
                  <span className="hidden md:inline">
                    {lang === 'ar' ? 'خروج' : 'Déconnexion'}
                  </span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition"
              >
                {lang === 'ar' ? 'تسجيل الدخول' : lang === 'en' ? 'Sign In' : 'Connexion'}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
