/**
 * Landing Page - EduTrack
 * Version rééquilibrée : Rétablissement des listes de fonctionnalités
 * Focus : Gestion d'établissement unifiée
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
        priceFormatted: app.price_yearly_formatted
      }));

      const formattedBundles = bundlesData.map(bundle => ({
        id: bundle.id,
        name: bundle.name,
        description: bundle.description,
        price: bundle.price_yearly,
        savings: bundle.savings,
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
    <div className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-20 md:py-28">
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img src="/assets/images/mon_logo.png" alt="EduTrack Logo" className="h-20 w-20 object-contain" />
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">Edu<span className="text-yellow-300">Track</span></h1>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            La Gestion d'Établissement <br />
            <span className="text-yellow-300">Unifiée et Simplifiée.</span>
          </h2>
          <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto">
            "Tout est lié, tout est récupérable en un clic sans complication."
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/signup')} className="px-8 py-4 bg-white text-primary-700 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all shadow-xl flex items-center gap-2">
              <Zap className="h-5 w-5" /> Créer Mon Compte Gratuit
            </button>
          </div>
        </div>
      </section>

      {/* VISUEL DU DASHBOARD (Dashboard.png) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">Pilotez votre école avec précision</h2>
              <p className="text-lg text-gray-600">Centralisez la pédagogie, l'administration et la finance sur un seul écran grâce à notre interface modulaire.</p>
              <ul className="space-y-4 font-medium">
                <li className="flex items-center gap-3"><Check className="text-green-600" /> Données interconnectées en temps réel</li>
                <li className="flex items-center gap-3"><Check className="text-green-600" /> Exportation des rapports en un clic</li>
                <li className="flex items-center gap-3"><Check className="text-green-600" /> Support local basé au Cameroun</li>
              </ul>
            </div>
            <div className="relative group">
              <img src="/assets/images/Dashboard.png" alt="Aperçu EduTrack" className="relative rounded-3xl shadow-2xl border-4 border-gray-100 transition-transform duration-500 hover:scale-[1.02]" />
            </div>
          </div>
        </div>
      </section>

      {/* CATALOGUE DES APPLICATIONS (Informations Rétablies) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-900">Applications Modulaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {loading ? <Loader className="mx-auto animate-spin" /> : apps.map((app) => (
              <div key={app.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
                <div className={`bg-gradient-to-br ${app.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    {app.icon}
                    {app.isFree && <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase">Gratuit</span>}
                  </div>
                  <h3 className="text-xl font-bold">{app.name}</h3>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-gray-600 text-sm mb-6">{app.description}</p>
                  {/* Rétablissement de la liste des fonctionnalités */}
                  <ul className="space-y-2 mb-8 flex-1">
                    {app.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-500">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-6 border-t border-gray-100">
                    <div className="text-2xl font-bold text-gray-900 mb-4">
                      {app.isFree ? '0 FCFA' : `${app.price?.toLocaleString()} FCFA`} <span className="text-xs text-gray-500">/an</span>
                    </div>
                    <button onClick={() => navigate('/signup')} className="w-full py-3 bg-primary-50 text-primary-700 rounded-xl font-bold hover:bg-primary-100 transition-colors">
                      Commencer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKS TOUT INCLUS (Informations Rétablies) */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-16 text-center">Packs de Gestion Recommandés</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {bundles.map((bundle) => (
              <div key={bundle.id} className={`bg-white rounded-2xl p-8 border-2 ${bundle.popular ? 'border-primary-500 shadow-2xl scale-105' : 'border-gray-200 shadow-lg'}`}>
                <h3 className="text-2xl font-bold mb-2">{bundle.name}</h3>
                <div className="text-4xl font-bold mb-4">{bundle.price.toLocaleString()} <span className="text-lg text-gray-500 font-normal">FCFA/an</span></div>
                <div className="py-1 px-4 bg-green-100 text-green-800 rounded-full text-xs font-bold mb-6 inline-block">ÉCONOMIE : {bundle.savings.toLocaleString()} FCFA</div>
                
                {/* Rétablissement des applications incluses */}
                <div className="mb-8 space-y-3">
                   <h4 className="text-sm font-bold uppercase text-gray-700">Inclus dans ce pack :</h4>
                   <ul className="space-y-2">
                      {bundle.apps.map((appId) => {
                         const app = apps.find(a => a.id === appId);
                         return app ? (
                           <li key={appId} className="flex items-center gap-2 text-sm text-gray-600">
                             <Check className="h-4 w-4 text-primary-500" /> {app.name}
                           </li>
                         ) : null;
                      })}
                   </ul>
                </div>

                <button onClick={() => navigate('/signup')} className={`w-full py-4 rounded-xl font-bold transition-all ${bundle.popular ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-900 text-white hover:bg-black'}`}>
                  Choisir ce Pack
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-50 text-gray-400 py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/assets/images/mon_logo.png" alt="EduTrack" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold text-gray-900 italic">EduTrack</span>
          </div>
          <p className="text-xs text-center">© 2026 EduTrack. Solution modulaire de gestion d'établissements au Cameroun.</p>
        </div>
      </footer>
    </div>
  );
}