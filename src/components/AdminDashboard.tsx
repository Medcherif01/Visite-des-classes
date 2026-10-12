import React, { useState } from 'react';
import { EvaluationVisit, EvaluationGrid, User } from '../types';
import { storage } from '../services/storage';
import {
  ShieldCheck,
  TrendingUp,
  Download,
  Upload,
  BarChart3,
  Users,
  Award,
  Layers,
  FileCheck,
} from 'lucide-react';

interface Props {
  evaluations: EvaluationVisit[];
  grids: EvaluationGrid[];
  users: User[];
  onRefresh: () => void;
  lang: 'fr' | 'ar' | 'en';
}

export const AdminDashboard: React.FC<Props> = ({
  evaluations,
  grids,
  users,
  onRefresh,
  lang,
}) => {
  const [importStatus, setImportStatus] = useState<string>('');

  const totalVisits = evaluations.length;
  const avgSchoolScore =
    totalVisits > 0
      ? Math.round(evaluations.reduce((acc, e) => acc + e.percentageScore, 0) / totalVisits)
      : 0;

  // Level counts
  const excellentCount = evaluations.filter(e => e.percentageScore >= 90).length;
  const veryGoodCount = evaluations.filter(e => e.percentageScore >= 80 && e.percentageScore < 90).length;
  const goodCount = evaluations.filter(e => e.percentageScore >= 70 && e.percentageScore < 80).length;
  const needsImprovementCount = evaluations.filter(e => e.percentageScore < 70).length;

  const handleDownloadBackup = () => {
    const json = storage.exportBackupJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EduVisite_Sauvegarde_Archivage_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      const success = storage.importBackupJSON(content);
      if (success) {
        setImportStatus('Données importées avec succès !');
        onRefresh();
      } else {
        setImportStatus('Erreur de lecture du fichier JSON.');
      }
      setTimeout(() => setImportStatus(''), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              {lang === 'ar' ? 'فضاء الإدارة العامة والتفتيش' : lang === 'en' ? 'School Direction & Inspection Console' : 'Console de Direction des Études & Inspection'}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {lang === 'ar' ? 'المؤشرات البيداغوجية الشاملة للمؤسسة' : lang === 'en' ? 'Institutional Pedagogical Analytics' : 'Pilotage Académique & Synthèse Globale'}
            </h1>
            <p className="text-sm text-slate-500">
              Vue consolidée de l'ensemble des départements, répartition des mentions et archivage centralisé.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadBackup}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Exporter Archive JSON</span>
            </button>
          </div>
        </div>

        {/* Global Distribution */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
            <span className="text-emerald-800 font-semibold block mb-1">Excellent (≥ 90%)</span>
            <span className="text-2xl font-extrabold text-emerald-950 tabular-nums">
              {excellentCount}
            </span>
            <span className="text-[10px] text-emerald-700 block mt-1">
              {totalVisits > 0 ? Math.round((excellentCount / totalVisits) * 100) : 0}% des effectifs
            </span>
          </div>

          <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl">
            <span className="text-blue-800 font-semibold block mb-1">Très Bien (80 - 89%)</span>
            <span className="text-2xl font-extrabold text-blue-950 tabular-nums">
              {veryGoodCount}
            </span>
            <span className="text-[10px] text-blue-700 block mt-1">
              {totalVisits > 0 ? Math.round((veryGoodCount / totalVisits) * 100) : 0}% des effectifs
            </span>
          </div>

          <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl">
            <span className="text-amber-800 font-semibold block mb-1">Bien / Satisfaisant</span>
            <span className="text-2xl font-extrabold text-amber-950 tabular-nums">
              {goodCount}
            </span>
            <span className="text-[10px] text-amber-700 block mt-1">
              {totalVisits > 0 ? Math.round((goodCount / totalVisits) * 100) : 0}% des effectifs
            </span>
          </div>

          <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-2xl">
            <span className="text-rose-800 font-semibold block mb-1">Accompagnement Requis</span>
            <span className="text-2xl font-extrabold text-rose-950 tabular-nums">
              {needsImprovementCount}
            </span>
            <span className="text-[10px] text-rose-700 block mt-1">
              Priorité aux formations
            </span>
          </div>
        </div>
      </div>

      {/* Backup and Data Archiving Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-600" />
          <span>Gestion de la Base de Données Hors Ligne & Sauvegardes</span>
        </h2>
        <p className="text-xs text-slate-600">
          Cette application fonctionne à 100% hors ligne et stocke localement toutes les fiches d'évaluation. Vous pouvez exporter l'intégralité des données en format JSON sécurisé pour les archiver ou les importer sur une autre tablette/ordinateur.
        </p>

        {importStatus && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800 font-bold">
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleDownloadBackup}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger l'Archive JSON ({totalVisits} visites)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Restaurer une Archive JSON</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
