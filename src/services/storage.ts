import { EvaluationVisit, EvaluationGrid, User, SyncStats } from '../types';
import { DEFAULT_GRIDS } from '../data/defaultGrids';
import { INITIAL_USERS, INITIAL_EVALUATIONS } from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'eduvisite_users_v2',
  CURRENT_USER: 'eduvisite_current_user_v2',
  GRIDS: 'eduvisite_grids_v2',
  EVALUATIONS: 'eduvisite_evaluations_v2',
  DRAFT_EVALUATION: 'eduvisite_draft_evaluation_v2',
  LAST_SYNC: 'eduvisite_last_sync_v2',
  LANGUAGE: 'eduvisite_language_v2',
};

class StorageService {
  private isBrowser = typeof window !== 'undefined';

  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults() {
    if (!this.isBrowser) return;

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.GRIDS)) {
      localStorage.setItem(STORAGE_KEYS.GRIDS, JSON.stringify(DEFAULT_GRIDS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.EVALUATIONS)) {
      localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(INITIAL_EVALUATIONS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      // Default to Coordinator Mohamed
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    }
  }

  // --- Users & Auth ---
  getUsers(): User[] {
    if (!this.isBrowser) return INITIAL_USERS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch (e) {
      console.error('Error loading users:', e);
      return INITIAL_USERS;
    }
  }

  getCurrentUser(): User | null {
    if (!this.isBrowser) return INITIAL_USERS[0];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  }

  setCurrentUser(user: User | null): void {
    if (!this.isBrowser) return;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  saveUser(user: User): void {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  // --- Evaluation Grids (Customizable) ---
  getGrids(): EvaluationGrid[] {
    if (!this.isBrowser) return DEFAULT_GRIDS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GRIDS);
      return data ? JSON.parse(data) : DEFAULT_GRIDS;
    } catch (e) {
      console.error('Error loading grids:', e);
      return DEFAULT_GRIDS;
    }
  }

  saveGrid(grid: EvaluationGrid): void {
    const grids = this.getGrids();
    const index = grids.findIndex(g => g.id === grid.id);
    if (index >= 0) {
      grids[index] = grid;
    } else {
      grids.push(grid);
    }
    localStorage.setItem(STORAGE_KEYS.GRIDS, JSON.stringify(grids));
  }

  deleteGrid(gridId: string): boolean {
    const grids = this.getGrids();
    // Do not allow deleting the last remaining grid
    if (grids.length <= 1) return false;
    const filtered = grids.filter(g => g.id !== gridId);
    localStorage.setItem(STORAGE_KEYS.GRIDS, JSON.stringify(filtered));
    return true;
  }

  // --- Evaluations & Observations ---
  getEvaluations(): EvaluationVisit[] {
    if (!this.isBrowser) return INITIAL_EVALUATIONS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
      return data ? JSON.parse(data) : INITIAL_EVALUATIONS;
    } catch (e) {
      console.error('Error loading evaluations:', e);
      return INITIAL_EVALUATIONS;
    }
  }

  getEvaluationById(id: string): EvaluationVisit | undefined {
    return this.getEvaluations().find(e => e.id === id);
  }

  saveEvaluation(evaluation: EvaluationVisit): { success: boolean; isOffline: boolean } {
    const evaluations = this.getEvaluations();
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    // Set sync status based on connectivity
    const updatedEval: EvaluationVisit = {
      ...evaluation,
      syncStatus: isOnline ? 'synced' : 'pending',
      updatedAt: new Date().toISOString(),
    };

    const index = evaluations.findIndex(e => e.id === updatedEval.id);
    if (index >= 0) {
      evaluations[index] = updatedEval;
    } else {
      evaluations.unshift(updatedEval);
    }

    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));

    // Clear active draft if this was the saved one
    this.clearDraft();

    return { success: true, isOffline: !isOnline };
  }

  deleteEvaluation(id: string): boolean {
    const evaluations = this.getEvaluations();
    const filtered = evaluations.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(filtered));
    return true;
  }

  // --- Observation Drafts (Protects against accidental reloads during classroom visit) ---
  saveDraft(draft: Partial<EvaluationVisit>): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEYS.DRAFT_EVALUATION, JSON.stringify({
        ...draft,
        draftSavedAt: new Date().toISOString(),
      }));
    } catch (e) {
      console.warn('Could not save draft:', e);
    }
  }

  getDraft(): Partial<EvaluationVisit> | null {
    if (!this.isBrowser) return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRAFT_EVALUATION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  clearDraft(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(STORAGE_KEYS.DRAFT_EVALUATION);
  }

  // --- Offline Synchronization Manager ---
  getSyncStats(): SyncStats {
    const evaluations = this.getEvaluations();
    const pendingCount = evaluations.filter(e => e.syncStatus === 'pending').length;
    const lastSyncedAt = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    return {
      pendingCount,
      lastSyncedAt,
      isOnline,
    };
  }

  syncPendingEvaluations(): Promise<{ syncedCount: number }> {
    return new Promise(resolve => {
      // Simulate remote cloud sync
      setTimeout(() => {
        const evaluations = this.getEvaluations();
        let syncedCount = 0;

        const updated = evaluations.map(ev => {
          if (ev.syncStatus === 'pending') {
            syncedCount++;
            return { ...ev, syncStatus: 'synced' as const, updatedAt: new Date().toISOString() };
          }
          return ev;
        });

        localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(updated));
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());

        resolve({ syncedCount });
      }, 700);
    });
  }

  // --- Language preference ---
  getLanguage(): 'fr' | 'ar' | 'en' {
    if (!this.isBrowser) return 'fr';
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as 'fr' | 'ar' | 'en') || 'fr';
  }

  setLanguage(lang: 'fr' | 'ar' | 'en'): void {
    if (!this.isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  // --- Database Export / Import (Backup) ---
  exportBackupJSON(): string {
    const backup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      evaluations: this.getEvaluations(),
      grids: this.getGrids(),
      users: this.getUsers(),
    };
    return JSON.stringify(backup, null, 2);
  }

  importBackupJSON(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.evaluations && Array.isArray(data.evaluations)) {
        localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(data.evaluations));
      }
      if (data.grids && Array.isArray(data.grids)) {
        localStorage.setItem(STORAGE_KEYS.GRIDS, JSON.stringify(data.grids));
      }
      if (data.users && Array.isArray(data.users)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
      }
      return true;
    } catch (e) {
      console.error('Failed to parse backup:', e);
      return false;
    }
  }
}

export const storage = new StorageService();
