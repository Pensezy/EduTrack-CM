import { useState, useEffect } from 'react';
import { useDataMode } from './useDataMode';
import parentDemoDataService from '../services/parentDemoDataService';
import parentProductionDataService from '../services/parentProductionDataService';

/**
 * Hook unifié pour récupérer les données parent selon le mode (démo/production)
 */
export const useParentDashboardData = () => {
  const { dataMode, isLoading: modeLoading, user } = useDataMode();
  
  const [parentProfile, setParentProfile] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [gradesData, setGradesData] = useState({});
  const [attendanceData, setAttendanceData] = useState({});
  const [paymentData, setPaymentData] = useState({});
  const [notificationsData, setNotificationsData] = useState({});
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [schools, setSchools] = useState([]);
  
  const [loading, setLoading] = useState({
    profile: false,
    children: false,
    grades: false,
    attendance: false,
    payments: false,
    notifications: false,
    events: false,
    schools: false
  });
  
  const [errors, setErrors] = useState({});

  // Choisir le bon service selon le mode
  const getService = () => {
    return dataMode === 'production' ? parentProductionDataService : parentDemoDataService;
  };

  // Fonction pour charger le profil parent
  const loadParentProfile = async () => {
    if (modeLoading) return;

    setLoading(prev => ({ ...prev, profile: true }));
    setErrors(prev => ({ ...prev, profile: null }));

    try {
      const service = getService();
      
      // En mode production, initialiser le contexte
      if (dataMode === 'production' && service.setUserContext) {
        const parentId = user?.id || user?.dbUser?.id;
        if (parentId) {
          service.setUserContext(parentId);
        }
      }

      const parentId = dataMode === 'production' ? user?.id : null;
      const result = await service.getParentProfile(parentId);

      if (result.error) {
        throw result.error;
      }

      setParentProfile(result.data);
    } catch (error) {
      console.error('Erreur chargement profil parent:', error);
      setErrors(prev => ({ ...prev, profile: error }));
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  // Fonction pour charger les enfants
  const loadChildren = async () => {
    console.log('🎯 loadChildren appelé - modeLoading:', modeLoading, 'dataMode:', dataMode, 'user:', user?.id);
    
    if (modeLoading) {
      console.log('⏸️ loadChildren bloqué - mode en cours de chargement');
      return;
    }

    setLoading(prev => ({ ...prev, children: true }));
    setErrors(prev => ({ ...prev, children: null }));

    try {
      const service = getService();
      console.log('🔧 Service sélectionné:', dataMode === 'production' ? 'PRODUCTION' : 'DEMO');
      
      // En mode production, initialiser le contexte
      if (dataMode === 'production' && service.setUserContext) {
        const parentId = user?.id || user?.dbUser?.id;
        console.log('🔑 Initialisation contexte avec parentId:', parentId);
        if (parentId) {
          service.setUserContext(parentId);
        } else {
          console.error('❌ Pas de parentId disponible !');
        }
      }

      const parentId = dataMode === 'production' ? user?.id : null;
      console.log('📞 Appel getChildren avec parentId:', parentId);
      const result = await service.getChildren(parentId);

      console.log('📦 Résultat getChildren:', result);

      if (result.error) {
        throw result.error;
      }

      const childrenList = result.data || [];
      console.log('👨‍👩‍👧‍👦 Children list à définir:', childrenList);
      setChildren(childrenList);

      // Sélectionner le premier enfant par défaut
      if (childrenList.length > 0 && !selectedChild) {
        setSelectedChild(childrenList[0]);
        setSelectedSchool(childrenList[0]?.school?.id || childrenList[0]?.schoolId);
      }
    } catch (error) {
      console.error('Erreur chargement enfants:', error);
      setErrors(prev => ({ ...prev, children: error }));
    } finally {
      setLoading(prev => ({ ...prev, children: false }));
    }
  };

  // Fonction pour charger les données d'un enfant spécifique
  const loadChildData = async (childId, forceReload = false) => {
    if (!childId || modeLoading) return;

    // ✨ Optimisation : vérifier si les données existent déjà en cache
    const hasCache = !forceReload && (
      gradesData[childId] && 
      attendanceData[childId] && 
      paymentData[childId] && 
      notificationsData[childId]
    );

    if (hasCache) {
      console.log('⚡ Données en cache pour enfant:', childId);
      return; // Pas besoin de recharger
    }

    console.log('🔄 Chargement données enfant:', childId);
    const service = getService();

    // ✨ Optimisation : charger TOUTES les données en PARALLÈLE
    setLoading(prev => ({ 
      ...prev, 
      grades: true, 
      attendance: true, 
      payments: true, 
      notifications: true 
    }));

    try {
      const [gradesResult, attendanceResult, paymentsResult, notificationsResult] = await Promise.all([
        service.getChildGrades(childId),
        service.getChildAttendance(childId),
        service.getChildPayments(childId),
        service.getChildNotifications(childId)
      ]);

      // Mettre à jour les données seulement si pas d'erreur
      if (!gradesResult.error) {
        setGradesData(prev => ({ ...prev, [childId]: gradesResult.data }));
      }
      if (!attendanceResult.error) {
        setAttendanceData(prev => ({ ...prev, [childId]: attendanceResult.data }));
      }
      if (!paymentsResult.error) {
        setPaymentData(prev => ({ ...prev, [childId]: paymentsResult.data }));
      }
      if (!notificationsResult.error) {
        setNotificationsData(prev => ({ ...prev, [childId]: notificationsResult.data }));
      }

      console.log('✅ Données enfant chargées avec succès');
    } catch (error) {
      console.error('❌ Erreur chargement données enfant:', error);
    } finally {
      setLoading(prev => ({ 
        ...prev, 
        grades: false, 
        attendance: false, 
        payments: false, 
        notifications: false 
      }));
    }
  };

  // Fonction pour charger les événements
  const loadEvents = async () => {
    if (modeLoading) return;

    setLoading(prev => ({ ...prev, events: true }));
    setErrors(prev => ({ ...prev, events: null }));

    try {
      const service = getService();
      
      // En mode production, initialiser le contexte
      if (dataMode === 'production' && service.setUserContext) {
        const parentId = user?.id || user?.dbUser?.id;
        if (parentId) {
          service.setUserContext(parentId);
        }
      }

      const parentId = dataMode === 'production' ? user?.id : null;
      const result = await service.getUpcomingEvents(parentId);

      if (result.error) {
        throw result.error;
      }

      setUpcomingEvents(result.data || []);
    } catch (error) {
      console.error('Erreur chargement événements:', error);
      setErrors(prev => ({ ...prev, events: error }));
    } finally {
      setLoading(prev => ({ ...prev, events: false }));
    }
  };

  // Fonction pour charger les écoles
  const loadSchools = async () => {
    if (modeLoading) return;

    setLoading(prev => ({ ...prev, schools: true }));
    setErrors(prev => ({ ...prev, schools: null }));

    try {
      const service = getService();
      
      // En mode production, initialiser le contexte
      if (dataMode === 'production' && service.setUserContext) {
        const parentId = user?.id || user?.dbUser?.id;
        if (parentId) {
          service.setUserContext(parentId);
        }
      }

      const parentId = dataMode === 'production' ? user?.id : null;
      const result = await service.getSchools(parentId);

      if (result.error) {
        throw result.error;
      }

      setSchools(result.data || []);
    } catch (error) {
      console.error('Erreur chargement écoles:', error);
      setErrors(prev => ({ ...prev, schools: error }));
    } finally {
      setLoading(prev => ({ ...prev, schools: false }));
    }
  };

  // Charger les données initiales
  useEffect(() => {
    if (!modeLoading) {
      console.log('🔄 Chargement données parent en mode:', dataMode);
      loadParentProfile();
      loadChildren();
      loadEvents();
      loadSchools();
    }
  }, [dataMode, modeLoading]);

  // ✨ OPTIMISATION : Précharger les données de tous les enfants au démarrage
  useEffect(() => {
    if (children.length > 0 && !modeLoading) {
      console.log('🚀 Préchargement des données de tous les enfants...');
      children.forEach(child => {
        // Charger en parallèle pour tous les enfants (sans attendre)
        loadChildData(child.id);
      });
    }
  }, [children.length, dataMode]);

  // Charger les données de l'enfant sélectionné (si pas déjà en cache)
  useEffect(() => {
    if (selectedChild?.id) {
      console.log('👶 Vérification données pour enfant:', selectedChild.full_name || selectedChild.name);
      loadChildData(selectedChild.id); // Le cache évitera le rechargement
    }
  }, [selectedChild?.id]);

  // Fonction pour changer d'enfant - ✨ OPTIMISÉE
  const handleChildSelect = (child) => {
    console.log('⚡ Changement enfant rapide:', child?.full_name || child?.name);
    
    // Changement IMMÉDIAT de l'enfant sélectionné (pas d'attente)
    setSelectedChild(child);
    setSelectedSchool(child?.school?.id || child?.schoolId);
    
    // Les données seront chargées par useEffect de manière optimisée (cache)
  };

  // Fonction pour changer d'école
  const handleSchoolChange = (schoolId) => {
    setSelectedSchool(schoolId);
    // Sélectionner le premier enfant de cette école
    const childrenFromSchool = children.filter(
      child => (child?.school?.id || child?.schoolId) === schoolId
    );
    if (childrenFromSchool.length > 0 && selectedChild?.school?.id !== schoolId && selectedChild?.schoolId !== schoolId) {
      setSelectedChild(childrenFromSchool[0]);
    }
  };

  // Fonction pour marquer une notification comme lue
  const markNotificationAsRead = async (notificationId) => {
    try {
      const service = getService();
      await service.markNotificationAsRead(notificationId);
      
      // Mettre à jour localement
      setNotificationsData(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(childId => {
          updated[childId] = updated[childId].map(notif => 
            notif.id === notificationId ? { ...notif, read: true } : notif
          );
        });
        return updated;
      });
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  // Fonctions utilitaires
  const getAllNotifications = () => {
    return Object.values(notificationsData)
      .flat()
      .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
  };

  const getUnreadCount = () => {
    return getAllNotifications().filter(n => !n.read).length;
  };

  const getChildrenBySchool = (schoolId) => {
    return children.filter(
      child => (child?.school?.id || child?.schoolId) === schoolId
    );
  };

  return {
    // État
    dataMode,
    isDemo: dataMode === 'demo',
    isProduction: dataMode === 'production',
    user,
    
    // Données
    parentProfile,
    children,
    selectedChild,
    selectedSchool,
    gradesData,
    attendanceData,
    paymentData,
    notificationsData,
    upcomingEvents,
    schools,
    
    // Chargement et erreurs
    loading,
    errors,
    isLoading: Object.values(loading).some(l => l) || modeLoading,
    
    // Actions
    handleChildSelect,
    handleSchoolChange,
    markNotificationAsRead,
    refreshData: (forceReload = false) => {
      loadParentProfile();
      loadChildren();
      loadEvents();
      loadSchools();
      if (selectedChild?.id) {
        loadChildData(selectedChild.id, forceReload);
      }
    },
    
    // Utilitaires
    getAllNotifications,
    getUnreadCount,
    getChildrenBySchool
  };
};

export default useParentDashboardData;
