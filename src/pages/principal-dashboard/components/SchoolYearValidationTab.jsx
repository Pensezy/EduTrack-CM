import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import useDashboardData from '../../../hooks/useDashboardData';

const SchoolYearValidationTab = () => {
  const [activeSection, setActiveSection] = useState('pending');
  const [currentSchoolYear] = useState('2024-2025');
  const [nextSchoolYear] = useState('2025-2026');
  
  // Hook pour récupérer les données selon le mode (démo/production)
  const { isDemo, isProduction, dataMode } = useDashboardData();

  // Données DÉMO - Situations fictives pour démonstration
  const demoPendingRequests = [
    {
      id: 1,
      type: 'nouvelle_inscription',
      studentName: 'Marie Talla (DÉMO)',
      parentName: 'Joseph Talla',
      requestedClass: 'CE1',
      submittedBy: 'Secrétaire',
      submittedDate: '2024-09-15',
      status: 'en_attente',
      documents: ['Certificat de naissance', 'Carnet de vaccination'],
      priority: 'normal'
    },
    {
      id: 2,
      type: 'nouvelle_inscription',
      studentName: 'Daniel Mbella (DÉMO)',
      parentName: 'Agnes Mbella',
      requestedClass: 'CM1',
      submittedBy: 'Secrétaire',
      submittedDate: '2024-09-18',
      status: 'en_attente',
      documents: ['Bulletins année précédente', 'Certificat de transfert'],
      priority: 'urgent'
    },
    {
      id: 3,
      type: 'redoublement',
      studentName: 'Kevin Atangana (DÉMO)',
      currentClass: 'CE1',
      requestedClass: 'CE1',
      reason: 'Difficultés en mathématiques',
      teacherRecommendation: 'Recommandé par Mme Nguema',
      status: 'en_attente',
      priority: 'normal'
    }
  ];

  // Données PRODUCTION - Pas de demandes en attente actuellement
  const productionPendingRequests = [
    // Aucune demande en attente pour le moment
    // Ces données seraient récupérées depuis la base de données Supabase
  ];

  // Choisir les bonnes données selon le mode
  const [pendingRequests, setPendingRequests] = useState(
    isDemo ? demoPendingRequests : productionPendingRequests
  );

  // Statistiques pour validation - Différentes selon le mode
  const demoValidationStats = {
    totalDemandes: 15,
    enAttente: 3,
    approuvees: 8,
    refusees: 1,
    enRevision: 3
  };

  const productionValidationStats = {
    totalDemandes: 0,
    enAttente: 0,
    approuvees: 0,
    refusees: 0,
    enRevision: 0
  };

  const [validationStats] = useState(
    isDemo ? demoValidationStats : productionValidationStats
  );

  // Passages de classe à valider - Différents selon le mode  
  const demoClassTransitions = {
    ce1_to_ce2: { total: 8, approved: 6, pending: 2 },
    ce2_to_cm1: { total: 12, approved: 10, pending: 2 },
    cm1_to_cm2: { total: 7, approved: 5, pending: 2 },
    cm2_graduates: { total: 15, approved: 15, pending: 0 }
  };

  const productionClassTransitions = {
    ce1_to_ce2: { total: 0, approved: 0, pending: 0 },
    ce2_to_cm1: { total: 0, approved: 0, pending: 0 },
    cm1_to_cm2: { total: 0, approved: 0, pending: 0 },
    cm2_graduates: { total: 0, approved: 0, pending: 0 }
  };

  const [classTransitions] = useState(
    isDemo ? demoClassTransitions : productionClassTransitions
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      'en_attente': { label: 'En attente', className: 'bg-warning/10 text-warning' },
      'approuve': { label: 'Approuvé', className: 'bg-success/10 text-success' },
      'refuse': { label: 'Refusé', className: 'bg-error/10 text-error' },
      'en_revision': { label: 'En révision', className: 'bg-blue/10 text-blue' }
    };
    
    const config = statusConfig[status] || statusConfig['en_attente'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-caption font-caption-normal ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'urgent': { label: 'Urgent', className: 'bg-error/10 text-error' },
      'normal': { label: 'Normal', className: 'bg-muted text-muted-foreground' }
    };
    
    const config = priorityConfig[priority] || priorityConfig['normal'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-caption font-caption-normal ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const handleApproveRequest = (requestId) => {
    setPendingRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approuve' }
          : req
      )
    );
  };

  const handleRejectRequest = (requestId) => {
    setPendingRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'refuse' }
          : req
      )
    );
  };

  const sections = [
    { id: 'pending', label: 'Demandes en attente', icon: 'Clock' },
    { id: 'transitions', label: 'Passages de classe', icon: 'TrendingUp' },
    { id: 'approved', label: 'Validées', icon: 'CheckCircle' },
    { id: 'settings', label: 'Configuration année', icon: 'Settings' }
  ];

  return (
    <div className="space-y-6">
      {/* Header avec indicateur de mode */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="font-heading font-heading-bold text-xl text-text-primary">
              Validation Année Scolaire
            </h2>
            {/* Indicateur de mode */}
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              isDemo 
                ? 'bg-amber-100 text-amber-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {isDemo ? '🔄 Données Démo' : '🏫 Données Réelles'}
            </div>
          </div>
          <p className="text-sm text-text-secondary">
            Décisions et approbations pour {currentSchoolYear} → {nextSchoolYear}
            {isDemo && (
              <span className="block text-xs text-amber-600 mt-1">
                Mode démonstration - Données d'exemple uniquement
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {validationStats.enAttente > 0 ? (
            <div className="bg-warning/10 px-3 py-2 rounded-lg">
              <span className="text-sm font-medium text-warning">
                ⚠️ {validationStats.enAttente} demandes en attente
              </span>
            </div>
          ) : (
            <div className="bg-green-50 px-3 py-2 rounded-lg">
              <span className="text-sm font-medium text-green-700">
                ✅ Aucune demande en attente
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
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
              {section.id === 'pending' && validationStats.enAttente > 0 && (
                <span className="bg-warning text-warning-foreground text-xs rounded-full px-2 py-1">
                  {validationStats.enAttente}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Section Demandes en attente */}
      {activeSection === 'pending' && (
        <div className="space-y-6">
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Icon name="Clock" size={20} className="text-warning" />
                </div>
                <div>
                  <p className="font-heading font-heading-semibold text-lg text-text-primary">
                    {validationStats.enAttente}
                  </p>
                  <p className="text-xs text-text-secondary">En attente</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} className="text-success" />
                </div>
                <div>
                  <p className="font-heading font-heading-semibold text-lg text-text-primary">
                    {validationStats.approuvees}
                  </p>
                  <p className="text-xs text-text-secondary">Approuvées</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue/10 rounded-lg flex items-center justify-center">
                  <Icon name="Eye" size={20} className="text-blue" />
                </div>
                <div>
                  <p className="font-heading font-heading-semibold text-lg text-text-primary">
                    {validationStats.enRevision}
                  </p>
                  <p className="text-xs text-text-secondary">En révision</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                  <Icon name="XCircle" size={20} className="text-error" />
                </div>
                <div>
                  <p className="font-heading font-heading-semibold text-lg text-text-primary">
                    {validationStats.refusees}
                  </p>
                  <p className="text-xs text-text-secondary">Refusées</p>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des demandes */}
          <div className="space-y-4">
            {pendingRequests.filter(req => req.status === 'en_attente').length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                    <Icon name="CheckCircle" size={32} className="text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-heading font-heading-medium text-lg text-text-primary mb-2">
                      {isDemo ? 'Toutes les demandes ont été traitées' : 'Aucune demande en attente'}
                    </h3>
                    <p className="text-sm text-text-secondary max-w-md">
                      {isDemo 
                        ? 'Dans la version de démonstration, toutes les demandes d\'inscription et de redoublement ont été approuvées.'
                        : 'Il n\'y a actuellement aucune demande de validation en attente. Les nouvelles demandes apparaîtront ici.'
                      }
                    </p>
                  </div>
                  {isProduction && (
                    <Button variant="outline">
                      <Icon name="Plus" size={16} className="mr-2" />
                      Ajouter une demande manuelle
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              pendingRequests.filter(req => req.status === 'en_attente').map((request) => (
              <div key={request.id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon 
                        name={request.type === 'nouvelle_inscription' ? 'UserPlus' : 'RotateCcw'} 
                        size={20} 
                        className="text-primary" 
                      />
                    </div>
                    <div>
                      <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
                        {request.studentName}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Parent: {request.parentName}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {request.type === 'nouvelle_inscription' 
                          ? `Demande d'inscription en ${request.requestedClass}`
                          : `Redoublement ${request.currentClass} → ${request.requestedClass}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(request.priority)}
                    {getStatusBadge(request.status)}
                  </div>
                </div>

                {/* Détails de la demande */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-text-primary mb-2">Informations</p>
                    <div className="space-y-1 text-sm text-text-secondary">
                      <p>Soumis par: {request.submittedBy}</p>
                      <p>Date: {request.submittedDate}</p>
                      {request.reason && <p>Motif: {request.reason}</p>}
                      {request.teacherRecommendation && <p>Avis enseignant: {request.teacherRecommendation}</p>}
                    </div>
                  </div>
                  {request.documents && (
                    <div>
                      <p className="text-sm font-medium text-text-primary mb-2">Documents fournis</p>
                      <div className="space-y-1">
                        {request.documents.map((doc, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm text-text-secondary">
                            <Icon name="FileCheck" size={14} className="text-success" />
                            <span>{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Icon name="Eye" size={14} className="mr-1" />
                      Voir dossier complet
                    </Button>
                    <Button variant="outline" size="sm">
                      <Icon name="MessageCircle" size={14} className="mr-1" />
                      Demander info
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRejectRequest(request.id)}
                      className="text-error hover:text-error"
                    >
                      <Icon name="X" size={14} className="mr-1" />
                      Refuser
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleApproveRequest(request.id)}
                    >
                      <Icon name="Check" size={14} className="mr-1" />
                      Approuver
                    </Button>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Section Passages de classe */}
      {activeSection === 'transitions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
              Validation des Passages de Classe
            </h3>
            <Button>
              <Icon name="CheckCircle" size={16} className="mr-2" />
              Approuver tout
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(classTransitions).map(([transition, data]) => {
              const transitionLabels = {
                'ce1_to_ce2': 'CE1 → CE2',
                'ce2_to_cm1': 'CE2 → CM1',
                'cm1_to_cm2': 'CM1 → CM2',
                'cm2_graduates': 'CM2 → Fin primaire'
              };

              return (
                <div key={transition} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-heading font-heading-medium text-base text-text-primary">
                      {transitionLabels[transition]}
                    </h4>
                    <span className="text-sm text-text-secondary">
                      {data.approved}/{data.total} validés
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">Progression</span>
                      <span className="text-sm font-medium text-text-primary">
                        {Math.round((data.approved / data.total) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-success h-2 rounded-full" 
                        style={{width: `${(data.approved / data.total) * 100}%`}}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-success">✓ {data.approved} approuvés</span>
                      {data.pending > 0 && (
                        <span className="text-warning">⏳ {data.pending} en attente</span>
                      )}
                    </div>
                  </div>

                  {data.pending > 0 && (
                    <div className="mt-4">
                      <Button variant="outline" size="sm" className="w-full">
                        <Icon name="Eye" size={14} className="mr-2" />
                        Voir les cas en attente ({data.pending})
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section Configuration */}
      {activeSection === 'settings' && (
        <div className="space-y-6">
          <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
            Configuration Année Scolaire {nextSchoolYear}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-heading font-heading-medium text-base text-text-primary mb-4">
                Paramètres généraux
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Date début année scolaire
                  </label>
                  <Input type="date" defaultValue="2025-09-01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Date fin année scolaire
                  </label>
                  <Input type="date" defaultValue="2026-06-30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Effectif maximum par classe
                  </label>
                  <Input type="number" defaultValue="25" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-heading font-heading-medium text-base text-text-primary mb-4">
                Actions administratives
              </h4>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="FileText" size={16} className="mr-2" />
                  Générer listes de classe
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="Download" size={16} className="mr-2" />
                  Exporter données année précédente
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="Archive" size={16} className="mr-2" />
                  Archiver année {currentSchoolYear}
                </Button>
                <Button className="w-full justify-start bg-success hover:bg-success/90">
                  <Icon name="CheckCircle" size={16} className="mr-2" />
                  Finaliser transition d'année
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolYearValidationTab;