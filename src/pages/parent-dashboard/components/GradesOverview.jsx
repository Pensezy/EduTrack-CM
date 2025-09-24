import React from 'react';
import Icon from '../../../components/AppIcon';

const GradesOverview = ({ grades }) => {
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <Icon name="TrendingUp" size={14} className="text-success" />;
      case 'down': return <Icon name="TrendingDown" size={14} className="text-error" />;
      default: return <Icon name="Minus" size={14} className="text-muted-foreground" />;
    }
  };

  const getGradeColor = (average) => {
    if (average >= 16) return 'text-success';
    if (average >= 14) return 'text-primary';
    if (average >= 12) return 'text-warning';
    return 'text-error';
  };

  const getGradeBgColor = (average) => {
    if (average >= 16) return 'bg-success/10';
    if (average >= 14) return 'bg-primary/10';
    if (average >= 12) return 'bg-warning/10';
    return 'bg-error/10';
  };

  const overallAverage = grades?.length > 0 
    ? grades?.reduce((sum, grade) => sum + (grade?.average * grade?.coefficient), 0) / 
      grades?.reduce((sum, grade) => sum + grade?.coefficient, 0)
    : 0;

  return (
    <div className="bg-card rounded-lg shadow-card border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-heading-semibold text-xl text-card-foreground">
          Aperçu des Notes
        </h3>
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
          <Icon name="BarChart3" size={16} className="text-primary" />
          <span className="font-heading font-heading-semibold text-sm text-primary">
            Moyenne générale: {overallAverage?.toFixed(1)}/20
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {grades?.map(subject => (
          <div key={subject?.id} className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h4 className="font-heading font-heading-semibold text-lg text-card-foreground">
                  {subject?.subject}
                </h4>
                <span className="px-2 py-1 bg-muted rounded text-xs font-caption font-caption-semibold text-muted-foreground">
                  Coeff. {subject?.coefficient}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon(subject?.trend)}
                <div className={`font-heading font-heading-bold text-xl ${getGradeColor(subject?.average)}`}>
                  {subject?.average}/20
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2 mb-3">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  subject?.average >= 16 ? 'bg-success' :
                  subject?.average >= 14 ? 'bg-primary' :
                  subject?.average >= 12 ? 'bg-warning' : 'bg-error'
                }`}
                style={{ width: `${(subject?.average / 20) * 100}%` }}
              ></div>
            </div>

            {/* Last Grade Info */}
            {subject?.lastGrade && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-body font-body-normal text-muted-foreground">
                    Dernière évaluation:
                  </span>
                  <span className={`font-body font-body-semibold px-2 py-1 rounded ${getGradeBgColor(subject?.lastGrade?.value)}`}>
                    {subject?.lastGrade?.value}/20 ({subject?.lastGrade?.type})
                  </span>
                </div>
                <span className="font-caption font-caption-normal text-muted-foreground">
                  {subject?.lastGrade?.date}
                </span>
              </div>
            )}
          </div>
        ))}

        {grades?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="BookOpen" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="font-body font-body-normal text-muted-foreground">
              Aucune note disponible pour le moment
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradesOverview;