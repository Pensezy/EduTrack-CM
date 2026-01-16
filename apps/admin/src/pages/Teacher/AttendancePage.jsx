/**
 * Page Présences - Enseignant
 *
 * Permet à l'enseignant de faire l'appel pour ses classes
 */

import { useState, useEffect } from 'react';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import { formatNumber } from '@edutrack/utils';
import {
  ClipboardCheck,
  Users,
  AlertCircle,
  Check,
  X,
  Clock,
  Calendar,
  Save,
  CheckCircle
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function TeacherAttendancePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const classIdParam = searchParams.get('class');

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(classIdParam || '');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (user?.current_school_id) {
      fetchClasses();
    }
  }, [user?.current_school_id]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsAndAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    try {
      const supabase = getSupabaseClient();
      const schoolId = user?.current_school_id;

      const { data, error: fetchError } = await supabase
        .from('classes')
        .select('id, name, level')
        .eq('school_id', schoolId)
        .order('name');

      if (fetchError) throw fetchError;

      setClasses(data || []);

      // Sélectionner la première classe si aucune n'est sélectionnée
      if (!selectedClass && data?.length > 0) {
        setSelectedClass(classIdParam || data[0].id);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Erreur lors du chargement des classes');
    }
  };

  const fetchStudentsAndAttendance = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = getSupabaseClient();

      // Récupérer les élèves de la classe
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, full_name, matricule, gender')
        .eq('class_id', selectedClass)
        .order('full_name');

      if (studentsError) throw studentsError;

      setStudents(studentsData || []);

      // Récupérer les présences pour cette date
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('class_id', selectedClass)
        .eq('date', selectedDate);

      if (attendanceError && attendanceError.code !== '42P01') {
        throw attendanceError;
      }

      // Convertir en objet pour faciliter l'accès
      const attendanceMap = {};
      (attendanceData || []).forEach(a => {
        attendanceMap[a.student_id] = a.status;
      });

      // Initialiser les présences non enregistrées
      (studentsData || []).forEach(s => {
        if (!attendanceMap[s.id]) {
          attendanceMap[s.id] = 'present'; // Par défaut présent
        }
      });

      setAttendance(attendanceMap);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Erreur lors du chargement des élèves');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
    setSuccess(''); // Réinitialiser le message de succès
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const supabase = getSupabaseClient();

      // Préparer les données
      const attendanceRecords = students.map(student => ({
        student_id: student.id,
        class_id: selectedClass,
        school_id: user.current_school_id,
        date: selectedDate,
        status: attendance[student.id] || 'present',
        recorded_by: user.id,
        recorded_at: new Date().toISOString()
      }));

      // Supprimer les anciennes présences pour cette date
      await supabase
        .from('attendance')
        .delete()
        .eq('class_id', selectedClass)
        .eq('date', selectedDate);

      // Insérer les nouvelles
      const { error: insertError } = await supabase
        .from('attendance')
        .insert(attendanceRecords);

      if (insertError) throw insertError;

      setSuccess('Présences enregistrées avec succès !');
    } catch (err) {
      console.error('Error saving attendance:', err);
      setError('Erreur lors de l\'enregistrement des présences');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;
  const lateCount = Object.values(attendance).filter(s => s === 'late').length;

  if (loading && !students.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Présences</h1>
          <p className="mt-1 text-sm text-gray-500">
            Faire l'appel pour vos classes
          </p>
        </div>
      </div>

      {/* Sélecteurs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sélection de classe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Sélectionner une classe</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name} - {cls.level}</option>
              ))}
            </select>
          </div>

          {/* Sélection de date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {students.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{presentCount}</p>
            <p className="text-sm text-green-700">Présents</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{absentCount}</p>
            <p className="text-sm text-red-700">Absents</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
            <p className="text-sm text-yellow-700">En retard</p>
          </div>
        </div>
      )}

      {/* Liste des élèves */}
      {!selectedClass ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez une classe</h3>
          <p className="text-sm text-gray-500">Choisissez une classe pour faire l'appel</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun élève</h3>
          <p className="text-sm text-gray-500">Cette classe n'a pas encore d'élèves inscrits</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Élève
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Présent
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Absent
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    En retard
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-medium ${
                          student.gender === 'M' ? 'bg-blue-500' : 'bg-pink-500'
                        }`}>
                          {student.full_name?.charAt(0) || 'E'}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{student.full_name}</p>
                          <p className="text-xs text-gray-500">{student.matricule || 'Sans matricule'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleAttendanceChange(student.id, 'present')}
                        className={`p-2 rounded-full transition-colors ${
                          attendance[student.id] === 'present'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'
                        }`}
                      >
                        <Check className="h-5 w-5" />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleAttendanceChange(student.id, 'absent')}
                        className={`p-2 rounded-full transition-colors ${
                          attendance[student.id] === 'absent'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600'
                        }`}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleAttendanceChange(student.id, 'late')}
                        className={`p-2 rounded-full transition-colors ${
                          attendance[student.id] === 'late'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-100 text-gray-400 hover:bg-yellow-100 hover:text-yellow-600'
                        }`}
                      >
                        <Clock className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer avec bouton sauvegarder */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {students.length} élève{students.length > 1 ? 's' : ''} • {selectedDate}
            </p>
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Enregistrer les présences
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
