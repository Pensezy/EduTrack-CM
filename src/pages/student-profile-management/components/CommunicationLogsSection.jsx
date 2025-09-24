import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const CommunicationLogsSection = ({ student }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient: '',
    subject: '',
    message: '',
    priority: 'normal',
    type: 'email'
  });

  const filterOptions = [
    { value: 'all', label: 'Tous les messages' },
    { value: 'email', label: 'Emails' },
    { value: 'sms', label: 'SMS' },
    { value: 'notification', label: 'Notifications' },
    { value: 'meeting', label: 'Réunions' }
  ];

  const recipientOptions = [
    { value: 'parent', label: 'Parents' },
    { value: 'student', label: 'Élève' },
    { value: 'teacher', label: 'Enseignant' },
    { value: 'administration', label: 'Administration' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Faible' },
    { value: 'normal', label: 'Normale' },
    { value: 'high', label: 'Élevée' },
    { value: 'urgent', label: 'Urgente' }
  ];

  const typeOptions = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'notification', label: 'Notification interne' }
  ];

  const communicationHistory = [
    {
      id: 1,
      date: '15/12/2024 14:30',
      type: 'email',
      sender: 'M. Dubois (Professeur)',
      recipient: 'Parents',
      subject: 'Excellents résultats en mathématiques',
      message: `Bonjour,\n\nJe tenais à vous féliciter pour les excellents résultats de ${student?.firstName} en mathématiques ce trimestre. Sa moyenne de 16.5/20 témoigne de son sérieux et de sa motivation.\n\nContinuez ainsi !\n\nCordialement,\nM. Dubois`,
      status: 'delivered',
      priority: 'normal',
      readAt: '15/12/2024 15:45'
    },
    {
      id: 2,
      date: '12/12/2024 09:15',
      type: 'sms',
      sender: 'Secrétariat',
      recipient: 'Parents',
      subject: 'Rappel réunion parent-professeur',
      message: 'Rappel: Réunion parent-professeur demain 16h. Merci de confirmer votre présence.',
      status: 'delivered',
      priority: 'high',
      readAt: '12/12/2024 09:20'
    },
    {
      id: 3,
      date: '10/12/2024 16:00',
      type: 'notification',
      sender: 'Système',
      recipient: 'Parents',
      subject: 'Nouvelle note disponible',
      message: 'Une nouvelle note a été ajoutée en Histoire-Géographie: 15.8/20',
      status: 'read',
      priority: 'normal',
      readAt: '10/12/2024 18:30'
    },
    {
      id: 4,
      date: '08/12/2024 11:20',
      type: 'email',
      sender: 'Mme Martin (CPE)',
      recipient: 'Parents',
      subject: 'Absence non justifiée',
      message: `Bonjour,\n\n${student?.firstName} était absent(e) ce matin sans justificatif. Merci de nous faire parvenir un mot d'excuse.\n\nCordialement,\nMme Martin`,status: 'delivered',priority: 'high',readAt: '08/12/2024 12:00'
    },
    {
      id: 5,
      date: '05/12/2024 13:45',type: 'meeting',sender: 'Direction',recipient: 'Parents',subject: 'Convocation réunion disciplinaire',message: 'Suite à l\'incident du 03/12, vous êtes convoqués pour un entretien le 07/12 à 14h.',
      status: 'delivered',
      priority: 'urgent',
      readAt: '05/12/2024 14:15'
    }
  ];

  const notificationPreferences = {
    email: true,
    sms: true,
    push: false,
    grades: true,
    attendance: true,
    behavior: true,
    meetings: true,
    payments: false
  };

  const filteredMessages = communicationHistory?.filter(message => {
    const matchesFilter = selectedFilter === 'all' || message?.type === selectedFilter;
    const matchesSearch = message?.subject?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         message?.message?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         message?.sender?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email':
        return 'Mail';
      case 'sms':
        return 'MessageSquare';
      case 'notification':
        return 'Bell';
      case 'meeting':
        return 'Calendar';
      default:
        return 'MessageCircle';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'email':
        return 'text-primary bg-primary/10';
      case 'sms':
        return 'text-success bg-success/10';
      case 'notification':
        return 'text-warning bg-warning/10';
      case 'meeting':
        return 'text-error bg-error/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-error';
      case 'high':
        return 'text-warning';
      case 'normal':
        return 'text-primary';
      case 'low':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return 'Check';
      case 'read':
        return 'CheckCheck';
      case 'failed':
        return 'X';
      default:
        return 'Clock';
    }
  };

  const handleSendMessage = () => {
    // Simulate sending message
    console.log('Message envoyé:', newMessage);
    setShowNewMessage(false);
    setNewMessage({
      recipient: '',
      subject: '',
      message: '',
      priority: 'normal',
      type: 'email'
    });
  };

  return (
    <div className="bg-card rounded-lg shadow-card p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading font-heading-semibold text-xl text-card-foreground flex items-center">
          <Icon name="MessageSquare" size={20} className="mr-2 text-primary" />
          Journal de communication
        </h2>
        <Button
          variant="default"
          onClick={() => setShowNewMessage(!showNewMessage)}
          iconName="Plus"
          iconPosition="left"
        >
          Nouveau message
        </Button>
      </div>
      {/* New Message Form */}
      {showNewMessage && (
        <div className="bg-muted rounded-lg p-4 mb-6">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
            Nouveau message
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Select
              label="Destinataire"
              options={recipientOptions}
              value={newMessage?.recipient}
              onChange={(value) => setNewMessage(prev => ({ ...prev, recipient: value }))}
              placeholder="Sélectionner le destinataire"
            />
            <Select
              label="Type"
              options={typeOptions}
              value={newMessage?.type}
              onChange={(value) => setNewMessage(prev => ({ ...prev, type: value }))}
            />
            <Input
              label="Sujet"
              type="text"
              value={newMessage?.subject}
              onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e?.target?.value }))}
              placeholder="Objet du message"
            />
            <Select
              label="Priorité"
              options={priorityOptions}
              value={newMessage?.priority}
              onChange={(value) => setNewMessage(prev => ({ ...prev, priority: value }))}
            />
          </div>
          <div className="mb-4">
            <label className="block font-body font-body-semibold text-sm text-card-foreground mb-2">
              Message
            </label>
            <textarea
              value={newMessage?.message}
              onChange={(e) => setNewMessage(prev => ({ ...prev, message: e?.target?.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Tapez votre message ici..."
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="default" onClick={handleSendMessage}>
              Envoyer
            </Button>
            <Button variant="outline" onClick={() => setShowNewMessage(false)}>
              Annuler
            </Button>
          </div>
        </div>
      )}
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <Select
            options={filterOptions}
            value={selectedFilter}
            onChange={setSelectedFilter}
            className="w-48"
          />
        </div>
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Rechercher dans les messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
          />
        </div>
      </div>
      {/* Communication History */}
      <div className="space-y-4 mb-6">
        {filteredMessages?.map((message) => (
          <div key={message?.id} className="bg-muted rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${getTypeColor(message?.type)}`}>
                  <Icon name={getTypeIcon(message?.type)} size={16} />
                </div>
                <div>
                  <h4 className="font-body font-body-semibold text-sm text-card-foreground">
                    {message?.subject}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                    <span>{message?.sender}</span>
                    <span>→</span>
                    <span>{message?.recipient}</span>
                    <span>•</span>
                    <span>{message?.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Icon 
                  name="AlertCircle" 
                  size={14} 
                  className={getPriorityColor(message?.priority)} 
                />
                <Icon 
                  name={getStatusIcon(message?.status)} 
                  size={14} 
                  className={message?.status === 'read' ? 'text-success' : 'text-muted-foreground'} 
                />
              </div>
            </div>
            <p className="text-sm text-card-foreground mb-3 whitespace-pre-line">
              {message?.message}
            </p>
            {message?.readAt && (
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Icon name="Eye" size={12} />
                <span>Lu le {message?.readAt}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Notification Preferences */}
      <div className="border-t border-border pt-6">
        <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
          Préférences de notification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-body font-body-semibold text-sm text-card-foreground mb-3">
              Canaux de communication
            </h4>
            <div className="space-y-2">
              {Object.entries({
                email: 'Email',
                sms: 'SMS',
                push: 'Notifications push'
              })?.map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-card-foreground">{label}</span>
                  <button
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      notificationPreferences?.[key] ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        notificationPreferences?.[key] ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-body font-body-semibold text-sm text-card-foreground mb-3">
              Types de notifications
            </h4>
            <div className="space-y-2">
              {Object.entries({
                grades: 'Nouvelles notes',
                attendance: 'Absences',
                behavior: 'Comportement',
                meetings: 'Réunions',
                payments: 'Paiements'
              })?.map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-card-foreground">{label}</span>
                  <button
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      notificationPreferences?.[key] ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        notificationPreferences?.[key] ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationLogsSection;