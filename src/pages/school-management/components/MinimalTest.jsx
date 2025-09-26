import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import SimpleInput from '../../../components/ui/SimpleInput';
import SimpleSelect from '../../../components/ui/SimpleSelect';
import SimpleButton from '../../../components/ui/SimpleButton';

const WorkingSchoolRegistrationForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    schoolName: '',
    directorName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    schoolType: '',
    country: '',
    city: '',
    availableClasses: []
  });

  const handleSchoolTypeChange = (value) => {
    console.log('School type changed:', value);
    setFormData(prev => ({
      ...prev,
      schoolType: value
    }));
  };

  // Classes disponibles selon le type d'établissement
  const getAvailableClassesByType = (schoolType) => {
    switch (schoolType) {
      case 'primary':
        return [
          { value: 'CP1', label: 'CP1 (Cours Préparatoire 1)', category: 'primaire' },
          { value: 'CP2', label: 'CP2 (Cours Préparatoire 2)', category: 'primaire' },
          { value: 'CE1', label: 'CE1 (Cours Élémentaire 1)', category: 'primaire' },
          { value: 'CE2', label: 'CE2 (Cours Élémentaire 2)', category: 'primaire' },
          { value: 'CM1', label: 'CM1 (Cours Moyen 1)', category: 'primaire' },
          { value: 'CM2', label: 'CM2 (Cours Moyen 2)', category: 'primaire' }
        ];
      case 'college':
        return [
          { value: '6ème', label: '6ème', category: 'collège' },
          { value: '5ème', label: '5ème', category: 'collège' },
          { value: '4ème', label: '4ème', category: 'collège' },
          { value: '3ème', label: '3ème', category: 'collège' }
        ];
      case 'high_school':
        return [
          { value: '2nd', label: '2nd (Seconde)', category: 'lycée' },
          { value: '1ère', label: '1ère (Première)', category: 'lycée' },
          { value: 'Terminale', label: 'Terminale', category: 'lycée' }
        ];
      case 'secondary':
        return [
          { value: '6ème', label: '6ème', category: 'collège' },
          { value: '5ème', label: '5ème', category: 'collège' },
          { value: '4ème', label: '4ème', category: 'collège' },
          { value: '3ème', label: '3ème', category: 'collège' },
          { value: '2nd', label: '2nd (Seconde)', category: 'lycée' },
          { value: '1ère', label: '1ère (Première)', category: 'lycée' },
          { value: 'Terminale', label: 'Terminale', category: 'lycée' }
        ];
      default:
        return [];
    }
  };

  // Mettre à jour les classes disponibles quand le type change
  useEffect(() => {
    if (!formData.schoolType) return;
    
    const availableClasses = getAvailableClassesByType(formData.schoolType);
    setFormData(prev => ({
      ...prev,
      availableClasses: availableClasses.map(cls => ({ 
        level: cls.value, 
        isActive: false, 
        category: cls.category,
        label: cls.label
      }))
    }));
  }, [formData.schoolType]);

  const handleClassToggle = useCallback((classLevel) => {
    console.log('Class toggle:', classLevel);
    
    setFormData(prev => {
      if (!prev.availableClasses || prev.availableClasses.length === 0) {
        return prev;
      }
      
      return {
        ...prev,
        availableClasses: prev.availableClasses.map(cls => 
          cls.level === classLevel 
            ? { ...cls, isActive: !cls.isActive }
            : cls
        )
      };
    });
  }, []);

  // Mémoriser le rendu des catégories
  const categorizedClasses = useMemo(() => {
    if (!formData.availableClasses || formData.availableClasses.length === 0) {
      return [];
    }
    
    const validClasses = formData.availableClasses.filter(cls => 
      cls && cls.category && cls.level
    );
    
    const categories = [...new Set(validClasses.map(cls => cls.category))];
    return categories.map(category => ({
      category,
      classes: validClasses.filter(cls => cls.category === category)
    }));
  }, [formData.availableClasses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.schoolName || !formData.directorName || !formData.email || 
        !formData.password || !formData.phone || !formData.address || 
        !formData.schoolType) {
      setError('Veuillez remplir tous les champs obligatoires');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    const selectedClasses = formData.availableClasses ? formData.availableClasses.filter(cls => cls.isActive) : [];
    if (selectedClasses.length === 0) {
      setError('Veuillez sélectionner au moins une classe');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'school_director',
          }
        }
      });

      if (authError) throw authError;

      // Create school profile
      const selectedClasses = formData.availableClasses && formData.availableClasses.length > 0
        ? formData.availableClasses.filter(cls => cls.isActive).map(cls => cls.level)
        : [];

      const { error: profileError } = await supabase
        .from('schools')
        .insert([
          {
            name: formData.schoolName,
            director_name: formData.directorName,
            type: formData.schoolType,
            phone: formData.phone,
            address: formData.address,
            available_classes: selectedClasses,
            director_user_id: authData.user?.id,
            status: 'pending_validation'
          }
        ]);

      if (profileError) throw profileError;

      onSuccess?.();
    } catch (error) {
      console.error('Error during registration:', error);
      setError(error.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SimpleInput
            label="Nom de l'établissement"
            value={formData.schoolName}
            onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
            required
          />
          
          <SimpleInput
            label="Nom du directeur"
            value={formData.directorName}
            onChange={(e) => setFormData(prev => ({ ...prev, directorName: e.target.value }))}
            required
          />

          <SimpleInput
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />

          <SimpleInput
            label="Téléphone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            required
          />
        </div>

        <SimpleSelect
          label="Type d'établissement"
          value={formData.schoolType}
          onChange={handleSchoolTypeChange}
          options={[
            { value: 'primary', label: 'École Primaire' },
            { value: 'secondary', label: 'Établissement Secondaire' },
            { value: 'college', label: 'Collège' },
            { value: 'high_school', label: 'Lycée' }
          ]}
          placeholder="Sélectionner un type"
          required
        />

        {categorizedClasses && categorizedClasses.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Classes disponibles:</h3>
            <div className="space-y-4">
              {categorizedClasses.map(({ category, classes }) => (
                <div key={`category-${category}`}>
                  <h4 className="font-medium text-gray-900 mb-3 capitalize">
                    Classes {category}
                  </h4>
                  <div className="space-y-2">
                    {classes && classes.length > 0 ? classes
                      .filter(classItem => classItem && classItem.level && classItem.category)
                      .map((classItem) => (
                      <button
                        key={`class-${classItem.category}-${classItem.level}`}
                        type="button"
                        className={`p-2 border rounded w-full text-left ${
                          classItem.isActive ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300'
                        }`}
                        onClick={() => handleClassToggle(classItem.level)}
                      >
                        <span className="mr-2">{classItem.isActive ? '✓' : '+'}</span>
                        {classItem?.level || 'Classe inconnue'} - {classItem?.label || 'Libellé non disponible'}
                      </button>
                    )) : (
                      <p className="text-gray-500 text-sm">Aucune classe disponible dans cette catégorie</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Champs manquants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SimpleInput
            label="Mot de passe"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <SimpleInput
            label="Confirmer le mot de passe"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <SimpleInput
          label="Adresse complète"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2">
            <span>⚠️</span>
            <span className="text-sm">{error}</span>
          </div>
        )}

        <SimpleButton 
          type="submit" 
          className="w-full"
          loading={loading}
        >
          Inscrire l'établissement
        </SimpleButton>
      </form>
  );
};

export default WorkingSchoolRegistrationForm;