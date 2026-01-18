import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const StudentGradeCard = ({ student, assignments, onGradeEdit, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const calculateOverallAverage = () => {
    const gradedAssignments = assignments?.filter(a => a?.currentGrade);
    if (gradedAssignments?.length === 0) return null;

    const totalWeightedScore = gradedAssignments?.reduce((sum, assignment) => {
      const percentage = assignment?.currentGrade?.percentage || 0;
      const weight = assignment?.weight || 1;
      return sum + (percentage * weight);
    }, 0);

    const totalWeight = gradedAssignments?.reduce((sum, assignment) => {
      return sum + (assignment?.weight || 1);
    }, 0);

    return (totalWeightedScore / totalWeight)?.toFixed(1);
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-success';
    if (percentage >= 80) return 'text-primary';
    if (percentage >= 70) return 'text-warning';
    return 'text-error';
  };

  const getGradeBadgeColor = (percentage) => {
    if (percentage >= 90) return 'bg-success/10 text-success border-success/20';
    if (percentage >= 80) return 'bg-primary/10 text-primary border-primary/20';
    if (percentage >= 70) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-error/10 text-error border-error/20';
  };

  const overallAverage = calculateOverallAverage();
  const completedAssignments = assignments?.filter(a => a?.currentGrade)?.length;
  const totalAssignments = assignments?.length;

  return (
    <div className="bg-card border border-border rounded-lg shadow-card hover:shadow-modal transition-state">
      {/* Student Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Image
                src={student?.avatar}
                alt={student?.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {student?.status === 'absent' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full border-2 border-card" />
              )}
            </div>
            <div>
              <h3 className="font-heading font-heading-semibold text-base text-card-foreground">
                {student?.name}
              </h3>
              <div className="flex items-center space-x-4 mt-1">
                <span className="font-caption font-caption-normal text-xs text-muted-foreground">
                  ID: {student?.id}
                </span>
                <span className="font-caption font-caption-normal text-xs text-muted-foreground">
                  Classe: {student?.class}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Overall Average */}
            {overallAverage && (
              <div className={`px-3 py-1 rounded-full border ${getGradeBadgeColor(parseFloat(overallAverage))}`}>
                <span className="font-heading font-heading-semibold text-sm">
                  {overallAverage}%
                </span>
              </div>
            )}

            {/* Progress Indicator */}
            <div className="text-center">
              <div className="font-heading font-heading-semibold text-sm text-card-foreground">
                {completedAssignments}/{totalAssignments}
              </div>
              <div className="font-caption font-caption-normal text-xs text-muted-foreground">
                Évaluations
              </div>
            </div>

            {/* Expand Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={20} />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="font-heading font-heading-semibold text-sm text-success">
                {assignments?.filter(a => a?.currentGrade && parseFloat(a?.currentGrade?.percentage) >= 80)?.length}
              </div>
              <div className="font-caption font-caption-normal text-xs text-muted-foreground">
                Bonnes notes
              </div>
            </div>
            <div className="text-center">
              <div className="font-heading font-heading-semibold text-sm text-warning">
                {assignments?.filter(a => !a?.currentGrade && new Date(a.dueDate) < new Date())?.length}
              </div>
              <div className="font-caption font-caption-normal text-xs text-muted-foreground">
                En retard
              </div>
            </div>
            <div className="text-center">
              <div className="font-heading font-heading-semibold text-sm text-primary">
                {assignments?.filter(a => !a?.currentGrade && new Date(a.dueDate) >= new Date())?.length}
              </div>
              <div className="font-caption font-caption-normal text-xs text-muted-foreground">
                À évaluer
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(student)}
          >
            <Icon name="Eye" size={14} className="mr-2" />
            Détails
          </Button>
        </div>
      </div>
      {/* Expanded Assignment List */}
      {isExpanded && (
        <div className="p-4">
          <div className="space-y-3">
            {assignments?.map((assignment) => (
              <div
                key={assignment?.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-micro"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      assignment?.currentGrade 
                        ? getGradeColor(parseFloat(assignment?.currentGrade?.percentage))?.replace('text-', 'bg-')
                        : 'bg-muted-foreground'
                    }`} />
                    <div>
                      <h4 className="font-body font-body-semibold text-sm text-card-foreground">
                        {assignment?.title}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="font-caption font-caption-normal text-xs text-muted-foreground">
                          {assignment?.category}
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
                </div>

                <div className="flex items-center space-x-3">
                  {assignment?.currentGrade ? (
                    <div className="text-right">
                      <div className={`font-heading font-heading-semibold text-sm ${getGradeColor(parseFloat(assignment?.currentGrade?.percentage))}`}>
                        {assignment?.currentGrade?.score}/{assignment?.maxScore}
                      </div>
                      <div className={`font-caption font-caption-normal text-xs ${getGradeColor(parseFloat(assignment?.currentGrade?.percentage))}`}>
                        {assignment?.currentGrade?.percentage}% ({assignment?.currentGrade?.letterGrade})
                      </div>
                    </div>
                  ) : (
                    <div className="text-right">
                      <div className="font-body font-body-normal text-sm text-muted-foreground">
                        Non évalué
                      </div>
                      <div className="font-caption font-caption-normal text-xs text-muted-foreground">
                        /{assignment?.maxScore}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onGradeEdit(student, assignment)}
                  >
                    <Icon name={assignment?.currentGrade ? "Edit" : "Plus"} size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentGradeCard;