import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';

const GradeEntryPanel = ({ classData, students, onGradeAdded }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [schoolType, setSchoolType] = useState('secondaire'); // maternelle, primaire, secondaire
  const [currentSequence, setCurrentSequence] = useState('1');
  const [gradeForm, setGradeForm] = useState({
    student: '',
    type: '',
    grade: '',
    max_grade: '20',
    coefficient: '1',
    description: '',
    sequence: '1',
    trimester: '1',
    date: new Date()?.toISOString()?.split('T')?.[0]
  });
  const [showBulkEntry, setShowBulkEntry] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger le type d'établissement
  useEffect(() => {
    const loadSchoolType = async () => {
      if (classData?.school_id) {
        const { data, error } = await supabase
          .from('schools')
          .select('type')
          .eq('id', classData.school_id)
          .single();
        
        if (!error && data) {
          setSchoolType(data.type || 'secondaire');
        }
      }
    };
    loadSchoolType();
  }, [classData]);

  // Auto-calculer le trimestre selon la séquence
  useEffect(() => {
    const sequence = parseInt(gradeForm.sequence);
    let trimester = '1';
    if (sequence === 1 || sequence === 2) trimester = '1';
    else if (sequence === 3 || sequence === 4) trimester = '2';
    else if (sequence === 5 || sequence === 6) trimester = '3';
    
    setGradeForm(prev => ({ ...prev, trimester }));
  }, [gradeForm.sequence]);

  // Types d'évaluation selon le système camerounais
  const getEvaluationTypes = () => {
    if (schoolType === 'maternelle') {
      return [
        { value: 'observation', label: '🎨 Observation en classe', color: 'text-blue-600' },
        { value: 'activite', label: '🎯 Activité pratique', color: 'text-green-600' },
        { value: 'participation', label: '✋ Participation', color: 'text-purple-600' },
        { value: 'autonomie', label: '🌟 Autonomie', color: 'text-orange-600' }
      ];
    } else if (schoolType === 'primaire') {
      return [
        { value: 'evaluation_continue', label: '📝 Évaluation continue', color: 'text-blue-600' },
        { value: 'composition', label: '📚 Composition', color: 'text-red-600' },
        { value: 'exercice', label: '✏️ Exercice', color: 'text-green-600' },
        { value: 'interrogation', label: '❓ Interrogation écrite', color: 'text-purple-600' },
        { value: 'oral', label: '🗣️ Interrogation orale', color: 'text-indigo-600' }
      ];
    } else {
      // Secondaire (Collège/Lycée)
      return [
        { value: 'evaluation_sequence', label: '📋 Évaluation de séquence', color: 'text-blue-600' },
        { value: 'devoir', label: '📝 Devoir surveillé', color: 'text-purple-600' },
        { value: 'composition', label: '📚 Composition trimestrielle', color: 'text-red-600' },
        { value: 'interrogation_ecrite', label: '✍️ Interrogation écrite', color: 'text-green-600' },
        { value: 'tp', label: '🔬 Travaux Pratiques (TP)', color: 'text-cyan-600' },
        { value: 'tpe', label: '👥 Travaux Pratiques Encadrés (TPE)', color: 'text-orange-600' },
        { value: 'expose', label: '🎤 Exposé', color: 'text-pink-600' }
      ];
    }
  };

  const sequences = [
    { value: '1', label: 'Séquence 1' },
    { value: '2', label: 'Séquence 2' },
    { value: '3', label: 'Séquence 3' },
    { value: '4', label: 'Séquence 4' },
    { value: '5', label: 'Séquence 5' },
    { value: '6', label: 'Séquence 6' }
  ];

  const trimesters = [
    { value: '1', label: '1er Trimestre (Séq. 1-2)' },
    { value: '2', label: '2ème Trimestre (Séq. 3-4)' },
    { value: '3', label: '3ème Trimestre (Séq. 5-6)' }
  ];

  const coefficients = [
    { value: '1', label: 'Coefficient 1' },
    { value: '2', label: 'Coefficient 2' },
    { value: '3', label: 'Coefficient 3' },
    { value: '4', label: 'Coefficient 4' },
    { value: '5', label: 'Coefficient 5' },
    { value: '6', label: 'Coefficient 6' }
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

  const handleGradeSubmit = async (e) => {
    e?.preventDefault();
    
    // Validation
    if (!gradeForm.student || !gradeForm.type || !gradeForm.grade) {
      alert('Veuillez remplir tous les champs obligatoires (élève, type, note)');
      return;
    }

    const gradeValue = parseFloat(gradeForm.grade);
    const maxGrade = parseFloat(gradeForm.max_grade);
    
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > maxGrade) {
      alert(`La note doit être entre 0 et ${maxGrade}`);
      return;
    }

    // Déterminer le trimestre en fonction de la séquence
    let trimester = gradeForm.trimester;
    if (gradeForm.sequence === '1' || gradeForm.sequence === '2') {
      trimester = '1';
    } else if (gradeForm.sequence === '3' || gradeForm.sequence === '4') {
      trimester = '2';
    } else {
      trimester = '3';
    }

    setIsSubmitting(true);
    
    try {
      // Récupérer les informations nécessaires
      const selectedStudentData = students.find(s => s.id === gradeForm.student);
      
      // Insérer la note dans Supabase
      const { data, error } = await supabase
        .from('grades')
        .insert({
          student_id: gradeForm.student,
          school_id: classData?.school_id || selectedStudentData?.school_id,
          academic_year_id: classData?.academic_year_id,
          class_id: selectedStudentData?.class_id,
          subject_id: classData?.subject_id,
          teacher_id: classData?.teacher_id,
          grade: gradeValue,
          max_grade: maxGrade,
          grade_type: gradeForm.type,
          coefficient: parseFloat(gradeForm.coefficient),
          description: gradeForm.description || null,
          sequence: parseInt(gradeForm.sequence),
          trimester: parseInt(trimester),
          date: gradeForm.date
        })
        .select();

      if (error) {
        console.error('Erreur enregistrement note:', error);
        alert('Erreur lors de l\'enregistrement de la note: ' + error.message);
        return;
      }

      console.log('✅ Note enregistrée:', data);
      
      // Reset form
      setGradeForm({
        student: '',
        type: '',
        grade: '',
        max_grade: '20',
        coefficient: '1',
        description: '',
        sequence: currentSequence,
        trimester: trimester,
        date: new Date()?.toISOString()?.split('T')?.[0]
      });
      
      // Callback pour rafraîchir les données
      if (onGradeAdded) {
        onGradeAdded();
      }
      
      alert('Note enregistrée avec succès!');
    } catch (error) {
      console.error('Exception enregistrement note:', error);
      alert('Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkSubmit = () => {
    console.log('Bulk grade entry for class:', classData?.name);
    setShowBulkEntry(false);
    alert('Saisie groupée initialisée!');
  };

  const getStudentAverage = (student) => {
    if (!student?.recentGrades?.length) return 0;
    
    // Calculer la moyenne pondérée par coefficient
    let totalPoints = 0;
    let totalCoefficients = 0;
    
    student.recentGrades.forEach(grade => {
      const coef = grade.coefficient || 1;
      const normalizedGrade = (grade.grade / (grade.max_grade || 20)) * 20; // Normaliser sur 20
      totalPoints += normalizedGrade * coef;
      totalCoefficients += coef;
    });
    
    return totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;
  };

  const evaluationTypes = getEvaluationTypes();

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-6">
      {/* En-tête avec info sur la séquence actuelle */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6 border-2 border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-2xl text-gray-900 mb-1">
              📊 Saisie des Notes
            </h3>
            <p className="text-sm text-gray-600">
              {classData?.name} - {classData?.subject}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={currentSequence}
              onChange={(e) => {
                setCurrentSequence(e.target.value);
                setGradeForm({...gradeForm, sequence: e.target.value});
              }}
              className="px-4 py-2 bg-white border-2 border-indigo-300 rounded-lg font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {sequences.map(seq => (
                <option key={seq.value} value={seq.value}>{seq.label}</option>
              ))}
            </select>
            <div className="px-4 py-2 bg-white rounded-lg border-2 border-purple-300 shadow-md">
              <span className="font-bold text-sm text-purple-700">
                {students?.length} élève{students?.length > 1 ? 's' : ''}
              </span>
            </div>
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
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-body font-body-semibold text-sm text-card-foreground mb-2">
                  Note *
                </label>
                <input
                  type="number"
                  min="0"
                  max={gradeForm.max_grade}
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
                  Sur
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={gradeForm?.max_grade}
                  onChange={(e) => setGradeForm({...gradeForm, max_grade: e?.target?.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  placeholder="20"
                />
              </div>
              <div>
                <label className="block font-body font-body-semibold text-sm text-card-foreground mb-2">
                  Coef.
                </label>
                <select
                  value={gradeForm?.coefficient}
                  onChange={(e) => setGradeForm({...gradeForm, coefficient: e?.target?.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                >
                  {coefficients?.map(coef => (
                    <option key={coef?.value} value={coef?.value}>
                      {coef?.value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sequence and Trimester */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-body font-body-semibold text-sm text-card-foreground mb-2">
                  Séquence *
                </label>
                <select
                  value={gradeForm?.sequence}
                  onChange={(e) => setGradeForm({...gradeForm, sequence: e?.target?.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  required
                >
                  {sequences.map(seq => (
                    <option key={seq.value} value={seq.value}>{seq.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-body font-body-semibold text-sm text-card-foreground mb-2">
                  Trimestre
                </label>
                <select
                  value={gradeForm?.trimester}
                  onChange={(e) => setGradeForm({...gradeForm, trimester: e?.target?.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  disabled
                >
                  {trimesters.map(tri => (
                    <option key={tri.value} value={tri.value}>{tri.label}</option>
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
              disabled={isSubmitting}
              className="w-full bg-primary text-white font-body font-body-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="Save" size={16} />
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer la Note'}
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-white">
                      {student?.name?.charAt(0)?.toUpperCase() || 'E'}
                    </div>
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