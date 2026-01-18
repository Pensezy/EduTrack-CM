import React, { useState, useEffect } from 'react';
import Icon from '../components/AppIcon';
import SessionManager from '../utils/sessionManager';

/**
 * Composant de debug pour visualiser toutes les sessions actives
 * Utile en développement pour comprendre quel compte est connecté
 */
const SessionDebugger = () => {
  const [sessions, setSessions] = useState({});
  const [showDebug, setShowDebug] = useState(false);

  const refreshSessions = () => {
    const allSessions = SessionManager.getAllSessions();
    setSessions(allSessions);
  };

  useEffect(() => {
    refreshSessions();
    
    // Rafraîchir quand une session change
    const handleSessionChange = () => {
      refreshSessions();
    };

    window.addEventListener('edutrack-user-changed', handleSessionChange);
    return () => window.removeEventListener('edutrack-user-changed', handleSessionChange);
  }, []);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 z-50"
        title="Afficher les sessions actives"
      >
        <Icon name="Bug" size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 z-50 max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <Icon name="Bug" size={18} className="mr-2" />
          Sessions Actives
        </h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <Icon name="X" size={18} />
        </button>
      </div>

      {Object.keys(sessions).length === 0 ? (
        <p className="text-sm text-gray-500">Aucune session active</p>
      ) : (
        <div className="space-y-2">
          {Object.entries(sessions).map(([role, data]) => (
            <div
              key={role}
              className="bg-gray-50 border border-gray-200 rounded p-2 text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-700 capitalize">
                  {role === 'principal' && '🎓 Directeur'}
                  {role === 'teacher' && '👨‍🏫 Enseignant'}
                  {role === 'student' && '🎒 Étudiant'}
                  {role === 'parent' && '👨‍👩‍👧 Parent'}
                  {role === 'secretary' && '📋 Secrétaire'}
                </span>
                <button
                  onClick={() => {
                    SessionManager.clearSession(role);
                    refreshSessions();
                  }}
                  className="text-red-500 hover:text-red-700"
                  title="Supprimer cette session"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
              <div className="text-gray-600">
                <div className="truncate">👤 {data.full_name}</div>
                <div className="truncate">📧 {data.email}</div>
                {data.school_name && (
                  <div className="truncate">🏫 {data.school_name}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
        <button
          onClick={refreshSessions}
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
        >
          <Icon name="RefreshCw" size={12} className="mr-1" />
          Rafraîchir
        </button>
        <button
          onClick={() => {
            if (window.confirm('Supprimer toutes les sessions ?')) {
              SessionManager.clearAllSessions();
              refreshSessions();
            }
          }}
          className="text-xs text-red-600 hover:text-red-800 flex items-center"
        >
          <Icon name="Trash2" size={12} className="mr-1" />
          Tout supprimer
        </button>
      </div>
    </div>
  );
};

export default SessionDebugger;
