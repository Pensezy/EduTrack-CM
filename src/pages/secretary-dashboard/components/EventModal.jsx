import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, FileText, AlertTriangle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import planningService from '../../../services/planningService';

export const EventModal = ({ isOpen, onClose, event = null, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [availabilityCheck, setAvailabilityCheck] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'parent_meeting',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    priority: 'medium',
    attendees: [''],
    studentName: '',
    studentClass: '',
    parentPhone: '',
    parentEmail: '',
    notes: '',
    reminders: [
      { type: 'email', time: '1 day before', enabled: true },
      { type: 'sms', time: '2 hours before', enabled: false }
    ]
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        type: event.type || 'parent_meeting',
        date: event.date || '',
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        location: event.location || '',
        description: event.description || '',
        priority: event.priority || 'medium',
        attendees: event.attendees || [''],
        studentName: event.studentName || '',
        studentClass: event.studentClass || '',
        parentPhone: event.parentPhone || '',
        parentEmail: event.parentEmail || '',
        notes: event.notes || '',
        reminders: event.reminders || [
          { type: 'email', time: '1 day before', enabled: true },
          { type: 'sms', time: '2 hours before', enabled: false }
        ]
      });
    } else {
      // Reset form for new event
      setFormData({
        title: '',
        type: 'parent_meeting',
        date: '',
        startTime: '',
        endTime: '',
        location: 'Bureau secrétariat',
        description: '',
        priority: 'medium',
        attendees: [''],
        studentName: '',
        studentClass: '',
        parentPhone: '',
        parentEmail: '',
        notes: '',
        reminders: [
          { type: 'email', time: '1 day before', enabled: true },
          { type: 'sms', time: '2 hours before', enabled: false }
        ]
      });
    }
    setErrors({});
    setAvailabilityCheck(null);
  }, [event, isOpen]);

  const eventTypes = [
    { value: 'parent_meeting', label: 'Rendez-vous parents' },
    { value: 'meeting', label: 'Réunion pédagogique' },
    { value: 'school_event', label: 'Événement scolaire' },
    { value: 'training', label: 'Formation' },
    { value: 'official_meeting', label: 'Conseil officiel' },
    { value: 'inscription', label: 'Inscription' },
    { value: 'interview', label: 'Entretien' },
    { value: 'holiday', label: 'Vacances scolaires' }
  ];

  const priorities = [
    { value: 'low', label: 'Faible' },
    { value: 'medium', label: 'Normal' },
    { value: 'high', label: 'Urgent' }
  ];

  const classes = [
    { value: '', label: 'Sélectionner une classe' },
    { value: 'CE1', label: 'CE1' },
    { value: 'CE2', label: 'CE2' },
    { value: 'CM1', label: 'CM1' },
    { value: 'CM2', label: 'CM2' }
  ];

  const commonLocations = [
    { value: 'Bureau secrétariat', label: 'Bureau secrétariat' },
    { value: 'Bureau direction', label: 'Bureau direction' },
    { value: 'Salle des professeurs', label: 'Salle des professeurs' },
    { value: 'Salle polyvalente', label: 'Salle polyvalente' },
    { value: 'Salle de classe', label: 'Salle de classe' },
    { value: 'Cour de récréation', label: 'Cour de récréation' },
    { value: 'Extérieur', label: 'Sortie/Extérieur' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleAttendeesChange = (index, value) => {
    const newAttendees = [...formData.attendees];
    newAttendees[index] = value;
    setFormData(prev => ({
      ...prev,
      attendees: newAttendees
    }));
  };

  const addAttendee = () => {
    setFormData(prev => ({
      ...prev,
      attendees: [...prev.attendees, '']
    }));
  };

  const removeAttendee = (index) => {
    if (formData.attendees.length > 1) {
      const newAttendees = formData.attendees.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        attendees: newAttendees
      }));
    }
  };

  const handleReminderToggle = (index, enabled) => {
    const newReminders = [...formData.reminders];
    newReminders[index].enabled = enabled;
    setFormData(prev => ({
      ...prev,
      reminders: newReminders
    }));
  };

  const checkAvailability = async () => {
    if (!formData.date || !formData.startTime || !formData.endTime) return;

    try {
      const result = await planningService.checkAvailability(
        formData.date,
        formData.startTime,
        formData.endTime,
        event?.id
      );
      setAvailabilityCheck(result);
    } catch (error) {
      console.error('Erreur vérification disponibilité:', error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkAvailability();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.date, formData.startTime, formData.endTime]);

  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return 0;
    
    const start = new Date(`2000-01-01 ${formData.startTime}`);
    const end = new Date(`2000-01-01 ${formData.endTime}`);
    return Math.round((end - start) / (1000 * 60));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.date) newErrors.date = 'La date est requise';
    if (!formData.startTime) newErrors.startTime = 'L\'heure de début est requise';
    if (!formData.endTime) newErrors.endTime = 'L\'heure de fin est requise';
    if (!formData.location.trim()) newErrors.location = 'Le lieu est requis';

    // Vérifier que l'heure de fin est après l'heure de début
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01 ${formData.startTime}`);
      const end = new Date(`2000-01-01 ${formData.endTime}`);
      if (end <= start) {
        newErrors.endTime = 'L\'heure de fin doit être après l\'heure de début';
      }
    }

    // Vérifier que la date n'est pas dans le passé
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'La date ne peut pas être dans le passé';
      }
    }

    // Validation spécifique pour rendez-vous parents
    if (formData.type === 'parent_meeting') {
      if (!formData.studentName.trim()) newErrors.studentName = 'Le nom de l\'élève est requis';
      if (!formData.parentPhone.trim() && !formData.parentEmail.trim()) {
        newErrors.parentPhone = 'Au moins un moyen de contact parent est requis';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const eventData = {
        ...formData,
        duration: calculateDuration(),
        attendees: formData.attendees.filter(a => a.trim() !== ''),
        reminders: formData.reminders.filter(r => r.enabled)
      };

      if (event) {
        await planningService.updateEvent(event.id, eventData);
      } else {
        await planningService.createEvent(eventData);
      }

      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur sauvegarde événement:', error);
      setErrors({ submit: 'Erreur lors de la sauvegarde' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {event ? 'Modifier l\'événement' : 'Créer un événement'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Planification et gestion des rendez-vous
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre de l'événement *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ex: Rendez-vous avec M. et Mme Dupont"
                  error={errors.title}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'événement *
                </label>
                <Select
                  options={eventTypes}
                  value={formData.type}
                  onChange={(value) => handleInputChange('type', value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorité
                </label>
                <Select
                  options={priorities}
                  value={formData.priority}
                  onChange={(value) => handleInputChange('priority', value)}
                />
              </div>
            </div>

            {/* Date et heure */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  error={errors.date}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure de début *
                </label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  error={errors.startTime}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure de fin *
                </label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  error={errors.endTime}
                />
                {calculateDuration() > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Durée: {calculateDuration()} minutes
                  </p>
                )}
              </div>
            </div>

            {/* Vérification disponibilité */}
            {availabilityCheck && (
              <div className={`p-3 rounded-lg border ${
                availabilityCheck.available 
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {availabilityCheck.available ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Créneau disponible</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Conflit détecté ({availabilityCheck.conflicts.length} événement(s))
                      </span>
                    </>
                  )}
                </div>
                {!availabilityCheck.available && (
                  <div className="mt-2 text-xs">
                    {availabilityCheck.conflicts.map(conflict => (
                      <div key={conflict.id}>
                        • {conflict.title} ({conflict.startTime} - {conflict.endTime})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Lieu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lieu *
              </label>
              <Select
                options={commonLocations}
                value={formData.location}
                onChange={(value) => handleInputChange('location', value)}
                placeholder="Choisir un lieu..."
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location}</p>
              )}
            </div>

            {/* Informations spécifiques aux rendez-vous parents */}
            {formData.type === 'parent_meeting' && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-3">Informations élève et parents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de l'élève *
                    </label>
                    <Input
                      value={formData.studentName}
                      onChange={(e) => handleInputChange('studentName', e.target.value)}
                      placeholder="Ex: Marie Dupont"
                      error={errors.studentName}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Classe
                    </label>
                    <Select
                      options={classes}
                      value={formData.studentClass}
                      onChange={(value) => handleInputChange('studentClass', value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone parent
                    </label>
                    <Input
                      value={formData.parentPhone}
                      onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                      placeholder="06.12.34.56.78"
                      error={errors.parentPhone}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email parent
                    </label>
                    <Input
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                      placeholder="parent@email.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Participants */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Participants
              </label>
              {formData.attendees.map((attendee, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Input
                    value={attendee}
                    onChange={(e) => handleAttendeesChange(index, e.target.value)}
                    placeholder="Nom du participant"
                    className="flex-1"
                  />
                  {formData.attendees.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttendee(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAttendee}
                className="mt-2"
              >
                Ajouter un participant
              </Button>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Détails de l'événement..."
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes internes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Notes privées pour l'équipe..."
              />
            </div>

            {/* Rappels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rappels automatiques
              </label>
              <div className="space-y-2">
                {formData.reminders.map((reminder, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 border rounded">
                    <input
                      type="checkbox"
                      checked={reminder.enabled}
                      onChange={(e) => handleReminderToggle(index, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {reminder.type === 'email' ? '📧' : '📱'} {reminder.type.toUpperCase()} - {reminder.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {errors.submit && (
              <div className="text-red-600 text-sm">{errors.submit}</div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || (availabilityCheck && !availabilityCheck.available)}
              loading={loading}
            >
              {event ? 'Modifier' : 'Créer'} l'événement
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;