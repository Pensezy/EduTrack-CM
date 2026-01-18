import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const PasswordReset = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState('loading'); // 'loading', 'reset', 'success', 'error'
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);

  useEffect(() => {
    // Récupérer le token et l'email depuis les paramètres d'URL
    const resetToken = searchParams.get('token');
    const userEmail = searchParams.get('email');
    
    if (!resetToken || !userEmail) {
      setStep('error');
      return;
    }

    // Validation du token (simulation)
    validateToken(resetToken, userEmail);
  }, [searchParams]);

  const validateToken = async (token, email) => {
    try {
      // Ici, on validerait le token avec l'API backend
      // Simulation de validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Pour la simulation, on accepte tous les tokens
      setToken(token);
      setEmail(email);
      setStep('reset');
    } catch (error) {
      console.error('Token invalide:', error);
      setStep('error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Nettoyer les erreurs de validation
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePassword = (password) => {
    const errors = {};
    
    if (password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) {
      errors.password = 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = validatePassword(formData.password);
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Ici, on enverrait la nouvelle mot de passe à l'API
      // Simulation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStep('success');
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
      setValidationErrors({ general: 'Erreur lors de la réinitialisation. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoadingStep = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Validation du lien
        </h2>
        <p className="text-gray-600">
          Vérification de votre demande de réinitialisation...
        </p>
      </div>
    </div>
  );

  const renderResetStep = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Key" size={24} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Nouveau mot de passe
        </h2>
        <p className="text-gray-600">
          Créez un nouveau mot de passe sécurisé pour <strong>{email}</strong>
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        {validationErrors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <Icon name="AlertCircle" size={20} className="text-red-600 mt-0.5" />
            <p className="text-red-800">{validationErrors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              label="Nouveau mot de passe"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••••••"
              icon="Lock"
              error={validationErrors.password}
            />
            <div className="mt-2 text-xs text-gray-500">
              <p>Le mot de passe doit contenir :</p>
              <ul className="mt-1 space-y-1">
                <li className={formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                  • Au moins 8 caractères
                </li>
                <li className={/(?=.*[a-z])/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}>
                  • Une lettre minuscule
                </li>
                <li className={/(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}>
                  • Une lettre majuscule
                </li>
                <li className={/(?=.*\d)/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}>
                  • Un chiffre
                </li>
                <li className={/(?=.*[!@#$%^&*])/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}>
                  • Un caractère spécial (!@#$%^&*)
                </li>
              </ul>
            </div>
          </div>

          <Input
            label="Confirmer le mot de passe"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="••••••••••••"
            icon="Lock"
            error={validationErrors.confirmPassword}
          />

          <Button
            type="submit"
            loading={isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={!formData.password || !formData.confirmPassword}
          >
            <Icon name="Check" size={16} className="mr-2" />
            Confirmer le nouveau mot de passe
          </Button>
        </form>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="CheckCircle" size={24} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Mot de passe mis à jour !
        </h2>
        <p className="text-gray-600">
          Votre mot de passe a été modifié avec succès
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="text-center space-y-4">
          <Icon name="Shield" size={48} className="text-green-600 mx-auto" />
          <p className="text-gray-700">
            Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </p>
          
          <Button
            onClick={() => navigate('/production-login')}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Icon name="LogIn" size={16} className="mr-2" />
            Se connecter maintenant
          </Button>
        </div>
      </div>

      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Shield" size={20} className="text-green-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-900">Conseils de sécurité</h3>
            <ul className="text-sm text-green-700 mt-2 space-y-1">
              <li>• Ne partagez jamais votre mot de passe</li>
              <li>• Changez-le régulièrement</li>
              <li>• Utilisez un mot de passe unique pour ce compte</li>
              <li>• Déconnectez-vous des postes partagés</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderErrorStep = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="XCircle" size={24} className="text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Lien invalide
        </h2>
        <p className="text-gray-600">
          Ce lien de réinitialisation n'est plus valide
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="text-center space-y-4">
          <Icon name="AlertTriangle" size={48} className="text-red-600 mx-auto" />
          <p className="text-gray-700">
            Le lien de réinitialisation peut avoir expiré ou déjà été utilisé.
          </p>
          
          <div className="space-y-2">
            <Button
              onClick={() => navigate('/password-recovery')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Icon name="RotateCcw" size={16} className="mr-2" />
              Demander un nouveau lien
            </Button>
            
            <Button
              onClick={() => navigate('/production-login')}
              variant="outline"
              className="w-full"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Retour à la connexion
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Clock" size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Pourquoi le lien est-il invalide ?</h3>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Le lien a expiré (valide 24h)</li>
              <li>• Il a déjà été utilisé</li>
              <li>• L'URL est incorrecte ou tronquée</li>
              <li>• Une nouvelle demande a annulé ce lien</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {step === 'loading' && renderLoadingStep()}
        {step === 'reset' && renderResetStep()}
        {step === 'success' && renderSuccessStep()}
        {step === 'error' && renderErrorStep()}
      </div>
    </div>
  );
};

export default PasswordReset;