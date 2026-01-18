import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Image from '../../../components/AppImage';
import cardService from '../../../services/cardService';

const CardGenerationModal = ({ isOpen, onClose, onCardGenerated }) => {
  const [step, setStep] = useState(1); // 1: Recherche étudiant, 2: Confirmation
  const [searchTerm, setSearchTerm] = useState('');
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Recherche des étudiants disponibles
  useEffect(() => {
    if (isOpen && step === 1) {
      loadAvailableStudents();
    }
  }, [isOpen, step, searchTerm]);

  const loadAvailableStudents = async () => {
    try {
      setIsLoading(true);
      setError('');
      const students = await cardService.searchAvailableStudents(searchTerm);
      setAvailableStudents(students);
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

  const handleGenerateCard = async () => {
    if (!selectedStudent) return;

    try {
      setIsGenerating(true);
      setError('');
      const newCard = await cardService.generateCard(selectedStudent.id);
      
      // Informer le parent de la nouvelle carte générée
      if (onCardGenerated) {
        onCardGenerated(newCard);
      }
      
      handleClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de la génération de la carte');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSearchTerm('');
    setSelectedStudent(null);
    setError('');
    setIsLoading(false);
    setIsGenerating(false);
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
              {step === 1 ? 'Sélectionner un Étudiant' : 'Confirmer la Génération'}
            </h3>
            <p className="font-body font-body-normal text-sm text-text-secondary mt-1">
              {step === 1 
                ? 'Choisissez un étudiant pour générer sa carte scolaire'
                : 'Vérifiez les informations avant de générer la carte'
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
              ) : availableStudents.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <p className="font-body font-body-normal text-text-secondary">
                    {searchTerm 
                      ? 'Aucun étudiant trouvé avec ces critères'
                      : 'Aucun étudiant disponible pour la génération de carte'
                    }
                  </p>
                </div>
              ) : (
                availableStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => handleStudentSelect(student)}
                  >
                    <div className="flex items-center space-x-3">
                      <Image
                        src={student.photo}
                        alt={student.name}
                        className="w-12 h-12 rounded-full object-cover"
                        fallback="/public/assets/images/no_image.png"
                      />
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
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {student.hasCard ? (
                        <span className="px-2 py-1 bg-warning/10 text-warning rounded-full text-xs font-caption font-caption-normal">
                          Carte existante
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-success/10 text-success rounded-full text-xs font-caption font-caption-normal">
                          Disponible
                        </span>
                      )}
                      <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 2: Confirmation */}
        {step === 2 && selectedStudent && (
          <div className="p-6">
            {/* Informations de l'étudiant */}
            <div className="bg-muted/20 rounded-lg p-6 mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <Image
                  src={selectedStudent.photo}
                  alt={selectedStudent.name}
                  className="w-16 h-16 rounded-lg object-cover"
                  fallback="/public/assets/images/no_image.png"
                />
                <div>
                  <h4 className="font-heading font-heading-semibold text-lg text-text-primary">
                    {selectedStudent.name}
                  </h4>
                  <p className="font-body font-body-normal text-sm text-text-secondary">
                    {selectedStudent.id} • Classe {selectedStudent.class}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary mb-1">
                    Parent/Tuteur
                  </p>
                  <p className="font-body font-body-normal text-sm text-text-primary">
                    {selectedStudent.parentName}
                  </p>
                </div>
                <div>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary mb-1">
                    Contact d'urgence
                  </p>
                  <p className="font-body font-body-normal text-sm text-text-primary">
                    {selectedStudent.emergencyContact}
                  </p>
                </div>
                <div>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary mb-1">
                    Groupe sanguin
                  </p>
                  <p className="font-body font-body-normal text-sm text-text-primary">
                    {selectedStudent.bloodType}
                  </p>
                </div>
                <div>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary mb-1">
                    Notes médicales
                  </p>
                  <p className="font-body font-body-normal text-sm text-text-primary">
                    {selectedStudent.medicalNotes || 'Aucune'}
                  </p>
                </div>
              </div>
            </div>

            {/* Informations de la carte à générer */}
            <div className="bg-primary/5 rounded-lg p-4 mb-6">
              <h5 className="font-heading font-heading-semibold text-sm text-text-primary mb-3">
                Informations de la carte
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary">
                    Date d'émission
                  </p>
                  <p className="font-body font-body-normal text-text-primary">
                    {new Date().toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary">
                    Date d'expiration
                  </p>
                  <p className="font-body font-body-normal text-text-primary">
                    30/06/{new Date().getFullYear() + (new Date().getMonth() >= 8 ? 1 : 0)}
                  </p>
                </div>
                <div>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary">
                    Statut initial
                  </p>
                  <p className="font-body font-body-normal text-text-primary">
                    Brouillon (nécessite validation)
                  </p>
                </div>
              </div>
            </div>
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
                onClick={handleGenerateCard}
                disabled={isGenerating}
                iconName={isGenerating ? undefined : "CreditCard"}
                iconPosition="left"
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Génération...</span>
                  </div>
                ) : (
                  'Générer la Carte'
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardGenerationModal;