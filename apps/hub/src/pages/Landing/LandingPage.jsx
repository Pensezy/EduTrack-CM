/**
 * Landing Page - Point d'entrée public de EduTrack
 * Design professionnel pour convaincre les directeurs d'établissement
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  School,
  Users,
  BookOpen,
  FileText,
  MessageSquare,
  BarChart3,
  Calendar,
  DollarSign,
  Check,
  ArrowRight,
  Sparkles,
  TrendingDown,
  Package,
  Shield,
  Zap,
  Globe
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedBundle, setSelectedBundle] = useState('standard');

  // Les 8 applications modulaires
  const apps = [
    {
      id: 'core',
      name: 'Core',
      icon: <School className="h-8 w-8" />,
      description: 'Gestion de base : élèves, classes, enseignants',
      category: 'Gratuit',
      color: 'from-green-500 to-green-600',
      features: ['Gestion élèves', 'Gestion classes', 'Tableau de bord'],
      isFree: true
    },
    {
      id: 'pedagogy',
      name: 'Pédagogie',
      icon: <BookOpen className="h-8 w-8" />,
      description: 'Emplois du temps, matières, devoirs',
      price: 25000,
      color: 'from-blue-500 to-blue-600',
      features: ['Emplois du temps', 'Gestion matières', 'Devoirs']
    },
    {
      id: 'grades',
      name: 'Notes',
      icon: <FileText className="h-8 w-8" />,
      description: 'Notes, bulletins, moyennes automatiques',
      price: 30000,
      color: 'from-purple-500 to-purple-600',
      features: ['Saisie notes', 'Bulletins auto', 'Moyennes']
    },
    {
      id: 'finance',
      name: 'Finance',
      icon: <DollarSign className="h-8 w-8" />,
      description: 'Scolarité, paiements, reçus automatiques',
      price: 35000,
      color: 'from-yellow-500 to-yellow-600',
      features: ['Gestion scolarité', 'Paiements', 'Reçus']
    },
    {
      id: 'communication',
      name: 'Communication',
      icon: <MessageSquare className="h-8 w-8" />,
      description: 'SMS, emails, notifications parents',
      price: 28000,
      color: 'from-green-500 to-green-600',
      features: ['SMS groupés', 'Emails', 'Notifications']
    },
    {
      id: 'attendance',
      name: 'Présence',
      icon: <Calendar className="h-8 w-8" />,
      description: 'Absences, retards, justificatifs',
      price: 22000,
      color: 'from-red-500 to-red-600',
      features: ['Pointage', 'Absences', 'Statistiques']
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: <BarChart3 className="h-8 w-8" />,
      description: 'Statistiques avancées, rapports détaillés',
      price: 32000,
      color: 'from-orange-500 to-orange-600',
      features: ['Tableaux de bord', 'Rapports', 'Export']
    },
    {
      id: 'hr',
      name: 'RH',
      icon: <Users className="h-8 w-8" />,
      description: 'Gestion personnel, paie, congés',
      price: 28000,
      color: 'from-indigo-500 to-indigo-600',
      features: ['Gestion paie', 'Congés', 'Contrats']
    }
  ];

  // Les 3 bundles
  const bundles = [
    {
      id: 'basic',
      name: 'Pack Basic',
      description: 'Pour les petits établissements',
      price: 60000,
      savings: 15000,
      apps: ['core', 'pedagogy', 'grades'],
      features: ['Support email', '500 SMS/mois'],
      popular: false
    },
    {
      id: 'standard',
      name: 'Pack Standard',
      description: 'Le plus populaire',
      price: 120000,
      savings: 18000,
      apps: ['core', 'pedagogy', 'grades', 'finance', 'communication'],
      features: ['Support prioritaire', '2000 SMS/mois', 'Formation vidéo'],
      popular: true
    },
    {
      id: 'premium',
      name: 'Pack Premium',
      description: 'Solution complète',
      price: 180000,
      savings: 20000,
      apps: ['core', 'pedagogy', 'grades', 'finance', 'communication', 'attendance', 'analytics', 'hr'],
      features: ['Support téléphonique', '5000 SMS/mois', 'Formation sur site', 'Assistance dédiée'],
      popular: false
    }
  ];

  const selectedBundleData = bundles.find(b => b.id === selectedBundle);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Logo & Badge */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                <GraduationCap className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-5xl font-bold">EduTrack</h1>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              <span>Solution Modulaire de Gestion Scolaire</span>
            </div>

            {/* Titre principal */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Gérez Votre Établissement<br />
              <span className="text-yellow-300">À Votre Rythme, À Votre Budget</span>
            </h2>

            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto">
              Démarrez gratuitement avec les fonctions essentielles.<br />
              Ajoutez uniquement les modules dont vous avez besoin.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="group px-8 py-4 bg-white text-primary-700 rounded-xl font-bold text-lg hover:bg-yellow-300 hover:text-primary-900 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 inline-flex items-center gap-2"
              >
                <Zap className="h-5 w-5" />
                Créer Mon Compte Gratuit
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-200 border-2 border-white/30"
              >
                Voir les Prix
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
              <div>
                <div className="text-4xl font-bold text-yellow-300">100%</div>
                <div className="text-sm text-gray-300 mt-1">Gratuit pour démarrer</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-300">30j</div>
                <div className="text-sm text-gray-300 mt-1">Essai gratuit par app</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-300">8</div>
                <div className="text-sm text-gray-300 mt-1">Applications modulaires</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="rgb(249 250 251)"/>
          </svg>
        </div>
      </section>

      {/* Features - Pourquoi EduTrack */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi Choisir EduTrack ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une solution pensée pour les directeurs d'établissement au Cameroun
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Zap className="h-8 w-8" />,
                title: 'Gratuit pour Démarrer',
                description: 'App Core gratuite à vie avec gestion élèves, classes et enseignants',
                color: 'from-green-500 to-green-600'
              },
              {
                icon: <Package className="h-8 w-8" />,
                title: 'Modulaire',
                description: "N'achetez que ce dont vous avez besoin. Ajoutez des apps quand vous voulez",
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: '30 Jours d\'Essai',
                description: 'Testez chaque application gratuitement pendant 30 jours',
                color: 'from-purple-500 to-purple-600'
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: 'Multi-Pays',
                description: 'Adapté au Cameroun, Sénégal, France avec devises locales',
                color: 'from-orange-500 to-orange-600'
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Applications Modulaires */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              8 Applications, 1 Seule Plateforme
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Commencez avec l'App Core gratuite, puis ajoutez les modules selon vos besoins
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {apps.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
              >
                <div className={`bg-gradient-to-br ${app.color} text-white p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    {app.icon}
                    {app.isFree && (
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold">
                        GRATUIT
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{app.name}</h3>
                  <p className="text-white/90 text-sm">{app.description}</p>
                </div>

                <div className="p-6">
                  <ul className="space-y-2 mb-4">
                    {app.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {app.isFree ? (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">GRATUIT</div>
                      <div className="text-xs text-gray-500 mt-1">À vie</div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {app.price?.toLocaleString()} <span className="text-sm text-gray-600">FCFA/an</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">30 jours d'essai gratuit</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Bundles */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Packs Tout Inclus - Économisez jusqu'à 20k FCFA
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ou achetez chaque application séparément selon vos besoins
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {bundles.map((bundle) => (
              <div
                key={bundle.id}
                className={`rounded-2xl overflow-hidden transition-all duration-200 ${
                  bundle.popular
                    ? 'border-2 border-primary-500 ring-4 ring-primary-100 transform scale-105 shadow-2xl'
                    : 'border border-gray-200 shadow-lg hover:shadow-xl'
                }`}
              >
                {bundle.popular && (
                  <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white text-center py-3 px-4">
                    <div className="flex items-center justify-center gap-2 font-bold">
                      <Sparkles className="h-5 w-5" />
                      <span>LE PLUS POPULAIRE</span>
                    </div>
                  </div>
                )}

                <div className={`p-8 ${bundle.popular ? 'bg-gradient-to-br from-primary-50 to-primary-100' : 'bg-gray-50'}`}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{bundle.name}</h3>
                  <p className="text-gray-600 mb-6">{bundle.description}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-bold text-gray-900">
                        {bundle.price.toLocaleString()}
                      </span>
                      <span className="text-gray-600">FCFA/an</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                      <TrendingDown className="h-4 w-4" />
                      <span>Économisez {bundle.savings.toLocaleString()} FCFA</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/signup')}
                    className={`w-full py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 ${
                      bundle.popular
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    Commencer Gratuitement
                  </button>
                </div>

                <div className="p-8 bg-white">
                  <h4 className="text-sm font-bold text-gray-700 uppercase mb-4">
                    Applications Incluses
                  </h4>
                  <ul className="space-y-3 mb-6">
                    {bundle.apps.map((appId) => {
                      const app = apps.find(a => a.id === appId);
                      return (
                        <li key={appId} className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${app.color} text-white`}>
                            {app.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{app.name}</div>
                            {!app.isFree && (
                              <div className="text-xs text-gray-500">
                                {app.price?.toLocaleString()} FCFA
                              </div>
                            )}
                          </div>
                          <Check className="h-5 w-5 text-green-600" />
                        </li>
                      );
                    })}
                  </ul>

                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">
                      Avantages
                    </h4>
                    <ul className="space-y-2">
                      {bundle.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <Check className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à Moderniser Votre Établissement ?
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Créez votre compte gratuitement en 2 minutes.<br />
            Aucune carte bancaire requise.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="group px-8 py-4 bg-white text-primary-700 rounded-xl font-bold text-lg hover:bg-yellow-300 hover:text-primary-900 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 inline-flex items-center gap-2"
          >
            <Zap className="h-5 w-5" />
            Créer Mon Compte Gratuit
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-sm text-gray-300 mt-6">
            Déjà un compte ? <button onClick={() => navigate('/login')} className="underline hover:text-white">Se connecter</button>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="h-6 w-6 text-primary-400" />
            <span className="text-lg font-bold text-white">EduTrack</span>
          </div>
          <p className="text-sm">
            © 2025 EduTrack. Solution modulaire de gestion scolaire pour le Cameroun.
          </p>
        </div>
      </footer>
    </div>
  );
}
