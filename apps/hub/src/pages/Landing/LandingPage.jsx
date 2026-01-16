/**
 * Landing Page - Point d'entrée public de EduTrack
 * Version réorganisée : Focus sur la gestion intégrée des établissements
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

  // Mapping des icônes par slug d'app (Code original conservé)
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
      // Chargement dynamique original (v_apps_catalog et v_bundles_catalog)
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
      {/* HERO SECTION - Focus Gestion d'Établissement */}
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

            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium mb-8 border border-white/20">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span>Optimisation complète de la gestion d'établissement</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Tout est lié, tout est récupérable <br />
              <span className="text-yellow-300 font-black">En un clic, sans complication.</span>
            </h2>

            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
              La plateforme modulaire qui unifie l'administration, la pédagogie et les finances. 
              <strong> Payez uniquement ce que vous utilisez.</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button onClick={() => navigate('/signup')} className="px-8 py-4 bg-white text-primary-700 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all shadow-xl flex items-center gap-2">
                <Zap className="h-5 w-5" /> Créer Mon Compte Gratuit
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold border-2 border-white/30 flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" /> Explorer la Démo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ARGUMENTS CLÉS - La gestion interconnectée */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">Pourquoi choisir EduTrack pour votre établissement ?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary-100 rounded-lg text-primary-600"><Check /></div>
                  <p className="text-lg"><strong>Interconnexion totale</strong> : Les notes, les paiements et les absences communiquent entre eux en temps réel.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary-100 rounded-lg text-primary-600"><Check /></div>
                  <p className="text-lg"><strong>Récupération instantanée</strong> : Retrouvez n'importe quelle information ou statistique en un clic.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary-100 rounded-lg text-primary-600"><Check /></div>
                  <p className="text-lg"><strong>Multi-Établissement</strong> : Gérez plusieurs écoles ou instituts depuis un seul tableau de bord.</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-3xl p-4 border-8 border-gray-200 shadow-2xl aspect-video flex items-center justify-center italic text-gray-400">
               [Aperçu du Dashboard de Gestion Unifiée]
            </div>
          </div>
        </div>
      </section>

      {/* CATALOGUE D'APPLICATIONS (Récupération dynamique préservée) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Un système modulaire à la carte</h2>
            <p className="text-xl text-gray-600">Activez les modules dont votre établissement a besoin.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-2xl h-64 animate-pulse"></div>
              ))
            ) : apps.map((app) => (
              <div key={app.id} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden flex flex-col">
                <div className={`bg-gradient-to-br ${app.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    {app.icon}
                    {app.isFree && <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">GRATUIT</span>}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{app.name}</h3>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{app.description}</p>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 mb-4">
                      {app.isFree ? '0 FCFA' : `${app.price?.toLocaleString()} FCFA`}
                      <span className="text-xs text-gray-500 block uppercase font-medium">/an</span>
                    </div>
                    <button className="w-full py-2 border-2 border-primary-600 text-primary-600 rounded-lg font-bold hover:bg-primary-50 transition-colors">Activer</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKS TOUT INCLUS (Récupération dynamique préservée) */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Packs Recommandés</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {bundles.map((bundle) => (
              <div key={bundle.id} className={`bg-white rounded-2xl p-8 border ${bundle.popular ? 'border-primary-500 ring-4 ring-primary-100 shadow-2xl scale-105' : 'border-gray-200 shadow-lg'}`}>
                {bundle.popular && <div className="text-primary-600 font-bold text-sm mb-4 uppercase">Le plus complet</div>}
                <h3 className="text-2xl font-bold mb-2">{bundle.name}</h3>
                <div className="text-4xl font-bold mb-4">{bundle.price.toLocaleString()} <span className="text-lg text-gray-500 font-normal">FCFA/an</span></div>
                <p className="text-gray-600 mb-6 text-sm">{bundle.description}</p>
                <div className="py-1 px-3 bg-green-50 text-green-700 rounded-full text-xs font-bold mb-8 inline-block">
                  ÉCONOMIE : {bundle.savings.toLocaleString()} FCFA
                </div>
                <button className={`w-full py-4 rounded-xl font-bold transition-all ${bundle.popular ? 'bg-primary-600 text-white shadow-lg' : 'bg-gray-900 text-white'}`}>
                  Sélectionner ce Pack
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONFIANCE ET SUPPORT LOCAL */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <ShieldCheck className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Sécurité des Données</h3>
            <p className="text-gray-400 text-sm">Sauvegardes quotidiennes et protection renforcée pour assurer la pérennité de vos archives scolaires.</p>
          </div>
          <div>
            <Headphones className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Support WhatsApp Local</h3>
            <p className="text-gray-400 text-sm">Une équipe réactive basée au Cameroun pour vous accompagner dans le paramétrage.</p>
          </div>
          <div>
            <Smartphone className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Multi-Plateforme</h3>
            <p className="text-gray-400 text-sm">Accédez à votre établissement depuis un PC, une tablette ou un smartphone, même en déplacement.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white text-gray-400 py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <img src="/assets/images/mon_logo.png" alt="EduTrack" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold text-gray-900">EduTrack</span>
          </div>
          <p className="text-sm">© 2026 EduTrack. Solution intégrée de gestion pour établissements scolaires.</p>
        </div>
      </footer>
    </div>
  );
}