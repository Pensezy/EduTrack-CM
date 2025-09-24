import React, { useState } from 'react';

const AccessControlPanel = ({ userRole }) => {
  const [showInfo, setShowInfo] = useState(false);

  const getRolePermissions = (role) => {
    switch (role) {
      case 'secretary':
        return {
          icon: '👩‍💼',
          title: 'Secrétaire',
          permissions: [
            '✅ Créer des comptes professeurs',
            '✅ Assigner des professeurs aux classes',
            '✅ Voir tous les documents de l\'école',
            '✅ Gérer les assignations de classes',
            '❌ Télécharger des documents (réservé aux professeurs)',
            '❌ Modifier les documents existants'
          ],
          description: 'Les secrétaires gèrent les comptes et assignations après validation du Ministère.'
        };
      
      case 'principal':
        return {
          icon: '👨‍💼',
          title: 'Principal',
          permissions: [
            '✅ Assigner des professeurs aux classes et matières',
            '✅ Voir tous les documents de l\'école',
            '✅ Approuver les transferts d\'élèves',
            '✅ Gérer toutes les assignations',
            '✅ Accéder aux statistiques globales',
            '❌ Télécharger des documents directement'
          ],
          description: 'Les principaux supervisent les assignations et valident les processus administratifs.'
        };

      case 'teacher':
        return {
          icon: '👩‍🏫',
          title: 'Professeur',
          permissions: [
            '✅ Télécharger des documents pour ses classes assignées',
            '✅ Voir ses assignations de classes/matières',
            '✅ Supprimer ses propres documents',
            '✅ Organiser les documents par classe et matière',
            '✅ Suivre les statistiques de ses documents',
            '❌ Voir les documents des autres professeurs'
          ],
          description: 'Les professeurs ne peuvent gérer que les documents de leurs classes assignées.'
        };

      case 'student':
        return {
          icon: '🎓',
          title: 'Étudiant',
          permissions: [
            '✅ Voir les documents de ses classes actuelles',
            '✅ Télécharger les documents autorisés',
            '✅ Accéder aux cours et devoirs de ses matières',
            '❌ Télécharger des documents',
            '❌ Voir les documents d\'autres classes',
            '❌ Modifier ou supprimer des documents'
          ],
          description: 'Les étudiants ont un accès lecture seule aux documents de leurs classes.'
        };

      case 'parent':
        return {
          icon: '👨‍👩‍👧‍👦',
          title: 'Parent',
          permissions: [
            '✅ Voir les documents des classes de ses enfants',
            '✅ Télécharger certains documents (devoirs corrigés, bulletins)',
            '✅ Accéder aux annonces importantes',
            '❌ Voir tous les cours et ressources',
            '❌ Télécharger des documents',
            '❌ Accéder aux documents d\'autres élèves'
          ],
          description: 'Les parents ont un accès limité aux documents concernant directement leurs enfants.'
        };

      default:
        return {
          icon: '👤',
          title: 'Utilisateur',
          permissions: [
            '❌ Accès restreint selon le rôle',
            '❌ Contactez l\'administrateur pour plus d\'informations'
          ],
          description: 'Rôle non reconnu ou permissions non définies.'
        };
    }
  };

  const roleInfo = getRolePermissions(userRole);

  const securityFeatures = [
    {
      icon: '🔒',
      title: 'Stockage Privé',
      description: 'Tous les documents sont stockés dans un bucket privé sécurisé'
    },
    {
      icon: '👥',
      title: 'Contrôle d\'Accès Basé sur les Rôles',
      description: 'Chaque utilisateur ne voit que les documents autorisés selon son rôle'
    },
    {
      icon: '📋',
      title: 'Assignations Officielles',
      description: 'Les professeurs sont assignés officiellement par le Ministère'
    },
    {
      icon: '🏫',
      title: 'Isolation par École',
      description: 'Les documents sont isolés par établissement scolaire'
    },
    {
      icon: '📝',
      title: 'Traçabilité',
      description: 'Tous les accès aux documents sont enregistrés et traçables'
    },
    {
      icon: '🔐',
      title: 'URLs Signées',
      description: 'Les téléchargements utilisent des URLs temporaires sécurisées'
    }
  ];

  return (
    <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <span>🛡️</span>
          <span>Sécurité et Contrôle d'Accès</span>
        </h3>
        
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {showInfo ? 'Masquer' : 'Afficher'} les détails
        </button>
      </div>
      {/* Current User Role Info */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-blue-100">
        <div className="flex items-center space-x-3 mb-3">
          <span className="text-2xl">{roleInfo?.icon}</span>
          <div>
            <h4 className="font-medium text-gray-900">
              Votre rôle: {roleInfo?.title}
            </h4>
            <p className="text-sm text-gray-600">{roleInfo?.description}</p>
          </div>
        </div>

        {showInfo && (
          <div className="border-t border-gray-100 pt-3">
            <h5 className="font-medium text-gray-900 mb-2">Vos permissions:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {roleInfo?.permissions?.map((permission, index) => (
                <div key={index} className="text-sm flex items-start space-x-2">
                  <span className="mt-0.5">{permission?.startsWith('✅') ? '✅' : '❌'}</span>
                  <span className={permission?.startsWith('✅') ? 'text-green-700' : 'text-red-700'}>
                    {permission?.substring(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Security Features */}
      {showInfo && (
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <h5 className="font-medium text-gray-900 mb-3">Fonctionnalités de Sécurité:</h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {securityFeatures?.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <span className="text-xl mt-0.5">{feature?.icon}</span>
                <div>
                  <h6 className="text-sm font-medium text-gray-900">
                    {feature?.title}
                  </h6>
                  <p className="text-xs text-gray-600">
                    {feature?.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Process Workflow */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h5 className="font-medium text-gray-900 mb-3">Processus d'Assignation:</h5>
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                <span>Ministère assigne le professeur</span>
              </div>
              <span className="hidden md:block">→</span>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                <span>Secrétaire crée le compte</span>
              </div>
              <span className="hidden md:block">→</span>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                <span>Principal assigne aux classes</span>
              </div>
              <span className="hidden md:block">→</span>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                <span>Professeur gère ses documents</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessControlPanel;