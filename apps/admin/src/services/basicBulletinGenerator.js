/**
 * Service de génération de bulletins PDF BASIQUES
 * Pour App Core gratuite uniquement
 *
 * Caractéristiques:
 * - SANS logo école
 * - SANS personnalisation (couleurs fixes, police standard)
 * - SANS design professionnel (layout simple)
 * - Avec bannière upgrade vers App Académique
 *
 * @module basicBulletinGenerator
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Génère un bulletin PDF basique pour un élève
 * @param {Object} student - Données de l'élève
 * @param {Array} grades - Notes de l'élève
 * @param {Object} school - Données de l'école
 * @param {string} period - Période (Trimestre 1, 2, 3, etc.)
 * @returns {jsPDF} Document PDF
 */
export const generateBasicBulletin = (student, grades, school, period) => {
  const doc = new jsPDF();

  // Couleurs basiques (noir et gris uniquement)
  const BLACK = [0, 0, 0];
  const GRAY = [100, 100, 100];
  const LIGHT_GRAY = [200, 200, 200];

  let yPosition = 20;

  // ============================================================================
  // HEADER SIMPLE (SANS LOGO)
  // ============================================================================
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLACK);
  doc.text(`École: ${school.name}`, 105, yPosition, { align: 'center' });

  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Bulletin Scolaire - ${period}`, 105, yPosition, { align: 'center' });

  yPosition += 5;
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text('Version Gratuite - Sans Personnalisation', 105, yPosition, { align: 'center' });

  // Ligne de séparation
  yPosition += 5;
  doc.setDrawColor(...LIGHT_GRAY);
  doc.line(20, yPosition, 190, yPosition);

  // ============================================================================
  // INFORMATIONS ÉLÈVE
  // ============================================================================
  yPosition += 10;
  doc.setFontSize(10);
  doc.setTextColor(...BLACK);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMATIONS ÉLÈVE', 20, yPosition);

  yPosition += 7;
  doc.setFont('helvetica', 'normal');
  doc.text(`Nom et Prénom: ${student.full_name || 'N/A'}`, 20, yPosition);

  yPosition += 6;
  doc.text(`Classe: ${student.class_name || 'N/A'}`, 20, yPosition);

  yPosition += 6;
  doc.text(`Matricule: ${student.matricule || 'N/A'}`, 20, yPosition);

  // ============================================================================
  // TABLEAU DES NOTES (Simple)
  // ============================================================================
  yPosition += 10;

  // Préparer les données du tableau
  const tableData = grades.map(grade => [
    grade.subject_name || 'N/A',
    grade.grade?.toFixed(2) || '-',
    grade.coefficient || 1,
    ((grade.grade || 0) * (grade.coefficient || 1)).toFixed(2)
  ]);

  // Calculer moyenne générale
  const totalGrade = grades.reduce((sum, g) => sum + ((g.grade || 0) * (g.coefficient || 1)), 0);
  const totalCoef = grades.reduce((sum, g) => sum + (g.coefficient || 1), 0);
  const average = totalCoef > 0 ? (totalGrade / totalCoef).toFixed(2) : '0.00';

  // Générer le tableau avec autoTable
  doc.autoTable({
    startY: yPosition,
    head: [['Matière', 'Note /20', 'Coef.', 'Total']],
    body: tableData,
    foot: [['MOYENNE GÉNÉRALE', '', '', `${average}/20`]],
    theme: 'plain',
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: BLACK,
      lineColor: LIGHT_GRAY,
      lineWidth: 0.5
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: BLACK,
      fontStyle: 'bold',
      halign: 'center'
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: BLACK,
      fontStyle: 'bold',
      halign: 'right'
    },
    columnStyles: {
      0: { cellWidth: 80, halign: 'left' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 30, halign: 'center' }
    }
  });

  // ============================================================================
  // CLASSEMENT ET MENTION
  // ============================================================================
  yPosition = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');

  // Rang
  if (student.rank) {
    doc.text(`Rang: ${student.rank}`, 20, yPosition);
  }

  // Mention (calculée selon la moyenne)
  yPosition += 6;
  let mention = 'Passable';
  if (average >= 16) mention = 'Très Bien';
  else if (average >= 14) mention = 'Bien';
  else if (average >= 12) mention = 'Assez Bien';

  doc.text(`Mention: ${mention}`, 20, yPosition);

  // ============================================================================
  // BANNIÈRE UPGRADE (CRITIQUE pour l'upsell!)
  // ============================================================================
  yPosition += 15;

  // Rectangle de fond
  doc.setFillColor(250, 240, 230); // Beige clair
  doc.setDrawColor(...LIGHT_GRAY);
  doc.rect(20, yPosition, 170, 25, 'FD');

  yPosition += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(150, 80, 0); // Orange foncé
  doc.text('🔒 PASSEZ À LA VERSION PROFESSIONNELLE', 25, yPosition);

  yPosition += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BLACK);
  doc.text('Avec App Académique, obtenez:', 25, yPosition);

  yPosition += 5;
  doc.text('✓ Logo de votre école sur les bulletins', 30, yPosition);

  yPosition += 4;
  doc.text('✓ Personnalisation complète (couleurs, design)', 30, yPosition);

  yPosition += 4;
  doc.text('✓ Statistiques avancées et graphiques', 30, yPosition);

  yPosition += 4;
  doc.text('✓ Élèves illimités (jusqu\'à 500)', 30, yPosition);

  yPosition += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(150, 80, 0);
  doc.text('Prix: 75 000 FCFA/an - Contactez-nous pour upgrader', 25, yPosition);

  // ============================================================================
  // FOOTER
  // ============================================================================
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text('Généré par EduTrack CM - Version Gratuite (App Core)', 105, 285, { align: 'center' });
  doc.text(`Date de génération: ${new Date().toLocaleDateString('fr-FR')}`, 105, 290, { align: 'center' });

  return doc;
};

/**
 * Génère et télécharge un bulletin basique
 * @param {Object} student - Données de l'élève
 * @param {Array} grades - Notes de l'élève
 * @param {Object} school - Données de l'école
 * @param {string} period - Période
 */
export const downloadBasicBulletin = (student, grades, school, period) => {
  const doc = generateBasicBulletin(student, grades, school, period);
  const filename = `Bulletin_${student.full_name?.replace(/\s+/g, '_')}_${period.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
};

/**
 * Génère un bulletin basique et retourne le blob
 * @param {Object} student - Données de l'élève
 * @param {Array} grades - Notes de l'élève
 * @param {Object} school - Données de l'école
 * @param {string} period - Période
 * @returns {Blob} Blob PDF
 */
export const generateBasicBulletinBlob = (student, grades, school, period) => {
  const doc = generateBasicBulletin(student, grades, school, period);
  return doc.output('blob');
};
