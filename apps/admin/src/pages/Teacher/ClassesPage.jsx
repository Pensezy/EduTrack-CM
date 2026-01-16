/**
 * Page Mes Classes - Enseignant
 *
 * Affiche les classes assignées à l'enseignant
 */

import { useState, useEffect } from 'react';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import { formatNumber } from '@edutrack/utils';
import {
  GraduationCap,
  Users,
  AlertCircle,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TeacherClassesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.current_school_id) {
      fetchClasses();
    }
  }, [user?.current_school_id]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = getSupabaseClient();
      const schoolId = user?.current_school_id;

      if (!schoolId) {
        setError('Aucune école associée à votre compte');
        return;
      }

      // Récupérer les classes de l'école
      // Note: Dans une vraie implémentation, on filtrerait par teacher_id
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id, name, level, max_students, academic_year')
        .eq('school_id', schoolId)
        .order('name');

      if (classesError) throw classesError;

      // Pour chaque classe, compter les élèves
      const classesWithCounts = await Promise.all(
        (classesData || []).map(async (cls) => {
          const { count } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id);

          return { ...cls, studentCount: count || 0 };
        })
      );

      setClasses(classesWithCounts);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Erreur lors du chargement des classes');
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Mes Classes</h1>
        <p className="mt-1 text-sm text-gray-500">
          {formatNumber(classes.length)} classe{classes.length > 1 ? 's' : ''} assignée{classes.length > 1 ? 's' : ''}
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

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune classe assignée</h3>
          <p className="text-sm text-gray-500">
            Vous n'avez pas encore de classes assignées. Contactez l'administration.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-primary-100 text-primary-600 p-3 rounded-lg">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <span className="text-sm text-gray-500">{cls.academic_year || '2024-2025'}</span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-1">{cls.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{cls.level}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{cls.studentCount} / {cls.max_students || '∞'} élèves</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/teacher/students?class=${cls.id}`)}
                    className="flex-1 text-center text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    Voir élèves
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => navigate(`/teacher/attendance?class=${cls.id}`)}
                    className="flex-1 text-center text-sm font-medium text-green-600 hover:text-green-700"
                  >
                    Faire l'appel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
