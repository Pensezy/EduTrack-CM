import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const BulkGradeEntry = ({ isOpen, onClose, students, assignment, onBulkSave }) => {
  const [gradeEntries, setGradeEntries] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkValue, setBulkValue] = useState('');
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const bulkActionOptions = [
    { value: '', label: 'Sélectionner une action' },
    { value: 'set_all', label: 'Définir la même note pour tous' },
    { value: 'add_points', label: 'Ajouter des points à tous' },
    { value: 'multiply', label: 'Multiplier toutes les notes' },
    { value: 'curve', label: 'Appliquer une courbe' }
  ];

  useEffect(() => {
    if (isOpen && students && assignment) {
      const initialEntries = students?.map(student => ({
        studentId: student?.id,
        studentName: student?.name,
        currentScore: assignment?.currentGrade?.score || '',
        newScore: assignment?.currentGrade?.score || '',
        maxScore: assignment?.maxScore,
        comments: assignment?.currentGrade?.comments || '',
        hasChanges: false
      }));
      setGradeEntries(initialEntries);
      setErrors({});
    }
  }, [isOpen, students, assignment]);

  const updateGradeEntry = (studentId, field, value) => {
    setGradeEntries(prev => prev?.map(entry => {
      if (entry?.studentId === studentId) {
        const updated = { ...entry, [field]: value };
        updated.hasChanges = updated?.newScore !== updated?.currentScore || updated?.comments !== (assignment?.currentGrade?.comments || '');
        return updated;
      }
      return entry;
    }));

    // Clear error for this student
    if (errors?.[studentId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors?.[studentId];
        return newErrors;
      });
    }
  };

  const applyBulkAction = () => {
    if (!bulkAction || !bulkValue) return;

    setGradeEntries(prev => prev?.map(entry => {
      let newScore = parseFloat(entry?.newScore) || 0;
      const maxScore = parseFloat(entry?.maxScore);

      switch (bulkAction) {
        case 'set_all':
          newScore = parseFloat(bulkValue);
          break;
        case 'add_points':
          newScore = (parseFloat(entry?.newScore) || 0) + parseFloat(bulkValue);
          break;
        case 'multiply':
          newScore = (parseFloat(entry?.newScore) || 0) * parseFloat(bulkValue);
          break;
        case 'curve':
          // Simple curve: add percentage of max score
          const curvePercent = parseFloat(bulkValue) / 100;
          newScore = (parseFloat(entry?.newScore) || 0) + (maxScore * curvePercent);
          break;
        default:
          return entry;
      }

      // Ensure score doesn't exceed max score
      newScore = Math.min(Math.max(0, newScore), maxScore);

      return {
        ...entry,
        newScore: newScore?.toString(),
        hasChanges: true
      };
    }));

    setBulkAction('');
    setBulkValue('');
  };

  const validateEntries = () => {
    const newErrors = {};

    gradeEntries?.forEach(entry => {
      if (entry?.hasChanges) {
        const score = parseFloat(entry?.newScore);
        const maxScore = parseFloat(entry?.maxScore);

        if (isNaN(score)) {
          newErrors[entry.studentId] = 'Score invalide';
        } else if (score < 0) {
          newErrors[entry.studentId] = 'Le score ne peut pas être négatif';
        } else if (score > maxScore) {
          newErrors[entry.studentId] = `Le score ne peut pas dépasser ${maxScore}`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSave = async () => {
    if (!validateEntries()) return;

    setIsProcessing(true);

    const changedEntries = gradeEntries?.filter(entry => entry?.hasChanges);
    
    if (changedEntries?.length === 0) {
      setIsProcessing(false);
      onClose();
      return;
    }

    const bulkGrades = changedEntries?.map(entry => ({
      studentId: entry?.studentId,
      assignmentId: assignment?.id,
      grade: {
        score: entry?.newScore,
        maxScore: entry?.maxScore,
        percentage: ((parseFloat(entry?.newScore) / parseFloat(entry?.maxScore)) * 100)?.toFixed(1),
        letterGrade: calculateLetterGrade(entry?.newScore, entry?.maxScore),
        comments: entry?.comments,
        gradeType: assignment?.gradeType || 'numerical'
      },
      timestamp: new Date()?.toISOString()
    }));

    try {
      await onBulkSave(bulkGrades);
      onClose();
    } catch (error) {
      console.error('Error saving bulk grades:', error);
    } finally {
      setIsProcessing(false);
    }
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

  const getScoreColor = (score, maxScore) => {
    const percentage = (parseFloat(score) / parseFloat(maxScore)) * 100;
    if (percentage >= 90) return 'text-success';
    if (percentage >= 80) return 'text-primary';
    if (percentage >= 70) return 'text-warning';
    return 'text-error';
  };

  const changedCount = gradeEntries?.filter(entry => entry?.hasChanges)?.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg shadow-modal w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
              Saisie groupée des notes
            </h3>
            <p className="font-body font-body-normal text-sm text-text-secondary mt-1">
              {assignment?.title} • {students?.length} élèves
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Bulk Actions */}
        <div className="p-6 border-b border-border">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <Select
                label="Action groupée"
                options={bulkActionOptions}
                value={bulkAction}
                onChange={setBulkAction}
              />
            </div>
            <div className="flex-1">
              <Input
                label="Valeur"
                type="number"
                placeholder="Entrer la valeur"
                value={bulkValue}
                onChange={(e) => setBulkValue(e?.target?.value)}
                disabled={!bulkAction}
                step="0.1"
              />
            </div>
            <Button
              variant="outline"
              onClick={applyBulkAction}
              disabled={!bulkAction || !bulkValue}
            >
              <Icon name="Zap" size={16} className="mr-2" />
              Appliquer
            </Button>
          </div>
        </div>

        {/* Grade Entries */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {gradeEntries?.map((entry) => (
              <div
                key={entry?.studentId}
                className={`p-4 border rounded-lg transition-state ${
                  entry?.hasChanges 
                    ? 'border-primary bg-primary/5' :'border-border bg-card'
                } ${errors?.[entry?.studentId] ? 'border-error' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="font-heading font-heading-semibold text-sm text-primary-foreground">
                        {entry?.studentName?.split(' ')?.map(n => n?.[0])?.join('')?.substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-body font-body-semibold text-sm text-card-foreground">
                        {entry?.studentName}
                      </h4>
                      {entry?.currentScore && (
                        <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                          Note actuelle: {entry?.currentScore}/{entry?.maxScore}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="0"
                        value={entry?.newScore}
                        onChange={(e) => updateGradeEntry(entry?.studentId, 'newScore', e?.target?.value)}
                        className="w-20"
                        min="0"
                        max={entry?.maxScore}
                        step="0.1"
                      />
                      <span className="font-body font-body-normal text-sm text-muted-foreground">
                        / {entry?.maxScore}
                      </span>
                    </div>

                    {entry?.newScore && (
                      <div className="text-right">
                        <div className={`font-heading font-heading-semibold text-sm ${getScoreColor(entry?.newScore, entry?.maxScore)}`}>
                          {((parseFloat(entry?.newScore) / parseFloat(entry?.maxScore)) * 100)?.toFixed(1)}%
                        </div>
                        <div className={`font-caption font-caption-normal text-xs ${getScoreColor(entry?.newScore, entry?.maxScore)}`}>
                          {calculateLetterGrade(entry?.newScore, entry?.maxScore)}
                        </div>
                      </div>
                    )}

                    {entry?.hasChanges && (
                      <Icon name="AlertCircle" size={16} className="text-primary" />
                    )}
                  </div>
                </div>

                {errors?.[entry?.studentId] && (
                  <p className="font-body font-body-normal text-sm text-error mt-2">
                    {errors?.[entry?.studentId]}
                  </p>
                )}

                {/* Comments */}
                <div className="mt-3">
                  <textarea
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                    rows="2"
                    placeholder="Commentaires (optionnel)..."
                    value={entry?.comments}
                    onChange={(e) => updateGradeEntry(entry?.studentId, 'comments', e?.target?.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="font-body font-body-normal text-sm text-text-secondary">
            {changedCount} modification{changedCount !== 1 ? 's' : ''} en attente
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Annuler
            </Button>
            <Button 
              variant="default" 
              onClick={handleSave} 
              disabled={changedCount === 0 || isProcessing}
              loading={isProcessing}
            >
              <Icon name="Save" size={16} className="mr-2" />
              Enregistrer {changedCount > 0 ? `(${changedCount})` : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkGradeEntry;