/**
 * Onboarding Page - Page guidée pour les nouveaux directeurs
 * Affichée après l'inscription pour expliquer le système modulaire
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  School,
  Package,
  Sparkles,
  ArrowRight,
  Check,
  BookOpen,
  FileText,
  DollarSign,
  MessageSquare,
  Calendar,
  BarChart3,
  Users
} from 'lucide-react';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Bienvenue sur EduTrack !',
      description: 'Félicitations ! Votre compte a été créé avec succès.',
      icon: <Sparkles className="h-12 w-12" />,
      color: 'from-green-500 to-green-600',
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Votre établissement est prêt !
                </h3>
                <p className="text-green-800">
                  Votre compte directeur a été créé et l'application <strong>Core</strong> est déjà activée gratuitement à vie.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Avec l'App Core GRATUITE, vous pouvez déjà :</h4>
            <ul className="space-y-3">
              {[
                'Gérer vos élèves (inscriptions, fiches, historique)',
                'Organiser vos classes et niveaux',
                'Gérer vos enseignants et personnels',
                'Accéder au tableau de bord principal'
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <p className="text-sm text-gray-600">
              <strong>Important :</strong> Les utilisateurs réguliers (enseignants, parents, élèves) accéderont à EduTrack via un portail privé lié à votre établissement. Vous seul avez accès à l'administration complète.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Système Modulaire',
      description: 'Ajoutez uniquement les fonctionnalités dont vous avez besoin',
      icon: <Package className="h-12 w-12" />,
      color: 'from-blue-500 to-blue-600',
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 text-lg">
            EduTrack fonctionne comme un <strong>App Store</strong> : vous choisissez et activez uniquement les applications dont vous avez besoin.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                name: 'Core',
                icon: <School className="h-6 w-6" />,
                price: 'GRATUIT',
                color: 'from-green-500 to-green-600',
                badge: 'Déjà activée'
              },
              {
                name: 'Pédagogie',
                icon: <BookOpen className="h-6 w-6" />,
                price: '30 000 FCFA/an',
                color: 'from-blue-500 to-blue-600'
              },
              {
                name: 'Notes',
                icon: <FileText className="h-6 w-6" />,
                price: '35 000 FCFA/an',
                color: 'from-purple-500 to-purple-600'
              },
              {
                name: 'Finance',
                icon: <DollarSign className="h-6 w-6" />,
                price: '40 000 FCFA/an',
                color: 'from-yellow-500 to-yellow-600'
              },
              {
                name: 'Communication',
                icon: <MessageSquare className="h-6 w-6" />,
                price: '33 000 FCFA/an',
                color: 'from-green-500 to-green-600'
              },
              {
                name: 'Présence',
                icon: <Calendar className="h-6 w-6" />,
                price: '27 000 FCFA/an',
                color: 'from-red-500 to-red-600'
              },
              {
                name: 'Analytics',
                icon: <BarChart3 className="h-6 w-6" />,
                price: '37 000 FCFA/an',
                color: 'from-orange-500 to-orange-600'
              },
              {
                name: 'RH',
                icon: <Users className="h-6 w-6" />,
                price: '33 000 FCFA/an',
                color: 'from-indigo-500 to-indigo-600'
              }
            ].map((app, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${app.color} text-white`}>
                    {app.icon}
                  </div>
                  {app.badge && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      {app.badge}
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{app.name}</h4>
                <p className="text-sm text-gray-600">{app.price}</p>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <p className="text-blue-800">
              <strong>Essai gratuit de 30 jours</strong> pour chaque application payante ! Testez avant d'acheter.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Packs Économiques',
      description: 'Économisez jusqu\'à 35 000 FCFA avec nos bundles',
      icon: <Package className="h-12 w-12" />,
      color: 'from-purple-500 to-purple-600',
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 text-lg">
            Pour économiser, choisissez un de nos <strong>packs prédéfinis</strong> qui regroupent plusieurs applications à prix réduit.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Pack Basic',
                price: '55 000',
                savings: '10 000',
                apps: ['Core', 'Pédagogie', 'Notes'],
                popular: false
              },
              {
                name: 'Pack Standard',
                price: '120 000',
                savings: '18 000',
                apps: ['Core', 'Pédagogie', 'Notes', 'Finance', 'Communication'],
                popular: true
              },
              {
                name: 'Pack Premium',
                price: '200 000',
                savings: '35 000',
                apps: ['Toutes les apps'],
                popular: false
              }
            ].map((pack, idx) => (
              <div
                key={idx}
                className={`rounded-xl overflow-hidden border-2 ${
                  pack.popular ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-200'
                }`}
              >
                {pack.popular && (
                  <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white text-center py-2 px-4">
                    <span className="text-sm font-bold">RECOMMANDÉ</span>
                  </div>
                )}
                <div className={`p-6 ${pack.popular ? 'bg-gradient-to-br from-primary-50 to-primary-100' : 'bg-gray-50'}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pack.name}</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold text-gray-900">{pack.price}</span>
                    <span className="text-gray-600">FCFA/an</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                    <Check className="h-3 w-3" />
                    <span>Économie {pack.savings} FCFA</span>
                  </div>
                </div>
                <div className="p-6 bg-white">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3">Inclus:</h4>
                  <ul className="space-y-2">
                    {pack.apps.map((app, appIdx) => (
                      <li key={appIdx} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>{app}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Prêt à Commencer !',
      description: 'Accédez à votre tableau de bord et explorez EduTrack',
      icon: <GraduationCap className="h-12 w-12" />,
      color: 'from-primary-500 to-primary-600',
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 text-lg">
            Vous êtes maintenant prêt à utiliser EduTrack ! Voici ce que vous pouvez faire :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
                <School className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Utiliser l'App Core</h3>
              <p className="text-sm text-gray-600">
                Commencez immédiatement à gérer vos élèves, classes et enseignants gratuitement
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Explorer l'App Store</h3>
              <p className="text-sm text-gray-600">
                Découvrez les applications disponibles et démarrez des essais gratuits de 30 jours
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Configurer votre école</h3>
              <p className="text-sm text-gray-600">
                Personnalisez les paramètres de votre établissement selon vos besoins
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Inviter des utilisateurs</h3>
              <p className="text-sm text-gray-600">
                Créez des comptes pour vos enseignants, parents et autres personnels
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Besoin d'aide ?</h3>
            <p className="text-primary-100 mb-4">
              Notre équipe est là pour vous accompagner dans la prise en main de la plateforme
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://docs.edutrack.cm"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Voir le Guide
              </a>
              <a
                href="mailto:support@edutrack.cm?subject=Besoin d'aide - Nouveau compte"
                className="px-6 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                Contacter le Support
              </a>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Dernière étape : rediriger vers le dashboard admin
      const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const adminUrl = isDev ? 'http://localhost:5174' : 'https://edu-track-cm-admin.vercel.app';
      window.location.href = adminUrl;
    }
  };

  const handleSkip = () => {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const adminUrl = isDev ? 'http://localhost:5174' : 'https://edu-track-cm-admin.vercel.app';
    window.location.href = adminUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">EduTrack</span>
            </div>

            <button
              onClick={handleSkip}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Passer la visite guidée
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-8 bg-primary-600' : idx < currentStep ? 'w-2 bg-green-500' : 'w-2 bg-gray-300'
                }`}
              ></div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600">
            Étape {currentStep + 1} sur {steps.length}
          </p>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${currentStepData.color} text-white mb-6`}>
              {currentStepData.icon}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {currentStepData.title}
            </h1>
            <p className="text-xl text-gray-600">
              {currentStepData.description}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {currentStepData.content}
          </div>

          <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium disabled:opacity-0 disabled:cursor-not-allowed transition-opacity"
            >
              Précédent
            </button>

            <button
              onClick={handleNext}
              className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all inline-flex items-center gap-2"
            >
              <span>{currentStep === steps.length - 1 ? 'Accéder au Dashboard' : 'Continuer'}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
