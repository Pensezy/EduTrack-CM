import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UpcomingAssignments = ({ assignments }) => {
  const [filter, setFilter] = useState('all');

  const filters = [
    { value: 'all', label: 'Tous' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'thisWeek', label: 'Cette semaine' },
    { value: 'nextWeek', label: 'Semaine prochaine' }
  ];

  const getUrgencyColor = (daysLeft) => {
    if (daysLeft <= 1) return 'text-error bg-error/10 border-error/20';
    if (daysLeft <= 3) return 'text-warning bg-warning/10 border-warning/20';
    if (daysLeft <= 7) return 'text-primary bg-primary/10 border-primary/20';
    return 'text-muted-foreground bg-muted/10 border-border';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'homework':
        return 'BookOpen';
      case 'project':
        return 'FolderOpen';
      case 'exam':
        return 'FileText';
      case 'presentation':
        return 'Presentation';
      default:
        return 'FileText';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'homework':
        return 'bg-primary/10 text-primary';
      case 'project':
        return 'bg-accent/10 text-accent-foreground';
      case 'exam':
        return 'bg-error/10 text-error';
      case 'presentation':
        return 'bg-success/10 text-success';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getDaysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filterAssignments = (assignments, filter) => {
    switch (filter) {
      case 'urgent':
        return assignments?.filter(a => getDaysLeft(a?.dueDate) <= 2);
      case 'thisWeek':
        return assignments?.filter(a => {
          const days = getDaysLeft(a?.dueDate);
          return days >= 0 && days <= 7;
        });
      case 'nextWeek':
        return assignments?.filter(a => {
          const days = getDaysLeft(a?.dueDate);
          return days > 7 && days <= 14;
        });
      default:
        return assignments;
    }
  };

  const filteredAssignments = filterAssignments(assignments, filter);
  const sortedAssignments = filteredAssignments?.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 border-b-2 border-orange-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 shadow-lg">
              <Icon name="Calendar" size={22} className="text-white" />
            </div>
            <h3 className="font-display font-bold text-xl bg-gradient-to-r from-orange-700 to-amber-700 bg-clip-text text-transparent">
              Devoirs à Venir
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters?.map((filterOption) => (
              <button
                key={filterOption?.value}
                onClick={() => setFilter(filterOption?.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg hover:scale-105 ${
                  filter === filterOption?.value
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                {filterOption?.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-6">
        {sortedAssignments?.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-200 mb-4">
              <Icon name="CheckCircle" size={40} className="text-green-600" />
            </div>
            <p className="font-body-medium text-gray-600 text-lg">
              Aucun devoir pour cette période
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAssignments?.map((assignment) => {
              const daysLeft = getDaysLeft(assignment?.dueDate);
              const isOverdue = daysLeft < 0;
              
              return (
                <div
                  key={assignment?.id}
                  className={`p-5 rounded-2xl border-2 transition-all hover:shadow-lg group ${
                    isOverdue 
                      ? 'bg-red-50/50 border-red-300 hover:border-red-400' 
                      : daysLeft <= 1 
                        ? 'bg-orange-50/50 border-orange-300 hover:border-orange-400'
                        : daysLeft <= 3
                          ? 'bg-yellow-50/50 border-yellow-300 hover:border-yellow-400'
                          : 'bg-blue-50/50 border-blue-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110 ${
                      assignment?.type === 'homework' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                      assignment?.type === 'project' ? 'bg-gradient-to-br from-purple-500 to-violet-600' :
                      assignment?.type === 'exam' ? 'bg-gradient-to-br from-red-500 to-rose-600' :
                      assignment?.type === 'presentation' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                      'bg-gradient-to-br from-gray-500 to-slate-600'
                    }`}>
                      <Icon name={getTypeIcon(assignment?.type)} size={18} className="text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-body-bold text-gray-900 text-base">
                          {assignment?.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {isOverdue ? (
                            <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                              En retard
                            </span>
                          ) : daysLeft === 0 ? (
                            <span className="bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md animate-pulse">
                              Aujourd'hui
                            </span>
                          ) : daysLeft === 1 ? (
                            <span className="bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                              Demain
                            </span>
                          ) : (
                            <span className="bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full">
                              {daysLeft} jours
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center flex-wrap gap-3 text-sm text-gray-600 mb-3">
                        <span className="flex items-center space-x-1.5 font-body-medium">
                          <Icon name="BookOpen" size={16} />
                          <span>{assignment?.subject}</span>
                        </span>
                        <span className="flex items-center space-x-1.5 font-body-medium">
                          <Icon name="User" size={16} />
                          <span>{assignment?.teacher}</span>
                        </span>
                        <span className="flex items-center space-x-1.5 font-body-medium">
                          <Icon name="Calendar" size={16} />
                          <span>{new Date(assignment.dueDate)?.toLocaleDateString('fr-FR')}</span>
                        </span>
                      </div>
                      
                      {assignment?.description && (
                        <p className="font-body text-sm text-gray-700 mb-4">
                          {assignment?.description}
                        </p>
                      )}
                      
                      {assignment?.resources && assignment?.resources?.length > 0 && (
                        <div className="mb-4">
                          <h6 className="font-body-bold text-xs text-gray-700 mb-2 flex items-center gap-2">
                            <Icon name="Paperclip" size={14} />
                            Ressources:
                          </h6>
                          <div className="flex flex-wrap gap-2">
                            {assignment?.resources?.map((resource, index) => (
                              <button
                                key={index}
                                className="px-3 py-1.5 bg-white border-2 border-gray-200 text-gray-700 text-xs font-body-medium rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md"
                              >
                                <Icon name="Paperclip" size={12} />
                                {resource?.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {assignment?.completed ? (
                            <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                              <Icon name="CheckCircle" size={14} />
                              <span>Terminé</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                              <Icon name="Clock" size={14} />
                              <span>En cours</span>
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!assignment?.completed && (
                            <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center gap-1.5">
                              <Icon name="Check" size={14} />
                              Marquer terminé
                            </button>
                          )}
                          <button className="p-2 bg-white border-2 border-gray-200 text-gray-600 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm hover:shadow-md">
                            <Icon name="ExternalLink" size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingAssignments;