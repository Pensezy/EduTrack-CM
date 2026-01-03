import { useState, useEffect } from 'react';
import { Modal } from '@edutrack/ui';
import { X, GraduationCap, School, Users, Hash, BookOpen } from 'lucide-react';
import { getSupabaseClient, useAuth } from '@edutrack/api';

/**
 * Modal pour créer ou éditer une classe
 */
export default function ClassFormModal({ isOpen, onClose, classData, onSuccess }) {
  const { user } = useAuth();
  const isEditing = !!classData;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [schools, setSchools] = useState([]);
  const [selectedSchoolType, setSelectedSchoolType] = useState('');
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [classCount, setClassCount] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    grade_level: '',
    section: '',
    school_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    school_id: '',
    max_students: 40,
  });

  // Charger les écoles pour le select
  useEffect(() => {
    if (isOpen) {
      loadSchools();

      // Pour les directeurs, charger immédiatement les infos de leur école
      if (user?.role === 'principal' && user?.current_school_id && !isEditing) {
        loadSchoolInfo(user.current_school_id);
      }
    }
  }, [isOpen, user, isEditing]);

  const loadSchools = async () => {
    try {
      const supabase = getSupabaseClient();
      let query = supabase
        .from('schools')
        .select('id, name, code, type')
        .eq('status', 'active')
        .order('name');

      // Si directeur, filtrer par son école
      if (user?.role === 'principal' && user?.current_school_id) {
        query = query.eq('id', user.current_school_id);
      }

      const { data, error: schoolsError } = await query;

      if (schoolsError) throw schoolsError;
      setSchools(data || []);

      // Si directeur, pré-sélectionner son école et charger son type
      if (user?.role === 'principal' && user?.current_school_id && !isEditing) {
        setFormData(prev => ({ ...prev, school_id: user.current_school_id }));
        const school = data?.find(s => s.id === user.current_school_id);
        if (school) {
          setSelectedSchoolType(school.type);
        }
      }
    } catch (err) {
      console.error('Error loading schools:', err);
    }
  };

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name || '',
        grade_level: classData.grade_level || '',
        section: classData.section || '',
        school_year: classData.school_year || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
        school_id: classData.school_id || '',
        max_students: classData.max_students || 40,
      });

      // Charger le type d'école en mode édition
      if (classData.school_id && schools.length > 0) {
        const school = schools.find(s => s.id === classData.school_id);
        if (school) {
          setSelectedSchoolType(school.type);
        }
      }
    } else {
      // Reset form pour création
      const currentYear = new Date().getFullYear();
      setFormData({
        name: '',
        grade_level: '',
        section: '',
        school_year: currentYear + '-' + (currentYear + 1),
        school_id: user?.role === 'principal' && user?.current_school_id ? user.current_school_id : '',
        max_students: 40,
      });
    }
    setError('');
  }, [classData, isOpen, user, schools]);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Si changement d'école, mettre à jour le type d'école sélectionné et charger les infos
    if (name === 'school_id') {
      const school = schools.find(s => s.id === value);
      setSelectedSchoolType(school?.type || '');
      // Réinitialiser le niveau si on change d'école
      setFormData(prev => ({ ...prev, grade_level: '' }));

      // Charger les infos de l'école et compter les classes
      if (value) {
        await loadSchoolInfo(value);
      } else {
        setSchoolInfo(null);
        setClassCount(0);
      }
    }
  };

  // Charger les informations de l'école et compter les classes existantes
  const loadSchoolInfo = async (schoolId) => {
    try {
      const supabase = getSupabaseClient();

      // Récupérer les infos de l'école avec ses subscriptions
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select(`
          *,
          school_subscriptions!inner(
            app_id,
            status,
            expires_at
          )
        `)
        .eq('id', schoolId)
        .single();

      if (schoolError) throw schoolError;
      setSchoolInfo(school);

      // Compter les classes existantes
      const { count, error: countError } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId);

      if (countError) throw countError;
      setClassCount(count || 0);
    } catch (err) {
      console.error('Error loading school info:', err);
      // En cas d'erreur, on récupère au moins les infos de base de l'école
      try {
        const supabase = getSupabaseClient();
        const { data: school } = await supabase
          .from('schools')
          .select('*')
          .eq('id', schoolId)
          .single();
        setSchoolInfo(school);
      } catch (innerErr) {
        console.error('Error loading basic school info:', innerErr);
      }
    }
  };

  // Vérifier si l'école a accès à l'App Académique (classes illimitées)
  const hasAcademicApp = () => {
    if (!schoolInfo?.school_subscriptions) return false;

    const academicSub = schoolInfo.school_subscriptions.find(
      sub => sub.app_id === 'academic' &&
             ['trial', 'active'].includes(sub.status) &&
             (!sub.expires_at || new Date(sub.expires_at) > new Date())
    );

    return !!academicSub;
  };

  // Obtenir la limite de classes et le message d'avertissement
  const getClassLimitInfo = () => {
    if (!schoolInfo) return null;

    const hasAcademic = hasAcademicApp();

    if (hasAcademic) {
      return {
        limit: null, // Illimité
        current: classCount,
        canCreate: true,
        message: 'Classes illimitées (App Académique)',
        type: 'success',
        maxStudentsPerClass: null, // Pas de limite
      };
    } else {
      // App Core gratuite: 1 classe maximum, 20 élèves max au total
      const maxClasses = 1;
      const maxStudentsTotal = 20;
      const canCreate = classCount < maxClasses;

      return {
        limit: maxClasses,
        current: classCount,
        canCreate: canCreate,
        message: canCreate
          ? `${classCount}/${maxClasses} classe utilisée (App Core Gratuite)`
          : `Limite atteinte: ${classCount}/${maxClasses} classe (App Core Gratuite)`,
        type: canCreate ? 'warning' : 'error',
        maxStudentsPerClass: maxStudentsTotal, // 20 élèves max au total
        maxStudentsTotal: maxStudentsTotal,
      };
    }
  };

  // Fonction pour obtenir les niveaux disponibles selon le type d'école
  const getAvailableLevels = () => {
    if (!selectedSchoolType) {
      // Si pas d'école sélectionnée, afficher tous les niveaux
      return {
        maternelle: true,
        primaire: true,
        college: true,
        lycee: true,
      };
    }

    // Filtrer selon le type d'école
    const type = selectedSchoolType.toLowerCase();
    return {
      maternelle: type === 'maternelle' || type === 'primaire',
      primaire: type === 'primaire' || type === 'maternelle',
      college: type === 'college' || type === 'college_lycee',
      lycee: type === 'lycee' || type === 'college_lycee',
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = getSupabaseClient();

      // Validation de base
      if (!formData.name.trim()) {
        throw new Error('Le nom de la classe est requis');
      }
      if (!formData.grade_level) {
        throw new Error('Le niveau est requis');
      }
      if (!formData.school_id) {
        throw new Error('L\'école est requise');
      }

      // Vérification des limites pour la création seulement
      if (!isEditing) {
        const limitInfo = getClassLimitInfo();

        if (limitInfo && !limitInfo.canCreate) {
          throw new Error(
            'Vous avez atteint la limite de classes pour le pack gratuit (1 classe maximum). ' +
            'Souscrivez à l\'App Académique pour créer des classes illimitées.'
          );
        }

        // Vérifier la limite d'élèves par classe pour App Core
        if (limitInfo && limitInfo.maxStudentsPerClass && formData.max_students > limitInfo.maxStudentsPerClass) {
          throw new Error(
            `Avec l'App Core gratuite, vous ne pouvez pas créer une classe de plus de ${limitInfo.maxStudentsPerClass} élèves (limite totale de ${limitInfo.maxStudentsTotal} élèves). ` +
            'Souscrivez à l\'App Académique pour débloquer jusqu\'à 500 élèves.'
          );
        }
      }

      if (isEditing) {
        // Mise à jour
        const { error: updateError } = await supabase
          .from('classes')
          .update(formData)
          .eq('id', classData.id);

        if (updateError) throw updateError;
      } else {
        // Création
        const { error: insertError } = await supabase
          .from('classes')
          .insert([formData]);

        if (insertError) throw insertError;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving class:', err);
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
            <GraduationCap className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Modifier la classe' : 'Nouvelle classe'}
            </h2>
            <p className="text-sm text-gray-500">
              {isEditing ? 'Mettre à jour les informations de la classe' : 'Enregistrer une nouvelle classe'}
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
              <GraduationCap className="h-4 w-4" />
              Informations de base
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la classe *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: 6ème A, CM2 B, Terminale S1"
                />
              </div>

              <div>
                <label htmlFor="grade_level" className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau *
                </label>
                <select
                  id="grade_level"
                  name="grade_level"
                  value={formData.grade_level}
                  onChange={handleChange}
                  required
                  disabled={!formData.school_id}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">
                    {formData.school_id ? 'Sélectionner un niveau' : 'Sélectionner d\'abord une école'}
                  </option>

                  {/* Maternelle - Affiché uniquement pour écoles Maternelle/Primaire */}
                  {getAvailableLevels().maternelle && (
                    <optgroup label="Maternelle">
                      <option value="PS">Petite Section (PS)</option>
                      <option value="MS">Moyenne Section (MS)</option>
                      <option value="GS">Grande Section (GS)</option>
                    </optgroup>
                  )}

                  {/* Primaire - Affiché uniquement pour écoles Maternelle/Primaire */}
                  {getAvailableLevels().primaire && (
                    <optgroup label="Primaire">
                      <option value="SIL">SIL</option>
                      <option value="CP">CP</option>
                      <option value="CE1">CE1</option>
                      <option value="CE2">CE2</option>
                      <option value="CM1">CM1</option>
                      <option value="CM2">CM2</option>
                    </optgroup>
                  )}

                  {/* Collège - Affiché uniquement pour écoles Collège/Collège-Lycée */}
                  {getAvailableLevels().college && (
                    <optgroup label="Collège">
                      <option value="6eme">6ème</option>
                      <option value="5eme">5ème</option>
                      <option value="4eme">4ème</option>
                      <option value="3eme">3ème</option>
                    </optgroup>
                  )}

                  {/* Lycée - Affiché uniquement pour écoles Lycée/Collège-Lycée */}
                  {getAvailableLevels().lycee && (
                    <optgroup label="Lycée">
                      <option value="seconde">Seconde</option>
                      <option value="premiere">Première</option>
                      <option value="terminale">Terminale</option>
                    </optgroup>
                  )}
                </select>
                {!formData.school_id && (
                  <p className="mt-1 text-xs text-amber-600">
                    💡 Sélectionnez d'abord une école pour voir les niveaux disponibles
                  </p>
                )}
                {formData.school_id && selectedSchoolType && (
                  <p className="mt-1 text-xs text-blue-600">
                    ℹ️ Niveaux disponibles pour : {selectedSchoolType === 'maternelle' ? 'Maternelle' : selectedSchoolType === 'primaire' ? 'Primaire' : selectedSchoolType === 'college' ? 'Collège' : selectedSchoolType === 'lycee' ? 'Lycée' : 'Collège et Lycée'}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                  Section / Série
                </label>
                <input
                  type="text"
                  id="section"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: A, B, S, L, etc."
                />
              </div>

              <div>
                <label htmlFor="school_year" className="block text-sm font-medium text-gray-700 mb-1">
                  Année scolaire *
                </label>
                <input
                  type="text"
                  id="school_year"
                  name="school_year"
                  value={formData.school_year}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="2024-2025"
                />
              </div>

              <div>
                <label htmlFor="max_students" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre maximum d'élèves
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    id="max_students"
                    name="max_students"
                    value={formData.max_students}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                {!isEditing && formData.school_id && schoolInfo && (() => {
                  const limitInfo = getClassLimitInfo();
                  if (!limitInfo || !limitInfo.maxStudentsPerClass) return null;

                  const exceeds = formData.max_students > limitInfo.maxStudentsPerClass;

                  return (
                    <p className={`mt-1 text-xs ${exceeds ? 'text-red-600' : 'text-amber-600'}`}>
                      {exceeds ? '🚫' : '⚠️'} App Core gratuite: Maximum {limitInfo.maxStudentsPerClass} élèves au total
                    </p>
                  );
                })()}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="school_id" className="block text-sm font-medium text-gray-700 mb-1">
                  École *
                </label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    id="school_id"
                    name="school_id"
                    value={formData.school_id}
                    onChange={handleChange}
                    required
                    disabled={user?.role === 'principal'}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">Sélectionner une école</option>
                    {schools.map(school => (
                      <option key={school.id} value={school.id}>
                        {school.name} ({school.code})
                      </option>
                    ))}
                  </select>
                </div>
                {user?.role === 'principal' && (
                  <p className="mt-1 text-xs text-gray-500">
                    Votre école est automatiquement sélectionnée
                  </p>
                )}

                {/* Affichage des limites de classes */}
                {!isEditing && formData.school_id && schoolInfo && (() => {
                  const limitInfo = getClassLimitInfo();
                  if (!limitInfo) return null;

                  const bgColor = limitInfo.type === 'success'
                    ? 'bg-green-50 border-green-200'
                    : limitInfo.type === 'warning'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-red-50 border-red-200';

                  const textColor = limitInfo.type === 'success'
                    ? 'text-green-700'
                    : limitInfo.type === 'warning'
                    ? 'text-amber-700'
                    : 'text-red-700';

                  const icon = limitInfo.type === 'success'
                    ? '✅'
                    : limitInfo.type === 'warning'
                    ? '⚠️'
                    : '🚫';

                  return (
                    <div className={`mt-2 p-3 rounded-lg border ${bgColor}`}>
                      <p className={`text-xs font-medium ${textColor}`}>
                        {icon} {limitInfo.message}
                      </p>
                      {!limitInfo.canCreate && (
                        <p className="mt-1 text-xs text-red-600">
                          💡 Souscrivez à l'App Académique (75 000 FCFA/an) pour débloquer des classes illimitées.
                        </p>
                      )}
                    </div>
                  );
                })()}
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
            disabled={loading || (!isEditing && formData.school_id && schoolInfo && !getClassLimitInfo()?.canCreate)}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer la classe'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
