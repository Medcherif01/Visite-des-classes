import React, { useState } from 'react';
import { User, EvaluationVisit, EvaluationGrid } from '../types';
import { exportEvaluationToPDF } from '../services/pdfGenerator';
import { downloadEvaluationHTML, printEvaluationDirectly } from '../services/htmlReportGenerator';
import { storage } from '../services/storage';
import {
  FileDown,
  Eye,
  Calendar,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Clock,
  BookOpen,
  TrendingUp,
  FileCode,
  Printer,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  PenTool,
  Check,
  Search,
  School,
  UserCheck,
} from 'lucide-react';

interface Props {
  currentUser: User;
  evaluations: EvaluationVisit[];
  grids: EvaluationGrid[];
  onOpenEvaluationDetail: (evaluation: EvaluationVisit) => void;
  lang: 'fr' | 'ar' | 'en';
}

export const TeacherDashboard: React.FC<Props> = ({
  currentUser,
  evaluations,
  grids,
  onOpenEvaluationDetail,
  lang,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [signedState, setSignedState] = useState<Record<string, boolean>>({});
  const [printSuccessNotice, setPrintSuccessNotice] = useState<string>('');

  // Filter only this teacher's evaluations (fuzzy matching for username, id, or full name)
  const myEvaluations = evaluations.filter(e => {
    const uName = currentUser.username.toLowerCase();
    const fName = currentUser.fullName?.toLowerCase() || '';
    const tName = e.teacherName.toLowerCase();
    const tId = e.teacherId.toLowerCase();

    return (
      tName === uName ||
      (fName && tName.includes(fName)) ||
      (fName && fName.includes(tName)) ||
      tName.includes(uName) ||
      tId === currentUser.id.toLowerCase() ||
      tId === `teacher-${uName}` ||
      tId === `user-teach-${uName}`
    );
  });

  const filteredEvaluations = myEvaluations.filter(ev => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      ev.subject.toLowerCase().includes(term) ||
      ev.className.toLowerCase().includes(term) ||
      (ev.lessonTopic && ev.lessonTopic.toLowerCase().includes(term)) ||
      ev.coordinatorName.toLowerCase().includes(term) ||
      ev.date.includes(term)
    );
  });

  const avgScore =
    myEvaluations.length > 0
      ? Math.round(
          myEvaluations.reduce((acc, e) => acc + e.percentageScore, 0) / myEvaluations.length
        )
      : 0;

  const bestScore =
    myEvaluations.length > 0
      ? Math.max(...myEvaluations.map(e => e.percentageScore))
      : 0;

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePrintCopy = (ev: EvaluationVisit, grid: EvaluationGrid) => {
    printEvaluationDirectly(ev, grid, lang);
    setPrintSuccessNotice(
      lang === 'ar'
        ? `جاري تجهيز نسخة الطباعة للأستاذ(ة) ${ev.teacherName}...`
        : `Lancement de l'impression A4 pour la visite du ${ev.date}...`
    );
    setTimeout(() => setPrintSuccessNotice(''), 4000);
  };

  const handleSignEvaluation = (ev: EvaluationVisit) => {
    const updated: EvaluationVisit = {
      ...ev,
      teacherSignature: {
        signed: true,
        date: new Date().toISOString().split('T')[0],
      },
    };
    storage.saveEvaluation(updated);
    setSignedState(prev => ({ ...prev, [ev.id]: true }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner Notice */}
      {printSuccessNotice && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold rounded-2xl flex items-center gap-2 shadow-xs transition animate-fade-in">
          <Printer className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{printSuccessNotice}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {lang === 'ar' ? 'فضاء المعلم الشخصي' : lang === 'en' ? 'Teacher Personal Space' : 'Espace Personnel Enseignant'}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.department || 'Enseignement Secondaire & Collège'}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {lang === 'ar'
                ? `أهلاً بك، الأستاذ(ة) ${currentUser.fullName || currentUser.username}`
                : lang === 'en'
                ? `Welcome, ${currentUser.fullName || currentUser.username}`
                : `Bienvenue, ${currentUser.fullName || currentUser.username}`}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
              {lang === 'ar'
                ? 'يمكنك هنا استعراض نتائج زياراتك الصفية بالتفصيل، قراءة ملاحظات المنسق والتوجيهات التربوية، وطباعة نسخة ورقية رسمية أو تحميلها.'
                : lang === 'en'
                ? 'Review your classroom visit scores, coordinator comments, didactic guidelines, and print or download official copies.'
                : 'Consultez le détail de vos visites pédagogiques, vos notes par domaine, les conseils didactiques du coordinateur et imprimez une copie officielle A4.'}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-2xl text-center min-w-[95px]">
              <span className="text-[10px] text-emerald-800 font-bold block uppercase tracking-wider">
                Moyenne
              </span>
              <span className="text-2xl font-extrabold text-emerald-900 tabular-nums">
                {avgScore}%
              </span>
            </div>

            <div className="bg-blue-50/80 border border-blue-200 p-3.5 rounded-2xl text-center min-w-[95px]">
              <span className="text-[10px] text-blue-800 font-bold block uppercase tracking-wider">
                Total Visites
              </span>
              <span className="text-2xl font-extrabold text-blue-900 tabular-nums">
                {myEvaluations.length}
              </span>
            </div>

            <div className="bg-purple-50/80 border border-purple-200 p-3.5 rounded-2xl text-center min-w-[95px] col-span-2 sm:col-span-1">
              <span className="text-[10px] text-purple-800 font-bold block uppercase tracking-wider">
                Meilleur Score
              </span>
              <span className="text-2xl font-extrabold text-purple-900 tabular-nums">
                {bestScore}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visits List Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span>Mes Fiches d'Observation & Évaluations</span>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-extrabold">
              {myEvaluations.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Toutes vos notes chiffrées, synthèses pédagogiques et options d'impression immédiate
          </p>
        </div>

        {myEvaluations.length > 1 && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher par matière, classe, date..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
            />
          </div>
        )}
      </div>

      {/* No Evaluations State */}
      {myEvaluations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">
            {lang === 'ar' ? 'لا توجد تقارير زيارة مسجلة بعد' : 'Aucune visite enregistrée pour le moment'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {lang === 'ar'
              ? 'بمجرد أن يقوم المنسق البيداغوجي بإجراء الزيارة الصفية وتأكيدها، ستظهر شبكة الدرجات والتوجيهات هنا مباشرة.'
              : 'Dès que votre coordinateur aura effectué et validé votre visite de classe, le compte-rendu avec toutes vos notes apparaîtra ici.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvaluations.map(ev => {
            const grid = grids.find(g => g.id === ev.gridId) || grids[0];
            const isExpanded = expandedCards[ev.id] ?? false;
            const isSigned = signedState[ev.id] || ev.teacherSignature?.signed;

            return (
              <div
                key={ev.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Main Card Header & Summary */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Left: Metadata & Lesson Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200/80 text-xs font-bold">
                          Séance {ev.sessionNumber} • {ev.className}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                          {ev.subject}
                        </span>
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1"
                          style={{
                            backgroundColor: `${ev.performanceLevel?.color}15`,
                            color: ev.performanceLevel?.color,
                            borderColor: `${ev.performanceLevel?.color}40`,
                          }}
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{ev.performanceLevel?.label_fr || 'Bien'}</span>
                        </span>

                        {isSigned ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Émargé par l'enseignant</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            En attente d'émargement
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                        {ev.lessonTopic || 'Séance pédagogique ordinaire'}
                      </h3>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Date : <b>{ev.date}</b></span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>Coordinateur : <b>{ev.coordinatorName}</b></span>
                        </span>
                        <span>Élèves présents : <b>{ev.studentCount || 24}</b></span>
                      </div>
                    </div>

                    {/* Right: Scores & Big Badge */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 sm:p-0 bg-slate-50 sm:bg-transparent rounded-2xl shrink-0">
                      <div className="sm:text-right">
                        <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 tracking-tight tabular-nums">
                          {ev.grandTotal}
                          <span className="text-xs text-slate-400 font-normal"> / {ev.maxPossibleScore || 100}</span>
                        </div>
                        <div className="text-xs font-extrabold text-slate-600">
                          Score Global : {ev.percentageScore}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Domain Category Scores Progress Bars */}
                  {grid?.categories && grid.categories.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
                      {grid.categories.map(cat => {
                        const score = ev.categoryScores?.[cat.id] || 0;
                        const max = cat.maxPoints || 25;
                        const pct = Math.round((score / max) * 100);
                        return (
                          <div key={cat.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                            <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-slate-700">
                              <span className="truncate pr-1">
                                {lang === 'ar' ? cat.title_ar : cat.title_fr}
                              </span>
                              <span className="text-blue-700 font-bold shrink-0">
                                {score}/{max}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(pct, 100)}%`,
                                  backgroundColor: pct >= 80 ? '#10b981' : pct >= 65 ? '#3b82f6' : '#f59e0b',
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Key Highlights Snippet */}
                  {ev.comments?.strengths && !isExpanded && (
                    <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3 text-xs text-slate-700 space-y-1">
                      <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Points forts remarqués par le coordinateur :</span>
                      </div>
                      <p className="line-clamp-2 text-slate-600 whitespace-pre-line pl-5">
                        {ev.comments.strengths}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
                    {/* Left: Print & Download buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePrintCopy(ev, grid)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition cursor-pointer"
                        title="Lancer l'impression directe d'une copie au format A4"
                      >
                        <Printer className="w-4 h-4 text-slate-200" />
                        <span>Imprimer une copie (A4)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadEvaluationHTML(ev, grid, lang)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                        title="Télécharger le fichier HTML autonome et imprimable à tout moment"
                      >
                        <FileCode className="w-4 h-4 text-emerald-100" />
                        <span>Télécharger HTML (A4)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => exportEvaluationToPDF(ev, grid, lang)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                        title="Télécharger l'attestation PDF officielle"
                      >
                        <FileDown className="w-4 h-4 text-blue-100" />
                        <span>Télécharger PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenEvaluationDetail(ev)}
                        className="flex items-center gap-1 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition cursor-pointer"
                        title="Consulter la grille critère par critère"
                      >
                        <Eye className="w-4 h-4 text-slate-500" />
                        <span>Grille complète</span>
                      </button>
                    </div>

                    {/* Right: Expand details / Sign */}
                    <div className="flex items-center gap-2">
                      {!isSigned && (
                        <button
                          type="button"
                          onClick={() => handleSignEvaluation(ev)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition cursor-pointer"
                          title="Confirmer la prise de connaissance de ce rapport"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Émarger la fiche</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleExpand(ev.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        <span>{isExpanded ? 'Réduire' : 'Consulter notes & commentaires'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Detailed Section (Notes, Comments, Synthesis, Timeline) */}
                {isExpanded && (
                  <div className="bg-slate-50/70 p-5 sm:p-6 border-t border-slate-200 space-y-5 animate-fade-in text-xs">
                    {/* Synthesis */}
                    {ev.autoGeneratedReport && (
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5 shadow-xs">
                        <div className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <span>Synthèse Pédagogique Officielle de la Visite :</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-xs">
                          {ev.autoGeneratedReport}
                        </p>
                      </div>
                    )}

                    {/* 2-columns comments */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Strengths */}
                      <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 space-y-2 shadow-xs">
                        <div className="font-bold text-emerald-800 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Points Forts & Réussites Pédagogiques :</span>
                        </div>
                        <div className="text-slate-700 whitespace-pre-line leading-relaxed pl-1">
                          {ev.comments?.strengths || 'Non spécifié.'}
                        </div>
                      </div>

                      {/* To Improve */}
                      <div className="bg-white p-4 rounded-2xl border border-amber-200/80 space-y-2 shadow-xs">
                        <div className="font-bold text-amber-800 text-xs flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>Axes de Progrès & Points d'Amélioration :</span>
                        </div>
                        <div className="text-slate-700 whitespace-pre-line leading-relaxed pl-1">
                          {ev.comments?.toImprove || 'Non spécifié.'}
                        </div>
                      </div>
                    </div>

                    {/* Recommendations & Action Plan */}
                    {(ev.comments?.recommendations || ev.comments?.actionPlan) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ev.comments?.recommendations && (
                          <div className="bg-white p-4 rounded-2xl border border-blue-200/80 space-y-2 shadow-xs">
                            <div className="font-bold text-blue-800 text-xs flex items-center gap-2">
                              <Lightbulb className="w-4 h-4 text-blue-600" />
                              <span>Recommandations Didactiques du Coordinateur :</span>
                            </div>
                            <div className="text-slate-700 whitespace-pre-line leading-relaxed pl-1">
                              {ev.comments.recommendations}
                            </div>
                          </div>
                        )}

                        {ev.comments?.actionPlan && (
                          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                            <div className="font-bold text-slate-800 text-xs flex items-center gap-2">
                              <Target className="w-4 h-4 text-purple-600" />
                              <span>Plan d'Action & Prochaine Visite :</span>
                            </div>
                            <div className="text-slate-700 whitespace-pre-line leading-relaxed pl-1">
                              {ev.comments.actionPlan}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Live Observation Log */}
                    {ev.observationNotes && ev.observationNotes.length > 0 && (
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                        <div className="font-bold text-slate-800 text-xs flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span>Notes d'Observation Horodatées Prises en Classe :</span>
                        </div>
                        <div className="space-y-1.5 pt-1">
                          {ev.observationNotes.map((note, idx) => (
                            <div
                              key={note.id || idx}
                              className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100"
                            >
                              <span className="font-mono text-xs font-bold text-blue-700 shrink-0">
                                [{note.timestamp}]
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase shrink-0 ${
                                  note.tag === 'positif'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : note.tag === 'amelioration'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {note.tag}
                              </span>
                              <span className="text-slate-700 text-xs">{note.content}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom Print Action within Expanded View */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-[11px] text-slate-400">
                        Réf. Archivage #{ev.id} • Émis par {ev.schoolName}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handlePrintCopy(ev, grid)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Imprimer une copie (A4)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadEvaluationHTML(ev, grid, lang)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          <FileCode className="w-3.5 h-3.5" />
                          <span>Télécharger HTML (A4)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
