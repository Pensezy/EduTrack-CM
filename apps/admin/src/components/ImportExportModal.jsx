/**
 * Modal d'Import/Export pour les utilisateurs
 *
 * Permet d'exporter en Excel/PDF et d'importer depuis un fichier Excel
 */

import { useState, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  Check,
  Loader2,
  Info
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

const TYPE_OPTIONS = [
  { value: 'users', label: 'Utilisateurs' },
  { value: 'personnel', label: 'Personnel' },
  { value: 'students', label: 'Élèves' },
  { value: 'teachers', label: 'Enseignants' },
  { value: 'parents', label: 'Parents' }
];

export default function ImportExportModal({
  isOpen,
  onClose,
  mode = 'export', // 'export' ou 'import'
  data = [],
  type = 'users',
  schoolName = 'EduTrack',
  onImport = null, // Callback pour l'import: (parsedData) => Promise
  allowedTypes = null // Types autorisés pour l'import, null = tous
}) {
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedType, setSelectedType] = useState(type);
  const [exportFormat, setExportFormat] = useState('excel');
  const [loading, setLoading] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importErrors, setImportErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

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
                {/* Type de données */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de données à importer
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      resetImport();
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {(allowedTypes || TYPE_OPTIONS).map(option => {
                      const opt = typeof option === 'string'
                        ? TYPE_OPTIONS.find(t => t.value === option) || { value: option, label: option }
                        : option;
                      return (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      );
                    })}
                  </select>
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
    </div>
  );
}
