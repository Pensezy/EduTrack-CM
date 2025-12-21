import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { supabase } from '../../../lib/supabase';

const TeacherSearchSelector = ({ 
  onTeacherSelect, 
  onCreateNew, 
  selectedTeacher
}) => {
  const [allTeachers, setAllTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger tous les enseignants au montage du composant
  useEffect(() => {
    const loadAllTeachers = async () => {
      setIsLoading(true);
      try {
        const { data: teachers, error } = await supabase
          .from('users')
          .select(`
            id,
            full_name,
            email,
            phone,
            role
          `)
          .eq('role', 'teacher')
          .order('full_name', { ascending: true });

        if (error) {
          console.error('Erreur chargement enseignants:', error);
          setAllTeachers([]);
          return;
        }

        const formattedResults = (teachers || []).map(teacher => ({
          id: teacher.id,
          fullName: teacher.full_name || 'Nom inconnu',
          firstName: teacher.full_name?.split(' ')[0] || '',
          lastName: teacher.full_name?.split(' ').slice(1).join(' ') || '',
          email: teacher.email || '',
          phone: teacher.phone || '',
          specializations: [],
          assignments: [],
          totalSchools: 0,
          totalWeeklyHours: 0,
          availableHours: 40
        }));

        setAllTeachers(formattedResults);
        console.log(`✅ ${formattedResults.length} enseignant(s) chargé(s)`);
      } catch (error) {
        console.error('Exception chargement enseignants:', error);
        setAllTeachers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllTeachers();
  }, []);

  const handleSelectChange = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      onTeacherSelect(null);
      return;
    }
    const teacher = allTeachers.find(t => t.id === selectedId);
    if (teacher) {
      onTeacherSelect(teacher);
    }
  };

  const getSpecializationsBadges = (specializations) => {
    if (!specializations || specializations.length === 0) return null;
    return specializations.map((spec, index) => (
      <span 
        key={index}
        className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full mr-1 mb-1"
      >
        {spec}
      </span>
    ));
  };

  const getAssignmentSummary = (teacher) => {
    if (!teacher.assignments || teacher.assignments.length === 0) {
      return "Aucune assignation active";
    }

    const schoolNames = teacher.assignments.map(a => a.school.name).join(', ');
    return `${teacher.assignments.length} établissement(s) • ${teacher.totalWeeklyHours}h/semaine`;
  };

  return (
    <div className="space-y-4">
      {/* Liste déroulante des enseignants */}
      <div className="space-y-2">
        <label className="block font-body font-body-semibold text-sm text-text-primary mb-2">
          Sélectionner un enseignant
        </label>
        <div className="relative">
          <select
            value={selectedTeacher?.id || ''}
            onChange={handleSelectChange}
            disabled={isLoading}
            className="w-full px-4 py-3 pr-10 border border-border rounded-xl bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {isLoading ? 'Chargement des enseignants...' : '-- Choisir un enseignant --'}
            </option>
            {allTeachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.fullName} {teacher.email ? `(${teacher.email})` : ''}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {isLoading ? (
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              <Icon name="ChevronDown" size={20} className="text-muted-foreground" />
            )}
          </div>
        </div>
        
        {/* Compteur d'enseignants disponibles */}
        {!isLoading && (
          <p className="text-xs text-text-tertiary flex items-center gap-1">
            <Icon name="Users" size={12} />
            {allTeachers.length} enseignant(s) disponible(s)
          </p>
        )}
      </div>

      {/* Enseignant sélectionné */}
      {selectedTeacher && (
        <div className="bg-success/5 border border-success/20 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Icon name="UserCheck" size={24} className="text-success" />
              </div>
              <div className="flex-1">
                <h4 className="font-heading font-heading-semibold text-base text-text-primary">
                  {selectedTeacher.fullName || `${selectedTeacher.firstName} ${selectedTeacher.lastName}`}
                </h4>
                <p className="text-sm text-text-secondary">
                  {selectedTeacher.email} {selectedTeacher.phone && `• ${selectedTeacher.phone}`}
                </p>
                {selectedTeacher.specializations && selectedTeacher.specializations.length > 0 && (
                  <div className="mt-2">
                    {getSpecializationsBadges(selectedTeacher.specializations)}
                  </div>
                )}
                <p className="text-xs text-text-secondary mt-1">
                  {getAssignmentSummary(selectedTeacher)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTeacherSelect(null)}
              className="text-muted-foreground hover:text-text-primary"
            >
              <Icon name="X" size={16} />
            </Button>
          </div>

          {/* Détails des assignations actuelles */}
          {selectedTeacher.assignments && selectedTeacher.assignments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-success/20">
              <h5 className="font-medium text-sm text-text-primary mb-2">
                Assignations actuelles :
              </h5>
              <div className="space-y-2">
                {selectedTeacher.assignments.map((assignment, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-medium">{assignment.school.name}</span>
                      <span className="text-text-secondary ml-2">
                        ({assignment.classes.join(', ')})
                      </span>
                    </div>
                    <span className="bg-background px-2 py-1 rounded text-text-secondary">
                      {assignment.weeklyHours}h/sem
                    </span>
                  </div>
                ))}
              </div>

              {/* Disponibilité */}
              <div className="mt-3 p-2 bg-background/50 rounded">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">Disponibilité restante :</span>
                  <span className={`font-medium ${selectedTeacher.availableHours > 10 ? 'text-success' : selectedTeacher.availableHours > 5 ? 'text-warning' : 'text-error'}`}>
                    {selectedTeacher.availableHours}h/semaine
                  </span>
                </div>
                <div className="w-full bg-border rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full ${selectedTeacher.availableHours > 10 ? 'bg-success' : selectedTeacher.availableHours > 5 ? 'bg-warning' : 'bg-error'}`}
                    style={{ width: `${(selectedTeacher.availableHours / 40) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Aucun enseignant disponible */}
      {!isLoading && allTeachers.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <Icon name="UserX" size={48} className="text-muted-foreground mx-auto mb-3" />
          <h4 className="font-heading font-heading-semibold text-base text-text-primary mb-2">
            Aucun enseignant disponible
          </h4>
          <p className="text-sm text-text-secondary mb-4">
            Il n'y a pas encore d'enseignant enregistré dans le système
          </p>
          
          <Button
            variant="outline"
            onClick={onCreateNew}
            className="w-full"
            iconName="UserPlus"
            iconPosition="left"
          >
            Créer un nouveau compte enseignant
          </Button>
        </div>
      )}

      {/* Message d'information */}
      <div className="bg-blue/5 border border-blue/20 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={16} className="text-blue mt-0.5" />
          <div className="text-left">
            <p className="text-sm font-medium text-text-primary mb-1">
              🏫 Système Multi-Établissements
            </p>
            <p className="text-xs text-text-secondary">
              Un enseignant peut travailler dans plusieurs établissements avec un seul compte. 
              Sélectionnez un enseignant existant pour l'assigner à votre établissement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSearchSelector;