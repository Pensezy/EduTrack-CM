import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import StudentProfileHeader from './components/StudentProfileHeader';
import PersonalInformationForm from './components/PersonalInformationForm';
import AcademicRecordsSection from './components/AcademicRecordsSection';
import TransferWorkflowSection from './components/TransferWorkflowSection';
import CommunicationLogsSection from './components/CommunicationLogsSection';
import AdministrativeNotesSection from './components/AdministrativeNotesSection';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';

const StudentProfileManagement = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState('secretary');
  const [selectedStudentId, setSelectedStudentId] = useState('STU-2024-001');
  const [activeTab, setActiveTab] = useState('profile');
  
  // Récupérer les informations de l'utilisateur connecté
  const { user } = useAuth();

  // Mock student data
  const [studentData, setStudentData] = useState({
    studentId: 'STU-2024-001',
    firstName: 'Marie',
    lastName: 'Dubois',
    dateOfBirth: '15/03/2010',
    gender: 'female',
    class: '4ème B',
    section: 'Générale',
    status: 'active',
    hasSpecialNeeds: false,
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    address: '123 Rue de la République',
    city: 'Paris',
    postalCode: '75011',
    phone: '01.23.45.67.89',
    email: 'marie.dubois@email.com',
    emergencyContact: 'Pierre Dubois',
    emergencyPhone: '06.12.34.56.78',
    medicalInfo: 'Allergie aux arachides - PAI en cours',
    allergies: 'Arachides, fruits à coque',
    parentName: 'Pierre et Sophie Dubois',
    parentEmail: 'parents.dubois@email.com',
    parentPhone: '06.12.34.56.78',
    attendance: 92,
    averageGrade: 15.4,
    behaviorScore: 18,
    parentMeetings: 3
  });

  // Mock students list for navigation
  const studentsList = [
    { id: 'STU-2024-001', name: 'Marie Dubois', class: '4ème B' },
    { id: 'STU-2024-002', name: 'Thomas Martin', class: '4ème B' },
    { id: 'STU-2024-003', name: 'Emma Rousseau', class: '4ème A' },
    { id: 'STU-2024-004', name: 'Lucas Bernard', class: '3ème C' }
  ];

  useEffect(() => {
    // Determine user role based on route or context
    const role = location?.state?.userRole || 'secretary';
    setCurrentUserRole(role);
  }, [location]);

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
    setSelectedStudentId(studentId);
    // In a real app, this would fetch the student data
    const selectedStudent = studentsList?.find(s => s?.id === studentId);
    if (selectedStudent) {
      // Mock data update - in real app, fetch from API
      setStudentData(prev => ({
        ...prev,
        studentId: selectedStudent?.id,
        firstName: selectedStudent?.name?.split(' ')?.[0],
        lastName: selectedStudent?.name?.split(' ')?.[1],
        class: selectedStudent?.class
      }));
    }
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
        userRole={user?.role || currentUserRole}
        userName={user?.full_name || user?.name || "Utilisateur"}
        onToggleSidebar={handleToggleSidebar}
      />
      {/* Sidebar */}
      <Sidebar
        userRole={user?.role || currentUserRole}
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
                    {student?.name} - {student?.class}
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