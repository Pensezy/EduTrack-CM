import React, { useState, useEffect } from 'react';
import { Database, Users, TestTube, Settings, Zap, CheckCircle } from 'lucide-react';
import dataModeService from '../services/dataModeService.js';
import schoolInitializationService from '../services/schoolInitializationService.js';

const DataModeToggle = ({ schoolInfo, userInfo }) => {
  const [currentMode, setCurrentMode] = useState('demo');
  const [isSchoolInitialized, setIsSchoolInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationProgress, setInitializationProgress] = useState({ current: 0, total: 0, step: '' });

  useEffect(() => {
    // Initialiser le service avec les informations de l'école et de l'utilisateur
    if (userInfo) {  // L'utilisateur est requis, schoolInfo peut être optionnel
      const schoolId = schoolInfo?.id || userInfo?.current_school_id || userInfo?.currentSchoolId;
      const isInitialized = schoolInfo?.isInitialized || false;
      
      dataModeService.initialize(schoolId, isInitialized, userInfo);
      setCurrentMode(dataModeService.getCurrentMode());
      setIsSchoolInitialized(dataModeService.isInitialized());
      
      console.log('DataModeToggle initialisé:', {
        userId: userInfo?.id,
        userEmail: userInfo?.email,
        schoolId,
        isInitialized,
        detectedMode: dataModeService.getCurrentMode()
      });
    }

    // Écouter les changements de mode
    const handleModeChange = (event) => {
      setCurrentMode(event.detail.mode);
    };

    // Écouter le progrès d'initialisation
    const handleInitializationProgress = (event) => {
      setInitializationProgress(event.detail);
    };

    window.addEventListener('dataModeChanged', handleModeChange);
    window.addEventListener('schoolInitializationProgress', handleInitializationProgress);
    
    return () => {
      window.removeEventListener('dataModeChanged', handleModeChange);
      window.removeEventListener('schoolInitializationProgress', handleInitializationProgress);
    };
  }, [schoolInfo]);

  const handleModeChange = (newMode) => {
    dataModeService.setMode(newMode);
  };

  const handleInitializeSchool = async () => {
    if (!schoolInfo?.id || isInitializing) return;

    setIsInitializing(true);
    try {
      const initData = schoolInitializationService.generateSchoolBaseData({
        type: 'college' // Par défaut, peut être configuré
      });
      
      await schoolInitializationService.initializeSchool(schoolInfo.id, initData);
      setIsSchoolInitialized(true);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      // TODO: Afficher une notification d'erreur
    } finally {
      setIsInitializing(false);
    }
  };

  const getModeInfo = (mode) => {
    const modes = {
      demo: {
        icon: TestTube,
        label: 'Données démo',
        description: 'Utilise des données fictives pour la formation',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        badgeColor: 'bg-blue-100 text-blue-800'
      },
      real: {
        icon: Database,
        label: 'Données réelles',
        description: 'Connecté à la base de données de l\'école',
        color: 'text-green-600 bg-green-50 border-green-200',
        badgeColor: 'bg-green-100 text-green-800'
      },
      hybrid: {
        icon: Settings,
        label: 'Mode hybride',
        description: 'Mélange données réelles et démo selon disponibilité',
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        badgeColor: 'bg-orange-100 text-orange-800'
      }
    };
    return modes[mode];
  };

  const currentModeInfo = getModeInfo(currentMode);
  const IconComponent = currentModeInfo.icon;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${currentModeInfo.color}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">
                Mode de données actuel
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentModeInfo.badgeColor}`}>
                {currentModeInfo.label}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {currentModeInfo.description}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          {['demo', 'real', 'hybrid'].map((mode) => {
            const modeInfo = getModeInfo(mode);
            const ModeIcon = modeInfo.icon;
            const isActive = currentMode === mode;
            const isDisabled = mode === 'real' && !isSchoolInitialized;

            return (
              <button
                key={mode}
                onClick={() => !isDisabled && handleModeChange(mode)}
                disabled={isDisabled}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isActive 
                    ? `${modeInfo.color} ring-2 ring-offset-2 ring-blue-500` 
                    : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                  }
                  ${isDisabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'cursor-pointer'
                  }
                `}
                title={isDisabled ? 'École non initialisée - données réelles indisponibles' : modeInfo.description}
              >
                <ModeIcon className="w-4 h-4" />
                <span>{modeInfo.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!isSchoolInitialized && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-yellow-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  École non initialisée
                </p>
                <p className="text-xs text-yellow-700 mt-1 mb-3">
                  Votre compte secrétaire a été créé mais l'école n'a pas encore été configurée avec des données réelles.
                </p>
                
                {isInitializing && (
                  <div className="mt-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-yellow-700">
                        {initializationProgress.step}
                      </span>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${initializationProgress.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-yellow-600 mt-1">
                      {initializationProgress.current}/{initializationProgress.total} étapes
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {!isInitializing && (
              <button
                onClick={handleInitializeSchool}
                className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>Initialiser l'école</span>
              </button>
            )}
          </div>
        </div>
      )}

      {currentMode === 'demo' && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <TestTube className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Mode démonstration actif
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {userInfo?.email?.includes('demo') 
                  ? 'Vous êtes connecté avec un compte démo. Toutes les données sont fictives.'
                  : 'Toutes les données affichées sont fictives et destinées à la formation.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {currentMode === 'hybrid' && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-800">
                Mode hybride actif
              </p>
              <p className="text-xs text-orange-700 mt-1">
                Vous avez un compte réel mais l'école n'est pas encore configurée. 
                Le système utilise des données de démonstration en attendant l'initialisation.
              </p>
            </div>
          </div>
        </div>
      )}

      {currentMode === 'real' && isSchoolInitialized && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Base de données connectée
              </p>
              <p className="text-xs text-green-700 mt-1">
                Vous travaillez avec les données réelles de votre école. 
                Toutes les modifications seront sauvegardées.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bouton de débogage en développement */}
      {import.meta.env.DEV && (
        <div className="mt-2">
          <button
            onClick={() => {
              console.log('État actuel du DataModeService:', {
                currentMode: dataModeService.getCurrentMode(),
                schoolId: dataModeService.schoolId,
                isInitialized: dataModeService.isSchoolInitialized,
                userInfo: dataModeService.userInfo
              });
            }}
            className="text-xs text-gray-500 underline"
          >
            [Debug] Afficher état
          </button>
        </div>
      )}
    </div>
  );
};

export default DataModeToggle;