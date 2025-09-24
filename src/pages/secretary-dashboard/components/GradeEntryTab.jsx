import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const GradeEntryTab = () => {
  const [selectedClass, setSelectedClass] = useState('CM2');
  const [selectedSubject, setSelectedSubject] = useState('Mathématiques');
  const [expandedStudent, setExpandedStudent] = useState(null);

  const classOptions = [
    { value: 'CE1', label: 'CE1' },
    { value: 'CE2', label: 'CE2' },
    { value: 'CM1', label: 'CM1' },
    { value: 'CM2', label: 'CM2' }
  ];

  const subjectOptions = [
    { value: 'Mathématiques', label: 'Mathématiques' },
    { value: 'Français', label: 'Français' },
    { value: 'Sciences', label: 'Sciences' },
    { value: 'Histoire-Géographie', label: 'Histoire-Géographie' },
    { value: 'Arts Plastiques', label: 'Arts Plastiques' },
    { value: 'Éducation Physique', label: 'Éducation Physique' }
  ];

  const students = [
    {
      id: 1,
      name: "Marie Dubois",
      studentId: "STU001",
      grades: {
        'Mathématiques': [
          { type: 'Devoir', date: '15/11/2024', grade: 16, maxGrade: 20, coefficient: 2 },
          { type: 'Contrôle', date: '08/11/2024', grade: 14, maxGrade: 20, coefficient: 3 },
          { type: 'Exercice', date: '01/11/2024', grade: 18, maxGrade: 20, coefficient: 1 }
        ],
        'Français': [
          { type: 'Dictée', date: '12/11/2024', grade: 15, maxGrade: 20, coefficient: 2 },
          { type: 'Rédaction', date: '05/11/2024', grade: 17, maxGrade: 20, coefficient: 3 }
        ]
      }
    },
    {
      id: 2,
      name: "Pierre Martin",
      studentId: "STU002",
      grades: {
        'Mathématiques': [
          { type: 'Devoir', date: '15/11/2024', grade: 12, maxGrade: 20, coefficient: 2 },
          { type: 'Contrôle', date: '08/11/2024', grade: 13, maxGrade: 20, coefficient: 3 }
        ],
        'Français': [
          { type: 'Dictée', date: '12/11/2024', grade: 14, maxGrade: 20, coefficient: 2 }
        ]
      }
    },
    {
      id: 3,
      name: "Lucas Bernard",
      studentId: "STU004",
      grades: {
        'Mathématiques': [
          { type: 'Devoir', date: '15/11/2024', grade: 18, maxGrade: 20, coefficient: 2 },
          { type: 'Contrôle', date: '08/11/2024', grade: 16, maxGrade: 20, coefficient: 3 },
          { type: 'Exercice', date: '01/11/2024', grade: 19, maxGrade: 20, coefficient: 1 }
        ],
        'Français': [
          { type: 'Dictée', date: '12/11/2024', grade: 16, maxGrade: 20, coefficient: 2 },
          { type: 'Rédaction', date: '05/11/2024', grade: 18, maxGrade: 20, coefficient: 3 }
        ]
      }
    }
  ];

  const calculateAverage = (grades) => {
    if (!grades || grades?.length === 0) return 0;
    
    const totalPoints = grades?.reduce((sum, grade) => sum + (grade?.grade * grade?.coefficient), 0);
    const totalCoefficients = grades?.reduce((sum, grade) => sum + grade?.coefficient, 0);
    
    return totalCoefficients > 0 ? (totalPoints / totalCoefficients)?.toFixed(1) : 0;
  };

  const getGradeColor = (grade, maxGrade) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-error';
  };

  const handleAddGrade = (studentId) => {
    console.log('Add grade for student:', studentId);
  };

  const handleBulkUpdate = () => {
    console.log('Bulk update grades for class:', selectedClass, 'subject:', selectedSubject);
  };

  const handleExportGrades = () => {
    console.log('Export grades for class:', selectedClass);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading font-heading-bold text-xl text-text-primary">
            Saisie des Notes
          </h2>
          <p className="font-body font-body-normal text-sm text-text-secondary mt-1">
            Gérez les notes et évaluations des élèves
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            onClick={handleExportGrades}
          >
            Exporter
          </Button>
          <Button
            variant="default"
            iconName="Upload"
            iconPosition="left"
            onClick={handleBulkUpdate}
          >
            Mise à jour groupée
          </Button>
        </div>
      </div>
      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Classe"
            options={classOptions}
            value={selectedClass}
            onChange={setSelectedClass}
          />
          <Select
            label="Matière"
            options={subjectOptions}
            value={selectedSubject}
            onChange={setSelectedSubject}
          />
        </div>
      </div>
      {/* Students Grade List */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
              {selectedClass} - {selectedSubject}
            </h3>
            <span className="font-caption font-caption-normal text-sm text-text-secondary">
              {students?.length} élèves
            </span>
          </div>
        </div>

        <div className="divide-y divide-border">
          {students?.map((student) => {
            const studentGrades = student?.grades?.[selectedSubject] || [];
            const average = calculateAverage(studentGrades);
            const isExpanded = expandedStudent === student?.id;

            return (
              <div key={student?.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setExpandedStudent(isExpanded ? null : student?.id)}
                      className="flex items-center space-x-3 text-left hover:bg-muted/50 rounded-lg p-2 transition-micro"
                    >
                      <Icon 
                        name={isExpanded ? "ChevronDown" : "ChevronRight"} 
                        size={16} 
                        className="text-text-secondary"
                      />
                      <div>
                        <p className="font-body font-body-semibold text-sm text-text-primary">
                          {student?.name}
                        </p>
                        <p className="font-caption font-caption-normal text-xs text-text-secondary">
                          ID: {student?.studentId}
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className={`font-heading font-heading-bold text-lg ${getGradeColor(average, 20)}`}>
                        {average}/20
                      </p>
                      <p className="font-caption font-caption-normal text-xs text-text-secondary">
                        Moyenne
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-caption font-caption-normal text-xs text-text-secondary">
                        {studentGrades?.length} notes
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAddGrade(student?.id)}
                        title="Ajouter une note"
                      >
                        <Icon name="Plus" size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Expanded Grade Details */}
                {isExpanded && (
                  <div className="mt-4 pl-8 space-y-3">
                    {studentGrades?.length === 0 ? (
                      <div className="text-center py-4">
                        <Icon name="FileText" size={32} className="text-muted-foreground mx-auto mb-2" />
                        <p className="font-body font-body-normal text-sm text-text-secondary">
                          Aucune note enregistrée pour cette matière
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {studentGrades?.map((grade, index) => (
                          <div key={index} className="bg-muted rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-caption font-caption-normal text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                                {grade?.type}
                              </span>
                              <span className="font-caption font-caption-normal text-xs text-text-secondary">
                                Coef. {grade?.coefficient}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={`font-heading font-heading-bold text-lg ${getGradeColor(grade?.grade, grade?.maxGrade)}`}>
                                {grade?.grade}/{grade?.maxGrade}
                              </span>
                              <span className="font-caption font-caption-normal text-xs text-text-secondary">
                                {grade?.date}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Quick Add Grade Form */}
                    <div className="bg-accent/5 rounded-lg p-4 mt-4">
                      <h4 className="font-heading font-heading-semibold text-sm text-text-primary mb-3">
                        Ajouter une note rapide
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <Select
                          placeholder="Type d'évaluation"
                          options={[
                            { value: 'Devoir', label: 'Devoir' },
                            { value: 'Contrôle', label: 'Contrôle' },
                            { value: 'Exercice', label: 'Exercice' },
                            { value: 'Oral', label: 'Oral' }
                          ]}
                        />
                        <Input
                          type="number"
                          placeholder="Note"
                          min="0"
                          max="20"
                        />
                        <Input
                          type="number"
                          placeholder="Coefficient"
                          min="1"
                          max="5"
                        />
                        <Button variant="outline" size="sm">
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Class Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={20} className="text-success" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-lg text-text-primary">
                15.2/20
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Moyenne de classe
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Users" size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-lg text-text-primary">
                {students?.length}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Élèves évalués
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Icon name="FileText" size={20} className="text-warning" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-lg text-text-primary">
                12
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Notes cette semaine
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeEntryTab;