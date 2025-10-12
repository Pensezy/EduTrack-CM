import React, { useState, useEffect } from 'react';
import { parentMultiSchoolService } from '../../../services/parentMultiSchoolServiceDemo.js';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ParentSearchSelector = ({ 
  onParentSelect, 
  onCreateNew, 
  selectedParent, 
  searchTerm, 
  onSearchChange 
}) => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (searchTerm && searchTerm.length >= 2) {
      searchParents(searchTerm);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchTerm]);

  const searchParents = async (term) => {
    setLoading(true);
    try {
      const results = await parentMultiSchoolService.searchExistingParents(term);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForDuplicate = async (email, phone) => {
    try {
      const existing = await parentMultiSchoolService.checkExistingParent(email, phone);
      if (existing) {
        return {
          isDuplicate: true,
          parent: existing,
          message: `Un parent existe déjà avec ces informations:\n${existing.firstName} ${existing.lastName}\nEmail: ${existing.email}\nTéléphone: ${existing.phone}\n\nEnfants dans ${existing.studentRelations.length} établissement(s)`
        };
      }
      return { isDuplicate: false };
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      return { isDuplicate: false };
    }
  };

  return (
    <div className="space-y-4">
      {/* Recherche de parent existant */}
      <div className="relative">
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <Input
              placeholder="Rechercher un parent existant (nom, email, téléphone)..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full"
            />
          </div>
          {loading && (
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm">Recherche...</span>
            </div>
          )}
        </div>

        {/* Résultats de recherche */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="p-3 bg-blue-50 border-b border-blue-200">
              <p className="text-sm font-medium text-blue-800">
                {searchResults.length} parent(s) trouvé(s)
              </p>
            </div>
            {searchResults.map((parent) => (
              <div
                key={parent.id}
                onClick={() => {
                  onParentSelect(parent);
                  setShowResults(false);
                }}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {parent.firstName} {parent.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">{parent.email}</p>
                    <p className="text-sm text-gray-600">{parent.phone}</p>
                    <p className="text-sm text-blue-600 mt-1">
                      <Icon name="School" size={12} className="inline mr-1" />
                      {parent.studentRelations.length} relation(s) école
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    ID: {parent.globalParentId.slice(0, 8)}...
                  </div>
                </div>
                {parent.studentRelations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Enfants actuels:</p>
                    {parent.studentRelations.map((relation, idx) => (
                      <div key={idx} className="text-xs text-gray-600">
                        • {relation.student.firstName} {relation.student.lastName} - {relation.school.name} ({relation.school.city})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Aucun résultat */}
        {showResults && searchResults.length === 0 && searchTerm.length >= 2 && !loading && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
            <div className="text-center">
              <Icon name="Search" size={24} className="text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Aucun parent trouvé</p>
              <p className="text-xs text-gray-500 mt-1">
                Vous pouvez créer un nouveau parent
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Parent sélectionné */}
      {selectedParent && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-green-800">
                Parent sélectionné: {selectedParent.firstName} {selectedParent.lastName}
              </h4>
              <p className="text-sm text-green-700">{selectedParent.email}</p>
              <p className="text-sm text-green-700">{selectedParent.phone}</p>
              <p className="text-sm text-green-600 mt-1">
                <Icon name="Globe" size={12} className="inline mr-1" />
                ID Global: {selectedParent.globalParentId}
              </p>
              
              {selectedParent.studentRelations && selectedParent.studentRelations.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-green-700 font-medium">Enfants dans d'autres écoles:</p>
                  {selectedParent.studentRelations.map((relation, idx) => (
                    <div key={idx} className="text-xs text-green-600">
                      • {relation.student.firstName} à {relation.school.name} ({relation.school.city})
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onParentSelect(null);
                onSearchChange('');
                setShowResults(false);
              }}
              className="text-green-700 hover:text-green-800"
            >
              <Icon name="X" size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Options d'action */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={() => onCreateNew()}
          className="flex-1"
        >
          <Icon name="UserPlus" size={16} className="mr-2" />
          Créer Nouveau Parent
        </Button>
        
        {searchTerm && searchTerm.length >= 2 && (
          <Button
            variant="ghost"
            onClick={async () => {
              const result = await checkForDuplicate(searchTerm, '');
              if (result.isDuplicate) {
                alert(`⚠️ ATTENTION - DOUBLON DÉTECTÉ!\n\n${result.message}\n\nVoulez-vous utiliser ce parent existant?`);
                onParentSelect(result.parent);
              } else {
                alert('✅ Aucun doublon détecté pour cette information');
              }
            }}
            className="text-orange-600 hover:text-orange-700"
          >
            <Icon name="AlertTriangle" size={16} className="mr-2" />
            Vérifier Doublon
          </Button>
        )}
      </div>
    </div>
  );
};

export default ParentSearchSelector;