import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import SimpleInput from '../../../components/ui/SimpleInput';
import SimpleSelect from '../../../components/ui/SimpleSelect';
import Button from '../../../components/ui/Button';

const WorkingSchoolRegistrationForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [formData, setFormData] = useState({
    schoolName: '',
    directorName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    schoolType: '',
    city: '',
    country: 'Cameroun', // Valeur par défaut
    availableClasses: []
  });

  // Villes disponibles par pays
  const getCitiesByCountry = (country) => {
    const citiesMap = {
      // Pays africains
      'Cameroun': [
        { value: 'Yaoundé', label: 'Yaoundé' },
        { value: 'Douala', label: 'Douala' },
        { value: 'Bafoussam', label: 'Bafoussam' },
        { value: 'Bamenda', label: 'Bamenda' },
        { value: 'Garoua', label: 'Garoua' },
        { value: 'Maroua', label: 'Maroua' },
        { value: 'Ngaoundéré', label: 'Ngaoundéré' },
        { value: 'Bertoua', label: 'Bertoua' },
        { value: 'Ebolowa', label: 'Ebolowa' },
        { value: 'Kribi', label: 'Kribi' }
      ],
      'Gabon': [
        { value: 'Libreville', label: 'Libreville' },
        { value: 'Port-Gentil', label: 'Port-Gentil' },
        { value: 'Franceville', label: 'Franceville' },
        { value: 'Oyem', label: 'Oyem' },
        { value: 'Moanda', label: 'Moanda' }
      ],
      'République Centrafricaine': [
        { value: 'Bangui', label: 'Bangui' },
        { value: 'Berbérati', label: 'Berbérati' },
        { value: 'Carnot', label: 'Carnot' },
        { value: 'Bambari', label: 'Bambari' }
      ],
      'Tchad': [
        { value: 'N\'Djamena', label: 'N\'Djamena' },
        { value: 'Moundou', label: 'Moundou' },
        { value: 'Sarh', label: 'Sarh' },
        { value: 'Abéché', label: 'Abéché' }
      ],
      'Guinée Équatoriale': [
        { value: 'Malabo', label: 'Malabo' },
        { value: 'Bata', label: 'Bata' },
        { value: 'Ebebiyin', label: 'Ebebiyin' }
      ],
      'Congo': [
        { value: 'Brazzaville', label: 'Brazzaville' },
        { value: 'Pointe-Noire', label: 'Pointe-Noire' },
        { value: 'Dolisie', label: 'Dolisie' }
      ],
      'République Démocratique du Congo': [
        { value: 'Kinshasa', label: 'Kinshasa' },
        { value: 'Lubumbashi', label: 'Lubumbashi' },
        { value: 'Mbuji-Mayi', label: 'Mbuji-Mayi' },
        { value: 'Kisangani', label: 'Kisangani' }
      ],
      'Sénégal': [
        { value: 'Dakar', label: 'Dakar' },
        { value: 'Thiès', label: 'Thiès' },
        { value: 'Kaolack', label: 'Kaolack' },
        { value: 'Saint-Louis', label: 'Saint-Louis' }
      ],
      'Mali': [
        { value: 'Bamako', label: 'Bamako' },
        { value: 'Sikasso', label: 'Sikasso' },
        { value: 'Mopti', label: 'Mopti' },
        { value: 'Koutiala', label: 'Koutiala' }
      ],
      'Burkina Faso': [
        { value: 'Ouagadougou', label: 'Ouagadougou' },
        { value: 'Bobo-Dioulasso', label: 'Bobo-Dioulasso' },
        { value: 'Koudougou', label: 'Koudougou' }
      ],
      'Niger': [
        { value: 'Niamey', label: 'Niamey' },
        { value: 'Zinder', label: 'Zinder' },
        { value: 'Maradi', label: 'Maradi' }
      ],
      'Côte d\'Ivoire': [
        { value: 'Abidjan', label: 'Abidjan' },
        { value: 'Yamoussoukro', label: 'Yamoussoukro' },
        { value: 'Bouaké', label: 'Bouaké' },
        { value: 'Daloa', label: 'Daloa' }
      ],
      // Pays européens
      'France': [
        { value: 'Paris', label: 'Paris' },
        { value: 'Lyon', label: 'Lyon' },
        { value: 'Marseille', label: 'Marseille' },
        { value: 'Toulouse', label: 'Toulouse' },
        { value: 'Nice', label: 'Nice' },
        { value: 'Nantes', label: 'Nantes' },
        { value: 'Strasbourg', label: 'Strasbourg' },
        { value: 'Montpellier', label: 'Montpellier' },
        { value: 'Bordeaux', label: 'Bordeaux' },
        { value: 'Lille', label: 'Lille' }
      ],
      'Allemagne': [
        { value: 'Berlin', label: 'Berlin' },
        { value: 'Munich', label: 'Munich' },
        { value: 'Hambourg', label: 'Hambourg' },
        { value: 'Cologne', label: 'Cologne' },
        { value: 'Francfort', label: 'Francfort' },
        { value: 'Stuttgart', label: 'Stuttgart' },
        { value: 'Düsseldorf', label: 'Düsseldorf' },
        { value: 'Dortmund', label: 'Dortmund' }
      ],
      'Espagne': [
        { value: 'Madrid', label: 'Madrid' },
        { value: 'Barcelone', label: 'Barcelone' },
        { value: 'Valence', label: 'Valence' },
        { value: 'Séville', label: 'Séville' },
        { value: 'Saragosse', label: 'Saragosse' },
        { value: 'Málaga', label: 'Málaga' },
        { value: 'Murcie', label: 'Murcie' },
        { value: 'Palma', label: 'Palma' }
      ],
      'Italie': [
        { value: 'Rome', label: 'Rome' },
        { value: 'Milan', label: 'Milan' },
        { value: 'Naples', label: 'Naples' },
        { value: 'Turin', label: 'Turin' },
        { value: 'Palerme', label: 'Palerme' },
        { value: 'Gênes', label: 'Gênes' },
        { value: 'Bologne', label: 'Bologne' },
        { value: 'Florence', label: 'Florence' }
      ],
      'Royaume-Uni': [
        { value: 'Londres', label: 'Londres' },
        { value: 'Birmingham', label: 'Birmingham' },
        { value: 'Manchester', label: 'Manchester' },
        { value: 'Liverpool', label: 'Liverpool' },
        { value: 'Sheffield', label: 'Sheffield' },
        { value: 'Bristol', label: 'Bristol' },
        { value: 'Glasgow', label: 'Glasgow' },
        { value: 'Édimbourg', label: 'Édimbourg' }
      ],
      'Belgique': [
        { value: 'Bruxelles', label: 'Bruxelles' },
        { value: 'Anvers', label: 'Anvers' },
        { value: 'Gand', label: 'Gand' },
        { value: 'Charleroi', label: 'Charleroi' },
        { value: 'Liège', label: 'Liège' },
        { value: 'Bruges', label: 'Bruges' },
        { value: 'Namur', label: 'Namur' }
      ],
      'Suisse': [
        { value: 'Zurich', label: 'Zurich' },
        { value: 'Genève', label: 'Genève' },
        { value: 'Bâle', label: 'Bâle' },
        { value: 'Lausanne', label: 'Lausanne' },
        { value: 'Berne', label: 'Berne' },
        { value: 'Winterthour', label: 'Winterthour' }
      ],
      'Pays-Bas': [
        { value: 'Amsterdam', label: 'Amsterdam' },
        { value: 'Rotterdam', label: 'Rotterdam' },
        { value: 'La Haye', label: 'La Haye' },
        { value: 'Utrecht', label: 'Utrecht' },
        { value: 'Eindhoven', label: 'Eindhoven' },
        { value: 'Tilburg', label: 'Tilburg' }
      ],
      'Portugal': [
        { value: 'Lisbonne', label: 'Lisbonne' },
        { value: 'Porto', label: 'Porto' },
        { value: 'Braga', label: 'Braga' },
        { value: 'Coimbra', label: 'Coimbra' },
        { value: 'Funchal', label: 'Funchal' }
      ],
      'Autriche': [
        { value: 'Vienne', label: 'Vienne' },
        { value: 'Graz', label: 'Graz' },
        { value: 'Linz', label: 'Linz' },
        { value: 'Salzburg', label: 'Salzburg' },
        { value: 'Innsbruck', label: 'Innsbruck' }
      ]
    };
    return citiesMap[country] || [{ value: 'Autre', label: 'Autre ville' }];
  };

  const handleCountryChange = (value) => {
    setFormData(prev => ({
      ...prev,
      country: value,
      city: '' // Reset city when country changes
    }));
  };

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
      case 'maternelle':
        return [
          { value: 'Petite Section', label: 'Petite Section', category: 'maternelle' },
          { value: 'Moyenne Section', label: 'Moyenne Section', category: 'maternelle' },
          { value: 'Grande Section', label: 'Grande Section', category: 'maternelle' }
        ];
      case 'primaire':
        return [
          { value: 'CP', label: 'CP (Cours Préparatoire)', category: 'primaire' },
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
      case 'lycee':
        return [
          { value: '2nde', label: '2nde (Seconde)', category: 'lycée' },
          { value: '1ère', label: '1ère (Première)', category: 'lycée' },
          { value: 'Terminale', label: 'Terminale', category: 'lycée' }
        ];
      case 'college_lycee':
        return [
          { value: '6ème', label: '6ème', category: 'collège' },
          { value: '5ème', label: '5ème', category: 'collège' },
          { value: '4ème', label: '4ème', category: 'collège' },
          { value: '3ème', label: '3ème', category: 'collège' },
          { value: '2nde', label: '2nde (Seconde)', category: 'lycée' },
          { value: '1ère', label: '1ère (Première)', category: 'lycée' },
          { value: 'Terminale', label: 'Terminale', category: 'lycée' }
        ];
      case 'technique':
        return [
          { value: '2nd Tech', label: '2nd Technique', category: 'technique' },
          { value: '1ère Tech', label: '1ère Technique', category: 'technique' },
          { value: 'Terminale Tech', label: 'Terminale Technique', category: 'technique' }
        ];
      case 'universite':
        // Pour les universités
        return [
          { value: 'L1', label: 'Licence 1', category: 'université' },
          { value: 'L2', label: 'Licence 2', category: 'université' },
          { value: 'L3', label: 'Licence 3', category: 'université' },
          { value: 'M1', label: 'Master 1', category: 'université' },
          { value: 'M2', label: 'Master 2', category: 'université' },
          { value: 'Doctorat', label: 'Doctorat', category: 'université' }
        ];
      case 'formation_professionnelle':
        // Pour les formations professionnelles
        return [
          { value: 'CAP1', label: 'CAP Première Année', category: 'professionnel' },
          { value: 'CAP2', label: 'CAP Deuxième Année', category: 'professionnel' },
          { value: 'BEP1', label: 'BEP Première Année', category: 'professionnel' },
          { value: 'BEP2', label: 'BEP Deuxième Année', category: 'professionnel' },
          { value: 'BAC_PRO1', label: 'Bac Pro Première Année', category: 'professionnel' },
          { value: 'BAC_PRO2', label: 'Bac Pro Deuxième Année', category: 'professionnel' },
          { value: 'BAC_PRO3', label: 'Bac Pro Troisième Année', category: 'professionnel' }
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
    
    // Éviter les mises à jour pendant le loading pour prévenir les erreurs DOM
    if (loading) return;
    
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
  }, [loading]);

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
    // 1. Validation des champs obligatoires
    if (!formData.schoolName || !formData.directorName || !formData.email || 
        !formData.password || !formData.phone || !formData.address || 
        !formData.schoolType || !formData.city || !formData.country) {
      setError('Veuillez remplir tous les champs obligatoires');
      return false;
    }

    // 2. Validation des mots de passe
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    // 3. Validation de la longueur du mot de passe
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    // 4. Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Format d\'email invalide');
      return false;
    }

    // 5. Validation du type d'école (Prisma compatibility)
    const validSchoolTypes = ['maternelle', 'primaire', 'college', 'lycee', 'college_lycee', 'universite', 'formation_professionnelle'];
    if (!validSchoolTypes.includes(formData.schoolType)) {
      setError('Type d\'établissement invalide');
      return false;
    }

    // 6. Validation des classes sélectionnées
    const selectedClasses = formData.availableClasses ? formData.availableClasses.filter(cls => cls.isActive) : [];
    if (selectedClasses.length === 0) {
      setError('Veuillez sélectionner au moins une classe pour votre établissement');
      return false;
    }

    // 7. Validation du nom de l'école (longueur)
    if (formData.schoolName.length < 3) {
      setError('Le nom de l\'établissement doit contenir au moins 3 caractères');
      return false;
    }

    // 8. Validation du numéro de téléphone (format basique)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Format de numéro de téléphone invalide');
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
      // Préparer les classes sélectionnées
      const selectedClasses = formData.availableClasses && formData.availableClasses.length > 0
        ? formData.availableClasses.filter(cls => cls.isActive).map(cls => cls.level)
        : [];

      console.log('🚀 Début du processus d\'inscription:', {
        schoolName: formData.schoolName,
        schoolType: formData.schoolType,
        directorName: formData.directorName,
        email: formData.email,
        selectedClassesCount: selectedClasses.length
      });

      // 1. Créer d'abord l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.directorName,
            phone: formData.phone,
            role: 'principal'
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        
        // Gestion spécifique des erreurs courantes
        if (authError.message?.includes('already_registered')) {
          throw new Error('Cette adresse email est déjà utilisée. Essayez de vous connecter ou utilisez une autre adresse.');
        }
        
        if (authError.message?.includes('invalid_email')) {
          throw new Error('Format d\'email invalide. Vérifiez votre adresse email.');
        }
        
        if (authError.message?.includes('weak_password')) {
          throw new Error('Mot de passe trop faible. Utilisez au moins 8 caractères avec des lettres et des chiffres.');
        }
        
        throw new Error(authError.message || 'Erreur lors de la création du compte d\'authentification');
      }

      if (!authData.user) {
        throw new Error('Erreur lors de la création de l\'utilisateur');
      }

      console.log('✅ Compte Auth créé avec succès, ID utilisateur:', authData.user.id);
      setError(null); // Clear auth errors

      // 2. ESSAYER DE CRÉER L'ÉCOLE DIRECTEMENT (approche hybride)
      console.log('🏫 Tentative de création directe de l\'école...');
      
      try {
        // Import dynamique du service (pour éviter les problèmes SSR)
        const { createPrincipalSchool } = await import('../../../services/schoolService.js');
        
        const result = await createPrincipalSchool({
          directorName: formData.directorName,
          email: formData.email,
          phone: formData.phone,
          schoolName: formData.schoolName,
          schoolType: formData.schoolType,
          address: formData.address,
          city: formData.city || 'Yaoundé',
          country: formData.country || 'Cameroun',
          availableClasses: selectedClasses,
          userId: authData.user.id
        });

        if (result.success) {
          console.log('✅ École créée directement avec succès !', result.data);
          
          // Succès - afficher la page de succès SANS confirmation email
          setSuccessData({
            schoolName: formData.schoolName,
            directorName: formData.directorName,
            email: formData.email,
            needsEmailConfirmation: !!authData.user.email_confirmed_at === false,
            schoolCreated: true,
            message: 'École créée avec succès ! Vérifiez votre email pour confirmer votre compte, puis connectez-vous.'
          });
          setSuccess(true);
          return; // Sortir ici si succès

        } else {
          console.warn('⚠️ Création directe échouée, passage au mode différé:', result.message);
        }

      } catch (creationError) {
        console.warn('⚠️ Création directe impossible, passage au mode différé:', creationError.message);
      }

      // 3. SI CRÉATION DIRECTE ÉCHOUE, SAUVEGARDER TEMPORAIREMENT
      console.log('💾 Sauvegarde temporaire des données pour création différée...');
      
      const pendingSchoolData = {
        directorName: formData.directorName,
        email: formData.email,
        phone: formData.phone,
        schoolName: formData.schoolName,
        schoolType: formData.schoolType,
        address: formData.address,
        city: formData.city || 'Yaoundé',
        country: formData.country || 'Cameroun',
        availableClasses: selectedClasses,
        userId: authData.user.id,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('pendingSchoolData', JSON.stringify(pendingSchoolData));
      
      console.log('✅ Données sauvegardées pour création après confirmation email');
      console.log('📧 Email de confirmation envoyé à:', formData.email);
      setError(null); // Clear all errors on success

      // Succès - afficher la page de succès avec message de confirmation
      setSuccessData({
        schoolName: formData.schoolName,
        directorName: formData.directorName,
        email: formData.email,
        needsEmailConfirmation: true, // Toujours true maintenant
        message: 'Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte, puis connectez-vous pour finaliser la création de votre école.'
      });
      setSuccess(true);
      
    } catch (error) {
      console.error('Error during registration:', error);
      setError(error.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  // Si succès, afficher la page de confirmation
  if (success && successData) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🎉 Compte créé avec succès !
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Informations du compte :</h3>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-medium">École :</span> {successData.schoolName}</p>
              <p><span className="font-medium">Directeur :</span> {successData.directorName}</p>
              <p><span className="font-medium">Email :</span> {successData.email}</p>
            </div>
          </div>
          
          {successData.needsEmailConfirmation ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div className="text-left">
                  <h4 className="font-medium text-blue-900 mb-2">📧 Confirmation d'email requise</h4>
                  <div className="text-blue-700 text-sm space-y-2">
                    <p>
                      <strong>Étape 1 :</strong> Un email de confirmation a été envoyé à <strong>{successData.email}</strong>
                    </p>
                    <p>
                      <strong>Étape 2 :</strong> Cliquez sur le lien dans l'email pour confirmer votre compte
                    </p>
                    <p>
                      <strong>Étape 3 :</strong> Revenez ici et connectez-vous pour finaliser la création de votre école
                    </p>
                  </div>
                  <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
                    💡 <strong>Important :</strong> Votre école sera créée automatiquement lors de votre première connexion après confirmation.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-700">
                Votre compte est activé ! Vous pouvez maintenant vous connecter.
              </p>
            </div>
          )}
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Aller à la connexion
            </button>
            <button
              onClick={() => {
                setSuccess(false);
                setSuccessData(null);
                setFormData({
                  schoolName: '',
                  directorName: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  phone: '',
                  address: '',
                  schoolType: '',
                  city: '',
                  country: 'Cameroun',
                  availableClasses: []
                });
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Créer un autre compte
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Informations de l'établissement */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            📚 Informations de l'établissement
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SimpleInput
              label="Nom de l'établissement"
              value={formData.schoolName}
              onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
              placeholder="Ex: Lycée Bilingue de Yaoundé"
              required
            />
            
            <SimpleSelect
              label="Type d'établissement"
              value={formData.schoolType}
              onChange={handleSchoolTypeChange}
              options={[
                { value: 'maternelle', label: 'École Maternelle' },
                { value: 'primaire', label: 'École Primaire' },
                { value: 'college', label: 'Collège (6ème - 3ème)' },
                { value: 'lycee', label: 'Lycée (2nde - Terminale)' },
                { value: 'college_lycee', label: 'Collège-Lycée (6ème - Terminale)' },
                { value: 'universite', label: 'Université' },
                { value: 'formation_professionnelle', label: 'Formation Professionnelle' }
              ]}
              placeholder="Sélectionner un type"
              required
            />
          </div>
        </div>

        {/* Section 2: Localisation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            📍 Localisation
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SimpleSelect
              label="Pays"
              value={formData.country}
              onChange={handleCountryChange}
              options={[
                // Pays africains francophones
                { value: 'Cameroun', label: '🇨🇲 Cameroun' },
                { value: 'Gabon', label: '🇬🇦 Gabon' },
                { value: 'République Centrafricaine', label: '🇨🇫 République Centrafricaine' },
                { value: 'Tchad', label: '🇹🇩 Tchad' },
                { value: 'Guinée Équatoriale', label: '🇬🇶 Guinée Équatoriale' },
                { value: 'Congo', label: '🇨🇬 Congo' },
                { value: 'République Démocratique du Congo', label: '🇨🇩 RD Congo' },
                { value: 'Sénégal', label: '🇸🇳 Sénégal' },
                { value: 'Mali', label: '🇲🇱 Mali' },
                { value: 'Burkina Faso', label: '🇧🇫 Burkina Faso' },
                { value: 'Niger', label: '🇳🇪 Niger' },
                { value: 'Côte d\'Ivoire', label: '🇨🇮 Côte d\'Ivoire' },
                // Pays européens
                { value: 'France', label: '🇫🇷 France' },
                { value: 'Allemagne', label: '🇩🇪 Allemagne' },
                { value: 'Espagne', label: '🇪🇸 Espagne' },
                { value: 'Italie', label: '🇮🇹 Italie' },
                { value: 'Royaume-Uni', label: '🇬🇧 Royaume-Uni' },
                { value: 'Belgique', label: '🇧🇪 Belgique' },
                { value: 'Suisse', label: '🇨🇭 Suisse' },
                { value: 'Pays-Bas', label: '🇳🇱 Pays-Bas' },
                { value: 'Portugal', label: '🇵🇹 Portugal' },
                { value: 'Autriche', label: '🇦🇹 Autriche' },
                // Autre
                { value: 'Autre', label: '🌍 Autre pays' }
              ]}
              required
            />
            
            <SimpleSelect
              label="Ville"
              value={formData.city}
              onChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
              options={getCitiesByCountry(formData.country)}
              placeholder="Sélectionner une ville"
              required
            />
          </div>
          
          <SimpleInput
            label="Adresse complète"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Ex: Quartier Nlongkak, Rue 1.234"
            required
          />
        </div>

        {/* Section 3: Informations du directeur */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            👤 Informations du directeur
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SimpleInput
              label="Nom complet du directeur"
              value={formData.directorName}
              onChange={(e) => setFormData(prev => ({ ...prev, directorName: e.target.value }))}
              placeholder="Ex: Dr. Jean MBALLA"
              required
            />
            
            <SimpleInput
              label="Téléphone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Ex: +237 6XX XXX XXX"
              required
            />
          </div>
          
          <SimpleInput
            label="Email professionnel"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Ex: directeur@monecole.edu.cm"
            required
          />
        </div>

        {/* Section 4: Sécurité */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            🔒 Sécurité du compte
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SimpleInput
              label="Mot de passe"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 caractères"
              required
            />

            <SimpleInput
              label="Confirmer le mot de passe"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Retapez le mot de passe"
              required
            />
          </div>
        </div>

        {/* Section 5: Classes disponibles */}
        {categorizedClasses && categorizedClasses.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              🎓 Classes disponibles
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Sélectionnez les classes que votre établissement propose
            </p>
            
            <div className="space-y-6">
              {categorizedClasses.map(({ category, classes }) => (
                <div key={`category-${category}`} className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4 capitalize text-center text-lg">
                    Classes {category}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {classes && classes.length > 0 ? classes
                      .filter(classItem => classItem && classItem.level && classItem.category)
                      .map((classItem) => (
                      <button
                        key={`class-${classItem.category}-${classItem.level}`}
                        type="button"
                        className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                          classItem.isActive 
                            ? 'bg-blue-100 border-blue-400 text-blue-800 shadow-sm' 
                            : 'bg-white border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                        onClick={() => handleClassToggle(classItem.level)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{classItem?.level}</span>
                          <span className="text-lg">{classItem.isActive ? '✓' : '+'}</span>
                        </div>
                        <span className="text-xs text-gray-600 mt-1 block">{classItem?.label}</span>
                      </button>
                    )) : (
                      <p className="text-gray-500 text-sm text-center py-4">
                        Aucune classe disponible
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium">Erreur</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Bouton de soumission */}
        <div className="pt-6 border-t">
          <Button 
            type="submit" 
            className="w-full py-4 text-lg"
            loading={loading}
            disabled={loading}
            size="lg"
            key="submit-button"
          >
            🚀 Créer mon établissement
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WorkingSchoolRegistrationForm;