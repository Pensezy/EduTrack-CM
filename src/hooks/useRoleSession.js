import { useState, useEffect } from 'react';

/**
 * Hook pour charger la session utilisateur spécifique à un rôle
 * Évite les conflits quand plusieurs comptes sont connectés sur la même machine
 * 
 * @param {string} expectedRole - Le rôle attendu pour cette page ('principal', 'student', 'teacher', 'parent', 'secretary')
 * @returns {object} { user, loading, error }
 */
export const useRoleSession = (expectedRole) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSession = () => {
      try {
        // 1. Essayer de charger la session spécifique au rôle
        const roleSessionKey = `edutrack-session-${expectedRole}`;
        const roleSession = localStorage.getItem(roleSessionKey);
        
        if (roleSession) {
          const sessionData = JSON.parse(roleSession);
          console.log(`✅ Session ${expectedRole} trouvée:`, sessionData.email);
          setUser(sessionData);
          setLoading(false);
          return;
        }
        
        // 2. Fallback : vérifier la session globale
        const globalSession = localStorage.getItem('edutrack-user');
        if (globalSession) {
          const sessionData = JSON.parse(globalSession);
          
          // Vérifier que le rôle correspond
          if (sessionData.role === expectedRole) {
            console.log(`✅ Session globale utilisée pour ${expectedRole}:`, sessionData.email);
            setUser(sessionData);
          } else {
            console.warn(`⚠️ Rôle incompatible. Attendu: ${expectedRole}, Trouvé: ${sessionData.role}`);
            setError(`Session incompatible. Veuillez vous connecter en tant que ${expectedRole}.`);
          }
        } else {
          console.log(`ℹ️ Aucune session trouvée pour ${expectedRole}`);
          setError('Aucune session active');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('❌ Erreur chargement session:', err);
        setError('Erreur de chargement de session');
        setLoading(false);
      }
    };

    loadSession();

    // Écouter les changements de session
    const handleSessionChange = (e) => {
      if (e.detail?.role === expectedRole) {
        console.log(`🔄 Mise à jour session ${expectedRole}`);
        setUser(e.detail.user);
      }
    };

    window.addEventListener('edutrack-user-changed', handleSessionChange);
    return () => window.removeEventListener('edutrack-user-changed', handleSessionChange);
  }, [expectedRole]);

  return { user, loading, error };
};

export default useRoleSession;
