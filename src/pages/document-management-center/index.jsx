import { documentService } from '../../services/documentService';

const DocumentManagementCenter = () => {

  const { user, userProfile } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filters, setFilters] = useState({
    class_name: '',
    subject: '',
    search: '',
    uploaded_by: ''
  });
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    subject: '',
    class_name: '',
    description: '',
    visibility: 'student'
  });

  // Fetch documents, classes, subjects
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const { data: docs } = await documentService.getDocuments();
      setDocuments(docs || []);
      const { data: classSubj } = await documentService.getClassesAndSubjects();
      setClasses(classSubj?.classes || []);
      setSubjects(classSubj?.subjects || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  // Filter documents based on filters (role-based filtering can be added as needed)
  const filteredDocuments = documents?.filter(doc => {
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
    // TODO: Gérer l'upload de fichier réel si besoin
    const { data, error } = await documentService.uploadDocument(uploadData, null);
    if (!error && data) {
      setDocuments(prev => [data, ...prev]);
      setUploadData({
        title: '',
        subject: '',
        class_name: '',
        description: '',
        visibility: 'student'
      });
      setShowUploadForm(false);
    }
    setUploading(false);
  };

  const handleDownload = (document) => {
    // Simulate download
    console.log('Downloading:', document?.title);
    // In real implementation, this would trigger actual download
    alert(`Téléchargement de "${document?.title}" en cours...`);
  };

  const handleView = (document) => {
    // Simulate document preview
    console.log('Viewing:', document?.title);
    alert(`Prévisualisation de "${document?.title}"`);
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

  if (loading) {
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
            {userProfile?.role === 'teacher' ?'Uploadez et gérez vos documents pédagogiques'
              : userProfile?.role === 'student' ?'Accédez aux documents de vos cours'
              : userProfile?.role === 'parent' ?'Consultez les documents de vos enfants' :'Gérez les documents du système'}
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
                        {subjects?.map(subject => (
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
                        {classes?.map(className => (
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
                {classes?.map(className => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
              
              <select
                value={filters?.subject}
                onChange={(e) => setFilters(prev => ({ ...prev, subject: e?.target?.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toutes les matières</option>
                {subjects?.map(subject => (
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
                Accès basé sur votre rôle: {userProfile?.role || 'Visiteur'}
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

        {/* Access Control Information */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h4 className="text-lg font-medium text-blue-900 mb-3">Contrôle d'accès basé sur les rôles</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-blue-800 mb-2">👨‍🏫 Enseignants</h5>
              <p className="text-blue-700">Peuvent uploader des documents pour leurs classes assignées</p>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 mb-2">👨‍🎓 Étudiants</h5>
              <p className="text-blue-700">Voient les documents de leurs classes et ceux qui leur sont destinés</p>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 mb-2">👨‍👩‍👧‍👦 Parents</h5>
              <p className="text-blue-700">Accèdent aux documents de leurs enfants et communications</p>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 mb-2">👨‍💼 Admin</h5>
              <p className="text-blue-700">Accès complet à tous les documents du système</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentManagementCenter;