import { useState, useEffect } from 'react';
import { Modal } from '@edutrack/ui';
import { X, School as SchoolIcon, MapPin, Phone, Mail, User, Building2, Hash, AlertCircle } from 'lucide-react';
import { getSupabaseClient, useAuth } from '@edutrack/api';

/**
 * Modal pour demander la création d'un établissement
 * Seuls les utilisateurs avec abonnement actif peuvent faire une demande
 */
export default function SchoolRequestModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [canRequest, setCanRequest] = useState(false);
  const [checking, setChecking] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    school_type: 'primaire', // maternelle, primaire, college, lycee, college_lycee
    ownership_type: 'private', // private, public
    region: '',
    department: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    director_full_name: '',
    director_phone: '',
    director_email: '',
    justification: '',
  });

  // Vérifier si l'utilisateur peut faire une demande
  useEffect(() => {
    if (isOpen) {
      checkEligibility();
    }
  }, [isOpen]);

  const checkEligibility = async () => {
    try {
      setChecking(true);
      const supabase = getSupabaseClient();

      // Seuls les admins peuvent créer directement
      if (user?.role === 'admin') {
        setCanRequest(true);
        setChecking(false);
        return;
      }

      // Vérifier si l'utilisateur a un abonnement payant actif
      const { data: activeSubscriptions, error } = await supabase
        .from('school_subscriptions')
        .select('id, app_id, school_id')
        .in('status', ['trial', 'active'])
        .neq('app_id', 'core') // Exclure l'app gratuite
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;

      if (!activeSubscriptions || activeSubscriptions.length === 0) {
        setCanRequest(false);
        setError(
          'Vous devez avoir un abonnement actif (autre que le pack gratuit) pour demander la création d\'un nouvel établissement. ' +
          'Veuillez souscrire à un pack payant depuis la page Bundles.'
        );
      } else {
        setCanRequest(true);
      }
    } catch (err) {
      console.error('Error checking eligibility:', err);
      setCanRequest(false);
      setError('Impossible de vérifier votre éligibilité. Veuillez réessayer.');
    } finally {
      setChecking(false);
    }
  };

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
        throw new Error('Le nom de l\'établissement est requis');
      }
      if (!formData.code.trim()) {
        throw new Error('Le code de l\'établissement est requis');
      }
      if (!formData.region.trim()) {
        throw new Error('La région est requise');
      }
      if (!formData.city.trim()) {
        throw new Error('La ville est requise');
      }
      if (!formData.director_full_name.trim()) {
        throw new Error('Le nom du directeur est requis');
      }
      if (!formData.director_email.trim()) {
        throw new Error('L\'email du directeur est requis');
      }
      if (!formData.justification.trim()) {
        throw new Error('La justification de la demande est requise');
      }

      // Créer une demande de création d'établissement
      const { error: requestError } = await supabase
        .from('school_creation_requests')
        .insert([{
          requester_user_id: user.id,
          school_name: formData.name.trim(),
          school_code: formData.code.trim(),
          school_type: formData.school_type,
          ownership_type: formData.ownership_type,
          region: formData.region.trim(),
          department: formData.department.trim(),
          city: formData.city.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          director_full_name: formData.director_full_name.trim(),
          director_phone: formData.director_phone.trim(),
          director_email: formData.director_email.trim(),
          justification: formData.justification.trim(),
          status: 'pending',
          created_at: new Date().toISOString(),
        }]);

      if (requestError) throw requestError;

      // Créer une notification pour les admins
      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin');

      if (admins && admins.length > 0) {
        const notifications = admins.map(admin => ({
          user_id: admin.id,
          title: 'Nouvelle demande de création d\'établissement',
          message: `${user.full_name} a demandé la création de l'établissement "${formData.name}" (${formData.code})`,
          type: 'info',
          priority: 'high',
          action_url: '/schools/requests',
          metadata: {
            requester_id: user.id,
            school_name: formData.name,
          },
        }));

        await supabase.from('user_notifications').insert(notifications);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error submitting school request:', err);
      setError(err.message || 'Erreur lors de la soumission de la demande');
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
              Demande de création d'établissement
            </h2>
            <p className="text-sm text-gray-500">
              Soumettre une demande pour validation par un administrateur
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
          <X className="h-6 w-6" />
        </button>
      </div>

      {checking ? (
        <div className="p-12 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-sm text-gray-500">Vérification de votre éligibilité...</p>
        </div>
      ) : !canRequest ? (
        <div className="p-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 mb-2">Abonnement requis</p>
              <p className="text-sm text-red-700">{error}</p>
              <a
                href="/bundles"
                className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
              >
                Voir les packs disponibles
              </a>
            </div>
          </div>
        </div>
      ) : (
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
                Informations de l'établissement
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'établissement *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: École Primaire Bilingue Les Étoiles"
                  />
                </div>

                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                    Code de l'établissement *
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
                      placeholder="Ex: EPB-YDE-001"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="school_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Type d'établissement *
                  </label>
                  <select
                    id="school_type"
                    name="school_type"
                    value={formData.school_type}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="maternelle">Maternelle</option>
                    <option value="primaire">Primaire</option>
                    <option value="college">Collège</option>
                    <option value="lycee">Lycée</option>
                    <option value="college_lycee">Collège/Lycée</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="ownership_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Statut de l'établissement *
                  </label>
                  <select
                    id="ownership_type"
                    name="ownership_type"
                    value={formData.ownership_type}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="private">Privé</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Localisation */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Localisation
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                    Région *
                  </label>
                  <select
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Sélectionner une région</option>
                    <option value="centre">Centre</option>
                    <option value="littoral">Littoral</option>
                    <option value="sud">Sud</option>
                    <option value="est">Est</option>
                    <option value="ouest">Ouest</option>
                    <option value="nord">Nord</option>
                    <option value="extreme_nord">Extrême-Nord</option>
                    <option value="adamaoua">Adamaoua</option>
                    <option value="sud_ouest">Sud-Ouest</option>
                    <option value="nord_ouest">Nord-Ouest</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                    Département
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: Mfoundi"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    Ville *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: Yaoundé"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse complète
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: Quartier Bastos, Rue 1.234"
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

                <div>
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
                Informations du Directeur
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="director_full_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="director_full_name"
                    name="director_full_name"
                    value={formData.director_full_name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: M. Jean MBARGA"
                  />
                </div>

                <div>
                  <label htmlFor="director_email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      id="director_email"
                      name="director_email"
                      value={formData.director_email}
                      onChange={handleChange}
                      required
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

            {/* Justification */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">
                Justification de la demande *
              </h3>
              <textarea
                id="justification"
                name="justification"
                value={formData.justification}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Expliquez pourquoi vous souhaitez créer cet établissement..."
              />
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
              {loading ? 'Envoi en cours...' : 'Soumettre la demande'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
