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
        
        // PRIORITÉ 1 : Vérifier localStorage (pour les comptes personnel avec EmailJS)
        const savedUser = localStorage.getItem('edutrack-user');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            console.log('✅ Utilisateur trouvé dans localStorage:', userData.email);
            
            if (!userData.demoAccount) {
              // C'est un vrai compte production
              console.log('✅ Mode PRODUCTION (localStorage):', userData.school_name || 'École');
              setDataMode('production');
              setUser(userData);
              modeCache = { dataMode: 'production', user: userData };
              cacheTimestamp = Date.now();
              setIsLoading(false);
              return;
            } else {
              // Compte démo
              console.log('🎭 Mode DÉMO (localStorage)');
              setDataMode('demo');
              setUser(userData);
              modeCache = { dataMode: 'demo', user: userData };
              cacheTimestamp = Date.now();
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.error('Erreur parsing localStorage:', e);
          }
        }
        
        // PRIORITÉ 2 : Vérifier session Supabase Auth (pour les comptes parents/étudiants/directeurs)
        const { data: { user }, error } = await supabase.auth.getUser();
        
        console.log('🔍 Vérification Supabase Auth:');
        console.log('  - User exists:', !!user);
        console.log('  - Error:', error?.message || 'Aucune');
        if (user) {
          console.log('  - Email:', user.email);
          console.log('  - ID:', user.id);
          console.log('  - Created:', user.created_at);
          console.log('  - Metadata:', user.user_metadata);
        }
        
        if (!mounted) return;

        if (error) {
          console.log('⚠️ Erreur Auth Supabase:', error.message);
          setDataMode('demo');
          setUser(null);
          return;
        }

        if (!user) {
          // Pas d'utilisateur connecté = mode démo
          console.log('❌ Aucun utilisateur Supabase connecté → Mode DÉMO');
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

          console.log('🔍 Vérification compte démo:', {
            email: user.email,
            includesDemo: user.email?.includes('demo@'),
            includesTest: user.email?.includes('test@'),
            metadataDemo: user.user_metadata?.demo,
            isDemoAccount
          });

          if (isDemoAccount) {
            console.log('🎭 Compte identifié comme DÉMO (email contient demo/test)');
            setDataMode('demo');
            setUser(user);
            
            // Mettre en cache
            modeCache = { dataMode: 'demo', user: user };
            cacheTimestamp = Date.now();
          } else {
            console.log('✅ Compte Supabase valide, récupération des données utilisateur...');
            
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
                  type,
                  director_id,
                  address,
                  city,
                  country,
                  status
                )
              `)
              .eq('id', user.id)
              .single();

            console.log('📊 Résultat requête users:', {
              found: !!userData,
              error: userError?.message || 'Aucune',
              role: userData?.role,
              school_id: userData?.current_school_id,
              has_school: !!userData?.school
            });

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
              console.log('✅ Mode PRODUCTION activé:');
              console.log('  - École:', userData.school.name);
              console.log('  - Rôle:', userData.role);
              console.log('  - School ID:', userData.current_school_id);
              console.log('  - Director ID:', userData.school.director_id);
              
              const enrichedUser = { 
                ...user,
                ...userData,
                auth: user, // Garder une référence à l'objet auth Supabase
                dbUser: userData, // Référence aux données de la table users
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