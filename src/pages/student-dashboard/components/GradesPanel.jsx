import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const GradesPanel = ({ grades }) => {
  const [expandedSubjects, setExpandedSubjects] = useState(new Set());

  const toggleSubject = (subjectId) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded?.has(subjectId)) {
      newExpanded?.delete(subjectId);
    } else {
      newExpanded?.add(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  const getGradeColor = (grade) => {
    if (grade >= 16) return 'text-success';
    if (grade >= 12) return 'text-primary';
    if (grade >= 10) return 'text-warning';
    return 'text-error';
  };

  const getGradeBg = (grade) => {
    if (grade >= 16) return 'bg-success/10';
    if (grade >= 12) return 'bg-primary/10';
    if (grade >= 10) return 'bg-warning/10';
    return 'bg-error/10';
  };

  return (
    <div className="bg-card rounded-lg shadow-card border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">
            Mes Notes
          </h3>
          <Button variant="outline" size="sm">
            <Icon name="Download" size={16} className="mr-2" />
            Exporter
          </Button>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {grades?.map((subject) => (
          <div key={subject?.id} className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSubject(subject?.id)}
              className="w-full p-4 bg-muted/30 hover:bg-muted/50 transition-micro flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg ${getGradeBg(subject?.average)} flex items-center justify-center`}>
                  <span className={`font-heading font-heading-bold text-lg ${getGradeColor(subject?.average)}`}>
                    {subject?.average}
                  </span>
                </div>
                <div className="text-left">
                  <h4 className="font-body font-body-semibold text-card-foreground">
                    {subject?.name}
                  </h4>
                  <p className="font-caption font-caption-normal text-sm text-muted-foreground">
                    {subject?.assignments?.length} évaluations • Coeff. {subject?.coefficient}
                  </p>
                </div>
              </div>
              <Icon 
                name={expandedSubjects?.has(subject?.id) ? "ChevronUp" : "ChevronDown"} 
                size={20} 
                className="text-muted-foreground"
              />
            </button>

            {expandedSubjects?.has(subject?.id) && (
              <div className="p-4 bg-card space-y-3">
                {subject?.assignments?.map((assignment) => (
                  <div key={assignment?.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex-1">
                      <h5 className="font-body font-body-semibold text-sm text-card-foreground">
                        {assignment?.name}
                      </h5>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="font-caption font-caption-normal text-xs text-muted-foreground">
                          {assignment?.date}
                        </span>
                        <span className={`font-caption font-caption-normal text-xs px-2 py-1 rounded-full ${
                          assignment?.type === 'Contrôle' ? 'bg-error/10 text-error' :
                          assignment?.type === 'Devoir'? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                        }`}>
                          {assignment?.type}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-heading font-heading-bold text-lg ${getGradeColor(assignment?.grade)}`}>
                        {assignment?.grade}/20
                      </div>
                      <div className="font-caption font-caption-normal text-xs text-muted-foreground">
                        Coeff. {assignment?.coefficient}
                      </div>
                    </div>
                  </div>
                ))}
                
                {subject?.feedback && (
                  <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Icon name="MessageSquare" size={16} className="text-accent-foreground mt-1" />
                      <div>
                        <h6 className="font-body font-body-semibold text-sm text-accent-foreground">
                          Commentaire du professeur
                        </h6>
                        <p className="font-body font-body-normal text-sm text-card-foreground mt-1">
                          {subject?.feedback}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GradesPanel;