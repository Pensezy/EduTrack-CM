import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Mail, CheckCircle, ArrowRight } from 'lucide-react';

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'votre adresse email';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">EduTrack</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 text-primary-600 mb-6">
              <Mail className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Vérifiez votre adresse email
            </h1>
            <p className="text-xl text-gray-600">
              Nous avons envoyé un email de confirmation à :
            </p>
            <p className="text-lg font-semibold text-primary-600 mt-2">
              {email}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Prochaines étapes :
            </h2>
            <ol className="space-y-3 text-blue-800">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-semibold">
                  1
                </span>
                <span>
                  <strong>Consultez votre boîte de réception</strong> (vérifiez aussi les spams/courrier indésirable)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-semibold">
                  2
                </span>
                <span>
                  <strong>Cliquez sur le bouton de confirmation</strong> dans l'email
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-semibold">
                  3
                </span>
                <span>
                  <strong>Connectez-vous</strong> avec vos identifiants pour accéder à votre espace
                </span>
              </li>
            </ol>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Important :</strong> Votre compte ne sera activé qu'après avoir confirmé votre adresse email.
              Sans confirmation, vous ne pourrez pas vous connecter.
            </p>
          </div>

          {/* Help Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vous n'avez pas reçu l'email ?
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span>Vérifiez votre dossier spam ou courrier indésirable</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span>Assurez-vous que l'adresse email est correcte : <strong>{email}</strong></span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span>Patientez quelques minutes, l'email peut prendre du temps à arriver</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all inline-flex items-center justify-center gap-2"
            >
              <span>J'ai confirmé mon email, me connecter</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>

          {/* Support */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Besoin d'aide ?{' '}
              <a
                href="mailto:support@edutrack.cm?subject=Problème de vérification email"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Contactez le support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
