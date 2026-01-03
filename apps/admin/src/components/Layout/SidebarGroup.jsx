import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

/**
 * Composant de groupe collapsible pour la sidebar
 * Permet d'organiser les menus en sections logiques
 *
 * @param {Object} props
 * @param {string} props.label - Titre du groupe
 * @param {Component} props.icon - Icône Lucide React du groupe
 * @param {ReactNode} props.children - Éléments de menu à afficher dans le groupe
 * @param {boolean} [props.defaultOpen=true] - État d'ouverture initial
 * @param {number} [props.badge] - Nombre à afficher dans un badge (optionnel)
 * @param {string} [props.badgeColor='bg-blue-500'] - Couleur du badge
 */
export default function SidebarGroup({
  label,
  icon: Icon,
  children,
  defaultOpen = true,
  badge = null,
  badgeColor = 'bg-blue-500'
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-2">
      {/* En-tête du groupe (bouton collapsible) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-primary-200 hover:text-white hover:bg-primary-600 rounded-md transition-colors duration-150"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={2.5} />}
          <span className="uppercase tracking-wide text-xs">{label}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge de comptage */}
          {badge !== null && badge > 0 && (
            <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold text-white ${badgeColor}`}>
              {badge > 99 ? '99+' : badge}
            </span>
          )}

          {/* Icône chevron */}
          {isOpen ? (
            <ChevronDown className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
          ) : (
            <ChevronRight className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
          )}
        </div>
      </button>

      {/* Contenu du groupe (items de menu) */}
      {isOpen && (
        <div className="mt-1 ml-3 space-y-0.5 border-l-2 border-primary-600 pl-2">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Item de menu à utiliser dans un SidebarGroup
 * Simplifie la structure des enfants
 */
export function SidebarGroupItem({
  name,
  href,
  icon: Icon,
  active,
  badge,
  badgeVariant = 'new',
  onClick
}) {
  // Variants de badge
  const badgeStyles = {
    new: 'bg-green-500 text-white',
    warning: 'bg-orange-500 text-white',
    danger: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  return (
    <a
      href={href}
      onClick={onClick}
      className={`
        group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md
        transition-colors duration-150
        ${active
          ? 'bg-primary-800 text-white'
          : 'text-primary-100 hover:bg-primary-600 hover:text-white'
        }
      `}
    >
      <div className="flex items-center">
        {Icon && (
          <Icon
            className={`
              mr-3 h-4 w-4 flex-shrink-0
              ${active ? 'text-white' : 'text-primary-300 group-hover:text-white'}
            `}
          />
        )}
        {name}
      </div>

      {badge && (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${badgeStyles[badgeVariant] || badgeStyles.new}`}>
          {badge}
        </span>
      )}
    </a>
  );
}
