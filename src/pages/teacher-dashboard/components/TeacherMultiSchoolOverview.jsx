import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import teacherMultiSchoolServiceDemo from '../../../services/teacherMultiSchoolServiceDemo';

const TeacherMultiSchoolOverview = ({ teacherGlobalId }) => {
  const [teacherData, setTeacherData] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeacherData = async () => {
      setLoading(true);
      try {
        const data = await teacherMultiSchoolServiceDemo.getTeacherMultiSchoolDetails(teacherGlobalId);
        setTeacherData(data);
        if (data?.assignments?.length > 0) {
          setSelectedSchool(data.assignments[0].schoolId);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données enseignant:', error);
      } finally {
        setLoading(false);
      }
    };

    if (teacherGlobalId) {
      loadTeacherData();
    }
  }, [teacherGlobalId]);

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-8 bg-muted rounded w-1/2"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!teacherData) {
    return (
      <div className="bg-card rounded-lg border border-border p-6 text-center">
        <Icon name="AlertCircle" size={48} className="text-muted-foreground mx-auto mb-2" />
        <p className="text-text-secondary">Aucune donnée d'enseignant trouvée</p>
      </div>
    );
  }

  const selectedAssignment = teacherData.assignments.find(a => a.schoolId === selectedSchool);

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble globale */}
      <div className="bg-gradient-to-r from-primary/5 to-success/5 rounded-lg border border-primary/20 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
              🏫 Enseignement Multi-Établissements
            </h3>
            <p className="text-sm text-text-secondary">
              Votre activité d'enseignement répartie sur plusieurs établissements
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{teacherData.totalSchools}</div>
            <div className="text-xs text-text-secondary">Établissement(s)</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Clock" size={16} className="text-primary" />
              <span className="font-medium text-sm text-text-primary">Charge totale</span>
            </div>
            <div className="text-lg font-bold text-text-primary">{teacherData.totalWeeklyHours}h</div>
            <div className="text-xs text-text-secondary">par semaine</div>
          </div>

          <div className="bg-background/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Users" size={16} className="text-success" />
              <span className="font-medium text-sm text-text-primary">Total élèves</span>
            </div>
            <div className="text-lg font-bold text-text-primary">{teacherData.totalStudents}</div>
            <div className="text-xs text-text-secondary">à encadrer</div>
          </div>

          <div className="bg-background/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="CheckCircle" size={16} className="text-warning" />
              <span className="font-medium text-sm text-text-primary">Disponibilité</span>
            </div>
            <div className={`text-lg font-bold ${teacherData.availableHours > 10 ? 'text-success' : teacherData.availableHours > 5 ? 'text-warning' : 'text-error'}`}>
              {teacherData.availableHours}h
            </div>
            <div className="text-xs text-text-secondary">restantes</div>
          </div>
        </div>
      </div>

      {/* Sélecteur d'établissement */}
      {teacherData.assignments.length > 1 && (
        <div className="bg-card rounded-lg border border-border p-4">
          <h4 className="font-heading font-heading-medium text-base text-text-primary mb-3">
            Choisir un établissement
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {teacherData.assignments.map((assignment, index) => (
              <button
                key={index}
                onClick={() => setSelectedSchool(assignment.schoolId)}
                className={`text-left p-3 rounded-lg border transition-all ${
                  selectedSchool === assignment.schoolId
                    ? 'border-primary bg-primary/5 text-text-primary'
                    : 'border-border hover:border-primary/50 text-text-secondary hover:text-text-primary'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-sm">{assignment.school.name}</h5>
                  {assignment.assignmentType === 'principal' && (
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      Principal
                    </span>
                  )}
                </div>
                <div className="text-xs">
                  <div>{assignment.classes.length} classe(s) • {assignment.weeklyHours}h/sem</div>
                  <div className="text-text-secondary mt-1">{assignment.school.city}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Détails de l'établissement sélectionné */}
      {selectedAssignment && (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="bg-muted/30 p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-heading font-heading-semibold text-base text-text-primary">
                  {selectedAssignment.school.name}
                </h4>
                <p className="text-sm text-text-secondary">
                  {selectedAssignment.position} • {selectedAssignment.school.city}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">{selectedAssignment.weeklyHours}h</div>
                <div className="text-xs text-text-secondary">par semaine</div>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Matières enseignées */}
            <div>
              <h5 className="font-medium text-sm text-text-primary mb-2">
                Matières enseignées
              </h5>
              <div className="flex flex-wrap gap-2">
                {selectedAssignment.subjects.map((subject, index) => (
                  <span 
                    key={index}
                    className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {/* Classes assignées */}
            <div>
              <h5 className="font-medium text-sm text-text-primary mb-2">
                Classes assignées ({selectedAssignment.assignedClasses.length})
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedAssignment.assignedClasses.map((classInfo, index) => (
                  <div key={index} className="bg-muted/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h6 className="font-medium text-sm text-text-primary">{classInfo.name}</h6>
                        <p className="text-xs text-text-secondary">{classInfo.studentsCount} élèves</p>
                      </div>
                      <Icon name="Users" size={16} className="text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Planning (si disponible) */}
            {selectedAssignment.schedules && selectedAssignment.schedules.length > 0 && (
              <div>
                <h5 className="font-medium text-sm text-text-primary mb-2">
                  Planning de la semaine
                </h5>
                <div className="space-y-2">
                  {selectedAssignment.schedules.map((schedule, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="text-xs font-medium text-primary w-16">
                          {schedule.dayOfWeek}
                        </div>
                        <div className="text-sm text-text-primary">
                          {schedule.subject} - {schedule.classId}
                        </div>
                      </div>
                      <div className="text-xs text-text-secondary">
                        {schedule.startTime} - {schedule.endTime} • {schedule.room}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Résumé de l'assignation */}
            <div className="bg-success/5 border border-success/20 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="CheckCircle" size={16} className="text-success" />
                <span className="font-medium text-sm text-text-primary">Résumé de l'assignation</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-text-secondary">Début :</span>
                  <span className="ml-2 text-text-primary font-medium">
                    {new Date(selectedAssignment.startDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary">Fin :</span>
                  <span className="ml-2 text-text-primary font-medium">
                    {new Date(selectedAssignment.endDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary">Type :</span>
                  <span className="ml-2 text-text-primary font-medium capitalize">
                    {selectedAssignment.assignmentType}
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary">Statut :</span>
                  <span className="ml-2 text-success font-medium">
                    {selectedAssignment.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicateur de charge de travail */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h5 className="font-medium text-sm text-text-primary">Charge de travail globale</h5>
          <span className={`text-xs px-2 py-1 rounded-full ${
            teacherData.totalWeeklyHours > 30 ? 'bg-error/10 text-error' :
            teacherData.totalWeeklyHours > 20 ? 'bg-warning/10 text-warning' :
            'bg-success/10 text-success'
          }`}>
            {teacherData.totalWeeklyHours > 30 ? 'Élevée' :
             teacherData.totalWeeklyHours > 20 ? 'Modérée' : 'Légère'}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Heures enseignées:</span>
            <span className="font-medium text-text-primary">{teacherData.totalWeeklyHours}h / 40h</span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                teacherData.totalWeeklyHours > 30 ? 'bg-error' :
                teacherData.totalWeeklyHours > 20 ? 'bg-warning' : 'bg-success'
              }`}
              style={{ width: `${Math.min((teacherData.totalWeeklyHours / 40) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-text-secondary">
            <span>0h</span>
            <span>40h (max recommandé)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherMultiSchoolOverview;