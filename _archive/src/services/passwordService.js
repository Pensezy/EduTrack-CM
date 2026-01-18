import { supabase } from '../lib/supabase';

class PasswordService {
  /**
   * Génère un mot de passe sécurisé
   */
  generateSecurePassword(length = 12) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    
    let password = '';
    
    // Garantir au moins un caractère de chaque type
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Compléter avec des caractères aléatoires
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Mélanger les caractères
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Valide la force d'un mot de passe
   */
  validatePasswordStrength(password) {
    const errors = [];
    const requirements = {
      minLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)
    };

    if (!requirements.minLength) {
      errors.push('Au moins 8 caractères requis');
    }
    if (!requirements.hasLowercase) {
      errors.push('Au moins une lettre minuscule requise');
    }
    if (!requirements.hasUppercase) {
      errors.push('Au moins une lettre majuscule requise'); 
    }
    if (!requirements.hasNumber) {
      errors.push('Au moins un chiffre requis');
    }
    if (!requirements.hasSymbol) {
      errors.push('Au moins un caractère spécial requis');
    }

    return {
      isValid: errors.length === 0,
      errors,
      requirements,
      strength: this.calculatePasswordStrength(requirements)
    };
  }

  /**
   * Calcule le niveau de force du mot de passe
   */
  calculatePasswordStrength(requirements) {
    const passed = Object.values(requirements).filter(Boolean).length;
    const total = Object.keys(requirements).length;
    const percentage = (passed / total) * 100;

    if (percentage < 40) return { level: 'weak', color: 'red', text: 'Faible' };
    if (percentage < 70) return { level: 'medium', color: 'orange', text: 'Moyen' };
    if (percentage < 90) return { level: 'good', color: 'blue', text: 'Bon' };
    return { level: 'strong', color: 'green', text: 'Fort' };
  }

  /**
   * Envoie un email de récupération de mot de passe
   */
  async sendPasswordResetEmail(email) {
    try {
      // En production, utiliser Supabase Auth
      if (supabase) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/password-reset`,
        });

        if (error) throw error;
        return { success: true, data };
      }

      // Simulation pour le développement
      console.log(`Email de récupération envoyé à: ${email}`);
      return { 
        success: true, 
        message: 'Email de récupération envoyé (simulation)' 
      };
    } catch (error) {
      console.error('Erreur envoi email récupération:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur lors de l\'envoi de l\'email' 
      };
    }
  }

  /**
   * Met à jour le mot de passe utilisateur
   */
  async updateUserPassword(userId, newPassword) {
    try {
      // Validation du mot de passe
      const validation = this.validatePasswordStrength(newPassword);
      if (!validation.isValid) {
        throw new Error(`Mot de passe invalide: ${validation.errors.join(', ')}`);
      }

      // En production, utiliser Supabase
      if (supabase) {
        const { data, error } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (error) throw error;

        // Mettre à jour également dans la table profiles si nécessaire
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            password_updated_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (profileError) {
          console.warn('Erreur mise à jour profil:', profileError);
        }

        return { success: true, data };
      }

      // Simulation pour le développement
      console.log(`Mot de passe mis à jour pour l'utilisateur: ${userId}`);
      return { 
        success: true, 
        message: 'Mot de passe mis à jour (simulation)' 
      };
    } catch (error) {
      console.error('Erreur mise à jour mot de passe:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur lors de la mise à jour du mot de passe' 
      };
    }
  }

  /**
   * Réinitialise le mot de passe avec un token
   */
  async resetPasswordWithToken(token, newPassword) {
    try {
      // Validation du mot de passe
      const validation = this.validatePasswordStrength(newPassword);
      if (!validation.isValid) {
        throw new Error(`Mot de passe invalide: ${validation.errors.join(', ')}`);
      }

      // En production, utiliser Supabase Auth
      if (supabase) {
        const { data, error } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (error) throw error;
        return { success: true, data };
      }

      // Simulation pour le développement
      console.log(`Mot de passe réinitialisé avec token: ${token}`);
      return { 
        success: true, 
        message: 'Mot de passe réinitialisé (simulation)' 
      };
    } catch (error) {
      console.error('Erreur réinitialisation mot de passe:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur lors de la réinitialisation' 
      };
    }
  }

  /**
   * Vérifie si un token de réinitialisation est valide
   */
  async validateResetToken(token) {
    try {
      // En production, vérifier avec Supabase
      if (supabase) {
        // Supabase gère automatiquement la validation des tokens
        // lors de la réinitialisation du mot de passe
        return { valid: true };
      }

      // Simulation pour les développement
      console.log(`Validation token: ${token}`);
      
      // Simuler différents cas
      if (token === 'invalid-token') {
        return { valid: false, error: 'Token invalide' };
      }
      if (token === 'expired-token') {
        return { valid: false, error: 'Token expiré' };
      }
      
      return { valid: true };
    } catch (error) {
      console.error('Erreur validation token:', error);
      return { 
        valid: false, 
        error: error.message || 'Erreur de validation' 
      };
    }
  }

  /**
   * Envoie les identifiants par email
   */
  async sendCredentialsByEmail(userEmail, userName, temporaryPassword) {
    try {
      // En production, intégrer avec un service d'email (SendGrid, AWS SES, etc.)
      const emailContent = this.generateCredentialsEmail(userName, userEmail, temporaryPassword);
      
      // Simulation d'envoi d'email
      console.log('Email des identifiants:', emailContent);
      
      // Ici, on intégrerait le service d'email réel
      // await emailService.send({
      //   to: userEmail,
      //   subject: emailContent.subject,
      //   html: emailContent.html,
      //   text: emailContent.text
      // });

      return { 
        success: true, 
        message: 'Identifiants envoyés par email (simulation)' 
      };
    } catch (error) {
      console.error('Erreur envoi identifiants:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur lors de l\'envoi des identifiants' 
      };
    }
  }

  /**
   * Génère le contenu de l'email avec les identifiants
   */
  generateCredentialsEmail(userName, userEmail, temporaryPassword) {
    const subject = 'Vos identifiants EduTrack CM';
    
    const text = `
Bonjour ${userName},

Votre compte EduTrack CM a été créé avec succès.

Vos identifiants de connexion :
- Email : ${userEmail}
- Mot de passe temporaire : ${temporaryPassword}

IMPORTANT : 
- Changez votre mot de passe lors de votre première connexion
- Ne partagez jamais vos identifiants
- Connectez-vous sur : ${window.location.origin}/production-login

Cordialement,
L'équipe EduTrack CM
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    .credentials { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 20px 0; }
    .credential-item { margin: 10px 0; }
    .label { font-weight: bold; color: #374151; }
    .value { color: #1f2937; font-family: monospace; background: #e5e7eb; padding: 4px 8px; border-radius: 4px; }
    .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0; }
    .warning-title { font-weight: bold; color: #92400e; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🎓 EduTrack CM</div>
      <h1>Bienvenue ${userName} !</h1>
      <p>Votre compte a été créé avec succès</p>
    </div>

    <div class="credentials">
      <h3>Vos identifiants de connexion :</h3>
      <div class="credential-item">
        <span class="label">Email :</span>
        <span class="value">${userEmail}</span>
      </div>
      <div class="credential-item">
        <span class="label">Mot de passe temporaire :</span>
        <span class="value">${temporaryPassword}</span>
      </div>
    </div>

    <div class="warning">
      <div class="warning-title">⚠️ Important :</div>
      <ul>
        <li>Changez votre mot de passe lors de votre première connexion</li>
        <li>Ne partagez jamais vos identifiants avec personne</li>
        <li>Déconnectez-vous après chaque session</li>
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="${window.location.origin}/production-login" class="button">
        Se connecter maintenant
      </a>
    </div>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
      <p>© ${new Date().getFullYear()} EduTrack CM - Système de gestion scolaire</p>
    </div>
  </div>
</body>
</html>
    `;

    return { subject, text, html };
  }
}

export default new PasswordService();