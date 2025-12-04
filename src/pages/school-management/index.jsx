import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/AppIcon';
import SchoolRegistrationForm from './components/SchoolRegistrationForm';
import TestForm from './components/TestForm';
import WorkingSchoolRegistrationForm from './components/MinimalTest';
import SchoolLoginForm from './components/SchoolLoginForm';
import DatabaseDiagnostic from './components/DatabaseDiagnostic';

const SchoolManagement = () => {
  const [mode, setMode] = useState('login'); // 'login', 'register', or 'diagnostic'
  const navigate = useNavigate();
  const location = useLocation();

  // Gérer les tokens d'authentification dans l'URL (confirmation email)
  useEffect(() => {
    const handleAuthRedirect = async () => {
      const hash = location.hash;
      if (hash && hash.includes('access_token')) {
        try {
          // Extraire les paramètres du hash
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const type = params.get('type');

          if (accessToken && type === 'signup') {
            // Confirmation d'inscription réussie
            console.log('✅ Confirmation d\'inscription réussie');
            
            // Nettoyer l'URL
            window.history.replaceState({}, document.title, '/');
            
            // Afficher message de succès et passer en mode login
            alert('🎉 Votre compte a été confirmé avec succès ! Vous pouvez maintenant vous connecter.');
            setMode('login');
          }
        } catch (error) {
          console.error('Erreur lors de la gestion de la redirection auth:', error);
        }
      }
    };

    handleAuthRedirect();
  }, [location]);

  const handleLoginSuccess = (schoolData) => {
    console.log('🎉 Connexion réussie, redirection vers le dashboard...');
    // Navigate to principal dashboard with school data
    // Petit délai pour laisser l'AuthContext se mettre à jour
    setTimeout(() => {
      navigate('/principal-dashboard', { state: { school: schoolData }, replace: true }); 
    }, 100);
  };

  const handleRegistrationSuccess = () => {
    // Show success message and switch to login || <Icon name="School" size={64} className="mb-8" />
    alert('Inscription réussie ! Veuillez attendre la validation de votre compte par l\'administrateur.');
    setMode('login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-secondary p-12 sticky top-0 h-screen overflow-auto">
        <div className="max-w-xl text-white flex flex-col justify-center">
          <img
                src="/assets/images/mon_logo.png"
                alt="Logo EduTrack CM"
                className="w-20 h-20 object-contain rounded-2xl shadow-lg"
            />
          <h1 className="text-4xl font-heading font-heading-bold mb-6">
            Bienvenue sur EduTrack CM
          </h1>
          <p className="text-lg text-white/90 mb-8">
            Gérez votre établissement efficacement avec notre plateforme complète de gestion scolaire.
            Simplifiez l'administration, le suivi des élèves et la communication avec les parents.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <Icon name="Users" size={24} className="mb-2" />
              <h3 className="font-heading font-heading-semibold mb-2">Gestion des effectifs</h3>
              <p className="text-sm text-white/80">Suivez vos élèves, enseignants et personnel administratif</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Icon name="BarChart2" size={24} className="mb-2" />
              <h3 className="font-heading font-heading-semibold mb-2">Analyses détaillées</h3>
              <p className="text-sm text-white/80">Statistiques et rapports en temps réel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-start justify-center p-4 sm:p-6 lg:p-8 min-h-screen overflow-auto py-8 lg:py-12">
        <div className={`w-full ${mode === 'register' ? 'max-w-4xl' : 'max-w-md'}`}>
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-heading font-heading-bold text-foreground mb-2">
              {mode === 'login' ? 'Connexion Direction' : 'Inscription Établissement'}
            </h2>
            <p className="text-muted-foreground">
              {mode === 'login' 
                ? 'Accédez à votre espace de gestion' 
                : 'Créez un compte pour votre établissement'}
            </p>
          </div>

          {/* Form */}
          <div className="bg-card rounded-lg border border-border p-6 shadow-card">
            {mode === 'login' ? (
              <SchoolLoginForm onSuccess={handleLoginSuccess} />
            ) : mode === 'register' ? (
              <WorkingSchoolRegistrationForm onSuccess={handleRegistrationSuccess} />
            ) : (
              <DatabaseDiagnostic />
            )}
          </div>

          {/* Switch Mode */}
          <div className="text-center mt-6">
            <p className="text-muted-foreground">
              {mode === 'login' ? (
                <>
                  Vous n'avez pas de compte ?{' '}
                  <button 
                    onClick={() => setMode('register')}
                    className="text-primary hover:underline font-body font-body-semibold"
                  >
                    Inscrire votre établissement
                  </button>
                  {' | '}
                  <button 
                    onClick={() => setMode('diagnostic')}
                    className="text-orange-600 hover:underline font-body font-body-semibold"
                  >
                    🔍 Diagnostic
                  </button>
                </>
              ) : mode === 'register' ? (
                <>
                  Déjà inscrit ?{' '}
                  <button 
                    onClick={() => setMode('login')}
                    className="text-primary hover:underline font-body font-body-semibold"
                  >
                    Se connecter
                  </button>
                  {' | '}
                  <button 
                    onClick={() => setMode('diagnostic')}
                    className="text-orange-600 hover:underline font-body font-body-semibold"
                  >
                    🔍 Diagnostic
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setMode('login')}
                    className="text-primary hover:underline font-body font-body-semibold"
                  >
                    ← Retour à la connexion
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="fixed top-4 right-4 flex gap-2">
            <Link 
              to="/staff-login"
              className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-full font-body font-body-semibold inline-flex items-center gap-2 transition-colors"
            >
              <Icon name="Users" size={16} />
              Personnel
            </Link>
            <Link 
              to="/demo"
              className="bg-secondary/10 hover:bg-secondary/20 text-secondary px-4 py-2 rounded-full font-body font-body-semibold inline-flex items-center gap-2 transition-colors"
            >
              <Icon name="Laptop" size={16} />
              Démo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolManagement;