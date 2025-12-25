import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDataMode } from '../../hooks/useDataMode';
import { useDashboardData } from '../../hooks/useDashboardData';
import { Upload, Download, FileText, Eye, Filter, Calendar, User, BookOpen } from 'lucide-react';

// Demo data that loads even without Supabase
const DEMO_DOCUMENTS = [
  {
    id: '1',
    title: 'Q1 Report Card.pdf',
    subject: 'Académique',
    class_name: '3ème A',
    uploaded_by: 'Mr. Nkem',
    uploaded_at: '2025-01-15T10:30:00Z',
    file_size: '245 KB',
    visibility: 'student',
    student_id: 'amina-tchatchoua',
    description: 'Bulletin de notes du premier trimestre pour Amina Tchatchoua'
  },
  {
    id: '2',
    title: 'Parent Meeting Convocation.pdf',
    subject: 'Administration',
    class_name: '4A',
    uploaded_by: 'Secrétaire',
    uploaded_at: '2025-01-18T14:15:00Z',
    file_size: '156 KB',
    visibility: 'class',
    class_id: 'class-4a',
    description: 'Convocation pour la réunion des parents d\'élèves de la classe 4A'
  },
  {
    id: '3',
    title: 'Payment Receipt.pdf',
    subject: 'Finance',
    class_name: 'Terminale D',
    uploaded_by: 'Système',
    uploaded_at: '2025-01-20T09:45:00Z',
    file_size: '89 KB',
    visibility: 'parent',
    parent_id: 'jean-kouam',
    description: 'Reçu de paiement des frais de scolarité pour Jean Kouam'
  },
  {
    id: '4',
    title: 'Mathematics Assignment.pdf',
    subject: 'Mathématiques',
    class_name: '3ème A',
    uploaded_by: 'Mr. Nkem',
    uploaded_at: '2025-01-22T08:20:00Z',
    file_size: '324 KB',
    visibility: 'student',
    description: 'Devoir de mathématiques - Chapitre Géométrie'
  },
  {
    id: '5',
    title: 'English Literature Notes.docx',
    subject: 'Anglais',
    class_name: '4A',
    uploaded_by: 'Mrs. Fatima',
    uploaded_at: '2025-01-25T11:10:00Z',
    file_size: '567 KB',
    visibility: 'class',
    description: 'Notes de cours - Littérature anglaise moderne'
  } 
];

const DEMO_CLASSES = ['3ème A', '4A', 'Terminale D', '6ème B', '5ème C'];
const DEMO_SUBJECTS = ['Mathématiques', 'Anglais', 'Français', 'Sciences', 'Histoire', 'Administration', 'Finance'];

