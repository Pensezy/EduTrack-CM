import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AdministrativeNotesSection = ({ student, userRole = 'secretary' }) => {
  const [showNewNote, setShowNewNote] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newNote, setNewNote] = useState({
    category: '',
    title: '',
    content: '',
    priority: 'normal',
    confidential: false,
    tags: ''
  });

  const categoryOptions = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'academic', label: 'Académique' },
    { value: 'behavioral', label: 'Comportemental' },
    { value: 'medical', label: 'Médical' },
    { value: 'family', label: 'Familial' },
    { value: 'administrative', label: 'Administratif' },
    { value: 'orientation', label: 'Orientation' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Faible' },
    { value: 'normal', label: 'Normale' },
    { value: 'high', label: 'Élevée' },
    { value: 'urgent', label: 'Urgente' }
  ];

  const administrativeNotes = [
    {
      id: 1,
      date: '15/12/2024 14:30',
      author: 'Mme Dubois (Secrétaire)',
      category: 'academic',
      title: 'Demande de soutien scolaire',
      content: `Les parents ont demandé un soutien scolaire en mathématiques pour ${student?.firstName}. Malgré de bons résultats (16.5/20), ils souhaitent renforcer les bases avant le passage en classe supérieure.\n\nActions à prévoir:\n- Contacter le professeur de mathématiques\n- Proposer des créneaux de soutien\n- Établir un planning avec les parents`,
      priority: 'normal',
      confidential: false,
      tags: ['soutien', 'mathématiques', 'parents'],
      lastModified: '15/12/2024 14:30',
      modifiedBy: 'Mme Dubois'
    },
    {
      id: 2,
      date: '12/12/2024 09:15',
      author: 'M. Martin (CPE)',
      category: 'behavioral',
      title: 'Incident cantine - Résolu',
      content: `Incident mineur à la cantine le 10/12. ${student?.firstName} a eu un différend avec un camarade de classe.\n\nMesures prises:\n- Entretien individuel avec chaque élève\n- Réconciliation supervisée\n- Surveillance renforcée pendant 1 semaine\n\nSituation résolue, comportement exemplaire depuis.`,
      priority: 'low',
      confidential: false,
      tags: ['cantine', 'conflit', 'résolu'],
      lastModified: '12/12/2024 09:15',
      modifiedBy: 'M. Martin'
    },
    {
      id: 3,
      date: '08/12/2024 16:45',
      author: 'Dr. Rousseau (Infirmière)',
      category: 'medical',
      title: 'Suivi allergie alimentaire',
      content: `Mise à jour du PAI (Projet d'Accueil Individualisé) pour l'allergie aux arachides.\n\nNouvelles mesures:\n- Trousse d'urgence mise à jour (EpiPen)\n- Formation du personnel de cantine\n- Sensibilisation des camarades de classe\n- Contact d'urgence parents: 06.12.34.56.78`,
      priority: 'high',
      confidential: true,
      tags: ['PAI', 'allergie', 'arachides', 'urgence'],
      lastModified: '08/12/2024 16:45',
      modifiedBy: 'Dr. Rousseau'
    },
    {
      id: 4,
      date: '05/12/2024 11:20',
      author: 'Mme Leroy (Conseillère d\'orientation)',
      category: 'orientation',
      title: 'Entretien d\'orientation - Projet professionnel',
      content: `Entretien d'orientation avec ${student?.firstName} et ses parents.\n\nPoints abordés:\n- Intérêt marqué pour les sciences\n- Projet d'orientation vers un bac scientifique\n- Visite du lycée Pasteur prévue en janvier\n- Stage d'observation en laboratoire à organiser\n\nProchain RDV: 15/01/2025`,priority: 'normal',
      confidential: false,
      tags: ['orientation', 'sciences', 'bac-S', 'stage'],
      lastModified: '05/12/2024 11:20',
      modifiedBy: 'Mme Leroy'
    },
    {
      id: 5,
      date: '01/12/2024 13:30',author: 'M. Durand (Principal)',category: 'family',title: 'Situation familiale - Confidentiel',
      content: `Entretien confidentiel avec les parents concernant des difficultés familiales temporaires.\n\nMesures de soutien mises en place:\n- Suivi psychologique avec Mme Blanc\n- Aménagement des horaires si nécessaire\n- Communication renforcée avec l'équipe pédagogique\n\nSituation à surveiller avec bienveillance.`,
      priority: 'high',
      confidential: true,
      tags: ['confidentiel', 'famille', 'soutien', 'psychologique'],
      lastModified: '01/12/2024 13:30',
      modifiedBy: 'M. Durand'
    }
  ];

  const filteredNotes = administrativeNotes?.filter(note => {
    if (selectedCategory === 'all') return true;
    return note?.category === selectedCategory;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'academic':
        return 'BookOpen';
      case 'behavioral':
        return 'Users';
      case 'medical':
        return 'Heart';
      case 'family':
        return 'Home';
      case 'administrative':
        return 'FileText';
      case 'orientation':
        return 'Compass';
      default:
        return 'FileText';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'academic':
        return 'text-primary bg-primary/10';
      case 'behavioral':
        return 'text-warning bg-warning/10';
      case 'medical':
        return 'text-error bg-error/10';
      case 'family':
        return 'text-success bg-success/10';
      case 'administrative':
        return 'text-secondary bg-secondary/10';
      case 'orientation':
        return 'text-accent bg-accent/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-error';
      case 'high':
        return 'text-warning';
      case 'normal':
        return 'text-primary';
      case 'low':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  const handleSaveNote = () => {
    // Simulate saving note
    console.log('Note sauvegardée:', newNote);
    setShowNewNote(false);
    setNewNote({
      category: '',
      title: '',
      content: '',
      priority: 'normal',
      confidential: false,
      tags: ''
    });
  };

  const canViewConfidential = userRole === 'principal' || userRole === 'secretary';

  return (
    <div className="bg-card rounded-lg shadow-card p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading font-heading-semibold text-xl text-card-foreground flex items-center">
          <Icon name="FileText" size={20} className="mr-2 text-primary" />
          Notes administratives
        </h2>
        <Button
          variant="default"
          onClick={() => setShowNewNote(!showNewNote)}
          iconName="Plus"
          iconPosition="left"
        >
          Nouvelle note
        </Button>
      </div>
      {/* New Note Form */}
      {showNewNote && (
        <div className="bg-muted rounded-lg p-4 mb-6">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
            Nouvelle note administrative
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Select
              label="Catégorie"
              options={categoryOptions?.filter(opt => opt?.value !== 'all')}
              value={newNote?.category}
              onChange={(value) => setNewNote(prev => ({ ...prev, category: value }))}
              placeholder="Sélectionner une catégorie"
            />
            <Select
              label="Priorité"
              options={priorityOptions}
              value={newNote?.priority}
              onChange={(value) => setNewNote(prev => ({ ...prev, priority: value }))}
            />
            <Input
              label="Titre"
              type="text"
              value={newNote?.title}
              onChange={(e) => setNewNote(prev => ({ ...prev, title: e?.target?.value }))}
              placeholder="Titre de la note"
              className="md:col-span-2"
            />
            <Input
              label="Tags (séparés par des virgules)"
              type="text"
              value={newNote?.tags}
              onChange={(e) => setNewNote(prev => ({ ...prev, tags: e?.target?.value }))}
              placeholder="tag1, tag2, tag3"
              className="md:col-span-2"
            />
          </div>
          <div className="mb-4">
            <label className="block font-body font-body-semibold text-sm text-card-foreground mb-2">
              Contenu
            </label>
            <textarea
              value={newNote?.content}
              onChange={(e) => setNewNote(prev => ({ ...prev, content: e?.target?.value }))}
              rows={6}
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Contenu détaillé de la note..."
            />
          </div>
          <div className="flex items-center space-x-3 mb-4">
            <input
              type="checkbox"
              id="confidential"
              checked={newNote?.confidential}
              onChange={(e) => setNewNote(prev => ({ ...prev, confidential: e?.target?.checked }))}
              className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor="confidential" className="font-body font-body-normal text-sm text-card-foreground">
              Note confidentielle (accès restreint)
            </label>
          </div>
          <div className="flex space-x-2">
            <Button variant="default" onClick={handleSaveNote}>
              Enregistrer
            </Button>
            <Button variant="outline" onClick={() => setShowNewNote(false)}>
              Annuler
            </Button>
          </div>
        </div>
      )}
      {/* Filter */}
      <div className="mb-6">
        <Select
          options={categoryOptions}
          value={selectedCategory}
          onChange={setSelectedCategory}
          className="w-64"
        />
      </div>
      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes?.map((note) => {
          // Hide confidential notes if user doesn't have permission
          if (note?.confidential && !canViewConfidential) {
            return (
              <div key={note?.id} className="bg-muted rounded-lg p-4 opacity-50">
                <div className="flex items-center space-x-3">
                  <Icon name="Lock" size={16} className="text-muted-foreground" />
                  <span className="font-body font-body-normal text-sm text-muted-foreground">
                    Note confidentielle - Accès restreint
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div key={note?.id} className="bg-muted rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getCategoryColor(note?.category)}`}>
                    <Icon name={getCategoryIcon(note?.category)} size={16} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-body font-body-semibold text-sm text-card-foreground">
                        {note?.title}
                      </h4>
                      {note?.confidential && (
                        <Icon name="Lock" size={12} className="text-warning" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                      <span>{note?.author}</span>
                      <span>•</span>
                      <span>{note?.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon 
                    name="AlertCircle" 
                    size={14} 
                    className={getPriorityColor(note?.priority)} 
                  />
                  <Button variant="ghost" size="icon" className="w-6 h-6">
                    <Icon name="MoreVertical" size={12} />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-card-foreground mb-3 whitespace-pre-line">
                {note?.content}
              </p>
              {note?.tags && note?.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {note?.tags?.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-caption font-caption-normal bg-primary/10 text-primary"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-2">
                <span>
                  Dernière modification: {note?.lastModified} par {note?.modifiedBy}
                </span>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-xs">
                    <Icon name="Edit" size={12} className="mr-1" />
                    Modifier
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs">
                    <Icon name="Download" size={12} className="mr-1" />
                    Exporter
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
          Statistiques des notes
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="font-heading font-heading-semibold text-lg text-card-foreground">
              {administrativeNotes?.length}
            </div>
            <div className="font-caption font-caption-normal text-xs text-muted-foreground">
              Total notes
            </div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="font-heading font-heading-semibold text-lg text-card-foreground">
              {administrativeNotes?.filter(n => n?.confidential)?.length}
            </div>
            <div className="font-caption font-caption-normal text-xs text-muted-foreground">
              Confidentielles
            </div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="font-heading font-heading-semibold text-lg text-card-foreground">
              {administrativeNotes?.filter(n => n?.priority === 'high' || n?.priority === 'urgent')?.length}
            </div>
            <div className="font-caption font-caption-normal text-xs text-muted-foreground">
              Priorité élevée
            </div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="font-heading font-heading-semibold text-lg text-card-foreground">
              {new Set(administrativeNotes.map(n => n.author))?.size}
            </div>
            <div className="font-caption font-caption-normal text-xs text-muted-foreground">
              Contributeurs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdministrativeNotesSection;