import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EvaluationVisit, EvaluationGrid } from '../types';

export function exportEvaluationToPDF(
  evaluation: EvaluationVisit,
  grid: EvaluationGrid,
  lang: 'fr' | 'ar' | 'en' = 'fr'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Colors
  const primaryBlue = [30, 58, 138]; // #1e3a8a
  const secondarySlate = [71, 85, 105]; // #475569
  const accentEmerald = [16, 185, 129]; // #10b981
  const bgLight = [248, 250, 252]; // #f8fafc

  // --- 1. Institutional Header ---
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, 12, pageWidth - margin * 2, 2.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 138);
  doc.text(
    evaluation.schoolName || 'ÉCOLE INTERNATIONALE ALKAWTHAR',
    pageWidth / 2,
    22,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('DÉPARTEMENT DE COORDINATION PÉDAGOGIQUE & INSPECTION ACADÉMIQUE', pageWidth / 2, 27, {
    align: 'center',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text("RAPPORT OFFICIEL D'ÉVALUATION DE CLASSE", pageWidth / 2, 35, {
    align: 'center',
  });

  // --- 2. Visit Metadata Box ---
  autoTable(doc, {
    startY: 40,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
    },
    body: [
      [
        { content: 'Enseignant(e) :', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
        { content: evaluation.teacherName },
        { content: 'Coordinateur / Évaluateur :', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
        { content: evaluation.coordinatorName },
      ],
      [
        { content: 'Classe & Niveau :', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
        { content: evaluation.className || 'Non spécifié' },
        { content: 'Discipline / Matière :', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
        { content: evaluation.subject || 'Non spécifié' },
      ],
      [
        { content: 'Date de visite :', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
        { content: evaluation.date || new Date().toISOString().split('T')[0] },
        { content: 'Séance / Période :', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
        { content: `Séance N° ${evaluation.sessionNumber} ${evaluation.studentCount ? `(${evaluation.studentCount} élèves)` : ''}` },
      ],
      [
        { content: 'Thème de la leçon :', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
        { content: evaluation.lessonTopic || 'Séance pédagogique ordinaire', colSpan: 3 },
      ],
    ],
  });

  // --- 3. Overall Performance Score Card ---
  const afterMetaY = (doc as any).lastAutoTable.finalY + 4;

  const scoreBoxWidth = pageWidth - margin * 2;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, afterMetaY, scoreBoxWidth, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138);
  doc.text('RÉSULTAT GLOBAL DE LA VISITE :', margin + 6, afterMetaY + 7);

  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  const scoreText = `${evaluation.grandTotal} / ${evaluation.maxPossibleScore || 100} PTS (${evaluation.percentageScore}%)`;
  doc.text(scoreText, margin + 6, afterMetaY + 13);

  // Performance badge on the right
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  const levelBadge = `Mention : ${evaluation.performanceLevel?.label_fr?.toUpperCase() || 'TRÈS BIEN'}`;
  doc.text(levelBadge, pageWidth - margin - 6, afterMetaY + 10, { align: 'right' });

  // --- 4. Category Summary Table ---
  const catTableY = afterMetaY + 20;

  const catRows = grid.categories.map(cat => {
    const score = evaluation.categoryScores?.[cat.id] || 0;
    const pct = Math.round((score / (cat.maxPoints || 1)) * 100);
    return [
      cat.title_fr,
      `${score} pts`,
      `${cat.maxPoints} pts`,
      `${pct}%`,
      pct >= 80 ? 'Maîtrisé' : pct >= 65 ? 'En cours d\'acquisition' : 'À consolider',
    ];
  });

  autoTable(doc, {
    startY: catTableY,
    margin: { left: margin, right: margin },
    theme: 'striped',
    head: [['Domaine d\'Évaluation Pédagogique', 'Score Obtenu', 'Barème Max', 'Taux', 'Appréciation']],
    body: catRows,
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 85 },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center', fontStyle: 'bold' },
      4: { halign: 'center' },
    },
  });

  // --- 5. Detailed Criteria Breakdown ---
  const detailRows: any[] = [];
  grid.categories.forEach(cat => {
    detailRows.push([
      {
        content: `■ ${cat.title_fr} (${cat.maxPoints} pts)`,
        colSpan: 4,
        styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [30, 58, 138] },
      },
    ]);

    cat.items.forEach(item => {
      const r = evaluation.ratings?.[item.id];
      const ratingVal = r ? r.rating : '-';
      const scoreVal = r ? `${r.score} / ${item.maxPoints}` : `- / ${item.maxPoints}`;
      detailRows.push([
        item.text_fr,
        item.detail_fr,
        `${ratingVal}/5`,
        scoreVal,
      ]);
    });
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 4,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: [['Critères Pédagogiques Observés', 'Indicateurs de Réussite', 'Note (1-5)', 'Points']],
    body: detailRows,
    headStyles: {
      fillColor: [71, 85, 105],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
    },
    columnStyles: {
      0: { cellWidth: 65, fontStyle: 'bold' },
      1: { cellWidth: 85 },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
    },
  });

  // --- 6. Qualitative Comments & Recommendations ---
  const commentsStartY = (doc as any).lastAutoTable.finalY + 6;

  // Check if we need a new page
  if (commentsStartY > pageHeight - 70) {
    doc.addPage();
  }

  const currentY = (doc as any).lastAutoTable.finalY > pageHeight - 70 ? 20 : commentsStartY;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    body: [
      [
        {
          content: 'SYNTHÈSE PÉDAGOGIQUE DU SYSTÈME :',
          styles: { fontStyle: 'bold', textColor: [30, 58, 138], fillColor: [241, 245, 249] },
        },
      ],
      [
        {
          content: evaluation.autoGeneratedReport || 'Synthèse automatique générée conforme aux critères observés.',
          styles: { fontStyle: 'italic', textColor: [51, 65, 85] },
        },
      ],
      [
        {
          content: 'POINTS FORTS OBSERVÉS :',
          styles: { fontStyle: 'bold', textColor: [16, 185, 129], fillColor: [236, 253, 245] },
        },
      ],
      [
        {
          content: evaluation.comments?.strengths || 'Non renseigné',
          styles: { textColor: [15, 23, 42] },
        },
      ],
      [
        {
          content: 'AXES D\'AMÉLIORATION PRIORITAIRES :',
          styles: { fontStyle: 'bold', textColor: [217, 119, 6], fillColor: [254, 243, 199] },
        },
      ],
      [
        {
          content: evaluation.comments?.toImprove || 'Non renseigné',
          styles: { textColor: [15, 23, 42] },
        },
      ],
      [
        {
          content: 'RECOMMANDATIONS PÉDAGOGIQUES & CONSEILS DE VISITE :',
          styles: { fontStyle: 'bold', textColor: [37, 99, 235], fillColor: [239, 246, 255] },
        },
      ],
      [
        {
          content: evaluation.comments?.recommendations || 'Non renseigné',
          styles: { textColor: [15, 23, 42] },
        },
      ],
    ],
  });

  // --- 7. Official Signatures Section ---
  const sigY = (doc as any).lastAutoTable.finalY + 8;
  const signatureBoxY = sigY > pageHeight - 35 ? (doc.addPage(), 25) : sigY;

  autoTable(doc, {
    startY: signatureBoxY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 4,
      halign: 'center',
      minCellHeight: 22,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
    },
    head: [
      [
        'Signature de l\'Enseignant(e)',
        'Signature du Coordinateur',
        'Visa de la Direction des Études',
      ],
    ],
    body: [
      [
        `Lu et pris connaissance\n\n${evaluation.teacherName}`,
        `Visite validée\n\n${evaluation.coordinatorName}`,
        'Pour la Direction\n\nCachet officiel de l\'établissement',
      ],
    ],
  });

  // --- 8. Footer on all pages ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);

    doc.text(
      `EduVisite v2.4 • Archivage officiel • Document généré le ${new Date().toLocaleDateString('fr-FR')} • Page ${i} / ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  // Trigger download
  const cleanName = evaluation.teacherName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Rapport_Visite_${cleanName}_${evaluation.date || 'archive'}.pdf`;
  doc.save(filename);
}
