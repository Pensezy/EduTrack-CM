import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  studentService,
  gradeService,
  absenceService,
  paymentService,
  notificationService,
  analyticsService
} from '../services/edutrackService';

// Hook for data mode detection (demo vs production)
export const useDataMode = () => {
  const [isDemo, setIsDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState(null);

  useEffect(() => {
    const checkDataMode = async () => {
      // Cache de 1 minute pour éviter les vérifications répétées
      const now = Date.now();
      if (lastCheck && (now - lastCheck) < 60000) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // Vérifier la présence de données de production via un appel à l'API
        // En mode démo, on utilise des données statiques
        const isDemoMode = 
          window.location.pathname.includes('/demo') ||
          window.location.search.includes('demo=true') ||
          localStorage.getItem('edutrack-mode') === 'demo';

        setIsDemo(isDemoMode);
        setLastCheck(now);
      } catch (error) {
        console.warn('Erreur détection mode:', error);
        // En cas d'erreur, on considère qu'on est en mode démo par sécurité
        setIsDemo(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkDataMode();
  }, [lastCheck]);

  const switchToDemo = () => {
    localStorage.setItem('edutrack-mode', 'demo');
    setIsDemo(true);
    setLastCheck(null);
  };

  const switchToProduction = () => {
    localStorage.removeItem('edutrack-mode');
    setIsDemo(false);
    setLastCheck(null);
  };

  return { 
    isDemo, 
    isProduction: !isDemo, 
    isLoading, 
    switchToDemo, 
    switchToProduction 
  };
};

// Hook for student data
export const useStudentData = (studentId) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      if (!studentId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await studentService?.getStudentById(studentId);
        if (result?.error) {
          setError(result?.error?.message || 'Erreur lors du chargement des données étudiant');
        } else {
          setStudent(result?.data);
        }
      } catch (err) {
        setError('Erreur de connexion');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  return { student, loading, error, refetch: () => fetchStudent() };
};

// Hook for parent's children data
export const useParentChildren = () => {
  const { userProfile } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChildren = async () => {
      if (!userProfile?.id || userProfile?.role !== 'parent') {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await studentService?.getStudentsByParent(userProfile?.id);
        if (result?.error) {
          setError(result?.error?.message || 'Erreur lors du chargement des enfants');
        } else {
          setChildren(result?.data || []);
        }
      } catch (err) {
        setError('Erreur de connexion');
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [userProfile?.id, userProfile?.role]);

  return { children, loading, error };
};

// Hook for grades
export const useGrades = (studentId) => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await gradeService?.getGradesByStudent(studentId);
        if (result?.error) {
          setError(result?.error?.message || 'Erreur lors du chargement des notes');
        } else {
          setGrades(result?.data || []);
        }
      } catch (err) {
        setError('Erreur de connexion');
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [studentId]);

  const addGrade = async (gradeData) => {
    try {
      const result = await gradeService?.createGrade(gradeData);
      if (!result?.error) {
        setGrades(prev => [result?.data, ...prev]);
      }
      return result;
    } catch (err) {
      return { error: { message: 'Erreur lors de l\'ajout de la note' } };
    }
  };

  return { grades, loading, error, addGrade };
};

// Hook for absences
export const useAbsences = (studentId) => {
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAbsences = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await absenceService?.getAbsencesByStudent(studentId);
        if (result?.error) {
          setError(result?.error?.message || 'Erreur lors du chargement des absences');
        } else {
          setAbsences(result?.data || []);
        }
      } catch (err) {
        setError('Erreur de connexion');
      } finally {
        setLoading(false);
      }
    };

    fetchAbsences();
  }, [studentId]);

  const addAbsence = async (absenceData) => {
    try {
      const result = await absenceService?.createAbsence(absenceData);
      if (!result?.error) {
        setAbsences(prev => [result?.data, ...prev]);
      }
      return result;
    } catch (err) {
      return { error: { message: 'Erreur lors de l\'ajout de l\'absence' } };
    }
  };

  const justifyAbsence = async (absenceId, justifiedBy, reason) => {
    try {
      const result = await absenceService?.justifyAbsence(absenceId, justifiedBy, reason);
      if (!result?.error) {
        setAbsences(prev => 
          prev?.map(absence => 
            absence?.id === absenceId ? result?.data : absence
          )
        );
      }
      return result;
    } catch (err) {
      return { error: { message: 'Erreur lors de la justification' } };
    }
  };

  return { absences, loading, error, addAbsence, justifyAbsence };
};

// Hook for payments
export const usePayments = (studentId) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await paymentService?.getPaymentsByStudent(studentId);
        if (result?.error) {
          setError(result?.error?.message || 'Erreur lors du chargement des paiements');
        } else {
          setPayments(result?.data || []);
        }
      } catch (err) {
        setError('Erreur de connexion');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [studentId]);

  return { payments, loading, error };
};

// Hook for notifications
export const useNotifications = () => {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userProfile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const [notificationsResult, countResult] = await Promise.all([
          notificationService?.getNotificationsByUser(userProfile?.id),
          notificationService?.getUnreadCount(userProfile?.id)
        ]);

        if (notificationsResult?.error) {
          setError(notificationsResult?.error?.message);
        } else {
          setNotifications(notificationsResult?.data || []);
        }

        if (!countResult?.error) {
          setUnreadCount(countResult?.count || 0);
        }
      } catch (err) {
        setError('Erreur de connexion');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userProfile?.id]);

  const markAsRead = async (notificationId) => {
    try {
      const result = await notificationService?.markAsRead(notificationId);
      if (!result?.error) {
        setNotifications(prev =>
          prev?.map(notif => 
            notif?.id === notificationId ? { ...notif, status: 'read' } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return result;
    } catch (err) {
      return { error: { message: 'Erreur lors du marquage' } };
    }
  };

  return { notifications, unreadCount, loading, error, markAsRead };
};

// Hook for dashboard analytics
export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRevenue: 0,
    pendingTransfers: 0,
    weeklyAbsences: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await analyticsService?.getDashboardStats();
        if (result?.error) {
          setError(result?.error?.message || 'Erreur lors du chargement des statistiques');
        } else {
          setStats(result?.data);
        }
      } catch (err) {
        setError('Erreur de connexion');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};