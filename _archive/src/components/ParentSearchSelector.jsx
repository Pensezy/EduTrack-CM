import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { parentMultiSchoolService } from '../../services/parentMultiSchoolService';

/**
 * Composant pour rechercher et sélectionner un parent existant
 * Évite la création de doublons lors de l'inscription d'un étudiant
 */
const ParentSearchSelector = ({ 
  onParentSelected, 
  onCreateNew, 
  initialSearch = '',
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Effectuer la recherche quand le terme change
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.length >= 2) {
        setLoading(true);
        try {
          const results = await parentMultiSchoolService.searchExistingParents(searchTerm);
          setSearchResults(results);
          setShowResults(true);
        } catch (error) {
          console.error('Erreur lors de la recherche de parents:', error);
          setSearchResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleParentSelection = (parent) => {
    setSelectedParent(parent);
    setShowResults(false);
    onParentSelected(parent);
  };

  const handleCreateNew = () => {
    setSelectedParent(null);
    setShowResults(false);
    onCreateNew();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="Search" size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
            Rechercher un Parent Existant
          </h3>
          <p className="text-sm text-text-secondary">
            Éviter les doublons en vérifiant si le parent existe déjà dans le système
          </p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Rechercher par nom, email ou téléphone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          ) : (
            <Icon name="Search" size={16} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Résultats de recherche */}
      {showResults && (
        <div className="space-y-3">
          {searchResults.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">
                  {searchResults.length} parent(s) trouvé(s)
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateNew}
                  className="text-xs"
                >
                  <Icon name="Plus" size={14} className="mr-1" />
                  Créer nouveau
                </Button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {searchResults.map((parent) => (
                  <div
                    key={parent.id}
                    onClick={() => handleParentSelection(parent)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedParent?.id === parent.id
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon name="User" size={20} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-heading font-heading-medium text-base text-text-primary">
                            {parent.firstName} {parent.lastName}
                          </h4>
                          <div className="space-y-1 mt-1">
                            <p className="text-sm text-text-secondary flex items-center">
                              <Icon name="Mail" size={14} className="mr-2 flex-shrink-0" />
                              {parent.email}
                            </p>
                            <p className="text-sm text-text-secondary flex items-center">
                              <Icon name="Phone" size={14} className="mr-2 flex-shrink-0" />
                              {parent.phone}
                            </p>
                            {parent.profession && (
                              <p className="text-sm text-text-secondary flex items-center">
                                <Icon name="Briefcase" size={14} className="mr-2 flex-shrink-0" />
                                {parent.profession}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-text-secondary mb-1">
                          {parent.totalChildren} enfant(s)
                        </div>
                        <div className="text-xs text-primary font-medium">
                          {parent.schools.length} école(s)
                        </div>
                      </div>
                    </div>

                    {/* Détails des enfants et écoles */}
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="font-medium text-text-primary">Enfants:</span>
                          <div className="mt-1 space-y-1">
                            {parent.children.slice(0, 3).map((child, idx) => (
                              <div key={idx} className="text-text-secondary">
                                • {child}
                              </div>
                            ))}
                            {parent.children.length > 3 && (
                              <div className="text-text-secondary">
                                ... et {parent.children.length - 3} autre(s)
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium text-text-primary">Écoles:</span>
                          <div className="mt-1 space-y-1">
                            {parent.schools.slice(0, 2).map((school, idx) => (
                              <div key={idx} className="text-text-secondary">
                                • {school}
                              </div>
                            ))}
                            {parent.schools.length > 2 && (
                              <div className="text-text-secondary">
                                ... et {parent.schools.length - 2} autre(s)
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Indicateur de sélection */}
                    {selectedParent?.id === parent.id && (
                      <div className="mt-3 flex items-center text-primary text-sm font-medium">
                        <Icon name="CheckCircle" size={16} className="mr-2" />
                        Parent sélectionné
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : searchTerm.length >= 2 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Users" size={32} className="text-gray-400" />
              </div>
              <h4 className="font-heading font-heading-medium text-lg text-text-primary mb-2">
                Aucun parent trouvé
              </h4>
              <p className="text-sm text-text-secondary mb-4">
                Aucun parent ne correspond à votre recherche "{searchTerm}"
              </p>
              <Button onClick={handleCreateNew}>
                <Icon name="Plus" size={16} className="mr-2" />
                Créer un nouveau parent
              </Button>
            </div>
          ) : null}
        </div>
      )}

      {/* Instructions */}
      {!showResults && searchTerm.length < 2 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-1">
                Comment éviter les doublons ?
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Saisissez au moins 2 caractères pour commencer la recherche</li>
                <li>• Recherchez par nom, email ou numéro de téléphone</li>
                <li>• Si le parent existe, sélectionnez-le pour éviter un doublon</li>
                <li>• Si le parent n'existe pas, créez un nouveau compte</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentSearchSelector;