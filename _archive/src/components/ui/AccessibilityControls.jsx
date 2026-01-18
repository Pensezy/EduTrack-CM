import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const AccessibilityControls = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'light',
    largeText: false
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      applySettings(parsed);
    }
  }, []);

  // Save settings to localStorage and apply them
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
    applySettings(newSettings);
  };

  const applySettings = (settingsToApply) => {
    const root = document.documentElement;
    
    // Theme - Mode Jour/Nuit
    if (settingsToApply?.theme === 'dark') {
      root.classList?.add('dark');
      root.setAttribute('data-theme', 'dark');
      // Appliquer les couleurs du mode sombre avec meilleur contraste
      root.style.setProperty('--color-background', '#0f172a');
      root.style.setProperty('--color-foreground', '#f8fafc');
      root.style.setProperty('--color-card', '#1e293b');
      root.style.setProperty('--color-border', '#475569');
      root.style.setProperty('--color-muted', '#334155');
      root.style.setProperty('--color-muted-foreground', '#e2e8f0');
      root.style.setProperty('--color-primary', '#3b82f6');
      root.style.setProperty('--color-primary-foreground', '#f8fafc');
      console.log('🌙 Mode Nuit activé avec contraste amélioré');
    } else {
      root.classList?.remove('dark');
      root.setAttribute('data-theme', 'light');
      // Réinitialiser les couleurs
      root.style.removeProperty('--color-background');
      root.style.removeProperty('--color-foreground');
      root.style.removeProperty('--color-card');
      root.style.removeProperty('--color-border');
      root.style.removeProperty('--color-muted');
      root.style.removeProperty('--color-muted-foreground');
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-primary-foreground');
      console.log('☀️ Mode Jour activé');
    }

    // Large text
    if (settingsToApply?.largeText) {
      root.classList?.add('large-text');
      root.style.fontSize = '118%';
      console.log('🔤 Texte agrandi activé');
    } else {
      root.classList?.remove('large-text');
      root.style.fontSize = '';
    }
  };

  const resetSettings = () => {
    const defaultSettings = {
      theme: 'light',
      largeText: false
    };
    setSettings(defaultSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(defaultSettings));
    applySettings(defaultSettings);
  };

  const accessibilityOptions = [
    {
      key: 'theme',
      label: 'Mode Nuit/Jour',
      description: 'Basculer entre le thème clair et sombre',
      icon: 'Moon',
      type: 'select',
      options: [
        { value: 'light', label: '☀️ Jour' },
        { value: 'dark', label: '🌙 Nuit' }
      ]
    },
    {
      key: 'largeText',
      label: 'Texte Agrandi',
      description: 'Augmente la taille du texte pour une meilleure lisibilité',
      icon: 'Type',
      type: 'toggle'
    }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Accessibility Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        title="Accessibility Options"
      >
        <Icon name="Accessibility" size={20} />
        {(settings?.largeText || settings?.theme === 'dark') && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full" />
        )}
      </Button>
      {/* Accessibility Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-accessibility" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Settings Panel */}
          <div className="absolute right-0 top-12 w-80 bg-popover border border-border rounded-lg shadow-modal z-accessibility">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-heading font-heading-semibold text-sm text-popover-foreground">
                Accessibility Settings
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetSettings}
                className="text-xs"
              >
                Reset
              </Button>
            </div>

            {/* Settings List */}
            <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
              {accessibilityOptions?.map((option) => (
                <div key={option?.key} className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1 text-primary">
                      <Icon name={option?.icon} size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <label className="font-body font-body-semibold text-sm text-popover-foreground">
                          {option?.label}
                        </label>
                        {option?.type === 'toggle' && (
                          <button
                            onClick={() => updateSetting(option?.key, !settings?.[option?.key])}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                              settings?.[option?.key] ? 'bg-primary' : 'bg-muted'
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                settings?.[option?.key] ? 'translate-x-5' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        )}
                        {option?.type === 'select' && (
                          <select
                            value={settings?.[option?.key]}
                            onChange={(e) => updateSetting(option?.key, e?.target?.value)}
                            className="text-sm border border-border rounded px-2 py-1 bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            {option?.options?.map((opt) => (
                              <option key={opt?.value} value={opt?.value}>
                                {opt?.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <p className="font-body font-body-normal text-xs text-muted-foreground mt-1">
                        {option?.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Icon name="Info" size={14} />
                <p className="font-caption font-caption-normal text-xs">
                  Settings are saved automatically and persist across sessions.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      {/* CSS for accessibility classes */}
      <style jsx global>{`
        /* Dark Theme - Mode Nuit Amélioré */
        .dark {
          background-color: #0f172a !important;
          color: #f8fafc !important;
        }
        
        /* Backgrounds */
        .dark .bg-white,
        .dark .bg-gray-50 {
          background-color: #1e293b !important;
          color: #f8fafc !important;
        }
        
        .dark .bg-gray-100 {
          background-color: #334155 !important;
          color: #f8fafc !important;
        }
        
        .dark .bg-gray-200 {
          background-color: #475569 !important;
          color: #f8fafc !important;
        }
        
        .dark .bg-blue-50 {
          background-color: #1e3a5f !important;
          color: #dbeafe !important;
        }
        
        .dark .bg-green-50 {
          background-color: #1a4d2e !important;
          color: #d1fae5 !important;
        }
        
        .dark .bg-purple-50 {
          background-color: #3b2a4f !important;
          color: #e9d5ff !important;
        }
        
        .dark .bg-orange-50 {
          background-color: #4a2c1b !important;
          color: #fed7aa !important;
        }
        
        .dark .bg-yellow-50 {
          background-color: #4a4218 !important;
          color: #fef3c7 !important;
        }
        
        /* Text Colors - Contraste Amélioré */
        .dark .text-gray-900,
        .dark .text-gray-800,
        .dark .text-gray-700,
        .dark .text-gray-600 {
          color: #f8fafc !important;
        }
        
        .dark .text-gray-500 {
          color: #e2e8f0 !important;
        }
        
        .dark .text-gray-400 {
          color: #cbd5e1 !important;
        }
        
        .dark .text-gray-300 {
          color: #94a3b8 !important;
        }
        
        /* Text Colors Colorés */
        .dark .text-blue-600,
        .dark .text-blue-700,
        .dark .text-blue-800,
        .dark .text-blue-900 {
          color: #93c5fd !important;
        }
        
        .dark .text-green-600,
        .dark .text-green-700,
        .dark .text-green-800,
        .dark .text-green-900 {
          color: #86efac !important;
        }
        
        .dark .text-red-600,
        .dark .text-red-700,
        .dark .text-red-800,
        .dark .text-red-900 {
          color: #fca5a5 !important;
        }
        
        .dark .text-orange-600,
        .dark .text-orange-700,
        .dark .text-orange-800,
        .dark .text-orange-900 {
          color: #fdba74 !important;
        }
        
        .dark .text-purple-600,
        .dark .text-purple-700,
        .dark .text-purple-800,
        .dark .text-purple-900 {
          color: #c4b5fd !important;
        }
        
        .dark .text-yellow-600,
        .dark .text-yellow-700,
        .dark .text-yellow-800,
        .dark .text-yellow-900 {
          color: #fde047 !important;
        }
        
        /* Borders */
        .dark .border-gray-200,
        .dark .border-gray-300 {
          border-color: #475569 !important;
        }
        
        .dark .border-gray-100 {
          border-color: #334155 !important;
        }
        
        .dark .border-blue-200 {
          border-color: #3b82f6 !important;
        }
        
        .dark .border-green-200 {
          border-color: #22c55e !important;
        }
        
        /* Shadows */
        .dark .shadow-sm,
        .dark .shadow {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6) !important;
        }
        
        .dark .shadow-lg {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.7) !important;
        }
        
        /* Cards et Conteneurs */
        .dark .bg-card {
          background-color: #1e293b !important;
          color: #f8fafc !important;
        }
        
        /* Boutons */
        .dark button {
          color: #f8fafc !important;
        }
        
        .dark .bg-blue-600 {
          background-color: #2563eb !important;
        }
        
        .dark .bg-green-600 {
          background-color: #16a34a !important;
        }
        
        /* Inputs */
        .dark input,
        .dark select,
        .dark textarea {
          background-color: #334155 !important;
          color: #f8fafc !important;
          border-color: #475569 !important;
        }
        
        .dark input::placeholder {
          color: #94a3b8 !important;
        }
        
        /* Tables */
        .dark table {
          color: #f8fafc !important;
        }
        
        .dark thead {
          background-color: #334155 !important;
        }
        
        .dark tbody tr {
          border-color: #475569 !important;
        }
        
        .dark tbody tr:hover {
          background-color: #334155 !important;
        }
        
        /* Large Text Mode */
        .large-text {
          font-size: 118% !important;
        }
        
        .large-text * {
          line-height: 1.6 !important;
        }
        
        .large-text h1 { font-size: 2.75rem !important; }
        .large-text h2 { font-size: 2.25rem !important; }
        .large-text h3 { font-size: 1.875rem !important; }
        .large-text h4 { font-size: 1.5rem !important; }
        .large-text h5 { font-size: 1.25rem !important; }
        .large-text h6 { font-size: 1.125rem !important; }
        .large-text p, 
        .large-text span, 
        .large-text div { 
          font-size: 1.125rem !important; 
        }
        .large-text button { 
          font-size: 1.125rem !important; 
          padding: 0.75rem 1.5rem !important; 
        }
        .large-text input, 
        .large-text select, 
        .large-text textarea { 
          font-size: 1.125rem !important; 
        }
      `}</style>
    </div>
  );
};

export default AccessibilityControls;