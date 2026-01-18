/**
 * Gestionnaire de sessions multi-utilisateurs
 * Permet de gérer plusieurs sessions simultanées sur la même machine
 */

export const SessionManager = {
  /**
   * Liste toutes les sessions actives
   */
  getAllSessions: () => {
    const sessions = {};
    const roles = ['principal', 'teacher', 'student', 'parent', 'secretary'];
    
    roles.forEach(role => {
      const sessionKey = `edutrack-session-${role}`;
      const sessionData = localStorage.getItem(sessionKey);
      if (sessionData) {
        try {
          sessions[role] = JSON.parse(sessionData);
        } catch (e) {
          console.error(`Erreur parsing session ${role}:`, e);
        }
      }
    });
    
    return sessions;
  },

  /**
   * Obtenir une session spécifique par rôle
   */
  getSessionByRole: (role) => {
    const sessionKey = `edutrack-session-${role}`;
    const sessionData = localStorage.getItem(sessionKey);
    
    if (sessionData) {
      try {
        return JSON.parse(sessionData);
      } catch (e) {
        console.error(`Erreur parsing session ${role}:`, e);
        return null;
      }
    }
    
    return null;
  },

  /**
   * Sauvegarder une session
   */
  saveSession: (role, userData) => {
    const sessionKey = `edutrack-session-${role}`;
    localStorage.setItem(sessionKey, JSON.stringify(userData));
    localStorage.setItem('edutrack-user', JSON.stringify(userData)); // Compatibilité
    
    // Dispatcher l'événement
    window.dispatchEvent(new CustomEvent('edutrack-user-changed', { 
      detail: { 
        user: userData, 
        role,
        sessionKey 
      } 
    }));
    
    console.log(`✅ Session ${role} sauvegardée:`, userData.email);
  },

  /**
   * Supprimer une session spécifique
   */
  clearSession: (role) => {
    const sessionKey = `edutrack-session-${role}`;
    localStorage.removeItem(sessionKey);
    console.log(`🗑️ Session ${role} supprimée`);
  },

  /**
   * Supprimer toutes les sessions
   */
  clearAllSessions: () => {
    const roles = ['principal', 'teacher', 'student', 'parent', 'secretary'];
    roles.forEach(role => {
      const sessionKey = `edutrack-session-${role}`;
      localStorage.removeItem(sessionKey);
    });
    localStorage.removeItem('edutrack-user');
    console.log('🗑️ Toutes les sessions supprimées');
  },

  /**
   * Obtenir un résumé de toutes les sessions
   */
  getSessionsSummary: () => {
    const sessions = SessionManager.getAllSessions();
    const summary = {};
    
    Object.keys(sessions).forEach(role => {
      summary[role] = {
        email: sessions[role].email,
        full_name: sessions[role].full_name,
        school_name: sessions[role].school_name || 'N/A'
      };
    });
    
    return summary;
  },

  /**
   * Debug: afficher toutes les sessions dans la console
   */
  debugSessions: () => {
    console.log('📊 Sessions actives:');
    const sessions = SessionManager.getAllSessions();
    Object.keys(sessions).forEach(role => {
      console.log(`  ${role}:`, sessions[role].email);
    });
    console.log('Total:', Object.keys(sessions).length, 'sessions');
  }
};

export default SessionManager;
