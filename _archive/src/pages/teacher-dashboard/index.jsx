import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { RESPONSIVE_CLASSES } from '../../utils/responsive';
import ResponsiveGrid, { MetricCard } from '../../components/ui/ResponsiveGrid';

import ClassSelector from './components/ClassSelector';
import AssignedClassesOverview from './components/AssignedClassesOverview';
import GradeEntryPanel from './components/GradeEntryPanel';
import GradesSummaryPanel from './components/GradesSummaryPanel';
import ConductPanel from './components/ConductPanel';
import ReportCard from './components/ReportCard';
import DocumentManager from './components/DocumentManager';
import AttendanceManager from './components/AttendanceManager';
import StudentCommunication from './components/StudentCommunication';
import TeacherSchedule from './components/TeacherSchedule';
import TeacherMultiSchoolOverview from './components/TeacherMultiSchoolOverview';

const TeacherDashboard = () => {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [gradesSubTab, setGradesSubTab] = useState('entry'); // 'entry' | 'summary' | 'conduct' | 'bulletin'
  const [showReportCard, setShowReportCard] = useState(null); // student object or null
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState('single'); // 'single' ou 'multi-school'

  // Récupérer l'utilisateur connecté
  const { user } = useAuth();

  // États pour les données réelles
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentsData, setStudentsData] = useState({});
  const [documentsData, setDocumentsData] = useState({});
  const [upcomingSchedule, setUpcomingSchedule] = useState([]);
  
  console.log('🏫 TeacherDashboard RENDER:', {
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    teacherDataName: teacherData?.name,
    classesInTeacherData: teacherData?.assignedClasses?.map(c => c.name)
  });

  // Helper function pour obtenir la date du prochain jour de la semaine
  const getCurrentDateForDay = (dayName) => {
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const targetDay = daysOfWeek.indexOf(dayName);
    
    if (targetDay === -1) {
      return new Date().toISOString().split('T')[0]; // Fallback sur aujourd'hui
    }
    
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7; // Si c'est aujourd'hui, prendre la semaine prochaine
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    
    return targetDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
  };

  // Charger les données réelles depuis Supabase
  useEffect(() => {
    const loadTeacherData = async () => {
      console.log('🔍 TeacherDashboard - Chargement des données...');
      console.log('  - user:', user);

      if (!user || !user.id) {
        console.log('⚠️ Pas d\'utilisateur connecté');
        setLoading(false);
        return;
      }

      try {
        console.log('✅ Chargement des données réelles...');
        console.log('  - User ID:', user.id);
        console.log('  - School ID:', user.current_school_id);
        
        setLoading(true);

        // 1. Récupérer les infos de l'enseignant depuis la table teachers
        const { data: teacherInfo, error: teacherError } = await supabase
          .from('teachers')
          .select(`
            id,
            user_id,
            first_name,
            last_name,
            specialty,
            hire_date,
            is_active,
            users!teachers_user_id_fkey (
              id,
              email,
              full_name,
              phone,
              current_school_id
            ),
            schools!teachers_school_id_fkey (
              id,
              name,
              code
            )
          `)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (teacherError) {
          console.error('❌ Erreur chargement enseignant:', teacherError);
          throw teacherError;
        }

        console.log('✅ Infos enseignant chargées:', teacherInfo);

        // 2. Récupérer l'année académique actuelle
        const { data: academicYear, error: academicYearError } = await supabase
          .from('academic_years')
          .select('id, name, start_date, end_date')
          .eq('school_id', teacherInfo.school_id)
          .eq('is_current', true)
          .single();
        
        if (academicYearError) {
          console.warn('⚠️ Année académique non trouvée:', academicYearError);
        } else {
          console.log('✅ Année académique actuelle:', academicYear);
        }

        // 3. Récupérer les assignations (classes assignées)
        const { data: assignments, error: assignmentsError } = await supabase
          .from('teacher_assignments')
          .select(`
            id,
            class_id,
            subject_id,
            class_name,
            subject_name,
            school_id,
            schedule,
            is_active,
            classes!teacher_assignments_class_id_fkey (
              id,
              name,
              level,
              section
            ),
            subjects!teacher_assignments_subject_id_fkey (
              id,
              name,
              code
            ),
            schools!teacher_assignments_school_id_fkey (
              id,
              name
            )
          `)
          .eq('teacher_id', teacherInfo.id)
          .eq('is_active', true);

        if (assignmentsError) {
          console.error('❌ Erreur chargement assignations:', assignmentsError);
          throw assignmentsError;
        }

        console.log('✅ Assignations chargées:', assignments?.length || 0);

        // 3. Pour chaque classe, récupérer les élèves avec leurs notes et présences
        const studentsDataByClass = {};
        
        if (assignments && assignments.length > 0) {
          for (const assignment of assignments) {
            const classId = assignment.class_id;
            const className = assignment.class_name;
            const schoolId = assignment.school_id;
            
            let students = [];
            
            // Si on a un class_id, on l'utilise
            if (classId) {
              const { data, error: studentsError } = await supabase
                .from('students')
                .select(`
                  id,
                  matricule,
                  user_id,
                  class_id,
                  users!students_user_id_fkey (
                    id,
                    full_name,
                    email,
                    phone
                  )
                `)
                .eq('class_id', classId)
                .eq('is_active', true);

              if (studentsError) {
                console.error('Erreur chargement élèves par class_id:', studentsError);
              } else {
                students = data || [];
              }
            }
            // Sinon, on utilise class_name + school_id
            else if (className && schoolId) {
              console.log(`🔍 Recherche élèves pour classe: ${className}, école: ${schoolId}`);
              
              const { data, error: studentsError } = await supabase
                .from('students')
                .select(`
                  id,
                  matricule,
                  user_id,
                  class_name,
                  current_class,
                  school_id,
                  users!students_user_id_fkey (
                    id,
                    full_name,
                    email,
                    phone
                  )
                `)
                .eq('school_id', schoolId)
                .eq('is_active', true);

              if (studentsError) {
                console.error('❌ Erreur chargement élèves par class_name:', studentsError);
              } else {
                // Filtrer côté client pour gérer class_name OU current_class
                const filteredStudents = (data || []).filter(student => 
                  student.class_name === className || student.current_class === className
                );
                students = filteredStudents;
                console.log(`✅ ${students.length} élève(s) trouvé(s) pour "${className}" sur ${data?.length || 0} élèves de l'école`);
              }
            }
            // Si ni class_id ni class_name, on ne peut pas charger les élèves
            else {
              console.log('ℹ️ Assignation sans class_id ni class_name:', assignment);
              studentsDataByClass[assignment.id] = [];
              continue;
            }

            // Pour chaque élève, récupérer les notes récentes
            const studentIds = students?.map(s => s.id) || [];
            
            const { data: grades, error: gradesError } = await supabase
              .from('grades')
              .select('student_id, grade, evaluation_type, created_at, subject_name')
              .in('student_id', studentIds)
              .order('created_at', { ascending: false })
              .limit(100);

            if (gradesError) {
              console.warn('Erreur chargement notes:', gradesError);
            }

            // Récupérer les présences
            const { data: attendances, error: attendancesError } = await supabase
              .from('attendances')
              .select('student_id, status')
              .in('student_id', studentIds);

            if (attendancesError) {
              console.warn('Erreur chargement présences:', attendancesError);
            }

            // Créer des maps pour accès rapide
            const gradesByStudent = new Map();
            (grades || []).forEach(grade => {
              if (!gradesByStudent.has(grade.student_id)) {
                gradesByStudent.set(grade.student_id, []);
              }
              gradesByStudent.get(grade.student_id).push(grade);
            });

            const attendancesByStudent = new Map();
            (attendances || []).forEach(att => {
              if (!attendancesByStudent.has(att.student_id)) {
                attendancesByStudent.set(att.student_id, { present: 0, absent: 0, late: 0 });
              }
              const stats = attendancesByStudent.get(att.student_id);
              if (att.status === 'present') stats.present++;
              else if (att.status === 'absent') stats.absent++;
              else if (att.status === 'late') stats.late++;
            });

            // Formatter les données des élèves
            if (students) {
              studentsDataByClass[assignment.id] = students.map(student => {
                const studentGrades = gradesByStudent.get(student.id) || [];
                const studentAttendance = attendancesByStudent.get(student.id) || { present: 0, absent: 0, late: 0 };
                
                return {
                  id: student.id,
                  name: student.users?.full_name || 'Élève',
                  matricule: student.matricule,
                  email: student.users?.email,
                  phone: student.users?.phone,
                  recentGrades: studentGrades.slice(0, 5).map(g => ({
                    subject: g.subject_name || assignment.subject_name,
                    grade: g.grade,
                    date: new Date(g.created_at).toLocaleDateString('fr-FR'),
                    type: g.evaluation_type || 'Évaluation'
                  })),
                  attendance: studentAttendance
                };
              });
            }
          }
        }

        console.log('✅ Élèves chargés pour', Object.keys(studentsDataByClass).length, 'assignations');

        // 4. Formatter les données pour correspondre au format attendu
        const formattedTeacherData = {
          id: teacherInfo.id,
          name: teacherInfo.users?.full_name || `${teacherInfo.first_name} ${teacherInfo.last_name}`,
          email: teacherInfo.users?.email,
          phone: teacherInfo.users?.phone,
          specialty: teacherInfo.specialty,
          school: teacherInfo.schools?.name || 'Établissement non renseigné',
          employeeId: `ENS-${teacherInfo.id.substring(0, 8)}`,
          assignedClasses: (assignments || []).map(assignment => {
            const students = studentsDataByClass[assignment.id] || [];
            
            // Calculer la moyenne de la classe
            let classAverage = null;
            if (students.length > 0) {
              const studentsWithGrades = students.filter(s => s.recentGrades && s.recentGrades.length > 0);
              if (studentsWithGrades.length > 0) {
                const totalAvg = studentsWithGrades.reduce((sum, student) => {
                  const studentAvg = student.recentGrades.reduce((s, g) => s + g.grade, 0) / student.recentGrades.length;
                  return sum + studentAvg;
                }, 0);
                classAverage = totalAvg / studentsWithGrades.length;
              }
            }
            
            // Calculer le taux de présence
            let attendanceRate = null;
            if (students.length > 0) {
              const totalPresent = students.reduce((sum, s) => sum + (s.attendance?.present || 0), 0);
              const totalAbsent = students.reduce((sum, s) => sum + (s.attendance?.absent || 0), 0);
              const totalLate = students.reduce((sum, s) => sum + (s.attendance?.late || 0), 0);
              const total = totalPresent + totalAbsent + totalLate;
              if (total > 0) {
                attendanceRate = Math.round((totalPresent / total) * 100);
              }
            }
            
            return {
              id: assignment.id,
              name: assignment.class_name || assignment.classes?.name || 'Classe',
              level: assignment.classes?.level || assignment.class_name || 'Non défini',
              section: assignment.classes?.section || '',
              school: assignment.schools?.name || teacherInfo.schools?.name || 'École',
              subject: assignment.subject_name || assignment.subjects?.name || 'Matière',
              students: students.length,
              schedule: assignment.schedule || { weekly_hours: 0 },
              average: classAverage,
              attendanceRate: attendanceRate,
              // IDs nécessaires pour l'enregistrement des notes
              school_id: assignment.school_id || teacherInfo.school_id,
              subject_id: assignment.subject_id,
              class_id: assignment.class_id,
              teacher_id: teacherInfo.id,
              academic_year_id: academicYear?.id || null
            };
          })
        };

        console.log('✅ Données formatées:', formattedTeacherData);

        // 5. Générer l'emploi du temps à partir des assignations
        const scheduleData = [];
        if (assignments && assignments.length > 0) {
          assignments.forEach(assignment => {
            if (assignment.schedule && Array.isArray(assignment.schedule)) {
              assignment.schedule.forEach(slot => {
                scheduleData.push({
                  id: `schedule-${assignment.id}-${slot.day}`,
                  className: assignment.class_name || assignment.classes?.name,
                  subject: assignment.subject_name || assignment.subjects?.name,
                  day: slot.day,
                  time: slot.time,
                  room: slot.room,
                  date: getCurrentDateForDay(slot.day), // Fonction helper pour obtenir la prochaine occurrence du jour
                  type: 'course'
                });
              });
            }
          });
        }
        console.log('✅ Emploi du temps généré:', scheduleData.length, 'créneaux');

        // 6. Charger les documents de l'enseignant depuis la base de données
        // Note: uploaded_by contient l'ID de la table users (pas auth.users)
        // Pour les utilisateurs Supabase Auth classiques, user.id = users.id
        // Mais on recherche aussi par school_id pour être sûr de récupérer tous les documents
        const documentsDataByClass = {};
        try {
          // Récupérer d'abord l'ID utilisateur depuis la table users
          const { data: dbUserData } = await supabase
            .from('users')
            .select('id')
            .eq('email', user.email)
            .single();
          
          const dbUserId = dbUserData?.id || user.id;
          console.log('📄 Chargement documents pour user ID:', dbUserId);
          
          const { data: teacherDocs, error: docsError } = await supabase
            .from('documents')
            .select('*')
            .eq('uploaded_by', dbUserId)
            .order('created_at', { ascending: false });

          if (docsError) {
            console.warn('⚠️ Erreur chargement documents:', docsError);
          } else if (teacherDocs && teacherDocs.length > 0) {
            console.log('✅ Documents chargés:', teacherDocs.length);
            
            // Organiser les documents par classe (class_name)
            teacherDocs.forEach(doc => {
              const classKey = doc.class_name || 'general';
              if (!documentsDataByClass[classKey]) {
                documentsDataByClass[classKey] = [];
              }
              documentsDataByClass[classKey].push({
                id: doc.id,
                title: doc.title,
                type: doc.document_type,
                document_type: doc.document_type, // Double mapping pour compatibilité
                file_name: doc.file_name,
                file_path: doc.file_path,
                file_size: doc.file_size,
                mime_type: doc.mime_type,
                visibility: doc.visibility,
                is_public: doc.is_public,
                created_at: doc.created_at, // Date de création
                uploadedAt: doc.created_at,
                class_name: doc.class_name
              });
            });
            
            // Aussi indexer par class_id si disponible dans les assignations
            if (assignments && assignments.length > 0) {
              assignments.forEach(assignment => {
                const className = assignment.class_name || assignment.classes?.name;
                if (className && documentsDataByClass[className]) {
                  // Copier aussi sous l'ID de la classe pour compatibilité
                  documentsDataByClass[assignment.class_id] = documentsDataByClass[className];
                }
              });
            }
          }
        } catch (docErr) {
          console.warn('⚠️ Erreur lors du chargement des documents:', docErr);
        }
        console.log('✅ Documents organisés par classe:', Object.keys(documentsDataByClass));

        setTeacherData(formattedTeacherData);
        setStudentsData(studentsDataByClass);
        setDocumentsData(documentsDataByClass);
        setUpcomingSchedule(scheduleData);
        
        console.log('🎯 DONNÉES RÉELLES DÉFINIES:');
        console.log('  - Nombre de classes:', formattedTeacherData.assignedClasses?.length);
        console.log('  - Classes:', formattedTeacherData.assignedClasses?.map(c => c.name));
        console.log('  - Nom enseignant:', formattedTeacherData.name);

      } catch (error) {
        console.error('❌ Erreur chargement données enseignant:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeacherData();
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // NE PAS sélectionner automatiquement une classe
  // L'utilisateur doit choisir manuellement
  /*
  useEffect(() => {
    // Set first class as selected by default
    if (teacherData?.assignedClasses?.length > 0 && !selectedClass) {
      setSelectedClass(teacherData?.assignedClasses?.[0]);
      setSelectedSubject(teacherData?.assignedClasses?.[0]?.subject);
    }
  }, [teacherData]);
  */

  const handleClassSelect = (classData) => {
    console.log('📌 Classe sélectionnée:', classData);
    setSelectedClass(classData);
    setSelectedSubject(classData?.subject);
  };

  const getGreeting = () => {
    const hour = currentTime?.getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";  
    return "Bonsoir";
  };

  const getTotalStudents = () => {
    return teacherData?.assignedClasses?.reduce((total, cls) => total + cls?.students, 0);
  };

  const getCurrentWeekSchedule = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek?.setDate(today?.getDate() - today?.getDay() + 1); // Monday
    
    return upcomingSchedule?.filter(schedule => {
      const scheduleDate = new Date(schedule?.date);
      const diffTime = scheduleDate - startOfWeek;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays < 7;
    });
  };

  const renderTabContent = () => {
    console.log('🖼️ RENDER TAB - teacherData:', {
      hasData: !!teacherData,
      name: teacherData?.name,
      classCount: teacherData?.assignedClasses?.length,
      classes: teacherData?.assignedClasses
    });
    
    switch (currentTab) {
      case 'classes':
        return (
          <div className="space-y-6">
            <h2 className="font-heading font-heading-bold text-2xl text-card-foreground">Mes Classes</h2>
            {teacherData?.assignedClasses && teacherData?.assignedClasses?.length > 0 ? (
              <>
                <ClassSelector
                  classes={teacherData?.assignedClasses}
                  selectedClass={selectedClass}
                  onClassSelect={handleClassSelect}
                />
                {selectedClass && (
                  <AssignedClassesOverview 
                    classes={teacherData?.assignedClasses}
                    selectedClass={selectedClass}
                  />
                )}
              </>
            ) : (
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <Icon name="GraduationCap" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-text-secondary">Aucune classe assignée pour le moment</p>
                <p className="text-sm text-muted-foreground mt-2">Contactez votre directeur pour obtenir vos affectations</p>
              </div>
            )}
          </div>
        );

      case 'grades':
        return (
          <div className="space-y-6">
            <h2 className="font-heading font-heading-bold text-2xl text-card-foreground">Gestion des Notes</h2>
            {teacherData?.assignedClasses && teacherData?.assignedClasses?.length > 0 ? (
              selectedClass ? (
                <div>
                  {/* Sous-onglets Notes */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <button
                      onClick={() => setGradesSubTab('entry')}
                      className={`px-4 py-2 rounded-md flex items-center gap-2 ${gradesSubTab === 'entry' ? 'bg-indigo-600 text-white' : 'bg-white border border-border hover:bg-gray-50'}`}
                    >
                      <Icon name="Edit3" size={16} />
                      Saisie
                    </button>
                    <button
                      onClick={() => setGradesSubTab('summary')}
                      className={`px-4 py-2 rounded-md flex items-center gap-2 ${gradesSubTab === 'summary' ? 'bg-indigo-600 text-white' : 'bg-white border border-border hover:bg-gray-50'}`}
                    >
                      <Icon name="BarChart2" size={16} />
                      Synthèse
                    </button>
                    <button
                      onClick={() => setGradesSubTab('conduct')}
                      className={`px-4 py-2 rounded-md flex items-center gap-2 ${gradesSubTab === 'conduct' ? 'bg-indigo-600 text-white' : 'bg-white border border-border hover:bg-gray-50'}`}
                    >
                      <Icon name="UserCheck" size={16} />
                      Vie Scolaire
                    </button>
                    {/* Bouton Bulletins supprimé du dashboard enseignant */}
                  </div>

                  {gradesSubTab === 'entry' && (
                    <GradeEntryPanel 
                      classData={selectedClass}
                      students={studentsData?.[selectedClass?.id] || []}
                      onGradeAdded={() => {
                        const loadTeacherData = async () => {
                          setLoading(true);
                          try {
                            window.location.reload();
                          } catch (error) {
                            console.error('Erreur rechargement:', error);
                          }
                        };
                        loadTeacherData();
                      }}
                    />
                  )}

                  {gradesSubTab === 'summary' && (
                    <GradesSummaryPanel
                      classData={selectedClass}
                      students={studentsData?.[selectedClass?.id] || []}
                    />
                  )}

                  {gradesSubTab === 'conduct' && (
                    <ConductPanel
                      classData={selectedClass}
                      students={studentsData?.[selectedClass?.id] || []}
                    />
                  )}

                  {/* Panneau Bulletins supprimé du dashboard enseignant */}

                  {/* Modal Bulletin supprimé du dashboard enseignant */}
                </div>
              ) : (
                <div className="bg-card rounded-lg border border-border p-8 text-center">
                  <Icon name="BookOpen" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-text-secondary">Sélectionnez une classe pour gérer les notes</p>
                </div>
              )
            ) : (
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <Icon name="BookOpen" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-text-secondary">Aucune classe assignée pour le moment</p>
                <p className="text-sm text-muted-foreground mt-2">Contactez votre directeur pour obtenir vos affectations</p>
              </div>
            )}
          </div>
        );

      case 'attendance':
        return (
          <div className="space-y-6">
            <h2 className="font-heading font-heading-bold text-2xl text-card-foreground">Gestion des Présences</h2>
            {teacherData?.assignedClasses && teacherData?.assignedClasses?.length > 0 ? (
              selectedClass ? (
                <AttendanceManager
                  classData={selectedClass}
                  students={studentsData?.[selectedClass?.id] || []}
                />
              ) : (
                <div className="bg-card rounded-lg border border-border p-8 text-center">
                  <Icon name="Calendar" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-text-secondary">Sélectionnez une classe pour gérer les présences</p>
                </div>
              )
            ) : (
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <Icon name="Calendar" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-text-secondary">Aucune classe assignée pour le moment</p>
                <p className="text-sm text-muted-foreground mt-2">Contactez votre directeur pour obtenir vos affectations</p>
              </div>
            )}
          </div>
        );

      case 'documents':
        // Récupérer les documents pour la classe sélectionnée (par ID ou par nom)
        const classDocuments = selectedClass 
          ? (documentsData?.[selectedClass?.id] || documentsData?.[selectedClass?.name] || [])
          : [];
        console.log('📄 Documents pour la classe:', selectedClass?.name, '→', classDocuments?.length, 'documents');
        console.log('📄 documentsData keys:', Object.keys(documentsData || {}));
        
        return (
          <div className="space-y-6">
            <h2 className="font-heading font-heading-bold text-2xl text-card-foreground">Mes Documents</h2>
            {teacherData?.assignedClasses && teacherData?.assignedClasses?.length > 0 ? (
              selectedClass ? (
                <DocumentManager 
                  classData={selectedClass}
                  documents={classDocuments}
                />
              ) : (
                <div className="bg-card rounded-lg border border-border p-8 text-center">
                  <Icon name="Files" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-text-secondary">Sélectionnez une classe pour gérer les documents</p>
                </div>
              )
            ) : (
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <Icon name="Files" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-text-secondary">Aucune classe assignée pour le moment</p>
                <p className="text-sm text-muted-foreground mt-2">Contactez votre directeur pour obtenir vos affectations</p>
              </div>
            )}
          </div>
        );

      case 'account':
        return (
          <div className="space-y-6">
            {/* Header modernisé */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
                  👤
                </div>
                <div>
                  <h2 className="font-display font-bold text-2xl">
                    Mon Profil Enseignant
                  </h2>
                  <p className="text-indigo-100 text-sm mt-1">
                    Informations personnelles et professionnelles
                  </p>
                </div>
              </div>
            </div>
            
            {/* Carte principale du profil - Modernisée */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-8">
              <div className="flex items-start space-x-6 mb-8">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Icon name="User" size={56} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-3xl text-gray-900 mb-3">
                    {teacherData?.name || 'Nom non disponible'}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                      <div className="p-1.5 rounded-lg bg-blue-100">
                        <Icon name="Mail" size={18} className="text-blue-600" />
                      </div>
                      <span className="font-body-medium text-gray-700">{teacherData?.email || 'Email non renseigné'}</span>
                    </div>
                    {teacherData?.phone && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                        <div className="p-1.5 rounded-lg bg-green-100">
                          <Icon name="Phone" size={18} className="text-green-600" />
                        </div>
                        <span className="font-body-medium text-gray-700">{teacherData.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                      <div className="p-1.5 rounded-lg bg-purple-100">
                        <Icon name="Hash" size={18} className="text-purple-600" />
                      </div>
                      <span className="font-body-medium text-gray-700">Matricule: {teacherData?.employeeId || 'Non attribué'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-md">
                  <Icon name="CheckCircle" size={22} />
                  <span className="font-body-bold">Actif</span>
                </div>
              </div>

              <div className="border-t-2 border-gray-100 pt-8">
                <h4 className="font-body-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                  <Icon name="Briefcase" size={24} className="text-indigo-600" />
                  Informations professionnelles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  {/* Spécialité - Modernisée */}
                  {teacherData?.specialty && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-200 shadow-md hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                          <Icon name="BookOpen" size={20} className="text-white" />
                        </div>
                        <div className="text-sm font-body-bold text-gray-600">
                          Spécialité
                        </div>
                      </div>
                      <div className="font-body-bold text-lg text-gray-900">
                        {teacherData.specialty}
                      </div>
                    </div>
                  )}

                  {/* Établissement - Modernisé */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200 shadow-md hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-md">
                        <Icon name="School" size={20} className="text-white" />
                      </div>
                      <div className="text-sm font-body-bold text-gray-600">
                        Établissement
                      </div>
                    </div>
                    <div className="font-body-bold text-lg text-gray-900">
                      {teacherData?.school || teacherData?.assignedClasses?.[0]?.school || 'Non renseigné'}
                    </div>
                  </div>
                </div>

                {/* Statistiques - Modernisées */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* Classes assignées */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200 shadow-md hover:shadow-xl transition-all hover:scale-105">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                        <Icon name="GraduationCap" size={22} className="text-white" />
                      </div>
                      <div className="text-sm font-body-bold text-gray-600">
                        Classes assignées
                      </div>
                    </div>
                    <div className="text-4xl font-display font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {teacherData?.assignedClasses?.length || 0}
                    </div>
                  </div>

                  {/* Total élèves */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border-2 border-orange-200 shadow-md hover:shadow-xl transition-all hover:scale-105">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-md">
                        <Icon name="Users" size={22} className="text-white" />
                      </div>
                      <div className="text-sm font-body-bold text-gray-600">
                        Total élèves
                      </div>
                    </div>
                    <div className="text-4xl font-display font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                      {getTotalStudents() || 0}
                    </div>
                  </div>

                  {/* Heures par semaine */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-200 shadow-md hover:shadow-xl transition-all hover:scale-105">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                        <Icon name="Clock" size={22} className="text-white" />
                      </div>
                      <div className="text-sm font-body-bold text-gray-600">
                        Heures / semaine
                      </div>
                    </div>
                    <div className="text-4xl font-display font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {teacherData?.assignedClasses?.reduce((total, cls) => {
                        return total + (cls.schedule?.weekly_hours || 0);
                      }, 0) || 0}<span className="text-2xl">h</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des classes assignées - Modernisée */}
              {teacherData?.assignedClasses && teacherData.assignedClasses.length > 0 && (
                <div className="border-t-2 border-gray-100 pt-8 mt-8">
                  <h4 className="font-body-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                    <Icon name="BookOpen" size={24} className="text-green-600" />
                    Mes classes et matières
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {teacherData.assignedClasses.map((cls, index) => (
                      <div 
                        key={cls.id} 
                        className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border-2 border-gray-200 shadow-md hover:shadow-xl hover:scale-102 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                              <span className="font-display font-bold text-white text-lg">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <div className="font-display font-bold text-lg text-gray-900">
                                {cls.name}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-body-bold">
                                  {cls.subject}
                                </span>
                                {cls.level && cls.level !== 'Non défini' && (
                                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg font-body-bold">
                                    {cls.level}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl border border-orange-200">
                              <Icon name="Users" size={18} className="text-orange-600" />
                              <span className="font-body-bold text-orange-700">
                                {cls.students} élève{cls.students > 1 ? 's' : ''}
                              </span>
                            </div>
                            {cls.schedule?.weekly_hours > 0 && (
                              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
                                <Icon name="Clock" size={18} className="text-blue-600" />
                                <span className="font-body-bold text-blue-700">
                                  {cls.schedule.weekly_hours}h/sem
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default: // 'dashboard'
        return (
          <>
            {/* Bandeau de bienvenue modernisé */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
                    🎓
                  </div>
                  <div>
                    <p className="text-green-100 text-sm">{getGreeting()},</p>
                    <h2 className="font-display font-bold text-2xl">
                      {teacherData?.name || 'Enseignant'}
                    </h2>
                    <p className="text-green-100 text-sm mt-1">
                      {teacherData?.specialty || 'Matière'} • {teacherData?.assignedClasses?.length || 0} classe{teacherData?.assignedClasses?.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-green-100 text-sm">{currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="font-display font-bold text-2xl">{currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>

            {/* Message si aucune classe assignée - Modernisé */}
            {(!teacherData?.assignedClasses || teacherData?.assignedClasses?.length === 0) && (
              <div className="bg-white border-2 border-blue-200 rounded-2xl shadow-lg p-12 text-center">
                <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 mb-4">
                  <Icon name="GraduationCap" size={48} className="text-blue-600" />
                </div>
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
                  Aucune classe assignée
                </h3>
                <p className="text-gray-600 font-body-medium mb-6 max-w-md mx-auto">
                  Vous n'avez pas encore de classes assignées. Contactez votre directeur d'établissement pour obtenir vos affectations de cours.
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 inline-block">
                  <p className="text-sm text-gray-800 font-body-bold mb-3">
                    💡 Conseil : Une fois vos classes assignées, vous pourrez :
                  </p>
                  <ul className="text-sm text-gray-700 text-left space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Gérer les notes de vos élèves
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Suivre les présences
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Partager des documents pédagogiques
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Communiquer avec les élèves et parents
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Mode Selector - Modernisé */}
            {teacherData?.assignedClasses && teacherData?.assignedClasses?.length > 0 && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="font-body-bold text-lg text-gray-900 mb-1 flex items-center gap-2">
                      <Icon name="Layout" size={20} className="text-green-600" />
                      Mode d'affichage
                    </h3>
                    <p className="text-sm text-gray-600 font-body-medium">
                      Choisissez entre vue établissement unique ou multi-établissements
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setViewMode('single')}
                      className={`px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg ${
                        viewMode === 'single'
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                      }`}
                    >
                      <Icon name="School" size={18} className="mr-2 inline" />
                      Vue Simple
                    </button>
                    <button
                      onClick={() => setViewMode('multi-school')}
                      className={`px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg ${
                        viewMode === 'multi-school'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                      }`}
                    >
                      <Icon name="Building" size={18} className="mr-2 inline" />
                      Multi-Établissements
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Vue Multi-Établissements - Affiché uniquement si classes assignées */}
            {viewMode === 'multi-school' && teacherData?.assignedClasses && teacherData?.assignedClasses?.length > 0 && (
              <TeacherMultiSchoolOverview teacherId={teacherData?.id} />
            )}

            {/* Vue Simple - Contenu existant */}
            {viewMode === 'single' && teacherData?.assignedClasses && teacherData?.assignedClasses?.length > 0 && (
              <>
                {/* Class Selector */}
                <ClassSelector
                  classes={teacherData?.assignedClasses}
                  selectedClass={selectedClass}
                  onClassSelect={handleClassSelect}
                />

                {/* Assigned Classes Overview */}
                <AssignedClassesOverview 
                  classes={teacherData?.assignedClasses}
                  selectedClass={selectedClass}
                />

                {/* Main Dashboard Content */}
                {selectedClass && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left Column - Grade Entry and Attendance */}
                    <div className="xl:col-span-2 space-y-6">
                      <GradeEntryPanel 
                        classData={selectedClass}
                        students={studentsData?.[selectedClass?.id] || []}
                        onGradeAdded={() => {
                          // Recharger les données après ajout d'une note
                          window.location.reload();
                        }}
                      />
                      <AttendanceManager
                        classData={selectedClass}
                        students={studentsData?.[selectedClass?.id] || []}
                      />
                    </div>

                    {/* Right Column - Documents and Communication */}
                    <div className="space-y-6">
                      <DocumentManager 
                        classData={selectedClass}
                        documents={
                          documentsData?.[selectedClass?.id] ||
                          documentsData?.[selectedClass?.name] ||
                          []
                        }
                      />
                      <StudentCommunication 
                        classData={selectedClass}
                        students={studentsData?.[selectedClass?.id] || []}
                      />
                    </div>
                  </div>
                )}

                {/* Teacher Schedule */}
                <TeacherSchedule 
                  schedule={getCurrentWeekSchedule()}
                  teacherName={teacherData?.name}
                />
              </>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userRole="teacher" 
        userName={teacherData?.name || 'Enseignant'}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Sidebar 
        userRole="teacher"
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className={`pt-20 sm:pt-16 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        <div className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4 w-full overflow-x-hidden">
          
          {/* Indicateur de chargement */}
          {loading && (
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600 mx-auto mb-2"></div>
              <p className="text-blue-900 text-sm font-semibold">Chargement...</p>
            </div>
          )}

          {/* Welcome Section */}
          {!loading && teacherData && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-3 sm:p-4 text-white">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                    👩‍🏫
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-sm sm:text-base font-bold truncate">
                      {getGreeting()}, {teacherData?.name?.split(' ')[0] || teacherData?.name}
                    </h1>
                    <p className="text-xs text-green-100">
                      {currentTime?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {teacherData?.assignedClasses?.length > 0 && (
                  <div className="flex gap-2 flex-shrink-0">
                    <div className="bg-white/20 rounded px-2 py-1 text-center">
                      <div className="text-sm sm:text-base font-bold">{teacherData?.assignedClasses?.length}</div>
                      <div className="text-xs">Classes</div>
                    </div>
                    <div className="bg-white/20 rounded px-2 py-1 text-center">
                      <div className="text-sm sm:text-base font-bold">{getTotalStudents()}</div>
                      <div className="text-xs">Élèves</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Content */}
          {!loading && teacherData && renderTabContent()}
          
          {/* Message si pas de données - Modernisé */}
          {!loading && !teacherData && (
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl p-8 text-center shadow-lg">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-md">
                <Icon name="AlertTriangle" size={40} className="text-white" />
              </div>
              <h3 className="text-2xl font-display font-bold text-yellow-900 mb-3">Aucune donnée disponible</h3>
              <p className="text-yellow-700 font-body-medium text-lg">
                Veuillez contacter votre directeur pour configurer votre compte enseignant.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;