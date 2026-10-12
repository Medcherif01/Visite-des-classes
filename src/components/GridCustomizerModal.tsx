import React, { useState } from 'react';
import { EvaluationGrid, GridCategory, CriterionItem } from '../types';
import { storage } from '../services/storage';
import {
  X,
  Sliders,
  Plus,
  Trash2,
  Save,
  Copy,
  Check,
  Edit2,
  AlertCircle,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onGridUpdated: () => void;
  lang: 'fr' | 'ar' | 'en';
}

export const GridCustomizerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onGridUpdated,
  lang,
}) => {
  const [grids, setGrids] = useState<EvaluationGrid[]>(() => storage.getGrids());
  const [selectedGridId, setSelectedGridId] = useState<string>(grids[0]?.id || '');
  const [editingGrid, setEditingGrid] = useState<EvaluationGrid>(() => {
    return JSON.parse(JSON.stringify(grids[0] || {}));
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSelectGrid = (gridId: string) => {
    setSelectedGridId(gridId);
    const found = grids.find(g => g.id === gridId);
    if (found) {
      setEditingGrid(JSON.parse(JSON.stringify(found)));
    }
  };

  const handleDuplicateGrid = () => {
    const clone: EvaluationGrid = {
      ...JSON.parse(JSON.stringify(editingGrid)),
      id: `grid-custom-${Date.now()}`,
      title: `${editingGrid.title} (Copie personnalisée)`,
      isDefault: false,
    };
    storage.saveGrid(clone);
    const updated = storage.getGrids();
    setGrids(updated);
    setSelectedGridId(clone.id);
    setEditingGrid(clone);
    onGridUpdated();
  };

  const handleCreateNewGrid = () => {
    const newGrid: EvaluationGrid = {
      id: `grid-new-${Date.now()}`,
      title: 'Nouvelle Grille Pédagogique Personnalisée',
      description: 'Grille d\'observation adaptée aux besoins du département.',
      totalPoints: 100,
      categories: [
        {
          id: `cat-1-${Date.now()}`,
          title_fr: 'I. GESTION DIDACTIQUE & APPRENTISSAGE',
          title_ar: 'أولاً: الممارسة الديداكتيكية والتعلم',
          title_en: 'I. DIDACTIC PRACTICE & LEARNING',
          maxPoints: 50,
          items: [
            {
              id: `item-1-${Date.now()}`,
              text_fr: 'Clarté des explications et progression de la séance',
              text_ar: 'وضوح الشروحات والتسلسل المنطقي للحصة',
              text_en: 'Instructional clarity & session progression',
              detail_fr: 'Consignes explicites et structure adaptée.',
              detail_ar: 'تعليمات دقيقة ومفهومة للمتعلمين.',
              detail_en: 'Explicit instructions and adapted pacing.',
              maxPoints: 25,
            },
            {
              id: `item-2-${Date.now()}`,
              text_fr: 'Participation et écoute des apprenants',
              text_ar: 'تفاعل وإصغاء المتعلمين',
              text_en: 'Student engagement and listening',
              detail_fr: 'Élèves actifs et impliqués dans la tâche.',
              detail_ar: 'مشاركة نشطة ومستمرة من التلاميذ.',
              detail_en: 'Active student participation in the activity.',
              maxPoints: 25,
            },
          ],
        },
        {
          id: `cat-2-${Date.now()}`,
          title_fr: 'II. CLIMAT DE CLASSE & POSTURE',
          title_ar: 'ثانياً: المناخ الصفي والكفاءة المهنية',
          title_en: 'II. CLASSROOM CLIMATE & POSTURE',
          maxPoints: 50,
          items: [
            {
              id: `item-3-${Date.now()}`,
              text_fr: 'Bienveillance et respect des règles de vie',
              text_ar: 'الاحترام المتبادل وتطبيق ميثاق القسم',
              text_en: 'Mutual respect and classroom conduct',
              detail_fr: 'Gestion positive et atmosphère sereine.',
              detail_ar: 'بيئة صفية مريحة تحفز على التعلم.',
              detail_en: 'Supportive and orderly atmosphere.',
              maxPoints: 25,
            },
            {
              id: `item-4-${Date.now()}`,
              text_fr: 'Organisation matérielle et gestion du temps',
              text_ar: 'تنظيم الفضاء والتحكم في الوقت',
              text_en: 'Resource management & time control',
              detail_fr: 'Minimisation des temps morts.',
              detail_ar: 'استثمار أمثل للوقت المخصص.',
              detail_en: 'Minimizing idle transitions.',
              maxPoints: 25,
            },
          ],
        },
      ],
    };

    storage.saveGrid(newGrid);
    const updated = storage.getGrids();
    setGrids(updated);
    setSelectedGridId(newGrid.id);
    setEditingGrid(newGrid);
    onGridUpdated();
  };

  const handleAddCategory = () => {
    const newCat: GridCategory = {
      id: `cat-${Date.now()}`,
      title_fr: 'NOUVEAU DOMAINE PÉDAGOGIQUE',
      title_ar: 'مجال تقييم تربوي جديد',
      title_en: 'NEW PEDAGOGICAL DOMAIN',
      maxPoints: 25,
      items: [
        {
          id: `item-${Date.now()}`,
          text_fr: 'Nouveau critère d\'évaluation',
          text_ar: 'معيار تقييم جديد',
          text_en: 'New evaluation criterion',
          detail_fr: 'Description de l\'indicateur de réussite attendu.',
          detail_ar: 'وصف مؤشر النجاح المطلوب تحقيقه.',
          detail_en: 'Expected achievement benchmark.',
          maxPoints: 25,
        },
      ],
    };

    setEditingGrid(prev => ({
      ...prev,
      categories: [...prev.categories, newCat],
    }));
  };

  const handleDeleteCategory = (catId: string) => {
    if (editingGrid.categories.length <= 1) {
      alert('Une grille doit comporter au moins un domaine d\'évaluation.');
      return;
    }
    setEditingGrid(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== catId),
    }));
  };

  const handleAddCriterion = (catId: string) => {
    const newItem: CriterionItem = {
      id: `item-${Date.now()}`,
      text_fr: 'Nouveau critère pédagogique',
      text_ar: 'معيار ديداكتيكي جديد',
      text_en: 'New pedagogical criterion',
      detail_fr: 'Indicateur observable lors de la visite.',
      detail_ar: 'مؤشر قابل للملاحظة في الحصة.',
      detail_en: 'Observable indicator in class.',
      maxPoints: 5,
    };

    setEditingGrid(prev => ({
      ...prev,
      categories: prev.categories.map(cat => {
        if (cat.id === catId) {
          return {
            ...cat,
            items: [...cat.items, newItem],
          };
        }
        return cat;
      }),
    }));
  };

  const handleDeleteCriterion = (catId: string, itemId: string) => {
    setEditingGrid(prev => ({
      ...prev,
      categories: prev.categories.map(cat => {
        if (cat.id === catId) {
          if (cat.items.length <= 1) {
            alert('Un domaine doit contenir au moins un critère.');
            return cat;
          }
          return {
            ...cat,
            items: cat.items.filter(i => i.id !== itemId),
          };
        }
        return cat;
      }),
    }));
  };

  const handleSaveGrid = () => {
    // Recalculate total points
    const sumTotal = editingGrid.categories.reduce((acc, cat) => acc + cat.maxPoints, 0);
    const updatedGrid = {
      ...editingGrid,
      totalPoints: sumTotal,
    };

    storage.saveGrid(updatedGrid);
    const updated = storage.getGrids();
    setGrids(updated);
    setEditingGrid(updatedGrid);
    onGridUpdated();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleDeleteCurrentGrid = () => {
    if (grids.length <= 1) {
      alert('Impossible de supprimer la seule grille existante.');
      return;
    }
    if (confirm(`Confirmer la suppression de la grille "${editingGrid.title}" ?`)) {
      storage.deleteGrid(editingGrid.id);
      const updated = storage.getGrids();
      setGrids(updated);
      setSelectedGridId(updated[0]?.id || '');
      setEditingGrid(JSON.parse(JSON.stringify(updated[0] || {})));
      onGridUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {lang === 'ar' ? 'تخصيص شبكات التقييم والمعايير' : lang === 'en' ? 'Custom Rubrics & Criteria Editor' : 'Personnalisation des Grilles & Critères'}
              </h2>
              <p className="text-xs text-slate-500 leading-tight">
                {lang === 'ar' ? 'تعديل المعايير والأوزان والباريم بما يلائم أهداف المؤسسة' : lang === 'en' ? 'Customize categories, indicators and weights to fit your school' : 'Adaptez les domaines, indicateurs et barèmes aux besoins de votre établissement'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDuplicateGrid}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
              title="Dupliquer pour créer une variante"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dupliquer</span>
            </button>
            <button
              onClick={handleCreateNewGrid}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition cursor-pointer"
              title="Créer une nouvelle grille vierge"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Créer Nouvelle</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Grille enregistrée avec succès dans la base locale !</span>
            </div>
          )}

          {/* Grid Selection Tabs */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Grilles Configurées ({grids.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {grids.map(g => (
                <button
                  key={g.id}
                  onClick={() => handleSelectGrid(g.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-left border ${
                    selectedGridId === g.id
                      ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="truncate max-w-[220px]">{g.title}</div>
                  <div className={`text-[10px] font-normal ${selectedGridId === g.id ? 'text-blue-100' : 'text-slate-400'}`}>
                    Total: {g.totalPoints} pts
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Grid Title & Description Editor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Titre de la Grille
              </label>
              <input
                type="text"
                value={editingGrid.title}
                onChange={e =>
                  setEditingGrid(prev => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-600 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Barème Total
              </label>
              <div className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold">
                {editingGrid.categories.reduce((acc, c) => acc + c.maxPoints, 0)} points
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description & Objectif
              </label>
              <input
                type="text"
                value={editingGrid.description || ''}
                onChange={e =>
                  setEditingGrid(prev => ({ ...prev, description: e.target.value }))
                }
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-600"
              />
            </div>
          </div>

          {/* Categories & Criteria Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Domaines & Critères Définis ({editingGrid.categories.length})
              </h3>
              <button
                type="button"
                onClick={handleAddCategory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un Domaine</span>
              </button>
            </div>

            {editingGrid.categories.map((cat, catIdx) => (
              <div
                key={cat.id}
                className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs"
              >
                {/* Category Header Editor */}
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {catIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={cat.title_fr}
                      onChange={e => {
                        const val = e.target.value;
                        setEditingGrid(prev => ({
                          ...prev,
                          categories: prev.categories.map(c =>
                            c.id === cat.id ? { ...c, title_fr: val } : c
                          ),
                        }));
                      }}
                      className="w-full px-2.5 py-1 text-xs font-bold bg-white border border-slate-200 rounded-md text-slate-900"
                    />
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-500 font-medium">Points max :</span>
                      <input
                        type="number"
                        min="5"
                        max="100"
                        value={cat.maxPoints}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setEditingGrid(prev => ({
                            ...prev,
                            categories: prev.categories.map(c =>
                              c.id === cat.id ? { ...c, maxPoints: val } : c
                            ),
                          }));
                        }}
                        className="w-16 px-2 py-1 text-xs font-bold text-center bg-white border border-slate-200 rounded-md text-blue-700"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddCriterion(cat.id)}
                      className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                      title="Ajouter un critère à ce domaine"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition cursor-pointer"
                      title="Supprimer ce domaine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Criteria in Category */}
                <div className="p-3 divide-y divide-slate-100 space-y-2">
                  {cat.items.map((item, itemIdx) => (
                    <div
                      key={item.id}
                      className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-start justify-between gap-2"
                    >
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={item.text_fr}
                          onChange={e => {
                            const val = e.target.value;
                            setEditingGrid(prev => ({
                              ...prev,
                              categories: prev.categories.map(c =>
                                c.id === cat.id
                                  ? {
                                      ...c,
                                      items: c.items.map(i =>
                                        i.id === item.id ? { ...i, text_fr: val } : i
                                      ),
                                    }
                                  : c
                              ),
                            }));
                          }}
                          placeholder="Intitulé du critère..."
                          className="w-full px-2.5 py-1 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-md text-slate-900"
                        />
                        <input
                          type="text"
                          value={item.detail_fr}
                          onChange={e => {
                            const val = e.target.value;
                            setEditingGrid(prev => ({
                              ...prev,
                              categories: prev.categories.map(c =>
                                c.id === cat.id
                                  ? {
                                      ...c,
                                      items: c.items.map(i =>
                                        i.id === item.id ? { ...i, detail_fr: val } : i
                                      ),
                                    }
                                  : c
                              ),
                            }));
                          }}
                          placeholder="Description / benchmark observable..."
                          className="w-full px-2.5 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-md text-slate-500"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-[10px] text-slate-400">Pts:</span>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={item.maxPoints}
                            onChange={e => {
                              const val = Number(e.target.value);
                              setEditingGrid(prev => ({
                                ...prev,
                                categories: prev.categories.map(c =>
                                  c.id === cat.id
                                    ? {
                                        ...c,
                                        items: c.items.map(i =>
                                          i.id === item.id ? { ...i, maxPoints: val } : i
                                        ),
                                      }
                                    : c
                                ),
                              }));
                            }}
                            className="w-12 px-1.5 py-1 text-xs font-bold text-center bg-white border border-slate-200 rounded-md text-slate-700"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteCriterion(cat.id, item.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleDeleteCurrentGrid}
            className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
          >
            Supprimer cette grille
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={handleSaveGrid}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les Modifications</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