const DocumentManagementCenter = () => {
  const { user, userProfile } = useAuth();
  const { dataMode, isDemo } = useDataMode();
  const { data, loading: dataLoading } = useDashboardData();
  
  const [uploading, setUploading] = useState(false);
  const [filters, setFilters] = useState({
    class_name: '',
    subject: '',
    search: '',
    uploaded_by: ''
  });
  
  // File upload state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    subject: '',
    class_name: '',
    description: '',
    visibility: 'student'
  });

  // Documents basés sur le mode
  const documents = isDemo 
    ? DEMO_DOCUMENTS 
    : data?.documents || [];

  // Classes et matières basées sur le mode
  const availableClasses = isDemo 
    ? DEMO_CLASSES 
    : data?.classes?.map(c => c.name) || [];
    
  const availableSubjects = isDemo 
    ? DEMO_SUBJECTS 
    : data?.subjects || ['Mathématiques', 'Français', 'Anglais', 'Sciences'];

  // Filter documents based on role and filters
  const filteredDocuments = documents?.filter(doc => {
    // Role-based filtering
    if (userProfile?.role === 'student') {
      // Students see documents for their class or specifically for them
      if (doc?.visibility === 'class' && doc?.class_name !== userProfile?.current_class) return false;
      if (doc?.visibility === 'student' && doc?.student_id !== userProfile?.id) return false;
      if (doc?.visibility === 'parent') return false;
    } else if (userProfile?.role === 'parent') {
      // Parents see documents for their children or general parent documents
      if (doc?.visibility === 'student' && !userProfile?.children?.includes(doc?.student_id)) return false;
      if (doc?.visibility === 'class' && !userProfile?.children_classes?.includes(doc?.class_name)) return false;
    } else if (userProfile?.role === 'teacher') {
      // Teachers see documents they uploaded or for classes they teach
      if (doc?.uploaded_by !== userProfile?.full_name && !userProfile?.assigned_classes?.includes(doc?.class_name)) return false;
    }

    // Apply filters
    if (filters?.class_name && doc?.class_name !== filters?.class_name) return false;
    if (filters?.subject && doc?.subject !== filters?.subject) return false;
    if (filters?.uploaded_by && doc?.uploaded_by !== filters?.uploaded_by) return false;
    if (filters?.search) {
      const searchLower = filters?.search?.toLowerCase();
      if (!doc?.title?.toLowerCase()?.includes(searchLower) &&
          !doc?.description?.toLowerCase()?.includes(searchLower)) return false;
    }

    return true;
  }) || [];

  const handleFileUpload = async (e) => {
    e?.preventDefault();
    if (!uploadData?.title || !uploadData?.subject) return;

    setUploading(true);
    
    if (isDemo) {
      // Simulate upload process in demo mode  
      setTimeout(() => {
        alert(`✅ Document "${uploadData?.title}" uploadé avec succès ! (Mode démonstration)`);
        setUploadData({
          title: '',
          subject: '',
          class_name: '',
          description: '',
          visibility: 'student'
        });
        setShowUploadForm(false);
        setUploading(false);
      }, 2000);
    } else {
      // Real upload to Supabase in production mode
      try {
        // Here would be the real upload logic to Supabase
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated
        
        alert(`✅ Document "${uploadData?.title}" uploadé avec succès dans la base de données !`);
        setUploadData({
          title: '',
          subject: '',
          class_name: '',
          description: '',
          visibility: 'student'
        });
        setShowUploadForm(false);
        setUploading(false);
      } catch (error) {
        alert(`❌ Erreur lors de l'upload: ${error.message}`);
        setUploading(false);
      }
    }
  };

  const handleDownload = (document) => {
    if (isDemo) {
      alert(`📥 Téléchargement simulé de "${document?.title}" (Mode démonstration)`);
    } else {
      // Real download from Supabase storage
      console.log('Real download:', document?.title);
      alert(`📥 Téléchargement de "${document?.title}" depuis le stockage...`);
    }
  };

  const handleView = (document) => {
    if (isDemo) {
      alert(`👁️ Prévisualisation simulée de "${document?.title}" (Mode démonstration)`);
    } else {
      // Real document preview
      console.log('Real preview:', document?.title);
      alert(`👁️ Ouverture de "${document?.title}" depuis le stockage...`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (size) => {
    return size || 'N/A';
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isDemo ? 'Chargement des documents de démonstration...' : 'Chargement des documents réels...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec indicateur de mode */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Centre de Gestion des Documents
            </h1>
            
            {/* Indicateur de mode données */}
            <div className={`px-4 py-2 rounded-full text-sm font-bold ${
              isDemo 
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                : 'bg-green-100 text-green-800 border border-green-300'
            }`}>
              {isDemo ? '🔄 MODE DÉMO' : '🏫 DONNÉES RÉELLES'}
            </div>
          </div>
          
          <p className="text-gray-600">
            {isDemo 
              ? (userProfile?.role === 'teacher' ?'Uploadez et gérez vos documents pédagogiques (Démonstration)'
                : userProfile?.role === 'student' ?'Accédez aux documents de vos cours (Démonstration)'
                : userProfile?.role === 'parent' ?'Consultez les documents de vos enfants (Démonstration)' :'Gérez les documents du système (Démonstration)')
              : (userProfile?.role === 'teacher' ?`Uploadez et gérez vos documents pour ${user?.schoolData?.name || 'votre établissement'}`
                : userProfile?.role === 'student' ?`Accédez aux documents de vos cours à ${user?.schoolData?.name || 'votre établissement'}`
                : userProfile?.role === 'parent' ?`Consultez les documents de vos enfants à ${user?.schoolData?.name || 'votre établissement'}` :`Gérez les documents de ${user?.schoolData?.name || 'votre établissement'}`)
            }
          </p>
        </div>

        {/* Upload Section - Only for Teachers */}
        {userProfile?.role === 'teacher' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6">
              {!showUploadForm ? (
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Uploader un document
                </button>
              ) : (
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Titre du document
                      </label>
                      <input
                        type="text"
                        value={uploadData?.title}
                        onChange={(e) => setUploadData(prev => ({ ...prev, title: e?.target?.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Matière
                      </label>
                      <select
                        value={uploadData?.subject}
                        onChange={(e) => setUploadData(prev => ({ ...prev, subject: e?.target?.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Sélectionner une matière</option>
                        {availableSubjects?.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Classe
                      </label>
                      <select
                        value={uploadData?.class_name}
                        onChange={(e) => setUploadData(prev => ({ ...prev, class_name: e?.target?.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Sélectionner une classe</option>
                        {availableClasses?.map(className => (
                          <option key={className} value={className}>{className}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Visibilité
                      </label>
                      <select
                        value={uploadData?.visibility}
                        onChange={(e) => setUploadData(prev => ({ ...prev, visibility: e?.target?.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="student">Étudiants seulement</option>
                        <option value="class">Toute la classe</option>
                        <option value="parent">Parents aussi</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={uploadData?.description}
                      onChange={(e) => setUploadData(prev => ({ ...prev, description: e?.target?.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Description du document..."
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {uploading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      {uploading ? 'Upload en cours...' : 'Uploader'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUploadForm(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Filter className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Filtrer les documents</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={filters?.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e?.target?.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={filters?.class_name}
                onChange={(e) => setFilters(prev => ({ ...prev, class_name: e?.target?.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toutes les classes</option>
                {availableClasses?.map(className => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
              
              <select
                value={filters?.subject}
                onChange={(e) => setFilters(prev => ({ ...prev, subject: e?.target?.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toutes les matières</option>
                {availableSubjects?.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              
              <button
                onClick={() => setFilters({ class_name: '', subject: '', search: '', uploaded_by: '' })}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Documents ({filteredDocuments?.length})
              </h3>
              <div className="text-sm text-gray-500">
                Accès basé sur votre rôle: {userProfile?.role || 'Visiteur'} | 
                Mode: {isDemo ? 'Démonstration' : 'Production'}
              </div>
            </div>

            {filteredDocuments?.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun document trouvé</h4>
                <p className="text-gray-600">
                  {filters?.search || filters?.class_name || filters?.subject
                    ? 'Essayez de modifier vos filtres de recherche.'
                    : 'Il n\'y a pas encore de documents disponibles pour votre profil.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments?.map(document => (
                  <div key={document?.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <h4 className="text-lg font-medium text-gray-900">{document?.title}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            document?.subject === 'Administration' ? 'bg-purple-100 text-purple-800' :
                            document?.subject === 'Finance'? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {document?.subject}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(document?.uploaded_at)}
                          </div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {document?.uploaded_by}
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-1" />
                            {document?.class_name || 'N/A'}
                          </div>
                          <div className="text-gray-500">
                            {formatFileSize(document?.file_size)}
                          </div>
                        </div>
                        
                        {document?.description && (
                          <p className="text-sm text-gray-600 mb-3">{document?.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleView(document)}
                          className="flex items-center px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Voir
                        </button>
                        <button
                          onClick={() => handleDownload(document)}
                          className="flex items-center px-3 py-1 text-sm text-green-600 border border-green-200 rounded hover:bg-green-50 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Télécharger
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Access Control Information avec mode */}
        <div className={`rounded-lg p-6 mt-6 ${
          isDemo ? 'bg-blue-50' : 'bg-green-50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={`text-lg font-medium ${
              isDemo ? 'text-blue-900' : 'text-green-900'
            }`}>
              Contrôle d'accès basé sur les rôles
            </h4>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isDemo 
                ? 'bg-blue-200 text-blue-800' 
                : 'bg-green-200 text-green-800'
            }`}>
              {isDemo ? 'Démonstration' : user?.schoolData?.name || 'Production'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <h5 className={`font-medium mb-2 ${
                isDemo ? 'text-blue-800' : 'text-green-800'
              }`}>👨‍🏫 Enseignants</h5>
              <p className={isDemo ? 'text-blue-700' : 'text-green-700'}>
                {isDemo 
                  ? 'Peuvent uploader des documents pour leurs classes assignées' 
                  : 'Uploadent des documents réels vers le stockage Supabase'
                }
              </p>
            </div>
            <div>
              <h5 className={`font-medium mb-2 ${
                isDemo ? 'text-blue-800' : 'text-green-800'
              }`}>👨‍🎓 Étudiants</h5>
              <p className={isDemo ? 'text-blue-700' : 'text-green-700'}>
                {isDemo 
                  ? 'Voient les documents de leurs classes et ceux qui leur sont destinés' 
                  : 'Accèdent aux vrais documents de leurs classes depuis la base de données'
                }
              </p>
            </div>
            <div>
              <h5 className={`font-medium mb-2 ${
                isDemo ? 'text-blue-800' : 'text-green-800'
              }`}>👨‍👩‍👧‍👦 Parents</h5>
              <p className={isDemo ? 'text-blue-700' : 'text-green-700'}>
                {isDemo 
                  ? 'Accèdent aux documents de leurs enfants et communications' 
                  : 'Consultent les vrais documents et communications de leurs enfants'
                }
              </p>
            </div>
            <div>
              <h5 className={`font-medium mb-2 ${
                isDemo ? 'text-blue-800' : 'text-green-800'
              }`}>👨‍💼 Admin</h5>
              <p className={isDemo ? 'text-blue-700' : 'text-green-700'}>
                {isDemo 
                  ? 'Accès complet à tous les documents du système' 
                  : 'Gestion complète des documents réels de l\'établissement'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentManagementCenter;