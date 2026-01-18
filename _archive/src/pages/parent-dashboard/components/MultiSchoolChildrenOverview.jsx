import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MultiSchoolChildrenOverview = ({ 
  parentGlobalId, 
  children = [], 
  schools = [], 
  isLoading = false,
}) => {
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0]);
    }
  }, [children]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-10 border-2 border-blue-200 shadow-xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <span className="text-blue-900 font-display font-bold">Chargement de vos enfants...</span>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 p-10 shadow-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow-md">
          <Icon name="Users" size={40} className="text-white" />
        </div>
        <h3 className="text-xl font-display font-bold text-gray-800 mb-2">Aucun enfant trouvé</h3>
        <p className="text-gray-600">Contactez le secrétariat pour inscrire vos enfants.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble multi-établissements - Modernisée */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl shadow-lg">
              🏫
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">
                Vos Enfants Multi-Établissements
              </h2>
              <p className="text-blue-100 mt-1">
                Un seul compte pour tous vos enfants dans différentes écoles
              </p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 shadow-md border border-white/30">
            <div className="text-3xl font-display font-bold">{children.length}</div>
            <div className="text-sm text-blue-100 mt-1">Enfant(s)</div>
          </div>
        </div>

        {/* Statistiques rapides - Modernisées */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30 shadow-md">
            <div className="text-2xl font-display font-bold">
              {schools?.length || new Set(children.map(c => c.schoolId || c.school?.id)).size}
            </div>
            <div className="text-sm text-blue-100 mt-1">Établissement(s)</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30 shadow-md">
            <div className="text-2xl font-display font-bold">
              {new Set(children.map(c => typeof c.school === 'object' ? c.school?.name : c.school)).size}
            </div>
            <div className="text-sm text-blue-100 mt-1">École(s) différente(s)</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30 shadow-md">
            <div className="text-2xl font-display font-bold">
              {children.filter(c => c.averageGrade > 0).length}
            </div>
            <div className="text-sm text-blue-100 mt-1">Avec notes</div>
          </div>
        </div>
      </div>

      {/* Sélecteur d'enfant - Modernisé */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children.map((child, index) => {
          const childName = child.full_name || child.name || `${child.firstName || ''} ${child.lastName || ''}`;
          const childInitial = childName.charAt(0).toUpperCase();
          const childClass = typeof child.class === 'object' ? child.class?.name : child.class;
          const childSchool = typeof child.school === 'object' ? child.school?.name : child.school;
          
          return (
            <div
              key={child.id || index}
              onClick={() => setSelectedChild(child)}
              className={`group rounded-2xl p-5 cursor-pointer transition-all duration-300 border-2 shadow-md hover:shadow-xl hover:scale-102 ${
                selectedChild?.id === child.id
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-display font-bold text-xl shadow-md group-hover:scale-110 transition-transform">
                    {childInitial}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-gray-900">
                      {childName}
                    </h3>
                    <p className="text-sm text-gray-600 font-body-medium">
                      {childClass || 'Classe non renseignée'}
                    </p>
                  </div>
                </div>
                {selectedChild?.id === child.id && (
                  <div className="p-1.5 bg-blue-500 rounded-lg shadow-md">
                    <Icon name="Check" size={18} className="text-white" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm bg-gray-50 rounded-lg p-2">
                  <div className="p-1 bg-indigo-100 rounded-md mr-2">
                    <Icon name="School" size={14} className="text-indigo-600" />
                  </div>
                  <span className="font-body-bold text-gray-800">{childSchool || 'École non renseignée'}</span>
                </div>
                {child.matricule && (
                  <div className="flex items-center text-sm bg-gray-50 rounded-lg p-2">
                    <div className="p-1 bg-purple-100 rounded-md mr-2">
                      <Icon name="Tag" size={14} className="text-purple-600" />
                    </div>
                    <span className="font-body-medium text-gray-700">{child.matricule}</span>
                  </div>
                )}
              </div>

              {(child.averageGrade > 0 || child.attendanceRate > 0) && (
                <div className="mt-4 pt-4 border-t-2 border-gray-100 flex justify-between">
                  {child.averageGrade > 0 && (
                    <div className="text-center">
                      <div className="text-lg font-display font-bold text-blue-600">{child.averageGrade.toFixed(1)}/20</div>
                      <div className="text-xs text-gray-500">Moyenne</div>
                    </div>
                  )}
                  {child.attendanceRate > 0 && (
                    <div className="text-center">
                      <div className="text-lg font-display font-bold text-green-600">{child.attendanceRate}%</div>
                      <div className="text-xs text-gray-500">Présence</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Détails de l'enfant sélectionné - Modernisé */}
      {selectedChild && (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-5">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-display font-bold shadow-md">
                {(selectedChild.full_name || selectedChild.name || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900">
                  {selectedChild.full_name || selectedChild.name || 'Nom non disponible'}
                </h2>
                <p className="text-gray-600 font-body-medium mt-1">
                  {typeof selectedChild.class === 'object' ? selectedChild.class?.name : selectedChild.class} 
                  {' • '}
                  {typeof selectedChild.school === 'object' ? selectedChild.school?.name : selectedChild.school}
                </p>
                {selectedChild.matricule && (
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <Icon name="Tag" size={14} />
                    Matricule: {selectedChild.matricule}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Statistiques de l'enfant */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {selectedChild.averageGrade > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center border-2 border-blue-200">
                <div className="text-2xl font-display font-bold text-blue-600">{selectedChild.averageGrade.toFixed(1)}/20</div>
                <div className="text-sm text-gray-600 mt-1">Moyenne générale</div>
              </div>
            )}
            {selectedChild.attendanceRate > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center border-2 border-green-200">
                <div className="text-2xl font-display font-bold text-green-600">{selectedChild.attendanceRate}%</div>
                <div className="text-sm text-gray-600 mt-1">Taux de présence</div>
              </div>
            )}
            {selectedChild.unreadNotifications > 0 && (
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 text-center border-2 border-orange-200">
                <div className="text-2xl font-display font-bold text-orange-600">{selectedChild.unreadNotifications}</div>
                <div className="text-sm text-gray-600 mt-1">Notifications</div>
              </div>
            )}
            {selectedChild.pendingPayments > 0 && (
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 text-center border-2 border-red-200">
                <div className="text-2xl font-display font-bold text-red-600">{selectedChild.pendingPayments}</div>
                <div className="text-sm text-gray-600 mt-1">Paiements en attente</div>
              </div>
            )}
          </div>

          {/* Informations détaillées simplifiées */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations scolaires */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
              <h3 className="font-display font-bold text-xl text-blue-900 mb-4 flex items-center gap-2">
                <Icon name="School" size={24} className="text-blue-600" />
                Informations Scolaires
              </h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3">
                  <span className="text-sm text-gray-500">Établissement:</span>
                  <p className="font-body-bold text-gray-900">
                    {typeof selectedChild.school === 'object' ? selectedChild.school?.name : selectedChild.school || 'Non renseigné'}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <span className="text-sm text-gray-500">Classe:</span>
                  <p className="font-body-bold text-gray-900">
                    {typeof selectedChild.class === 'object' ? selectedChild.class?.name : selectedChild.class || 'Non renseignée'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact et notifications */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
              <h3 className="font-display font-bold text-xl text-purple-900 mb-4 flex items-center gap-2">
                <Icon name="Bell" size={24} className="text-purple-600" />
                Suivi et Notifications
              </h3>
              <div className="space-y-3">
                {selectedChild.email && (
                  <div className="bg-white rounded-lg p-3">
                    <span className="text-sm text-gray-500">Email:</span>
                    <p className="font-body-bold text-gray-900">{selectedChild.email}</p>
                  </div>
                )}
                {selectedChild.phone && (
                  <div className="bg-white rounded-lg p-3">
                    <span className="text-sm text-gray-500">Téléphone:</span>
                    <p className="font-body-bold text-gray-900">{selectedChild.phone}</p>
                  </div>
                )}
                {!selectedChild.email && !selectedChild.phone && (
                  <div className="bg-white rounded-lg p-3 text-center text-gray-500">
                    <Icon name="Info" size={20} className="mx-auto mb-2" />
                    <p className="text-sm">Aucune information de contact disponible</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSchoolChildrenOverview;