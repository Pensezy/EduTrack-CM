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
    if (modeLoading) return;

    setLoading(prev => ({ ...prev, children: true }));
    setErrors(prev => ({ ...prev, children: null }));

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
      const result = await service.getChildren(parentId);

      if (result.error) {
        throw result.error;
      }

      const childrenList = result.data || [];
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
  const loadChildData = async (childId) => {
    if (!childId || modeLoading) return;

    const service = getService();

    // Charger notes
    setLoading(prev => ({ ...prev, grades: true }));
    try {
      const result = await service.getChildGrades(childId);
      if (!result.error) {
        setGradesData(prev => ({ ...prev, [childId]: result.data }));
      }
    } catch (error) {
      console.error('Erreur chargement notes:', error);
    } finally {
      setLoading(prev => ({ ...prev, grades: false }));
    }

    // Charger présences
    setLoading(prev => ({ ...prev, attendance: true }));
    try {
      const result = await service.getChildAttendance(childId);
      if (!result.error) {
        setAttendanceData(prev => ({ ...prev, [childId]: result.data }));
      }
    } catch (error) {
      console.error('Erreur chargement présences:', error);
    } finally {
      setLoading(prev => ({ ...prev, attendance: false }));
    }

    // Charger paiements
    setLoading(prev => ({ ...prev, payments: true }));
    try {
      const result = await service.getChildPayments(childId);
      if (!result.error) {
        setPaymentData(prev => ({ ...prev, [childId]: result.data }));
      }
    } catch (error) {
      console.error('Erreur chargement paiements:', error);
    } finally {
      setLoading(prev => ({ ...prev, payments: false }));
    }

    // Charger notifications
    setLoading(prev => ({ ...prev, notifications: true }));
    try {
      const result = await service.getChildNotifications(childId);
      if (!result.error) {
        setNotificationsData(prev => ({ ...prev, [childId]: result.data }));
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
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

  // Charger les données de l'enfant sélectionné
  useEffect(() => {
    if (selectedChild?.id) {
      console.log('👶 Chargement données pour enfant:', selectedChild.full_name || selectedChild.name);
      loadChildData(selectedChild.id);
    }
  }, [selectedChild?.id, dataMode]);

  // Fonction pour changer d'enfant
  const handleChildSelect = (child) => {
    setSelectedChild(child);
    setSelectedSchool(child?.school?.id || child?.schoolId);
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
    refreshData: () => {
      loadParentProfile();
      loadChildren();
      loadEvents();
      loadSchools();
      if (selectedChild?.id) {
        loadChildData(selectedChild.id);
      }
    },
    
    // Utilitaires
    getAllNotifications,
    getUnreadCount,
    getChildrenBySchool
  };
};

export default useParentDashboardData;
