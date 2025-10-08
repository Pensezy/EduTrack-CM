import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { documentService } from '../../services/documentService';
import { supabase } from '../../lib/supabase';
import useDashboardData from '../../hooks/useDashboardData';
import { useDataMode } from '../../hooks/useDataMode';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

// Components
import FileUploadSection from './components/FileUploadSection';
import DocumentGrid from './components/DocumentGrid';
import TeacherAssignments from './components/TeacherAssignments';
import DocumentFilters from './components/DocumentFilters';
import DocumentStats from './components/DocumentStats';
import AccessControlPanel from './components/AccessControlPanel';

const DocumentManagementHub = () => {
  const location = useLocation();
  const { user, userProfile } = useAuth();
  const { data, loading: dataLoading } = useDashboardData();
  const { isDemo } = useDataMode();
  
  // Détecter le mode principal depuis l'URL
  const urlParams = new URLSearchParams(location.search);
  const isPrincipalMode = urlParams.get('mode') === 'principal' || userProfile?.role === 'principal';
  
  const [documents, setDocuments] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [filters, setFilters] = useState({
    class_name: '',
    subject: '',
    document_type: '',
    search: '',
    account_id: ''
  });
  const [stats, setStats] = useState(null);
  const [activeView, setActiveView] = useState(isPrincipalMode ? 'overview' : 'documents'); // overview, accounts, documents, assignments, stats

  useEffect(() => {
    loadInitialData();
    setupRealtimeSubscription();
  }, [user]);

  // Générer des documents de démonstration
  const getDemoDocuments = () => {
    return [
      {
        id: 'doc-1',
        title: 'Cours de Mathématiques - Équations du 2nd degré',
        description: 'Support de cours pour la classe de 3ème',
        file_name: 'maths_equations_3eme.pdf',
        file_size: 245760,
        document_type: 'cours',
        class_name: '3èmeA',
        subject: 'Mathématiques',
        created_at: '2024-10-05T10:30:00Z',
        uploaded_by: 'Marie Dubois',
        uploader_id: 'demo-teacher-1',
        download_count: 12,
        status: 'active'
      },
      {
        id: 'doc-2',
        title: 'Devoir surveillé - Français',
        description: 'Évaluation de compréhension de texte',
        file_name: 'ds_francais_4eme.pdf',
        file_size: 189440,
        document_type: 'evaluation',
        class_name: '4èmeA',
        subject: 'Français',
        created_at: '2024-10-03T14:15:00Z',
        uploaded_by: 'Jean Kamto',
        uploader_id: 'demo-teacher-2',
        download_count: 8,
        status: 'active'
      },
      {
        id: 'doc-3',
        title: 'Exercices de Mathématiques',
        description: 'Feuille d\'exercices sur les fractions',
        file_name: 'exercices_fractions_6eme.pdf',
        file_size: 156720,
        document_type: 'exercice',
        class_name: '6èmeA',
        subject: 'Mathématiques',
        created_at: '2024-10-02T09:45:00Z',
        uploaded_by: 'Marie Dubois',
        uploader_id: 'demo-teacher-1',
        download_count: 15,
        status: 'active'
      },
      {
        id: 'doc-4',
        title: 'Correction DS Français',
        description: 'Corrigé type du devoir surveillé',
        file_name: 'correction_ds_francais_4eme.pdf',
        file_size: 203840,
        document_type: 'correction',
        class_name: '4èmeA',
        subject: 'Français',
        created_at: '2024-10-04T16:20:00Z',
        uploaded_by: 'Jean Kamto',
        uploader_id: 'demo-teacher-2',
        download_count: 6,
        status: 'active'
      },
      {
        id: 'doc-5',
        title: 'Règlement intérieur',
        description: 'Document administratif pour toutes les classes',
        file_name: 'reglement_interieur_2024.pdf',
        file_size: 512000,
        document_type: 'administratif',
        class_name: 'Toutes',
        subject: 'Administration',
        created_at: '2024-09-01T08:00:00Z',
        uploaded_by: 'Fatima Ngo',
        uploader_id: 'demo-secretary-1',
        download_count: 45,
        status: 'active'
      },
      {
        id: 'doc-6',
        title: 'Planning des examens',
        description: 'Calendrier des évaluations du trimestre',
        file_name: 'planning_examens_t1.pdf',
        file_size: 178560,
        document_type: 'planning',
        class_name: 'Toutes',
        subject: 'Administration',
        created_at: '2024-09-15T12:30:00Z',
        uploaded_by: 'Fatima Ngo',
        uploader_id: 'demo-secretary-1',
        download_count: 23,
        status: 'active'
      }
    ];
  };

  // Obtenir les données du personnel selon le mode (démo ou production)
  const getPersonnelAccounts = () => {
    if (isDemo) {
      return [
        {
          id: 'demo-teacher-1',
          full_name: 'Marie Dubois',
          email: 'marie.dubois@edutrack.cm',
          role: 'teacher',
          subject: 'Mathématiques',
          classes: ['6èmeA', '5èmeB'],
          status: 'active',
          document_count: 15,
          last_upload: '2024-10-05',
          created_at: '2024-09-01'
        },
        {
          id: 'demo-teacher-2',
          full_name: 'Jean Kamto',
          email: 'jean.kamto@edutrack.cm',
          role: 'teacher',
          subject: 'Français',
          classes: ['4èmeA', '3èmeB'],
          status: 'active',
          document_count: 8,
          last_upload: '2024-10-03',
          created_at: '2024-09-01'
        },
        {
          id: 'demo-secretary-1',
          full_name: 'Fatima Ngo',
          email: 'fatima.ngo@edutrack.cm',
          role: 'secretary',
          permissions: ['student_management', 'document_management'],
          status: 'active',
          document_count: 3,
          last_upload: '2024-10-01',
          created_at: '2024-08-15'
        }
      ];
    } else {
      // Mode production - utiliser les vraies données du personnel
      const teachers = data?.personnel?.filter(p => p.type === 'teacher') || [];
      const secretaries = data?.personnel?.filter(p => p.type === 'secretary') || [];
      return [...teachers, ...secretaries].map(person => ({
        id: person.id,
        full_name: person.name,
        email: person.email,
        role: person.type,
        subject: person.subject,
        classes: person.classes || [],
        status: person.status,
        document_count: 0, // À implémenter depuis la base de données
        last_upload: null,
        created_at: person.created_at
      }));
    }
  };

  const loadInitialData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (isPrincipalMode) {
        // En mode principal, charger TOUS les documents de l'établissement
        const docsResult = await documentService?.getAllSchoolDocuments();
        if (docsResult?.error) {
          console.error('Erreur chargement documents école:', docsResult?.error);
          // Fallback avec données demo si erreur
          if (isDemo) {
            setDocuments(getDemoDocuments());
          }
        } else {
          setDocuments(docsResult?.data || (isDemo ? getDemoDocuments() : []));
        }
      } else {
        // Mode normal selon le rôle utilisateur
        if (userProfile?.role === 'teacher') {
          const [docsResult, assignmentsResult, statsResult] = await Promise.all([
            documentService?.getTeacherDocuments(),
            documentService?.getTeacherAssignments(),
            documentService?.getDocumentStats()
          ]);

          if (docsResult?.error) {
            console.error('Erreur chargement documents:', docsResult?.error);
          } else {
            setDocuments(docsResult?.data || []);
          }

          if (assignmentsResult?.error) {
            console.error('Erreur chargement assignations:', assignmentsResult?.error);
          } else {
            setTeacherAssignments(assignmentsResult?.data || []);
          }

          if (statsResult?.error) {
            console.error('Erreur chargement statistiques:', statsResult?.error);
          } else {
            setStats(statsResult?.data);
          }

        } else if (userProfile?.role === 'student') {
          const docsResult = await documentService?.getStudentDocuments();
          if (docsResult?.error) {
            console.error('Erreur chargement documents étudiant:', docsResult?.error);
          } else {
            setDocuments(docsResult?.data || []);
          }
        } else {
          // For parents or other roles, get all accessible documents
          const docsResult = await documentService?.getDocuments(filters);
          if (docsResult?.error) {
            console.error('Erreur chargement documents:', docsResult?.error);
          } else {
            setDocuments(docsResult?.data || []);
          }
        }
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
    setLoading(false);
  };

  const setupRealtimeSubscription = () => {
    const documentsSubscription = supabase?.channel('documents_changes')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents'
        },
        (payload) => {
          console.log('Document change:', payload);
          loadInitialData(); // Refresh data on changes
        }
      )?.subscribe();

    return () => {
      supabase?.removeChannel(documentsSubscription);
    };
  };

  const handleFileUpload = async (fileData) => {
    setUploading(true);
    try {
      const result = await documentService?.uploadDocument(fileData?.documentData, fileData?.file);
      if (result?.error) {
        throw new Error(result.error);
      }

      // Refresh documents list
      await loadInitialData();
      
      return { success: true, message: 'Document uploaded successfully!' };
    } catch (error) {
      console.error('Erreur upload:', error);
      return { success: false, message: error?.message };
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentDelete = async (documentId) => {
    try {
      const result = await documentService?.deleteDocument(documentId);
      if (result?.error) {
        throw new Error(result.error);
      }

      // Remove from local state
      setDocuments(prev => prev?.filter(doc => doc?.id !== documentId));
      
      return { success: true, message: 'Document supprimé avec succès!' };
    } catch (error) {
      console.error('Erreur suppression:', error);
      return { success: false, message: error?.message };
    }
  };

  const handleDocumentDownload = async (documentId) => {
    try {
      const result = await documentService?.downloadDocument(documentId, 'download');
      if (result?.error) {
        throw new Error(result.error);
      }

      // Trigger download
      const link = document.createElement('a');
      link.href = result?.data?.url;
      link.download = result?.data?.fileName;
      document.body?.appendChild(link);
      link?.click();
      document.body?.removeChild(link);

      return { success: true, message: 'Téléchargement initialisé!' };
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      return { success: false, message: error?.message };
    }
  };

  const handleAccountSelection = (account) => {
    setSelectedAccount(account);
    setFilters(prev => ({ ...prev, account_id: account.id }));
    loadInitialData();
  };

  const handleFiltersChange = async (newFilters) => {
    setFilters(newFilters);
    
    // Apply filters and reload documents
    setLoading(true);
    const result = await documentService?.getDocuments(newFilters);
    if (result?.error) {
      console.error('Erreur filtrage:', result?.error);
    } else {
      setDocuments(result?.data || []);
    }
    setLoading(false);
  };

  const filteredDocuments = documents?.filter(doc => {
    // Filtre par classe
    if (filters.class_name && doc.class_name !== filters.class_name) return false;
    
    // Filtre par matière
    if (filters.subject && doc.subject !== filters.subject) return false;
    
    // Filtre par type de document
    if (filters.document_type && doc.document_type !== filters.document_type) return false;
    
    // Filtre par compte sélectionné (enseignant)
    if (selectedAccount && doc.uploader_id !== selectedAccount.id) return false;
    
    // Filtre par recherche textuelle
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = (
        doc?.title?.toLowerCase()?.includes(searchLower) ||
        doc?.description?.toLowerCase()?.includes(searchLower) ||
        doc?.class_name?.toLowerCase()?.includes(searchLower) ||
        doc?.subject?.toLowerCase()?.includes(searchLower) ||
        doc?.uploaded_by?.toLowerCase()?.includes(searchLower)
      );
      if (!matchesSearch) return false;
    }
    
    return true;
  }) || [];

  if (loading && documents?.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isPrincipalMode ? 'Supervision des Documents Personnel' : 'Centre de Gestion des Documents'}
              </h1>
              <p className="text-gray-600">
                {isPrincipalMode 
                  ? 'Contrôlez et supervisez les documents par compte personnel'
                  : userProfile?.role === 'teacher' 
                    ? 'Gérez et partagez vos documents pédagogiques'
                    : userProfile?.role === 'student' 
                      ? 'Accédez aux documents de vos cours' 
                      : 'Consultez les documents partagés'
                }
              </p>
            </div>
            
            {isPrincipalMode && (
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                isDemo ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
              }`}>
                <Icon name={isDemo ? 'TestTube' : 'Database'} size={16} />
                <span className="text-sm font-medium">
                  {isDemo ? 'Mode Démo' : 'Données Réelles'}
                </span>
              </div>
            )}
          </div>
          
          {/* Compte sélectionné en mode principal */}
          {isPrincipalMode && selectedAccount && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon name={selectedAccount.role === 'teacher' ? 'GraduationCap' : 'UserCheck'} size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">{selectedAccount.full_name}</h3>
                    <p className="text-sm text-blue-700">
                      {selectedAccount.role === 'teacher' ? `${selectedAccount.subject} - ${selectedAccount.classes?.join(', ')}` : 'Secrétaire'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-blue-700">
                  <div className="text-center">
                    <div className="font-semibold">{selectedAccount.document_count || 0}</div>
                    <div>Documents</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAccount(null)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {isPrincipalMode && (
                <>
                  <button
                    onClick={() => setActiveView('overview')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeView === 'overview'
                        ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    � Vue d'Ensemble
                  </button>
                  
                  <button
                    onClick={() => setActiveView('documents')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeView === 'documents'
                        ? 'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📄 Tous les Documents
                  </button>
                  
                  <button
                    onClick={() => setActiveView('accounts')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeView === 'accounts'
                        ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    👥 Par Personnel
                  </button>
                </>
              )}
              
              {!isPrincipalMode && (
                <button
                  onClick={() => setActiveView('documents')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeView === 'documents'
                      ? 'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📄 Documents
                </button>
              )}
              
              {userProfile?.role === 'teacher' && !isPrincipalMode && (
                <>
                  <button
                    onClick={() => setActiveView('assignments')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeView === 'assignments' ?'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📋 Mes Classes
                  </button>
                  
                  <button
                    onClick={() => setActiveView('stats')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeView === 'stats' ?'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📊 Statistiques
                  </button>
                </>
              )}
              
              {isPrincipalMode && selectedAccount && (
                <button
                  onClick={() => setActiveView('account-stats')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeView === 'account-stats' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📊 Statistiques du Compte
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Vue d'ensemble (mode principal uniquement) */}
          {activeView === 'overview' && isPrincipalMode && (
            <div className="space-y-6">
              {/* Statistiques générales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon name="FileText" size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
                      <div className="text-sm text-gray-500">Documents Total</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Icon name="Users" size={24} className="text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{getPersonnelAccounts().length}</div>
                      <div className="text-sm text-gray-500">Personnel Actif</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Icon name="BookOpen" size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {[...new Set(documents.map(doc => doc.class_name))].length}
                      </div>
                      <div className="text-sm text-gray-500">Classes Concernées</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Icon name="Download" size={24} className="text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {documents.reduce((total, doc) => total + (doc.download_count || 0), 0)}
                      </div>
                      <div className="text-sm text-gray-500">Téléchargements</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activité récente */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Activité Récente</h3>
                <div className="space-y-3">
                  {documents
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 5)
                    .map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Icon name="FileText" size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{doc.title}</h4>
                            <p className="text-sm text-gray-500">
                              {doc.class_name} • {doc.subject} • par {doc.uploaded_by}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-900">{doc.download_count || 0} téléchargements</div>
                          <div className="text-xs text-gray-500">
                            {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Documents par classe */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Répartition par Classe</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[...new Set(documents.map(doc => doc.class_name))]
                    .filter(className => className && className !== 'Toutes')
                    .map((className) => {
                      const classDocuments = documents.filter(doc => doc.class_name === className);
                      return (
                        <div key={className} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{className}</h4>
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {classDocuments.length}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {[...new Set(classDocuments.map(doc => doc.subject))].join(', ')}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Vue des comptes (mode principal uniquement) */}
          {activeView === 'accounts' && isPrincipalMode && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Personnel avec Accès aux Documents</h3>
                  <div className="text-sm text-gray-500">
                    {getPersonnelAccounts().length} comptes actifs
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getPersonnelAccounts().map((account) => (
                    <div
                      key={account.id}
                      onClick={() => handleAccountSelection(account)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedAccount?.id === account.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          account.role === 'teacher' ? 'bg-green-100' : 'bg-purple-100'
                        }`}>
                          <Icon 
                            name={account.role === 'teacher' ? 'GraduationCap' : 'UserCheck'} 
                            size={20} 
                            className={account.role === 'teacher' ? 'text-green-600' : 'text-purple-600'}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{account.full_name}</h4>
                          <p className="text-sm text-gray-500 truncate">{account.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Rôle:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            account.role === 'teacher' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {account.role === 'teacher' ? 'Enseignant' : 'Secrétaire'}
                          </span>
                        </div>
                        
                        {account.subject && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Matière:</span>
                            <span className="font-medium">{account.subject}</span>
                          </div>
                        )}
                        
                        {account.classes && account.classes.length > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Classes:</span>
                            <span className="font-medium">{account.classes.join(', ')}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Documents:</span>
                          <span className="font-semibold text-blue-600">{account.document_count || 0}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Statut:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            account.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {account.status === 'active' ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                        
                        {account.last_upload && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Dernier upload:</span>
                            <span className="text-gray-500">{new Date(account.last_upload).toLocaleDateString('fr-FR')}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAccountSelection(account);
                            setActiveView('documents');
                          }}
                        >
                          <Icon name="FileText" size={16} className="mr-2" />
                          Voir les documents
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {getPersonnelAccounts().length === 0 && (
                  <div className="text-center py-12">
                    <Icon name="Users" size={64} className="text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun personnel trouvé</h3>
                    <p className="text-gray-500">
                      {isDemo 
                        ? 'Les comptes de démonstration ne sont pas disponibles en ce moment.' 
                        : 'Aucun compte personnel n\'a encore été créé.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeView === 'documents' && (
            <>
              {/* Filtres de recherche avancés pour le mode principal */}
              {isPrincipalMode && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-blue-900 mb-3">🔍 Recherche Avancée</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-1">Par Classe</label>
                      <select 
                        className="w-full border border-blue-300 rounded-md px-3 py-2 text-sm"
                        value={filters.class_name}
                        onChange={(e) => setFilters(prev => ({...prev, class_name: e.target.value}))}
                      >
                        <option value="">Toutes les classes</option>
                        {[...new Set(documents.map(doc => doc.class_name))]
                          .filter(className => className && className !== 'Toutes')
                          .map(className => (
                            <option key={className} value={className}>{className}</option>
                          ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-1">Par Matière</label>
                      <select 
                        className="w-full border border-blue-300 rounded-md px-3 py-2 text-sm"
                        value={filters.subject}
                        onChange={(e) => setFilters(prev => ({...prev, subject: e.target.value}))}
                      >
                        <option value="">Toutes les matières</option>
                        {[...new Set(documents.map(doc => doc.subject))]
                          .filter(subject => subject)
                          .map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-1">Par Enseignant</label>
                      <select 
                        className="w-full border border-blue-300 rounded-md px-3 py-2 text-sm"
                        value={selectedAccount?.id || ''}
                        onChange={(e) => {
                          const account = getPersonnelAccounts().find(acc => acc.id === e.target.value);
                          setSelectedAccount(account || null);
                        }}
                      >
                        <option value="">Tous les enseignants</option>
                        {getPersonnelAccounts().map(account => (
                          <option key={account.id} value={account.id}>{account.full_name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-1">Type</label>
                      <select 
                        className="w-full border border-blue-300 rounded-md px-3 py-2 text-sm"
                        value={filters.document_type}
                        onChange={(e) => setFilters(prev => ({...prev, document_type: e.target.value}))}
                      >
                        <option value="">Tous les types</option>
                        <option value="cours">Cours</option>
                        <option value="exercice">Exercices</option>
                        <option value="evaluation">Évaluations</option>
                        <option value="correction">Corrections</option>
                        <option value="administratif">Administratif</option>
                        <option value="planning">Planning</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="Rechercher dans les titres et descriptions..."
                      className="w-full border border-blue-300 rounded-md px-3 py-2 text-sm"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                    />
                  </div>
                  
                  {(filters.class_name || filters.subject || filters.document_type || filters.search || selectedAccount) && (
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm text-blue-700">
                        {filteredDocuments.length} document(s) trouvé(s)
                        {selectedAccount && ` pour ${selectedAccount.full_name}`}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFilters({class_name: '', subject: '', document_type: '', search: '', account_id: ''});
                          setSelectedAccount(null);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Icon name="X" size={16} className="mr-1" />
                        Réinitialiser
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* File Upload Section (Teachers only et pas en mode principal) */}
              {userProfile?.role === 'teacher' && !isPrincipalMode && (
                <FileUploadSection 
                  onUpload={handleFileUpload}
                  uploading={uploading}
                  teacherAssignments={teacherAssignments}
                />
              )}

              {/* Document Filters pour les autres rôles */}
              {!isPrincipalMode && (
                <DocumentFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  userRole={userProfile?.role}
                />
              )}

              {/* Documents Grid */}
              <DocumentGrid
                documents={filteredDocuments}
                onDelete={handleDocumentDelete}
                onDownload={handleDocumentDownload}
                userRole={isPrincipalMode ? 'principal' : userProfile?.role}
                loading={loading}
                selectedAccount={selectedAccount}
                showUploaderInfo={isPrincipalMode}
              />
            </>
          )}

          {activeView === 'assignments' && userProfile?.role === 'teacher' && !isPrincipalMode && (
            <TeacherAssignments
              assignments={teacherAssignments}
              onAssignmentsUpdate={loadInitialData}
            />
          )}

          {activeView === 'stats' && userProfile?.role === 'teacher' && !isPrincipalMode && (
            <DocumentStats
              stats={stats}
              documents={documents}
            />
          )}

          {/* Statistiques du compte sélectionné (mode principal) */}
          {activeView === 'account-stats' && isPrincipalMode && selectedAccount && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Statistiques de {selectedAccount.full_name}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Icon name="FileText" size={24} className="text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold text-blue-900">{selectedAccount.document_count || 0}</div>
                        <div className="text-sm text-blue-600">Documents uploadés</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Icon name="Download" size={24} className="text-green-600" />
                      <div>
                        <div className="text-2xl font-bold text-green-900">0</div>
                        <div className="text-sm text-green-600">Téléchargements</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Icon name="Calendar" size={24} className="text-purple-600" />
                      <div>
                        <div className="text-2xl font-bold text-purple-900">
                          {selectedAccount.last_upload 
                            ? Math.floor((new Date() - new Date(selectedAccount.last_upload)) / (1000 * 60 * 60 * 24))
                            : '--'}
                        </div>
                        <div className="text-sm text-purple-600">Jours depuis dernier upload</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Informations du compte</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Email :</span>
                      <span className="ml-2 font-medium">{selectedAccount.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Rôle :</span>
                      <span className="ml-2 font-medium capitalize">{selectedAccount.role}</span>
                    </div>
                    {selectedAccount.subject && (
                      <div>
                        <span className="text-gray-600">Matière :</span>
                        <span className="ml-2 font-medium">{selectedAccount.subject}</span>
                      </div>
                    )}
                    {selectedAccount.classes && selectedAccount.classes.length > 0 && (
                      <div>
                        <span className="text-gray-600">Classes :</span>
                        <span className="ml-2 font-medium">{selectedAccount.classes.join(', ')}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Créé le :</span>
                      <span className="ml-2 font-medium">
                        {new Date(selectedAccount.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Statut :</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        selectedAccount.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedAccount.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Access Control Info */}
        <AccessControlPanel 
          userRole={isPrincipalMode ? 'principal' : userProfile?.role} 
          isPrincipalMode={isPrincipalMode}
          selectedAccount={selectedAccount}
        />
      </div>
    </div>
  );
};

export default DocumentManagementHub;