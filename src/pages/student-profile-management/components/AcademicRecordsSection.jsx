import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';


const AcademicRecordsSection = ({ student }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  const academicData = {
    gradeHistory: [
      {
        year: '2024-2025',
        semester: 'Semestre 1',
        subjects: [
          { name: 'Mathématiques', grade: 16.5, coefficient: 4, teacher: 'M. Dubois' },
          { name: 'Français', grade: 14.2, coefficient: 4, teacher: 'Mme Martin' },
          { name: 'Histoire-Géographie', grade: 15.8, coefficient: 3, teacher: 'M. Bernard' },
          { name: 'Sciences Physiques', grade: 13.9, coefficient: 3, teacher: 'Mme Rousseau' },
          { name: 'Anglais', grade: 17.1, coefficient: 3, teacher: 'Ms Johnson' },
          { name: 'EPS', grade: 18.0, coefficient: 2, teacher: 'M. Leroy' }
        ],
        average: 15.4,
        rank: 8,
        totalStudents: 32
      },
      {
        year: '2023-2024',
        semester: 'Semestre 2',
        subjects: [
          { name: 'Mathématiques', grade: 15.8, coefficient: 4, teacher: 'M. Dubois' },
          { name: 'Français', grade: 13.5, coefficient: 4, teacher: 'Mme Martin' },
          { name: 'Histoire-Géographie', grade: 16.2, coefficient: 3, teacher: 'M. Bernard' },
          { name: 'Sciences Physiques', grade: 14.7, coefficient: 3, teacher: 'Mme Rousseau' },
          { name: 'Anglais', grade: 16.8, coefficient: 3, teacher: 'Ms Johnson' },
          { name: 'EPS', grade: 17.5, coefficient: 2, teacher: 'M. Leroy' }
        ],
        average: 15.1,
        rank: 12,
        totalStudents: 30
      }
    ],
    attendanceHistory: [
      {
        month: 'Décembre 2024',
        present: 18,
        absent: 2,
        late: 1,
        excused: 2,
        unexcused: 0,
        percentage: 90
      },
      {
        month: 'Novembre 2024',
        present: 20,
        absent: 1,
        late: 0,
        excused: 1,
        unexcused: 0,
        percentage: 95
      },
      {
        month: 'Octobre 2024',
        present: 22,
        absent: 0,
        late: 2,
        excused: 0,
        unexcused: 0,
        percentage: 100
      }
    ],
    behaviorAssessments: [
      {
        date: '15/12/2024',
        type: 'positive',
        category: 'Participation',
        description: 'Excellente participation en cours de mathématiques',
        teacher: 'M. Dubois',
        points: 5
      },
      {
        date: '10/12/2024',
        type: 'neutral',
        category: 'Retard',
        description: 'Arrivée en retard de 10 minutes',
        teacher: 'Mme Martin',
        points: -2
      },
      {
        date: '05/12/2024',
        type: 'positive',
        category: 'Aide aux autres',
        description: 'A aidé un camarade en difficulté',
        teacher: 'M. Bernard',
        points: 3
      }
    ]
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getGradeColor = (grade) => {
    if (grade >= 16) return 'text-success';
    if (grade >= 14) return 'text-primary';
    if (grade >= 12) return 'text-warning';
    return 'text-error';
  };

  const getBehaviorIcon = (type) => {
    switch (type) {
      case 'positive':
        return 'ThumbsUp';
      case 'negative':
        return 'ThumbsDown';
      default:
        return 'Minus';
    }
  };

  const getBehaviorColor = (type) => {
    switch (type) {
      case 'positive':
        return 'text-success bg-success/10';
      case 'negative':
        return 'text-error bg-error/10';
      default:
        return 'text-warning bg-warning/10';
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-card p-6 mb-6">
      <h2 className="font-heading font-heading-semibold text-xl text-card-foreground flex items-center mb-6">
        <Icon name="BookOpen" size={20} className="mr-2 text-primary" />
        Dossier académique
      </h2>
      <div className="space-y-4">
        {/* Grade History */}
        <div className="border border-border rounded-lg">
          <button
            onClick={() => toggleSection('grades')}
            className="w-full flex items-center justify-between p-4 hover:bg-muted transition-micro"
          >
            <div className="flex items-center space-x-3">
              <Icon name="TrendingUp" size={20} className="text-primary" />
              <span className="font-heading font-heading-semibold text-lg text-card-foreground">
                Historique des notes
              </span>
            </div>
            <Icon 
              name={expandedSection === 'grades' ? 'ChevronUp' : 'ChevronDown'} 
              size={20} 
              className="text-muted-foreground" 
            />
          </button>
          
          {expandedSection === 'grades' && (
            <div className="border-t border-border p-4">
              <div className="space-y-6">
                {academicData?.gradeHistory?.map((period, index) => (
                  <div key={index} className="bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-heading font-heading-semibold text-md text-card-foreground">
                        {period?.year} - {period?.semester}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-muted-foreground">
                          Moyenne: <span className={`font-heading font-heading-semibold ${getGradeColor(period?.average)}`}>
                            {period?.average}/20
                          </span>
                        </span>
                        <span className="text-muted-foreground">
                          Rang: {period?.rank}/{period?.totalStudents}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {period?.subjects?.map((subject, subIndex) => (
                        <div key={subIndex} className="bg-card rounded-lg p-3 border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-body font-body-semibold text-sm text-card-foreground">
                              {subject?.name}
                            </h5>
                            <span className={`font-heading font-heading-bold text-lg ${getGradeColor(subject?.grade)}`}>
                              {subject?.grade}/20
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <div>Coeff: {subject?.coefficient}</div>
                            <div>Prof: {subject?.teacher}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Attendance History */}
        <div className="border border-border rounded-lg">
          <button
            onClick={() => toggleSection('attendance')}
            className="w-full flex items-center justify-between p-4 hover:bg-muted transition-micro"
          >
            <div className="flex items-center space-x-3">
              <Icon name="Calendar" size={20} className="text-primary" />
              <span className="font-heading font-heading-semibold text-lg text-card-foreground">
                Historique de présence
              </span>
            </div>
            <Icon 
              name={expandedSection === 'attendance' ? 'ChevronUp' : 'ChevronDown'} 
              size={20} 
              className="text-muted-foreground" 
            />
          </button>
          
          {expandedSection === 'attendance' && (
            <div className="border-t border-border p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {academicData?.attendanceHistory?.map((month, index) => (
                  <div key={index} className="bg-muted rounded-lg p-4">
                    <h4 className="font-heading font-heading-semibold text-md text-card-foreground mb-3">
                      {month?.month}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Présent:</span>
                        <span className="font-body font-body-semibold text-success">{month?.present}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Absent:</span>
                        <span className="font-body font-body-semibold text-error">{month?.absent}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Retard:</span>
                        <span className="font-body font-body-semibold text-warning">{month?.late}</span>
                      </div>
                      <div className="border-t border-border pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-body font-body-semibold text-card-foreground">Taux:</span>
                          <span className={`font-heading font-heading-bold ${
                            month?.percentage >= 95 ? 'text-success' : 
                            month?.percentage >= 90 ? 'text-warning' : 'text-error'
                          }`}>
                            {month?.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Behavior Assessments */}
        <div className="border border-border rounded-lg">
          <button
            onClick={() => toggleSection('behavior')}
            className="w-full flex items-center justify-between p-4 hover:bg-muted transition-micro"
          >
            <div className="flex items-center space-x-3">
              <Icon name="Heart" size={20} className="text-primary" />
              <span className="font-heading font-heading-semibold text-lg text-card-foreground">
                Évaluations comportementales
              </span>
            </div>
            <Icon 
              name={expandedSection === 'behavior' ? 'ChevronUp' : 'ChevronDown'} 
              size={20} 
              className="text-muted-foreground" 
            />
          </button>
          
          {expandedSection === 'behavior' && (
            <div className="border-t border-border p-4">
              <div className="space-y-4">
                {academicData?.behaviorAssessments?.map((assessment, index) => (
                  <div key={index} className="bg-muted rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-full ${getBehaviorColor(assessment?.type)}`}>
                        <Icon name={getBehaviorIcon(assessment?.type)} size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-body font-body-semibold text-sm text-card-foreground">
                            {assessment?.category}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>{assessment?.date}</span>
                            <span>•</span>
                            <span>{assessment?.teacher}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {assessment?.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full ${getBehaviorColor(assessment?.type)}`}>
                            {assessment?.type === 'positive' ? 'Positif' : 
                             assessment?.type === 'negative' ? 'Négatif' : 'Neutre'}
                          </span>
                          <span className={`font-body font-body-semibold text-sm ${
                            assessment?.points > 0 ? 'text-success' : 
                            assessment?.points < 0 ? 'text-error' : 'text-muted-foreground'
                          }`}>
                            {assessment?.points > 0 ? '+' : ''}{assessment?.points} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademicRecordsSection;