import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { supabase } from '../../../lib/supabase';

const TeacherSearchSelector = ({ 
  onTeacherSelect, 
  onCreateNew, 
  selectedTeacher, 
  searchTerm, 
  onSearchChange 
}) => {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Recherche en temps réel dans Supabase
  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        // Nettoyer le terme de recherche pour éviter les problèmes d'encodage
        const cleanSearchTerm = searchTerm.trim().replace(/[%_]/g, '');
        
        // Rechercher dans la table users avec le rôle teacher
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
          .or(`full_name.ilike.%${cleanSearchTerm}%,email.ilike.%${cleanSearchTerm}%,phone.ilike.%${cleanSearchTerm}%`);

        if (error) {
          console.error('Erreur de recherche:', error);
          setSearchResults([]);
          return;
        }

        // Formater les résultats pour correspondre au format attendu
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

        setSearchResults(formattedResults);
        setShowResults(true);
      } catch (error) {
        console.error('Erreur de recherche:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleTeacherSelect = (teacher) => {
    onTeacherSelect(teacher);
    setShowResults(false);
  };

  // Charger tous les enseignants
  const loadAllTeachers = async () => {
    setIsSearching(true);
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
        setSearchResults([]);
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

      setSearchResults(formattedResults);
      setShowResults(true);
      console.log(`✅ ${formattedResults.length} enseignant(s) chargé(s)`);
    } catch (error) {
      console.error('Exception chargement enseignants:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
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
      {/* Zone de recherche */}
      <div className="space-y-2">
        <div className="relative">
          <Input
            type="search"
            placeholder="Rechercher par nom, email ou téléphone..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pr-10"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isSearching ? (
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              <Icon name="Search" size={16} className="text-muted-foreground" />
            )}
          </div>
        </div>
        
        {/* Bouton pour afficher tous les enseignants */}
        {!searchTerm && !showResults && (
          <Button
            onClick={loadAllTeachers}
            variant="outline"
            className="w-full"
            disabled={isSearching}
          >
            <Icon name="Users" size={16} className="mr-2" />
            Afficher tous les enseignants
          </Button>
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

      {/* Résultats de recherche */}
      {showResults && searchResults.length > 0 && !selectedTeacher && (
        <div className="bg-card border border-border rounded-lg max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-border bg-muted/30">
            <p className="font-medium text-sm text-text-primary">
              {searchResults.length} enseignant(s) trouvé(s)
            </p>
          </div>
          <div className="divide-y divide-border">
            {searchResults.map((teacher) => (
              <div
                key={teacher.id}
                className="p-4 hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => handleTeacherSelect(teacher)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-heading font-heading-medium text-sm text-text-primary">
                        {teacher.fullName || `${teacher.firstName} ${teacher.lastName}`}
                      </h4>
                      {teacher.totalSchools > 1 && (
                        <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                          Multi-établissements
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mb-2">
                      {teacher.email} {teacher.phone && `• ${teacher.phone}`}
                    </p>
                    {teacher.specializations && teacher.specializations.length > 0 && (
                      <div className="mb-2">
                        {getSpecializationsBadges(teacher.specializations)}
                      </div>
                    )}
                    <p className="text-xs text-text-secondary">
                      {getAssignmentSummary(teacher)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-text-secondary">
                      Disponible
                    </div>
                    <div className={`text-sm font-medium ${teacher.availableHours > 10 ? 'text-success' : teacher.availableHours > 5 ? 'text-warning' : 'text-error'}`}>
                      {teacher.availableHours}h
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aucun résultat */}
      {showResults && searchResults.length === 0 && searchTerm.length >= 2 && !isSearching && (
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <Icon name="UserX" size={48} className="text-muted-foreground mx-auto mb-3" />
          <h4 className="font-heading font-heading-semibold text-base text-text-primary mb-2">
            Aucun enseignant trouvé
          </h4>
          <p className="text-sm text-text-secondary mb-4">
            Aucun enseignant ne correspond à votre recherche "{searchTerm}"
          </p>
          
          <div className="space-y-3">
            <div className="bg-info/5 border border-info/20 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Icon name="Lightbulb" size={16} className="text-info mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-text-primary mb-1">
                    Suggestions de recherche :
                  </p>
                  <ul className="text-xs text-text-secondary space-y-1">
                    <li>• Essayez avec le nom complet</li>
                    <li>• Recherchez par spécialisation (ex: "Mathématiques")</li>
                    <li>• Vérifiez l'email ou le numéro de téléphone</li>
                  </ul>
                </div>
              </div>
            </div>

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
              Recherchez d'abord si l'enseignant existe déjà pour éviter les doublons.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSearchSelector;