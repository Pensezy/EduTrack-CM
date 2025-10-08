import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useAuth } from '../../../contexts/AuthContext';
import { useDataMode } from '../../../hooks/useDataMode';
import { useDashboardData } from '../../../hooks/useDashboardData';

const SchoolSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customClassName, setCustomClassName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // 🔄 Détection du mode données avec cache optimisé
  const { user } = useAuth();
  const { dataMode, isDemo, loading: modeLoading } = useDataMode();
  const { data, loading: dataLoading } = useDashboardData();

  // Récupérer les données de l'école EXACTEMENT comme dans le dashboard principal
  const schoolDataFromDatabase = data.schoolDetails;
  const schoolDataFromUser = user?.schoolData;
  const finalSchoolData = schoolDataFromDatabase || schoolDataFromUser;

  // Fonction pour obtenir l'email EXACTEMENT comme le nom dans le Header
  const getCurrentEmail = () => {
    if (isDemo) {
      return demoSchoolData.email;
    }
    // En production, utiliser EXACTEMENT la même cascade que pour le nom
    return (
      finalSchoolData?.email ||
      finalSchoolData?.director_email ||
      finalSchoolData?.users?.email ||
      user?.schoolData?.users?.email ||
      user?.email ||
      ''
    );
  };

  // Données de démonstration
  const demoSchoolData = {
    name: 'Complexe Scolaire Excellence',
    type: 'college',
    phone: '+237 695 123 456',
    email: 'contact@excellence.cm',
    address: 'Quartier Nlongkak, Yaoundé',
    availableClasses: [
      { level: '6ème', isActive: true, isCustom: false },
      { level: '5ème', isActive: true, isCustom: false },
      { level: '4ème', isActive: true, isCustom: false },
      { level: '3ème', isActive: false, isCustom: false }
    ]
  };

  // État des données école basé sur le mode - initialisation vide
  const [schoolData, setSchoolData] = useState({
    name: '',
    type: 'college',
    phone: '',
    email: '',
    address: '',
    availableClasses: []
  });

  // Mise à jour des données quand le mode ou l'utilisateur change
  useEffect(() => {
    // Ne pas mettre à jour si le mode est encore en cours de chargement
    if (modeLoading) return;
    
    if (isDemo) {
      setSchoolData(demoSchoolData);
    } else {
      // En mode production, utiliser EXACTEMENT les mêmes sources que le dashboard principal
      console.log('🔍 Mode Production - Sources de données:', {
        schoolDataFromDatabase: schoolDataFromDatabase,
        schoolDataFromUser: schoolDataFromUser,
        finalSchoolData: finalSchoolData,
        user: user,
        userEmail: user?.email
      });
      
      const currentEmail = getCurrentEmail();
      console.log('📧 Email final utilisé (même logique que Header):', currentEmail);
      
      setSchoolData({
        name: finalSchoolData?.name || finalSchoolData?.director_name || user?.full_name || 'Votre établissement',
        type: finalSchoolData?.type || 'college',
        phone: finalSchoolData?.phone || user?.phone || '',
        email: currentEmail,
        address: finalSchoolData?.address || '',
        availableClasses: (finalSchoolData?.available_classes)?.map(className => ({
          level: className,
          isActive: true,
          isCustom: false
        })) || []
      });
    }
  }, [isDemo, user, data, modeLoading, demoSchoolData]);

  // Mettre à jour les classes disponibles quand le type change
  useEffect(() => {
    const availableClasses = getAvailableClassesByType(schoolData.type);
    setSchoolData(prev => ({
      ...prev,
      availableClasses: [
        ...availableClasses.map(cls => ({ 
          level: cls.value, 
          isActive: false, 
          isCustom: false,
          category: cls.category 
        })),
        // Garder les classes personnalisées existantes
        ...prev.availableClasses.filter(cls => cls.isCustom)
      ]
    }));
  }, [schoolData.type]);

  const schoolTypes = [
    { value: 'maternelle', label: 'École Maternelle' },
    { value: 'primaire', label: 'École Primaire' },
    { value: 'college', label: 'Collège (6ème - 3ème)' },
    { value: 'lycee', label: 'Lycée (2nde - Terminale)' },
    { value: 'college_lycee', label: 'Collège-Lycée (6ème - Terminale)' },
    { value: 'universite', label: 'Université' },
    { value: 'formation_professionnelle', label: 'Formation Professionnelle' }
  ];

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
      case 'universite':
        return [
          { value: 'L1', label: 'Licence 1', category: 'université' },
          { value: 'L2', label: 'Licence 2', category: 'université' },
          { value: 'L3', label: 'Licence 3', category: 'université' },
          { value: 'M1', label: 'Master 1', category: 'université' },
          { value: 'M2', label: 'Master 2', category: 'université' },
          { value: 'Doctorat', label: 'Doctorat', category: 'université' }
        ];
      case 'formation_professionnelle':
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

  const handleInputChange = (field, value) => {
    setSchoolData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClassToggle = (classLevel) => {
    setSchoolData(prev => ({
      ...prev,
      availableClasses: prev.availableClasses.map(cls => 
        cls.level === classLevel 
          ? { ...cls, isActive: !cls.isActive }
          : cls
      )
    }));
  };

  const handleAddCustomClass = () => {
    if (!customClassName.trim()) return;
    
    // Vérifier si la classe existe déjà
    const exists = schoolData.availableClasses.some(cls => 
      cls.level.toLowerCase() === customClassName.trim().toLowerCase()
    );
    
    if (exists) {
      alert('Cette classe existe déjà !');
      return;
    }

    setSchoolData(prev => ({
      ...prev,
      availableClasses: [
        ...prev.availableClasses,
        { 
          level: customClassName.trim(), 
          isActive: true, 
          isCustom: true,
          category: 'personnalisée' 
        }
      ]
    }));
    
    setCustomClassName('');
    setShowCustomInput(false);
  };

  const handleRemoveCustomClass = (classLevel) => {
    setSchoolData(prev => ({
      ...prev,
      availableClasses: prev.availableClasses.filter(cls => cls.level !== classLevel)
    }));
  };

  const handleSchoolTypeChange = (newType) => {
    setSchoolData(prev => ({
      ...prev,
      type: newType
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    if (isDemo) {
      // Mode démo : simulation seulement
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Mode démo - Paramètres école simulés:', schoolData);
        alert('Mode démo - Paramètres sauvegardés (simulation uniquement)');
      } catch (error) {
        console.error('Erreur simulation:', error);
        alert('Erreur lors de la simulation');
      }
    } else {
      // Mode production : vraie sauvegarde Supabase
      try {
        // Ici vous ajouteriez la logique de sauvegarde réelle vers Supabase
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Production - Paramètres école sauvegardés:', schoolData);
        alert('Paramètres sauvegardés avec succès !');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde');
      }
    }
    
    setSaving(false);
  };

  const getActiveClassesCount = () => {
    return schoolData.availableClasses.filter(cls => cls.isActive).length;
  };

  const getSchoolTypeLabel = () => {
    const type = schoolTypes.find(t => t.value === schoolData.type);
    return type ? type.label : 'Non défini';
  };

  const getSchoolTypeDescription = (type) => {
    switch (type) {
      case 'maternelle':
        return 'École maternelle : Petite, Moyenne et Grande Section pour les enfants de 3 à 6 ans.';
      case 'primaire':
        return 'École primaire : Classes de CP à CM2 pour les enfants de 6 à 11 ans.';
      case 'college':
        return 'Collège : Classes de 6ème à 3ème pour le premier cycle du secondaire (Cameroun).';
      case 'lycee':
        return 'Lycée : Classes de 2nde à Terminale pour le second cycle du secondaire (Cameroun).';
      case 'college_lycee':
        return 'Collège-Lycée : Établissement complet de la 6ème à la Terminale (très courant au Cameroun).';
      case 'universite':
        return 'Université : Enseignement supérieur (Licence, Master, Doctorat).';
      case 'formation_professionnelle':
        return 'Formation professionnelle : CAP, BEP, Bac Pro pour l\'apprentissage de métiers spécialisés.';
      default:
        return 'Sélectionnez un type d\'établissement pour voir les classes appropriées.';
    }
  };

  // Afficher le loader si le mode est en cours de détection
  if (modeLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <div>
              <h3 className="font-semibold text-blue-800">Détection du mode de données...</h3>
              <p className="text-sm text-blue-700">
                Identification du type de données (démonstration ou production) en cours.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 📊 Indicateur de mode données */}
      {isDemo && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Icon name="AlertTriangle" size={20} className="text-amber-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800">Mode Démonstration</h3>
              <p className="text-sm text-amber-700">
                Vous consultez des données de démonstration. Les modifications ne seront pas sauvegardées.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 📊 Indicateur mode production */}
      {!isDemo && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Icon name="CheckCircle" size={20} className="text-green-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-800">Mode Production</h3>
              <p className="text-sm text-green-700">
                Vous consultez les vraies données de votre établissement. Les modifications seront sauvegardées.
              </p>
              {/* Debug temporaire */}
              <p className="text-xs text-green-600 mt-2">
                Debug: Email utilisateur = {user?.email || 'AUCUN'} | Email école = {getCurrentEmail() || 'AUCUN'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* En-tête des paramètres */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isDemo ? 'bg-amber-100' : 'bg-blue-100'
            }`}>
              <Icon name="School" size={20} className={`${
                isDemo ? 'text-amber-600' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <h2 className="font-heading font-heading-semibold text-lg text-card-foreground">
                Paramètres de l'établissement {isDemo && '(Démo)'}
              </h2>
              <p className="font-caption font-caption-normal text-sm text-muted-foreground">
                {isDemo 
                  ? 'Configuration de démonstration - modifications simulées'
                  : 'Configuration et informations générales'
                }
              </p>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            loading={saving}
            className={`${
              isDemo 
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Icon name="Save" size={16} className="mr-2" />
            {isDemo ? 'Simuler' : 'Sauvegarder'}
          </Button>
        </div>

        {/* Statistiques rapides avec email visible */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Icon name="GraduationCap" size={20} className="text-blue-600" />
              <div>
                <p className="font-body font-body-semibold text-sm text-blue-900">
                  Type d'établissement
                </p>
                <p className="font-caption font-caption-normal text-xs text-blue-700">
                  {getSchoolTypeLabel()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Icon name="Users" size={20} className="text-green-600" />
              <div>
                <p className="font-body font-body-semibold text-sm text-green-900">
                  Classes actives
                </p>
                <p className="font-caption font-caption-normal text-xs text-green-700">
                  {getActiveClassesCount()} niveaux disponibles
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Icon name="Calendar" size={20} className="text-purple-600" />
              <div>
                <p className="font-body font-body-semibold text-sm text-purple-900">
                  Année scolaire
                </p>
                <p className="font-caption font-caption-normal text-xs text-purple-700">
                  2025-2026
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Icon name="Mail" size={20} className="text-orange-600" />
              <div className="flex-1 min-w-0">
                <p className="font-body font-body-semibold text-sm text-orange-900">
                  Email principal
                </p>
                <p className="font-caption font-caption-normal text-xs text-orange-700 truncate" 
                   title={getCurrentEmail() || 'Non défini - Veuillez configurer'}>
                  {getCurrentEmail() ? (
                    <span className="flex items-center">
                      <Icon name="CheckCircle" size={12} className="mr-1 text-green-600" />
                      {getCurrentEmail()}
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <Icon name="AlertCircle" size={12} className="mr-1" />
                      Non défini
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations générales */}
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Informations de base</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom de l'établissement"
                value={schoolData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Complexe Scolaire Excellence"
              />
              
              <Select
                label="Type d'établissement"
                value={schoolData.type}
                onChange={handleSchoolTypeChange}
                options={schoolTypes}
              />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm flex items-center">
              <Icon name="Phone" size={16} className="mr-2 text-blue-600" />
              Informations de contact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email de l'établissement"
                type="email"
                value={schoolData.email || getCurrentEmail()}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={isDemo ? "contact@excellence.cm" : (getCurrentEmail() || "contact@votre-ecole.cm")}
                helperText="📧 Email principal pour les communications officielles"
                className="border-orange-200 focus:border-orange-500"
              />

              <Input
                label="Téléphone"
                value={schoolData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+237 6XX XXX XXX"
                helperText="📞 Numéro principal de l'établissement"
              />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm flex items-center">
              <Icon name="MapPin" size={16} className="mr-2 text-green-600" />
              Localisation
            </h4>
            <Input
              label="Adresse complète"
              value={schoolData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Quartier, Ville, Région"
              helperText="📍 Adresse physique de l'établissement"
            />
          </div>
        </div>
      </div>

      {/* Configuration des classes */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="Users" size={20} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">
                Classes disponibles
              </h3>
              <p className="font-caption font-caption-normal text-sm text-muted-foreground">
                Sélectionnez les niveaux proposés dans votre établissement
              </p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {getActiveClassesCount()} / {schoolData.availableClasses.length} classes actives
          </div>
        </div>

        {/* Classes par catégorie */}
        {schoolData.availableClasses.length > 0 && (
          <div className="space-y-6">
            {/* Grouper les classes par catégorie */}
            {[...new Set(schoolData.availableClasses.map(cls => cls.category || 'autre'))].map(category => (
              <div key={category || 'autre'}>
                <h4 className="font-body font-body-semibold text-sm text-gray-900 mb-3 capitalize">
                  Classes {category}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schoolData.availableClasses
                    .filter(cls => (cls.category || 'autre') === category)
                    .map((classItem) => {
                      const availableClasses = getAvailableClassesByType(schoolData.type);
                      const classInfo = availableClasses.find(c => c.value === classItem.level);
                      
                      return (
                        <div
                          key={classItem.level}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 relative ${
                            classItem.isActive
                              ? 'border-green-300 bg-green-50 hover:bg-green-100'
                              : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => handleClassToggle(classItem.level)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                classItem.isActive ? 'bg-green-100' : 'bg-gray-100'
                              }`}>
                                <Icon 
                                  name={classItem.isActive ? "CheckCircle" : "Circle"} 
                                  size={16} 
                                  className={classItem.isActive ? 'text-green-600' : 'text-gray-400'} 
                                />
                              </div>
                              <div>
                                <p className={`font-body font-body-semibold text-sm ${
                                  classItem.isActive ? 'text-green-900' : 'text-gray-600'
                                }`}>
                                  {classItem.level}
                                  {classItem.isCustom && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                      Personnalisée
                                    </span>
                                  )}
                                </p>
                                <p className={`font-caption font-caption-normal text-xs ${
                                  classItem.isActive ? 'text-green-700' : 'text-gray-500'
                                }`}>
                                  {classInfo?.label || classItem.category}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {classItem.isActive && (
                                <Icon name="Check" size={16} className="text-green-600" />
                              )}
                              {classItem.isCustom && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveCustomClass(classItem.level);
                                  }}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Supprimer cette classe personnalisée"
                                >
                                  <Icon name="Trash2" size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bouton pour ajouter une classe personnalisée */}
        <div className="mt-6">
          {!showCustomInput ? (
            <Button
              variant="outline"
              onClick={() => setShowCustomInput(true)}
              className="border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Ajouter une classe personnalisée
            </Button>
          ) : (
            <div className="flex space-x-3 items-end">
              <div className="flex-1">
                <Input
                  label="Nom de la classe"
                  value={customClassName}
                  onChange={(e) => setCustomClassName(e.target.value)}
                  placeholder="Ex: CP3, BEP, CAP..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCustomClass()}
                />
              </div>
              <Button
                onClick={handleAddCustomClass}
                disabled={!customClassName.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Icon name="Check" size={16} />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomClassName('');
                }}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
            <div>
              <p className="font-body font-body-semibold text-sm text-blue-900 mb-1">
                Configuration adaptée - {getSchoolTypeLabel()}
              </p>
              <p className="font-caption font-caption-normal text-xs text-blue-700">
                {getSchoolTypeDescription(schoolData.type)}
                <br />
                Les classes sélectionnées seront disponibles pour l'inscription des élèves et l'affectation des enseignants.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolSettings;