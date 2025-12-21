/**
 * Service de génération de documents PDF
 * Utilise jsPDF pour créer des documents administratifs scolaires
 */
import { jsPDF } from 'jspdf';

class PDFGenerator {
  constructor() {
    this.pageWidth = 210; // A4 width in mm
    this.pageHeight = 297; // A4 height in mm
    this.margin = 20;
  }

  /**
   * Formate une date pour l'affichage
   */
  formatDate(dateValue) {
    if (!dateValue) return '__/__/____';
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '__/__/____';
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      });
    } catch {
      return '__/__/____';
    }
  }

  /**
   * Récupère la date de naissance depuis différents champs possibles
   */
  getBirthDate(student) {
    return student?.date_of_birth || student?.birth_date || student?.birthdate || student?.dateOfBirth;
  }

  /**
   * Génère un certificat de scolarité
   */
  generateCertificatScolarite(data) {
    const { student, school, academicYear } = data;
    const doc = new jsPDF();
    
    // En-tête école
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(school?.name || 'École', this.pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(school?.address || '', this.pageWidth / 2, 38, { align: 'center' });
    doc.text(`${school?.city || ''}, ${school?.country || 'Cameroun'}`, this.pageWidth / 2, 44, { align: 'center' });
    
    // Ligne de séparation
    doc.setLineWidth(0.5);
    doc.line(this.margin, 52, this.pageWidth - this.margin, 52);
    
    // Titre du document
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICAT DE SCOLARITÉ', this.pageWidth / 2, 70, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Année scolaire ${academicYear || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)}`, this.pageWidth / 2, 80, { align: 'center' });
    
    // Corps du certificat
    doc.setFontSize(12);
    const startY = 100;
    const lineHeight = 10;
    
    doc.text('Je soussigné(e), Directeur(trice) de l\'établissement scolaire mentionné ci-dessus,', this.margin, startY);
    doc.text('certifie que :', this.margin, startY + lineHeight);
    
    doc.setFont('helvetica', 'bold');
    const studentName = `${student?.last_name || ''} ${student?.first_name || ''}`.trim() || 'Nom de l\'élève';
    doc.text(`L'élève : ${studentName}`, this.margin, startY + lineHeight * 3);
    
    doc.setFont('helvetica', 'normal');
    const birthDate = this.formatDate(this.getBirthDate(student));
    doc.text(`Né(e) le : ${birthDate}`, this.margin, startY + lineHeight * 4);
    doc.text(`Lieu de naissance : ${student?.birth_place || student?.place_of_birth || '________'}`, this.margin + 80, startY + lineHeight * 4);
    doc.text(`Classe : ${student?.class_name || '________'}`, this.margin, startY + lineHeight * 5);
    doc.text(`Matricule : ${student?.matricule || student?.id?.substring(0, 8) || '________'}`, this.margin, startY + lineHeight * 6);
    
    doc.text('Est régulièrement inscrit(e) dans notre établissement pour l\'année scolaire en cours.', this.margin, startY + lineHeight * 8);
    doc.text('Ce certificat est délivré à l\'intéressé(e) pour servir et valoir ce que de droit.', this.margin, startY + lineHeight * 10);
    
    // Date et signature
    const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Fait à ${school?.city || '________'}, le ${today}`, this.pageWidth - this.margin - 60, startY + lineHeight * 13);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Le(La) Directeur(trice)', this.pageWidth - this.margin - 40, startY + lineHeight * 16);
    
    // Cachet (placeholder)
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    doc.rect(this.margin, startY + lineHeight * 14, 40, 25);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Cachet de l\'école', this.margin + 5, startY + lineHeight * 16);
    
    return doc;
  }

  /**
   * Génère un certificat de fréquentation
   */
  generateCertificatFrequentation(data) {
    const { student, school, academicYear } = data;
    const doc = new jsPDF();
    
    // En-tête école
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(school?.name || 'École', this.pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(school?.address || '', this.pageWidth / 2, 38, { align: 'center' });
    
    // Titre
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICAT DE FRÉQUENTATION', this.pageWidth / 2, 70, { align: 'center' });
    
    // Corps
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const startY = 100;
    const lineHeight = 10;
    
    doc.text('Je soussigné(e), Directeur(trice) de l\'établissement scolaire,', this.margin, startY);
    doc.text('atteste que l\'élève :', this.margin, startY + lineHeight * 2);
    
    doc.setFont('helvetica', 'bold');
    const studentName = `${student?.last_name || ''} ${student?.first_name || ''}`.trim();
    doc.text(studentName || 'Nom de l\'élève', this.margin, startY + lineHeight * 3);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Inscrit(e) en classe de : ${student?.class_name || '________'}`, this.margin, startY + lineHeight * 5);
    doc.text('Fréquente régulièrement et assidûment notre établissement.', this.margin, startY + lineHeight * 7);
    doc.text('En foi de quoi, le présent certificat lui est délivré pour servir et', this.margin, startY + lineHeight * 9);
    doc.text('valoir ce que de droit.', this.margin, startY + lineHeight * 10);
    
    // Date et signature
    const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Fait à ${school?.city || '________'}, le ${today}`, this.pageWidth - this.margin - 60, startY + lineHeight * 13);
    doc.setFont('helvetica', 'bold');
    doc.text('Le(La) Directeur(trice)', this.pageWidth - this.margin - 40, startY + lineHeight * 16);
    
    return doc;
  }

  /**
   * Génère une fiche d'inscription
   */
  generateFicheInscription(data) {
    const { student, school, academicYear } = data;
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(school?.name || 'École', this.pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('FICHE D\'INSCRIPTION', this.pageWidth / 2, 45, { align: 'center' });
    doc.text(`Année scolaire ${academicYear || '____-____'}`, this.pageWidth / 2, 53, { align: 'center' });
    
    // Informations élève
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS DE L\'ÉLÈVE', this.margin, 70);
    
    doc.setLineWidth(0.3);
    doc.line(this.margin, 73, this.pageWidth - this.margin, 73);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const startY = 82;
    const lineHeight = 8;
    
    doc.text(`Nom : ${student?.last_name || '________________________'}`, this.margin, startY);
    doc.text(`Prénom : ${student?.first_name || '________________________'}`, this.pageWidth / 2, startY);
    
    doc.text(`Date de naissance : ${this.formatDate(this.getBirthDate(student))}`, this.margin, startY + lineHeight);
    doc.text(`Lieu de naissance : ${student?.place_of_birth || student?.birth_place || '________________'}`, this.pageWidth / 2, startY + lineHeight);
    
    doc.text(`Sexe : ${student?.gender === 'M' ? 'Masculin' : student?.gender === 'F' ? 'Féminin' : '________'}`, this.margin, startY + lineHeight * 2);
    doc.text(`Nationalité : ${student?.nationality || 'Camerounaise'}`, this.pageWidth / 2, startY + lineHeight * 2);
    
    doc.text(`Classe : ${student?.class_name || '________'}`, this.margin, startY + lineHeight * 3);
    doc.text(`Matricule : ${student?.matricule || student?.id?.substring(0, 8) || '________'}`, this.pageWidth / 2, startY + lineHeight * 3);
    
    // Informations parent/tuteur
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS DU PARENT/TUTEUR', this.margin, startY + lineHeight * 5);
    doc.line(this.margin, startY + lineHeight * 5 + 3, this.pageWidth - this.margin, startY + lineHeight * 5 + 3);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Nom du père/tuteur : ${student?.father_name || '________________________'}`, this.margin, startY + lineHeight * 6.5);
    doc.text(`Profession : ${student?.father_profession || '________________'}`, this.pageWidth / 2, startY + lineHeight * 6.5);
    
    doc.text(`Nom de la mère : ${student?.mother_name || '________________________'}`, this.margin, startY + lineHeight * 7.5);
    doc.text(`Profession : ${student?.mother_profession || '________________'}`, this.pageWidth / 2, startY + lineHeight * 7.5);
    
    doc.text(`Téléphone : ${student?.parent_phone || '________________'}`, this.margin, startY + lineHeight * 8.5);
    doc.text(`Email : ${student?.parent_email || '________________________'}`, this.pageWidth / 2, startY + lineHeight * 8.5);
    
    doc.text(`Adresse : ${student?.address || '________________________________________'}`, this.margin, startY + lineHeight * 9.5);
    
    // Signature
    doc.setFont('helvetica', 'bold');
    doc.text('Signature du parent/tuteur', this.margin, startY + lineHeight * 13);
    doc.text('Cachet et signature de l\'école', this.pageWidth - this.margin - 50, startY + lineHeight * 13);
    
    // Zones de signature
    doc.setDrawColor(150, 150, 150);
    doc.rect(this.margin, startY + lineHeight * 14, 60, 25);
    doc.rect(this.pageWidth - this.margin - 60, startY + lineHeight * 14, 60, 25);
    
    return doc;
  }

  /**
   * Génère une attestation de paiement
   */
  generateAttestationPaiement(data) {
    const { student, school, academicYear, amount, paymentDate } = data;
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(school?.name || 'École', this.pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(18);
    doc.text('ATTESTATION DE PAIEMENT', this.pageWidth / 2, 60, { align: 'center' });
    
    // Corps
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const startY = 90;
    const lineHeight = 10;
    
    doc.text('Je soussigné(e), responsable administratif de l\'établissement,', this.margin, startY);
    doc.text('atteste avoir reçu de :', this.margin, startY + lineHeight * 2);
    
    doc.setFont('helvetica', 'bold');
    const studentName = `${student?.last_name || ''} ${student?.first_name || ''}`.trim();
    doc.text(`Parent/Tuteur de : ${studentName || '________________________'}`, this.margin, startY + lineHeight * 3);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Classe : ${student?.class_name || '________'}`, this.margin, startY + lineHeight * 4);
    
    doc.text(`La somme de : ${amount || '____________'} FCFA`, this.margin, startY + lineHeight * 6);
    doc.text(`En paiement de : Frais de scolarité - ${academicYear || 'Année en cours'}`, this.margin, startY + lineHeight * 7);
    doc.text(`Date du paiement : ${paymentDate || new Date().toLocaleDateString('fr-FR')}`, this.margin, startY + lineHeight * 8);
    
    doc.text('Cette attestation est délivrée pour servir et valoir ce que de droit.', this.margin, startY + lineHeight * 10);
    
    // Date et signature
    const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Fait à ${school?.city || '________'}, le ${today}`, this.pageWidth - this.margin - 60, startY + lineHeight * 13);
    doc.setFont('helvetica', 'bold');
    doc.text('Le(La) Comptable', this.pageWidth - this.margin - 35, startY + lineHeight * 16);
    
    return doc;
  }

  /**
   * Génère une liste d'élèves pour une classe
   */
  generateListeEleves(data) {
    const { students, className, school, academicYear } = data;
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(school?.name || 'École', this.pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text(`LISTE DES ÉLÈVES - ${className || 'Classe'}`, this.pageWidth / 2, 35, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Année scolaire : ${academicYear || '____-____'}`, this.pageWidth / 2, 43, { align: 'center' });
    doc.text(`Effectif total : ${students?.length || 0} élèves`, this.pageWidth / 2, 50, { align: 'center' });
    
    // Table header
    const startY = 60;
    const colWidths = [15, 55, 55, 30, 25];
    const headers = ['N°', 'Nom', 'Prénom', 'Date naiss.', 'Sexe'];
    
    doc.setFillColor(240, 240, 240);
    doc.rect(this.margin, startY - 5, this.pageWidth - 2 * this.margin, 10, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    let xPos = this.margin + 2;
    headers.forEach((header, i) => {
      doc.text(header, xPos, startY + 2);
      xPos += colWidths[i];
    });
    
    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    let yPos = startY + 12;
    
    const studentList = students || [];
    studentList.forEach((student, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 30;
      }
      
      xPos = this.margin + 2;
      doc.text(String(index + 1), xPos, yPos);
      xPos += colWidths[0];
      doc.text(student.last_name || '', xPos, yPos);
      xPos += colWidths[1];
      doc.text(student.first_name || '', xPos, yPos);
      xPos += colWidths[2];
      doc.text(this.formatDate(this.getBirthDate(student)), xPos, yPos);
      xPos += colWidths[3];
      doc.text(student.gender || '', xPos, yPos);
      
      yPos += 7;
    });
    
    // Lignes du tableau
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    for (let i = 0; i <= studentList.length + 1; i++) {
      const y = startY - 5 + i * 7;
      if (y < 280) {
        doc.line(this.margin, y, this.pageWidth - this.margin, y);
      }
    }
    
    return doc;
  }

  /**
   * Génère une liste d'appel
   */
  generateListeAppel(data) {
    const { students, className, school, date } = data;
    const doc = new jsPDF('landscape'); // Format paysage pour plus de colonnes
    
    const pageWidth = 297;
    const pageHeight = 210;
    const margin = 15;
    
    // En-tête
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(school?.name || 'École', margin, 15);
    
    doc.setFontSize(14);
    doc.text(`LISTE D'APPEL - ${className || 'Classe'}`, pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date : ${date || new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin, 15, { align: 'right' });
    
    // Jours de la semaine
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
    const startY = 30;
    const rowHeight = 8;
    const nameColWidth = 80;
    const dayColWidth = 35;
    
    // En-têtes de colonnes
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, startY - 5, pageWidth - 2 * margin, 10, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('N°', margin + 2, startY + 2);
    doc.text('Nom et Prénom', margin + 15, startY + 2);
    
    let xPos = margin + nameColWidth;
    days.forEach(day => {
      doc.text(day, xPos + dayColWidth / 2, startY + 2, { align: 'center' });
      xPos += dayColWidth;
    });
    doc.text('Obs.', xPos + 10, startY + 2);
    
    // Lignes élèves
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    let yPos = startY + 12;
    
    const studentList = students || [];
    studentList.forEach((student, index) => {
      if (yPos > pageHeight - 20) {
        doc.addPage('landscape');
        yPos = 30;
      }
      
      doc.text(String(index + 1), margin + 2, yPos);
      doc.text(`${student.last_name || ''} ${student.first_name || ''}`, margin + 15, yPos);
      
      // Cases pour les jours
      xPos = margin + nameColWidth;
      days.forEach(() => {
        doc.rect(xPos + 5, yPos - 5, dayColWidth - 10, rowHeight);
        xPos += dayColWidth;
      });
      
      yPos += rowHeight;
    });
    
    // Légende
    doc.setFontSize(8);
    doc.text('P = Présent | A = Absent | R = Retard | E = Excusé', margin, pageHeight - 10);
    
    return doc;
  }

  /**
   * Génère un document circulaire/annonce
   */
  generateCirculaire(data) {
    const { school, title, content, date } = data;
    const doc = new jsPDF();
    
    // En-tête officiel
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RÉPUBLIQUE DU CAMEROUN', this.pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Paix - Travail - Patrie', this.pageWidth / 2, 26, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(school?.name || 'École', this.pageWidth / 2, 40, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(school?.address || '', this.pageWidth / 2, 47, { align: 'center' });
    
    // Ligne de séparation
    doc.setLineWidth(1);
    doc.line(this.margin, 55, this.pageWidth - this.margin, 55);
    
    // Titre de la circulaire
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title || 'CIRCULAIRE', this.pageWidth / 2, 70, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date : ${date || new Date().toLocaleDateString('fr-FR')}`, this.pageWidth - this.margin, 80, { align: 'right' });
    
    // Destinataires
    doc.text('À l\'attention des Parents d\'élèves', this.margin, 90);
    
    // Corps du message
    doc.setFontSize(11);
    const startY = 105;
    
    if (content) {
      const lines = doc.splitTextToSize(content, this.pageWidth - 2 * this.margin);
      doc.text(lines, this.margin, startY);
    } else {
      doc.text('Madame, Monsieur,', this.margin, startY);
      doc.text('', this.margin, startY + 15);
      doc.text('[Contenu de la circulaire]', this.margin, startY + 25);
    }
    
    // Signature
    doc.text('La Direction', this.pageWidth - this.margin - 30, 240);
    
    return doc;
  }

  /**
   * Génère le PDF selon le type de document
   */
  generate(documentType, data) {
    switch (documentType) {
      case 'certificat_scolarite':
        return this.generateCertificatScolarite(data);
      case 'certificat_frequentation':
        return this.generateCertificatFrequentation(data);
      case 'fiche_inscription':
        return this.generateFicheInscription(data);
      case 'attestation_paiement':
        return this.generateAttestationPaiement(data);
      case 'liste_eleves':
        return this.generateListeEleves(data);
      case 'liste_appel':
        return this.generateListeAppel(data);
      case 'circulaire':
      case 'convocation':
      case 'avis_important':
      case 'avis_paiement':
        return this.generateCirculaire({ ...data, title: this.getDocumentTitle(documentType) });
      default:
        // Document générique
        return this.generateGenericDocument(data, documentType);
    }
  }

  getDocumentTitle(type) {
    const titles = {
      'circulaire': 'CIRCULAIRE',
      'convocation': 'CONVOCATION - RÉUNION PARENTS-ENSEIGNANTS',
      'avis_important': 'AVIS IMPORTANT',
      'avis_paiement': 'AVIS DE PAIEMENT',
      'reglement_interieur': 'RÈGLEMENT INTÉRIEUR',
      'calendrier_scolaire': 'CALENDRIER SCOLAIRE'
    };
    return titles[type] || type.toUpperCase().replace(/_/g, ' ');
  }

  generateGenericDocument(data, documentType) {
    const { school } = data;
    const doc = new jsPDF();
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(school?.name || 'École', this.pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(18);
    doc.text(this.getDocumentTitle(documentType), this.pageWidth / 2, 60, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, this.pageWidth / 2, 80, { align: 'center' });
    
    doc.text('Ce document est en cours de développement.', this.pageWidth / 2, 120, { align: 'center' });
    
    return doc;
  }

  /**
   * Convertit le PDF en Blob pour l'upload
   */
  toBlob(doc) {
    return doc.output('blob');
  }

  /**
   * Ouvre le PDF dans un nouvel onglet
   */
  preview(doc) {
    const pdfUrl = doc.output('bloburl');
    window.open(pdfUrl, '_blank');
  }

  /**
   * Télécharge le PDF
   */
  download(doc, filename) {
    doc.save(filename || 'document.pdf');
  }
}

export const pdfGenerator = new PDFGenerator();
export default pdfGenerator;
