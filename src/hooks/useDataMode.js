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
            // Requête optimisée : une seule requête directe sans logs verbeux
            const { data: schoolData, error: schoolError } = await supabase
              .from('schools')
              .select(`
                *,
                users!director_user_id(
                  id,
                  email,
                  full_name,
                  phone,
                  role
                )
              `)
              .eq('director_user_id', user.id)
              .single();

            if (schoolData && !schoolError) {
              // École trouvée = mode production
              console.log('✅ Mode PRODUCTION:', schoolData.name);
              
              const userData = { 
                ...user, 
                schoolData: { 
                  ...schoolData, 
                  director_id: user.id,
                  user_id: user.id
                }
              };
              
              setUser(userData);
              setDataMode('production');
              
              // Mettre en cache
              modeCache = { dataMode: 'production', user: userData };
              cacheTimestamp = Date.now();
              
            } else {
              // Pas d'école = mode démo
              console.log('🔄 Mode DÉMO activé');
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