import React, { useState, useRef } from 'react';
import DOMPurify from 'dompurify';
import Icon from '../../../components/AppIcon';
import {
  computeSubjectAverage,
  computeOverallAverage,
  computeRank,
  getMention,
  getMentionHonorifique,
  detectLanguageSystem,
  detectSchoolLevel
} from '../../../utils/grading';
import { getSubjectCoefficient } from '../../../utils/subjectCoefficients';

/**
 * Composant de génération de bulletin scolaire
 * Conforme au système camerounais (Francophone & Anglophone)
 */
const ReportCard = ({ 
  student, 
  grades = [], 
  conduct = null, 
  classData, 
  sequence = 1, 
  trimester = 1,
  allStudentsAverages = [],
  onClose 
}) => {
  const reportRef = useRef(null);
  const [printing, setPrinting] = useState(false);

  const schoolType = classData?.school_type || 'secondaire';
  const series = classData?.series || null;
  const lang = detectLanguageSystem(schoolType);
  const level = detectSchoolLevel(schoolType);
  const scale = (level === 'primaire' || level === 'maternelle') ? 10 : 20;

  // Regrouper les notes par matière
  const gradesBySubject = {};
  grades.forEach(g => {
    const subj = g.subject || g.subject_name || 'Autre';
    if (!gradesBySubject[subj]) gradesBySubject[subj] = [];
    gradesBySubject[subj].push(g);
  });

  // Calculer moyennes par matière avec coefficients
  const subjectsData = Object.entries(gradesBySubject).map(([name, subjectGrades]) => {
    const average = computeSubjectAverage(subjectGrades, { schoolType, targetScale: scale });
    const coefficient = getSubjectCoefficient(name, schoolType, series);
    const mentionInfo = getMention(average, schoolType);
    
    return {
      name,
      grades: subjectGrades,
      average,
      coefficient,
      mention: mentionInfo.mention,
      code: mentionInfo.code || mentionInfo.grade || mentionInfo.letter
    };
  });

  // Moyenne générale pondérée
  const overallAverage = computeOverallAverage(subjectsData);
  const overallMention = getMention(overallAverage, schoolType);
  const honorMention = getMentionHonorifique(overallAverage, conduct?.average, schoolType);

  // Rang dans la classe
  const rankInfo = computeRank(overallAverage, allStudentsAverages);

  // Note de conduite
  const conductAverage = conduct?.average || 0;
  const conductMention = getMention(conductAverage, schoolType);

  // Imprimer le bulletin
  const handlePrint = () => {
    setPrinting(true);
    const printContent = reportRef.current;
    const printWindow = window.open('', '_blank');

    // Sanitize le contenu HTML pour prévenir les attaques XSS
    const sanitizedContent = DOMPurify.sanitize(printContent.innerHTML, {
      ALLOWED_TAGS: [
        'div', 'span', 'p', 'h1', 'h2', 'h3', 'table', 'thead', 'tbody', 'tfoot',
        'tr', 'th', 'td', 'strong', 'em', 'br', 'ul', 'ol', 'li'
      ],
      ALLOWED_ATTR: ['class', 'colspan', 'rowspan']
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bulletin - ${DOMPurify.sanitize(student?.name || 'Élève')}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Times New Roman', serif; font-size: 11pt; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 15px; }
            .header h1 { font-size: 14pt; }
            .header h2 { font-size: 12pt; color: #333; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; }
            .info-item { display: flex; gap: 5px; }
            .info-label { font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { border: 1px solid #000; padding: 5px 8px; text-align: center; }
            th { background: #f0f0f0; font-weight: bold; }
            .subject-name { text-align: left; }
            .summary { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px; }
            .summary-box { border: 1px solid #000; padding: 10px; }
            .summary-title { font-weight: bold; border-bottom: 1px solid #000; margin-bottom: 8px; padding-bottom: 5px; }
            .signature { margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; text-align: center; }
            .signature-line { border-top: 1px solid #000; margin-top: 40px; padding-top: 5px; }
            .honor { background: #ffffd0; padding: 5px; text-align: center; font-weight: bold; margin: 10px 0; border: 2px solid #cca300; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${sanitizedContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      setPrinting(false);
    }, 250);
  };

  const trimesterLabel = lang === 'anglophone' 
    ? `Term ${trimester}` 
    : `${trimester}${trimester === 1 ? 'er' : 'ème'} Trimestre`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Toolbar */}
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg">
            📄 Bulletin de Notes — {student?.name}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={printing}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
            >
              {printing ? <Icon name="Loader2" className="animate-spin" size={16} /> : <Icon name="Printer" size={16} />}
              Imprimer / PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <Icon name="X" size={20} />
            </button>
          </div>
        </div>

        {/* Contenu du bulletin */}
        <div ref={reportRef} className="p-8">
          {/* En-tête */}
          <div className="header text-center border-b-2 border-black pb-4 mb-4">
            <p className="text-sm">RÉPUBLIQUE DU CAMEROUN / REPUBLIC OF CAMEROON</p>
            <p className="text-xs text-gray-600">Paix - Travail - Patrie / Peace - Work - Fatherland</p>
            <h1 className="text-xl font-bold mt-3">{classData?.school || 'Établissement'}</h1>
            <h2 className="text-lg mt-2">
              {lang === 'anglophone' ? 'REPORT CARD' : 'BULLETIN DE NOTES'}
            </h2>
            <p className="text-sm mt-1">{trimesterLabel} — Séquence {sequence}</p>
          </div>

          {/* Informations élève */}
          <div className="info-grid grid grid-cols-2 gap-4 mb-6 text-sm">
            <div><span className="font-bold">Nom / Name:</span> {student?.name}</div>
            <div><span className="font-bold">Matricule:</span> {student?.matricule}</div>
            <div><span className="font-bold">Classe / Class:</span> {classData?.name}</div>
            <div><span className="font-bold">Effectif:</span> {allStudentsAverages.length} élèves</div>
          </div>

          {/* Tableau des notes */}
          <table className="w-full border-collapse text-sm mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-left">Matière / Subject</th>
                <th className="border border-black p-2 w-16">Coef</th>
                <th className="border border-black p-2 w-20">Moy/{scale}</th>
                <th className="border border-black p-2 w-20">Moy×Coef</th>
                <th className="border border-black p-2">Mention</th>
              </tr>
            </thead>
            <tbody>
              {subjectsData.map((subj, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-2 text-left">{subj.name}</td>
                  <td className="border border-black p-2 text-center">{subj.coefficient}</td>
                  <td className="border border-black p-2 text-center font-bold">{subj.average}</td>
                  <td className="border border-black p-2 text-center">{(subj.average * subj.coefficient).toFixed(2)}</td>
                  <td className="border border-black p-2 text-center text-xs">
                    {lang === 'anglophone' && subj.code ? `${subj.code} — ` : ''}{subj.mention}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold">
                <td className="border border-black p-2" colSpan={2}>TOTAL</td>
                <td className="border border-black p-2 text-center">
                  {subjectsData.reduce((a, b) => a + b.coefficient, 0)}
                </td>
                <td className="border border-black p-2 text-center">
                  {subjectsData.reduce((a, b) => a + (b.average * b.coefficient), 0).toFixed(2)}
                </td>
                <td className="border border-black p-2"></td>
              </tr>
            </tfoot>
          </table>

          {/* Mention honorifique */}
          {honorMention && (
            <div className="honor bg-yellow-100 border-2 border-yellow-500 p-3 text-center font-bold mb-4">
              🏆 {honorMention}
            </div>
          )}

          {/* Résumé */}
          <div className="summary grid grid-cols-2 gap-6">
            <div className="summary-box border border-black p-4">
              <div className="summary-title font-bold border-b border-black pb-2 mb-3">
                {lang === 'anglophone' ? 'ACADEMIC RESULTS' : 'RÉSULTATS ACADÉMIQUES'}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Moyenne Générale:</span>
                  <span className="font-bold">{overallAverage}/{scale}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mention:</span>
                  <span className="font-bold">{overallMention.mention}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rang:</span>
                  <span className="font-bold">{rankInfo.rank}{rankInfo.suffix} / {rankInfo.total}</span>
                </div>
              </div>
            </div>

            <div className="summary-box border border-black p-4">
              <div className="summary-title font-bold border-b border-black pb-2 mb-3">
                {lang === 'anglophone' ? 'CONDUCT / BEHAVIOR' : 'VIE SCOLAIRE'}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Note de Conduite:</span>
                  <span className="font-bold">{conductAverage}/20</span>
                </div>
                <div className="flex justify-between">
                  <span>Appréciation:</span>
                  <span className="font-bold">{conduct?.appreciation || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Absences:</span>
                  <span>{student?.attendance?.absent || 0} jour(s)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Observation du conseil de classe */}
          <div className="mt-6 border border-black p-4">
            <div className="font-bold mb-2">Observation du Conseil de Classe:</div>
            <div className="min-h-[40px] border-b border-dashed border-gray-400">
              {conduct?.comment || ''}
            </div>
          </div>

          {/* Signatures */}
          <div className="signature grid grid-cols-3 gap-8 mt-8 text-sm">
            <div className="text-center">
              <p className="font-bold">Le Professeur Principal</p>
              <div className="signature-line border-t border-black mt-12 pt-2">
                Signature
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold">Le Parent / Tuteur</p>
              <div className="signature-line border-t border-black mt-12 pt-2">
                Signature
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold">Le Chef d'Établissement</p>
              <div className="signature-line border-t border-black mt-12 pt-2">
                Signature et Cachet
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
