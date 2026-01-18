import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import parentProductionDataService from '../services/parentProductionDataService';

/**
 * Hook unifié pour récupérer les données parent depuis Supabase uniquement
 */
export const useParentDashboardData = () => {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

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

  // Récupérer l'utilisateur connecté au montage
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(authUser);
      } catch (error) {
        console.error('Erreur récupération utilisateur:', error);
      } finally {
        setUserLoading(false);
      }
    };
    getUser();
  }, []);

  // Fonction pour charger le profil parent
  const loadParentProfile = async () => {
    if (userLoading) return;

    setLoading(prev => ({ ...prev, profile: true }));
    setErrors(prev => ({ ...prev, profile: null }));

    try {
      // Initialiser le contexte
      if (parentProductionDataService.setUserContext && user?.id) {
        parentProductionDataService.setUserContext(user.id);
      }

      const result = await parentProductionDataService.getParentProfile(user?.id);

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
    console.log('🎯 loadChildren appelé - user:', user?.id);

    if (userLoading) {
      console.log('⏸️ loadChildren bloqué - utilisateur en cours de chargement');
      return;
    }

    setLoading(prev => ({ ...prev, children: true }));
    setErrors(prev => ({ ...prev, children: null }));

    try {
      console.log('🔧 Service: PRODUCTION (Supabase)');

      // Initialiser le contexte
      if (parentProductionDataService.setUserContext && user?.id) {
        console.log('🔑 Initialisation contexte avec parentId:', user.id);
        parentProductionDataService.setUserContext(user.id);
      } else {
        console.error('❌ Pas de parentId disponible !');
      }

      const parentId = user?.id;
      console.log('📞 Appel getChildren avec parentId:', parentId);
      const result = await parentProductionDataService.getChildren(parentId);
      console.log('📦 Résultat getChildren:', result);

      if (result.error) {
        throw result.error;
      }

      const childrenData = result.data || [];
      console.log('👶 Enfants chargés:', childrenData.length);
      setChildren(childrenData);

      // Sélectionner automatiquement le premier enfant si disponible
      if (childrenData.length > 0 && !selectedChild) {
        console.log('✅ Sélection automatique du premier enfant');
        setSelectedChild(childrenData[0]);

        // Charger aussi l'école associée
        if (childrenData[0].school_id) {
          setSelectedSchool({ id: childrenData[0].school_id });
        }
      }
    } catch (error) {
      console.error('❌ Erreur chargement enfants:', error);
      setErrors(prev => ({ ...prev, children: error }));
    } finally {
      setLoading(prev => ({ ...prev, children: false }));
    }
  };

  // Fonction pour charger les notes d'un enfant
  const loadChildGrades = async (childId, schoolId = null) => {
    if (userLoading || !childId) return;

    const key = `${childId}_${schoolId || 'all'}`;
    setLoading(prev => ({ ...prev, grades: true }));
    setErrors(prev => ({ ...prev, grades: null }));

    try {
      const result = await parentProductionDataService.getChildGrades(childId, schoolId);

      if (result.error) {
        throw result.error;
      }

      setGradesData(prev => ({ ...prev, [key]: result.data }));
    } catch (error) {
      console.error('Erreur chargement notes:', error);
      setErrors(prev => ({ ...prev, grades: error }));
    } finally {
      setLoading(prev => ({ ...prev, grades: false }));
    }
  };

  // Fonction pour charger l'assiduité d'un enfant
  const loadChildAttendance = async (childId, schoolId = null) => {
    if (userLoading || !childId) return;

    const key = `${childId}_${schoolId || 'all'}`;
    setLoading(prev => ({ ...prev, attendance: true }));
    setErrors(prev => ({ ...prev, attendance: null }));

    try {
      const result = await parentProductionDataService.getChildAttendance(childId, schoolId);

      if (result.error) {
        throw result.error;
      }

      setAttendanceData(prev => ({ ...prev, [key]: result.data }));
    } catch (error) {
      console.error('Erreur chargement assiduité:', error);
      setErrors(prev => ({ ...prev, attendance: error }));
    } finally {
      setLoading(prev => ({ ...prev, attendance: false }));
    }
  };

  // Fonction pour charger les paiements
  const loadChildPayments = async (childId, schoolId = null) => {
    if (userLoading || !childId) return;

    const key = `${childId}_${schoolId || 'all'}`;
    setLoading(prev => ({ ...prev, payments: true }));
    setErrors(prev => ({ ...prev, payments: null }));

    try {
      const result = await parentProductionDataService.getChildPayments(childId, schoolId);

      if (result.error) {
        throw result.error;
      }

      setPaymentData(prev => ({ ...prev, [key]: result.data }));
    } catch (error) {
      console.error('Erreur chargement paiements:', error);
      setErrors(prev => ({ ...prev, payments: error }));
    } finally {
      setLoading(prev => ({ ...prev, payments: false }));
    }
  };

  // Fonction pour charger les notifications
  const loadChildNotifications = async (childId, schoolId = null) => {
    if (userLoading || !childId) return;

    const key = `${childId}_${schoolId || 'all'}`;
    setLoading(prev => ({ ...prev, notifications: true }));
    setErrors(prev => ({ ...prev, notifications: null }));

    try {
      const result = await parentProductionDataService.getChildNotifications(childId, schoolId);

      if (result.error) {
        throw result.error;
      }

      setNotificationsData(prev => ({ ...prev, [key]: result.data }));
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      setErrors(prev => ({ ...prev, notifications: error }));
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  };

  // Fonction pour charger les événements à venir
  const loadUpcomingEvents = async () => {
    if (userLoading) return;

    setLoading(prev => ({ ...prev, events: true }));
    setErrors(prev => ({ ...prev, events: null }));

    try {
      const result = await parentProductionDataService.getUpcomingEvents();

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
    if (userLoading) return;

    setLoading(prev => ({ ...prev, schools: true }));
    setErrors(prev => ({ ...prev, schools: null }));

    try {
      const parentId = user?.id;
      const result = await parentProductionDataService.getSchools(parentId);

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

  // Fonction pour marquer une notification comme lue
  const markNotificationAsRead = async (notificationId) => {
    try {
      await parentProductionDataService.markNotificationAsRead(notificationId);

      // Mettre à jour l'état local
      setNotificationsData(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (Array.isArray(updated[key])) {
            updated[key] = updated[key].map(notif =>
              notif.id === notificationId ? { ...notif, read: true } : notif
            );
          }
        });
        return updated;
      });
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  // Charger les données initiales
  useEffect(() => {
    if (!userLoading && user) {
      console.log('🚀 Chargement données parent depuis Supabase');
      loadParentProfile();
      loadChildren();
      loadSchools();
      loadUpcomingEvents();
    }
  }, [userLoading, user]);

  // Charger les données de l'enfant sélectionné
  useEffect(() => {
    if (selectedChild && !userLoading) {
      console.log('👶 Chargement données enfant sélectionné:', selectedChild.id);
      loadChildGrades(selectedChild.id, selectedSchool?.id);
      loadChildAttendance(selectedChild.id, selectedSchool?.id);
      loadChildPayments(selectedChild.id, selectedSchool?.id);
      loadChildNotifications(selectedChild.id, selectedSchool?.id);
    }
  }, [selectedChild, selectedSchool, userLoading]);

  return {
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
    user,

    // États de chargement
    loading,
    userLoading,
    errors,

    // Actions
    setSelectedChild,
    setSelectedSchool,
    loadParentProfile,
    loadChildren,
    loadChildGrades,
    loadChildAttendance,
    loadChildPayments,
    loadChildNotifications,
    loadUpcomingEvents,
    loadSchools,
    markNotificationAsRead,

    // Utilitaires
    isAnyLoading: Object.values(loading).some(Boolean) || userLoading,
    hasErrors: Object.values(errors).some(Boolean)
  };
};

export default useParentDashboardData;
