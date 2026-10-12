import React, { useState, useMemo } from 'react';
import { User, EvaluationVisit, EvaluationGrid, SyncStats } from '../types';
import { exportEvaluationToPDF } from '../services/pdfGenerator';
import { downloadEvaluationHTML } from '../services/htmlReportGenerator';
import {
  PlusCircle,
  Search,
  Filter,
  FileDown,
  Eye,
  Trash2,
  Calendar,
  Users,
  Award,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  FileCode,
} from 'lucide-react';

interface Props {
  currentUser: User | null;
  evaluations: EvaluationVisit[];
  grids: EvaluationGrid[];
  onStartNewEvaluation: () => void;
  onOpenEvaluationDetail: (evaluation: EvaluationVisit) => void;
  onOpenGridCustomizer: () => void;
  onDeleteEvaluation: (id: string) => void;
  lang: 'fr' | 'ar' | 'en';
  syncStats: SyncStats;
}

export const CoordinatorDashboard: React.FC<Props> = ({
  currentUser,
  evaluations,
  grids,
  onStartNewEvaluation,
  onOpenEvaluationDetail,
  onOpenGridCustomizer,
  onDeleteEvaluation,
  lang,
  syncStats,
}) => {
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Assigned teachers or all teachers in system
  const assignedTeacherList = useMemo(() => {
    if (currentUser?.assignedTeachers && currentUser.assignedTeachers.length > 0) {
      return currentUser.assignedTeachers;
    }
    const unique = Array.from(new Set(evaluations.map(e => e.teacherName)));
    return unique.length > 0 ? unique : ['Morched', 'Amal', 'Kamel'];
  }, [currentUser, evaluations]);

  // Filter evaluations
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(ev => {
      const matchTeacher =
        selectedTeacher === 'all' || ev.teacherName.toLowerCase() === selectedTeacher.toLowerCase();
      const matchSearch =
        searchTerm === '' ||
        ev.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ev.lessonTopic && ev.lessonTopic.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchTeacher && matchSearch;
    });
  }, [evaluations, selectedTeacher, searchTerm]);

  // KPIs
  const stats = useMemo(() => {
    const count = evaluations.length;
    if (count === 0) {
      return { total: 0, avgScore: 0, highCount: 0, uniqueTeachers: 0 };
    }
    const sum = evaluations.reduce((acc, e) => acc + (e.percentageScore || 0), 0);
    const avg = Math.round(sum / count);
    const high = evaluations.filter(e => e.percentageScore >= 80).length;
    const teachersCount = new Set(evaluations.map(e => e.teacherName)).size;
    return {
      total: count,
      avgScore: avg,
      highCount: high,
      uniqueTeachers: teachersCount,
    };
  }, [evaluations]);

  const handleExportQuickPDF = (e: React.MouseEvent, evaluation: EvaluationVisit) => {
    e.stopPropagation();
    const grid = grids.find(g => g.id === evaluation.gridId) || grids[0];
    exportEvaluationToPDF(evaluation, grid, lang);
  };

  const handleExportQuickHTML = (e: React.MouseEvent, evaluation: EvaluationVisit) => {
    e.stopPropagation();
    const grid = grids.find(g => g.id === evaluation.gridId) || grids[0];
    downloadEvaluationHTML(evaluation, grid, lang);
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Hero */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
              {lang === 'ar' ? 'مساحة التنسيق البيداغوجي' : lang === 'en' ? 'Pedagogical Supervision Portal' : 'Espace de Coordination Pédagogique'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {lang === 'ar'
                ? `مرحباً بك، ${currentUser?.fullName || currentUser?.username}`
                : lang === 'en'
                ? `Welcome, ${currentUser?.fullName || currentUser?.username}`
                : `Bonjour, ${currentUser?.fullName || currentUser?.username}`}
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
              {lang === 'ar'
                ? 'متابعة الزيارات الصفية الميدانية، تقييم الأداء بالمعايير المعتمدة، وتوليد تقارير الأرشيف الرسمية بصيغة PDF.'
                : lang === 'en'
                ? 'Conduct classroom observations, score pedagogical competencies in real time, and export official inspection PDFs.'
                : 'Supervisez les visites de classe, notez les compétences didactiques en temps réel et éditez les rapports officiels d\'inspection au format PDF.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenGridCustomizer}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-slate-600" />
              <span>{lang === 'ar' ? 'تخصيص شبكات التقييم' : lang === 'en' ? 'Edit Rubrics' : 'Gérer les Grilles'}</span>
            </button>

            <button
              onClick={onStartNewEvaluation}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-extrabold shadow-md shadow-blue-700/25 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{lang === 'ar' ? 'زيارة صفية جديدة' : lang === 'en' ? 'New Observation' : 'Nouvelle Visite de Classe'}</span>
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block font-medium mb-1">
              {lang === 'ar' ? 'إجمالي الزيارات المنجزة' : lang === 'en' ? 'Completed Visits' : 'Visites Réalisées'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {stats.total}
              </span>
              <span className="text-[11px] text-slate-500">fiches</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block font-medium mb-1">
              {lang === 'ar' ? 'متوسط الأداء العام' : lang === 'en' ? 'School Average' : 'Moyenne Générale'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-blue-700 tabular-nums">
                {stats.avgScore}%
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">conforme</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block font-medium mb-1">
              {lang === 'ar' ? 'المعلمون المتابعون' : lang === 'en' ? 'Teachers Observed' : 'Enseignants Suivis'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {stats.uniqueTeachers}
              </span>
              <span className="text-[11px] text-slate-500">professeurs</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block font-medium mb-1">
              {lang === 'ar' ? 'حالة المزامنة السحابية' : lang === 'en' ? 'Sync Status' : 'Statut Synchronisation'}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  syncStats.pendingCount === 0 ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                }`}
              />
              <span className="font-bold text-slate-800 text-xs">
                {syncStats.pendingCount === 0
                  ? 'À jour (0 en attente)'
                  : `${syncStats.pendingCount} en attente`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث بالاسم، المادة، أو القسم...' : lang === 'en' ? 'Search by teacher, subject, class...' : 'Rechercher enseignant, matière, classe...'}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 bg-slate-50/50"
          />
        </div>

        {/* Teacher Dropdown Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-600 shrink-0">
            {lang === 'ar' ? 'تصفية حسب المعلم :' : lang === 'en' ? 'Filter by teacher:' : 'Enseignant :'}
          </span>
          <select
            value={selectedTeacher}
            onChange={e => setSelectedTeacher(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-semibold focus:outline-hidden focus:border-blue-600"
          >
            <option value="all">
              {lang === 'ar' ? 'جميع الأساتذة' : lang === 'en' ? 'All Teachers' : 'Tous les enseignants'}
            </option>
            {assignedTeacherList.map(tName => (
              <option key={tName} value={tName}>
                {tName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Evaluations List Grid */}
      {filteredEvaluations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            {lang === 'ar' ? 'لا توجد تقارير مطابقة' : lang === 'en' ? 'No evaluations found' : 'Aucune évaluation trouvée'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {lang === 'ar'
              ? 'لم يتم تسجيل أي زيارة مطابقة لمعايير البحث الحالية. يمكنك البدء بإجراء تقييم جديد.'
              : lang === 'en'
              ? 'No observation reports match the current filter. Click below to begin a new evaluation.'
              : 'Aucune fiche ne correspond à votre filtre. Cliquez sur le bouton pour démarrer une nouvelle visite.'}
          </p>
          <button
            onClick={onStartNewEvaluation}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition cursor-pointer"
          >
            + {lang === 'ar' ? 'إجراء تقييم الآن' : lang === 'en' ? 'Start Observation' : 'Nouvelle Visite'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvaluations.map(ev => {
            const grid = grids.find(g => g.id === ev.gridId) || grids[0];
            return (
              <div
                key={ev.id}
                onClick={() => onOpenEvaluationDetail(ev)}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-500/50 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                        {ev.teacherName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {ev.teacherName}
                        </h3>
                        <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                          {ev.className} • {ev.subject}
                        </span>
                      </div>
                    </div>

                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0"
                      style={{
                        backgroundColor: `${ev.performanceLevel?.color}15`,
                        color: ev.performanceLevel?.color,
                        borderColor: `${ev.performanceLevel?.color}40`,
                      }}
                    >
                      {ev.performanceLevel?.label_fr || 'Bien'}
                    </span>
                  </div>

                  {/* Topic */}
                  {ev.lessonTopic && (
                    <div className="text-xs text-slate-700 mb-3 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 line-clamp-2">
                      <span className="font-semibold text-slate-500 text-[10px] block">
                        Thème abordé :
                      </span>
                      {ev.lessonTopic}
                    </div>
                  )}

                  {/* Score Gauge */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-400 font-medium">Note globale</span>
                      <div className="flex items-baseline gap-1 font-bold text-slate-900">
                        <span className="text-base text-blue-700 tabular-nums">
                          {ev.grandTotal}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          / {ev.maxPossibleScore || 100} pts
                        </span>
                        <span className="text-slate-600 text-xs ml-1">
                          ({ev.percentageScore}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${ev.percentageScore}%`,
                          backgroundColor: ev.performanceLevel?.color || '#2563eb',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{ev.date}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={e => handleExportQuickHTML(e, ev)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                      title="Télécharger l'évaluation sous forme HTML imprimable A4"
                    >
                      <FileCode className="w-4 h-4 text-emerald-600" />
                    </button>
                    <button
                      onClick={e => handleExportQuickPDF(e, ev)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                      title="Télécharger le PDF officiel"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onOpenEvaluationDetail(ev);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                      title="Consulter le détail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm(`Supprimer la visite de ${ev.teacherName} du ${ev.date} ?`)) {
                          onDeleteEvaluation(ev.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
