import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { documentService } from '../../../services/documentService';

const TeacherAssignments = ({ assignments, onAssignmentsUpdate }) => {
  const { userProfile } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    teacher_id: '',
    school_id: '',
    class_name: '',
    subject: ''
  });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userProfile?.role === 'principal' || userProfile?.role === 'secretary') {
      loadTeachers();
    }
  }, [userProfile]);

  const loadTeachers = async () => {
    // This would typically load from a teachers endpoint
    // For now, we'll use a simple implementation
    setTeachers([
      { id: '1', full_name: 'Tchoukoua Rose', email: 'ens.math@demo.cm' },
      { id: '2', full_name: 'Mballa Jean', email: 'ens.francais@demo.cm' }
    ]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setNewAssignment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const assignmentData = {
        ...newAssignment,
        school_id: userProfile?.current_school_id
      };

      const result = await documentService?.assignTeacherToClass(assignmentData);
      
      if (result?.error) {
        setMessage(result?.error);
      } else {
        setMessage('Assignation créée avec succès!');
        setNewAssignment({
          teacher_id: '',
          school_id: '',
          class_name: '',
          subject: ''
        });
        setShowAddForm(false);
        onAssignmentsUpdate?.();
      }
    } catch (error) {
      setMessage('Erreur lors de l\'assignation: ' + error?.message);
    }

    setLoading(false);
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer cette assignation ?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await documentService?.removeTeacherAssignment(assignmentId);
      
      if (result?.error) {
        alert('Erreur: ' + result?.error);
      } else {
        setMessage('Assignation retirée avec succès!');
        onAssignmentsUpdate?.();
      }
    } catch (error) {
      alert('Erreur lors de la suppression: ' + error?.message);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Common class and subject options
  const classOptions = [
    '6ème A', '6ème B', '6ème C',
    '5ème A', '5ème B', '5ème C',
    '4ème A', '4ème B', '4ème C',
    '3ème A', '3ème B', '3ème C',
    'Seconde A', 'Seconde B', 'Seconde C',
    'Première A', 'Première B', 'Première C',
    'Terminale A', 'Terminale B', 'Terminale C'
  ];

  const subjectOptions = [
    'Mathématiques', 'Français', 'Anglais', 'Histoire-Géographie',
    'Sciences Physiques', 'SVT', 'Philosophie', 'Économie',
    'Informatique', 'Arts Plastiques', 'Musique', 'EPS'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            📋 {userProfile?.role === 'teacher' ? 'Mes Assignations' : 'Gestion des Assignations'}
          </h2>
          
          {(userProfile?.role === 'principal' || userProfile?.role === 'secretary') && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              ➕ Nouvelle Assignation
            </button>
          )}
        </div>

        {message && (
          <div className={`p-3 rounded-md mb-4 ${
            message?.includes('succès')
              ? 'bg-green-100 text-green-700' :'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
      </div>
      {/* Add Assignment Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Nouvelle Assignation
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professeur
                </label>
                <select
                  name="teacher_id"
                  value={newAssignment?.teacher_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un professeur</option>
                  {teachers?.map(teacher => (
                    <option key={teacher?.id} value={teacher?.id}>
                      {teacher?.full_name} ({teacher?.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classe
                </label>
                <select
                  name="class_name"
                  value={newAssignment?.class_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une classe</option>
                  {classOptions?.map(className => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matière
                </label>
                <select
                  name="subject"
                  value={newAssignment?.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une matière</option>
                  {subjectOptions?.map(subject => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Création...' : 'Créer l\'assignation'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 disabled:opacity-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {!assignments?.length ? (
          <div className="text-center py-8">
            <div className="text-4xl text-gray-400 mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune assignation
            </h3>
            <p className="text-gray-600">
              {userProfile?.role === 'teacher' ?'Vous n\'avez aucune classe assignée pour le moment.' :'Commencez par assigner des professeurs aux classes.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments?.map((assignment) => (
              <div
                key={assignment?.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg font-medium text-gray-900">
                        📚 {assignment?.class_name}
                      </span>
                      <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {assignment?.subject}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      {assignment?.school?.name && (
                        <div className="flex items-center space-x-2">
                          <span>🏫</span>
                          <span>{assignment?.school?.name}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <span>📅</span>
                        <span>Assigné le {formatDate(assignment?.assigned_at)}</span>
                      </div>

                      {assignment?.assigned_by_user?.full_name && (
                        <div className="flex items-center space-x-2">
                          <span>👤</span>
                          <span>Par {assignment?.assigned_by_user?.full_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {(userProfile?.role === 'principal' || userProfile?.role === 'secretary') && (
                    <button
                      onClick={() => handleRemoveAssignment(assignment?.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Retirer l'assignation"
                    >
                      <span>🗑️</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAssignments;