/**
 * Signup Page - Inscription d'un nouvel établissement
 * Formulaire amélioré pour les directeurs d'établissement
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import SupabaseDebug from '../../components/SupabaseDebug';
import {
  GraduationCap,
  School,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Globe,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Info école, 2: Info directeur, 3: Classes
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Données des pays et villes
  const countryData = {
    'cameroon': {
      label: 'Cameroun',
      phoneCode: '+237',
      cities: ['Yaoundé', 'Douala', 'Bamenda', 'Bafoussam', 'Garoua', 'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Kumba']
    },
    'france': {
      label: 'France',
      phoneCode: '+33',
      cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille']
    },
    'senegal': {
      label: 'Sénégal',
      phoneCode: '+221',
      cities: ['Dakar', 'Thiès', 'Kaolack', 'Ziguinchor', 'Saint-Louis', 'Tambacounda', 'Mbour', 'Diourbel']
    }
  };

  // Types d'établissements
  const schoolTypes = [
    { value: 'primary', label: 'École Primaire', description: 'CP1 à CM2', icon: '🎒' },
    { value: 'college', label: 'Collège', description: '6ème à 3ème', icon: '📚' },
    { value: 'high_school', label: 'Lycée', description: '2nd à Terminale', icon: '🎓' },
    { value: 'secondary', label: 'Secondaire Complet', description: '6ème à Terminale', icon: '🏫' },
    { value: 'institut', label: 'Institut', description: 'BTS, DUT', icon: '💼' },
    { value: 'university', label: 'Université', description: 'Licence, Master, Doctorat', icon: '🎯' }
  ];

  // Classes disponibles selon le type
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleClassToggle = useCallback((classLevel) => {
    setFormData(prev => {
      if (!prev.availableClasses || prev.availableClasses.length === 0) return prev;

      const updatedClasses = prev.availableClasses.map(cls =>
        cls && cls.level === classLevel
          ? { ...cls, isActive: !cls.isActive }
          : cls
      );

      return { ...prev, availableClasses: updatedClasses };
    });
    setError(null);
  }, []);

  // Classes groupées par catégorie
  const categorizedClasses = useMemo(() => {
    if (!formData.availableClasses || formData.availableClasses.length === 0) return [];

    const validClasses = formData.availableClasses.filter(cls =>
      cls && cls.category && cls.level && typeof cls.category === 'string' && typeof cls.level === 'string'
    );

    const categories = [...new Set(validClasses.map(cls => cls.category))];
    return categories.map(category => ({
      category,
      classes: validClasses.filter(cls => cls.category === category)
    }));
  }, [formData.availableClasses]);

  const getSelectedClassesCount = () => {
    if (!formData.availableClasses || formData.availableClasses.length === 0) return 0;
    return formData.availableClasses.filter(cls => cls.isActive).length;
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.schoolName || !formData.schoolType || !formData.country || !formData.city || !formData.address) {
        setError('Veuillez remplir tous les champs de l\'établissement');
        return false;
      }
    } else if (step === 2) {
      if (!formData.directorName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
        setError('Veuillez remplir tous les champs du directeur');
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
    } else if (step === 3) {
      if (getSelectedClassesCount() === 0) {
        setError('Veuillez sélectionner au moins une classe');
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    setError(null);

    try {
      const selectedClasses = formData.availableClasses
        .filter(cls => cls.isActive)
        .map(cls => cls.level);

      // Générer un code unique pour l'école
      const prefix = formData.schoolName.replace(/\s+/g, '').substring(0, 3).toUpperCase();
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
      const schoolCode = `${prefix}-${year}-${random}`;

      console.log('📝 Début de l\'inscription...');

      // Créer l'utilisateur avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            role: 'principal',
            full_name: formData.directorName,
            phone: formData.phone
          }
        }
      });

      if (authError) {
        console.error('❌ Erreur signUp:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Erreur lors de la création de l\'utilisateur');
      }

      console.log('✅ User créé:', authData.user.id);

      // ✅ NOUVEAU : Créer l'école immédiatement (pas besoin d'attendre confirmation email)
      console.log('🏫 Création de l\'école dans la base...');

      const { data: schoolRecord, error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: formData.schoolName,
          code: schoolCode,
          type: formData.schoolType,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          principal_id: authData.user.id,
          available_classes: selectedClasses
        })
        .select()
        .single();

      if (schoolError) {
        console.error('❌ Erreur création école:', schoolError);
        throw new Error(`Erreur création école: ${schoolError.message}`);
      }

      console.log('✅ École créée:', schoolRecord.id);

      // Mettre à jour le user_metadata avec l'ID de l'école
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          school_id: schoolRecord.id,
          role: 'principal',
          full_name: formData.directorName,
          phone: formData.phone
        }
      });

      if (updateError) {
        console.error('⚠️ Erreur mise à jour metadata:', updateError);
        // On continue quand même, ce n'est pas bloquant
      } else {
        console.log('✅ Metadata mis à jour');
      }

      // Déconnecter l'utilisateur (il doit confirmer son email d'abord)
      // Cela évite l'erreur "Invalid Refresh Token" car l'utilisateur n'est pas encore confirmé
      await supabase.auth.signOut();

      console.log('✅ Inscription complète - Redirection vers vérification email');

      // Rediriger vers la page de vérification email
      navigate('/email-verification', { state: { email: formData.email } });

    } catch (error) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      setError(error.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Retour</span>
            </button>

            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">EduTrack</span>
            </div>

            <div className="text-sm text-gray-600">
              Déjà un compte ? <button onClick={() => navigate('/login')} className="text-primary-600 hover:text-primary-700 font-medium">Connexion</button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          {[
            { num: 1, label: 'Établissement', icon: School },
            { num: 2, label: 'Directeur', icon: User },
            { num: 3, label: 'Classes', icon: GraduationCap }
          ].map((stepItem, idx) => {
            const Icon = stepItem.icon;
            const isActive = step === stepItem.num;
            const isCompleted = step > stepItem.num;

            return (
              <div key={stepItem.num} className="flex items-center flex-1">
                <div className={`flex items-center gap-3 flex-1 ${idx < 2 ? 'pr-4' : ''}`}>
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all
                    ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${isActive ? 'bg-primary-600 border-primary-600 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-white border-gray-300 text-gray-400' : ''}
                  `}>
                    {isCompleted ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${isActive ? 'text-primary-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      Étape {stepItem.num}
                    </div>
                    <div className={`text-xs ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                      {stepItem.label}
                    </div>
                  </div>
                </div>
                {idx < 2 && (
                  <div className={`h-0.5 w-full transition-all ${step > stepItem.num ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Étape 1 : Informations Établissement */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                    <School className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Informations sur l'Établissement</h2>
                  <p className="text-gray-600 mt-2">Commençons par les détails de votre école</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'établissement *
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: Collège de la Réussite"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'établissement *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {schoolTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, schoolType: type.value }));
                          setError(null);
                        }}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formData.schoolType === type.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <div className="font-medium text-gray-900 text-sm">{type.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe className="inline h-4 w-4 mr-1" />
                      Pays *
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">Sélectionner un pays</option>
                      {Object.keys(countryData).map(key => (
                        <option key={key} value={key}>{countryData[key].label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Ville *
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                      disabled={!formData.country}
                    >
                      <option value="">Sélectionner une ville</option>
                      {formData.country && countryData[formData.country]?.cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse complète *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Adresse complète de l'établissement"
                    rows={2}
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Continuer
                </button>
              </div>
            )}

            {/* Étape 2 : Informations Directeur */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                    <User className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Compte Directeur</h2>
                  <p className="text-gray-600 mt-2">Créez votre compte d'accès administrateur</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet du directeur *
                  </label>
                  <input
                    type="text"
                    name="directorName"
                    value={formData.directorName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: Jean Dupont"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="directeur@ecole.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Téléphone *
                    </label>
                    <div className="flex gap-2">
                      <div className="w-24">
                        <input
                          type="text"
                          value={formData.country ? countryData[formData.country]?.phoneCode : ''}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-center"
                          disabled
                        />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="XXXXXXXXX"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="inline h-4 w-4 mr-1" />
                      Mot de passe *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-12"
                        placeholder="Minimum 8 caractères"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le mot de passe *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-12"
                        placeholder="Confirmer le mot de passe"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {/* Étape 3 : Sélection des Classes */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                    <GraduationCap className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Classes Disponibles</h2>
                  <p className="text-gray-600 mt-2">Sélectionnez les classes de votre établissement</p>
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                    <Check className="h-4 w-4" />
                    <span>{getSelectedClassesCount()} classe{getSelectedClassesCount() > 1 ? 's' : ''} sélectionnée{getSelectedClassesCount() > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {categorizedClasses.map(({ category, classes }) => (
                  <div key={category} className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">{category}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {classes.map((cls) => (
                        <button
                          key={cls.level}
                          type="button"
                          onClick={() => handleClassToggle(cls.level)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            cls.isActive
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-900">{cls.level}</div>
                            {cls.isActive && (
                              <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{cls.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Création en cours...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        <span>Créer Mon Compte</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
