import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const PersonalInformationForm = ({ student, isEditing, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: student?.firstName || '',
    lastName: student?.lastName || '',
    dateOfBirth: student?.dateOfBirth || '',
    gender: student?.gender || '',
    address: student?.address || '',
    city: student?.city || '',
    postalCode: student?.postalCode || '',
    phone: student?.phone || '',
    email: student?.email || '',
    emergencyContact: student?.emergencyContact || '',
    emergencyPhone: student?.emergencyPhone || '',
    medicalInfo: student?.medicalInfo || '',
    allergies: student?.allergies || '',
    parentName: student?.parentName || '',
    parentEmail: student?.parentEmail || '',
    parentPhone: student?.parentPhone || ''
  });

  const [isSaving, setIsSaving] = useState(false);

  const genderOptions = [
    { value: 'male', label: 'Masculin' },
    { value: 'female', label: 'Féminin' },
    { value: 'other', label: 'Autre' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save operation
    setTimeout(() => {
      onSave(formData);
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="bg-card rounded-lg shadow-card p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading font-heading-semibold text-xl text-card-foreground flex items-center">
          <Icon name="User" size={20} className="mr-2 text-primary" />
          Informations personnelles
        </h2>
        {isEditing && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              iconName="X"
              iconPosition="left"
            >
              Annuler
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              loading={isSaving}
              iconName="Save"
              iconPosition="left"
            >
              Enregistrer
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground border-b border-border pb-2">
            Informations de base
          </h3>
          
          <Input
            label="Prénom"
            type="text"
            value={formData?.firstName}
            onChange={(e) => handleInputChange('firstName', e?.target?.value)}
            disabled={!isEditing}
            required
          />

          <Input
            label="Nom de famille"
            type="text"
            value={formData?.lastName}
            onChange={(e) => handleInputChange('lastName', e?.target?.value)}
            disabled={!isEditing}
            required
          />

          <Input
            label="Date de naissance"
            type="date"
            value={formData?.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e?.target?.value)}
            disabled={!isEditing}
            required
          />

          <Select
            label="Genre"
            options={genderOptions}
            value={formData?.gender}
            onChange={(value) => handleInputChange('gender', value)}
            disabled={!isEditing}
            placeholder="Sélectionner le genre"
          />
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground border-b border-border pb-2">
            Coordonnées
          </h3>

          <Input
            label="Adresse"
            type="text"
            value={formData?.address}
            onChange={(e) => handleInputChange('address', e?.target?.value)}
            disabled={!isEditing}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ville"
              type="text"
              value={formData?.city}
              onChange={(e) => handleInputChange('city', e?.target?.value)}
              disabled={!isEditing}
            />

            <Input
              label="Code postal"
              type="text"
              value={formData?.postalCode}
              onChange={(e) => handleInputChange('postalCode', e?.target?.value)}
              disabled={!isEditing}
            />
          </div>

          <Input
            label="Téléphone"
            type="tel"
            value={formData?.phone}
            onChange={(e) => handleInputChange('phone', e?.target?.value)}
            disabled={!isEditing}
          />

          <Input
            label="Email"
            type="email"
            value={formData?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            disabled={!isEditing}
          />
        </div>

        {/* Emergency Contact */}
        <div className="space-y-4">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground border-b border-border pb-2">
            Contact d'urgence
          </h3>

          <Input
            label="Nom du contact d'urgence"
            type="text"
            value={formData?.emergencyContact}
            onChange={(e) => handleInputChange('emergencyContact', e?.target?.value)}
            disabled={!isEditing}
          />

          <Input
            label="Téléphone d'urgence"
            type="tel"
            value={formData?.emergencyPhone}
            onChange={(e) => handleInputChange('emergencyPhone', e?.target?.value)}
            disabled={!isEditing}
          />
        </div>

        {/* Parent Information */}
        <div className="space-y-4">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground border-b border-border pb-2">
            Informations des parents
          </h3>

          <Input
            label="Nom du parent/tuteur"
            type="text"
            value={formData?.parentName}
            onChange={(e) => handleInputChange('parentName', e?.target?.value)}
            disabled={!isEditing}
          />

          <Input
            label="Email du parent"
            type="email"
            value={formData?.parentEmail}
            onChange={(e) => handleInputChange('parentEmail', e?.target?.value)}
            disabled={!isEditing}
          />

          <Input
            label="Téléphone du parent"
            type="tel"
            value={formData?.parentPhone}
            onChange={(e) => handleInputChange('parentPhone', e?.target?.value)}
            disabled={!isEditing}
          />
        </div>

        {/* Medical Information */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground border-b border-border pb-2">
            Informations médicales
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-body font-body-semibold text-sm text-card-foreground mb-2">
                Informations médicales
              </label>
              <textarea
                value={formData?.medicalInfo}
                onChange={(e) => handleInputChange('medicalInfo', e?.target?.value)}
                disabled={!isEditing}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Conditions médicales, médicaments, etc."
              />
            </div>

            <div>
              <label className="block font-body font-body-semibold text-sm text-card-foreground mb-2">
                Allergies
              </label>
              <textarea
                value={formData?.allergies}
                onChange={(e) => handleInputChange('allergies', e?.target?.value)}
                disabled={!isEditing}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Allergies alimentaires, médicamenteuses, etc."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInformationForm;