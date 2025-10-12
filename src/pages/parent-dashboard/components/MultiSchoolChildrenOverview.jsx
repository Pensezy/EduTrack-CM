import React, { useState, useEffect } from 'react';
import { parentMultiSchoolService } from '../../../services/parentMultiSchoolServiceDemo.js';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MultiSchoolChildrenOverview = ({ parentGlobalId }) => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadParentChildren();
    loadStats();
  }, [parentGlobalId]);

  const loadParentChildren = async () => {
    if (!parentGlobalId) return;
    
    setLoading(true);
    try {
      const childrenData = await parentMultiSchoolService.getParentChildrenAcrossSchools(parentGlobalId);
      setChildren(childrenData);
      if (childrenData.length > 0) {
        setSelectedChild(childrenData[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des enfants:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await parentMultiSchoolService.getMultiSchoolStats();
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-gray-600">Chargement de vos enfants...</span>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="Users" size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun enfant trouvé</h3>
        <p className="text-gray-500">Contactez le secrétariat pour inscrire vos enfants.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble multi-établissements */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-blue-800">
              🏫 Vos Enfants Multi-Établissements
            </h2>
            <p className="text-blue-600">
              Un seul compte pour tous vos enfants dans différentes écoles
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-700">{children.length}</div>
            <div className="text-sm text-blue-600">enfant(s)</div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-700">
              {new Set(children.map(c => c.school.id)).size}
            </div>
            <div className="text-xs text-blue-600">Établissement(s)</div>
          </div>
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-700">
              {new Set(children.map(c => c.school.city)).size}
            </div>
            <div className="text-xs text-green-600">Ville(s)</div>
          </div>
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-purple-700">
              {children.filter(c => c.relationship.isPrimaryContact).length}
            </div>
            <div className="text-xs text-purple-600">Contact principal</div>
          </div>
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-orange-700">
              {children.filter(c => c.relationship.emergencyContact).length}
            </div>
            <div className="text-xs text-orange-600">Contact urgence</div>
          </div>
        </div>
      </div>

      {/* Sélecteur d'enfant */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children.map((child, index) => (
          <div
            key={index}
            onClick={() => setSelectedChild(child)}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedChild === child
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {child.student.firstName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {child.student.firstName} {child.student.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {child.student.class.name}
                  </p>
                </div>
              </div>
              {selectedChild === child && (
                <Icon name="Check" size={20} className="text-blue-600" />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Icon name="School" size={14} className="mr-2" />
                <span className="font-medium">{child.school.name}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Icon name="MapPin" size={14} className="mr-2" />
                <span>{child.school.city}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Icon name="Tag" size={14} className="mr-2" />
                <span>{child.school.type}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Relation:</span>
                <span className="font-medium text-blue-600">
                  {child.relationship.type}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs mt-1">
                <span className="text-gray-500">Statut:</span>
                <div className="flex space-x-1">
                  {child.relationship.isPrimaryContact && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                      Contact principal
                    </span>
                  )}
                  {child.relationship.canPickup && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                      Peut récupérer
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Détails de l'enfant sélectionné */}
      {selectedChild && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {selectedChild.student.firstName.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedChild.student.firstName} {selectedChild.student.lastName}
                </h2>
                <p className="text-gray-600">
                  {selectedChild.student.class.name} • {selectedChild.school.name}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedChild.school.city} • ID: {selectedChild.student.studentId}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Date de naissance</div>
              <div className="font-semibold">
                {new Date(selectedChild.student.dateOfBirth).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Informations scolaires */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2">
                📚 Informations Scolaires
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Établissement:</span>
                  <p className="font-medium">{selectedChild.school.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Classe:</span>
                  <p className="font-medium">{selectedChild.student.class.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Ville:</span>
                  <p className="font-medium">{selectedChild.school.city}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Type:</span>
                  <p className="font-medium capitalize">{selectedChild.school.type.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            {/* Informations personnelles */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2">
                👤 Informations Personnelles
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Nom complet:</span>
                  <p className="font-medium">
                    {selectedChild.student.firstName} {selectedChild.student.lastName}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Genre:</span>
                  <p className="font-medium capitalize">{selectedChild.student.gender === 'male' ? 'Masculin' : 'Féminin'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">ID Étudiant:</span>
                  <p className="font-medium">{selectedChild.student.studentId}</p>
                </div>
              </div>
            </div>

            {/* Votre relation */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2">
                🔗 Votre Relation
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Type de relation:</span>
                  <p className="font-medium capitalize">{selectedChild.relationship.type}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Contact principal:</span>
                  <p className={`font-medium ${selectedChild.relationship.isPrimaryContact ? 'text-green-600' : 'text-gray-600'}`}>
                    {selectedChild.relationship.isPrimaryContact ? '✅ Oui' : '❌ Non'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Peut récupérer:</span>
                  <p className={`font-medium ${selectedChild.relationship.canPickup ? 'text-green-600' : 'text-gray-600'}`}>
                    {selectedChild.relationship.canPickup ? '✅ Oui' : '❌ Non'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Contact d'urgence:</span>
                  <p className={`font-medium ${selectedChild.relationship.emergencyContact ? 'text-orange-600' : 'text-gray-600'}`}>
                    {selectedChild.relationship.emergencyContact ? '🚨 Oui' : '❌ Non'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-3">
              <Button variant="default" size="sm">
                <Icon name="BookOpen" size={16} className="mr-2" />
                Voir les Notes
              </Button>
              <Button variant="outline" size="sm">
                <Icon name="Calendar" size={16} className="mr-2" />
                Présences
              </Button>
              <Button variant="outline" size="sm">
                <Icon name="CreditCard" size={16} className="mr-2" />
                Paiements
              </Button>
              <Button variant="outline" size="sm">
                <Icon name="MessageCircle" size={16} className="mr-2" />
                Messages
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSchoolChildrenOverview;