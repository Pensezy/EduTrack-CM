import { useState, useEffect } from 'react';
import useDataMode from './useDataMode';
import demoDataService from '../services/demoDataService';
import productionDataService from '../services/productionDataService';

/**
 * Hook unifié pour récupérer les données selon le mode (démo/production)
 */
export const useDashboardData = (schoolContext = null) => {
  const { dataMode, isLoading: modeLoading, user } = useDataMode();
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
  const [loading, setLoading] = useState({
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

  // Choisir le bon service selon le mode
  const getService = () => {
    return dataMode === 'production' ? productionDataService : demoDataService;
  };

  // Fonction générique pour charger des données
  const loadData = async (key, serviceMethod, ...args) => {
    if (modeLoading) return; // Attendre que le mode soit déterminé

    setLoading(prev => ({ ...prev, [key]: true }));
    setErrors(prev => ({ ...prev, [key]: null }));

    try {
      const service = getService();
      
      // Si on est en mode production, initialiser le contexte de sécurité
      if (dataMode === 'production' && service.setUserContext) {
        let userId, schoolId;
        
        // Priorité 1: Données de l'école depuis le contexte passé en paramètre
        if (schoolContext?.director_id && schoolContext?.id) {
          userId = schoolContext.director_id;
          schoolId = schoolContext.id;
        }
        // Priorité 2: Données de l'utilisateur depuis useDataMode
        else if (user?.schoolData?.director_id && user?.schoolData?.id) {
          userId = user.schoolData.director_id;
          schoolId = user.schoolData.id;
        }
        // Priorité 3: Données utilisateur de base
        else if (user?.dbUser?.id && user?.dbUser?.school_id) {
          userId = user.dbUser.id;
          schoolId = user.dbUser.school_id;
        }
        // Priorité 4: Utiliser directement l'ID de l'utilisateur Supabase et l'école
        else if (user?.id && user?.schoolData?.id) {
          userId = user.id;
          schoolId = user.schoolData.id;
        }
        
        if (userId && schoolId) {
          console.log(`🔐 Initialisation contexte sécurisé: User=${userId}, School=${schoolId}`);
          service.setUserContext(userId, schoolId);
        } else {
          console.warn('⚠️ Impossible d\'initialiser le contexte sécurisé');
          console.warn('  - userId:', userId);
          console.warn('  - schoolId:', schoolId);
          console.warn('  - user:', user);
          console.warn('  - schoolContext:', schoolContext);
        }
      }
      
      // Passer l'ID de l'école comme premier argument si disponible
      const schoolId = (dataMode === 'production' && schoolContext?.id) ? schoolContext.id : null;
      const finalArgs = schoolId ? [schoolId, ...args] : args;
      
      const result = await service[serviceMethod](...finalArgs);
      
      if (result.error) {
        throw result.error;
      }

      setData(prev => ({ ...prev, [key]: result.data }));
    } catch (error) {
      console.error(`Erreur lors du chargement de ${key}:`, error);
      setErrors(prev => ({ ...prev, [key]: error }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
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
    // Passer l'ID utilisateur pour pouvoir chercher l'école même sans contexte défini
    const userId = user?.id;
    return loadData('schoolDetails', 'getSchoolDetails', null, userId);
  };
  
  const loadClasses = () => loadData('classes', 'getClasses');

  // Charger toutes les données de base au montage du composant
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

  // Recharger les données quand le mode change (optimisé)
  useEffect(() => {
    if (!modeLoading && dataMode) {
      console.log(`� Chargement rapide des données en mode: ${dataMode}`);
      
      // Charger uniquement les données essentielles en premier
      loadMetrics();
      loadSchoolDetails();
      
      // Charger les autres données après un petit délai pour améliorer la responsivité
      setTimeout(() => {
        loadSchoolStats();
        loadClasses();
      }, 100);
      
      setTimeout(() => {
        loadPersonnel();
        loadClassAverages();
        loadAttendance();
        loadPayments();
      }, 200);
    }
  }, [dataMode, modeLoading]);

  return {
    // État des données
    data,
    loading,
    errors,
    
    // Informations sur le mode
    dataMode,
    isDemo: dataMode === 'demo',
    isProduction: dataMode === 'production',
    modeLoading,
    user, // Exposer l'utilisateur
    
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
    isAnyLoading: Object.values(loading).some(Boolean),
    
    // Vérifier s'il y a des erreurs
    hasErrors: Object.values(errors).some(Boolean),
    
    // Obtenir toutes les erreurs
    allErrors: Object.entries(errors)
      .filter(([_, error]) => error)
      .map(([key, error]) => ({ key, error }))
  };
};

export default useDashboardData;