/**
 * Composant de bannière pour inciter à l'upgrade vers une application payante
 *
 * Utilisé stratégiquement pour convertir les utilisateurs gratuits en clients payants
 * en affichant des messages attractifs avec CTA vers l'App Store.
 *
 * @component
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Crown, Zap } from 'lucide-react';

/**
 * Bannière d'upgrade avec plusieurs variantes visuelles
 *
 * @param {Object} props
 * @param {string} props.title - Titre accrocheur de la bannière
 * @param {string} props.description - Description des bénéfices
 * @param {string} props.targetApp - Nom de l'app cible (ex: "App Académique")
 * @param {string} props.price - Prix en FCFA (ex: "75 000")
 * @param {string} [props.variant='warning'] - Style visuel: 'warning' | 'info' | 'premium'
 * @param {string} [props.icon='sparkles'] - Icône: 'sparkles' | 'crown' | 'zap'
 * @param {string} [props.className] - Classes CSS additionnelles
 */
const UpgradeBanner = ({
  title,
  description,
  targetApp,
  price,
  variant = 'warning',
  icon = 'sparkles',
  className = ''
}) => {
  // Variantes de style
  const variants = {
    warning: {
      container: 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300',
      text: 'text-yellow-900',
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      icon: 'text-yellow-600'
    },
    info: {
      container: 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300',
      text: 'text-blue-900',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      icon: 'text-blue-600'
    },
    premium: {
      container: 'bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-purple-300',
      text: 'text-purple-900',
      button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white',
      icon: 'text-purple-600'
    }
  };

  // Icônes disponibles
  const icons = {
    sparkles: Sparkles,
    crown: Crown,
    zap: Zap
  };

  const selectedVariant = variants[variant] || variants.warning;
  const IconComponent = icons[icon] || Sparkles;

  return (
    <div
      className={`rounded-xl border-2 shadow-sm ${selectedVariant.container} ${className}`}
      role="region"
      aria-label="Bannière d'upgrade premium"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icône */}
          <div className={`flex-shrink-0 ${selectedVariant.icon}`}>
            <IconComponent className="h-6 w-6" strokeWidth={2} />
          </div>

          {/* Contenu */}
          <div className="flex-1 min-w-0">
            {/* Titre */}
            <h3 className={`font-semibold text-sm mb-1 ${selectedVariant.text}`}>
              {title}
            </h3>

            {/* Description */}
            <p className={`text-sm mb-3 ${selectedVariant.text} opacity-90`}>
              {description}
            </p>

            {/* Bouton CTA */}
            <Link
              to="/app-store"
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium ${selectedVariant.button}`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Découvrir {targetApp}</span>
              <span className="font-bold">({price} FCFA/an)</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeBanner;

/**
 * Variante compacte de la bannière (pour sidebar ou espaces restreints)
 */
export const CompactUpgradeBanner = ({ targetApp, price, variant = 'premium' }) => {
  const variants = {
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-900',
    info: 'bg-blue-100 border-blue-400 text-blue-900',
    premium: 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-400 text-purple-900'
  };

  const selectedVariant = variants[variant] || variants.premium;

  return (
    <Link
      to="/app-store"
      className={`block rounded-lg border-2 p-3 ${selectedVariant} hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center gap-2">
        <Crown className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate">Passer à {targetApp}</p>
          <p className="text-xs opacity-75">{price} FCFA/an</p>
        </div>
        <ArrowRight className="h-4 w-4 flex-shrink-0" />
      </div>
    </Link>
  );
};

/**
 * Bannière de blocage (quand limite atteinte)
 */
export const BlockingUpgradeBanner = ({ title, description, targetApp, price }) => {
  return (
    <div className="rounded-xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg">
      <div className="p-5">
        <div className="flex items-start gap-3">
          {/* Icône d'alerte */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Zap className="h-6 w-6 text-red-600" strokeWidth={2.5} />
            </div>
          </div>

          {/* Contenu */}
          <div className="flex-1">
            <h3 className="font-bold text-base text-red-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-red-800 mb-4">
              {description}
            </p>

            {/* Bouton CTA proéminent */}
            <Link
              to="/app-store"
              className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 font-semibold text-sm"
            >
              <Crown className="h-5 w-5" />
              <span>Upgrader vers {targetApp}</span>
              <span>({price} FCFA/an)</span>
              <ArrowRight className="h-5 w-5 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
