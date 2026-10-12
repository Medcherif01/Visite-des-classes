import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Sliders,
  Award,
  UserCheck,
} from 'lucide-react';
import { User } from '../types';

interface Props {
  currentTab: 'dashboard' | 'new-evaluation' | 'grids' | 'teachers' | 'analytics';
  onSelectTab: (tab: 'dashboard' | 'new-evaluation' | 'grids' | 'teachers' | 'analytics') => void;
  currentUser: User | null;
  onOpenLogin: () => void;
  lang: 'fr' | 'ar' | 'en';
}

export const MobileBottomNav: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenLogin,
  lang,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around">
      <button
        onClick={() => onSelectTab('dashboard')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition cursor-pointer min-w-[56px] ${
          currentTab === 'dashboard' ? 'text-blue-700 font-bold' : 'text-slate-500'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">
          {lang === 'ar' ? 'الرئيسية' : lang === 'en' ? 'Dashboard' : 'Visites'}
        </span>
      </button>

      {currentUser?.role !== 'teacher' && (
        <button
          onClick={() => onSelectTab('new-evaluation')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition cursor-pointer min-w-[56px] ${
            currentTab === 'new-evaluation' ? 'text-blue-700 font-bold' : 'text-slate-500'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-700/30">
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold text-blue-700">
            {lang === 'ar' ? 'تقييم' : lang === 'en' ? 'Evaluate' : 'Évaluer'}
          </span>
        </button>
      )}

      <button
        onClick={() => onSelectTab('grids')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition cursor-pointer min-w-[56px] ${
          currentTab === 'grids' ? 'text-blue-700 font-bold' : 'text-slate-500'
        }`}
      >
        <Sliders className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">
          {lang === 'ar' ? 'الشبكات' : lang === 'en' ? 'Rubrics' : 'Grilles'}
        </span>
      </button>

      <button
        onClick={onOpenLogin}
        className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-500 transition cursor-pointer min-w-[56px]"
      >
        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-700">
          {currentUser ? currentUser.username.substring(0, 1).toUpperCase() : '?'}
        </div>
        <span className="text-[10px] mt-0.5">
          {currentUser ? currentUser.username : 'Profil'}
        </span>
      </button>
    </div>
  );
};
