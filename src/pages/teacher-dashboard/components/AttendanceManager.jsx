import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const AttendanceManager = ({ classData, students }) => {
  const [selectedDate, setSelectedDate] = useState(new Date()?.toISOString()?.split('T')?.[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [showQuickEntry, setShowQuickEntry] = useState(false);

  const attendanceStatus = [
    { value: 'present', label: 'Présent(e)', icon: 'Check', color: 'text-success', bg: 'bg-success' },
    { value: 'absent', label: 'Absent(e)', icon: 'X', color: 'text-error', bg: 'bg-error' },
    { value: 'late', label: 'En retard', icon: 'Clock', color: 'text-warning', bg: 'bg-warning' },
    { value: 'excused', label: 'Excusé(e)', icon: 'FileText', color: 'text-primary', bg: 'bg-primary' }
  ];

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev?.[selectedDate],
        [studentId]: status
      }
    }));
  };

  const getStudentAttendance = (studentId) => {
    return attendanceData?.[selectedDate]?.[studentId] || 'present';
  };

  const getStatusConfig = (status) => {
    return attendanceStatus?.find(s => s?.value === status) || attendanceStatus?.[0];
  };

  const saveAttendance = () => {
    console.log('Saving attendance for', selectedDate, attendanceData?.[selectedDate]);
    alert('Présences enregistrées avec succès!');
  };

  const markAllPresent = () => {
    const dateAttendance = {};
    students?.forEach(student => {
      dateAttendance[student?.id] = 'present';
    });
    
    setAttendanceData(prev => ({
      ...prev,
      [selectedDate]: dateAttendance
    }));
  };

  const getAttendanceStats = () => {
    const dateData = attendanceData?.[selectedDate] || {};
    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: students?.length || 0
    };

    Object.values(dateData)?.forEach(status => {
      stats[status] = (stats?.[status] || 0) + 1;
    });

    // If no data set, assume all present
    if (Object.keys(dateData)?.length === 0) {
      stats.present = stats?.total;
    }

    return stats;
  };

  const stats = getAttendanceStats();

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getAttendanceRate = () => {
    if (stats?.total === 0) return 0;
    return ((stats?.present + stats?.excused) / stats?.total * 100)?.toFixed(1);
  };

  return (
    <div className="bg-card rounded-lg shadow-card border border-border p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="font-heading font-heading-semibold text-xl text-card-foreground">
          Gestion des Présences - {classData?.name}
        </h3>
        
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e?.target?.value)}
            className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
          />
          <button
            onClick={() => setShowQuickEntry(!showQuickEntry)}
            className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors flex items-center gap-2"
          >
            <Icon name="Zap" size={16} />
            <span className="font-caption font-caption-semibold text-sm">
              Saisie rapide
            </span>
          </button>
        </div>
      </div>
      {/* Selected Date Info */}
      <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-heading font-heading-semibold text-lg text-card-foreground">
              {formatDate(selectedDate)}
            </h4>
            <p className="font-body font-body-normal text-sm text-muted-foreground">
              Cours de {classData?.subject} • {stats?.total} élèves
            </p>
          </div>
          <div className="text-right">
            <div className="font-heading font-heading-bold text-2xl text-success">
              {getAttendanceRate()}%
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground">
              Taux de présence
            </p>
          </div>
        </div>
      </div>
      {/* Quick Entry Panel */}
      {showQuickEntry && (
        <div className="mb-6 p-4 bg-success/5 border border-success/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-heading font-heading-semibold text-lg text-card-foreground mb-2">
                Saisie rapide des présences
              </h4>
              <p className="font-body font-body-normal text-sm text-muted-foreground">
                Marquer tous les élèves présents, puis ajuster individuellement si nécessaire
              </p>
            </div>
            <button
              onClick={markAllPresent}
              className="px-4 py-2 bg-success text-white hover:bg-success/90 rounded-lg transition-colors flex items-center gap-2"
            >
              <Icon name="CheckCircle" size={16} />
              Tous présents
            </button>
          </div>
        </div>
      )}
      {/* Attendance Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {attendanceStatus?.map(status => (
          <div key={status?.value} className="bg-white rounded-lg p-4 shadow-sm border border-border text-center">
            <Icon name={status?.icon} size={20} className={`mx-auto mb-2 ${status?.color}`} />
            <div className={`font-heading font-heading-bold text-xl ${status?.color}`}>
              {stats?.[status?.value] || 0}
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground">
              {status?.label}
            </p>
          </div>
        ))}
      </div>
      {/* Student Attendance List */}
      <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
        {students?.map(student => {
          const currentStatus = getStudentAttendance(student?.id);
          const statusConfig = getStatusConfig(currentStatus);
          
          return (
            <div key={student?.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-4">
                <img
                  src={student?.photo}
                  alt={student?.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-border"
                />
                
                <div className="flex-1">
                  <h5 className="font-heading font-heading-semibold text-lg text-card-foreground">
                    {student?.name}
                  </h5>
                  <p className="font-body font-body-normal text-sm text-muted-foreground">
                    {student?.matricule}
                  </p>
                </div>

                {/* Attendance Status Buttons */}
                <div className="flex items-center gap-2">
                  {attendanceStatus?.map(status => (
                    <button
                      key={status?.value}
                      onClick={() => handleAttendanceChange(student?.id, status?.value)}
                      className={`p-2 rounded-lg transition-all ${
                        currentStatus === status?.value
                          ? `${status?.bg} text-white shadow-md`
                          : `${status?.color} hover:bg-${status?.value}/10 border border-border`
                      }`}
                      title={status?.label}
                    >
                      <Icon name={status?.icon} size={16} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Info for specific statuses */}
              {(currentStatus === 'absent' || currentStatus === 'excused') && (
                <div className="mt-3 pt-3 border-t border-border">
                  <input
                    type="text"
                    placeholder={currentStatus === 'absent' ? 'Raison de l\'absence (optionnel)' : 'Justification'}
                    className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {students?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="font-body font-body-normal text-muted-foreground">
            Aucun élève dans cette classe
          </p>
        </div>
      )}
      {/* Save Button */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          <Icon name="Info" size={14} className="inline mr-1" />
          Les présences sont automatiquement notifiées aux parents par SMS
        </div>
        
        <button
          onClick={saveAttendance}
          className="px-6 py-3 bg-primary text-white font-body font-body-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Icon name="Save" size={16} />
          Enregistrer les Présences
        </button>
      </div>
    </div>
  );
};

export default AttendanceManager;