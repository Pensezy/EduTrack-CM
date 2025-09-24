import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const DocumentManager = ({ classData, documents }) => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: '',
    visibility: 'students',
    description: ''
  });
  const [dragOver, setDragOver] = useState(false);

  const documentTypes = [
    { value: 'course', label: 'Cours', icon: 'BookOpen', color: 'text-primary' },
    { value: 'exercise', label: 'Exercices', icon: 'Edit', color: 'text-success' },
    { value: 'correction', label: 'Corrigé', icon: 'CheckCircle', color: 'text-warning' },
    { value: 'evaluation', label: 'Évaluation', icon: 'FileText', color: 'text-error' },
    { value: 'resource', label: 'Ressource', icon: 'Folder', color: 'text-accent-foreground' }
  ];

  const visibilityOptions = [
    { value: 'students', label: 'Élèves seulement', icon: 'Users', description: 'Visible par les élèves uniquement' },
    { value: 'students_parents', label: 'Élèves et Parents', icon: 'UserPlus', description: 'Visible par les élèves et leurs parents' }
  ];

  const getTypeConfig = (type) => {
    return documentTypes?.find(t => t?.value === type) || documentTypes?.[0];
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.')?.pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return <Icon name="File" size={16} className="text-error" />;
      case 'doc': case'docx': return <Icon name="FileText" size={16} className="text-primary" />;
      case 'ppt': case'pptx': return <Icon name="Presentation" size={16} className="text-warning" />;
      case 'jpg': case'jpeg': case'png': return <Icon name="Image" size={16} className="text-success" />;
      default: return <Icon name="File" size={16} className="text-muted-foreground" />;
    }
  };

  const formatFileSize = (sizeInMB) => {
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024)?.toFixed(0)} KB`;
    }
    return `${sizeInMB} MB`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setDragOver(false);
    const files = Array.from(e?.dataTransfer?.files);
    console.log('Files dropped:', files);
    // Handle file upload logic here
  };

  const handleUploadSubmit = (e) => {
    e?.preventDefault();
    console.log('Document upload:', uploadForm);
    
    // Reset form and close
    setUploadForm({
      title: '',
      type: '',
      visibility: 'students',
      description: ''
    });
    setShowUploadForm(false);
    
    alert('Document téléchargé avec succès!');
  };

  const handleDeleteDocument = (docId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      console.log('Deleting document:', docId);
      alert('Document supprimé!');
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-card border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-heading-semibold text-xl text-card-foreground">
          Documents - {classData?.name}
        </h3>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-2"
        >
          <Icon name="Upload" size={16} />
          <span className="font-caption font-caption-semibold text-sm">
            Télécharger
          </span>
        </button>
      </div>
      {/* Upload Form */}
      {showUploadForm && (
        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-body font-body-semibold text-sm text-card-foreground mb-2">
                  Titre du document *
                </label>
                <input
                  type="text"
                  value={uploadForm?.title}
                  onChange={(e) => setUploadForm({...uploadForm, title: e?.target?.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  placeholder="Chapitre 3 - Trigonométrie"
                  required
                />
              </div>
              
              <div>
                <label className="block font-body font-body-semibold text-sm text-card-foreground mb-2">
                  Type de document *
                </label>
                <select
                  value={uploadForm?.type}
                  onChange={(e) => setUploadForm({...uploadForm, type: e?.target?.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  required
                >
                  <option value="">Choisir le type</option>
                  {documentTypes?.map(type => (
                    <option key={type?.value} value={type?.value}>
                      {type?.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-body font-body-semibold text-sm text-card-foreground mb-2">
                Visibilité
              </label>
              <div className="space-y-2">
                {visibilityOptions?.map(option => (
                  <label key={option?.value} className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/20">
                    <input
                      type="radio"
                      name="visibility"
                      value={option?.value}
                      checked={uploadForm?.visibility === option?.value}
                      onChange={(e) => setUploadForm({...uploadForm, visibility: e?.target?.value})}
                      className="text-primary focus:ring-primary"
                    />
                    <Icon name={option?.icon} size={16} className="text-primary" />
                    <div>
                      <div className="font-body font-body-semibold text-sm text-card-foreground">
                        {option?.label}
                      </div>
                      <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                        {option?.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-body font-body-semibold text-sm text-card-foreground mb-2">
                Description
              </label>
              <textarea
                value={uploadForm?.description}
                onChange={(e) => setUploadForm({...uploadForm, description: e?.target?.value})}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background h-20 resize-none"
                placeholder="Description du contenu du document..."
              />
            </div>

            {/* File Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <Icon name="Upload" size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="font-body font-body-normal text-sm text-muted-foreground mb-2">
                Glissez-déposez votre fichier ici ou
              </p>
              <label className="inline-block px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg cursor-pointer transition-colors">
                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png" />
                Parcourir les fichiers
              </label>
              <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-2">
                PDF, Word, PowerPoint, Images (max 10MB)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 bg-primary text-white font-body font-body-semibold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Télécharger le Document
              </button>
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 border border-border text-muted-foreground hover:bg-muted/20 rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Documents List */}
      <div className="space-y-3">
        {documents?.map(doc => {
          const typeConfig = getTypeConfig(doc?.type);
          
          return (
            <div key={doc?.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon name={typeConfig?.icon} size={20} className={typeConfig?.color} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-heading font-heading-semibold text-lg text-card-foreground truncate">
                      {doc?.title}
                    </h4>
                    <div className="flex items-center gap-2 ml-3">
                      <button
                        onClick={() => console.log('Download document:', doc?.id)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Télécharger"
                      >
                        <Icon name="Download" size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc?.id)}
                        className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-caption font-caption-semibold bg-primary/10 ${typeConfig?.color}`}>
                      {typeConfig?.label}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-caption font-caption-semibold ${
                      doc?.visibility === 'students_parents' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                    }`}>
                      {doc?.visibility === 'students_parents' ? 'Élèves + Parents' : 'Élèves seulement'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {getFileIcon(doc?.title)}
                        {formatFileSize(doc?.fileSize)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Download" size={14} />
                        {doc?.downloads} téléchargements
                      </span>
                    </div>
                    <span className="font-caption font-caption-normal text-muted-foreground">
                      {formatDate(doc?.uploadDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {documents?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="font-body font-body-normal text-muted-foreground mb-2">
              Aucun document téléchargé pour cette classe
            </p>
            <p className="font-caption font-caption-normal text-sm text-muted-foreground">
              Cliquez sur "Télécharger" pour ajouter vos premiers documents
            </p>
          </div>
        )}
      </div>
      {/* Storage Info */}
      <div className="mt-6 p-3 bg-muted/10 rounded-lg border border-border">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="HardDrive" size={14} className="text-primary" />
          <span className="font-caption font-caption-semibold text-sm text-primary">
            Espace de stockage
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-caption font-caption-normal text-muted-foreground">
            {documents?.reduce((total, doc) => total + parseFloat(doc?.fileSize || 0), 0)?.toFixed(1)} MB utilisés sur 500 MB
          </span>
          <span className="font-caption font-caption-normal text-muted-foreground">
            {documents?.length} document{documents?.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DocumentManager;