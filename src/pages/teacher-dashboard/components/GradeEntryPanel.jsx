import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const GradeEntryPanel = ({ classData, students }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    student: '',
    type: '',
    grade: '',
    coefficient: '1',
    description: '',
    date: new Date()?.toISOString()?.split('T')?.[0]
  });
  const [showBulkEntry, setShowBulkEntry] = useState(false);

  const evaluationTypes = [
    { value: 'controle', label: 'Contrôle', color: 'text-error' },
    { value: 'devoir', label: 'Devoir Maison', color: 'text-warning' },
    { value: 'interrogation', label: 'Interrogation', color: 'text-primary' },
    { value: 'tp', label: 'Travaux Pratiques', color: 'text-success' },
    { value: 'expose', label: 'Exposé', color: 'text-accent-foreground' }
  ];

  const coefficients = [
    { value: '1', label: 'Coefficient 1' },
    { value: '2', label: 'Coefficient 2' },
    { value: '3', label: 'Coefficient 3' },
    { value: '4', label: 'Coefficient 4' },
    { value: '5', label: 'Coefficient 5' }
  ];

  const getGradeColor = (grade) => {
    if (grade >= 16) return 'text-success';
    if (grade >= 14) return 'text-primary';
    if (grade >= 12) return 'text-warning';
    return 'text-error';
  };

  const getGradeBg = (grade) => {
    if (grade >= 16) return 'bg-success/10';
    if (grade >= 14) return 'bg-primary/10';
    if (grade >= 12) return 'bg-warning/10';
    return 'bg-error/10';
  };

  const handleGradeSubmit = (e) => {
    e?.preventDefault();
    console.log('Grade submitted:', gradeForm);
    
    // Reset form
    setGradeForm({
      student: '',
      type: '',
      grade: '',
      coefficient: '1',
      description: '',
      date: new Date()?.toISOString()?.split('T')?.[0]
    });
    
    // Show success message (in real app, this would be handled by a notification system)
    alert('Note enregistrée avec succès!');
  };

  const handleBulkSubmit = () => {
    console.log('Bulk grade entry for class:', classData?.name);
    setShowBulkEntry(false);
    alert('Saisie groupée initialisée!');
  };

  const getStudentAverage = (student) => {
    if (!student?.recentGrades?.length) return 0;
    return student?.recentGrades?.reduce((sum, grade) => sum + grade?.grade, 0) / student?.recentGrades?.length;
  };

  return (
    <div className="bg-card rounded-lg shadow-card border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-heading-semibold text-xl text-card-foreground">
          Saisie des Notes - {classData?.name}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBulkEntry(!showBulkEntry)}
            className="px-4 py-2 bg-success/10 text-success hover:bg-success/20 rounded-lg transition-colors flex items-center gap-2"
          >
            <Icon name="Users" size={16} />
            <span className="font-caption font-caption-semibold text-sm">
              Saisie groupée
            </span>
          </button>
          <div className="px-3 py-2 bg-primary/10 rounded-lg">
            <span className="font-caption font-caption-semibold text-sm text-primary">
              {students?.length} élèves
            </span>
          </div>
        </div>
      </div>
      {/* Bulk Entry Toggle */}
      {showBulkEntry && (
        <div className="mb-6 p-4 bg-success/5 border border-success/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-heading font-heading-semibold text-lg text-card-foreground mb-2">
                Saisie groupée d'évaluation
              </h4>
              <p className="font-body font-body-normal text-sm text-muted-foreground">
                Créer une évaluation pour toute la classe {classData?.name} en {classData?.subject}
              </p>
            </div>
            <button
              onClick={handleBulkSubmit}
              className="px-4 py-2 bg-success text-white hover:bg-success/90 rounded-lg transition-colors"
            >
              Démarrer
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Entry Form */}
        <div className="space-y-4">
          <h4 className="font-heading font-heading-semibold text-lg text-card-foreground">
            Nouvelle Note
          </h4>
          
          <form onSubmit={handleGradeSubmit} className="space-y-4">
            {/* Student Selection */}
            <div>
              <label className="block font-body font-body-semibold text-sm text-card-foreground mb-2">
                Élève *
              </label>
              <select
                value={gradeForm?.student}
                onChange={(e) => setGradeForm({...gradeForm, student: e?.target?.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                required
              >
                <option value="">Sélectionner un élève</option>
                {students?.map(student => (
                  <option key={student?.id} value={student?.id}>
                    {student?.name} ({student?.matricule})
                  </option>
                ))}
              </select>
            </div>

            {/* Evaluation Type */}
            <div>
              <label className="block font-body font-body-semibold text-sm text-card-foreground mb-2">
                Type d'évaluation *
              </label>
              <select
                value={gradeForm?.type}
                onChange={(e) => setGradeForm({...gradeForm, type: e?.target?.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                required
              >
                <option value="">Choisir le type</option>
                {evaluationTypes?.map(type => (
                  <option key={type?.value} value={type?.value}>
                    {type?.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade and Coefficient */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-body font-body-semibold text-sm text-card-foreground mb-2">
                  Note /20 *
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.25"
                  value={gradeForm?.grade}
                  onChange={(e) => setGradeForm({...gradeForm, grade: e?.target?.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  placeholder="15.5"
                  required
                />
              </div>
              
              <div>
                <label className="block font-body font-body-semibold text-sm text-card-foreground mb-2">
                  Coefficient
                </label>
                <select
                  value={gradeForm?.coefficient}
                  onChange={(e) => setGradeForm({...gradeForm, coefficient: e?.target?.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                >
                  {coefficients?.map(coef => (
                    <option key={coef?.value} value={coef?.value}>
                      {coef?.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-body font-body-semibold text-sm text-card-foreground mb-2">
                Description
              </label>
              <input
                type="text"
                value={gradeForm?.description}
                onChange={(e) => setGradeForm({...gradeForm, description: e?.target?.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                placeholder="Contrôle chapitre 5 - Fonctions"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block font-body font-body-semibold text-sm text-card-foreground mb-2">
                Date de l'évaluation
              </label>
              <input
                type="date"
                value={gradeForm?.date}
                onChange={(e) => setGradeForm({...gradeForm, date: e?.target?.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white font-body font-body-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="Save" size={16} />
              Enregistrer la Note
            </button>
          </form>
        </div>

        {/* Student List with Recent Grades */}
        <div className="space-y-4">
          <h4 className="font-heading font-heading-semibold text-lg text-card-foreground">
            Élèves & Notes Récentes
          </h4>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {students?.map(student => {
              const average = getStudentAverage(student);
              
              return (
                <div
                  key={student?.id}
                  className={`border border-border rounded-lg p-4 transition-all cursor-pointer ${
                    selectedStudent?.id === student?.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedStudent(selectedStudent?.id === student?.id ? null : student)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={student?.photo}
                      alt={student?.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-border"
                    />
                    <div className="flex-1">
                      <h5 className="font-heading font-heading-semibold text-sm text-card-foreground">
                        {student?.name}
                      </h5>
                      <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                        {student?.matricule}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`font-heading font-heading-bold text-lg ${getGradeColor(average)}`}>
                        {average?.toFixed(1)}/20
                      </div>
                      <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                        Moyenne
                      </p>
                    </div>
                  </div>
                  {/* Recent Grades */}
                  <div className="space-y-2">
                    <h6 className="font-caption font-caption-semibold text-xs text-muted-foreground">
                      Dernières notes:
                    </h6>
                    <div className="flex flex-wrap gap-2">
                      {student?.recentGrades?.slice(0, 3)?.map((grade, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded text-xs font-caption font-caption-semibold ${getGradeBg(grade?.grade)} ${getGradeColor(grade?.grade)}`}
                        >
                          {grade?.grade}/20 ({grade?.type})
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Expanded Details */}
                  {selectedStudent?.id === student?.id && (
                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-body font-body-semibold text-muted-foreground">Présences:</span>
                          <p className="font-body font-body-normal text-card-foreground">
                            {student?.attendance?.present} présent, {student?.attendance?.absent} absent
                          </p>
                        </div>
                        <div>
                          <span className="font-body font-body-semibold text-muted-foreground">Retards:</span>
                          <p className="font-body font-body-normal text-card-foreground">
                            {student?.attendance?.late} retard{student?.attendance?.late > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e?.stopPropagation();
                          setGradeForm({...gradeForm, student: student?.id});
                        }}
                        className="mt-3 w-full bg-primary/10 text-primary hover:bg-primary/20 py-2 px-3 rounded-lg transition-colors"
                      >
                        Attribuer une note
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {students?.length === 0 && (
            <div className="text-center py-8">
              <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-3" />
              <p className="font-body font-body-normal text-muted-foreground">
                Aucun élève dans cette classe
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeEntryPanel;