import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const DocumentsTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState([]);

  const documentCategories = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'certificats', label: 'Certificats de scolarité' },
    { value: 'attestations', label: 'Attestations' },
    { value: 'bulletins', label: 'Bulletins scolaires' },
    { value: 'inscriptions', label: 'Dossiers d\'inscription' },
    { value: 'administratif', label: 'Documents administratifs' }
  ];

  const documents = [
    {
      id: 1,
      name: "Certificat de scolarité - Marie Dubois",
      type: "certificats",
      dateCreated: "15/11/2024",
      status: "generated",
      studentName: "Marie Dubois",
      class: "CM2",
      format: "PDF"
    },
    {
      id: 2,
      name: "Attestation d'assurance - Pierre Martin",
      type: "attestations",
      dateCreated: "14/11/2024",
      status: "pending",
      studentName: "Pierre Martin",
      class: "CM1",
      format: "PDF"
    },
    {
      id: 3,
      name: "Bulletin 1er trimestre - Lucas Bernard",
      type: "bulletins",
      dateCreated: "12/11/2024",
      status: "printed",
      studentName: "Lucas Bernard",
      class: "CE2",
      format: "PDF"
    },
    {
      id: 4,
      name: "Dossier inscription - Emma Rousseau",
      type: "inscriptions",
      dateCreated: "10/11/2024",
      status: "incomplete",
      studentName: "Emma Rousseau",
      class: "CP",
      format: "DOSSIER"
    },
    {
      id: 5,
      name: "Règlement intérieur 2024-2025",
      type: "administratif",
      dateCreated: "01/09/2024",
      status: "generated",
      studentName: "Document général",
      class: "Toutes classes",
      format: "PDF"
    }
  ];

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
    return matchesSearch && matchesCategory;
  });

  const handleGenerateDocument = (type) => {
    console.log('Generate document:', type);
  };

  const handlePrintDocument = (documentId) => {
    console.log('Print document:', documentId);
  };

  const handleDownloadDocument = (documentId) => {
    console.log('Download document:', documentId);
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
        </div>
        <div className="flex items-center space-x-3">
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
            onClick={() => console.log('Batch print')}
          >
            Impression en lot
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

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="border-b border-border hover:bg-muted/50 transition-micro">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon name="FileText" size={20} className="text-primary" />
                      </div>
                      <div>
                        <div className="font-body font-body-semibold text-sm text-text-primary">
                          {doc.name}
                        </div>
                        <div className="font-caption font-caption-normal text-xs text-text-secondary">
                          {doc.format}
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
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                      {getStatusLabel(doc.status)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc.id)}
                      >
                        <Icon name="Download" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePrintDocument(doc.id)}
                      >
                        <Icon name="Printer" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log('Edit document:', doc.id)}
                      >
                        <Icon name="Edit" size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-2">
              Aucun document trouvé
            </h3>
            <p className="font-body font-body-normal text-text-secondary">
              Aucun document ne correspond à vos critères de recherche.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsTab;