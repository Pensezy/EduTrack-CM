import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Image from '../../../components/AppImage';
import TeacherSearchSelector from './TeacherSearchSelector';
import TeacherAssignmentManager from './TeacherAssignmentManager';
import teacherMultiSchoolServiceDemo from '../../../services/teacherMultiSchoolServiceDemo';

const TeacherManagementTab = ({ isDemo = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  
  // États pour le système multi-établissements
  const [showMultiSchoolAssignment, setShowMultiSchoolAssignment] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [assignationMode, setAssignationMode] = useState('existing'); // 'new' ou 'existing'
  const [selectedExistingTeacher, setSelectedExistingTeacher] = useState(null);
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');

  // Établissement de la secrétaire connectée
  const currentSchool = {
    id: 'school-1', // ID de l'établissement de la secrétaire
    name: 'École Primaire Centrale',
    type: 'Primaire'
  };

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

  const [teachers, setTeachers] = useState([]);

  // Charger les enseignants au montage
  useEffect(() => {
    loadTeachers();
  }, [isDemo]);

  const loadTeachers = async () => {
    if (isDemo) {
      // Mode démo : utiliser les données statiques
      setTeachers(initialTeachers);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const savedUser = localStorage.getItem('edutrack-user');
      const userData = savedUser ? JSON.parse(savedUser) : null;
      const schoolId = userData?.current_school_id;

      if (!schoolId) {
        console.warn('⚠️ Pas d\'école associée');
        setTeachers([]);
        setLoading(false);
        return;
      }

      // Charger les enseignants depuis Supabase
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          id,
          user_id,
          first_name,
          last_name,
          specialty,
          hire_date,
          is_active,
          school_id,
          users:user_id (
            id,
            email,
            phone,
            full_name
          )
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement enseignants:', error);
        setTeachers([]);
      } else {
        // Transformer les données Supabase au format attendu
        const formattedTeachers = data.map(teacher => ({
          id: teacher.id,
          fullName: teacher.users?.full_name || `${teacher.first_name} ${teacher.last_name}`,
          email: teacher.users?.email || 'Non renseigné',
          phone: teacher.users?.phone || 'Non renseigné',
          subject: teacher.specialty || 'Non assigné',
          className: 'Non assigné', // À compléter avec une table d'assignation
          status: teacher.is_active ? 'active' : 'inactive',
          joinDate: teacher.hire_date ? new Date(teacher.hire_date).toLocaleDateString('fr-FR') : 'Non renseignée',
          teacherId: teacher.user_id || `PROF${teacher.id.substring(0, 6)}`,
          avatar: '/public/assets/images/no_image.png'
        }));
        setTeachers(formattedTeachers);
        console.log(`✅ ${formattedTeachers.length} enseignant(s) chargé(s)`);
      }
    } catch (error) {
      console.error('Exception chargement enseignants:', error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

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



  // Fonctions pour le workflow multi-établissements
  const resetMultiSchoolWorkflow = () => {
    setCurrentStep(1);
    setAssignationMode('existing');
    setSelectedExistingTeacher(null);
    setTeacherSearchTerm('');
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleMultiSchoolAssignment = () => {
    resetMultiSchoolWorkflow();
    setShowMultiSchoolAssignment(true);
  };

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

  // Indicateur de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Chargement des enseignants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mode indicator */}
      {!isDemo && teachers.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-body font-body-semibold text-blue-900 mb-1">
                Mode Production - Aucun enseignant
              </h4>
              <p className="text-sm text-blue-700">
                Vous êtes en mode production mais aucun enseignant n'a encore été créé. 
                Cliquez sur "Assigner Enseignant" pour commencer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading font-heading-bold text-xl text-text-primary">
            Gestion des Enseignants {!isDemo && <span className="text-sm text-success">(Production)</span>}
          </h2>
          <p className="font-body font-body-normal text-sm text-text-secondary mt-1">
            Gérez les comptes et affectations des enseignants
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="default"
            iconName="School"
            iconPosition="left"
            onClick={handleMultiSchoolAssignment}
          >
            Assigner Enseignant
          </Button>
        </div>
      </div>



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

      {/* Modal Assignation Multi-Établissements */}
      {showMultiSchoolAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
                  🏫 Assignation Multi-Établissements
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  Étape {currentStep} sur 3 - {currentStep === 1 ? 'Type d\'assignation' : currentStep === 2 ? 'Recherche enseignant' : 'Configuration assignation'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowMultiSchoolAssignment(false);
                  resetMultiSchoolWorkflow();
                }}
                iconName="X"
              />
            </div>
            
            {/* Indicateur de progression */}
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center space-x-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === currentStep 
                        ? 'bg-primary text-primary-foreground' 
                        : step < currentStep 
                        ? 'bg-success text-success-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {step < currentStep ? <Icon name="Check" size={16} /> : step}
                    </div>
                    <span className={`text-sm ${
                      step === currentStep ? 'text-primary font-medium' : 'text-text-secondary'
                    }`}>
                      {step === 1 ? 'Type' : step === 2 ? 'Enseignant' : 'Assignation'}
                    </span>
                    {step < 3 && <div className="w-8 h-0.5 bg-border mx-2" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6">
              {/* Étape 1: Choix du type */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Icon name="School" size={48} className="text-primary mx-auto mb-2" />
                    <h4 className="font-heading font-heading-semibold text-lg text-text-primary">
                      Type d'Assignation
                    </h4>
                    <p className="text-sm text-text-secondary">
                      Assignation d'un enseignant existant ou nouveau à un établissement
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div 
                      onClick={() => setAssignationMode('existing')}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        assignationMode === 'existing' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          assignationMode === 'existing' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon name="Users" size={20} />
                        </div>
                        <div>
                          <h5 className="font-heading font-heading-medium text-base text-text-primary">
                            Enseignant Existant
                          </h5>
                          <p className="text-sm text-text-secondary">
                            Assigner un enseignant déjà dans le système global
                          </p>
                        </div>
                      </div>
                    </div>

                    <div 
                      onClick={() => setAssignationMode('new')}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        assignationMode === 'new' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          assignationMode === 'new' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon name="UserPlus" size={20} />
                        </div>
                        <div>
                          <h5 className="font-heading font-heading-medium text-base text-text-primary">
                            Nouvel Enseignant
                          </h5>
                          <p className="text-sm text-text-secondary">
                            Créer un nouveau compte enseignant puis l'assigner
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon name="Building" size={20} className="text-primary" />
                        </div>
                        <div>
                          <h5 className="font-heading font-heading-semibold text-sm text-text-primary">
                            Établissement de destination
                          </h5>
                          <p className="text-sm text-text-secondary">
                            {currentSchool.name}
                          </p>
                          <p className="text-xs text-text-tertiary">
                            Vous ne pouvez assigner des enseignants que dans votre établissement
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 2: Recherche/Création enseignant */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {assignationMode === 'existing' ? (
                    <div>
                      <div className="text-center mb-4">
                        <Icon name="Search" size={40} className="text-primary mx-auto mb-2" />
                        <h5 className="font-heading font-heading-medium text-base text-text-primary">
                          Rechercher un Enseignant Existant
                        </h5>
                        <p className="text-sm text-text-secondary">
                          Système multi-établissements - Un enseignant peut avoir plusieurs assignations
                        </p>
                      </div>

                      <TeacherSearchSelector
                        onTeacherSelect={(teacher) => {
                          setSelectedExistingTeacher(teacher);
                        }}
                        onCreateNew={() => {
                          setAssignationMode('new');
                          setSelectedExistingTeacher(null);
                        }}
                        selectedTeacher={selectedExistingTeacher}
                        searchTerm={teacherSearchTerm}
                        onSearchChange={setTeacherSearchTerm}
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="text-center mb-6">
                        <Icon name="UserPlus" size={40} className="text-success mx-auto mb-2" />
                        <h5 className="font-heading font-heading-medium text-base text-text-primary">
                          Créer un Nouveau Compte Enseignant
                        </h5>
                        <p className="text-sm text-text-secondary">
                          Créez le profil enseignant puis assignez-le à l'établissement
                        </p>
                      </div>

                      <div className="bg-card rounded-lg border border-border p-6">
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
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                        </div>

                        {newTeacher.password && !validatePassword(newTeacher.password) && (
                          <div className="text-sm text-red-600 bg-red-50 p-2 rounded mt-4">
                            Le mot de passe doit contenir au moins 8 caractères avec : une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)
                          </div>
                        )}
                        {newTeacher.password && newTeacher.confirmPassword && newTeacher.password !== newTeacher.confirmPassword && (
                          <div className="text-sm text-red-600 bg-red-50 p-2 rounded mt-4">
                            Les mots de passe ne correspondent pas
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Étape 3: Configuration assignation */}
              {currentStep === 3 && selectedExistingTeacher && (
                <div>
                  <div className="text-center mb-6">
                    <Icon name="Settings" size={40} className="text-success mx-auto mb-2" />
                    <h5 className="font-heading font-heading-medium text-base text-text-primary">
                      Configuration de l'Assignation
                    </h5>
                    <p className="text-sm text-text-secondary">
                      Définir les classes et matières pour cet enseignant
                    </p>
                  </div>

                  <TeacherAssignmentManager
                    teacher={selectedExistingTeacher}
                    currentSchool={currentSchool}
                    onAssignmentComplete={(assignment) => {
                      alert('Assignation créée avec succès !');
                      setShowMultiSchoolAssignment(false);
                      resetMultiSchoolWorkflow();
                    }}
                    onCancel={() => {
                      setShowMultiSchoolAssignment(false);
                      resetMultiSchoolWorkflow();
                    }}
                  />
                </div>
              )}

              {/* Navigation (sauf pour l'étape 3 qui a ses propres boutons) */}
              {currentStep < 3 && (
                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <div className="flex gap-3">
                    {currentStep > 1 && (
                      <Button 
                        variant="outline" 
                        onClick={prevStep}
                        iconName="ChevronLeft"
                        iconPosition="left"
                      >
                        Précédent
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowMultiSchoolAssignment(false);
                        resetMultiSchoolWorkflow();
                      }}
                    >
                      Annuler
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        if (currentStep === 2 && assignationMode === 'new') {
                          // Valider et créer l'enseignant avant de passer à l'étape 3
                          if (newTeacher.fullName && newTeacher.email && newTeacher.subject && 
                              newTeacher.password && newTeacher.confirmPassword) {
                            
                            if (!validatePassword(newTeacher.password)) {
                              alert('Le mot de passe doit contenir au moins 8 caractères avec : une majuscule, une minuscule, un chiffre et un caractère spécial');
                              return;
                            }
                            
                            if (newTeacher.password !== newTeacher.confirmPassword) {
                              alert('Les mots de passe ne correspondent pas');
                              return;
                            }
                            
                            // Créer un objet enseignant temporaire pour l'assignation
                            const tempTeacher = {
                              id: `temp-${Date.now()}`,
                              fullName: newTeacher.fullName,
                              email: newTeacher.email,
                              phone: newTeacher.phone,
                              subject: newTeacher.subject,
                              isNew: true // Marquer comme nouveau
                            };
                            setSelectedExistingTeacher(tempTeacher);
                            nextStep();
                          } else {
                            alert('Veuillez remplir tous les champs obligatoires');
                          }
                        } else {
                          nextStep();
                        }
                      }}
                      disabled={
                        (currentStep === 1 && !assignationMode) ||
                        (currentStep === 2 && assignationMode === 'existing' && !selectedExistingTeacher)
                      }
                      iconName="ChevronRight"
                      iconPosition="right"
                    >
                      {currentStep === 2 && assignationMode === 'new' ? 'Créer et Continuer' : 'Suivant'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagementTab;