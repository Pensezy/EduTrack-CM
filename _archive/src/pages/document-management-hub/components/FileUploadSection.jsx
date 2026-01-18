import React, { useState, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

const FileUploadSection = ({ onUpload, uploading, teacherAssignments }) => {
  const { userProfile } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    class_name: '',
    subject: '',
    document_type: 'resource',
    is_public: false
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef(null);

  const documentTypes = [
    { value: 'assignment', label: 'Devoir' },
    { value: 'lesson', label: 'Cours' },
    { value: 'exam', label: 'Examen' },
    { value: 'resource', label: 'Ressource' },
    { value: 'announcement', label: 'Annonce' },
    { value: 'other', label: 'Autre' }
  ];

  const allowedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp'
  ];

  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === "dragenter" || e?.type === "dragover") {
      setDragActive(true);
    } else if (e?.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);

    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFileSelect(e?.dataTransfer?.files?.[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!allowedFileTypes?.includes(file?.type)) {
      setUploadMessage('Type de fichier non autorisé. Formats acceptés: PDF, Word, PowerPoint, Images.');
      return;
    }

    // Validate file size
    if (file?.size > maxFileSize) {
      setUploadMessage('Le fichier est trop volumineux. Taille maximale: 50MB.');
      return;
    }

    setSelectedFile(file);
    setUploadMessage('');

    // Auto-fill title if not set
    if (!uploadForm?.title) {
      const fileName = file?.name?.split('.')?.[0];
      setUploadForm(prev => ({
        ...prev,
        title: fileName?.replace(/_/g, ' ')
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setUploadForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!selectedFile) {
      setUploadMessage('Veuillez sélectionner un fichier.');
      return;
    }

    if (!uploadForm?.title?.trim()) {
      setUploadMessage('Le titre est requis.');
      return;
    }

    if (!uploadForm?.class_name || !uploadForm?.subject) {
      setUploadMessage('Veuillez sélectionner une classe et une matière.');
      return;
    }

    // Get school_id from user profile or first assignment
    const schoolId = userProfile?.current_school_id || teacherAssignments?.[0]?.school?.id;
    if (!schoolId) {
      setUploadMessage('Impossible de déterminer l\'école. Contactez l\'administrateur.');
      return;
    }

    const documentData = {
      ...uploadForm,
      school_id: schoolId
    };

    const result = await onUpload({ documentData, file: selectedFile });
    
    if (result?.success) {
      // Reset form
      setUploadForm({
        title: '',
        description: '',
        class_name: '',
        subject: '',
        document_type: 'resource',
        is_public: false
      });
      setSelectedFile(null);
      setUploadMessage('Document téléchargé avec succès!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setUploadMessage(''), 3000);
    } else {
      setUploadMessage(result?.message || 'Erreur lors du téléchargement.');
    }
  };

  const triggerFileSelect = () => {
    fileInputRef?.current?.click();
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setUploadMessage('');
  };

  // Get unique classes and subjects from assignments
  const availableClasses = [...new Set(teacherAssignments?.map(a => a.class_name) || [])];
  const availableSubjects = [...new Set(teacherAssignments?.map(a => a.subject) || [])];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        📁 Télécharger un Document
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50' :'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl">📄</span>
                <span className="font-medium text-gray-900">{selectedFile?.name}</span>
              </div>
              <p className="text-sm text-gray-600">
                {(selectedFile?.size / 1024 / 1024)?.toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={removeSelectedFile}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                ❌ Retirer le fichier
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-4xl text-gray-400">📁</div>
              <p className="text-lg font-medium text-gray-700">
                Glissez-déposez votre fichier ici
              </p>
              <p className="text-sm text-gray-500">ou</p>
              <button
                type="button"
                onClick={triggerFileSelect}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Parcourir les fichiers
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Formats acceptés: PDF, Word, PowerPoint, Images • Max: 50MB
              </p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFileSelect(e?.target?.files?.[0])}
          accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
        />

        {/* Document Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre *
            </label>
            <input
              type="text"
              name="title"
              value={uploadForm?.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nom du document"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de document
            </label>
            <select
              name="document_type"
              value={uploadForm?.document_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {documentTypes?.map(type => (
                <option key={type?.value} value={type?.value}>
                  {type?.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Classe *
            </label>
            <select
              name="class_name"
              value={uploadForm?.class_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner une classe</option>
              {availableClasses?.map(className => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Matière *
            </label>
            <select
              name="subject"
              value={uploadForm?.subject}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner une matière</option>
              {availableSubjects?.map(subject => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={uploadForm?.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Description du document (optionnel)"
          />
        </div>

        {/* Options */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="is_public"
              checked={uploadForm?.is_public}
              onChange={handleInputChange}
              className="form-checkbox text-blue-600"
            />
            <span className="text-sm text-gray-700">
              Document visible publiquement
            </span>
          </label>
        </div>

        {/* Upload Message */}
        {uploadMessage && (
          <div className={`p-3 rounded-md ${
            uploadMessage?.includes('succès')
              ? 'bg-green-100 text-green-700' :'bg-red-100 text-red-700'
          }`}>
            {uploadMessage}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              uploading || !selectedFile
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {uploading ? '⏳ Téléchargement...' : '📤 Télécharger le document'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FileUploadSection;