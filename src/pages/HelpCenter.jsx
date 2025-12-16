import React, { useState, useEffect } from 'react';
import Icon from '../components/AppIcon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { getHelpCategoriesByRole, searchHelp, getArticleById, getRecommendedArticles } from '../data/helpContent';
import { useAuth } from '../contexts/AuthContext';

// FAQ selon le rôle
const getFAQByRole = (role) => {
  const faqsByRole = {
    parent: [
      { q: "Comment consulter les notes de mon enfant ?", a: "Cliquez sur votre enfant dans le tableau de bord, puis allez dans la section 'Notes et Bulletins'." },
      { q: "Comment voir l'emploi du temps ?", a: "Dans le dashboard de votre enfant, consultez la section 'Emploi du temps' pour voir les cours de la semaine." },
      { q: "Comment gérer plusieurs enfants ?", a: "Si vos enfants sont dans différentes écoles, utilisez la vue 'Multi-établissements' pour une vision globale." },
      { q: "Comment contacter un enseignant ?", a: "Utilisez le 'Centre de Communication' dans le dashboard pour envoyer des messages aux enseignants." }
    ],
    teacher: [
      { q: "Comment marquer les absences ?", a: "Allez dans 'Gestion des Présences', sélectionnez votre classe et marquez les élèves absents, en retard ou excusés." },
      { q: "Comment saisir les notes ?", a: "Dans 'Gestion des Notes', sélectionnez la classe, l'évaluation et entrez les notes. Les parents seront notifiés automatiquement." },
      { q: "Comment gérer plusieurs établissements ?", a: "Utilisez le sélecteur d'établissement en haut du dashboard pour basculer entre vos différentes écoles." },
      { q: "Comment communiquer avec les parents ?", a: "Utilisez le 'Centre de Communication' pour envoyer des messages individuels ou groupés aux parents." }
    ],
    secretary: [
      { q: "Comment inscrire un nouvel élève ?", a: "Allez dans 'Gestion des Élèves' > 'Nouvel Élève', remplissez le formulaire et créez le compte du parent si nécessaire." },
      { q: "Comment créer un compte parent sans email ?", a: "Lors de la création, cochez 'Parent sans email' et générez un identifiant unique. Remettez-lui ses identifiants en main propre." },
      { q: "Comment enregistrer un paiement ?", a: "Allez dans 'Gestion des Paiements', sélectionnez l'élève, entrez le montant et le moyen de paiement, puis générez le reçu." },
      { q: "Quelles sont mes permissions ?", a: "Vous pouvez gérer les élèves, parents, paiements et présences, mais pas créer de comptes enseignants ou modifier les paramètres de l'école." }
    ],
    student: [
      { q: "Comment consulter mes notes ?", a: "Connectez-vous et allez dans 'Mes Notes' pour voir toutes vos évaluations avec les moyennes par matière." },
      { q: "Comment voir mon emploi du temps ?", a: "Dans votre dashboard, consultez la section 'Emploi du temps' pour voir vos cours de la semaine." },
      { q: "Comment suivre mes absences ?", a: "La section 'Présences' affiche votre historique d'absences, retards et présences." },
      { q: "Comment changer mon mot de passe ?", a: "Cliquez sur votre nom en haut à droite, puis 'Paramètres' > 'Sécurité' > 'Changer le mot de passe'." }
    ],
    principal: [
      { q: "Comment créer un compte enseignant ?", a: "Allez dans 'Gestion du Personnel' > 'Nouveau Compte', sélectionnez 'Enseignant' et définissez ses classes et matières." },
      { q: "Comment configurer les frais de scolarité ?", a: "Dans 'Paramètres de l'École' > 'Frais de Scolarité', définissez les montants par classe et type de frais." },
      { q: "Comment générer des rapports ?", a: "Utilisez le 'Centre de Rapports' pour générer des statistiques académiques, financières ou d'assiduité." },
      { q: "Comment gérer l'année académique ?", a: "Dans 'Paramètres de l'École' > 'Année Académique', créez les trimestres/semestres et définissez les dates de début/fin." }
    ],
    admin: [
      { q: "Comment configurer EmailJS ?", a: "Consultez la documentation technique 'Configuration EmailJS' pour les étapes détaillées de configuration." },
      { q: "Comment gérer la base de données ?", a: "Utilisez les guides techniques Supabase pour la gestion de la base de données et les migrations." },
      { q: "Comment créer un établissement ?", a: "Dans l'interface d'administration, utilisez 'Gestion des Établissements' pour créer une nouvelle école." },
      { q: "Comment résoudre les problèmes d'email ?", a: "Consultez le guide 'Résolution de problèmes email' dans la section technique." }
    ]
  };

  return faqsByRole[role] || faqsByRole.student;
};

