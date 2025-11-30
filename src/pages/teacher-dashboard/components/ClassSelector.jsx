import React from 'react';
import Icon from '../../../components/AppIcon';

const ClassSelector = ({ classes, selectedClass, onClassSelect }) => {
  return (
    <div className="bg-card rounded-lg shadow-card border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading font-heading-semibold text-xl text-card-foreground">
          Mes Classes Assignées
        </h2>
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
          <Icon name="Users" size={16} className="text-primary" />
          <span className="font-caption font-caption-semibold text-sm text-primary">
            {classes?.length} classe{classes?.length > 1 ? 's' : ''} assignée{classes?.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes?.map(classData => {
          const isSelected = selectedClass?.id === classData?.id;

          return (
            <div
              key={classData?.id}
              onClick={() => onClassSelect(classData)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer group ${
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-border hover:border-primary/50 hover:bg-primary/2'
              }`}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="Check" size={14} className="text-white" />
                </div>
              )}

              <div className="space-y-3">
                {/* Class Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">
                    {classData?.name}
                  </h3>
                  <span className="px-2 py-1 bg-success/10 text-success rounded text-xs font-caption font-caption-semibold">
                    {classData?.subject}
                  </span>
                </div>

                {/* Class Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon name="GraduationCap" size={14} className="text-muted-foreground" />
                    <span className="font-body font-body-normal text-sm text-muted-foreground">
                      Niveau: {classData?.level}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Icon name="School" size={14} className="text-muted-foreground" />
                    <span className="font-body font-body-normal text-sm text-muted-foreground truncate">
                      {classData?.school}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Icon name="Users" size={14} className="text-muted-foreground" />
                    <span className="font-body font-body-normal text-sm text-muted-foreground">
                      {classData?.students} élèves
                    </span>
                  </div>
                </div>

                {/* Schedule Preview */}
                <div className="pt-3 border-t border-border">
                  <h4 className="font-caption font-caption-semibold text-xs text-muted-foreground mb-2">
                    Charge horaire:
                  </h4>
                  <div className="space-y-1">
                    {Array.isArray(classData?.schedule) ? (
                      // Format ancien: array d'horaires
                      <>
                        {classData?.schedule?.slice(0, 2)?.map((slot, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <span className="font-caption font-caption-normal text-muted-foreground">
                              {slot?.day}
                            </span>
                            <span className="font-caption font-caption-semibold text-primary">
                              {slot?.time}
                            </span>
                          </div>
                        ))}
                        {classData?.schedule?.length > 2 && (
                          <div className="text-xs text-center text-muted-foreground">
                            +{classData?.schedule?.length - 2} autre{classData?.schedule?.length - 2 > 1 ? 's' : ''}
                          </div>
                        )}
                      </>
                    ) : classData?.schedule?.weekly_hours ? (
                      // Format nouveau: objet JSON avec weekly_hours
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-caption font-caption-normal text-muted-foreground">
                          Heures par semaine
                        </span>
                        <span className="font-caption font-caption-semibold text-primary">
                          {classData?.schedule?.weekly_hours}h
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-center text-muted-foreground">
                        Horaire non défini
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border">
                  <div className="text-center p-2 bg-muted/20 rounded">
                    <div className="font-heading font-heading-bold text-sm text-success">
                      {classData?.average ? `${classData.average.toFixed(1)}/20` : 'N/A'}
                    </div>
                    <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                      Moy. classe
                    </p>
                  </div>
                  <div className="text-center p-2 bg-muted/20 rounded">
                    <div className="font-heading font-heading-bold text-sm text-primary">
                      {classData?.attendanceRate ? `${classData.attendanceRate}%` : 'N/A'}
                    </div>
                    <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                      Présence
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Classes Message */}
      {classes?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="font-body font-body-normal text-muted-foreground">
            Aucune classe assignée pour le moment
          </p>
          <p className="font-caption font-caption-normal text-sm text-muted-foreground mt-2">
            Contactez l'administration pour recevoir vos assignations de classes
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassSelector;