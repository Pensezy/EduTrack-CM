/**
 * Page Emploi du temps - Élève
 *
 * Affiche l'emploi du temps de l'élève
 */

import { useState, useEffect } from 'react';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import {
  Calendar,
  Clock,
  AlertCircle,
  BookOpen
} from 'lucide-react';

// Jours de la semaine
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// Heures de cours (exemple)
const HOURS = [
  '07:30 - 08:30',
  '08:30 - 09:30',
  '09:30 - 10:30',
  '10:45 - 11:45',
  '11:45 - 12:45',
  '14:30 - 15:30',
  '15:30 - 16:30',
  '16:30 - 17:30',
];

export default function StudentSchedulePage() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(
    new Date().getDay() === 0 ? 0 : new Date().getDay() - 1 // Lundi = 0, ...
  );

  useEffect(() => {
    if (user?.id) {
      fetchSchedule();
    }
  }, [user?.id]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = getSupabaseClient();

      // Récupérer les infos de l'élève
      const { data: studentData } = await supabase
        .from('students')
        .select(`
          id,
          full_name,
          class_id,
          classes:class_id (name, level)
        `)
        .eq('user_id', user.id)
        .single();

      if (studentData) {
        setStudentInfo(studentData);
      }

      // Récupérer l'emploi du temps (si la table existe)
      try {
        const { data: scheduleData } = await supabase
          .from('schedules')
          .select('*')
          .eq('class_id', studentData?.class_id)
          .order('day_of_week')
          .order('start_time');

        setSchedule(scheduleData || []);
      } catch (e) {
        // Table schedules n'existe peut-être pas, générer un emploi du temps exemple
        setSchedule([]);
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError('Erreur lors du chargement de l\'emploi du temps');
    } finally {
      setLoading(false);
    }
  };

  // Générer un emploi du temps d'exemple si pas de données
  const getExampleSchedule = () => {
    const subjects = [
      { name: 'Mathématiques', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      { name: 'Français', color: 'bg-green-100 text-green-800 border-green-200' },
      { name: 'Anglais', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      { name: 'Histoire-Géo', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      { name: 'Sciences', color: 'bg-pink-100 text-pink-800 border-pink-200' },
      { name: 'EPS', color: 'bg-orange-100 text-orange-800 border-orange-200' },
      { name: 'Arts', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      { name: 'Récréation', color: 'bg-gray-100 text-gray-600 border-gray-200' },
    ];

    // Exemple simple d'emploi du temps
    return DAYS.map((day, dayIndex) => ({
      day,
      dayIndex,
      courses: HOURS.map((hour, hourIndex) => {
        // Récréation à 10:45
        if (hourIndex === 3) return { hour, subject: 'Récréation', ...subjects[7] };
        // Pause déjeuner
        if (hourIndex === 4 || hourIndex === 5) return { hour, subject: 'Pause', color: 'bg-gray-50 text-gray-400 border-gray-100' };

        // Samedi demi-journée
        if (dayIndex === 5 && hourIndex >= 4) return null;

        // Assigner des matières au hasard (déterministe par position)
        const subjectIndex = (dayIndex + hourIndex) % (subjects.length - 1);
        return {
          hour,
          subject: subjects[subjectIndex].name,
          ...subjects[subjectIndex]
        };
      }).filter(Boolean)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const displaySchedule = schedule.length > 0 ? schedule : getExampleSchedule();
  const todaySchedule = displaySchedule[selectedDay];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon Emploi du temps</h1>
        <p className="mt-1 text-sm text-gray-500">
          {studentInfo?.classes?.name || 'Ma classe'}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sélecteur de jour */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
        <div className="flex overflow-x-auto gap-2">
          {DAYS.map((day, index) => (
            <button
              key={day}
              onClick={() => setSelectedDay(index)}
              className={`flex-1 min-w-[80px] px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedDay === index
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Emploi du temps du jour */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
          <h2 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {DAYS[selectedDay]}
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {todaySchedule?.courses?.length > 0 ? (
            todaySchedule.courses.map((course, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 ${
                  course.subject === 'Récréation' || course.subject === 'Pause'
                    ? 'bg-gray-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 text-sm text-gray-500 w-32">
                  <Clock className="h-4 w-4" />
                  <span>{course.hour}</span>
                </div>
                <div className={`flex-1 px-3 py-2 rounded-lg border ${course.color}`}>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-medium">{course.subject}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p>Pas de cours ce jour</p>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Calendar className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-medium text-indigo-900">Emploi du temps provisoire</h3>
            <p className="text-sm text-indigo-700 mt-1">
              L'emploi du temps définitif sera communiqué par l'administration.
              En cas de modification, vous serez notifié.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
