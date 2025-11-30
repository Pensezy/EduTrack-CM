import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Image from '../../../components/AppImage';
import ParentSearchSelector from './ParentSearchSelector';

const StudentManagementTab = ({ isDemo = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Données de l'école
  const [currentSchool, setCurrentSchool] = useState(null);
  const [schoolClasses, setSchoolClasses] = useState([]);
  
  // États pour le nouveau workflow multi-étapes
  const [currentStep, setCurrentStep] = useState(1);
  const [inscriptionMode, setInscriptionMode] = useState('new'); // 'new' ou 'existing'
  const [selectedExistingParent, setSelectedExistingParent] = useState(null);
  const [parentSearchTerm, setParentSearchTerm] = useState('');
  const [familyData, setFamilyData] = useState({
    parent: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      occupation: '',
      // Identifiants générés automatiquement
      username: '',
      password: '',
      userId: ''
    },
    students: [{
      firstName: '',
      lastName: '',
      class: '',
      dateOfBirth: '',
      photo: '/public/assets/images/no_image.png',
      // Identifiants générés automatiquement
      username: '',
      password: '',
      studentId: ''
    }]
  });

  const [newStudent, setNewStudent] = useState({
    name: '',
    class: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    photo: '/public/assets/images/no_image.png'
  });

  const initialStudents = [
    {
      id: 1,
      name: "Amina Nkomo",
      class: "CM2",
      enrollmentStatus: "active",
      photo: "/public/assets/images/no_image.png",
      parentName: "Paul Nkomo",
      parentPhone: "+237 6 78 90 12 34",
      parentEmail: "p.nkomo@gmail.com",
      enrollmentDate: "15/09/2024",
      studentId: "STU001"
    },
    {
      id: 2,
      name: "Junior Mbarga",
      class: "CM1",
      enrollmentStatus: "active",
      photo: "/public/assets/images/no_image.png",
      parentName: "Marie Mbarga",
      parentPhone: "+237 6 89 01 23 45",
      parentEmail: "marie.mbarga@yahoo.fr",
      enrollmentDate: "12/09/2024",
      studentId: "STU002"
    },
    {
      id: 3,
      name: "Grace Fouda",
      class: "CE2",
      enrollmentStatus: "pending",
      photo: "/public/assets/images/no_image.png",
      parentName: "Jean Fouda",
      parentPhone: "+237 6 90 12 34 56",
      parentEmail: "j.fouda@outlook.com",
      enrollmentDate: "10/09/2024",
      studentId: "STU003"
    },
    {
      id: 4,
      name: "Kevin Biya",
      class: "CM2",
      enrollmentStatus: "active",
      photo: "/public/assets/images/no_image.png",
      parentName: "Esther Biya",
      parentPhone: "+237 6 01 23 45 67",
      parentEmail: "esther.biya@hotmail.com",
      enrollmentDate: "08/09/2024",
      studentId: "STU004"
    },
    {
      id: 5,
      name: "Sarah Atangana",
      class: "CE1",
      enrollmentStatus: "transferred",
      photo: "/public/assets/images/no_image.png",
      parentName: "Michel Atangana",
      parentPhone: "+237 6 12 34 56 78",
      parentEmail: "m.atangana@gmail.com",
      enrollmentDate: "05/09/2024",
      studentId: "STU005"
    }
  ];

  const [students, setStudents] = useState([]);

  // Charger les données au montage
  useEffect(() => {
    loadSchoolData();
    loadStudents();
  }, [isDemo]);

  const loadSchoolData = async () => {
    if (isDemo) {
      // Mode démo : données statiques
      setCurrentSchool({
        id: 'school-1',
        name: 'École Primaire Centrale',
        type: 'Primaire'
      });
      setSchoolClasses([
        { id: 'class-1', name: 'CE1', level: 'CE1' },
        { id: 'class-2', name: 'CE2', level: 'CE2' },
        { id: 'class-3', name: 'CM1', level: 'CM1' },
        { id: 'class-4', name: 'CM2', level: 'CM2' }
      ]);
      return;
    }

    try {
      const savedUser = localStorage.getItem('edutrack-user');
      const userData = savedUser ? JSON.parse(savedUser) : null;
      const schoolId = userData?.current_school_id;

      if (!schoolId) {
        console.warn('⚠️ Pas d\'école associée');
        return;
      }

      // Charger les informations de l'école
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('id, name, type, available_classes')
        .eq('id', schoolId)
        .single();

      if (schoolError) {
        console.error('❌ Erreur chargement école:', schoolError);
        return;
      }

      setCurrentSchool({
        id: schoolData.id,
        name: schoolData.name,
        type: schoolData.type
      });

      console.log('✅ École chargée pour les élèves:', schoolData.name);
      console.log('📋 Classes disponibles:', schoolData.available_classes);

      // Utiliser les classes choisies lors de la création de l'école
      if (schoolData.available_classes && Array.isArray(schoolData.available_classes) && schoolData.available_classes.length > 0) {
        const schoolClassesList = schoolData.available_classes.map((className, index) => ({
          id: `class-${index}`,
          name: className,
          level: className
        }));
        setSchoolClasses(schoolClassesList);
        console.log(`✅ ${schoolClassesList.length} classe(s) chargée(s) depuis available_classes pour les élèves`);
      } else {
        console.warn('⚠️ Aucune classe dans available_classes, utilisation des classes par défaut');
        const defaultClasses = getDefaultClassesBySchoolType(schoolData.type);
        setSchoolClasses(defaultClasses);
      }
    } catch (error) {
      console.error('Exception chargement données école:', error);
    }
  };

  // Fonction pour obtenir les classes par défaut selon le type d'école
  const getDefaultClassesBySchoolType = (schoolType) => {
    if (schoolType === 'Maternelle') {
      return [
        { id: 'default-ps', name: 'Petite Section', level: 'PS' },
        { id: 'default-ms', name: 'Moyenne Section', level: 'MS' },
        { id: 'default-gs', name: 'Grande Section', level: 'GS' }
      ];
    } else if (schoolType === 'Primaire') {
      return [
        { id: 'default-cp', name: 'CP', level: 'CP' },
        { id: 'default-ce1', name: 'CE1', level: 'CE1' },
        { id: 'default-ce2', name: 'CE2', level: 'CE2' },
        { id: 'default-cm1', name: 'CM1', level: 'CM1' },
        { id: 'default-cm2', name: 'CM2', level: 'CM2' }
      ];
    } else if (schoolType === 'Collège') {
      return [
        { id: 'default-6eme', name: '6ème', level: '6ème' },
        { id: 'default-5eme', name: '5ème', level: '5ème' },
        { id: 'default-4eme', name: '4ème', level: '4ème' },
        { id: 'default-3eme', name: '3ème', level: '3ème' }
      ];
    } else if (schoolType === 'Lycée') {
      return [
        { id: 'default-2nde', name: '2nde', level: '2nde' },
        { id: 'default-1ere', name: '1ère', level: '1ère' },
        { id: 'default-tle', name: 'Terminale', level: 'Terminale' }
      ];
    } else {
      return [];
    }
  };

  const loadStudents = async () => {
    if (isDemo) {
      // Mode démo : utiliser les données statiques
      setStudents(initialStudents);
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
        setStudents([]);
        setLoading(false);
        return;
      }

      // Charger les élèves depuis Supabase avec les infos du parent
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          user_id,
          first_name,
          last_name,
          date_of_birth,
          enrollment_date,
          class_name,
          is_active,
          photo,
          school_id,
          parent_id,
          parents:parent_id (
            id,
            user_id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement élèves:', error);
        setStudents([]);
      } else {
        // Transformer les données Supabase au format attendu
        const formattedStudents = data.map(student => ({
          id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          class: student.class_name || 'Non assigné',
          enrollmentStatus: student.is_active ? 'active' : 'transferred',
          photo: student.photo || '/public/assets/images/no_image.png',
          parentName: student.parents ? `${student.parents.first_name} ${student.parents.last_name}` : 'Non renseigné',
          parentPhone: student.parents?.phone || 'Non renseigné',
          parentEmail: student.parents?.email || 'Non renseigné',
          enrollmentDate: student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString('fr-FR') : 'Non renseignée',
          studentId: student.user_id || `STU${student.id.substring(0, 6)}`
        }));
        setStudents(formattedStudents);
        console.log(`✅ ${formattedStudents.length} élève(s) chargé(s)`);
      }
    } catch (error) {
      console.error('Exception chargement élèves:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Options dynamiques basées sur les données de l'école
  const classOptions = [
    { value: '', label: 'Toutes les classes' },
    ...schoolClasses.map(cls => ({
      value: cls.name,
      label: cls.name
    }))
  ];

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'active', label: 'Actif' },
    { value: 'pending', label: 'En attente' },
    { value: 'transferred', label: 'Transféré' }
  ];

  // Base de données simulée des parents existants (extraite des élèves actuels)
  const existingParents = [
    {
      id: 'PAR001',
      firstName: 'Paul',
      lastName: 'Nkomo',
      email: 'p.nkomo@gmail.com',
      phone: '+237 6 78 90 12 34',
      address: 'Douala, Cameroun',
      occupation: 'Ingénieur',
      primaryLogin: 'p.nkomo@gmail.com',
      secondaryLogin: '237678901234',
      customUsername: 'parentpnkomo123',
      userId: 'PAR001',
      canLoginWithEmail: true,
      canLoginWithPhone: true,
      children: ['Amina Nkomo']
    },
    {
      id: 'PAR002',
      firstName: 'Marie',
      lastName: 'Mbarga',
      email: 'marie.mbarga@yahoo.fr',
      phone: '+237 6 89 01 23 45',
      address: 'Yaoundé, Cameroun',
      occupation: 'Commerçante',
      primaryLogin: 'marie.mbarga@yahoo.fr',
      secondaryLogin: '237689012345',
      customUsername: 'parentmmbarga456',
      userId: 'PAR002',
      canLoginWithEmail: true,
      canLoginWithPhone: true,
      children: ['Junior Mbarga']
    },
    {
      id: 'PAR003',
      firstName: 'Jean',
      lastName: 'Fouda',
      email: 'j.fouda@outlook.com',
      phone: '+237 6 90 12 34 56',
      address: 'Bafoussam, Cameroun',
      occupation: 'Professeur',
      primaryLogin: 'j.fouda@outlook.com',
      secondaryLogin: '237690123456',
      customUsername: 'parentjfouda789',
      userId: 'PAR003',
      canLoginWithEmail: true,
      canLoginWithPhone: true,
      children: ['Grace Fouda']
    },
    {
      id: 'PAR004',
      firstName: 'Esther',
      lastName: 'Biya',
      email: 'esther.biya@hotmail.com',
      phone: '+237 6 01 23 45 67',
      address: 'Garoua, Cameroun',
      occupation: 'Infirmière',
      primaryLogin: 'esther.biya@hotmail.com',
      secondaryLogin: '237601234567',
      customUsername: 'parentebiya321',
      userId: 'PAR004',
      canLoginWithEmail: true,
      canLoginWithPhone: true,
      children: ['Kevin Biya']
    },
    {
      id: 'PAR005',
      firstName: 'Michel',
      lastName: 'Atangana',
      email: 'm.atangana@gmail.com',
      phone: '+237 6 12 34 56 78',
      address: 'Bamenda, Cameroun',
      occupation: 'Médecin',
      primaryLogin: 'm.atangana@gmail.com',
      secondaryLogin: '237612345678',
      customUsername: 'parentmatangana654',
      userId: 'PAR005',
      canLoginWithEmail: true,
      canLoginWithPhone: true,
      children: ['Sarah Atangana']
    }
  ];

  // Fonctions utilitaires pour le nouveau workflow
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&';
    let password = '';
    // Au moins une majuscule, une minuscule, un chiffre et un caractère spécial
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '@$!%*?&'[Math.floor(Math.random() * 7)];
    
    for (let i = 4; i < 8; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  };

  const generateLoginCredentials = (firstName, lastName, email, phone, type = 'parent') => {
    const clean = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Détermine l'identifiant de connexion principal
    let primaryLogin = '';
    let secondaryLogin = '';
    let customUsername = '';
    
    // Si email disponible, utiliser l'email comme identifiant principal
    if (email && email.includes('@')) {
      primaryLogin = email.toLowerCase();
    }
    
    // Si téléphone disponible, utiliser le téléphone comme identifiant secondaire
    if (phone && phone.includes('+237')) {
      // Nettoyer le numéro : +237 6 78 90 12 34 → 237678901234
      secondaryLogin = phone.replace(/\D/g, '');
    }
    
    // Créer un nom d'utilisateur personnalisé comme alternative
    const prefix = type === 'parent' ? 'parent' : 'eleve';
    const baseFirstName = clean(firstName);
    const baseLastName = clean(lastName);
    const random = Math.floor(100 + Math.random() * 900);
    
    // Format: parent/eleve + première lettre prénom + nom + nombre
    customUsername = `${prefix}${baseFirstName.charAt(0)}${baseLastName}${random}`;
    
    return {
      primaryLogin,      // Email si disponible
      secondaryLogin,    // Téléphone si disponible  
      customUsername,    // Nom d'utilisateur personnalisé
      canLoginWithEmail: !!primaryLogin,
      canLoginWithPhone: !!secondaryLogin
    };
  };

  const generateUserId = (type = 'parent') => {
    const prefix = type === 'parent' ? 'PAR' : 'STU';
    const number = String(Math.floor(1000 + Math.random() * 9000));
    return `${prefix}${number}`;
  };

  // Fonctions de navigation du workflow
  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const resetWorkflow = () => {
    setCurrentStep(1);
    setInscriptionMode('new');
    setSelectedExistingParent(null);
    setParentSearchTerm('');
    setFamilyData({
      parent: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        occupation: '',
        username: '',
        password: '',
        userId: ''
      },
      students: [{
        firstName: '',
        lastName: '',
        class: '',
        dateOfBirth: '',
        photo: '/public/assets/images/no_image.png',
        username: '',
        password: '',
        studentId: ''
      }]
    });
  };

  // Fonctions pour la gestion des parents existants
  const searchParents = (searchTerm) => {
    if (!searchTerm) return existingParents;
    
    return existingParents.filter(parent => 
      parent.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.phone.includes(searchTerm)
    );
  };

  const selectExistingParent = (parent) => {
    setSelectedExistingParent(parent);
    setFamilyData(prev => ({
      ...prev,
      parent: {
        firstName: parent.firstName,
        lastName: parent.lastName,
        email: parent.email,
        phone: parent.phone,
        address: parent.address,
        occupation: parent.occupation,
        primaryLogin: parent.primaryLogin,
        secondaryLogin: parent.secondaryLogin,
        customUsername: parent.customUsername,
        userId: parent.userId,
        canLoginWithEmail: parent.canLoginWithEmail,
        canLoginWithPhone: parent.canLoginWithPhone,
        password: '' // Pas de mot de passe car le compte existe déjà
      }
    }));
  };

  const addStudent = () => {
    setFamilyData(prev => ({
      ...prev,
      students: [...prev.students, {
        firstName: '',
        lastName: '',
        class: '',
        dateOfBirth: '',
        photo: '/public/assets/images/no_image.png',
        username: '',
        password: '',
        studentId: ''
      }]
    }));
  };

  const removeStudent = (index) => {
    if (familyData.students.length > 1) {
      setFamilyData(prev => ({
        ...prev,
        students: prev.students.filter((_, i) => i !== index)
      }));
    }
  };

  const generateAccountsData = () => {
    // Générer les identifiants des élèves
    const studentsWithAccounts = familyData.students.map(student => {
      const loginCreds = generateLoginCredentials(
        student.firstName, 
        student.lastName, 
        '', // Les élèves n'ont généralement pas d'email personnel
        '', // Les élèves n'ont généralement pas de téléphone personnel
        'student'
      );
      
      return {
        ...student,
        primaryLogin: loginCreds.primaryLogin || loginCreds.customUsername,
        secondaryLogin: loginCreds.secondaryLogin,
        customUsername: loginCreds.customUsername,
        password: generateSecurePassword(),
        studentId: generateUserId('student'),
        canLoginWithEmail: loginCreds.canLoginWithEmail,
        canLoginWithPhone: loginCreds.canLoginWithPhone
      };
    });

    // Si c'est un nouveau parent, générer ses identifiants aussi
    if (inscriptionMode === 'new') {
      const parentLoginCreds = generateLoginCredentials(
        familyData.parent.firstName,
        familyData.parent.lastName,
        familyData.parent.email,
        familyData.parent.phone,
        'parent'
      );
      
      const parentPassword = generateSecurePassword();
      const parentUserId = generateUserId('parent');

      setFamilyData(prev => ({
        ...prev,
        parent: {
          ...prev.parent,
          primaryLogin: parentLoginCreds.primaryLogin || parentLoginCreds.customUsername,
          secondaryLogin: parentLoginCreds.secondaryLogin,
          customUsername: parentLoginCreds.customUsername,
          password: parentPassword,
          userId: parentUserId,
          canLoginWithEmail: parentLoginCreds.canLoginWithEmail,
          canLoginWithPhone: parentLoginCreds.canLoginWithPhone
        },
        students: studentsWithAccounts
      }));
    } else {
      // Parent existant : conserver ses identifiants, générer seulement ceux des élèves
      setFamilyData(prev => ({
        ...prev,
        students: studentsWithAccounts
      }));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Actif', className: 'bg-success/10 text-success' },
      pending: { label: 'En attente', className: 'bg-warning/10 text-warning' },
      transferred: { label: 'Transféré', className: 'bg-muted text-muted-foreground' }
    };
    
    const config = statusConfig?.[status] || statusConfig?.active;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-caption font-caption-normal ${config?.className}`}>
        {config?.label}
      </span>
    );
  };

  const filteredStudents = students?.filter(student => {
    const matchesSearch = student?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         student?.parentName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         student?.studentId?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesClass = !filterClass || student?.class === filterClass;
    const matchesStatus = !filterStatus || student?.enrollmentStatus === filterStatus;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  const handleTransferStudent = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedStudent(student);
      setShowTransferModal(true);
    }
  };

  const handleViewProfile = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedStudent(student);
      setShowProfileModal(true);
    }
  };

  const handleAddStudent = () => {
    resetWorkflow();
    setShowAddModal(true);
  };

  const handleSaveNewStudent = () => {
    if (newStudent.name && newStudent.class && newStudent.parentName) {
      const student = {
        id: students.length + 1,
        name: newStudent.name,
        class: newStudent.class,
        enrollmentStatus: "pending",
        photo: newStudent.photo,
        parentName: newStudent.parentName,
        parentPhone: newStudent.parentPhone,
        parentEmail: newStudent.parentEmail,
        enrollmentDate: new Date().toLocaleDateString('fr-FR'),
        studentId: `STU${String(students.length + 1).padStart(3, '0')}`
      };
      setStudents([...students, student]);
      setNewStudent({
        name: '',
        class: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        photo: '/public/assets/images/no_image.png'
      });
      setShowAddModal(false);
    }
  };

  const handleUpdateStudentStatus = (studentId, newStatus) => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, enrollmentStatus: newStatus }
        : student
    ));
  };

  const handleConfirmTransfer = () => {
    if (selectedStudent) {
      handleUpdateStudentStatus(selectedStudent.id, 'transferred');
      setShowTransferModal(false);
      setSelectedStudent(null);
    }
  };

  // Indicateur de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Chargement des élèves...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mode indicator */}
      {!isDemo && students.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-body font-body-semibold text-blue-900 mb-1">
                Mode Production - Aucun élève
              </h4>
              <p className="text-sm text-blue-700">
                Vous êtes en mode production mais aucun élève n'a encore été inscrit. 
                Cliquez sur "Nouvel Élève" pour commencer les inscriptions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading font-heading-bold text-xl text-text-primary">
            Gestion des Élèves {!isDemo && <span className="text-sm text-success">(Production)</span>}
          </h2>
          <p className="font-body font-body-normal text-sm text-text-secondary mt-1">
            Gérez les inscriptions et profils des élèves
          </p>
        </div>
        <Button
          variant="default"
          iconName="UserPlus"
          iconPosition="left"
          onClick={handleAddStudent}
        >
          Nouvel Élève
        </Button>
      </div>
      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="search"
            placeholder="Rechercher par nom, parent ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="w-full"
          />
          <Select
            placeholder="Filtrer par classe"
            options={classOptions}
            value={filterClass}
            onChange={setFilterClass}
          />
          <Select
            placeholder="Filtrer par statut"
            options={statusOptions}
            value={filterStatus}
            onChange={setFilterStatus}
          />
        </div>
      </div>
      {/* Students Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-heading font-heading-semibold text-sm text-text-primary">
                  Élève
                </th>
                <th className="text-left p-4 font-heading font-heading-semibold text-sm text-text-primary">
                  Classe
                </th>
                <th className="text-left p-4 font-heading font-heading-semibold text-sm text-text-primary">
                  Parent/Tuteur
                </th>
                <th className="text-left p-4 font-heading font-heading-semibold text-sm text-text-primary">
                  Statut
                </th>
                <th className="text-left p-4 font-heading font-heading-semibold text-sm text-text-primary">
                  Date d'inscription
                </th>
                <th className="text-right p-4 font-heading font-heading-semibold text-sm text-text-primary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents?.map((student) => (
                <tr key={student?.id} className="border-t border-border hover:bg-muted/50 transition-micro">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                        <Image
                          src={student?.photo}
                          alt={student?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-body font-body-semibold text-sm text-text-primary">
                          {student?.name}
                        </p>
                        <p className="font-caption font-caption-normal text-xs text-text-secondary">
                          ID: {student?.studentId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-body font-body-normal text-sm text-text-primary">
                      {student?.class}
                    </span>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-body font-body-semibold text-sm text-text-primary">
                        {student?.parentName}
                      </p>
                      <p className="font-caption font-caption-normal text-xs text-text-secondary">
                        {student?.parentPhone}
                      </p>
                      <p className="font-caption font-caption-normal text-xs text-text-secondary">
                        {student?.parentEmail}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(student?.enrollmentStatus)}
                  </td>
                  <td className="p-4">
                    <span className="font-body font-body-normal text-sm text-text-primary">
                      {student?.enrollmentDate}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewProfile(student?.id)}
                        title="Voir le profil"
                        iconName="Eye"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTransferStudent(student?.id)}
                        title="Transférer l'élève"
                        iconName="ArrowRightLeft"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents?.length === 0 && (
          <div className="p-8 text-center">
            <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="font-body font-body-normal text-text-secondary">
              Aucun élève trouvé avec les critères de recherche
            </p>
          </div>
        )}
      </div>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="UserCheck" size={20} className="text-success" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-lg text-text-primary">
                {students?.filter(s => s?.enrollmentStatus === 'active')?.length}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Élèves actifs
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
                {students?.filter(s => s?.enrollmentStatus === 'pending')?.length}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                En attente
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
                {students?.length}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Total élèves
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Inscription Famille Complète */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
                  Inscription Famille Complète
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  Étape {currentStep} sur 3 - {currentStep === 1 ? 'Informations du parent' : currentStep === 2 ? 'Informations des élèves' : 'Récapitulatif et création des comptes'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowAddModal(false);
                  resetWorkflow();
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
                      {step === 1 ? 'Parent' : step === 2 ? 'Élèves' : 'Comptes'}
                    </span>
                    {step < 3 && <div className="w-8 h-0.5 bg-border mx-2" />}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Contenu des étapes */}
            <div className="p-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Icon name="UserPlus" size={48} className="text-primary mx-auto mb-2" />
                    <h4 className="font-heading font-heading-semibold text-lg text-text-primary">
                      Type d'Inscription
                    </h4>
                    <p className="text-sm text-text-secondary">
                      Choisissez le mode d'inscription selon la situation
                    </p>
                  </div>

                  {/* Choix du mode d'inscription */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div 
                      onClick={() => setInscriptionMode('new')}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        inscriptionMode === 'new' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          inscriptionMode === 'new' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon name="UserPlus" size={20} />
                        </div>
                        <div>
                          <h5 className="font-heading font-heading-medium text-base text-text-primary">
                            Nouvelle Famille
                          </h5>
                          <p className="text-sm text-text-secondary">
                            Premier enfant à inscrire pour cette famille
                          </p>
                        </div>
                      </div>
                    </div>

                    <div 
                      onClick={() => setInscriptionMode('existing')}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        inscriptionMode === 'existing' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          inscriptionMode === 'existing' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon name="Users" size={20} />
                        </div>
                        <div>
                          <h5 className="font-heading font-heading-medium text-base text-text-primary">
                            Parent Existant
                          </h5>
                          <p className="text-sm text-text-secondary">
                            Ajouter un enfant à un parent déjà inscrit
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Formulaire nouveau parent */}
                  {inscriptionMode === 'new' && (
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <Icon name="User" size={40} className="text-success mx-auto mb-2" />
                        <h5 className="font-heading font-heading-medium text-base text-text-primary">
                          Informations du Parent/Tuteur
                        </h5>
                        <p className="text-sm text-text-secondary">
                          Ces informations seront utilisées pour créer le compte parent
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Prénom du parent"
                          placeholder="Ex: Jean"
                          value={familyData.parent.firstName}
                          onChange={(e) => setFamilyData(prev => ({
                            ...prev,
                            parent: { ...prev.parent, firstName: e.target.value }
                          }))}
                          required
                        />
                        <Input
                          label="Nom de famille"
                          placeholder="Ex: Mbarga"
                          value={familyData.parent.lastName}
                          onChange={(e) => setFamilyData(prev => ({
                            ...prev,
                            parent: { ...prev.parent, lastName: e.target.value }
                          }))}
                          required
                        />
                        <Input
                          label="Email"
                          type="email"
                          placeholder="jean.mbarga@email.com"
                          value={familyData.parent.email}
                          onChange={(e) => setFamilyData(prev => ({
                            ...prev,
                            parent: { ...prev.parent, email: e.target.value }
                          }))}
                          required
                        />
                        <Input
                          label="Téléphone"
                          placeholder="+237 6XX XX XX XX"
                          value={familyData.parent.phone}
                          onChange={(e) => setFamilyData(prev => ({
                            ...prev,
                            parent: { ...prev.parent, phone: e.target.value }
                          }))}
                          required
                        />
                        <Input
                          label="Adresse"
                          placeholder="Quartier, Ville"
                          value={familyData.parent.address}
                          onChange={(e) => setFamilyData(prev => ({
                            ...prev,
                            parent: { ...prev.parent, address: e.target.value }
                          }))}
                        />
                        <Input
                          label="Profession"
                          placeholder="Ex: Enseignant, Commerçant..."
                          value={familyData.parent.occupation}
                          onChange={(e) => setFamilyData(prev => ({
                            ...prev,
                            parent: { ...prev.parent, occupation: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  )}

                  {/* Recherche et sélection parent existant avec système multi-établissements */}
                  {inscriptionMode === 'existing' && (
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <Icon name="Search" size={40} className="text-primary mx-auto mb-2" />
                        <h5 className="font-heading font-heading-medium text-base text-text-primary">
                          Système Multi-Établissements
                        </h5>
                        <p className="text-sm text-text-secondary">
                          Recherchez si le parent existe déjà dans le système global
                        </p>
                        <div className="mt-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-700">
                            ✅ Évite les doublons • Un parent = Un compte global • Plusieurs établissements
                          </p>
                        </div>
                      </div>

                      <ParentSearchSelector
                        onParentSelect={(parent) => {
                          setSelectedExistingParent(parent);
                          if (parent) {
                            // Pre-remplir les données du parent
                            setFamilyData(prev => ({
                              ...prev,
                              parent: {
                                firstName: parent.firstName,
                                lastName: parent.lastName,
                                email: parent.email,
                                phone: parent.phone,
                                address: parent.address || '',
                                occupation: parent.profession || '',
                                username: '',
                                password: '',
                                userId: parent.id
                              }
                            }));
                          }
                        }}
                        onCreateNew={() => {
                          setInscriptionMode('new');
                          setSelectedExistingParent(null);
                          setParentSearchTerm('');
                        }}
                        selectedParent={selectedExistingParent}
                        searchTerm={parentSearchTerm}
                        onSearchChange={setParentSearchTerm}
                      />
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Icon name="Users" size={48} className="text-primary mx-auto mb-2" />
                    <h4 className="font-heading font-heading-semibold text-lg text-text-primary">
                      Informations des Élèves
                    </h4>
                    <p className="text-sm text-text-secondary">
                      Ajoutez un ou plusieurs enfants à inscrire
                    </p>
                  </div>

                  {familyData.students.map((student, index) => (
                    <div key={`student-${index}-${student.firstName || 'new'}`} className="border border-border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-heading font-heading-medium text-base text-text-primary">
                          Élève {index + 1}
                        </h5>
                        {familyData.students.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStudent(index)}
                            className="text-destructive hover:text-destructive"
                            iconName="Trash2"
                            iconPosition="left"
                          >
                            Supprimer
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Prénom de l'élève"
                          placeholder="Ex: Marie"
                          value={student.firstName}
                          onChange={(e) => {
                            const updatedStudents = [...familyData.students];
                            updatedStudents[index].firstName = e.target.value;
                            setFamilyData(prev => ({ ...prev, students: updatedStudents }));
                          }}
                          required
                        />
                        <Input
                          label="Nom de famille"
                          placeholder="Ex: Mbarga"
                          value={student.lastName}
                          onChange={(e) => {
                            const updatedStudents = [...familyData.students];
                            updatedStudents[index].lastName = e.target.value;
                            setFamilyData(prev => ({ ...prev, students: updatedStudents }));
                          }}
                          required
                        />
                        <Select
                          label="Classe"
                          options={[
                            { value: 'CE1', label: 'CE1' },
                            { value: 'CE2', label: 'CE2' },
                            { value: 'CM1', label: 'CM1' },
                            { value: 'CM2', label: 'CM2' }
                          ]}
                          value={student.class}
                          onChange={(value) => {
                            const updatedStudents = [...familyData.students];
                            updatedStudents[index].class = value;
                            setFamilyData(prev => ({ ...prev, students: updatedStudents }));
                          }}
                          required
                        />
                        <Input
                          label="Date de naissance"
                          type="date"
                          value={student.dateOfBirth}
                          onChange={(e) => {
                            const updatedStudents = [...familyData.students];
                            updatedStudents[index].dateOfBirth = e.target.value;
                            setFamilyData(prev => ({ ...prev, students: updatedStudents }));
                          }}
                          required
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addStudent}
                    className="w-full"
                    iconName="Plus"
                    iconPosition="left"
                  >
                    Ajouter un autre élève
                  </Button>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Icon name="Shield" size={48} className="text-success mx-auto mb-2" />
                    <h4 className="font-heading font-heading-semibold text-lg text-text-primary">
                      Récapitulatif et Création des Comptes
                    </h4>
                    <p className="text-sm text-text-secondary">
                      Vérifiez les informations et générez les comptes d'accès
                    </p>
                  </div>

                  {(!familyData.students[0]?.customUsername) && (
                    <div className="text-center">
                      <Button 
                        onClick={generateAccountsData} 
                        size="lg" 
                        className="mb-6"
                        iconName="Key"
                        iconPosition="left"
                      >
                        {inscriptionMode === 'new' ? 'Générer les Identifiants de Connexion' : 'Générer les Identifiants des Élèves'}
                      </Button>
                    </div>
                  )}

                  {familyData.students[0]?.customUsername && (
                    <div className="space-y-6">
                      {/* Compte Parent */}
                      <div className={`border rounded-lg p-4 ${
                        inscriptionMode === 'new' 
                          ? 'bg-success/5 border-success/20' 
                          : 'bg-blue/5 border-blue/20'
                      }`}>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            inscriptionMode === 'new'
                              ? 'bg-success/10'
                              : 'bg-blue/10'
                          }`}>
                            <Icon name="User" size={20} className={inscriptionMode === 'new' ? 'text-success' : 'text-blue'} />
                          </div>
                          <div>
                            <h5 className="font-heading font-heading-medium text-base text-text-primary">
                              {inscriptionMode === 'new' ? 'Nouveau Compte Parent' : 'Parent Existant'}
                            </h5>
                            <p className="text-sm text-text-secondary">
                              {familyData.parent.firstName} {familyData.parent.lastName}
                              {inscriptionMode === 'existing' && selectedExistingParent && (
                                <span className="ml-2 text-xs bg-blue/10 text-blue px-2 py-1 rounded">
                                  Déjà inscrit • {selectedExistingParent.children.length} enfant(s)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {/* Options de connexion */}
                          <div className="bg-background/50 rounded-lg p-3">
                            <h6 className="font-medium text-text-primary mb-2 flex items-center">
                              <Icon name="Key" size={16} className="mr-2" />
                              Options de Connexion
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              {familyData.parent.canLoginWithEmail && (
                                <div className="flex items-center space-x-2 text-success">
                                  <Icon name="Mail" size={14} />
                                  <span>Email: {familyData.parent.primaryLogin}</span>
                                </div>
                              )}
                              {familyData.parent.canLoginWithPhone && (
                                <div className="flex items-center space-x-2 text-success">
                                  <Icon name="Phone" size={14} />
                                  <span>Tél: {familyData.parent.phone}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2 text-primary">
                                <Icon name="User" size={14} />
                                <span>Username: {familyData.parent.customUsername}</span>
                              </div>
                            </div>
                          </div>

                          {/* Informations du compte */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-text-secondary">ID Utilisateur:</span>
                              <p className="font-mono bg-background p-2 rounded border mt-1">{familyData.parent.userId}</p>
                            </div>
                            <div>
                              <span className="font-medium text-text-secondary">
                                {inscriptionMode === 'new' ? 'Nouveau mot de passe:' : 'Mot de passe:'}
                              </span>
                              <p className="font-mono bg-background p-2 rounded border mt-1">
                                {inscriptionMode === 'new' ? familyData.parent.password : '••••••••'}
                              </p>
                              {inscriptionMode === 'existing' && (
                                <p className="text-xs text-text-secondary mt-1">
                                  Le parent utilisera son mot de passe existant
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Instructions de connexion */}
                          <div className="bg-info/5 border border-info/20 rounded-lg p-3">
                            <p className="text-sm text-text-primary font-medium mb-1">💡 Comment se connecter :</p>
                            <ul className="text-xs text-text-secondary space-y-1">
                              {familyData.parent.canLoginWithEmail && (
                                <li>• Peut utiliser son <strong>email</strong> + mot de passe</li>
                              )}
                              {familyData.parent.canLoginWithPhone && (
                                <li>• Peut utiliser son <strong>numéro de téléphone</strong> + mot de passe</li>
                              )}
                              <li>• Peut utiliser le <strong>nom d'utilisateur</strong> personnalisé + mot de passe</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Comptes Élèves */}
                      {familyData.students.map((student, index) => (
                        <div key={index} className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Icon name="User" size={20} className="text-primary" />
                            </div>
                            <div>
                              <h5 className="font-heading font-heading-medium text-base text-text-primary">
                                Compte Élève {index + 1}
                              </h5>
                              <p className="text-sm text-text-secondary">
                                {student.firstName} {student.lastName} - {student.class}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            {/* Identifiant de connexion personnalisé */}
                            <div className="bg-background/50 rounded-lg p-3">
                              <h6 className="font-medium text-text-primary mb-2 flex items-center">
                                <Icon name="Key" size={16} className="mr-2" />
                                Identifiant de Connexion
                              </h6>
                              <div className="flex items-center space-x-2 text-primary text-sm">
                                <Icon name="User" size={14} />
                                <span className="font-mono">{student.customUsername}</span>
                              </div>
                            </div>

                            {/* Informations du compte */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-text-secondary">ID Élève:</span>
                                <p className="font-mono bg-background p-2 rounded border mt-1">{student.studentId}</p>
                              </div>
                              <div>
                                <span className="font-medium text-text-secondary">Mot de passe:</span>
                                <p className="font-mono bg-background p-2 rounded border mt-1">{student.password}</p>
                              </div>
                            </div>

                            {/* Instructions de connexion pour élève */}
                            <div className="bg-info/5 border border-info/20 rounded-lg p-3">
                              <p className="text-sm text-text-primary font-medium mb-1">🎒 Comment l'élève se connecte :</p>
                              <p className="text-xs text-text-secondary">
                                Utiliser le <strong>nom d'utilisateur personnalisé</strong> ci-dessus + le mot de passe
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
                          <div>
                            <p className="font-medium text-text-primary mb-2">📋 Instructions Importantes :</p>
                            <div className="text-sm text-text-secondary space-y-2">
                              <div>
                                <p className="font-medium text-text-primary">Pour le Parent :</p>
                                <ul className="text-xs space-y-1 ml-4">
                                  {familyData.parent.canLoginWithEmail && (
                                    <li>• Peut se connecter avec son <strong>email</strong> + mot de passe</li>
                                  )}
                                  {familyData.parent.canLoginWithPhone && (
                                    <li>• Peut se connecter avec son <strong>numéro de téléphone</strong> + mot de passe</li>
                                  )}
                                  <li>• Peut utiliser le <strong>nom d'utilisateur personnalisé</strong> + mot de passe</li>
                                </ul>
                              </div>
                              <div>
                                <p className="font-medium text-text-primary">Pour l'Élève :</p>
                                <ul className="text-xs space-y-1 ml-4">
                                  <li>• Utilise uniquement le <strong>nom d'utilisateur personnalisé</strong> + mot de passe</li>
                                  <li>• Identifiants spécialement créés pour les enfants</li>
                                </ul>
                              </div>
                              <p className="bg-background p-2 rounded border text-xs">
                                💡 <strong>Conseil :</strong> Imprimez ou envoyez ces identifiants par email au parent. 
                                Les parents ont plusieurs options de connexion, les élèves utilisent leur nom d'utilisateur personnalisé.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between p-6 border-t border-border">
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
                    setShowAddModal(false);
                    resetWorkflow();
                  }}
                >
                  Annuler
                </Button>
                
                {currentStep < 3 ? (
                  <Button 
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && (
                        (inscriptionMode === 'new' && (!familyData.parent.firstName || !familyData.parent.lastName || !familyData.parent.email || !familyData.parent.phone)) ||
                        (inscriptionMode === 'existing' && !selectedExistingParent)
                      )) ||
                      (currentStep === 2 && familyData.students.some(s => !s.firstName || !s.lastName || !s.class))
                    }
                    iconName="ChevronRight"
                    iconPosition="right"
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      // Ici on sauvegarderait en base de données
                      alert('Famille inscrite avec succès ! Les comptes ont été créés.');
                      setShowAddModal(false);
                      resetWorkflow();
                    }}
                    disabled={!familyData.students[0]?.customUsername}
                    iconName="Check"
                    iconPosition="left"
                  >
                    Finaliser l'Inscription
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Profil Élève */}
      {showProfileModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
                Profil de {selectedStudent.name}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProfileModal(false)}
                iconName="X"
              />
            </div>
            
            <div className="p-6 space-y-6">
              {/* Informations élève */}
              <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
                <Image
                  src={selectedStudent.photo}
                  alt={selectedStudent.name}
                  className="w-16 h-16 rounded-full object-cover"
                  fallback="/public/assets/images/no_image.png"
                />
                <div className="flex-1">
                  <h4 className="font-heading font-heading-semibold text-lg text-text-primary">
                    {selectedStudent.name}
                  </h4>
                  <p className="font-body font-body-normal text-sm text-text-secondary">
                    ID: {selectedStudent.studentId} • Classe: {selectedStudent.class}
                  </p>
                  <div className="mt-2">
                    {getStatusBadge(selectedStudent.enrollmentStatus)}
                  </div>
                </div>
              </div>

              {/* Informations parent */}
              <div className="space-y-3">
                <h5 className="font-heading font-heading-semibold text-md text-text-primary">
                  Informations Parent/Tuteur
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <p className="font-caption font-caption-normal text-xs text-text-secondary mb-1">Nom</p>
                    <p className="font-body font-body-medium text-sm text-text-primary">{selectedStudent.parentName}</p>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <p className="font-caption font-caption-normal text-xs text-text-secondary mb-1">Téléphone</p>
                    <p className="font-body font-body-medium text-sm text-text-primary">{selectedStudent.parentPhone}</p>
                  </div>
                  <div className="md:col-span-2 p-3 bg-muted/20 rounded-lg">
                    <p className="font-caption font-caption-normal text-xs text-text-secondary mb-1">Email</p>
                    <p className="font-body font-body-medium text-sm text-text-primary">{selectedStudent.parentEmail}</p>
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="space-y-3">
                <h5 className="font-heading font-heading-semibold text-md text-text-primary">
                  Actions rapides
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.enrollmentStatus === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="CheckCircle"
                      onClick={() => {
                        handleUpdateStudentStatus(selectedStudent.id, 'active');
                        setSelectedStudent({...selectedStudent, enrollmentStatus: 'active'});
                      }}
                    >
                      Valider inscription
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Phone"
                    onClick={() => window.open(`tel:${selectedStudent.parentPhone}`, '_self')}
                  >
                    Appeler parent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Mail"
                    onClick={() => window.open(`mailto:${selectedStudent.parentEmail}`, '_self')}
                  >
                    Envoyer email
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-border">
              <Button variant="outline" onClick={() => setShowProfileModal(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Transfert */}
      {showTransferModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
                Confirmer le transfert
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTransferModal(false)}
                iconName="X"
              />
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Icon name="AlertTriangle" size={24} className="text-warning" />
                </div>
                <div>
                  <p className="font-body font-body-medium text-sm text-text-primary">
                    Transférer {selectedStudent.name} ?
                  </p>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary">
                    L'élève sera marqué comme "Transféré"
                  </p>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="font-caption font-caption-normal text-xs text-text-secondary">
                  ⚠️ Cette action marquera l'élève comme transféré vers une autre école. 
                  L'élève n'apparaîtra plus dans les listes actives.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-border">
              <Button variant="default" onClick={handleConfirmTransfer}>
                Confirmer le transfert
              </Button>
              <Button variant="outline" onClick={() => setShowTransferModal(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagementTab;