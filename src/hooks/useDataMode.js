import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Cache pour éviter les requêtes répétées
let modeCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60000; // 1 minute de cache

/**
 * Hook personnalisé pour détecter le mode de données
 * - DEMO: Utilisateur non connecté ou compte de démonstration
 * - PRODUCTION: Utilisateur connecté avec un vrai compte Supabase
 */
export const useDataMode = () => {
  const [dataMode, setDataMode] = useState('demo'); // 'demo' | 'production'
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    const checkDataMode = async () => {
      try {
        setIsLoading(true);
        
        // Vérifier le cache d'abord
        const now = Date.now();
        if (modeCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
          console.log('🚀 Utilisation du cache de mode');
          setDataMode(modeCache.dataMode);
          setUser(modeCache.user);
          setIsLoading(false);
          return;
        }
        
        // Vérifier si un utilisateur est connecté
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!mounted) return;

        if (error) {
          console.log('Erreur lors de la vérification de l\'utilisateur:', error.message);
          setDataMode('demo');
          setUser(null);
          return;
        }

        if (!user) {
          // Pas d'utilisateur connecté = mode démo
          setDataMode('demo');
          setUser(null);
          
          // Mettre en cache
          modeCache = { dataMode: 'demo', user: null };
          cacheTimestamp = Date.now();
        } else {
          // Vérifier si c'est un compte démo ou un vrai compte
          const isDemoAccount = user.email?.includes('demo@') || 
                               user.email?.includes('test@') || 
                               user.user_metadata?.demo === true;

          if (isDemoAccount) {
            setDataMode('demo');
            setUser(user);
            
            // Mettre en cache
            modeCache = { dataMode: 'demo', user: user };
            cacheTimestamp = Date.now();
          } else {
            // Récupérer les données utilisateur depuis la table users
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select(`
                id,
                email,
                full_name,
                role,
                phone,
                current_school_id,
                is_active,
                school:schools!users_current_school_id_fkey(
                  id,
                  name,
                  code,
                  type
                )
              `)
              .eq('id', user.id)
              .single();

            if (userError || !userData) {
              console.log('⚠️ Utilisateur non trouvé dans la table users, mode DÉMO activé');
              setDataMode('demo');
              setUser(user);
              
              // Mettre en cache
              modeCache = { dataMode: 'demo', user: user };
              cacheTimestamp = Date.now();
              return;
            }

            // Si l'utilisateur a une école associée = mode production
            if (userData.current_school_id && userData.school) {
              console.log('✅ Mode PRODUCTION:', userData.school.name, '- Rôle:', userData.role);
              
              const enrichedUser = { 
                ...user,
                ...userData,
                schoolData: userData.school,
                school_id: userData.current_school_id,
                school_name: userData.school.name
              };
              
              setUser(enrichedUser);
              setDataMode('production');
              
              // Mettre en cache
              modeCache = { dataMode: 'production', user: enrichedUser };
              cacheTimestamp = Date.now();
              
            } else {
              // Pas d'école associée = mode démo
              console.log('🔄 Mode DÉMO activé (pas d\'école associée)');
              setDataMode('demo');
              setUser(user);
              
              // Mettre en cache
              modeCache = { dataMode: 'demo', user: user };
              cacheTimestamp = Date.now();
            }
          }
          
          setUser(user);
        }
      } catch (error) {
        console.error('Erreur lors de la détection du mode de données:', error);
        if (mounted) {
          setDataMode('demo');
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        checkDataMode();
      }
    });

    // Vérification initiale
    checkDataMode();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return {
    dataMode,
    isProduction: dataMode === 'production',
    isDemo: dataMode === 'demo',
    isLoading,
    user,
    // Fonction utilitaire pour forcer le mode (utile pour les tests)
    setMode: (mode) => setDataMode(mode),
    // Fonction pour vider le cache et forcer la re-détection
    clearCache: () => {
      modeCache = null;
      cacheTimestamp = null;
      checkDataMode();
    }
  };
};

export default useDataMode;