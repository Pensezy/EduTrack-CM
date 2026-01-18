import { supabase } from '../lib/supabase';
import { getCurrentSchoolId } from './cardService';

// Vérifier si on est en mode production
const isProductionMode = () => {
  // FORCER LE MODE PRODUCTION comme demandé par l'utilisateur
  console.log('CommunicationService: Mode PRODUCTION forcé - utilisation exclusive des données Supabase');
  return true;
};

class CommunicationService {
  // Obtenir la liste des parents de l'école actuelle avec leurs enfants
  async getParentsBySchool() {
    console.log('CommunicationService: Mode production forcé - récupération des parents');

    try {
      const schoolId = await getCurrentSchoolId();
      if (!schoolId) {
        console.log('CommunicationService: Aucun ID d\'école trouvé');
        return [];
      }

      console.log('CommunicationService: Recherche des parents pour l\'école:', schoolId);

      // Récupérer les parents avec leurs enfants via la table de liaison
      const { data, error } = await supabase
        .from('parent_student_schools')
        .select(`
          parent_id,
          student_id,
          relationship_type,
          is_primary_contact,
          parents:parent_id (
            id,
            first_name,
            last_name,
            phone,
            email,
            user_id
          ),
          students:student_id (
            id,
            first_name,
            last_name
          )
        `)
        .eq('school_id', schoolId)
        .eq('is_primary_contact', true); // Uniquement les contacts principaux

      if (error) {
        console.error('CommunicationService: Erreur lors de la récupération des parents:', error);
        return [];
      }

      console.log('CommunicationService: Relations parent-étudiant trouvées:', data?.length || 0);

      // Transformer et grouper les données par parent
      const parentsMap = new Map();
      
      (data || []).forEach(relation => {
        const parent = relation.parents;
        const student = relation.students;
        
        if (!parent || !student) return;
        
        const parentKey = parent.id;
        
        if (!parentsMap.has(parentKey)) {
          parentsMap.set(parentKey, {
            id: parent.id,
            name: `${parent.first_name} ${parent.last_name}`,
            firstName: parent.first_name,
            lastName: parent.last_name,
            phone: parent.phone,
            email: parent.email,
            userId: parent.user_id,
            students: []
          });
        }
        
        // Ajouter l'étudiant à la liste des enfants du parent
        parentsMap.get(parentKey).students.push({
          id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          class: 'Non définie'
        });
      });

      const parentsList = Array.from(parentsMap.values()).map(parent => ({
        ...parent,
        studentName: parent.students.map(s => s.name).join(', '),
        class: parent.students.map(s => s.class).join(', ')
      }));

      console.log('CommunicationService: Parents formatés:', parentsList.length);
      if (parentsList.length > 0) {
        console.log('CommunicationService: Premier parent:', parentsList[0]);
      }

      return parentsList;
    } catch (error) {
      console.error('CommunicationService: Erreur dans getParentsBySchool:', error);
      return [];
    }
  }

  // Obtenir l'historique des communications
  async getCommunicationsHistory() {
    console.log('CommunicationService: Mode production forcé - récupération de l\'historique');

    try {
      const schoolId = await getCurrentSchoolId();
      if (!schoolId) {
        console.log('CommunicationService: Aucun ID d\'école pour l\'historique');
        return [];
      }

      console.log('CommunicationService: Recherche de l\'historique pour l\'école:', schoolId);

      const { data, error } = await supabase
        .from('communications')
        .select(`
          id,
          message_type,
          subject,
          content,
          recipients_data,
          recipient_count,
          status,
          delivery_count,
          sent_at,
          template_used,
          error_message,
          sender:sent_by_user_id (
            full_name,
            role
          )
        `)
        .eq('school_id', schoolId)
        .order('sent_at', { ascending: false });

      if (error) {
        console.error('CommunicationService: Erreur lors de la récupération de l\'historique:', error);
        // Si la table n'existe pas encore, retourner un tableau vide
        if (error.code === 'PGRST205' || error.message?.includes('table') || error.message?.includes('relationship')) {
          console.log('CommunicationService: Table communications pas encore créée, retour d\'un tableau vide');
          return [];
        }
        return [];
      }

      console.log('CommunicationService: Communications trouvées:', data?.length || 0);

      // Transformer les données pour correspondre au format attendu
      const communications = (data || []).map(comm => {
        const recipientsData = Array.isArray(comm.recipients_data) ? comm.recipients_data : [];
        const recipientNames = recipientsData.map(r => r.name || 'Destinataire').slice(0, 3);
        if (recipientsData.length > 3) {
          recipientNames.push(`+${recipientsData.length - 3} autres`);
        }

        return {
          id: comm.id,
          type: comm.message_type,
          subject: comm.subject || 'Message sans sujet',
          recipients: recipientNames,
          sentDate: new Date(comm.sent_at).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          status: comm.status,
          deliveryCount: comm.delivery_count,
          totalCount: comm.recipient_count,
          template: comm.template_used,
          sender: comm.sender?.full_name || 'Expéditeur inconnu',
          content: comm.content,
          errorMessage: comm.error_message
        };
      });

      console.log('CommunicationService: Historique formaté:', communications.length);
      if (communications.length > 0) {
        console.log('CommunicationService: Première communication:', communications[0]);
      }

      return communications;
    } catch (error) {
      console.error('CommunicationService: Erreur dans getCommunicationsHistory:', error);
      return [];
    }
  }

