import React, { useState, useEffect, useCallback } from 'react';
import { User, EvaluationVisit, EvaluationGrid } from './types';
import { storage } from './services/storage';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { Navbar } from './components/Navbar';
import { OfflineBanner } from './components/OfflineBanner';
import { CoordinatorDashboard } from './components/CoordinatorDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { NewEvaluationForm } from './components/NewEvaluationForm';
import { EvaluationDetailModal } from './components/EvaluationDetailModal';
import { GridCustomizerModal } from './components/GridCustomizerModal';
import { LoginModal } from './components/LoginModal';
import { LoginPage } from './components/LoginPage';
import { MobileBottomNav } from './components/MobileBottomNav';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'new-evaluation' | 'grids' | 'teachers' | 'analytics'>('dashboard');
  const [evaluations, setEvaluations] = useState<EvaluationVisit[]>(() => storage.getEvaluations());
  const [grids, setGrids] = useState<EvaluationGrid[]>(() => storage.getGrids());
  const [activeEvaluationDetail, setActiveEvaluationDetail] = useState<EvaluationVisit | null>(null);
  const [isGridCustomizerOpen, setIsGridCustomizerOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [lang, setLang] = useState<'fr' | 'ar' | 'en'>(() => storage.getLanguage());

  const { isOnline, syncStats, isSyncing, triggerSync, refreshSyncStats } = useOnlineStatus();

  const reloadData = useCallback(() => {
    setEvaluations(storage.getEvaluations());
    setGrids(storage.getGrids());
    refreshSyncStats();
  }, [refreshSyncStats]);

  const handleSetLang = (newLang: 'fr' | 'ar' | 'en') => {
    setLang(newLang);
    storage.setLanguage(newLang);
  };

  const handleSaveEvaluationSuccess = (savedEval: EvaluationVisit) => {
    reloadData();
    setActiveEvaluationDetail(savedEval);
    setCurrentTab('dashboard');
  };

  const handleDeleteEvaluation = (id: string) => {
    storage.deleteEvaluation(id);
    reloadData();
  };

  const handleTabChange = (tab: 'dashboard' | 'new-evaluation' | 'grids' | 'teachers' | 'analytics') => {
    if (tab === 'grids') {
      setIsGridCustomizerOpen(true);
      return;
    }
    setCurrentTab(tab);
  };

  // If user is not logged in, render dedicated landing / login page
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={user => {
          setCurrentUser(user);
          reloadData();
          setCurrentTab('dashboard');
        }}
        lang={lang}
        onSetLang={handleSetLang}
      />
    );
  }

  // If user is a teacher, force or prioritize teacher view
  const isTeacherRole = currentUser?.role === 'teacher';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans pb-16 lg:pb-0">
      {/* Top Bar adhering to Top Bar Contract */}
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        onSelectTab={handleTabChange}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={() => {
          storage.logout();
          setCurrentUser(null);
        }}
        isOnline={isOnline}
        syncStats={syncStats}
        isSyncing={isSyncing}
        onSync={triggerSync}
        lang={lang}
        onSetLang={handleSetLang}
      />

      {/* Offline & Sync Status Banner */}
      <OfflineBanner
        isOnline={isOnline}
        syncStats={syncStats}
        isSyncing={isSyncing}
        onSync={triggerSync}
        lang={lang}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'new-evaluation' && !isTeacherRole ? (
          <NewEvaluationForm
            currentUser={currentUser}
            onSaveSuccess={handleSaveEvaluationSuccess}
            onCancel={() => setCurrentTab('dashboard')}
            lang={lang}
          />
        ) : currentTab === 'analytics' && currentUser?.role === 'admin' ? (
          <AdminDashboard
            evaluations={evaluations}
            grids={grids}
            users={storage.getUsers()}
            onRefresh={reloadData}
            lang={lang}
          />
        ) : isTeacherRole ? (
          <TeacherDashboard
            currentUser={currentUser!}
            evaluations={evaluations}
            grids={grids}
            onOpenEvaluationDetail={ev => setActiveEvaluationDetail(ev)}
            lang={lang}
          />
        ) : (
          <CoordinatorDashboard
            currentUser={currentUser}
            evaluations={evaluations}
            grids={grids}
            onStartNewEvaluation={() => setCurrentTab('new-evaluation')}
            onOpenEvaluationDetail={ev => setActiveEvaluationDetail(ev)}
            onOpenGridCustomizer={() => setIsGridCustomizerOpen(true)}
            onDeleteEvaluation={handleDeleteEvaluation}
            lang={lang}
            syncStats={syncStats}
          />
        )}
      </main>

      {/* Evaluation Detail Modal with PDF export & Signatures */}
      {activeEvaluationDetail && (
        <EvaluationDetailModal
          evaluation={activeEvaluationDetail}
          grid={grids.find(g => g.id === activeEvaluationDetail.gridId) || grids[0]}
          onClose={() => setActiveEvaluationDetail(null)}
          onDelete={handleDeleteEvaluation}
          lang={lang}
          currentUserRole={currentUser?.role}
        />
      )}

      {/* Grid Customizer Modal */}
      <GridCustomizerModal
        isOpen={isGridCustomizerOpen}
        onClose={() => setIsGridCustomizerOpen(false)}
        onGridUpdated={reloadData}
        lang={lang}
      />

      {/* Role-Based Authentication & Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={user => {
          setCurrentUser(user);
          reloadData();
          setCurrentTab('dashboard');
        }}
        currentUser={currentUser}
        lang={lang}
      />

      {/* Mobile/Tablet Touch Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={handleTabChange}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        lang={lang}
      />
    </div>
  );
}
