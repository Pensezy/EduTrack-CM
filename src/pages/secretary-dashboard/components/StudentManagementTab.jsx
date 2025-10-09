import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Image from '../../../components/AppImage';

const StudentManagementTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const students = [
    {
      id: 1,
      name: "Marie Dubois",
      class: "CM2",
      enrollmentStatus: "active",
      photo: "/public/assets/images/no_image.png",
      parentName: "Jean Dubois",
      parentPhone: "+33 6 12 34 56 78",
      parentEmail: "jean.dubois@email.fr",
      enrollmentDate: "15/09/2024",
      studentId: "STU001"
    },
    {
      id: 2,
      name: "Pierre Martin",
      class: "CM1",
      enrollmentStatus: "active",
      photo: "/public/assets/images/no_image.png",
      parentName: "Sophie Martin",
      parentPhone: "+33 6 23 45 67 89",
      parentEmail: "sophie.martin@email.fr",
      enrollmentDate: "12/09/2024",
      studentId: "STU002"
    },
    {
      id: 3,
      name: "Camille Rousseau",
      class: "CE2",
      enrollmentStatus: "pending",
      photo: "/public/assets/images/no_image.png",
      parentName: "Marc Rousseau",
      parentPhone: "+33 6 34 56 78 90",
      parentEmail: "marc.rousseau@email.fr",
      enrollmentDate: "10/09/2024",
      studentId: "STU003"
    },
    {
      id: 4,
      name: "Lucas Bernard",
      class: "CM2",
      enrollmentStatus: "active",
      photo: "/public/assets/images/no_image.png",
      parentName: "Anne Bernard",
      parentPhone: "+33 6 45 67 89 01",
      parentEmail: "anne.bernard@email.fr",
      enrollmentDate: "08/09/2024",
      studentId: "STU004"
    },
    {
      id: 5,
      name: "Emma Leroy",
      class: "CE1",
      enrollmentStatus: "transferred",
      photo: "/public/assets/images/no_image.png",
      parentName: "David Leroy",
      parentPhone: "+33 6 56 78 90 12",
      parentEmail: "david.leroy@email.fr",
      enrollmentDate: "05/09/2024",
      studentId: "STU005"
    }
  ];

  const classOptions = [
    { value: '', label: 'Toutes les classes' },
    { value: 'CE1', label: 'CE1' },
    { value: 'CE2', label: 'CE2' },
    { value: 'CM1', label: 'CM1' },
    { value: 'CM2', label: 'CM2' }
  ];

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'active', label: 'Actif' },
    { value: 'pending', label: 'En attente' },
    { value: 'transferred', label: 'Transféré' }
  ];

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
    console.log('Transfer student:', studentId);
  };

  const handleViewProfile = (studentId) => {
    console.log('View profile:', studentId);
  };

  const handleAddStudent = () => {
    console.log('Add new student');
  };

  return (
    <div className="space-y-6">
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
                      >
                        <Icon name="Eye" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTransferStudent(student?.id)}
                        title="Transférer l'élève"
                      >
                        <Icon name="ArrowRightLeft" size={16} />
                      </Button>
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
    </div>
  );
};

export default StudentManagementTab;