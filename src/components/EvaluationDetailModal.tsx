import React, { useState } from 'react';
import { EvaluationVisit, EvaluationGrid } from '../types';
import { exportEvaluationToPDF } from '../services/pdfGenerator';
import {
  X,
  FileDown,
  Printer,
  Trash2,
  Calendar,
  User,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Check,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  evaluation: EvaluationVisit | null;
  grid: EvaluationGrid;
  onClose: () => void;
  onDelete?: (id: string) => void;
  lang: 'fr' | 'ar' | 'en';
  currentUserRole?: string;
}

export const EvaluationDetailModal: React.FC<Props> = ({
  evaluation,
  grid,
  onClose,
  onDelete,
  lang,
  currentUserRole,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [teacherSigned, setTeacherSigned] = useState(evaluation?.teacherSignature?.signed || false);

  if (!evaluation) return null;

  const handleExportPDF = () => {
    exportEvaluationToPDF(evaluation, grid, lang);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSign = () => {
    setTeacherSigned(true);
    evaluation.teacherSignature = {
      signed: true,
      date: new Date().toISOString().split('T')[0],
      comment: 'Pris connaissance des observations et recommandations formulées.',
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-sm">
              {evaluation.teacherName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {lang === 'ar'
                  ? `تقرير زيارة الأستاذ(ة) ${evaluation.teacherName}`
                  : lang === 'en'
                  ? `Observation Report: ${evaluation.teacherName}`
                  : `Rapport de Visite : ${evaluation.teacherName}`}
              </h2>
              <p className="text-xs text-slate-500 leading-tight">
                {evaluation.className} • {evaluation.subject} • {evaluation.date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              title="Télécharger le rapport officiel au format PDF"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {lang === 'ar' ? 'تحميل PDF' : lang === 'en' ? 'Export PDF' : 'Télécharger PDF'}
              </span>
            </button>

            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
              title="Imprimer"
            >
              <Printer className="w-4 h-4" />
            </button>

            {onDelete && currentUserRole !== 'teacher' && (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                title="Supprimer la visite"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Metadata Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Enseignant(e) :</span>
              <span className="font-bold text-slate-900">{evaluation.teacherName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Coordinateur :</span>
              <span className="font-bold text-slate-900">{evaluation.coordinatorName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Date & Séance :</span>
              <span className="font-bold text-slate-900">{evaluation.date} (Séance {evaluation.sessionNumber})</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Classe & Discipline :</span>
              <span className="font-bold text-slate-900">{evaluation.className} - {evaluation.subject}</span>
            </div>
          </div>

          {/* Score Header */}
          <div className="p-4 rounded-xl border border-slate-200 bg-gradient-to-r from-blue-50/50 to-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-blue-700 tabular-nums">
                {evaluation.grandTotal}
              </span>
              <span className="text-sm font-semibold text-slate-400">
                / {evaluation.maxPossibleScore || 100} pts
              </span>
              <span className="text-base font-bold text-slate-800 ml-2">
                ({evaluation.percentageScore}%)
              </span>
            </div>

            <div>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full border"
                style={{
                  backgroundColor: `${evaluation.performanceLevel?.color}15`,
                  color: evaluation.performanceLevel?.color,
                  borderColor: `${evaluation.performanceLevel?.color}40`,
                }}
              >
                Mention : {evaluation.performanceLevel?.label_fr?.toUpperCase() || 'TRÈS BIEN'}
              </span>
            </div>
          </div>

          {/* Category Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Résultats par Domaine Pédagogique
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {grid.categories.map(cat => {
                const score = evaluation.categoryScores?.[cat.id] || 0;
                const pct = Math.round((score / cat.maxPoints) * 100);
                return (
                  <div key={cat.id} className="p-3 bg-white border border-slate-200 rounded-xl">
                    <div className="text-[11px] font-bold text-slate-600 truncate mb-1">
                      {lang === 'ar' ? cat.title_ar : lang === 'en' ? cat.title_en : cat.title_fr}
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-bold text-blue-700 tabular-nums">
                        {score} / {cat.maxPoints} pts
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Narrative Report */}
          {evaluation.autoGeneratedReport && (
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/80">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1.5">
                Synthèse Pédagogique Générée par le Système
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                « {evaluation.autoGeneratedReport} »
              </p>
            </div>
          )}

          {/* Qualitative Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30">
              <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Points Forts Observés</span>
              </h4>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {evaluation.comments?.strengths || 'Aucun commentaire'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30">
              <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Axes d'Amélioration Prioritaires</span>
              </h4>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {evaluation.comments?.toImprove || 'Aucun commentaire'}
              </p>
            </div>
          </div>

          {evaluation.comments?.recommendations && (
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30">
              <h4 className="text-xs font-bold text-blue-800 flex items-center gap-1.5 mb-2">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                <span>Conseils & Recommandations Didactiques</span>
              </h4>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {evaluation.comments.recommendations}
              </p>
            </div>
          )}

          {/* Detailed Criteria Scores Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Détail des Notations Critère par Critère
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
              {grid.categories.map(cat => (
                <div key={cat.id} className="p-3 bg-slate-50/50">
                  <div className="font-bold text-slate-800 text-xs mb-2">
                    {cat.title_fr}
                  </div>
                  <div className="space-y-1.5">
                    {cat.items.map(item => {
                      const r = evaluation.ratings?.[item.id];
                      return (
                        <div key={item.id} className="flex items-center justify-between py-1 bg-white px-2.5 rounded-lg border border-slate-100">
                          <span className="text-slate-700">{item.text_fr}</span>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-800">
                              {r ? `${r.rating}/5` : '-'}
                            </span>
                            <span className="font-bold text-blue-700 w-12 text-right">
                              {r ? `${r.score} pts` : '-'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Observation Notes (Timestamped log) */}
          {evaluation.observationNotes && evaluation.observationNotes.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Journal de Bord Pendant la Séance ({evaluation.observationNotes.length} notes)
              </h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                {evaluation.observationNotes.map(n => (
                  <div key={n.id} className="py-1.5 px-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-blue-700 font-bold">[{n.timestamp}]</span>
                      <span className="text-slate-700">{n.content}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visa & Signatures Section */}
          <div className="pt-2 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Coordinateur Pédagogique
                </span>
                <span className="text-xs font-bold text-slate-900 block">{evaluation.coordinatorName}</span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                  <Check className="w-3.5 h-3.5" /> Visite validée et enregistrée
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Enseignant(e)
                </span>
                <span className="text-xs font-bold text-slate-900 block">{evaluation.teacherName}</span>
                {teacherSigned ? (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    <Check className="w-3.5 h-3.5" /> Lu et visé par l'enseignant(e)
                  </span>
                ) : (
                  <button
                    onClick={handleSign}
                    className="mt-1 text-xs text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
                  >
                    Confirmer la prise de connaissance (Émarger)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Sub-modal */}
        {showConfirmDelete && (
          <div className="p-4 bg-red-50 border-t border-red-200 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-red-800 font-medium">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>Êtes-vous sûr de vouloir supprimer définitivement cette visite d'évaluation ?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (onDelete) onDelete(evaluation.id);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
