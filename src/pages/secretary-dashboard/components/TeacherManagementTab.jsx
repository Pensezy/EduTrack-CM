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
  const [currentSchool, setCurrentSchool] = useState(null);
  const [schoolClasses, setSchoolClasses] = useState([]);
  const [schoolSubjects, setSchoolSubjects] = useState([]);
  
  // Modal pour ajouter une matière
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');

  const [newTeacher, setNewTeacher] = useState({
    fullName: '',
    email: '',
    phone: '',
    subjects: [], // Changé en tableau pour plusieurs matières
    classes: [], // Changé en tableau pour plusieurs classes
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

  // Charger les données au montage
  useEffect(() => {
    loadSchoolData();
    loadTeachers();
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
        { id: 'class-1', name: 'CP', level: 'CP' },
        { id: 'class-2', name: 'CE1', level: 'CE1' },
        { id: 'class-3', name: 'CE2', level: 'CE2' },
        { id: 'class-4', name: 'CM1', level: 'CM1' },
        { id: 'class-5', name: 'CM2', level: 'CM2' }
      ]);
      setSchoolSubjects([
        { id: 'sub-1', name: 'Français' },
        { id: 'sub-2', name: 'Mathématiques' },
        { id: 'sub-3', name: 'Sciences' },
        { id: 'sub-4', name: 'Histoire-Géographie' },
        { id: 'sub-5', name: 'Anglais' },
        { id: 'sub-6', name: 'EPS' },
        { id: 'sub-7', name: 'Arts' }
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
        .select('id, name, type, available_classes, custom_subjects')
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

      console.log('✅ École chargée:', schoolData.name);
      console.log('📋 Classes disponibles dans l\'école:', schoolData.available_classes);

      // Utiliser les classes choisies lors de la création de l'école
      if (schoolData.available_classes && Array.isArray(schoolData.available_classes) && schoolData.available_classes.length > 0) {
        const schoolClassesList = schoolData.available_classes.map((className, index) => ({
          id: `class-${index}`,
          name: className,
          level: className
        }));
        setSchoolClasses(schoolClassesList);
        console.log(`✅ ${schoolClassesList.length} classe(s) chargée(s) depuis available_classes`);
      } else {
        console.warn('⚠️ Aucune classe dans available_classes, utilisation des classes par défaut');
        const defaultClasses = getDefaultClassesBySchoolType(schoolData.type);
        setSchoolClasses(defaultClasses);
      }

      // Charger les matières: matières par défaut + matières personnalisées
      console.log('📚 Chargement des matières pour le type:', schoolData.type);
      const defaultSubjects = getDefaultSubjectsBySchoolType(schoolData.type);
      
      // Ajouter les matières personnalisées sauvegardées
      let customSubjects = [];
      if (schoolData.custom_subjects && Array.isArray(schoolData.custom_subjects) && schoolData.custom_subjects.length > 0) {
        customSubjects = schoolData.custom_subjects.map((subjectName, index) => ({
          id: `custom-${index}`,
          name: subjectName
        }));
        console.log(`✅ ${customSubjects.length} matière(s) personnalisée(s) chargée(s)`);
      }
      
      const allSubjects = [...defaultSubjects, ...customSubjects];
      setSchoolSubjects(allSubjects);
      console.log(`✅ Total: ${allSubjects.length} matière(s) disponibles (${defaultSubjects.length} par défaut + ${customSubjects.length} personnalisées)`);
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

  // Fonction pour obtenir les matières par défaut selon le type d'école
  const getDefaultSubjectsBySchoolType = (schoolType) => {
    if (schoolType === 'Primaire' || schoolType === 'Maternelle') {
      return [
        { id: 'default-math', name: 'Mathématiques' },
        { id: 'default-french', name: 'Français' },
        { id: 'default-reading', name: 'Lecture' },
        { id: 'default-writing', name: 'Écriture' },
        { id: 'default-oral', name: 'Expression Orale' },
        { id: 'default-grammar', name: 'Grammaire' },
        { id: 'default-vocabulary', name: 'Vocabulaire' },
        { id: 'default-english', name: 'Anglais' },
        { id: 'default-science', name: 'Découverte du Monde' },
        { id: 'default-history', name: 'Histoire' },
        { id: 'default-geography', name: 'Géographie' },
        { id: 'default-civics', name: 'Éducation Civique et Morale' },
        { id: 'default-arts', name: 'Arts Plastiques' },
        { id: 'default-music', name: 'Éducation Musicale' },
        { id: 'default-pe', name: 'Éducation Physique et Sportive' },
        { id: 'default-ict', name: 'Informatique' }
      ];
    } else if (schoolType === 'Collège') {
      return [
        { id: 'default-math', name: 'Mathématiques' },
        { id: 'default-french', name: 'Français' },
        { id: 'default-english', name: 'Anglais LV1' },
        { id: 'default-german', name: 'Allemand LV2' },
        { id: 'default-spanish', name: 'Espagnol LV2' },
        { id: 'default-hg', name: 'Histoire-Géographie' },
        { id: 'default-emc', name: 'Enseignement Moral et Civique (EMC)' },
        { id: 'default-svt', name: 'Sciences de la Vie et de la Terre (SVT)' },
        { id: 'default-pc', name: 'Physique-Chimie' },
        { id: 'default-tech', name: 'Technologie' },
        { id: 'default-arts', name: 'Arts Plastiques' },
        { id: 'default-music', name: 'Éducation Musicale' },
        { id: 'default-pe', name: 'Éducation Physique et Sportive (EPS)' },
        { id: 'default-ict', name: 'Informatique et Numérique' }
      ];
    } else if (schoolType === 'Lycée Général') {
      return [
        { id: 'default-math', name: 'Mathématiques' },
        { id: 'default-french', name: 'Français' },
        { id: 'default-literature', name: 'Littérature' },
        { id: 'default-english', name: 'Anglais LV1' },
        { id: 'default-german', name: 'Allemand LV2' },
        { id: 'default-spanish', name: 'Espagnol LV2' },
        { id: 'default-hg', name: 'Histoire-Géographie' },
        { id: 'default-emc', name: 'Enseignement Moral et Civique (EMC)' },
        { id: 'default-svt', name: 'Sciences de la Vie et de la Terre (SVT)' },
        { id: 'default-pc', name: 'Physique-Chimie' },
        { id: 'default-philo', name: 'Philosophie' },
        { id: 'default-ses', name: 'Sciences Économiques et Sociales (SES)' },
        { id: 'default-nsi', name: 'Numérique et Sciences Informatiques (NSI)' },
        { id: 'default-si', name: 'Sciences de l\'Ingénieur (SI)' },
        { id: 'default-hggsp', name: 'Histoire-Géographie, Géopolitique et Sciences Politiques' },
        { id: 'default-hlp', name: 'Humanités, Littérature et Philosophie' },
        { id: 'default-llcer', name: 'Langues, Littératures et Cultures Étrangères' },
        { id: 'default-arts', name: 'Arts Plastiques' },
        { id: 'default-music', name: 'Musique' },
        { id: 'default-pe', name: 'Éducation Physique et Sportive (EPS)' }
      ];
    } else if (schoolType === 'Lycée Technique') {
      return [
        { id: 'default-math', name: 'Mathématiques' },
        { id: 'default-french', name: 'Français' },
        { id: 'default-english', name: 'Anglais' },
        { id: 'default-hg', name: 'Histoire-Géographie' },
        { id: 'default-pc', name: 'Physique-Chimie' },
        { id: 'default-tech-draw', name: 'Dessin Technique' },
        { id: 'default-cao', name: 'Conception Assistée par Ordinateur (CAO)' },
        { id: 'default-elec', name: 'Électrotechnique' },
        { id: 'default-electronics', name: 'Électronique' },
        { id: 'default-meca', name: 'Mécanique' },
        { id: 'default-auto', name: 'Mécanique Automobile' },
        { id: 'default-info', name: 'Informatique' },
        { id: 'default-network', name: 'Réseaux et Télécommunications' },
        { id: 'default-construction', name: 'Construction et Bâtiment' },
        { id: 'default-industrial', name: 'Génie Industriel' },
        { id: 'default-energy', name: 'Énergies et Environnement' },
        { id: 'default-si', name: 'Sciences de l\'Ingénieur' },
        { id: 'default-pe', name: 'Éducation Physique et Sportive (EPS)' }
      ];
    } else if (schoolType === 'Lycée Professionnel') {
      return [
        { id: 'default-math', name: 'Mathématiques' },
        { id: 'default-french', name: 'Français' },
        { id: 'default-english', name: 'Anglais Professionnel' },
        { id: 'default-hg', name: 'Histoire-Géographie' },
        { id: 'default-pro-tech', name: 'Enseignement Professionnel' },
        { id: 'default-eco-gestion', name: 'Économie-Gestion' },
        { id: 'default-eco-droit', name: 'Économie-Droit' },
        { id: 'default-commerce', name: 'Techniques de Vente et Commerce' },
        { id: 'default-comptability', name: 'Comptabilité' },
        { id: 'default-secretariat', name: 'Secrétariat et Bureautique' },
        { id: 'default-cuisine', name: 'Arts Culinaires et Restauration' },
        { id: 'default-hotellerie', name: 'Hôtellerie et Tourisme' },
        { id: 'default-coiffure', name: 'Coiffure et Esthétique' },
        { id: 'default-mode', name: 'Mode et Couture' },
        { id: 'default-menuiserie', name: 'Menuiserie et Ébénisterie' },
        { id: 'default-pse', name: 'Prévention Santé Environnement (PSE)' },
        { id: 'default-arts-appliques', name: 'Arts Appliqués' },
        { id: 'default-pe', name: 'Éducation Physique et Sportive (EPS)' }
      ];
    } else {
      return [
        { id: 'default-math', name: 'Mathématiques' },
        { id: 'default-french', name: 'Français' },
        { id: 'default-english', name: 'Anglais' },
        { id: 'default-science', name: 'Sciences' },
        { id: 'default-history', name: 'Histoire' },
        { id: 'default-geography', name: 'Géographie' },
        { id: 'default-arts', name: 'Arts' },
        { id: 'default-pe', name: 'Éducation Physique et Sportive' }
      ];
    }
  };

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

      // Charger les assignations depuis teacher_assignments
      console.log('🔍 Recherche assignations pour school_id:', schoolId);
      const { data: assignments, error: assignError } = await supabase
        .from('teacher_assignments')
        .select('id, teacher_id, class_name, subject_name, schedule, start_date, is_active')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      console.log('📊 Résultat assignations:', { assignments, error: assignError });

      if (assignError) {
        console.error('❌ Erreur chargement assignations:', assignError);
        setTeachers([]);
        setLoading(false);
        return;
      }

      if (!assignments || assignments.length === 0) {
        console.log('⚠️ Aucune assignation trouvée pour cette école');
        console.log('💡 Vérification: y a-t-il des enseignants dans la table teachers ?');
        
        // Charger quand même les enseignants sans assignation
        const { data: allTeachers, error: allTeachersError } = await supabase
          .from('teachers')
          .select('id, user_id, school_id')
          .eq('school_id', schoolId);
        
        console.log('👨‍🏫 Enseignants dans la table teachers:', allTeachers);
        
        if (allTeachers && allTeachers.length > 0) {
          // Il y a des enseignants, mais pas d'assignations
          const userIds = allTeachers.map(t => t.user_id);
          const { data: users, error: userError } = await supabase
            .from('users')
            .select('id, email, phone, full_name')
            .in('id', userIds)
            .eq('role', 'teacher');
          
          console.log('👤 Utilisateurs enseignants:', users);
          
          const teachersWithoutAssignment = allTeachers.map(teacher => {
            const user = users?.find(u => u.id === teacher.user_id);
            return {
              id: teacher.id,
              fullName: user?.full_name || 'Nom inconnu',
              email: user?.email || 'Non renseigné',
              phone: user?.phone || 'Non renseigné',
              subjects: ['Aucune matière assignée'],
              classes: ['Aucune classe assignée'],
              status: 'active',
              teacherId: `PROF${String(teacher.id).padStart(3, '0')}`,
              avatar: '/public/assets/images/no_image.png'
            };
          });
          
          setTeachers(teachersWithoutAssignment);
          console.log('✅ Enseignants chargés sans assignation:', teachersWithoutAssignment.length);
        } else {
          setTeachers([]);
        }
        
        setLoading(false);
        return;
      }

      // Récupérer les IDs uniques des enseignants (teachers.id)
      const teacherIds = [...new Set(assignments.map(a => a.teacher_id))];

      // Charger les enseignants depuis la table teachers pour obtenir les user_id
      const { data: teachers, error: teachersError } = await supabase
        .from('teachers')
        .select('id, user_id')
        .in('id', teacherIds);

      if (teachersError) {
        console.error('Erreur chargement teachers:', teachersError);
      }

      // Créer un map teacher_id -> user_id
      const teacherToUserMap = new Map();
      (teachers || []).forEach(teacher => {
        teacherToUserMap.set(teacher.id, teacher.user_id);
      });

      // Récupérer les user_id correspondants
      const userIds = [...new Set(teachers?.map(t => t.user_id) || [])];

      // Charger les informations des utilisateurs
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, email, phone, full_name')
        .in('id', userIds)
        .eq('role', 'teacher');

      if (userError) {
        console.error('Erreur chargement utilisateurs:', userError);
      }

      // Créer un map des utilisateurs pour un accès rapide (par user_id)
      const userMap = new Map();
      (users || []).forEach(user => {
        userMap.set(user.id, user);
      });

      // Regrouper par enseignant
      const teacherMap = new Map();
      
      assignments.forEach(assignment => {
        const teacherId = assignment.teacher_id; // teachers.id
        const userId = teacherToUserMap.get(teacherId); // Obtenir le user_id correspondant
        const user = userMap.get(userId); // Récupérer les infos utilisateur
        
        if (!teacherMap.has(teacherId)) {
          teacherMap.set(teacherId, {
            id: teacherId,
            fullName: user?.full_name || 'Nom inconnu',
            email: user?.email || 'Non renseigné',
            phone: user?.phone || 'Non renseigné',
            subjects: [],
            classes: [],
            totalHours: 0,
            status: 'active',
            joinDate: assignment.start_date ? new Date(assignment.start_date).toLocaleDateString('fr-FR') : 'Non renseignée',
            teacherId: teacherId.substring(0, 8),
            avatar: '/public/assets/images/no_image.png'
          });
        }
        
        const teacher = teacherMap.get(teacherId);
        
        // Ajouter les matières et classes (éviter les doublons)
        if (assignment.subject_name && !teacher.subjects.includes(assignment.subject_name)) {
          teacher.subjects.push(assignment.subject_name);
        }
        if (assignment.class_name && !teacher.classes.includes(assignment.class_name)) {
          teacher.classes.push(assignment.class_name);
        }
        // Extraire weekly_hours du schedule JSON
        const weeklyHours = assignment.schedule?.weekly_hours || 0;
        teacher.totalHours += weeklyHours;
      });
      
      const formattedTeachers = Array.from(teacherMap.values()).map(teacher => ({
        ...teacher,
        subject: teacher.subjects.join(', ') || 'Non assigné',
        className: teacher.classes.join(', ') || 'Non assigné'
      }));
      
      setTeachers(formattedTeachers);
      console.log(`✅ ${formattedTeachers.length} enseignant(s) chargé(s)`);
    } catch (error) {
      console.error('Exception chargement enseignants:', error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  // Options dynamiques basées sur les données de l'école
  const subjectOptions = [
    { value: '', label: 'Toutes les matières' },
    ...schoolSubjects.map(subject => ({
      value: subject.name,
      label: subject.name
    }))
  ];

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'pending', label: 'En attente' }
  ];

  const classOptions = [
    { value: '', label: 'Toutes les classes' },
    ...schoolClasses.map(cls => ({
      value: cls.name,
      label: cls.name
    }))
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
        subjects: Array.isArray(teacher.subject) ? teacher.subject : [teacher.subject],
        classes: Array.isArray(teacher.className) ? teacher.className : [teacher.className],
        password: '',
        confirmPassword: ''
      });
      setShowEditModal(true);
    }
  };

  const handleUpdateTeacher = () => {
    if (selectedTeacher && newTeacher.fullName && newTeacher.email && newTeacher.subjects.length > 0 && newTeacher.classes.length > 0) {
      
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
              subject: newTeacher.subjects.join(', '), // Afficher toutes les matières
              className: newTeacher.classes.join(', '), // Afficher toutes les classes
              subjects: newTeacher.subjects,
              classes: newTeacher.classes
            }
          : teacher
      ));
      setShowEditModal(false);
      setSelectedTeacher(null);
      setNewTeacher({
        fullName: '',
        email: '',
        phone: '',
        subjects: [],
        classes: [],
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

  const handleAddSubject = async () => {
    if (!newSubject.trim()) {
      alert('Veuillez entrer le nom de la matière');
      return;
    }

    // Vérifier si la matière existe déjà
    if (schoolSubjects.some(s => s.name.toLowerCase() === newSubject.trim().toLowerCase())) {
      alert('Cette matière existe déjà');
      return;
    }

    try {
      // Récupérer les matières personnalisées actuelles
      const { data: schoolData, error: fetchError } = await supabase
        .from('schools')
        .select('custom_subjects')
        .eq('id', currentSchool.id)
        .single();

      if (fetchError) {
        console.error('❌ Erreur récupération matières:', fetchError);
        alert('Erreur lors de la récupération des matières');
        return;
      }

      // Ajouter la nouvelle matière à la liste
      const currentCustomSubjects = schoolData.custom_subjects || [];
      const updatedCustomSubjects = [...currentCustomSubjects, newSubject.trim()];

      // Sauvegarder dans la base de données
      const { error: updateError } = await supabase
        .from('schools')
        .update({ custom_subjects: updatedCustomSubjects })
        .eq('id', currentSchool.id);

      if (updateError) {
        console.error('❌ Erreur sauvegarde matière:', updateError);
        alert('Erreur lors de la sauvegarde de la matière');
        return;
      }

      // Ajouter la nouvelle matière à l'état local
      const newSubjectObj = {
        id: `custom-${Date.now()}`,
        name: newSubject.trim()
      };

      setSchoolSubjects([...schoolSubjects, newSubjectObj]);
      setNewSubject('');
      setShowAddSubjectModal(false);
      
      console.log('✅ Matière ajoutée et sauvegardée:', newSubjectObj.name);
    } catch (error) {
      console.error('Exception ajout matière:', error);
      alert('Erreur lors de l\'ajout de la matière');
    }
  };

  // Gestion de la sélection multiple de matières
  const toggleSubjectSelection = (subjectName) => {
    setNewTeacher(prev => {
      const currentSubjects = prev.subjects || [];
      if (currentSubjects.includes(subjectName)) {
        return { ...prev, subjects: currentSubjects.filter(s => s !== subjectName) };
      } else {
        return { ...prev, subjects: [...currentSubjects, subjectName] };
      }
    });
  };

  // Gestion de la sélection multiple de classes
  const toggleClassSelection = (className) => {
    setNewTeacher(prev => {
      const currentClasses = prev.classes || [];
      if (currentClasses.includes(className)) {
        return { ...prev, classes: currentClasses.filter(c => c !== className) };
      } else {
        return { ...prev, classes: [...currentClasses, className] };
      }
    });
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
      {/* Informations de l'établissement */}
      {currentSchool && (
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Building" size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-heading font-heading-semibold text-text-primary mb-1">
                {currentSchool.name}
              </h4>
              <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1">
                  <Icon name="School" size={14} className="text-primary" />
                  Type: {currentSchool.type}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Users" size={14} className="text-primary" />
                  {schoolClasses.length} classe(s)
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="BookOpen" size={14} className="text-primary" />
                  {schoolSubjects.length} matière(s)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Plus"
                  onClick={() => setShowAddSubjectModal(true)}
                  className="text-xs"
                >
                  Ajouter une matière
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                
                {/* Sélection multiple de matières */}
                <div className="space-y-2">
                  <label className="block text-sm font-body font-body-medium text-text-secondary">
                    Matières enseignées *
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3">
                    {schoolSubjects.map((subject) => (
                      <label
                        key={subject.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={newTeacher.subjects?.includes(subject.name)}
                          onChange={() => toggleSubjectSelection(subject.name)}
                          className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                        />
                        <span className="text-sm text-text-primary">{subject.name}</span>
                      </label>
                    ))}
                  </div>
                  {newTeacher.subjects?.length > 0 && (
                    <p className="text-xs text-text-tertiary">
                      {newTeacher.subjects.length} matière(s) sélectionnée(s): {newTeacher.subjects.join(', ')}
                    </p>
                  )}
                </div>

                {/* Sélection multiple de classes */}
                <div className="space-y-2">
                  <label className="block text-sm font-body font-body-medium text-text-secondary">
                    Classes assignées *
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3">
                    {schoolClasses.map((cls) => (
                      <label
                        key={cls.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={newTeacher.classes?.includes(cls.name)}
                          onChange={() => toggleClassSelection(cls.name)}
                          className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                        />
                        <span className="text-sm text-text-primary">{cls.name}</span>
                      </label>
                    ))}
                  </div>
                  {newTeacher.classes?.length > 0 && (
                    <p className="text-xs text-text-tertiary">
                      {newTeacher.classes.length} classe(s) sélectionnée(s): {newTeacher.classes.join(', ')}
                    </p>
                  )}
                </div>
                
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl border border-border/50 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* En-tête moderne avec gradient */}
            <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-b border-border/50">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center ring-2 ring-primary/30">
                    <Icon name="School" size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-heading-bold text-xl text-text-primary flex items-center gap-2">
                      Assignation Multi-Établissements
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                        Nouveau
                      </span>
                    </h3>
                    <p className="text-sm text-text-secondary mt-0.5 flex items-center gap-1">
                      <Icon name="Circle" size={8} className="text-primary fill-current" />
                      Étape {currentStep} sur 3 - {currentStep === 1 ? 'Type d\'assignation' : currentStep === 2 ? 'Sélection enseignant' : 'Configuration finale'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowMultiSchoolAssignment(false);
                    resetMultiSchoolWorkflow();
                  }}
                  className="w-10 h-10 rounded-lg hover:bg-muted/50 transition-all duration-200 flex items-center justify-center group"
                >
                  <Icon name="X" size={20} className="text-text-secondary group-hover:text-text-primary transition-colors" />
                </button>
              </div>
            </div>
            
            {/* Indicateur de progression moderne */}
            <div className="px-6 py-6 bg-muted/30">
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                {[1, 2, 3].map((step, index) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      {/* Icône de l'étape */}
                      <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        step === currentStep 
                          ? 'bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg scale-110 ring-4 ring-primary/20' 
                          : step < currentStep 
                          ? 'bg-gradient-to-br from-success to-success/80 text-white shadow-md' 
                          : 'bg-muted/50 text-muted-foreground border border-border'
                      }`}>
                        {step < currentStep ? (
                          <Icon name="Check" size={20} className="animate-in zoom-in duration-200" />
                        ) : (
                          <span className="transition-all duration-200">{step}</span>
                        )}
                        {/* Pulse effect pour l'étape active */}
                        {step === currentStep && (
                          <span className="absolute inset-0 rounded-xl bg-primary animate-ping opacity-20"></span>
                        )}
                      </div>
                      
                      {/* Label de l'étape */}
                      <div className="mt-3 text-center">
                        <span className={`text-xs font-semibold block transition-colors duration-200 ${
                          step === currentStep ? 'text-primary' : step < currentStep ? 'text-success' : 'text-text-secondary'
                        }`}>
                          {step === 1 ? 'Type' : step === 2 ? 'Enseignant' : 'Assignation'}
                        </span>
                        <span className="text-xs text-text-tertiary block mt-0.5">
                          {step === 1 ? 'Choisir' : step === 2 ? 'Sélectionner' : 'Configurer'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Ligne de connexion */}
                    {step < 3 && (
                      <div className="flex-1 h-1 mx-2 -mt-8 relative">
                        <div className="absolute inset-0 bg-border rounded-full"></div>
                        <div className={`absolute inset-0 bg-gradient-to-r from-primary to-success rounded-full transition-all duration-500 ${
                          step < currentStep ? 'w-full' : 'w-0'
                        }`}></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-240px)]">
              {/* Étape 1: Choix du type */}
              {currentStep === 1 && (
                <div className="space-y-8 max-w-4xl mx-auto">
                  {/* En-tête de l'étape avec animation */}
                  <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl mb-2">
                      <Icon name="School" size={32} className="text-primary" />
                    </div>
                    <h4 className="font-heading font-heading-bold text-2xl text-text-primary">
                      Type d'Assignation
                    </h4>
                    <p className="text-base text-text-secondary max-w-md mx-auto">
                      Choisissez si vous souhaitez assigner un enseignant existant ou créer un nouveau profil
                    </p>
                  </div>

                  {/* Cartes de sélection modernes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                    {/* Carte Enseignant Existant */}
                    <div 
                      onClick={() => setAssignationMode('existing')}
                      className={`group relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                        assignationMode === 'existing' 
                          ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary shadow-xl shadow-primary/10 scale-105' 
                          : 'bg-card border-2 border-border hover:border-primary/50 hover:shadow-lg hover:scale-102'
                      }`}
                    >
                      {/* Badge de sélection */}
                      {assignationMode === 'existing' && (
                        <div className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                          <Icon name="Check" size={16} className="text-white" />
                        </div>
                      )}
                      
                      {/* Effet de brillance au hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      <div className="relative space-y-4">
                        {/* Icône avec animation */}
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          assignationMode === 'existing' 
                            ? 'bg-primary text-white shadow-lg' 
                            : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                        }`}>
                          <Icon name="Users" size={28} className="transition-transform group-hover:scale-110" />
                        </div>
                        
                        {/* Contenu */}
                        <div className="space-y-2">
                          <h5 className="font-heading font-heading-bold text-lg text-text-primary">
                            Enseignant Existant
                          </h5>
                          <p className="text-sm text-text-secondary leading-relaxed">
                            Recherchez et assignez un enseignant déjà enregistré dans le système global
                          </p>
                        </div>
                        
                        {/* Avantages */}
                        <div className="space-y-2 pt-2 border-t border-border/50">
                          <div className="flex items-center gap-2 text-xs text-text-tertiary">
                            <Icon name="Check" size={14} className="text-success" />
                            <span>Processus rapide</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-text-tertiary">
                            <Icon name="Check" size={14} className="text-success" />
                            <span>Profil déjà configuré</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Carte Nouvel Enseignant */}
                    <div 
                      onClick={() => setAssignationMode('new')}
                      className={`group relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                        assignationMode === 'new' 
                          ? 'bg-gradient-to-br from-success/10 to-success/5 border-2 border-success shadow-xl shadow-success/10 scale-105' 
                          : 'bg-card border-2 border-border hover:border-success/50 hover:shadow-lg hover:scale-102'
                      }`}
                    >
                      {/* Badge de sélection */}
                      {assignationMode === 'new' && (
                        <div className="absolute top-4 right-4 w-8 h-8 bg-success rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                          <Icon name="Check" size={16} className="text-white" />
                        </div>
                      )}
                      
                      {/* Effet de brillance au hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      <div className="relative space-y-4">
                        {/* Icône avec animation */}
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          assignationMode === 'new' 
                            ? 'bg-success text-white shadow-lg' 
                            : 'bg-muted/50 text-muted-foreground group-hover:bg-success/10 group-hover:text-success'
                        }`}>
                          <Icon name="UserPlus" size={28} className="transition-transform group-hover:scale-110" />
                        </div>
                        
                        {/* Contenu */}
                        <div className="space-y-2">
                          <h5 className="font-heading font-heading-bold text-lg text-text-primary">
                            Nouvel Enseignant
                          </h5>
                          <p className="text-sm text-text-secondary leading-relaxed">
                            Créez un nouveau compte enseignant et assignez-le à votre établissement
                          </p>
                        </div>
                        
                        {/* Avantages */}
                        <div className="space-y-2 pt-2 border-t border-border/50">
                          <div className="flex items-center gap-2 text-xs text-text-tertiary">
                            <Icon name="Check" size={14} className="text-success" />
                            <span>Personnalisation complète</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-text-tertiary">
                            <Icon name="Check" size={14} className="text-success" />
                            <span>Nouveau dans le système</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informations sur l'établissement avec design moderne */}
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                    <div className="bg-gradient-to-r from-primary/5 via-primary/3 to-secondary/5 border border-primary/20 rounded-xl p-5 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                          <Icon name="Building" size={24} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-heading font-heading-bold text-base text-text-primary">
                              Établissement de destination
                            </h5>
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                              Actif
                            </span>
                          </div>
                          <p className="text-base font-semibold text-primary mb-1">
                            {currentSchool?.name || 'Chargement...'}
                          </p>
                          <p className="text-xs text-text-tertiary flex items-center gap-1">
                            <Icon name="Info" size={12} />
                            Vous assignez les enseignants uniquement à votre établissement
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
                    <div className="max-w-4xl mx-auto">
                      <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl mb-3">
                          <Icon name="Search" size={32} className="text-primary" />
                        </div>
                        <h5 className="font-heading font-heading-bold text-2xl text-text-primary mb-2">
                          Rechercher un Enseignant
                        </h5>
                        <p className="text-base text-text-secondary max-w-xl mx-auto">
                          Recherchez dans la base de données globale. Les enseignants peuvent être assignés à plusieurs établissements.
                        </p>
                      </div>

                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
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
                    </div>
                  ) : (
                    <div className="max-w-4xl mx-auto">
                      <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-success/20 to-success/10 rounded-2xl mb-3">
                          <Icon name="UserPlus" size={32} className="text-success" />
                        </div>
                        <h5 className="font-heading font-heading-bold text-2xl text-text-primary mb-2">
                          Créer un Nouveau Compte
                        </h5>
                        <p className="text-base text-text-secondary max-w-xl mx-auto">
                          Remplissez les informations pour créer un nouveau profil enseignant dans le système
                        </p>
                      </div>

                      <div className="bg-card rounded-2xl border border-border shadow-lg p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                        {/* Informations personnelles */}
                        <div className="mb-8">
                          <h6 className="font-heading font-heading-bold text-lg text-text-primary mb-1 flex items-center gap-2">
                            <Icon name="User" size={20} className="text-primary" />
                            Informations Personnelles
                          </h6>
                          <p className="text-sm text-text-tertiary mb-4">Données de base de l'enseignant</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Input
                              label="Nom complet"
                              placeholder="Ex: Marie Nguema"
                              value={newTeacher.fullName}
                              onChange={(e) => setNewTeacher(prev => ({ ...prev, fullName: e.target.value }))}
                              required
                              className="transition-all duration-200 focus-within:shadow-sm"
                            />
                            <Input
                              label="Email"
                              type="email"
                              placeholder="marie.nguema@school.cm"
                              value={newTeacher.email}
                              onChange={(e) => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
                              required
                              className="transition-all duration-200 focus-within:shadow-sm"
                            />
                            <Input
                              label="Téléphone"
                              placeholder="+237 6XX XX XX XX"
                              value={newTeacher.phone}
                              onChange={(e) => setNewTeacher(prev => ({ ...prev, phone: e.target.value }))}
                              required
                              className="transition-all duration-200 focus-within:shadow-sm"
                            />
                          </div>
                        </div>

                        {/* Sélection des matières avec design moderne */}
                        <div className="mb-8">
                          <h6 className="font-heading font-heading-bold text-lg text-text-primary mb-1 flex items-center gap-2">
                            <Icon name="BookOpen" size={20} className="text-primary" />
                            Matières Enseignées
                          </h6>
                          <p className="text-sm text-text-tertiary mb-4">Sélectionnez une ou plusieurs matières</p>
                          
                          <div className="bg-muted/30 border border-border rounded-xl p-4 max-h-64 overflow-y-auto">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {schoolSubjects.map((subject) => (
                                <label
                                  key={subject.id}
                                  className={`relative flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                    newTeacher.subjects?.includes(subject.name)
                                      ? 'bg-primary/10 border-2 border-primary shadow-sm'
                                      : 'bg-card border border-border hover:border-primary/50 hover:bg-muted/50'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={newTeacher.subjects?.includes(subject.name)}
                                    onChange={() => toggleSubjectSelection(subject.name)}
                                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                                  />
                                  <span className="text-sm font-medium text-text-primary">{subject.name}</span>
                                  {newTeacher.subjects?.includes(subject.name) && (
                                    <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                      <Icon name="Check" size={12} className="text-white" />
                                    </div>
                                  )}
                                </label>
                              ))}
                            </div>
                          </div>
                          
                          {newTeacher.subjects?.length > 0 && (
                            <div className="mt-3 flex items-center gap-2 text-sm">
                              <Icon name="CheckCircle" size={16} className="text-success" />
                              <span className="text-text-secondary">
                                <span className="font-semibold text-primary">{newTeacher.subjects.length}</span> matière(s) sélectionnée(s)
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Sélection des classes avec design moderne */}
                        <div className="mb-8">
                          <h6 className="font-heading font-heading-bold text-lg text-text-primary mb-1 flex items-center gap-2">
                            <Icon name="Users" size={20} className="text-primary" />
                            Classes Assignées
                          </h6>
                          <p className="text-sm text-text-tertiary mb-4">Sélectionnez les classes à gérer</p>
                          
                          <div className="bg-muted/30 border border-border rounded-xl p-4 max-h-64 overflow-y-auto">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {schoolClasses.map((cls) => (
                                <label
                                  key={cls.id}
                                  className={`relative flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                    newTeacher.classes?.includes(cls.name)
                                      ? 'bg-success/10 border-2 border-success shadow-sm'
                                      : 'bg-card border border-border hover:border-success/50 hover:bg-muted/50'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={newTeacher.classes?.includes(cls.name)}
                                    onChange={() => toggleClassSelection(cls.name)}
                                    className="w-4 h-4 text-success border-border rounded focus:ring-success focus:ring-2"
                                  />
                                  <span className="text-sm font-medium text-text-primary">{cls.name}</span>
                                  {newTeacher.classes?.includes(cls.name) && (
                                    <div className="absolute top-1 right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                                      <Icon name="Check" size={12} className="text-white" />
                                    </div>
                                  )}
                                </label>
                              ))}
                            </div>
                          </div>
                          
                          {newTeacher.classes?.length > 0 && (
                            <div className="mt-3 flex items-center gap-2 text-sm">
                              <Icon name="CheckCircle" size={16} className="text-success" />
                              <span className="text-text-secondary">
                                <span className="font-semibold text-success">{newTeacher.classes.length}</span> classe(s) sélectionnée(s)
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Sécurité du compte */}
                        <div>
                          <h6 className="font-heading font-heading-bold text-lg text-text-primary mb-1 flex items-center gap-2">
                            <Icon name="Lock" size={20} className="text-primary" />
                            Sécurité du Compte
                          </h6>
                          <p className="text-sm text-text-tertiary mb-4">Définissez un mot de passe sécurisé</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  label="Mot de passe"
                                  type="password"
                                  placeholder="Minimum 8 caractères"
                                  value={newTeacher.password}
                                  onChange={(e) => setNewTeacher(prev => ({ ...prev, password: e.target.value }))}
                                  required
                                  className="flex-1 transition-all duration-200 focus-within:shadow-sm"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={generateSecurePassword}
                                  className="mt-6 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                                  iconName="RefreshCw"
                                >
                                  Générer
                                </Button>
                              </div>
                            </div>
                            <Input
                              label="Confirmer le mot de passe"
                              type="password"
                              placeholder="Répéter le mot de passe"
                              value={newTeacher.confirmPassword}
                              onChange={(e) => setNewTeacher(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              required
                              className="transition-all duration-200 focus-within:shadow-sm"
                            />
                          </div>

                          {/* Messages de validation */}
                          {newTeacher.password && !validatePassword(newTeacher.password) && (
                            <div className="mt-4 bg-error/10 border border-error/30 rounded-lg p-3 animate-in fade-in duration-200">
                              <div className="flex items-start gap-2">
                                <Icon name="AlertCircle" size={16} className="text-error mt-0.5" />
                                <div className="text-sm text-error">
                                  <p className="font-semibold mb-1">Mot de passe trop faible</p>
                                  <p className="text-xs">Le mot de passe doit contenir au moins 8 caractères avec : une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)</p>
                                </div>
                              </div>
                            </div>
                          )}
                          {newTeacher.password && newTeacher.confirmPassword && newTeacher.password !== newTeacher.confirmPassword && (
                            <div className="mt-4 bg-error/10 border border-error/30 rounded-lg p-3 animate-in fade-in duration-200">
                              <div className="flex items-center gap-2">
                                <Icon name="AlertCircle" size={16} className="text-error" />
                                <p className="text-sm text-error font-medium">Les mots de passe ne correspondent pas</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Étape 3: Configuration assignation */}
              {currentStep === 3 && selectedExistingTeacher && (
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-success/20 to-success/10 rounded-2xl mb-3">
                      <Icon name="Settings" size={32} className="text-success" />
                    </div>
                    <h5 className="font-heading font-heading-bold text-2xl text-text-primary mb-2">
                      Configuration de l'Assignation
                    </h5>
                    <p className="text-base text-text-secondary max-w-xl mx-auto">
                      Définissez les classes et matières que cet enseignant gérera dans votre établissement
                    </p>
                  </div>

                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                    <TeacherAssignmentManager
                      teacher={selectedExistingTeacher}
                      currentSchool={currentSchool}
                      onAssignmentComplete={(assignment) => {
                        alert('Assignation créée avec succès !');
                        setShowMultiSchoolAssignment(false);
                        resetMultiSchoolWorkflow();
                        loadTeachers(); // Recharger la liste des enseignants
                      }}
                      onCancel={() => {
                        setShowMultiSchoolAssignment(false);
                        resetMultiSchoolWorkflow();
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Navigation (sauf pour l'étape 3 qui a ses propres boutons) */}
              {currentStep < 3 && (
                <div className="flex items-center justify-between p-6 border-t border-border/50 bg-muted/20">
                  <div className="flex gap-3">
                    {currentStep > 1 && (
                      <Button 
                        variant="outline" 
                        onClick={prevStep}
                        iconName="ChevronLeft"
                        iconPosition="left"
                        className="px-6 hover:bg-muted/50 transition-all duration-200"
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
                      className="px-6 hover:bg-error/10 hover:text-error hover:border-error/50 transition-all duration-200"
                    >
                      Annuler
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        if (currentStep === 2 && assignationMode === 'new') {
                          // Valider et créer l'enseignant avant de passer à l'étape 3
                          if (newTeacher.fullName && newTeacher.email && 
                              newTeacher.subjects?.length > 0 && newTeacher.classes?.length > 0 &&
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
                              subjects: newTeacher.subjects,
                              classes: newTeacher.classes,
                              password: newTeacher.password,
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
                      className="px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/30 transition-all duration-200"
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

      {/* Modal Ajouter une matière */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl border border-border/50 shadow-2xl w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
            {/* En-tête moderne */}
            <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 p-6 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Icon name="BookOpen" size={20} className="text-primary" />
                  </div>
                  <h3 className="font-heading font-heading-bold text-xl text-text-primary">
                    Ajouter une matière
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowAddSubjectModal(false);
                    setNewSubject('');
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-muted/50 transition-all duration-200 flex items-center justify-center"
                >
                  <Icon name="X" size={18} className="text-text-secondary" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Champ de saisie avec style moderne */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-text-primary">
                  Nom de la matière *
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Informatique, Biologie, Arts plastiques..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddSubject();
                    }
                  }}
                  className="transition-all duration-200 focus-within:shadow-md"
                />
                <p className="text-xs text-text-tertiary flex items-center gap-1">
                  <Icon name="Info" size={12} />
                  Cette matière sera ajoutée à la liste des matières disponibles
                </p>
              </div>

              {/* Message informatif avec design moderne */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Icon name="Info" size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      Note importante
                    </p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Cette matière sera disponible uniquement pour votre établissement et restera enregistrée pour les prochaines assignations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action avec design moderne */}
            <div className="flex gap-3 p-6 border-t border-border/50 bg-muted/20">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddSubjectModal(false);
                  setNewSubject('');
                }}
                className="flex-1 hover:bg-muted/50 transition-all duration-200"
              >
                Annuler
              </Button>
              <Button
                onClick={handleAddSubject}
                className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/30 transition-all duration-200"
                disabled={!newSubject.trim()}
                iconName="Plus"
                iconPosition="left"
              >
                Ajouter
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagementTab;