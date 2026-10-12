import { EvaluationGrid, EvaluationVisit } from '../types';

export interface GeneratedReport {
  synthesis: string;
  suggestedStrengths: string[];
  suggestedImprovements: string[];
  suggestedRecommendations: string[];
  actionPlan: string;
}

export function generatePedagogicalReport(params: {
  teacherName: string;
  coordinatorName: string;
  className: string;
  subject: string;
  lessonTopic: string;
  grandTotal: number;
  maxScore: number;
  categoryScores: Record<string, number>;
  grid: EvaluationGrid;
  ratings: Record<string, { rating: number; score: number }>;
  lang?: 'fr' | 'ar' | 'en';
}): GeneratedReport {
  const {
    teacherName,
    coordinatorName,
    className,
    subject,
    lessonTopic,
    grandTotal,
    maxScore,
    categoryScores,
    grid,
    ratings,
    lang = 'fr',
  } = params;

  const percentage = Math.round((grandTotal / (maxScore || 100)) * 100);

  // Analyze categories
  const catAnalyses = grid.categories.map(cat => {
    const score = categoryScores[cat.id] || 0;
    const catPercent = Math.round((score / cat.maxPoints) * 100);
    return {
      id: cat.id,
      title: lang === 'ar' ? cat.title_ar : lang === 'en' ? cat.title_en : cat.title_fr,
      score,
      max: cat.maxPoints,
      percent: catPercent,
    };
  });

  catAnalyses.sort((a, b) => b.percent - a.percent);
  const bestCategory = catAnalyses[0];
  const lowestCategory = catAnalyses[catAnalyses.length - 1];

  // Analyze individual criteria items (ratings >= 4 vs ratings <= 2)
  const highPoints: string[] = [];
  const lowPoints: string[] = [];

  grid.categories.forEach(cat => {
    cat.items.forEach(item => {
      const r = ratings[item.id]?.rating || 0;
      const text = lang === 'ar' ? item.text_ar : lang === 'en' ? item.text_en : item.text_fr;
      if (r >= 4) {
        highPoints.push(text);
      } else if (r <= 2) {
        lowPoints.push(text);
      }
    });
  });

  if (lang === 'ar') {
    let performanceText = '';
    if (percentage >= 90) {
      performanceText = 'مستوى متميز يعكس تمكناً ديداكتيكياً عالياً وانضباطاً بيداغوجياً نموذجياً.';
    } else if (percentage >= 80) {
      performanceText = 'أداء جيد جداً مع ممارسات تدريسية متينة وتفاعل إيجابي من المتعلمين.';
    } else if (percentage >= 70) {
      performanceText = 'مستوى مرضٍ بشكل عام مع الحاجة إلى تعزيز بعض الجوانب التنظيمية والديداكتيكية.';
    } else {
      performanceText = 'أداء يحتاج إلى مرافقة تربوية وثيقة ودعم منهجي لتجاوز الصعوبات المرصودة.';
    }

    const synthesis = `خلال زيارة الملاحظة الصفية للأستاذ(ة) ${teacherName} في مادة ${subject} (${className})، تم تناول موضوع "${lessonTopic || 'الدرس المبرمج'}". أسفر التقييم الإجمالي عن حصول الأستاذ(ة) على نسبة ${percentage}% (${grandTotal}/${maxScore} نقطة)، وهو ${performanceText} برز التميز بشكل خاص في مجال "${bestCategory.title}" بنسبة إنجاز بلغت ${bestCategory.percent}%. في حين يتطلب مجال "${lowestCategory.title}" (${lowestCategory.percent}%) عناية دقيقة وخطة عمل مشتركة مع المنسق التربوي.`;

    const suggestedStrengths = highPoints.slice(0, 4);
    if (suggestedStrengths.length === 0) {
      suggestedStrengths.push('انضباط ملحوظ والالتزام بالحضور في الموعد المحدد للحصة.');
      suggestedStrengths.push('تواصل لائق مع التلاميذ واحترام أخلاقيات المهنة.');
    }

    const suggestedImprovements = lowPoints.slice(0, 3);
    if (suggestedImprovements.length === 0) {
      suggestedImprovements.push('تطوير آليات التقويم التكويني والتحقق المنتظم من فهم كافة المتعلمين.');
      suggestedImprovements.push('تنويع طرائق التدريس لتشجيع التفاعل النشط للمتعلمين.');
    }

    const suggestedRecommendations = [
      `تخصيص أنشطة دعم موجهة لعلاج التعثرات المرصودة في مجال ${lowestCategory.title}.`,
      'تنظيم جلسة عمل تبادلية مع أساتذة المادة لمناقشة استراتيجيات التمايز البيداغوجي.',
      'تفعيل السبورة وتنظيمها بشكل يعزز استقلالية التلميذ وتدوين المفاهيم الأساسية.',
    ];

    const actionPlan = `متابعة تطبيق التوصيات المقترحة خلال الزيارة التتبعية القادمة بعد 4 أسابيع، مع تقديم تقرير مختصر للمنسق ${coordinatorName}.`;

    return {
      synthesis,
      suggestedStrengths,
      suggestedImprovements,
      suggestedRecommendations,
      actionPlan,
    };
  }

  if (lang === 'en') {
    let performanceText = '';
    if (percentage >= 90) {
      performanceText = 'an exceptional pedagogical performance demonstrating high mastery of didactic tools.';
    } else if (percentage >= 80) {
      performanceText = 'a very solid performance with well-grounded classroom practices and engaging student interaction.';
    } else if (percentage >= 70) {
      performanceText = 'a satisfactory session showing good fundamentals with targeted areas for operational refinement.';
    } else {
      performanceText = 'a session highlighting urgent need for structured pedagogical coaching and mentoring.';
    }

    const synthesis = `During the classroom observation visit of teacher ${teacherName} in ${subject} (${className}), focusing on "${lessonTopic || 'Scheduled Curriculum'}", the overall evaluation reached ${percentage}% (${grandTotal}/${maxScore} pts), representing ${performanceText} Excellence was particularly noted in "${bestCategory.title}" (${bestCategory.percent}%). Conversely, "${lowestCategory.title}" (${lowestCategory.percent}%) represents the prime focus area for coordinated coaching.`;

    const suggestedStrengths = highPoints.slice(0, 4);
    if (suggestedStrengths.length === 0) {
      suggestedStrengths.push('Strict punctuality and professional commitment.');
      suggestedStrengths.push('Respectful rapport with students.');
    }

    const suggestedImprovements = lowPoints.slice(0, 3);
    if (suggestedImprovements.length === 0) {
      suggestedImprovements.push('Systematize formative assessment checks throughout the lesson.');
      suggestedImprovements.push('Incorporate differentiated tasks to support varying learning paces.');
    }

    const suggestedRecommendations = [
      `Focus lesson prep on targeted indicators related to ${lowestCategory.title}.`,
      'Schedule a peer observation session with senior department colleagues.',
      'Enhance board organization and clarity of task instructions.',
    ];

    const actionPlan = `Follow-up classroom observation scheduled in 4 weeks with coordinator ${coordinatorName}.`;

    return {
      synthesis,
      suggestedStrengths,
      suggestedImprovements,
      suggestedRecommendations,
      actionPlan,
    };
  }

  // Default: French
  let performanceText = '';
  if (percentage >= 90) {
    performanceText = 'une prestation d\'un niveau d\'excellence remarquable, caractérisée par une rigueur didactique exemplaire et une maîtrise totale de la dynamique de classe.';
  } else if (percentage >= 80) {
    performanceText = 'une prestation de très bonne tenue, témoignant d\'une démarche pédagogique structurée et d\'une adhésion manifeste des apprenants.';
  } else if (percentage >= 70) {
    performanceText = 'une séance globalement satisfaisante qui pose de solides bases, tout en appelant des ajustements méthodologiques ciblés.';
  } else {
    performanceText = 'une séance qui requiert un accompagnement pédagogique renforcé afin de consolider la conduite didactique et la gestion du climat de classe.';
  }

  const synthesis = `La visite d'observation de classe de ${teacherName} en ${subject} (${className}), portant sur la séance intitulée « ${lessonTopic || 'Programme en cours'} », aboutit à un score global de ${percentage}% (${grandTotal}/${maxScore} pts), traduisant ${performanceText} Le domaine le plus performant s'avère être « ${bestCategory.title} » avec un taux de réussite de ${bestCategory.percent}%. Le domaine prioritaire de perfectionnement se situe au niveau de « ${lowestCategory.title} » (${lowestCategory.percent}%).`;

  const suggestedStrengths = highPoints.slice(0, 4);
  if (suggestedStrengths.length === 0) {
    suggestedStrengths.push('Ponctualité exemplaire et présentation professionnelle soignée.');
    suggestedStrengths.push('Climat de classe respectueux et écoute bienveillante des élèves.');
  }

  const suggestedImprovements = lowPoints.slice(0, 3);
  if (suggestedImprovements.length === 0) {
    suggestedImprovements.push('Systématiser la vérification de la compréhension par un questionnement formatif ciblé.');
    suggestedImprovements.push('Optimiser la gestion du temps pour préserver une phase de synthèse et bilan en fin d\'heure.');
  }

  const suggestedRecommendations = [
    `Concevoir des fiches d\'exercices à degrés d\'autonomie variables pour soutenir le domaine : ${lowestCategory.title}.`,
    'Favoriser la verbalisation des démarches par les élèves avant la mise au propre collective.',
    'Planifier une séance de co-observation ou d\'échange de pratiques au sein du département disciplinaire.',
  ];

  const actionPlan = `Mise en œuvre des pistes d'amélioration concertées lors de l'entretien de débriefing. Visite d'étape de suivi programmée dans un délai de 4 à 6 semaines par le coordinateur ${coordinatorName}.`;

  return {
    synthesis,
    suggestedStrengths,
    suggestedImprovements,
    suggestedRecommendations,
    actionPlan,
  };
}
