import { EvaluationGrid, EvaluationVisit, ObservationNote } from '../types';
import { generatePedagogicalReport, GeneratedReport } from './reportGenerator';

export interface GenerateWithGeminiParams {
  teacherName: string;
  coordinatorName: string;
  className: string;
  subject: string;
  lessonTopic: string;
  sessionNumber?: number;
  grandTotal: number;
  maxScore: number;
  percentageScore: number;
  performanceLevel: any;
  categoryScores: Record<string, number>;
  grid: EvaluationGrid;
  ratings: Record<string, { rating: number; score: number }>;
  observationNotes?: ObservationNote[];
  language?: 'fr' | 'ar' | 'en';
}

export async function generateCommentsWithGemini(
  params: GenerateWithGeminiParams
): Promise<{ report: GeneratedReport; isAIGenerated: boolean; errorNotice?: string }> {
  // Format ratings breakdown for Gemini prompt
  const ratingsBreakdown = params.grid.categories.flatMap(cat =>
    cat.items.map(item => {
      const r = params.ratings[item.id];
      return {
        category: cat.title_fr,
        criterion: item.text_fr,
        description: item.detail_fr,
        rating: r ? `${r.rating}/5` : 'Non évalué',
        score: r ? `${r.score}/${item.maxPoints} pts` : `0/${item.maxPoints} pts`,
      };
    })
  );

  // Check if we can reach the backend
  try {
    const response = await fetch('/api/generate-pedagogical-comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        teacherName: params.teacherName,
        coordinatorName: params.coordinatorName,
        className: params.className,
        subject: params.subject,
        lessonTopic: params.lessonTopic,
        sessionNumber: params.sessionNumber,
        grandTotal: params.grandTotal,
        maxPossibleScore: params.maxScore,
        percentageScore: params.percentageScore,
        performanceLevel: params.performanceLevel,
        categoryScores: params.categoryScores,
        ratingsBreakdown,
        observationNotes: params.observationNotes,
        language: params.language || 'fr',
      }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return {
          report: {
            synthesis: result.data.synthesis,
            suggestedStrengths: result.data.strengths ? [result.data.strengths] : [],
            suggestedImprovements: result.data.toImprove ? [result.data.toImprove] : [],
            suggestedRecommendations: result.data.recommendations ? [result.data.recommendations] : [],
            actionPlan: result.data.actionPlan || '',
          },
          isAIGenerated: true,
        };
      }
    }

    const errorJson = await response.json().catch(() => ({}));
    console.warn('Gemini server route returned fallback response:', errorJson);
  } catch (err) {
    console.warn('Network error reaching Gemini backend, switching to offline pedagogical engine:', err);
  }

  // Graceful deterministic fallback
  const fallback = generatePedagogicalReport({
    teacherName: params.teacherName,
    coordinatorName: params.coordinatorName,
    className: params.className,
    subject: params.subject,
    lessonTopic: params.lessonTopic,
    grandTotal: params.grandTotal,
    maxScore: params.maxScore,
    categoryScores: params.categoryScores,
    grid: params.grid,
    ratings: params.ratings,
    lang: params.language,
  });

  return {
    report: fallback,
    isAIGenerated: false,
    errorNotice: 'Mode hors ligne / Moteur de règles déterministe actif.',
  };
}
