import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const LanguageToggle = ({ className = '' }) => {
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ];

  useEffect(() => {
    const savedLanguage = localStorage.getItem('edutrack-language');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageChange = (languageCode) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem('edutrack-language', languageCode);
    setIsOpen(false);
    
    // Trigger language change event for other components
    window.dispatchEvent(new CustomEvent('languageChange', { 
      detail: { language: languageCode } 
    }));
  };

  const currentLang = languages?.find(lang => lang?.code === currentLanguage);

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <span className="text-lg">{currentLang?.flag}</span>
        <span className="font-body font-body-normal text-sm">
          {currentLang?.code?.toUpperCase()}
        </span>
        <Icon name="ChevronDown" size={14} />
      </Button>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Language Dropdown */}
          <div className="absolute top-12 right-0 w-48 bg-popover border border-border rounded-lg shadow-modal z-20">
            <div className="p-2">
              {languages?.map((language) => (
                <button
                  key={language?.code}
                  onClick={() => handleLanguageChange(language?.code)}
                  className={`flex items-center space-x-3 w-full px-3 py-2 text-left rounded-md transition-micro hover:bg-muted ${
                    currentLanguage === language?.code ? 'bg-primary/10 text-primary' : 'text-popover-foreground'
                  }`}
                >
                  <span className="text-lg">{language?.flag}</span>
                  <span className="font-body font-body-normal text-sm">
                    {language?.name}
                  </span>
                  {currentLanguage === language?.code && (
                    <Icon name="Check" size={14} className="ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageToggle;