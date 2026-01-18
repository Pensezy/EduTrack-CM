import { supabase } from '../lib/supabase';
import { getCurrentSchoolId } from './cardService';

// Vérifier si on est en mode production
const isProductionMode = () => {
  // Mode PRODUCTION - utilisation exclusive des données Supabase
  console.log('SchoolYearService: Mode PRODUCTION - utilisation exclusive des données Supabase');
  return true;
};

class SchoolYearService {
  // Obtenir toutes les demandes d'inscription pour l'école actuelle
  async getEnrollmentRequests() {
    console.log('SchoolYearService: Mode production forcé - récupération des vraies données');

    try {
      const schoolId = await getCurrentSchoolId();
      if (!schoolId) {
        console.log('SchoolYearService: Aucun ID d\'école trouvé - retour de données vides');
        return [];
      }

      console.log('SchoolYearService: Recherche des demandes pour l\'école:', schoolId);

      const { data, error } = await supabase
        .from('enrollment_requests')
        .select('*')
        .eq('school_id', schoolId)
        .order('submitted_date', { ascending: false });

      if (error) {
        console.error('SchoolYearService: Erreur lors de la récupération des demandes d\'inscription:', error);
        return [];
      }

      console.log('SchoolYearService: Demandes d\'inscription récupérées:', data?.length || 0, 'demandes');
      if (data && data.length > 0) {
        console.log('SchoolYearService: Première demande:', data[0]);
      } else {
        console.log('SchoolYearService: Aucune demande trouvée - base vide');
      }

      return data || [];
    } catch (error) {
      console.error('SchoolYearService: Erreur dans getEnrollmentRequests:', error);
      return [];
    }
  }

  // Obtenir les réinscriptions (demandes de type redoublement et nouvelles inscriptions d'étudiants existants)
  async getReinscriptions() {
    console.log('SchoolYearService: Mode production forcé - récupération des réinscriptions');

    try {
      const schoolId = await getCurrentSchoolId();
      if (!schoolId) {
        console.log('SchoolYearService: Aucun ID d\'école pour les réinscriptions');
        return [];
      }

      console.log('SchoolYearService: Recherche des réinscriptions pour l\'école:', schoolId);

      // Récupérer les demandes de redoublement et les nouvelles inscriptions avec student_id existant
      const { data, error } = await supabase
        .from('enrollment_requests')
        .select('*, students(first_name, last_name)')
        .eq('school_id', schoolId)
        .or('request_type.eq.redoublement,and(request_type.eq.nouvelle_inscription,student_id.not.is.null)')
        .order('submitted_date', { ascending: false });

      if (error) {
        console.error('SchoolYearService: Erreur lors de la récupération des réinscriptions:', error);
        return [];
      }

      console.log('SchoolYearService: Réinscriptions trouvées:', data?.length || 0);

      // Transformer les données pour correspondre au format attendu
      const reinscriptions = (data || []).map(request => ({
        id: request.id,
        studentName: request.students 
          ? `${request.students.first_name} ${request.students.last_name}`
          : `${request.student_first_name} ${request.student_last_name}`,
        parentName: request.parent_name || 'Non spécifié',
        currentClass: request.current_class || 'Non définie',
        requestedClass: request.requested_class,
        status: this.mapRequestStatusToReinscriptionStatus(request.status),
        submittedDate: new Date(request.submitted_date).toLocaleDateString('fr-FR'),
        reason: request.reason,
        teacherRecommendation: request.teacher_recommendation,
        type: request.request_type,
        priority: request.priority
      }));

      console.log('SchoolYearService: Réinscriptions formatées:', reinscriptions.length);
      if (reinscriptions.length > 0) {
        console.log('SchoolYearService: Première réinscription:', reinscriptions[0]);
      }

      return reinscriptions;
    } catch (error) {
      console.error('SchoolYearService: Erreur dans getReinscriptions:', error);
      return [];
    }
  }

  // Obtenir les nouvelles inscriptions (demandes sans student_id)
  async getNewInscriptions() {
    console.log('SchoolYearService: Mode production forcé - récupération des nouvelles inscriptions');

    try {
      const schoolId = await getCurrentSchoolId();
      if (!schoolId) {
        console.log('SchoolYearService: Aucun ID d\'école pour les nouvelles inscriptions');
        return [];
      }

      console.log('SchoolYearService: Recherche des nouvelles inscriptions pour l\'école:', schoolId);

      const { data, error } = await supabase
        .from('enrollment_requests')
        .select('*')
        .eq('school_id', schoolId)
        .eq('request_type', 'nouvelle_inscription')
        .is('student_id', null)
        .order('submitted_date', { ascending: false });

      if (error) {
        console.error('SchoolYearService: Erreur lors de la récupération des nouvelles inscriptions:', error);
        return [];
      }

      console.log('SchoolYearService: Nouvelles inscriptions trouvées:', data?.length || 0);

      // Transformer les données pour correspondre au format attendu
      const newInscriptions = (data || []).map(request => ({
        id: request.id,
        studentName: `${request.student_first_name} ${request.student_last_name}`,
        parentName: request.parent_name || 'Non spécifié',
        parentPhone: request.parent_phone,
        parentEmail: request.parent_email,
        requestedClass: request.requested_class,
        birthDate: request.student_birth_date 
          ? new Date(request.student_birth_date).toLocaleDateString('fr-FR')
          : null,
        status: this.mapRequestStatusToInscriptionStatus(request.status),
        submittedDate: new Date(request.submitted_date).toLocaleDateString('fr-FR'),
        documents: JSON.parse(request.documents || '[]'),
        reason: request.reason,
        priority: request.priority,
        previousSchool: request.previous_school
      }));

      console.log('SchoolYearService: Nouvelles inscriptions formatées:', newInscriptions.length);
      if (newInscriptions.length > 0) {
        console.log('SchoolYearService: Première nouvelle inscription:', newInscriptions[0]);
      }

      return newInscriptions;
    } catch (error) {
      console.error('SchoolYearService: Erreur dans getNewInscriptions:', error);
      return [];
    }
  }

  // Obtenir les étudiants actuels pour les passages de classe
  async getCurrentStudents() {
    if (!isProductionMode()) {
      console.log('SchoolYearService: Mode démo - retour de données vides pour étudiants actuels');
      return {};
    }

    try {
      const schoolId = await getCurrentSchoolId();
      if (!schoolId) {
        return {};
      }

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId)
        .eq('status', 'active');

      if (error) {
        console.error('Erreur lors de la récupération des étudiants actuels:', error);
        return {};
      }

      // Grouper les étudiants par classe
      const studentsByClass = {};
      (data || []).forEach(student => {
        const currentClass = student.current_class || 'Non définie';
        if (!studentsByClass[currentClass]) {
          studentsByClass[currentClass] = [];
        }
        
        studentsByClass[currentClass].push({
          id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          currentClass: student.current_class,
          status: 'en_attente', // Statut par défaut pour passage de classe
          nextClass: this.getNextClass(student.current_class),
          academicResults: student.academic_results || {},
          attendance: student.attendance_rate || null,
          behavior: student.behavior_notes || null
        });
      });

      console.log('SchoolYearService: Étudiants actuels récupérés:', Object.keys(studentsByClass).length, 'classes');
      return studentsByClass;
    } catch (error) {
      console.error('Erreur dans getCurrentStudents:', error);
      return {};
    }
  }

  // Mettre à jour le statut d'une demande d'inscription
  async updateEnrollmentRequestStatus(requestId, status, notes = null) {
    if (!isProductionMode()) {
      console.log('SchoolYearService: Mode démo - simulation de mise à jour de statut');
      return { success: true };
    }

    try {
      const updateData = {
        status: this.mapStatusToRequestStatus(status),
        reviewed_date: new Date().toISOString(),
        validation_notes: notes
      };

      const { error } = await supabase
        .from('enrollment_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        return { success: false, error };
      }

      console.log('SchoolYearService: Statut mis à jour avec succès pour la demande:', requestId);
      return { success: true };
    } catch (error) {
      console.error('Erreur dans updateEnrollmentRequestStatus:', error);
      return { success: false, error };
    }
  }

  // Créer une nouvelle demande d'inscription
  async createEnrollmentRequest(requestData) {
    if (!isProductionMode()) {
      console.log('SchoolYearService: Mode démo - simulation de création de demande');
      return { success: true, id: 'demo-id' };
    }

    try {
      const schoolId = await getCurrentSchoolId();
      if (!schoolId) {
        return { success: false, error: 'École non trouvée' };
      }

      const { data, error } = await supabase
        .from('enrollment_requests')
        .insert({
          ...requestData,
          school_id: schoolId,
          submitted_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la demande:', error);
        return { success: false, error };
      }

      console.log('SchoolYearService: Demande créée avec succès:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('Erreur dans createEnrollmentRequest:', error);
      return { success: false, error };
    }
  }

  // Utilitaires de mapping des statuts
  mapRequestStatusToReinscriptionStatus(requestStatus) {
    const mapping = {
      'en_attente': 'en_attente',
      'en_revision': 'en_revision',
      'approuvee': 'confirme',
      'refusee': 'refuse'
    };
    return mapping[requestStatus] || 'en_attente';
  }

  mapRequestStatusToInscriptionStatus(requestStatus) {
    const mapping = {
      'en_attente': 'soumis',
      'en_revision': 'en_revision',
      'approuvee': 'accepte',
      'refusee': 'refuse'
    };
    return mapping[requestStatus] || 'soumis';
  }

  mapStatusToRequestStatus(status) {
    const mapping = {
      'en_attente': 'en_attente',
      'en_revision': 'en_revision',
      'confirme': 'approuvee',
      'accepte': 'approuvee',
      'refuse': 'refusee',
      'soumis': 'en_attente'
    };
    return mapping[status] || 'en_attente';
  }

  // Déterminer la classe suivante
  getNextClass(currentClass) {
    const classProgression = {
      'SIL': 'CP',
      'CP': 'CE1',
      'CE1': 'CE2',
      'CE2': 'CM1',
      'CM1': 'CM2',
      'CM2': 'Sixième'
    };
    return classProgression[currentClass] || currentClass;
  }

  // Obtenir les statistiques de l'année scolaire
  async getSchoolYearStatistics() {
    console.log('SchoolYearService: Mode production forcé - calcul des statistiques');

    try {
      const schoolId = await getCurrentSchoolId();
      if (!schoolId) {
        console.log('SchoolYearService: Aucun ID d\'école pour les statistiques');
        return {
          totalRequests: 0,
          pendingRequests: 0,
          approvedRequests: 0,
          rejectedRequests: 0,
          reinscriptions: 0,
          newInscriptions: 0,
          transfers: 0
        };
      }

      console.log('SchoolYearService: Calcul des statistiques pour l\'école:', schoolId);

      const { data, error } = await supabase
        .from('enrollment_requests')
        .select('status, request_type')
        .eq('school_id', schoolId);

      if (error) {
        console.error('SchoolYearService: Erreur lors de la récupération des statistiques:', error);
        return {
          totalRequests: 0,
          pendingRequests: 0,
          approvedRequests: 0,
          rejectedRequests: 0,
          reinscriptions: 0,
          newInscriptions: 0,
          transfers: 0
        };
      }

      const stats = (data || []).reduce((acc, request) => {
        acc.totalRequests++;
        
        // Compteurs par statut
        switch (request.status) {
          case 'en_attente':
          case 'en_revision':
            acc.pendingRequests++;
            break;
          case 'approuvee':
            acc.approvedRequests++;
            break;
          case 'refusee':
            acc.rejectedRequests++;
            break;
        }

        // Compteurs par type
        switch (request.request_type) {
          case 'redoublement':
            acc.reinscriptions++;
            break;
          case 'nouvelle_inscription':
            acc.newInscriptions++;
            break;
          case 'transfert':
            acc.transfers++;
            break;
        }

        return acc;
      }, {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        reinscriptions: 0,
        newInscriptions: 0,
        transfers: 0
      });

      console.log('SchoolYearService: Statistiques calculées:', stats);
      return stats;
    } catch (error) {
      console.error('Erreur dans getSchoolYearStatistics:', error);
      return {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        reinscriptions: 0,
        newInscriptions: 0,
        transfers: 0
      };
    }
  }
}

export const schoolYearService = new SchoolYearService();
export default schoolYearService;