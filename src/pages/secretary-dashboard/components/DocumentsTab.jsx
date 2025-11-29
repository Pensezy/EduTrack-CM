import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useDataMode } from '../../../hooks/useDataMode';
import { documentService } from '../../../services/documentService';
import { supabase } from '../../../lib/supabase';

const DocumentsTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isDemo, isProduction, dataMode, user } = useDataMode();
  
  // Modal de sélection
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'student', 'class', 'public'
  const [documentType, setDocumentType] = useState(''); // 'certificat', 'attestation', 'bulletin'
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  // Debug : afficher le mode détecté
  useEffect(() => {
    console.log('🔍 DocumentsTab - Mode actuel:', {
      dataMode,
      isDemo,
      isProduction,
      userEmail: user?.email,
      schoolId: user?.school_id
    });
  }, [dataMode, isDemo, isProduction, user]);

  const documentCategories = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'certificats', label: 'Certificats de scolarité' },
    { value: 'attestations', label: 'Attestations' },
    { value: 'bulletins', label: 'Bulletins scolaires' },
    { value: 'inscriptions', label: 'Dossiers d\'inscription' },
    { value: 'administratif', label: 'Documents administratifs' }
  ];

  // Charger les documents au montage du composant
  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true);
      try {
        if (isDemo) {
          // Mode démo : données fictives
          setDocuments([
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
          ]);
        } else {
          // Mode production : charger depuis Supabase
          const result = await documentService.getAllSchoolDocuments();
          
          if (result.error === 'TABLE_NOT_EXISTS') {
            // Table n'existe pas : afficher un message
            setError('⚠️ La table documents n\'existe pas encore. Fonctionnalité en développement.');
            setDocuments([]);
          } else if (result.success) {
            setDocuments(result.documents || []);
          } else {
            console.error('Erreur chargement documents:', result.error);
            setError('Erreur lors du chargement des documents');
            setDocuments([]);
          }
        }
      } catch (error) {
        console.error('Erreur chargement documents:', error);
        setError('Erreur lors du chargement des documents');
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [isDemo]);
  
  // Charger les élèves et classes pour le modal
  useEffect(() => {
    const loadStudentsAndClasses = async () => {
      if (isDemo || !user?.school_id) return;
      
      try {
        // Charger les élèves de l'école
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('id, first_name, last_name, class_name')
          .eq('school_id', user.school_id)
          .order('last_name');
        
        if (!studentsError && studentsData) {
          setStudents(studentsData);
        }
        
        // Charger les classes de l'école
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('id, name, level')
          .eq('school_id', user.school_id)
          .order('level');
        
        if (!classesError && classesData) {
          setClasses(classesData);
        }
      } catch (error) {
        console.error('Erreur chargement élèves/classes:', error);
      }
    };
    
    loadStudentsAndClasses();
  }, [isDemo, user?.school_id]);

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

  const handleBatchPrint = () => {
    if (selectedDocuments.length === 0) {
      alert('⚠️ Veuillez sélectionner au moins un document à imprimer');
      return;
    }
    
    if (isDemo) {
      alert('🎭 Mode démo : Impression de ' + selectedDocuments.length + ' document(s) sélectionné(s)');
      return;
    }
    
    // Ouvrir chaque document sélectionné dans un nouvel onglet pour impression
    selectedDocuments.forEach(docId => {
      const doc = documents.find(d => d.id === docId);
      if (doc && doc.file_path) {
        handlePrintDocument(docId);
      }
    });
    
    alert(`✅ Ouverture de ${selectedDocuments.length} document(s) pour impression`);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || doc.type === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleGenerateDocument = async (type, targetType = 'student') => {
    console.log('🔘 Bouton cliqué - Génération document:', type, targetType);
    
    if (isDemo) {
      alert('🎭 Mode démo : La génération de documents n\'est pas disponible en mode démonstration.');
      return;
    }
    
    // Ouvrir le modal de sélection
    setDocumentType(type);
    setModalType(targetType);
    setShowModal(true);
  };
  
  const confirmGenerateDocument = async () => {
    try {
      setLoading(true);
      console.log('📤 Génération du document...', {
        documentType,
        modalType,
        selectedStudent,
        selectedClass
      });
      
      const options = {};
      
      // Déterminer la visibilité selon le type
      if (modalType === 'student' && selectedStudent) {
        options.studentId = selectedStudent;
        options.visibility = 'private';
        options.isPublic = false;
      } else if (modalType === 'class' && selectedClass) {
        options.classId = selectedClass;
        options.visibility = 'class';
        options.isPublic = false;
      } else if (modalType === 'public') {
        options.visibility = 'school';
        options.isPublic = true;
      }
      
      const result = await documentService.generateDocument(documentType, options);
      console.log('📥 Résultat:', result);
      
      if (result.success) {
        alert(`✅ Document "${documentType}" créé avec succès !`);
        setShowModal(false);
        await loadDocuments();
      } else {
        console.error('❌ Erreur génération:', result.error);
        alert(`❌ Erreur : ${result.error || 'Impossible de générer le document'}`);
      }
    } catch (error) {
      console.error('❌ Exception génération document:', error);
      alert(`❌ Erreur : ${error.message || 'Erreur lors de la génération du document'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintDocument = async (documentId) => {
    const doc = documents.find(d => d.id === documentId);
    if (!doc) return;
    
    if (isDemo) {
      alert(`🎭 Mode démo : Impression simulée du document "${doc.name}"`);
      return;
    }
    
    // En production : vérifier si le fichier existe
    if (!doc.file_path) {
      alert(`⚠️ Ce document n'a pas encore de fichier associé. Il s'agit d'un enregistrement dans la base de données.`);
      return;
    }
    
    // Télécharger et ouvrir pour impression
    handleDownloadDocument(documentId, true);
  };

  const handleDownloadDocument = async (documentId, forPrint = false) => {
    const doc = documents.find(d => d.id === documentId);
    if (!doc) return;
    
    if (isDemo) {
      alert(`🎭 Mode démo : Téléchargement simulé du document "${doc.name}"`);
      return;
    }
    
    // Vérifier si le fichier existe
    if (!doc.file_path) {
      alert(`⚠️ Ce document n'a pas encore de fichier associé. Il s'agit d'un enregistrement dans la base de données uniquement.`);
      return;
    }
    
    try {
      const result = await documentService.downloadDocument(documentId, forPrint ? 'print' : 'download');
      
      if (result.data?.url) {
        if (forPrint) {
          // Ouvrir dans une nouvelle fenêtre pour impression
          const printWindow = window.open(result.data.url, '_blank');
          if (printWindow) {
            printWindow.onload = () => {
              printWindow.print();
            };
          } else {
            alert('⚠️ Veuillez autoriser les pop-ups pour imprimer le document');
          }
        } else {
          // Télécharger le fichier
          const link = document.createElement('a');
          link.href = result.data.url;
          link.download = result.data.fileName || doc.name;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          alert('✅ Téléchargement lancé !');
        }
      } else {
        alert(`❌ Erreur : ${result.error || 'Impossible d\'accéder au document'}`);
      }
    } catch (error) {
      console.error('Erreur accès document:', error);
      alert('❌ Erreur lors de l\'accès au document');
    }
  };

  const handleDeleteDocument = async (documentId) => {
    const doc = documents.find(d => d.id === documentId);
    if (!doc) return;
    
    if (isDemo) {
      alert(`🎭 Mode démo : Suppression non disponible en mode démonstration`);
      return;
    }
    
    const confirmDelete = window.confirm(`Êtes-vous sûr de vouloir supprimer le document "${doc.name}" ?`);
    if (!confirmDelete) return;
    
    try {
      setLoading(true);
      const result = await documentService.deleteDocument(documentId);
      
      if (result.data) {
        alert('✅ Document supprimé avec succès');
        await loadDocuments();
      } else {
        alert(`❌ Erreur : ${result.error || 'Impossible de supprimer le document'}`);
      }
    } catch (error) {
      console.error('Erreur suppression document:', error);
      alert('❌ Erreur lors de la suppression du document');
    } finally {
      setLoading(false);
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
          {/* Indicateur de mode (temporaire pour debug) */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
            isProduction 
              ? 'bg-green-100 text-green-700' 
              : 'bg-orange-100 text-orange-700'
          }`}>
            {isProduction ? '✅ Mode Production' : '🎭 Mode Démo'}
            {user?.email && ` - ${user.email}`}
          </div>
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
            onClick={handleBatchPrint}
          >
            Impression en lot
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-4">
          Documents individuels (pour un élève)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button
            variant="outline"
            iconName="FileText"
            iconPosition="left"
            onClick={() => handleGenerateDocument('certificat', 'student')}
            className="justify-start"
          >
            Certificat de scolarité
          </Button>
          <Button
            variant="outline"
            iconName="Shield"
            iconPosition="left"
            onClick={() => handleGenerateDocument('attestation', 'student')}
            className="justify-start"
          >
            Attestation d'assurance
          </Button>
          <Button
            variant="outline"
            iconName="BookOpen"
            iconPosition="left"
            onClick={() => handleGenerateDocument('bulletin', 'student')}
            className="justify-start"
          >
            Bulletin scolaire
          </Button>
        </div>
      </div>
      
      {/* Documents par classe */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-4">
          Documents par classe
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button
            variant="outline"
            iconName="Users"
            iconPosition="left"
            onClick={() => handleGenerateDocument('emploi_du_temps', 'class')}
            className="justify-start"
          >
            Emploi du temps
          </Button>
          <Button
            variant="outline"
            iconName="BookOpen"
            iconPosition="left"
            onClick={() => handleGenerateDocument('bulletin_classe', 'class')}
            className="justify-start"
          >
            Bulletins de la classe
          </Button>
          <Button
            variant="outline"
            iconName="FileText"
            iconPosition="left"
            onClick={() => handleGenerateDocument('liste_eleves', 'class')}
            className="justify-start"
          >
            Liste des élèves
          </Button>
        </div>
      </div>
      
      {/* Documents publics */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-4">
          Documents publics (toute l'école)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button
            variant="outline"
            iconName="FileText"
            iconPosition="left"
            onClick={() => handleGenerateDocument('reglement_interieur', 'public')}
            className="justify-start"
          >
            Règlement intérieur
          </Button>
          <Button
            variant="outline"
            iconName="Calendar"
            iconPosition="left"
            onClick={() => handleGenerateDocument('calendrier_scolaire', 'public')}
            className="justify-start"
          >
            Calendrier scolaire
          </Button>
          <Button
            variant="outline"
            iconName="Bell"
            iconPosition="left"
            onClick={() => handleGenerateDocument('circulaire', 'public')}
            className="justify-start"
          >
            Circulaire / Annonce
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
                <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-text-secondary w-12">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDocuments(filteredDocuments.map(d => d.id));
                      } else {
                        setSelectedDocuments([]);
                      }
                    }}
                    checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                  />
                </th>
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
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(doc.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDocuments([...selectedDocuments, doc.id]);
                        } else {
                          setSelectedDocuments(selectedDocuments.filter(id => id !== doc.id));
                        }
                      }}
                    />
                  </td>
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
      
      {/* Modal de sélection */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">
              {modalType === 'student' && 'Sélectionner un élève'}
              {modalType === 'class' && 'Sélectionner une classe'}
              {modalType === 'public' && 'Document public'}
            </h3>
            
            {modalType === 'student' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Élève</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={selectedStudent || ''}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  <option value="">-- Sélectionner un élève --</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.last_name} {student.first_name} - {student.class_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {modalType === 'class' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Classe</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={selectedClass || ''}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">-- Sélectionner une classe --</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.level})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {modalType === 'public' && (
              <p className="mb-4 text-gray-600">
                Ce document sera visible par tous les parents et élèves de l'école.
              </p>
            )}
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setSelectedStudent(null);
                  setSelectedClass(null);
                }}
              >
                Annuler
              </Button>
              <Button
                variant="default"
                onClick={confirmGenerateDocument}
                disabled={
                  (modalType === 'student' && !selectedStudent) ||
                  (modalType === 'class' && !selectedClass)
                }
              >
                Générer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsTab;