import { GraduationCap } from 'lucide-react';

export default function ClassesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des classes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérer toutes les classes de la plateforme
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
          <GraduationCap className="h-5 w-5 mr-2" />
          Créer une classe
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">En cours de développement</h3>
          <p className="mt-1 text-sm text-gray-500">
            La gestion des classes sera bientôt disponible.
          </p>
        </div>
      </div>
    </div>
  );
}
