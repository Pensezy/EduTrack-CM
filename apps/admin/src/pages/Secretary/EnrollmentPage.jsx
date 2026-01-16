/**
 * Page Inscriptions - Secrétaire
 *
 * Permet au secrétaire de gérer les demandes d'inscription
 * Fonctionnalités: voir demandes, approuver, rejeter
 */

import { useState, useEffect } from 'react';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import { formatNumber } from '@edutrack/utils';
import {
  FileText,
  Search,
  Filter,
  Mail,
  Phone,
  User,
  Calendar,
  Check,
  X,
  Clock,
  AlertCircle,
  Eye,
  UserPlus
} from 'lucide-react';

export default function SecretaryEnrollmentPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (user?.current_school_id) {
      fetchEnrollments();
    }
  }, [user?.current_school_id, filterStatus]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = getSupabaseClient();
      const schoolId = user?.current_school_id;

      if (!schoolId) {
        setError('Aucune école associée à votre compte');
        return;
      }

      let query = supabase
        .from('enrollment_requests')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setEnrollments(data || []);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      setError('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = searchQuery === '' ||
      enrollment.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.parent_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.parent_email?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, text: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
      approved: { icon: Check, text: 'Approuvée', className: 'bg-green-100 text-green-800' },
      rejected: { icon: X, text: 'Rejetée', className: 'bg-red-100 text-red-800' }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
        <Icon className="h-3 w-3" />
        {badge.text}
      </span>
    );
  };

  const handleApprove = async (enrollmentId) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('enrollment_requests')
        .update({ status: 'approved', processed_by: user.id, processed_at: new Date().toISOString() })
        .eq('id', enrollmentId);

      if (error) throw error;

      fetchEnrollments();
    } catch (err) {
      console.error('Error approving enrollment:', err);
      alert('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (enrollmentId) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('enrollment_requests')
        .update({ status: 'rejected', processed_by: user.id, processed_at: new Date().toISOString() })
        .eq('id', enrollmentId);

      if (error) throw error;

      fetchEnrollments();
    } catch (err) {
      console.error('Error rejecting enrollment:', err);
      alert('Erreur lors du rejet');
    }
  };

  // Compter les stats
  const pendingCount = enrollments.filter(e => e.status === 'pending').length;
  const approvedCount = enrollments.filter(e => e.status === 'approved').length;
  const rejectedCount = enrollments.filter(e => e.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Demandes d'Inscription</h1>
          <p className="mt-1 text-sm text-gray-500">
            {formatNumber(enrollments.length)} demande{enrollments.length > 1 ? 's' : ''} au total
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div
          onClick={() => setFilterStatus('pending')}
          className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all ${
            filterStatus === 'pending' ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-sm text-gray-500">En attente</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setFilterStatus('approved')}
          className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all ${
            filterStatus === 'approved' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
              <p className="text-sm text-gray-500">Approuvées</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setFilterStatus('rejected')}
          className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all ${
            filterStatus === 'rejected' ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <X className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
              <p className="text-sm text-gray-500">Rejetées</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
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

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom d'élève ou parent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Reset filter */}
          {filterStatus !== 'all' && (
            <button
              onClick={() => setFilterStatus('all')}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Réinitialiser filtre
            </button>
          )}
        </div>
      </div>

      {/* Enrollments List */}
      {filteredEnrollments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande trouvée</h3>
          <p className="text-sm text-gray-500">
            {searchQuery ? 'Essayez de modifier vos critères de recherche' : 'Aucune demande d\'inscription pour le moment'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredEnrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Student Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{enrollment.student_name}</h3>
                        <p className="text-sm text-gray-500">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          Demande du {new Date(enrollment.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      {getStatusBadge(enrollment.status)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Parent:</span>
                        <span className="font-medium text-gray-900">{enrollment.parent_name}</span>
                      </div>

                      {enrollment.parent_email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-500 truncate">{enrollment.parent_email}</span>
                        </div>
                      )}

                      {enrollment.parent_phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-500">{enrollment.parent_phone}</span>
                        </div>
                      )}

                      {enrollment.class_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Classe demandée:</span>
                          <span className="font-medium text-gray-900">{enrollment.class_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 lg:items-end">
                    {enrollment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(enrollment.id)}
                          className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                        >
                          <Check className="h-4 w-4" />
                          Approuver
                        </button>
                        <button
                          onClick={() => handleReject(enrollment.id)}
                          className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                        >
                          <X className="h-4 w-4" />
                          Rejeter
                        </button>
                      </>
                    )}
                    <button className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                      <Eye className="h-4 w-4" />
                      Détails
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
