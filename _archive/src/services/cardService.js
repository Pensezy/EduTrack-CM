// Service pour la gestion des cartes scolaires

import { supabase } from '../lib/supabase';

// Obtenir l'école actuelle
const getCurrentSchoolId = async () => {
  try {
    // 1. Essayer le localStorage d'abord
    const savedUser = localStorage.getItem('edutrack-user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.current_school_id) {
        return userData.current_school_id;
      }
    }

    // 2. Si pas dans localStorage, récupérer depuis Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('⚠️ Utilisateur non authentifié');
      return null;
    }

    // Récupérer l'école depuis la table users
    const { data: userData, error } = await supabase
      .from('users')
      .select('current_school_id, schools:current_school_id(id, name)')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('❌ Erreur récupération école utilisateur:', error);
      return null;
    }

    if (userData?.current_school_id) {
      console.log('✅ École trouvée:', userData.current_school_id, userData.schools?.name);
      return userData.current_school_id;
    }

    console.warn('⚠️ Aucune école associée à l\'utilisateur');
    return null;
  } catch (error) {
    console.error('❌ Erreur getCurrentSchoolId:', error);
    return null;
  }
};

// Formatage des dates
const formatDate = (date) => {
  return date.toLocaleDateString('fr-FR');
};

// Calcul de la date d'expiration (fin d'année scolaire)
const getExpiryDate = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Si on est entre septembre et décembre, l'expiration est en juin de l'année suivante
  // Sinon, c'est en juin de l'année courante
  const expiryYear = currentMonth >= 8 ? currentYear + 1 : currentYear;
  return new Date(expiryYear, 5, 30); // 30 juin
};

// Service principal
export const cardService = {
  // Obtenir toutes les cartes
  getAllCards: async () => {
    try {
      const schoolId = await getCurrentSchoolId();
      if (!schoolId) {
        throw new Error('Pas d\'école associée');
      }

      // Récupérer les cartes avec les informations des étudiants
      const { data, error } = await supabase
        .from('student_cards')
        .select(`
          id,
          card_number,
          issue_date,
          expiry_date,
          status,
          created_at,
          updated_at,
          student_id,
          students:student_id (
            id,
            user_id,
            first_name,
            last_name,
            date_of_birth,
            users:user_id (
              photo
            )
          )
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Récupérer les classes des étudiants via les attendances récentes
      const studentIds = data.map(card => card.student_id).filter(Boolean);
      
      let studentClasses = {};
      if (studentIds.length > 0) {
        const { data: attendancesData } = await supabase
          .from('attendances')
          .select(`
            student_id,
            classes:class_id (
              name
            )
          `)
          .in('student_id', studentIds)
          .order('date', { ascending: false })
          .limit(studentIds.length);

        if (attendancesData) {
          attendancesData.forEach(att => {
            if (!studentClasses[att.student_id] && att.classes?.name) {
              studentClasses[att.student_id] = att.classes.name;
            }
          });
        }
      }

      // Transformer au format attendu
      const formattedCards = data.map(card => ({
        id: card.id,
        studentId: card.students?.user_id || card.students?.id,
        studentName: `${card.students?.first_name || ''} ${card.students?.last_name || ''}`.trim(),
        class: studentClasses[card.student_id] || 'Non assigné',
        photo: card.students?.users?.photo || '/assets/images/no_image.png',
        cardNumber: card.card_number,
        issueDate: card.issue_date ? new Date(card.issue_date).toLocaleDateString('fr-FR') : '',
        expiryDate: card.expiry_date ? new Date(card.expiry_date).toLocaleDateString('fr-FR') : '',
        status: card.status,
        dateOfBirth: card.students?.date_of_birth ? new Date(card.students.date_of_birth).toLocaleDateString('fr-FR') : '',
        parentName: 'Non renseigné', // Parents relation à implémenter plus tard
        emergencyContact: 'Non renseigné', // Parents relation à implémenter plus tard
        bloodType: 'Non renseigné', // À ajouter dans la table students si nécessaire
        medicalNotes: 'Aucune' // À ajouter dans la table students si nécessaire
      }));

      return formattedCards;
    } catch (error) {
      console.error('❌ Erreur chargement cartes Supabase:', error);
      console.error('Code erreur:', error.code);
      console.error('Message:', error.message);
      console.error('Details:', error.details);
      throw error;
    }
  }
};

// Exporter la fonction getCurrentSchoolId pour utilisation dans d'autres services
export { getCurrentSchoolId };

export default cardService;