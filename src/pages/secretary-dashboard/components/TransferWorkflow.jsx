import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const TransferWorkflow = () => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [newSchool, setNewSchool] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);
  const [transferCode, setTransferCode] = useState('');
  
  // Nouveaux états pour les fonctionnalités avancées
  const [activeTab, setActiveTab] = useState('new-transfer');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [transferHistory, setTransferHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // États pour les champs avancés
  const [parentContact, setParentContact] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('normal');
  const [documentTemplate, setDocumentTemplate] = useState('standard');

  const students = [
    { value: '1', label: 'Marie Dubois (CM2)' },
    { value: '2', label: 'Pierre Martin (CM1)' },
    { value: '3', label: 'Camille Rousseau (CE2)' },
    { value: '4', label: 'Lucas Bernard (CM2)' },
    { value: '5', label: 'Emma Leroy (CE1)' }
  ];

  const reasonOptions = [
    { value: 'relocation', label: 'Déménagement' },
    { value: 'school_choice', label: 'Choix d\'établissement' },
    { value: 'family_reasons', label: 'Raisons familiales' },
    { value: 'academic_reasons', label: 'Raisons pédagogiques' },
    { value: 'other', label: 'Autre' }
  ];

  const pendingTransfers = [
    {
      id: 1,
      studentName: "Camille Rousseau",
      studentId: "STU003",
      class: "CE2",
      transferDate: "20/12/2024",
      newSchool: "École Primaire Saint-Martin",
      reason: "Déménagement",
      status: "pending",
      transferCode: "TRF-2024-001",
      qrCode: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPgogIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZmZmIi8+CiAgPHRleHQgeD0iNTAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMDAwIj5RUjwvdGV4dD4KPC9zdmc+",
      parentNotified: true,
      documentsReady: false,
      createdAt: "2024-12-10",
      parentContact: "0123456789",
      urgency: "normal",
      progress: 45,
      timeline: [
        { step: "Demande initiée", completed: true, date: "10/12/2024" },
        { step: "Parents notifiés", completed: true, date: "11/12/2024" },
        { step: "Documents préparés", completed: false, date: null },
        { step: "Confirmation école", completed: false, date: null },
        { step: "Transfert effectué", completed: false, date: null }
      ]
    },
    {
      id: 2,
      studentName: "Emma Leroy",
      studentId: "STU005",
      class: "CE1",
      transferDate: "15/01/2025",
      newSchool: "École Élémentaire Victor Hugo",
      reason: "Choix d\'établissement",
      status: "confirmed",
      transferCode: "TRF-2024-002",
      qrCode: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPgogIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZmZmIi8+CiAgPHRleHQgeD0iNTAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMDAwIj5RUjwvdGV4dD4KPC9zdmc+",
      parentNotified: true,
      documentsReady: true,
      createdAt: "2024-12-05",
      parentContact: "0987654321",
      urgency: "high",
      progress: 90,
      timeline: [
        { step: "Demande initiée", completed: true, date: "05/12/2024" },
        { step: "Parents notifiés", completed: true, date: "05/12/2024" },
        { step: "Documents préparés", completed: true, date: "08/12/2024" },
        { step: "Confirmation école", completed: true, date: "10/12/2024" },
        { step: "Transfert effectué", completed: false, date: null }
      ]
    }
  ];

  // Historique des transferts complétés
  const completedTransfers = [
    {
      id: 101,
      studentName: "Lucas Martin",
      transferDate: "15/11/2024",
      newSchool: "École Élémentaire des Tilleuls",
      reason: "Déménagement",
      status: "completed",
      transferCode: "TRF-2024-095"
    },
    {
      id: 102,
      studentName: "Sophie Durand",
      transferDate: "22/10/2024",
      newSchool: "École Privée Sainte-Marie",
      reason: "Choix d'établissement",
      status: "completed",
      transferCode: "TRF-2024-087"
    }
  ];

  // Options avancées
  const urgencyOptions = [
    { value: 'low', label: 'Normale', color: 'text-success' },
    { value: 'normal', label: 'Standard', color: 'text-primary' },
    { value: 'high', label: 'Urgente', color: 'text-warning' },
    { value: 'critical', label: 'Critique', color: 'text-error' }
  ];

  const documentTemplates = [
    { value: 'standard', label: 'Certificat Standard' },
    { value: 'detailed', label: 'Certificat Détaillé' },
    { value: 'bilingual', label: 'Certificat Bilingue' },
    { value: 'international', label: 'Certificat International' }
  ];

  // Liste des établissements scolaires disponibles pour les transferts
  const availableSchools = [
    // Écoles publiques de la ville
    { value: 'ep_saint_martin', label: 'École Primaire Saint-Martin', type: 'public', district: 'Centre-Ville' },
    { value: 'ep_victor_hugo', label: 'École Élémentaire Victor Hugo', type: 'public', district: 'Nord' },
    { value: 'ep_jules_ferry', label: 'École Primaire Jules Ferry', type: 'public', district: 'Sud' },
    { value: 'ep_jean_jaures', label: 'École Élémentaire Jean Jaurès', type: 'public', district: 'Est' },
    { value: 'ep_marie_curie', label: 'École Primaire Marie Curie', type: 'public', district: 'Ouest' },
    { value: 'ep_tilleuls', label: 'École Élémentaire des Tilleuls', type: 'public', district: 'Centre-Ville' },
    
    // Écoles privées
    { value: 'pr_sainte_marie', label: 'École Privée Sainte-Marie', type: 'private', district: 'Centre-Ville' },
    { value: 'pr_saint_joseph', label: 'École Privée Saint-Joseph', type: 'private', district: 'Nord' },
    { value: 'pr_notre_dame', label: 'École Privée Notre-Dame', type: 'private', district: 'Sud' },
    { value: 'pr_saint_michel', label: 'École Privée Saint-Michel', type: 'private', district: 'Est' },
    
    // Écoles spécialisées
    { value: 'sp_montessori', label: 'École Montessori International', type: 'specialized', district: 'Centre-Ville' },
    { value: 'sp_waldorf', label: 'École Waldorf-Steiner', type: 'specialized', district: 'Ouest' },
    { value: 'sp_bilingue', label: 'École Bilingue Franco-Anglaise', type: 'specialized', district: 'Nord' },
    
    // Autres villes (communes limitrophes)
    { value: 'ext_colombes', label: 'École Primaire de Colombes', type: 'external', district: 'Colombes' },
    { value: 'ext_nanterre', label: 'École Élémentaire de Nanterre', type: 'external', district: 'Nanterre' },
    { value: 'ext_levallois', label: 'École Primaire de Levallois-Perret', type: 'external', district: 'Levallois' },
    { value: 'ext_boulogne', label: 'École de Boulogne-Billancourt', type: 'external', district: 'Boulogne' },
    
    // Option pour autre établissement
    { value: 'other', label: '⚠️ Autre établissement (à préciser)', type: 'other', district: 'Autre' }
  ];

  // Grouper les écoles par type pour une meilleure organisation
  const schoolsByType = {
    public: availableSchools.filter(school => school.type === 'public'),
    private: availableSchools.filter(school => school.type === 'private'),
    specialized: availableSchools.filter(school => school.type === 'specialized'),
    external: availableSchools.filter(school => school.type === 'external'),
    other: availableSchools.filter(school => school.type === 'other')
  };

  // État pour gérer l'école "autre"
  const [customSchoolName, setCustomSchoolName] = useState('');

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: 'En attente',
        className: 'bg-warning/10 text-warning',
        icon: 'Clock'
      },
      confirmed: {
        label: 'Confirmé',
        className: 'bg-success/10 text-success',
        icon: 'CheckCircle'
      },
      cancelled: {
        label: 'Annulé',
        className: 'bg-error/10 text-error',
        icon: 'XCircle'
      }
    };
    return configs?.[status] || configs?.pending;
  };

  const generateTransferCode = () => {
    const code = `TRF-${new Date()?.getFullYear()}-${String(Math.floor(Math.random() * 1000))?.padStart(3, '0')}`;
    setTransferCode(code);
    setQrCodeGenerated(true);
  };

  const handleInitiateTransfer = () => {
    if (!selectedStudent || !transferReason || !newSchool || !transferDate) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validation spéciale pour "autre établissement"
    if (newSchool === 'other' && !customSchoolName.trim()) {
      alert('Veuillez préciser le nom de l\'établissement');
      return;
    }

    generateTransferCode();
    
    const schoolName = newSchool === 'other' 
      ? customSchoolName.trim()
      : availableSchools.find(s => s.value === newSchool)?.label || newSchool;
    
    console.log('Initiate transfer:', {
      student: selectedStudent,
      reason: transferReason,
      newSchool: schoolName,
      date: transferDate,
      code: transferCode
    });
  };

  const handleSendConfirmation = (transferId) => {
    console.log('Send confirmation SMS for transfer:', transferId);
  };

  const handlePrintDocuments = (transferId) => {
    console.log('Print transfer documents for:', transferId);
  };

  const handleCancelTransfer = (transferId) => {
    console.log('Cancel transfer:', transferId);
  };

  const handleAdvancedTransferCreation = () => {
    if (!selectedStudent || !transferReason || !newSchool || !transferDate) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validation spéciale pour "autre établissement"
    if (newSchool === 'other' && !customSchoolName.trim()) {
      alert('Veuillez préciser le nom de l\'établissement');
      return;
    }

    // Déterminer le nom de l'école
    const schoolName = newSchool === 'other' 
      ? customSchoolName.trim()
      : availableSchools.find(s => s.value === newSchool)?.label || newSchool;

    // Créer un transfert avec toutes les options avancées
    const newTransfer = {
      id: Date.now(),
      studentName: students.find(s => s.value === selectedStudent)?.label || '',
      studentId: `STU${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      class: 'CM1', // À déterminer selon l'élève
      transferDate,
      newSchool: schoolName,
      reason: reasonOptions.find(r => r.value === transferReason)?.label || transferReason,
      status: 'pending',
      transferCode: `TRF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      parentContact,
      urgency: urgencyLevel,
      notes: transferNotes,
      documentTemplate,
      progress: 10,
      createdAt: new Date().toISOString().split('T')[0],
      timeline: [
        { step: "Demande initiée", completed: true, date: new Date().toLocaleDateString('fr-FR') },
        { step: "Parents notifiés", completed: false, date: null },
        { step: "Documents préparés", completed: false, date: null },
        { step: "Confirmation école", completed: false, date: null },
        { step: "Transfert effectué", completed: false, date: null }
      ]
    };

    generateTransferCode();
    
    // Simuler l'ajout à la base de données
    console.log('Nouveau transfert créé:', newTransfer);
    
    // Réinitialiser les champs
    setSelectedStudent('');
    setTransferReason('');
    setNewSchool('');
    setTransferDate('');
    setParentContact('');
    setTransferNotes('');
    setUrgencyLevel('normal');
    setDocumentTemplate('standard');
    setCustomSchoolName('');
    setShowAdvancedOptions(false);
    
    // Changer d'onglet pour voir le résultat
    setActiveTab('pending');
  };

  const handleUpdateTransferStatus = (transferId, newStatus) => {
    console.log('Update transfer status:', transferId, newStatus);
    // Logique de mise à jour du statut
  };

  const handleGenerateDocuments = (transfer) => {
    console.log('Generate documents for transfer:', transfer.id);
    console.log('Using template:', transfer.documentTemplate || 'standard');
    // Logique de génération de documents
  };

  const handleBulkAction = (action, transferIds) => {
    console.log('Bulk action:', action, transferIds);
    // Actions en lot : notifications, impressions, etc.
  };

  return (
    <div className="space-y-6">
      {/* Header avec navigation par onglets */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="font-heading font-heading-bold text-xl text-text-primary">
            Gestion des Transferts
          </h2>
          <p className="font-body font-body-normal text-sm text-text-secondary mt-1">
            Processus complet de transfert d'élèves avec suivi automatisé
          </p>
        </div>
        
        {/* Actions rapides */}
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            onClick={() => console.log('Export transfers')}
          >
            Exporter
          </Button>
          <Button
            variant="default"
            iconName="Plus"
            iconPosition="left"
            onClick={() => setActiveTab('new-transfer')}
          >
            Nouveau transfert
          </Button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-card rounded-lg border border-border">
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'new-transfer', label: 'Nouveau Transfert', icon: 'Plus' },
              { id: 'pending', label: 'En Cours', icon: 'Clock', count: pendingTransfers.length },
              { id: 'history', label: 'Historique', icon: 'Archive', count: completedTransfers.length },
              { id: 'analytics', label: 'Statistiques', icon: 'BarChart3' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-muted'
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Contenu des onglets */}
          {activeTab === 'new-transfer' && renderNewTransferTab()}
          {activeTab === 'pending' && renderPendingTransfersTab()}
          {activeTab === 'history' && renderHistoryTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </div>
      </div>
    </div>
  );

  // Fonction pour rendre l'onglet nouveau transfert
  function renderNewTransferTab() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-2">
            Nouveau transfert d'élève
          </h3>
          <p className="font-body font-body-normal text-sm text-text-secondary">
            Initier une demande de transfert avec génération automatique de documents
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Select
            label="Élève à transférer"
            placeholder="Sélectionner un élève"
            options={students}
            value={selectedStudent}
            onChange={setSelectedStudent}
            required
          />
          <Select
            label="Motif du transfert"
            placeholder="Sélectionner un motif"
            options={reasonOptions}
            value={transferReason}
            onChange={setTransferReason}
            required
          />
          <div>
            <Select
              label="Nouvel établissement"
              placeholder="Sélectionner l'école de destination"
              value={newSchool}
              onChange={setNewSchool}
              required
            >
              <optgroup label="🏫 Écoles Publiques">
                {schoolsByType.public.map(school => (
                  <option key={school.value} value={school.value}>
                    {school.label} ({school.district})
                  </option>
                ))}
              </optgroup>
              <optgroup label="🏛️ Écoles Privées">
                {schoolsByType.private.map(school => (
                  <option key={school.value} value={school.value}>
                    {school.label} ({school.district})
                  </option>
                ))}
              </optgroup>
              <optgroup label="🎓 Écoles Spécialisées">
                {schoolsByType.specialized.map(school => (
                  <option key={school.value} value={school.value}>
                    {school.label} ({school.district})
                  </option>
                ))}
              </optgroup>
              <optgroup label="🌍 Autres Communes">
                {schoolsByType.external.map(school => (
                  <option key={school.value} value={school.value}>
                    {school.label} ({school.district})
                  </option>
                ))}
              </optgroup>
              <optgroup label="⚙️ Options">
                {schoolsByType.other.map(school => (
                  <option key={school.value} value={school.value}>
                    {school.label}
                  </option>
                ))}
              </optgroup>
            </Select>
            
            {/* Informations sur l'école sélectionnée */}
            {newSchool && newSchool !== 'other' && (
              <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    availableSchools.find(s => s.value === newSchool)?.type === 'public' ? 'bg-blue-100 text-blue-600' :
                    availableSchools.find(s => s.value === newSchool)?.type === 'private' ? 'bg-purple-100 text-purple-600' :
                    availableSchools.find(s => s.value === newSchool)?.type === 'specialized' ? 'bg-green-100 text-green-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    <Icon name={
                      availableSchools.find(s => s.value === newSchool)?.type === 'public' ? 'School' :
                      availableSchools.find(s => s.value === newSchool)?.type === 'private' ? 'Crown' :
                      availableSchools.find(s => s.value === newSchool)?.type === 'specialized' ? 'Star' :
                      'MapPin'
                    } size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text-primary text-sm">
                      {availableSchools.find(s => s.value === newSchool)?.label}
                    </p>
                    <p className="text-xs text-text-secondary flex items-center space-x-2">
                      <span>District: {availableSchools.find(s => s.value === newSchool)?.district}</span>
                      <span>•</span>
                      <span className="capitalize">
                        {availableSchools.find(s => s.value === newSchool)?.type === 'public' ? 'École Publique' :
                         availableSchools.find(s => s.value === newSchool)?.type === 'private' ? 'École Privée' :
                         availableSchools.find(s => s.value === newSchool)?.type === 'specialized' ? 'École Spécialisée' :
                         'Externe'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Champ conditionnel pour "autre établissement" */}
            {newSchool === 'other' && (
              <div className="mt-3">
                <Input
                  label="Nom de l'établissement"
                  type="text"
                  placeholder="Saisir le nom complet de l'établissement"
                  value={customSchoolName}
                  onChange={(e) => setCustomSchoolName(e.target.value)}
                  required
                  className="border-warning focus:border-warning focus:ring-warning/20"
                />
                <p className="text-xs text-warning mt-1 flex items-center">
                  <Icon name="AlertTriangle" size={12} className="mr-1" />
                  Veuillez vérifier l'exactitude du nom de l'établissement
                </p>
                <div className="mt-2 p-3 bg-warning/5 rounded-lg border border-warning/20">
                  <p className="text-xs text-text-secondary">
                    <strong>Note:</strong> Si l'établissement n'apparaît pas dans la liste, 
                    contactez l'administrateur pour l'ajouter à la base de données.
                  </p>
                </div>
              </div>
            )}
          </div>
          <Input
            label="Date de transfert"
            type="date"
            value={transferDate}
            onChange={(e) => setTransferDate(e?.target?.value)}
            required
          />
        </div>

        {qrCodeGenerated && (
          <div className="bg-accent/5 rounded-lg border border-accent/20 p-4 mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white border border-border rounded-lg flex items-center justify-center">
                <img 
                  src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMDAwIi8+CiAgPHJlY3QgeD0iNSIgeT0iNSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZmZmIi8+CiAgPHRleHQgeD0iMzAiIHk9IjM1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjgiIGZpbGw9IiMwMDAiPlFSPC90ZXh0Pgo8L3N2Zz4K"
                  alt="QR Code"
                  className="w-16 h-16"
                />
              </div>
              <div>
                <p className="font-heading font-heading-semibold text-sm text-text-primary">
                  Code de transfert généré
                </p>
                <p className="font-mono text-lg text-primary font-bold">
                  {transferCode}
                </p>
                <p className="font-caption font-caption-normal text-xs text-text-secondary">
                  Ce QR code sera envoyé aux parents par SMS
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Options avancées */}
        {showAdvancedOptions && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-muted/20 rounded-lg border border-muted">
            <Input
              label="Contact parent"
              type="tel"
              placeholder="Numéro de téléphone"
              value={parentContact}
              onChange={(e) => setParentContact(e.target.value)}
            />
            <Select
              label="Niveau d'urgence"
              options={urgencyOptions}
              value={urgencyLevel}
              onChange={setUrgencyLevel}
            />
            <Select
              label="Template de document"
              options={documentTemplates}
              value={documentTemplate}
              onChange={setDocumentTemplate}
            />
            <Input
              label="Notes particulières"
              type="text"
              placeholder="Informations complémentaires"
              value={transferNotes}
              onChange={(e) => setTransferNotes(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            iconName={showAdvancedOptions ? "ChevronUp" : "ChevronDown"}
            iconPosition="left"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            Options avancées
          </Button>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              iconName="Save"
              iconPosition="left"
              onClick={() => console.log('Save draft')}
            >
              Sauvegarder brouillon
            </Button>
            <Button
              variant="default"
              iconName="Send"
              iconPosition="left"
              onClick={showAdvancedOptions ? handleAdvancedTransferCreation : handleInitiateTransfer}
            >
              Initier le transfert
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fonction pour rendre l'onglet transferts en cours
  function renderPendingTransfersTab() {
    const filteredTransfers = pendingTransfers.filter(transfer => {
      const matchesSearch = transfer.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          transfer.transferCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || transfer.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-6">
        {/* Filtres et recherche */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Rechercher un transfert..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Select
              placeholder="Tous les statuts"
              options={[
                { value: 'all', label: 'Tous les statuts' },
                { value: 'pending', label: 'En attente' },
                { value: 'confirmed', label: 'Confirmé' },
                { value: 'cancelled', label: 'Annulé' }
              ]}
              value={filterStatus}
              onChange={setFilterStatus}
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">Trier par:</span>
            <Select
              options={[
                { value: 'date', label: 'Date' },
                { value: 'name', label: 'Nom' },
                { value: 'status', label: 'Statut' },
                { value: 'progress', label: 'Progression' }
              ]}
              value={sortBy}
              onChange={setSortBy}
            />
          </div>
        </div>
        {/* Liste des transferts */}
        <div className="space-y-4">
          {filteredTransfers.map((transfer) => {
            const statusConfig = getStatusConfig(transfer.status);

            return (
              <div key={transfer.id} className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <img 
                        src={transfer.qrCode}
                        alt="QR Code"
                        className="w-12 h-12"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-body font-body-semibold text-lg text-text-primary">
                          {transfer.studentName}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-caption font-caption-normal ${statusConfig.className}`}>
                          {statusConfig.label}
                        </span>
                        {transfer.urgency === 'high' && (
                          <span className="px-2 py-1 rounded-full text-xs bg-warning/10 text-warning">
                            Urgent
                          </span>
                        )}
                      </div>
                      
                      {/* Barre de progression */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-text-secondary">Progression</span>
                          <span className="text-xs text-text-secondary">{transfer.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${transfer.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-text-secondary">
                          <span className="font-semibold">ID:</span> {transfer.studentId}
                        </p>
                        <p className="text-text-secondary">
                          <span className="font-semibold">Classe:</span> {transfer.class}
                        </p>
                        <p className="text-text-secondary">
                          <span className="font-semibold">Vers:</span> {transfer.newSchool}
                        </p>
                        <p className="text-text-secondary">
                          <span className="font-semibold">Date:</span> {transfer.transferDate}
                        </p>
                      </div>
                      <p className="font-mono text-sm text-primary mt-2">
                        Code: {transfer.transferCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedTransfer(transfer);
                        setShowTransferModal(true);
                      }}
                      title="Voir détails"
                    >
                      <Icon name="Eye" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSendConfirmation(transfer.id)}
                      title="Envoyer notification"
                    >
                      <Icon name="MessageSquare" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePrintDocuments(transfer.id)}
                      title="Imprimer documents"
                    >
                      <Icon name="Printer" size={16} />
                    </Button>
                  </div>
                </div>

                {/* Timeline mini */}
                <div className="mt-4 flex items-center space-x-4 text-xs">
                  {transfer.timeline.slice(0, 3).map((step, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <Icon 
                        name={step.completed ? "CheckCircle" : "Circle"} 
                        size={14} 
                        className={step.completed ? "text-success" : "text-muted-foreground"}
                      />
                      <span className={step.completed ? "text-text-primary" : "text-text-secondary"}>
                        {step.step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {filteredTransfers.length === 0 && (
          <div className="p-8 text-center">
            <Icon name="ArrowRightLeft" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="font-body font-body-normal text-text-secondary">
              {searchQuery ? 'Aucun transfert trouvé' : 'Aucun transfert en cours'}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Fonction pour rendre l'onglet historique
  function renderHistoryTab() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
            Historique des transferts
          </h3>
          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            onClick={() => console.log('Export history')}
          >
            Exporter historique
          </Button>
        </div>

        <div className="space-y-3">
          {completedTransfers.map((transfer) => (
            <div key={transfer.id} className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-body font-body-semibold text-text-primary">
                    {transfer.studentName}
                  </h4>
                  <p className="text-sm text-text-secondary">
                    Transféré vers {transfer.newSchool} le {transfer.transferDate}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Code: {transfer.transferCode} • Motif: {transfer.reason}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs bg-success/10 text-success">
                  Complété
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fonction pour rendre l'onglet analytics
  function renderAnalyticsTab() {
    return (
      <div className="space-y-6">
        <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
          Statistiques des transferts
        </h3>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="ArrowRightLeft" size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-heading font-heading-semibold text-lg text-text-primary">
                  {pendingTransfers.length}
                </p>
                <p className="font-caption font-caption-normal text-xs text-text-secondary">
                  En cours
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
                  {completedTransfers.length}
                </p>
                <p className="font-caption font-caption-normal text-xs text-text-secondary">
                  Complétés
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
                  {pendingTransfers.filter(t => t.urgency === 'high').length}
                </p>
                <p className="font-caption font-caption-normal text-xs text-text-secondary">
                  Urgents
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                <Icon name="TrendingUp" size={20} className="text-info" />
              </div>
              <div>
                <p className="font-heading font-heading-semibold text-lg text-text-primary">
                  {Math.round(pendingTransfers.reduce((acc, t) => acc + t.progress, 0) / pendingTransfers.length) || 0}%
                </p>
                <p className="font-caption font-caption-normal text-xs text-text-secondary">
                  Progression moyenne
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Écoles les plus demandées */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h4 className="font-heading font-heading-semibold text-lg text-text-primary mb-4">
            Établissements les plus demandés
          </h4>
          <div className="space-y-3">
            {[
              { name: 'École Primaire Saint-Martin', count: 8, trend: '+2' },
              { name: 'École Privée Sainte-Marie', count: 6, trend: '+1' },
              { name: 'École Élémentaire Victor Hugo', count: 5, trend: '0' },
              { name: 'École Montessori International', count: 4, trend: '+3' }
            ].map((school, index) => (
              <div key={school.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-sm text-text-primary">{school.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-text-primary">{school.count}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    school.trend.startsWith('+') ? 'bg-success/10 text-success' :
                    school.trend === '0' ? 'bg-muted text-text-secondary' :
                    'bg-error/10 text-error'
                  }`}>
                    {school.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Graphique des motifs de transfert */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h4 className="font-heading font-heading-semibold text-lg text-text-primary mb-4">
            Répartition des motifs de transfert
          </h4>
          <div className="space-y-3">
            {['Déménagement', 'Choix d\'établissement', 'Raisons familiales', 'Raisons pédagogiques'].map((reason, index) => {
              const count = [...pendingTransfers, ...completedTransfers].filter(t => t.reason === reason).length;
              const percentage = Math.round((count / (pendingTransfers.length + completedTransfers.length)) * 100) || 0;
              
              return (
                <div key={reason}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-text-primary">{reason}</span>
                    <span className="text-sm text-text-secondary">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === 0 ? 'bg-primary' :
                        index === 1 ? 'bg-success' :
                        index === 2 ? 'bg-warning' : 'bg-info'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Modal de détails d'un transfert
  const renderTransferModal = () => {
    if (!showTransferModal || !selectedTransfer) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-lg border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-heading-semibold text-xl text-text-primary">
                  Transfert de {selectedTransfer.studentName}
                </h3>
                <p className="text-sm text-text-secondary">
                  Code: {selectedTransfer.transferCode}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTransferModal(false)}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Timeline détaillée */}
            <div>
              <h4 className="font-heading font-heading-semibold text-lg text-text-primary mb-4">
                Progression du transfert
              </h4>
              <div className="space-y-4">
                {selectedTransfer.timeline.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed 
                        ? 'bg-success text-white' 
                        : index === selectedTransfer.timeline.findIndex(s => !s.completed)
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {step.completed ? (
                        <Icon name="Check" size={16} />
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        step.completed ? 'text-text-primary' : 'text-text-secondary'
                      }`}>
                        {step.step}
                      </p>
                      {step.date && (
                        <p className="text-xs text-text-secondary">{step.date}</p>
                      )}
                    </div>
                    {!step.completed && index === selectedTransfer.timeline.findIndex(s => !s.completed) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateTransferStatus(selectedTransfer.id, `step-${index}`)}
                      >
                        Marquer comme fait
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Informations détaillées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-heading font-heading-semibold text-lg text-text-primary mb-3">
                  Informations élève
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Nom:</span> {selectedTransfer.studentName}</p>
                  <p><span className="font-semibold">ID:</span> {selectedTransfer.studentId}</p>
                  <p><span className="font-semibold">Classe:</span> {selectedTransfer.class}</p>
                  <p><span className="font-semibold">Contact parent:</span> {selectedTransfer.parentContact}</p>
                </div>
              </div>

              <div>
                <h4 className="font-heading font-heading-semibold text-lg text-text-primary mb-3">
                  Détails du transfert
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Nouvelle école:</span> {selectedTransfer.newSchool}</p>
                  <p><span className="font-semibold">Date prévue:</span> {selectedTransfer.transferDate}</p>
                  <p><span className="font-semibold">Motif:</span> {selectedTransfer.reason}</p>
                  <p><span className="font-semibold">Urgence:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      selectedTransfer.urgency === 'high' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                    }`}>
                      {urgencyOptions.find(o => o.value === selectedTransfer.urgency)?.label}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code et actions */}
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center space-x-4">
                <img 
                  src={selectedTransfer.qrCode}
                  alt="QR Code"
                  className="w-16 h-16 border border-border rounded"
                />
                <div>
                  <p className="font-semibold text-text-primary">QR Code de transfert</p>
                  <p className="text-sm text-text-secondary">
                    Scannez ce code pour accéder aux informations du transfert
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  iconName="Download"
                  iconPosition="left"
                  onClick={() => console.log('Download QR Code')}
                >
                  Télécharger
                </Button>
                <Button
                  variant="outline"
                  iconName="Share"
                  iconPosition="left"
                  onClick={() => setShowNotificationModal(true)}
                >
                  Partager
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                iconName="Printer"
                iconPosition="left"
                onClick={() => handleGenerateDocuments(selectedTransfer)}
              >
                Imprimer documents
              </Button>
              <Button
                variant="outline"
                iconName="MessageSquare"
                iconPosition="left"
                onClick={() => setShowNotificationModal(true)}
              >
                Envoyer notification
              </Button>
              <Button
                variant="default"
                iconName="Save"
                iconPosition="left"
                onClick={() => setShowTransferModal(false)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header avec navigation par onglets */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="font-heading font-heading-bold text-xl text-text-primary">
            Gestion des Transferts
          </h2>
          <p className="font-body font-body-normal text-sm text-text-secondary mt-1">
            Processus complet de transfert d'élèves avec suivi automatisé
          </p>
        </div>
        
        {/* Actions rapides */}
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            onClick={() => console.log('Export transfers')}
          >
            Exporter
          </Button>
          <Button
            variant="default"
            iconName="Plus"
            iconPosition="left"
            onClick={() => setActiveTab('new-transfer')}
          >
            Nouveau transfert
          </Button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-card rounded-lg border border-border">
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'new-transfer', label: 'Nouveau Transfert', icon: 'Plus' },
              { id: 'pending', label: 'En Cours', icon: 'Clock', count: pendingTransfers.length },
              { id: 'history', label: 'Historique', icon: 'Archive', count: completedTransfers.length },
              { id: 'analytics', label: 'Statistiques', icon: 'BarChart3' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-muted'
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Contenu des onglets */}
          {activeTab === 'new-transfer' && renderNewTransferTab()}
          {activeTab === 'pending' && renderPendingTransfersTab()}
          {activeTab === 'history' && renderHistoryTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </div>
      </div>

      {/* Modals */}
      {renderTransferModal()}
    </div>
  );
};

export default TransferWorkflow;