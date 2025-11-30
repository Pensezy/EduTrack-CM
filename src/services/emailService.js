import emailjs from '@emailjs/browser';

/**
 * Configuration EmailJS
 * Pour obtenir ces clés, créez un compte gratuit sur https://www.emailjs.com/
 * 1. Créez un compte
 * 2. Ajoutez un service email (Gmail, Outlook, etc.)
 * 3. Créez un template d'email
 * 4. Récupérez vos clés dans le Dashboard
 */

const EMAILJS_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_default',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_default',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
};

/**
 * Initialise EmailJS avec la clé publique
 */
export const initEmailJS = () => {
  if (EMAILJS_CONFIG.publicKey) {
    emailjs.init(EMAILJS_CONFIG.publicKey);
  }
};

/**
 * Envoie un email avec les identifiants de connexion
 * @param {Object} params - Paramètres de l'email
 * @param {string} params.recipientEmail - Email du destinataire (utilisateur ou directeur)
 * @param {string} params.recipientName - Nom du destinataire
 * @param {string} params.role - Rôle du personnel (enseignant, secrétaire, parent, etc.)
 * @param {string} params.email - Email de connexion du compte créé
 * @param {string} params.password - Mot de passe du compte
 * @param {string} params.schoolName - Nom de l'école
 * @param {string} params.principalName - Nom du directeur
 * @param {boolean} params.hasPersonalEmail - Si true, email envoyé à l'utilisateur, sinon au directeur
 * @param {string} params.staffName - Nom du personnel (si envoi au directeur)
 * @param {string} params.phone - Téléphone de l'utilisateur
 * @param {string} params.studentName - Nom de l'élève (pour les comptes élèves)
 * @param {string} params.matricule - Matricule de l'élève
 * @param {string} params.parentName - Nom du parent (pour les comptes élèves)
 * @param {string} params.parentPhone - Téléphone du parent
 * @returns {Promise<Object>} - Résultat de l'envoi
 */
export const sendCredentialsEmail = async ({
  recipientEmail,
  recipientName,
  role,
  email,
  password,
  schoolName,
  principalName,
  hasPersonalEmail = true,
  staffName = '',
  phone = '',
  studentName = '',
  matricule = '',
  parentName = '',
  parentPhone = '',
  isStudent = false,
}) => {
  try {
    console.log('📧 Tentative d\'envoi d\'email...');
    console.log('  - Destinataire:', recipientEmail);
    console.log('  - Rôle:', role);
    console.log('  - École:', schoolName);
    console.log('  - Email personnel:', hasPersonalEmail ? 'OUI' : 'NON (envoi au directeur)');

    // Vérifier que EmailJS est configuré
    if (!EMAILJS_CONFIG.publicKey || EMAILJS_CONFIG.publicKey === '') {
      console.warn('⚠️ EmailJS non configuré. Clés manquantes dans .env');
      console.warn('  - Service ID:', EMAILJS_CONFIG.serviceId);
      console.warn('  - Template ID:', EMAILJS_CONFIG.templateId);
      console.warn('  - Public Key:', EMAILJS_CONFIG.publicKey ? 'Présente' : '❌ MANQUANTE');
      return {
        success: false,
        error: 'EmailJS non configuré - Clés manquantes dans le fichier .env',
        fallback: true,
        credentials: { email, password },
      };
    }

    console.log('✓ Configuration EmailJS détectée');
    console.log('  - Service ID:', EMAILJS_CONFIG.serviceId);
    console.log('  - Template ID:', EMAILJS_CONFIG.templateId);

    // Préparer les données du template
    const templateParams = {
      to_email: recipientEmail,
      to_name: recipientName,
      role: role,
      login_email: email,
      login_password: password,
      school_name: schoolName,
      principal_name: principalName,
      login_url: `${window.location.origin}/staff-login`,
      current_year: new Date().getFullYear(),
      // Nouveaux champs pour gérer les deux cas
      has_personal_email: hasPersonalEmail ? 'yes' : 'no',
      staff_name: staffName || '',
      staff_phone: phone || '',
      // Pour les élèves
      is_student: isStudent ? 'yes' : 'no',
      student_name: studentName || '',
      matricule: matricule || '',
      parent_name: parentName || '',
      parent_phone: parentPhone || '',
    };

    console.log('📤 Envoi de l\'email via EmailJS...');
    console.log('   Type:', hasPersonalEmail ? 'Direct à l\'utilisateur' : 'Au directeur pour transmission');
    
    // Envoyer l'email
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('📬 Réponse EmailJS:', response);

    if (response.status === 200) {
      console.log('✅ Email envoyé avec succès à', recipientEmail);
      return {
        success: true,
        message: 'Email envoyé avec succès',
        details: {
          recipient: recipientEmail,
          sentToPrincipal: !hasPersonalEmail,
          timestamp: new Date().toISOString(),
          status: response.status
        }
      };
    } else {
      console.error('❌ Échec de l\'envoi - Status:', response.status);
      throw new Error(`Échec de l\'envoi de l\'email (Status: ${response.status})`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    console.error('  - Type d\'erreur:', error.name);
    console.error('  - Message:', error.message);
    console.error('  - Détails:', error.text || 'Aucun détail supplémentaire');
    
    // Déterminer le type d'erreur pour un message plus clair
    let userFriendlyError = error.message;
    
    if (error.message?.includes('Invalid email')) {
      userFriendlyError = 'L\'adresse email est invalide';
    } else if (error.message?.includes('Failed to fetch') || error.message?.includes('Network')) {
      userFriendlyError = 'Erreur de connexion Internet. Vérifiez votre connexion.';
    } else if (error.message?.includes('Service ID') || error.message?.includes('Template ID')) {
      userFriendlyError = 'Configuration EmailJS incorrecte. Vérifiez vos clés dans le fichier .env';
    }
    
    return {
      success: false,
      error: userFriendlyError,
      technicalError: error.message,
      fallback: true,
      credentials: { email, password },
    };
  }
};

/**
 * Envoie un email de réinitialisation de mot de passe
 * @param {Object} params - Paramètres de l'email
 * @param {string} params.recipientEmail - Email du destinataire
 * @param {string} params.recipientName - Nom du destinataire
 * @param {string} params.resetToken - Token de réinitialisation
 * @returns {Promise<Object>} - Résultat de l'envoi
 */
export const sendPasswordResetEmail = async ({
  recipientEmail,
  recipientName,
  resetToken,
}) => {
  try {
    if (!EMAILJS_CONFIG.publicKey || EMAILJS_CONFIG.publicKey === '') {
      return {
        success: false,
        error: 'EmailJS non configuré',
      };
    }

    const templateParams = {
      to_email: recipientEmail,
      to_name: recipientName,
      reset_link: `${window.location.origin}/reset-password?token=${resetToken}`,
      current_year: new Date().getFullYear(),
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      'template_password_reset', // Template différent pour la réinitialisation
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    return {
      success: response.status === 200,
      message: response.status === 200 ? 'Email envoyé' : 'Échec de l\'envoi',
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Valide la configuration EmailJS
 * @returns {boolean} - True si la configuration est valide
 */
export const isEmailConfigured = () => {
  return !!(
    EMAILJS_CONFIG.publicKey &&
    EMAILJS_CONFIG.publicKey !== '' &&
    EMAILJS_CONFIG.serviceId &&
    EMAILJS_CONFIG.templateId
  );
};

// Initialiser EmailJS au chargement du module
initEmailJS();
