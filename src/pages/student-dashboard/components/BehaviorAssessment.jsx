import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';


const BehaviorAssessment = ({ behaviorData }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  const periods = [
    { value: 'current', label: 'Trimestre actuel' },
    { value: 'previous', label: 'Trimestre précédent' },
    { value: 'year', label: 'Année complète' }
  ];

  const getBehaviorIcon = (type) => {
    switch (type) {
      case 'positive':
        return 'ThumbsUp';
      case 'improvement':
        return 'TrendingUp';
      case 'concern':
        return 'AlertTriangle';
      case 'achievement':
        return 'Award';
      default:
        return 'MessageSquare';
    }
  };

  const getBehaviorColor = (type) => {
    switch (type) {
      case 'positive':
        return 'text-success bg-success/10';
      case 'improvement':
        return 'text-primary bg-primary/10';
      case 'concern':
        return 'text-warning bg-warning/10';
      case 'achievement':
        return 'text-accent-foreground bg-accent/10';
      default:
        return 'text-muted-foreground bg-muted/10';
    }
  };

  const currentData = behaviorData?.[selectedPeriod] || behaviorData?.current;

  return (
    <div className="bg-card rounded-lg shadow-card border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">
            Évaluation Comportementale
          </h3>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e?.target?.value)}
            className="px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {periods?.map(period => (
              <option key={period?.value} value={period?.value}>
                {period?.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="p-6">
        {/* Overall Score */}
        <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-body font-body-semibold text-card-foreground mb-1">
                Score Comportemental Global
              </h4>
              <p className="font-caption font-caption-normal text-sm text-muted-foreground">
                Basé sur les observations des enseignants
              </p>
            </div>
            <div className="text-right">
              <div className="font-heading font-heading-bold text-3xl text-primary">
                {currentData?.overallScore}/5
              </div>
              <div className="flex items-center space-x-1 mt-1">
                {[...Array(5)]?.map((_, i) => (
                  <Icon
                    key={i}
                    name="Star"
                    size={16}
                    className={i < currentData?.overallScore ? 'text-accent fill-current' : 'text-muted-foreground'}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Behavior Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {currentData?.categories?.map((category) => (
            <div key={category?.id} className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-body font-body-semibold text-sm text-card-foreground">
                  {category?.name}
                </h5>
                <div className="flex items-center space-x-1">
                  {[...Array(5)]?.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < category?.score ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="font-body font-body-normal text-xs text-muted-foreground">
                {category?.description}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Comments */}
        <div className="space-y-4">
          <h4 className="font-body font-body-semibold text-card-foreground">
            Commentaires Récents
          </h4>
          {currentData?.comments?.map((comment) => (
            <div key={comment?.id} className="flex items-start space-x-3 p-4 rounded-lg border border-border">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getBehaviorColor(comment?.type)}`}>
                <Icon name={getBehaviorIcon(comment?.type)} size={16} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h6 className="font-body font-body-semibold text-sm text-card-foreground">
                    {comment?.subject} - {comment?.teacher}
                  </h6>
                  <span className="font-caption font-caption-normal text-xs text-muted-foreground">
                    {comment?.date}
                  </span>
                </div>
                <p className="font-body font-body-normal text-sm text-card-foreground mb-2">
                  {comment?.message}
                </p>
                {comment?.suggestion && (
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Icon name="Lightbulb" size={14} className="text-accent-foreground mt-0.5" />
                      <div>
                        <h6 className="font-body font-body-semibold text-xs text-accent-foreground mb-1">
                          Suggestion d'amélioration
                        </h6>
                        <p className="font-body font-body-normal text-xs text-card-foreground">
                          {comment?.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Achievements */}
        {currentData?.achievements && currentData?.achievements?.length > 0 && (
          <div className="mt-6 p-4 bg-success/5 rounded-lg border border-success/20">
            <h4 className="font-body font-body-semibold text-success mb-3 flex items-center space-x-2">
              <Icon name="Trophy" size={16} />
              <span>Réussites & Reconnaissances</span>
            </h4>
            <div className="space-y-2">
              {currentData?.achievements?.map((achievement) => (
                <div key={achievement?.id} className="flex items-center space-x-3">
                  <Icon name="Medal" size={14} className="text-accent" />
                  <span className="font-body font-body-normal text-sm text-card-foreground">
                    {achievement?.title}
                  </span>
                  <span className="font-caption font-caption-normal text-xs text-muted-foreground">
                    {achievement?.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BehaviorAssessment;