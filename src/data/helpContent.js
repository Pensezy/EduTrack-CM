/**
 * Structure et contenu du système d'aide EduTrack
 * Organisé par catégories et lié aux fichiers .md de documentation
 */

export const helpCategories = [
  {
    id: 'getting-started',
    title: '🚀 Démarrage',
    icon: 'Rocket',
    description: 'Premiers pas avec EduTrack',
    articles: [
      {
        id: 'overview',
        title: 'Vue d\'ensemble du système',
        file: 'README.md',
        tags: ['débutant', 'introduction'],
        description: 'Découvrez les fonctionnalités principales d\'EduTrack'
      },
      {
        id: 'organization',
        title: 'Organisation du projet',
        file: 'PROJECT_ORGANIZATION.md',
        tags: ['structure', 'architecture'],
        description: 'Comprendre l\'organisation des dossiers et fichiers'
      },
      {
        id: 'data-mode',
        title: 'Mode Démo vs Production',
        file: 'DATA_MODE_SYSTEM.md',
        tags: ['configuration', 'modes'],
        description: 'Différences entre le mode démo et le mode production'
      }
    ]
  },
  {
    id: 'accounts',
    title: '👥 Gestion des Comptes',
    icon: 'Users',
    description: 'Création et gestion des utilisateurs',
    articles: [
      {
        id: 'account-creation',
        title: 'Création de comptes utilisateurs',
        file: 'FORMULAIRE_CREATION_COMPTE_DYNAMIQUE.md',
        tags: ['comptes', 'création', 'utilisateurs'],
        description: 'Guide complet pour créer des comptes (enseignants, parents, élèves, secrétaires)'
      },
      {
        id: 'student-system',
        title: 'Système hybride élèves (Primaire/Secondaire)',
        file: 'STUDENT_HYBRID_SYSTEM.md',
        tags: ['élèves', 'primaire', 'secondaire'],
        description: 'Comprendre le système de gestion des élèves avec ou sans compte'
      },
      {
        id: 'parent-no-email',
        title: 'Parents sans email',
        file: 'PARENT_CONNEXION_SANS_EMAIL.md',
        tags: ['parents', 'email', 'connexion'],
        description: 'Comment gérer les parents qui n\'ont pas d\'adresse email'
      },
      {
        id: 'parent-multi-school',
        title: 'Parents multi-établissements',
        file: 'PARENT_MULTI_SCHOOL_GUIDE.md',
        tags: ['parents', 'multi-école'],
        description: 'Gestion centralisée des parents avec enfants dans plusieurs écoles'
      },
      {
        id: 'teacher-multi-school',
        title: 'Enseignants multi-établissements',
        file: 'TEACHER_MULTI_SCHOOL_GUIDE.md',
        tags: ['enseignants', 'multi-école'],
        description: 'Gestion des enseignants intervenant dans plusieurs établissements'
      },
      {
        id: 'secretary-system',
        title: 'Système de gestion secrétaire',
        file: 'SYSTEME_GESTION_SECRETAIRE.md',
        tags: ['secrétaire', 'permissions'],
        description: 'Rôles et permissions des secrétaires'
      },
      {
        id: 'account-deletion',
        title: 'Suppression de comptes',
        file: 'ACCOUNT_DELETION.md',
        tags: ['suppression', 'sécurité'],
        description: 'Procédure complète pour supprimer un compte utilisateur'
      }
    ]
  },
  {
    id: 'email-system',
    title: '📧 Système d\'Email',
    icon: 'Mail',
    description: 'Configuration et utilisation des emails',
    articles: [
      {
        id: 'email-auto-send',
        title: 'Envoi automatique d\'identifiants',
        file: 'SYSTEME_ENVOI_EMAIL_AUTOMATIQUE.md',
        tags: ['email', 'automatique', 'identifiants'],
        description: 'Comment le système envoie automatiquement les identifiants par email'
      },
      {
        id: 'emailjs-config',
        title: 'Configuration EmailJS',
        file: 'CONFIGURATION_EMAILJS.md',
        tags: ['configuration', 'emailjs'],
        description: 'Guide pas à pas pour configurer EmailJS'
      },
      {
        id: 'email-guide',
        title: 'Guide rapide email',
        file: 'GUIDE_RAPIDE_EMAIL.md',
        tags: ['guide', 'email'],
        description: 'Résumé rapide du système d\'email'
      },
      {
        id: 'email-examples',
        title: 'Exemples d\'emails',
        file: 'EXEMPLES_EMAILS.md',
        tags: ['exemples', 'templates'],
        description: 'Exemples de templates d\'emails utilisés'
      },
      {
        id: 'email-troubleshooting',
        title: 'Résolution de problèmes email',
        file: 'EMAIL_TROUBLESHOOTING.md',
        tags: ['dépannage', 'erreurs'],
        description: 'Solutions aux problèmes courants d\'envoi d\'email'
      },
      {
        id: 'supabase-email',
        title: 'Configuration Supabase Email',
        file: 'SUPABASE_EMAIL_CONFIG.md',
        tags: ['supabase', 'configuration'],
        description: 'Configurer les emails avec Supabase'
      }
    ]
  },
  {
    id: 'classes',
    title: '🎓 Gestion des Classes',
    icon: 'BookOpen',
    description: 'Organisation des classes et niveaux',
    articles: [
      {
        id: 'class-management',
        title: 'Corrections gestion classes',
        file: 'CORRECTIONS_GESTION_CLASSES.md',
        tags: ['classes', 'corrections'],
        description: 'Corrections et améliorations de la gestion des classes'
      },
      {
        id: 'school-types',
        title: 'Types d\'établissements',
        file: 'SCHOOL_TYPES.md',
        tags: ['écoles', 'types', 'configuration'],
        description: 'Comprendre les différents types d\'établissements (Primaire, Secondaire, Combiné)'
      },
      {
        id: 'academic-year',
        title: 'Années académiques',
        file: 'ACADEMIC_YEAR_MIGRATION.md',
        tags: ['année', 'académique'],
        description: 'Gestion des années académiques et migrations'
      }
    ]
  },
  {
    id: 'navigation',
    title: '🧭 Navigation',
    icon: 'Navigation',
    description: 'Comprendre la navigation dans l\'application',
    articles: [
      {
        id: 'navigation-flows',
        title: 'Flux de navigation',
        file: 'NAVIGATION_FLOWS.md',
        tags: ['navigation', 'flux'],
        description: 'Comprendre les différents flux de navigation par rôle'
      },
      {
        id: 'navigation-fixes',
        title: 'Corrections de navigation',
        file: 'NAVIGATION_FIXES.md',
        tags: ['corrections', 'bugs'],
        description: 'Corrections apportées au système de navigation'
      }
    ]
  },
  {
    id: 'dashboards',
    title: '📊 Tableaux de Bord',
    icon: 'LayoutDashboard',
    description: 'Utilisation des différents tableaux de bord',
    articles: [
      {
        id: 'teacher-dashboard',
        title: 'Tableau de bord enseignant',
        file: 'TEACHER_DASHBOARD_SETUP.md',
        tags: ['enseignant', 'dashboard'],
        description: 'Configuration et utilisation du tableau de bord enseignant'
      },
      {
        id: 'student-dashboard',
        title: 'Analyse tableau de bord élève',
        file: 'DATABASE_STUDENT_DASHBOARD_ANALYSIS.md',
        tags: ['élève', 'dashboard', 'analyse'],
        description: 'Analyse et structure du tableau de bord élève'
      }
    ]
  },
  {
    id: 'database',
    title: '🗄️ Base de Données',
    icon: 'Database',
    description: 'Gestion de la base de données',
    articles: [
      {
        id: 'supabase-auth',
        title: 'Authentification Supabase',
        file: 'SUPABASE_AUTH.md',
        tags: ['supabase', 'authentification'],
        description: 'Configuration de l\'authentification avec Supabase'
      },
      {
        id: 'prisma-migration',
        title: 'Migration Prisma',
        file: 'PRISMA_MIGRATION.md',
        tags: ['prisma', 'migration'],
        description: 'Guide de migration Prisma vers Supabase'
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: '🔧 Dépannage',
    icon: 'Wrench',
    description: 'Résolution de problèmes',
    articles: [
      {
        id: 'email-fix',
        title: 'Correction email de confirmation',
        file: 'EMAIL_CONFIRMATION_FIX.md',
        tags: ['email', 'correction'],
        description: 'Correction du système de confirmation par email'
      },
      {
        id: 'cleanup',
        title: 'Résumé nettoyage code',
        file: 'CLEANUP_SUMMARY.md',
        tags: ['nettoyage', 'maintenance'],
        description: 'Résumé des opérations de nettoyage du code'
      },
      {
        id: 'verification-secretary',
        title: 'Vérification compte secrétaire',
        file: 'VERIFICATION_COMPTE_SECRETAIRE.md',
        tags: ['vérification', 'secrétaire'],
        description: 'Procédure de vérification des comptes secrétaires'
      }
    ]
  }
];

/**
 * Recherche dans les articles d'aide
 * @param {string} query - Terme de recherche
 * @returns {Array} - Articles correspondants
 */
export const searchHelp = (query) => {
  const lowercaseQuery = query.toLowerCase();
  const results = [];

  helpCategories.forEach(category => {
    category.articles.forEach(article => {
      const matchesTitle = article.title.toLowerCase().includes(lowercaseQuery);
      const matchesDescription = article.description.toLowerCase().includes(lowercaseQuery);
      const matchesTags = article.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery));
      const matchesCategory = category.title.toLowerCase().includes(lowercaseQuery);

      if (matchesTitle || matchesDescription || matchesTags || matchesCategory) {
        results.push({
          ...article,
          category: category.title,
          categoryId: category.id
        });
      }
    });
  });

  return results;
};

/**
 * Obtenir un article par ID
 * @param {string} articleId - ID de l'article
 * @returns {Object|null} - Article trouvé ou null
 */
export const getArticleById = (articleId) => {
  for (const category of helpCategories) {
    const article = category.articles.find(a => a.id === articleId);
    if (article) {
      return {
        ...article,
        category: category.title,
        categoryId: category.id
      };
    }
  }
  return null;
};

/**
 * Obtenir les articles recommandés selon le rôle
 * @param {string} role - Rôle de l'utilisateur
 * @returns {Array} - Articles recommandés
 */
export const getRecommendedArticles = (role) => {
  const recommendations = {
    'principal': ['account-creation', 'student-system', 'email-auto-send', 'class-management'],
    'teacher': ['teacher-dashboard', 'teacher-multi-school', 'navigation-flows'],
    'secretary': ['secretary-system', 'account-creation', 'parent-no-email'],
    'parent': ['navigation-flows', 'parent-multi-school'],
    'student': ['student-dashboard', 'navigation-flows']
  };

  const articleIds = recommendations[role] || recommendations['student'];
  return articleIds.map(id => getArticleById(id)).filter(a => a !== null);
};
