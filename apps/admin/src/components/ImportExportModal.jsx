/**
 * Modal d'Import/Export pour les utilisateurs
 *
 * Permet d'exporter en Excel/PDF et d'importer depuis un fichier Excel
 * Gère les restrictions selon l'application (Core vs Académique)
 */

import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  Check,
  Loader2,
  Info,
  Lock,
  Crown,
  ArrowRight
} from 'lucide-react';
import {
  exportToExcel,
  exportToPDF,
  generateImportTemplate,
  parseImportFile
} from '../services/exportService';

const ROLE_OPTIONS = [
  { value: '', label: 'Tous les rôles' },
  { value: 'admin', label: 'Administrateurs' },
  { value: 'principal', label: 'Directeurs' },
  { value: 'secretary', label: 'Secrétaires' },
  { value: 'teacher', label: 'Enseignants' },
  { value: 'parent', label: 'Parents' },
  { value: 'student', label: 'Élèves' }
];

// Options complètes pour l'import (selon le contexte)
const TYPE_OPTIONS = [
  { value: 'users', label: 'Utilisateurs (tous types)' },
  { value: 'students', label: 'Élèves' },
  { value: 'teachers', label: 'Enseignants' },
  { value: 'secretary', label: 'Secrétaires' },
  { value: 'parents', label: 'Parents' },
  { value: 'personnel', label: 'Personnel (enseignants + secrétaires)' }
];

// Limites de l'App Core gratuite
const CORE_LIMITS = {
  teachers: 3,
  secretary: 0 // Pas de secrétaire avec App Core
};

