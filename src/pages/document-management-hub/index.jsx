import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { documentService } from '../../services/documentService';
import { supabase } from '../../lib/supabase';

// Components
import FileUploadSection from './components/FileUploadSection';
import DocumentGrid from './components/DocumentGrid';
import TeacherAssignments from './components/TeacherAssignments';
import DocumentFilters from './components/DocumentFilters';
import DocumentStats from './components/DocumentStats';
import AccessControlPanel from './components/AccessControlPanel';

const DocumentManagementHub = () => {
  const { user, userProfile } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filters, setFilters] = useState({
    class_name: '',
    subject: '',
    document_type: '',
    search: ''
  });
  const [stats, setStats] = useState(null);
  const [activeView, setActiveView] = useState('documents'); // documents, assignments, stats

  useEffect(() => {
    loadInitialData();
    setupRealtimeSubscription();
  }, [user]);

  const loadInitialData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load documents based on user role
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
    if (!filters?.search) return true;
    const searchLower = filters?.search?.toLowerCase();
    return (doc?.title?.toLowerCase()?.includes(searchLower) ||
    doc?.description?.toLowerCase()?.includes(searchLower) ||
    doc?.class_name?.toLowerCase()?.includes(searchLower) || doc?.subject?.toLowerCase()?.includes(searchLower));
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Centre de Gestion des Documents
          </h1>
          <p className="text-gray-600">
            {userProfile?.role === 'teacher' ?'Gérez et partagez vos documents pédagogiques'
              : userProfile?.role === 'student' ?'Accédez aux documents de vos cours' :'Consultez les documents partagés'
            }
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveView('documents')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeView === 'documents'
                    ? 'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📄 Documents
              </button>
              
              {userProfile?.role === 'teacher' && (
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
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {activeView === 'documents' && (
            <>
              {/* File Upload Section (Teachers only) */}
              {userProfile?.role === 'teacher' && (
                <FileUploadSection 
                  onUpload={handleFileUpload}
                  uploading={uploading}
                  teacherAssignments={teacherAssignments}
                />
              )}

              {/* Document Filters */}
              <DocumentFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                userRole={userProfile?.role}
              />

              {/* Documents Grid */}
              <DocumentGrid
                documents={filteredDocuments}
                onDelete={handleDocumentDelete}
                onDownload={handleDocumentDownload}
                userRole={userProfile?.role}
                loading={loading}
              />
            </>
          )}

          {activeView === 'assignments' && userProfile?.role === 'teacher' && (
            <TeacherAssignments
              assignments={teacherAssignments}
              onAssignmentsUpdate={loadInitialData}
            />
          )}

          {activeView === 'stats' && userProfile?.role === 'teacher' && (
            <DocumentStats
              stats={stats}
              documents={documents}
            />
          )}
        </div>

        {/* Access Control Info */}
        <AccessControlPanel userRole={userProfile?.role} />
      </div>
    </div>
  );
};

export default DocumentManagementHub;