const HelpCenter = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'student';
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeArticle, setActiveArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [articleContent, setArticleContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  // Récupérer les catégories selon le rôle de l'utilisateur
  const helpCategories = getHelpCategoriesByRole(userRole);

  // Titre personnalisé selon le rôle
  const getRoleTitle = () => {
    const titles = {
      parent: 'Guide Parents',
      teacher: 'Guide Enseignants',
      secretary: 'Guide Secrétaires',
      student: 'Guide Élèves',
      principal: 'Guide Chefs d\'Établissement',
      admin: 'Documentation Complète'
    };
    return titles[userRole] || 'Centre d\'Aide';
  };

  const getRoleDescription = () => {
    const descriptions = {
      parent: 'Suivez la scolarité de vos enfants facilement',
      teacher: 'Gérez vos classes et vos évaluations',
      secretary: 'Administrez les inscriptions et paiements',
      student: 'Consultez vos notes et votre emploi du temps',
      principal: 'Pilotez votre établissement efficacement',
      admin: 'Documentation technique et guides utilisateurs'
    };
    return descriptions[userRole] || 'Trouvez toutes les réponses à vos questions';
  };

  const getSearchPlaceholder = () => {
    const placeholders = {
      parent: 'Rechercher... (ex: consulter les notes, contacter un enseignant)',
      teacher: 'Rechercher... (ex: marquer absences, saisir notes)',
      secretary: 'Rechercher... (ex: inscrire un élève, enregistrer un paiement)',
      student: 'Rechercher... (ex: voir mes notes, emploi du temps)',
      principal: 'Rechercher... (ex: créer un enseignant, générer des rapports)',
      admin: 'Rechercher... (ex: configuration email, base de données)'
    };
    return placeholders[userRole] || 'Rechercher dans l\'aide...';
  };

  // Charger le contenu d'un article depuis les fichiers .md ou utiliser le contenu intégré
  const loadArticleContent = async (article) => {
    setLoading(true);
    try {
      // Si l'article a un contenu intégré, l'utiliser directement
      if (article.content) {
        setArticleContent(article.content);
        setLoading(false);
        return;
      }
      
      // Sinon, charger le fichier markdown depuis le dossier docs
      if (article.file) {
        const response = await fetch(`/docs/${article.file}`);
        if (response.ok) {
          const content = await response.text();
          setArticleContent(content);
        } else {
          setArticleContent(`# ${article.title}\n\n${article.description}\n\n*Pour plus d'informations, consultez la documentation technique.*`);
        }
      } else {
        setArticleContent(`# ${article.title}\n\n${article.description}`);
      }
    } catch (error) {
      console.error('Erreur chargement article:', error);
      setArticleContent(`# ${article.title}\n\n${article.description}\n\n*Pour plus d'informations, contactez le support technique.*`);
    } finally {
      setLoading(false);
    }
  };

  // Gérer la recherche
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const results = searchHelp(searchQuery, userRole);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, userRole]);

  // Sélectionner un article
  const handleSelectArticle = (article) => {
    setActiveArticle(article);
    setActiveCategory(null);
    loadArticleContent(article);
  };

  // Revenir à l'accueil
  const handleBackToHome = () => {
    setActiveArticle(null);
    setActiveCategory(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Convertir le markdown en HTML simple (basique)
  const renderMarkdown = (markdown) => {
    if (!markdown) return null;

    // Séparations simples pour le rendu
    return markdown
      .split('\n')
      .map((line, index) => {
        // Titres
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold text-gray-900 mb-6 mt-8">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-semibold text-gray-800 mb-4 mt-6">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-medium text-gray-700 mb-3 mt-4">{line.slice(4)}</h3>;
        }
        if (line.startsWith('#### ')) {
          return <h4 key={index} className="text-lg font-medium text-gray-600 mb-2 mt-3">{line.slice(5)}</h4>;
        }

        // Listes
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={index} className="ml-6 mb-1 text-gray-700">{line.slice(2)}</li>;
        }
        if (/^\d+\./.test(line)) {
          return <li key={index} className="ml-6 mb-1 text-gray-700 list-decimal">{line.replace(/^\d+\.\s*/, '')}</li>;
        }

        // Lignes de séparation
        if (line.trim() === '---') {
          return <hr key={index} className="my-6 border-gray-300" />;
        }

        // Blocs de code
        if (line.startsWith('```')) {
          return <pre key={index} className="bg-gray-100 p-4 rounded-lg my-4 overflow-x-auto"><code>{line.slice(3)}</code></pre>;
        }

        // Paragraphes
        if (line.trim() === '') {
          return <br key={index} />;
        }

        return <p key={index} className="text-gray-700 mb-3 leading-relaxed">{line}</p>;
      });
  };

  // Obtenir les articles recommandés
  const recommendedArticles = getRecommendedArticles(userRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header - Modernisé */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-16 px-4 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl shadow-lg border-2 border-white/30">
                <Icon name="HelpCircle" size={40} />
              </div>
              <div>
                <h1 className="text-5xl font-display font-bold mb-2">{getRoleTitle()}</h1>
                <p className="text-white/90 text-lg">{getRoleDescription()}</p>
              </div>
            </div>
            {(activeArticle || activeCategory) && (
              <button
                onClick={handleBackToHome}
                className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white px-6 py-3 rounded-xl font-body-bold hover:bg-white/30 transition-all shadow-lg hover:scale-105 flex items-center gap-2"
              >
                <Icon name="Home" size={20} />
                Accueil
              </button>
            )}
          </div>

          {/* Barre de recherche - Modernisée */}
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Icon name="Search" size={24} className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 text-lg bg-white rounded-2xl shadow-xl border-2 border-white/50 focus:outline-none focus:ring-4 focus:ring-white/50 focus:border-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Icon name="X" size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Résultats de recherche - Modernisés */}
        {searchResults.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg">
                <Icon name="Search" size={24} className="text-white" />
              </div>
              <h2 className="text-3xl font-display font-bold text-gray-900">
                {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((article) => (
                <div
                  key={article.id}
                  onClick={() => handleSelectArticle(article)}
                  className="bg-white p-6 rounded-2xl border-2 border-gray-200 hover:shadow-2xl hover:scale-105 cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-display font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{article.title}</h3>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md group-hover:scale-110 transition-transform">
                      <Icon name="ArrowRight" size={18} className="text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{article.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-body-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                      {article.category}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs font-body-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-lg">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Affichage d'un article - Modernisé */}
        {activeArticle && !searchQuery && (
          <div className="bg-white rounded-2xl shadow-2xl p-10 border-2 border-gray-200">
            <div className="flex items-center text-sm text-gray-500 mb-6 pb-4 border-b-2 border-gray-200">
              <span className="px-3 py-1 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 rounded-lg font-body-bold">{activeArticle.category}</span>
              <Icon name="ChevronRight" size={18} className="mx-3 text-gray-400" />
              <span className="text-gray-900 font-body-bold">{activeArticle.title}</span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-indigo-600 absolute top-0"></div>
                </div>
                <span className="mt-6 text-gray-600 font-body-bold text-lg">Chargement de l'article...</span>
              </div>
            ) : (
              <div className="prose prose-lg max-w-none">
                {renderMarkdown(articleContent)}
              </div>
            )}

            {/* Footer article - Modernisé */}
            <div className="mt-10 pt-8 border-t-2 border-gray-200">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                <p className="text-base font-body-bold text-gray-700 mb-4">
                  Cet article vous a-t-il été utile ?
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-body-bold transition-all hover:scale-105 shadow-lg flex items-center gap-2">
                    <Icon name="ThumbsUp" size={18} />
                    Oui, très utile
                  </button>
                  <button className="bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-3 rounded-xl font-body-bold transition-all hover:scale-105 shadow-lg flex items-center gap-2">
                    <Icon name="ThumbsDown" size={18} />
                    Non, pas assez
                  </button>
                  <button 
                    onClick={() => setShowContactForm(true)}
                    className="bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-body-bold transition-all hover:scale-105 shadow-lg flex items-center gap-2"
                  >
                    <Icon name="MessageCircle" size={18} />
                    Contacter le support
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vue d'accueil - Modernisée */}
        {!activeArticle && !searchQuery && (
          <div className="space-y-12">
            {/* Articles recommandés - Modernisés */}
            {recommendedArticles.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                    <Icon name="Star" size={28} className="text-white" />
                  </div>
                  <h2 className="text-3xl font-display font-bold text-gray-900">
                    Recommandé pour vous
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendedArticles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => handleSelectArticle(article)}
                      className="bg-white p-6 rounded-2xl border-2 border-yellow-200 hover:shadow-2xl hover:scale-105 cursor-pointer transition-all group bg-gradient-to-br from-yellow-50 to-orange-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-display font-bold text-gray-900 group-hover:text-orange-600 transition-colors text-base">{article.title}</h3>
                        <Icon name="Star" size={18} className="text-yellow-500 flex-shrink-0 ml-2" />
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{article.description}</p>
                      <div className="flex items-center text-orange-600 font-body-bold text-sm group-hover:gap-2 transition-all">
                        <span>Lire l'article</span>
                        <Icon name="ArrowRight" size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Catégories - Modernisées */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                  <Icon name="Grid" size={28} className="text-white" />
                </div>
                <h2 className="text-3xl font-display font-bold text-gray-900">Parcourir par catégorie</h2>
              </div>
              
              {/* Info pour admin */}
              {userRole === 'admin' && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-blue-500 flex-shrink-0">
                      <Icon name="Info" size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-blue-900 mb-2">Mode Administrateur</h3>
                      <p className="text-blue-800 text-sm">
                        Vous voyez l'ensemble de la documentation : les guides pratiques pour tous les utilisateurs ET la documentation technique réservée aux administrateurs.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {helpCategories.length === 0 ? (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 text-center">
                  <Icon name="AlertCircle" size={48} className="text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-xl font-display font-bold text-gray-900 mb-2">Aucune catégorie disponible</h3>
                  <p className="text-gray-600">
                    Aucun contenu d'aide n'est disponible pour votre rôle actuellement. Contactez l'administrateur pour plus d'informations.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {helpCategories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all border-2 border-gray-200 overflow-hidden hover:scale-105 group"
                  >
                    <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-b-2 border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md mr-4 group-hover:scale-110 transition-transform">
                          <Icon name={category.icon} size={28} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-display font-bold text-gray-900">{category.title}</h3>
                          {category.roles && category.roles.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {category.roles.map(role => (
                                <span key={role} className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-body-bold">
                                  {role === 'admin' ? 'Administrateur' : 
                                   role === 'parent' ? 'Parent' : 
                                   role === 'teacher' ? 'Enseignant' : 
                                   role === 'secretary' ? 'Secrétaire' : 
                                   role === 'student' ? 'Élève' : 
                                   role === 'principal' ? 'Chef d\'établissement' : role}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{category.description}</p>
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm">
                        <Icon name="FileText" size={16} className="text-indigo-600" />
                        <span className="text-xs font-body-bold text-indigo-600">
                          {category.articles.length} article{category.articles.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      {category.articles.slice(0, 3).map((article) => (
                        <div
                          key={article.id}
                          onClick={() => handleSelectArticle(article)}
                          className="flex items-center justify-between py-3 px-3 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-xl cursor-pointer transition-all group/item"
                        >
                          <span className="text-sm font-body-medium text-gray-700 group-hover/item:text-indigo-700 group-hover/item:font-bold transition-all">{article.title}</span>
                          <Icon name="ChevronRight" size={18} className="text-gray-400 group-hover/item:text-indigo-600 group-hover/item:translate-x-1 transition-all" />
                        </div>
                      ))}
                      {category.articles.length > 3 && (
                        <button
                          onClick={() => setActiveCategory(category)}
                          className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-body-bold mt-3 py-2 hover:bg-indigo-50 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                          <span>Voir tous les articles</span>
                          <span className="px-2 py-0.5 bg-indigo-100 rounded-full text-xs">{category.articles.length}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>

            {/* Contact support - Modernisé */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-10 text-center shadow-2xl border-2 border-white/20">
              <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border-2 border-white/30">
                <Icon name="MessageCircle" size={40} className="text-white" />
              </div>
              <h3 className="text-3xl font-display font-bold text-white mb-3">
                Vous ne trouvez pas ce que vous cherchez ?
              </h3>
              <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
                Notre équipe de support est disponible pour vous aider à résoudre vos problèmes
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button 
                  onClick={() => setShowContactForm(true)}
                  className="bg-white text-indigo-700 px-8 py-4 rounded-xl font-body-bold hover:bg-gray-100 transition-all shadow-xl hover:scale-105 flex items-center gap-3"
                >
                  <Icon name="Mail" size={22} />
                  Contacter le support
                </button>
                <button className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-xl font-body-bold hover:bg-white/30 transition-all shadow-xl hover:scale-105 flex items-center gap-3">
                  <Icon name="Phone" size={22} />
                  Appel téléphonique
                </button>
              </div>
              
              {/* Informations de contact */}
              <div className="mt-8 pt-8 border-t-2 border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <Icon name="Mail" size={24} className="mx-auto mb-2" />
                    <p className="font-body-bold">Email</p>
                    <p className="text-sm text-white/80">support@edutrack.cm</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <Icon name="Phone" size={24} className="mx-auto mb-2" />
                    <p className="font-body-bold">Téléphone</p>
                    <p className="text-sm text-white/80">+237 6XX XX XX XX</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <Icon name="Clock" size={24} className="mx-auto mb-2" />
                    <p className="font-body-bold">Horaires</p>
                    <p className="text-sm text-white/80">Lun-Ven: 8h-18h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Rapide - Nouvelle section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                  <Icon name="HelpCircle" size={28} className="text-white" />
                </div>
                <h2 className="text-3xl font-display font-bold text-gray-900">Questions Fréquentes</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getFAQByRole(userRole).map((faq, index) => (
                  <div key={index} className="bg-white p-6 rounded-2xl border-2 border-gray-200 hover:shadow-xl transition-all">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex-shrink-0">
                        <Icon name="HelpCircle" size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-gray-900 mb-2">{faq.q}</h4>
                        <p className="text-sm text-gray-600">{faq.a}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpCenter;
