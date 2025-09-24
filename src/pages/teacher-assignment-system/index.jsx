import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, Users, BookOpen, Calendar, Filter, Search, UserCheck, AlertCircle } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { useAuth } from '../../contexts/AuthContext';

const TeacherAssignmentSystem = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [formData, setFormData] = useState({
    teacher_id: '',
    class_name: '',
    subject: '',
    school_year: '2024-2025'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const classes = teacherService?.getAvailableClasses();
  const subjects = teacherService?.getAvailableSubjects();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assignmentsResult, teachersResult] = await Promise.all([
        teacherService?.getSchoolAssignments(user?.current_school_id),
        teacherService?.getSchoolTeachers(user?.current_school_id)
      ]);

      if (assignmentsResult?.success) {
        setAssignments(assignmentsResult?.data || []);
      }
      if (teachersResult?.success) {
        setTeachers(teachersResult?.data || []);
      }
    } catch (error) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess('');

    try {
      const assignmentData = {
        ...formData,
        school_id: user?.current_school_id,
        assigned_by: user?.id
      };

      const result = await teacherService?.assignTeacherToClass(assignmentData);
      
      if (result?.success) {
        setSuccess('Affectation créée avec succès');
        setShowAssignModal(false);
        resetForm();
        loadData();
      } else {
        setError(result?.error || 'Erreur lors de la création de l\'affectation');
      }
    } catch (error) {
      setError('Erreur de création de l\'affectation');
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette affectation ?')) {
      return;
    }

    try {
      const result = await teacherService?.removeTeacherAssignment(assignmentId);
      
      if (result?.success) {
        setSuccess('Affectation supprimée avec succès');
        loadData();
      } else {
        setError(result?.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      setError('Erreur de suppression de l\'affectation');
    }
  };

  const resetForm = () => {
    setFormData({
      teacher_id: '',
      class_name: '',
      subject: '',
      school_year: '2024-2025'
    });
  };

  const getAssignmentMatrix = () => {
    // Group assignments by teacher
    const teacherAssignments = {};
    assignments?.forEach(assignment => {
      const teacherId = assignment?.teacher_id;
      if (!teacherAssignments?.[teacherId]) {
        teacherAssignments[teacherId] = {
          teacher: assignment?.teacher,
          assignments: []
        };
      }
      teacherAssignments?.[teacherId]?.assignments?.push(assignment);
    });

    return teacherAssignments;
  };

  const getClassSubjectMatrix = () => {
    // Create a matrix of class-subject combinations
    const matrix = {};
    classes?.forEach(className => {
      matrix[className] = {};
      subjects?.forEach(subject => {
        matrix[className][subject] = assignments?.find(a => 
          a?.class_name === className && a?.subject === subject
        ) || null;
      });
    });
    return matrix;
  };

  const filteredAssignments = assignments?.filter(assignment => {
    const matchesSearch = !searchTerm || 
      assignment?.teacher?.full_name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      assignment?.class_name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      assignment?.subject?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    const matchesClass = !filterClass || assignment?.class_name === filterClass;
    const matchesSubject = !filterSubject || assignment?.subject === filterSubject;
    
    return matchesSearch && matchesClass && matchesSubject;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.history?.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Système d'Affectation des Enseignants
                </h1>
                <p className="text-gray-600">
                  Assigner les enseignants aux classes et matières
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAssignModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle Affectation</span>
            </button>
          </div>

          {/* Filters and Search */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e?.target?.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les classes</option>
              {classes?.map(className => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>

            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e?.target?.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les matières</option>
              {subjects?.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>{filteredAssignments?.length || 0} affectation(s)</span>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center">
            <UserCheck className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}

        {/* Assignment Matrix View */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Matrice d'Affectation par Enseignant
            </h2>
          </div>
          
          <div className="p-6">
            {Object.entries(getAssignmentMatrix())?.map(([teacherId, data]) => (
              <div key={teacherId} className="mb-6 last:mb-0">
                <div className="bg-blue-50 rounded-lg p-4 mb-3">
                  <h3 className="font-semibold text-blue-900 text-lg mb-1">
                    {data?.teacher?.full_name || 'Enseignant Inconnu'}
                  </h3>
                  <p className="text-blue-700 text-sm">
                    {data?.teacher?.email || 'Email non défini'} | {data?.assignments?.length || 0} affectation(s)
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data?.assignments?.map((assignment) => (
                    <div key={assignment?.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-gray-900">
                            {assignment?.class_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {assignment?.subject}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveAssignment(assignment?.id)}
                          className="text-red-400 hover:text-red-600 p-1 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {assignment?.school_year}
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Actif
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(getAssignmentMatrix())?.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune affectation</h3>
                <p className="text-gray-500 mb-6">
                  Commencez par créer des affectations enseignant-classe-matière
                </p>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Créer une affectation
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Assignment List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Liste des Affectations
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enseignant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matière
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Année Scolaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'affectation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments?.map((assignment) => (
                  <tr key={assignment?.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {assignment?.teacher?.full_name || 'Nom non défini'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {assignment?.teacher?.email || 'Email non défini'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {assignment?.class_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment?.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment?.school_year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment?.assigned_at ? new Date(assignment.assigned_at)?.toLocaleDateString('fr-FR') : 'Date inconnue'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleRemoveAssignment(assignment?.id)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Assignment Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Créer une Affectation
                </h2>
                
                <form onSubmit={handleCreateAssignment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enseignant *
                    </label>
                    <select
                      required
                      value={formData?.teacher_id}
                      onChange={(e) => setFormData({ ...formData, teacher_id: e?.target?.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner un enseignant</option>
                      {teachers?.map(teacher => (
                        <option key={teacher?.id} value={teacher?.id}>
                          {teacher?.full_name} ({teacher?.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Classe *
                    </label>
                    <select
                      required
                      value={formData?.class_name}
                      onChange={(e) => setFormData({ ...formData, class_name: e?.target?.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner une classe</option>
                      {classes?.map(className => (
                        <option key={className} value={className}>{className}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Matière *
                    </label>
                    <select
                      required
                      value={formData?.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e?.target?.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner une matière</option>
                      {subjects?.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Année Scolaire *
                    </label>
                    <select
                      required
                      value={formData?.school_year}
                      onChange={(e) => setFormData({ ...formData, school_year: e?.target?.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="2024-2025">2024-2025</option>
                      <option value="2025-2026">2025-2026</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAssignModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Créer l'Affectation
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAssignmentSystem;