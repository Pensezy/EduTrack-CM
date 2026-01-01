/**
 * @edutrack/ui - SchoolFormModal Component
 *
 * Modal pour créer ou éditer une école
 */

import { useState, useEffect } from 'react';
import { School, MapPin, Phone, Mail, User, Save, X } from 'lucide-react';
import { Modal } from '../Modal/Modal';

export function SchoolFormModal({
  isOpen,
  onClose,
  onSubmit,
  school = null, // Si null = mode création, sinon mode édition
  loading = false,
}) {
  const isEditMode = !!school;

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    director_name: '',
    director_email: '',
    director_phone: '',
    status: 'active',
  });

  const [errors, setErrors] = useState({});

  // Initialiser le formulaire en mode édition
  useEffect(() => {
    if (school) {
      setFormData({
        name: school.name || '',
        address: school.address || '',
        phone: school.phone || '',
        email: school.email || '',
        director_name: school.director_name || '',
        director_email: school.director_email || '',
        director_phone: school.director_phone || '',
        status: school.status || 'active',
      });
    } else {
      // Réinitialiser en mode création
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        director_name: '',
        director_email: '',
        director_phone: '',
        status: 'active',
      });
    }
    setErrors({});
  }, [school, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de l\'école est requis';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'L\'adresse est requise';
    }

    if (!formData.director_name.trim()) {
      newErrors.director_name = 'Le nom du directeur est requis';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (formData.director_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.director_email)) {
      newErrors.director_email = 'Email invalide';
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Numéro de téléphone invalide';
    }

    if (formData.director_phone && !/^\+?[\d\s-()]+$/.test(formData.director_phone)) {
      newErrors.director_phone = 'Numéro de téléphone invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <School className="h-5 w-5 text-primary-600" />
          {isEditMode ? 'Modifier l\'école' : 'Nouvelle école'}
        </div>
      }
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Annuler
            </span>
          </button>
          <button
            type="submit"
            form="school-form"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {loading ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Créer'}
            </span>
          </button>
        </>
      }
    >
      <form id="school-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de l'école */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <School className="h-4 w-4 text-gray-600" />
            Informations de l'école
          </h4>

          {/* Nom */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'école <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: École Primaire de Yaoundé"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Adresse */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Quartier Mvog-Ada, Yaoundé"
              />
            </div>
            {errors.address && (
              <p className="mt-1 text-xs text-red-600">{errors.address}</p>
            )}
          </div>

          {/* Téléphone et Email (sur la même ligne) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+237 6XX XX XX XX"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
              )}
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
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="ecole@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Informations du directeur */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-4 w-4 text-gray-600" />
            Informations du directeur
          </h4>

          {/* Nom du directeur */}
          <div>
            <label htmlFor="director_name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="director_name"
              name="director_name"
              value={formData.director_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.director_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: M. Jean Dupont"
            />
            {errors.director_name && (
              <p className="mt-1 text-xs text-red-600">{errors.director_name}</p>
            )}
          </div>

          {/* Email et Téléphone du directeur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="director_email" className="block text-sm font-medium text-gray-700 mb-1">
                Email du directeur
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  id="director_email"
                  name="director_email"
                  value={formData.director_email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.director_email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="directeur@example.com"
                />
              </div>
              {errors.director_email && (
                <p className="mt-1 text-xs text-red-600">{errors.director_email}</p>
              )}
            </div>

            <div>
              <label htmlFor="director_phone" className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone du directeur
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  id="director_phone"
                  name="director_phone"
                  value={formData.director_phone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.director_phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+237 6XX XX XX XX"
                />
              </div>
              {errors.director_phone && (
                <p className="mt-1 text-xs text-red-600">{errors.director_phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Statut */}
        {isEditMode && (
          <div className="pt-4 border-t border-gray-200">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspendue</option>
            </select>
          </div>
        )}
      </form>
    </Modal>
  );
}
