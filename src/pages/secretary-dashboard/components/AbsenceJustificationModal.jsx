import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import absenceService from '../../../services/absenceService';

const AbsenceJustificationModal = ({ isOpen, onClose, absence, onAbsenceUpdated }) => {
  const [justificationReason, setJustificationReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [documents, setDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const predefinedReasons = [
    { value: 'medical', label: 'Rendez-vous médical' },
    { value: 'illness', label: 'Maladie' },
    { value: 'family', label: 'Raisons familiales' },
    { value: 'transport', label: 'Problème de transport' },
    { value: 'emergency', label: 'Urgence familiale' },
    { value: 'appointment', label: 'Rendez-vous administratif' },
    { value: 'travel', label: 'Voyage prévu' },
    { value: 'custom', label: 'Autre raison...' }
  ];

  useEffect(() => {
    if (isOpen && absence) {
      setJustificationReason(absence.justification ? 'custom' : '');
      setCustomReason(absence.justification || '');
      setDocuments([]);
      setError('');
    }
  }, [isOpen, absence]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!justificationReason) {
      setError('Veuillez sélectionner une raison');
      return;
    }

    if (justificationReason === 'custom' && !customReason.trim()) {
      setError('Veuillez préciser la raison personnalisée');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const finalReason = justificationReason === 'custom' 
        ? customReason.trim()
        : predefinedReasons.find(r => r.value === justificationReason)?.label;

      const justificationData = {
        reason: finalReason,
        documents: documents
      };

      const updatedAbsence = await absenceService.justifyAbsence(absence.id, justificationData);
      
      if (onAbsenceUpdated) {
        onAbsenceUpdated(updatedAbsence);
      }
      
      handleClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de la justification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setJustificationReason('');
    setCustomReason('');
    setDocuments([]);
    setError('');
    setIsSubmitting(false);
    onClose();
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newDocuments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString()
    }));
    
    setDocuments(prev => [...prev, ...newDocuments]);
  };

  const removeDocument = (docId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!isOpen || !absence) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
              Justifier l'Absence
            </h3>
            <p className="font-body font-body-normal text-sm text-text-secondary mt-1">
              {absence.studentName} - {absence.absenceDate}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-error/10 border border-error/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon name="AlertCircle" size={16} className="text-error" />
              <p className="font-body font-body-normal text-sm text-error">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Informations de l'absence */}
          <div className="bg-muted/20 rounded-lg p-4 mb-6">
            <h4 className="font-heading font-heading-semibold text-sm text-text-primary mb-3">
              Détails de l'absence
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-caption font-caption-normal text-xs text-text-secondary">
                  Élève
                </p>
                <p className="font-body font-body-normal text-text-primary">
                  {absence.studentName} ({absence.class})
                </p>
              </div>
              <div>
                <p className="font-caption font-caption-normal text-xs text-text-secondary">
                  Type
                </p>
                <p className="font-body font-body-normal text-text-primary">
                  {absence.type === 'absence' ? 'Absence' : 'Retard'}
                </p>
              </div>
              <div>
                <p className="font-caption font-caption-normal text-xs text-text-secondary">
                  Date
                </p>
                <p className="font-body font-body-normal text-text-primary">
                  {absence.absenceDate}
                </p>
              </div>
              <div>
                <p className="font-caption font-caption-normal text-xs text-text-secondary">
                  Durée
                </p>
                <p className="font-body font-body-normal text-text-primary">
                  {absence.duration}
                </p>
              </div>
            </div>
          </div>

          {/* Sélection de la raison */}
          <div className="mb-6">
            <label className="block font-body font-body-medium text-sm text-text-primary mb-2">
              Raison de l'absence *
            </label>
            <Select
              options={predefinedReasons}
              value={justificationReason}
              onChange={setJustificationReason}
              placeholder="Sélectionnez une raison"
              className="w-full"
            />
          </div>

          {/* Raison personnalisée */}
          {justificationReason === 'custom' && (
            <div className="mb-6">
              <label className="block font-body font-body-medium text-sm text-text-primary mb-2">
                Précisez la raison *
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Décrivez la raison de l'absence..."
                className="w-full px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-text-secondary mt-1">
                {customReason.length}/500 caractères
              </p>
            </div>
          )}

          {/* Upload de documents */}
          <div className="mb-6">
            <label className="block font-body font-body-medium text-sm text-text-primary mb-2">
              Documents justificatifs (optionnel)
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <div className="text-center">
                <Icon name="Upload" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="font-body font-body-normal text-sm text-text-secondary mb-2">
                  Glissez vos fichiers ici ou cliquez pour sélectionner
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  Sélectionner des fichiers
                </Button>
              </div>
            </div>

            {/* Liste des documents uploadés */}
            {documents.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="font-body font-body-medium text-sm text-text-primary">
                  Documents ajoutés:
                </p>
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <Icon name="File" size={16} className="text-muted-foreground" />
                      <div>
                        <p className="font-body font-body-normal text-sm text-text-primary">
                          {doc.name}
                        </p>
                        <p className="font-caption font-caption-normal text-xs text-text-secondary">
                          {formatFileSize(doc.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDocument(doc.id)}
                    >
                      <Icon name="Trash" size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Note d'information */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <Icon name="Info" size={16} className="text-primary mt-0.5" />
              <div>
                <p className="font-body font-body-medium text-sm text-primary mb-1">
                  Information importante
                </p>
                <p className="font-body font-body-normal text-sm text-text-secondary">
                  Cette justification sera enregistrée dans le dossier de l'élève et les parents seront automatiquement notifiés de l'acceptation.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button 
            type="submit"
            variant="default" 
            onClick={handleSubmit}
            disabled={isSubmitting}
            iconName={isSubmitting ? undefined : "CheckCircle"}
            iconPosition="left"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Justification...</span>
              </div>
            ) : (
              'Justifier l\'Absence'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AbsenceJustificationModal;