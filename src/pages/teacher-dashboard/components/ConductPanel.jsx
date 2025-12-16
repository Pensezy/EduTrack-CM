import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';

/**
 * Panneau de gestion du comportement/conduite (Vie Scolaire)
 * Séparé des notes académiques selon le système camerounais
 */
const ConductPanel = ({ classData, students = [], onConductSaved }) => {
  const [conductData, setConductData] = useState({});
  const [selectedSequence, setSelectedSequence] = useState('1');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const conductCategories = [
    { id: 'assiduity', label: 'Assiduité', icon: '📅', max: 20 },
    { id: 'punctuality', label: 'Ponctualité', icon: '⏰', max: 20 },
    { id: 'discipline', label: 'Discipline', icon: '📋', max: 20 },
    { id: 'respect', label: 'Respect', icon: '🤝', max: 20 },
    { id: 'participation', label: 'Participation', icon: '✋', max: 20 },
    { id: 'presentation', label: 'Tenue/Présentation', icon: '👔', max: 20 }
  ];

  const appreciations = [
    { value: 'excellent', label: 'Excellent', color: 'bg-green-500' },
    { value: 'tres_bien', label: 'Très bien', color: 'bg-blue-500' },
    { value: 'bien', label: 'Bien', color: 'bg-cyan-500' },
    { value: 'assez_bien', label: 'Assez bien', color: 'bg-yellow-500' },
    { value: 'passable', label: 'Passable', color: 'bg-orange-500' },
    { value: 'insuffisant', label: 'Insuffisant', color: 'bg-red-500' }
  ];

  // Charger les données de conduite existantes
  useEffect(() => {
    const loadConductData = async () => {
      if (!classData?.class_id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('student_conduct')
          .select('*')
          .eq('class_id', classData.class_id)
          .eq('sequence', parseInt(selectedSequence));

        if (error) {
          console.warn('Erreur chargement conduite:', error);
          return;
        }

        const conductMap = {};
        (data || []).forEach(record => {
          conductMap[record.student_id] = {
            id: record.id,
            assiduity: record.assiduity || 0,
            punctuality: record.punctuality || 0,
            discipline: record.discipline || 0,
            respect: record.respect || 0,
            participation: record.participation || 0,
            presentation: record.presentation || 0,
            appreciation: record.appreciation || '',
            comment: record.comment || ''
          };
        });

        setConductData(conductMap);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConductData();
  }, [classData, selectedSequence]);

  const handleConductChange = (studentId, field, value) => {
    setConductData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [field]: value
      }
    }));
  };

  const calculateConductAverage = (studentId) => {
    const data = conductData[studentId];
    if (!data) return 0;
    
    const scores = conductCategories.map(cat => data[cat.id] || 0);
    const total = scores.reduce((a, b) => a + b, 0);
    return (total / conductCategories.length).toFixed(2);
  };

  const getConductMention = (average) => {
    const avg = parseFloat(average);
    if (avg >= 18) return { label: 'Excellent', color: 'text-green-600' };
    if (avg >= 16) return { label: 'Très bien', color: 'text-blue-600' };
    if (avg >= 14) return { label: 'Bien', color: 'text-cyan-600' };
    if (avg >= 12) return { label: 'Assez bien', color: 'text-yellow-600' };
    if (avg >= 10) return { label: 'Passable', color: 'text-orange-500' };
    return { label: 'Insuffisant', color: 'text-red-600' };
  };

  const saveConductData = async () => {
    setSaving(true);
    try {
      const rows = Object.entries(conductData).map(([studentId, data]) => ({
        id: data.id || undefined,
        student_id: studentId,
        class_id: classData.class_id,
        school_id: classData.school_id,
        sequence: parseInt(selectedSequence),
        trimester: Math.ceil(parseInt(selectedSequence) / 2),
        assiduity: data.assiduity || 0,
        punctuality: data.punctuality || 0,
        discipline: data.discipline || 0,
        respect: data.respect || 0,
        participation: data.participation || 0,
        presentation: data.presentation || 0,
        average: parseFloat(calculateConductAverage(studentId)),
        appreciation: data.appreciation || null,
        comment: data.comment || null
      }));

      const { error } = await supabase
        .from('student_conduct')
        .upsert(rows, { onConflict: ['student_id', 'class_id', 'sequence'] });

      if (error) throw error;

      alert('Notes de conduite enregistrées avec succès!');
      if (onConductSaved) onConductSaved();
    } catch (err) {
      console.error('Erreur sauvegarde conduite:', err);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading font-bold text-xl flex items-center gap-2">
            📋 Notes de Vie Scolaire
          </h3>
          <p className="text-sm text-muted-foreground">
            {classData?.name} — Évaluation du comportement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedSequence}
            onChange={(e) => setSelectedSequence(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background"
          >
            {[1, 2, 3, 4, 5, 6].map(seq => (
              <option key={seq} value={seq}>Séquence {seq}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Légende des catégories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
        {conductCategories.map(cat => (
          <div key={cat.id} className="text-center">
            <span className="text-2xl">{cat.icon}</span>
            <p className="text-xs text-muted-foreground">{cat.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Icon name="Loader2" className="animate-spin mx-auto mb-2" size={32} />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : (
        <>
          {/* Liste des élèves */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {students.map(student => {
              const avg = calculateConductAverage(student.id);
              const mention = getConductMention(avg);
              
              return (
                <div key={student.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">
                        {student.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.matricule}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{avg}/20</p>
                      <p className={`text-xs font-semibold ${mention.color}`}>{mention.label}</p>
                    </div>
                  </div>

                  {/* Notes par catégorie */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
                    {conductCategories.map(cat => (
                      <div key={cat.id}>
                        <label className="text-xs text-muted-foreground">{cat.icon} {cat.label}</label>
                        <input
                          type="number"
                          min="0"
                          max={cat.max}
                          step="0.5"
                          value={conductData[student.id]?.[cat.id] || ''}
                          onChange={(e) => handleConductChange(student.id, cat.id, parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-border rounded text-center text-sm"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Appréciation et commentaire */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Appréciation</label>
                      <select
                        value={conductData[student.id]?.appreciation || ''}
                        onChange={(e) => handleConductChange(student.id, 'appreciation', e.target.value)}
                        className="w-full px-3 py-1.5 border border-border rounded text-sm"
                      >
                        <option value="">-- Sélectionner --</option>
                        {appreciations.map(app => (
                          <option key={app.value} value={app.value}>{app.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Observation</label>
                      <input
                        type="text"
                        value={conductData[student.id]?.comment || ''}
                        onChange={(e) => handleConductChange(student.id, 'comment', e.target.value)}
                        className="w-full px-3 py-1.5 border border-border rounded text-sm"
                        placeholder="Observation du prof principal..."
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {students.length === 0 && (
            <div className="text-center py-8">
              <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aucun élève dans cette classe</p>
            </div>
          )}

          {/* Bouton sauvegarder */}
          <div className="mt-6 pt-4 border-t border-border flex justify-end">
            <button
              onClick={saveConductData}
              disabled={saving}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <Icon name="Loader2" className="animate-spin" size={16} />
              ) : (
                <Icon name="Save" size={16} />
              )}
              Enregistrer les notes de conduite
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ConductPanel;
