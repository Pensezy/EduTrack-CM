/**
 * Utilitaires pour gérer les notifications
 * Format les notifications et détermine les actions appropriées
 */

/**
 * Formate le temps écoulé depuis la création de la notification
 * @param {string} createdAt - Date ISO de création
 * @returns {string} Temps écoulé formaté (ex: "Il y a 5 min")
 */
export function formatNotificationTime(createdAt) {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now - created;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'À l\'instant';
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;

  // Au-delà d'une semaine, afficher la date
  return created.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  });
}

/**
 * Détermine l'action de clic pour une notification
 * Basé sur le type de notification et les données associées
 *
 * @param {Object} notification - L'objet notification
 * @param {Function} navigate - Fonction de navigation React Router
 * @returns {Function} Fonction de clic
 */
export function getNotificationAction(notification, navigate) {
  // La colonne s'appelle 'metadata' dans la DB, mais on supporte aussi 'data' pour compatibilité
  const data = notification.metadata || notification.data || {};

  // Extraire le type depuis les données ou le titre
  const type = data.type || inferTypeFromTitle(notification.title);

  return () => {
    switch (type) {
      // Demandes d'inscription
      case 'enrollment_request':
      case 'new_enrollment':
        if (data.enrollment_id) {
          navigate(`/enrollment?highlight=${data.enrollment_id}`);
        } else {
          navigate('/enrollment');
        }
        break;

      // Demandes d'apps
      case 'app_request':
      case 'new_app_request':
        if (data.request_id) {
          navigate(`/app-requests?highlight=${data.request_id}`);
        } else {
          navigate('/app-requests');
        }
        break;

      // Demandes de packs
      case 'bundle_request':
      case 'new_bundle_request':
        if (data.request_id) {
          navigate(`/bundle-requests?highlight=${data.request_id}`);
        } else {
          navigate('/bundle-requests');
        }
        break;

      // Notifications école
      case 'school_update':
      case 'school_created':
        if (data.school_id) {
          navigate(`/schools?highlight=${data.school_id}`);
        } else {
          navigate('/schools');
        }
        break;

      // Notifications utilisateur
      case 'user_created':
      case 'user_update':
        if (data.user_id) {
          navigate(`/users?highlight=${data.user_id}`);
        } else {
          navigate('/users');
        }
        break;

      // Rapports et statistiques
      case 'report_ready':
      case 'monthly_report':
        navigate('/analytics');
        break;

      // Système
      case 'system_update':
      case 'maintenance':
        navigate('/settings');
        break;

      // Paiements (pour directeurs)
      case 'payment_received':
      case 'payment_pending':
        navigate('/finances');
        break;

      // Par défaut, rediriger vers le dashboard
      default:
        navigate('/');
        break;
    }
  };
}

/**
 * Infère le type de notification depuis le titre
 * Fallback quand data.type n'est pas défini
 *
 * @param {string} title - Titre de la notification
 * @returns {string} Type inféré
 */
function inferTypeFromTitle(title) {
  const titleLower = title.toLowerCase();

  if (titleLower.includes('inscription') || titleLower.includes('enrollment')) {
    return 'enrollment_request';
  }
  if (titleLower.includes('app') && titleLower.includes('demande')) {
    return 'app_request';
  }
  if (titleLower.includes('pack') && titleLower.includes('demande')) {
    return 'bundle_request';
  }
  if (titleLower.includes('rapport') || titleLower.includes('report')) {
    return 'report_ready';
  }
  if (titleLower.includes('école') || titleLower.includes('school')) {
    return 'school_update';
  }
  if (titleLower.includes('utilisateur') || titleLower.includes('user')) {
    return 'user_created';
  }
  if (titleLower.includes('système') || titleLower.includes('system')) {
    return 'system_update';
  }
  if (titleLower.includes('paiement') || titleLower.includes('payment')) {
    return 'payment_received';
  }

  return 'general';
}

/**
 * Détermine la couleur du badge de priorité
 * @param {string} priority - Priorité de la notification (low, medium, high)
 * @returns {string} Classes CSS pour le badge
 */
export function getPriorityBadgeColor(priority) {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'medium':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'low':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

/**
 * Détermine l'icône appropriée pour une notification
 * @param {Object} notification - L'objet notification
 * @returns {string} Nom de l'icône Lucide React
 */
export function getNotificationIcon(notification) {
  // La colonne s'appelle 'metadata' dans la DB, mais on supporte aussi 'data' pour compatibilité
  const data = notification.metadata || notification.data || {};
  const type = data.type || inferTypeFromTitle(notification.title);

  switch (type) {
    case 'enrollment_request':
    case 'new_enrollment':
      return 'FileText';
    case 'app_request':
    case 'new_app_request':
      return 'Grid3x3';
    case 'bundle_request':
    case 'new_bundle_request':
      return 'Package';
    case 'school_update':
    case 'school_created':
      return 'School';
    case 'user_created':
    case 'user_update':
      return 'Users';
    case 'report_ready':
    case 'monthly_report':
      return 'BarChart3';
    case 'system_update':
    case 'maintenance':
      return 'Settings';
    case 'payment_received':
    case 'payment_pending':
      return 'DollarSign';
    default:
      return 'Bell';
  }
}
