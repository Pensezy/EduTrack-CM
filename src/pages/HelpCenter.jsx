import React, { useState, useEffect } from 'react';
import Icon from '../components/AppIcon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { helpCategories, searchHelp, getArticleById, getRecommendedArticles } from '../data/helpContent';
import { useAuth } from '../contexts/AuthContext';

const HelpCenter = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeArticle, setActiveArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [articleContent, setArticleContent] = useState('');
  const [loading, setLoading] = useState(false);

  // Charger le contenu d'un article depuis les fichiers .md
  const loadArticleContent = async (article) => {
    setLoading(true);
    try {
      // Charger le fichier markdown depuis le dossier docs
      const response = await fetch(`/docs/${article.file}`);
      if (response.ok) {
        const content = await response.text();
        setArticleContent(content);
      } else {
        setArticleContent(`# ${article.title}\n\n*Contenu non disponible. Le fichier ${article.file} est introuvable.*`);
      }
    } catch (error) {
      console.error('Erreur chargement article:', error);
      setArticleContent(`# ${article.title}\n\n*Erreur lors du chargement du contenu.*`);
    } finally {
      setLoading(false);
    }
  };

  // Gérer la recherche
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const results = searchHelp(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

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
  const recommendedArticles = getRecommendedArticles(user?.role || 'student');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Icon name="HelpCircle" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Centre d'Aide EduTrack</h1>
                <p className="text-white/90 mt-2">Trouvez toutes les réponses à vos questions</p>
              </div>
            </div>
            {(activeArticle || activeCategory) && (
              <Button
                variant="outline"
                onClick={handleBackToHome}
                className="text-white border-white hover:bg-white/10"
              >
                <Icon name="Home" size={20} className="mr-2" />
                Accueil
              </Button>
            )}
          </div>

          {/* Barre de recherche */}
          <div className="max-w-2xl">
            <div className="relative">
              <Icon name="Search" size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher dans l'aide... (ex: créer un compte, email, élève)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3 text-lg bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Résultats de recherche */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Résultats de recherche ({searchResults.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((article) => (
                <div
                  key={article.id}
                  onClick={() => handleSelectArticle(article)}
                  className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg cursor-pointer transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
                    <Icon name="ArrowRight" size={20} className="text-primary flex-shrink-0 ml-2" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{article.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {article.category}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
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

        {/* Affichage d'un article */}
        {activeArticle && !searchQuery && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <span>{activeArticle.category}</span>
              <Icon name="ChevronRight" size={16} className="mx-2" />
              <span className="text-gray-700 font-medium">{activeArticle.title}</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="Loader" size={32} className="animate-spin text-primary" />
                <span className="ml-3 text-gray-600">Chargement...</span>
              </div>
            ) : (
              <div className="prose prose-lg max-w-none">
                {renderMarkdown(articleContent)}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Cet article vous a-t-il été utile ?
              </p>
              <div className="flex space-x-2 mt-2">
                <Button variant="outline" size="sm">
                  <Icon name="ThumbsUp" size={16} className="mr-2" />
                  Oui
                </Button>
                <Button variant="outline" size="sm">
                  <Icon name="ThumbsDown" size={16} className="mr-2" />
                  Non
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Vue d'accueil */}
        {!activeArticle && !searchQuery && (
          <div>
            {/* Articles recommandés */}
            {recommendedArticles.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Icon name="Star" size={24} className="mr-2 text-yellow-500" />
                  Recommandé pour vous
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recommendedArticles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => handleSelectArticle(article)}
                      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-lg cursor-pointer transition-shadow"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">{article.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{article.description}</p>
                      <Icon name="ArrowRight" size={16} className="text-primary" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Catégories */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Parcourir par catégorie</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer border border-gray-200"
                >
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center mb-3">
                      <Icon name={category.icon} size={32} className="text-primary mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{category.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {category.articles.length} article{category.articles.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="p-4">
                    {category.articles.slice(0, 3).map((article) => (
                      <div
                        key={article.id}
                        onClick={() => handleSelectArticle(article)}
                        className="flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded cursor-pointer"
                      >
                        <span className="text-sm text-gray-700">{article.title}</span>
                        <Icon name="ChevronRight" size={16} className="text-gray-400" />
                      </div>
                    ))}
                    {category.articles.length > 3 && (
                      <button
                        onClick={() => setActiveCategory(category)}
                        className="text-sm text-primary hover:underline mt-2"
                      >
                        Voir tous les articles ({category.articles.length})
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact support */}
            <div className="mt-12 bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-lg p-8 text-center">
              <Icon name="MessageCircle" size={48} className="mx-auto text-primary mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Vous ne trouvez pas ce que vous cherchez ?
              </h3>
              <p className="text-gray-600 mb-4">
                Notre équipe de support est là pour vous aider
              </p>
              <Button variant="primary">
                <Icon name="Mail" size={20} className="mr-2" />
                Contacter le support
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpCenter;
