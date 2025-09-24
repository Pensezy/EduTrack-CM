import React, { useState, useEffect } from 'react';
import { documentService } from '../../../services/documentService';

const DocumentFilters = ({ filters, onFiltersChange, userRole }) => {
  const [availableOptions, setAvailableOptions] = useState({
    classes: [],
    subjects: []
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadAvailableOptions();
  }, []);

  const loadAvailableOptions = async () => {
    try {
      const result = await documentService?.getClassesAndSubjects();
      if (result?.data) {
        setAvailableOptions(result?.data);
      }
    } catch (error) {
      console.error('Erreur chargement options:', error);
    }
  };

  const documentTypes = [
    { value: '', label: 'Tous les types' },
    { value: 'assignment', label: 'Devoirs' },
    { value: 'lesson', label: 'Cours' },
    { value: 'exam', label: 'Examens' },
    { value: 'resource', label: 'Ressources' },
    { value: 'announcement', label: 'Annonces' },
    { value: 'other', label: 'Autres' }
  ];

  const handleFilterChange = (name, value) => {
    const newFilters = {
      ...filters,
      [name]: value
    };
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      class_name: '',
      subject: '',
      document_type: '',
      search: ''
    };
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters)?.some(value => value !== '');

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          🔍 Filtres et Recherche
        </h3>
        
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Effacer les filtres
            </button>
          )}
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium md:hidden"
          >
            {showFilters ? 'Masquer' : 'Afficher'} les filtres
          </button>
        </div>
      </div>
      {/* Search Bar - Always visible */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Rechercher par titre, description, classe ou matière..."
            value={filters?.search}
            onChange={(e) => handleFilterChange('search', e?.target?.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {filters?.search && (
            <button
              onClick={() => handleFilterChange('search', '')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <span className="text-gray-400 hover:text-gray-600">❌</span>
            </button>
          )}
        </div>
      </div>
      {/* Filter Options - Collapsible on mobile */}
      <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden md:grid'}`}>
        {/* Class Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Classe
          </label>
          <select
            value={filters?.class_name}
            onChange={(e) => handleFilterChange('class_name', e?.target?.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Toutes les classes</option>
            {availableOptions?.classes?.map(className => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Matière
          </label>
          <select
            value={filters?.subject}
            onChange={(e) => handleFilterChange('subject', e?.target?.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Toutes les matières</option>
            {availableOptions?.subjects?.map(subject => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {/* Document Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de document
          </label>
          <select
            value={filters?.document_type}
            onChange={(e) => handleFilterChange('document_type', e?.target?.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {documentTypes?.map(type => (
              <option key={type?.value} value={type?.value}>
                {type?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Actions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Actions rapides
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilterChange('document_type', 'assignment')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filters?.document_type === 'assignment' ?'bg-blue-600 text-white' :'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 Devoirs
            </button>
            <button
              onClick={() => handleFilterChange('document_type', 'lesson')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filters?.document_type === 'lesson' ?'bg-blue-600 text-white' :'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📚 Cours
            </button>
          </div>
        </div>
      </div>
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Filtres actifs:</span>
            
            {filters?.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                🔍 "{filters?.search}"
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ❌
                </button>
              </span>
            )}

            {filters?.class_name && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                🏫 {filters?.class_name}
                <button
                  onClick={() => handleFilterChange('class_name', '')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ❌
                </button>
              </span>
            )}

            {filters?.subject && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                📖 {filters?.subject}
                <button
                  onClick={() => handleFilterChange('subject', '')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ❌
                </button>
              </span>
            )}

            {filters?.document_type && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                📄 {documentTypes?.find(t => t?.value === filters?.document_type)?.label}
                <button
                  onClick={() => handleFilterChange('document_type', '')}
                  className="ml-1 text-yellow-600 hover:text-yellow-800"
                >
                  ❌
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentFilters;