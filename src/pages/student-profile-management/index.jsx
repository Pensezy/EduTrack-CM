import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import StudentProfileHeader from './components/StudentProfileHeader';
import PersonalInformationForm from './components/PersonalInformationForm';
import AcademicRecordsSection from './components/AcademicRecordsSection';
import TransferWorkflowSection from './components/TransferWorkflowSection';
import CommunicationLogsSection from './components/CommunicationLogsSection';
import AdministrativeNotesSection from './components/AdministrativeNotesSection';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const StudentProfileManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState('secretary');
  const [selectedStudentId, setSelectedStudentId] = useState('STU-2024-001');
  const [activeTab, setActiveTab] = useState('profile');

  // Liste et données élèves dynamiques depuis Supabase
  const [studentsList, setStudentsList] = useState([]);
  const [studentData, setStudentData] = useState(null);

  // Charger la liste des élèves au montage
  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, matricule, class_id, user_id');
      if (!error && data) {
        // Charger aussi les infos utilisateur associées
        const userIds = data.map(s => s.user_id);
        const { data: users } = await supabase
          .from('app_users')
          .select('id, full_name, role')
          .in('id', userIds);
        // Fusionner les infos
        const students = data.map(s => ({
          id: s.id,
          matricule: s.matricule,
          class: s.class_id,
          user_id: s.user_id,
          name: users?.find(u => u.id === s.user_id)?.full_name || '',
          role: users?.find(u => u.id === s.user_id)?.role || ''
        }));
        setStudentsList(students);
        // Charger le premier élève par défaut
        if (students.length > 0) {
          setSelectedStudentId(students[0].id);
        }
      }
    };
    fetchStudents();
  }, []);

  // Charger les données détaillées de l'élève sélectionné
  useEffect(() => {
    if (!selectedStudentId) return;
    const fetchStudentData = async () => {
      const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', selectedStudentId)
        .single();
      if (!error && student) {
        // Charger aussi les infos utilisateur associées
        const { data: user } = await supabase
          .from('app_users')
          .select('full_name, email, phone, avatar_url, role')
          .eq('id', student.user_id)
          .single();
        setStudentData({ ...student, ...user });
      }
    };
    fetchStudentData();
  }, [selectedStudentId]);

  useEffect(() => {
    // Déterminer le rôle à partir du profil utilisateur connecté
    if (userProfile?.role) {
      setCurrentUserRole(userProfile.role);
      // Si étudiant, forcer l'affichage de son propre profil uniquement
      if (userProfile.role === 'student') {
        setSelectedStudentId(userProfile.id || 'STU-2024-001');
      }
      // Si parent, afficher seulement les enfants associés (à adapter selon structure réelle)
      if (userProfile.role === 'parent') {
        // Ici, on pourrait filtrer la liste des étudiants selon les enfants du parent
        // Pour la démo, on laisse la liste complète
      }
    } else {
      // Par défaut, garder le comportement existant
      const role = location?.state?.userRole || 'secretary';
      setCurrentUserRole(role);
    }
  }, [location, userProfile]);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handlePhotoUpdate = (newPhotoUrl) => {
    setStudentData(prev => ({
      ...prev,
      photo: newPhotoUrl
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSavePersonalInfo = (formData) => {
    setStudentData(prev => ({
      ...prev,
      ...formData
    }));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleStudentSelect = (studentId) => {
    // Contrôle d'accès : un étudiant ne peut voir que son propre profil
    if (userProfile?.role === 'student' && studentId !== userProfile.id) {
      alert("Vous n'avez pas accès à ce profil.");
      return;
    }
    setSelectedStudentId(studentId);
  };

  const handleExportData = () => {
    // Simulate data export
    const exportData = {
      student: studentData,
      exportDate: new Date()?.toISOString(),
      exportedBy: currentUserRole
    };
    console.log('Exporting student data:', exportData);
    // In a real app, this would trigger a download
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: 'User' },
    { id: 'academic', label: 'Académique', icon: 'BookOpen' },
    { id: 'transfer', label: 'Transfert', icon: 'ArrowRightLeft' },
    { id: 'communication', label: 'Communication', icon: 'MessageSquare' },
    { id: 'notes', label: 'Notes admin', icon: 'FileText' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        userRole={currentUserRole}
        userName="Utilisateur"
        onToggleSidebar={handleToggleSidebar}
      />
      {/* Sidebar */}
      <Sidebar
        userRole={currentUserRole}
        isCollapsed={isSidebarCollapsed}
        onToggle={handleToggleSidebar}
      />
      {/* Main Content */}
      <main className={`pt-16 transition-all duration-state ${
        isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      }`}>
        <div className="p-4 lg:p-6">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="font-heading font-heading-bold text-2xl lg:text-3xl text-foreground mb-2">
                Gestion des profils étudiants
              </h1>
              <p className="font-body font-body-normal text-muted-foreground">
                Gérez les informations complètes des étudiants et leur dossier académique
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              {/* Student Selector */}
              <select
                value={selectedStudentId}
                onChange={(e) => handleStudentSelect(e?.target?.value)}
                className="px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {studentsList?.map(student => (
                  <option key={student?.id} value={student?.id}>
                    {student?.name} - {student?.matricule}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={handleExportData}
                iconName="Download"
                iconPosition="left"
              >
                Exporter
              </Button>
            </div>
          </div>

          {/* Student Profile Header */}
          <StudentProfileHeader
            student={studentData}
            onPhotoUpdate={handlePhotoUpdate}
            onEdit={handleEditToggle}
            isEditing={isEditing}
          />

          {/* Navigation Tabs */}
          <div className="bg-card rounded-lg shadow-card mb-6">
            <div className="border-b border-border">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-body font-body-semibold text-sm transition-micro ${
                      activeTab === tab?.id
                        ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                    }`}
                  >
                    <Icon name={tab?.icon} size={16} />
                    <span>{tab?.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'profile' && (
              <PersonalInformationForm
                student={studentData}
                isEditing={isEditing}
                onSave={handleSavePersonalInfo}
                onCancel={handleCancelEdit}
              />
            )}

            {activeTab === 'academic' && (
              <AcademicRecordsSection student={studentData} />
            )}

            {activeTab === 'transfer' && (
              <TransferWorkflowSection student={studentData} />
            )}

            {activeTab === 'communication' && (
              <CommunicationLogsSection student={studentData} />
            )}

            {activeTab === 'notes' && (
              <AdministrativeNotesSection 
                student={studentData} 
                userRole={currentUserRole}
              />
            )}
          </div>

          {/* Quick Actions Footer */}
          <div className="mt-8 bg-card rounded-lg shadow-card p-6">
            <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
              Actions rapides
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                size="sm"
                iconName="Mail"
                iconPosition="left"
                fullWidth
              >
                Contacter parents
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="Calendar"
                iconPosition="left"
                fullWidth
              >
                Planifier RDV
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="FileText"
                iconPosition="left"
                fullWidth
              >
                Générer rapport
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="Archive"
                iconPosition="left"
                fullWidth
              >
                Archiver dossier
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentProfileManagement;