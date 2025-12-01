import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import useDashboardData from '../../hooks/useDashboardData';
import { supabase } from '../../lib/supabase';
import { sendBulkNotification, isEmailConfigured } from '../../services/emailService';

const NotificationManagement = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    target: 'all',
    priority: 'normal',
    type: 'info'
  });

  // Hook pour récupérer les données selon le mode (démo/production)
  const { 
    data, 
    isDemo, 
    isProduction, 
    user 
  } = useDashboardData();

  // Charger les notifications depuis Supabase
  useEffect(() => {
    if (isProduction && user?.current_school_id) {
      loadNotifications();
    } else if (isDemo) {
      // En mode démo, ne pas afficher de notifications fictives
      setRecentNotifications([]);
    }
  }, [isProduction, user?.current_school_id, isDemo]);

  const loadNotifications = async () => {
    try {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('school_id', user.current_school_id)
        .order('sent_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setRecentNotifications(notifications || []);
    } catch (error) {
      console.error('❌ Erreur chargement notifications:', error);
    }
  };

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

  const handleSendNotification = async () => {
    if (!notificationData.title || !notificationData.message) {
      alert('Veuillez remplir le titre et le message');
      return;
    }

    setLoading(true);

    try {
      if (isDemo) {
        // Mode démo - simulation
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('✅ (Mode Démo) Notification simulée avec succès !');
        setNotificationData({
          title: '',
          message: '',
          target: 'all',
          priority: 'normal',
          type: 'info'
        });
        setLoading(false);
        return;
      }

      // Mode production - vraie sauvegarde
      console.log('📤 Envoi de la notification...');

      // 1. Récupérer les destinataires selon le target
      let recipients = [];
      const { current_school_id } = user;

      if (notificationData.target !== 'all') {
        const table = notificationData.target === 'parents' ? 'parents' :
                     notificationData.target === 'students' ? 'students' :
                     notificationData.target === 'teachers' ? 'teachers' :
                     notificationData.target === 'staff' ? 'users' : null;

        if (table) {
          const query = supabase
            .from(table)
            .select('email, full_name')
            .eq('school_id', current_school_id)
            .eq('is_active', true);

          const { data: users } = await query;
          
          recipients = (users || [])
            .filter(u => u.email)
            .map(u => ({
              email: u.email,
              name: u.full_name
            }));
        }
      }

      // 2. Sauvegarder dans Supabase
      const { data: savedNotification, error: saveError } = await supabase
        .from('notifications')
        .insert({
          school_id: current_school_id,
          sender_id: user.id,
          title: notificationData.title,
          message: notificationData.message,
          target: notificationData.target,
          priority: notificationData.priority,
          type: notificationData.type,
          status: 'sent',
          recipients_count: recipients.length
        })
        .select()
        .single();

      if (saveError) throw saveError;

      console.log('✅ Notification sauvegardée:', savedNotification);

      // 3. Envoyer les emails si EmailJS est configuré
      if (isEmailConfigured() && recipients.length > 0) {
        const emailResult = await sendBulkNotification({
          title: notificationData.title,
          message: notificationData.message,
          target: notificationData.target,
          priority: notificationData.priority,
          type: notificationData.type,
          schoolName: user.schoolData?.name || 'École',
          senderName: user.full_name || 'Directeur',
          recipients
        });

        console.log('📧 Résultat envoi emails:', emailResult);
        
        alert(`✅ Notification envoyée !\n\n${emailResult.message}\n\nNotification sauvegardée dans le système.`);
      } else {
        alert('✅ Notification enregistrée avec succès !\n\nNote : Service d\'email non configuré.');
      }

      // 4. Recharger les notifications et réinitialiser le formulaire
      await loadNotifications();
      setNotificationData({
        title: '',
        message: '',
        target: 'all',
        priority: 'normal',
        type: 'info'
      });

    } catch (error) {
      console.error('❌ Erreur:', error);
      alert('❌ Erreur lors de l\'envoi : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Gestion des Notifications - EduTrack CM</title>
        <meta name="description" content="Gérer et envoyer des notifications à l'école" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header 
          userRole="principal" 
          userName={
            user?.schoolData?.director_name || 
            user?.schoolData?.users?.full_name ||
            user?.full_name ||
            user?.email?.split('@')[0] || 
            'Directeur'
          }
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
            
            {/* Indicateur de mode */}
            {isDemo && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Icon name="AlertTriangle" size={20} className="text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-orange-800">Mode Démonstration</h3>
                    <p className="text-sm text-orange-700">
                      Les notifications affichées sont fictives. Connectez-vous avec un compte réel pour gérer vos vraies notifications.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="Bell" size={20} className="text-primary" />
                  </div>
                  <h1 className="text-2xl font-heading font-heading-bold text-foreground">
                    Gestion des Notifications
                  </h1>
                </div>
                {isProduction && (
                  <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700">Mode réel</span>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground">
                Envoyer des notifications et messages à {isProduction ? user?.schoolData?.name || 'votre école' : 'l\'école (mode démo)'}
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
                    disabled={!notificationData.title || !notificationData.message || loading}
                    loading={loading}
                  >
                    <Icon name="Send" size={16} className="mr-2" />
                    {loading ? 'Envoi en cours...' : 'Envoyer la Notification'}
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
                      className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                        notification.isDemo 
                          ? 'border-orange-200 bg-orange-50/30' 
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-foreground">
                            {notification.title}
                          </h3>
                          {notification.isDemo && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                              DÉMO
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.sent_at || notification.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notification.isDemo 
                            ? 'bg-orange-100 text-orange-700' 
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {notification.target}
                        </span>
                        <div className="flex items-center space-x-2">
                          {notification.recipients_count > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {notification.recipients_count} destinataire(s)
                            </span>
                          )}
                          <span className={`text-xs flex items-center ${
                            notification.isDemo ? 'text-orange-600' : 'text-success'
                          }`}>
                            <Icon name="CheckCircle" size={12} className="mr-1" />
                            {notification.isDemo ? 'Fictif' : notification.status === 'sent' ? 'Envoyé' : 'Échoué'}
                          </span>
                        </div>
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