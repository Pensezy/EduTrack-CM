import React from 'react';
import Icon from '../../../components/AppIcon';

/**
 * Composant pour afficher les informations du parent/tuteur d'un étudiant
 * Visible uniquement dans le dashboard étudiant
 */
const ParentInfoCard = ({ parentInfo }) => {
  // Si pas d'info parent, ne rien afficher
  if (!parentInfo || (!parentInfo.parent_name && !parentInfo.parent_phone)) {
    return null;
  }

  const hasParentName = parentInfo.parent_name && parentInfo.parent_name !== 'Non défini';
  const hasParentPhone = parentInfo.parent_phone && parentInfo.parent_phone !== 'Non défini';
  const hasParentEmail = parentInfo.parent_email && parentInfo.parent_email !== 'Non défini';

  // Si aucune info valide, ne rien afficher
  if (!hasParentName && !hasParentPhone && !hasParentEmail) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-purple-900 flex items-center">
          <Icon name="Users" size={20} className="mr-2 text-purple-600" />
          Mon Parent / Tuteur
        </h3>
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <Icon name="Heart" size={20} className="text-purple-600" />
        </div>
      </div>

      <div className="space-y-3">
        {/* Nom du parent */}
        {hasParentName && (
          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="User" size={16} className="text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-purple-600 font-medium">Nom complet</p>
                <p className="text-sm font-semibold text-purple-900 truncate">
                  {parentInfo.parent_name}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Téléphone du parent */}
        {hasParentPhone && (
          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="Phone" size={16} className="text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-green-600 font-medium">Téléphone</p>
                <a 
                  href={`tel:${parentInfo.parent_phone}`}
                  className="text-sm font-semibold text-green-900 hover:text-green-700 hover:underline"
                >
                  {parentInfo.parent_phone}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Email du parent */}
        {hasParentEmail && (
          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="Mail" size={16} className="text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-blue-600 font-medium">Email</p>
                <a 
                  href={`mailto:${parentInfo.parent_email}`}
                  className="text-sm font-semibold text-blue-900 hover:text-blue-700 hover:underline truncate block"
                >
                  {parentInfo.parent_email}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Profession du parent (si disponible) */}
        {parentInfo.parent_profession && parentInfo.parent_profession !== 'Non défini' && (
          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="Briefcase" size={16} className="text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-orange-600 font-medium">Profession</p>
                <p className="text-sm font-semibold text-orange-900 truncate">
                  {parentInfo.parent_profession}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message informatif */}
      <div className="mt-4 bg-purple-100 border border-purple-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-purple-800">
            Ces informations permettent à l'école de contacter votre parent/tuteur en cas de besoin.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParentInfoCard;
