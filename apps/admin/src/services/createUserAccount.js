/**
 * Service pour créer des comptes utilisateurs via Edge Function
 * Utilise la Edge Function create-staff-account qui a les permissions admin
 */

import { getSupabaseClient } from '@edutrack/api';

/**
 * Crée un compte utilisateur (parent, enseignant, secrétaire, élève)
 *
 * @param {Object} params - Paramètres de création
 * @param {string} params.email - Email de connexion
 * @param {string} params.password - Mot de passe
 * @param {string} params.fullName - Nom complet
 * @param {string} params.phone - Numéro de téléphone
 * @param {string} params.role - Rôle (parent, teacher, secretary, student)
 * @param {string} params.schoolId - ID de l'école
 * @param {string} params.createdByUserId - ID de l'utilisateur qui crée le compte
 * @param {Object} [params.additionalData] - Données supplémentaires spécifiques au rôle
 * @returns {Promise<{userId: string, success: boolean}>}
 */
export async function createUserAccount({
  email,
  password,
  fullName,
  phone,
  role,
  schoolId,
  createdByUserId,
  additionalData = {}
}) {
  const supabase = getSupabaseClient();

  // Récupérer la session actuelle pour l'authentification
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error('Session non valide. Veuillez vous reconnecter.');
  }

  // Séparer le nom en firstName et lastName
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Préparer les données pour la Edge Function
  const requestBody = {
    email,
    password,
    fullName,
    phone,
    role,
    schoolId,
    createdByUserId,
    firstName,
    lastName,
    ...additionalData // Permet d'ajouter des données supplémentaires
  };

  // Appeler la Edge Function
  const response = await fetch(
    `${supabase.supabaseUrl}/functions/v1/create-staff-account`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': supabase.supabaseKey,
      },
      body: JSON.stringify(requestBody)
    }
  );

  const result = await response.json();

  if (!response.ok || result.error) {
    const errorMessage = result.error || `Erreur HTTP ${response.status}`;

    // Traduire les erreurs courantes de Supabase Auth
    if (errorMessage.includes('already been registered') || errorMessage.includes('already exists')) {
      throw new Error(`Cet email est déjà utilisé. Veuillez en choisir un autre ou vérifier les comptes existants.`);
    }
    if (errorMessage.includes('Invalid email')) {
      throw new Error(`L'adresse email n'est pas valide.`);
    }
    if (errorMessage.includes('Password')) {
      throw new Error(`Le mot de passe ne respecte pas les critères de sécurité.`);
    }

    throw new Error(errorMessage);
  }

  return {
    userId: result.userId,
    success: result.success,
    message: result.message
  };
}

/**
 * Met à jour des champs supplémentaires dans la table users
 * Utile pour ajouter profession, address, etc. après la création du compte
 *
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} updates - Champs à mettre à jour
 * @returns {Promise<void>}
 */
export async function updateUserFields(userId, updates) {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Erreur mise à jour utilisateur:', error);
    throw new Error(`Erreur mise à jour: ${error.message}`);
  }
}
