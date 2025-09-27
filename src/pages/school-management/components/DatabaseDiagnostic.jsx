import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';

const DatabaseDiagnostic = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    setResults(null);

    try {
      const diagnostics = {};

      // 1. Test de connexion basique
      const { data: connectionTest, error: connectionError } = await supabase
        .from('schools')
        .select('count')
        .limit(1);
      
      diagnostics.connection = {
        success: !connectionError,
        error: connectionError?.message
      };

      // 2. Vérifier si la fonction existe
      const { data: functionTest, error: functionError } = await supabase.rpc('create_principal_school', {
        director_name: 'Test',
        email_input: 'test@example.com',
        phone_input: '123456789',
        school_name: 'École Test',
        school_type: 'college_lycee',
        school_address: 'Test Address',
        school_city: 'Test City',
        school_country: 'Test Country',
        available_classes: ['6è']
      });

      diagnostics.function = {
        success: !functionError,
        error: functionError?.message,
        data: functionTest
      };

      // 3. Compter les enregistrements
      const { data: schoolsCount, error: schoolsError } = await supabase
        .from('schools')
        .select('*', { count: 'exact' });

      diagnostics.schoolsCount = {
        success: !schoolsError,
        count: schoolsCount?.length || 0,
        error: schoolsError?.message
      };

      // 4. Vérifier les utilisateurs Auth récents
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

      diagnostics.authUsers = {
        success: !authError,
        count: authUsers?.users?.length || 0,
        error: authError?.message,
        recentUsers: authUsers?.users?.slice(-3).map(u => ({
          id: u.id,
          email: u.email,
          created: u.created_at,
          confirmed: u.email_confirmed_at
        }))
      };

      setResults(diagnostics);
    } catch (error) {
      console.error('Diagnostic error:', error);
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">🔍 Diagnostic Base de Données</h2>
      
      <button
        onClick={runDiagnostic}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Diagnostic en cours...' : 'Lancer le diagnostic'}
      </button>

      {results && (
        <div className="mt-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">📊 Résultats du diagnostic :</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <h3 className="font-bold text-yellow-800 mb-2">⚠️ Instructions :</h3>
        <ul className="text-yellow-700 space-y-1">
          <li>• Ce diagnostic vérifie l'état de la base de données</li>
          <li>• Il teste la connexion, les fonctions SQL, et les tables</li>
          <li>• Utilisez ceci pour identifier les problèmes d'enregistrement</li>
        </ul>
      </div>
    </div>
  );
};

export default DatabaseDiagnostic;