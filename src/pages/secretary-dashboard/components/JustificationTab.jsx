import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const JustificationTab = () => {
  const [selectedDate, setSelectedDate] = useState(new Date()?.toISOString()?.split('T')?.[0]);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'pending', label: 'En attente de justification' },
    { value: 'justified', label: 'Justifiée' },
    { value: 'unjustified', label: 'Non justifiée' },
    { value: 'late', label: 'Retard' }
  ];

  const absenceData = [
    {
      id: 1,
      studentName: "Junior Mbarga",
      studentId: "STU002",
      class: "CM1",
      parentName: "Marie Mbarga",
      parentPhone: "+237 6 89 01 23 45",
      parentEmail: "marie.mbarga@yahoo.fr",
      absenceDate: "15/11/2024",
      type: "absence",
      status: "justified",
      justification: "Rendez-vous médical",
      justificationDate: "16/11/2024",
      notifiedParent: true,
      duration: "Matinée",
      teacherNotified: true
    },
    {
      id: 2,
      studentName: "Grace Fouda",
      studentId: "STU003",
      class: "CE2",
      parentName: "Jean Fouda",
      parentPhone: "+237 6 90 12 34 56",
      parentEmail: "j.fouda@outlook.com",
      absenceDate: "16/11/2024",
      type: "absence",
      status: "pending",
      justification: "",
      justificationDate: "",
      notifiedParent: true,
      duration: "Journée complète",
      teacherNotified: true
    },
    {
      id: 3,
      studentName: "Kevin Biya",
      studentId: "STU004",
      class: "CM2",
      parentName: "Esther Biya",
      parentPhone: "+237 6 01 23 45 67",
      parentEmail: "esther.biya@hotmail.com",
      absenceDate: "16/11/2024",
      type: "late",
      status: "unjustified",
      justification: "",
      justificationDate: "",
      notifiedParent: false,
      duration: "30 minutes",
      teacherNotified: true
    },
    {
      id: 4,
      studentName: "Sarah Atangana",
      studentId: "STU005",
      class: "CE1",
      parentName: "Michel Atangana",
      parentPhone: "+237 6 12 34 56 78",
      parentEmail: "m.atangana@gmail.com",
      absenceDate: "14/11/2024",
      type: "absence",
      status: "unjustified",
      justification: "",
      justificationDate: "",
      notifiedParent: true,
      duration: "Après-midi",
      teacherNotified: true
    },
    {
      id: 5,
      studentName: "Amina Nkomo",
      studentId: "STU001",
      class: "CM2",
      parentName: "Paul Nkomo",
      parentPhone: "+237 6 78 90 12 34",
      parentEmail: "p.nkomo@gmail.com",
      absenceDate: "13/11/2024",
      type: "late",
      status: "justified",
      justification: "Problème de transport",
      justificationDate: "13/11/2024",
      notifiedParent: false,
      duration: "15 minutes",
      teacherNotified: true
    }
  ];

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

  const handleCallParent = (absenceId) => {
    console.log('Call parent for absence:', absenceId);
  };

  const handleJustifyAbsence = (absenceId) => {
    console.log('Justify absence:', absenceId);
  };

  const handleSendReminder = (absenceId) => {
    console.log('Send reminder for:', absenceId);
  };

  const stats = {
    pending: absenceData.filter(a => a.status === 'pending').length,
    unjustified: absenceData.filter(a => a.status === 'unjustified').length,
    toCall: absenceData.filter(a => !a.notifiedParent && a.status === 'pending').length,
    late: absenceData.filter(a => a.type === 'late').length
  };

  return (
    <div className="space-y-6">
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
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            iconName="Phone"
            iconPosition="left"
            onClick={() => console.log('Call all parents')}
          >
            Appeler parents
          </Button>
          <Button
            variant="default"
            iconName="Mail"
            iconPosition="left"
            onClick={() => console.log('Send reminders')}
          >
            Envoyer rappels
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

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
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
                            onClick={() => handleJustifyAbsence(absence.id)}
                            title="Justifier"
                          >
                            <Icon name="CheckCircle" size={16} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendReminder(absence.id)}
                          title="Envoyer rappel"
                        >
                          <Icon name="Mail" size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

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
    </div>
  );
};

export default JustificationTab;