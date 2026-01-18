/**
 * Script de test EmailJS
 * Ce script teste la configuration EmailJS et l'envoi d'emails
 * 
 * Pour l'exécuter dans la console du navigateur :
 * 1. Ouvrez votre application
 * 2. Ouvrez la console (F12)
 * 3. Copiez-collez ce script
 */

import { sendCredentialsEmail, isEmailConfigured } from '../services/emailService';

export async function testEmailJSConfiguration() {
  console.log('🧪 TEST DE CONFIGURATION EMAILJS');
  console.log('================================\n');

  // 1. Vérifier les variables d'environnement
  console.log('📋 Variables d\'environnement :');
  console.log('  VITE_EMAILJS_SERVICE_ID:', import.meta.env.VITE_EMAILJS_SERVICE_ID || '❌ MANQUANT');
  console.log('  VITE_EMAILJS_TEMPLATE_ID:', import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '❌ MANQUANT');
  console.log('  VITE_EMAILJS_PUBLIC_KEY:', import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? '✅ Présente' : '❌ MANQUANTE');
  
  // 2. Vérifier la configuration
  const isConfigured = isEmailConfigured();
  console.log('\n🔧 Configuration EmailJS:', isConfigured ? '✅ OK' : '❌ INCOMPLÈTE');

  if (!isConfigured) {
    console.error('\n❌ Configuration incomplète !');
    console.log('\n📝 Pour configurer EmailJS :');
    console.log('1. Créez un compte sur https://emailjs.com');
    console.log('2. Ajoutez un service email (Gmail, Outlook...)');
    console.log('3. Créez un template avec les variables :');
    console.log('   - to_email, to_name, role, login_email, login_password');
    console.log('   - school_name, principal_name, login_url, current_year');
    console.log('4. Ajoutez les clés dans le fichier .env :');
    console.log('   VITE_EMAILJS_SERVICE_ID=service_xxx');
    console.log('   VITE_EMAILJS_TEMPLATE_ID=template_xxx');
    console.log('   VITE_EMAILJS_PUBLIC_KEY=xxx');
    console.log('5. Redémarrez le serveur de développement (npm start)');
    return { success: false, error: 'Configuration incomplète' };
  }

  // 3. Test d'envoi avec des données fictives
  console.log('\n📧 Test d\'envoi d\'email...');
  console.log('Destinataire : test@example.com');
  
  try {
    const result = await sendCredentialsEmail({
      recipientEmail: 'test@example.com',
      recipientName: 'Utilisateur Test',
      role: 'Enseignant',
      email: 'test@example.com',
      password: 'Test123456!',
      schoolName: 'École Test',
      principalName: 'Directeur Test',
    });

    console.log('\n📬 Résultat de l\'envoi :');
    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ TEST RÉUSSI !');
      console.log('L\'email a été envoyé avec succès.');
      console.log('Vérifiez la boîte de réception de test@example.com');
      return { success: true, result };
    } else {
      console.error('\n❌ TEST ÉCHOUÉ !');
      console.error('Erreur :', result.error);
      if (result.technicalError) {
        console.error('Erreur technique :', result.technicalError);
      }
      
      console.log('\n🔍 Diagnostics supplémentaires :');
      console.log('1. Vérifiez que vous êtes connecté à Internet');
      console.log('2. Vérifiez que les IDs dans .env correspondent à ceux sur emailjs.com');
      console.log('3. Vérifiez que le template existe et est actif sur emailjs.com');
      console.log('4. Vérifiez que votre compte EmailJS n\'a pas atteint sa limite (200/mois gratuit)');
      
      return { success: false, result };
    }
  } catch (error) {
    console.error('\n💥 ERREUR INATTENDUE !');
    console.error(error);
    return { success: false, error: error.message };
  }
}

// Export pour utilisation dans la console
if (typeof window !== 'undefined') {
  window.testEmailJS = testEmailJSConfiguration;
  console.log('💡 Pour tester EmailJS, tapez : testEmailJS()');
}

export default testEmailJSConfiguration;
