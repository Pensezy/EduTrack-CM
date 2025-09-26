import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

/**
 * Composant de diagnostic pour vérifier la structure de la base de données
 * À utiliser temporairement pour comprendre quelles tables/colonnes existent
 */
const DatabaseDiagnostic = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testTables = async () => {
    setLoading(true);
    setError(null);
    const testResults = {};

    // Liste des tables à tester
    const tables = ['students', 'teachers', 'attendance', 'payments', 'grades', 'classes', 'subjects'];

    for (const table of tables) {
      try {
        console.log(`Testing table: ${table}`);
        
        // Test 1: Vérifier si la table existe et récupérer quelques enregistrements
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(3);

        if (error) {
          testResults[table] = {
            exists: false,
            error: error.message,
            count: 0,
            columns: [],
            sampleData: []
          };
        } else {
          // Extraire les noms de colonnes du premier enregistrement
          const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
          
          testResults[table] = {
            exists: true,
            error: null,
            count: count || 0,
            columns,
            sampleData: data || []
          };
        }
      } catch (err) {
        testResults[table] = {
          exists: false,
          error: err.message,
          count: 0,
          columns: [],
          sampleData: []
        };
      }
    }

    setResults(testResults);
    setLoading(false);
  };

  const TableResult = ({ tableName, result }) => (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg">{tableName}</h3>
        <span className={`px-2 py-1 rounded text-sm ${
          result.exists 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {result.exists ? '✅ Existe' : '❌ Manquante'}
        </span>
      </div>
      
      {result.exists ? (
        <>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Nombre d'enregistrements :</strong> {result.count}
          </p>
          
          <div className="mb-2">
            <strong className="text-sm">Colonnes :</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {result.columns.map(col => (
                <span key={col} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {col}
                </span>
              ))}
            </div>
          </div>
          
          {result.sampleData.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium">
                Données d'exemple ({result.sampleData.length})
              </summary>
              <pre className="bg-gray-100 p-2 rounded text-xs mt-2 overflow-auto">
                {JSON.stringify(result.sampleData, null, 2)}
              </pre>
            </details>
          )}
        </>
      ) : (
        <p className="text-red-600 text-sm">
          <strong>Erreur :</strong> {result.error}
        </p>
      )}
    </div>
  );

  useEffect(() => {
    testTables();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">🔍 Diagnostic Base de Données</h2>
        <p className="text-gray-600">
          Vérification de la structure et du contenu des tables Supabase
        </p>
        <button
          onClick={testTables}
          disabled={loading}
          className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Test en cours...' : '🔄 Retester'}
        </button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Test des tables en cours...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Erreur globale :</strong> {error}
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(results).map(([tableName, result]) => (
          <TableResult key={tableName} tableName={tableName} result={result} />
        ))}
      </div>

      {Object.keys(results).length > 0 && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">📊 Résumé</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Tables existantes :</strong>
              <ul className="list-disc list-inside">
                {Object.entries(results)
                  .filter(([_, result]) => result.exists)
                  .map(([name, result]) => (
                    <li key={name}>{name} ({result.count} enregistrements)</li>
                  ))
                }
              </ul>
            </div>
            <div>
              <strong>Tables manquantes :</strong>
              <ul className="list-disc list-inside">
                {Object.entries(results)
                  .filter(([_, result]) => !result.exists)
                  .map(([name]) => (
                    <li key={name} className="text-red-600">{name}</li>
                  ))
                }
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseDiagnostic;