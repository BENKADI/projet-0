import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from '../lib/axios';

export default function TestAuth() {
  const { user } = useAuth();
  const [results, setResults] = useState<any>({});

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    // Récupérer le token depuis 'token' ou 'user'
    let token = localStorage.getItem('token');
    if (!token) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          token = user.token;
        } catch (e) {
          console.error('Error parsing user');
        }
      }
    }
    
    const testResults: any = {};

    // Test 1: Token présent
    testResults.tokenExists = !!token;
    testResults.tokenPreview = token ? token.substring(0, 30) + '...' : 'AUCUN';
    testResults.tokenSource = localStorage.getItem('token') ? 'token' : (localStorage.getItem('user') ? 'user' : 'AUCUN');

    // Test 2: User dans contexte
    testResults.userInContext = !!user;
    testResults.userEmail = user?.email || 'AUCUN';
    testResults.userRole = user?.role || 'AUCUN';

    // Test 3: API Health
    try {
      const healthResponse = await fetch('http://localhost:3000/health');
      testResults.apiHealth = healthResponse.ok ? '✅ OK' : '❌ ERREUR';
    } catch (error) {
      testResults.apiHealth = '❌ INACCESSIBLE';
    }

    // Test 4: API Settings/app
    try {
      const settingsResponse = await axios.get('/settings/app');
      testResults.settingsApi = '✅ OK - Status: ' + settingsResponse.status;
      testResults.settingsData = JSON.stringify(settingsResponse.data, null, 2);
    } catch (error: any) {
      testResults.settingsApi = `❌ ERREUR - Status: ${error.response?.status || 'N/A'}`;
      testResults.settingsError = error.response?.data?.message || error.message;
    }

    // Test 5: API Settings/preferences
    try {
      const prefsResponse = await axios.get('/settings/preferences');
      testResults.preferencesApi = '✅ OK - Status: ' + prefsResponse.status;
    } catch (error: any) {
      testResults.preferencesApi = `❌ ERREUR - Status: ${error.response?.status || 'N/A'}`;
      testResults.preferencesError = error.response?.data?.message || error.message;
    }

    setResults(testResults);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔍 Diagnostic d'Authentification</h1>

      <div className="space-y-4">
        {/* Test 1 */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">1. Token JWT</h3>
          <div className="text-sm space-y-1">
            <div>Présent: <span className={results.tokenExists ? 'text-green-600' : 'text-red-600'}>
              {results.tokenExists ? '✅ OUI' : '❌ NON'}
            </span></div>
            <div>Source: <span className="text-blue-600">{results.tokenSource}</span></div>
            <div className="text-gray-500 font-mono text-xs break-all">
              {results.tokenPreview}
            </div>
          </div>
        </div>

        {/* Test 2 */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">2. Utilisateur dans Contexte</h3>
          <div className="text-sm space-y-1">
            <div>User: <span className={results.userInContext ? 'text-green-600' : 'text-red-600'}>
              {results.userInContext ? '✅ OUI' : '❌ NON'}
            </span></div>
            <div>Email: {results.userEmail}</div>
            <div>Rôle: {results.userRole}</div>
          </div>
        </div>

        {/* Test 3 */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">3. API Backend Health</h3>
          <div className="text-sm">
            {results.apiHealth || 'En cours...'}
          </div>
        </div>

        {/* Test 4 */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">4. API /settings/app</h3>
          <div className="text-sm space-y-2">
            <div>{results.settingsApi || 'En cours...'}</div>
            {results.settingsError && (
              <div className="text-red-600 bg-red-50 p-2 rounded">
                Erreur: {results.settingsError}
              </div>
            )}
            {results.settingsData && (
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                {results.settingsData}
              </pre>
            )}
          </div>
        </div>

        {/* Test 5 */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">5. API /settings/preferences</h3>
          <div className="text-sm space-y-2">
            <div>{results.preferencesApi || 'En cours...'}</div>
            {results.preferencesError && (
              <div className="text-red-600 bg-red-50 p-2 rounded">
                Erreur: {results.preferencesError}
              </div>
            )}
          </div>
        </div>

        {/* Diagnostic */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold mb-2">📋 Diagnostic</h3>
          <div className="text-sm space-y-2">
            {!results.tokenExists && (
              <div className="text-red-600">
                ❌ <strong>Problème:</strong> Aucun token JWT trouvé.<br/>
                <strong>Solution:</strong> Connectez-vous via /login
              </div>
            )}
            {results.tokenExists && !results.userInContext && (
              <div className="text-yellow-600">
                ⚠️ <strong>Problème:</strong> Token présent mais utilisateur non chargé.<br/>
                <strong>Solution:</strong> Vérifier AuthContext
              </div>
            )}
            {results.settingsApi?.includes('401') && (
              <div className="text-red-600">
                ❌ <strong>Problème:</strong> API retourne 401 (Non autorisé).<br/>
                <strong>Solution:</strong> Token invalide ou expiré. Reconnectez-vous.
              </div>
            )}
            {results.settingsApi?.includes('✅') && (
              <div className="text-green-600">
                ✅ <strong>Tout fonctionne!</strong> Les paramètres sont accessibles.
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={runTests}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🔄 Relancer les tests
          </button>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            🔑 Aller au Login
          </button>
          <button
            onClick={() => window.location.href = '/settings'}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            ⚙️ Aller aux Paramètres
          </button>
        </div>
      </div>
    </div>
  );
}