export default function ImportExportModal({
  isOpen,
  onClose,
  mode = 'export', // 'export' ou 'import'
  data = [],
  type = 'users',
  schoolName = 'EduTrack',
  onImport = null, // Callback pour l'import: (parsedData) => Promise
  allowedTypes = null, // Types autorisés pour l'import, null = tous
  context = 'users' // Contexte: 'users', 'personnel', 'students' pour adapter la liste déroulante
}) {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedType, setSelectedType] = useState(type);
  const [exportFormat, setExportFormat] = useState('excel');
  const [loading, setLoading] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importErrors, setImportErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const [hasAcademicApp, setHasAcademicApp] = useState(false);
  const [currentTeacherCount, setCurrentTeacherCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const fileInputRef = useRef(null);

  // Vérifier l'accès à App Académique et compter les enseignants
  useEffect(() => {
    const checkAccess = async () => {
      if (user?.role === 'principal' && user?.current_school_id) {
        try {
          const supabase = getSupabaseClient();

          // Vérifier App Académique
          const { data: subs } = await supabase
            .from('school_subscriptions')
            .select('id, app:apps(slug)')
            .eq('school_id', user.current_school_id)
            .in('status', ['active', 'trial']);

          if (subs) {
            const hasAcademic = subs.some(sub =>
              sub.app?.slug === 'academic' || sub.app?.slug === 'app-academic'
            );
            setHasAcademicApp(hasAcademic);
          }

          // Compter les enseignants actuels
          const { count } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('current_school_id', user.current_school_id)
            .eq('role', 'teacher');

          setCurrentTeacherCount(count || 0);
        } catch (err) {
          console.error('Error checking access:', err);
        }
      } else if (user?.role === 'admin') {
        setHasAcademicApp(true);
      }
    };

    if (isOpen) {
      checkAccess();
    }
  }, [isOpen, user]);

  // Obtenir les types disponibles selon le contexte et le rôle
  const getAvailableTypes = () => {
    // Pour les admins, tout est disponible
    if (user?.role === 'admin') {
      return TYPE_OPTIONS;
    }

    // Pour les directeurs
    if (user?.role === 'principal') {
      let types = [];

      // Toujours disponible
      types.push({ value: 'students', label: 'Élèves' });
      types.push({ value: 'parents', label: 'Parents' });

      // Enseignants avec indication de limite si App Core
      if (hasAcademicApp) {
        types.push({ value: 'teachers', label: 'Enseignants' });
      } else {
        const remaining = CORE_LIMITS.teachers - currentTeacherCount;
        types.push({
          value: 'teachers',
          label: `Enseignants (${remaining > 0 ? remaining : 0} restant${remaining > 1 ? 's' : ''})`,
          restricted: true,
          limit: CORE_LIMITS.teachers,
          current: currentTeacherCount
        });
      }

      // Secrétaires seulement avec App Académique
      if (hasAcademicApp) {
        types.push({ value: 'secretary', label: 'Secrétaires' });
        types.push({ value: 'personnel', label: 'Personnel (enseignants + secrétaires)' });
      } else {
        types.push({
          value: 'secretary',
          label: 'Secrétaires 🔒',
          blocked: true
        });
      }

      return types;
    }

    // Par défaut, retourner les types autorisés ou tous
    return allowedTypes
      ? TYPE_OPTIONS.filter(t => allowedTypes.includes(t.value))
      : TYPE_OPTIONS;
  };

  if (!isOpen) return null;

  const handleExport = async () => {
    setLoading(true);
    try {
      const filename = `${selectedType}_${schoolName.replace(/\s+/g, '_')}`;
      const options = {
        schoolName,
        filterRole: selectedRole || null,
        title: selectedRole
          ? `Liste des ${ROLE_OPTIONS.find(r => r.value === selectedRole)?.label || selectedRole}`
          : null
      };

      if (exportFormat === 'excel') {
        exportToExcel(data, selectedType, filename, options);
      } else {
        exportToPDF(data, selectedType, filename, options);
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Export error:', error);
      setImportErrors(['Erreur lors de l\'export: ' + error.message]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    try {
      generateImportTemplate(selectedType, `modele_import_${selectedType}`);
    } catch (error) {
      console.error('Template error:', error);
      setImportErrors(['Erreur lors de la génération du modèle']);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setImportErrors(['Veuillez sélectionner un fichier Excel (.xlsx ou .xls)']);
      return;
    }

    setImportFile(file);
    setImportErrors([]);
    setLoading(true);

    try {
      const { data: parsedData, errors } = await parseImportFile(file, selectedType);
      setImportPreview(parsedData);
      setImportErrors(errors);
    } catch (error) {
      setImportErrors([error.message]);
      setImportPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importPreview || importPreview.length === 0 || !onImport) return;

    // Vérifications pour les directeurs sans App Académique
    if (user?.role === 'principal' && !hasAcademicApp) {
      // Blocage complet pour les secrétaires
      if (selectedType === 'secretary') {
        setUpgradeMessage('L\'import de secrétaires nécessite l\'App Académique.');
        setShowUpgradeModal(true);
        return;
      }

      // Vérification de la limite d'enseignants
      if (selectedType === 'teachers') {
        const remaining = CORE_LIMITS.teachers - currentTeacherCount;
        if (importPreview.length > remaining) {
          if (remaining <= 0) {
            setUpgradeMessage(`Vous avez atteint la limite de ${CORE_LIMITS.teachers} enseignants avec l'App Core gratuite. Passez à l'App Académique pour ajouter des enseignants illimités.`);
          } else {
            setUpgradeMessage(`Vous ne pouvez importer que ${remaining} enseignant(s) de plus (limite de ${CORE_LIMITS.teachers} avec l'App Core). Vous essayez d'en importer ${importPreview.length}.`);
          }
          setShowUpgradeModal(true);
          return;
        }
      }

      // Vérification pour le personnel (peut contenir des secrétaires)
      if (selectedType === 'personnel') {
        // Vérifier si les données contiennent des secrétaires
        const hasSecretaries = importPreview.some(row =>
          row.role?.toLowerCase() === 'secretary' || row.role?.toLowerCase() === 'secrétaire'
        );
        if (hasSecretaries) {
          setUpgradeMessage('Votre fichier contient des secrétaires. L\'import de secrétaires nécessite l\'App Académique.');
          setShowUpgradeModal(true);
          return;
        }

        // Vérifier la limite d'enseignants dans le personnel
        const teachersInFile = importPreview.filter(row =>
          row.role?.toLowerCase() === 'teacher' || row.role?.toLowerCase() === 'enseignant'
        ).length;
        const remaining = CORE_LIMITS.teachers - currentTeacherCount;
        if (teachersInFile > remaining) {
          setUpgradeMessage(`Votre fichier contient ${teachersInFile} enseignant(s), mais vous ne pouvez en importer que ${remaining > 0 ? remaining : 0} de plus (limite de ${CORE_LIMITS.teachers} avec l'App Core).`);
          setShowUpgradeModal(true);
          return;
        }
      }
    }

    setLoading(true);
    try {
      await onImport(importPreview, selectedType);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Import error:', error);
      setImportErrors(['Erreur lors de l\'import: ' + error.message]);
    } finally {
      setLoading(false);
    }
  };

  const resetImport = () => {
    setImportFile(null);
    setImportPreview(null);
    setImportErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {mode === 'export' ? (
                  <>
                    <Download className="h-5 w-5 text-indigo-600" />
                    Exporter les données
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-indigo-600" />
                    Importer des données
                  </>
                )}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            {/* Success message */}
            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <Check className="h-5 w-5" />
                  <span>{mode === 'export' ? 'Export réussi !' : 'Import réussi !'}</span>
                </div>
              </div>
            )}

            {/* Errors */}
            {importErrors.length > 0 && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    {importErrors.map((error, index) => (
                      <p key={index}>{error}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {mode === 'export' ? (
              /* Export Mode */
              <div className="space-y-4">
                {/* Type de données */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de données
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {TYPE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtre par rôle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrer par rôle
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {ROLE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Format d'export */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format d'export
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setExportFormat('excel')}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                        exportFormat === 'excel'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FileSpreadsheet className="h-5 w-5" />
                      <span className="font-medium">Excel</span>
                    </button>
                    <button
                      onClick={() => setExportFormat('pdf')}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                        exportFormat === 'pdf'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">PDF</span>
                    </button>
                  </div>
                </div>

                {/* Résumé */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>{data.filter(d => !selectedRole || d.role === selectedRole).length}</strong> enregistrement(s) seront exportés
                      </p>
                      {selectedRole && (
                        <p className="mt-1">
                          Filtre actif : {ROLE_OPTIONS.find(r => r.value === selectedRole)?.label}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Import Mode */
              <div className="space-y-4">
                {/* Avertissement App Core */}
                {user?.role === 'principal' && !hasAcademicApp && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Limites App Core</p>
                        <p className="mt-1">
                          Max {CORE_LIMITS.teachers} enseignants ({currentTeacherCount} actuellement) • Pas de secrétaire
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Type de données */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de données à importer
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      const selectedOpt = getAvailableTypes().find(t => t.value === e.target.value);
                      // Empêcher la sélection d'un type bloqué
                      if (selectedOpt?.blocked) {
                        setUpgradeMessage('L\'import de secrétaires nécessite l\'App Académique.');
                        setShowUpgradeModal(true);
                        return;
                      }
                      setSelectedType(e.target.value);
                      resetImport();
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {getAvailableTypes().map(option => (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={option.blocked}
                        className={option.blocked ? 'text-gray-400' : ''}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {/* Indication visuelle pour les restrictions */}
                  {user?.role === 'principal' && !hasAcademicApp && selectedType === 'teachers' && (
                    <p className="mt-1 text-xs text-orange-600">
                      ⚠️ Limite: {CORE_LIMITS.teachers - currentTeacherCount > 0 ? CORE_LIMITS.teachers - currentTeacherCount : 0} enseignant(s) restant(s)
                    </p>
                  )}
                </div>

                {/* Télécharger le modèle */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-indigo-900">
                        Télécharger le modèle d'import
                      </p>
                      <p className="text-sm text-indigo-700 mt-1">
                        Utilisez ce modèle Excel pour préparer vos données
                      </p>
                      <button
                        onClick={handleDownloadTemplate}
                        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        <Download className="h-4 w-4" />
                        Télécharger le modèle
                      </button>
                    </div>
                  </div>
                </div>

                {/* Zone de drop / sélection fichier */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fichier à importer
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      importFile
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {importFile ? (
                      <div className="flex items-center justify-center gap-2 text-green-700">
                        <FileSpreadsheet className="h-8 w-8" />
                        <div className="text-left">
                          <p className="font-medium">{importFile.name}</p>
                          <p className="text-sm text-green-600">
                            {importPreview ? `${importPreview.length} ligne(s) détectée(s)` : 'Analyse en cours...'}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            resetImport();
                          }}
                          className="ml-2 text-green-500 hover:text-green-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Cliquez pour sélectionner un fichier Excel
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          .xlsx ou .xls uniquement
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Aperçu des données */}
                {importPreview && importPreview.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      Aperçu des données ({importPreview.length} ligne(s))
                    </p>
                    <div className="max-h-40 overflow-y-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            {Object.keys(importPreview[0]).slice(0, 4).map(key => (
                              <th key={key} className="text-left py-1 pr-2 font-medium text-gray-600">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {importPreview.slice(0, 5).map((row, index) => (
                            <tr key={index} className="border-b border-gray-200">
                              {Object.values(row).slice(0, 4).map((value, i) => (
                                <td key={i} className="py-1 pr-2 text-gray-800 truncate max-w-[100px]">
                                  {String(value || '-')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {importPreview.length > 5 && (
                        <p className="text-xs text-gray-500 mt-2">
                          ... et {importPreview.length - 5} autre(s) ligne(s)
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            {mode === 'export' ? (
              <button
                onClick={handleExport}
                disabled={loading || data.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Exporter
              </button>
            ) : (
              <button
                onClick={handleImport}
                disabled={loading || !importPreview || importPreview.length === 0 || !onImport}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Importer {importPreview?.length || 0} ligne(s)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal d'upgrade pour les restrictions */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Limite atteinte</h3>
                </div>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <Crown className="h-8 w-8 text-red-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  Upgrade requis
                </h4>
                <p className="text-gray-600 text-sm">
                  {upgradeMessage}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  Avantages App Académique
                </h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Enseignants illimités</li>
                  <li>✓ Comptes secrétaires illimités</li>
                  <li>✓ Import en masse sans restrictions</li>
                  <li>✓ Jusqu'à 500 élèves</li>
                  <li>✓ Bulletins professionnels</li>
                </ul>
              </div>

              {/* Boutons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <Link
                  to="/app-store"
                  onClick={() => {
                    setShowUpgradeModal(false);
                    onClose();
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all font-medium"
                >
                  <Crown className="h-4 w-4" />
                  Découvrir App Académique
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <p className="text-center text-xs text-gray-500 mt-4">
                75 000 FCFA/an • Support prioritaire inclus
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