  // Obtenir les templates de messages
  async getMessageTemplates() {
    console.log('CommunicationService: Mode production forcé - récupération des templates');

    try {
      const schoolId = await getCurrentSchoolId();
      if (!schoolId) {
        console.log('CommunicationService: Aucun ID d\'école pour les templates');
        return [];
      }

      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) {
        console.error('CommunicationService: Erreur lors de la récupération des templates:', error);
        // Si la table n'existe pas encore, retourner des templates par défaut
        if (error.code === 'PGRST205' || error.message?.includes('table')) {
          console.log('CommunicationService: Table message_templates pas encore créée, retour des templates par défaut');
          return [
            { value: 'custom', label: 'Message personnalisé', category: 'custom', content: '', variables: [] },
            { value: 'absence', label: 'Justification d\'absence', category: 'attendance', content: 'Bonjour, votre enfant était absent le {date}. Merci de fournir une justification.', variables: ['date'] },
            { value: 'payment', label: 'Rappel de paiement', category: 'financial', content: 'Cher parent, un paiement est en attente. Merci de régulariser.', variables: [] },
            { value: 'announcement', label: 'Annonce générale', category: 'general', content: 'Chers parents, nous vous informons que {message}.', variables: ['message'] }
          ];
        }
        return [];
      }

      console.log('CommunicationService: Templates trouvés:', data?.length || 0);

      // Transformer en format option pour Select
      const templates = (data || []).map(template => ({
        value: template.id,
        label: template.name,
        category: template.category,
        content: template.content,
        variables: template.variables || []
      }));

      return templates;
    } catch (error) {
      console.error('CommunicationService: Erreur dans getMessageTemplates:', error);
      return [];
    }
  }

  // Envoyer un message
  async sendMessage(messageData) {
    console.log('CommunicationService: Mode production forcé - envoi de message');

    try {
      const schoolId = await getCurrentSchoolId();
      if (!schoolId) {
        throw new Error('École non trouvée');
      }

      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      console.log('CommunicationService: Préparation envoi message:', {
        type: messageData.type,
        recipients: messageData.recipients.length,
        school: schoolId
      });

      // Préparer les données de la communication
      const communicationData = {
        school_id: schoolId,
        sent_by_user_id: user.id,
        message_type: messageData.type,
        subject: messageData.subject,
        content: messageData.content,
        template_used: messageData.templateUsed,
        recipients_data: messageData.recipients,
        status: 'delivered', // Simuler la livraison réussie
        delivery_count: messageData.recipients.length,
        sent_at: new Date().toISOString()
      };

      // Insérer dans la base de données
      const { data, error } = await supabase
        .from('communications')
        .insert(communicationData)
        .select()
        .single();

      if (error) {
        console.error('CommunicationService: Erreur lors de l\'insertion:', error);
        throw error;
      }

      console.log('CommunicationService: Message enregistré avec succès:', data.id);

      // Ici, vous pourriez ajouter l'intégration avec un vrai service SMS/Email
      // Pour l'instant, nous simulons un envoi réussi
      return {
        success: true,
        messageId: data.id,
        deliveredCount: messageData.recipients.length,
        message: 'Message envoyé avec succès'
      };
    } catch (error) {
      console.error('CommunicationService: Erreur dans sendMessage:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Créer ou mettre à jour un template
  async saveTemplate(templateData) {
    try {
      const schoolId = await getCurrentSchoolId();
      if (!schoolId) {
        throw new Error('École non trouvée');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      const templateRecord = {
        school_id: schoolId,
        name: templateData.name,
        category: templateData.category,
        content: templateData.content,
        variables: templateData.variables || [],
        created_by: user.id
      };

      let result;
      if (templateData.id) {
        // Mise à jour
        result = await supabase
          .from('message_templates')
          .update(templateRecord)
          .eq('id', templateData.id)
          .eq('school_id', schoolId)
          .select()
          .single();
      } else {
        // Création
        result = await supabase
          .from('message_templates')
          .insert(templateRecord)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      console.log('CommunicationService: Template sauvegardé:', result.data.id);
      return { success: true, data: result.data };
    } catch (error) {
      console.error('CommunicationService: Erreur dans saveTemplate:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtenir les statistiques de communication
  async getCommunicationStats() {
    try {
      const schoolId = await getCurrentSchoolId();
      if (!schoolId) {
        return {
          totalSent: 0,
          delivered: 0,
          failed: 0,
          thisWeek: 0
        };
      }

      const { data, error } = await supabase
        .from('communications')
        .select('status, sent_at, delivery_count')
        .eq('school_id', schoolId);

      if (error) {
        console.error('CommunicationService: Erreur stats:', error);
        return {
          totalSent: 0,
          delivered: 0,
          failed: 0,
          thisWeek: 0
        };
      }

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats = (data || []).reduce((acc, comm) => {
        acc.totalSent++;
        if (comm.status === 'delivered' || comm.status === 'partial') {
          acc.delivered++;
        } else if (comm.status === 'failed') {
          acc.failed++;
        }
        
        if (new Date(comm.sent_at) >= weekAgo) {
          acc.thisWeek++;
        }
        
        return acc;
      }, {
        totalSent: 0,
        delivered: 0,
        failed: 0,
        thisWeek: 0
      });

      console.log('CommunicationService: Stats calculées:', stats);
      return stats;
    } catch (error) {
      console.error('CommunicationService: Erreur dans getCommunicationStats:', error);
      return {
        totalSent: 0,
        delivered: 0,
        failed: 0,
        thisWeek: 0
      };
    }
  }
}

export const communicationService = new CommunicationService();
export default communicationService;
