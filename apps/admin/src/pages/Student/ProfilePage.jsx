/**
 * Page Mon Profil - Élève
 *
 * Affiche les informations personnelles de l'élève
 */

import { useState, useEffect } from 'react';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import {
  User,
  GraduationCap,
  School,
  Calendar,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  Edit
} from 'lucide-react';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchStudentInfo();
    }
  }, [user?.id]);

  const fetchStudentInfo = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = getSupabaseClient();

      // Récupérer les infos complètes de l'élève
      const { data, error: fetchError } = await supabase
        .from('students')
        .select(`
          id,
          full_name,
          matricule,
          date_of_birth,
          gender,
          address,
          status,
          created_at,
          class_id,
          school_id,
          parent_id,
          classes:class_id (name, level),
          schools:school_id (name, address, phone, email),
          parent:parent_id (full_name, phone, email, address)
        `)
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // Si pas de données student, utiliser les infos du user
      if (data) {
        setStudentInfo(data);
      } else {
        // Créer un profil basique à partir des infos user
        setStudentInfo({
          full_name: user.full_name,
          matricule: null,
          date_of_birth: null,
          gender: null,
          classes: { name: 'Non assigné', level: '' },
          schools: { name: 'Mon École' },
          parent: null,
        });
      }
    } catch (err) {
      console.error('Error fetching student info:', err);
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const age = calculateAge(studentInfo?.date_of_birth);

  return (
    <div className="space-y-6">
      {/* Header avec photo */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className={`h-24 w-24 rounded-full flex items-center justify-center text-4xl font-bold ${
            studentInfo?.gender === 'M' ? 'bg-blue-400' : studentInfo?.gender === 'F' ? 'bg-pink-400' : 'bg-white/20'
          }`}>
            {studentInfo?.full_name?.charAt(0) || 'E'}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">{studentInfo?.full_name || 'Mon Profil'}</h1>
            <p className="text-indigo-100 mt-1">
              {studentInfo?.classes?.name} • {studentInfo?.schools?.name}
            </p>
            {studentInfo?.matricule && (
              <p className="text-indigo-200 text-sm mt-1 font-mono">
                Matricule: {studentInfo.matricule}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5 text-gray-400" />
            Informations personnelles
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Nom complet</p>
              <p className="font-medium text-gray-900">{studentInfo?.full_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Matricule</p>
              <p className="font-medium text-gray-900 font-mono">{studentInfo?.matricule || 'Non attribué'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date de naissance</p>
              <p className="font-medium text-gray-900">
                {studentInfo?.date_of_birth
                  ? new Date(studentInfo.date_of_birth).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Âge</p>
              <p className="font-medium text-gray-900">
                {age ? `${age} ans` : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Genre</p>
              <p className="font-medium text-gray-900">
                {studentInfo?.gender === 'M' ? 'Masculin' : studentInfo?.gender === 'F' ? 'Féminin' : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Statut</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                studentInfo?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {studentInfo?.status === 'active' ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Informations scolaires */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-gray-400" />
            Informations scolaires
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Classe</p>
              <p className="font-medium text-gray-900">{studentInfo?.classes?.name || 'Non assigné'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Niveau</p>
              <p className="font-medium text-gray-900">{studentInfo?.classes?.level || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Établissement</p>
              <p className="font-medium text-gray-900">{studentInfo?.schools?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date d'inscription</p>
              <p className="font-medium text-gray-900">
                {studentInfo?.created_at
                  ? new Date(studentInfo.created_at).toLocaleDateString('fr-FR')
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Informations de l'école */}
      {studentInfo?.schools && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <School className="h-5 w-5 text-gray-400" />
              Mon établissement
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="font-medium text-gray-900">{studentInfo.schools.name}</p>
              </div>
              {studentInfo.schools.phone && (
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {studentInfo.schools.phone}
                  </p>
                </div>
              )}
              {studentInfo.schools.email && (
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {studentInfo.schools.email}
                  </p>
                </div>
              )}
              {studentInfo.schools.address && (
                <div>
                  <p className="text-sm text-gray-500">Adresse</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {studentInfo.schools.address}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Informations du parent */}
      {studentInfo?.parent && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400" />
              Parent / Tuteur
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="font-medium text-gray-900">{studentInfo.parent.full_name}</p>
              </div>
              {studentInfo.parent.phone && (
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {studentInfo.parent.phone}
                  </p>
                </div>
              )}
              {studentInfo.parent.email && (
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {studentInfo.parent.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
