import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import { documentService } from '../../../services/documentService';

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
    { value: 'private', label: 'Privé (moi seul)', icon: 'Lock', description: 'Visible uniquement par vous' },
    { value: 'students', label: 'Élèves seulement', icon: 'UserCheck', description: 'Visible par les élèves de la classe' },
    { value: 'students_parents', label: 'Élèves et Parents', icon: 'Users', description: 'Visible par les élèves ET leurs parents' }
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

  // Utilitaire pour trouver la taille du fichier dans tous les cas
  const getFileSize = (doc) => {
    return doc?.file_size ?? doc?.fileSize ?? null;
  };

  const formatFileSize = (sizeInBytes) => {
    if (!sizeInBytes || isNaN(sizeInBytes)) return 'Non renseigné';
    const size = Number(sizeInBytes);
    if (size < 1024) return `${size} o`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Utilitaire pour trouver la date dans tous les cas
  const getDate = (doc) => {
    return doc?.created_at ?? doc?.upload_date ?? doc?.uploadDate ?? null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non renseigné';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Non renseigné';
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
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
    const files = Array.from(e?.dataTransfer?.files || []);
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e?.target?.files?.[0];
    console.log('handleFileChange called, file:', f);
    if (f) setSelectedFile(f);
  };

  const handleUploadSubmit = async (e) => {
    e?.preventDefault();
    if (!selectedFile) return alert('Veuillez sélectionner un fichier à télécharger.');
    if (!uploadForm?.title || !uploadForm?.type) return alert('Veuillez renseigner le titre et le type du document.');

    setUploading(true);
    try {
      const documentData = {
        title: uploadForm?.title,
        description: uploadForm?.description,
        document_type: uploadForm?.type,
        class_name: classData?.name || classData?.id,
        class_id: classData?.id, // ID de la classe cible pour les permissions
        visibility: uploadForm?.visibility, // 'students', 'students_parents', ou 'private'
        subject: uploadForm?.type || classData?.name
      };

      const { data, error } = await documentService.uploadTeacherDocument(documentData, selectedFile);
      if (error) {
        console.error('Upload error:', error);
        const msg = typeof error === 'string' ? error : (error?.message || 'erreur inconnue');
        setUploadError(msg);
        alert('Erreur lors du téléchargement : ' + msg);
      } else {
        setUploadError(null);
        alert('Document téléchargé avec succès!');
        // Optionally refresh the page or invoke a parent refresh
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert('Erreur inattendue lors du téléchargement.');
    } finally {
      setUploading(false);
      setUploadForm({ title: '', type: '', visibility: 'students', description: '' });
      setSelectedFile(null);
      setShowUploadForm(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;
    try {
      const { data, error } = await documentService.deleteDocument(docId);
      if (error) {
        alert('Erreur lors de la suppression : ' + error);
      } else {
        alert('Document supprimé !');
        window.location.reload();
      }
    } catch (e) {
      alert('Erreur inattendue lors de la suppression.');
    }
  };

  const handleDownloadDocument = async (docId) => {
    try {
      const { data, error } = await documentService.downloadDocument(docId, 'download');
      if (error || !data?.url) {
        alert('Erreur lors du téléchargement : ' + (error || 'URL manquante'));
        return;
      }
      window.open(data.url, '_blank');
    } catch (e) {
      alert('Erreur inattendue lors du téléchargement.');
    }
  };

  const handleViewDocument = async (docId) => {
    try {
      const { data, error } = await documentService.downloadDocument(docId, 'view');
      if (error || !data?.url) {
        alert('Erreur lors de l\'ouverture : ' + (error || 'URL manquante'));
        return;
      }
      window.open(data.url, '_blank');
    } catch (e) {
      alert('Erreur inattendue lors de l\'ouverture.');
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
      {uploadError && (
        <div className="mt-4 p-3 border rounded-lg bg-error/5 border-error text-error">
          <div className="font-body font-body-semibold">Erreur de stockage : {uploadError}</div>
          <div className="text-sm mt-1">Vérifiez que le bucket nommé <strong>documents</strong> existe dans votre projet Supabase (Dashboard → Storage → Buckets).</div>
          <div className="text-sm mt-1">Si le bucket porte un autre nom, mettez à jour la variable dans <strong>src/services/documentService.js</strong> (ligne d'appel à <code>supabase.storage.from('documents')</code>).</div>
          <div className="text-sm mt-1">Documentation Supabase Storage: <a className="underline" href="https://supabase.com/docs/guides/storage" target="_blank" rel="noreferrer">https://supabase.com/docs/guides/storage</a></div>
        </div>
      )}
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
              onClick={() => {
                console.log('Drop zone clicked - opening file picker');
                fileInputRef.current?.click();
              }}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { fileInputRef.current?.click(); } }}
              role="button"
              aria-label="Zone de dépôt ou ouvrir le sélecteur de fichiers"
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <Icon name="Upload" size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="font-body font-body-normal text-sm text-muted-foreground mb-2">
                Glissez-déposez votre fichier ici ou
              </p>
              <label
                className="inline-block px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
                Parcourir les fichiers
              </label>
              {selectedFile ? (
                <div className="mt-2 text-sm text-muted-foreground">Fichier sélectionné: {selectedFile?.name} — {(selectedFile?.size/1024)?.toFixed(0)} KB</div>
              ) : (
                <div className="mt-2 text-sm text-muted-foreground">Aucun fichier sélectionné</div>
              )}
              <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-2">
                PDF, Word, PowerPoint, Images (max 10MB)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className={`flex-1 bg-primary text-white font-body font-body-semibold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors ${(!selectedFile || uploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {uploading ? 'Téléchargement...' : 'Télécharger le Document'}
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
          const typeConfig = getTypeConfig(doc?.type || doc?.document_type);
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
                        onClick={() => handleDownloadDocument(doc?.id)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Télécharger"
                      >
                        <Icon name="Download" size={16} />
                      </button>
                      <button
                        onClick={() => handleViewDocument(doc?.id)}
                        className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                        title="Visualiser"
                      >
                        <Icon name="Eye" size={16} />
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
                    {/* Badge de visibilité / permissions */}
                    <span className={`px-2 py-1 rounded text-xs font-caption font-caption-semibold flex items-center gap-1 ${
                      doc?.visibility === 'school' || doc?.is_public 
                        ? 'bg-success/10 text-success' 
                        : doc?.visibility === 'private' 
                          ? 'bg-warning/10 text-warning'
                          : 'bg-primary/10 text-primary'
                    }`}>
                      <Icon name={doc?.visibility === 'private' ? 'Lock' : doc?.is_public ? 'Users' : 'UserCheck'} size={12} />
                      {doc?.visibility === 'school' || doc?.is_public 
                        ? 'Élèves + Parents' 
                        : doc?.visibility === 'private'
                          ? 'Privé (vous seul)'
                          : 'Élèves seulement'}
                    </span>
                    {/* Badge auteur */}
                    {doc?.uploader?.full_name && (
                      <span className="px-2 py-1 rounded text-xs font-caption font-caption-normal bg-muted/20 text-muted-foreground flex items-center gap-1">
                        <Icon name="User" size={12} />
                        Par {doc?.uploader?.full_name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {getFileIcon(doc?.file_name || doc?.title)}
                        {formatFileSize(getFileSize(doc))}
                      </span>
                      {/*
                      <span className="flex items-center gap-1">
                        <Icon name="Download" size={14} />
                        {doc?.downloads} téléchargements
                      </span>
                      */}
                    </div>
                    <span className="font-caption font-caption-normal text-muted-foreground">
                      {formatDate(getDate(doc))}
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
            {(() => {
              const totalBytes = documents?.reduce((total, doc) => total + (parseFloat(doc?.file_size ?? doc?.fileSize ?? 0) || 0), 0);
              return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB utilisés sur 500 MB`;
            })()}
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