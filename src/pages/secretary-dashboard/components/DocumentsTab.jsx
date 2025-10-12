import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const DocumentsTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [documentModalType, setDocumentModalType] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);

  // Chargement initial des données
  useEffect(() => {
    loadDocuments();
  }, []);

  const documentCategories = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'certificats', label: 'Certificats de scolarité' },
    { value: 'attestations', label: 'Attestations' },
    { value: 'bulletins', label: 'Bulletins scolaires' },
    { value: 'inscriptions', label: 'Dossiers d\'inscription' },
    { value: 'administratif', label: 'Documents administratifs' }
  ];

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'generated', label: 'Généré' },
    { value: 'printed', label: 'Imprimé' },
    { value: 'pending', label: 'En attente' },
    { value: 'incomplete', label: 'Incomplet' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'approved', label: 'Approuvé' }
  ];

  // Données de démonstration enrichies
  const loadDocuments = async () => {
    setLoading(true);
    
    // Simuler un appel API
    setTimeout(() => {
      const mockDocuments = [
        {
          id: 1,
          name: "Certificat de scolarité - Marie Dubois",
          type: "certificats",
          dateCreated: "15/11/2024",
          dateModified: "15/11/2024",
          status: "generated",
          studentName: "Marie Dubois",
          class: "CM2",
          format: "PDF",
          size: "145 KB",
          generatedBy: "secretary",
          printedCopies: 2,
          downloadCount: 5,
          urgency: "normal",
          validityPeriod: "1 an"
        },
        {
          id: 2,
          name: "Attestation d'assurance - Pierre Martin",
          type: "attestations",
          dateCreated: "14/11/2024",
          dateModified: "14/11/2024",
          status: "pending",
          studentName: "Pierre Martin",
          class: "CM1",
          format: "PDF",
          size: "167 KB",
          generatedBy: "secretary",
          printedCopies: 0,
          downloadCount: 1,
          urgency: "normal",
          validityPeriod: "1 année scolaire"
        },
        {
          id: 3,
          name: "Bulletin 1er trimestre - Lucas Bernard",
          type: "bulletins",
          dateCreated: "12/11/2024",
          dateModified: "13/11/2024",
          status: "printed",
          studentName: "Lucas Bernard",
          class: "CE2",
          format: "PDF",
          size: "298 KB",
          generatedBy: "teacher",
          approvedBy: "principal",
          printedCopies: 3,
          downloadCount: 2,
          urgency: "normal",
          validityPeriod: "permanent"
        },
        {
          id: 4,
          name: "Dossier inscription - Emma Rousseau",
          type: "inscriptions",
          dateCreated: "10/11/2024",
          dateModified: "12/11/2024",
          status: "incomplete",
          studentName: "Emma Rousseau",
          class: "CP",
          format: "DOSSIER",
          size: "2.3 MB",
          generatedBy: "secretary",
          printedCopies: 1,
          downloadCount: 0,
          urgency: "high",
          validityPeriod: "année scolaire"
        },
        {
          id: 5,
          name: "Règlement intérieur 2024-2025",
          type: "administratif",
          dateCreated: "01/09/2024",
          dateModified: "15/09/2024",
          status: "approved",
          studentName: "Document général",
          class: "Toutes classes",
          format: "PDF",
          size: "456 KB",
          generatedBy: "principal",
          approvedBy: "council",
          printedCopies: 150,
          downloadCount: 89,
          urgency: "normal",
          validityPeriod: "année scolaire"
        },
        {
          id: 6,
          name: "Convocation conseil de discipline - Thomas Durand",
          type: "administratif",
          dateCreated: "13/11/2024",
          dateModified: "13/11/2024",
          status: "urgent",
          studentName: "Thomas Durand",
          class: "CM1",
          format: "PDF",
          size: "123 KB",
          generatedBy: "principal",
          printedCopies: 1,
          downloadCount: 0,
          urgency: "urgent",
          validityPeriod: "date conseil"
        },
        {
          id: 7,
          name: "Autorisation sortie pédagogique - Classe CM2",
          type: "attestations",
          dateCreated: "08/11/2024",
          dateModified: "10/11/2024",
          status: "printed",
          studentName: "Classe CM2",
          class: "CM2",
          format: "PDF",
          size: "89 KB",
          generatedBy: "teacher",
          printedCopies: 24,
          downloadCount: 8,
          urgency: "high",
          validityPeriod: "date limite retour"
        },
        {
          id: 8,
          name: "Attestation de réussite - Léa Moreau",
          type: "attestations",
          dateCreated: "25/06/2024",
          dateModified: "25/06/2024",
          status: "generated",
          studentName: "Léa Moreau",
          class: "CM2",
          format: "PDF",
          size: "134 KB",
          generatedBy: "principal",
          printedCopies: 2,
          downloadCount: 3,
          urgency: "normal",
          validityPeriod: "permanent"
        }
      ];

      // Calculer les statistiques
      const stats = calculateStatistics(mockDocuments);
      
      setDocuments(mockDocuments);
      setStatistics(stats);
      setLoading(false);
    }, 800);
  };

  // Calculer les statistiques des documents
  const calculateStatistics = (docs) => {
    const today = new Date().toDateString();
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    return {
      total: docs.length,
      today: docs.filter(d => new Date(d.dateCreated).toDateString() === today).length,
      thisWeek: docs.filter(d => new Date(d.dateCreated) >= thisWeek).length,
      byStatus: {
        generated: docs.filter(d => d.status === 'generated').length,
        printed: docs.filter(d => d.status === 'printed').length,
        pending: docs.filter(d => d.status === 'pending').length,
        incomplete: docs.filter(d => d.status === 'incomplete').length,
        urgent: docs.filter(d => d.status === 'urgent').length,
        approved: docs.filter(d => d.status === 'approved').length
      },
      byType: {
        certificats: docs.filter(d => d.type === 'certificats').length,
        attestations: docs.filter(d => d.type === 'attestations').length,
        bulletins: docs.filter(d => d.type === 'bulletins').length,
        inscriptions: docs.filter(d => d.type === 'inscriptions').length,
        administratif: docs.filter(d => d.type === 'administratif').length
      },
      totalPrints: docs.reduce((sum, d) => sum + (d.printedCopies || 0), 0),
      totalDownloads: docs.reduce((sum, d) => sum + (d.downloadCount || 0), 0)
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'generated':
        return 'bg-success/10 text-success border-success/20';
      case 'printed':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'incomplete':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'generated':
        return 'Généré';
      case 'printed':
        return 'Imprimé';
      case 'pending':
        return 'En attente';
      case 'incomplete':
        return 'Incomplet';
      default:
        return 'Inconnu';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || doc.type === filterCategory;
    const matchesStatus = filterStatus === '' || doc.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleGenerateDocument = (type) => {
    setDocumentModalType(type);
    setShowDocumentModal(true);
  };

  const handlePrintDocument = async (documentId) => {
    const document = documents.find(d => d.id === documentId);
    if (document) {
      // Simuler l'impression
      const updatedDocs = documents.map(d => 
        d.id === documentId 
          ? { ...d, printedCopies: (d.printedCopies || 0) + 1, status: 'printed' }
          : d
      );
      setDocuments(updatedDocs);
      setStatistics(calculateStatistics(updatedDocs));
      
      // Notification
      alert(`✅ Document "${document.name}" envoyé à l'imprimante`);
    }
  };

  const handleDownloadDocument = async (documentId) => {
    const document = documents.find(d => d.id === documentId);
    if (document) {
      // Simuler le téléchargement
      const updatedDocs = documents.map(d => 
        d.id === documentId 
          ? { ...d, downloadCount: (d.downloadCount || 0) + 1 }
          : d
      );
      setDocuments(updatedDocs);
      setStatistics(calculateStatistics(updatedDocs));
      
      // Notification
      alert(`📥 Téléchargement de "${document.name}" démarré`);
    }
  };

  const handleValidateDocument = async (documentId) => {
    const document = documents.find(d => d.id === documentId);
    if (document) {
      const updatedDocs = documents.map(d => 
        d.id === documentId 
          ? { ...d, status: 'approved', approvedBy: 'secretary', approvedDate: new Date().toISOString().split('T')[0] }
          : d
      );
      setDocuments(updatedDocs);
      setStatistics(calculateStatistics(updatedDocs));
      
      alert(`✅ Document "${document.name}" validé avec succès`);
    }
  };

  const handleBatchPrint = () => {
    if (selectedDocuments.length === 0) {
      alert('⚠️ Sélectionnez au moins un document pour l\'impression en lot');
      return;
    }
    
    const updatedDocs = documents.map(d => 
      selectedDocuments.includes(d.id)
        ? { ...d, printedCopies: (d.printedCopies || 0) + 1, status: 'printed' }
        : d
    );
    setDocuments(updatedDocs);
    setStatistics(calculateStatistics(updatedDocs));
    setSelectedDocuments([]);
    
    alert(`✅ ${selectedDocuments.length} document(s) envoyé(s) à l'imprimante`);
  };

  const handleDocumentSelection = (documentId) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'normal':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'low':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="font-heading font-heading-bold text-2xl text-text-primary">
            Gestion des Documents
          </h2>
          <p className="font-body font-body-normal text-text-secondary mt-1">
            Génération, impression et gestion des documents administratifs
          </p>
          {statistics && (
            <div className="flex items-center space-x-4 mt-2 text-sm text-text-secondary">
              <span>{statistics.total} documents</span>
              <span>{statistics.totalPrints} impressions</span>
              <span>{statistics.totalDownloads} téléchargements</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            iconName="BarChart3"
            iconPosition="left"
            onClick={() => setShowAnalyticsModal(true)}
          >
            Statistiques
          </Button>
          <Button
            variant="outline"
            iconName="Plus"
            iconPosition="left"
            onClick={() => handleGenerateDocument('certificat')}
          >
            Nouveau document
          </Button>
          <Button
            variant="default"
            iconName="Printer"
            iconPosition="left"
            onClick={handleBatchPrint}
            disabled={selectedDocuments.length === 0}
          >
            Impression en lot ({selectedDocuments.length})
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-4">
          Génération rapide
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button
            variant="outline"
            iconName="FileText"
            iconPosition="left"
            onClick={() => handleGenerateDocument('certificat')}
            className="justify-start"
          >
            Certificat de scolarité
          </Button>
          <Button
            variant="outline"
            iconName="Shield"
            iconPosition="left"
            onClick={() => handleGenerateDocument('attestation')}
            className="justify-start"
          >
            Attestation d'assurance
          </Button>
          <Button
            variant="outline"
            iconName="BookOpen"
            iconPosition="left"
            onClick={() => handleGenerateDocument('bulletin')}
            className="justify-start"
          >
            Bulletin scolaire
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Icon name="FileText" size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{statistics.total}</div>
                <div className="text-sm text-text-secondary">Documents</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Icon name="CheckCircle" size={20} className="text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{statistics.byStatus.approved || 0}</div>
                <div className="text-sm text-text-secondary">Approuvés</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Icon name="Clock" size={20} className="text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{statistics.byStatus.pending || 0}</div>
                <div className="text-sm text-text-secondary">En attente</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{statistics.byStatus.urgent || 0}</div>
                <div className="text-sm text-text-secondary">Urgents</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Rechercher un document ou un élève..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            iconName="Search"
            iconPosition="left"
          />
          <Select
            options={documentCategories}
            value={filterCategory}
            onChange={setFilterCategory}
            placeholder="Filtrer par catégorie"
          />
          <Select
            options={statusOptions}
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder="Filtrer par statut"
          />
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
            Documents récents ({filteredDocuments.length})
          </h3>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Icon name="Download" size={16} className="mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-text-secondary">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDocuments(filteredDocuments.map(d => d.id));
                      } else {
                        setSelectedDocuments([]);
                      }
                    }}
                    className="mr-2"
                  />
                  Document
                </th>
                <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-text-secondary">
                  Élève / Classe
                </th>
                <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-text-secondary">
                  Date
                </th>
                <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-text-secondary">
                  Statut
                </th>
                <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-text-secondary">
                  Priorité
                </th>
                <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="text-text-secondary">Chargement des documents...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b border-border hover:bg-muted/50 transition-micro">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(doc.id)}
                          onChange={() => handleDocumentSelection(doc.id)}
                          className="mr-3"
                        />
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon name="FileText" size={20} className="text-primary" />
                        </div>
                        <div>
                          <div className="font-body font-body-semibold text-sm text-text-primary">
                            {doc.name}
                          </div>
                          <div className="font-caption font-caption-normal text-xs text-text-secondary">
                            {doc.format} • {doc.size}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-body font-body-normal text-sm text-text-primary">
                        {doc.studentName}
                      </div>
                      <div className="font-caption font-caption-normal text-xs text-text-secondary">
                        {doc.class}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-body font-body-normal text-sm text-text-primary">
                        {doc.dateCreated}
                      </div>
                      <div className="font-caption font-caption-normal text-xs text-text-secondary">
                        par {doc.generatedBy}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                        {getStatusLabel(doc.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(doc.urgency)}`}>
                        {doc.urgency === 'urgent' && '🔴 '}
                        {doc.urgency === 'high' && '🟠 '}
                        {doc.urgency === 'normal' && '🔵 '}
                        {doc.urgency === 'low' && '⚪ '}
                        {doc.urgency}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadDocument(doc.id)}
                          title="Télécharger"
                        >
                          <Icon name="Download" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrintDocument(doc.id)}
                          title="Imprimer"
                        >
                          <Icon name="Printer" size={16} />
                        </Button>
                        {doc.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleValidateDocument(doc.id)}
                            title="Valider"
                          >
                            <Icon name="CheckCircle" size={16} className="text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => console.log('Edit document:', doc.id)}
                          title="Modifier"
                        >
                          <Icon name="Edit" size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-2">
              Aucun document trouvé
            </h3>
            <p className="font-body font-body-normal text-text-secondary">
              {searchTerm || filterCategory || filterStatus
                ? 'Aucun document ne correspond à vos critères de recherche.'
                : 'Aucun document n\'a encore été généré.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de génération de document */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Générer un document</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDocumentModal(false)}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de document
                </label>
                <Select
                  options={documentCategories.slice(1)}
                  value={documentModalType}
                  onChange={setDocumentModalType}
                  placeholder="Sélectionner un type"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Élève concerné
                </label>
                <Input
                  placeholder="Nom de l'élève..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Classe
                </label>
                <Input
                  placeholder="Classe de l'élève..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowDocumentModal(false)}
              >
                Annuler
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  alert(`✅ Document ${documentModalType} généré avec succès !`);
                  setShowDocumentModal(false);
                  loadDocuments(); // Recharger la liste
                }}
              >
                Générer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal des statistiques */}
      {showAnalyticsModal && statistics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Statistiques des Documents</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnalyticsModal(false)}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Vue d'ensemble */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Vue d'ensemble</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-900">{statistics.total}</div>
                    <div className="text-sm text-blue-600">Total documents</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-900">{statistics.totalPrints}</div>
                    <div className="text-sm text-green-600">Impressions</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-900">{statistics.totalDownloads}</div>
                    <div className="text-sm text-purple-600">Téléchargements</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-900">{statistics.thisWeek}</div>
                    <div className="text-sm text-orange-600">Cette semaine</div>
                  </div>
                </div>
              </div>

              {/* Par statut */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Répartition par statut</h4>
                <div className="space-y-2">
                  {Object.entries(statistics.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="capitalize">{getStatusLabel(status)}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Par type */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Répartition par type</h4>
                <div className="space-y-2">
                  {Object.entries(statistics.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="capitalize">{documentCategories.find(c => c.value === type)?.label || type}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAnalyticsModal(false)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsTab;