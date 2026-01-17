/**
 * Landing Page - EduTrack
 * Correction du crash toLocaleString + Ajout Header & Infos Gestion
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
      {/* 1. ZONE DE NAVIGATION SUPÉRIEURE (Login/Signup) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/assets/images/mon_logo.png" alt="Logo" className="h-9 w-9" />
            <span className="text-xl font-bold text-primary-700">EduTrack</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')} 
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-primary-600 transition-colors"
            >
              <LogIn className="h-4 w-4" /> Se connecter
            </button>
            <button 
              onClick={() => navigate('/signup')} 
              className="bg-primary-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-md"
            >
              Créer un compte
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION - Focus Thème de Mémoire */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-20">
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            La Gestion Intégrée <br />
            <span className="text-yellow-300">De Votre Établissement</span>
          </h1>
          <p className="text-xl text-gray-100 mb-10 max-w-3xl mx-auto italic">
            "Tout est lié, tout est récupérable en un clic sans complication."
          </p>
          <button onClick={() => navigate('/signup')} className="px-10 py-4 bg-yellow-400 text-primary-900 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-xl">
            Essayer gratuitement maintenant
          </button>
        </div>
      </section>

      {/* 3. SECTION VISUELLE - Dashboard.png & Interconnexion */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-900">Une plateforme unique pour tout piloter</h2>
              <p className="text-lg text-gray-600">EduTrack unifie l'administration et la pédagogie. Une action dans un module (ex: paiement) met automatiquement à jour les accès académiques.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Smartphone className="text-primary-600" />
                  <span className="text-sm font-medium">Gestion Mobile & Hors-ligne</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <ShieldCheck className="text-primary-600" />
                  <span className="text-sm font-medium">Sécurité par PIN & Chiffrement</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Headphones className="text-primary-600" />
                  <span className="text-sm font-medium">Support Local WhatsApp 7j/7</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Globe className="text-primary-600" />
                  <span className="text-sm font-medium">Multi-Écoles & Instituts</span>
                </div>
              </div>
            </div>
            {/* Affichage de votre image Dashboard.png */}
            <div className="relative">
              <div className="absolute -inset-4 bg-primary-200 rounded-[3rem] blur-2xl opacity-30"></div>
              <img 
                src="/assets/images/Dashboard.png" 
                alt="Interface EduTrack" 
                className="relative rounded-3xl shadow-2xl border-4 border-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. CATALOGUE DES APPLICATIONS (Sécurisé contre le crash) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Modules à la carte : Payez ce que vous utilisez</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? <div className="col-span-full text-center py-10"><Loader className="animate-spin mx-auto h-10 w-10 text-primary-600" /></div> : apps.map((app) => (
              <div key={app.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col transition-transform hover:-translate-y-2">
                <div className={`bg-gradient-to-br ${app.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-2">
                    {app.icon}
                    {app.isFree && <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">GRATUIT</span>}
                  </div>
                  <h3 className="text-xl font-bold">{app.name}</h3>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <ul className="space-y-2 mb-8 flex-1">
                    {app.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-6 border-t border-gray-100">
                    <div className="text-2xl font-bold text-gray-900 mb-4">
                      {app.isFree ? '0 FCFA' : `${(app.price || 0).toLocaleString()} FCFA`} <span className="text-xs text-gray-500 uppercase">/an</span>
                    </div>
                    <button onClick={() => navigate('/signup')} className="w-full py-3 bg-primary-50 text-primary-700 rounded-xl font-bold hover:bg-primary-100 transition-colors">Activer</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PACKS DE GESTION (Sécurisé contre le crash) */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Packs de Gestion Unifiée</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {bundles.map((bundle) => (
              <div key={bundle.id} className={`rounded-3xl p-8 border-2 flex flex-col ${bundle.popular ? 'border-primary-500 shadow-2xl scale-105' : 'border-gray-200 shadow-lg'}`}>
                <h3 className="text-2xl font-bold mb-4">{bundle.name}</h3>
                {/* Sécurisation du prix avec toLocaleString */}
                <div className="text-4xl font-bold mb-2">{(bundle.price || 0).toLocaleString()} <span className="text-lg text-gray-400 font-normal">FCFA/an</span></div>
                <div className="text-green-600 text-sm font-bold mb-8 italic">Économie de {(bundle.savings || 0).toLocaleString()} FCFA</div>
                
                <div className="mb-8 flex-1">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Applications incluses :</h4>
                  <ul className="space-y-3">
                    {bundle.apps.map((appId) => {
                      const app = apps.find(a => a.id === appId);
                      return app ? <li key={appId} className="flex items-center gap-2 text-sm font-medium text-gray-600"><Check className="h-4 w-4 text-primary-500" /> {app.name}</li> : null;
                    })}
                  </ul>
                </div>

                <button onClick={() => navigate('/signup')} className={`w-full py-4 rounded-xl font-bold shadow-md transition-all ${bundle.popular ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-900 text-white hover:bg-black'}`}>
                  Choisir ce pack
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 text-center border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/assets/images/mon_logo.png" alt="Logo" className="h-10 w-10 opacity-80" />
            <span className="text-xl font-bold text-white tracking-tighter italic">EduTrack</span>
          </div>
          <p className="text-sm">© 2026 EduTrack. Solution de gestion d'établissements optimisée pour le Cameroun.</p>
        </div>
      </footer>
    </div>
  );
}
