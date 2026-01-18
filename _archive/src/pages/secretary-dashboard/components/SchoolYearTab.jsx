import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import schoolYearService from '../../../services/schoolYearService';

const SchoolYearTab = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [currentSchoolYear] = useState('2024-2025');
  const [nextSchoolYear] = useState('2025-2026');
  const [loading, setLoading] = useState(true);

  // États pour les données réelles
  const [studentsData, setStudentsData] = useState({});
  const [reinscriptions, setReinscriptions] = useState([]);
  const [newInscriptions, setNewInscriptions] = useState([]);
  const [statistics, setStatistics] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    reinscriptions: 0,
    newInscriptions: 0,
    transfers: 0
  });

  // Chargement des données au montage du composant
  useEffect(() => {
    const loadSchoolYearData = async () => {
      try {
        setLoading(true);

        const [studentsRes, reinscriptionsRes, newInscriptionsRes, statisticsRes] = await Promise.all([
          schoolYearService.getCurrentStudents(),
          schoolYearService.getReinscriptions(),
          schoolYearService.getNewInscriptions(),
          schoolYearService.getSchoolYearStatistics()
        ]);

        setStudentsData(studentsRes);
        setReinscriptions(reinscriptionsRes);
        setNewInscriptions(newInscriptionsRes);
        setStatistics(statisticsRes);
      } catch (error) {
        console.error('Erreur lors du chargement des données de l\'année scolaire:', error);
        setStudentsData({});
        setReinscriptions([]);
        setNewInscriptions([]);
        setStatistics({
          totalRequests: 0,
          pendingRequests: 0,
          approvedRequests: 0,
          rejectedRequests: 0,
          reinscriptions: 0,
          newInscriptions: 0,
          transfers: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadSchoolYearData();
  }, []);

  // Gestionnaire de mise à jour de statut
  const handleStatusUpdate = async (requestId, newStatus, notes = null) => {
    try {
      const result = await schoolYearService.updateEnrollmentRequestStatus(requestId, newStatus, notes);
      if (result.success) {
        // Recharger les données après mise à jour
        const [reinscriptionsRes, newInscriptionsRes] = await Promise.all([
          schoolYearService.getReinscriptions(),
          schoolYearService.getNewInscriptions()
        ]);
        setReinscriptions(reinscriptionsRes);
        setNewInscriptions(newInscriptionsRes);
      } else {
        console.error('Erreur lors de la mise à jour du statut:', result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-text-secondary">
          <Icon name="Loader2" size={20} className="animate-spin" />
          <span>Chargement des données de l'année scolaire...</span>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'en_preparation': { label: 'En préparation', className: 'bg-blue/10 text-blue' },
      'en_attente': { label: 'En attente', className: 'bg-warning/10 text-warning' },
      'soumis_validation': { label: 'Soumis validation', className: 'bg-orange/10 text-orange' },
      'confirme': { label: 'Confirmé', className: 'bg-success/10 text-success' },
      'valide': { label: 'Validé', className: 'bg-success/10 text-success' },
      'passe': { label: 'Passe', className: 'bg-success/10 text-success' },
      'redouble': { label: 'Redouble', className: 'bg-warning/10 text-warning' },
      'sortant': { label: 'Sortant', className: 'bg-muted text-muted-foreground' }
    };
    
    const config = statusConfig[status] || statusConfig['en_preparation'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-caption font-caption-normal ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const sections = [
    { id: 'dashboard', label: 'Vue d\'ensemble', icon: 'BarChart3' },
    { id: 'reinscriptions', label: 'Réinscriptions', icon: 'RotateCcw' },
    { id: 'nouvelles', label: 'Nouvelles inscriptions', icon: 'UserPlus' },
    { id: 'passages', label: 'Passages de classe', icon: 'TrendingUp' },
    { id: 'preparation', label: 'Préparation année', icon: 'Calendar' }
  ];

  return (
    <div className="space-y-6">
      {/* Header avec année scolaire */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading font-heading-bold text-xl text-text-primary">
            Transition d'Année Scolaire
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {currentSchoolYear} → {nextSchoolYear}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 px-3 py-2 rounded-lg">
            <span className="text-sm font-medium text-primary">
              📅 Période de transition active
            </span>
          </div>
        </div>
      </div>

      {/* Navigation sections */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeSection === section.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              }`}
            >
              <Icon name={section.icon} size={16} />
              <span>{section.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Overview */}
      {activeSection === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} className="text-success" />
                </div>
                <div>
                  <p className="font-heading font-heading-semibold text-lg text-text-primary">
                    {statistics.approvedRequests}
                  </p>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary">
                    Demandes approuvées
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
                    {statistics.pendingRequests}
                  </p>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary">
                    En attente de traitement
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="UserPlus" size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-heading font-heading-semibold text-lg text-text-primary">
                    {statistics.newInscriptions}
                  </p>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary">
                    Nouvelles demandes
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue/10 rounded-lg flex items-center justify-center">
                  <Icon name="TrendingUp" size={20} className="text-blue" />
                </div>
                <div>
                  <p className="font-heading font-heading-semibold text-lg text-text-primary">
                    {Object.values(studentsData).flat().filter(s => s.status === 'passe').length}
                  </p>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary">
                    Passages de classe
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Status */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-4">
              État du Processus de Transition
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-success/5 border border-success/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="CheckCircle" size={20} className="text-success" />
                  <div>
                    <p className="font-medium text-text-primary">Collecte des réinscriptions</p>
                    <p className="text-sm text-text-secondary">Phase en cours</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-success">En cours</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="Clock" size={20} className="text-muted-foreground" />
                  <div>
                    <p className="font-medium text-text-primary">Validation par le Principal</p>
                    <p className="text-sm text-text-secondary">En attente de soumission</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-muted-foreground">En attente</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="Calendar" size={20} className="text-muted-foreground" />
                  <div>
                    <p className="font-medium text-text-primary">Préparation nouvelle année</p>
                    <p className="text-sm text-text-secondary">Démarrera après validation</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-muted-foreground">À venir</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section Réinscriptions */}
      {activeSection === 'reinscriptions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
              Suivi des Réinscriptions
            </h3>
            <Button>
              <Icon name="Send" size={16} className="mr-2" />
              Envoyer rappels
            </Button>
          </div>

          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Élève
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Parent
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Classe
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reinscriptions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-text-secondary">
                        <div className="flex flex-col items-center space-y-2">
                          <Icon name="Users" size={24} className="text-muted-foreground" />
                          <span>Aucune demande de réinscription en cours</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    reinscriptions.map((reinscription) => (
                      <tr key={reinscription.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Icon name="User" size={14} className="text-primary" />
                            </div>
                            <span className="font-medium text-text-primary">
                              {reinscription.studentName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {reinscription.parentName}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {reinscription.currentClass ? `${reinscription.currentClass} → ${reinscription.requestedClass}` : reinscription.requestedClass}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(reinscription.status)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            {reinscription.status === 'en_attente' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusUpdate(reinscription.id, 'confirme')}
                              >
                                <Icon name="Check" size={14} className="mr-1" />
                                Confirmer
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Icon name="Eye" size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Section Nouvelles Inscriptions */}
      {activeSection === 'nouvelles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
              Nouvelles Inscriptions
            </h3>
            <Button>
              <Icon name="Send" size={16} className="mr-2" />
              Soumettre au Principal
            </Button>
          </div>

          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Élève
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Parent
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Classe demandée
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {newInscriptions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-text-secondary">
                        <div className="flex flex-col items-center space-y-2">
                          <Icon name="UserPlus" size={24} className="text-muted-foreground" />
                          <span>Aucune nouvelle inscription en cours</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    newInscriptions.map((inscription) => (
                      <tr key={inscription.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                              <Icon name="UserPlus" size={14} className="text-success" />
                            </div>
                            <div>
                              <span className="font-medium text-text-primary">
                                {inscription.studentName}
                              </span>
                              {inscription.birthDate && (
                                <p className="text-xs text-text-secondary">
                                  Né(e) le {inscription.birthDate}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-text-primary">{inscription.parentName}</div>
                            {inscription.parentPhone && (
                              <div className="text-xs text-text-secondary">{inscription.parentPhone}</div>
                            )}
                            {inscription.parentEmail && (
                              <div className="text-xs text-text-secondary">{inscription.parentEmail}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                            {inscription.requestedClass}
                          </span>
                          {inscription.previousSchool && (
                            <p className="text-xs text-text-secondary mt-1">
                              De: {inscription.previousSchool}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(inscription.status)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            {inscription.status === 'soumis' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusUpdate(inscription.id, 'accepte')}
                              >
                                <Icon name="Check" size={14} className="mr-1" />
                                Accepter
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Icon name="Eye" size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Section Passages de classe */}
      {activeSection === 'passages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
              Préparation Passages de Classe
            </h3>
            <div className="text-sm text-text-secondary">
              En attente de validation du Principal
            </div>
          </div>

          {Object.entries(studentsData).length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <Icon name="Users" size={32} className="text-muted-foreground mx-auto mb-4" />
              <h4 className="font-heading font-heading-medium text-base text-text-primary mb-2">
                Aucun étudiant trouvé
              </h4>
              <p className="text-text-secondary">
                Les passages de classe seront préparés une fois que les étudiants seront ajoutés au système.
              </p>
            </div>
          ) : (
            Object.entries(studentsData).map(([classe, students]) => (
              <div key={classe} className="bg-card rounded-lg border border-border p-4">
                <h4 className="font-heading font-heading-medium text-base text-text-primary mb-4">
                  Classe {classe.toUpperCase()} - {students.length} élève{students.length > 1 ? 's' : ''}
                </h4>
                <div className="space-y-3">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Icon name="User" size={14} className="text-primary" />
                        </div>
                        <span className="font-medium text-text-primary">
                          {student.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-text-secondary">
                          → {student.nextClass}
                        </span>
                        {getStatusBadge(student.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Section Préparation */}
      {activeSection === 'preparation' && (
        <div className="space-y-6">
          <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
            Préparation Année {nextSchoolYear}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg border border-border p-4">
              <h4 className="font-heading font-heading-medium text-base text-text-primary mb-4">
                Documents à préparer
              </h4>
              <div className="space-y-3">
                {[
                  'Listes de classe provisoires',
                  'Certificats de scolarité',
                  'Attestations de fin d\'année',
                  'Dossiers de passage'
                ].map((doc, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Icon name="FileText" size={16} className="text-muted-foreground" />
                    <span className="text-sm text-text-secondary">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <h4 className="font-heading font-heading-medium text-base text-text-primary mb-4">
                Prochaines étapes
              </h4>
              <div className="space-y-3">
                {[
                  { 
                    text: 'Finaliser les réinscriptions', 
                    completed: statistics.approvedRequests > 0,
                    count: statistics.approvedRequests 
                  },
                  { 
                    text: 'Traiter nouvelles inscriptions', 
                    completed: statistics.newInscriptions > 0,
                    count: statistics.newInscriptions 
                  },
                  { 
                    text: 'Soumettre au Principal', 
                    completed: false,
                    count: statistics.totalRequests 
                  },
                  { 
                    text: 'Attendre la validation', 
                    completed: false,
                    count: 0 
                  }
                ].map((etape, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        etape.completed ? 'bg-success' : 'bg-muted'
                      }`}>
                        {etape.completed ? (
                          <Icon name="Check" size={10} className="text-white" />
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
                        )}
                      </div>
                      <span className={`text-sm ${etape.completed ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {etape.text}
                      </span>
                    </div>
                    {etape.count > 0 && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {etape.count}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolYearTab;