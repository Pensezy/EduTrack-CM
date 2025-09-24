import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import NotificationCenter from '../../components/ui/NotificationCenter';
import AccessibilityControls from '../../components/ui/AccessibilityControls';

// Import components
import GradeEntryModal from './components/GradeEntryModal';
import StudentGradeCard from './components/StudentGradeCard';
import AssignmentManager from './components/AssignmentManager';
import GradeAnalytics from './components/GradeAnalytics';
import BulkGradeEntry from './components/BulkGradeEntry';

const GradeManagementSystem = () => {
  const navigate = useNavigate();
  const [currentUser] = useState({
    role: 'secretary',
    name: 'Marie Dubois',
    id: 'secretary_001'
  });

  // UI State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('grades');
  const [selectedClass, setSelectedClass] = useState('6A');
  const [selectedSubject, setSelectedSubject] = useState('mathematics');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards');

  // Modal States
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isBulkEntryOpen, setIsBulkEntryOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Data States
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock Data
  const mockStudents = [
    {
      id: 'student_001',
      name: 'Lucas Martin',
      class: '6A',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      status: 'present'
    },
    {
      id: 'student_002',
      name: 'Emma Dubois',
      class: '6A',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      status: 'present'
    },
    {
      id: 'student_003',
      name: 'Noah Leroy',
      class: '6A',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      status: 'absent'
    },
    {
      id: 'student_004',
      name: 'Léa Bernard',
      class: '6A',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      status: 'present'
    },
    {
      id: 'student_005',
      name: 'Hugo Moreau',
      class: '6A',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      status: 'present'
    },
    {
      id: 'student_006',
      name: 'Chloé Petit',
      class: '6A',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      status: 'present'
    }
  ];

  const mockAssignments = [
    {
      id: 'assignment_001',
      title: 'Contrôle Algèbre',
      description: 'Évaluation sur les équations du premier degré',
      category: 'test',
      maxScore: 20,
      weight: 25,
      dueDate: '2024-12-15T10:00:00Z',
      gradeType: 'numerical',
      createdAt: '2024-12-01T08:00:00Z',
      currentGrade: {
        score: '16',
        percentage: '80.0',
        letterGrade: 'B',
        comments: 'Bon travail, quelques erreurs de calcul'
      }
    },
    {
      id: 'assignment_002',
      title: 'Devoir Géométrie',
      description: 'Exercices sur les triangles et leurs propriétés',
      category: 'homework',
      maxScore: 15,
      weight: 15,
      dueDate: '2024-12-18T23:59:00Z',
      gradeType: 'numerical',
      createdAt: '2024-12-05T14:00:00Z',
      currentGrade: {
        score: '13',
        percentage: '86.7',
        letterGrade: 'B',
        comments: 'Très bien, construction précise'
      }
    },
    {
      id: 'assignment_003',
      title: 'Projet Statistiques',
      description: 'Analyse de données et création de graphiques',
      category: 'project',
      maxScore: 25,
      weight: 30,
      dueDate: '2024-12-20T17:00:00Z',
      gradeType: 'numerical',
      createdAt: '2024-11-25T09:00:00Z'
    },
    {
      id: 'assignment_004',
      title: 'Participation Orale',
      description: 'Évaluation de la participation en classe',
      category: 'participation',
      maxScore: 10,
      weight: 10,
      dueDate: '2024-12-22T16:00:00Z',
      gradeType: 'competency',
      createdAt: '2024-12-01T08:00:00Z',
      currentGrade: {
        score: '8',
        percentage: '80.0',
        letterGrade: 'meets',
        comments: 'Participation active et pertinente'
      }
    }
  ];

  const classOptions = [
    { value: '6A', label: '6ème A (28 élèves)' },
    { value: '6B', label: '6ème B (26 élèves)' },
    { value: '5A', label: '5ème A (30 élèves)' },
    { value: '5B', label: '5ème B (27 élèves)' },
    { value: '4A', label: '4ème A (25 élèves)' },
    { value: '4B', label: '4ème B (29 élèves)' }
  ];

  const subjectOptions = [
    { value: 'mathematics', label: 'Mathématiques' },
    { value: 'french', label: 'Français' },
    { value: 'english', label: 'Anglais' },
    { value: 'history', label: 'Histoire-Géographie' },
    { value: 'science', label: 'Sciences' },
    { value: 'physics', label: 'Physique-Chimie' }
  ];

  const tabOptions = [
    { value: 'grades', label: 'Notes des élèves', icon: 'BookOpen' },
    { value: 'assignments', label: 'Gestion des évaluations', icon: 'FileText' },
    { value: 'analytics', label: 'Analyses', icon: 'BarChart3' }
  ];

  // Initialize data
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setStudents(mockStudents);
      setAssignments(mockAssignments);
      setLoading(false);
    }, 1000);
  }, [selectedClass, selectedSubject]);

  // Filter students based on search
  const filteredStudents = students?.filter(student =>
    student?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    student?.id?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  // Event Handlers
  const handleGradeEdit = (student, assignment) => {
    setSelectedStudent(student);
    setSelectedAssignment(assignment);
    setIsGradeModalOpen(true);
  };

  const handleGradeSave = (gradeData) => {
    // Update assignment with new grade
    setAssignments(prev => prev?.map(assignment => {
      if (assignment?.id === gradeData?.assignmentId) {
        return {
          ...assignment,
          currentGrade: gradeData?.grade
        };
      }
      return assignment;
    }));

    // Show success notification
    console.log('Grade saved:', gradeData);
  };

  const handleBulkGradeSave = async (bulkGrades) => {
    // Process bulk grade updates
    bulkGrades?.forEach(gradeData => {
      setAssignments(prev => prev?.map(assignment => {
        if (assignment?.id === gradeData?.assignmentId) {
          return {
            ...assignment,
            currentGrade: gradeData?.grade
          };
        }
        return assignment;
      }));
    });

    console.log('Bulk grades saved:', bulkGrades);
  };

  const handleViewDetails = (student) => {
    navigate('/student-profile-management', { 
      state: { studentId: student?.id, activeTab: 'grades' } 
    });
  };

  const handleAssignmentCreate = (assignmentData) => {
    setAssignments(prev => [...prev, assignmentData]);
  };

  const handleAssignmentUpdate = (assignmentData) => {
    setAssignments(prev => prev?.map(assignment => 
      assignment?.id === assignmentData?.id ? assignmentData : assignment
    ));
  };

  const handleAssignmentDelete = (assignmentId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ?')) {
      setAssignments(prev => prev?.filter(assignment => assignment?.id !== assignmentId));
    }
  };

  const openBulkEntry = (assignment) => {
    setSelectedAssignment(assignment);
    setIsBulkEntryOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          userRole={currentUser?.role}
          userName={currentUser?.name}
          isCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <Sidebar 
          userRole={currentUser?.role}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className={`pt-16 transition-all duration-state ${
          isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        }`}>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="font-body font-body-normal text-text-secondary">
                Chargement des données...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userRole={currentUser?.role}
        userName={currentUser?.name}
        isCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Sidebar 
        userRole={currentUser?.role}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className={`pt-16 transition-all duration-state ${
        isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      }`}>
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="font-heading font-heading-bold text-2xl text-text-primary">
                Système de gestion des notes
              </h1>
              <p className="font-body font-body-normal text-text-secondary mt-1">
                Gérez les évaluations et suivez les performances académiques
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <NotificationCenter userRole={currentUser?.role} />
              <AccessibilityControls />
            </div>
          </div>

          {/* Controls */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-wrap items-center gap-4">
                <Select
                  label="Classe"
                  options={classOptions}
                  value={selectedClass}
                  onChange={setSelectedClass}
                  className="w-48"
                />
                <Select
                  label="Matière"
                  options={subjectOptions}
                  value={selectedSubject}
                  onChange={setSelectedSubject}
                  className="w-48"
                />
                <Input
                  placeholder="Rechercher un élève..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e?.target?.value)}
                  className="w-64"
                />
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center bg-muted rounded-lg p-1">
                  {tabOptions?.map((tab) => (
                    <button
                      key={tab?.value}
                      onClick={() => setActiveTab(tab?.value)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-body font-body-normal transition-micro ${
                        activeTab === tab?.value
                          ? 'bg-primary text-primary-foreground'
                          : 'text-text-primary hover:bg-muted-foreground/10'
                      }`}
                    >
                      <Icon name={tab?.icon} size={16} />
                      <span className="hidden sm:inline">{tab?.label}</span>
                    </button>
                  ))}
                </div>

                {activeTab === 'grades' && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === 'cards' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('cards')}
                    >
                      <Icon name="Grid3X3" size={16} />
                    </Button>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                    >
                      <Icon name="List" size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'grades' && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="default" onClick={() => openBulkEntry(assignments?.[0])}>
                  <Icon name="Edit3" size={16} className="mr-2" />
                  Saisie groupée
                </Button>
                <Button variant="outline">
                  <Icon name="Download" size={16} className="mr-2" />
                  Exporter les notes
                </Button>
                <Button variant="outline">
                  <Icon name="Mail" size={16} className="mr-2" />
                  Notifier les parents
                </Button>
              </div>

              {/* Student Grades */}
              {viewMode === 'cards' ? (
                <div className="grid gap-6">
                  {filteredStudents?.map((student) => (
                    <StudentGradeCard
                      key={student?.id}
                      student={student}
                      assignments={assignments}
                      onGradeEdit={handleGradeEdit}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-6 py-3 text-left font-heading font-heading-semibold text-sm text-text-primary">
                            Élève
                          </th>
                          {assignments?.map((assignment) => (
                            <th key={assignment?.id} className="px-4 py-3 text-center font-heading font-heading-semibold text-sm text-text-primary min-w-24">
                              {assignment?.title}
                            </th>
                          ))}
                          <th className="px-6 py-3 text-center font-heading font-heading-semibold text-sm text-text-primary">
                            Moyenne
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredStudents?.map((student) => (
                          <tr key={student?.id} className="hover:bg-muted/50">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                  <span className="font-heading font-heading-semibold text-xs text-primary-foreground">
                                    {student?.name?.split(' ')?.map(n => n?.[0])?.join('')?.substring(0, 2)}
                                  </span>
                                </div>
                                <span className="font-body font-body-semibold text-sm text-card-foreground">
                                  {student?.name}
                                </span>
                              </div>
                            </td>
                            {assignments?.map((assignment) => (
                              <td key={assignment?.id} className="px-4 py-4 text-center">
                                <button
                                  onClick={() => handleGradeEdit(student, assignment)}
                                  className="hover:bg-muted rounded px-2 py-1 transition-micro"
                                >
                                  {assignment?.currentGrade ? (
                                    <div>
                                      <div className="font-heading font-heading-semibold text-sm text-primary">
                                        {assignment?.currentGrade?.score}/{assignment?.maxScore}
                                      </div>
                                      <div className="font-caption font-caption-normal text-xs text-muted-foreground">
                                        {assignment?.currentGrade?.percentage}%
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-muted-foreground">
                                      <Icon name="Plus" size={16} />
                                    </div>
                                  )}
                                </button>
                              </td>
                            ))}
                            <td className="px-6 py-4 text-center">
                              <div className="font-heading font-heading-semibold text-sm text-primary">
                                85.5%
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'assignments' && (
            <AssignmentManager
              assignments={assignments}
              onAssignmentCreate={handleAssignmentCreate}
              onAssignmentUpdate={handleAssignmentUpdate}
              onAssignmentDelete={handleAssignmentDelete}
            />
          )}

          {activeTab === 'analytics' && (
            <GradeAnalytics
              students={filteredStudents}
              assignments={assignments}
            />
          )}
        </div>
      </main>
      {/* Modals */}
      <GradeEntryModal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
        student={selectedStudent}
        assignment={selectedAssignment}
        onSave={handleGradeSave}
      />
      <BulkGradeEntry
        isOpen={isBulkEntryOpen}
        onClose={() => setIsBulkEntryOpen(false)}
        students={filteredStudents}
        assignment={selectedAssignment}
        onBulkSave={handleBulkGradeSave}
      />
    </div>
  );
};

export default GradeManagementSystem;