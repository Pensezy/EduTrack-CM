import { useState, useEffect } from 'react';
import { Modal } from '@edutrack/ui';
import { X, User as UserIcon, Mail, Phone, Home, Briefcase, Key, Eye, EyeOff, Copy, CheckCircle, AlertCircle, RefreshCw, Lock } from 'lucide-react';
import { getSupabaseClient, useAuth } from '@edutrack/api';
import { createUserAccount, updateUserFields, updateUserPassword } from '../../../services/createUserAccount';
import { useToast } from '../../../components/Toast';

/**
 * Modal spécialisé pour créer ou éditer un parent
 * Supporte les parents SANS email (génération automatique d'email technique)
 */
export default function ParentFormModal({ isOpen, onClose, user, onSuccess }) {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const isEditing = !!user;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [schools, setSchools] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [copiedField, setCopiedField] = useState('');

  // États pour la modification de mot de passe
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '', // Optionnel - sera généré si vide
    phone: '', // OBLIGATOIRE
    profession: '', // Optionnel
    address: '', // Optionnel
    current_school_id: '',
    is_active: true,
    // Pas de mot de passe dans le formulaire - généré automatiquement pour les nouveaux comptes
  });

  // Charger les écoles
  useEffect(() => {
    if (isOpen) {
      loadSchools();
    }
  }, [isOpen]);

  const loadSchools = async () => {
    try {
      const supabase = getSupabaseClient();
      let query = supabase
        .from('schools')
        .select('id, name, code')
        .eq('status', 'active')
        .order('name');

      // Les directeurs ne voient que leur école
      if (currentUser?.role === 'principal' && currentUser?.current_school_id) {
        query = query.eq('id', currentUser.current_school_id);
      }

      const { data, error: schoolsError } = await query;
      if (schoolsError) throw schoolsError;
      setSchools(data || []);
    } catch (err) {
      console.error('Error loading schools:', err);
    }
  };

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        profession: user.profession || '',
        address: user.address || '',
        current_school_id: user.current_school_id || '',
        is_active: user.is_active !== undefined ? user.is_active : true,
      });
    } else {
      // Mode création - pré-remplir l'école pour les directeurs
      const defaultSchoolId = currentUser?.role === 'principal' ? currentUser.current_school_id : '';
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        profession: '',
        address: '',
        current_school_id: defaultSchoolId,
        is_active: true,
      });
    }
    setError('');
    setGeneratedCredentials(null);
    // Réinitialiser les états de mot de passe
    setShowPasswordSection(false);
    setNewPassword('');
    setShowNewPassword(false);
    setPasswordSuccess(false);
  }, [user, isOpen, currentUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  /**
   * Génère un email technique basé sur le téléphone
   * Format: parent[numéro]@edutrack.cm
   * Exemple: parent237677234567@edutrack.cm
   */
  const generateTechnicalEmail = (phone) => {
    const cleanPhone = phone.replace(/\s+/g, '').replace(/\+/g, '');
    return `parent${cleanPhone}@edutrack.cm`;
  };

  /**
   * Génère un mot de passe sécurisé
   */
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&';
    let password = '';
    // Au moins une majuscule, une minuscule, un chiffre et un caractère spécial
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '@$!%*?&'[Math.floor(Math.random() * 7)];

    for (let i = 4; i < 8; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }

    return password.split('').sort(() => 0.5 - Math.random()).join('');
  };

  /**
   * Copie un texte dans le presse-papier
   */
  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  /**
   * Génère un nouveau mot de passe pour l'utilisateur
   */
  const handleGenerateNewPassword = () => {
    const newPass = generateSecurePassword();
    setNewPassword(newPass);
    setShowNewPassword(true);
  };

  /**
   * Met à jour le mot de passe du parent
   */
  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      setPasswordLoading(true);
      await updateUserPassword(user.id, newPassword, currentUser.id);
      setPasswordSuccess(true);
      toast.success('Mot de passe mis à jour avec succès');

      // Réinitialiser après 3 secondes
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordSection(false);
        setNewPassword('');
        setShowNewPassword(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating password:', err);
      toast.error(err.message || 'Erreur lors de la mise à jour du mot de passe');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = getSupabaseClient();

      // Validation
      if (!formData.full_name.trim()) {
        throw new Error('Le nom complet est requis');
      }
      if (!formData.phone.trim()) {
        throw new Error('Le téléphone est requis (obligatoire pour la connexion)');
      }
      if (!formData.current_school_id) {
        throw new Error('L\'école est requise');
      }

      // Vérification sécurité directeur
      if (currentUser?.role === 'principal') {
        if (formData.current_school_id !== currentUser.current_school_id) {
          throw new Error('Vous ne pouvez créer des parents que pour votre propre école');
        }
      }

      // Déterminer l'email de connexion
      let connectionEmail = formData.email.trim();
      let isEmailGenerated = false;

      // Si pas d'email fourni, générer un email technique
      if (!connectionEmail) {
        connectionEmail = generateTechnicalEmail(formData.phone);
        isEmailGenerated = true;
        console.log('📧 Email technique généré:', connectionEmail);
      }

      // Vérifier l'unicité de l'email de connexion
      const { data: existingEmail, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', connectionEmail)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingEmail && (!isEditing || existingEmail.id !== user.id)) {
        if (isEmailGenerated) {
          throw new Error(`Ce numéro de téléphone (${formData.phone}) est déjà utilisé par un autre parent`);
        } else {
          throw new Error(`Cet email (${connectionEmail}) est déjà utilisé par un autre compte`);
        }
      }

      const userData = {
        full_name: formData.full_name.trim(),
        email: connectionEmail, // Email de connexion (personnel ou généré)
        phone: formData.phone.trim(),
        role: 'parent',
        current_school_id: formData.current_school_id,
        is_active: formData.is_active,
        // Champs spécifiques aux parents
        profession: formData.profession.trim() || null,
        address: formData.address.trim() || null,
      };

      if (isEditing) {
        // Mode édition - mise à jour uniquement
        const { error: updateError } = await supabase
          .from('users')
          .update(userData)
          .eq('id', user.id);

        if (updateError) throw updateError;

        onSuccess();
        onClose();
      } else {
        // Mode création - générer mot de passe et créer compte
        const generatedPassword = generateSecurePassword();

        // Créer le compte via Edge Function
        const result = await createUserAccount({
          email: connectionEmail,
          password: generatedPassword,
          fullName: userData.full_name,
          phone: userData.phone,
          role: 'parent',
          schoolId: userData.current_school_id,
          createdByUserId: currentUser?.id
        });

        // Mettre à jour avec profession et address
        if (userData.profession || userData.address) {
          await updateUserFields(result.userId, {
            profession: userData.profession || null,
            address: userData.address || null,
          });
        }

        // Afficher les identifiants générés
        setGeneratedCredentials({
          email: connectionEmail,
          password: generatedPassword,
          isEmailGenerated: isEmailGenerated,
          phone: formData.phone,
          fullName: formData.full_name,
        });

        // Toast de succès
        toast.success(`Compte parent créé pour ${formData.full_name.trim()}`, {
          title: 'Succès',
        });

        // Ne pas fermer le modal - laisser l'utilisateur copier les identifiants
        onSuccess();
      }
    } catch (err) {
      console.error('Error saving parent:', err);
      const errorMessage = err.message || 'Erreur lors de l\'enregistrement';
      setError(errorMessage);
      // Afficher le toast d'erreur
      toast.error(errorMessage, {
        title: 'Erreur de création',
        duration: 8000
      });
    } finally {
      setLoading(false);
    }
  };

  // Affichage des identifiants générés
  if (generatedCredentials) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Compte parent créé avec succès !
              </h2>
              <p className="text-sm text-gray-500">
                Veuillez noter ces identifiants et les communiquer au parent
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations du parent */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Informations du parent</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p><strong>Nom :</strong> {generatedCredentials.fullName}</p>
              <p><strong>Téléphone :</strong> {generatedCredentials.phone}</p>
              <p><strong>Rôle :</strong> Parent</p>
            </div>
          </div>

          {/* Identifiants de connexion */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
              <Key className="h-5 w-5" />
              Identifiants de connexion
            </h3>

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de connexion {generatedCredentials.isEmailGenerated && '(généré automatiquement)'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generatedCredentials.email}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(generatedCredentials.email, 'email')}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {copiedField === 'email' ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
                {generatedCredentials.isEmailGenerated && (
                  <p className="mt-1 text-xs text-purple-600">
                    💡 Cet email a été généré automatiquement car aucun email personnel n'a été fourni
                  </p>
                )}
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={generatedCredentials.password}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white font-mono text-sm"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(generatedCredentials.password, 'password')}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {copiedField === 'password' ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions pour le parent */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-900 mb-2">📱 Instructions à communiquer au parent</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
              <li>Allez sur le site : <strong>www.edutrack.cm</strong></li>
              <li>Cliquez sur "Connexion"</li>
              <li>Entrez l'email : <strong>{generatedCredentials.email}</strong></li>
              <li>Entrez le mot de passe fourni ci-dessus</li>
              <li>Vous pourrez changer votre mot de passe après la première connexion</li>
            </ol>
          </div>

          {/* Avertissement */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">⚠️ Important :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Conservez ces identifiants en lieu sûr</li>
                  <li>Communiquez-les de manière sécurisée au parent (impression, SMS sécurisé)</li>
                  <li>Le parent pourra modifier son mot de passe après connexion</li>
                  {generatedCredentials.isEmailGenerated && (
                    <li>Si le parent obtient un email personnel, vous pourrez le modifier dans "Gestion des Utilisateurs"</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            J'ai noté les identifiants
          </button>
        </div>
      </Modal>
    );
  }

  // Formulaire de création/édition
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-100">
            <UserIcon className="h-5 w-5 text-pink-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Modifier le parent' : 'Nouveau parent'}
            </h2>
            <p className="text-sm text-gray-500">
              {isEditing ? 'Mettre à jour les informations du parent' : 'Enregistrer un nouveau parent/tuteur'}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Informations personnelles
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Ex: Marie NGONO"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone * (obligatoire)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="+237 6XX XX XX XX"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Le téléphone est le moyen de contact principal
                </p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email (optionnel)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="parent@example.com"
                  />
                </div>
                {!isEditing && (
                  <p className="mt-1 text-xs text-blue-600">
                    💡 Si vide, un email technique sera généré automatiquement
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
                  Profession (optionnel)
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="profession"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Ex: Commerçant"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse (optionnel)
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Ex: Bonanjo, Douala"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* École */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">École *</h3>
            <select
              id="current_school_id"
              name="current_school_id"
              value={formData.current_school_id}
              onChange={handleChange}
              required
              disabled={currentUser?.role === 'principal'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100"
            >
              <option value="">Sélectionner une école</option>
              {schools.map(school => (
                <option key={school.id} value={school.id}>
                  {school.name} ({school.code})
                </option>
              ))}
            </select>
          </div>

          {/* Section Modification de mot de passe (mode édition uniquement) */}
          {isEditing && (currentUser?.role === 'admin' || currentUser?.role === 'principal') && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Mot de passe
                </h3>
                {!showPasswordSection && (
                  <button
                    type="button"
                    onClick={() => setShowPasswordSection(true)}
                    className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                  >
                    Modifier le mot de passe
                  </button>
                )}
              </div>

              {showPasswordSection && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                  {passwordSuccess ? (
                    <div className="flex items-center gap-3 text-green-700 bg-green-50 p-3 rounded-lg">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Mot de passe mis à jour avec succès !</span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nouveau mot de passe
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Entrez ou générez un mot de passe"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={handleGenerateNewPassword}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-1"
                            title="Générer un mot de passe"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                          {newPassword && (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(newPassword, 'newPassword')}
                              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                              title="Copier"
                            >
                              {copiedField === 'newPassword' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                            </button>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Minimum 8 caractères. Le mot de passe sera envoyé au parent.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleUpdatePassword}
                          disabled={passwordLoading || !newPassword || newPassword.length < 8}
                          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {passwordLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Mise à jour...
                            </>
                          ) : (
                            <>
                              <Key className="h-4 w-4" />
                              Mettre à jour le mot de passe
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordSection(false);
                            setNewPassword('');
                            setShowNewPassword(false);
                          }}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Annuler
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Statut */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
              />
              <span className="text-sm font-medium text-gray-700">Compte actif</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer le parent'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
