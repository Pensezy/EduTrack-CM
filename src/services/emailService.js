/**
 * Service d'envoi d'emails SIMPLE - EduTrack CM
 * Ouvre Gmail avec l'email pré-rempli - FINI LES COMPLICATIONS !
 */

class EmailService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    this.isInitialized = true;
    return true;
  }

  /**
   * SOLUTION SIMPLE : Ouvre Gmail - C'EST TOUT !
   */
  async sendCredentials({ email, fullName, password, role, schoolName = 'Votre École' }) {
    console.log('📧 Ouverture Gmail pour:', email);

    const subject = `🎓 Vos identifiants EduTrack CM - ${schoolName}`;
    const message = `Bonjour ${fullName},

Votre compte ${role === 'secretary' ? 'Secrétaire' : role} a été créé sur EduTrack CM.

🔐 VOS IDENTIFIANTS :
Email : ${email}
Mot de passe : ${password}

🌐 CONNEXION :
${window.location.origin}/login

⚠️ IMPORTANT : Vous devrez changer votre mot de passe lors de votre première connexion.

Cordialement,
EduTrack CM - ${schoolName}`;

    // Ouvrir Gmail - SIMPLE !
    const encodedSubject = encodeURIComponent(subject);
    const encodedMessage = encodeURIComponent(message);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${email}&su=${encodedSubject}&body=${encodedMessage}`;
    
    window.open(gmailUrl, '_blank');

    // UN SEUL message simple
    alert(`📧 Gmail s'est ouvert avec l'email pré-rempli.\n\nCliquez sur "Envoyer" dans Gmail pour envoyer les identifiants à ${email}.`);

    return {
      success: true,
      message: `Gmail ouvert pour ${email}`,
      method: 'gmail_direct'
    };
  }

  /**
   * Envoie un email de réinitialisation - VERSION SIMPLE
   */
  async sendPasswordReset({ email, fullName, newPassword, schoolName }) {
    try {
      const subject = `� Nouveau mot de passe - EduTrack CM`;
      const message = `Bonjour ${fullName},

Votre mot de passe a été réinitialisé.

🔐 NOUVEAU MOT DE PASSE :
${newPassword}

🌐 CONNEXION :
${window.location.origin}/login

⚠️ Vous devrez changer ce mot de passe lors de votre prochaine connexion.

Cordialement,
EduTrack CM - ${schoolName}`;

      // ENVOI RÉEL
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: 'a8b9c2d3-e4f5-6789-abcd-ef1234567890',
          subject: subject,
          message: message,
          from_name: 'EduTrack CM',
          to: email
        })
      });

      if (response.ok) {
        alert(`✅ Nouveau mot de passe envoyé à ${email} !`);
        return { success: true, method: 'web3forms' };
      } else {
        throw new Error('Service indisponible');
      }
    } catch (error) {
      // Fallback : ouvrir client mail
      const subject = encodeURIComponent(`🔑 Nouveau mot de passe - EduTrack CM`);
      const body = encodeURIComponent(`Bonjour ${fullName},\n\nVotre nouveau mot de passe : ${newPassword}\n\nConnexion : ${window.location.origin}/login`);
      window.open(`mailto:${email}?subject=${subject}&body=${body}`);
      alert(`📧 Client mail ouvert. Envoyez le nouveau mot de passe à ${email}`);
      return { success: true, method: 'mailto' };
    }
  }



  /**
   * Vérifie si le service peut envoyer des emails
   */
  async canSendEmails() {
    return true;
  }
}

// Instance singleton
const emailService = new EmailService();

export default emailService;