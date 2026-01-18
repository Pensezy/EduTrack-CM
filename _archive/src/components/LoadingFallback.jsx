import React from 'react';

/**
 * Composant de chargement pour Suspense fallback
 * Affiche un spinner avec message pendant le lazy loading des pages
 */
const LoadingFallback = ({ message = "Chargement..." }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center px-4">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

        {/* Message */}
        <p className="text-gray-700 font-medium text-base sm:text-lg">
          {message}
        </p>

        {/* Message secondaire */}
        <p className="text-gray-500 text-sm mt-2">
          Veuillez patienter un instant...
        </p>
      </div>
    </div>
  );
};

export default LoadingFallback;
