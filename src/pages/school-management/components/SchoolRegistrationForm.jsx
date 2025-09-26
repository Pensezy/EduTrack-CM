import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import SimpleInput from '../../../components/ui/SimpleInput';
import SimpleSelect from '../../../components/ui/SimpleSelect';
import Button from '../../../components/ui/Button';

const SchoolRegistrationForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
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
  const [error, setError] = useState(null);

  // Debug - pour voir les changements
  useEffect(() => {
    console.log('FormData updated:', {
      schoolType: formData.schoolType,
      availableClassesLength: formData.availableClasses?.length || 0,
      availableClasses: formData.availableClasses
    });
  }, [formData.schoolType, formData.availableClasses]);

  // Données des pays et villes
  const countryData = {
    'cameroon': {
      label: 'Cameroun',
      cities: [
        { value: 'yaounde', label: 'Yaoundé' },
        { value: 'douala', label: 'Douala' },
        { value: 'bamenda', label: 'Bamenda' },
        { value: 'bafoussam', label: 'Bafoussam' },
        { value: 'garoua', label: 'Garoua' },
        { value: 'maroua', label: 'Maroua' },
        { value: 'ngaoundere', label: 'Ngaoundéré' },
        { value: 'bertoua', label: 'Bertoua' },
        { value: 'ebolowa', label: 'Ebolowa' },
        { value: 'kumba', label: 'Kumba' }
      ]
    },
    'france': {
      label: 'France',
      cities: [
        { value: 'paris', label: 'Paris' },
        { value: 'marseille', label: 'Marseille' },
        { value: 'lyon', label: 'Lyon' },
        { value: 'toulouse', label: 'Toulouse' },
        { value: 'nice', label: 'Nice' },
        { value: 'nantes', label: 'Nantes' },
        { value: 'strasbourg', label: 'Strasbourg' },
        { value: 'montpellier', label: 'Montpellier' },
        { value: 'bordeaux', label: 'Bordeaux' },
        { value: 'lille', label: 'Lille' }
      ]
    },
    'senegal': {
      label: 'Sénégal',
      cities: [
        { value: 'dakar', label: 'Dakar' },
        { value: 'thies', label: 'Thiès' },
        { value: 'kaolack', label: 'Kaolack' },
        { value: 'ziguinchor', label: 'Ziguinchor' },
        { value: 'saint_louis', label: 'Saint-Louis' },
        { value: 'tambacounda', label: 'Tambacounda' },
        { value: 'mbour', label: 'Mbour' },
        { value: 'diourbel', label: 'Diourbel' }
      ]
    }
  };

  const countryOptions = Object.keys(countryData).map(key => ({
    value: key,
    label: countryData[key].label
  }));

  const getCityOptions = () => {
    if (!formData.country || !countryData[formData.country]) {
      return [];
    }
    return countryData[formData.country].cities;
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
      case 'institut':
        return [
          { value: 'BTS1', label: 'BTS 1ère année', category: 'supérieur' },
          { value: 'BTS2', label: 'BTS 2ème année', category: 'supérieur' },
          { value: 'DUT1', label: 'DUT 1ère année', category: 'supérieur' },
          { value: 'DUT2', label: 'DUT 2ème année', category: 'supérieur' }
        ];
      case 'university':
        return [
          { value: 'L1', label: 'Licence 1', category: 'université' },
          { value: 'L2', label: 'Licence 2', category: 'université' },
          { value: 'L3', label: 'Licence 3', category: 'université' },
          { value: 'M1', label: 'Master 1', category: 'université' },
          { value: 'M2', label: 'Master 2', category: 'université' },
          { value: 'Doctorat', label: 'Doctorat', category: 'université' }
        ];
      default:
        return [];
    }
  };

  const getSchoolTypeDescription = (type) => {
    switch (type) {
      case 'primary':
        return 'École primaire : Classes de CP1 à CM2 pour les enfants de 6 à 11 ans.';
      case 'college':
        return 'Collège : Classes de 6ème à 3ème pour le premier cycle du secondaire.';
      case 'high_school':
        return 'Lycée : Classes de 2nd à Terminale pour le second cycle du secondaire.';
      case 'secondary':
        return 'Établissement secondaire complet : Du collège au lycée (6ème à Terminale).';
      case 'institut':
        return 'Institut : Formation professionnelle et technique (BTS, DUT, formations spécialisées).';
      case 'university':
        return 'Université : Enseignement supérieur (Licence, Master, Doctorat).';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSchoolTypeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      schoolType: value
    }));
    setError(null);
  };

  // Mettre à jour les classes disponibles quand le type change (comme dans SchoolSettings)
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
    console.log('handleClassToggle appelé avec:', classLevel);
    
    setFormData(prev => {
      console.log('prev.availableClasses:', prev.availableClasses);
      
      if (!prev.availableClasses || prev.availableClasses.length === 0) {
        console.warn('Tentative de toggle sur une classe mais availableClasses est vide');
        return prev;
      }
      
      // Vérifier que la classe existe
      const classExists = prev.availableClasses.some(cls => cls && cls.level === classLevel);
      if (!classExists) {
        console.warn(`Classe ${classLevel} introuvable dans availableClasses`);
        return prev;
      }
      
      console.log('Mise à jour de formData avec toggle pour:', classLevel);
      
      const updatedClasses = prev.availableClasses.map(cls => 
        cls && cls.level === classLevel 
          ? { ...cls, isActive: !cls.isActive }
          : cls
      );
      
      console.log('Classes mises à jour:', updatedClasses);
      
      return {
        ...prev,
        availableClasses: updatedClasses
      };
    });
    
    setError(null);
  }, []);

  const getSelectedClassesCount = () => {
    if (!formData.availableClasses || formData.availableClasses.length === 0) {
      return 0;
    }
    return formData.availableClasses.filter(cls => cls.isActive).length;
  };

  const validateForm = () => {
    if (!formData.schoolName || !formData.directorName || !formData.email || 
        !formData.password || !formData.phone || !formData.address || 
        !formData.schoolType || !formData.country || !formData.city) {
      setError('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    if (formData.schoolType && formData.availableClasses && formData.availableClasses.length > 0 && getSelectedClassesCount() === 0) {
      setError('Veuillez sélectionner au moins une classe pour votre établissement');
      return false;
    }
    return true;
  };

  // Mémoriser le rendu des catégories pour éviter les re-rendus problématiques
  const categorizedClasses = useMemo(() => {
    if (!formData.availableClasses || formData.availableClasses.length === 0) {
      return [];
    }
    
    // Filtrer les éléments valides uniquement
    const validClasses = formData.availableClasses.filter(cls => 
      cls && 
      cls.category && 
      cls.level && 
      typeof cls.category === 'string' && 
      typeof cls.level === 'string'
    );
    
    console.log('Classes valides pour le rendu:', validClasses);
    
    const categories = [...new Set(validClasses.map(cls => cls.category))];
    return categories.map(category => ({
      category,
      classes: validClasses.filter(cls => cls.category === category)
    }));
  }, [formData.availableClasses]);

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
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            type: formData.schoolType,
            country: formData.country,
            city: formData.city,
            available_classes: selectedClasses,
            user_id: authData.user.id,
            status: 'pending'
          }
        ]);

      if (profileError) throw profileError;

      onSuccess?.();
    } catch (error) {
      console.error('Registration error:', error.message);
      setError(error.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SimpleInput
          label="Nom de l'établissement"
          name="schoolName"
          value={formData.schoolName}
          onChange={handleChange}
          required
        />
        
        <SimpleInput
          label="Nom du directeur"
          name="directorName"
          value={formData.directorName}
          onChange={handleChange}
          required
        />

        <SimpleInput
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <SimpleInput
          label="Téléphone"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />

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

        <SimpleSelect
          label="Type d'établissement"
          name="schoolType"
          value={formData.schoolType}
          onChange={handleSchoolTypeChange}
          placeholder="Sélectionner un type"
          required
          options={[
            { value: 'primary', label: 'École Primaire' },
            { value: 'secondary', label: 'Établissement Secondaire' },
            { value: 'college', label: 'Collège' },
            { value: 'high_school', label: 'Lycée' },
            { value: 'institut', label: 'Institut' },
            { value: 'university', label: 'Université' }
          ]}
        />

        <SimpleSelect
          label="Pays"
          name="country"
          value={formData.country}
          onChange={(value) => setFormData(prev => ({ ...prev, country: value, city: '' }))}
          placeholder="Sélectionner un pays"
          required
          options={countryOptions}
        />

        <SimpleSelect
          label="Ville"
          name="city"
          value={formData.city}
          onChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
          placeholder={formData.country ? "Sélectionner une ville" : "Sélectionnez d'abord un pays"}
          disabled={!formData.country}
          required
          options={getCityOptions()}
        />

        <div className="md:col-span-2">
          <SimpleInput
            label="Adresse complète"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Section des classes disponibles */}
      {formData.schoolType && formData.availableClasses.length > 0 && (
        <div className="space-y-4">
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Classes disponibles dans votre établissement
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {getSchoolTypeDescription(formData.schoolType)}
                </p>
              </div>
              <div className="text-sm text-blue-600 font-medium">
                {getSelectedClassesCount()} classe{getSelectedClassesCount() !== 1 ? 's' : ''} sélectionnée{getSelectedClassesCount() !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Classes par catégorie */}
            <div className="space-y-6">
              {categorizedClasses && categorizedClasses.length > 0 ? (
                categorizedClasses.map(({ category, classes }) => (
                  <div key={`category-${category}`}>
                    <h4 className="font-medium text-gray-900 mb-3 capitalize">
                      Classes {category}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {classes && classes.length > 0 ? classes
                        .filter(classItem => classItem && classItem.level && classItem.category)
                        .map((classItem) => (
                        <button
                          type="button"
                          key={`class-${classItem.category}-${classItem.level}`}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 w-full text-left ${
                            classItem.isActive
                              ? 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                              : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => handleClassToggle(classItem.level)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              classItem.isActive ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <span className={`text-xs font-bold ${
                                classItem.isActive ? 'text-blue-600' : 'text-gray-400'
                              }`}>
                                {classItem.isActive ? "✓" : "+"}
                              </span>
                            </div>
                            <div>
                              <p className={`font-medium text-sm ${
                                classItem.isActive ? 'text-blue-900' : 'text-gray-700'
                              }`}>
                                {classItem?.level || 'Classe inconnue'}
                              </p>
                              <p className={`text-xs ${
                                classItem.isActive ? 'text-blue-600' : 'text-gray-500'
                              }`}>
                                {classItem?.label || 'Libellé non disponible'}
                              </p>
                            </div>
                          </div>
                        </button>
                      )) : (
                        <p className="text-gray-500 text-sm">Aucune classe disponible dans cette catégorie</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Veuillez d'abord sélectionner un type d'établissement</p>
              )}
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <span className="text-amber-600 mt-0.5">ℹ️</span>
                <div>
                  <p className="font-medium text-sm text-amber-900 mb-1">
                    Sélection des classes
                  </p>
                  <p className="text-xs text-amber-700">
                    Choisissez les classes que votre établissement propose. 
                    Vous pourrez modifier cette configuration plus tard dans les paramètres.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2">
          <span>⚠️</span>
          <span className="text-sm">{error}</span>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        loading={loading}
      >
        Inscrire l'établissement
      </Button>
    </form>
  );
};

export default SchoolRegistrationForm;