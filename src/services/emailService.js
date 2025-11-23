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
 * Envoie un email avec les identifiants de connexion au personnel
 * @param {Object} params - Paramètres de l'email
 * @param {string} params.recipientEmail - Email du destinataire
 * @param {string} params.recipientName - Nom du destinataire
 * @param {string} params.role - Rôle du personnel (enseignant, secrétaire, etc.)
 * @param {string} params.email - Email de connexion
 * @param {string} params.password - Mot de passe temporaire
 * @param {string} params.schoolName - Nom de l'école
 * @param {string} params.principalName - Nom du directeur
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
}) => {
  try {
    // Vérifier que EmailJS est configuré
    if (!EMAILJS_CONFIG.publicKey || EMAILJS_CONFIG.publicKey === '') {
      console.warn('⚠️ EmailJS non configuré. Les identifiants seront affichés à l\'écran.');
      return {
        success: false,
        error: 'EmailJS non configuré',
        fallback: true,
        credentials: { email, password },
      };
    }

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
    };

    // Envoyer l'email
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    if (response.status === 200) {
      return {
        success: true,
        message: 'Email envoyé avec succès',
      };
    } else {
      throw new Error('Échec de l\'envoi de l\'email');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    return {
      success: false,
      error: error.message || 'Erreur inconnue',
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
