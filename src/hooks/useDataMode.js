import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
        } else {
          // Vérifier si c'est un compte démo ou un vrai compte
          const isDemoAccount = user.email?.includes('demo@') || 
                               user.email?.includes('test@') || 
                               user.user_metadata?.demo === true;

          if (isDemoAccount) {
            setDataMode('demo');
          } else {
            // Vérifier si l'utilisateur existe dans notre base de données
            const { data: dbUser, error: dbError } = await supabase
              .from('users')
              .select('id, email, role, created_at')
              .eq('email', user.email)
              .single();

            if (dbUser && !dbError) {
              setDataMode('production');
            } else {
              // Utilisateur authentifié mais pas dans notre DB = mode démo
              setDataMode('demo');
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
    setMode: (mode) => setDataMode(mode)
  };
};

export default useDataMode;