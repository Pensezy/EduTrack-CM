import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const AccessibilityControls = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    audioSupport: false,
    theme: 'light'
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
    
    // High contrast mode
    if (settingsToApply?.highContrast) {
      root.classList?.add('high-contrast');
    } else {
      root.classList?.remove('high-contrast');
    }

    // Large text
    if (settingsToApply?.largeText) {
      root.classList?.add('large-text');
    } else {
      root.classList?.remove('large-text');
    }

    // Reduced motion
    if (settingsToApply?.reducedMotion) {
      root.classList?.add('reduce-motion');
    } else {
      root.classList?.remove('reduce-motion');
    }

    // Theme
    if (settingsToApply?.theme === 'dark') {
      root.classList?.add('dark');
    } else {
      root.classList?.remove('dark');
    }
  };

  const resetSettings = () => {
    const defaultSettings = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      audioSupport: false,
      theme: 'light'
    };
    setSettings(defaultSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(defaultSettings));
    applySettings(defaultSettings);
  };

  const accessibilityOptions = [
    {
      key: 'highContrast',
      label: 'High Contrast',
      description: 'Increase color contrast for better visibility',
      icon: 'Contrast',
      type: 'toggle'
    },
    {
      key: 'largeText',
      label: 'Large Text',
      description: 'Increase text size for better readability',
      icon: 'Type',
      type: 'toggle'
    },
    {
      key: 'reducedMotion',
      label: 'Reduce Motion',
      description: 'Minimize animations and transitions',
      icon: 'Pause',
      type: 'toggle'
    },
    {
      key: 'audioSupport',
      label: 'Audio Support',
      description: 'Enable audio cues and screen reader support',
      icon: 'Volume2',
      type: 'toggle'
    },
    {
      key: 'theme',
      label: 'Theme',
      description: 'Switch between light and dark themes',
      icon: 'Palette',
      type: 'select',
      options: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' }
      ]
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
        {Object.values(settings)?.some(value => value === true || value === 'dark') && (
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
        .high-contrast {
          --color-background: #000000;
          --color-foreground: #FFFFFF;
          --color-card: #1a1a1a;
          --color-border: #FFFFFF;
          --color-muted: #333333;
        }
        
        .large-text {
          font-size: 1.125rem;
        }
        
        .large-text h1 { font-size: 2.5rem; }
        .large-text h2 { font-size: 2rem; }
        .large-text h3 { font-size: 1.75rem; }
        .large-text h4 { font-size: 1.5rem; }
        .large-text h5 { font-size: 1.25rem; }
        .large-text h6 { font-size: 1.125rem; }
        
        .reduce-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .reduce-motion * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AccessibilityControls;