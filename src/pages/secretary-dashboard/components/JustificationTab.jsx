import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import AbsenceJustificationModal from './AbsenceJustificationModal';
import NewAbsenceModal from './NewAbsenceModal';
import NotificationHistoryModal from './NotificationHistoryModal';
import { Checkbox } from '../../../components/ui/Checkbox';
import absenceService from '../../../services/absenceService';

const JustificationTab = () => {
  const [selectedDate, setSelectedDate] = useState(new Date()?.toISOString()?.split('T')?.[0]);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [absenceData, setAbsenceData] = useState([]);
  const [selectedAbsences, setSelectedAbsences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showJustificationModal, setShowJustificationModal] = useState(false);
  const [showNewAbsenceModal, setShowNewAbsenceModal] = useState(false);
  const [showNotificationHistoryModal, setShowNotificationHistoryModal] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState(null);

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'reported', label: 'Signalée' },
    { value: 'contacted', label: 'Parents contactés' },
    { value: 'justified_received', label: 'Justificatif reçu' },
    { value: 'transmitted', label: 'Transmis à la direction' },
    { value: 'late', label: 'Retard' }
  ];

  // Chargement des données depuis le service
  useEffect(() => {
    loadAbsences();
  }, []);

  const loadAbsences = async () => {
    try {
      setIsLoading(true);
      setError('');
      const absences = await absenceService.getAllAbsences();
      setAbsenceData(absences);
    } catch (err) {
      setError('Erreur lors du chargement des absences');
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



  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: 'En attente',
        className: 'bg-warning/10 text-warning border-warning/20',
        icon: 'Clock'
      },
      justified: {
        label: 'Justifiée',
        className: 'bg-success/10 text-success border-success/20',
        icon: 'CheckCircle'
      },
      unjustified: {
        label: 'Non justifiée',
        className: 'bg-error/10 text-error border-error/20',
        icon: 'AlertTriangle'
      }
    };
    return configs?.[status] || configs?.pending;
  };

  const getTypeConfig = (type) => {
    const configs = {
      absence: {
        label: 'Absence',
        className: 'bg-primary/10 text-primary',
        icon: 'UserX'
      },
      late: {
        label: 'Retard',
        className: 'bg-orange-100 text-orange-600',
        icon: 'Clock'
      }
    };
    return configs?.[type] || configs?.absence;
  };

  const filteredAbsences = absenceData.filter(absence => {
    const matchesSearch = absence.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         absence.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === '' || absence.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCallParent = async (absenceId) => {
    try {
      const callData = {
        successful: true,
        duration: '3 min',
        notes: 'Appel effectué concernant l\'absence'
      };
      
      const updatedAbsence = await absenceService.callParent(absenceId, callData);
      setAbsenceData(prev => 
        prev.map(absence => 
          absence.id === absenceId ? updatedAbsence : absence
        )
      );
      setSuccessMessage('Appel parent enregistré avec succès');
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement de l\'appel');
    }
  };

  const handleJustifyAbsence = (absence) => {
    setSelectedAbsence(absence);
    setShowJustificationModal(true);
  };

  const handleAbsenceUpdated = (updatedAbsence) => {
    setAbsenceData(prev => 
      prev.map(absence => 
        absence.id === updatedAbsence.id ? updatedAbsence : absence
      )
    );
    setSuccessMessage('Absence mise à jour avec succès');
  };

  const handleAbsenceCreated = (newAbsence) => {
    setAbsenceData(prev => [...prev, newAbsence]);
    setSuccessMessage(`Absence enregistrée pour ${newAbsence.studentName}`);
  };

  const handleSendReminder = async (absenceId, type = 'sms') => {
    try {
      const message = 'Rappel concernant l\'absence de votre enfant. Merci de nous contacter.';
      
      if (type === 'sms') {
        await absenceService.sendSMSReminder(absenceId, message);
      } else {
        await absenceService.sendEmailReminder(absenceId, {
          subject: 'Absence de votre enfant',
          message: message
        });
      }
      
      // Recharger les données pour voir la mise à jour
      loadAbsences();
      setSuccessMessage(`Rappel ${type} envoyé avec succès`);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'envoi du rappel');
    }
  };

  const handleBulkReminders = async () => {
    if (selectedAbsences.length === 0) {
      setError('Veuillez sélectionner au moins une absence');
      return;
    }

    try {
      const message = 'Rappel concernant l\'absence de votre enfant.';
      await absenceService.bulkSendReminders(selectedAbsences, 'sms', message);
      
      loadAbsences();
      setSelectedAbsences([]);
      setSuccessMessage(`Rappels envoyés pour ${selectedAbsences.length} absence(s)`);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'envoi des rappels');
    }
  };

  const handleBulkJustify = async () => {
    const justifiableAbsences = selectedAbsences.filter(absenceId => {
      const absence = absenceData.find(a => a.id === absenceId);
      return absence && absence.status !== 'justified';
    });

    if (justifiableAbsences.length === 0) {
      setError('Aucune absence sélectionnée ne peut être justifiée');
      return;
    }

    try {
      const reason = 'Justification groupée par l\'administration';
      await absenceService.bulkJustifyAbsences(justifiableAbsences, reason);
      
      loadAbsences();
      setSelectedAbsences([]);
      setSuccessMessage(`${justifiableAbsences.length} absence(s) justifiée(s)`);
    } catch (err) {
      setError(err.message || 'Erreur lors de la justification groupée');
    }
  };

  const toggleAbsenceSelection = (absenceId) => {
    setSelectedAbsences(prev => 
      prev.includes(absenceId) 
        ? prev.filter(id => id !== absenceId)
        : [...prev, absenceId]
    );
  };

  const stats = {
    pending: absenceData.filter(a => a.status === 'pending').length,
    unjustified: absenceData.filter(a => a.status === 'unjustified').length,
    toCall: absenceData.filter(a => !a.notifiedParent && a.status === 'pending').length,
    late: absenceData.filter(a => a.type === 'late').length
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

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="font-heading font-heading-bold text-2xl text-text-primary">
            Gestion des Justificatifs
          </h2>
          <p className="font-body font-body-normal text-text-secondary mt-1">
            Suivi des absences et retards, justifications et relances parents
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            iconName="CheckCircle"
            iconPosition="left"
            onClick={handleBulkJustify}
            disabled={selectedAbsences.length === 0}
          >
            Justifier sélection ({selectedAbsences.length})
          </Button>
          <Button
            variant="outline"
            iconName="Mail"
            iconPosition="left"
            onClick={handleBulkReminders}
            disabled={selectedAbsences.length === 0}
          >
            Rappels sélection ({selectedAbsences.length})
          </Button>
          <Button
            variant="default"
            iconName="UserX"
            iconPosition="left"
            onClick={() => setShowNewAbsenceModal(true)}
          >
            Nouvelle Absence
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={24} className="text-warning" />
            </div>
            <div>
              <p className="font-heading font-heading-bold text-2xl text-text-primary">
                {stats.pending}
              </p>
              <p className="font-caption font-caption-normal text-sm text-text-secondary">
                En attente justification
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center">
              <Icon name="AlertTriangle" size={24} className="text-error" />
            </div>
            <div>
              <p className="font-heading font-heading-bold text-2xl text-text-primary">
                {stats.unjustified}
              </p>
              <p className="font-caption font-caption-normal text-sm text-text-secondary">
                Non justifiées
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Phone" size={24} className="text-primary" />
            </div>
            <div>
              <p className="font-heading font-heading-bold text-2xl text-text-primary">
                {stats.toCall}
              </p>
              <p className="font-caption font-caption-normal text-sm text-text-secondary">
                Parents à appeler
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="font-heading font-heading-bold text-2xl text-text-primary">
                {stats.late}
              </p>
              <p className="font-caption font-caption-normal text-sm text-text-secondary">
                Retards
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Rechercher un élève ou parent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            iconName="Search"
            iconPosition="left"
          />
          <Select
            options={statusOptions}
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder="Filtrer par statut"
          />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            iconName="Calendar"
            iconPosition="left"
          />
        </div>
      </div>

      {/* Absences List */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
            Absences et Retards ({filteredAbsences.length})
          </h3>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Icon name="Download" size={16} className="mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="font-body font-body-normal text-text-secondary">
                Chargement des absences...
              </span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 w-12">
                    <Checkbox
                      checked={selectedAbsences.length === filteredAbsences.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAbsences(filteredAbsences.map(absence => absence.id));
                        } else {
                          setSelectedAbsences([]);
                        }
                      }}
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-text-secondary">
                    Élève
                  </th>
                <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-text-secondary">
                  Date / Type
                </th>
                <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-text-secondary">
                  Durée
                </th>
                <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-text-secondary">
                  Statut
                </th>
                <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-text-secondary">
                  Justification
                </th>
                <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAbsences.map((absence) => {
                const statusConfig = getStatusConfig(absence.status);
                const typeConfig = getTypeConfig(absence.type);
                
                return (
                  <tr key={absence.id} className="border-b border-border hover:bg-muted/50 transition-micro">
                    <td className="py-4 px-4">
                      <Checkbox
                        checked={selectedAbsences.includes(absence.id)}
                        onChange={() => toggleAbsenceSelection(absence.id)}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-body font-body-semibold text-sm text-text-primary">
                          {absence.studentName}
                        </div>
                        <div className="font-caption font-caption-normal text-xs text-text-secondary">
                          {absence.class} - {absence.studentId}
                        </div>
                        <div className="font-caption font-caption-normal text-xs text-text-secondary">
                          {absence.parentName} - {absence.parentPhone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-body font-body-normal text-sm text-text-primary">
                        {absence.absenceDate}
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeConfig.className}`}>
                        <Icon name={typeConfig.icon} size={12} className="mr-1" />
                        {typeConfig.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-body font-body-normal text-sm text-text-primary">
                        {absence.duration}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.className}`}>
                        <Icon name={statusConfig.icon} size={12} className="mr-1" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-body font-body-normal text-sm text-text-primary">
                        {absence.justification || '-'}
                      </div>
                      {absence.justificationDate && (
                        <div className="font-caption font-caption-normal text-xs text-text-secondary">
                          Le {absence.justificationDate}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {absence.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCallParent(absence.id)}
                            title="Appeler parent"
                          >
                            <Icon name="Phone" size={16} />
                          </Button>
                        )}
                        {absence.status !== 'justified' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleJustifyAbsence(absence)}
                            title="Justifier"
                          >
                            <Icon name="CheckCircle" size={16} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendReminder(absence.id, 'sms')}
                          title="SMS"
                        >
                          <Icon name="MessageSquare" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendReminder(absence.id, 'email')}
                          title="Email"
                        >
                          <Icon name="Mail" size={16} />
                        </Button>
                        {absence.notificationHistory && absence.notificationHistory.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAbsence(absence);
                              setShowNotificationHistoryModal(true);
                            }}
                            title="Historique des notifications"
                          >
                            <Icon name="History" size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredAbsences.length === 0 && (
            <div className="text-center py-12">
              <Icon name="CheckCircle" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-2">
                Aucune absence trouvée
              </h3>
              <p className="font-body font-body-normal text-text-secondary">
                Aucune absence ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </div>
        )}
      </div>
      {/* Modals */}
      <AbsenceJustificationModal
        isOpen={showJustificationModal}
        onClose={() => setShowJustificationModal(false)}
        absence={selectedAbsence}
        onAbsenceUpdated={handleAbsenceUpdated}
      />

      <NewAbsenceModal
        isOpen={showNewAbsenceModal}
        onClose={() => setShowNewAbsenceModal(false)}
        onAbsenceCreated={handleAbsenceCreated}
      />

      <NotificationHistoryModal
        isOpen={showNotificationHistoryModal}
        onClose={() => setShowNotificationHistoryModal(false)}
        absence={selectedAbsence}
      />
    </div>
  );
};

export default JustificationTab;