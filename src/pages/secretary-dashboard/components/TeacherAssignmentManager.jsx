import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { supabase } from '../../../lib/supabase';

const TeacherAssignmentManager = ({ 
  teacher, 
  currentSchool, // L'établissement de la secrétaire connectée
  onAssignmentComplete,
  onCancel 
}) => {
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [assignmentData, setAssignmentData] = useState({
    subjects: [],
    classes: [],
    weeklyHours: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2025-06-30'
  });
  const [isLoading, setIsLoading] = useState(false);

  // Charger les classes et matières disponibles pour l'établissement
  useEffect(() => {
    const loadSchoolData = async () => {
      if (currentSchool?.id) {
        try {
          const { data: schoolData, error } = await supabase
            .from('schools')
            .select('available_classes, type, custom_subjects')
            .eq('id', currentSchool.id)
            .single();

          if (error) {
            console.error('Erreur chargement données école:', error);
            return;
          }

          // Charger les classes
          if (schoolData?.available_classes && Array.isArray(schoolData.available_classes)) {
            const formattedClasses = schoolData.available_classes.map((className, index) => ({
              id: `class-${index}`,
              name: className,
              studentsCount: 0
            }));
            setAvailableClasses(formattedClasses);
            console.log(`✅ ${formattedClasses.length} classe(s) chargée(s)`);
          }

          // Charger les matières (par défaut + personnalisées, sans doublons)
          const defaultSubjects = getDefaultSubjectsBySchoolType(schoolData.type);
          const customSubjects = (schoolData.custom_subjects || []).map(name => ({ id: `custom-${name}`, name }));
          
          // Utiliser un Set pour éliminer les doublons par nom
          const allSubjectsMap = new Map();
          [...defaultSubjects, ...customSubjects].forEach(subject => {
            if (!allSubjectsMap.has(subject.name)) {
              allSubjectsMap.set(subject.name, subject);
            }
          });
          
          const allSubjects = Array.from(allSubjectsMap.values());
          setAvailableSubjects(allSubjects);
          console.log(`✅ ${allSubjects.length} matière(s) disponible(s) (sans doublons)`);
        } catch (error) {
          console.error('Exception chargement données école:', error);
        }
      }
    };

    loadSchoolData();
  }, [currentSchool?.id]);

  // Fonction pour obtenir les matières par défaut selon le type d'école
  const getDefaultSubjectsBySchoolType = (schoolType) => {
    const subjectsByType = {
      'Maternelle': ['Éveil', 'Psychomotricité', 'Langage', 'Arts plastiques', 'Musique', 'Jeux éducatifs'],
      'Primaire': ['Mathématiques', 'Français', 'Lecture', 'Écriture', 'Histoire', 'Géographie', 'Sciences', 'Éducation Civique et Morale', 'Arts Plastiques', 'Musique', 'Éducation Physique et Sportive', 'Anglais', 'Informatique', 'Travaux Manuels', 'Hygiène et Santé', 'Bibliothèque'],
      'Collège': ['Mathématiques', 'Français', 'Anglais', 'Histoire-Géographie', 'Sciences de la Vie et de la Terre', 'Physique-Chimie', 'Technologie', 'Éducation Physique et Sportive', 'Arts Plastiques', 'Musique', 'Éducation Civique', 'Espagnol', 'Allemand', 'Informatique'],
      'Lycée Général': ['Mathématiques', 'Français', 'Philosophie', 'Histoire-Géographie', 'Anglais', 'Espagnol', 'Allemand', 'Physique-Chimie', 'Sciences de la Vie et de la Terre', 'Sciences Économiques et Sociales', 'Éducation Physique et Sportive', 'Arts Plastiques', 'Musique', 'NSI (Numérique et Sciences Informatiques)', 'SI (Sciences de l\'Ingénieur)', 'HGGSP', 'HLP', 'LLCER', 'Biologie-Écologie', 'Mathématiques Expertes'],
      'Lycée Technique': ['Mathématiques', 'Français', 'Anglais', 'Histoire-Géographie', 'Physique-Chimie', 'Électrotechnique', 'Mécanique', 'Génie Civil', 'Informatique', 'Économie-Gestion', 'Construction', 'CAO/DAO', 'Automatisme', 'Sciences de l\'Ingénieur', 'Télécommunications', 'Maintenance', 'Énergie', 'Éducation Physique et Sportive'],
      'Lycée Professionnel': ['Mathématiques', 'Français', 'Anglais', 'Histoire-Géographie', 'Commerce', 'Vente', 'Comptabilité', 'Secrétariat', 'Cuisine', 'Hôtellerie', 'Coiffure', 'Esthétique', 'Mécanique Auto', 'Électricité', 'Menuiserie', 'Soudure', 'Mode', 'Agriculture']
    };

    const subjects = subjectsByType[schoolType] || subjectsByType['Collège'];
    return subjects.map((name, index) => ({ id: `default-${index}`, name }));
  };

  // Calculer automatiquement les heures en fonction des classes et matières
  useEffect(() => {
    const calculateWeeklyHours = () => {
      const baseHoursPerClassPerSubject = 2; // 2h par semaine par matière par classe
      const totalHours = assignmentData.classes.length * assignmentData.subjects.length * baseHoursPerClassPerSubject;
      
      setAssignmentData(prev => ({
        ...prev,
        weeklyHours: totalHours
      }));
    };

    if (assignmentData.classes.length > 0 && assignmentData.subjects.length > 0) {
      calculateWeeklyHours();
    }
  }, [assignmentData.classes, assignmentData.subjects]);

  const handleSubjectChange = (subjectName, isChecked) => {
    setAssignmentData(prev => ({
      ...prev,
      subjects: isChecked 
        ? [...prev.subjects, subjectName]
        : prev.subjects.filter(s => s !== subjectName)
    }));
  };

  const handleClassChange = (className, isChecked) => {
    setAssignmentData(prev => ({
      ...prev,
      classes: isChecked 
        ? [...prev.classes, className]
        : prev.classes.filter(c => c !== className)
    }));
  };

  // Ajouter une nouvelle matière personnalisée
  const handleAddSubject = async () => {
    if (!newSubject.trim()) {
      alert('Veuillez entrer le nom de la matière');
      return;
    }

    // Vérifier si la matière existe déjà
    if (availableSubjects.some(s => s.name.toLowerCase() === newSubject.trim().toLowerCase())) {
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

      setAvailableSubjects([...availableSubjects, newSubjectObj]);
      setNewSubject('');
      setShowAddSubjectModal(false);
      
      console.log('✅ Matière ajoutée et sauvegardée:', newSubjectObj.name);
    } catch (error) {
      console.error('Exception ajout matière:', error);
      alert('Erreur lors de l\'ajout de la matière');
    }
  };

  const handleSubmit = async () => {
    if (assignmentData.subjects.length === 0 || assignmentData.classes.length === 0) {
      alert('Veuillez sélectionner au moins une matière et une classe.');
      return;
    }

    setIsLoading(true);
    try {
      // Si c'est un nouvel enseignant (isNew = true), créer d'abord le compte
      let teacherId = teacher.id;
      
      if (teacher.isNew) {
        // Créer le compte utilisateur dans Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: teacher.email,
          password: teacher.password || 'TempPass123!', // Mot de passe temporaire
          options: {
            data: {
              full_name: teacher.fullName,
              role: 'teacher'
            }
          }
        });

        if (authError) {
          console.error('Erreur création compte Auth:', authError);
          alert('Erreur lors de la création du compte: ' + authError.message);
          setIsLoading(false);
          return;
        }

        teacherId = authData.user.id;

        // Créer l'entrée dans la table users
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: teacherId,
            email: teacher.email,
            full_name: teacher.fullName,
            phone: teacher.phone,
            role: 'teacher',
            created_at: new Date().toISOString()
          });

        if (userError) {
          console.error('Erreur création utilisateur:', userError);
          alert('Erreur lors de la création de l\'utilisateur: ' + userError.message);
          setIsLoading(false);
          return;
        }

        // Créer l'entrée dans la table teachers et récupérer son ID
        const { data: teacherData, error: teacherError } = await supabase
          .from('teachers')
          .insert({
            user_id: teacherId,
            school_id: currentSchool.id,
            first_name: teacher.fullName.split(' ')[0],
            last_name: teacher.fullName.split(' ').slice(1).join(' ') || teacher.fullName.split(' ')[0],
            is_active: true,
            hire_date: assignmentData.startDate
          })
          .select('id')
          .single();

        if (teacherError) {
          console.error('Erreur création enseignant dans teachers:', teacherError);
          alert('Erreur lors de la création de l\'enseignant: ' + teacherError.message);
          setIsLoading(false);
          return;
        }

        // Utiliser l'ID de la table teachers (pas le user_id) pour les assignations
        teacherId = teacherData.id;
        console.log('✅ Enseignant créé dans teachers avec ID:', teacherId);

        console.log('✅ Nouvel enseignant créé avec l\'ID:', teacherId);
      }

      // Récupérer l'année académique actuelle de l'école
      const { data: academicYears, error: yearError } = await supabase
        .from('academic_years')
        .select('id')
        .eq('school_id', currentSchool.id)
        .eq('is_current', true)
        .single();

      if (yearError || !academicYears) {
        console.warn('⚠️ Aucune année académique active trouvée, création sans année académique');
        // Si pas d'année académique, on doit soit en créer une, soit rendre le champ nullable
        alert('Aucune année académique active trouvée pour cet établissement. Veuillez d\'abord configurer l\'année académique.');
        setIsLoading(false);
        return;
      }

      const academicYearId = academicYears.id;
      console.log('✅ Année académique:', academicYearId);

      // Vérifier si l'enseignant existe dans la table teachers (pour les enseignants existants)
      if (!teacher.isNew) {
        // Récupérer l'ID de la table teachers (pas le user_id)
        const { data: existingTeacher, error: checkError } = await supabase
          .from('teachers')
          .select('id')
          .eq('user_id', teacherId)
          .maybeSingle();

        // Si l'enseignant n'existe pas dans la table teachers, le créer
        if (!existingTeacher && !checkError) {
          console.log('⚠️ Enseignant existant mais pas dans la table teachers, création...');
          const { data: newTeacherData, error: teacherCreateError } = await supabase
            .from('teachers')
            .insert({
              user_id: teacherId,
              school_id: currentSchool.id,
              first_name: teacher.fullName?.split(' ')[0] || 'Prénom',
              last_name: teacher.fullName?.split(' ').slice(1).join(' ') || 'Nom',
              is_active: true,
              hire_date: assignmentData.startDate
            })
            .select('id')
            .single();

          if (teacherCreateError) {
            console.error('Erreur création enseignant:', teacherCreateError);
            alert('Erreur: Cet enseignant doit d\'abord être enregistré dans la table teachers.');
            setIsLoading(false);
            return;
          }
          teacherId = newTeacherData.id;
          console.log('✅ Enseignant ajouté à la table teachers avec ID:', teacherId);
        } else if (existingTeacher) {
          // Utiliser l'ID de la table teachers (pas le user_id)
          teacherId = existingTeacher.id;
          console.log('✅ Enseignant trouvé dans teachers avec ID:', teacherId);
        }
      }

      // Créer les assignations dans teacher_assignments
      // Une entrée par combinaison classe-matière
      const assignments = [];
      const weeklyHoursPerAssignment = Math.round(assignmentData.weeklyHours / (assignmentData.classes.length * assignmentData.subjects.length));
      
      for (const className of assignmentData.classes) {
        for (const subject of assignmentData.subjects) {
          assignments.push({
            teacher_id: teacherId,
            school_id: currentSchool.id,
            academic_year_id: academicYearId,
            class_id: null, // Pas d'ID de classe pour l'instant, on utilise class_name
            subject_id: null, // Pas d'ID de matière pour l'instant, on utilise subject_name
            class_name: className,
            subject_name: subject,
            is_active: true,
            start_date: assignmentData.startDate,
            end_date: assignmentData.endDate,
            schedule: {
              weekly_hours: weeklyHoursPerAssignment
            }
          });
        }
      }

      const { data, error } = await supabase
        .from('teacher_assignments')
        .insert(assignments)
        .select();

      if (error) {
        console.error('Erreur création assignation:', error);
        alert('Erreur lors de la création de l\'assignation: ' + error.message);
        setIsLoading(false);
        return;
      }

      console.log('✅ Assignation(s) créée(s):', data.length);
      onAssignmentComplete({
        ...assignmentData,
        teacher_id: teacherId,
        school_id: currentSchool.id,
        assignments: data
      });
    } catch (error) {
      console.error('Exception:', error);
      alert('Une erreur est survenue: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedClassesInfo = () => {
    const selectedClasses = availableClasses.filter(c => assignmentData.classes.includes(c.name));
    const totalStudents = selectedClasses.reduce((sum, c) => sum + c.studentsCount, 0);
    return { selectedClasses, totalStudents };
  };

  const { selectedClasses, totalStudents } = getSelectedClassesInfo();

  return (
    <div className="space-y-6">
      {/* En-tête avec informations enseignant */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="User" size={24} className="text-primary" />
          </div>
          <div>
            <h4 className="font-heading font-heading-semibold text-base text-text-primary">
              {teacher.fullName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()}
            </h4>
            <p className="text-sm text-text-secondary">
              {teacher.email} {teacher.phone && `• ${teacher.phone}`}
            </p>
            {(teacher.subjects || teacher.specializations) && (teacher.subjects || teacher.specializations).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {(teacher.subjects || teacher.specializations || []).map((spec, index) => (
                  <span 
                    key={index}
                    className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Établissement de rattachement */}
      <div className="bg-background-secondary border border-border rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
            <Icon name="Building" size={20} className="text-secondary" />
          </div>
          <div>
            <h5 className="font-heading font-heading-semibold text-sm text-text-primary">
              Établissement de rattachement
            </h5>
            <p className="text-sm text-text-secondary">
              {currentSchool?.name || 'Établissement non défini'}
            </p>
            <p className="text-xs text-text-tertiary">
              L'enseignant sera assigné à votre établissement
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire d'assignation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Période d'assignation */}
        <div className="space-y-4">
          <h5 className="font-heading font-heading-semibold text-md text-text-primary">
            Période d'assignation
          </h5>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date de début"
              type="date"
              value={assignmentData.startDate}
              onChange={(e) => setAssignmentData(prev => ({ ...prev, startDate: e.target.value }))}
              required
            />
            <Input
              label="Date de fin"
              type="date"
              value={assignmentData.endDate}
              onChange={(e) => setAssignmentData(prev => ({ ...prev, endDate: e.target.value }))}
              required
            />
          </div>
        </div>

        {/* Résumé de la charge */}
        <div className="space-y-4">
          <h5 className="font-heading font-heading-semibold text-md text-text-primary">
            Résumé de la charge
          </h5>

          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Classes assignées:</span>
              <span className="font-medium text-text-primary">{assignmentData.classes.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Matières enseignées:</span>
              <span className="font-medium text-text-primary">{assignmentData.subjects.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Total élèves:</span>
              <span className="font-medium text-text-primary">{totalStudents}</span>
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex justify-between text-base">
                <span className="font-medium text-text-primary">Heures/semaine:</span>
                <span className="font-bold text-primary">{assignmentData.weeklyHours}h</span>
              </div>
            </div>

            {/* Indicateur de charge */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-secondary">Charge de travail</span>
                <span className={`${assignmentData.weeklyHours > 25 ? 'text-error' : assignmentData.weeklyHours > 15 ? 'text-warning' : 'text-success'}`}>
                  {assignmentData.weeklyHours > 25 ? 'Élevée' : assignmentData.weeklyHours > 15 ? 'Modérée' : 'Légère'}
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${assignmentData.weeklyHours > 25 ? 'bg-error' : assignmentData.weeklyHours > 15 ? 'bg-warning' : 'bg-success'}`}
                  style={{ width: `${Math.min((assignmentData.weeklyHours / 40) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sélection des matières */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h5 className="font-heading font-heading-semibold text-md text-text-primary">
            Matières à enseigner
          </h5>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddSubjectModal(true)}
            iconName="Plus"
            iconPosition="left"
          >
            Ajouter une matière
          </Button>
        </div>
        
        {assignmentData.subjects.length > 0 && (
          <div className="mb-3 text-sm text-primary">
            {assignmentData.subjects.length} matière(s) sélectionnée(s): {assignmentData.subjects.join(', ')}
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto border border-border rounded-lg p-3">
          {availableSubjects.map((subject, index) => (
            <div key={subject.id || index} className="flex items-center space-x-2">
              <Checkbox
                id={`subject-${subject.id || index}`}
                checked={assignmentData.subjects.includes(subject.name)}
                onChange={(e) => handleSubjectChange(subject.name, e.target.checked)}
              />
              <label 
                htmlFor={`subject-${subject.id || index}`}
                className="text-sm text-text-primary cursor-pointer"
              >
                {subject.name}
              </label>
            </div>
          ))}
        </div>
        {availableSubjects.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-text-secondary">
              Aucune matière disponible pour cet établissement
            </p>
          </div>
        )}
      </div>

      {/* Sélection des classes */}
      <div>
        <h5 className="font-heading font-heading-semibold text-md text-text-primary mb-3">
          Classes à enseigner
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableClasses.map((classInfo, index) => (
            <div 
              key={index} 
              className={`border border-border rounded-lg p-3 cursor-pointer transition-colors ${
                assignmentData.classes.includes(classInfo.name) 
                  ? 'bg-primary/5 border-primary/30' 
                  : 'hover:bg-muted/30'
              }`}
              onClick={() => handleClassChange(classInfo.name, !assignmentData.classes.includes(classInfo.name))}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`class-${index}`}
                    checked={assignmentData.classes.includes(classInfo.name)}
                    onChange={(e) => handleClassChange(classInfo.name, e.target.checked)}
                  />
                  <div>
                    <p className="font-medium text-sm text-text-primary">
                      {classInfo.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {classInfo.studentsCount} élèves
                    </p>
                  </div>
                </div>
                {assignmentData.classes.includes(classInfo.name) && (
                  <Icon name="Check" size={16} className="text-primary" />
                )}
              </div>
            </div>
          ))}
        </div>

        {availableClasses.length === 0 && (
          <div className="text-center py-8">
            <Icon name="School" size={48} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-text-secondary">
              Aucune classe disponible pour cet établissement
            </p>
          </div>
        )}
      </div>

      {/* Classes sélectionnées - Récapitulatif */}
      {selectedClasses.length > 0 && (
        <div className="bg-success/5 border border-success/20 rounded-lg p-4">
          <h5 className="font-medium text-sm text-text-primary mb-3 flex items-center">
            <Icon name="CheckCircle" size={16} className="text-success mr-2" />
            Classes sélectionnées ({selectedClasses.length})
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {selectedClasses.map((classInfo, index) => (
              <div key={index} className="bg-background/50 rounded p-2 text-center">
                <p className="font-medium text-xs text-text-primary">{classInfo.name}</p>
                <p className="text-xs text-text-secondary">{classInfo.studentsCount} élèves</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || assignmentData.subjects.length === 0 || assignmentData.classes.length === 0}
          iconName="Check"
          iconPosition="left"
        >
          {isLoading ? 'Création en cours...' : 'Créer l\'assignation'}
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Annuler
        </Button>
      </div>

      {/* Avertissements */}
      {assignmentData.weeklyHours > 25 && (
        <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-primary">
                ⚠️ Charge de travail élevée
              </p>
              <p className="text-xs text-text-secondary">
                Cette assignation représente {assignmentData.weeklyHours}h/semaine, ce qui peut être considéré comme une charge élevée.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajouter une matière */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading font-heading-semibold text-xl text-text-primary">
                  Ajouter une matière
                </h3>
                <button
                  onClick={() => {
                    setShowAddSubjectModal(false);
                    setNewSubject('');
                  }}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-body font-body-medium text-text-secondary mb-2">
                    Nom de la matière *
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Informatique, Biologie, etc."
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSubject();
                      }
                    }}
                  />
                  <p className="text-xs text-text-tertiary mt-1">
                    Cette matière sera ajoutée à la liste des matières disponibles
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      <strong>Note :</strong> Cette matière sera disponible pour tous les enseignants de votre établissement.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddSubjectModal(false);
                    setNewSubject('');
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleAddSubject}
                  className="flex-1"
                  iconName="Plus"
                  iconPosition="left"
                >
                  Ajouter
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignmentManager;