import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const PersonnelManagement = () => {
  const [activeSection, setActiveSection] = useState('secretaries');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'secretary',
    permissions: []
  });

  const existingSecretaries = [
    {
      id: 1,
      name: 'Fatima Ngo',
      email: 'fatima.ngo@edutrack.cm',
      phone: '237 6XX XXX XXX',
      role: 'Secrétaire Principale',
      status: 'active',
      createdDate: '2023-09-01',
      lastLogin: '2024-09-25 08:30'
    },
    {
      id: 2,
      name: 'Marie Essomba',
      email: 'marie.essomba@edutrack.cm',
      phone: '237 6XX XXX XXX',
      role: 'Secrétaire Adjointe',
      status: 'active',
      createdDate: '2024-01-15',
      lastLogin: '2024-09-24 16:45'
    }
  ];

  const availablePermissions = [
    { id: 'student_management', label: 'Gestion des élèves', description: 'Créer, modifier, supprimer des profils élèves' },
    { id: 'document_management', label: 'Gestion des documents', description: 'Télécharger et organiser les documents' },
    { id: 'grade_access', label: 'Accès aux notes', description: 'Consulter et imprimer les bulletins' },
    { id: 'attendance_management', label: 'Gestion des absences', description: 'Enregistrer les présences et absences' },
    { id: 'parent_communication', label: 'Communication parents', description: 'Envoyer des notifications aux parents' },
    { id: 'financial_records', label: 'Dossiers financiers', description: 'Accès aux informations de paiement' }
  ];

  const handleInputChange = (field, value) => {
    setNewAccount(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionToggle = (permissionId) => {
    setNewAccount(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleCreateAccount = () => {
    console.log('Creating secretary account:', newAccount);
    // Ici vous ajouteriez la logique de création via Supabase
    alert(`Compte secrétaire créé pour ${newAccount.firstName} ${newAccount.lastName}`);
    setShowCreateForm(false);
    setNewAccount({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'secretary',
      permissions: []
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Actif</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Inactif</span>;
      case 'suspended':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Suspendu</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Inconnu</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-4 shadow-card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="Users" size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Secrétaires Actifs</p>
              <p className="text-2xl font-bold text-foreground">{existingSecretaries.filter(s => s.status === 'active').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4 shadow-card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="UserCheck" size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Connexions Aujourd'hui</p>
              <p className="text-2xl font-bold text-foreground">2</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 shadow-card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="Shield" size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Permissions Accordées</p>
              <p className="text-2xl font-bold text-foreground">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section principale */}
      <div className="bg-card border border-border rounded-lg shadow-card">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon name="UserPlus" size={24} className="text-primary" />
              <div>
                <h2 className="text-xl font-heading font-heading-semibold text-card-foreground">
                  Gestion du Personnel Administratif
                </h2>
                <p className="text-sm text-muted-foreground">
                  Créer et gérer les comptes des secrétaires de l'établissement
                </p>
              </div>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Icon name="Plus" size={16} className="mr-2" />
              Nouveau Secrétaire
            </Button>
          </div>
        </div>

        {!showCreateForm ? (
          /* Liste des secrétaires existants */
          <div className="p-6">
            <div className="space-y-4">
              {existingSecretaries.map((secretary) => (
                <div key={secretary.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {secretary.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{secretary.name}</h3>
                        <p className="text-sm text-muted-foreground">{secretary.role}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center">
                            <Icon name="Mail" size={12} className="mr-1" />
                            {secretary.email}
                          </span>
                          <span className="flex items-center">
                            <Icon name="Phone" size={12} className="mr-1" />
                            {secretary.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        {getStatusBadge(secretary.status)}
                        <p className="text-xs text-muted-foreground mt-1">
                          Créé le {new Date(secretary.createdDate).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Dernière connexion: {new Date(secretary.lastLogin).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Icon name="Eye" size={14} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Icon name="Edit" size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Formulaire de création */
          <div className="p-6">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-heading font-heading-semibold text-card-foreground">
                  Créer un Nouveau Compte Secrétaire
                </h3>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowCreateForm(false)}
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Informations personnelles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Prénom *
                    </label>
                    <Input
                      value={newAccount.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Prénom du secrétaire"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nom de famille *
                    </label>
                    <Input
                      value={newAccount.lastName}
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
                      value={newAccount.email}
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
                      value={newAccount.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+237 6XX XXX XXX"
                    />
                  </div>
                </div>

                {/* Type de secrétaire */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Type de secrétaire
                  </label>
                  <select
                    value={newAccount.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full p-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="secretary">Secrétaire Standard</option>
                    <option value="head_secretary">Secrétaire Principal(e)</option>
                    <option value="assistant_secretary">Secrétaire Adjoint(e)</option>
                  </select>
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-4">
                    Permissions et Accès
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {availablePermissions.map((permission) => (
                      <div key={permission.id} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                        <input
                          type="checkbox"
                          id={permission.id}
                          checked={newAccount.permissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="mt-1 h-4 w-4 text-primary border-border rounded focus:ring-primary"
                        />
                        <div className="flex-1">
                          <label htmlFor={permission.id} className="font-medium text-foreground cursor-pointer">
                            {permission.label}
                          </label>
                          <p className="text-sm text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleCreateAccount}
                    disabled={!newAccount.firstName || !newAccount.lastName || !newAccount.email}
                  >
                    <Icon name="UserPlus" size={16} className="mr-2" />
                    Créer le Compte
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section d'aide */}
      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground mb-1">Information importante</h4>
            <p className="text-sm text-muted-foreground">
              Les comptes secrétaires créés recevront automatiquement un email avec leurs identifiants de connexion. 
              Ils devront changer leur mot de passe lors de la première connexion. Vous pouvez modifier les permissions 
              à tout moment depuis cette interface.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonnelManagement;