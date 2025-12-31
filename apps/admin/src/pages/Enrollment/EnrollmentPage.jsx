import { FileText } from 'lucide-react';

export default function EnrollmentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demandes d'inscription</h1>
          <p className="mt-1 text-sm text-gray-500">
            Traiter les demandes d'inscription des élèves
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">En cours de développement</h3>
          <p className="mt-1 text-sm text-gray-500">
            La gestion des demandes d'inscription sera bientôt disponible.
          </p>
        </div>
      </div>
    </div>
  );
}
