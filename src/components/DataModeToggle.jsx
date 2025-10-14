import React, { useState, useEffect } from 'react';
import { Database, TestTube } from 'lucide-react';
import dataModeService from '../services/dataModeService.js';

const DataModeToggle = ({ schoolInfo, userInfo }) => {
  const [currentMode, setCurrentMode] = useState('demo');

  useEffect(() => {
    // Initialiser le service avec les informations de l'école et de l'utilisateur
    if (userInfo) {  
      const schoolId = schoolInfo?.id || userInfo?.current_school_id || userInfo?.currentSchoolId;
      const isInitialized = schoolInfo?.isInitialized || false;
      
      dataModeService.initialize(schoolId, isInitialized, userInfo);
      setCurrentMode(dataModeService.getCurrentMode());
      
      console.log('DataModeToggle initialisé:', {
        userId: userInfo?.id,
        userEmail: userInfo?.email,
        schoolId,
        detectedMode: dataModeService.getCurrentMode()
      });
    }


  }, [schoolInfo, userInfo]);

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
              {currentMode === 'demo' 
                ? 'Données fictives pour la démonstration et formation'
                : 'Données réelles de votre établissement'
              }
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-600">
            {userInfo?.email?.includes('demo') 
              ? 'Connecté avec un compte démo'
              : 'Connecté avec un compte réel'
            }
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {userInfo?.email || 'Non connecté'}
          </p>
        </div>
      </div>



      {currentMode === 'demo' && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <TestTube className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Mode démonstration
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Vous utilisez un compte démo. Pour accéder aux données réelles, 
                connectez-vous avec un compte secrétaire existant dans la base de données.
              </p>
            </div>
          </div>
        </div>
      )}

      {currentMode === 'real' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Données réelles
              </p>
              <p className="text-xs text-green-700 mt-1">
                Vous êtes connecté avec un compte secrétaire réel. 
                Toutes les modifications seront sauvegardées dans la base de données.
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