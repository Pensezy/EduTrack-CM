import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  School, Users, BookOpen, FileText, MessageSquare, BarChart3,
  Calendar, DollarSign, Check, ArrowRight, Sparkles, TrendingDown,
  Package, Shield, Zap, Globe, Star, ChevronRight, Loader,
  LayoutDashboard, Smartphone, ShieldCheck, Headphones, LogIn
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [apps, setApps] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapping des icônes original
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
      // Chargement original depuis la BDD
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

      // Mapping des données avec les noms de colonnes exacts de votre BDD
      const formattedApps = appsData.map(app => ({
        id: app.id,
        slug: app.slug,
        name: app.name,
        icon: appIcons[app.slug] || <School className="h-8 w-8" />,
        description: app.description,
        category: app.is_core ? 'Gratuit' : app.category,
        color: categoryColors[app.category] || 'from-gray-500 to-gray-600',
        features: app.features || [],
        isFree: app.is_core,
        price: app.price_yearly, // Récupération du prix BDD
        priceFormatted: app.price_yearly_formatted
      }));

      const formattedBundles = bundlesData.map(bundle => ({
        id: bundle.id,
        name: bundle.name,
        description: bundle.description,
        price: bundle.price_yearly, // Récupération du prix BDD
        priceFormatted: bundle.price_formatted,
        savings: bundle.savings, // Récupération des économies BDD
        apps: bundle.app_ids || [],
        features: Object.values(bundle.features_extra || {}),
        popular: bundle.is_recommended || false
      }));

      setApps(formattedApps);
      setBundles(formattedBundles);
    } catch (error) {
      console.error('❌ Erreur chargement apps/bundles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* HEADER : Zone de connexion en haut */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/assets/images/mon_logo.png" alt="Logo" className="h-9 w-9" />
            <span className="text-xl font-bold text-primary-700 tracking-tighter">EduTrack</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-primary-600 transition-colors">
              <LogIn className="h-4 w-4" /> Se connecter
            </button>
            <button onClick={() => navigate('/signup')} className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-md">
              Créer un compte
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION : Interconnexion et Thème de gestion */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-20 md:py-28 text-center">
        <div className="relative max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            La Gestion d'Établissement <br />
            <span className="text-yellow-300 font-black tracking-tight">Unifiée et Simplifiée.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto font-medium">
            "Tout est lié, tout est récupérable en un clic sans complication."
          </p>
          <button onClick={() => navigate('/signup')} className="px-10 py-5 bg-white text-primary-700 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all shadow-2xl flex items-center gap-2 mx-auto">
            <Zap className="h-6 w-6" /> Commencer gratuitement
          </button>
        </div>
      </section>

      {/* SECTION VISUELLE : Image Dashboard.png */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">Pilotez votre école avec précision</h2>
              <p className="text-lg text-gray-600 leading-relaxed">EduTrack centralise chaque aspect de la vie scolaire. Une donnée saisie est immédiatement disponible partout : administration, pédagogie et finance.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Smartphone className="text-primary-600" /> <span className="text-sm font-bold">Optimisé Mobile & Offline</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <ShieldCheck className="text-primary-600" /> <span className="text-sm font-bold">Sécurité renforcée par PIN</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Headphones className="text-primary-600" /> <span className="text-sm font-bold">Support Local 7j/7</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Globe className="text-primary-600" /> <span className="text-sm font-bold">Multi-Établissement</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img src="/assets/images/Dashboard.png" alt="Aperçu du Dashboard" className="rounded-3xl shadow-2xl border border-gray-100 transition-transform hover:scale-[1.01] duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* CATALOGUE DES APPLICATIONS (Correction prix et bouton) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-900">Modules de Gestion</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? <Loader className="mx-auto animate-spin h-10 w-10 text-primary-600" /> : apps.map((app) => (
              <div key={app.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
                <div className={`bg-gradient-to-br ${app.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4 font-bold uppercase tracking-widest text-xs">
                    {app.icon}
                    {app.isFree && <span className="bg-white/20 px-3 py-1 rounded-full">Gratuit</span>}
                  </div>
                  <h3 className="text-xl font-bold">{app.name}</h3>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-gray-600 text-sm mb-6">{app.description}</p>
                  <ul className="space-y-2 mb-8 flex-1">
                    {app.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-500 font-medium">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-6 border-t border-gray-100">
                    <div className="text-2xl font-bold text-gray-900 mb-4">
                      {/* Affichage sécurisé du prix */}
                      {app.isFree ? '0 FCFA' : `${(app.price || 0).toLocaleString()} FCFA`} 
                      <span className="text-xs text-gray-500 uppercase tracking-tighter"> / an</span>
                    </div>
                    <button onClick={() => navigate('/signup')} className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors">
                      Commencer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKS TOUT INCLUS (Correction prix et bouton) */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Packs Tout-en-un</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {bundles.map((bundle) => (
              <div key={bundle.id} className={`bg-white rounded-3xl p-8 border-2 flex flex-col ${bundle.popular ? 'border-primary-500 shadow-2xl scale-105' : 'border-gray-100 shadow-xl'}`}>
                <h3 className="text-2xl font-bold mb-4">{bundle.name}</h3>
                {/* Affichage sécurisé du prix */}
                <div className="text-4xl font-bold mb-2">{(bundle.price || 0).toLocaleString()} <span className="text-lg text-gray-400 font-normal">FCFA/an</span></div>
                <div className="text-green-600 text-sm font-bold mb-8 italic">Économie de {(bundle.savings || 0).toLocaleString()} FCFA</div>
                
                <div className="mb-8 flex-1">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 italic">Inclus dans le pack :</h4>
                  <ul className="space-y-3">
                    {bundle.apps.map((appId) => {
                      const app = apps.find(a => a.id === appId);
                      return app ? <li key={appId} className="flex items-center gap-2 text-sm font-bold text-gray-600"><Check className="h-4 w-4 text-primary-500" /> {app.name}</li> : null;
                    })}
                  </ul>
                </div>

                <button onClick={() => navigate('/signup')} className={`w-full py-4 rounded-xl font-bold transition-all ${bundle.popular ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg' : 'bg-gray-900 text-white'}`}>
                  Commencer
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-500 py-12 text-center border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/assets/images/mon_logo.png" alt="Logo" className="h-10 w-10 opacity-70" />
            <span className="text-xl font-bold text-white tracking-tight italic">EduTrack</span>
          </div>
          <p className="text-sm">© 2026 EduTrack. Solution de gestion interconnectée pour le Cameroun.</p>
        </div>
      </footer>
    </div>
  );
}
