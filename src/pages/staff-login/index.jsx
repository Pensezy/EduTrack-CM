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

      console.log('🔐 Tentative de connexion avec Supabase Auth...');
      
      // Authentification avec Supabase Auth (méthode standard)
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

      console.log('✅ Authentification réussie:', authData.user.email);

      // Récupérer les données complètes de l'utilisateur depuis la table users
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
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        console.error('❌ User data error:', userError);
        throw new Error('Impossible de charger les données utilisateur');
      }

      if (!userData || !userData.is_active) {
        throw new Error('Compte désactivé. Contactez votre administrateur.');
      }

      console.log('✅ Données utilisateur chargées:', userData);

      // Vérifier que le rôle correspond au type sélectionné
      const expectedRole = formData.userType;
      if (userData.role !== expectedRole) {
        const selectedTypeLabel = userTypes.find(t => t.value === expectedRole)?.label;
        const actualRoleLabel = userTypes.find(t => t.value === userData.role)?.label || userData.role;
        throw new Error(`Ce compte n'est pas un compte ${selectedTypeLabel}. Il s'agit d'un compte ${actualRoleLabel}`);
      }

      // Créer la session utilisateur avec toutes les données
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
      
      console.log('✅ Mode PRODUCTION:', userSession.school_name);

      // Rediriger vers le dashboard approprié
      const dashboardRoute = userTypes.find(t => t.value === expectedRole)?.dashboard;
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

              <Input
                label="Mot de passe"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />

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