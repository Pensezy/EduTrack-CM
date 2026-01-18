import { useState, useEffect } from 'react';
import { Modal } from '@edutrack/ui';
import { X, School as SchoolIcon, MapPin, Phone, Mail, User, Building2, Hash } from 'lucide-react';
import { getSupabaseClient, useAuth } from '@edutrack/api';

/**
 * Modal pour créer ou éditer une école
 */
export default function SchoolFormModal({ isOpen, onClose, school, onSuccess }) {
  const { user } = useAuth();
  const isEditing = !!school;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'private',
    address: '',
    city: '',
    phone: '',
    email: '',
    director_name: '',
    director_email: '',
    director_phone: '',
    status: 'active',
  });

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (school) {
      setFormData({
        name: school.name || '',
        code: school.code || '',
        type: school.type || 'private',
        address: school.address || '',
        city: school.city || '',
        phone: school.phone || '',
        email: school.email || '',
        director_name: school.director?.full_name || school.director_name || '',
        director_email: school.director?.email || '',
        director_phone: school.director?.phone || '',
        status: school.status || 'active',
      });
    } else {
      // Reset form pour création
      setFormData({
        name: '',
        code: '',
        type: 'private',
        address: '',
        city: '',
        phone: '',
        email: '',
        director_name: '',
        director_email: '',
        director_phone: '',
        status: 'active',
      });
    }
    setError('');
  }, [school, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = getSupabaseClient();

      // Validation
      if (!formData.name.trim()) {
        throw new Error('Le nom de l\'école est requis');
      }
      if (!formData.code.trim()) {
        throw new Error('Le code de l\'école est requis');
      }

      // Gérer le compte utilisateur du directeur si les informations sont fournies
      let directorUserId = isEditing ? school.director_user_id : null;

      if (formData.director_email?.trim()) {
        // Vérifier si un utilisateur avec cet email existe déjà
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id, role, full_name, current_school_id')
          .eq('email', formData.director_email.trim())
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingUser) {
          // Email existe déjà
          directorUserId = existingUser.id;

          // En mode édition : vérifier que c'est bien le directeur actuel de l'école
          if (isEditing && school.director_user_id && existingUser.id !== school.director_user_id) {
            throw new Error(
              `Cet email (${formData.director_email}) est déjà utilisé par un autre compte (${existingUser.full_name}). ` +
              'Veuillez utiliser un autre email ou lier ce compte existant.'
            );
          }

          // En mode création : vérifier que l'utilisateur n'est pas déjà directeur d'une autre école
          if (!isEditing && existingUser.role === 'principal' && existingUser.current_school_id) {
            throw new Error(
              `Cet email (${formData.director_email}) appartient déjà à un directeur d'une autre école (${existingUser.full_name}). ` +
              'Un directeur ne peut pas gérer plusieurs écoles simultanément.'
            );
          }

          // Mettre à jour les informations de l'utilisateur existant
          const { error: updateUserError } = await supabase
            .from('users')
            .update({
              full_name: formData.director_name?.trim() || existingUser.full_name,
              phone: formData.director_phone?.trim() || existingUser.phone,
              role: existingUser.role === 'admin' ? 'admin' : 'principal', // Ne pas changer admin en principal
            })
            .eq('id', existingUser.id);

          if (updateUserError) throw updateUserError;
        } else {
          // Créer un nouveau compte utilisateur pour le directeur
          // Note: Création uniquement dans public.users (pas dans auth.users)
          // Le directeur devra se créer un compte via l'application
          const { data: newUser, error: createUserError } = await supabase
            .from('users')
            .insert([{
              email: formData.director_email.trim(),
              full_name: formData.director_name?.trim() || 'Directeur',
              phone: formData.director_phone?.trim() || null,
              role: 'principal',
              current_school_id: null, // Sera défini après la création de l'école
            }])
            .select('id')
            .single();

          if (createUserError) {
            // Si l'erreur est un conflit d'email unique, afficher un message clair
            if (createUserError.code === '23505' && createUserError.message.includes('email')) {
              throw new Error(
                `Cet email (${formData.director_email}) est déjà utilisé dans le système. ` +
                'Veuillez utiliser un autre email ou contacter l\'administrateur.'
              );
            }
            throw createUserError;
          }
          directorUserId = newUser.id;
        }
      }

      if (isEditing) {
        // Mise à jour - Filtrer les champs qui n'existent pas dans la table
        const { director_email, director_phone, ...schoolData } = formData;

        const updateData = {
          ...schoolData,
          director_user_id: directorUserId,
        };

        const { error: updateError } = await supabase
          .from('schools')
          .update(updateData)
          .eq('id', school.id);

        if (updateError) throw updateError;

        // Mettre à jour current_school_id du directeur si nécessaire
        if (directorUserId) {
          await supabase
            .from('users')
            .update({ current_school_id: school.id })
            .eq('id', directorUserId);
        }
      } else {
        // Création - Vérifier la limitation en mode gratuit (sauf pour les admins)

        // Les admins peuvent créer autant d'écoles qu'ils veulent
        if (user?.role !== 'admin') {
          // 1. Compter le nombre d'écoles existantes (total système)
          const { count: schoolCount, error: countError } = await supabase
            .from('schools')
            .select('*', { count: 'exact', head: true });

          if (countError) throw countError;

          // 2. Vérifier s'il existe un abonnement payant actif
          const { data: paidSubscriptions, error: subsError } = await supabase
            .from('school_subscriptions')
            .select('id')
            .in('status', ['trial', 'active'])
            .neq('app_id', 'core') // Exclure app core gratuite
            .limit(1);

          if (subsError) throw subsError;

          const hasPaidSubscription = paidSubscriptions && paidSubscriptions.length > 0;

          // 3. Appliquer la limitation: 1 école max sans abonnement payant
          if (schoolCount >= 1 && !hasPaidSubscription) {
            throw new Error(
              'Limitation gratuite atteinte : Vous ne pouvez créer qu\'une seule école en mode gratuit. ' +
              'Pour ajouter d\'autres écoles, veuillez souscrire à un pack payant depuis l\'App Store.'
            );
          }
        }

        // Si les vérifications passent, créer l'école
        // Filtrer les champs qui n'existent pas dans la table
        const { director_email, director_phone, ...schoolData } = formData;

        const insertData = {
          ...schoolData,
          director_user_id: directorUserId,
        };

        const { data: newSchool, error: insertError } = await supabase
          .from('schools')
          .insert([insertData])
          .select('id')
          .single();

        if (insertError) throw insertError;

        // Mettre à jour current_school_id du directeur
        if (directorUserId && newSchool) {
          await supabase
            .from('users')
            .update({ current_school_id: newSchool.id })
            .eq('id', directorUserId);
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving school:', err);
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
            <SchoolIcon className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Modifier l\'école' : 'Nouvelle école'}
            </h2>
            <p className="text-sm text-gray-500">
              {isEditing ? 'Mettre à jour les informations de l\'école' : 'Enregistrer une nouvelle école'}
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

          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Informations de base
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'école *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: École Primaire Saint-Joseph"
                />
              </div>

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Code *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: EPS-001"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'établissement
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="private">Privé</option>
                  <option value="public">Public</option>
                  <option value="maternelle">Maternelle</option>
                  <option value="primaire">Primaire</option>
                  <option value="college">Collège</option>
                  <option value="lycee">Lycée</option>
                  <option value="college_lycee">Collège/Lycée</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="pending">En attente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Coordonnées */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Coordonnées
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: Avenue de l'Indépendance, Quartier Bastos"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: Yaoundé"
                />
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

              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="contact@ecole.cm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Directeur */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <User className="h-4 w-4" />
              Directeur
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="director_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  id="director_name"
                  name="director_name"
                  value={formData.director_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: M. Jean DUPONT"
                />
              </div>

              <div>
                <label htmlFor="director_email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    id="director_email"
                    name="director_email"
                    value={formData.director_email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="directeur@ecole.cm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="director_phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    id="director_phone"
                    name="director_phone"
                    value={formData.director_phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="+237 6XX XX XX XX"
                  />
                </div>
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
            {loading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer l\'école'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
