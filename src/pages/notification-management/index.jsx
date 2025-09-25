import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const NotificationManagement = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    target: 'all',
    priority: 'normal',
    type: 'info'
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNotificationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendNotification = () => {
    console.log('Sending notification:', notificationData);
    // Ici vous pourriez ajouter la logique d'envoi
    alert('Notification envoyée avec succès !');
    setNotificationData({
      title: '',
      message: '',
      target: 'all',
      priority: 'normal',
      type: 'info'
    });
  };

  const recentNotifications = [
    {
      id: 1,
      title: 'Réunion parents d\'élèves',
      message: 'Rappel de la réunion prévue vendredi à 18h',
      target: 'parents',
      date: '2024-09-20',
      status: 'sent'
    },
    {
      id: 2,
      title: 'Fermeture école',
      message: 'L\'école sera fermée lundi pour travaux',
      target: 'all',
      date: '2024-09-18',
      status: 'sent'
    },
    {
      id: 3,
      title: 'Nouvelle activité',
      message: 'Club de robotique - inscriptions ouvertes',
      target: 'students',
      date: '2024-09-15',
      status: 'sent'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Gestion des Notifications - EduTrack CM</title>
        <meta name="description" content="Gérer et envoyer des notifications à l'école" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header 
          userRole="principal" 
          userName="Principal Admin"
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
                  <Icon name="Bell" size={20} className="text-primary" />
                </div>
                <h1 className="text-2xl font-heading font-heading-bold text-foreground">
                  Gestion des Notifications
                </h1>
              </div>
              <p className="text-muted-foreground">
                Envoyer des notifications et messages à l'école
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Nouvelle notification */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-card">
                <div className="flex items-center space-x-2 mb-6">
                  <Icon name="Plus" size={20} className="text-primary" />
                  <h2 className="text-lg font-heading font-heading-semibold text-card-foreground">
                    Nouvelle Notification
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Titre
                    </label>
                    <Input
                      name="title"
                      value={notificationData.title}
                      onChange={handleInputChange}
                      placeholder="Titre de la notification"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={notificationData.message}
                      onChange={handleInputChange}
                      placeholder="Contenu du message..."
                      rows={4}
                      className="w-full p-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Destinataires
                      </label>
                      <select
                        name="target"
                        value={notificationData.target}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="all">Tout le monde</option>
                        <option value="students">Élèves</option>
                        <option value="teachers">Enseignants</option>
                        <option value="parents">Parents</option>
                        <option value="staff">Personnel</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Priorité
                      </label>
                      <select
                        name="priority"
                        value={notificationData.priority}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="low">Faible</option>
                        <option value="normal">Normale</option>
                        <option value="high">Élevée</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSendNotification}
                    className="w-full"
                    disabled={!notificationData.title || !notificationData.message}
                  >
                    <Icon name="Send" size={16} className="mr-2" />
                    Envoyer la Notification
                  </Button>
                </div>
              </div>

              {/* Notifications récentes */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Icon name="History" size={20} className="text-primary" />
                    <h2 className="text-lg font-heading font-heading-semibold text-card-foreground">
                      Notifications Récentes
                    </h2>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Icon name="RefreshCw" size={14} />
                  </Button>
                </div>

                <div className="space-y-4">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-foreground">
                          {notification.title}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {notification.date}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                          {notification.target}
                        </span>
                        <span className="text-xs text-success flex items-center">
                          <Icon name="CheckCircle" size={12} className="mr-1" />
                          Envoyé
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default NotificationManagement;