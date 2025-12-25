const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Fonction pour créer une icon
function createIcon(size, outputPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Fond bleu gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#3b82f6');
  gradient.addColorStop(1, '#2563eb');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Texte "ET" (EduTrack)
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ET', size / 2, size / 2);

  // Sous-titre "EduTrack"
  ctx.font = `${size * 0.08}px Arial`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText('EduTrack', size / 2, size * 0.75);

  // Icon d'éducation (chapeau de graduation emoji simulé)
  ctx.font = `${size * 0.15}px Arial`;
  ctx.fillText('🎓', size / 2, size * 0.2);

  // Sauvegarder
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Created: ${outputPath} (${size}x${size})`);
}

// Créer les 3 icons
const publicDir = path.join(__dirname, 'public');

console.log('🎨 Generating PWA icons...\n');

createIcon(192, path.join(publicDir, 'pwa-192x192.png'));
createIcon(512, path.join(publicDir, 'pwa-512x512.png'));
createIcon(180, path.join(publicDir, 'apple-touch-icon.png'));

console.log('\n✅ All PWA icons created successfully!');
console.log('\n📍 Icons saved in: public/');
console.log('   - pwa-192x192.png');
console.log('   - pwa-512x512.png');
console.log('   - apple-touch-icon.png');
console.log('\n🚀 Next step: npm run build');
