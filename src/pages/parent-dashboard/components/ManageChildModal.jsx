import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { supabase } from '../../../lib/supabase';

/**
 * Modal pour gérer les informations d'un enfant
 * Permet au parent de :
 * - Voir les informations de l'enfant
 * - Modifier le mot de passe de l'enfant
 * - Mettre à jour le téléphone
 */
const ManageChildModal = ({ child, isOpen, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('info'); // 'info' ou 'password'
  const [loading, setLoading] = useState(false);
  
  // État pour le changement de mot de passe
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // État pour les informations
  const [phone, setPhone] = useState(child?.phone || '');

  if (!isOpen || !child) return null;

  const handlePasswordChange = async () => {
    // Validation
    if (!newPassword) {
      alert('Veuillez saisir un nouveau mot de passe');
      return;
    }

    if (newPassword.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      // Récupérer l'URL de la Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/update-student-password`;
      
      // Récupérer la session courante pour l'authentification
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('❌ Vous devez être connecté pour effectuer cette action');
        return;
      }

      // Appeler la Edge Function
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          student_user_id: child.user_id,
          new_password: newPassword,
          parent_user_id: session.user.id
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors du changement de mot de passe');
      }

      alert(`✅ Mot de passe modifié avec succès pour ${child.full_name}\n\nNouveau mot de passe: ${newPassword}\n\n⚠️ Communiquez ce mot de passe à votre enfant de manière sécurisée.`);
      setNewPassword('');
      setConfirmPassword('');
      onClose();
      
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      
      // Si l'edge function n'existe pas ou n'est pas déployée
      if (error.message.includes('fetch') || error.message.includes('404')) {
        alert(
          '⚠️ Service de modification de mot de passe non disponible\n\n' +
          `Pour modifier le mot de passe de ${child.full_name}, veuillez:\n\n` +
          `1. Contacter l'établissement\n` +
          `2. Ou demander à l'administrateur de déployer la fonction Supabase\n\n` +
          `Nouveau mot de passe souhaité: ${newPassword}\n\n` +
          'Instructions de déploiement dans supabase/functions/update-student-password/'
        );
      } else {
        alert(`❌ Erreur: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInfo = async () => {
    setLoading(true);

    try {
      // Mettre à jour le téléphone dans la table users
      const { error } = await supabase
        .from('users')
        .update({ phone: phone })
        .eq('id', child.user_id);

      if (error) throw error;

      alert(`✅ Informations mises à jour pour ${child.full_name}`);
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Erreur mise à jour info:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              <Icon name="User" size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Gérer {child.full_name}
              </h2>
              <p className="text-sm text-gray-500">
                {child.class_name} • {child.matricule || 'N/A'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Icon name="X" size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b px-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-3 px-4 border-b-2 font-medium transition-colors ${
                activeTab === 'info'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon name="Info" size={16} className="inline mr-2" />
              Informations
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-3 px-4 border-b-2 font-medium transition-colors ${
                activeTab === 'password'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon name="Lock" size={16} className="inline mr-2" />
              Mot de passe
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Icon name="Info" size={20} className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Informations de l'élève</p>
                    <p className="mt-1">
                      Ces informations sont gérées par l'établissement. Vous pouvez mettre à jour le numéro de téléphone de contact.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {child.full_name}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Matricule
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {child.matricule || 'Non assigné'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Classe
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {child.class_name || 'Non assigné'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email de connexion
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">
                    {child.email || 'Non assigné'}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Téléphone de contact"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+237 6XX XXX XXX"
                    helperText="Numéro pour contacter l'élève"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Annuler
                </Button>
                <Button onClick={handleUpdateInfo} disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Icon name="AlertTriangle" size={20} className="text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Modification du mot de passe</p>
                    <p className="mt-1">
                      Après modification, votre enfant devra utiliser ce nouveau mot de passe pour se connecter.
                      Assurez-vous de bien le noter et de le communiquer à votre enfant.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Input
                    label="Nouveau mot de passe *"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 caractères"
                    helperText="Utilisez un mot de passe fort avec lettres, chiffres et caractères spéciaux"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                  </button>
                </div>

                <Input
                  label="Confirmer le mot de passe *"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retapez le mot de passe"
                />

                <Button
                  variant="outline"
                  onClick={generateRandomPassword}
                  className="w-full"
                >
                  <Icon name="RefreshCw" size={16} className="mr-2" />
                  Générer un mot de passe aléatoire
                </Button>
              </div>

              {newPassword && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-800 mb-2">
                    Nouveau mot de passe à communiquer :
                  </p>
                  <div className="bg-white px-3 py-2 rounded border border-green-300 font-mono text-sm">
                    {newPassword}
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    ⚠️ Notez ce mot de passe dans un endroit sûr avant de valider
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Annuler
                </Button>
                <Button
                  onClick={handlePasswordChange}
                  disabled={loading || !newPassword || newPassword !== confirmPassword}
                >
                  {loading ? 'Modification...' : 'Modifier le mot de passe'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageChildModal;
