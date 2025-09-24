import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AttendanceTab = () => {
  const [selectedDate, setSelectedDate] = useState(new Date()?.toISOString()?.split('T')?.[0]);
  const [selectedClass, setSelectedClass] = useState('CM2');

  const classOptions = [
    { value: 'CE1', label: 'CE1' },
    { value: 'CE2', label: 'CE2' },
    { value: 'CM1', label: 'CM1' },
    { value: 'CM2', label: 'CM2' }
  ];

  const [attendanceData, setAttendanceData] = useState({
    1: { status: 'present', reason: '', notified: false },
    2: { status: 'absent', reason: 'Maladie', notified: true },
    3: { status: 'present', reason: '', notified: false },
    4: { status: 'late', reason: 'Transport', notified: false },
    5: { status: 'present', reason: '', notified: false }
  });

  const students = [
    {
      id: 1,
      name: "Marie Dubois",
      studentId: "STU001",
      parentPhone: "+33 6 12 34 56 78",
      class: "CM2"
    },
    {
      id: 2,
      name: "Pierre Martin",
      studentId: "STU002",
      parentPhone: "+33 6 23 45 67 89",
      class: "CM2"
    },
    {
      id: 3,
      name: "Camille Rousseau",
      studentId: "STU003",
      parentPhone: "+33 6 34 56 78 90",
      class: "CM2"
    },
    {
      id: 4,
      name: "Lucas Bernard",
      studentId: "STU004",
      parentPhone: "+33 6 45 67 89 01",
      class: "CM2"
    },
    {
      id: 5,
      name: "Emma Leroy",
      studentId: "STU005",
      parentPhone: "+33 6 56 78 90 12",
      class: "CM2"
    }
  ];

  const getStatusConfig = (status) => {
    const configs = {
      present: {
        label: 'Présent',
        icon: 'CheckCircle',
        className: 'bg-success text-white',
        textColor: 'text-success'
      },
      absent: {
        label: 'Absent',
        icon: 'XCircle',
        className: 'bg-error text-white',
        textColor: 'text-error'
      },
      late: {
        label: 'Retard',
        icon: 'Clock',
        className: 'bg-warning text-white',
        textColor: 'text-warning'
      },
      excused: {
        label: 'Excusé',
        icon: 'Shield',
        className: 'bg-primary text-white',
        textColor: 'text-primary'
      }
    };
    return configs?.[status] || configs?.present;
  };

  const handleStatusChange = (studentId, newStatus) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev?.[studentId],
        status: newStatus,
        notified: false
      }
    }));
  };

  const handleReasonChange = (studentId, reason) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev?.[studentId],
        reason: reason
      }
    }));
  };

  const handleNotifyParent = (studentId) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev?.[studentId],
        notified: true
      }
    }));
    console.log('Notify parent for student:', studentId);
  };

  const handleBulkNotify = () => {
    const absentStudents = students?.filter(student => 
      attendanceData?.[student?.id]?.status === 'absent' && 
      !attendanceData?.[student?.id]?.notified
    );
    console.log('Bulk notify parents for absent students:', absentStudents);
  };

  const handleSaveAttendance = () => {
    console.log('Save attendance for date:', selectedDate, 'class:', selectedClass);
  };

  const getAttendanceStats = () => {
    const stats = students?.reduce((acc, student) => {
      const status = attendanceData?.[student?.id]?.status || 'present';
      acc[status] = (acc?.[status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      present: stats?.present || 0,
      absent: stats?.absent || 0,
      late: stats?.late || 0,
      excused: stats?.excused || 0,
      total: students?.length
    };
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading font-heading-bold text-xl text-text-primary">
            Gestion des Présences
          </h2>
          <p className="font-body font-body-normal text-sm text-text-secondary mt-1">
            Suivi quotidien des présences et absences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            iconName="Mail"
            iconPosition="left"
            onClick={handleBulkNotify}
            disabled={stats?.absent === 0}
          >
            Notifier les absents
          </Button>
          <Button
            variant="default"
            iconName="Save"
            iconPosition="left"
            onClick={handleSaveAttendance}
          >
            Enregistrer
          </Button>
        </div>
      </div>
      {/* Date and Class Selection */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e?.target?.value)}
          />
          <Select
            label="Classe"
            options={classOptions}
            value={selectedClass}
            onChange={setSelectedClass}
          />
        </div>
      </div>
      {/* Attendance Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle" size={20} className="text-success" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-lg text-text-primary">
                {stats?.present}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Présents
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
              <Icon name="XCircle" size={20} className="text-error" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-lg text-text-primary">
                {stats?.absent}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Absents
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
                {stats?.late}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Retards
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
                {stats?.total}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Total élèves
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Student Attendance List */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
            {selectedClass} - {new Date(selectedDate)?.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
        </div>

        <div className="divide-y divide-border">
          {students?.map((student) => {
            const attendance = attendanceData?.[student?.id] || { status: 'present', reason: '', notified: false };
            const statusConfig = getStatusConfig(attendance?.status);

            return (
              <div key={student?.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-body font-body-semibold text-sm text-text-primary">
                        {student?.name}
                      </p>
                      <p className="font-caption font-caption-normal text-xs text-text-secondary">
                        ID: {student?.studentId} • {student?.parentPhone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Status Buttons */}
                    <div className="flex items-center space-x-1">
                      {['present', 'absent', 'late', 'excused']?.map((status) => {
                        const config = getStatusConfig(status);
                        const isActive = attendance?.status === status;
                        
                        return (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(student?.id, status)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-micro ${
                              isActive 
                                ? config?.className 
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                            title={config?.label}
                          >
                            <Icon name={config?.icon} size={16} />
                          </button>
                        );
                      })}
                    </div>

                    {/* Notification Status */}
                    {attendance?.status !== 'present' && (
                      <div className="flex items-center space-x-2">
                        {attendance?.notified ? (
                          <div className="flex items-center space-x-1 text-success">
                            <Icon name="CheckCircle" size={16} />
                            <span className="font-caption font-caption-normal text-xs">
                              Notifié
                            </span>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="Bell"
                            onClick={() => handleNotifyParent(student?.id)}
                          >
                            Notifier
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {/* Reason Input for Non-Present Status */}
                {attendance?.status !== 'present' && (
                  <div className="mt-3 pl-0">
                    <Input
                      type="text"
                      placeholder="Motif (optionnel)"
                      value={attendance?.reason}
                      onChange={(e) => handleReasonChange(student?.id, e?.target?.value)}
                      className="max-w-md"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Quick Actions */}
      <div className="bg-accent/5 rounded-lg border border-accent/20 p-4">
        <h3 className="font-heading font-heading-semibold text-sm text-text-primary mb-3">
          Actions rapides
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Users"
            onClick={() => {
              const newData = {};
              students?.forEach(student => {
                newData[student.id] = { status: 'present', reason: '', notified: false };
              });
              setAttendanceData(newData);
            }}
          >
            Marquer tous présents
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="Calendar"
            onClick={() => console.log('View attendance history')}
          >
            Historique des présences
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            onClick={() => console.log('Export attendance report')}
          >
            Exporter le rapport
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTab;