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
    <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b-2 border-purple-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg">
              <Icon name="Heart" size={22} className="text-white" />
            </div>
            <h3 className="font-display font-bold text-xl bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
              Évaluation Comportementale
            </h3>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e?.target?.value)}
            className="px-4 py-2.5 border-2 border-purple-200 rounded-xl bg-white text-gray-800 text-sm font-body-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-md"
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
        {/* Overall Score - Modernisé */}
        <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-body-bold text-gray-900 mb-2 text-lg">
                Score Comportemental Global
              </h4>
              <p className="font-body text-sm text-gray-600">
                Basé sur les observations des enseignants
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-display font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {currentData?.overallScore}/5
              </div>
              <div className="flex items-center space-x-1 mt-2">
                {[...Array(5)]?.map((_, i) => (
                  <Icon
                    key={i}
                    name="Star"
                    size={18}
                    className={i < currentData?.overallScore ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Behavior Categories - Modernisé */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {currentData?.categories?.map((category) => (
            <div key={category?.id} className="p-5 border-2 border-purple-200 rounded-2xl bg-white shadow-md hover:shadow-lg transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-body-bold text-sm text-gray-900">
                  {category?.name}
                </h5>
                <div className="flex items-center space-x-1.5">
                  {[...Array(5)]?.map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all ${
                        i < category?.score ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-md' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="font-body text-xs text-gray-600">
                {category?.description}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Comments - Modernisé */}
        <div className="space-y-4">
          <h4 className="font-body-bold text-gray-900 text-base flex items-center gap-2">
            <Icon name="MessageSquare" size={20} className="text-purple-600" />
            Commentaires Récents
          </h4>
          {currentData?.comments?.map((comment) => (
            <div key={comment?.id} className="flex items-start space-x-4 p-5 rounded-2xl border-2 border-gray-200 bg-white shadow-md hover:shadow-lg transition-all hover:border-purple-300">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
                comment?.type === 'positive' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                comment?.type === 'improvement' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                comment?.type === 'concern' ? 'bg-gradient-to-br from-orange-500 to-amber-600' :
                comment?.type === 'achievement' ? 'bg-gradient-to-br from-purple-500 to-violet-600' :
                'bg-gradient-to-br from-gray-500 to-slate-600'
              }`}>
                <Icon name={getBehaviorIcon(comment?.type)} size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="font-body-bold text-sm text-gray-900">
                    {comment?.subject} - {comment?.teacher}
                  </h6>
                  <span className="font-body-medium text-xs text-gray-500">
                    {comment?.date}
                  </span>
                </div>
                <p className="font-body text-sm text-gray-700 mb-3">
                  {comment?.message}
                </p>
                {comment?.suggestion && (
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-200">
                    <div className="flex items-start space-x-2">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600">
                        <Icon name="Lightbulb" size={16} className="text-white" />
                      </div>
                      <div>
                        <h6 className="font-body-bold text-xs text-gray-900 mb-1">
                          Suggestion d'amélioration
                        </h6>
                        <p className="font-body text-xs text-gray-700">
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

        {/* Achievements - Modernisé */}
        {currentData?.achievements && currentData?.achievements?.length > 0 && (
          <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 shadow-lg">
            <h4 className="font-body-bold text-lg bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-4 flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600">
                <Icon name="Trophy" size={18} className="text-white" />
              </div>
              <span>Réussites & Reconnaissances</span>
            </h4>
            <div className="space-y-3">
              {currentData?.achievements?.map((achievement) => (
                <div key={achievement?.id} className="flex items-center space-x-3 p-3 bg-white rounded-xl border-2 border-green-100 shadow-sm hover:shadow-md transition-all">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600">
                    <Icon name="Medal" size={16} className="text-white" />
                  </div>
                  <span className="font-body-medium text-sm text-gray-800 flex-1">
                    {achievement?.title}
                  </span>
                  <span className="font-body-medium text-xs text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
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