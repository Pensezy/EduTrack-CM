import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Image from '../../../components/AppImage';
import CardGenerationModal from './CardGenerationModal';
import cardService from '../../../services/cardService';

const StudentCardTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedCards, setSelectedCards] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewCard, setPreviewCard] = useState(null);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [studentCards, setStudentCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Chargement des données depuis le service
  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setIsLoading(true);
      setError('');
      const cards = await cardService.getAllCards();
      setStudentCards(cards);
    } catch (err) {
      setError('Erreur lors du chargement des cartes');
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Affichage des messages de succès temporaires
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const classOptions = [
    { value: '', label: 'Toutes les classes' },
    { value: 'CP', label: 'CP' },
    { value: 'CE1', label: 'CE1' },
    { value: 'CE2', label: 'CE2' },
    { value: 'CM1', label: 'CM1' },
    { value: 'CM2', label: 'CM2' }
  ];

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'draft', label: 'Brouillon' },
    { value: 'pending_validation', label: 'En attente de validation' },
    { value: 'issued', label: 'Émise' },
    { value: 'printed', label: 'Imprimée' },
    { value: 'expired', label: 'Expirée' }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Brouillon', className: 'bg-muted text-muted-foreground' },
      pending_validation: { label: 'En validation', className: 'bg-warning/10 text-warning' },
      issued: { label: 'Émise', className: 'bg-success/10 text-success' },
      printed: { label: 'Imprimée', className: 'bg-primary/10 text-primary' },
      expired: { label: 'Expirée', className: 'bg-error/10 text-error' }
    };
    
    const config = statusConfig?.[status] || statusConfig?.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-caption font-caption-normal ${config?.className}`}>
        {config?.label}
      </span>
    );
  };

  const filteredCards = studentCards?.filter(card => {
    const matchesSearch = card?.studentName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         card?.cardNumber?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         card?.studentId?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesClass = !filterClass || card?.class === filterClass;
    const matchesStatus = !filterStatus || card?.status === filterStatus;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  const handleGenerateCard = () => {
    setShowGenerationModal(true);
  };

  const handleCardGenerated = (newCard) => {
    setStudentCards(prev => [...prev, newCard]);
    setSuccessMessage(`Carte générée avec succès pour ${newCard.studentName}`);
  };

  const handleValidateCard = async (cardId) => {
    try {
      const updatedCard = await cardService.validateCard(cardId);
      setStudentCards(prev => 
        prev.map(card => 
          card.id === cardId ? updatedCard : card
        )
      );
      setSuccessMessage('Carte validée avec succès');
    } catch (err) {
      setError(err.message || 'Erreur lors de la validation');
    }
  };

  const handlePrintCard = async (cardId) => {
    try {
      const updatedCard = await cardService.printCard(cardId);
      setStudentCards(prev => 
        prev.map(card => 
          card.id === cardId ? updatedCard : card
        )
      );
      setSuccessMessage('Carte imprimée avec succès');
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'impression');
    }
  };

  const handleBulkPrint = async () => {
    if (selectedCards.length === 0) return;
    
    try {
      const updatedCards = await cardService.bulkPrintCards(selectedCards);
      setStudentCards(prev => 
        prev.map(card => {
          const updated = updatedCards.find(u => u.id === card.id);
          return updated || card;
        })
      );
      setSelectedCards([]);
      setSuccessMessage(`${updatedCards.length} carte(s) imprimée(s) avec succès`);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'impression en lot');
    }
  };

  const handleRegenerateCard = async (studentId) => {
    try {
      const newCard = await cardService.regenerateCard(studentId);
      setStudentCards(prev => 
        prev.map(card => 
          card.studentId === studentId && card.status !== 'expired' 
            ? { ...card, status: 'expired' } 
            : card
        ).concat(newCard)
      );
      setSuccessMessage('Carte régénérée avec succès');
    } catch (err) {
      setError(err.message || 'Erreur lors de la régénération');
    }
  };

  const handleBulkValidate = async () => {
    const validatableCards = selectedCards.filter(cardId => {
      const card = studentCards.find(c => c.id === cardId);
      return card && ['draft', 'pending_validation'].includes(card.status);
    });

    if (validatableCards.length === 0) {
      setError('Aucune carte sélectionnée ne peut être validée');
      return;
    }

    try {
      const updatedCards = await cardService.bulkValidateCards(validatableCards);
      setStudentCards(prev => 
        prev.map(card => {
          const updated = updatedCards.find(u => u.id === card.id);
          return updated || card;
        })
      );
      setSelectedCards([]);
      setSuccessMessage(`${updatedCards.length} carte(s) validée(s) avec succès`);
    } catch (err) {
      setError(err.message || 'Erreur lors de la validation en lot');
    }
  };

  const handlePreviewCard = (card) => {
    setPreviewCard(card);
    setShowPreview(true);
  };

  const toggleCardSelection = (cardId) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('fr-FR');
  };

  const getExpiryDate = () => {
    const date = new Date();
    date.setMonth(5); // Juin (mois 5)
    date.setDate(30);
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      {/* Messages d'erreur et de succès */}
      {error && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} className="text-error" />
            <p className="font-body font-body-normal text-sm text-error">
              {error}
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setError('')}
              className="ml-auto"
            >
              <Icon name="X" size={16} />
            </Button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={16} className="text-success" />
            <p className="font-body font-body-normal text-sm text-success">
              {successMessage}
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSuccessMessage('')}
              className="ml-auto"
            >
              <Icon name="X" size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading font-heading-bold text-xl text-text-primary">
            Cartes Scolaires
          </h2>
          <p className="font-body font-body-normal text-sm text-text-secondary mt-1">
            Gérez la génération et validation des cartes d'identité étudiante
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            iconName="CheckCircle"
            iconPosition="left"
            onClick={handleBulkValidate}
            disabled={selectedCards.length === 0}
          >
            Valider sélection ({selectedCards.length})
          </Button>
          <Button
            variant="outline"
            iconName="Printer"
            iconPosition="left"
            onClick={handleBulkPrint}
            disabled={selectedCards.length === 0}
          >
            Imprimer sélection ({selectedCards.length})
          </Button>
          <Button
            variant="default"
            iconName="CreditCard"
            iconPosition="left"
            onClick={handleGenerateCard}
          >
            Nouvelle Carte
          </Button>
        </div>
      </div>

      {/* Quick Actions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className="bg-card rounded-lg border border-border p-6 cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={handleGenerateCard}
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="CreditCard" size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-1">
                Génération rapide
              </h3>
              <p className="font-body font-body-normal text-sm text-text-secondary">
                Créer une nouvelle carte pour un élève
              </p>
            </div>
          </div>
        </div>

        <div 
          className="bg-card rounded-lg border border-border p-6 cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={handleBulkValidate}
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle" size={24} className="text-warning" />
            </div>
            <div>
              <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-1">
                Validation en lot
                {selectedCards.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-warning/20 text-warning rounded-full text-xs">
                    {selectedCards.length}
                  </span>
                )}
              </h3>
              <p className="font-body font-body-normal text-sm text-text-secondary">
                Valider plusieurs cartes simultanément
              </p>
            </div>
          </div>
        </div>

        <div 
          className="bg-card rounded-lg border border-border p-6 cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={handleBulkPrint}
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="Printer" size={24} className="text-success" />
            </div>
            <div>
              <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-1">
                Impression
                {selectedCards.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-success/20 text-success rounded-full text-xs">
                    {selectedCards.length}
                  </span>
                )}
              </h3>
              <p className="font-body font-body-normal text-sm text-text-secondary">
                Imprimer les cartes validées
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="search"
            placeholder="Rechercher par nom, numéro de carte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="w-full"
          />
          <Select
            placeholder="Filtrer par classe"
            options={classOptions}
            value={filterClass}
            onChange={setFilterClass}
          />
          <Select
            placeholder="Filtrer par statut"
            options={statusOptions}
            value={filterStatus}
            onChange={setFilterStatus}
          />
        </div>
      </div>

      {/* Cards Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="font-body font-body-normal text-text-secondary">
                Chargement des cartes...
              </span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 w-12">
                  <Checkbox
                    checked={selectedCards.length === filteredCards.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCards(filteredCards.map(card => card.id));
                      } else {
                        setSelectedCards([]);
                      }
                    }}
                  />
                </th>
                <th className="text-left p-4 font-heading font-heading-semibold text-sm text-text-primary">
                  Élève
                </th>
                <th className="text-left p-4 font-heading font-heading-semibold text-sm text-text-primary">
                  Numéro de carte
                </th>
                <th className="text-left p-4 font-heading font-heading-semibold text-sm text-text-primary">
                  Classe
                </th>
                <th className="text-left p-4 font-heading font-heading-semibold text-sm text-text-primary">
                  Dates
                </th>
                <th className="text-left p-4 font-heading font-heading-semibold text-sm text-text-primary">
                  Statut
                </th>
                <th className="text-right p-4 font-heading font-heading-semibold text-sm text-text-primary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCards?.map((card) => (
                <tr key={card?.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-4">
                    <Checkbox
                      checked={selectedCards.includes(card.id)}
                      onChange={() => toggleCardSelection(card.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={card?.photo}
                        alt={card?.studentName}
                        className="w-10 h-10 rounded-full object-cover"
                        fallback="/public/assets/images/no_image.png"
                      />
                      <div>
                        <p className="font-body font-body-medium text-sm text-text-primary">
                          {card?.studentName}
                        </p>
                        <p className="font-caption font-caption-normal text-xs text-text-secondary">
                          ID: {card?.studentId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-body font-body-normal text-sm text-text-primary font-mono">
                      {card?.cardNumber}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="font-body font-body-normal text-sm text-text-primary">
                      {card?.class}
                    </p>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-body font-body-normal text-sm text-text-primary">
                        Émise: {card?.issueDate}
                      </p>
                      <p className="font-caption font-caption-normal text-xs text-text-secondary">
                        Expire: {card?.expiryDate}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(card?.status)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePreviewCard(card)}
                        title="Aperçu"
                      >
                        <Icon name="Eye" size={16} />
                      </Button>
                      {card?.status === 'pending_validation' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleValidateCard(card?.id)}
                          title="Valider"
                        >
                          <Icon name="CheckCircle" size={16} />
                        </Button>
                      )}
                      {(card?.status === 'issued' || card?.status === 'printed') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePrintCard(card?.id)}
                          title="Imprimer"
                        >
                          <Icon name="Printer" size={16} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRegenerateCard(card?.studentId)}
                        title="Régénérer"
                      >
                        <Icon name="RotateCcw" size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCards?.length === 0 && (
            <div className="p-8 text-center">
              <Icon name="CreditCard" size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="font-body font-body-normal text-text-secondary">
                Aucune carte trouvée avec les critères de recherche
              </p>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Card Preview Modal */}
      {showPreview && previewCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
                Aperçu Carte Scolaire
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPreview(false)}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>

            {/* Card Preview */}
            <div className="p-6">
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg p-6 text-white shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-heading font-heading-bold text-lg">EduTrack-CM</h4>
                    <p className="font-caption font-caption-normal text-sm opacity-90">École Primaire</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm">{previewCard?.cardNumber}</p>
                    <p className="font-caption font-caption-normal text-xs opacity-90">Année 2024-2025</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <Image
                    src={previewCard?.photo}
                    alt={previewCard?.studentName}
                    className="w-16 h-16 rounded-lg object-cover border-2 border-white"
                    fallback="/public/assets/images/no_image.png"
                  />
                  <div>
                    <h5 className="font-heading font-heading-semibold text-lg">{previewCard?.studentName}</h5>
                    <p className="font-body font-body-normal text-sm opacity-90">Classe: {previewCard?.class}</p>
                  </div>
                </div>
                
                <div className="border-t border-white/20 pt-3 mt-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="font-caption font-caption-normal text-xs opacity-75">Groupe sanguin</p>
                      <p className="font-body font-body-medium">{previewCard?.bloodType}</p>
                    </div>
                    <div>
                      <p className="font-caption font-caption-normal text-xs opacity-75">Urgence</p>
                      <p className="font-body font-body-medium text-xs">{previewCard?.emergencyContact}</p>
                    </div>
                  </div>
                  {previewCard?.medicalNotes && previewCard?.medicalNotes !== "Aucune" && (
                    <div className="mt-2">
                      <p className="font-caption font-caption-normal text-xs opacity-75">Notes médicales</p>
                      <p className="font-body font-body-normal text-xs">{previewCard?.medicalNotes}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/20">
                  <p className="font-caption font-caption-normal text-xs opacity-75">
                    Valide jusqu'au {previewCard?.expiryDate}
                  </p>
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                    <Icon name="Shield" size={16} className="text-primary" />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-border">
              <Button variant="default" onClick={() => handlePrintCard(previewCard?.id)}>
                Imprimer
              </Button>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted/10 rounded-lg flex items-center justify-center">
              <Icon name="FileEdit" size={20} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-lg text-text-primary">
                {studentCards?.filter(c => c?.status === 'draft')?.length}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Brouillons
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={20} className="text-warning" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-lg text-text-primary">
                {studentCards?.filter(c => c?.status === 'pending_validation')?.length}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                En validation
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle" size={20} className="text-success" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-lg text-text-primary">
                {studentCards?.filter(c => c?.status === 'issued')?.length}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Émises
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Printer" size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-lg text-text-primary">
                {studentCards?.filter(c => c?.status === 'printed')?.length}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Imprimées
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
              <Icon name="AlertCircle" size={20} className="text-error" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-lg text-text-primary">
                {studentCards?.filter(c => c?.status === 'expired')?.length}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Expirées
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Generation Modal */}
      <CardGenerationModal
        isOpen={showGenerationModal}
        onClose={() => setShowGenerationModal(false)}
        onCardGenerated={handleCardGenerated}
      />
    </div>
  );
};

export default StudentCardTab;