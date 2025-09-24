import React, { useState, useEffect } from 'react';
import { Download, Eye, FileText, Search, Filter, Calendar, User, Tag, BookOpen, FolderOpen } from 'lucide-react';
import { teacherService } from '../../../services/teacherService';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

const StudentDocumentViewer = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [error, setError] = useState('');

  const documentCategories = teacherService?.getDocumentCategories();
  const subjects = teacherService?.getAvailableSubjects();

  useEffect(() => {
    if (user?.role === 'student') {
      loadStudentDocuments();
    }
  }, [user]);

  const loadStudentDocuments = async () => {
    setLoading(true);
    try {
      // First, get student data to find their current class
      const { data: studentInfo, error: studentError } = await supabase?.from('students')?.select('*')?.eq('user_id', user?.id)?.single();

      if (studentError) {
        setError('Impossible de récupérer vos informations d\'étudiant');
        return;
      }

      setStudentData(studentInfo);

      if (!studentInfo?.current_class) {
        setError('Aucune classe assignée. Contactez votre secrétariat.');
        return;
      }

      // Load documents for student's class
      const result = await teacherService?.getStudentDocuments(studentInfo?.current_class);
      
      if (result?.success) {
        setDocuments(result?.data || []);
      } else {
        setError('Erreur lors du chargement des documents');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (document) => {
    try {
      const result = await teacherService?.getDocumentSignedUrl(document?.file_path);
      
      if (result?.success) {
        // Open document in new tab
        window.open(result?.url, '_blank');
        
        // Log the access
        if (studentData?.id) {
          teacherService?.logDocumentAccess(document?.id, studentData?.id, 'view');
        }
      } else {
        setError('Impossible d\'accéder au document');
      }
    } catch (error) {
      setError('Erreur lors de l\'accès au document');
    }
  };

  const handleDownloadDocument = async (document) => {
    try {
      const result = await teacherService?.getDocumentSignedUrl(document?.file_path);
      
      if (result?.success) {
        // Create download link
        const link = window.document.createElement('a');
        link.href = result?.url;
        link.download = document?.file_name || 'document';
        window.document.body.appendChild(link);
        link?.click();
        window.document.body.removeChild(link);
        
        // Log the access
        if (studentData?.id) {
          teacherService?.logDocumentAccess(document?.id, studentData?.id, 'download');
        }
      } else {
        setError('Impossible de télécharger le document');
      }
    } catch (error) {
      setError('Erreur lors du téléchargement du document');
    }
  };

  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc?.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      doc?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      doc?.teacher?.full_name?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    const matchesSubject = !filterSubject || doc?.subject === filterSubject;
    const matchesCategory = !filterCategory || doc?.category === filterCategory;
    
    return matchesSearch && matchesSubject && matchesCategory;
  }) || [];

  const getDocumentsBySubject = () => {
    const grouped = {};
    filteredDocuments?.forEach(doc => {
      if (!grouped?.[doc?.subject]) {
        grouped[doc.subject] = [];
      }
      grouped?.[doc?.subject]?.push(doc);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
              Documents de Classe
            </h2>
            <p className="text-gray-600 mt-1">
              {studentData?.current_class ? (
                <>Documents disponibles pour la classe <strong>{studentData?.current_class}</strong></>
              ) : (
                'Vos documents de cours'
              )}
            </p>
          </div>
          
          {studentData?.current_class && (
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <div className="text-sm font-medium text-blue-900">
                Classe: {studentData?.current_class}
              </div>
              <div className="text-xs text-blue-700">
                {documents?.length || 0} document(s) disponible(s)
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

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

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e?.target?.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toutes catégories</option>
            {documentCategories?.map(cat => (
              <option key={cat?.value} value={cat?.value}>{cat?.label}</option>
            ))}
          </select>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>{filteredDocuments?.length || 0} document(s)</span>
          </div>
        </div>
      </div>
      {/* Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {/* Documents by Subject */}
      {Object.entries(getDocumentsBySubject())?.map(([subject, docs]) => (
        <div key={subject} className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FolderOpen className="w-5 h-5 mr-2 text-blue-600" />
              {subject}
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {docs?.length} document(s)
              </span>
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs?.map((document) => (
                <div key={document?.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                  {/* Document Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm leading-tight">
                          {document?.title || 'Document sans titre'}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {document?.file_name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={() => handleViewDocument(document)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="Visualiser"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(document)}
                        className="text-gray-600 hover:text-blue-600 p-1 rounded"
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Document Info */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <Tag className="w-3 h-3 mr-1" />
                        {documentCategories?.find(c => c?.value === document?.category)?.label || document?.category}
                      </span>
                      {document?.is_public_to_parents && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          Visible parents
                        </span>
                      )}
                    </div>

                    {document?.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {document?.description}
                      </p>
                    )}
                  </div>

                  {/* Document Footer */}
                  <div className="space-y-2 pt-3 border-t border-gray-200">
                    <div className="flex items-center text-xs text-gray-500">
                      <User className="w-3 h-3 mr-1" />
                      <span>{document?.teacher?.full_name || 'Enseignant inconnu'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>
                          {document?.uploaded_at ? new Date(document.uploaded_at)?.toLocaleDateString('fr-FR') : 'Date inconnue'}
                        </span>
                      </div>
                      <span>
                        {document?.file_size ? `${Math.round(document?.file_size / 1024)} KB` : 'Taille inconnue'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      {/* Empty State */}
      {filteredDocuments?.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterSubject || filterCategory 
              ? 'Aucun document trouvé'
              : 'Aucun document disponible'
            }
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterSubject || filterCategory
              ? 'Aucun document ne correspond aux filtres sélectionnés'
              : studentData?.current_class 
                ? `Aucun document n'a encore été partagé pour la classe ${studentData?.current_class}`
                : 'Vos enseignants n\'ont pas encore ajouté de documents'
            }
          </p>
        </div>
      )}
      {/* Access Note */}
      {!error && studentData?.current_class && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          <div className="flex items-start">
            <FileText className="w-5 h-5 mr-2 mt-0.5 text-blue-500" />
            <div>
              <p className="text-sm font-medium mb-1">Accès aux documents</p>
              <p className="text-xs">
                Vous ne pouvez consulter que les documents de votre classe ({studentData?.current_class}). 
                Tous les accès sont enregistrés pour le suivi pédagogique.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDocumentViewer;