import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

/**
 * Composant de test des paramètres d'accessibilité
 * Affiche l'état actuel de tous les paramètres d'accessibilité
 * Accessible depuis le dashboard principal (onglet System → Test Accessibilité)
 */
const AccessibilityTester = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    largeText: false
  });

  const [htmlClasses, setHtmlClasses] = useState([]);
  const [htmlAttributes, setHtmlAttributes] = useState({});

  useEffect(() => {
    // Charger les paramètres depuis localStorage
    const loadSettings = () => {
      const saved = localStorage.getItem('accessibility-settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }

      // Récupérer les classes du HTML root
      const root = document.documentElement;
      setHtmlClasses(Array.from(root.classList));

      // Récupérer les attributs pertinents
      setHtmlAttributes({
        'data-theme': root.getAttribute('data-theme')
      });
    };

    loadSettings();

    // Mettre à jour toutes les 500ms pour voir les changements en temps réel
    const interval = setInterval(loadSettings, 500);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (isActive) => {
    return isActive ? 
      <Icon name="CheckCircle" size={20} className="text-green-600" /> : 
      <Icon name="XCircle" size={20} className="text-gray-400" />;
  };

  const getStatusText = (isActive) => {
    return isActive ? 
      <span className="text-green-600 font-semibold">✅ ACTIF</span> : 
      <span className="text-gray-500">❌ Inactif</span>;
  };

  const testFeature = (feature) => {
    const tests = {
      theme: () => {
        return document.documentElement.classList.contains('dark');
      },
      largeText: () => {
        return document.documentElement.style.fontSize === '118%' || 
               document.documentElement.classList.contains('large-text');
      }
    };

    return tests[feature] ? tests[feature]() : false;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Icon name="TestTube" size={20} className="text-blue-600" />
            <span>Test des Paramètres d'Accessibilité</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            État en temps réel des paramètres d'accessibilité
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
        >
          <Icon name="RefreshCw" size={14} className="mr-2" />
          Recharger
        </Button>
      </div>

      {/* État des paramètres */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-700">📊 État des Paramètres</h4>
        
        {/* Theme */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {getStatusIcon(settings.theme === 'dark')}
            <div>
              <p className="font-medium text-gray-900">Mode Nuit/Jour</p>
              <p className="text-xs text-gray-600">Thème de l'interface</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`font-semibold ${settings.theme === 'dark' ? 'text-blue-600' : 'text-orange-600'}`}>
              {settings.theme === 'dark' ? '🌙 NUIT' : '☀️ JOUR'}
            </span>
            <p className="text-xs text-gray-600 mt-1">
              Test: {testFeature('theme') === (settings.theme === 'dark') ? '✅ OK' : '❌ KO'}
            </p>
          </div>
        </div>

        {/* Large Text */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {getStatusIcon(settings.largeText)}
            <div>
              <p className="font-medium text-gray-900">Texte Agrandi</p>
              <p className="text-xs text-gray-600">Taille de police augmentée</p>
            </div>
          </div>
          <div className="text-right">
            {getStatusText(settings.largeText)}
            <p className="text-xs text-gray-600 mt-1">
              Test: {testFeature('largeText') ? '✅ OK' : '❌ KO'}
            </p>
          </div>
        </div>
      </div>

      {/* Classes HTML Root */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-700">🏷️ Classes HTML Root</h4>
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex flex-wrap gap-2">
            {htmlClasses.length > 0 ? (
              htmlClasses.map((cls) => (
                <span key={cls} className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full font-mono">
                  .{cls}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">Aucune classe appliquée</span>
            )}
          </div>
        </div>
      </div>

      {/* Attributs HTML Root */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-700">🔖 Attributs HTML Root</h4>
        <div className="p-4 bg-purple-50 rounded-lg space-y-2">
          {Object.entries(htmlAttributes).map(([key, value]) => (
            value && (
              <div key={key} className="flex items-center justify-between">
                <code className="text-xs font-mono text-purple-900">{key}</code>
                <code className="text-xs font-mono text-purple-700 bg-purple-100 px-2 py-1 rounded">
                  "{value}"
                </code>
              </div>
            )
          ))}
          {Object.values(htmlAttributes).every(v => !v) && (
            <span className="text-gray-500 text-sm">Aucun attribut appliqué</span>
          )}
        </div>
      </div>

      {/* Tests visuels */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">👁️ Tests Visuels</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Test theme */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900 mb-2">Test Thème</p>
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-white border-2 border-gray-300 rounded"></div>
              <div className="w-12 h-12 bg-gray-900 border-2 border-gray-700 rounded"></div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {settings.theme === 'dark' ? '🌙 Fond sombre' : '☀️ Fond clair'}
            </p>
          </div>

          {/* Test texte */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Test Taille Texte</p>
            <p className="text-gray-900">Texte de référence Aa</p>
            <p className="text-xs text-gray-600 mt-2">
              {settings.largeText ? 'Doit être agrandi (+18%)' : 'Taille normale (100%)'}
            </p>
          </div>
        </div>
      </div>

      {/* Résumé */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-green-600 mt-0.5" />
          <div>
            <p className="font-medium text-green-900">Résumé</p>
            <p className="text-sm text-green-700 mt-1">
              {(settings.largeText ? 1 : 0) + (settings.theme === 'dark' ? 1 : 0)} paramètre(s) actif(s) sur 2
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityTester;
