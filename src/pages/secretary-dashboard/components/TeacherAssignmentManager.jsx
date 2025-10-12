import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import teacherMultiSchoolServiceDemo from '../../../services/teacherMultiSchoolServiceDemo';

const TeacherAssignmentManager = ({ 
  teacher, 
  currentSchool, // L'établissement de la secrétaire connectée
  onAssignmentComplete,
  onCancel 
}) => {
  const [availableClasses, setAvailableClasses] = useState([]);
  const [assignmentData, setAssignmentData] = useState({
    position: 'Enseignant vacataire',
    subjects: [],
    classes: [],
    weeklyHours: 0,
    assignmentType: 'vacataire',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2025-06-30'
  });
  const [isLoading, setIsLoading] = useState(false);

  // Options de poste
  const positionOptions = [
    { value: 'Enseignant titulaire', label: 'Enseignant titulaire' },
    { value: 'Enseignant vacataire', label: 'Enseignant vacataire' },
    { value: 'Enseignant remplaçant', label: 'Enseignant remplaçant' },
    { value: 'Professeur principal', label: 'Professeur principal' }
  ];

  // Options de type d'assignation
  const assignmentTypeOptions = [
    { value: 'principal', label: 'Poste principal' },
    { value: 'vacataire', label: 'Vacation' },
    { value: 'remplacement', label: 'Remplacement' }
  ];

  // Charger les classes disponibles pour l'établissement de la secrétaire
  useEffect(() => {
    const loadAvailableClasses = async () => {
      if (currentSchool?.id) {
        const classes = await teacherMultiSchoolServiceDemo.getAvailableClassesForSchool(currentSchool.id);
        setAvailableClasses(classes);
      }
    };

    loadAvailableClasses();
  }, [currentSchool?.id]);

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

  const handleSubjectChange = (subject, isChecked) => {
    setAssignmentData(prev => ({
      ...prev,
      subjects: isChecked 
        ? [...prev.subjects, subject]
        : prev.subjects.filter(s => s !== subject)
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

  const handleSubmit = async () => {
    if (assignmentData.subjects.length === 0 || assignmentData.classes.length === 0) {
      alert('Veuillez sélectionner au moins une matière et une classe.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await teacherMultiSchoolServiceDemo.createTeacherAssignment(
        teacher.id,
        currentSchool.id,
        assignmentData
      );

      if (result.success) {
        onAssignmentComplete(result.assignment);
      } else {
        alert('Erreur lors de la création de l\'assignation: ' + result.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la création de l\'assignation.');
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
              {teacher.firstName} {teacher.lastName}
            </h4>
            <p className="text-sm text-text-secondary">
              {teacher.email} • {teacher.phone}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {teacher.specializations.map((spec, index) => (
                <span 
                  key={index}
                  className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                >
                  {spec}
                </span>
              ))}
            </div>
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
        {/* Informations générales */}
        <div className="space-y-4">
          <h5 className="font-heading font-heading-semibold text-md text-text-primary">
            Informations du poste
          </h5>

          <Select
            label="Type de poste"
            options={positionOptions}
            value={assignmentData.position}
            onChange={(value) => setAssignmentData(prev => ({ ...prev, position: value }))}
            required
          />

          <Select
            label="Type d'assignation"
            options={assignmentTypeOptions}
            value={assignmentData.assignmentType}
            onChange={(value) => setAssignmentData(prev => ({ ...prev, assignmentType: value }))}
            required
          />

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
        <h5 className="font-heading font-heading-semibold text-md text-text-primary mb-3">
          Matières à enseigner
        </h5>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {teacher.specializations.map((subject, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`subject-${index}`}
                checked={assignmentData.subjects.includes(subject)}
                onChange={(e) => handleSubjectChange(subject, e.target.checked)}
              />
              <label 
                htmlFor={`subject-${index}`}
                className="text-sm text-text-primary cursor-pointer"
              >
                {subject}
              </label>
            </div>
          ))}
        </div>
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
    </div>
  );
};

export default TeacherAssignmentManager;