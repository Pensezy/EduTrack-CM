/**
 * Page Mes Enfants - Parent
 *
 * Affiche les enfants du parent avec leurs informations
 */

import { useState, useEffect } from 'react';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import { formatNumber } from '@edutrack/utils';
import {
  Users,
  GraduationCap,
  AlertCircle,
  School,
  Calendar,
  CheckCircle,
  Clock,
  Baby
} from 'lucide-react';

export default function ParentChildrenPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchChildren();
    }
  }, [user?.id]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = getSupabaseClient();

      const { data, error: fetchError } = await supabase
        .from('students')
        .select(`
          id,
          full_name,
          matricule,
          date_of_birth,
          gender,
          status,
          class_id,
          school_id,
          created_at,
          classes:class_id (name, level),
          schools:school_id (name)
        `)
        .eq('parent_id', user.id)
        .order('full_name');

      if (fetchError) throw fetchError;

      // Pour chaque enfant, récupérer les stats de présence
      const childrenWithStats = await Promise.all(
        (data || []).map(async (child) => {
          // Présences du mois en cours
          const startOfMonth = new Date();
          startOfMonth.setDate(1);

          let attendanceStats = { present: 0, absent: 0, total: 0 };

          try {
            const { data: attendanceData } = await supabase
              .from('attendance')
              .select('status')
              .eq('student_id', child.id)
              .gte('date', startOfMonth.toISOString().split('T')[0]);

            if (attendanceData) {
              attendanceStats = {
                present: attendanceData.filter(a => a.status === 'present').length,
                absent: attendanceData.filter(a => a.status === 'absent').length,
                total: attendanceData.length,
              };
            }
          } catch (e) {
            // Table attendance n'existe peut-être pas
          }

          return { ...child, attendanceStats };
        })
      );

      setChildren(childrenWithStats);
    } catch (err) {
      console.error('Error fetching children:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Mes Enfants</h1>
        <p className="mt-1 text-sm text-gray-500">
          {formatNumber(children.length)} enfant{children.length > 1 ? 's' : ''} inscrit{children.length > 1 ? 's' : ''}
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

      {/* Children List */}
      {children.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Baby className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun enfant inscrit</h3>
          <p className="text-sm text-gray-500">
            Contactez l'administration de l'école pour inscrire vos enfants.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {children.map((child) => {
            const attendanceRate = child.attendanceStats.total > 0
              ? Math.round((child.attendanceStats.present / child.attendanceStats.total) * 100)
              : 100;

            return (
              <div
                key={child.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                    {/* Photo et infos principales */}
                    <div className="flex items-center gap-4">
                      <div className={`h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ${
                        child.gender === 'M' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-pink-500 to-pink-600'
                      }`}>
                        {child.full_name?.charAt(0) || 'E'}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{child.full_name}</h2>
                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                          <GraduationCap className="h-4 w-4" />
                          <span>{child.classes?.name || 'Classe non assignée'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                          <School className="h-4 w-4" />
                          <span>{child.schools?.name || 'École'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats rapides */}
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-gray-900">{calculateAge(child.date_of_birth)}</p>
                        <p className="text-xs text-gray-500">Âge</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-gray-900">{child.gender === 'M' ? 'M' : 'F'}</p>
                        <p className="text-xs text-gray-500">Genre</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">{child.attendanceStats.present}</p>
                        <p className="text-xs text-gray-500">Présences</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-red-600">{child.attendanceStats.absent}</p>
                        <p className="text-xs text-gray-500">Absences</p>
                      </div>
                    </div>
                  </div>

                  {/* Barre de présence */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Taux de présence ce mois</span>
                      <span className={`text-sm font-bold ${
                        attendanceRate >= 80 ? 'text-green-600' :
                        attendanceRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {attendanceRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          attendanceRate >= 80 ? 'bg-green-500' :
                          attendanceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${attendanceRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Infos supplémentaires */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">Matricule:</span>
                      <span className="font-mono">{child.matricule || 'Non attribué'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        Inscrit le {new Date(child.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        child.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {child.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
