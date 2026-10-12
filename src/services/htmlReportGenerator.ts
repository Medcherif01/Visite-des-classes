import { EvaluationVisit, EvaluationGrid } from '../types';

export function generateHTMLReportContent(
  evaluation: EvaluationVisit,
  grid: EvaluationGrid,
  lang: 'fr' | 'ar' | 'en' = 'fr'
): string {
  const isArabic = lang === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  const categoryRowsHTML = grid.categories
    .map(cat => {
      const score = evaluation.categoryScores?.[cat.id] || 0;
      const pct = Math.round((score / (cat.maxPoints || 1)) * 100);
      const appreciation =
        pct >= 85
          ? isArabic ? 'متقن ومتميز' : 'Maîtrise remarquable'
          : pct >= 70
          ? isArabic ? 'مكتسب' : 'Acquis'
          : pct >= 55
          ? isArabic ? 'في طور الاكتساب' : 'En cours d\'acquisition'
          : isArabic ? 'يحتاج إلى تعزيز' : 'À consolider';

      return `
      <tr>
        <td style="font-weight: 600; text-align: ${isArabic ? 'right' : 'left'};">
          ${isArabic ? cat.title_ar : lang === 'en' ? cat.title_en : cat.title_fr}
        </td>
        <td style="text-align: center; font-weight: bold; color: #1e3a8a;">${score} pts</td>
        <td style="text-align: center; color: #64748b;">${cat.maxPoints} pts</td>
        <td style="text-align: center; font-weight: bold; color: ${pct >= 75 ? '#15803d' : '#b45309'};">${pct}%</td>
        <td style="text-align: center; font-size: 11px;">${appreciation}</td>
      </tr>
    `;
    })
    .join('');

  const detailedCriteriaRowsHTML = grid.categories
    .map(cat => {
      const itemsHTML = cat.items
        .map(item => {
          const r = evaluation.ratings?.[item.id];
          const ratingVal = r ? r.rating : '-';
          const scoreVal = r ? `${r.score} / ${item.maxPoints}` : `- / ${item.maxPoints}`;

          return `
          <tr>
            <td style="font-size: 11.5px; font-weight: 600; color: #1e293b;">
              ${isArabic ? item.text_ar : lang === 'en' ? item.text_en : item.text_fr}
              <div style="font-size: 10px; color: #64748b; font-weight: normal; margin-top: 2px;">
                ${isArabic ? item.detail_ar : lang === 'en' ? item.detail_en : item.detail_fr}
              </div>
            </td>
            <td style="text-align: center; font-weight: bold; font-size: 12px; background: #f8fafc;">
              ${ratingVal}/5
            </td>
            <td style="text-align: center; font-weight: bold; color: #1e3a8a; font-size: 12px;">
              ${scoreVal}
            </td>
          </tr>
        `;
        })
        .join('');

      return `
        <tr style="background: #f1f5f9;">
          <th colspan="3" style="text-align: ${isArabic ? 'right' : 'left'}; font-size: 12px; font-weight: bold; color: #1e3a8a; padding: 6px 10px; border-top: 2px solid #cbd5e1;">
            ■ ${isArabic ? cat.title_ar : lang === 'en' ? cat.title_en : cat.title_fr} (${cat.maxPoints} pts)
          </th>
        </tr>
        ${itemsHTML}
      `;
    })
    .join('');

  const observationNotesHTML =
    evaluation.observationNotes && evaluation.observationNotes.length > 0
      ? `
      <div class="section-box break-inside-avoid">
        <h3 class="section-title">
          ${isArabic ? 'سجل الملاحظات الفورية أثناء الحصة' : 'Journal des Notes d\'Observation en Temps Réel'}
        </h3>
        <div style="font-size: 11px; line-height: 1.6; color: #334155;">
          ${evaluation.observationNotes
            .map(
              n => `
            <div style="margin-bottom: 4px; display: flex; gap: 8px;">
              <span style="font-family: monospace; font-weight: bold; color: #1e3a8a;">[${n.timestamp}]</span>
              <span style="padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; background: ${
                n.tag === 'positif' ? '#dcfce7; color: #15803d;' : n.tag === 'amelioration' ? '#fef3c7; color: #b45309;' : '#f1f5f9; color: #475569;'
              }">
                ${n.tag.toUpperCase()}
              </span>
              <span>${n.content}</span>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `
      : '';

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Evaluation_${evaluation.teacherName}_${evaluation.date}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 12mm 12mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: ${isArabic ? "'Cairo', sans-serif" : "'Plus Jakarta Sans', system-ui, sans-serif"};
      color: #0f172a;
      background-color: #f8fafc;
      font-size: 12px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Floating action toolbar for screen viewing */
    .no-print-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #0f172a;
      color: white;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .btn-action {
      background: #2563eb;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }

    .btn-action:hover {
      background: #1d4ed8;
    }

    .document-page {
      max-width: 210mm;
      margin: 20px auto;
      background: white;
      padding: 18mm 16mm;
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      border-radius: 4px;
    }

    @media print {
      body {
        background: white !important;
      }
      .no-print, .no-print-toolbar {
        display: none !important;
      }
      .document-page {
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        max-width: 100% !important;
      }
      .break-inside-avoid {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .page-break {
        page-break-before: always;
      }
    }

    /* Header styling */
    .header-stripe {
      height: 4px;
      background: linear-gradient(90deg, #1e3a8a, #3b82f6);
      border-radius: 2px;
      margin-bottom: 12px;
    }

    .institution-header {
      text-align: center;
      margin-bottom: 16px;
    }

    .school-name {
      font-size: 18px;
      font-weight: 800;
      color: #1e3a8a;
      letter-spacing: -0.02em;
      text-transform: uppercase;
    }

    .dept-name {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-top: 2px;
    }

    .doc-title {
      display: inline-block;
      margin-top: 8px;
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      background: #f1f5f9;
      padding: 4px 18px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      text-transform: uppercase;
    }

    /* Metadata table */
    .metadata-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 11px;
    }

    .metadata-table td {
      padding: 6px 10px;
      border: 1px solid #e2e8f0;
    }

    .metadata-label {
      background: #f8fafc;
      font-weight: 700;
      color: #475569;
      width: 18%;
    }

    .metadata-value {
      font-weight: 600;
      color: #0f172a;
      width: 32%;
    }

    /* Score banner */
    .score-banner {
      background: linear-gradient(135deg, #f8fafc, #eff6ff);
      border: 1.5px solid #bfdbfe;
      border-radius: 8px;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }

    .score-big {
      font-size: 20px;
      font-weight: 800;
      color: #1e3a8a;
    }

    .score-max {
      font-size: 12px;
      color: #64748b;
      font-weight: normal;
    }

    .score-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* Generic data table */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 11px;
    }

    .data-table th, .data-table td {
      border: 1px solid #cbd5e1;
      padding: 5px 8px;
    }

    .data-table th {
      background: #1e3a8a;
      color: white;
      font-weight: 700;
      font-size: 11px;
    }

    /* Sections */
    .section-box {
      margin-bottom: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      background: white;
    }

    .section-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .section-synthesis {
      border-left: 4px solid #2563eb;
      background: #f8fafc;
      font-style: italic;
      color: #1e293b;
      line-height: 1.6;
    }

    .section-strengths {
      border-left: 4px solid #16a34a;
      background: #f0fdf4;
    }

    .section-improvements {
      border-left: 4px solid #ea580c;
      background: #fff7ed;
    }

    .section-recommendations {
      border-left: 4px solid #2563eb;
      background: #eff6ff;
    }

    /* Signatures */
    .signatures-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 18px;
    }

    .signature-card {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px;
      text-align: center;
      min-height: 85px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #fafafa;
    }

    .signature-header {
      font-weight: 700;
      font-size: 10.5px;
      color: #475569;
      text-transform: uppercase;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 6px;
    }

    .signature-body {
      font-size: 11px;
      font-weight: bold;
      color: #0f172a;
    }

    .signature-footer {
      font-size: 9px;
      color: #94a3b8;
      font-style: italic;
    }

    .footer-note {
      text-align: center;
      font-size: 9px;
      color: #94a3b8;
      margin-top: 16px;
      border-top: 1px dashed #e2e8f0;
      padding-top: 6px;
    }
  </style>
</head>
<body>

  <!-- Floating Toolbar for immediate browser print & interaction -->
  <div class="no-print-toolbar">
    <div style="font-weight: bold; font-size: 13px;">
      📄 ${evaluation.teacherName} — Visite du ${evaluation.date} (A4 Print Ready)
    </div>
    <div style="display: flex; gap: 10px; align-items: center;">
      <span style="font-size: 11px; opacity: 0.85;">
        Format calibré pour impression A4 ou sauvegarde PDF
      </span>
      <button class="btn-action" onclick="window.print()">
        🖨️ Imprimer / Enregistrer en PDF
      </button>
    </div>
  </div>

  <div class="document-page">
    <div class="header-stripe"></div>

    <!-- Official Header -->
    <div class="institution-header">
      <div class="school-name">
        ${evaluation.schoolName || 'ÉCOLE INTERNATIONALE ALKAWTHAR'}
      </div>
      <div class="dept-name">
        ${isArabic ? 'إدارة التنسيق البيداغوجي والتفتيش التربوي' : 'DÉPARTEMENT DE COORDINATION PÉDAGOGIQUE & INSPECTION'}
      </div>
      <div class="doc-title">
        ${isArabic ? 'تقرير الزيارة الصفية والملاحظة التربوية' : 'RAPPORT OFFICIEL D\'ÉVALUATION DE CLASSE'}
      </div>
    </div>

    <!-- Metadata Grid -->
    <table class="metadata-table">
      <tr>
        <td class="metadata-label">${isArabic ? 'المعلم(ة) :' : 'Enseignant(e) :'}</td>
        <td class="metadata-value">${evaluation.teacherName}</td>
        <td class="metadata-label">${isArabic ? 'المقيّم / المنسق :' : 'Coordinateur / Inspecteur :'}</td>
        <td class="metadata-value">${evaluation.coordinatorName}</td>
      </tr>
      <tr>
        <td class="metadata-label">${isArabic ? 'القسم / الصف :' : 'Classe & Niveau :'}</td>
        <td class="metadata-value">${evaluation.className || 'Non spécifié'}</td>
        <td class="metadata-label">${isArabic ? 'المادة الدراسية :' : 'Matière / Discipline :'}</td>
        <td class="metadata-value">${evaluation.subject || 'Non spécifié'}</td>
      </tr>
      <tr>
        <td class="metadata-label">${isArabic ? 'تاريخ الزيارة :' : 'Date de visite :'}</td>
        <td class="metadata-value">${evaluation.date}</td>
        <td class="metadata-label">${isArabic ? 'الحصة / التوقيت :' : 'Séance / Période :'}</td>
        <td class="metadata-value">Séance ${evaluation.sessionNumber} ${evaluation.studentCount ? `(${evaluation.studentCount} élèves)` : ''}</td>
      </tr>
      <tr>
        <td class="metadata-label">${isArabic ? 'موضوع الدرس :' : 'Thème de la leçon :'}</td>
        <td class="metadata-value" colspan="3">${evaluation.lessonTopic || 'Séance pédagogique ordinaire'}</td>
      </tr>
    </table>

    <!-- Overall Performance Score Card -->
    <div class="score-banner">
      <div>
        <span style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; display: block;">
          ${isArabic ? 'النتيجة الإجمالية للزيارة' : 'RÉSULTAT GLOBAL D\'ÉVALUATION'}
        </span>
        <div class="score-big">
          ${evaluation.grandTotal} <span class="score-max">/ ${evaluation.maxPossibleScore || 100} PTS</span>
          <span style="font-size: 14px; font-weight: 700; color: #334155; margin-left: 6px;">(${evaluation.percentageScore}%)</span>
        </div>
      </div>
      <div>
        <span class="score-badge" style="background-color: ${evaluation.performanceLevel?.color}20; color: ${evaluation.performanceLevel?.color}; border: 1.5px solid ${evaluation.performanceLevel?.color};">
          ${isArabic ? evaluation.performanceLevel?.label_ar : lang === 'en' ? evaluation.performanceLevel?.label_en : evaluation.performanceLevel?.label_fr?.toUpperCase()}
        </span>
      </div>
    </div>

    <!-- Category Summary Table -->
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 48%; text-align: ${isArabic ? 'right' : 'left'};">${isArabic ? 'مجال التقييم البيداغوجي' : 'Domaine d\'Évaluation Pédagogique'}</th>
          <th style="width: 14%; text-align: center;">${isArabic ? 'النقاط المحصلة' : 'Score'}</th>
          <th style="width: 12%; text-align: center;">${isArabic ? 'الحد الأقصى' : 'Barème'}</th>
          <th style="width: 12%; text-align: center;">%</th>
          <th style="width: 14%; text-align: center;">${isArabic ? 'التقدير' : 'Appréciation'}</th>
        </tr>
      </thead>
      <tbody>
        ${categoryRowsHTML}
      </tbody>
    </table>

    <!-- System / Gemini AI Diagnostic Narrative -->
    ${
      evaluation.autoGeneratedReport
        ? `
      <div class="section-box section-synthesis break-inside-avoid">
        <div class="section-title" style="color: #1e3a8a;">
          ✨ ${isArabic ? 'التقرير البيداغوجي والتشخيص التحليلي (نظام الذكاء الاصطناعي Gemini)' : 'SYNTHÈSE PÉDAGOGIQUE DIAGNOSTIQUE (ASSISTÉE PAR GEMINI AI)'}
        </div>
        <p style="font-size: 11.5px;">« ${evaluation.autoGeneratedReport} »</p>
      </div>
    `
        : ''
    }

    <!-- Qualitative Strengths & Improvements -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;" class="break-inside-avoid">
      <div class="section-box section-strengths" style="margin-bottom: 0;">
        <div class="section-title" style="color: #15803d;">
          ✓ ${isArabic ? 'نقاط القوة الملاحظة' : 'POINTS FORTS OBSERVÉS'}
        </div>
        <div style="font-size: 11px; white-space: pre-line; color: #166534; line-height: 1.6;">
          ${evaluation.comments?.strengths || 'Non renseigné'}
        </div>
      </div>

      <div class="section-box section-improvements" style="margin-bottom: 0;">
        <div class="section-title" style="color: #c2410c;">
          ⚠ ${isArabic ? 'محاور التحسين ذات الأولوية' : 'AXES D\'AMÉLIORATION PRIORITAIRES'}
        </div>
        <div style="font-size: 11px; white-space: pre-line; color: #9a3412; line-height: 1.6;">
          ${evaluation.comments?.toImprove || 'Non renseigné'}
        </div>
      </div>
    </div>

    <!-- Recommendations & Action Plan -->
    ${
      evaluation.comments?.recommendations
        ? `
      <div class="section-box section-recommendations break-inside-avoid">
        <div class="section-title" style="color: #1d4ed8;">
          💡 ${isArabic ? 'التوجيهات والتوصيات التربوية' : 'RECOMMANDATIONS PÉDAGOGIQUES & CONSEILS DE VISITE'}
        </div>
        <div style="font-size: 11px; white-space: pre-line; color: #1e40af; line-height: 1.6;">
          ${evaluation.comments.recommendations}
        </div>
      </div>
    `
        : ''
    }

    ${
      evaluation.comments?.actionPlan
        ? `
      <div class="section-box break-inside-avoid" style="background: #fafafa;">
        <div class="section-title" style="color: #334155;">
          🎯 ${isArabic ? 'خطة العمل والالتزامات للزيارة القادمة' : 'PLAN D\'ACTION & ENGAGEMENTS RÉCIPROQUES'}
        </div>
        <div style="font-size: 11px; color: #475569; line-height: 1.6;">
          ${evaluation.comments.actionPlan}
        </div>
      </div>
    `
        : ''
    }

    <!-- Observation Notes log -->
    ${observationNotesHTML}

    <!-- Page Break for Clean Printing of Detailed Rubric Matrix -->
    <div class="page-break"></div>

    <div style="margin-top: 14px;" class="break-inside-avoid">
      <div style="font-size: 13px; font-weight: 800; color: #1e3a8a; text-transform: uppercase; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;">
        ${isArabic ? 'تفاصيل تنقيط المعايير البيداغوجية' : 'GRILLE DÉTAILLÉE DE NOTATION PAR CRITÈRE'}
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 70%; text-align: ${isArabic ? 'right' : 'left'};">${isArabic ? 'المعايير الملاحظة ومؤشرات النجاح' : 'Critères Pédagogiques Observés'}</th>
            <th style="width: 15%; text-align: center;">${isArabic ? 'التقييم' : 'Note (1-5)'}</th>
            <th style="width: 15%; text-align: center;">${isArabic ? 'النقاط' : 'Score Obtenu'}</th>
          </tr>
        </thead>
        <tbody>
          ${detailedCriteriaRowsHTML}
        </tbody>
      </table>
    </div>

    <!-- Official Signatures Box -->
    <div class="signatures-grid break-inside-avoid">
      <div class="signature-card">
        <div class="signature-header">${isArabic ? 'تأشيرة المعلم(ة)' : 'Signature de l\'Enseignant(e)'}</div>
        <div class="signature-body">${evaluation.teacherName}</div>
        <div class="signature-footer">
          ${evaluation.teacherSignature?.signed ? '✓ Lu et pris connaissance' : 'Visa & Date'}
        </div>
      </div>

      <div class="signature-card">
        <div class="signature-header">${isArabic ? 'توقيع المنسق التربوي' : 'Signature du Coordinateur'}</div>
        <div class="signature-body">${evaluation.coordinatorName}</div>
        <div class="signature-footer">✓ Visite validée et conforme</div>
      </div>

      <div class="signature-card">
        <div class="signature-header">${isArabic ? 'تأشيرة إدارة المؤسسة' : 'Visa de la Direction des Études'}</div>
        <div class="signature-body">Dr. Karima Alami</div>
        <div class="signature-footer">Cachet officiel de l\'établissement</div>
      </div>
    </div>

    <!-- Archival Footer Note -->
    <div class="footer-note">
      EduVisite v2.4 • Rapport d\'observation académique officiel • Généré le ${new Date().toLocaleDateString(
        lang === 'fr' ? 'fr-FR' : 'en-US'
      )} • Enregistré sous l\'identifiant archivage #${evaluation.id}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Downloads the evaluation as a standalone, printable A4 HTML file.
 * The file name follows the format: Evaluation_[TeacherName]_[Date].html
 */
export function downloadEvaluationHTML(
  evaluation: EvaluationVisit,
  grid: EvaluationGrid,
  lang: 'fr' | 'ar' | 'en' = 'fr'
): void {
  const htmlContent = generateHTMLReportContent(evaluation, grid, lang);

  // Clean teacher name and date for safe filesystem naming
  const safeTeacherName = evaluation.teacherName.trim().replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_');
  const safeDate = evaluation.date ? evaluation.date.trim() : new Date().toISOString().split('T')[0];
  const filename = `Evaluation_${safeTeacherName}_${safeDate}.html`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Directly prints the evaluation using a hidden iframe to prevent popup blocking.
 */
export function printEvaluationDirectly(
  evaluation: EvaluationVisit,
  grid: EvaluationGrid,
  lang: 'fr' | 'ar' | 'en' = 'fr'
): void {
  const htmlContent = generateHTMLReportContent(evaluation, grid, lang);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.zIndex = '-9999';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print failed, falling back to window.print', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 4000);
      }
    }, 400);
  } else {
    window.print();
  }
}

/**
 * Preview / Print evaluation fallback.
 */
export function previewEvaluationHTML(
  evaluation: EvaluationVisit,
  grid: EvaluationGrid,
  lang: 'fr' | 'ar' | 'en' = 'fr'
): void {
  printEvaluationDirectly(evaluation, grid, lang);
}
