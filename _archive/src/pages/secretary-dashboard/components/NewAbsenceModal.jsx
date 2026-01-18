import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Image from '../../../components/AppImage';
import absenceService from '../../../services/absenceService';

const NewAbsenceModal = ({ isOpen, onClose, onAbsenceCreated }) => {
  const [step, setStep] = useState(1); // 1: Recherche élève, 2: Détails absence
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [absenceData, setAbsenceData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'absence',
    duration: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const absenceTypes = [
    { value: 'absence', label: 'Absence' },
    { value: 'late', label: 'Retard' }
  ];

  const durationOptions = {
    absence: [
      { value: 'Matinée', label: 'Matinée' },
      { value: 'Après-midi', label: 'Après-midi' },
      { value: 'Journée complète', label: 'Journée complète' }
    ],
    late: [
      { value: '15 minutes', label: '15 minutes' },
      { value: '30 minutes', label: '30 minutes' },
      { value: '45 minutes', label: '45 minutes' },
      { value: '1 heure', label: '1 heure' },
      { value: 'Plus d\'1 heure', label: 'Plus d\'1 heure' }
    ]
  };

  // Recherche des étudiants
  useEffect(() => {
    if (isOpen && step === 1) {
      loadStudents();
    }
  }, [isOpen, step, searchTerm]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      setError('');
      const studentsData = await absenceService.searchStudents(searchTerm);
      setStudents(studentsData);
    } catch (err) {
      setError('Erreur lors de la recherche des étudiants');
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setStep(2);
  };

  const handleAbsenceDataChange = (field, value) => {
    setAbsenceData(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset duration when type changes
    if (field === 'type') {
      setAbsenceData(prev => ({
        ...prev,
        duration: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      setError('Veuillez sélectionner un étudiant');
      return;
    }

    if (!absenceData.date) {
      setError('Veuillez sélectionner une date');
      return;
    }

    if (!absenceData.duration) {
      setError('Veuillez sélectionner une durée');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const newAbsenceData = {
        studentId: selectedStudent.id,
        date: new Date(absenceData.date).toLocaleDateString('fr-FR'),
        type: absenceData.type,
        duration: absenceData.duration,
        notes: absenceData.notes.trim()
      };

      const newAbsence = await absenceService.createAbsence(newAbsenceData);
      
      if (onAbsenceCreated) {
        onAbsenceCreated(newAbsence);
      }
      
      handleClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de la création de l\'absence');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSearchTerm('');
    setSelectedStudent(null);
    setAbsenceData({
      date: new Date().toISOString().split('T')[0],
      type: 'absence',
      duration: '',
      notes: ''
    });
    setError('');
    setIsLoading(false);
    setIsSubmitting(false);
    onClose();
  };

  const handleBackToSearch = () => {
    setStep(1);
    setSelectedStudent(null);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
              {step === 1 ? 'Sélectionner un Étudiant' : 'Enregistrer une Absence'}
            </h3>
            <p className="font-body font-body-normal text-sm text-text-secondary mt-1">
              {step === 1 
                ? 'Choisissez l\'étudiant pour lequel enregistrer une absence'
                : 'Saisissez les détails de l\'absence'
              }
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

        {/* Step 1: Recherche et sélection d'étudiant */}
        {step === 1 && (
          <div className="p-6">
            {/* Barre de recherche */}
            <div className="mb-6">
              <Input
                type="search"
                placeholder="Rechercher par nom, ID ou classe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                iconName="Search"
                iconPosition="left"
              />
            </div>

            {/* Liste des étudiants */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-body font-body-normal text-sm text-text-secondary">
                      Recherche en cours...
                    </span>
                  </div>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <p className="font-body font-body-normal text-text-secondary">
                    {searchTerm 
                      ? 'Aucun étudiant trouvé avec ces critères'
                      : 'Aucun étudiant disponible'
                    }
                  </p>
                </div>
              ) : (
                students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => handleStudentSelect(student)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon name="User" size={20} className="text-primary" />
                      </div>
                      <div>
                        <h4 className="font-body font-body-medium text-sm text-text-primary">
                          {student.name}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="font-caption font-caption-normal text-xs text-text-secondary">
                            ID: {student.id}
                          </p>
                          <p className="font-caption font-caption-normal text-xs text-text-secondary">
                            Classe: {student.class}
                          </p>
                        </div>
                        <p className="font-caption font-caption-normal text-xs text-text-secondary">
                          Parent: {student.parentName}
                        </p>
                      </div>
                    </div>
                    <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 2: Détails de l'absence */}
        {step === 2 && selectedStudent && (
          <div className="p-6">
            {/* Informations de l'étudiant sélectionné */}
            <div className="bg-muted/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="User" size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-heading font-heading-semibold text-sm text-text-primary">
                    {selectedStudent.name}
                  </h4>
                  <p className="font-body font-body-normal text-xs text-text-secondary">
                    {selectedStudent.id} • Classe {selectedStudent.class}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary">
                    Parent/Tuteur
                  </p>
                  <p className="font-body font-body-normal text-text-primary">
                    {selectedStudent.parentName}
                  </p>
                </div>
                <div>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary">
                    Contact
                  </p>
                  <p className="font-body font-body-normal text-text-primary">
                    {selectedStudent.parentPhone}
                  </p>
                </div>
              </div>
            </div>

            {/* Formulaire de l'absence */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date de l'absence */}
              <div>
                <label className="block font-body font-body-medium text-sm text-text-primary mb-2">
                  Date de l'absence *
                </label>
                <Input
                  type="date"
                  value={absenceData.date}
                  onChange={(e) => handleAbsenceDataChange('date', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Type d'absence */}
              <div>
                <label className="block font-body font-body-medium text-sm text-text-primary mb-2">
                  Type *
                </label>
                <Select
                  options={absenceTypes}
                  value={absenceData.type}
                  onChange={(value) => handleAbsenceDataChange('type', value)}
                  placeholder="Sélectionnez le type"
                  className="w-full"
                />
              </div>

              {/* Durée */}
              <div>
                <label className="block font-body font-body-medium text-sm text-text-primary mb-2">
                  Durée *
                </label>
                <Select
                  options={durationOptions[absenceData.type] || []}
                  value={absenceData.duration}
                  onChange={(value) => handleAbsenceDataChange('duration', value)}
                  placeholder="Sélectionnez la durée"
                  className="w-full"
                />
              </div>

              {/* Notes supplémentaires */}
              <div>
                <label className="block font-body font-body-medium text-sm text-text-primary mb-2">
                  Notes supplémentaires (optionnel)
                </label>
                <textarea
                  value={absenceData.notes}
                  onChange={(e) => handleAbsenceDataChange('notes', e.target.value)}
                  placeholder="Informations complémentaires sur l'absence..."
                  className="w-full px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  rows={3}
                  maxLength={300}
                />
                <p className="text-xs text-text-secondary mt-1">
                  {absenceData.notes.length}/300 caractères
                </p>
              </div>

              {/* Note d'information */}
              <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
                  <div>
                    <p className="font-body font-body-medium text-sm text-warning mb-1">
                      Information importante
                    </p>
                    <p className="font-body font-body-normal text-sm text-text-secondary">
                      Cette absence sera enregistrée comme "En attente de justification" et les parents seront automatiquement notifiés.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border">
          {step === 1 ? (
            <Button variant="outline" onClick={handleClose}>
              Annuler
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleBackToSearch}>
                Retour
              </Button>
              <Button 
                variant="default" 
                onClick={handleSubmit}
                disabled={isSubmitting}
                iconName={isSubmitting ? undefined : "UserX"}
                iconPosition="left"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Enregistrement...</span>
                  </div>
                ) : (
                  'Enregistrer l\'Absence'
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewAbsenceModal;