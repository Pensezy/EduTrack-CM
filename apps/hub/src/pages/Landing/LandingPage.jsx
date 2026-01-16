/**
 * Landing Page V2 - EduTrack
 * Optimisée pour le marché camerounais et la gestion intelligente
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  School, Users, BookOpen, FileText, MessageSquare, BarChart3,
  Calendar, DollarSign, Check, ArrowRight, Sparkles, TrendingDown,
  Package, Shield, Zap, Globe, Star, ChevronRight, LayoutDashboard,
  Smartphone, ShieldCheck, Headphones
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [apps, setApps] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    loadAppsAndBundles();
  }, []);

  const loadAppsAndBundles = async () => {
    try {
      const { data: appsData } = await supabase.from('v_apps_catalog').select('*').eq('status', 'active').order('sort_order');
      const { data: bundlesData } = await supabase.from('v_bundles_catalog').select('*').order('sort_order');

      setApps(appsData || []);
      setBundles(bundlesData || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* 1. HERO SECTION - L'argument Choc */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium mb-8 border border-white/20">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span>La 1ère solution d'orientation intelligente au Cameroun</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Gérez votre établissement <br />
            <span className="text-yellow-300">En un clic, sans complication.</span>
          </h1>

          <p className="text-xl text-gray-200 mb-10 max-w-3xl mx-auto">
            Tout est lié : de l'inscription au bulletin final. <br />
            <strong>Payez uniquement ce que vous utilisez.</strong> Commencez avec l'essentiel gratuitement.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/signup')} className="px-8 py-4 bg-yellow-400 text-primary-900 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all shadow-lg flex items-center gap-2">
              <Zap className="h-5 w-5" /> Créer mon compte gratuit
            </button>
            <button className="px-8 py-4 bg-white/10 text-white rounded-xl font-semibold border border-white/30 hover:bg-white/20 transition-all">
              Essayer la démo (1 clic)
            </button>
          </div>
        </div>
      </section>

      {/* 2. L'AVANTAGE "TOUT LIÉ" - Question 14 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Pourquoi EduTrack est différent ?</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-primary-100 p-3 rounded-lg h-fit"><LayoutDashboard className="text-primary-600" /></div>
                  <div>
                    <h3 className="font-bold text-lg">Tout est interconnecté</h3>
                    <p className="text-gray-600">Une note entrée par un prof génère automatiquement le bulletin, met à jour les stats de l'école et prévient le parent.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-green-100 p-3 rounded-lg h-fit"><Smartphone className="text-green-600" /></div>
                  <div>
                    <h3 className="font-bold text-lg">Optimisé pour le Cameroun</h3>
                    <p className="text-gray-600">Fonctionne même avec une connexion instable. Accès rapide sur mobile pour les parents et enseignants.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-3xl p-4 border-8 border-gray-200 shadow-2xl">
               {/* Placeholder pour capture d'écran de l'interface / Bulletin */}
               <div className="aspect-video bg-gray-300 rounded-xl flex items-center justify-center text-gray-500 font-medium">
                  [Capture d'écran : Dashboard EduTrack & Bulletin Scolaire]
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. L'ORIENTATION INTELLIGENTE - Question 2 & 13 */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Aide à l'Orientation de Nouvelle Génération</h2>
          <p className="text-lg text-gray-600 mb-12">
            EduTrack ne se contente pas de stocker des notes. Notre intelligence aide vos élèves à choisir la bonne série (Scientifique, Littéraire, Technique) en analysant leurs résultats et leur profil.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary-100">
              <BarChart3 className="mx-auto mb-4 text-primary-600 h-10 w-10" />
              <h4 className="font-bold mb-2">Analyse des Notes</h4>
              <p className="text-sm text-gray-500">Détection automatique des points forts par matière.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary-100">
              <Users className="mx-auto mb-4 text-primary-600 h-10 w-10" />
              <h4 className="font-bold mb-2">Profil Social</h4>
              <p className="text-sm text-gray-500">Prise en compte du contexte de l'élève pour une orientation réaliste.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary-100">
              <Check className="mx-auto mb-4 text-primary-600 h-10 w-10" />
              <h4 className="font-bold mb-2">Décision Simplifiée</h4>
              <p className="text-sm text-gray-500">Un rapport clair pour le conseil de classe en un clic.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MODULARITÉ & PRIX - Question 5 & 10 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">Des outils puissants, à votre rythme</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* L'App Core - Bien distincte */}
            <div className="border-2 border-green-500 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">GRATUIT À VIE</div>
              <School className="h-12 w-12 text-green-500 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Pack de Base (Core)</h3>
              <ul className="text-left space-y-3 mb-8 text-gray-600">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Inscription des élèves</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Gestion des classes & profs</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Impression de cartes scolaires</li>
              </ul>
              <button className="w-full py-3 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition-all">Démarrer gratuitement</button>
            </div>

            {/* Modules Payants */}
            <div className="border border-gray-200 rounded-3xl p-8 hover:shadow-xl transition-all">
              <DollarSign className="h-12 w-12 text-primary-600 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Finance & Scolarité</h3>
              <p className="text-gray-500 mb-6 text-sm">Suivez les paiements, gérez les relances et imprimez les reçus instantanément.</p>
              <div className="text-2xl font-bold mb-6">45.000 <span className="text-sm font-normal text-gray-500">FCFA/an</span></div>
              <button className="w-full py-3 border border-primary-600 text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition-all">En savoir plus</button>
            </div>

            <div className="border border-gray-200 rounded-3xl p-8 hover:shadow-xl transition-all">
              <BookOpen className="h-12 w-12 text-purple-600 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Notes & Bulletins</h3>
              <p className="text-gray-500 mb-6 text-sm">Saisie simplifiée pour les profs et calcul automatique des moyennes.</p>
              <div className="text-2xl font-bold mb-6">35.000 <span className="text-sm font-normal text-gray-500">FCFA/an</span></div>
              <button className="w-full py-3 border border-purple-600 text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-all">En savoir plus</button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SÉRÉNITÉ & SÉCURITÉ - Question 12 */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <ShieldCheck className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Données Sécurisées</h3>
              <p className="text-gray-400 text-sm">Sauvegardes automatiques chaque jour. Vos données sont protégées et vous appartiennent.</p>
            </div>
            <div>
              <Smartphone className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Accès 24h/7j</h3>
              <p className="text-gray-400 text-sm">Consultez vos rapports financiers ou académiques depuis votre téléphone, n'importe où.</p>
            </div>
            <div>
              <Headphones className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Support de Proximité</h3>
              <p className="text-gray-400 text-sm">Une équipe à Douala et Yaoundé pour vous accompagner. Assistance via WhatsApp en 5 min.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/assets/images/mon_logo.png" className="h-8 w-8" alt="Logo" />
            <span className="font-bold text-xl">EduTrack</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 EduTrack. Conçu pour l'excellence scolaire au Cameroun.</p>
          <div className="flex gap-4">
            <button className="text-primary-600 font-semibold">Contactez-nous</button>
          </div>
        </div>
      </footer>
    </div>
  );
}