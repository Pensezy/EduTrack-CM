/**
 * Page Présences - Parent
 *
 * Affiche l'historique des présences des enfants du parent
 */

import { useState, useEffect } from 'react';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import {
  ClipboardCheck,
  AlertCircle,
  Check,
  X,
  Clock,
  Calendar,
  Filter,
  Baby
} from 'lucide-react';

export default function ParentAttendancePage() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('all');
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    if (user?.id) {
      fetchChildren();
    }
  }, [user?.id]);

  useEffect(() => {
    if (children.length > 0) {
      fetchAttendance();
    }
  }, [children, selectedChild, filterMonth]);

  const fetchChildren = async () => {
    try {
      const supabase = getSupabaseClient();

      const { data, error: fetchError } = await supabase
        .from('students')
        .select('id, full_name, class_id, classes:class_id (name)')
        .eq('parent_id', user.id)
        .order('full_name');

      if (fetchError) throw fetchError;

      setChildren(data || []);
    } catch (err) {
      console.error('Error fetching children:', err);
      setError('Erreur lors du chargement des enfants');
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = getSupabaseClient();

      const childIds = selectedChild === 'all'
        ? children.map(c => c.id)
        : [selectedChild];

      // Calculer les dates du mois sélectionné
      const [year, month] = filterMonth.split('-');
      const startDate = `${year}-${month}-01`;
      const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];

      const { data, error: fetchError } = await supabase
        .from('attendance')
        .select(`
          id,
          date,
          status,
          student_id,
          students:student_id (full_name)
        `)
        .in('student_id', childIds)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (fetchError && fetchError.code !== '42P01') {
        throw fetchError;
      }

      setAttendance(data || []);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Erreur lors du chargement des présences');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'absent':
        return <X className="h-4 w-4 text-red-600" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      present: { text: 'Présent', className: 'bg-green-100 text-green-800' },
      absent: { text: 'Absent', className: 'bg-red-100 text-red-800' },
      late: { text: 'En retard', className: 'bg-yellow-100 text-yellow-800' },
    };

    const badge = badges[status] || badges.present;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
        {getStatusIcon(status)}
        {badge.text}
      </span>
    );
  };

  // Stats
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;
  const lateCount = attendance.filter(a => a.status === 'late').length;

  if (loading && !attendance.length) {
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
        <h1 className="text-2xl font-bold text-gray-900">Présences</h1>
        <p className="mt-1 text-sm text-gray-500">
          Historique des présences de vos enfants
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Sélection enfant */}
          {children.length > 1 && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Enfant</label>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Tous les enfants</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>{child.full_name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Sélection mois */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mois</label>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{presentCount}</p>
          <p className="text-sm text-green-700">Présences</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{absentCount}</p>
          <p className="text-sm text-red-700">Absences</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{lateCount}</p>
          <p className="text-sm text-yellow-700">Retards</p>
        </div>
      </div>

      {/* Liste des présences */}
      {children.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Baby className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun enfant inscrit</h3>
          <p className="text-sm text-gray-500">
            Contactez l'administration pour inscrire vos enfants.
          </p>
        </div>
      ) : attendance.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune présence enregistrée</h3>
          <p className="text-sm text-gray-500">
            Aucune donnée de présence pour cette période.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  {children.length > 1 && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enfant
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {new Date(record.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </span>
                      </div>
                    </td>
                    {children.length > 1 && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {record.students?.full_name || '-'}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(record.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
