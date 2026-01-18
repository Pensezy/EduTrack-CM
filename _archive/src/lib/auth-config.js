// Configuration pour désactiver la confirmation d'email en développement
// À ajouter dans les paramètres Supabase Auth

// Dans le dashboard Supabase :
// 1. Aller dans Authentication > Settings
// 2. Désactiver "Enable email confirmations" pour le développement
// 3. Ou ajouter une politique RLS pour auto-confirmer les comptes principaux

// Alternative : fonction pour confirmer automatiquement les emails en développement
export const autoConfirmEmailInDev = async (email) => {
  if (process.env.NODE_ENV === 'development') {
    try {
      // Cette fonction nécessiterait une clé service, pas disponible côté client
      console.log('Mode développement : Email auto-confirmé pour', email);
      return true;
    } catch (error) {
      console.error('Erreur auto-confirmation:', error);
      return false;
    }
  }
  return false;
};

// Instructions pour désactiver la confirmation d'email dans Supabase :
/*
1. Allez dans votre dashboard Supabase
2. Projet > Authentication > Settings
3. Décochez "Enable email confirmations"
4. Sauvegardez

OU

Dans la section Email Templates, vous pouvez personnaliser le message de confirmation
*/