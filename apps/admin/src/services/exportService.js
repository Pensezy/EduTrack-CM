/**
 * Service d'export Excel et PDF pour les utilisateurs
 *
 * Permet d'exporter les listes d'utilisateurs en fonction du rôle
 */

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Configuration des colonnes par type
const COLUMNS_CONFIG = {
  users: {
    headers: ['Nom complet', 'Email', 'Rôle', 'Téléphone', 'Statut', 'Date création'],
    keys: ['full_name', 'email', 'role', 'phone', 'is_active', 'created_at']
  },
  personnel: {
    headers: ['Nom complet', 'Email', 'Rôle', 'Téléphone', 'Statut', 'Date création'],
    keys: ['full_name', 'email', 'role', 'phone', 'is_active', 'created_at']
  },
  students: {
    headers: ['Matricule', 'Prénom', 'Nom', 'Genre', 'Date naissance', 'Classe'],
    keys: ['registration_number', 'first_name', 'last_name', 'gender', 'birth_date', 'class_name']
  },
  teachers: {
    headers: ['Nom complet', 'Email', 'Téléphone', 'Statut', 'Date création'],
    keys: ['full_name', 'email', 'phone', 'is_active', 'created_at']
  },
  parents: {
    headers: ['Nom complet', 'Email', 'Téléphone', 'Statut', 'Date création'],
    keys: ['full_name', 'email', 'phone', 'is_active', 'created_at']
  },
  secretary: {
    headers: ['Nom complet', 'Email', 'Téléphone', 'Statut', 'Date création'],
    keys: ['full_name', 'email', 'phone', 'is_active', 'created_at']
  }
};

// Labels des rôles
const ROLE_LABELS = {
  admin: 'Administrateur',
  principal: 'Directeur',
  secretary: 'Secrétaire',
  teacher: 'Enseignant',
  parent: 'Parent',
  student: 'Élève'
};

// Labels des statuts
const STATUS_LABELS = {
  active: 'Actif',
  inactive: 'Inactif',
  pending: 'En attente',
  suspended: 'Suspendu'
};

/**
 * Formate une valeur pour l'export
 */
const formatValue = (value, key) => {
  if (value === null || value === undefined) return '-';

  if (key === 'role') return ROLE_LABELS[value] || value;
  if (key === 'status') return STATUS_LABELS[value] || value;
  if (key === 'is_active') return value === true ? 'Actif' : value === false ? 'Inactif' : '-';
  if (key === 'gender') return value === 'M' ? 'Masculin' : value === 'F' ? 'Féminin' : value;
  if (key === 'created_at' || key === 'date_of_birth' || key === 'birth_date') {
    try {
      return new Date(value).toLocaleDateString('fr-FR');
    } catch {
      return value;
    }
  }

  return String(value);
};

/**
 * Prépare les données pour l'export
 * @param {Array} data - Données brutes
 * @param {string} type - Type de données
 * @returns {Array} Données formatées pour export
 */
const prepareData = (data, type) => {
  const config = COLUMNS_CONFIG[type] || COLUMNS_CONFIG.users;

  // Debug: log la structure des données
  if (data.length > 0) {
    console.log('[Export] Keys disponibles:', Object.keys(data[0]));
    console.log('[Export] Type:', type);
    console.log('[Export] Config keys:', config.keys);
  }

  return data.map(item => {
    const row = {};
    config.keys.forEach((key, index) => {
      // Gérer les clés imbriquées (ex: school.name)
      let value = item[key];

      // Si la clé n'existe pas directement, essayer des alternatives
      if (value === undefined || value === null) {
        // Alternatives courantes
        if (key === 'is_active' && item.status !== undefined) {
          value = item.status === 'active';
        } else if (key === 'full_name' && !item.full_name) {
          // Combiner first_name et last_name si full_name n'existe pas
          if (item.first_name || item.last_name) {
            value = `${item.first_name || ''} ${item.last_name || ''}`.trim();
          }
        } else if (key === 'registration_number' && item.matricule) {
          value = item.matricule;
        }
      }

      row[config.headers[index]] = formatValue(value, key);
    });
    return row;
  });
};

/**
 * Export vers Excel (.xlsx)
 * @param {Array} data - Données à exporter
 * @param {string} type - Type de données (users, personnel, students, etc.)
 * @param {string} filename - Nom du fichier sans extension
 * @param {Object} options - Options supplémentaires
 */
export const exportToExcel = (data, type, filename, options = {}) => {
  const { schoolName = 'EduTrack', filterRole = null } = options;

  console.log('[ExportExcel] Données reçues:', data?.length, 'éléments');
  console.log('[ExportExcel] Type:', type);
  console.log('[ExportExcel] FilterRole:', filterRole);

  if (!data || data.length === 0) {
    console.error('[ExportExcel] Aucune donnée à exporter');
    throw new Error('Aucune donnée à exporter');
  }

  // Filtrer par rôle si spécifié
  let filteredData = data;
  if (filterRole) {
    filteredData = data.filter(item => item.role === filterRole);
    console.log('[ExportExcel] Après filtrage:', filteredData.length, 'éléments');
  }

  // Préparer les données
  const preparedData = prepareData(filteredData, type);
  console.log('[ExportExcel] Données préparées:', preparedData.length, 'lignes');

  if (preparedData.length > 0) {
    console.log('[ExportExcel] Premier enregistrement:', preparedData[0]);
  }

  // Créer le workbook
  const wb = XLSX.utils.book_new();

  // Créer la feuille avec les données
  // S'assurer que toutes les colonnes sont présentes même si vides
  const config = COLUMNS_CONFIG[type] || COLUMNS_CONFIG.users;
  const ws = XLSX.utils.json_to_sheet(preparedData, { header: config.headers });

  // Ajuster la largeur des colonnes
  const colWidths = config.headers.map(header => ({
    wch: Math.max(header.length, 15)
  }));
  ws['!cols'] = colWidths;

  // Nom de la feuille
  const sheetName = filterRole ? ROLE_LABELS[filterRole] || type : type;
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));

  // Générer le fichier
  const fullFilename = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fullFilename);

  return fullFilename;
};

/**
 * Export vers PDF
 * @param {Array} data - Données à exporter
 * @param {string} type - Type de données (users, personnel, students, etc.)
 * @param {string} filename - Nom du fichier sans extension
 * @param {Object} options - Options supplémentaires
 */
