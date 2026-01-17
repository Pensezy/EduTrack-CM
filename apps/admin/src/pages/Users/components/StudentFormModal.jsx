import { useState, useEffect } from 'react';
import { Modal } from '@edutrack/ui';
import { X, User as UserIcon, Mail, Phone, Users, Calendar, MapPin, BookOpen, Search, UserPlus, Key, Eye, EyeOff, Copy, CheckCircle, AlertCircle, ArrowLeft, RefreshCw, Lock } from 'lucide-react';
import { getSupabaseClient, useAuth } from '@edutrack/api';
import { updateUserPassword } from '../../../services/createUserAccount';
import { useToast } from '../../../components/Toast';

/**
 * Modal spécialisé pour créer un élève
 * Workflow en 2 étapes:
 * 1. Sélectionner un parent existant OU créer un nouveau parent
 * 2. Remplir les informations de l'élève
 */
export default function StudentFormModal({ isOpen, onClose, user, onSuccess }) {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const isEditing = !!user;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [schools, setSchools] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [existingParents, setExistingParents] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [copiedField, setCopiedField] = useState('');

  // États pour la modification de mot de passe
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Workflow state
  const [currentStep, setCurrentStep] = useState(1); // 1 = parent selection, 2 = student info
  const [parentMode, setParentMode] = useState('existing'); // 'existing' or 'new'
  const [selectedParent, setSelectedParent] = useState(null);
  const [parentSearchTerm, setParentSearchTerm] = useState('');

  // Parent form data (for new parent creation)
  const [parentData, setParentData] = useState({
    full_name: '',
    email: '',
    phone: '',
    profession: '',
    address: '',
  });

  // Student form data
  const [studentData, setStudentData] = useState({
    full_name: '',
    date_of_birth: '',
    place_of_birth: '',
    gender: '',
    current_school_id: '',
    class_name: '', // Optionnel - peut être assigné plus tard
    is_active: true,
  });

  // Charger les écoles et parents
  useEffect(() => {
    if (isOpen) {
      loadSchools();
      if (!isEditing) {
        loadExistingParents();
      }
    }
  }, [isOpen]);

  // Charger les classes quand une école est sélectionnée
  useEffect(() => {
    if (studentData.current_school_id) {
      loadSchoolClasses(studentData.current_school_id);
    }
  }, [studentData.current_school_id]);

  const loadSchools = async () => {
    try {
      const supabase = getSupabaseClient();
      let query = supabase
        .from('schools')
        .select('id, name, code, type, available_classes')
        .eq('status', 'active')
        .order('name');

      if (currentUser?.role === 'principal' && currentUser?.current_school_id) {
        query = query.eq('id', currentUser.current_school_id);
      }

      const { data, error: schoolsError } = await query;
      if (schoolsError) throw schoolsError;
      setSchools(data || []);

      // Auto-select school for principals
      if (currentUser?.role === 'principal' && currentUser?.current_school_id) {
        setStudentData(prev => ({ ...prev, current_school_id: currentUser.current_school_id }));
      }
    } catch (err) {
      console.error('Error loading schools:', err);
    }
  };

  const loadSchoolClasses = async (schoolId) => {
    try {
      const supabase = getSupabaseClient();
      const { data: schoolData, error } = await supabase
        .from('schools')
        .select('available_classes, type')
        .eq('id', schoolId)
        .single();

      if (error) throw error;

      const classes = schoolData.available_classes || getDefaultClassesByType(schoolData.type);
      setAvailableClasses(classes);
    } catch (err) {
      console.error('Error loading classes:', err);
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

  const loadExistingParents = async () => {
    try {
      const supabase = getSupabaseClient();
      let query = supabase
        .from('users')
        .select('id, full_name, email, phone, profession, address')
        .eq('role', 'parent')
        .eq('is_active', true)
        .order('full_name');

      // Les directeurs ne voient que les parents de leur école
      if (currentUser?.role === 'principal' && currentUser?.current_school_id) {
        query = query.eq('current_school_id', currentUser.current_school_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setExistingParents(data || []);
    } catch (err) {
      console.error('Error loading parents:', err);
    }
  };

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (user && isOpen) {
      setStudentData({
        full_name: user.full_name || '',
        date_of_birth: user.date_of_birth || '',
        place_of_birth: user.place_of_birth || '',
        gender: user.gender || '',
        current_school_id: user.current_school_id || '',
        class_name: user.class_name || '',
        is_active: user.is_active !== undefined ? user.is_active : true,
      });
      setCurrentStep(2); // Skip parent selection in edit mode
    } else {
      resetForm();
    }
  }, [user, isOpen, currentUser]);

  const resetForm = () => {
    setCurrentStep(1);
    setParentMode('existing');
    setSelectedParent(null);
    setParentSearchTerm('');
    setParentData({
      full_name: '',
      email: '',
      phone: '',
      profession: '',
      address: '',
    });
    const defaultSchoolId = currentUser?.role === 'principal' ? currentUser.current_school_id : '';
    setStudentData({
      full_name: '',
      date_of_birth: '',
      place_of_birth: '',
      gender: '',
      current_school_id: defaultSchoolId,
      class_name: '',
      is_active: true,
    });
    setError('');
    setGeneratedCredentials(null);
    // Réinitialiser les états de mot de passe
    setShowPasswordSection(false);
    setNewPassword('');
    setShowNewPassword(false);
    setPasswordSuccess(false);
  };

  const handleParentDataChange = (e) => {
    const { name, value } = e.target;
    setParentData(prev => ({ ...prev, [name]: value }));
  };

  const handleStudentDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStudentData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const filteredParents = existingParents.filter(parent => {
    if (!parentSearchTerm) return true;
    const searchLower = parentSearchTerm.toLowerCase();
    return (
      parent.full_name?.toLowerCase().includes(searchLower) ||
      parent.email?.toLowerCase().includes(searchLower) ||
      parent.phone?.includes(parentSearchTerm)
    );
  });

  const selectExistingParent = (parent) => {
    setSelectedParent(parent);
  };

  const proceedToStudentForm = () => {
    if (parentMode === 'existing' && !selectedParent) {
      setError('Veuillez sélectionner un parent');
      return;
    }

    if (parentMode === 'new') {
      if (!parentData.full_name.trim()) {
        setError('Le nom du parent est requis');
        return;
      }
      if (!parentData.phone.trim()) {
        setError('Le téléphone du parent est requis');
        return;
      }
    }

    setError('');
    setCurrentStep(2);
  };

  const goBackToParentSelection = () => {
    setCurrentStep(1);
    setError('');
  };

  const generateTechnicalEmail = (phone, role = 'parent') => {
    const cleanPhone = phone.replace(/\s+/g, '').replace(/\+/g, '');
    const prefix = role === 'parent' ? 'parent' : 'eleve';
    return `${prefix}${cleanPhone}@edutrack.cm`;
  };

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&';
    let password = '';
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '@$!%*?&'[Math.floor(Math.random() * 7)];

    for (let i = 4; i < 8; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }

    return password.split('').sort(() => 0.5 - Math.random()).join('');
  };

  const generateMatricule = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(10000 + Math.random() * 90000);
    return `${year}${random}`;
  };

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
   * Met à jour le mot de passe de l'élève
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
      if (!studentData.full_name.trim()) {
        throw new Error('Le nom de l\'élève est requis');
      }
      if (!studentData.current_school_id) {
        throw new Error('L\'école est requise');
      }

      // Vérification sécurité directeur
      if (currentUser?.role === 'principal') {
        if (studentData.current_school_id !== currentUser.current_school_id) {
          throw new Error('Vous ne pouvez créer des élèves que pour votre propre école');
        }
      }

      if (isEditing) {
        // Mode édition - mise à jour uniquement
        const { error: updateError } = await supabase
          .from('users')
          .update({
            full_name: studentData.full_name.trim(),
            date_of_birth: studentData.date_of_birth || null,
            place_of_birth: studentData.place_of_birth?.trim() || null,
            gender: studentData.gender || null,
            current_school_id: studentData.current_school_id,
            class_name: studentData.class_name || null,
            is_active: studentData.is_active,
          })
          .eq('id', user.id);

        if (updateError) throw updateError;

        onSuccess();
        onClose();
      } else {
        // Mode création
        let parentId = selectedParent?.id;

        // Si nouveau parent, créer d'abord le parent
        if (parentMode === 'new') {
          const parentEmail = parentData.email.trim() || generateTechnicalEmail(parentData.phone, 'parent');
          const parentPassword = generateSecurePassword();

          // Créer le compte Auth du parent
          const { data: parentAuthData, error: parentAuthError } = await supabase.auth.admin.createUser({
            email: parentEmail,
            password: parentPassword,
            email_confirm: true,
            user_metadata: {
              full_name: parentData.full_name,
              role: 'parent',
              school_id: studentData.current_school_id,
            }
          });

          if (parentAuthError) {
            if (parentAuthError.message.includes('already registered')) {
              throw new Error(`Cet email ou téléphone est déjà utilisé: ${parentEmail}`);
            }
            throw parentAuthError;
          }

          // Créer l'entrée dans users
          const { data: newParentData, error: parentInsertError } = await supabase
            .from('users')
            .insert([{
              id: parentAuthData.user.id,
              full_name: parentData.full_name.trim(),
              email: parentEmail,
              phone: parentData.phone.trim(),
              role: 'parent',
              current_school_id: studentData.current_school_id,
              profession: parentData.profession?.trim() || null,
              address: parentData.address?.trim() || null,
              is_active: true,
            }])
            .select()
            .single();

          if (parentInsertError) {
            await supabase.auth.admin.deleteUser(parentAuthData.user.id);
            throw parentInsertError;
          }

          parentId = newParentData.id;
        }

        if (!parentId) {
          throw new Error('Erreur: Aucun parent sélectionné ou créé');
        }

        // Créer le compte de l'élève
        const studentEmail = generateTechnicalEmail(new Date().getTime().toString(), 'student');
        const studentPassword = generateSecurePassword();
        const matricule = generateMatricule();

        // Créer le compte Auth de l'élève
        const { data: studentAuthData, error: studentAuthError } = await supabase.auth.admin.createUser({
          email: studentEmail,
          password: studentPassword,
          email_confirm: true,
          user_metadata: {
            full_name: studentData.full_name,
            role: 'student',
            school_id: studentData.current_school_id,
            matricule: matricule,
          }
        });

        if (studentAuthError) throw studentAuthError;

        // Créer l'entrée dans users
        const { data: newStudentData, error: studentInsertError } = await supabase
          .from('users')
          .insert([{
            id: studentAuthData.user.id,
            full_name: studentData.full_name.trim(),
            email: studentEmail,
            phone: null, // Les élèves n'ont généralement pas de téléphone
            role: 'student',
            current_school_id: studentData.current_school_id,
            class_name: studentData.class_name || null,
            date_of_birth: studentData.date_of_birth || null,
            place_of_birth: studentData.place_of_birth?.trim() || null,
            gender: studentData.gender || null,
            matricule: matricule,
            parent_id: parentId, // Lien vers le parent
            is_active: true,
          }])
          .select()
          .single();

        if (studentInsertError) {
          await supabase.auth.admin.deleteUser(studentAuthData.user.id);
          throw studentInsertError;
        }

        // Afficher les identifiants générés
        setGeneratedCredentials({
          student: {
            fullName: studentData.full_name,
            email: studentEmail,
            password: studentPassword,
            matricule: matricule,
            className: studentData.class_name || 'Non assigné',
          },
          parent: selectedParent ? {
            fullName: selectedParent.full_name,
            email: selectedParent.email,
            phone: selectedParent.phone,
            isExisting: true,
          } : null,
        });

        onSuccess();
      }
    } catch (err) {
      console.error('Error saving student:', err);
      setError(err.message || 'Erreur lors de l\'enregistrement');
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
                Élève inscrit avec succès !
              </h2>
              <p className="text-sm text-gray-500">
                Veuillez noter ces identifiants
              </p>
            </div>
          </div>
          <button onClick={() => { onClose(); resetForm(); }} className="text-gray-400 hover:text-gray-500 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {/* Informations de l'élève */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-indigo-900 mb-3 flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Informations de l'élève
            </h3>
            <div className="space-y-2 text-sm text-indigo-800">
              <p><strong>Nom :</strong> {generatedCredentials.student.fullName}</p>
              <p><strong>Matricule :</strong> {generatedCredentials.student.matricule}</p>
              <p><strong>Classe :</strong> {generatedCredentials.student.className}</p>
            </div>
          </div>

          {/* Identifiants de connexion élève */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
              <Key className="h-5 w-5" />
              Identifiants de connexion de l'élève
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de connexion (généré automatiquement)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generatedCredentials.student.email}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(generatedCredentials.student.email, 'student-email')}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {copiedField === 'student-email' ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={generatedCredentials.student.password}
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
                    onClick={() => copyToClipboard(generatedCredentials.student.password, 'student-password')}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {copiedField === 'student-password' ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Informations du parent */}
          {generatedCredentials.parent && (
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-pink-900 mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Parent/Tuteur lié
              </h3>
              <div className="space-y-2 text-sm text-pink-800">
                <p><strong>Nom :</strong> {generatedCredentials.parent.fullName}</p>
                <p><strong>Email :</strong> {generatedCredentials.parent.email}</p>
                <p><strong>Téléphone :</strong> {generatedCredentials.parent.phone}</p>
                {generatedCredentials.parent.isExisting && (
                  <p className="text-xs text-pink-600 mt-2">
                    ✓ Parent existant - pas besoin de créer un nouveau compte
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-900 mb-2">📱 Instructions pour l'élève</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
              <li>Allez sur le site : <strong>www.edutrack.cm</strong></li>
              <li>Cliquez sur "Connexion"</li>
              <li>Entrez l'email : <strong>{generatedCredentials.student.email}</strong></li>
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
                  <li>Communiquez-les de manière sécurisée au parent et à l'élève</li>
                  <li>Le parent peut gérer le mot de passe de son enfant depuis son dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => { onClose(); resetForm(); }}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            J'ai noté les identifiants
          </button>
        </div>
      </Modal>
    );
  }

  // Step 1: Parent Selection
  if (currentStep === 1 && !isEditing) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Nouvel élève - Étape 1/2
              </h2>
              <p className="text-sm text-gray-500">
                Sélectionner ou créer le parent/tuteur
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Mode selection */}
          <div className="flex gap-4">
            <button
              onClick={() => setParentMode('existing')}
              className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                parentMode === 'existing'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-300 bg-white hover:border-indigo-300'
              }`}
            >
              <Search className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
              <p className="text-sm font-medium text-gray-900">Parent existant</p>
              <p className="text-xs text-gray-500 mt-1">Lier à un parent déjà inscrit</p>
            </button>

            <button
              onClick={() => setParentMode('new')}
              className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                parentMode === 'new'
                  ? 'border-pink-600 bg-pink-50'
                  : 'border-gray-300 bg-white hover:border-pink-300'
              }`}
            >
              <UserPlus className="h-6 w-6 mx-auto mb-2 text-pink-600" />
              <p className="text-sm font-medium text-gray-900">Nouveau parent</p>
              <p className="text-xs text-gray-500 mt-1">Créer un nouveau compte parent</p>
            </button>
          </div>

          {/* Parent existant - Search and select */}
          {parentMode === 'existing' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher un parent
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={parentSearchTerm}
                    onChange={(e) => setParentSearchTerm(e.target.value)}
                    placeholder="Nom, email ou téléphone..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredParents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Aucun parent trouvé</p>
                  </div>
                ) : (
                  filteredParents.map(parent => (
                    <button
                      key={parent.id}
                      onClick={() => selectExistingParent(parent)}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                        selectedParent?.id === parent.id
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 bg-white hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{parent.full_name}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" />
                            {parent.phone}
                          </p>
                          {parent.email && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {parent.email}
                            </p>
                          )}
                          {parent.profession && (
                            <p className="text-xs text-gray-500 mt-1">{parent.profession}</p>
                          )}
                        </div>
                        {selectedParent?.id === parent.id && (
                          <CheckCircle className="h-5 w-5 text-indigo-600" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Nouveau parent - Form */}
          {parentMode === 'new' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Informations du nouveau parent</h3>

              <div>
                <label htmlFor="parent_full_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  id="parent_full_name"
                  name="full_name"
                  value={parentData.full_name}
                  onChange={handleParentDataChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Ex: Marie NGONO"
                />
              </div>

              <div>
                <label htmlFor="parent_phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone * (obligatoire)
                </label>
                <input
                  type="tel"
                  id="parent_phone"
                  name="phone"
                  value={parentData.phone}
                  onChange={handleParentDataChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="+237 6XX XX XX XX"
                />
              </div>

              <div>
                <label htmlFor="parent_email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  id="parent_email"
                  name="email"
                  value={parentData.email}
                  onChange={handleParentDataChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="parent@example.com"
                />
                <p className="mt-1 text-xs text-blue-600">
                  💡 Si vide, un email technique sera généré automatiquement
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="parent_profession" className="block text-sm font-medium text-gray-700 mb-1">
                    Profession (optionnel)
                  </label>
                  <input
                    type="text"
                    id="parent_profession"
                    name="profession"
                    value={parentData.profession}
                    onChange={handleParentDataChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Ex: Commerçant"
                  />
                </div>

                <div>
                  <label htmlFor="parent_address" className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse (optionnel)
                  </label>
                  <input
                    type="text"
                    id="parent_address"
                    name="address"
                    value={parentData.address}
                    onChange={handleParentDataChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Ex: Bonanjo, Douala"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            onClick={proceedToStudentForm}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Continuer vers l'élève →
          </button>
        </div>
      </Modal>
    );
  }

  // Step 2: Student Form
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100">
            <UserIcon className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Modifier l\'élève' : 'Nouvel élève - Étape 2/2'}
            </h2>
            <p className="text-sm text-gray-500">
              {isEditing ? 'Mettre à jour les informations de l\'élève' : 'Informations de l\'élève'}
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

          {/* Parent sélectionné (affichage) */}
          {!isEditing && selectedParent && (
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-pink-900 mb-2">Parent/Tuteur sélectionné</h3>
              <p className="text-sm text-pink-800"><strong>{selectedParent.full_name}</strong> - {selectedParent.phone}</p>
            </div>
          )}

          {/* Informations de l'élève */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Informations de l'élève
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
                  value={studentData.full_name}
                  onChange={handleStudentDataChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ex: Jean KAMGA"
                />
              </div>

              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                  Date de naissance
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={studentData.date_of_birth}
                    onChange={handleStudentDataChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="place_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                  Lieu de naissance
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="place_of_birth"
                    name="place_of_birth"
                    value={studentData.place_of_birth}
                    onChange={handleStudentDataChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ex: Douala"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Genre
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={studentData.gender}
                  onChange={handleStudentDataChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Sélectionner</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
            </div>
          </div>

          {/* École et classe */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Scolarité
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="current_school_id" className="block text-sm font-medium text-gray-700 mb-1">
                  École *
                </label>
                <select
                  id="current_school_id"
                  name="current_school_id"
                  value={studentData.current_school_id}
                  onChange={handleStudentDataChange}
                  required
                  disabled={currentUser?.role === 'principal'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                >
                  <option value="">Sélectionner une école</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>
                      {school.name} ({school.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="class_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Classe (optionnel)
                </label>
                <select
                  id="class_name"
                  name="class_name"
                  value={studentData.class_name}
                  onChange={handleStudentDataChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Non assigné</option>
                  {availableClasses.map(className => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Peut être assigné plus tard
                </p>
              </div>
            </div>
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
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10"
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
                          Minimum 8 caractères. Le mot de passe sera communiqué au parent.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleUpdatePassword}
                          disabled={passwordLoading || !newPassword || newPassword.length < 8}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                checked={studentData.is_active}
                onChange={handleStudentDataChange}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">Compte actif</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <div>
            {!isEditing && (
              <button
                type="button"
                onClick={goBackToParentSelection}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Inscrire l\'élève'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
