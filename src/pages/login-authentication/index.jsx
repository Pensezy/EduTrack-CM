import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/AppIcon';
import AppLogo from './components/AppLogo';
import LanguageToggle from './components/LanguageToggle';
import AccessibilityToggle from './components/AccessibilityToggle';
import ErrorMessage from './components/ErrorMessage';

const LoginAuthentication = () => {
  const navigate = useNavigate();
  const { error, setError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  
  // Comptes de démonstration simplifiés
  const demoAccounts = [
    { id: 1, name: 'Directeur', role: 'principal', route: '/principal-dashboard', avatar: '👨‍💼' },
    { id: 2, name: 'Enseignant', role: 'teacher', route: '/teacher-dashboard', avatar: '👩‍🏫' },
    { id: 3, name: 'Étudiant', role: 'student', route: '/student-dashboard', avatar: '👨‍🎓' },
    { id: 4, name: 'Parent', role: 'parent', route: '/parent-dashboard', avatar: '👩‍👦' },
    { id: 5, name: 'Secrétaire', role: 'secretary', route: '/secretary-dashboard', avatar: '👩‍💻' },
    { id: 6, name: 'Admin', role: 'admin', route: '/admin-dashboard', avatar: '⚙️' }
  ];

  useEffect(() => {
    // Clear any existing session
    localStorage.removeItem('edutrack-user');
    localStorage.removeItem('edutrack-session');
    setError(null);
  }, [setError]);

  const handleAccountSelect = async (account) => {
    setSelectedAccount(account);
    setError(null);
    setIsLoading(true);
    
    try {
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create demo session
      const userSession = {
        id: account.id,
        role: account.role,
        name: account.name,
        loginTime: new Date().toISOString(),
        sessionId: Math.random().toString(36).substr(2, 9),
        demoAccount: true
      };

      localStorage.setItem('edutrack-user', JSON.stringify(userSession));
      navigate(account.route);
      
    } catch (error) {
      setError('Erreur de connexion. Veuillez réessayer.');
      setIsLoading(false);
    }
  };



  const handleDismissError = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Controls */}
      <div className="absolute top-4 left-4 flex items-center space-x-2 sm:space-x-4 z-10">
        <Link
          to="/"
          className="bg-primary/10 text-primary px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-body-medium inline-flex items-center gap-1 sm:gap-2 hover:bg-primary/20 transition-colors text-xs sm:text-sm"
        >
          <span className="text-sm sm:text-base">←</span>
          <span className="hidden xs:inline">Retour </span>accueil
        </Link>
      </div>
      <div className="absolute top-4 right-4 flex items-center space-x-1 sm:space-x-2 z-10">
        <LanguageToggle />
        <AccessibilityToggle />
      </div>

      <div className="container mx-auto px-4 py-20 sm:py-8 max-w-4xl">
        {/* App Logo and Title */}
        <div className="text-center mb-6 sm:mb-8">
          <AppLogo className="mb-3 sm:mb-4 w-24 sm:w-32 mx-auto" />
          <h1 className="text-2xl sm:text-3xl font-heading font-heading-bold text-foreground mb-2 sm:mb-3">
            Mode Démonstration
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-2">
            Explorez EduTrack CM avec nos comptes de démonstration. Cliquez simplement sur un rôle pour accéder au tableau de bord.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <ErrorMessage 
            message={error} 
            type="error" 
            onDismiss={handleDismissError}
            className="animate-in slide-in-from-top-2 duration-300 max-w-lg mx-auto mb-8"
          />
        )}

        {/* Demo Accounts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {demoAccounts.map((account) => (
            <div
              key={account.id}
              onClick={() => handleAccountSelect(account)}
              className="relative bg-card border border-border rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary hover:bg-primary/5"
            >

              
              <div className="text-center">
                <div className="text-4xl mb-3">{account.avatar}</div>
                <h3 className="text-lg font-heading font-heading-semibold text-foreground mb-1">
                  {account.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Cliquez pour vous connecter
                </p>
                <div className="text-xs text-primary font-medium">
                  {account.route.replace('/', '').replace('-', ' ').toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && selectedAccount && (
          <div className="max-w-md mx-auto">
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <div className="text-center">
                <div className="text-3xl mb-4">{selectedAccount.avatar}</div>
                <h2 className="text-xl font-heading font-heading-semibold text-foreground mb-2">
                  Connexion en cours...
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Chargement du tableau de bord {selectedAccount.name}
                </p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Production Login Link */}
        <div className="mt-6 text-center">
          <div className="bg-white/80 backdrop-blur-sm border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-heading font-semibold text-foreground mb-3">
              Compte personnel ?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Si vous avez un compte avec email et mot de passe personnel
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/production-login"
                className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                <Icon name="LogIn" size={16} className="mr-2" />
                Connexion avec compte
              </Link>
              <Link
                to="/password-recovery"
                className="inline-flex items-center justify-center px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium"
              >
                <Icon name="HelpCircle" size={16} className="mr-2" />
                Mot de passe oublié ?
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="font-caption text-sm text-muted-foreground">
            © {new Date().getFullYear()} EduTrack CM • Système de gestion scolaire
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LoginAuthentication;