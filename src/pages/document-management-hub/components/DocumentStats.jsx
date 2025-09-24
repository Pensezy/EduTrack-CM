import React from 'react';

const DocumentStats = ({ stats, documents }) => {
  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3]?.map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getTypeIcon = (type) => {
    const icons = {
      assignment: '📋',
      lesson: '📚',
      exam: '📝',
      resource: '📄',
      announcement: '📢',
      other: '📁'
    };
    return icons?.[type] || '📄';
  };

  const getTypeLabel = (type) => {
    const labels = {
      assignment: 'Devoirs',
      lesson: 'Cours',
      exam: 'Examens',
      resource: 'Ressources',
      announcement: 'Annonces',
      other: 'Autres'
    };
    return labels?.[type] || type;
  };

  // Calculate additional stats
  const totalSize = documents?.reduce((sum, doc) => sum + (doc?.file_size || 0), 0) || 0;
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  // Calculate class and subject distribution
  const classDistribution = {};
  const subjectDistribution = {};
  
  documents?.forEach(doc => {
    classDistribution[doc.class_name] = (classDistribution?.[doc?.class_name] || 0) + 1;
    subjectDistribution[doc.subject] = (subjectDistribution?.[doc?.subject] || 0) + 1;
  });

  const topClasses = Object.entries(classDistribution)?.sort(([,a], [,b]) => b - a)?.slice(0, 5);
    
  const topSubjects = Object.entries(subjectDistribution)?.sort(([,a], [,b]) => b - a)?.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total}</p>
            </div>
            <div className="text-3xl text-blue-500">📚</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ce mois</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.thisMonth}</p>
            </div>
            <div className="text-3xl text-green-500">📅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taille totale</p>
              <p className="text-2xl font-bold text-gray-900">{formatSize(totalSize)}</p>
            </div>
            <div className="text-3xl text-purple-500">💾</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Classes</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(classDistribution)?.length}</p>
            </div>
            <div className="text-3xl text-orange-500">🏫</div>
          </div>
        </div>
      </div>
      {/* Document Types Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          📊 Répartition par type de document
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(stats?.byType || {})?.map(([type, count]) => (
            <div key={type} className="text-center">
              <div className="text-3xl mb-2">{getTypeIcon(type)}</div>
              <div className="text-xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600">{getTypeLabel(type)}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Class and Subject Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Classes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            🏫 Documents par classe
          </h3>
          
          {topClasses?.length > 0 ? (
            <div className="space-y-3">
              {topClasses?.map(([className, count]) => (
                <div key={className} className="flex items-center justify-between">
                  <span className="text-gray-700">{className}</span>
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-200 rounded-full h-2 flex-1 min-w-[60px]">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ 
                          width: `${(count / Math.max(...topClasses?.map(([,c]) => c))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucune donnée disponible</p>
          )}
        </div>

        {/* Top Subjects */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            📖 Documents par matière
          </h3>
          
          {topSubjects?.length > 0 ? (
            <div className="space-y-3">
              {topSubjects?.map(([subject, count]) => (
                <div key={subject} className="flex items-center justify-between">
                  <span className="text-gray-700">{subject}</span>
                  <div className="flex items-center space-x-2">
                    <div className="bg-green-200 rounded-full h-2 flex-1 min-w-[60px]">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ 
                          width: `${(count / Math.max(...topSubjects?.map(([,c]) => c))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucune donnée disponible</p>
          )}
        </div>
      </div>
      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          ⏰ Activité récente
        </h3>
        
        {documents?.length > 0 ? (
          <div className="space-y-3">
            {documents?.slice(0, 5)?.map((doc) => (
              <div key={doc?.id} className="flex items-center space-x-3 py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-2xl">{getTypeIcon(doc?.document_type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc?.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {doc?.class_name} • {doc?.subject}
                  </p>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(doc.created_at)?.toLocaleDateString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Aucun document récent</p>
        )}
      </div>
    </div>
  );
};

export default DocumentStats;