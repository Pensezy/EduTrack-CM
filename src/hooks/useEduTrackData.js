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

// Hook principal pour récupérer les données EduTrack depuis Supabase
export const useEduTrackData = (dataType, options = {}) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let result;

        switch (dataType) {
          case 'students':
            result = await studentService.getAll(options);
            break;
          case 'grades':
            result = await gradeService.getAll(options);
            break;
          case 'absences':
            result = await absenceService.getAll(options);
            break;
          case 'payments':
            result = await paymentService.getAll(options);
            break;
          case 'notifications':
            result = await notificationService.getAll(options);
            break;
          case 'analytics':
            result = await analyticsService.getAll(options);
            break;
          default:
            throw new Error(`Type de données non supporté: ${dataType}`);
        }

        if (result.error) {
          throw result.error;
        }

        setData(result.data);
      } catch (err) {
        console.error(`Erreur chargement ${dataType}:`, err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataType, user, JSON.stringify(options)]);

  return { data, loading, error, refetch: () => fetchData() };
};

export default useEduTrackData;
