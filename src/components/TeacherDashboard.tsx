import React from 'react';
import { User, EvaluationVisit, EvaluationGrid } from '../types';
import { exportEvaluationToPDF } from '../services/pdfGenerator';
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
  // Filter only this teacher's evaluations
  const myEvaluations = evaluations.filter(
    e =>
      e.teacherName.toLowerCase() === currentUser.username.toLowerCase() ||
      e.teacherId === currentUser.id
  );

  const avgScore =
    myEvaluations.length > 0
      ? Math.round(
          myEvaluations.reduce((acc, e) => acc + e.percentageScore, 0) / myEvaluations.length
        )
      : 0;

  const latestEvaluation = myEvaluations[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              {lang === 'ar' ? 'فضاء المعلم الشخصي' : lang === 'en' ? 'Teacher Personal Space' : 'Espace Personnel Enseignant'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {lang === 'ar'
                ? `أهلاً بك، الأستاذ(ة) ${currentUser.fullName || currentUser.username}`
                : lang === 'en'
                ? `Welcome, ${currentUser.fullName || currentUser.username}`
                : `Bienvenue, ${currentUser.fullName || currentUser.username}`}
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              {lang === 'ar'
                ? 'الاطلاع على تقارير الزيارات الصفية، توجيهات المنسق البيداغوجي، وتحميل وثائق التقييم الرسمية.'
                : lang === 'en'
                ? 'Review classroom observation reports, coordinator recommendations, and export archival PDFs.'
                : 'Consultez vos comptes-rendus de visite, les conseils didactiques personnalisés et vos attestations PDF.'}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-3 rounded-2xl shrink-0">
            <Award className="w-6 h-6 text-emerald-600" />
            <div>
              <span className="text-[10px] text-emerald-800 font-bold block uppercase">
                Moyenne Annuelle
              </span>
              <span className="text-xl font-extrabold text-emerald-900 tabular-nums">
                {avgScore}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {myEvaluations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Aucune visite enregistrée pour le moment
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Dès que votre coordinateur aura effectué et validé votre visite de classe, le compte-rendu apparaîtra ici.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Historique de Vos Visites ({myEvaluations.length})
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {myEvaluations.map(ev => {
              const grid = grids.find(g => g.id === ev.gridId) || grids[0];
              return (
                <div
                  key={ev.id}
                  onClick={() => onOpenEvaluationDetail(ev)}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-700">
                        Séance {ev.sessionNumber} • {ev.className} ({ev.subject})
                      </span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: `${ev.performanceLevel?.color}15`,
                          color: ev.performanceLevel?.color,
                          borderColor: `${ev.performanceLevel?.color}40`,
                        }}
                      >
                        {ev.performanceLevel?.label_fr || 'Bien'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">
                      {ev.lessonTopic || 'Séance pédagogique ordinaire'}
                    </h3>

                    <div className="text-xs text-slate-500 flex items-center gap-4">
                      <span>Coordinateur : <b>{ev.coordinatorName}</b></span>
                      <span>Date : {ev.date}</span>
                    </div>

                    {ev.comments?.strengths && (
                      <p className="text-xs text-slate-600 line-clamp-2 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="font-bold text-emerald-700">Points forts : </span>
                        {ev.comments.strengths}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-blue-700 tabular-nums">
                        {ev.grandTotal}
                        <span className="text-xs text-slate-400 font-normal"> / {ev.maxPossibleScore || 100}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-600">
                        Score : {ev.percentageScore}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          exportEvaluationToPDF(ev, grid, lang);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onOpenEvaluationDetail(ev);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
