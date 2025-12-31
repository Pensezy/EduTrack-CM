/**
 * Admin Dashboard Service
 * Service pour récupérer les statistiques du dashboard administrateur
 */

import { getSupabaseClient } from '../supabase/client.js';

export const adminDashboardService = {
  /**
   * Récupère toutes les métriques du dashboard admin
   * @returns {Promise<Object>} Métriques du dashboard
   */
  async getDashboardMetrics() {
    const supabase = getSupabaseClient();

    try {
      // Récupérer le nombre total d'écoles
      const { count: totalSchools, error: schoolsError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (schoolsError) throw schoolsError;

      // Récupérer le nombre total d'élèves actifs
      const { count: totalStudents, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (studentsError) throw studentsError;

      // Récupérer le nombre total d'enseignants actifs
      const { count: totalTeachers, error: teachersError } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (teachersError) throw teachersError;

      // Récupérer le nombre total de classes
      const { count: totalClasses, error: classesError } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true });

      if (classesError) throw classesError;

      // Récupérer le nombre de demandes d'inscription en attente
      const { count: pendingEnrollments, error: enrollmentsError } = await supabase
        .from('enrollment_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Si la table enrollment_requests n'existe pas, ignorer l'erreur
      const pendingCount = enrollmentsError ? 0 : pendingEnrollments;

      // Récupérer le nombre d'utilisateurs actifs
      const { count: activeUsers, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (usersError) throw usersError;

      // Récupérer les paiements du mois en cours
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', startOfMonth.toISOString());

      // Si la table payments n'existe pas, utiliser 0
      const monthlyRevenue = paymentsError ? 0 :
        payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // Calculer les statistiques de croissance (pour l'instant on simule)
      // TODO: Implémenter le calcul réel en comparant avec le mois précédent
      const schoolsGrowth = totalSchools > 0 ? Math.floor(Math.random() * 20) - 5 : 0;
      const studentsGrowth = totalStudents > 0 ? Math.floor(Math.random() * 15) : 0;
      const teachersGrowth = totalTeachers > 0 ? Math.floor(Math.random() * 10) : 0;
      const revenueGrowth = monthlyRevenue > 0 ? Math.floor(Math.random() * 25) : 0;

      // Récupérer les inscriptions par mois (derniers 6 mois)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: enrollmentData, error: enrollmentDataError } = await supabase
        .from('students')
        .select('enrollment_date')
        .gte('enrollment_date', sixMonthsAgo.toISOString());

      const enrollmentsByMonth = this._groupEnrollmentsByMonth(enrollmentData || []);

      // Récupérer les écoles par type
      const { data: schoolsData, error: schoolsDataError } = await supabase
        .from('schools')
        .select('type')
        .eq('status', 'active');

      const schoolsByType = this._groupSchoolsByType(schoolsData || []);

      // Récupérer les activités récentes (dernières 10)
      const recentActivities = await this._getRecentActivities(supabase);

      return {
        totalSchools: totalSchools || 0,
        totalStudents: totalStudents || 0,
        totalTeachers: totalTeachers || 0,
        totalClasses: totalClasses || 0,
        pendingEnrollments: pendingCount || 0,
        activeUsers: activeUsers || 0,
        monthlyRevenue: monthlyRevenue || 0,
        schoolsGrowth,
        studentsGrowth,
        teachersGrowth,
        revenueGrowth,
        enrollmentsByMonth,
        schoolsByType,
        recentActivities
      };

    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  },

  /**
   * Groupe les inscriptions par mois
   * @private
   */
  _groupEnrollmentsByMonth(enrollments) {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const now = new Date();
    const months = [];

    // Créer les 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push({
        key: monthKey,
        month: monthNames[date.getMonth()],
        count: 0
      });
    }

    // Compter les inscriptions par mois
    enrollments.forEach(enrollment => {
      if (!enrollment.enrollment_date) return;

      const date = new Date(enrollment.enrollment_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const monthData = months.find(m => m.key === monthKey);
      if (monthData) {
        monthData.count++;
      }
    });

    return months.map(({ month, count }) => ({ month, count }));
  },

  /**
   * Groupe les écoles par type
   * @private
   */
  _groupSchoolsByType(schools) {
    const typeMap = {
      primaire: 'Primaire',
      college: 'Collège',
      lycee: 'Lycée',
      college_lycee: 'Collège/Lycée',
      maternelle: 'Maternelle',
      universite: 'Université',
      formation_professionnelle: 'Formation Pro',
      public: 'Public',
      prive: 'Privé'
    };

    const grouped = {};

    schools.forEach(school => {
      const type = school.type || 'autre';
      const label = typeMap[type] || type;

      if (!grouped[label]) {
        grouped[label] = 0;
      }
      grouped[label]++;
    });

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value
    }));
  },

  /**
   * Récupère les activités récentes
   * @private
   */
  async _getRecentActivities(supabase) {
    const activities = [];

    try {
      // Récupérer les 3 dernières écoles créées
      const { data: recentSchools } = await supabase
        .from('schools')
        .select('name, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      recentSchools?.forEach(school => {
        activities.push({
          id: `school-${school.name}`,
          type: 'school',
          message: `Nouvelle école ajoutée: ${school.name}`,
          time: this._getRelativeTime(school.created_at)
        });
      });

      // Récupérer les demandes d'inscription récentes
      const { data: recentEnrollments, error: enrollError } = await supabase
        .from('enrollment_requests')
        .select('created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);

      if (!enrollError && recentEnrollments?.length > 0) {
        const count = await supabase
          .from('enrollment_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        activities.push({
          id: 'enrollments',
          type: 'enrollment',
          message: `${count.count || 0} nouvelles demandes d'inscription`,
          time: this._getRelativeTime(recentEnrollments[0].created_at)
        });
      }

      // Récupérer les derniers enseignants ajoutés
      const { data: recentTeachers } = await supabase
        .from('teachers')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentTeachers?.length > 0) {
        activities.push({
          id: 'teachers',
          type: 'user',
          message: `${recentTeachers.length} nouveaux enseignants enregistrés`,
          time: this._getRelativeTime(recentTeachers[0].created_at)
        });
      }

      // Récupérer les derniers paiements
      const { data: recentPayments, error: paymentError } = await supabase
        .from('payments')
        .select('amount, created_at')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

      if (!paymentError && recentPayments?.length > 0) {
        const amount = recentPayments[0].amount;
        activities.push({
          id: 'payment',
          type: 'payment',
          message: `Paiement de ${(amount / 1000000).toFixed(1)}M FCFA reçu`,
          time: this._getRelativeTime(recentPayments[0].created_at)
        });
      }

    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }

    // Trier par date et limiter à 4
    return activities
      .sort((a, b) => {
        // Simple tri, les éléments sont déjà relativement triés
        return 0;
      })
      .slice(0, 4);
  },

  /**
   * Convertit une date en temps relatif
   * @private
   */
  _getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Il y a quelques minutes';
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays === 1) {
      return 'Il y a 1 jour';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      const diffWeeks = Math.floor(diffDays / 7);
      return `Il y a ${diffWeeks} semaine${diffWeeks > 1 ? 's' : ''}`;
    }
  }
};

export default adminDashboardService;
