import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const AccessibilityToggle = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    highContrast: false,
    largeText: false,
    audioSupport: false,
    reducedMotion: false
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('edutrack-accessibility');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      applySettings(parsed);
    }
  }, []);

  const applySettings = (settingsToApply) => {
    const root = document.documentElement;
    
    if (settingsToApply?.highContrast) {
      root.classList?.add('high-contrast');
    } else {
      root.classList?.remove('high-contrast');
    }

    if (settingsToApply?.largeText) {
      root.classList?.add('large-text');
    } else {
      root.classList?.remove('large-text');
    }

    if (settingsToApply?.reducedMotion) {
      root.classList?.add('reduce-motion');
    } else {
      root.classList?.remove('reduce-motion');
    }
  };

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('edutrack-accessibility', JSON.stringify(newSettings));
    applySettings(newSettings);
  };

  const accessibilityOptions = [
    {
      key: 'highContrast',
      label: 'Contraste élevé',
      description: 'Améliore la visibilité des éléments',
      icon: 'Contrast'
    },
    {
      key: 'largeText',
      label: 'Texte agrandi',
      description: 'Augmente la taille du texte',
      icon: 'Type'
    },
    {
      key: 'audioSupport',
      label: 'Support audio',
      description: 'Active les instructions vocales',
      icon: 'Volume2'
    },
    {
      key: 'reducedMotion',
      label: 'Réduire les animations',
      description: 'Minimise les mouvements',
      icon: 'Pause'
    }
  ];

  const hasActiveSettings = Object.values(settings)?.some(value => value === true);

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        title="Options d'accessibilité"
      >
        <Icon name="Accessibility" size={20} />
        {hasActiveSettings && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full" />
        )}
      </Button>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Accessibility Panel */}
          <div className="absolute top-12 right-0 w-80 bg-popover border border-border rounded-lg shadow-modal z-20">
            <div className="p-4 border-b border-border">
              <h3 className="font-heading font-heading-semibold text-sm text-popover-foreground">
                Options d'accessibilité
              </h3>
            </div>
            
            <div className="p-4 space-y-4">
              {accessibilityOptions?.map((option) => (
                <div key={option?.key} className="flex items-center justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1 text-primary">
                      <Icon name={option?.icon} size={16} />
                    </div>
                    <div>
                      <label className="font-body font-body-semibold text-sm text-popover-foreground block">
                        {option?.label}
                      </label>
                      <p className="font-body font-body-normal text-xs text-muted-foreground">
                        {option?.description}
                      </p>
                    </div>
                  </div>
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
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Icon name="Info" size={14} />
                <p className="font-caption font-caption-normal text-xs">
                  Les paramètres sont sauvegardés automatiquement
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      <style global="true">{`
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
        
        .reduce-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `}</style>
    </div>
  );
};

export default AccessibilityToggle;