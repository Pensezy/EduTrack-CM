import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import useDashboardData from '../../../hooks/useDashboardData';

const PersonnelManagement = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPersonnelType, setSelectedPersonnelType] = useState('teacher');

  // Hook pour les données avec switch automatique démo/production
  const { data, loading, isDemo, loadPersonnel } = useDashboardData();
  const [newPersonnel, setNewPersonnel] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    type: 'teacher',
    subject: '',
    role: '',
    permissions: []
  });

  // Récupérer les données du personnel selon le mode (démo/production)
  const personnelData = data.personnel || [];
  
  // Données démo pour le mode démo uniquement
  const demoTeachers = [
    {
      id: 1,
      name: 'Marie Dubois',
      email: 'marie.dubois@edutrack.cm',
      phone: '237 6XX XXX XXX',
      subject: 'Mathématiques',
      type: 'teacher',
      status: 'active',
      classes: ['6èmeA', '5èmeB'],
      experience: '8 ans',
      evaluation: 4.8
    },
    {
      id: 2,
      name: 'Jean Kamto',
      email: 'jean.kamto@edutrack.cm',
      phone: '237 6XX XXX XXX',
      subject: 'Français',
      type: 'teacher',
      status: 'active',
      classes: ['4èmeA', '3èmeB'],
      experience: '12 ans',
      evaluation: 4.6
    }
  ];

  const demoSecretaries = [
    {
      id: 3,
      name: 'Fatima Ngo',
      email: 'fatima.ngo@edutrack.cm',
      phone: '237 6XX XXX XXX',
      role: 'Secrétaire Principale',
      type: 'secretary',
      status: 'active',
      permissions: ['student_management', 'document_management', 'grade_access'],
      experience: '6 ans'
    },
    {
      id: 4,
      name: 'Marie Essomba',
      email: 'marie.essomba@edutrack.cm',
      phone: '237 6XX XXX XXX',
      role: 'Secrétaire Adjointe',
      type: 'secretary',
      status: 'active',
      permissions: ['student_management', 'attendance_management'],
      experience: '3 ans'
    }
  ];

  // Utiliser les données selon le mode
  const teachers = isDemo ? demoTeachers : personnelData.filter(p => p.type === 'teacher');
  const secretaries = isDemo ? demoSecretaries : personnelData.filter(p => p.type === 'secretary');
  const allPersonnel = [...teachers, ...secretaries];

  const subjects = [
    'Mathématiques', 'Français', 'Anglais', 'Histoire-Géographie', 
    'Sciences Physiques', 'Sciences Naturelles', 'Éducation Physique', 
    'Arts Plastiques', 'Musique'
  ];

  const secretaryRoles = [
    'Secrétaire Standard', 'Secrétaire Principal(e)', 'Secrétaire Adjoint(e)'
  ];

  const availablePermissions = [
    { id: 'student_management', label: 'Gestion des élèves' },
    { id: 'document_management', label: 'Gestion des documents' },
    { id: 'grade_access', label: 'Accès aux notes' },
    { id: 'attendance_management', label: 'Gestion des absences' },
    { id: 'parent_communication', label: 'Communication parents' },
    { id: 'financial_records', label: 'Dossiers financiers' }
  ];

  const sectionTabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'BarChart3' },
    { id: 'teachers', label: 'Enseignants', icon: 'GraduationCap' },
    { id: 'secretaries', label: 'Secrétaires', icon: 'UserCheck' },
    { id: 'create', label: 'Ajouter Personnel', icon: 'UserPlus' }
  ];

  const handleInputChange = (field, value) => {
    setNewPersonnel(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionToggle = (permissionId) => {
    setNewPersonnel(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleCreatePersonnel = () => {
    console.log('Creating personnel:', newPersonnel);
    alert(`Compte ${newPersonnel.type === 'teacher' ? 'enseignant' : 'secrétaire'} créé pour ${newPersonnel.firstName} ${newPersonnel.lastName}`);
    setActiveSection('overview');
    setNewPersonnel({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      type: 'teacher',
      subject: '',
      role: '',
      permissions: []
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Actif</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Inactif</span>;
      case 'on_leave':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">En congé</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Inconnu</span>;
    }
  };

  const getPersonnelStats = () => {
    if (isDemo) {
      return [
        {
          title: 'Total Personnel',
          value: allPersonnel.length.toString(),
          change: '+2',
          changeType: 'positive',
          icon: 'Users',
          description: 'Actifs'
        },
        {
          title: 'Enseignants',
          value: teachers.length.toString(),
          change: '+1',
          changeType: 'positive',
          icon: 'GraduationCap',
          description: 'Titulaires et contractuels'
        },
        {
          title: 'Secrétaires',
          value: secretaries.length.toString(),
          change: '0',
          changeType: 'neutral',
          icon: 'UserCheck',
          description: 'Personnel administratif'
        },
        {
          title: 'Évaluations',
          value: '4.7/5',
          change: '+0.2',
          changeType: 'positive',
          icon: 'Star',
          description: 'Moyenne générale'
        }
      ];
    } else {
      // Mode production : données réelles ou zéro
      return [
        {
          title: 'Total Personnel',
          value: allPersonnel.length.toString(),
          change: '0',
          changeType: 'neutral',
          icon: 'Users',
          description: allPersonnel.length > 0 ? 'Actifs' : 'Aucun personnel enregistré'
        },
        {
          title: 'Enseignants',
          value: teachers.length.toString(),
          change: '0',
          changeType: 'neutral',
          icon: 'GraduationCap',
          description: teachers.length > 0 ? 'Titulaires et contractuels' : 'Aucun enseignant'
        },
        {
          title: 'Secrétaires',
          value: secretaries.length.toString(),
          change: '0',
          changeType: 'neutral',
          icon: 'UserCheck',
          description: secretaries.length > 0 ? 'Personnel administratif' : 'Aucun secrétaire'
        },
        {
          title: 'Évaluations',
          value: allPersonnel.length > 0 ? 'N/A' : '0/5',
          change: '0',
          changeType: 'neutral',
          icon: 'Star',
          description: allPersonnel.length > 0 ? 'Pas encore évalué' : 'Aucune évaluation'
        }
      ];
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getPersonnelStats().map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name={stat.icon} size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
              <div className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 
                stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stat.change}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <h3 className="text-lg font-heading font-heading-semibold text-card-foreground mb-4">
          Actions Rapides
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            className="justify-start h-12"
            onClick={() => setActiveSection('create')}
          >
            <Icon name="UserPlus" size={16} className="mr-2" />
            Ajouter Personnel
          </Button>
          <Button variant="outline" className="justify-start h-12">
            <Icon name="FileText" size={16} className="mr-2" />
            Rapport Personnel
          </Button>
          <Button variant="outline" className="justify-start h-12">
            <Icon name="Calendar" size={16} className="mr-2" />
            Emplois du Temps
          </Button>
        </div>
      </div>

      {/* Personnel récent */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <h3 className="text-lg font-heading font-heading-semibold text-card-foreground mb-4">
          Personnel Récemment Ajouté
        </h3>
        <div className="space-y-3">
          {allPersonnel.length > 0 ? (
            allPersonnel.slice(0, 3).map((person) => (
              <div key={person.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{person.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {person.type === 'teacher' ? person.subject : person.role}
                    </p>
                  </div>
                </div>
                {getStatusBadge(person.status)}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun personnel enregistré</p>
              <p className="text-sm text-muted-foreground mt-1">
                Commencez par ajouter des enseignants ou des secrétaires
              </p>
              <Button 
                className="mt-4" 
                onClick={() => setActiveSection('create')}
              >
                <Icon name="UserPlus" size={16} className="mr-2" />
                Ajouter Personnel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPersonnelList = (type) => {
    const personnel = type === 'teachers' ? teachers : secretaries;
    const title = type === 'teachers' ? 'Enseignants' : 'Secrétaires';
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading font-heading-semibold text-card-foreground">
            Liste des {title}
          </h3>
          <Button onClick={() => setActiveSection('create')}>
            <Icon name="Plus" size={16} className="mr-2" />
            Ajouter {type === 'teachers' ? 'Enseignant' : 'Secrétaire'}
          </Button>
        </div>
        
        <div className="space-y-4">
          {personnel.length > 0 ? (
            personnel.map((person) => (
              <div key={person.id} className="bg-card border border-border rounded-lg p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{person.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {person.type === 'teacher' ? person.subject : person.role}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center">
                          <Icon name="Mail" size={12} className="mr-1" />
                          {person.email}
                        </span>
                        <span className="flex items-center">
                          <Icon name="Phone" size={12} className="mr-1" />
                          {person.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      {getStatusBadge(person.status)}
                      <p className="text-xs text-muted-foreground mt-1">
                        Expérience: {person.experience}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Icon name="Eye" size={14} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Icon name="Edit" size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Icon 
                name={type === 'teachers' ? 'GraduationCap' : 'UserCheck'} 
                size={64} 
                className="text-muted-foreground mx-auto mb-4" 
              />
              <h4 className="text-lg font-medium text-foreground mb-2">
                Aucun {type === 'teachers' ? 'enseignant' : 'secrétaire'} enregistré
              </h4>
              <p className="text-muted-foreground mb-4">
                Commencez par ajouter {type === 'teachers' ? 'des enseignants' : 'des secrétaires'} à votre établissement
              </p>
              <Button onClick={() => setActiveSection('create')}>
                <Icon name="Plus" size={16} className="mr-2" />
                Ajouter {type === 'teachers' ? 'Enseignant' : 'Secrétaire'}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCreateForm = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-heading-semibold text-card-foreground">
          Ajouter un Nouveau Membre du Personnel
        </h3>
        <Button variant="ghost" onClick={() => setActiveSection('overview')}>
          <Icon name="X" size={16} />
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <div className="space-y-6">
          {/* Type de personnel */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Type de personnel
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setNewPersonnel(prev => ({ ...prev, type: 'teacher' }));
                  setSelectedPersonnelType('teacher');
                }}
                className={`flex items-center space-x-2 p-3 border rounded-lg transition-colors ${
                  newPersonnel.type === 'teacher' 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Icon name="GraduationCap" size={20} />
                <span>Enseignant</span>
              </button>
              <button
                onClick={() => {
                  setNewPersonnel(prev => ({ ...prev, type: 'secretary' }));
                  setSelectedPersonnelType('secretary');
                }}
                className={`flex items-center space-x-2 p-3 border rounded-lg transition-colors ${
                  newPersonnel.type === 'secretary' 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Icon name="UserCheck" size={20} />
                <span>Secrétaire</span>
              </button>
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Prénom *
              </label>
              <Input
                value={newPersonnel.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Prénom"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nom de famille *
              </label>
              <Input
                value={newPersonnel.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Nom de famille"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email professionnel *
              </label>
              <Input
                type="email"
                value={newPersonnel.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@edutrack.cm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Téléphone
              </label>
              <Input
                type="tel"
                value={newPersonnel.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+237 6XX XXX XXX"
              />
            </div>
          </div>

          {/* Champs spécifiques selon le type */}
          {newPersonnel.type === 'teacher' ? (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Matière enseignée *
              </label>
              <select
                value={newPersonnel.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full p-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Sélectionner une matière</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Rôle de secrétaire
                </label>
                <select
                  value={newPersonnel.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full p-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Sélectionner un rôle</option>
                  {secretaryRoles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-4">
                  Permissions
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                      <input
                        type="checkbox"
                        id={permission.id}
                        checked={newPersonnel.permissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                      />
                      <label htmlFor={permission.id} className="text-sm text-foreground cursor-pointer">
                        {permission.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-border">
            <Button 
              variant="outline" 
              onClick={() => setActiveSection('overview')}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleCreatePersonnel}
              disabled={!newPersonnel.firstName || !newPersonnel.lastName || !newPersonnel.email || 
                       (newPersonnel.type === 'teacher' && !newPersonnel.subject)}
            >
              <Icon name="UserPlus" size={16} className="mr-2" />
              Créer le Compte
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Navigation par onglets */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {sectionTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-md transition-all duration-200 ${
              activeSection === tab.id
                ? 'bg-white text-blue-600 shadow-sm font-medium' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon name={tab.icon} size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenu selon la section active */}
      <div className="transition-all duration-200">
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'teachers' && renderPersonnelList('teachers')}
        {activeSection === 'secretaries' && renderPersonnelList('secretaries')}
        {activeSection === 'create' && renderCreateForm()}
      </div>
    </div>
  );
};

export default PersonnelManagement;