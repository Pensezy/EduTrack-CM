import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        console.log('🔍 === DEBUT CONFIRMATION EMAIL ===');
        console.log('URL complète:', window.location.href);
        console.log('Hash:', window.location.hash);
        
        // Récupérer les paramètres de l'URL (hash ou search)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);
        
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
        const type = hashParams.get('type') || searchParams.get('type');
        const error_code = hashParams.get('error_code') || searchParams.get('error_code');
        const error_description = hashParams.get('error_description') || searchParams.get('error_description');

        console.log('Type:', type);
        console.log('Access token présent:', !!accessToken);
        console.log('Error code:', error_code);

        // Gérer les erreurs de Supabase
        if (error_code) {
          throw new Error(error_description || 'Erreur de confirmation');
        }

        // Vérifier que c'est bien une confirmation de signup
        if (type === 'signup' && accessToken) {
          console.log('✅ Type signup détecté, configuration de la session...');

          // Établir la session avec les tokens
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) throw sessionError;

          console.log('✅ Session établie pour:', sessionData.user?.email);
          console.log('User ID:', sessionData.user?.id);

          // Récupérer le rôle de l'utilisateur depuis la table users
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role, full_name, current_school_id')
            .eq('id', sessionData.user.id)
            .single();

          if (userError) {
            console.warn('⚠️ Impossible de récupérer le rôle:', userError);
            // Utiliser le rôle par défaut depuis les métadonnées
            const role = sessionData.user.user_metadata?.role || 'student';
            redirectByRole(role);
            return;
          }

          console.log('✅ Utilisateur trouvé:', userData.full_name, '- Rôle:', userData.role);

          // Rediriger selon le rôle
          redirectByRole(userData.role);
        } else {
          console.error('❌ Type invalide ou token manquant');
          setError('Lien de confirmation invalide ou expiré');
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la confirmation:', error);
        setError(error.message || 'Une erreur est survenue lors de la confirmation de votre compte');
        setLoading(false);
      }
    };

    const redirectByRole = (role) => {
      console.log('🔀 Redirection vers le dashboard:', role);
      
      switch(role) {
        case 'principal':
          navigate('/principal-dashboard', { replace: true });
          break;
        case 'teacher':
          navigate('/teacher-dashboard', { replace: true });
          break;
        case 'student':
          navigate('/student-dashboard', { replace: true });
          break;
        case 'parent':
          navigate('/parent-dashboard', { replace: true });
          break;
        case 'secretary':
          navigate('/secretary-dashboard', { replace: true });
          break;
        case 'admin':
          navigate('/admin-dashboard', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmation en cours...</h2>
          <p className="text-gray-600">
            Nous confirmons votre adresse email et préparons votre espace de travail
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
        <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl p-8">
          <div className="text-center">
            <div className="mb-4">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de Confirmation</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            
            <div className="space-y-3">
              <a
                href="/"
                className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Retour à l'accueil
              </a>
              <p className="text-sm text-gray-500">
                Si le problème persiste, contactez le support à{' '}
                <a href="mailto:pensezy.si@gmail.com" className="text-blue-600 hover:underline">
                  pensezy.si@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
