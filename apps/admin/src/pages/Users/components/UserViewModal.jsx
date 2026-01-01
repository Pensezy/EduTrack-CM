import { Modal } from '@edutrack/ui';
import { X, User as UserIcon, Mail, Phone, Shield, School, Calendar, CheckCircle, XCircle, Hash } from 'lucide-react';
import { formatDate } from '@edutrack/utils';

/**
 * Modal pour voir les détails d'un utilisateur
 */
export default function UserViewModal({ isOpen, onClose, user, onEdit }) {
  if (!user) return null;

  const getRoleBadge = (role) => {
    const badges = {
      admin: {
        text: 'Administrateur',
        className: 'bg-purple-100 text-purple-800'
      },
      principal: {
        text: 'Directeur',
        className: 'bg-blue-100 text-blue-800'
      },
      teacher: {
        text: 'Enseignant',
        className: 'bg-green-100 text-green-800'
      },
      student: {
        text: 'Élève',
        className: 'bg-yellow-100 text-yellow-800'
      },
      parent: {
        text: 'Parent',
        className: 'bg-pink-100 text-pink-800'
      },
      secretary: {
        text: 'Secrétaire',
        className: 'bg-gray-100 text-gray-800'
      }
    };

    const badge = badges[role] || badges.student;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.text}
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3" />
        Actif
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <XCircle className="h-3 w-3" />
        Inactif
      </span>
    );
  };

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100">
        <Icon className="h-4 w-4 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm text-gray-900 mt-0.5 break-words">{value || 'Non renseigné'}</p>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100">
            <UserIcon className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user.full_name}</h2>
            <div className="flex items-center gap-2 mt-1">
              {getRoleBadge(user.role)}
              {getStatusBadge(user.is_active)}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="p-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
        {/* Informations personnelles */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-3">
            <UserIcon className="h-4 w-4" />
            Informations personnelles
          </h3>
          <div className="space-y-1 divide-y divide-gray-100">
            <InfoRow icon={UserIcon} label="Nom complet" value={user.full_name} />
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow icon={Phone} label="Téléphone" value={user.phone} />
          </div>
        </div>

        {/* Configuration */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4" />
            Configuration
          </h3>
          <div className="space-y-1 divide-y divide-gray-100">
            <InfoRow
              icon={Shield}
              label="Rôle"
              value={
                <span className="inline-flex">
                  {getRoleBadge(user.role)}
                </span>
              }
            />
            <InfoRow
              icon={Hash}
              label="Statut"
              value={
                <span className="inline-flex">
                  {getStatusBadge(user.is_active)}
                </span>
              }
            />
          </div>
        </div>

        {/* Métadonnées */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4" />
            Informations système
          </h3>
          <div className="space-y-1 divide-y divide-gray-100">
            <InfoRow
              icon={Calendar}
              label="Date de création"
              value={user.created_at ? formatDate(user.created_at) : 'Non disponible'}
            />
            {user.updated_at && (
              <InfoRow
                icon={Calendar}
                label="Dernière modification"
                value={formatDate(user.updated_at)}
              />
            )}
            {user.last_login && (
              <InfoRow
                icon={Calendar}
                label="Dernière connexion"
                value={formatDate(user.last_login)}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Fermer
        </button>
        {onEdit && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(user);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Modifier
          </button>
        )}
      </div>
    </Modal>
  );
}
