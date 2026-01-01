import { Modal } from '@edutrack/ui';
import { X, GraduationCap, School, Users, BookOpen, Calendar, Hash } from 'lucide-react';
import { formatDate } from '@edutrack/utils';

/**
 * Modal pour voir les détails d'une classe
 */
export default function ClassViewModal({ isOpen, onClose, classData, onEdit }) {
  if (!classData) return null;

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
            <GraduationCap className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{classData.name}</h2>
            <p className="text-sm text-gray-500">{classData.grade_level}{classData.section ? ` - ${classData.section}` : ''}</p>
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
            <GraduationCap className="h-4 w-4" />
            Informations de base
          </h3>
          <div className="space-y-1 divide-y divide-gray-100">
            <InfoRow icon={GraduationCap} label="Nom de la classe" value={classData.name} />
            <InfoRow icon={BookOpen} label="Niveau" value={classData.grade_level} />
            {classData.section && (
              <InfoRow icon={Hash} label="Section / Série" value={classData.section} />
            )}
            <InfoRow icon={Calendar} label="Année scolaire" value={classData.school_year} />
          </div>
        </div>

        {/* Effectifs */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-3">
            <Users className="h-4 w-4" />
            Effectifs
          </h3>
          <div className="space-y-1 divide-y divide-gray-100">
            <InfoRow
              icon={Users}
              label="Nombre maximum d'élèves"
              value={classData.max_students || 40}
            />
            <InfoRow
              icon={Users}
              label="Élèves inscrits"
              value={classData.student_count || 0}
            />
            {classData.max_students && (
              <div className="py-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>Taux de remplissage</span>
                  <span>
                    {classData.student_count || 0} / {classData.max_students}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      (classData.student_count || 0) >= classData.max_students
                        ? 'bg-red-600'
                        : (classData.student_count || 0) >= classData.max_students * 0.8
                        ? 'bg-yellow-600'
                        : 'bg-green-600'
                    }`}
                    style={{
                      width: `${Math.min(((classData.student_count || 0) / classData.max_students) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            )}
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
              value={classData.created_at ? formatDate(classData.created_at) : 'Non disponible'}
            />
            {classData.updated_at && (
              <InfoRow
                icon={Calendar}
                label="Dernière modification"
                value={formatDate(classData.updated_at)}
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
              onEdit(classData);
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
