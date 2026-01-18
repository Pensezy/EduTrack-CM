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
    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
      <div className="p-6 border-b-2 border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mr-3 shadow-md">
              <Icon name="Award" size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Mes Notes
              </h3>
              <p className="text-xs text-gray-500">Résultats par matière</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-400 text-blue-700 hover:shadow-md transition-all">
            <Icon name="Download" size={16} className="mr-2" />
            Exporter
          </Button>
        </div>
      </div>
      <div className="p-6 space-y-3">
        {grades?.map((subject) => (
          <div key={subject?.id} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-all hover:shadow-md">
            <button
              onClick={() => toggleSubject(subject?.id)}
              className="w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-14 h-14 rounded-xl ${getGradeBg(subject?.average)} flex items-center justify-center shadow-md border-2 ${
                  subject?.average >= 16 ? 'border-green-300' :
                  subject?.average >= 12 ? 'border-blue-300' :
                  subject?.average >= 10 ? 'border-orange-300' : 'border-red-300'
                }`}>
                  <span className={`font-heading font-heading-bold text-xl ${getGradeColor(subject?.average)}`}>
                    {subject?.average}
                  </span>
                </div>
                <div className="text-left">
                  <h4 className="font-body font-body-semibold text-gray-900 text-base">
                    {subject?.name}
                  </h4>
                  <p className="font-caption font-caption-normal text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {subject?.assignments?.length} évals
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-xs">Coeff. {subject?.coefficient}</span>
                  </p>
                </div>
              </div>
              <Icon 
                name={expandedSubjects?.has(subject?.id) ? "ChevronUp" : "ChevronDown"} 
                size={20} 
                className="text-gray-400"
              />
            </button>

            {expandedSubjects?.has(subject?.id) && (
              <div className="p-4 bg-white space-y-2">
                {subject?.assignments?.map((assignment) => (
                  <div key={assignment?.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-sm transition-all">
                    <div className="flex-1">
                      <h5 className="font-body font-body-semibold text-sm text-gray-900">
                        {assignment?.name}
                      </h5>
                      <div className="flex items-center space-x-3 mt-1.5">
                        <span className="font-caption font-caption-normal text-xs text-gray-500 flex items-center gap-1">
                          <Icon name="Calendar" size={12} />
                          {assignment?.date}
                        </span>
                        <span className={`font-caption font-caption-semibold text-xs px-2.5 py-1 rounded-full ${
                          assignment?.type === 'Contrôle' ? 'bg-red-100 text-red-700 border border-red-200' :
                          assignment?.type === 'Devoir'? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          {assignment?.type}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-heading font-heading-bold text-xl ${getGradeColor(assignment?.grade)}`}>
                        {assignment?.grade}<span className="text-sm text-gray-400">/20</span>
                      </div>
                      <div className="font-caption font-caption-normal text-xs text-gray-500 mt-0.5">
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