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
    <div className="bg-card rounded-lg shadow-card border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">
            Devoirs à Venir
          </h3>
          <div className="flex flex-wrap gap-2">
            {filters?.map((filterOption) => (
              <button
                key={filterOption?.value}
                onClick={() => setFilter(filterOption?.value)}
                className={`px-3 py-1 rounded-full text-xs font-caption font-caption-normal transition-micro ${
                  filter === filterOption?.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
          <div className="text-center py-8">
            <Icon name="CheckCircle" size={32} className="text-success mx-auto mb-2" />
            <p className="font-body font-body-normal text-muted-foreground">
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
                  className={`p-4 rounded-lg border transition-micro hover:shadow-sm ${
                    isOverdue ? 'bg-error/5 border-error/20' : getUrgencyColor(daysLeft)
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(assignment?.type)}`}>
                      <Icon name={getTypeIcon(assignment?.type)} size={16} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-body font-body-semibold text-card-foreground">
                          {assignment?.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {isOverdue ? (
                            <span className="bg-error text-error-foreground text-xs font-caption font-caption-normal px-2 py-1 rounded-full">
                              En retard
                            </span>
                          ) : daysLeft === 0 ? (
                            <span className="bg-warning text-warning-foreground text-xs font-caption font-caption-normal px-2 py-1 rounded-full">
                              Aujourd'hui
                            </span>
                          ) : daysLeft === 1 ? (
                            <span className="bg-error text-error-foreground text-xs font-caption font-caption-normal px-2 py-1 rounded-full">
                              Demain
                            </span>
                          ) : (
                            <span className="bg-muted text-muted-foreground text-xs font-caption font-caption-normal px-2 py-1 rounded-full">
                              {daysLeft} jours
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center space-x-1">
                          <Icon name="BookOpen" size={14} />
                          <span>{assignment?.subject}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Icon name="User" size={14} />
                          <span>{assignment?.teacher}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Icon name="Calendar" size={14} />
                          <span>{new Date(assignment.dueDate)?.toLocaleDateString('fr-FR')}</span>
                        </span>
                      </div>
                      
                      {assignment?.description && (
                        <p className="font-body font-body-normal text-sm text-card-foreground mb-3">
                          {assignment?.description}
                        </p>
                      )}
                      
                      {assignment?.resources && assignment?.resources?.length > 0 && (
                        <div className="mb-3">
                          <h6 className="font-body font-body-semibold text-xs text-muted-foreground mb-2">
                            Ressources:
                          </h6>
                          <div className="flex flex-wrap gap-2">
                            {assignment?.resources?.map((resource, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                size="sm"
                                className="text-xs h-auto py-1"
                              >
                                <Icon name="Paperclip" size={12} className="mr-1" />
                                {resource?.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {assignment?.completed ? (
                            <span className="flex items-center space-x-1 text-success text-xs">
                              <Icon name="CheckCircle" size={14} />
                              <span>Terminé</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-muted-foreground text-xs">
                              <Icon name="Clock" size={14} />
                              <span>En cours</span>
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!assignment?.completed && (
                            <Button variant="outline" size="sm">
                              <Icon name="Check" size={14} className="mr-1" />
                              Marquer terminé
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Icon name="ExternalLink" size={14} />
                          </Button>
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