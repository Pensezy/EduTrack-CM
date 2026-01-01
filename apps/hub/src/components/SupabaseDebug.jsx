/**
 * Composant de Debug Supabase - À RETIRER EN PRODUCTION
 * Affiche l'état de la configuration Supabase
 */

export default function SupabaseDebug() {
  const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

  const isConfigured = !!(supabaseUrl && supabaseKey);

  if (import.meta.env.PROD && isConfigured) {
    // Ne rien afficher en production si tout est OK
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: isConfigured ? '#10b981' : '#ef4444',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '300px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
        {isConfigured ? '✅ Supabase Configuré' : '❌ Supabase NON Configuré'}
      </div>

      <div style={{ fontSize: '11px', opacity: 0.9 }}>
        <div>URL: {supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : '❌ Manquant'}</div>
        <div>Key: {supabaseKey ? `${supabaseKey.substring(0, 20)}...` : '❌ Manquant'}</div>
        <div style={{ marginTop: '4px', fontSize: '10px' }}>
          Env: {import.meta.env.MODE || 'unknown'}
        </div>
      </div>

      {!isConfigured && (
        <div style={{
          marginTop: '8px',
          padding: '6px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '4px',
          fontSize: '10px'
        }}>
          ⚠️ Variables Vercel manquantes !
        </div>
      )}
    </div>
  );
}
