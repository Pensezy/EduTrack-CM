import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AssignmentManager = ({ assignments, onAssignmentCreate, onAssignmentUpdate, onAssignmentDelete }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    maxScore: '100',
    weight: '10',
    dueDate: '',
    gradeType: 'numerical'
  });
  const [errors, setErrors] = useState({});

  const categoryOptions = [
    { value: 'test', label: 'Contrôle' },
    { value: 'homework', label: 'Devoir' },
    { value: 'project', label: 'Projet' },
    { value: 'participation', label: 'Participation' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'presentation', label: 'Présentation' }
  ];

  const gradeTypeOptions = [
    { value: 'numerical', label: 'Score numérique' },
    { value: 'letter', label: 'Note alphabétique' },
    { value: 'competency', label: 'Évaluation par compétences' }
  ];

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      maxScore: '100',
      weight: '10',
      dueDate: '',
      gradeType: 'numerical'
    });
    setErrors({});
    setEditingAssignment(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (assignment) => {
    setFormData({
      title: assignment?.title,
      description: assignment?.description,
      category: assignment?.category,
      maxScore: assignment?.maxScore?.toString(),
      weight: assignment?.weight?.toString(),
      dueDate: assignment?.dueDate?.split('T')?.[0],
      gradeType: assignment?.gradeType
    });
    setEditingAssignment(assignment);
    setIsCreateModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.title?.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData?.category) {
      newErrors.category = 'La catégorie est requise';
    }

    if (!formData?.maxScore || parseFloat(formData?.maxScore) <= 0) {
      newErrors.maxScore = 'Le score maximum doit être supérieur à 0';
    }

    if (!formData?.weight || parseFloat(formData?.weight) <= 0) {
      newErrors.weight = 'Le poids doit être supérieur à 0';
    }

    if (!formData?.dueDate) {
      newErrors.dueDate = 'La date d\'échéance est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const assignmentData = {
      ...formData,
      maxScore: parseFloat(formData?.maxScore),
      weight: parseFloat(formData?.weight),
      dueDate: new Date(formData.dueDate)?.toISOString(),
      id: editingAssignment?.id || `assignment_${Date.now()}`,
      createdAt: editingAssignment?.createdAt || new Date()?.toISOString(),
      updatedAt: new Date()?.toISOString()
    };

    if (editingAssignment) {
      onAssignmentUpdate(assignmentData);
    } else {
      onAssignmentCreate(assignmentData);
    }

    setIsCreateModalOpen(false);
    resetForm();
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'test': return 'FileText';
      case 'homework': return 'BookOpen';
      case 'project': return 'Folder';
      case 'participation': return 'Users';
      case 'quiz': return 'HelpCircle';
      case 'presentation': return 'Presentation';
      default: return 'File';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'test': return 'text-error bg-error/10';
      case 'homework': return 'text-primary bg-primary/10';
      case 'project': return 'text-success bg-success/10';
      case 'participation': return 'text-warning bg-warning/10';
      case 'quiz': return 'text-accent bg-accent/10';
      case 'presentation': return 'text-secondary bg-secondary/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-heading-semibold text-xl text-text-primary">
            Gestion des évaluations
          </h2>
          <p className="font-body font-body-normal text-sm text-text-secondary mt-1">
            Créer et gérer les évaluations pour la classe
          </p>
        </div>
        <Button variant="default" onClick={openCreateModal}>
          <Icon name="Plus" size={16} className="mr-2" />
          Nouvelle évaluation
        </Button>
      </div>
      {/* Assignments List */}
      <div className="grid gap-4">
        {assignments?.map((assignment) => (
          <div
            key={assignment?.id}
            className="bg-card border border-border rounded-lg p-4 hover:shadow-card transition-state"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${getCategoryColor(assignment?.category)}`}>
                  <Icon name={getCategoryIcon(assignment?.category)} size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-heading-semibold text-base text-card-foreground">
                    {assignment?.title}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="font-caption font-caption-normal text-xs text-muted-foreground">
                      {categoryOptions?.find(c => c?.value === assignment?.category)?.label}
                    </span>
                    <span className="font-caption font-caption-normal text-xs text-muted-foreground">
                      Max: {assignment?.maxScore} points
                    </span>
                    <span className="font-caption font-caption-normal text-xs text-muted-foreground">
                      Poids: {assignment?.weight}%
                    </span>
                    <span className="font-caption font-caption-normal text-xs text-muted-foreground">
                      Échéance: {new Date(assignment.dueDate)?.toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(assignment)}
                >
                  <Icon name="Edit" size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAssignmentDelete(assignment?.id)}
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            </div>

            {assignment?.description && (
              <p className="font-body font-body-normal text-sm text-muted-foreground mt-3 pl-12">
                {assignment?.description}
              </p>
            )}
          </div>
        ))}

        {assignments?.length === 0 && (
          <div className="text-center py-12">
            <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-2">
              Aucune évaluation
            </h3>
            <p className="font-body font-body-normal text-sm text-text-secondary mb-4">
              Commencez par créer votre première évaluation
            </p>
            <Button variant="default" onClick={openCreateModal}>
              <Icon name="Plus" size={16} className="mr-2" />
              Créer une évaluation
            </Button>
          </div>
        )}
      </div>
      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg shadow-modal w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
                {editingAssignment ? 'Modifier l\'évaluation' : 'Nouvelle évaluation'}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsCreateModalOpen(false)}>
                <Icon name="X" size={20} />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <Input
                label="Titre de l'évaluation"
                placeholder="Ex: Contrôle de mathématiques"
                value={formData?.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e?.target?.value }))}
                error={errors?.title}
                required
              />

              <div>
                <label className="block font-body font-body-semibold text-sm text-text-primary mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows="3"
                  placeholder="Description de l'évaluation..."
                  value={formData?.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e?.target?.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Catégorie"
                  options={categoryOptions}
                  value={formData?.category}
                  onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  error={errors?.category}
                  required
                />

                <Select
                  label="Type d'évaluation"
                  options={gradeTypeOptions}
                  value={formData?.gradeType}
                  onChange={(value) => setFormData(prev => ({ ...prev, gradeType: value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Score maximum"
                  type="number"
                  placeholder="100"
                  value={formData?.maxScore}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxScore: e?.target?.value }))}
                  error={errors?.maxScore}
                  min="1"
                  step="0.1"
                  required
                />

                <Input
                  label="Poids (%)"
                  type="number"
                  placeholder="10"
                  value={formData?.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e?.target?.value }))}
                  error={errors?.weight}
                  min="0.1"
                  step="0.1"
                  required
                />
              </div>

              <Input
                label="Date d'échéance"
                type="date"
                value={formData?.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e?.target?.value }))}
                error={errors?.dueDate}
                required
              />
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Annuler
              </Button>
              <Button variant="default" onClick={handleSubmit}>
                <Icon name="Save" size={16} className="mr-2" />
                {editingAssignment ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentManager;