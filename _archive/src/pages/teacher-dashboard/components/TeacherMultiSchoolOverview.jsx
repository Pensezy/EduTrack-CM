import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';

const TeacherMultiSchoolOverview = ({ teacherId }) => {
  const [teacherData, setTeacherData] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeacherData = async () => {
      setLoading(true);
      try {
        // Charger les assignations de l'enseignant pour tous les établissements
        const { data: assignments, error: assignmentsError } = await supabase
          .from('teacher_assignments')
          .select(`
            id,
            school_id,
            class_name,
            subject_name,
            schedule,
            start_date,
            end_date,
            is_active,
            schools!teacher_assignments_school_id_fkey (
              id,
              name,
              type
            )
          `)
          .eq('teacher_id', teacherId)
          .eq('is_active', true);

        if (assignmentsError) throw assignmentsError;

        if (!assignments || assignments.length === 0) {
          setTeacherData(null);
          setLoading(false);
          return;
        }

        // Grouper les assignations par école
        const schoolsMap = new Map();
        let totalWeeklyHours = 0;
        let totalStudents = 0;

        for (const assignment of assignments) {
          const schoolId = assignment.school_id;
          const weeklyHours = assignment.schedule?.weekly_hours || 0;
          totalWeeklyHours += weeklyHours;

          if (!schoolsMap.has(schoolId)) {
            schoolsMap.set(schoolId, {
              schoolId: schoolId,
              school: assignment.schools,
              classes: [],
              subjects: new Set(),
              weeklyHours: 0,
              assignedClasses: [],
              startDate: assignment.start_date,
              endDate: assignment.end_date,
              isActive: assignment.is_active
            });
          }

          const schoolData = schoolsMap.get(schoolId);
          schoolData.weeklyHours += weeklyHours;
          schoolData.subjects.add(assignment.subject_name);
          
          // Charger les élèves pour cette classe
          const { data: students } = await supabase
            .from('students')
            .select('id')
            .eq('school_id', schoolId)
            .eq('is_active', true)
            .or(`class_name.eq.${assignment.class_name},current_class.eq.${assignment.class_name}`);

          const studentsCount = students?.length || 0;
          totalStudents += studentsCount;

          schoolData.assignedClasses.push({
            name: assignment.class_name,
            studentsCount: studentsCount,
            subject: assignment.subject_name,
            weeklyHours: weeklyHours
          });

          schoolData.classes.push(assignment.class_name);
        }

        // Convertir en tableau et formatter
        const schoolAssignments = Array.from(schoolsMap.values()).map(school => ({
          ...school,
          subjects: Array.from(school.subjects),
          classes: [...new Set(school.classes)],
          assignmentType: school.weeklyHours > 15 ? 'principal' : 'secondaire',
          position: 'Enseignant'
        }));

        const formattedData = {
          totalSchools: schoolAssignments.length,
          totalWeeklyHours: totalWeeklyHours,
          totalStudents: totalStudents,
          availableHours: Math.max(0, 40 - totalWeeklyHours),
          assignments: schoolAssignments
        };

        setTeacherData(formattedData);
        
        if (schoolAssignments.length > 0) {
          setSelectedSchool(schoolAssignments[0].schoolId);
        }

      } catch (error) {
        console.error('Erreur lors du chargement des données enseignant:', error);
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) {
      loadTeacherData();
    }
  }, [teacherId]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-1/3"></div>
          <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-2/3"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
            <div className="h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
            <div className="h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!teacherData || teacherData.totalSchools === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-8 text-center shadow-lg">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
          <Icon name="School" size={32} className="text-white" />
        </div>
        <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">
          Affectation unique
        </h3>
        <p className="text-gray-600">
          Vous êtes actuellement affecté à un seul établissement
        </p>
      </div>
    );
  }

  const selectedAssignment = teacherData.assignments.find(a => a.schoolId === selectedSchool);

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble globale - Modernisée */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl border-2 border-purple-200 p-6 shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Icon name="Building" size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-2xl text-gray-900">
                  Multi-Établissements
                </h3>
                <p className="text-sm text-gray-600">
                  Votre activité répartie sur plusieurs écoles
                </p>
              </div>
            </div>
          </div>
          <div className="text-right bg-white rounded-xl p-4 shadow-md border-2 border-purple-200">
            <div className="text-4xl font-display font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {teacherData.totalSchools}
            </div>
            <div className="text-xs text-gray-600 font-medium">Établissement{teacherData.totalSchools > 1 ? 's' : ''}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur rounded-xl p-5 border-2 border-blue-200 shadow-md hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md">
                <Icon name="Clock" size={20} className="text-white" />
              </div>
              <span className="font-bold text-sm text-gray-700">Charge totale</span>
            </div>
            <div className="text-3xl font-display font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {teacherData.totalWeeklyHours}<span className="text-xl">h</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">par semaine</div>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-xl p-5 border-2 border-green-200 shadow-md hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                <Icon name="Users" size={20} className="text-white" />
              </div>
              <span className="font-bold text-sm text-gray-700">Total élèves</span>
            </div>
            <div className="text-3xl font-display font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {teacherData.totalStudents}
            </div>
            <div className="text-xs text-gray-600 mt-1">à encadrer</div>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-xl p-5 border-2 border-orange-200 shadow-md hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-md">
                <Icon name="TrendingUp" size={20} className="text-white" />
              </div>
              <span className="font-bold text-sm text-gray-700">Disponibilité</span>
            </div>
            <div className={`text-3xl font-display font-bold bg-clip-text text-transparent ${
              teacherData.availableHours > 10 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                : teacherData.availableHours > 5 
                ? 'bg-gradient-to-r from-orange-600 to-amber-600' 
                : 'bg-gradient-to-r from-red-600 to-rose-600'
            }`}>
              {teacherData.availableHours}<span className="text-xl">h</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">restantes</div>
          </div>
        </div>
      </div>

      {/* Sélecteur d'établissement - Modernisé */}
      {teacherData.assignments.length > 1 && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
          <h4 className="font-heading font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="MapPin" size={20} className="text-indigo-600" />
            Sélectionner un établissement
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teacherData.assignments.map((assignment) => (
              <button
                key={assignment.schoolId}
                onClick={() => setSelectedSchool(assignment.schoolId)}
                className={`group text-left p-4 rounded-xl border-2 transition-all shadow-md hover:shadow-xl hover:scale-105 ${
                  selectedSchool === assignment.schoolId
                    ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-indigo-200'
                    : 'border-gray-200 bg-white hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${
                      selectedSchool === assignment.schoolId
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}>
                      <Icon name="School" size={20} className="text-white" />
                    </div>
                    <h5 className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {assignment.school?.name || 'École'}
                    </h5>
                  </div>
                  {assignment.assignmentType === 'principal' && (
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-md">
                      Principal
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Icon name="BookOpen" size={14} className="text-indigo-600" />
                    <span className="text-gray-700 font-medium">
                      {assignment.classes.length} classe{assignment.classes.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Icon name="Clock" size={14} className="text-blue-600" />
                    <span className="text-gray-700 font-medium">{assignment.weeklyHours}h/semaine</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Détails de l'établissement sélectionné - Modernisé */}
      {selectedAssignment && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-heading font-bold text-2xl mb-2 flex items-center gap-2">
                  <Icon name="School" size={28} />
                  {selectedAssignment.school?.name || 'École'}
                </h4>
                <p className="text-indigo-100 text-sm">
                  {selectedAssignment.position}
                </p>
              </div>
              <div className="text-right bg-white/20 backdrop-blur rounded-xl p-4 border border-white/30">
                <div className="text-3xl font-display font-bold">{selectedAssignment.weeklyHours}h</div>
                <div className="text-xs text-indigo-100">par semaine</div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Matières enseignées */}
            <div>
              <h5 className="font-bold text-base text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="BookOpen" size={18} className="text-indigo-600" />
                Matières enseignées
              </h5>
              <div className="flex flex-wrap gap-2">
                {selectedAssignment.subjects.map((subject, index) => (
                  <span 
                    key={index}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm px-4 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all hover:scale-105"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {/* Classes assignées */}
            <div>
              <h5 className="font-bold text-base text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="Users" size={18} className="text-green-600" />
                Classes assignées ({selectedAssignment.assignedClasses.length})
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedAssignment.assignedClasses.map((classInfo, index) => (
                  <div key={index} className="group bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border-2 border-gray-200 shadow-md hover:shadow-xl hover:border-green-300 transition-all hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <h6 className="font-bold text-sm text-gray-900 mb-1">{classInfo.name}</h6>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-gray-600">
                            <Icon name="Users" size={12} className="text-green-600" />
                            {classInfo.studentsCount} élève{classInfo.studentsCount > 1 ? 's' : ''}
                          </span>
                          {classInfo.weeklyHours > 0 && (
                            <span className="flex items-center gap-1 text-gray-600">
                              <Icon name="Clock" size={12} className="text-blue-600" />
                              {classInfo.weeklyHours}h/sem
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Icon name="GraduationCap" size={20} className="text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Résumé de l'assignation */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                  <Icon name="CheckCircle" size={18} className="text-white" />
                </div>
                <span className="font-bold text-base text-gray-900">Résumé de l'assignation</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <span className="text-gray-600 text-xs block mb-1">Début</span>
                  <span className="text-gray-900 font-bold">
                    {new Date(selectedAssignment.startDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <span className="text-gray-600 text-xs block mb-1">Fin</span>
                  <span className="text-gray-900 font-bold">
                    {new Date(selectedAssignment.endDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <span className="text-gray-600 text-xs block mb-1">Type</span>
                  <span className="text-gray-900 font-bold capitalize">
                    {selectedAssignment.assignmentType}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <span className="text-gray-600 text-xs block mb-1">Statut</span>
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${selectedAssignment.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    <span className={`font-bold ${selectedAssignment.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                      {selectedAssignment.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicateur de charge de travail - Modernisé */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h5 className="font-bold text-base text-gray-900 flex items-center gap-2">
            <Icon name="Activity" size={20} className="text-blue-600" />
            Charge de travail globale
          </h5>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-md ${
            teacherData.totalWeeklyHours > 30 
              ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white' :
            teacherData.totalWeeklyHours > 20 
              ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white' :
            'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
          }`}>
            {teacherData.totalWeeklyHours > 30 ? '⚠️ Élevée' :
             teacherData.totalWeeklyHours > 20 ? '⚡ Modérée' : '✅ Légère'}
          </span>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">Heures enseignées</span>
            <span className="font-bold text-gray-900">
              {teacherData.totalWeeklyHours}h <span className="text-gray-400">/</span> 40h
            </span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div 
                className={`h-4 rounded-full transition-all duration-500 shadow-md ${
                  teacherData.totalWeeklyHours > 30 
                    ? 'bg-gradient-to-r from-red-500 to-rose-600' :
                  teacherData.totalWeeklyHours > 20 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-600'
                }`}
                style={{ width: `${Math.min((teacherData.totalWeeklyHours / 40) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium">
              <span>0h</span>
              <span>20h</span>
              <span>40h (max)</span>
            </div>
          </div>

          {teacherData.totalWeeklyHours > 35 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-start gap-2">
              <Icon name="AlertTriangle" size={16} className="text-red-600 mt-0.5" />
              <p className="text-xs text-red-700">
                <strong>Attention :</strong> Votre charge de travail dépasse le maximum recommandé. 
                Pensez à prendre du repos !
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherMultiSchoolOverview;