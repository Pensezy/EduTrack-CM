/**
 * Landing Page - EduTrack
 * Version Complète : Navigation, Gestion d'Établissement Unifiée et Support Local
 */

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

  // Mapping des icônes par slug d'app (Code original préservé)
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
        isFree: app.is_core,
        features: app.features || []
      }));

      const formattedBundles = bundlesData.map(bundle => ({
        ...bundle,
        features: Object.values(bundle.features_extra || {}),
        popular: bundle.is_recommended || false,
        apps: bundle.app_ids || []
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
      {/* 1. BARRE DE NAVIGATION (HEADER) */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <img src="/assets/images/mon_logo.png" alt="EduTrack Logo" className="h-10 w-10 object-contain" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">Edu<span className="text-primary-600">Track</span></span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => document.getElementById('features').scrollIntoView({behavior: 'smooth'})} className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Avantages</button>
              <button onClick={() => document.getElementById('pricing').scrollIntoView({behavior: 'smooth'})} className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Tarifs</button>
            </nav>

            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-primary-600 px-3 py-2 transition-colors">
                <LogIn className="h-4 w-4" />
                Se connecter
              </button>
              <button onClick={() => navigate('/signup')} className="hidden sm:block text-sm font-bold bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-all shadow-md hover:shadow-lg">
                Essayer gratuitement
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-20 md:py-28">
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            La Gestion d'Établissement <br />
            <span className="text-yellow-300 font-black">Unifiée et Simplifiée.</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-100 mb-12 max-w-3xl mx-auto leading-relaxed italic">
            "Tout est lié, tout est récupérable en un clic sans complication."
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/signup')} className="px-10 py-4 bg-white text-primary-700 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all shadow-2xl flex items-center gap-2">
              <Zap className="h-5 w-5" /> Créer Mon Compte Gratuit
            </button>
          </div>
        </div>
      </section>

      {/* 3. SECTION VISUELLE (Dashboard.png) & PILIERS */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">Une interconnexion totale au service de votre école</h2>
              <p className="text-lg text-gray-600">EduTrack centralise chaque aspect de votre établissement. Une note saisie met à jour instantanément les statistiques, les bulletins et les alertes parents.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-primary-600"><Check className="h-5 w-5" /></div>
                  <p className="text-sm"><strong>Récupération un clic</strong> : Accédez à vos rapports administratifs instantanément.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-primary-600"><Smartphone className="h-5 w-5" /></div>
                  <p className="text-sm"><strong>Optimisé Mobile</strong> : Gérez vos données même avec une connexion instable.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-primary-600"><ShieldCheck className="h-5 w-5" /></div>
                  <p className="text-sm"><strong>Sécurité Totale</strong> : Sauvegardes quotidiennes et accès sécurisé par PIN.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-primary-600"><Headphones className="h-5 w-5" /></div>
                  <p className="text-sm"><strong>Support Local</strong> : Assistance réactive basée à Douala et Yaoundé.</p>
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary-100 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <img 
                src="/assets/images/Dashboard.png" 
                alt="Aperçu Dashboard EduTrack" 
                className="relative rounded-3xl shadow-2xl border border-gray-100 transform transition-transform duration-500 hover:scale-[1.01]" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. CATALOGUE DES APPLICATIONS (Détails rétablis) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Système Modulaire à la Carte</h2>
            <p className="text-gray-600">Commencez gratuitement et ajoutez les modules dont vous avez besoin.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? <Loader className="mx-auto animate-spin" /> : apps.map((app) => (
              <div key={app.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden transition-transform hover:-translate-y-1">
                <div className={`bg-gradient-to-br ${app.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    {app.icon}
                    {app.isFree && <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">Gratuit</span>}
                  </div>
                  <h3 className="text-xl font-bold">{app.name}</h3>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3">{app.description}</p>
                  
                  {/* Rétablissement des fonctionnalités détaillées */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {app.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-500">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-6 border-t border-gray-50">
                    <div className="text-2xl font-bold text-gray-900 mb-4">
                      {app.isFree ? '0 FCFA' : `${app.price?.toLocaleString()} FCFA`} <span className="text-xs text-gray-500">/an</span>
                    </div>
                    <button onClick={() => navigate('/signup')} className="w-full py-3 bg-primary-50 text-primary-700 rounded-xl font-bold hover:bg-primary-100 transition-colors">
                      Activer ce module
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PACKS RECOMMANDÉS (Détails rétablis) */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Packs Tout-en-un</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {bundles.map((bundle) => (
              <div key={bundle.id} className={`bg-white rounded-3xl p-8 border-2 ${bundle.popular ? 'border-primary-500 shadow-2xl scale-105 relative' : 'border-gray-100 shadow-xl'}`}>
                {bundle.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase">Recommandé</div>}
                <h3 className="text-2xl font-bold mb-2">{bundle.name}</h3>
                <div className="text-4xl font-bold mb-4">{bundle.price.toLocaleString()} <span className="text-lg text-gray-400 font-normal">FCFA/an</span></div>
                <div className="py-1 px-4 bg-green-50 text-green-700 rounded-full text-xs font-bold mb-8 inline-block">ÉCONOMIE : {bundle.savings.toLocaleString()} FCFA</div>
                
                {/* Rétablissement de la liste des applications incluses */}
                <div className="mb-8 space-y-4">
                  <h4 className="text-sm font-bold uppercase text-gray-400 tracking-widest">Inclus dans le pack :</h4>
                  <ul className="grid grid-cols-1 gap-3">
                    {bundle.apps.map((appId) => {
                      const app = apps.find(a => a.id === appId);
                      return app ? (
                        <li key={appId} className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <div className="p-1 bg-primary-50 rounded-md"><Check className="h-3 w-3 text-primary-600" /></div>
                          {app.name}
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>

                <button onClick={() => navigate('/signup')} className={`w-full py-4 rounded-xl font-bold transition-all shadow-md ${bundle.popular ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-900 text-white hover:bg-black'}`}>
                  Choisir ce pack
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <img src="/assets/images/mon_logo.png" alt="EduTrack" className="h-12 w-12 object-contain" />
            <span className="text-2xl font-bold text-white">EduTrack</span>
          </div>
          <p className="text-sm mb-8">La plateforme de gestion d'établissement interconnectée pour le Cameroun.</p>
          <p className="text-xs">© 2026 EduTrack. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}