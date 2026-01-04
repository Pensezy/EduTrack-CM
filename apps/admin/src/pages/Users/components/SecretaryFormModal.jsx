import { useState, useEffect } from 'react';
import { Modal } from '@edutrack/ui';
import { X, User as UserIcon, Mail, Phone, Key, Eye, EyeOff, Copy, CheckCircle, AlertCircle, Briefcase } from 'lucide-react';
import { getSupabaseClient, useAuth } from '@edutrack/api';
import { createUserAccount, updateUserFields } from '../../../services/createUserAccount';

/**
 * Modal spécialisé pour créer ou éditer une secrétaire
 * Utilise l'Edge Function pour la création de compte
 */
export default function SecretaryFormModal({ isOpen, onClose, user, onSuccess }) {
  const { user: currentUser } = useAuth();
  const isEditing = !!user;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subscriptionError, setSubscriptionError] = useState(false); // Pour détecter erreur abonnement
  const [schools, setSchools] = useState([]);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState({ email: false, password: false });

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    current_school_id: '',
    hire_date: new Date().toISOString().split('T')[0],
    department: '',
    is_active: true,
  });

  useEffect(() => {
    if (isOpen) {
      loadSchools();
    }
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        current_school_id: user.current_school_id || '',
        hire_date: user.hire_date || new Date().toISOString().split('T')[0],
        department: user.department || '',
        is_active: user.is_active !== undefined ? user.is_active : true,
      });
    } else {
      const defaultSchoolId = currentUser?.role === 'principal' ? currentUser.current_school_id : '';
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        current_school_id: defaultSchoolId,
        hire_date: new Date().toISOString().split('T')[0],
        department: '',
        is_active: true,
      });
    }
    setError('');
    setSubscriptionError(false);
    setGeneratedCredentials(null);
  }, [user, isOpen, currentUser]);

  const loadSchools = async () => {
    try {
      const supabase = getSupabaseClient();
      let query = supabase
        .from('schools')
        .select('id, name, code')
        .eq('status', 'active')
        .order('name');

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateSecurePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.full_name.trim()) {
        throw new Error('Le nom complet est requis');
      }
      if (!formData.email.trim()) {
        throw new Error('L\'email est requis');
      }
      if (!formData.phone.trim()) {
        throw new Error('Le téléphone est requis');
      }
      if (!formData.current_school_id) {
        throw new Error('L\'école est requise');
      }

      if (isEditing) {
        // Mode édition - mise à jour simple
        const supabase = getSupabaseClient();
        const { error: updateError } = await supabase
          .from('users')
          .update({
            full_name: formData.full_name,
            phone: formData.phone,
            current_school_id: formData.current_school_id,
            is_active: formData.is_active,
          })
          .eq('id', user.id);

        if (updateError) throw updateError;

        onSuccess();
        onClose();
      } else {
        // Mode création - générer mot de passe et créer compte
        const generatedPassword = generateSecurePassword();

        // Créer le compte via Edge Function
        const result = await createUserAccount({
          email: formData.email,
          password: generatedPassword,
          fullName: formData.full_name,
          phone: formData.phone,
          role: 'secretary',
          schoolId: formData.current_school_id,
          createdByUserId: currentUser?.id
        });

        // Mettre à jour avec department si fourni
        if (formData.department) {
          await updateUserFields(result.userId, {
            department: formData.department
          });
        }

        // Afficher les identifiants générés
        setGeneratedCredentials({
          email: formData.email,
          password: generatedPassword,
          fullName: formData.full_name,
        });

        onSuccess();
      }
    } catch (err) {
      console.error('Error saving secretary:', err);
      const errorMessage = err.message || 'Erreur lors de l\'enregistrement';

      // Détecter si c'est une erreur de limitation d'abonnement
      if (errorMessage.includes('App Core gratuite') ||
          errorMessage.includes('App Académique') ||
          errorMessage.includes('secrétaires ne sont pas disponibles')) {
        setSubscriptionError(true);
        setError(errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Si les identifiants ont été générés, afficher l'écran de confirmation
  if (generatedCredentials) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Secrétaire créée avec succès!
              </h2>
              <p className="text-sm text-gray-500">
                Notez bien ces identifiants de connexion
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations de connexion */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800 mb-1">
                  Important - Conservez ces informations
                </h3>
                <p className="text-sm text-yellow-700">
                  Ces identifiants ne seront affichés qu'une seule fois. Assurez-vous de les transmettre à la secrétaire de manière sécurisée.
                </p>
              </div>
            </div>
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-900">{generatedCredentials.fullName}</p>
              </div>
            </div>
          </div>

          {/* Email de connexion */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de connexion
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Mail className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-mono font-medium text-blue-900">{generatedCredentials.email}</p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(generatedCredentials.email, 'email')}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Copier l'email"
              >
                {copied.email ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe temporaire
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <Key className="h-4 w-4 text-green-600" />
                <p className="text-sm font-mono font-medium text-green-900">
                  {showPassword ? generatedCredentials.password : '••••••••••••'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title={showPassword ? "Masquer" : "Afficher"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              <button
                type="button"
                onClick={() => handleCopy(generatedCredentials.password, 'password')}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Copier le mot de passe"
              >
                {copied.password ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Instructions pour la secrétaire</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Connectez-vous avec l'email et le mot de passe ci-dessus</li>
              <li>Changez votre mot de passe lors de la première connexion</li>
              <li>Complétez votre profil si nécessaire</li>
            </ol>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            J'ai noté les identifiants
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100">
            <Briefcase className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Modifier la secrétaire' : 'Nouvelle secrétaire'}
            </h2>
            <p className="text-sm text-gray-500">
              {isEditing ? 'Mettre à jour les informations' : 'Enregistrer une nouvelle secrétaire'}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {/* Modal de blocage si erreur d'abonnement */}
          {subscriptionError ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 mb-2">Abonnement requis</p>
                <p className="text-sm text-red-700 mb-3">{error}</p>
                <a
                  href="/app-store"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
                >
                  Voir les packs disponibles
                </a>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          ) : null}

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Ex: Sophie MBARGA"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isEditing}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:bg-gray-100"
                    placeholder="secretaire@ecole.cm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone *
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
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="+237 6XX XX XX XX"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* École */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Affectation *</h3>
            <select
              id="current_school_id"
              name="current_school_id"
              value={formData.current_school_id}
              onChange={handleChange}
              required
              disabled={currentUser?.role === 'principal'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:bg-gray-100"
            >
              <option value="">Sélectionner une école</option>
              {schools.map(school => (
                <option key={school.id} value={school.id}>
                  {school.name} ({school.code})
                </option>
              ))}
            </select>
          </div>

          {/* Département (optionnel) */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Département (optionnel)
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="Ex: Administration, Scolarité"
            />
          </div>

          {/* Statut */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
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
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer la secrétaire'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