export const exportToPDF = (data, type, filename, options = {}) => {
  const { schoolName = 'EduTrack', filterRole = null, title = null } = options;

  // Filtrer par rôle si spécifié
  let filteredData = data;
  if (filterRole) {
    filteredData = data.filter(item => item.role === filterRole);
  }

  const config = COLUMNS_CONFIG[type] || COLUMNS_CONFIG.users;

  // Créer le document PDF
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Titre
  const documentTitle = title || `Liste des ${filterRole ? ROLE_LABELS[filterRole] + 's' : type}`;
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(documentTitle, 14, 20);

  // Sous-titre avec école et date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${schoolName} - Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);
  doc.text(`Total: ${filteredData.length} enregistrement(s)`, 14, 34);

  // Préparer les données du tableau
  const tableData = filteredData.map(item =>
    config.keys.map(key => formatValue(item[key], key))
  );

  // Créer le tableau avec autoTable
  autoTable(doc, {
    head: [config.headers],
    body: tableData,
    startY: 40,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [79, 70, 229], // Indigo
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 250],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
    },
    didDrawPage: (pageData) => {
      // Pied de page
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.text(
        `Page ${pageData.pageNumber} sur ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    },
  });

  // Sauvegarder
  const fullFilename = `${filename}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fullFilename);

  return fullFilename;
};

/**
 * Génère un modèle Excel vide pour l'import
 * @param {string} type - Type de données (users, personnel, students, etc.)
 * @param {string} filename - Nom du fichier
 */
export const generateImportTemplate = (type, filename) => {
  const templates = {
    users: {
      headers: ['Nom complet*', 'Email*', 'Rôle*', 'Téléphone', 'École ID'],
      example: ['Jean Dupont', 'jean.dupont@example.com', 'teacher', '677123456', 'uuid-de-lecole'],
      instructions: [
        'Rôles valides: admin, principal, secretary, teacher, parent, student',
        'Les champs marqués * sont obligatoires',
        'Format téléphone: 6XXXXXXXX (9 chiffres)'
      ]
    },
    personnel: {
      headers: ['Nom complet*', 'Email*', 'Rôle*', 'Téléphone', 'Adresse'],
      example: ['Marie Martin', 'marie.martin@example.com', 'secretary', '655987654', 'Douala, Cameroun'],
      instructions: [
        'Rôles valides: secretary, teacher',
        'Les champs marqués * sont obligatoires',
        'Format téléphone: 6XXXXXXXX (9 chiffres)'
      ]
    },
    students: {
      headers: ['Nom complet*', 'Date naissance*', 'Genre*', 'Classe ID*', 'Parent Email', 'Adresse'],
      example: ['Pierre Kamga', '2010-05-15', 'M', 'uuid-de-la-classe', 'parent@example.com', 'Yaoundé'],
      instructions: [
        'Genre: M ou F',
        'Date format: AAAA-MM-JJ (ex: 2010-05-15)',
        'Les champs marqués * sont obligatoires',
        'Parent Email: si fourni, un compte parent sera créé/lié'
      ]
    },
    teachers: {
      headers: ['Nom complet*', 'Email*', 'Téléphone', 'Spécialité'],
      example: ['Paul Ndjock', 'paul.ndjock@example.com', '699112233', 'Mathématiques'],
      instructions: [
        'Les champs marqués * sont obligatoires',
        'Format téléphone: 6XXXXXXXX (9 chiffres)'
      ]
    },
    parents: {
      headers: ['Nom complet*', 'Email*', 'Téléphone*', 'Adresse'],
      example: ['Alice Mbarga', 'alice.mbarga@example.com', '677445566', 'Bafoussam'],
      instructions: [
        'Les champs marqués * sont obligatoires',
        'Format téléphone: 6XXXXXXXX (9 chiffres)',
        'Les enfants seront liés via leur matricule après import'
      ]
    },
    secretary: {
      headers: ['Nom complet*', 'Email*', 'Téléphone', 'Adresse'],
      example: ['Sophie Nguema', 'sophie.nguema@example.com', '691234567', 'Yaoundé, Cameroun'],
      instructions: [
        'Les champs marqués * sont obligatoires',
        'Format téléphone: 6XXXXXXXX (9 chiffres)',
        'Le rôle secrétaire sera automatiquement attribué'
      ]
    }
  };

  const template = templates[type] || templates.users;

  // Créer le workbook
  const wb = XLSX.utils.book_new();

  // Feuille de données
  const ws = XLSX.utils.aoa_to_sheet([
    template.headers,
    template.example
  ]);

  // Ajuster largeur des colonnes
  ws['!cols'] = template.headers.map(() => ({ wch: 25 }));

  XLSX.utils.book_append_sheet(wb, ws, 'Données');

  // Feuille d'instructions
  const wsInstructions = XLSX.utils.aoa_to_sheet([
    ['INSTRUCTIONS D\'IMPORT'],
    [''],
    ...template.instructions.map(i => [i]),
    [''],
    ['IMPORTANT:'],
    ['- Ne modifiez pas les en-têtes de la première ligne'],
    ['- Supprimez la ligne d\'exemple avant l\'import'],
    ['- Chaque ligne représente un utilisateur à créer'],
    ['- Maximum 100 utilisateurs par import']
  ]);

  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

  // Sauvegarder
  const fullFilename = `modele_import_${type}.xlsx`;
  XLSX.writeFile(wb, fullFilename);

  return fullFilename;
};

/**
 * Parse un fichier Excel pour l'import
 * @param {File} file - Fichier Excel
 * @param {string} type - Type attendu
 * @returns {Promise<{data: Array, errors: Array}>}
 */
export const parseImportFile = async (file, type) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Lire la première feuille
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convertir en JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          resolve({ data: [], errors: ['Le fichier est vide ou ne contient que les en-têtes'] });
          return;
        }

        // Headers (première ligne)
        const headers = jsonData[0];
        const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''));

        // Valider et parser les données
        const parsedData = [];
        const errors = [];

        rows.forEach((row, index) => {
          const rowData = {};
          let hasError = false;

          headers.forEach((header, colIndex) => {
            const cleanHeader = header.replace('*', '').toLowerCase().replace(/\s+/g, '_');
            rowData[cleanHeader] = row[colIndex];
          });

          // Validation basique
          if (!rowData.nom_complet) {
            errors.push(`Ligne ${index + 2}: Nom complet manquant`);
            hasError = true;
          }

          if (type !== 'students' && !rowData.email) {
            errors.push(`Ligne ${index + 2}: Email manquant`);
            hasError = true;
          }

          if (!hasError) {
            parsedData.push(rowData);
          }
        });

        // Limite de 100
        if (parsedData.length > 100) {
          errors.push('Maximum 100 utilisateurs par import. Seuls les 100 premiers seront traités.');
          parsedData.splice(100);
        }

        resolve({ data: parsedData, errors });
      } catch (err) {
        reject(new Error('Erreur lors de la lecture du fichier: ' + err.message));
      }
    };

    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
    reader.readAsArrayBuffer(file);
  });
};

export default {
  exportToExcel,
  exportToPDF,
  generateImportTemplate,
  parseImportFile
};
