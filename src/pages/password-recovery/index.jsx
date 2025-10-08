import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const PasswordRecovery = () => {
  const [step, setStep] = useState('email'); // 'email', 'success', 'error'
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendRecoveryEmail = async () => {
    if (!email) {
      alert('Veuillez saisir votre adresse email');
      return;
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Veuillez saisir une adresse email valide');
      return;
    }

    setIsLoading(true);

    try {
      // Ici, on intégrerait la logique de récupération réelle
      // avec l'API backend (Supabase, etc.)
      
      // Simulation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simuler une réussite
      setStep('success');
      
    } catch (error) {
      console.error('Erreur récupération mot de passe:', error);
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Lock" size={24} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Récupération de mot de passe
        </h2>
        <p className="text-gray-600">
          Saisissez votre adresse email pour recevoir un lien de réinitialisation
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="space-y-4">
          <Input
            label="Adresse email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre.email@exemple.com"
            icon="Mail"
          />

          <Button
            onClick={handleSendRecoveryEmail}
            loading={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!email}
          >
            <Icon name="Send" size={16} className="mr-2" />
            Envoyer le lien de récupération
          </Button>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/login-authentication"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center"
          >
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Retour à la connexion
          </Link>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Comment ça fonctionne ?</h3>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Nous envoyons un lien sécurisé à votre email</li>
              <li>• Cliquez sur le lien pour créer un nouveau mot de passe</li>
              <li>• Le lien expire après 24 heures</li>
              <li>• Si vous ne recevez pas l'email, vérifiez vos spams</li>
            </ul>
          </div>
        </div>
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
          Email envoyé !
        </h2>
        <p className="text-gray-600">
          Nous avons envoyé un lien de récupération à <strong>{email}</strong>
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="space-y-4">
          <div className="text-center">
            <Icon name="Mail" size={48} className="text-blue-600 mx-auto mb-4" />
            <p className="text-gray-700 mb-4">
              Vérifiez votre boîte email et cliquez sur le lien pour réinitialiser votre mot de passe.
            </p>
            <p className="text-sm text-gray-500">
              Le lien expirera dans 24 heures pour votre sécurité.
            </p>
          </div>

          <div className="border-t pt-4 space-y-2">
            <Button
              onClick={() => {
                setStep('email');
                setEmail('');
              }}
              variant="outline"
              className="w-full"
            >
              <Icon name="RotateCcw" size={16} className="mr-2" />
              Renvoyer l'email
            </Button>
            
            {/* Lien de simulation pour la démonstration */}
            <div className="text-center mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700 mb-2">
                <strong>Mode démonstration :</strong>
              </p>
              <Link
                to={`/password-reset?token=demo-token-123&email=${email}`}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Simuler le clic sur le lien de l'email
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/login-authentication"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center"
          >
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Retour à la connexion
          </Link>
        </div>
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="AlertTriangle" size={20} className="text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-900">Vous ne recevez pas l'email ?</h3>
            <ul className="text-sm text-amber-700 mt-2 space-y-1">
              <li>• Vérifiez votre dossier spam/courrier indésirable</li>
              <li>• Assurez-vous que l'adresse email est correcte</li>
              <li>• Attendez quelques minutes (délai de livraison)</li>
              <li>• Contactez l'administration si le problème persiste</li>
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
          Erreur de récupération
        </h2>
        <p className="text-gray-600">
          Une erreur s'est produite lors de l'envoi de l'email
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="space-y-4">
          <div className="text-center">
            <Icon name="AlertCircle" size={48} className="text-red-600 mx-auto mb-4" />
            <p className="text-gray-700 mb-4">
              Impossible d'envoyer l'email de récupération. Cela peut être dû à :
            </p>
            <ul className="text-sm text-gray-600 text-left space-y-1 mb-4">
              <li>• Adresse email non trouvée dans notre système</li>
              <li>• Problème temporaire du service email</li>
              <li>• Connexion internet instable</li>
            </ul>
          </div>

          <div className="border-t pt-4 space-y-2">
            <Button
              onClick={() => {
                setStep('email');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Icon name="RotateCcw" size={16} className="mr-2" />
              Réessayer
            </Button>
            
            <Button
              onClick={() => {
                setStep('email');
                setEmail('');
              }}
              variant="outline"
              className="w-full"
            >
              <Icon name="Edit" size={16} className="mr-2" />
              Changer d'email
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/login-authentication"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center"
          >
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Retour à la connexion
          </Link>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="HelpCircle" size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Besoin d'aide ?</h3>
            <p className="text-sm text-blue-700 mt-1">
              Contactez l'administration de votre établissement ou votre administrateur système.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {step === 'email' && renderEmailStep()}
        {step === 'success' && renderSuccessStep()}
        {step === 'error' && renderErrorStep()}
      </div>
    </div>
  );
};

export default PasswordRecovery;