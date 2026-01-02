import { Modal } from '@edutrack/ui';
import { X, School as SchoolIcon, MapPin, Phone, Mail, User, Building2, Hash, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatDate } from '@edutrack/utils';

/**
 * Modal pour voir les détails d'une école
 */
export default function SchoolViewModal({ isOpen, onClose, school, onEdit }) {
  if (!school) return null;

  const getStatusBadge = (status) => {
    const badges = {
      active: {
        icon: CheckCircle,
        text: 'Actif',
        className: 'bg-green-100 text-green-800'
      },
      inactive: {
        icon: XCircle,
        text: 'Inactif',
        className: 'bg-gray-100 text-gray-800'
      },
      pending: {
        icon: AlertCircle,
        text: 'En attente',
        className: 'bg-yellow-100 text-yellow-800'
      }
    };

    const badge = badges[status] || badges.active;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
        <Icon className="h-3 w-3" />
        {badge.text}
      </span>
    );
  };

  const getSchoolTypeLabel = (type) => {
    const types = {
      public: 'Public',
      private: 'Privé',
      maternelle: 'Maternelle',
      primaire: 'Primaire',
      college: 'Collège',
      lycee: 'Lycée',
      college_lycee: 'Collège/Lycée',
    };
    return types[type] || type;
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
            <SchoolIcon className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{school.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500">{school.code}</span>
              {getStatusBadge(school.status)}
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
        {/* Informations de base */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4" />
            Informations de base
          </h3>
          <div className="space-y-1 divide-y divide-gray-100">
            <InfoRow icon={SchoolIcon} label="Nom de l'école" value={school.name} />
            <InfoRow icon={Hash} label="Code" value={school.code} />
            <InfoRow icon={Building2} label="Type" value={getSchoolTypeLabel(school.type)} />
          </div>
        </div>

        {/* Coordonnées */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4" />
            Coordonnées
          </h3>
          <div className="space-y-1 divide-y divide-gray-100">
            <InfoRow icon={MapPin} label="Adresse" value={school.address} />
            <InfoRow icon={MapPin} label="Ville" value={school.city} />
            <InfoRow icon={Phone} label="Téléphone" value={school.phone} />
            <InfoRow icon={Mail} label="Email" value={school.email} />
          </div>
        </div>

        {/* Directeur */}
        {(school.director_name || school.director) && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-3">
              <User className="h-4 w-4" />
              Directeur
            </h3>
            <div className="space-y-1 divide-y divide-gray-100">
              <InfoRow icon={User} label="Nom" value={school.director_name || school.director?.full_name} />
              <InfoRow icon={Mail} label="Email" value={school.director?.email} />
              <InfoRow icon={Phone} label="Téléphone" value={school.director?.phone} />
            </div>
          </div>
        )}

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
              value={school.created_at ? formatDate(school.created_at) : 'Non disponible'}
            />
            {school.updated_at && (
              <InfoRow
                icon={Calendar}
                label="Dernière modification"
                value={formatDate(school.updated_at)}
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
              onEdit(school);
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
