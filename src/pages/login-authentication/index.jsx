import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AppLogo from './components/AppLogo';
import LanguageToggle from './components/LanguageToggle';
import AccessibilityToggle from './components/AccessibilityToggle';
import ErrorMessage from './components/ErrorMessage';

const LoginAuthentication = () => {
  const navigate = useNavigate();
  const { error, setError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Utiliser les comptes de démo définis dans AuthContext
  const demoAccountsList = [
    {
      id: 'demo-admin',
      email: 'admin@demo.com',
      full_name: 'Admin Demo',
      role: 'admin',
      phone: null
    },
    {
      id: 'demo-principal',
      email: 'principal@demo.com',
      full_name: 'Principal Demo',
      role: 'principal',
      phone: null
    },
    {
      id: 'demo-secretary',
      email: 'secretary@demo.com',
      full_name: 'Secretary Demo',
      role: 'secretary',
      phone: null
    },
    {
      id: 'demo-teacher',
      email: 'teacher@demo.com',
      full_name: 'Teacher Demo',
      role: 'teacher',
      phone: null
    },
    {
      id: 'demo-student',
      email: 'student@demo.com',
      full_name: 'Student Demo',
      role: 'student',
      phone: null
    },
    {
      id: 'demo-parent',
      email: 'parent@demo.com',
      full_name: 'Parent Demo',
      role: 'parent',
      phone: null
    }
  ];

  useEffect(() => {
    // Clear any existing session
    localStorage.removeItem('edutrack-user');
    localStorage.removeItem('edutrack-session');
    setError(null);
  }, [setError]);

  const handleDemoAccountClick = async (account) => {
    setError(null);
    setIsLoading(true);

    try {
      // Créer directement la session avec les informations du compte démo
      localStorage.setItem('edutrack-user', JSON.stringify({
        id: account.id,
        role: account.role,
        name: account.full_name,
        loginTime: new Date().toISOString(),
        sessionId: Math.random().toString(36).substr(2, 9),
        demoAccount: true
      }));

      // Redirection vers le dashboard approprié
      const roleRoutes = {
        parent: '/parent-dashboard',
        student: '/student-dashboard',
        secretary: '/secretary-dashboard',
        principal: '/principal-dashboard',
        teacher: '/teacher-dashboard',
        admin: '/admin-dashboard'
      };

      const route = roleRoutes[account.role] || '/student-dashboard';
      navigate(route);
    } catch (error) {
      setError('Erreur lors de la connexion avec le compte de démonstration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissError = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Controls */}
      <div className="absolute top-4 left-4 flex items-center space-x-4 z-10">
        <Link 
          to="/"
          className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-body-medium inline-flex items-center gap-2 hover:bg-primary/20 transition-colors"
        >
          <span className="text-base">←</span>
          Retour direction
        </Link>
      </div>
      <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
        <LanguageToggle />
        <AccessibilityToggle />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* App Logo and Demo Title */}
        <div className="text-center mb-8">
          <AppLogo className="mb-4 w-32 mx-auto" />
          <h1 className="text-2xl font-heading font-heading-bold text-foreground mb-3">
            Mode Démonstration
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Explorez toutes les fonctionnalités d'EduTrack CM avec nos comptes de démonstration.
            Chaque compte vous donne accès à un rôle différent dans l'écosystème scolaire.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <ErrorMessage
            message={error}
            type="error"
            onDismiss={handleDismissError}
            className="animate-in slide-in-from-top-2 duration-300 max-w-2xl mx-auto mb-8"
          />
        )}

        {/* Demo Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {demoAccountsList.map((account, index) => (
            <div
              key={index}
              onClick={() => handleDemoAccountClick(account)}
              className="bg-card border border-border rounded-xl p-6 hover:bg-accent/5 transition-colors cursor-pointer group"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary text-base font-heading font-heading-semibold">
                    {account.full_name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-heading font-heading-semibold text-foreground group-hover:text-primary">
                    {account.role === 'parent' ? 'Parent' : 
                     account.role === 'student' ? 'Étudiant' :
                     account.role === 'teacher' ? 'Enseignant' :
                     account.role === 'secretary' ? 'Secrétaire' :
                     account.role === 'principal' ? 'Proviseur' :
                     account.role === 'admin' ? 'Administrateur' : account.role}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {account.full_name}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Email:</strong> {account.email}</p>
                <p><strong>Code PIN:</strong> 123456</p>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-center text-primary font-body-medium group-hover:text-primary/80">
                  Cliquer pour tester ce compte →
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Demo Description Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h3 className="font-heading font-heading-semibold text-sm text-primary mb-2">
              À propos du mode démonstration
            </h3>
            <p className="text-sm text-muted-foreground">
              Ce mode vous permet d'explorer toutes les fonctionnalités d'EduTrack CM 
              avec des données fictives. Chaque compte démo donne accès à une interface 
              différente selon le rôle, vous permettant de comprendre comment le système 
              s'adapte aux besoins de chaque utilisateur.
            </p>
          </div>

          <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4">
            <h3 className="font-heading font-heading-semibold text-sm text-secondary mb-2">
              Données de test
            </h3>
            <p className="text-sm text-muted-foreground">
              Les données présentées sont purement fictives et sont réinitialisées 
              régulièrement. Vous pouvez tester toutes les fonctionnalités sans 
              crainte, car aucune modification ne sera permanente.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="font-caption text-sm text-muted-foreground">
            © {new Date().getFullYear()} EduTrack CM • Version de démonstration
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LoginAuthentication;