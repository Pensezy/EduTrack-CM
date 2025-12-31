import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import productionDataService from '../services/productionDataService';

/**
 * Hook unifié pour récupérer les données depuis Supabase uniquement
 */
export const useDashboardData = (schoolContext = null) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    metrics: [],
    classAverages: [],
    attendance: [],
    payments: [],
    personnel: [],
    students: [],
    schoolStats: {},
    schoolDetails: null,
    classes: []
  });
  const [dataLoading, setDataLoading] = useState({
    metrics: false,
    classAverages: false,
    attendance: false,
    payments: false,
    personnel: false,
    students: false,
    schoolStats: false,
    schoolDetails: false,
    classes: false
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
        setLoading(false);
      }
    };
    getUser();
  }, []);

  // Fonction générique pour charger des données
  const loadData = async (key, serviceMethod, ...args) => {
    if (loading) return; // Attendre que l'utilisateur soit chargé

    setDataLoading(prev => ({ ...prev, [key]: true }));
    setErrors(prev => ({ ...prev, [key]: null }));

    try {
      // Initialiser le contexte de sécurité
      if (productionDataService.setUserContext) {
        let userId, schoolId;

        // Priorité 1: Données de l'école depuis le contexte passé en paramètre
        if (schoolContext?.director_user_id && schoolContext?.id) {
          userId = schoolContext.director_user_id;
          schoolId = schoolContext.id;
        }
        // Priorité 2: Données de l'utilisateur
        else if (user?.id) {
          userId = user.id;
          // Récupérer school_id depuis la table users
          const { data: dbUser } = await supabase
            .from('users')
            .select('school_id')
            .eq('id', user.id)
            .single();
          schoolId = dbUser?.school_id;
        }

        if (userId && schoolId) {
          console.log(`🔐 Initialisation contexte sécurisé: User=${userId}, School=${schoolId}`);
          productionDataService.setUserContext(userId, schoolId);
        } else {
          console.warn('⚠️ Impossible d\'initialiser le contexte sécurisé');
          console.warn('  - userId:', userId);
          console.warn('  - schoolId:', schoolId);
        }
      }

      // Passer l'ID de l'école comme premier argument si disponible
      const schoolId = schoolContext?.id || null;
      const finalArgs = schoolId ? [schoolId, ...args] : args;

      const result = await productionDataService[serviceMethod](...finalArgs);

      if (result.error) {
        throw result.error;
      }

      setData(prev => ({ ...prev, [key]: result.data }));
    } catch (error) {
      console.error(`Erreur lors du chargement de ${key}:`, error);
      setErrors(prev => ({ ...prev, [key]: error }));
    } finally {
      setDataLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // Méthodes publiques pour charger différents types de données
  const loadMetrics = () => loadData('metrics', 'getDashboardMetrics');

  const loadClassAverages = (filters = {}) =>
    loadData('classAverages', 'getClassAverages', filters);

  const loadAttendance = (period = 'week') =>
    loadData('attendance', 'getAttendanceData', period);

  const loadPayments = () => loadData('payments', 'getPaymentData');

  const loadPersonnel = () => loadData('personnel', 'getPersonnel');

  const loadStudents = (filters = {}) =>
    loadData('students', 'getStudents', filters);

  const loadSchoolStats = () => loadData('schoolStats', 'getSchoolStats');

  const loadSchoolDetails = () => {
    const userId = user?.id;
    return loadData('schoolDetails', 'getSchoolDetails', null, userId);
  };

  const loadClasses = () => loadData('classes', 'getClasses');

  // Charger toutes les données de base
  const loadAllData = () => {
    loadMetrics();
    loadClassAverages();
    loadAttendance();
    loadPayments();
    loadPersonnel();
    loadSchoolStats();
    loadSchoolDetails();
    loadClasses();
  };

  // Charger les données au montage une fois l'utilisateur chargé
  useEffect(() => {
    if (!loading && user) {
      console.log(`🚀 Chargement des données depuis Supabase`);

      // Données critiques en priorité
      Promise.all([
        loadSchoolDetails(),
        loadMetrics()
      ]).then(() => {
        // Charger le reste en parallèle
        Promise.all([
          loadSchoolStats(),
          loadClasses(),
          loadPersonnel(),
          loadClassAverages(),
          loadAttendance(),
          loadPayments()
        ]);
      });
    }
  }, [loading, user]);

  return {
    // État des données
    data,
    loading: dataLoading,
    errors,

    // Utilisateur
    user,
    userLoading: loading,

    // Méthodes de chargement
    loadMetrics,
    loadClassAverages,
    loadAttendance,
    loadPayments,
    loadPersonnel,
    loadStudents,
    loadSchoolStats,
    loadSchoolDetails,
    loadClasses,
    loadAllData,

    // Fonction utilitaire pour rafraîchir toutes les données
    refresh: loadAllData,

    // Vérifier si des données sont en cours de chargement
    isAnyLoading: Object.values(dataLoading).some(Boolean),

    // Vérifier s'il y a des erreurs
    hasErrors: Object.values(errors).some(Boolean),

    // Obtenir toutes les erreurs
    allErrors: Object.entries(errors)
      .filter(([_, error]) => error)
      .map(([key, error]) => ({ key, error }))
  };
};

export default useDashboardData;
