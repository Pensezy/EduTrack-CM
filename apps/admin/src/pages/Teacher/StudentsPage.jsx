/**
 * Page Mes Élèves - Enseignant
 *
 * Affiche les élèves des classes de l'enseignant
 */

import { useState, useEffect } from 'react';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import { formatNumber } from '@edutrack/utils';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  AlertCircle,
  Eye,
  Mail,
  Phone,
  User
} from 'lucide-react';

export default function TeacherStudentsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const classIdParam = searchParams.get('class');

  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState(classIdParam || 'all');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (user?.current_school_id) {
      fetchData();
    }
  }, [user?.current_school_id]);

  useEffect(() => {
    if (user?.current_school_id) {
      fetchStudents();
    }
  }, [filterClass]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      const schoolId = user?.current_school_id;

      // Récupérer les classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('id, name, level')
        .eq('school_id', schoolId)
        .order('name');

      setClasses(classesData || []);

      await fetchStudents();
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setError('');
      const supabase = getSupabaseClient();
      const schoolId = user?.current_school_id;

      let query = supabase
        .from('students')
        .select(`
          id,
          full_name,
          matricule,
          date_of_birth,
          gender,
          class_id,
          parent_id,
          classes:class_id (name, level),
          parent:parent_id (full_name, phone, email)
        `)
        .eq('school_id', schoolId)
        .order('full_name');

      if (filterClass !== 'all') {
        query = query.eq('class_id', filterClass);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setStudents(data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Erreur lors du chargement des élèves');
    }
  };

  const filteredStudents = students.filter(student => {
    return searchQuery === '' ||
      student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.matricule?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '-';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} ans`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes Élèves</h1>
        <p className="mt-1 text-sm text-gray-500">
          {formatNumber(students.length)} élève{students.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Error */}
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un élève..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400 hidden sm:block" />
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Toutes les classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun élève trouvé</h3>
          <p className="text-sm text-gray-500">
            {searchQuery ? 'Essayez de modifier votre recherche' : 'Aucun élève dans cette classe'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold ${
                  student.gender === 'M' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-pink-500 to-pink-600'
                }`}>
                  {student.full_name?.charAt(0) || 'E'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{student.full_name}</h3>
                  <p className="text-sm text-gray-500">{student.matricule || 'Sans matricule'}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-500">
                  <GraduationCap className="h-4 w-4" />
                  <span>{student.classes?.name || 'Non assigné'}</span>
                </div>
                <span className="text-gray-400">{calculateAge(student.date_of_birth)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal détails */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Fiche élève</h2>
              <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                  selectedStudent.gender === 'M' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-pink-500 to-pink-600'
                }`}>
                  {selectedStudent.full_name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedStudent.full_name}</h3>
                  <p className="text-gray-500">{selectedStudent.classes?.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Matricule</p>
                  <p className="font-medium">{selectedStudent.matricule || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Genre</p>
                  <p className="font-medium">{selectedStudent.gender === 'M' ? 'Garçon' : 'Fille'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date de naissance</p>
                  <p className="font-medium">
                    {selectedStudent.date_of_birth
                      ? new Date(selectedStudent.date_of_birth).toLocaleDateString('fr-FR')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Âge</p>
                  <p className="font-medium">{calculateAge(selectedStudent.date_of_birth)}</p>
                </div>
              </div>

              {selectedStudent.parent && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Parent / Tuteur
                  </h4>
                  <p className="text-sm">{selectedStudent.parent.full_name}</p>
                  {selectedStudent.parent.phone && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" />
                      {selectedStudent.parent.phone}
                    </p>
                  )}
                  {selectedStudent.parent.email && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {selectedStudent.parent.email}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
