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
    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-md">
            <Icon name="BookOpen" size={24} className="text-white" />
          </div>
          <h3 className="font-display font-bold text-2xl text-gray-900">
            Aperçu des Notes
          </h3>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md text-white">
          <Icon name="BarChart3" size={18} />
          <span className="font-body-bold text-sm">
            {overallAverage?.toFixed(1)}/20
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {grades?.map(subject => (
          <div key={subject?.id} className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all">
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
          <div className="text-center py-12 px-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Icon name="BookOpen" size={40} className="text-white" />
            </div>
            <p className="font-body-bold text-base text-gray-700">
              Aucune note disponible pour le moment
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradesOverview;