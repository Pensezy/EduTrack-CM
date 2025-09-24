import React, { useState } from 'react';

const DocumentGrid = ({ documents, onDelete, onDownload, userRole, loading }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const getDocumentIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('word')) return '📝';
    if (mimeType?.includes('powerpoint') || mimeType?.includes('presentation')) return '📊';
    if (mimeType?.includes('image')) return '🖼️';
    return '📋';
  };

  const getDocumentTypeLabel = (type) => {
    const types = {
      assignment: 'Devoir',
      lesson: 'Cours',
      exam: 'Examen',
      resource: 'Ressource',
      announcement: 'Annonce',
      other: 'Autre'
    };
    return types?.[type] || type;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i))?.toFixed(2)} ${sizes?.[i]}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async (documentId) => {
    setActionLoading(documentId);
    try {
      const result = await onDownload(documentId);
      if (!result?.success) {
        alert(result?.message || 'Erreur lors du téléchargement');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (documentId) => {
    setActionLoading(documentId);
    try {
      const result = await onDelete(documentId);
      if (result?.success) {
        setDeleteConfirm(null);
      } else {
        alert(result?.message || 'Erreur lors de la suppression');
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6]?.map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!documents?.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="text-6xl text-gray-400 mb-4">📂</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun document trouvé
          </h3>
          <p className="text-gray-600">
            {userRole === 'teacher' ?'Commencez par télécharger votre premier document.' :'Aucun document n\'est disponible pour le moment.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        📚 Documents ({documents?.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents?.map((document) => (
          <div
            key={document?.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* Document Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">
                  {getDocumentIcon(document?.mime_type)}
                </span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {getDocumentTypeLabel(document?.document_type)}
                </span>
              </div>
              
              {document?.is_public && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  Public
                </span>
              )}
            </div>

            {/* Document Title */}
            <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
              {document?.title}
            </h3>

            {/* Document Details */}
            <div className="space-y-1 text-sm text-gray-600 mb-3">
              <div className="flex items-center space-x-2">
                <span>🏫</span>
                <span>{document?.class_name}</span>
                <span>•</span>
                <span>{document?.subject}</span>
              </div>
              
              {document?.uploader?.full_name && (
                <div className="flex items-center space-x-2">
                  <span>👨‍🏫</span>
                  <span>{document?.uploader?.full_name}</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <span>📅</span>
                <span>{formatDate(document?.created_at)}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span>💾</span>
                <span>{formatFileSize(document?.file_size)}</span>
              </div>
            </div>

            {/* Description */}
            {document?.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {document?.description}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                onClick={() => handleDownload(document?.id)}
                disabled={actionLoading === document?.id}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
              >
                {actionLoading === document?.id ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Téléchargement...</span>
                  </>
                ) : (
                  <>
                    <span>📥</span>
                    <span>Télécharger</span>
                  </>
                )}
              </button>

              {/* Delete button for teachers on their own documents */}
              {userRole === 'teacher' && document?.uploaded_by && (
                <button
                  onClick={() => setDeleteConfirm(document?.id)}
                  disabled={actionLoading === document?.id}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                >
                  <span>🗑️</span>
                  <span>Supprimer</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={actionLoading === deleteConfirm}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                {actionLoading === deleteConfirm ? 'Suppression...' : 'Supprimer'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={actionLoading === deleteConfirm}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 disabled:opacity-50 font-medium"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentGrid;