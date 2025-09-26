import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const SchoolSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customClassName, setCustomClassName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [schoolData, setSchoolData] = useState({
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
  });

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
    { value: 'primary', label: 'École Primaire' },
    { value: 'secondary', label: 'Établissement Secondaire' },
    { value: 'college', label: 'Collège' },
    { value: 'high_school', label: 'Lycée' },
    { value: 'institut', label: 'Institut' },
    { value: 'university', label: 'Université' }
  ];

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
          // Collège + Lycée
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
    try {
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Saving school settings:', schoolData);
      alert('Paramètres sauvegardés avec succès !');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
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
        return 'Sélectionnez un type d\'établissement pour voir les classes appropriées.';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête des paramètres */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="School" size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-heading font-heading-semibold text-lg text-card-foreground">
                Paramètres de l'établissement
              </h2>
              <p className="font-caption font-caption-normal text-sm text-muted-foreground">
                Configuration et informations générales
              </p>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            loading={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Icon name="Save" size={16} className="mr-2" />
            Sauvegarder
          </Button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                  2024-2025
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Nom de l'établissement"
            value={schoolData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
          
          <Select
            label="Type d'établissement"
            value={schoolData.type}
            onChange={handleSchoolTypeChange}
            options={schoolTypes}
          />

          <Input
            label="Téléphone"
            value={schoolData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />

          <Input
            label="Email"
            type="email"
            value={schoolData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />

          <div className="md:col-span-2">
            <Input
              label="Adresse"
              value={schoolData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
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
            {[...new Set(schoolData.availableClasses.map(cls => cls.category))].map(category => (
              <div key={category}>
                <h4 className="font-body font-body-semibold text-sm text-gray-900 mb-3 capitalize">
                  Classes {category}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schoolData.availableClasses
                    .filter(cls => cls.category === category)
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