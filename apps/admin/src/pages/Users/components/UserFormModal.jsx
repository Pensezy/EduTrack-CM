import { useState, useEffect } from 'react';
import { Modal } from '@edutrack/ui';
import { X, User as UserIcon, Mail, Shield, School, Phone, Hash } from 'lucide-react';
import { getSupabaseClient } from '@edutrack/api';

/**
 * Modal pour créer ou éditer un utilisateur
 */
export default function UserFormModal({ isOpen, onClose, user, onSuccess }) {
  const isEditing = !!user;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [schools, setSchools] = useState([]);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'student',
    current_school_id: '',
    is_active: true,
  });

  // Charger les écoles pour le select
  useEffect(() => {
    if (isOpen) {
      loadSchools();
    }
  }, [isOpen]);

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

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'student',
        current_school_id: user.current_school_id || '',
        is_active: user.is_active !== undefined ? user.is_active : true,
      });
    } else {
      // Reset form pour création
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        role: 'student',
        current_school_id: '',
        is_active: true,
      });
    }
    setError('');
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      if (!formData.email.trim()) {
        throw new Error('L\'email est requis');
      }
      if (!formData.current_school_id) {
        throw new Error('L\'école est requise');
      }

      if (isEditing) {
        // Mise à jour
        const { error: updateError } = await supabase
          .from('users')
          .update(formData)
          .eq('id', user.id);

        if (updateError) throw updateError;
      } else {
        // Création
        const { error: insertError } = await supabase
          .from('users')
          .insert([formData]);

        if (insertError) throw insertError;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100">
            <UserIcon className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </h2>
            <p className="text-sm text-gray-500">
              {isEditing ? 'Mettre à jour les informations de l\'utilisateur' : 'Enregistrer un nouvel utilisateur'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 transition-colors"
        >
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: Jean DUPONT"
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
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="jean.dupont@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="+237 6XX XX XX XX"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="admin">Administrateur</option>
                  <option value="principal">Directeur</option>
                  <option value="teacher">Enseignant</option>
                  <option value="student">Élève</option>
                  <option value="parent">Parent</option>
                  <option value="secretary">Secrétaire</option>
                </select>
              </div>

              <div>
                <label htmlFor="current_school_id" className="block text-sm font-medium text-gray-700 mb-1">
                  École *
                </label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    id="current_school_id"
                    name="current_school_id"
                    value={formData.current_school_id}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Sélectionner une école</option>
                    {schools.map(school => (
                      <option key={school.id} value={school.id}>
                        {school.name} ({school.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Compte actif</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer l\'utilisateur'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
