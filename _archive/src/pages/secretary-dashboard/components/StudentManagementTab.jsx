import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Image from '../../../components/AppImage';
import ParentSearchSelector from './ParentSearchSelector';

const StudentManagementTab = () => {
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
      placeOfBirth: '',
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

  // Load data on mount
  useEffect(() => {
    loadSchoolData();
    loadStudents();
  }, []);

  const loadSchoolData = async () => {
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

      console.log('🔍 Chargement des élèves pour l\'école:', schoolId);

      // Charger d'abord les élèves sans les relations (pour éviter les erreurs de foreign key)
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (studentsError) {
        console.error('❌ Erreur chargement élèves:', studentsError);
        console.error('❌ Détails:', studentsError.message, studentsError.details, studentsError.hint);
        setStudents([]);
      } else {
        console.log('📊 Données brutes élèves reçues:', studentsData);
        console.log(`📈 Nombre d'élèves trouvés: ${studentsData?.length || 0}`);
        
        if (!studentsData || studentsData.length === 0) {
          console.warn('⚠️ Aucune donnée d\'élève trouvée dans la base pour school_id:', schoolId);
          setStudents([]);
        } else {
          // Récupérer les IDs des parents pour une requête séparée
          const parentIds = studentsData
            .map(s => s.parent_id)
            .filter(id => id != null);
          
          console.log('🔍 Parent IDs à charger:', parentIds);
          
          // Charger les informations des parents séparément
          let parentsMap = {};
          if (parentIds.length > 0) {
            const { data: parentsData, error: parentsError } = await supabase
              .from('parents')
              .select('id, user_id, first_name, last_name, email, phone')
              .in('id', parentIds);
            
            if (parentsError) {
              console.error('⚠️ Erreur chargement parents:', parentsError);
            } else if (parentsData) {
              console.log('📊 Données parents reçues:', parentsData);
              // Créer un map pour un accès rapide
              parentsMap = parentsData.reduce((acc, parent) => {
                acc[parent.id] = parent;
                return acc;
              }, {});
            }
          }
          
          // Transformer les données Supabase au format attendu
          const formattedStudents = studentsData.map(student => {
            console.log('🔄 Formatage élève:', student.first_name, student.last_name);
            const parentInfo = parentsMap[student.parent_id];
            
            return {
              id: student.id,
              name: `${student.first_name} ${student.last_name}`,
              class: student.current_class || student.class_name || 'Non assigné',
              enrollmentStatus: student.is_active ? 'active' : 'transferred',
              photo: student.photo_url || student.photo || '/public/assets/images/no_image.png',
              parentName: parentInfo ? `${parentInfo.first_name} ${parentInfo.last_name}` : 'Non renseigné',
              parentPhone: parentInfo?.phone || 'Non renseigné',
              parentEmail: parentInfo?.email || 'Non renseigné',
              enrollmentDate: student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString('fr-FR') : 'Non renseignée',
              studentId: student.user_id || `STU${student.id.substring(0, 6)}`
            };
          });
          setStudents(formattedStudents);
          console.log(`✅ ${formattedStudents.length} élève(s) chargé(s) et formaté(s)`);
          console.log('👥 Liste finale:', formattedStudents);
        }
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
        placeOfBirth: '',
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
        placeOfBirth: '',
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
    // Si c'est un nouveau parent sans email, générer un email automatique
    if (inscriptionMode === 'new' && !familyData.parent.email) {
      const cleanPhone = familyData.parent.phone.replace(/\s+/g, '').replace(/\+/g, '');
      familyData.parent.email = `parent${cleanPhone}@edutrack.cm`;
      console.log('📧 Email généré automatiquement pour parent:', familyData.parent.email);
    }

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
          email: familyData.parent.email, // Utiliser l'email généré si applicable
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
      {/* No students indicator */}
      {students.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-body font-body-semibold text-blue-900 mb-1">
                Aucun élève enregistré
              </h4>
              <p className="text-sm text-blue-700">
                Aucun élève n'a encore été inscrit. Cliquez sur "Nouvel Élève" pour commencer les inscriptions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading font-heading-bold text-xl text-text-primary">
            Gestion des Élèves
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

      {/* Modal Inscription Famille Complète - Version Améliorée */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* En-tête moderne avec gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <Icon name="UserPlus" size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      Nouvelle Inscription Élève
                    </h3>
                    <p className="text-blue-100 text-sm mt-1">
                      {currentStep === 1 && 'Informations du parent/tuteur'}
                      {currentStep === 2 && 'Informations de l\'élève'}
                      {currentStep === 3 && 'Vérification et création des comptes'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetWorkflow();
                  }}
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Icon name="X" size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Indicateur de progression moderne */}
            <div className="px-6 py-6 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                {[
                  { num: 1, label: 'Parent', icon: 'User' },
                  { num: 2, label: 'Élève', icon: 'GraduationCap' },
                  { num: 3, label: 'Validation', icon: 'CheckCircle' }
                ].map((step, idx) => (
                  <React.Fragment key={step.num}>
                    <div className="flex flex-col items-center">
                      <div className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                        step.num === currentStep 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-300 scale-110' 
                          : step.num < currentStep 
                          ? 'bg-green-500 text-white shadow-md' 
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        {step.num < currentStep ? (
                          <Icon name="Check" size={24} className="animate-scaleIn" />
                        ) : (
                          <Icon name={step.icon} size={24} />
                        )}
                        {step.num === currentStep && (
                          <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20"></div>
                        )}
                      </div>
                      <span className={`mt-2 text-sm font-medium transition-colors ${
                        step.num === currentStep 
                          ? 'text-blue-600' 
                          : step.num < currentStep 
                          ? 'text-green-600' 
                          : 'text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div className="flex-1 h-1 mx-4 mb-8 rounded-full overflow-hidden bg-gray-200">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            step.num < currentStep ? 'bg-green-500 w-full' : 'bg-gray-200 w-0'
                          }`}
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            
            {/* Contenu des étapes avec scroll */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8">
                {currentStep === 1 && (
                  <div className="space-y-8 max-w-4xl mx-auto">
                    {/* Choix du mode d'inscription - Design amélioré */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Type d'inscription
                      </h4>
                      <p className="text-gray-600 text-sm mb-6">
                        Sélectionnez le type de parent pour cette inscription
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <button
                          onClick={() => setInscriptionMode('new')}
                          className={`group relative overflow-hidden rounded-xl p-6 text-left transition-all duration-300 ${
                            inscriptionMode === 'new'
                              ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-500 shadow-lg shadow-blue-200'
                              : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                              inscriptionMode === 'new'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                            }`}>
                              <Icon name="UserPlus" size={24} />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900 mb-1 flex items-center">
                                Nouveau Parent
                                {inscriptionMode === 'new' && (
                                  <Icon name="CheckCircle" size={18} className="ml-2 text-blue-600" />
                                )}
                              </h5>
                              <p className="text-sm text-gray-600">
                                Créer un nouveau compte parent pour cette famille
                              </p>
                              <div className="mt-3 text-xs text-gray-500 flex items-center">
                                <Icon name="Info" size={14} className="mr-1" />
                                Premier enfant de la famille
                              </div>
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => setInscriptionMode('existing')}
                          className={`group relative overflow-hidden rounded-xl p-6 text-left transition-all duration-300 ${
                            inscriptionMode === 'existing'
                              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 shadow-lg shadow-green-200'
                              : 'bg-white border-2 border-gray-200 hover:border-green-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                              inscriptionMode === 'existing'
                                ? 'bg-green-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 group-hover:bg-green-100 group-hover:text-green-600'
                            }`}>
                              <Icon name="Users" size={24} />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900 mb-1 flex items-center">
                                Parent Existant
                                {inscriptionMode === 'existing' && (
                                  <Icon name="CheckCircle" size={18} className="ml-2 text-green-600" />
                                )}
                              </h5>
                              <p className="text-sm text-gray-600">
                                Associer l'élève à un parent déjà inscrit
                              </p>
                              <div className="mt-3 text-xs text-gray-500 flex items-center">
                                <Icon name="Info" size={14} className="mr-1" />
                                Frère/sœur d'un élève existant
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Formulaire nouveau parent - Design modernisé */}
                    {inscriptionMode === 'new' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Icon name="User" size={20} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900 mb-1">
                                Informations du Parent/Tuteur
                              </h5>
                              <p className="text-sm text-gray-600 mb-3">
                                Ces informations seront utilisées pour créer le compte parent. Le parent pourra se connecter avec son email ou son téléphone.
                              </p>
                              <div className="bg-white/60 rounded-lg p-3 border border-blue-200">
                                <div className="flex items-start space-x-2">
                                  <Icon name="Info" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                  <div className="text-xs text-gray-700">
                                    <strong>📧 Email optionnel :</strong> Si le parent n'a pas d'email, un email technique sera généré automatiquement au format <span className="font-mono bg-blue-100 px-1 rounded">parent[téléphone]@edutrack.cm</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Prénom du parent <span className="text-red-500">*</span>
                              </label>
                              <Input
                                placeholder="Ex: Jean"
                                value={familyData.parent.firstName}
                                onChange={(e) => setFamilyData(prev => ({
                                  ...prev,
                                  parent: { ...prev.parent, firstName: e.target.value }
                                }))}
                                className="h-11"
                                required
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nom de famille <span className="text-red-500">*</span>
                              </label>
                              <Input
                                placeholder="Ex: Mbarga"
                                value={familyData.parent.lastName}
                                onChange={(e) => setFamilyData(prev => ({
                                  ...prev,
                                  parent: { ...prev.parent, lastName: e.target.value }
                                }))}
                                className="h-11"
                                required
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <Icon name="Mail" size={18} className="text-gray-400" />
                                </div>
                                <Input
                                  type="email"
                                  placeholder="jean.mbarga@email.com (optionnel)"
                                  value={familyData.parent.email}
                                  onChange={(e) => setFamilyData(prev => ({
                                    ...prev,
                                    parent: { ...prev.parent, email: e.target.value }
                                  }))}
                                  className="h-11 pl-10"
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                💡 Si non fourni, un email technique sera généré automatiquement
                              </p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Téléphone <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <Icon name="Phone" size={18} className="text-gray-400" />
                                </div>
                                <Input
                                  placeholder="+237 6XX XX XX XX"
                                  value={familyData.parent.phone}
                                  onChange={(e) => setFamilyData(prev => ({
                                    ...prev,
                                    parent: { ...prev.parent, phone: e.target.value }
                                  }))}
                                  className="h-11 pl-10"
                                  required
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Adresse
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <Icon name="MapPin" size={18} className="text-gray-400" />
                                </div>
                                <Input
                                  placeholder="Quartier, Ville"
                                  value={familyData.parent.address}
                                  onChange={(e) => setFamilyData(prev => ({
                                    ...prev,
                                    parent: { ...prev.parent, address: e.target.value }
                                  }))}
                                  className="h-11 pl-10"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Profession
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <Icon name="Briefcase" size={18} className="text-gray-400" />
                                </div>
                                <Input
                                  placeholder="Ex: Enseignant, Commerçant..."
                                  value={familyData.parent.occupation}
                                  onChange={(e) => setFamilyData(prev => ({
                                    ...prev,
                                    parent: { ...prev.parent, occupation: e.target.value }
                                  }))}
                                  className="h-11 pl-10"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recherche parent existant - Design modernisé */}
                    {inscriptionMode === 'existing' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Icon name="Search" size={20} className="text-white" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900 mb-1">
                                Système Multi-Établissements
                              </h5>
                              <p className="text-sm text-gray-600 mb-3">
                                Recherchez si le parent existe déjà dans le système global pour éviter les doublons.
                              </p>
                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                                  <Icon name="CheckCircle" size={14} className="mr-1" />
                                  Un parent = Un compte
                                </span>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                                  <Icon name="Building" size={14} className="mr-1" />
                                  Plusieurs établissements
                                </span>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                                  <Icon name="Users" size={14} className="mr-1" />
                                  Plusieurs enfants
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                          <ParentSearchSelector
                            onParentSelect={(parent) => {
                              setSelectedExistingParent(parent);
                              if (parent) {
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
                      </div>
                    )}
                  </div>
                )}

              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  {/* En-tête de l'étape 2 - Modern design */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center border border-blue-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-200">
                      <Icon name="GraduationCap" size={32} className="text-white" />
                    </div>
                    <h4 className="font-heading font-heading-semibold text-xl text-gray-900 mb-1">
                      Informations des Élèves
                    </h4>
                    <p className="text-sm text-gray-600">
                      Ajoutez un ou plusieurs enfants à inscrire dans cet établissement
                      {currentSchool && (
                        <span className="block mt-1 font-medium text-blue-700">
                          📍 {currentSchool.name}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Avertissement si aucune classe disponible */}
                  {schoolClasses.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <Icon name="AlertTriangle" size={20} className="text-yellow-600 mt-0.5" />
                        <div>
                          <h5 className="font-semibold text-yellow-900 mb-1">Aucune classe disponible</h5>
                          <p className="text-sm text-yellow-700">
                            Aucune classe n'a été configurée pour cet établissement. Contactez l'administrateur pour configurer les classes disponibles.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {familyData.students.map((student, index) => (
                    <div key={`student-${index}-${student.firstName || 'new'}`} className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                            <Icon name="User" size={20} className="text-white" />
                          </div>
                          <div>
                            <h5 className="font-heading font-heading-semibold text-base text-gray-900">
                              Élève {index + 1}
                            </h5>
                            <p className="text-xs text-gray-500">Informations scolaires</p>
                          </div>
                        </div>
                        {familyData.students.length > 1 && (
                          <button
                            onClick={() => removeStudent(index)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Icon name="Trash2" size={14} className="mr-1" />
                            Supprimer
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prénom de l'élève <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Icon name="User" size={18} className="text-gray-400" />
                            </div>
                            <Input
                              placeholder="Ex: Marie"
                              value={student.firstName}
                              onChange={(e) => {
                                const updatedStudents = [...familyData.students];
                                updatedStudents[index].firstName = e.target.value;
                                setFamilyData(prev => ({ ...prev, students: updatedStudents }));
                              }}
                              className="h-11 pl-10"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom de famille <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Icon name="User" size={18} className="text-gray-400" />
                            </div>
                            <Input
                              placeholder="Ex: Mbarga"
                              value={student.lastName}
                              onChange={(e) => {
                                const updatedStudents = [...familyData.students];
                                updatedStudents[index].lastName = e.target.value;
                                setFamilyData(prev => ({ ...prev, students: updatedStudents }));
                              }}
                              className="h-11 pl-10"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Classe <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                              <Icon name="BookOpen" size={18} className="text-gray-400" />
                            </div>
                            <Select
                              options={schoolClasses.map(cls => ({
                                value: cls.name,
                                label: cls.name
                              }))}
                              value={student.class}
                              onChange={(value) => {
                                const updatedStudents = [...familyData.students];
                                updatedStudents[index].class = value;
                                setFamilyData(prev => ({ ...prev, students: updatedStudents }));
                              }}
                              className="h-11 pl-10"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date de naissance <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Icon name="Calendar" size={18} className="text-gray-400" />
                            </div>
                            <Input
                              type="date"
                              value={student.dateOfBirth}
                              onChange={(e) => {
                                const updatedStudents = [...familyData.students];
                                updatedStudents[index].dateOfBirth = e.target.value;
                                setFamilyData(prev => ({ ...prev, students: updatedStudents }));
                              }}
                              className="h-11 pl-10"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lieu de naissance <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Icon name="MapPin" size={18} className="text-gray-400" />
                            </div>
                            <Input
                              type="text"
                              value={student.placeOfBirth || ''}
                              onChange={(e) => {
                                const updatedStudents = [...familyData.students];
                                updatedStudents[index].placeOfBirth = e.target.value;
                                setFamilyData(prev => ({ ...prev, students: updatedStudents }));
                              }}
                              placeholder="Ex: Douala, Yaoundé..."
                              className="h-11 pl-10"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addStudent}
                    className="w-full inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-blue-600 bg-blue-50 border-2 border-blue-200 border-dashed rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                  >
                    <Icon name="Plus" size={18} className="mr-2" />
                    Ajouter un autre élève
                  </button>
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
                              {(student.dateOfBirth || student.placeOfBirth) && (
                                <p className="text-xs text-text-secondary mt-1">
                                  {student.dateOfBirth && `Né(e) le ${new Date(student.dateOfBirth).toLocaleDateString('fr-FR')}`}
                                  {student.dateOfBirth && student.placeOfBirth && ' à '}
                                  {student.placeOfBirth}
                                </p>
                              )}
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
            </div>
            
            {/* Barre de navigation inférieure - Design amélioré */}
            <div className="bg-gray-50 border-t border-gray-200 px-8 py-5">
              <div className="flex items-center justify-between">
                <div>
                  {currentStep > 1 ? (
                    <button
                      onClick={prevStep}
                      className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                      <Icon name="ChevronLeft" size={18} className="mr-2" />
                      Précédent
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        resetWorkflow();
                      }}
                      className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Icon name="X" size={18} className="mr-2" />
                      Annuler
                    </button>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  {currentStep > 1 && (
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        resetWorkflow();
                      }}
                      className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Annuler
                    </button>
                  )}
                  
                  {currentStep < 3 ? (
                    <button
                      onClick={nextStep}
                      disabled={
                        (currentStep === 1 && (
                          (inscriptionMode === 'new' && (!familyData.parent.firstName || !familyData.parent.lastName || !familyData.parent.phone)) ||
                          (inscriptionMode === 'existing' && !selectedExistingParent)
                        )) ||
                        (currentStep === 2 && familyData.students.some(s => !s.firstName || !s.lastName || !s.class))
                      }
                      className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-200 hover:shadow-xl disabled:shadow-none"
                    >
                      Continuer
                      <Icon name="ChevronRight" size={18} className="ml-2" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        // Ici on sauvegarderait en base de données
                        alert('Famille inscrite avec succès ! Les comptes ont été créés.');
                        setShowAddModal(false);
                        resetWorkflow();
                      }}
                      disabled={!familyData.students[0]?.customUsername}
                      className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-green-200 hover:shadow-xl disabled:shadow-none"
                    >
                      <Icon name="CheckCircle" size={18} className="mr-2" />
                      Finaliser l'Inscription
                    </button>
                  )}
                </div>
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