import React, { useState, useEffect } from 'react';
import DatabaseDiagnosticService from '../../../services/databaseDiagnosticService';
import Icon from '../../../components/AppIcon';

const DatabaseDiagnostic = () => {
  const [diagnostic, setDiagnostic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [repairing, setRepairing] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const result = await DatabaseDiagnosticService.runFullDiagnostic();
      setDiagnostic(result);
    } catch (error) {
      console.error('Erreur diagnostic:', error);
    } finally {
      setLoading(false);
    }
  };

  const repairPermissions = async () => {
    setRepairing(true);
    try {
      if (diagnostic?.steps?.permissions?.authUser) {
        const user = diagnostic.steps.permissions.authUser;
        const result = await DatabaseDiagnosticService.repairUserPermissions(
          user.id,
          user.email,
          user.user_metadata || {}
        );
        
        if (result.success) {
          // Re-run diagnostic after repair
          await runDiagnostic();
        }
      }
    } catch (error) {
      console.error('Erreur réparation:', error);
    } finally {
      setRepairing(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  if (loading && !diagnostic) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Diagnostic en cours...</span>
      </div>
    );
  }

  const permissions = diagnostic?.steps?.permissions;

  return (
    <div className="space-y-6">
      {/* Header - Modernisé */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-3 shadow-md">
              <Icon name="Activity" size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Diagnostic Base de Données</h3>
              <p className="text-purple-100 text-sm">Vérification de l'intégrité du système</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={runDiagnostic}
              disabled={loading}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 disabled:opacity-50 border border-white/30 transition-all shadow-md hover:shadow-lg flex items-center font-semibold"
            >
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Actualiser
            </button>
            {permissions && !permissions?.summary?.userInTable && (
              <button
                onClick={repairPermissions}
                disabled={repairing}
                className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 transition-all shadow-md hover:shadow-lg flex items-center font-semibold"
              >
                <Icon name="Wrench" size={16} className="mr-2" />
                {repairing ? 'Réparation...' : 'Réparer'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Auth Status - Modernisé */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-md">
            <Icon name="User" size={20} className="text-white" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Statut Authentification</h4>
        </div>
        {permissions?.authUser ? (
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 w-32">Email:</span>
              <span className="font-medium">{permissions.authUser.email}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 w-32">ID:</span>
              <span className="font-mono text-sm">{permissions.authUser.id}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 w-32">Rôle:</span>
              <span className="font-medium">{permissions.authUser.user_metadata?.role || 'Non défini'}</span>
            </div>
            <div className="flex items-center text-green-600">
              <Icon name="CheckCircle" size={16} className="mr-2" />
              <span>Authentifié avec succès</span>
            </div>
          </div>
        ) : (
          <div className="text-red-600 flex items-center">
            <Icon name="XCircle" size={16} className="mr-2" />
            <span>Non authentifié</span>
          </div>
        )}
      </div>

      {/* User Table Status - Modernisé */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mr-3 shadow-md">
            <Icon name="Database" size={20} className="text-white" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Table Utilisateurs</h4>
        </div>
        {permissions?.tableUser ? (
          <div className="space-y-2 text-green-600">
            <div className="flex items-center">
              <Icon name="CheckCircle" size={16} className="mr-2" />
              <span>Présent dans la table users</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 w-32">Nom:</span>
              <span className="font-medium">{permissions.tableUser.full_name}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 w-32">Rôle:</span>
              <span className="font-medium">{permissions.tableUser.role}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center text-red-600">
              <Icon name="XCircle" size={16} className="mr-2" />
              <span>Absent de la table users</span>
            </div>
            <p className="text-sm text-gray-600">
              Cela peut causer des problèmes d'accès aux données. Utilisez le bouton "Réparer" pour corriger.
            </p>
          </div>
        )}
      </div>

      {/* Table Access */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <Icon name="Table" size={16} className="mr-2" />
          Accès aux Tables
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {permissions?.tableAccess && Object.entries(permissions.tableAccess).map(([tableName, access]) => (
            <div key={tableName} className={`p-3 rounded-lg border ${
              access.accessible ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center">
                <Icon 
                  name={access.accessible ? "CheckCircle" : "XCircle"} 
                  size={16} 
                  className={`mr-2 ${access.accessible ? 'text-green-600' : 'text-red-600'}`} 
                />
                <span className="font-medium capitalize">{tableName}</span>
              </div>
              {!access.accessible && access.error && (
                <p className="text-xs text-gray-600 mt-1 truncate">{access.error}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Schools */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <Icon name="School" size={16} className="mr-2" />
          Écoles
        </h4>
        {permissions?.schoolError ? (
          <div className="text-red-600">
            <div className="flex items-center">
              <Icon name="XCircle" size={16} className="mr-2" />
              <span>Erreur d'accès: {permissions.schoolError.message}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Cela est souvent dû à des problèmes de permissions RLS (Row Level Security).
            </p>
          </div>
        ) : permissions?.schools ? (
          <div>
            <p className="text-sm text-gray-600">
              {permissions.schools.length} école(s) trouvée(s) pour ce directeur
            </p>
            {permissions.schools.map(school => (
              <div key={school.id} className="mt-2 p-2 bg-blue-50 rounded">
                <div className="font-medium">{school.name}</div>
                <div className="text-sm text-gray-600">ID: {school.id}</div>
                <div className="text-sm text-gray-600">Statut: {school.status}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-600">
            <Icon name="Info" size={16} className="inline mr-2" />
            <span>Aucune école trouvée</span>
          </div>
        )}
      </div>

      {/* Summary */}
      {permissions?.summary && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Résumé</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="bg-white p-3 rounded">
              <div className="text-blue-600 font-medium">
                {permissions.summary.authenticated ? '✅ Authentifié' : '❌ Non authentifié'}
              </div>
              <div className="text-gray-600 text-xs">Statut</div>
            </div>
            <div className="bg-white p-3 rounded">
              <div className="text-blue-600 font-medium">
                {permissions.summary.userInTable ? '✅ Présent' : '❌ Absent'}
              </div>
              <div className="text-gray-600 text-xs">Table users</div>
            </div>
            <div className="bg-white p-3 rounded">
              <div className="text-blue-600 font-medium">
                {permissions.summary.tablesAccessible}/{permissions.summary.totalTables} tables
              </div>
              <div className="text-gray-600 text-xs">Accès OK</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseDiagnostic;