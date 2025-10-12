import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Image from '../../../components/AppImage';

const TeacherManagementTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddTeacherForm, setShowAddTeacherForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [newTeacher, setNewTeacher] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    className: '',
    password: '',
    confirmPassword: ''
  });

  const initialTeachers = [
    {
      id: 1,
      fullName: "Marie Nguema",
      email: "marie.nguema@school.cm",
      phone: "+237 6 78 90 12 34",
      subject: "Français",
      className: "CM2",
      status: "active",
      joinDate: "15/09/2024",
      teacherId: "PROF001",
      avatar: "/public/assets/images/no_image.png"
    },
    {
      id: 2,
      fullName: "Paul Mbarga",
      email: "paul.mbarga@school.cm",
      phone: "+237 6 89 01 23 45",
      subject: "Mathématiques",
      className: "CM1",
      status: "active",
      joinDate: "12/09/2024",
      teacherId: "PROF002",
      avatar: "/public/assets/images/no_image.png"
    },
    {
      id: 3,
      fullName: "Sophie Fouda",
      email: "sophie.fouda@school.cm",
      phone: "+237 6 90 12 34 56",
      subject: "Sciences",
      className: "CE2",
      status: "active",
      joinDate: "10/09/2024",
      teacherId: "PROF003",
      avatar: "/public/assets/images/no_image.png"
    },
    {
      id: 4,
      fullName: "Jean Biya",
      email: "jean.biya@school.cm",
      phone: "+237 6 01 23 45 67",
      subject: "Histoire-Géographie",
      className: "CE1",
      status: "inactive",
      joinDate: "08/09/2024",
      teacherId: "PROF004",
      avatar: "/public/assets/images/no_image.png"
    }
  ];

  const [teachers, setTeachers] = useState(initialTeachers);

  const subjectOptions = [
    { value: '', label: 'Toutes les matières' },
    { value: 'Français', label: 'Français' },
    { value: 'Mathématiques', label: 'Mathématiques' },
    { value: 'Sciences', label: 'Sciences' },
    { value: 'Histoire-Géographie', label: 'Histoire-Géographie' },
    { value: 'Anglais', label: 'Anglais' },
    { value: 'EPS', label: 'Éducation Physique' },
    { value: 'Arts', label: 'Arts Plastiques' }
  ];

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'pending', label: 'En attente' }
  ];

  const classOptions = [
    { value: '', label: 'Toutes les classes' },
    { value: 'CP', label: 'CP' },
    { value: 'CE1', label: 'CE1' },
    { value: 'CE2', label: 'CE2' },
    { value: 'CM1', label: 'CM1' },
    { value: 'CM2', label: 'CM2' }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Actif', className: 'bg-success/10 text-success' },
      inactive: { label: 'Inactif', className: 'bg-error/10 text-error' },
      pending: { label: 'En attente', className: 'bg-warning/10 text-warning' }
    };
    
    const config = statusConfig?.[status] || statusConfig?.active;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-caption font-caption-normal ${config?.className}`}>
        {config?.label}
      </span>
    );
  };

  const filteredTeachers = teachers?.filter(teacher => {
    const matchesSearch = teacher?.fullName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         teacher?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         teacher?.teacherId?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesSubject = !filterSubject || teacher?.subject === filterSubject;
    const matchesStatus = !filterStatus || teacher?.status === filterStatus;
    
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const handleAddTeacher = () => {
    setShowAddTeacherForm(true);
  };

  const handleSaveTeacher = () => {
    if (newTeacher.fullName && newTeacher.email && newTeacher.subject && newTeacher.className && 
        newTeacher.password && newTeacher.confirmPassword) {
      
      // Validation du mot de passe
      if (!validatePassword(newTeacher.password)) {
        alert('Le mot de passe doit contenir au moins 8 caractères avec : une majuscule, une minuscule, un chiffre et un caractère spécial');
        return;
      }
      
      // Vérification de la correspondance des mots de passe
      if (newTeacher.password !== newTeacher.confirmPassword) {
        alert('Les mots de passe ne correspondent pas');
        return;
      }
      
      const teacher = {
        id: teachers.length + 1,
        fullName: newTeacher.fullName,
        email: newTeacher.email,
        phone: newTeacher.phone,
        subject: newTeacher.subject,
        className: newTeacher.className,
        status: "active",
        joinDate: new Date().toLocaleDateString('fr-FR'),
        teacherId: `PROF${String(teachers.length + 1).padStart(3, '0')}`,
        avatar: "/public/assets/images/no_image.png"
      };
      setTeachers([...teachers, teacher]);
      setNewTeacher({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        className: '',
        password: '',
        confirmPassword: ''
      });
      setShowAddTeacherForm(false);
    }
  };

  const handleEditTeacher = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (teacher) {
      setSelectedTeacher(teacher);
      setNewTeacher({
        fullName: teacher.fullName,
        email: teacher.email,
        phone: teacher.phone,
        subject: teacher.subject,
        className: teacher.className,
        password: '',
        confirmPassword: ''
      });
      setShowEditModal(true);
    }
  };

  const handleUpdateTeacher = () => {
    if (selectedTeacher && newTeacher.fullName && newTeacher.email && newTeacher.subject && newTeacher.className) {
      
      // Si un nouveau mot de passe est fourni, le valider
      if (newTeacher.password) {
        if (!validatePassword(newTeacher.password)) {
          alert('Le mot de passe doit contenir au moins 8 caractères avec : une majuscule, une minuscule, un chiffre et un caractère spécial');
          return;
        }
        
        if (newTeacher.password !== newTeacher.confirmPassword) {
          alert('Les mots de passe ne correspondent pas');
          return;
        }
      }
      
      setTeachers(teachers.map(teacher => 
        teacher.id === selectedTeacher.id
          ? {
              ...teacher,
              fullName: newTeacher.fullName,
              email: newTeacher.email,
              phone: newTeacher.phone,
              subject: newTeacher.subject,
              className: newTeacher.className
            }
          : teacher
      ));
      setShowEditModal(false);
      setSelectedTeacher(null);
      setNewTeacher({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        className: '',
        password: '',
        confirmPassword: ''
      });
    }
  };

  const handleDeleteTeacher = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (teacher) {
      setSelectedTeacher(teacher);
      setShowDeleteModal(true);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedTeacher) {
      setTeachers(teachers.filter(teacher => teacher.id !== selectedTeacher.id));
      setShowDeleteModal(false);
      setSelectedTeacher(null);
    }
  };

  const handleToggleStatus = (teacherId) => {
    setTeachers(teachers.map(teacher => 
      teacher.id === teacherId 
        ? { ...teacher, status: teacher.status === 'active' ? 'inactive' : 'active' }
        : teacher
    ));
  };

  const validatePassword = (password) => {
    if (password.length < 8) return false;
    if (!/(?=.*[a-z])/.test(password)) return false;
    if (!/(?=.*[A-Z])/.test(password)) return false;
    if (!/(?=.*\d)/.test(password)) return false;
    if (!/(?=.*[@$!%*?&])/.test(password)) return false;
    return true;
  };

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&';
    let password = '';
    // Au moins une majuscule, une minuscule, un chiffre et un caractère spécial
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '@$!%*?&'[Math.floor(Math.random() * 7)];
    
    // Compléter avec 4 caractères aléatoires
    for (let i = 4; i < 8; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Mélanger les caractères
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    setNewTeacher(prev => ({ 
      ...prev, 
      password: password,
      confirmPassword: password
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading font-heading-bold text-xl text-text-primary">
            Gestion des Enseignants
          </h2>
          <p className="font-body font-body-normal text-sm text-text-secondary mt-1">
            Gérez les comptes et affectations des enseignants
          </p>
        </div>
        <Button
          variant="default"
          iconName="UserPlus"
          iconPosition="left"
          onClick={handleAddTeacher}
        >
          Nouvel Enseignant
        </Button>
      </div>

      {/* Add Teacher Form */}
      {showAddTeacherForm && (
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
              Créer un compte enseignant
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAddTeacherForm(false)}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom complet"
              placeholder="Ex: Marie Nguema"
              value={newTeacher.fullName}
              onChange={(e) => setNewTeacher(prev => ({ ...prev, fullName: e.target.value }))}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="marie.nguema@school.cm"
              value={newTeacher.email}
              onChange={(e) => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <Input
              label="Téléphone"
              placeholder="+237 6XX XX XX XX"
              value={newTeacher.phone}
              onChange={(e) => setNewTeacher(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
            <Select
              label="Matière principale"
              placeholder="Choisir une matière"
              options={subjectOptions.filter(opt => opt.value)}
              value={newTeacher.subject}
              onChange={(value) => setNewTeacher(prev => ({ ...prev, subject: value }))}
              required
            />
            <Select
              label="Classe assignée"
              placeholder="Choisir une classe"
              options={classOptions.filter(opt => opt.value)}
              value={newTeacher.className}
              onChange={(value) => setNewTeacher(prev => ({ ...prev, className: value }))}
              required
            />
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  label="Mot de passe"
                  type="password"
                  placeholder="Minimum 8 caractères"
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateSecurePassword}
                  className="mt-6"
                >
                  Générer
                </Button>
              </div>
              <Input
                label="Confirmer le mot de passe"
                type="password"
                placeholder="Répéter le mot de passe"
                value={newTeacher.confirmPassword}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />
              {newTeacher.password && !validatePassword(newTeacher.password) && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  Le mot de passe doit contenir au moins 8 caractères avec : une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)
                </div>
              )}
              {newTeacher.password && newTeacher.confirmPassword && newTeacher.password !== newTeacher.confirmPassword && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  Les mots de passe ne correspondent pas
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button variant="default" onClick={handleSaveTeacher}>
              Créer le compte
            </Button>
            <Button variant="outline" onClick={() => setShowAddTeacherForm(false)}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="search"
            placeholder="Rechercher par nom, email ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="w-full"
          />
          <Select
            placeholder="Filtrer par matière"
            options={subjectOptions}
            value={filterSubject}
            onChange={setFilterSubject}
          />
          <Select
            placeholder="Filtrer par statut"
            options={statusOptions}
            value={filterStatus}
            onChange={setFilterStatus}
          />
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-heading font-heading-semibold text-sm text-text-primary">
                  Enseignant
                </th>
                <th className="text-left p-4 font-heading font-heading-semibold text-sm text-text-primary">
                  Matière
                </th>
                <th className="text-left p-4 font-heading font-heading-semibold text-sm text-text-primary">
                  Classe
                </th>
                <th className="text-left p-4 font-heading font-heading-semibold text-sm text-text-primary">
                  Contact
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
              {filteredTeachers?.map((teacher) => (
                <tr key={teacher?.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={teacher?.avatar}
                        alt={teacher?.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                        fallback="/public/assets/images/no_image.png"
                      />
                      <div>
                        <p className="font-body font-body-medium text-sm text-text-primary">
                          {teacher?.fullName}
                        </p>
                        <p className="font-caption font-caption-normal text-xs text-text-secondary">
                          ID: {teacher?.teacherId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-body font-body-normal text-sm text-text-primary">
                      {teacher?.subject}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="font-body font-body-normal text-sm text-text-primary">
                      {teacher?.className}
                    </p>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-body font-body-normal text-sm text-text-primary">
                        {teacher?.email}
                      </p>
                      <p className="font-caption font-caption-normal text-xs text-text-secondary">
                        {teacher?.phone}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(teacher?.status)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(teacher?.id)}
                        title={teacher?.status === 'active' ? 'Désactiver' : 'Activer'}
                      >
                        <Icon name={teacher?.status === 'active' ? 'UserX' : 'UserCheck'} size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTeacher(teacher?.id)}
                        title="Modifier"
                      >
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTeacher(teacher?.id)}
                        title="Supprimer"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTeachers?.length === 0 && (
          <div className="p-8 text-center">
            <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="font-body font-body-normal text-text-secondary">
              Aucun enseignant trouvé avec les critères de recherche
            </p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="UserCheck" size={20} className="text-success" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-lg text-text-primary">
                {teachers?.filter(t => t?.status === 'active')?.length}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Enseignants actifs
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
                {teachers?.filter(t => t?.status === 'pending')?.length}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                En attente
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
              <Icon name="UserX" size={20} className="text-error" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-lg text-text-primary">
                {teachers?.filter(t => t?.status === 'inactive')?.length}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Inactifs
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Users" size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-lg text-text-primary">
                {teachers?.length}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Total enseignants
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Modifier Enseignant */}
      {showEditModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
                Modifier {selectedTeacher.fullName}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTeacher(null);
                  setNewTeacher({
                    fullName: '',
                    email: '',
                    phone: '',
                    subject: '',
                    className: '',
                    password: '',
                    confirmPassword: ''
                  });
                }}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nom complet"
                  placeholder="Ex: Marie Nguema"
                  value={newTeacher.fullName}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="marie.nguema@school.cm"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
                <Input
                  label="Téléphone"
                  placeholder="+237 6XX XX XX XX"
                  value={newTeacher.phone}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, phone: e.target.value }))}
                />
                <Select
                  label="Matière principale"
                  placeholder="Choisir une matière"
                  options={subjectOptions.filter(opt => opt.value)}
                  value={newTeacher.subject}
                  onChange={(value) => setNewTeacher(prev => ({ ...prev, subject: value }))}
                  required
                />
                <Select
                  label="Classe assignée"
                  placeholder="Choisir une classe"
                  options={classOptions.filter(opt => opt.value)}
                  value={newTeacher.className}
                  onChange={(value) => setNewTeacher(prev => ({ ...prev, className: value }))}
                  required
                />
                
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-700">Modifier le mot de passe (optionnel)</div>
                  <div className="flex gap-2">
                    <Input
                      label="Nouveau mot de passe"
                      type="password"
                      placeholder="Minimum 8 caractères"
                      value={newTeacher.password}
                      onChange={(e) => setNewTeacher(prev => ({ ...prev, password: e.target.value }))}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateSecurePassword}
                      className="mt-6"
                    >
                      Générer
                    </Button>
                  </div>
                  <Input
                    label="Confirmer le nouveau mot de passe"
                    type="password"
                    placeholder="Répéter le mot de passe"
                    value={newTeacher.confirmPassword}
                    onChange={(e) => setNewTeacher(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                  {newTeacher.password && !validatePassword(newTeacher.password) && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      Le mot de passe doit contenir au moins 8 caractères avec : une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)
                    </div>
                  )}
                  {newTeacher.password && newTeacher.confirmPassword && newTeacher.password !== newTeacher.confirmPassword && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      Les mots de passe ne correspondent pas
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-border">
              <Button variant="default" onClick={handleUpdateTeacher}>
                Sauvegarder
              </Button>
              <Button variant="outline" onClick={() => {
                setShowEditModal(false);
                setSelectedTeacher(null);
                setNewTeacher({
                  fullName: '',
                  email: '',
                  phone: '',
                  subject: '',
                  className: '',
                  password: '',
                  confirmPassword: ''
                });
              }}>
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmer Suppression */}
      {showDeleteModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
                Supprimer l'enseignant
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTeacher(null);
                }}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center">
                  <Icon name="AlertTriangle" size={24} className="text-error" />
                </div>
                <div>
                  <p className="font-body font-body-medium text-sm text-text-primary">
                    Supprimer {selectedTeacher.fullName} ?
                  </p>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary">
                    {selectedTeacher.subject} - {selectedTeacher.className}
                  </p>
                </div>
              </div>
              
              <div className="bg-error/10 rounded-lg p-4">
                <p className="font-caption font-caption-normal text-xs text-error">
                  ⚠️ Cette action est irréversible. L'enseignant sera définitivement supprimé du système.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-border">
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Supprimer définitivement
              </Button>
              <Button variant="outline" onClick={() => {
                setShowDeleteModal(false);
                setSelectedTeacher(null);
              }}>
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagementTab;