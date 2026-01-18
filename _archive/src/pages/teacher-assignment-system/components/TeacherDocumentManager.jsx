import React, { useState, useEffect } from 'react';
import { Upload, FileText, Download, Trash2, Filter, Search, FolderOpen, Calendar, Tag } from 'lucide-react';
import { teacherService } from '../../../services/teacherService';
import { useAuth } from '../../../contexts/AuthContext';

const TeacherDocumentManager = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    class_name: '',
    subject: '',
    category: 'cours',
    is_public_to_parents: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const documentCategories = teacherService?.getDocumentCategories();

  useEffect(() => {
    if (user?.role === 'teacher') {
      loadTeacherData();
    }
  }, [user]);

  const loadTeacherData = async () => {
    setLoading(true);
    try {
      const [documentsResult, assignmentsResult] = await Promise.all([
        teacherService?.getTeacherDocuments(user?.id),
        teacherService?.getTeacherAssignments(user?.id, user?.current_school_id)
      ]);

      if (documentsResult?.success) {
        setDocuments(documentsResult?.data || []);
      }
      if (assignmentsResult?.success) {
        setAssignments(assignmentsResult?.data || []);
      }
    } catch (error) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      // Check file size (50MB limit)
      if (file?.size > 52428800) {
        setError('Le fichier est trop volumineux (max 50MB)');
        return;
      }
      
      setSelectedFile(file);
      // Auto-fill title from filename
      setUploadData(prev => ({
        ...prev,
        title: prev?.title || file?.name?.split('.')?.[0]
      }));
    }
  };

  const handleUploadDocument = async (e) => {
    e?.preventDefault();
    if (!selectedFile) return;

    setUploadLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create folder path based on class and subject
      const folderPath = `${uploadData?.class_name?.toLowerCase()}/${uploadData?.subject?.toLowerCase()?.replace(/[^a-z0-9]/g, '-')}`;
      
      // Upload file to storage
      const uploadResult = await teacherService?.uploadDocument(selectedFile, user?.id, folderPath);
      
      if (!uploadResult?.success) {
        throw new Error(uploadResult.error);
      }

      // Create document record
      const documentData = {
        teacher_id: user?.id,
        school_id: user?.current_school_id,
        title: uploadData?.title,
        description: uploadData?.description,
        file_path: uploadResult?.data?.fullPath,
        file_name: selectedFile?.name,
        file_size: selectedFile?.size,
        mime_type: selectedFile?.type,
        category: uploadData?.category,
        class_name: uploadData?.class_name,
        subject: uploadData?.subject,
        is_public_to_parents: uploadData?.is_public_to_parents
      };

      const createResult = await teacherService?.createDocument(documentData);
      
      if (createResult?.success) {
        setSuccess('Document ajouté avec succès');
        setShowUploadModal(false);
        resetUploadForm();
        loadTeacherData();
      } else {
        throw new Error(createResult.error);
      }
    } catch (error) {
      setError(error?.message || 'Erreur lors de l\'ajout du document');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteDocument = async (document) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${document?.title}" ?`)) {
      return;
    }

    try {
      const result = await teacherService?.deleteDocument(document?.id, document?.file_path);
      
      if (result?.success) {
        setSuccess('Document supprimé avec succès');
        loadTeacherData();
      } else {
        setError(result?.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      setError('Erreur lors de la suppression du document');
    }
  };

  const handleDownloadDocument = async (document) => {
    try {
      const result = await teacherService?.getDocumentSignedUrl(document?.file_path);
      
      if (result?.success) {
        // Open in new tab for download
        window.open(result?.url, '_blank');
        
        // Log the access if it's a student viewing
        if (user?.role === 'student') {
          // ... Remove this block - getStudentData is not defined ... //
        }
      } else {
        setError('Impossible d\'accéder au document');
      }
    } catch (error) {
      setError('Erreur lors de l\'accès au document');
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setUploadData({
      title: '',
      description: '',
      class_name: '',
      subject: '',
      category: 'cours',
      is_public_to_parents: false
    });
  };

  const getAvailableClassesForTeacher = () => {
    return [...new Set(assignments?.map(a => a?.class_name) || [])];
  };

  const getAvailableSubjectsForClass = (className) => {
    return assignments?.filter(a => a?.class_name === className)?.map(a => a?.subject) || [];
  };

  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc?.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      doc?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    const matchesClass = !filterClass || doc?.class_name === filterClass;
    const matchesSubject = !filterSubject || doc?.subject === filterSubject;
    const matchesCategory = !filterCategory || doc?.category === filterCategory;
    
    return matchesSearch && matchesClass && matchesSubject && matchesCategory;
  }) || [];

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
              <FolderOpen className="w-6 h-6 mr-2 text-blue-600" />
              Mes Documents de Classe
            </h2>
            <p className="text-gray-600 mt-1">
              Gérez vos documents pédagogiques par classe et matière
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            disabled={assignments?.length === 0}
          >
            <Upload className="w-4 h-4" />
            <span>Ajouter Document</span>
          </button>
        </div>

        {assignments?.length === 0 && (
          <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg">
            Aucune affectation de classe trouvée. Contactez votre directeur pour obtenir vos affectations.
          </div>
        )}

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
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
            value={filterClass}
            onChange={(e) => setFilterClass(e?.target?.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toutes les classes</option>
            {getAvailableClassesForTeacher()?.map(className => (
              <option key={className} value={className}>{className}</option>
            ))}
          </select>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e?.target?.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toutes les matières</option>
            {teacherService?.getAvailableSubjects()?.map(subject => (
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
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments?.map((document) => (
          <div key={document?.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Document Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 leading-tight">
                      {document?.title || 'Document sans titre'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {document?.file_name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownloadDocument(document)}
                    className="text-gray-400 hover:text-blue-600 p-1 rounded"
                    title="Télécharger"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(document)}
                    className="text-gray-400 hover:text-red-600 p-1 rounded"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Document Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {document?.class_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {document?.subject}
                  </span>
                </div>
                
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
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {document?.description}
                  </p>
                )}
              </div>

              {/* Document Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>
                    {document?.uploaded_at ? new Date(document.uploaded_at)?.toLocaleDateString('fr-FR') : 'Date inconnue'}
                  </span>
                </div>
                <div className="text-right">
                  <span>
                    {document?.file_size ? `${Math.round(document?.file_size / 1024)} KB` : 'Taille inconnue'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredDocuments?.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterClass || filterSubject || filterCategory 
              ? 'Aucun document trouvé'
              : 'Aucun document ajouté'
            }
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterClass || filterSubject || filterCategory
              ? 'Aucun document ne correspond aux filtres sélectionnés'
              : 'Commencez par ajouter vos premiers documents de classe'
            }
          </p>
          {assignments?.length > 0 && !searchTerm && !filterClass && !filterSubject && !filterCategory && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ajouter un document
            </button>
          )}
        </div>
      )}
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Ajouter un Document
              </h2>
              
              <form onSubmit={handleUploadDocument} className="space-y-4">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fichier *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.txt"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        {selectedFile ? selectedFile?.name : 'Cliquez pour sélectionner un fichier'}
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, Word, PowerPoint, Images (max 50MB)
                      </p>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Classe *
                    </label>
                    <select
                      required
                      value={uploadData?.class_name}
                      onChange={(e) => setUploadData({ ...uploadData, class_name: e?.target?.value, subject: '' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner une classe</option>
                      {getAvailableClassesForTeacher()?.map(className => (
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
                      value={uploadData?.subject}
                      onChange={(e) => setUploadData({ ...uploadData, subject: e?.target?.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!uploadData?.class_name}
                    >
                      <option value="">Sélectionner une matière</option>
                      {getAvailableSubjectsForClass(uploadData?.class_name)?.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre du document *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadData?.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e?.target?.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Cours sur les fractions"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    required
                    value={uploadData?.category}
                    onChange={(e) => setUploadData({ ...uploadData, category: e?.target?.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {documentCategories?.map(category => (
                      <option key={category?.value} value={category?.value}>
                        {category?.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optionnel)
                  </label>
                  <textarea
                    rows="3"
                    value={uploadData?.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e?.target?.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Décrivez brièvement le contenu du document..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="public-to-parents"
                    checked={uploadData?.is_public_to_parents}
                    onChange={(e) => setUploadData({ ...uploadData, is_public_to_parents: e?.target?.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="public-to-parents" className="ml-2 block text-sm text-gray-900">
                    Autoriser l'accès aux parents
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      resetUploadForm();
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedFile || uploadLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Ajout en cours...
                      </div>
                    ) : (
                      'Ajouter le Document'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDocumentManager;