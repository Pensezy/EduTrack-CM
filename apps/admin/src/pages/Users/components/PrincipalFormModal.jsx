import { useState, useEffect } from 'react';
import { Modal } from '@edutrack/ui';
import { X, User as UserIcon, Mail, Phone, School, Key, Eye, EyeOff, Copy, CheckCircle, AlertCircle, UserCheck } from 'lucide-react';
import { getSupabaseClient, useAuth } from '@edutrack/api';
import { createUserAccount } from '../../../services/createUserAccount';

/**
 * Modal spécialisé pour créer ou éditer un directeur d'école
 * Permet de l'affecter à une école spécifique
 */
export default function PrincipalFormModal({ isOpen, onClose, user, onSuccess }) {
  const { user: currentUser } = useAuth();
  const isEditing = !!user;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [schools, setSchools] = useState([]);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState({ email: false, password: false });

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    current_school_id: '',
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
        is_active: user.is_active !== undefined ? user.is_active : true,
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        current_school_id: '',
        is_active: true,
      });
    }
    setError('');
    setGeneratedCredentials(null);
  }, [user, isOpen]);

  const loadSchools = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name, code')
        .eq('status', 'active')
        .order('name');

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
    const length = 14;
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
        // Mode édition
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
        // Mode création
        const generatedPassword = generateSecurePassword();

        // Créer le compte via Edge Function
        const result = await createUserAccount({
          email: formData.email,
          password: generatedPassword,
          fullName: formData.full_name,
          phone: formData.phone,
          role: 'principal',
          schoolId: formData.current_school_id,
          createdByUserId: currentUser?.id
        });

        // Afficher les identifiants
        setGeneratedCredentials({
          email: formData.email,
          password: generatedPassword,
          fullName: formData.full_name,
          schoolName: schools.find(s => s.id === formData.current_school_id)?.name || '',
        });

        onSuccess();
      }
    } catch (err) {
      console.error('Error saving principal:', err);
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  // Écran de confirmation
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
                Directeur créé avec succès!
              </h2>
              <p className="text-sm text-gray-500">
                Conservez ces identifiants pour le nouveau directeur
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <School className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800 mb-1">
                  Directeur d'école - {generatedCredentials.schoolName}
                </h3>
                <p className="text-sm text-blue-700">
                  Ce compte aura accès à toutes les fonctionnalités de gestion de son établissement.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-900">{generatedCredentials.fullName}</p>
            </div>
          </div>

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
              >
                {copied.email ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe temporaire
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <Key className="h-4 w-4 text-green-600" />
                <p className="text-sm font-mono font-medium text-green-900">
                  {showPassword ? generatedCredentials.password : '••••••••••••••'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              <button
                type="button"
                onClick={() => handleCopy(generatedCredentials.password, 'password')}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                {copied.password ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Instructions</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Transmettez ces identifiants au directeur de manière sécurisée</li>
              <li>Le directeur devra changer son mot de passe lors de la première connexion</li>
              <li>Il aura accès à toutes les fonctionnalités de son établissement</li>
            </ol>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
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
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
            <UserCheck className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Modifier le directeur' : 'Nouveau directeur'}
            </h2>
            <p className="text-sm text-gray-500">
              {isEditing ? 'Mettre à jour les informations du directeur' : 'Créer un nouveau compte directeur d\'école'}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Paul ESSOMBA"
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
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="directeur@ecole.cm"
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
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+237 6XX XX XX XX"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Affectation */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <School className="h-4 w-4" />
              Affectation *
            </h3>
            <select
              id="current_school_id"
              name="current_school_id"
              value={formData.current_school_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionner une école</option>
              {schools.map(school => (
                <option key={school.id} value={school.id}>
                  {school.name} ({school.code})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              Le directeur aura accès à toutes les fonctionnalités de gestion de cet établissement
            </p>
          </div>

          {/* Statut */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer le directeur'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
