import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import SchoolRegistrationForm from './components/SchoolRegistrationForm';
import TestForm from './components/TestForm';
import WorkingSchoolRegistrationForm from './components/MinimalTest';
import SchoolLoginForm from './components/SchoolLoginForm';

const SchoolManagement = () => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const navigate = useNavigate();

  const handleLoginSuccess = (schoolData) => {
    // Navigate to school dashboard with school data
    navigate('/school-dashboard', { state: { school: schoolData } }); 
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
            ) : (
              <WorkingSchoolRegistrationForm onSuccess={handleRegistrationSuccess} />
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
                </>
              ) : (
                <>
                  Déjà inscrit ?{' '}
                  <button 
                    onClick={() => setMode('login')}
                    className="text-primary hover:underline font-body font-body-semibold"
                  >
                    Se connecter
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