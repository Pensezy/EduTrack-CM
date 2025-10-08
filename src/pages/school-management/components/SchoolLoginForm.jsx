import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const SchoolLoginForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
    
    // Validation en temps réel
    const newFieldErrors = { ...fieldErrors };
    
    if (name === 'email') {
      if (value.trim() === '') {
        newFieldErrors.email = 'Email requis';
      } else if (!value.includes('@')) {
        newFieldErrors.email = 'Format email invalide';
      } else {
        delete newFieldErrors.email;
      }
    }
    
    if (name === 'password') {
      if (value.trim() === '') {
        newFieldErrors.password = 'Mot de passe requis';
      } else if (value.length < 6) {
        newFieldErrors.password = 'Mot de passe trop court (min. 6 caractères)';
      } else {
        delete newFieldErrors.password;
      }
    }
    
    setFieldErrors(newFieldErrors);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation côté client
      if (!formData.email.trim()) {
        throw new Error('Veuillez saisir votre adresse email');
      }
      if (!formData.password.trim()) {
        throw new Error('Veuillez saisir votre mot de passe');
      }
      if (!formData.email.includes('@')) {
        throw new Error('Veuillez saisir une adresse email valide');
      }

      // Utiliser le nouveau service d'authentification compatible Prisma
      const { loginDirector } = await import('../../../services/authService.js');
      
      const result = await loginDirector(formData.email, formData.password);

      if (!result.success) {
        // Améliorer les messages d'erreur pour l'utilisateur
        let userFriendlyError = result.error;
        
        // Détecter les erreurs courantes et les rendre plus explicites
        if (result.error?.includes('Invalid login credentials') || 
            result.error?.includes('invalid credentials') ||
            result.error?.includes('Wrong email or password')) {
          userFriendlyError = '❌ Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.';
        } else if (result.error?.includes('Email not confirmed')) {
          userFriendlyError = '📧 Votre email n\'a pas encore été confirmé. Vérifiez votre boîte mail.';
        } else if (result.error?.includes('Too many requests')) {
          userFriendlyError = '⏳ Trop de tentatives de connexion. Veuillez patienter quelques minutes.';
        } else if (result.error?.includes('User not found')) {
          userFriendlyError = '👤 Aucun compte trouvé avec cette adresse email.';
        } else if (result.error?.includes('Aucune école associée')) {
          userFriendlyError = '🏫 Aucune école associée à ce compte. Contactez l\'administrateur.';
        } else if (result.error?.includes('en attente de validation')) {
          userFriendlyError = '⏳ Votre compte est en attente de validation par l\'administrateur.';
        } else if (result.error?.includes('suspendu')) {
          userFriendlyError = '🚫 Votre compte a été suspendu. Contactez l\'administrateur.';
        } else if (result.error?.includes('Network request failed')) {
          userFriendlyError = '🌐 Problème de connexion internet. Vérifiez votre connexion.';
        }
        
        throw new Error(userFriendlyError);
      }

      console.log('✅ Connexion réussie:', {
        user: result.user.email,
        school: result.school.name,
        status: result.school.status
      });

      // Passer les données de l'école au composant parent
      onSuccess?.(result.school);
      
    } catch (error) {
      console.error('Erreur de connexion:', error.message);
      setError(error.message || 'Une erreur inattendue est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          placeholder="directeur@monecole.cm"
        />
        {touched.email && fieldErrors.email && (
          <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <Icon name="AlertCircle" size={14} />
            {fieldErrors.email}
          </div>
        )}
      </div>

      <div>
        <Input
          label="Mot de passe"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          placeholder="Votre mot de passe"
        />
        {touched.password && fieldErrors.password && (
          <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <Icon name="AlertCircle" size={14} />
            {fieldErrors.password}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Icon name="AlertTriangle" size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-red-900 mb-1">Erreur de connexion</div>
              <div className="text-sm leading-relaxed">{error}</div>
              {(error.includes('incorrect') || error.includes('wrong')) && (
                <div className="mt-3 text-xs text-red-600 bg-red-100 p-2 rounded border-l-2 border-red-300">
                  💡 <strong>Conseils :</strong>
                  <ul className="mt-1 ml-4 list-disc text-xs">
                    <li>Vérifiez que vous utilisez la bonne adresse email</li>
                    <li>Assurez-vous que le mot de passe est correct (attention aux majuscules/minuscules)</li>
                    <li>Si vous avez oublié votre mot de passe, utilisez le lien ci-dessous</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        loading={loading}
        disabled={loading || !formData.email.trim() || !formData.password.trim()}
      >
        {loading ? (
          <>
            <Icon name="Loader" size={16} className="mr-2 animate-spin" />
            Connexion en cours...
          </>
        ) : (
          <>
            <Icon name="LogIn" size={16} className="mr-2" />
            Se connecter
          </>
        )}
      </Button>

      <div className="space-y-3">
        <div className="text-center">
          <a href="#reset-password" className="text-sm text-primary hover:underline">
            Mot de passe oublié ?
          </a>
        </div>
        
        {/* Section d'aide */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">Besoin d'aide ?</div>
              <ul className="text-xs space-y-1 text-blue-700">
                <li>• Utilisez l'email avec lequel vous avez créé votre compte</li>
                <li>• Le mot de passe est sensible à la casse (majuscules/minuscules)</li>
                <li>• Si vous n'avez pas encore de compte, inscrivez-vous d'abord</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default SchoolLoginForm;