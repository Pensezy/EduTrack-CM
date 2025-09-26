import { useState, useEffect } from 'react';
import useDataMode from './useDataMode';
import demoDataService from '../services/demoDataService';
import productionDataService from '../services/productionDataService';

/**
 * Hook unifié pour récupérer les données selon le mode (démo/production)
 */
export const useDashboardData = () => {
  const { dataMode, isLoading: modeLoading } = useDataMode();
  const [data, setData] = useState({
    metrics: [],
    classAverages: [],
    attendance: [],
    payments: [],
    personnel: [],
    students: [],
    schoolStats: {}
  });
  const [loading, setLoading] = useState({
    metrics: false,
    classAverages: false,
    attendance: false,
    payments: false,
    personnel: false,
    students: false,
    schoolStats: false
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
      const result = await service[serviceMethod](...args);
      
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

  // Charger toutes les données de base au montage du composant
  const loadAllData = () => {
    loadMetrics();
    loadClassAverages();
    loadAttendance();
    loadPayments();
    loadPersonnel();
    loadSchoolStats();
  };

  // Recharger les données quand le mode change
  useEffect(() => {
    if (!modeLoading && dataMode) {
      loadAllData();
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
    
    // Méthodes de chargement
    loadMetrics,
    loadClassAverages,
    loadAttendance,
    loadPayments,
    loadPersonnel,
    loadStudents,
    loadSchoolStats,
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