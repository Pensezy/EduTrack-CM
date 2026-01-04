import { useState, useEffect } from 'react';
import { Modal } from '@edutrack/ui';
import { X, User as UserIcon, Mail, Phone, BookOpen, GraduationCap, Plus } from 'lucide-react';
import { getSupabaseClient, useAuth } from '@edutrack/api';

/**
 * Modal spécialisé pour créer ou éditer un enseignant
 */
export default function TeacherFormModal({ isOpen, onClose, user, onSuccess }) {
  const { user: currentUser } = useAuth();
  const isEditing = !!user;
  const [loading, setLoading] = useState(false);
  const [loadingSchoolDetails, setLoadingSchoolDetails] = useState(false);
  const [error, setError] = useState('');
  const [schools, setSchools] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [customSubject, setCustomSubject] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    current_school_id: '',
    subjects: [],
    classes: [],
    is_active: true,
  });

  // Charger les écoles au montage
  useEffect(() => {
    if (isOpen) {
      loadSchools();
    }
  }, [isOpen]);

  // Charger les matières et classes quand une école est sélectionnée
  useEffect(() => {
    if (formData.current_school_id && isOpen) {
      loadSchoolDetails(formData.current_school_id);
    }
  }, [formData.current_school_id, isOpen]);

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

  const loadSchoolDetails = async (schoolId) => {
    try {
      setLoadingSchoolDetails(true);
      const supabase = getSupabaseClient();
      const { data: schoolData, error } = await supabase
        .from('schools')
        .select('available_classes, custom_subjects, type')
        .eq('id', schoolId)
        .single();

      if (error) throw error;

      // Charger les classes RÉELLEMENT CRÉÉES depuis la table classes
      const { data: realClasses, error: classesError } = await supabase
        .from('classes')
        .select('id, name, level, section')
        .eq('school_id', schoolId)
        .order('level');

      if (classesError) throw classesError;

      // Utiliser les noms des classes réelles, ou les classes par défaut si aucune classe créée
      const classNames = realClasses && realClasses.length > 0
        ? realClasses.map(c => c.section ? `${c.level} ${c.section}` : c.level)
        : (schoolData.available_classes || getDefaultClassesByType(schoolData.type));

      setAvailableClasses(classNames);

      // Charger les matières - TOUJOURS utiliser la liste complète par défaut
      // car custom_subjects dans schools est souvent vide
      const allSubjects = [
        'Français', 'Mathématiques', 'Physique-Chimie', 'SVT', 'Sciences',
        'Histoire-Géographie', 'Philosophie', 'Anglais', 'Espagnol', 'Allemand',
        'EPS', 'Arts Plastiques', 'Musique', 'Informatique', 'Technologie',
        'Économie', 'Comptabilité', 'Éducation Civique et Morale', 'Arabe',
        'Instruction Civique', 'Éducation à la Santé'
      ];

      // Fusionner les matières personnalisées avec les matières par défaut
      const customSubjects = schoolData.custom_subjects || [];
      const mergedSubjects = [...new Set([...allSubjects, ...customSubjects])].sort();

      setAvailableSubjects(mergedSubjects);
    } catch (err) {
      console.error('Error loading school details:', err);
      // En cas d'erreur, utiliser les valeurs par défaut
      setAvailableSubjects([
        'Français', 'Mathématiques', 'Physique-Chimie', 'SVT', 'Sciences',
        'Histoire-Géographie', 'Philosophie', 'Anglais', 'Espagnol', 'Allemand',
        'EPS', 'Arts Plastiques', 'Musique', 'Informatique', 'Technologie',
        'Économie', 'Comptabilité', 'Éducation Civique et Morale', 'Arabe',
        'Instruction Civique', 'Éducation à la Santé'
      ]);
      setAvailableClasses([]);
    } finally {
      setLoadingSchoolDetails(false);
    }
  };

  const getDefaultClassesByType = (type) => {
    const defaults = {
      maternelle: ['PS', 'MS', 'GS'],
      primaire: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
      college: ['6ème', '5ème', '4ème', '3ème'],
      lycee: ['2nde', '1ère', 'Tle'],
      college_lycee: ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Tle']
    };
    return defaults[type] || [];
  };

  const getDefaultSubjects = () => {
    return [
      'Français', 'Mathématiques', 'Sciences', 'Histoire-Géographie',
      'Anglais', 'EPS', 'Arts', 'Musique', 'Informatique'
    ];
  };

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        current_school_id: user.current_school_id || '',
        subjects: user.subjects || [],
        classes: user.classes || [],
        is_active: user.is_active !== undefined ? user.is_active : true,
      });
    } else {
      // Mode création - pré-remplir l'école pour les directeurs
      const defaultSchoolId = currentUser?.role === 'principal' ? currentUser.current_school_id : '';
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        current_school_id: defaultSchoolId,
        subjects: [],
        classes: [],
        is_active: true,
      });
    }
    setError('');
  }, [user, isOpen, currentUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMultiSelect = (name, value) => {
    setFormData(prev => {
      const currentValues = prev[name] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [name]: newValues };
    });
  };

  const handleAddCustomSubject = () => {
    const trimmedSubject = customSubject.trim();
    if (trimmedSubject && !availableSubjects.includes(trimmedSubject)) {
      // Ajouter la matière à la liste
      setAvailableSubjects(prev => [...prev, trimmedSubject].sort());
      // Sélectionner automatiquement la matière ajoutée
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, trimmedSubject]
      }));
      // Réinitialiser le champ
      setCustomSubject('');
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
      if (!formData.email.trim()) {
        throw new Error('L\'email est requis');
      }
      if (!formData.current_school_id) {
        throw new Error('L\'école est requise');
      }
      if (formData.subjects.length === 0) {
        throw new Error('Veuillez sélectionner au moins une matière');
      }
      // Les classes sont optionnelles - pas de validation obligatoire

      // Vérification sécurité directeur
      if (currentUser?.role === 'principal') {
        if (formData.current_school_id !== currentUser.current_school_id) {
          throw new Error('Vous ne pouvez créer des enseignants que pour votre propre école');
        }
      }

      // Vérifier l'unicité de l'email
      const { data: existingEmail, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', formData.email.trim())
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingEmail && (!isEditing || existingEmail.id !== user.id)) {
        throw new Error(`Cet email (${formData.email}) est déjà utilisé par un autre compte`);
      }

      const userData = {
        ...formData,
        role: 'teacher'
      };

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('users')
          .update(userData)
          .eq('id', user.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('users')
          .insert([userData]);

        if (insertError) {
          if (insertError.code === '23505' && insertError.message.includes('email')) {
            throw new Error(`Cet email (${formData.email}) est déjà utilisé dans le système`);
          }
          throw insertError;
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving teacher:', err);
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
            <GraduationCap className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Modifier l\'enseignant' : 'Nouvel enseignant'}
            </h2>
            <p className="text-sm text-gray-500">
              {isEditing ? 'Mettre à jour les informations de l\'enseignant' : 'Enregistrer un nouvel enseignant'}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ex: Marie NGUEMA"
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
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="enseignant@ecole.cm"
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
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="+237 6XX XX XX XX"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
            >
              <option value="">Sélectionner une école</option>
              {schools.map(school => (
                <option key={school.id} value={school.id}>
                  {school.name} ({school.code})
                </option>
              ))}
            </select>
          </div>

          {/* Matières enseignées */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Matières enseignées *
            </h3>

            {/* Champ pour ajouter une matière personnalisée */}
            {!loadingSchoolDetails && availableSubjects.length > 0 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSubject();
                    }
                  }}
                  placeholder="Ajouter une matière personnalisée..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSubject}
                  disabled={!customSubject.trim()}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Ajouter</span>
                </button>
              </div>
            )}

            {loadingSchoolDetails ? (
              <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mr-2"></div>
                Chargement des matières...
              </div>
            ) : availableSubjects.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableSubjects.map(subject => (
                  <label
                    key={subject}
                    className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(subject)}
                      onChange={() => handleMultiSelect('subjects', subject)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{subject}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                Veuillez d'abord sélectionner une école pour afficher les matières disponibles.
              </div>
            )}
          </div>

          {/* Classes assignées */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Classes assignées (optionnel)</h3>
            {loadingSchoolDetails ? (
              <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mr-2"></div>
                Chargement des classes...
              </div>
            ) : availableClasses.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {availableClasses.map(className => (
                  <label
                    key={className}
                    className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.classes.includes(className)}
                      onChange={() => handleMultiSelect('classes', className)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{className}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                Aucune classe disponible pour cette école.
              </div>
            )}
          </div>

          {/* Statut */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
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
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer l\'enseignant'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
