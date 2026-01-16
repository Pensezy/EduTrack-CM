/**
 * Landing Page - Point d'entrée public de EduTrack
 * Version finale : Focus gestion d'établissement & Visuel réel
 * Logique de base de données (apps/bundles) strictement conservée.
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

  // Mapping des icônes par slug d'app (Votre code original conservé)
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
      // Récupération dynamique des applications (v_apps_catalog)
      const { data: appsData, error: appsError } = await supabase
        .from('v_apps_catalog')
        .select('*')
        .eq('status', 'active')
        .order('sort_order');

      if (appsError) throw appsError;

      // Récupération dynamique des packs (v_bundles_catalog)
      const { data: bundlesData, error: bundlesError } = await supabase
        .from('v_bundles_catalog')
        .select('*')
        .order('sort_order');

      if (bundlesError) throw bundlesError;

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
        price: app.price_yearly,
        priceFormatted: app.price_yearly_formatted,
        developmentStatus: app.development_status
      }));

      const formattedBundles = bundlesData.map(bundle => ({
        id: bundle.id,
        name: bundle.name,
        description: bundle.description,
        price: bundle.price_yearly,
        priceFormatted: bundle.price_formatted,
        savings: bundle.savings,
        savingsFormatted: bundle.savings_formatted,
        apps: bundle.app_ids || [],
        appNames: bundle.app_names || [],
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
    <div className="min-h-screen bg-white">
      {/* HERO SECTION - Thème Gestion d'Établissement */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 0%)`, backgroundSize: '100px 100px' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-center gap-4 mb-6">
              <img src="/assets/images/mon_logo.png" alt="EduTrack Logo" className="h-20 w-20 object-contain" />
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">Edu<span className="text-yellow-300">Track</span></h1>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              La Gestion d'Établissement <br />
              <span className="text-yellow-300 font-black">Unifiée et Simplifiée.</span>
            </h2>

            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed italic">
              "Tout est lié, tout est récupérable en un clic sans complication."
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button onClick={() => navigate('/signup')} className="px-8 py-4 bg-white text-primary-700 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all shadow-xl flex items-center gap-2">
                <Zap className="h-5 w-5" /> Démarrer gratuitement
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold border-2 border-white/30 flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" /> Voir la Démo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION VISUELLE - Intégration de votre image Dashboard.png */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">Pilotez votre école avec précision</h2>
              <p className="text-lg text-gray-600">
                Grâce à une interface pensée pour les directeurs, centralisez la pédagogie, l'administration et la finance sur un seul écran.
              </p>
              <ul className="space-y-4 font-medium">
                <li className="flex items-center gap-3"><Check className="text-green-600" /> Interconnexion des données en temps réel</li>
                <li className="flex items-center gap-3"><Check className="text-green-600" /> Exportation des rapports en un clic</li>
                <li className="flex items-center gap-3"><Check className="text-green-600" /> Gestion multi-établissements simplifiée</li>
              </ul>
            </div>
            {/* ICI : Remplacement par votre image réelle */}
            <div className="relative group">
              <div className="absolute inset-0 bg-primary-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <img 
                src="/assets/images/Dashboard.png" 
                alt="Aperçu du Dashboard EduTrack" 
                className="relative rounded-3xl shadow-2xl border-4 border-gray-100 transition-transform duration-500 hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CATALOGUE D'APPLICATIONS (Récupération dynamique originale) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12 text-gray-900">Modules de gestion à la carte</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="bg-white rounded-2xl h-64 animate-pulse"></div>)
            ) : apps.map((app) => (
              <div key={app.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col">
                <div className={`bg-gradient-to-br ${app.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-2">
                    {app.icon}
                    {app.isFree && <span className="px-2 py-1 bg-white/20 rounded text-[10px] font-bold uppercase">Gratuit</span>}
                  </div>
                  <h3 className="font-bold text-lg">{app.name}</h3>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <p className="text-gray-500 text-xs mb-4 line-clamp-2">{app.description}</p>
                  <div>
                    <div className="text-xl font-bold text-gray-900 mb-4 italic">
                      {app.isFree ? '0 FCFA' : `${app.price?.toLocaleString()} FCFA`} <span className="text-[10px] text-gray-500 uppercase">/an</span>
                    </div>
                    <button className="w-full py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-bold hover:bg-primary-100 transition-colors">Activer</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKS DE GESTION (Récupération dynamique originale) */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-16">Packs de gestion optimisés</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {bundles.map((bundle) => (
              <div key={bundle.id} className={`rounded-2xl p-8 border ${bundle.popular ? 'border-primary-500 shadow-2xl scale-105 bg-primary-50/30' : 'border-gray-200 shadow-lg'}`}>
                {bundle.popular && <div className="text-primary-600 font-bold text-xs uppercase mb-4 tracking-widest">Le choix des directeurs</div>}
                <h3 className="text-2xl font-bold mb-2">{bundle.name}</h3>
                <div className="text-4xl font-bold mb-4">{bundle.price.toLocaleString()} <span className="text-lg text-gray-500 font-normal underline decoration-primary-500">FCFA/an</span></div>
                <p className="text-gray-600 mb-8 text-sm leading-relaxed">{bundle.description}</p>
                <div className="py-1 px-4 bg-green-100 text-green-800 rounded-full text-xs font-bold mb-8 inline-block">
                  ÉCONOMIE : {bundle.savings.toLocaleString()} FCFA
                </div>
                <button className={`w-full py-4 rounded-xl font-bold transition-all shadow-md ${bundle.popular ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-900 text-white hover:bg-black'}`}>
                  Choisir ce Pack
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-50 text-gray-400 py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <img src="/assets/images/mon_logo.png" alt="EduTrack" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">Edu<span className="text-primary-600">Track</span></span>
          </div>
          <p className="text-xs">© 2026 EduTrack. Solution modulaire de gestion d'établissements au Cameroun.</p>
        </div>
      </footer>
    </div>
  );
}