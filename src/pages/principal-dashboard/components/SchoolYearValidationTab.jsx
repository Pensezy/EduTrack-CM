import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import useDashboardData from '../../../hooks/useDashboardData';
import productionDataService from '../../../services/productionDataService';

const SchoolYearValidationTab = () => {
  const [activeSection, setActiveSection] = useState('pending');
  const [currentSchoolYear] = useState('2024-2025');
  const [nextSchoolYear] = useState('2025-2026');
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [validationStats, setValidationStats] = useState({
    totalDemandes: 0,
    enAttente: 0,
    approuvees: 0,
    refusees: 0,
    enRevision: 0
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    request_type: 'nouvelle_inscription',
    student_first_name: '',
    student_last_name: '',
    parent_name: '',
    parent_phone: '',
    requested_class: '',
    priority: 'normal'
  });
  
  // Hook pour récupérer les données selon le mode (démo/production)
  const { isDemo, isProduction, dataMode, data, user, modeLoading } = useDashboardData();

  // Debug: Afficher l'état du mode
  useEffect(() => {
    console.log('📊 SchoolYearValidationTab - État du mode:');
    console.log('  - dataMode:', dataMode);
    console.log('  - isDemo:', isDemo);
    console.log('  - isProduction:', isProduction);
    console.log('  - modeLoading:', modeLoading);
    console.log('  - user:', user);
  }, [dataMode, isDemo, isProduction, modeLoading, user]);

  // Charger les vraies données depuis Supabase
  useEffect(() => {
    const loadEnrollmentData = async () => {
      // Attendre que le mode soit déterminé
      if (modeLoading) {
        console.log('⏳ Attente de la détermination du mode...');
        return;
      }

      console.log('🔍 Chargement des demandes d\'inscription...');
      console.log('  - Mode déterminé:', dataMode);
      console.log('  - École utilisateur:', user?.schoolData?.id);

      if (dataMode === 'production' && user?.schoolData?.id) {
        console.log('🏫 Mode PRODUCTION détecté - Chargement depuis Supabase');
        setLoading(true);
        
        // Initialiser le contexte
        if (user.id && user.schoolData.id) {
          console.log('🔐 Initialisation du contexte:', user.id, user.schoolData.id);
          productionDataService.setUserContext(user.id, user.schoolData.id);
        }

        try {
          // Charger les demandes en attente
          console.log('📥 Récupération des demandes en attente...');
          const { data: requests, error: requestsError } = await productionDataService.getEnrollmentRequests(
            user.schoolData.id,
            { status: 'en_attente' }
          );

          if (requestsError) {
            console.error('❌ Erreur lors du chargement des demandes:', requestsError);
          } else {
            console.log('✅ Demandes récupérées:', requests?.length || 0);
          }

          // Charger les statistiques
          console.log('📊 Récupération des statistiques...');
          const { data: stats, error: statsError } = await productionDataService.getEnrollmentStats(user.schoolData.id);

          if (statsError) {
            console.error('❌ Erreur lors du chargement des stats:', statsError);
          } else {
            console.log('✅ Statistiques récupérées:', stats);
          }

          setPendingRequests(requests || []);
          setValidationStats(stats || {
            totalDemandes: 0,
            enAttente: 0,
            approuvees: 0,
            refusees: 0,
            enRevision: 0
          });

        } catch (error) {
          console.error('❌ Erreur lors du chargement des données d\'inscription:', error);
          setPendingRequests([]);
          setValidationStats({
            totalDemandes: 0,
            enAttente: 0,
            approuvees: 0,
            refusees: 0,
            enRevision: 0
          });
        }

        setLoading(false);
      } else if (dataMode === 'demo') {
        console.log('🎭 Mode DÉMO détecté - Chargement des données fictives');
        // Mode démo - utiliser les données fictives
        loadDemoData();
      } else {
        console.log('⚠️ Mode non déterminé ou données utilisateur manquantes');
        console.log('  - dataMode:', dataMode);
        console.log('  - user.schoolData:', user?.schoolData);
      }
    };

    loadEnrollmentData();
  }, [dataMode, modeLoading, user]);

  // Fonction pour charger les données démo
  const loadDemoData = () => {
    const demoPendingRequests = [
      {
        id: '1',
        request_type: 'nouvelle_inscription',
        student_first_name: 'Marie',
        student_last_name: 'Talla',
        parent_name: 'Joseph Talla',
        requested_class: 'CE1',
        submitted_by_user: { full_name: 'Secrétaire' },
        submitted_date: '2024-09-15',
        status: 'en_attente',
        documents: [
          { name: 'Certificat de naissance', uploaded: true },
          { name: 'Carnet de vaccination', uploaded: true }
        ],
        priority: 'normal'
      },
      {
        id: '2',
        request_type: 'nouvelle_inscription',
        student_first_name: 'Daniel',
        student_last_name: 'Mbella',
        parent_name: 'Agnes Mbella',
        requested_class: 'CM1',
        submitted_by_user: { full_name: 'Secrétaire' },
        submitted_date: '2024-09-18',
        status: 'en_attente',
        documents: [
          { name: 'Bulletins année précédente', uploaded: true },
          { name: 'Certificat de transfert', uploaded: false }
        ],
        priority: 'urgent'
      }
    ];

    setPendingRequests(demoPendingRequests);
    setValidationStats({
      totalDemandes: 15,
      enAttente: 3,
      approuvees: 8,
      refusees: 1,
      enRevision: 3
    });
    setLoading(false);
  };

  // Passages de classe à valider (données fictives pour démo)
  const [classTransitions] = useState({
    ce1_to_ce2: { total: 0, approved: 0, pending: 0 },
    ce2_to_cm1: { total: 0, approved: 0, pending: 0 },
    cm1_to_cm2: { total: 0, approved: 0, pending: 0 },
    cm2_graduates: { total: 0, approved: 0, pending: 0 }
  });

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

  const handleApproveRequest = async (requestId) => {
    const { data, error } = await productionDataService.updateEnrollmentRequest(requestId, {
      status: 'approuvee'
    });

    if (!error) {
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      // Recharger les stats
      const { data: stats } = await productionDataService.getEnrollmentStats(user?.schoolData?.id);
      setValidationStats(stats || validationStats);
    }
  };

  const handleRejectRequest = async (requestId) => {
    const notes = prompt('Raison du refus (optionnel):');
    
    const { data, error } = await productionDataService.updateEnrollmentRequest(requestId, {
      status: 'refusee',
      validation_notes: notes
    });

    if (!error) {
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      // Recharger les stats
      const { data: stats } = await productionDataService.getEnrollmentStats(user?.schoolData?.id);
      setValidationStats(stats || validationStats);
    }
  };

  const handleCreateRequest = async () => {
    if (!newRequest.student_first_name || !newRequest.student_last_name || !newRequest.requested_class) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    const { data, error } = await productionDataService.createEnrollmentRequest({
      ...newRequest,
      school_id: user?.schoolData?.id,
      submitted_by: user?.id
    });

    if (!error && data) {
      // Ajouter à la liste
      setPendingRequests(prev => [data, ...prev]);
      
      // Recharger les stats
      const { data: stats } = await productionDataService.getEnrollmentStats(user?.schoolData?.id);
      setValidationStats(stats || validationStats);

      // Réinitialiser le formulaire et fermer le modal
      setNewRequest({
        request_type: 'nouvelle_inscription',
        student_first_name: '',
        student_last_name: '',
        parent_name: '',
        parent_phone: '',
        requested_class: '',
        priority: 'normal'
      });
      setShowCreateModal(false);
      alert('Demande créée avec succès !');
    } else {
      alert('Erreur lors de la création: ' + (error?.message || 'Erreur inconnue'));
    }
    
    setLoading(false);
  };

  const sections = [
    { id: 'pending', label: 'Demandes en attente', icon: 'Clock' },
    { id: 'transitions', label: 'Passages de classe', icon: 'TrendingUp' },
    { id: 'approved', label: 'Validées', icon: 'CheckCircle' },
    { id: 'settings', label: 'Configuration année', icon: 'Settings' }
  ];

  return (
    <div className="space-y-6">
      {/* Header avec indicateur de mode - Modernisé */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md">
                <Icon name="Calendar" size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  Validation Année Scolaire
                </h2>
                {/* Indicateur de mode */}
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                  isDemo 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-green-500 text-white'
                }`}>
                  {isDemo ? '🎭 Données Démo' : '🏫 Données Réelles'}
                </div>
              </div>
            </div>
            <p className="text-blue-100 text-sm ml-14">
              Décisions et approbations pour {currentSchoolYear} → {nextSchoolYear}
              {isDemo && (
                <span className="block text-xs text-amber-200 mt-1">
                  Mode démonstration - Données d'exemple uniquement
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {validationStats.enAttente > 0 ? (
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30 shadow-md">
                <span className="text-sm font-semibold text-white">
                  ⚠️ {validationStats.enAttente} demandes en attente
                </span>
              </div>
            ) : (
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30 shadow-md">
                <span className="text-sm font-semibold text-white">
                  ✅ Aucune demande en attente
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation - Modernisée */}
      <div className="bg-white rounded-2xl shadow-md border-2 border-gray-200 p-2">
        <nav className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeSection === section.id
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                activeSection === section.id
                  ? 'bg-white/20 backdrop-blur-sm'
                  : 'bg-white shadow-sm'
              }`}>
                <Icon name={section.icon} size={16} className={activeSection === section.id ? 'text-white' : 'text-blue-600'} />
              </div>
              <span>{section.label}</span>
              {section.id === 'pending' && validationStats.enAttente > 0 && (
                <span className={`text-xs rounded-full px-2 py-1 font-bold ${
                  activeSection === section.id
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-100 text-amber-800'
                }`}>
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
          {/* Statistiques rapides - Modernisées */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                  <Icon name="Clock" size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-amber-900">
                    {validationStats.enAttente}
                  </p>
                  <p className="text-sm font-medium text-amber-700">En attente</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <Icon name="CheckCircle" size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-900">
                    {validationStats.approuvees}
                  </p>
                  <p className="text-sm font-medium text-green-700">Approuvées</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <Icon name="Eye" size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-900">
                    {validationStats.enRevision}
                  </p>
                  <p className="text-sm font-medium text-blue-700">En révision</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                  <Icon name="XCircle" size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-red-900">
                    {validationStats.refusees}
                  </p>
                  <p className="text-sm font-medium text-red-700">Refusées</p>
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
                    <Button variant="outline" onClick={() => setShowCreateModal(true)}>
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
                        name={request.request_type === 'nouvelle_inscription' ? 'UserPlus' : 
                              request.request_type === 'redoublement' ? 'RotateCcw' : 'ArrowRight'} 
                        size={20} 
                        className="text-primary" 
                      />
                    </div>
                    <div>
                      <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
                        {request.student_first_name} {request.student_last_name}
                        {request.student?.first_name && ` (${request.student.first_name} ${request.student.last_name})`}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Parent: {request.parent_name || 'Non renseigné'}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {request.request_type === 'nouvelle_inscription' 
                          ? `Demande d'inscription en ${request.requested_class}`
                          : request.request_type === 'redoublement'
                          ? `Redoublement ${request.current_class} → ${request.requested_class}`
                          : `Transfert vers ${request.requested_class}`
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
                      <p>Soumis par: {request.submitted_by_user?.full_name || 'Système'}</p>
                      <p>Date: {new Date(request.submitted_date).toLocaleDateString('fr-FR')}</p>
                      {request.reason && <p>Motif: {request.reason}</p>}
                      {request.teacher_recommendation && <p>Avis enseignant: {request.teacher_recommendation}</p>}
                      {request.previous_school && <p>École précédente: {request.previous_school}</p>}
                    </div>
                  </div>
                  {request.documents && Array.isArray(request.documents) && request.documents.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-text-primary mb-2">Documents fournis</p>
                      <div className="space-y-1">
                        {request.documents.map((doc, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm text-text-secondary">
                            <Icon 
                              name={doc.uploaded ? "FileCheck" : "FileX"} 
                              size={14} 
                              className={doc.uploaded ? "text-success" : "text-warning"} 
                            />
                            <span>{typeof doc === 'string' ? doc : doc.name}</span>
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
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon name="TrendingUp" size={32} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-2">
                  Passages de Classe - En Développement
                </h3>
                <p className="text-sm text-text-secondary max-w-2xl">
                  Cette fonctionnalité permettra de gérer automatiquement les passages de classe 
                  en fonction des résultats scolaires et des recommandations des enseignants.
                </p>
                <div className="mt-4 text-xs text-gray-500">
                  <p>📋 Fonctionnalités prévues :</p>
                  <ul className="mt-2 space-y-1 text-left inline-block">
                    <li>• Calcul automatique des passages selon les moyennes</li>
                    <li>• Validation des redoublements</li>
                    <li>• Génération des listes de classes pour l'année suivante</li>
                    <li>• Notifications aux parents</li>
                  </ul>
                </div>
              </div>
              {isProduction && (
                <div className="mt-4 px-4 py-2 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 En attendant, utilisez l'onglet <strong>"Demandes en attente"</strong> pour gérer 
                    les inscriptions et redoublements manuellement.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section Demandes approuvées */}
      {activeSection === 'approved' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="CheckCircle" size={32} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-2">
                  Demandes Validées
                </h3>
                <p className="text-sm text-text-secondary max-w-2xl">
                  {isProduction ? (
                    <>
                      Vous avez <strong>{validationStats.approuvees || 0} demande(s) approuvée(s)</strong>.
                      <br />
                      L'historique complet des validations sera bientôt disponible ici.
                    </>
                  ) : (
                    "L'historique des demandes approuvées s'affichera ici une fois que vous commencerez à valider des demandes."
                  )}
                </p>
              </div>
              {isProduction && validationStats.approuvees > 0 && (
                <Button variant="outline">
                  <Icon name="Download" size={16} className="mr-2" />
                  Exporter la liste ({validationStats.approuvees})
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section Configuration */}
      {activeSection === 'settings' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Icon name="Settings" size={32} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-2">
                  Configuration Année Scolaire - En Développement
                </h3>
                <p className="text-sm text-text-secondary max-w-2xl">
                  Cette fonctionnalité permettra de configurer les paramètres de l'année scolaire 
                  et de gérer la transition entre les années académiques.
                </p>
                <div className="mt-4 text-xs text-gray-500">
                  <p>⚙️ Paramètres prévus :</p>
                  <ul className="mt-2 space-y-1 text-left inline-block">
                    <li>• Dates de début et fin d'année scolaire</li>
                    <li>• Configuration des trimestres/semestres</li>
                    <li>• Génération automatique des listes de classe</li>
                    <li>• Archivage de l'année précédente</li>
                    <li>• Migration des données élèves</li>
                  </ul>
                </div>
              </div>
              {isProduction && (
                <div className="mt-4 px-4 py-2 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-700">
                    💡 Pour l'instant, contactez l'administrateur système pour modifier 
                    les paramètres de l'année scolaire dans la base de données.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de création de demande */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Nouvelle demande d'inscription
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Icon name="X" size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Type de demande */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de demande *
                </label>
                <select
                  value={newRequest.request_type}
                  onChange={(e) => setNewRequest({ ...newRequest, request_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="nouvelle_inscription">Nouvelle inscription</option>
                  <option value="redoublement">Redoublement</option>
                  <option value="transfert">Transfert</option>
                </select>
              </div>

              {/* Informations élève */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom de l'élève *
                  </label>
                  <input
                    type="text"
                    value={newRequest.student_first_name}
                    onChange={(e) => setNewRequest({ ...newRequest, student_first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Marie"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'élève *
                  </label>
                  <input
                    type="text"
                    value={newRequest.student_last_name}
                    onChange={(e) => setNewRequest({ ...newRequest, student_last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Talla"
                  />
                </div>
              </div>

              {/* Informations parent */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du parent/tuteur
                  </label>
                  <input
                    type="text"
                    value={newRequest.parent_name}
                    onChange={(e) => setNewRequest({ ...newRequest, parent_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Joseph Talla"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone du parent
                  </label>
                  <input
                    type="tel"
                    value={newRequest.parent_phone}
                    onChange={(e) => setNewRequest({ ...newRequest, parent_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: 237 6XX XX XX XX"
                  />
                </div>
              </div>

              {/* Classe demandée */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Classe demandée *
                  </label>
                  <input
                    type="text"
                    value={newRequest.requested_class}
                    onChange={(e) => setNewRequest({ ...newRequest, requested_class: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: CE1, 6ème, 2nde..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={newRequest.priority}
                    onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="normal">Normale</option>
                    <option value="urgent">Urgente</option>
                    <option value="faible">Faible</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateRequest}
                disabled={loading}
              >
                {loading ? 'Création...' : 'Créer la demande'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolYearValidationTab;