import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const SchoolSettings = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: 'Settings' },
    { id: 'academic', label: 'Académique', icon: 'BookOpen' },
    { id: 'security', label: 'Sécurité', icon: 'Shield' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'system', label: 'Système', icon: 'Server' }
  ];

  const [settings, setSettings] = useState({
    schoolName: 'EduTrack CM',
    schoolAddress: 'Douala, Cameroun',
    schoolPhone: '+237 6XX XXX XXX',
    schoolEmail: 'info@edutrack.cm',
    academicYear: '2024-2025',
    termSystem: 'trimester',
    gradingSystem: '20',
    passGrade: '10',
    language: 'fr',
    timezone: 'Africa/Douala',
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
    maxFileSize: '10',
    sessionTimeout: '60'
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    console.log('Saving settings:', settings);
    alert('Paramètres sauvegardés avec succès !');
  };

  return (
    <>
      <Helmet>
        <title>Paramètres École - EduTrack CM</title>
        <meta name="description" content="Configurer les paramètres de l'école" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header 
          userRole="principal" 
          userName="M. Directeur"
          isCollapsed={isSidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />
        
        <div className="flex pt-16">
          <Sidebar 
            userRole="principal"
            isCollapsed={isSidebarCollapsed}
            onToggle={toggleSidebar}
          />
          
          <main className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          } p-6`}>
            
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Settings" size={20} className="text-primary" />
                </div>
                <h1 className="text-2xl font-heading font-heading-bold text-foreground">
                  Paramètres École
                </h1>
              </div>
              <p className="text-muted-foreground">
                Configurer les paramètres généraux de l'établissement
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Navigation des onglets */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-lg p-4 shadow-card">
                  <nav className="space-y-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Icon name={tab.icon} size={16} />
                        <span className="text-sm">{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Contenu des onglets */}
              <div className="lg:col-span-3">
                <div className="bg-card border border-border rounded-lg p-6 shadow-card">
                  
                  {/* Onglet Général */}
                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-heading font-heading-semibold text-card-foreground mb-4">
                          Informations Générales
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Nom de l'école
                            </label>
                            <input
                              type="text"
                              value={settings.schoolName}
                              onChange={(e) => handleSettingChange('schoolName', e.target.value)}
                              className="w-full p-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Adresse
                            </label>
                            <input
                              type="text"
                              value={settings.schoolAddress}
                              onChange={(e) => handleSettingChange('schoolAddress', e.target.value)}
                              className="w-full p-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Téléphone
                            </label>
                            <input
                              type="tel"
                              value={settings.schoolPhone}
                              onChange={(e) => handleSettingChange('schoolPhone', e.target.value)}
                              className="w-full p-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Email
                            </label>
                            <input
                              type="email"
                              value={settings.schoolEmail}
                              onChange={(e) => handleSettingChange('schoolEmail', e.target.value)}
                              className="w-full p-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Langue
                            </label>
                            <select
                              value={settings.language}
                              onChange={(e) => handleSettingChange('language', e.target.value)}
                              className="w-full p-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="fr">Français</option>
                              <option value="en">English</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Fuseau horaire
                            </label>
                            <select
                              value={settings.timezone}
                              onChange={(e) => handleSettingChange('timezone', e.target.value)}
                              className="w-full p-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="Africa/Douala">Afrique/Douala</option>
                              <option value="Africa/Yaounde">Afrique/Yaoundé</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Onglet Académique */}
                  {activeTab === 'academic' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-heading font-heading-semibold text-card-foreground mb-4">
                          Paramètres Académiques
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Année scolaire
                            </label>
                            <input
                              type="text"
                              value={settings.academicYear}
                              onChange={(e) => handleSettingChange('academicYear', e.target.value)}
                              className="w-full p-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Système de période
                            </label>
                            <select
                              value={settings.termSystem}
                              onChange={(e) => handleSettingChange('termSystem', e.target.value)}
                              className="w-full p-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="trimester">Trimestre</option>
                              <option value="semester">Semestre</option>
                              <option value="quarter">Quadrimestre</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Système de notation
                            </label>
                            <select
                              value={settings.gradingSystem}
                              onChange={(e) => handleSettingChange('gradingSystem', e.target.value)}
                              className="w-full p-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="20">Sur 20</option>
                              <option value="100">Sur 100</option>
                              <option value="letter">Lettres (A-F)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Note de passage
                            </label>
                            <input
                              type="number"
                              value={settings.passGrade}
                              onChange={(e) => handleSettingChange('passGrade', e.target.value)}
                              className="w-full p-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Onglet Sécurité */}
                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-heading font-heading-semibold text-card-foreground mb-4">
                          Paramètres de Sécurité
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Durée de session (minutes)
                            </label>
                            <input
                              type="number"
                              value={settings.sessionTimeout}
                              onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                              className="w-full p-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Taille max des fichiers (MB)
                            </label>
                            <input
                              type="number"
                              value={settings.maxFileSize}
                              onChange={(e) => handleSettingChange('maxFileSize', e.target.value)}
                              className="w-full p-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div>
                              <h4 className="font-medium text-foreground">Sauvegarde automatique</h4>
                              <p className="text-sm text-muted-foreground">Sauvegarder automatiquement les données</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.autoBackup}
                                onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Onglet Notifications */}
                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-heading font-heading-semibold text-card-foreground mb-4">
                          Paramètres de Notifications
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div>
                              <h4 className="font-medium text-foreground">Notifications Email</h4>
                              <p className="text-sm text-muted-foreground">Recevoir les notifications par email</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.emailNotifications}
                                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div>
                              <h4 className="font-medium text-foreground">Notifications SMS</h4>
                              <p className="text-sm text-muted-foreground">Recevoir les notifications par SMS</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.smsNotifications}
                                onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Onglet Système */}
                  {activeTab === 'system' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-heading font-heading-semibold text-card-foreground mb-4">
                          Informations Système
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border border-border rounded-lg">
                            <h4 className="font-medium text-foreground mb-2">Version</h4>
                            <p className="text-sm text-muted-foreground">EduTrack CM v2.1.0</p>
                          </div>
                          <div className="p-4 border border-border rounded-lg">
                            <h4 className="font-medium text-foreground mb-2">Base de données</h4>
                            <p className="text-sm text-muted-foreground">PostgreSQL 14.0</p>
                          </div>
                          <div className="p-4 border border-border rounded-lg">
                            <h4 className="font-medium text-foreground mb-2">Stockage utilisé</h4>
                            <p className="text-sm text-muted-foreground">2.4 GB / 10 GB</p>
                          </div>
                          <div className="p-4 border border-border rounded-lg">
                            <h4 className="font-medium text-foreground mb-2">Dernière sauvegarde</h4>
                            <p className="text-sm text-muted-foreground">Aujourd'hui à 03:00</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Boutons d'action */}
                  <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                    <Button variant="outline">
                      Annuler
                    </Button>
                    <Button onClick={saveSettings}>
                      <Icon name="Save" size={16} className="mr-2" />
                      Sauvegarder
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default SchoolSettings;