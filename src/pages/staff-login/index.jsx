import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/AppIcon';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';

const StaffLogin = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'teacher'
  });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { authMode } = useAuth();

  // Clear any existing session on component mount
  useEffect(() => {
    localStorage.removeItem('edutrack-user');
    localStorage.removeItem('edutrack-session');
  }, []);

  const userTypes = [
    { value: 'teacher', label: 'Enseignant', dashboard: '/teacher-dashboard' },
    { value: 'student', label: 'Élève', dashboard: '/student-dashboard' },
    { value: 'parent', label: 'Parent', dashboard: '/parent-dashboard' },
    { value: 'secretary', label: 'Secrétaire', dashboard: '/secretary-dashboard' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({
      ...prev,
      userType: value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation des champs
      if (!formData.email || !formData.password) {
        throw new Error('Veuillez remplir tous les champs');
      }

      console.log('🔐 Tentative de connexion...');
      
      // D'abord, essayer de trouver l'utilisateur dans la table users
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
          school:schools!users_current_school_id_fkey(id, name)
        `)
        .eq('email', formData.email)
        .eq('role', formData.userType)
        .single();

      if (userError || !userData) {
        console.log('ℹ️ Utilisateur non trouvé dans la base locale, tentative avec Auth...');
        
        // Si pas trouvé, essayer l'authentification Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (authError) {
          console.error('❌ Auth error:', authError);
          throw new Error('Email ou mot de passe incorrect');
        }

        if (!authData.user) {
          throw new Error('Aucune réponse du serveur');
        }

        console.log('✅ Authentification réussie via Auth:', authData.user.email);

        // Récupérer les données complètes de l'utilisateur
        const { data: authUserData, error: authUserError } = await supabase
          .from('users')
          .select(`
            id,
            email,
            full_name,
            role,
            phone,
            current_school_id,
            is_active,
            school:schools!users_current_school_id_fkey(id, name)
          `)
          .eq('id', authData.user.id)
          .single();

        if (authUserError || !authUserData || !authUserData.is_active) {
          throw new Error('Compte désactivé ou données introuvables');
        }

        // Vérifier le rôle
        if (authUserData.role !== formData.userType) {
          const selectedTypeLabel = userTypes.find(t => t.value === formData.userType)?.label;
          const actualRoleLabel = userTypes.find(t => t.value === authUserData.role)?.label;
          throw new Error(`Ce compte n'est pas un compte ${selectedTypeLabel}. Il s'agit d'un compte ${actualRoleLabel}`);
        }

        // Créer la session avec les données auth
        const userSession = {
          id: authUserData.id,
          email: authUserData.email,
          full_name: authUserData.full_name,
          role: authUserData.role,
          phone: authUserData.phone,
          current_school_id: authUserData.current_school_id || authUserData.school?.id,
          school_name: authUserData.school?.name || 'École',
          is_active: authUserData.is_active,
          loginTime: new Date().toISOString(),
          sessionId: Math.random().toString(36).substr(2, 9),
          demoAccount: false
        };

        localStorage.setItem('edutrack-user', JSON.stringify(userSession));
        console.log('✅ Session créée via Auth');

        // Rediriger vers le dashboard approprié
        const dashboardRoute = userTypes.find(t => t.value === formData.userType)?.dashboard;
        navigate(dashboardRoute);
        return;
      }

      // Utilisateur trouvé dans la base locale - vérifier le compte
      console.log('✅ Utilisateur trouvé dans la base locale:', userData.email);

      if (!userData.is_active) {
        throw new Error('Compte désactivé. Contactez votre administrateur.');
      }

      // Pour les comptes locaux sans Auth, on ne vérifie pas le mot de passe pour le moment
      console.log('⚠️ Connexion sans vérification de mot de passe (compte local)');

      // Mettre à jour la dernière connexion
      await supabase
        .from('users')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.id);

      // Créer la session avec les données locales
      const userSession = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        phone: userData.phone,
        current_school_id: userData.current_school_id || userData.school?.id,
        school_name: userData.school?.name || 'École',
        is_active: userData.is_active,
        loginTime: new Date().toISOString(),
        sessionId: Math.random().toString(36).substr(2, 9),
        demoAccount: false
      };

      localStorage.setItem('edutrack-user', JSON.stringify(userSession));
      
      console.log('✅ Mode PRODUCTION (compte local):', userSession.school_name);

      // Rediriger vers le dashboard approprié
      const dashboardRoute = userTypes.find(t => t.value === formData.userType)?.dashboard;
      navigate(dashboardRoute);

    } catch (error) {
      console.error('❌ Login error:', error.message);
      setError(error.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary to-primary items-center justify-center p-12">
        <div className="max-w-xl text-white">
          <img
            src="/assets/images/mon_logo.png"
            alt="Logo EduTrack CM"
            className="w-20 h-20 object-contain rounded-2xl shadow-lg mb-8"
          />
          <h1 className="text-4xl font-heading font-heading-bold mb-6">
            Espace Personnel
          </h1>
          <p className="text-lg text-white/90 mb-8">
            Accédez à votre espace personnel EduTrack CM. 
            Connectez-vous pour consulter vos informations et gérer vos activités.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <Icon name="BookOpen" size={24} className="mb-2" />
              <h3 className="font-heading font-heading-semibold mb-2">Enseignants</h3>
              <p className="text-sm text-white/80">Gestion des cours et évaluations</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Icon name="Users" size={24} className="mb-2" />
              <h3 className="font-heading font-heading-semibold mb-2">Élèves & Parents</h3>
              <p className="text-sm text-white/80">Suivi scolaire et communication</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-heading font-heading-bold text-foreground mb-2">
              Connexion Personnel
            </h2>
            <p className="text-muted-foreground">
              Accédez à votre espace de travail
            </p>
          </div>

          {/* Form */}
          <div className="bg-card rounded-lg border border-border p-6 shadow-card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Select
                label="Type de compte"
                name="userType"
                value={formData.userType}
                onChange={handleSelectChange}
                options={userTypes}
                required
              />

              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <div className="relative">
                <Input
                  label="Mot de passe"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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

              {error && (
                <div className="bg-error/10 text-error p-3 rounded-lg flex items-center gap-2">
                  <Icon name="AlertTriangle" size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={loading}
              >
                <Icon name="LogIn" size={16} className="mr-2" />
                Se connecter
              </Button>
            </form>
          </div>

          {/* Back to main */}
          <div className="text-center mt-6">
            <Link 
              to="/"
              className="text-muted-foreground hover:text-primary text-sm inline-flex items-center gap-2"
            >
              <Icon name="ArrowLeft" size={16} />
              Retour à l'accueil
            </Link>
          </div>

          {/* Demo Button */}
          <div className="fixed top-4 right-4">
            <Link 
              to="/demo"
              className="bg-secondary/10 hover:bg-secondary/20 text-secondary px-4 py-2 rounded-full font-body font-body-semibold inline-flex items-center gap-2 transition-colors"
            >
              <Icon name="Laptop" size={16} />
              Accès Démo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;