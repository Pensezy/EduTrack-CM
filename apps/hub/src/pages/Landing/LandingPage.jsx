/**
 * Landing Page - Point d'entrée public de EduTrack
 * Version dynamique et animée pour convaincre les directeurs
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
  Globe,
  Star,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
      price: 30000,
      color: 'from-blue-500 to-blue-600',
      features: ['Emplois du temps', 'Gestion matières', 'Devoirs']
    },
    {
      id: 'grades',
      name: 'Notes',
      icon: <FileText className="h-8 w-8" />,
      description: 'Notes, bulletins, moyennes automatiques',
      price: 35000,
      color: 'from-purple-500 to-purple-600',
      features: ['Saisie notes', 'Bulletins auto', 'Moyennes']
    },
    {
      id: 'finance',
      name: 'Finance',
      icon: <DollarSign className="h-8 w-8" />,
      description: 'Scolarité, paiements, reçus automatiques',
      price: 40000,
      color: 'from-yellow-500 to-yellow-600',
      features: ['Gestion scolarité', 'Paiements', 'Reçus']
    },
    {
      id: 'communication',
      name: 'Communication',
      icon: <MessageSquare className="h-8 w-8" />,
      description: 'SMS, emails, notifications parents',
      price: 33000,
      color: 'from-green-500 to-green-600',
      features: ['SMS groupés', 'Emails', 'Notifications']
    },
    {
      id: 'attendance',
      name: 'Présence',
      icon: <Calendar className="h-8 w-8" />,
      description: 'Absences, retards, justificatifs',
      price: 27000,
      color: 'from-red-500 to-red-600',
      features: ['Pointage', 'Absences', 'Statistiques']
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: <BarChart3 className="h-8 w-8" />,
      description: 'Statistiques avancées, rapports détaillés',
      price: 37000,
      color: 'from-orange-500 to-orange-600',
      features: ['Tableaux de bord', 'Rapports', 'Export']
    },
    {
      id: 'hr',
      name: 'RH',
      icon: <Users className="h-8 w-8" />,
      description: 'Gestion personnel, paie, congés',
      price: 33000,
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
      price: 55000,
      savings: 10000,
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
      price: 200000,
      savings: 35000,
      apps: ['core', 'pedagogy', 'grades', 'finance', 'communication', 'attendance', 'analytics', 'hr'],
      features: ['Support téléphonique', '5000 SMS/mois', 'Formation sur site', 'Assistance dédiée'],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Version Dynamique */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 0%),
                             radial-gradient(circle at 75px 75px, white 2%, transparent 0%)`,
            backgroundSize: '100px 100px',
            animation: 'float 20s linear infinite'
          }}></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" style={{ animation: 'pulse 8s ease-in-out infinite' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          {/* Logo et Badge avec animation */}
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-white/20 blur-xl rounded-full group-hover:bg-white/30 transition-all"></div>
                <img
                  src="/assets/images/mon_logo.png"
                  alt="EduTrack Logo"
                  className="relative h-20 w-20 md:h-24 md:w-24 object-contain drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                Edu<span className="text-yellow-300">Track</span>
              </h1>
            </div>

            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium mb-8 border border-white/20 hover:bg-white/20 transition-all">
              <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
              <span>Solution Modulaire de Gestion Scolaire</span>
              <Star className="h-4 w-4 text-yellow-300" />
            </div>

            {/* Titre principal avec effet */}
            <h2 className={`text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className="inline-block hover:scale-105 transition-transform">Gérez Votre Établissement</span>
              <br />
              <span className="text-yellow-300 inline-block hover:scale-105 transition-transform">À Votre Rythme, À Votre Budget</span>
            </h2>

            <p className={`text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Démarrez <strong className="text-yellow-300">gratuitement</strong> avec les fonctions essentielles.<br />
              Ajoutez uniquement les modules dont vous avez besoin.
            </p>

            {/* CTA Buttons avec hover effects */}
            <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <button
                onClick={() => navigate('/signup')}
                className="group relative px-8 py-4 bg-white text-primary-700 rounded-xl font-bold text-lg hover:bg-yellow-300 hover:text-primary-900 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 inline-flex items-center gap-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Zap className="h-5 w-5 relative z-10 group-hover:animate-bounce" />
                <span className="relative z-10">Créer Mon Compte Gratuit</span>
                <ArrowRight className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 border-2 border-white/30 hover:border-white/50 inline-flex items-center gap-2 hover:scale-105 transform"
              >
                <Package className="h-5 w-5" />
                Découvrir les Packs
              </button>
            </div>

            {/* Stats avec animation counter */}
            <div className={`grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {[
                { value: '100%', label: 'Gratuit pour démarrer', icon: <Zap className="h-5 w-5" /> },
                { value: '30j', label: 'Essai gratuit par app', icon: <Shield className="h-5 w-5" /> },
                { value: '8', label: 'Applications modulaires', icon: <Package className="h-5 w-5" /> }
              ].map((stat, idx) => (
                <div key={idx} className="group relative bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all border border-white/10 hover:border-white/30">
                  <div className="flex items-center justify-center gap-2 mb-2 text-yellow-300">
                    {stat.icon}
                  </div>
                  <div className="text-4xl font-bold text-yellow-300 group-hover:scale-110 transition-transform">{stat.value}</div>
                  <div className="text-sm text-gray-300 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave separator avec animation */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-auto" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white">
              <animate attributeName="d"
                dur="10s"
                repeatCount="indefinite"
                values="
                  M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z;
                  M0 0L60 15C120 30 240 30 360 36.7C480 43 600 57 720 53.3C840 50 960 30 1080 36.7C1200 43 1320 77 1380 83.3L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z;
                  M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z
                "
              />
            </path>
          </svg>
        </div>
      </section>

      {/* Features Section - Version Dynamique */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold mb-4">
              <Star className="h-4 w-4" />
              Avantages
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi Choisir EduTrack ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une solution pensée pour les directeurs d'établissement au Cameroun
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Zap className="h-8 w-8" />,
                title: 'Gratuit pour Démarrer',
                description: 'App Core gratuite à vie avec gestion élèves, classes et enseignants',
                color: 'from-green-500 to-green-600',
                delay: '0'
              },
              {
                icon: <Package className="h-8 w-8" />,
                title: 'Modulaire',
                description: "N'achetez que ce dont vous avez besoin. Ajoutez des apps quand vous voulez",
                color: 'from-blue-500 to-blue-600',
                delay: '100'
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: '30 Jours d\'Essai',
                description: 'Testez chaque application gratuitement pendant 30 jours',
                color: 'from-purple-500 to-purple-600',
                delay: '200'
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: 'Multi-Pays',
                description: 'Adapté au Cameroun, Sénégal, France avec devises locales',
                color: 'from-orange-500 to-orange-600',
                delay: '300'
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:-translate-y-2"
                style={{ animationDelay: `${feature.delay}ms` }}
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Applications Section - Version Dynamique */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-semibold mb-4 shadow-md">
              <Package className="h-4 w-4 text-primary-600" />
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                8 Applications Modulaires
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Une Plateforme, Multiples Possibilités
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Commencez avec l'App Core gratuite, puis ajoutez les modules selon vos besoins
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {apps.map((app, idx) => (
              <div
                key={app.id}
                className="group bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className={`relative bg-gradient-to-br ${app.color} p-6 text-white`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="relative flex items-center justify-between mb-4">
                    <div className="transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                      {app.icon}
                    </div>
                    {app.isFree && (
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold animate-pulse">
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
                    <div className="text-center pt-4 border-t border-gray-200">
                      <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-2">
                        <Sparkles className="h-5 w-5 animate-pulse" />
                        GRATUIT
                      </div>
                      <div className="text-xs text-gray-500 mt-1">À vie</div>
                    </div>
                  ) : (
                    <div className="text-center pt-4 border-t border-gray-200">
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

      {/* Pricing Section - Version Dynamique */}
      <section id="pricing" className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-semibold mb-4">
              <TrendingDown className="h-4 w-4" />
              Économisez jusqu'à 20 000 FCFA
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Packs Tout Inclus
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ou achetez chaque application séparément selon vos besoins
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {bundles.map((bundle, idx) => (
              <div
                key={bundle.id}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  bundle.popular
                    ? 'border-2 border-primary-500 ring-4 ring-primary-100 transform scale-105 shadow-2xl'
                    : 'border border-gray-200 shadow-lg hover:shadow-2xl hover:-translate-y-2'
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {bundle.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-1 text-xs font-bold rounded-bl-lg flex items-center gap-1">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    RECOMMANDÉ
                  </div>
                )}

                <div className={`p-8 text-center ${bundle.popular ? 'bg-gradient-to-br from-primary-50 to-primary-100' : 'bg-gray-50'}`}>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-md mb-4">
                    <Package className={`h-8 w-8 ${bundle.popular ? 'text-primary-600' : 'text-gray-600'}`} />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{bundle.name}</h3>
                  <p className="text-gray-600 mb-6">{bundle.description}</p>

                  <div className="flex items-baseline gap-2 justify-center mb-3">
                    <span className="text-4xl font-bold text-gray-900">
                      {bundle.price.toLocaleString()}
                    </span>
                    <span className="text-gray-600">FCFA/an</span>
                  </div>

                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                    <TrendingDown className="h-4 w-4" />
                    <span>Économie {bundle.savings.toLocaleString()} FCFA</span>
                  </div>
                </div>

                <div className="p-8 bg-white">
                  <h4 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary-600" />
                    Inclus
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

                  <div className="pt-6 border-t border-gray-200 mb-6">
                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">Avantages</h4>
                    <ul className="space-y-2">
                      {bundle.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <Check className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => navigate('/signup')}
                    className={`w-full py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 ${
                      bundle.popular
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    <span>Commencer Maintenant</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à Moderniser Votre Établissement ?
          </h2>
          <p className="text-xl text-gray-200 mb-8 leading-relaxed">
            Créez votre compte gratuitement en 2 minutes.<br />
            <span className="text-yellow-300 font-semibold">Aucune carte bancaire requise.</span>
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="group px-10 py-5 bg-white text-primary-700 rounded-xl font-bold text-lg hover:bg-yellow-300 hover:text-primary-900 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 inline-flex items-center gap-3"
          >
            <Zap className="h-6 w-6 group-hover:animate-bounce" />
            <span>Créer Mon Compte Gratuit</span>
            <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
          </button>

          <p className="text-sm text-gray-300 mt-6">
            Déjà un compte ? <button onClick={() => navigate('/login')} className="underline hover:text-white font-semibold">Se connecter</button>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <img
                src="/assets/images/mon_logo.png"
                alt="EduTrack Logo"
                className="h-10 w-10 object-contain"
              />
              <span className="text-xl font-bold text-white">EduTrack</span>
            </div>
            <p className="text-sm text-center md:text-left">
              © 2025 EduTrack. Solution modulaire de gestion scolaire pour le Cameroun.
            </p>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, 10px); }
        }
      `}</style>
    </div>
  );
}
