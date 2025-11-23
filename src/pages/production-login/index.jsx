import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDataMode } from '../../hooks/useDataMode';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ProductionLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDemo } = useDataMode();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Ici, on intégrerait l'authentification réelle avec Supabase
      // Pour la simulation, on crée des comptes fictifs
      const success = await simulateLogin(formData.email, formData.password);
      
      if (success) {
        // Determiner le type d'utilisateur basé sur l'email
        const userType = getUserTypeFromEmail(formData.email);
        const userData = {
          id: Date.now(),
          email: formData.email,
          name: getNameFromEmail(formData.email),
          role: userType,
          avatar: getAvatarFromRole(userType)
        };
        
        login(userData);
        navigate(getRouteFromRole(userType));
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonctions utilitaires pour la simulation
  const simulateLogin = async (email, password) => {
    // Simulation d'appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Comptes de test (en production, ceci serait géré par Supabase)
    const validAccounts = [
      { email: 'admin@edutrack.cm', password: 'admin123', role: 'admin' },
      { email: 'directeur@edutrack.cm', password: 'dir123', role: 'principal' },
      { email: 'secretaire@edutrack.cm', password: 'sec123', role: 'secretary' },
      { email: 'enseignant@edutrack.cm', password: 'prof123', role: 'teacher' },
      { email: 'parent@edutrack.cm', password: 'parent123', role: 'parent' },
      { email: 'eleve@edutrack.cm', password: 'eleve123', role: 'student' }
    ];
    
    return validAccounts.some(account => 
      account.email === email && account.password === password
    );
  };

  const getUserTypeFromEmail = (email) => {
    if (email.includes('admin')) return 'admin';
    if (email.includes('directeur')) return 'principal';
    if (email.includes('secretaire')) return 'secretary';
    if (email.includes('enseignant')) return 'teacher';
    if (email.includes('parent')) return 'parent';
    if (email.includes('eleve')) return 'student';
    return 'student';
  };

  const getNameFromEmail = (email) => {
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const getAvatarFromRole = (role) => {
    const avatars = {
      admin: '👨‍💼',
      principal: '🎓',
      secretary: '📋',
      teacher: '👩‍🏫',
      parent: '👨‍👩‍👧‍👦',
      student: '🎒'
    };
    return avatars[role] || '👤';
  };

  const getRouteFromRole = (role) => {
    const routes = {
      admin: '/admin-dashboard',
      principal: '/principal-dashboard',
      secretary: '/secretary-dashboard',
      teacher: '/teacher-dashboard',
      parent: '/parent-dashboard',
      student: '/student-dashboard'
    };
    return routes[role] || '/student-dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Icon name="GraduationCap" size={32} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EduTrack CM</h1>
          <p className="text-gray-600">Connexion à votre espace</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <Icon name="AlertCircle" size={20} className="text-red-600 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Erreur de connexion</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Adresse email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="votre.email@exemple.com"
              icon="Mail"
              required
            />

            <div className="relative">
              <Input
                label="Mot de passe"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••••••"
                icon="Lock"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 focus:outline-none"
                tabIndex={-1}
              >
                <Icon name={showPassword ? "EyeOff" : "Eye"} size={20} />
              </button>
            </div>

            <Button
              type="submit"
              loading={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!formData.email || !formData.password}
            >
              <Icon name="LogIn" size={16} className="mr-2" />
              Se connecter
            </Button>
          </form>

          {/* Password Recovery Link */}
          <div className="mt-6 text-center">
            <Link
              to="/password-recovery"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center justify-center"
            >
              <Icon name="HelpCircle" size={16} className="mr-2" />
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Demo Mode Link */}
          {!isDemo && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link
                to="/demo"
                className="text-sm text-gray-600 hover:text-gray-700 hover:underline flex items-center justify-center"
              >
                <Icon name="Play" size={16} className="mr-2" />
                Découvrir la démonstration
              </Link>
            </div>
          )}
        </div>

        {/* Test Accounts Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Comptes de test disponibles</h3>
              <div className="text-sm text-blue-700 mt-2 space-y-1">
                <div><strong>Admin:</strong> admin@edutrack.cm / admin123</div>
                <div><strong>Directeur:</strong> directeur@edutrack.cm / dir123</div>
                <div><strong>Secrétaire:</strong> secretaire@edutrack.cm / sec123</div>
                <div><strong>Enseignant:</strong> enseignant@edutrack.cm / prof123</div>
                <div><strong>Parent:</strong> parent@edutrack.cm / parent123</div>
                <div><strong>Élève:</strong> eleve@edutrack.cm / eleve123</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} EduTrack CM • Système de gestion scolaire
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ProductionLogin;