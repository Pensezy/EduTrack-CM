/**
 * Landing Page - Point d'entrée public de EduTrack
 * Version optimisée : Gestion intelligente, simplicité "un clic" et réalités locales.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  School, Users, BookOpen, FileText, MessageSquare, BarChart3,
  Calendar, DollarSign, Check, ArrowRight, Sparkles, TrendingDown,
  Package, Shield, Zap, Globe, Star, ChevronRight, Loader,
  LayoutDashboard, Smartphone, ShieldCheck, Headphones
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [apps, setApps] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Couleurs du Design System unifié
  const appIcons = {
    'core': <School className="h-8 w-8" />,
    'notes-evaluations': <BookOpen className="h-8 w-8" />,
    'comptabilite': <DollarSign className="h-8 w-8" />,
    'communication': <MessageSquare className="h-8 w-8" />,
    'emplois-du-temps': <Calendar className="h-8 w-8" />,
    'absences-discipline': <FileText className="h-8 w-8" />,
    'bibliotheque': <BookOpen className="h-8 w-8" />,
    'statistiques-rapports': <BarChart3 className="h-8 w-8" />,
    'e-learning': <BookOpen className="h-8 w-8" />
  };

  const categoryColors = {
    pedagogy: 'from-blue-500 to-blue-600',
    administration: 'from-yellow-500 to-yellow-600',
    analytics: 'from-orange-500 to-orange-600',
    communication: 'from-green-500 to-green-600',
    core: 'from-primary-500 to-primary-600'
  };

  useEffect(() => {
    setIsVisible(true);
    loadAppsAndBundles();
  }, []);

  const loadAppsAndBundles = async () => {
    try {
      const { data: appsData, error: appsError } = await supabase
        .from('v_apps_catalog')
        .select('*')
        .eq('status', 'active')
        .order('sort_order');

      if (appsError) throw appsError;

      const { data: bundlesData, error: bundlesError } = await supabase
        .from('v_bundles_catalog')
        .select('*')
        .order('sort_order');

      if (bundlesError) throw bundlesError;

      const formattedApps = appsData.map(app => ({
        ...app,
        icon: appIcons[app.slug] || <School className="h-8 w-8" />,
        color: categoryColors[app.category] || 'from-gray-500 to-gray-600',
        isFree: app.is_core
      }));

      setApps(formattedApps);
      setBundles(bundlesData.map(bundle => ({
        ...bundle,
        features: Object.values(bundle.features_extra || {}),
        popular: bundle.is_recommended || false
      })));
    } catch (error) {
      console.error('❌ Erreur chargement apps/bundles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. HERO SECTION - Message "Un clic" et Orientation */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 0%)`,
            backgroundSize: '100px 100px',
            animation: 'float 20s linear infinite'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-center gap-4 mb-6">
              <img src="/assets/images/mon_logo.png" alt="EduTrack Logo" className="h-20 w-20 object-contain drop-shadow-2xl" />
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">Edu<span className="text-yellow-300">Track</span></h1>
            </div>

            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium mb-8 border border-white/20">
              <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
              <span>La première solution d'orientation intelligente au Cameroun</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Gérez Votre Établissement <br />
              <span className="text-yellow-300">En un clic, sans complication.</span>
            </h2>

            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
              Tout est lié, tout est récupérable instantanément. <br />
              <strong>Payez uniquement ce que vous utilisez.</strong> Démarrez gratuitement.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button onClick={() => navigate('/signup')} className="px-8 py-4 bg-white text-primary-700 rounded-xl font-bold text-lg hover:bg-yellow-300 hover:text-primary-900 transition-all shadow-xl flex items-center gap-2">
                <Zap className="h-5 w-5" /> Créer Mon Compte Gratuit
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border-2 border-white/30 flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" /> Essayer la Démo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION DIFFÉRENCIATION - Pourquoi EduTrack ? */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Une gestion fluide et interconnectée</h2>
              <p className="text-lg text-gray-600">
                Contrairement aux fichiers Excel isolés, EduTrack lie chaque action : une note entrée par un professeur met à jour le bulletin, notifie le parent et alimente les statistiques d'orientation en temps réel.
              </p>
              <div className="space-y-4">
                {[
                  { icon: <Check className="text-green-600" />, text: "Récupération des données en un clic" },
                  { icon: <Smartphone className="text-primary-600" />, text: "Gestion optimisée pour mobile et connexions instables" },
                  { icon: <ShieldCheck className="text-blue-600" />, text: "Sauvegardes automatiques et sécurité renforcée" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 font-medium">
                    <div className="p-1 bg-gray-100 rounded-full">{item.icon}</div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gray-100 rounded-3xl p-4 border-8 border-gray-200 shadow-2xl aspect-video flex items-center justify-center overflow-hidden">
                {/* Espace pour image du Bulletin Scolaire ou Dashboard */}
                <span className="text-gray-400 font-medium italic">[Aperçu : Bulletin de notes généré en un clic]</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION ORIENTATION INTELLIGENTE - Votre innovation de mémoire */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-semibold mb-4 shadow-sm text-primary-700 border border-primary-100">
            <Sparkles className="h-4 w-4" /> Innovation Exclusive
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Aide à l'Orientation Automatisée</h2>
          <p className="text-xl text-gray-600 mb-12">
            EduTrack analyse les résultats scolaires <strong>et le profil socio-économique</strong> pour guider les élèves de 3ème vers la 2nde (Scientifique, Littéraire ou Technique) de manière juste et éclairée.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-primary-100 hover:shadow-md transition-shadow">
              <BarChart3 className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Analyse Académique</h3>
              <p className="text-gray-500 text-sm">Détection automatique des aptitudes réelles par matière.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-primary-100 hover:shadow-md transition-shadow">
              <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Contexte Social</h3>
              <p className="text-gray-500 text-sm">Prise en compte des revenus et facteurs sociaux pour une orientation réaliste.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-primary-100 hover:shadow-md transition-shadow">
              <Zap className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Rapport Instantané</h3>
              <p className="text-gray-500 text-sm">Préparez vos conseils de classe avec des données objectives en un clic.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. APPLICATIONS SECTION - Gratuit vs Payant */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Payez uniquement ce que vous utilisez</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Commencez avec l'App Core gratuite à vie, puis ajoutez des modules selon vos besoins.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* L'App CORE - Mise en avant */}
            <div className="border-4 border-green-500 rounded-3xl p-8 relative overflow-hidden flex flex-col">
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">GRATUIT À VIE</div>
              <School className="h-12 w-12 text-green-500 mb-6" />
              <h3 className="text-2xl font-bold mb-4">App Core (Base)</h3>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-600" /> Gestion élèves et personnel</li>
                <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-600" /> Gestion des classes et matières</li>
                <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-600" /> Générateur de cartes scolaires</li>
              </ul>
              <button onClick={() => navigate('/signup')} className="w-full py-4 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors">Démarrer Maintenant</button>
            </div>

            {/* Finance - Prix mis à jour */}
            <div className="border border-gray-200 rounded-3xl p-8 hover:shadow-xl transition-all flex flex-col">
              <DollarSign className="h-12 w-12 text-primary-600 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Finance & Scolarité</h3>
              <p className="text-gray-500 mb-6">Paiements, relances automatiques et comptabilité simplifiée.</p>
              <div className="text-3xl font-bold mb-8">45.000 <span className="text-sm font-normal text-gray-500 uppercase tracking-wider">FCFA/an</span></div>
              <button className="w-full py-3 border border-primary-600 text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition-colors">Découvrir le module</button>
            </div>

            {/* Académique - Prix mis à jour */}
            <div className="border border-gray-200 rounded-3xl p-8 hover:shadow-xl transition-all flex flex-col">
              <BookOpen className="h-12 w-12 text-primary-600 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Notes & Bulletins</h3>
              <p className="text-gray-500 mb-6">Saisie des notes, calcul des moyennes et génération de bulletins.</p>
              <div className="text-3xl font-bold mb-8">35.000 <span className="text-sm font-normal text-gray-500 uppercase tracking-wider">FCFA/an</span></div>
              <button className="w-full py-3 border border-primary-600 text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition-colors">Découvrir le module</button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CONFIANCE ET SUPPORT LOCAL */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <ShieldCheck className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Sécurité Maximale</h3>
              <p className="text-gray-400">Accès protégé par PIN, sauvegarde quotidienne et conformité aux exigences locales.</p>
            </div>
            <div>
              <Headphones className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Support WhatsApp 7j/7</h3>
              <p className="text-gray-400">Une question ? Notre équipe à Douala et Yaoundé vous répond en quelques minutes.</p>
            </div>
            <div>
              <Globe className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Multi-Établissement</h3>
              <p className="text-gray-400">Pilotez toutes vos écoles depuis un compte unique avec une vue consolidée.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 bg-gradient-to-br from-primary-700 to-primary-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à moderniser votre établissement ?</h2>
          <p className="text-xl text-gray-200 mb-8 font-medium">Tout est lié. Tout est simple. Tout est EduTrack.</p>
          <button onClick={() => navigate('/signup')} className="px-10 py-5 bg-white text-primary-700 rounded-xl font-bold text-lg hover:bg-yellow-300 hover:text-primary-900 transition-all shadow-2xl flex items-center gap-3 mx-auto">
            <Zap className="h-6 w-6" /> Créer Mon Compte Gratuit
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-500 py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/assets/images/mon_logo.png" alt="EduTrack Logo" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold text-gray-900">EduTrack</span>
          </div>
          <p className="text-sm">© 2026 EduTrack. Solution de gestion scolaire optimisée pour le Cameroun.</p>
        </div>
      </footer>
    </div>
  );
}