import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const GradeEntryModal = ({ isOpen, onClose, student, assignment, onSave }) => {
  const [gradeData, setGradeData] = useState({
    score: '',
    maxScore: '',
    letterGrade: '',
    comments: '',
    gradeType: 'numerical'
  });
  const [errors, setErrors] = useState({});

  const gradeTypeOptions = [
    { value: 'numerical', label: 'Score numérique' },
    { value: 'letter', label: 'Note alphabétique' },
    { value: 'competency', label: 'Évaluation par compétences' }
  ];

  const letterGradeOptions = [
    { value: 'A+', label: 'A+ (Excellent)' },
    { value: 'A', label: 'A (Très bien)' },
    { value: 'B+', label: 'B+ (Bien+)' },
    { value: 'B', label: 'B (Bien)' },
    { value: 'C+', label: 'C+ (Assez bien+)' },
    { value: 'C', label: 'C (Assez bien)' },
    { value: 'D', label: 'D (Passable)' },
    { value: 'F', label: 'F (Insuffisant)' }
  ];

  const competencyOptions = [
    { value: 'exceeds', label: 'Dépasse les attentes' },
    { value: 'meets', label: 'Répond aux attentes' },
    { value: 'approaching', label: 'Approche les attentes' },
    { value: 'below', label: 'En dessous des attentes' }
  ];

  useEffect(() => {
    if (isOpen && assignment) {
      setGradeData({
        score: assignment?.currentGrade?.score || '',
        maxScore: assignment?.maxScore || '100',
        letterGrade: assignment?.currentGrade?.letterGrade || '',
        comments: assignment?.currentGrade?.comments || '',
        gradeType: assignment?.gradeType || 'numerical'
      });
      setErrors({});
    }
  }, [isOpen, assignment]);

  const validateGrade = () => {
    const newErrors = {};

    if (gradeData?.gradeType === 'numerical') {
      if (!gradeData?.score) {
        newErrors.score = 'Le score est requis';
      } else if (parseFloat(gradeData?.score) > parseFloat(gradeData?.maxScore)) {
        newErrors.score = 'Le score ne peut pas dépasser le score maximum';
      } else if (parseFloat(gradeData?.score) < 0) {
        newErrors.score = 'Le score ne peut pas être négatif';
      }

      if (!gradeData?.maxScore) {
        newErrors.maxScore = 'Le score maximum est requis';
      }
    } else if (gradeData?.gradeType === 'letter' && !gradeData?.letterGrade) {
      newErrors.letterGrade = 'La note alphabétique est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const calculateLetterGrade = (score, maxScore) => {
    const percentage = (parseFloat(score) / parseFloat(maxScore)) * 100;
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'B+';
    if (percentage >= 87) return 'B';
    if (percentage >= 83) return 'C+';
    if (percentage >= 80) return 'C';
    if (percentage >= 70) return 'D';
    return 'F';
  };

  const handleSave = () => {
    if (!validateGrade()) return;

    let finalGrade = { ...gradeData };

    // Auto-calculate letter grade for numerical scores
    if (gradeData?.gradeType === 'numerical' && gradeData?.score && gradeData?.maxScore) {
      finalGrade.letterGrade = calculateLetterGrade(gradeData?.score, gradeData?.maxScore);
      finalGrade.percentage = ((parseFloat(gradeData?.score) / parseFloat(gradeData?.maxScore)) * 100)?.toFixed(1);
    }

    onSave({
      studentId: student?.id,
      assignmentId: assignment?.id,
      grade: finalGrade,
      timestamp: new Date()?.toISOString()
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg shadow-modal w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
              Saisie de note
            </h3>
            <p className="font-body font-body-normal text-sm text-text-secondary mt-1">
              {student?.name} - {assignment?.title}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Grade Type Selection */}
          <Select
            label="Type d'évaluation"
            options={gradeTypeOptions}
            value={gradeData?.gradeType}
            onChange={(value) => setGradeData(prev => ({ ...prev, gradeType: value }))}
          />

          {/* Numerical Grade Input */}
          {gradeData?.gradeType === 'numerical' && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Score obtenu"
                type="number"
                placeholder="0"
                value={gradeData?.score}
                onChange={(e) => setGradeData(prev => ({ ...prev, score: e?.target?.value }))}
                error={errors?.score}
                min="0"
                step="0.1"
              />
              <Input
                label="Score maximum"
                type="number"
                placeholder="100"
                value={gradeData?.maxScore}
                onChange={(e) => setGradeData(prev => ({ ...prev, maxScore: e?.target?.value }))}
                error={errors?.maxScore}
                min="1"
                step="0.1"
              />
            </div>
          )}

          {/* Letter Grade Selection */}
          {gradeData?.gradeType === 'letter' && (
            <Select
              label="Note alphabétique"
              options={letterGradeOptions}
              value={gradeData?.letterGrade}
              onChange={(value) => setGradeData(prev => ({ ...prev, letterGrade: value }))}
              error={errors?.letterGrade}
            />
          )}

          {/* Competency Grade Selection */}
          {gradeData?.gradeType === 'competency' && (
            <Select
              label="Niveau de compétence"
              options={competencyOptions}
              value={gradeData?.letterGrade}
              onChange={(value) => setGradeData(prev => ({ ...prev, letterGrade: value }))}
            />
          )}

          {/* Comments */}
          <div>
            <label className="block font-body font-body-semibold text-sm text-text-primary mb-2">
              Commentaires (optionnel)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows="3"
              placeholder="Commentaires sur la performance de l'élève..."
              value={gradeData?.comments}
              onChange={(e) => setGradeData(prev => ({ ...prev, comments: e?.target?.value }))}
            />
          </div>

          {/* Grade Preview */}
          {gradeData?.gradeType === 'numerical' && gradeData?.score && gradeData?.maxScore && (
            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-body font-body-semibold text-sm text-text-primary mb-2">
                Aperçu de la note
              </h4>
              <div className="flex items-center justify-between">
                <span className="font-body font-body-normal text-sm text-text-secondary">
                  Pourcentage:
                </span>
                <span className="font-heading font-heading-semibold text-lg text-primary">
                  {((parseFloat(gradeData?.score) / parseFloat(gradeData?.maxScore)) * 100)?.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-body font-body-normal text-sm text-text-secondary">
                  Note alphabétique:
                </span>
                <span className="font-heading font-heading-semibold text-lg text-primary">
                  {calculateLetterGrade(gradeData?.score, gradeData?.maxScore)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="default" onClick={handleSave}>
            <Icon name="Save" size={16} className="mr-2" />
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GradeEntryModal;