/**
 * Script de vérification des variables d'environnement
 * Vérifie que les variables Supabase sont bien configurées
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification des variables d\'environnement Supabase\n');

// Charger le fichier .env
const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ Fichier .env introuvable !');
  console.log('📍 Chemin attendu :', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');

const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const foundVars = {};

envLines.forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;

  const [key, ...valueParts] = trimmed.split('=');
  const value = valueParts.join('=').trim();

  if (requiredVars.includes(key)) {
    foundVars[key] = value;
  }
});

console.log('✅ Variables trouvées dans .env :\n');

requiredVars.forEach(varName => {
  const value = foundVars[varName];
  if (value && value !== 'your-value-here' && !value.includes('REPLACE')) {
    console.log(`✅ ${varName}`);
    console.log(`   ${value.substring(0, 40)}...`);
  } else if (value) {
    console.log(`⚠️  ${varName} : Valeur placeholder détectée`);
    console.log(`   ${value}`);
  } else {
    console.log(`❌ ${varName} : MANQUANT`);
  }
  console.log('');
});

// Vérifier si toutes les variables requises sont présentes
const allPresent = requiredVars.every(varName => {
  const value = foundVars[varName];
  return value && value !== 'your-value-here' && !value.includes('REPLACE');
});

console.log('\n' + '='.repeat(60));

if (allPresent) {
  console.log('✅ Toutes les variables Supabase sont configurées !');
  console.log('\n📋 Checklist Vercel :');
  console.log('   1. Vercel Dashboard → Projet → Settings → Environment Variables');
  console.log('   2. Ajouter ces 2 variables avec les mêmes valeurs');
  console.log('   3. Cocher : Production + Preview + Development');
  console.log('   4. Redéployer l\'application');
} else {
  console.log('❌ Certaines variables sont manquantes ou invalides !');
  console.log('\n📋 Actions requises :');
  console.log('   1. Ouvrir le fichier .env à la racine du projet');
  console.log('   2. Remplacer les valeurs placeholder par les vraies valeurs');
  console.log('   3. Récupérer les valeurs depuis Supabase Dashboard :');
  console.log('      → Settings → API → URL & anon key');
  process.exit(1);
}

console.log('='.repeat(60) + '\n');
