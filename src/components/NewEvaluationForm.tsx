import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, EvaluationGrid, EvaluationVisit, ObservationNote } from '../types';
import { storage } from '../services/storage';
import { generatePedagogicalReport } from '../services/reportGenerator';
import { generateCommentsWithGemini } from '../services/aiService';
import { downloadEvaluationHTML, previewEvaluationHTML } from '../services/htmlReportGenerator';
import {
  Save,
  Wand2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Award,
  BookOpen,
  FileCode,
  RefreshCw,
} from 'lucide-react';

interface Props {
  currentUser: User | null;
  onSaveSuccess: (evaluation: EvaluationVisit) => void;
  onCancel: () => void;
  lang: 'fr' | 'ar' | 'en';
  initialTeacherName?: string;
}

export const NewEvaluationForm: React.FC<Props> = ({
  currentUser,
  onSaveSuccess,
  onCancel,
  lang,
  initialTeacherName,
}) => {
  const grids = useMemo(() => storage.getGrids(), []);
  const allUsers = useMemo(() => storage.getUsers(), []);
  const teachers = useMemo(() => allUsers.filter(u => u.role === 'teacher'), [allUsers]);
  const classesList = useMemo(() => storage.getClasses(), []);
  const subjectsList = useMemo(() => storage.getSubjects(), []);

  // Form State
  const [selectedGridId, setSelectedGridId] = useState<string>(grids[0]?.id || '');
  const activeGrid = useMemo(
    () => grids.find(g => g.id === selectedGridId) || grids[0],
    [grids, selectedGridId]
  );

  const [teacherName, setTeacherName] = useState<string>(
    initialTeacherName || currentUser?.assignedTeachers?.[0] || teachers[0]?.username || 'Morched'
  );
  const [className, setClassName] = useState<string>(classesList[0] || '3ème B');
  const [subject, setSubject] = useState<string>(subjectsList[0] || 'Mathématiques');
  const [lessonTopic, setLessonTopic] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionNumber, setSessionNumber] = useState<number>(2);
  const [studentCount, setStudentCount] = useState<number>(25);

  // Ratings map: criterionId -> { rating: 1-5, score: calculated }
  const [ratings, setRatings] = useState<Record<string, { rating: number; score: number }>>({});

  // Comments
  const [strengths, setStrengths] = useState<string>('');
  const [toImprove, setToImprove] = useState<string>('');
  const [recommendations, setRecommendations] = useState<string>('');
  const [actionPlan, setActionPlan] = useState<string>('');
  const [autoReport, setAutoReport] = useState<string>('');

  // Observation Timer & Notes
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [notes, setNotes] = useState<ObservationNote[]>([]);
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [newNoteTag, setNewNoteTag] = useState<'positif' | 'amelioration' | 'technique' | 'general'>('positif');

  // Expanded categories accordion
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    activeGrid?.categories.forEach(cat => {
      initial[cat.id] = true;
    });
    return initial;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Timer interval
  useEffect(() => {
    let interval: any;
    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const minutes = Math.floor(elapsedSeconds / 60);
    const note: ObservationNote = {
      id: `note-${Date.now()}`,
      timestamp: formatTimer(elapsedSeconds),
      elapsedMinutes: minutes,
      content: newNoteText.trim(),
      tag: newNoteTag,
    };
    setNotes(prev => [note, ...prev]);
    setNewNoteText('');
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // Score Calculation
  const handleRate = (criterionId: string, rating: number, maxPoints: number) => {
    const score = Math.round((rating / 5) * maxPoints);
    setRatings(prev => ({
      ...prev,
      [criterionId]: { rating, score },
    }));
  };

  const { categoryScores, grandTotal, maxPossibleScore, percentageScore } = useMemo(() => {
    const catScores: Record<string, number> = {};
    let total = 0;
    let maxTotal = 0;

    activeGrid.categories.forEach(cat => {
      let catSum = 0;
      cat.items.forEach(item => {
        const itemScore = ratings[item.id]?.score || 0;
        catSum += itemScore;
      });
      catScores[cat.id] = catSum;
      total += catSum;
      maxTotal += cat.maxPoints;
    });

    const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
    return {
      categoryScores: catScores,
      grandTotal: total,
      maxPossibleScore: maxTotal,
      percentageScore: pct,
    };
  }, [activeGrid, ratings]);

  const performanceLevel = useMemo(() => {
    if (percentageScore >= 90) {
      return {
        code: 'excellent' as const,
        label_fr: 'Excellent',
        label_ar: 'ممتاز',
        label_en: 'Excellent',
        color: '#10b981',
      };
    }
    if (percentageScore >= 80) {
      return {
        code: 'very_good' as const,
        label_fr: 'Très Bien',
        label_ar: 'جيد جدًا',
        label_en: 'Very Good',
        color: '#3b82f6',
      };
    }
    if (percentageScore >= 70) {
      return {
        code: 'good' as const,
        label_fr: 'Bien / Satisfaisant',
        label_ar: 'جيد / مقبول',
        label_en: 'Good',
        color: '#f59e0b',
      };
    }
    if (percentageScore >= 60) {
      return {
        code: 'satisfactory' as const,
        label_fr: 'Passable',
        label_ar: 'متوسط',
        label_en: 'Satisfactory',
        color: '#f97316',
      };
    }
    return {
      code: 'needs_improvement' as const,
      label_fr: 'À Améliorer / Accompagnement Requis',
      label_ar: 'يحتاج إلى مرافقة وتحسين',
      label_en: 'Needs Improvement',
      color: '#ef4444',
    };
  }, [percentageScore]);

  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string>('');

  // Total criteria count vs evaluated criteria count
  const totalCriteriaCount = useMemo(() => {
    return activeGrid.categories.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [activeGrid]);

  const ratedCriteriaCount = useMemo(() => {
    return Object.keys(ratings).length;
  }, [ratings]);

  // Generate comments using Gemini AI or fallback
  const handleGenerateWithGemini = async () => {
    if (ratedCriteriaCount === 0) {
      alert(
        lang === 'ar'
          ? 'يرجى تقييم بعض المعايير أولاً حتى يتمكن الذكاء الاصطناعي من تحليل أداء المعلم بدقة.'
          : lang === 'en'
          ? 'Please rate some criteria first so Gemini AI can analyze the teacher\'s performance.'
          : 'Veuillez attribuer des notes à certains critères pour que Gemini AI puisse analyser la prestation didactique de l\'enseignant.'
      );
      return;
    }

    setIsGeneratingAI(true);
    setAiSuccessMessage('');

    try {
      const res = await generateCommentsWithGemini({
        teacherName,
        coordinatorName: currentUser?.fullName || currentUser?.username || 'Coordinateur Pédagogique',
        className,
        subject,
        lessonTopic,
        sessionNumber,
        grandTotal,
        maxScore: maxPossibleScore,
        percentageScore,
        performanceLevel,
        categoryScores,
        grid: activeGrid,
        ratings,
        observationNotes: notes,
        language: lang,
      });

      if (res.report.synthesis) {
        setAutoReport(res.report.synthesis);
      }
      if (res.report.suggestedStrengths?.length) {
        setStrengths(res.report.suggestedStrengths.join('\n'));
      }
      if (res.report.suggestedImprovements?.length) {
        setToImprove(res.report.suggestedImprovements.join('\n'));
      }
      if (res.report.suggestedRecommendations?.length) {
        setRecommendations(res.report.suggestedRecommendations.join('\n'));
      }
      if (res.report.actionPlan) {
        setActionPlan(res.report.actionPlan);
      }

      setAiSuccessMessage(
        res.isAIGenerated
          ? lang === 'ar'
            ? '✨ تم توليد التحليل والتعليقات البيداغوجية بنجاح عبر Gemini AI استناداً لدرجات المعلم!'
            : lang === 'en'
            ? '✨ Comments and synthesis successfully generated by Gemini AI based on teacher scores!'
            : '✨ Commentaires et synthèse générés avec succès par Gemini AI à partir des notes attribuées !'
          : lang === 'ar'
          ? '✓ تم تطبيق التحليل البيداغوجي وفق معايير التقييم.'
          : '✓ Analyse pédagogique appliquée selon les critères notés.'
      );
      setTimeout(() => setAiSuccessMessage(''), 5000);
    } catch (e: any) {
      console.error('Erreur génération Gemini AI:', e);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Rule-based deterministic generation fallback
  const handleAutoGenerateReport = () => {
    const report = generatePedagogicalReport({
      teacherName,
      coordinatorName: currentUser?.fullName || currentUser?.username || 'Coordinateur Pédagogique',
      className,
      subject,
      lessonTopic,
      grandTotal,
      maxScore: maxPossibleScore,
      categoryScores,
      grid: activeGrid,
      ratings,
      lang,
    });

    setAutoReport(report.synthesis);
    if (!strengths) {
      setStrengths(report.suggestedStrengths.map(s => `• ${s}`).join('\n'));
    }
    if (!toImprove) {
      setToImprove(report.suggestedImprovements.map(s => `• ${s}`).join('\n'));
    }
    if (!recommendations) {
      setRecommendations(report.suggestedRecommendations.map((r, i) => `${i + 1}. ${r}`).join('\n'));
    }
    if (!actionPlan) {
      setActionPlan(report.actionPlan);
    }
  };

  // Quick pedagogical phrases for one-click insertion
  const quickPhrases = [
    { label: 'Gestion tableau claire', target: 'strengths', text: '• Organisation claire et lisible du tableau avec rappels structurés.' },
    { label: 'Climat bienveillant', target: 'strengths', text: '• Climat de confiance favorable à la prise de risque intellectuelle.' },
    { label: 'Vérifier la compréhension', target: 'toImprove', text: '• Multiplier les rétroactions rapides pour sonder la compréhension réelle.' },
    { label: 'Différenciation anticipée', target: 'recommendations', text: 'Prévoir un exercice d\'enrichissement pour les élèves rapides.' },
  ];

  const insertPhrase = (target: string, text: string) => {
    if (target === 'strengths') setStrengths(prev => (prev ? `${prev}\n${text}` : text));
    if (target === 'toImprove') setToImprove(prev => (prev ? `${prev}\n${text}` : text));
    if (target === 'recommendations') setRecommendations(prev => (prev ? `${prev}\n${text}` : text));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (ratedCriteriaCount === 0) {
      setValidationError(
        lang === 'ar'
          ? 'يرجى تقييم بعض المعايير على الأقل في شبكة الملاحظة.'
          : lang === 'en'
          ? 'Please rate at least some criteria before saving.'
          : 'Veuillez attribuer des notes aux critères avant d\'enregistrer la visite.'
      );
      return;
    }

    setIsSaving(true);

    const evaluation: EvaluationVisit = {
      id: `eval-${Date.now()}`,
      teacherId: `teacher-${teacherName}`,
      teacherName,
      coordinatorId: currentUser?.id || 'coord-1',
      coordinatorName: currentUser?.fullName || currentUser?.username || 'Coordinateur Pédagogique',
      schoolName: 'École Internationale Alkawthar',
      date,
      sessionNumber,
      className,
      subject,
      lessonTopic,
      studentCount,
      gridId: activeGrid.id,
      gridTitle: activeGrid.title,
      ratings,
      categoryScores,
      grandTotal,
      maxPossibleScore,
      percentageScore,
      performanceLevel,
      comments: {
        strengths: strengths || 'Séance conforme aux attentes pédagogiques.',
        toImprove: toImprove || 'Poursuivre la régulation du rythme de séance.',
        recommendations: recommendations || 'Continuer le travail concerté avec le coordinateur.',
        actionPlan,
      },
      autoGeneratedReport: autoReport || generatePedagogicalReport({
        teacherName,
        coordinatorName: currentUser?.fullName || currentUser?.username || 'Coordinateur Pédagogique',
        className,
        subject,
        lessonTopic,
        grandTotal,
        maxScore: maxPossibleScore,
        categoryScores,
        grid: activeGrid,
        ratings,
        lang,
      }).synthesis,
      observationNotes: notes,
      status: 'completed',
      syncStatus: 'synced',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = storage.saveEvaluation(evaluation);
    setIsSaving(false);
    onSaveSuccess(evaluation);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Banner & Quick Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {lang === 'ar' ? 'استمارة زيارة الصف والملاحظة البيداغوجية' : lang === 'en' ? 'Classroom Observation & Evaluation Visit' : 'Nouvelle Visite d\'Observation de Classe'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'ar' ? 'شبكة تفاعلية مع احتساب فوري للنقاط والتقرير التلقائي' : lang === 'en' ? 'Live scoring rubric with real-time feedback & auto-synthesis' : 'Grille dynamique avec calcul en temps réel et synthèse générée par le système'}
            </p>
          </div>

          {/* Observation Stopwatch */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl shrink-0">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
              <span className="font-mono text-base font-bold text-slate-800 tabular-nums">
                {formatTimer(elapsedSeconds)}
              </span>
            </div>
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
              <button
                type="button"
                onClick={() => setTimerRunning(!timerRunning)}
                className={`p-1.5 rounded-lg text-white font-medium text-xs transition cursor-pointer ${
                  timerRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
                title={timerRunning ? 'Mettre en pause' : 'Démarrer le chronomètre de séance'}
              >
                {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setElapsedSeconds(0);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
                title="Réinitialiser"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Score Tally Bar (Always visible) */}
        <div className="mt-4 pt-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-blue-700 tabular-nums">
                {grandTotal}
              </span>
              <span className="text-sm font-semibold text-slate-400">
                / {maxPossibleScore} pts
              </span>
            </div>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full border"
              style={{
                backgroundColor: `${performanceLevel.color}15`,
                color: performanceLevel.color,
                borderColor: `${performanceLevel.color}40`,
              }}
            >
              {lang === 'ar' ? performanceLevel.label_ar : lang === 'en' ? performanceLevel.label_en : performanceLevel.label_fr} ({percentageScore}%)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span>
              {lang === 'ar' ? `المعايير المقيّمة: ${ratedCriteriaCount} من ${totalCriteriaCount}` : lang === 'en' ? `Evaluated: ${ratedCriteriaCount} of ${totalCriteriaCount}` : `Critères notés : ${ratedCriteriaCount} / ${totalCriteriaCount}`}
            </span>
            <div className="w-28 sm:w-36 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${Math.round((ratedCriteriaCount / (totalCriteriaCount || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {validationError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Section 1: Visit Metadata */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>{lang === 'ar' ? 'معلومات الزيارة والصف' : lang === 'en' ? 'Visit & Class Parameters' : 'Paramètres de la Visite Pédagogique'}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Teacher Selection */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'المعلم(ة) الملاحظ' : lang === 'en' ? 'Teacher Observed' : 'Enseignant(e) observé(e)'} *
              </label>
              <select
                value={teacherName}
                onChange={e => setTeacherName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
                required
              >
                {(currentUser?.assignedTeachers && currentUser.assignedTeachers.length > 0
                  ? currentUser.assignedTeachers
                  : teachers.map(t => t.username)
                ).map(tName => (
                  <option key={tName} value={tName}>
                    {tName}
                  </option>
                ))}
              </select>
            </div>

            {/* Rubric Grid Selection */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'شبكة التقييم المعتمدة' : lang === 'en' ? 'Assessment Rubric' : 'Grille Pédagogique'} *
              </label>
              <select
                value={selectedGridId}
                onChange={e => {
                  setSelectedGridId(e.target.value);
                  setRatings({});
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-hidden focus:border-blue-600 truncate"
              >
                {grids.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.title} ({g.totalPoints} pts)
                  </option>
                ))}
              </select>
            </div>

            {/* Class */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'القسم / الصف' : lang === 'en' ? 'Class' : 'Classe / Niveau'} *
              </label>
              <select
                value={className}
                onChange={e => setClassName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-600"
                required
              >
                {classesList.map(cls => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'المادة الدراسية' : lang === 'en' ? 'Subject' : 'Matière / Discipline'} *
              </label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-600"
                required
              >
                {subjectsList.map(subj => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'تاريخ الزيارة' : lang === 'en' ? 'Date' : 'Date de visite'} *
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-600"
                required
              />
            </div>

            {/* Session Period (1-8) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'رقم الحصة (1-8)' : lang === 'en' ? 'Session Period' : 'Séance / Créneau'} *
              </label>
              <select
                value={sessionNumber}
                onChange={e => setSessionNumber(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-600"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                  <option key={n} value={n}>
                    Séance {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Count */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'عدد التلاميذ الحاضرين' : lang === 'en' ? 'Students Present' : 'Effectif élèves'}
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={studentCount}
                onChange={e => setStudentCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            {/* Topic */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'موضوع / عنوان الدرس' : lang === 'en' ? 'Lesson Topic' : 'Thème de la leçon'}
              </label>
              <input
                type="text"
                value={lessonTopic}
                onChange={e => setLessonTopic(e.target.value)}
                placeholder="Ex: Théorème de Thalès..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Real-Time Quick Observation Notes during visit */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>{lang === 'ar' ? 'ملاحظات وتدوينات فورية أثناء الحصة' : lang === 'en' ? 'Live Timestamped Observation Log' : 'Prise de Notes Instantanée en Classe'}</span>
            </h2>
            <span className="text-[11px] text-slate-400">
              {notes.length} note(s)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newNoteText}
              onChange={e => setNewNoteText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddNote();
                }
              }}
              placeholder={lang === 'ar' ? 'أضف ملاحظة فورية (مثال: مشاركة متميزة للصف الأيمن، وضوح السبورة)...' : lang === 'en' ? 'Log an observation note (e.g. good board work, high student engagement)...' : 'Notez un fait marquant (ex: belle accroche, élève encouragé au tableau)...'}
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
            />
            <div className="flex items-center gap-2">
              <select
                value={newNoteTag}
                onChange={e => setNewNoteTag(e.target.value as any)}
                className="px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700"
              >
                <option value="positif">Points Forts (+)</option>
                <option value="amelioration">À améliorer (!)</option>
                <option value="technique">Didactique / Méthode</option>
                <option value="general">Général</option>
              </select>
              <button
                type="button"
                onClick={handleAddNote}
                className="px-3 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'إضافة' : lang === 'en' ? 'Log Note' : 'Ajouter'}</span>
              </button>
            </div>
          </div>

          {notes.length > 0 && (
            <div className="mt-2 divide-y divide-slate-100 max-h-36 overflow-y-auto">
              {notes.map(n => (
                <div key={n.id} className="py-1.5 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[11px] text-blue-700 font-bold shrink-0">
                      [{n.timestamp}]
                    </span>
                    <span className="text-slate-700 truncate">{n.content}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(n.id)}
                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Evaluation Criteria Matrix (by category) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span>{lang === 'ar' ? 'شبكة التقييم والمعايير التفصيلية' : lang === 'en' ? 'Detailed Rubric Assessment' : 'Grille d\'Évaluation par Domaine'}</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Barème : 1 (Insuffisant) → 5 (Remarquable)
            </span>
          </div>

          {activeGrid.categories.map((cat, catIdx) => {
            const isExpanded = expandedCategories[cat.id] ?? true;
            const currentCatScore = categoryScores[cat.id] || 0;
            const catPct = Math.round((currentCatScore / cat.maxPoints) * 100);

            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
              >
                {/* Category Header */}
                <div
                  onClick={() =>
                    setExpandedCategories(prev => ({
                      ...prev,
                      [cat.id]: !isExpanded,
                    }))
                  }
                  className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                      {catIdx + 1}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {lang === 'ar' ? cat.title_ar : lang === 'en' ? cat.title_en : cat.title_fr}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-baseline gap-1 text-xs font-bold text-blue-700 tabular-nums">
                      <span>{currentCatScore}</span>
                      <span className="text-slate-400 font-normal">/ {cat.maxPoints} pts</span>
                      <span className="text-[11px] text-slate-500 font-medium ml-1">({catPct}%)</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Criteria Rows */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 divide-y divide-slate-100 space-y-1">
                    {cat.items.map((item, itemIdx) => {
                      const currentRating = ratings[item.id]?.rating || 0;
                      const calculatedItemScore = ratings[item.id]?.score || 0;

                      return (
                        <div
                          key={item.id}
                          className="pt-3 pb-3 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-3"
                        >
                          {/* Criterion Text & Detail */}
                          <div className="flex-1 pr-2">
                            <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                              {lang === 'ar' ? item.text_ar : lang === 'en' ? item.text_en : item.text_fr}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              {lang === 'ar' ? item.detail_ar : lang === 'en' ? item.detail_en : item.detail_fr}
                            </div>
                          </div>

                          {/* 1-5 Rating Controls & Calculated Score */}
                          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                            <div className="flex items-center gap-1.5">
                              {[1, 2, 3, 4, 5].map(star => {
                                const isSelected = currentRating === star;
                                return (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleRate(item.id, star, item.maxPoints)}
                                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-blue-700 text-white shadow-md shadow-blue-700/30 scale-105'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                                    }`}
                                    title={`Note ${star}/5`}
                                  >
                                    {star}
                                  </button>
                                );
                              })}
                            </div>

                            <div className="w-14 text-right">
                              <span className="text-xs font-bold text-slate-800 tabular-nums">
                                {calculatedItemScore}
                              </span>
                              <span className="text-[10px] text-slate-400">/{item.maxPoints}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Section 4: Automated Narrative Synthesis & Qualitative Comments */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>{lang === 'ar' ? 'التحليل البيداغوجي وتوليد التعليقات بالذكاء الاصطناعي' : lang === 'en' ? 'Pedagogical Synthesis & AI-Generated Feedback' : 'Synthèse Pédagogique & Commentaires Gemini AI'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'ar' ? 'تحليل درجات المعلم وصياغة نقاط القوة والتوصيات تلقائياً عبر Gemini AI' : lang === 'en' ? 'Analyze teacher scores and automatically draft qualitative feedback using Gemini AI' : 'Analyse détaillée des notes attribuées pour formuler les points forts et recommandations via Gemini AI'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleGenerateWithGemini}
                disabled={isGeneratingAI}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition cursor-pointer disabled:opacity-50"
                title="Générer les commentaires et recommandations personnalisés avec Gemini AI"
              >
                {isGeneratingAI ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>
                  {isGeneratingAI
                    ? lang === 'ar'
                      ? 'جاري التحليل بواسطة Gemini...'
                      : lang === 'en'
                      ? 'Generating with Gemini...'
                      : 'Génération Gemini AI en cours...'
                    : lang === 'ar'
                    ? 'توليد بالذكاء الاصطناعي Gemini'
                    : lang === 'en'
                    ? 'Generate with Gemini AI'
                    : 'Générer avec Gemini AI'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleAutoGenerateReport}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer border border-slate-200"
                title="Génération déterministe basée sur les règles (hors ligne)"
              >
                <Wand2 className="w-3 h-3 text-slate-500" />
                <span className="hidden md:inline">{lang === 'ar' ? 'نمط محلي' : lang === 'en' ? 'Rule-based' : 'Règles locales'}</span>
              </button>
            </div>
          </div>

          {aiSuccessMessage && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 font-semibold flex items-center gap-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <span>{aiSuccessMessage}</span>
            </div>
          )}

          {/* Quick Suggestion Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">
              Suggestions rapides :
            </span>
            {quickPhrases.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => insertPhrase(q.target, q.text)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer font-medium"
              >
                + {q.label}
              </button>
            ))}
          </div>

          {/* System Synthesis Paragraph */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {lang === 'ar' ? 'التقرير البيداغوجي العام (مُولد آلياً)' : lang === 'en' ? 'Official System Narrative Synthesis' : 'Synthèse Pédagogique Officielle (Générée par le système)'}
            </label>
            <textarea
              value={autoReport}
              onChange={e => setAutoReport(e.target.value)}
              placeholder="Cliquez sur 'Générer la Synthèse Système' ou rédigez le constat d'inspection..."
              rows={3}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 leading-relaxed focus:outline-hidden focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'ar' ? 'نقاط القوة الملاحظة' : lang === 'en' ? 'Observed Strengths' : 'Points Forts Observés'}</span>
              </label>
              <textarea
                value={strengths}
                onChange={e => setStrengths(e.target.value)}
                placeholder="• Maîtrise des notions...\n• Bonne dynamique d'écoute..."
                rows={4}
                className="w-full px-3 py-2 text-xs border border-emerald-200 rounded-xl bg-emerald-50/30 text-slate-800 focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            {/* To Improve */}
            <div>
              <label className="block text-xs font-bold text-amber-800 mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>{lang === 'ar' ? 'محاور التحسين ذات الأولوية' : lang === 'en' ? 'Priority Improvement Areas' : 'Axes d\'Amélioration Prioritaires'}</span>
              </label>
              <textarea
                value={toImprove}
                onChange={e => setToImprove(e.target.value)}
                placeholder="• Améliorer la relance des élèves discrets...\n• Gérer le temps de la phase écrite..."
                rows={4}
                className="w-full px-3 py-2 text-xs border border-amber-200 rounded-xl bg-amber-50/30 text-slate-800 focus:outline-hidden focus:border-amber-600"
              />
            </div>
          </div>

          {/* Recommendations & Action Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-blue-800 mb-1">
                {lang === 'ar' ? 'التوجيهات والتوصيات التربوية' : lang === 'en' ? 'Pedagogical Recommendations' : 'Recommandations & Conseils Pédagogiques'}
              </label>
              <textarea
                value={recommendations}
                onChange={e => setRecommendations(e.target.value)}
                placeholder="1. Expérimenter le travail en îlots...\n2. Formaliser les critères de réussite au tableau..."
                rows={3}
                className="w-full px-3 py-2 text-xs border border-blue-200 rounded-xl bg-blue-50/30 text-slate-800 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {lang === 'ar' ? 'خطة العمل المشتركة والزيارة القادمة' : lang === 'en' ? 'Joint Action Plan & Next Visit' : 'Engagements Réciproques & Prochaine Étape'}
              </label>
              <textarea
                value={actionPlan}
                onChange={e => setActionPlan(e.target.value)}
                placeholder="Objectifs convenus pour la prochaine visite de suivi d'étape..."
                rows={3}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-hidden focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions (Sticky bottom bar on mobile / clear layout) */}
        <div className="flex items-center justify-between gap-3 pt-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200 transition cursor-pointer"
          >
            {lang === 'ar' ? 'إلغاء' : lang === 'en' ? 'Cancel' : 'Annuler'}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const draftEval: EvaluationVisit = {
                  id: `eval-${Date.now()}`,
                  teacherId: `teacher-${teacherName}`,
                  teacherName,
                  coordinatorId: currentUser?.id || 'coord-1',
                  coordinatorName: currentUser?.fullName || currentUser?.username || 'Coordinateur Pédagogique',
                  schoolName: 'École Internationale Alkawthar',
                  date,
                  sessionNumber,
                  className,
                  subject,
                  lessonTopic,
                  studentCount,
                  gridId: activeGrid.id,
                  gridTitle: activeGrid.title,
                  ratings,
                  categoryScores,
                  grandTotal,
                  maxPossibleScore,
                  percentageScore,
                  performanceLevel,
                  comments: {
                    strengths: strengths || 'Séance conforme aux attentes pédagogiques.',
                    toImprove: toImprove || 'Poursuivre la régulation du rythme de séance.',
                    recommendations: recommendations || 'Continuer le travail concerté avec le coordinateur.',
                    actionPlan,
                  },
                  autoGeneratedReport: autoReport || '',
                  observationNotes: notes,
                  status: 'draft',
                  syncStatus: 'synced',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                downloadEvaluationHTML(draftEval, activeGrid, lang);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              title="Télécharger l'évaluation sous forme de fichier HTML imprimable A4"
            >
              <FileCode className="w-4 h-4 text-blue-700" />
              <span>
                {lang === 'ar' ? 'تحميل HTML (A4)' : lang === 'en' ? 'Download HTML (A4)' : 'Télécharger HTML (A4)'}
              </span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-blue-700 hover:bg-blue-800 text-white shadow-md shadow-blue-700/25 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSaving
                  ? lang === 'ar'
                    ? 'جاري الحفظ...'
                    : lang === 'en'
                    ? 'Saving...'
                    : 'Enregistrement...'
                  : lang === 'ar'
                  ? 'حفظ وتأكيد التقييم'
                  : lang === 'en'
                  ? 'Save & Finalize Evaluation'
                  : 'Enregistrer & Finaliser la Visite'}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
