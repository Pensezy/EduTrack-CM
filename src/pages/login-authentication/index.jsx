import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AppLogo from './components/AppLogo';
import NumericKeypad from './components/NumericKeypad';
import AlternativeAuth from './components/AlternativeAuth';
import LanguageToggle from './components/LanguageToggle';
import AccessibilityToggle from './components/AccessibilityToggle';
import ErrorMessage from './components/ErrorMessage';

const LoginAuthentication = () => {
  const navigate = useNavigate();
  const { signInWithPin, signInWithPhone, error, setError, loading } = useAuth();
  const [pin, setPin] = useState('');
  const [identifier, setIdentifier] = useState(''); // email ou téléphone
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState('pin');
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);

  // Comptes de démo dynamiques depuis Supabase
  const [demoAccounts, setDemoAccounts] = useState([]);
  useEffect(() => {
    const fetchDemoAccounts = async () => {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .in('role', ['parent', 'student', 'teacher', 'secretary', 'principal', 'admin']);
      if (!error && data) {
        setDemoAccounts(data);
      }
    };
    fetchDemoAccounts();
  }, []);

  useEffect(() => {
    // Clear any existing session
    localStorage.removeItem('edutrack-user');
    localStorage.removeItem('edutrack-session');
    setError(null);
  }, [setError]);

  const handlePinSubmit = async () => {
    if (!identifier || identifier.length < 3) {
      setError('Veuillez saisir votre email ou téléphone');
      return;
    }
    if (pin?.length < 6) {
      setError('Le code PIN doit contenir 6 chiffres');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithPin(pin, identifier);
      if (result?.user && !result?.error) {
        localStorage.setItem('edutrack-user', JSON.stringify({
          id: result?.user?.id,
          role: result?.user?.role,
          name: result?.user?.full_name,
          loginTime: new Date()?.toISOString(),
          sessionId: Math.random()?.toString(36)?.substr(2, 9)
        }));
        // Redirection spécifique selon le rôle
        const roleRoutes = {
          'student': '/student-dashboard',
          'teacher': '/teacher-dashboard',
          'parent': '/parent-dashboard',
          'secretary': '/secretary-dashboard',
          'principal': '/principal-dashboard',
          'admin': '/admin-dashboard'
        };
        const route = roleRoutes[result.user.role] || '/';
        navigate(route);
      }
    } catch (error) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleQRScan = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock QR code authentication - simulate with demo student account
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await signInWithPin('1234'); // Demo student PIN
      
      if (result?.user && !result?.error) {
        localStorage.setItem('edutrack-user', JSON.stringify({
          id: result?.user?.id,
          role: result?.user?.role,
          name: result?.user?.full_name,
          loginTime: new Date()?.toISOString(),
          sessionId: Math.random()?.toString(36)?.substr(2, 9),
          authMethod: 'qr'
        }));

        navigate('/student-dashboard');
      }
    } catch (error) {
      setError('Échec de l\'authentification par QR code. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometric = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock biometric authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await signInWithPin('1234'); // Demo student PIN
      
      if (result?.user && !result?.error) {
        localStorage.setItem('edutrack-user', JSON.stringify({
          id: result?.user?.id,
          role: result?.user?.role,
          name: result?.user?.full_name,
          loginTime: new Date()?.toISOString(),
          sessionId: Math.random()?.toString(36)?.substr(2, 9),
          authMethod: 'biometric'
        }));

        navigate('/student-dashboard');
      }
    } catch (error) {
      setError('Échec de l\'authentification biométrique. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissError = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Header Controls */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
        <LanguageToggle />
        <AccessibilityToggle />
      </div>

      {/* Main Login Section */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md space-y-8">
          {/* App Logo */}
          <AppLogo className="text-center" />

          {/* Error Message */}
          {error && (
            <ErrorMessage
              message={error}
              type="error"
              onDismiss={handleDismissError}
              className="animate-in slide-in-from-top-2 duration-300"
            />
          )}

          {/* Authentication Methods */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
            {authMethod === 'pin' && (
              <>
                {/* Champ identifiant (email ou téléphone) */}
                <div className="mb-4">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Email ou téléphone"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    disabled={isLoading || loading}
                  />
                </div>
                <NumericKeypad
                  pin={pin}
                  onPinChange={setPin}
                  onSubmit={handlePinSubmit}
                  isLoading={isLoading || loading}
                />
              </>
            )}
          </div>

          {/* Alternative Authentication */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
            <AlternativeAuth
              onQRScan={handleQRScan}
              onBiometric={handleBiometric}
              isLoading={isLoading || loading}
            />
          </div>
        </div>
      </div>

      {/* Demo Accounts Section */}
      {showDemoAccounts && (
        <div className="lg:w-96 bg-muted/30 border-l border-border p-6 overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">
                Comptes de démonstration
              </h3>
              <button
                onClick={() => setShowDemoAccounts(false)}
                className="text-muted-foreground hover:text-card-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {demoAccounts?.map((account, index) => (
                <div
                  key={index}
                  onClick={() => handleDemoAccountClick(account)}
                  className="bg-card border border-border rounded-xl p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-heading font-heading-semibold">
                        {account?.name?.split(' ')?.map(n => n?.[0])?.join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-body font-body-semibold text-sm text-card-foreground group-hover:text-primary">
                        {account?.full_name || account?.name}
                      </h4>
                      <p className="text-xs text-muted-foreground capitalize mb-2">
                        {account?.role === 'parent' ? 'Parent' : 
                         account?.role === 'student' ? 'Étudiant' : account?.role}
                      </p>
                      {account?.email && (
                        <p className="text-xs text-muted-foreground">
                          <strong>Email:</strong> {account.email}
                        </p>
                      )}
                      {account?.phone && (
                        <p className="text-xs text-muted-foreground">
                          <strong>Téléphone:</strong> {account.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-center text-muted-foreground group-hover:text-primary">
                      Cliquer pour se connecter
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Demo Info */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h4 className="font-body font-body-semibold text-sm text-primary mb-2">
                Mode Démonstration
              </h4>
              <p className="text-xs text-muted-foreground">
                Ces comptes utilisent de vraies données de la base Supabase pour démontrer 
                toutes les fonctionnalités d'EduTrack CM.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="lg:absolute lg:bottom-0 lg:left-0 lg:right-0 text-center p-4 border-t border-border bg-card lg:bg-transparent lg:border-0">
        <p className="font-caption font-caption-normal text-xs text-muted-foreground">
          © {new Date()?.getFullYear()} EduTrack CM. Tous droits réservés.
        </p>
        <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-1">
          Plateforme sécurisée avec données réelles Supabase
        </p>
      </footer>
    </div>
  );
};

export default LoginAuthentication;