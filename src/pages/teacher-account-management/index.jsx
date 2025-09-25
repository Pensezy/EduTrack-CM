import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, Plus, Edit3, UserCheck, UserX, Mail, Phone, Calendar, FileText, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';

const TeacherAccountManagement = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '+237',
    password: '',
    pin_code: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      // Vérifier si l'utilisateur est connecté
      if (!user) {
        setError('Utilisateur non connecté');
        setLoading(false);
        return;
      }

      // Vérifier si l'utilisateur a les permissions nécessaires
      const allowedRoles = ['admin', 'principal', 'secretary'];
      if (!allowedRoles.includes(user?.role)) {
        setError('Accès non autorisé pour ce rôle');
        setLoading(false);
        return;
      }

      // Vérifier si c'est un compte de démo
      if (user?.email?.includes('@demo.com') || user?.id?.includes('demo-')) {
        // Données de démo pour les enseignants
        const demoTeachers = [
          {
            id: 'demo-teacher-1',
            full_name: 'Mme. Nkomo Marie',
            email: 'marie.nkomo@ecole.cm',
            phone: '+237 670 123 456',
            pin_code: '1234',
            created_at: '2024-09-01T08:00:00Z',
            teacher_assignments: [
              { id: 1, class_name: '6e A', subject: 'Mathématiques', is_active: true },
              { id: 2, class_name: '6e B', subject: 'Mathématiques', is_active: true }
            ]
          },
          {
            id: 'demo-teacher-2',
            full_name: 'M. Kamdem Paul',
            email: 'paul.kamdem@ecole.cm',
            phone: '+237 680 234 567',
            pin_code: '5678',
            created_at: '2024-09-02T09:00:00Z',
            teacher_assignments: [
              { id: 3, class_name: '5e A', subject: 'Français', is_active: true },
              { id: 4, class_name: '4e A', subject: 'Français', is_active: true }
            ]
          },
          {
            id: 'demo-teacher-3',
            full_name: 'Mme. Fotso Jeanne',
            email: 'jeanne.fotso@ecole.cm',
            phone: '+237 690 345 678',
            pin_code: '9012',
            created_at: '2024-09-03T10:00:00Z',
            teacher_assignments: [
              { id: 5, class_name: '3e A', subject: 'Sciences Physiques', is_active: true }
            ]
          },
          {
            id: 'demo-teacher-4',
            full_name: 'M. Biya Emmanuel',
            email: 'emmanuel.biya@ecole.cm',
            phone: '+237 650 456 789',
            pin_code: '3456',
            created_at: '2024-09-04T11:00:00Z',
            teacher_assignments: []
          }
        ];
        setTeachers(demoTeachers);
      } else {
        // Données réelles via Supabase
        try {
          // Import dynamique du service seulement pour les comptes non-démo
          const { teacherService } = await import('../../services/teacherService');
          const result = await teacherService?.getSchoolTeachers(user?.current_school_id);
          if (result?.success) {
            setTeachers(result?.data || []);
          } else {
            setError('Erreur lors du chargement des enseignants');
          }
        } catch (supabaseError) {
          console.error('Erreur Supabase:', supabaseError);
          setError('Erreur de connexion à la base de données');
        }
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeacher = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Vérifier si c'est un compte de démo
      if (user?.email?.includes('@demo.com')) {
        // Simulation de création pour la démo
        const newTeacher = {
          id: `demo-teacher-${Date.now()}`,
          full_name: formData?.full_name,
          email: formData?.email,
          phone: formData?.phone,
          pin_code: formData?.pin_code || Math.floor(1000 + Math.random() * 9000)?.toString(),
          created_at: new Date().toISOString(),
          teacher_assignments: []
        };
        
        // Ajouter à la liste locale (pour la démo)
        setTeachers(prev => [...prev, newTeacher]);
        setSuccess('Compte enseignant créé avec succès (Mode Démo)');
        setShowCreateModal(false);
        resetForm();
      } else {
        // Création réelle via Supabase
        try {
          const { teacherService } = await import('../../services/teacherService');
          const teacherData = {
            ...formData,
            school_id: user?.current_school_id,
            pin_code: formData?.pin_code || Math.floor(1000 + Math.random() * 9000)?.toString()
          };

          const result = await teacherService?.createTeacherAccount(teacherData);
          
          if (result?.success) {
            setSuccess('Compte enseignant créé avec succès');
            setShowCreateModal(false);
            resetForm();
            loadTeachers();
          } else {
            setError(result?.error || 'Erreur lors de la création du compte');
          }
        } catch (supabaseError) {
          console.error('Erreur Supabase:', supabaseError);
          setError('Erreur de création du compte');
        }
      }
    } catch (error) {
      setError('Erreur de création du compte');
    }
  };

  const handleEditTeacher = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Vérifier si c'est un compte de démo
      if (user?.email?.includes('@demo.com')) {
        // Simulation de modification pour la démo
        setTeachers(prev => prev.map(teacher => 
          teacher.id === selectedTeacher?.id 
            ? { 
                ...teacher, 
                full_name: formData?.full_name,
                email: formData?.email,
                phone: formData?.phone
              }
            : teacher
        ));
        setSuccess('Profil enseignant mis à jour avec succès (Mode Démo)');
        setShowEditModal(false);
        setSelectedTeacher(null);
        resetForm();
      } else {
        // Modification réelle via Supabase
        try {
          const { teacherService } = await import('../../services/teacherService');
          const result = await teacherService?.updateTeacherProfile(selectedTeacher?.id, {
            full_name: formData?.full_name,
            email: formData?.email,
            phone: formData?.phone
          });
          
          if (result?.success) {
            setSuccess('Profil enseignant mis à jour avec succès');
            setShowEditModal(false);
            setSelectedTeacher(null);
            resetForm();
            loadTeachers();
          } else {
            setError(result?.error || 'Erreur lors de la mise à jour');
          }
        } catch (supabaseError) {
          console.error('Erreur Supabase:', supabaseError);
          setError('Erreur de mise à jour du profil');
        }
      }
    } catch (error) {
      setError('Erreur de mise à jour du profil');
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '+237',
      password: '',
      pin_code: ''
    });
  };

  const openEditModal = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      full_name: teacher?.full_name || '',
      email: teacher?.email || '',
      phone: teacher?.phone || '+237',
      password: '',
      pin_code: teacher?.pin_code || ''
    });
    setShowEditModal(true);
  };

  const getTeacherAssignmentSummary = (teacher) => {
    const assignments = teacher?.teacher_assignments || [];
    const activeAssignments = assignments?.filter(a => a?.is_active);
    
    if (activeAssignments?.length === 0) {
      return { classes: 'Aucune', subjects: 'Aucune', count: 0 };
    }

    const classes = [...new Set(activeAssignments.map(a => a.class_name))];
    const subjects = [...new Set(activeAssignments.map(a => a.subject))];
    
    return {
      classes: classes?.join(', '),
      subjects: subjects?.join(', '),
      count: activeAssignments?.length
    };
  };

  const filteredTeachers = teachers?.filter(teacher =>
    teacher?.full_name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    teacher?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    teacher?.phone?.includes(searchTerm)
  ) || [];

  // Vérifier si l'utilisateur est connecté et autorisé (mais permettre le chargement)
  const allowedRoles = ['admin', 'principal', 'secretary'];
  
  if (user && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />
        
        <div className="flex">
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            userRole={user?.role}
          />
          
          <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} p-4`}>
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès restreint</h2>
                  <p className="text-gray-600">Cette page est réservée aux administrateurs, principaux et secrétaires.</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50">
      <Header 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        user={user}
      />
      
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userRole={user?.role}
        />
        
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} p-4`}>
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
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
                      Gestion des Comptes Enseignants
                    </h1>
                    <p className="text-gray-600">
                      Créer et gérer les comptes des enseignants
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouvel Enseignant</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="mt-6 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e?.target?.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTeachers?.map((teacher) => {
            const assignmentSummary = getTeacherAssignmentSummary(teacher);
            
            return (
              <div key={teacher?.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Teacher Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {teacher?.full_name || 'Nom non défini'}
                        </h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Enseignant
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(teacher)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-3 text-gray-400" />
                      <span>{teacher?.email || 'Email non défini'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-3 text-gray-400" />
                      <span>{teacher?.phone || 'Téléphone non défini'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                      <span>
                        Créé le {teacher?.created_at ? new Date(teacher.created_at)?.toLocaleDateString('fr-FR') : 'Date inconnue'}
                      </span>
                    </div>
                  </div>

                  {/* Assignment Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-2">
                      <FileText className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Affectations</span>
                      <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        {assignmentSummary?.count}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div><strong>Classes:</strong> {assignmentSummary?.classes}</div>
                      <div><strong>Matières:</strong> {assignmentSummary?.subjects}</div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {assignmentSummary?.count > 0 ? (
                        <>
                          <UserCheck className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-sm text-green-600 font-medium">Actif</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-4 h-4 text-amber-500 mr-2" />
                          <span className="text-sm text-amber-600 font-medium">Non affecté</span>
                        </>
                      )}
                    </div>
                    {teacher?.pin_code && (
                      <div className="text-xs text-gray-500">
                        PIN: {teacher?.pin_code}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTeachers?.length === 0 && !loading && (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun enseignant trouvé</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Aucun enseignant ne correspond à votre recherche' : 'Commencez par créer votre premier compte enseignant'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer un compte enseignant
              </button>
            )}
          </div>
        )}

        {/* Create Teacher Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Créer un Compte Enseignant
                </h2>
                
                <form onSubmit={handleCreateTeacher} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData?.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e?.target?.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Mme Tchoukoua Rose"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData?.email}
                      onChange={(e) => setFormData({ ...formData, email: e?.target?.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="exemple@ecole.cm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData?.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e?.target?.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+237 xxx xxx xxx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData?.password}
                      onChange={(e) => setFormData({ ...formData, password: e?.target?.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mot de passe sécurisé"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code PIN (optionnel)
                    </label>
                    <input
                      type="text"
                      maxLength="4"
                      value={formData?.pin_code}
                      onChange={(e) => setFormData({ ...formData, pin_code: e?.target?.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="4 chiffres (auto-généré si vide)"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
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
                      Créer le Compte
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Teacher Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Modifier le Profil Enseignant
                </h2>
                
                <form onSubmit={handleEditTeacher} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData?.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e?.target?.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData?.email}
                      onChange={(e) => setFormData({ ...formData, email: e?.target?.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData?.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e?.target?.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedTeacher(null);
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
                      Sauvegarder
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherAccountManagement;