import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const NotificationCenter = () => {
  const [selectedTab, setSelectedTab] = useState('send');
  const [messageType, setMessageType] = useState('sms');
  const [recipients, setRecipients] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const messageTypeOptions = [
    { value: 'sms', label: 'SMS' },
    { value: 'email', label: 'Email' },
    { value: 'both', label: 'SMS + Email' }
  ];

  const templateOptions = [
    { value: '', label: 'Message personnalisé' },
    { value: 'absence', label: 'Notification d\'absence' },
    { value: 'payment', label: 'Rappel de paiement' },
    { value: 'meeting', label: 'Convocation réunion' },
    { value: 'grades', label: 'Nouvelles notes disponibles' },
    { value: 'event', label: 'Événement scolaire' }
  ];

  const templates = {
    absence: `Bonjour,\n\nNous vous informons que votre enfant {STUDENT_NAME} a été absent(e) aujourd'hui.\n\nSi cette absence était prévue, merci de nous en informer.\n\nCordialement,\nL'équipe pédagogique`,
    payment: `Bonjour,\n\nNous vous rappelons que le paiement des frais de scolarité pour {STUDENT_NAME} est dû le {DUE_DATE}.\n\nMontant: {AMOUNT}€\n\nMerci de régulariser votre situation.\n\nCordialement,\nLe secrétariat`,
    meeting: `Bonjour,\n\nVous êtes convié(e) à une réunion concernant {STUDENT_NAME}.\n\nDate: {DATE}\nHeure: {TIME}\nLieu: {LOCATION}\n\nMerci de confirmer votre présence.\n\nCordialement,\nL'équipe pédagogique`,
    grades: `Bonjour,\n\nDe nouvelles notes sont disponibles pour {STUDENT_NAME} dans votre espace parent.\n\nConnectez-vous pour les consulter.\n\nCordialement,\nL'équipe pédagogique`,
    event: `Bonjour,\n\nNous vous informons qu'un événement scolaire aura lieu:\n\n{EVENT_NAME}\nDate: {DATE}\nHeure: {TIME}\n\nPlus d'informations à suivre.\n\nCordialement,\nL'équipe pédagogique`
  };

  const parents = [
    {
      id: 1,
      name: "Jean Dubois",
      phone: "+33 6 12 34 56 78",
      email: "jean.dubois@email.fr",
      studentName: "Marie Dubois",
      class: "CM2"
    },
    {
      id: 2,
      name: "Sophie Martin",
      phone: "+33 6 23 45 67 89",
      email: "sophie.martin@email.fr",
      studentName: "Pierre Martin",
      class: "CM1"
    },
    {
      id: 3,
      name: "Marc Rousseau",
      phone: "+33 6 34 56 78 90",
      email: "marc.rousseau@email.fr",
      studentName: "Camille Rousseau",
      class: "CE2"
    },
    {
      id: 4,
      name: "Anne Bernard",
      phone: "+33 6 45 67 89 01",
      email: "anne.bernard@email.fr",
      studentName: "Lucas Bernard",
      class: "CM2"
    },
    {
      id: 5,
      name: "David Leroy",
      phone: "+33 6 56 78 90 12",
      email: "david.leroy@email.fr",
      studentName: "Emma Leroy",
      class: "CE1"
    }
  ];

  const sentMessages = [
    {
      id: 1,
      type: 'sms',
      subject: 'Absence non justifiée',
      recipients: ['Jean Dubois', 'Sophie Martin'],
      sentDate: '11/12/2024 14:30',
      status: 'delivered',
      deliveryCount: 2
    },
    {
      id: 2,
      type: 'email',
      subject: 'Rappel paiement frais de scolarité',
      recipients: ['Marc Rousseau'],
      sentDate: '11/12/2024 09:15',
      status: 'delivered',
      deliveryCount: 1
    },
    {
      id: 3,
      type: 'both',
      subject: 'Réunion parents-professeurs',
      recipients: ['Anne Bernard', 'David Leroy', 'Jean Dubois'],
      sentDate: '10/12/2024 16:45',
      status: 'delivered',
      deliveryCount: 6
    },
    {
      id: 4,
      type: 'sms',
      subject: 'Nouvelles notes disponibles',
      recipients: ['Sophie Martin', 'Anne Bernard'],
      sentDate: '10/12/2024 11:20',
      status: 'failed',
      deliveryCount: 1
    }
  ];

  const handleTemplateChange = (templateKey) => {
    setSelectedTemplate(templateKey);
    if (templateKey && templates?.[templateKey]) {
      setMessage(templates?.[templateKey]);
    } else {
      setMessage('');
    }
  };

  const handleRecipientToggle = (parentId) => {
    setRecipients(prev => 
      prev?.includes(parentId) 
        ? prev?.filter(id => id !== parentId)
        : [...prev, parentId]
    );
  };

  const handleSelectAll = () => {
    if (recipients?.length === parents?.length) {
      setRecipients([]);
    } else {
      setRecipients(parents?.map(p => p?.id));
    }
  };

  const handleSendMessage = () => {
    if (recipients?.length === 0 || !message?.trim()) {
      alert('Veuillez sélectionner des destinataires et saisir un message');
      return;
    }
    
    console.log('Send message:', {
      type: messageType,
      recipients: recipients,
      message: message,
      template: selectedTemplate
    });
    
    // Reset form
    setRecipients([]);
    setMessage('');
    setSelectedTemplate('');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return { icon: 'CheckCircle', className: 'text-success' };
      case 'failed':
        return { icon: 'XCircle', className: 'text-error' };
      case 'pending':
        return { icon: 'Clock', className: 'text-warning' };
      default:
        return { icon: 'Clock', className: 'text-muted-foreground' };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sms':
        return 'MessageSquare';
      case 'email':
        return 'Mail';
      case 'both':
        return 'Send';
      default:
        return 'MessageSquare';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading font-heading-bold text-xl text-text-primary">
          Centre de Notifications
        </h2>
        <p className="font-body font-body-normal text-sm text-text-secondary mt-1">
          Envoyez des messages SMS et emails aux parents
        </p>
      </div>
      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          <button
            onClick={() => setSelectedTab('send')}
            className={`py-2 px-1 border-b-2 font-body font-body-semibold text-sm transition-micro ${
              selectedTab === 'send' ?'border-primary text-primary' :'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Icon name="Send" size={16} />
              <span>Envoyer un message</span>
            </div>
          </button>
          <button
            onClick={() => setSelectedTab('history')}
            className={`py-2 px-1 border-b-2 font-body font-body-semibold text-sm transition-micro ${
              selectedTab === 'history' ?'border-primary text-primary' :'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Icon name="History" size={16} />
              <span>Historique</span>
            </div>
          </button>
        </nav>
      </div>
      {/* Send Message Tab */}
      {selectedTab === 'send' && (
        <div className="space-y-6">
          {/* Message Configuration */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-4">
              Configuration du message
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Select
                label="Type de message"
                options={messageTypeOptions}
                value={messageType}
                onChange={setMessageType}
              />
              <Select
                label="Modèle de message"
                options={templateOptions}
                value={selectedTemplate}
                onChange={handleTemplateChange}
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-body font-body-semibold text-sm text-text-primary mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e?.target?.value)}
                  placeholder="Saisissez votre message..."
                  rows={6}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
                <p className="font-caption font-caption-normal text-xs text-text-secondary mt-1">
                  {message?.length}/160 caractères {messageType === 'sms' && '(SMS)'}
                </p>
              </div>
            </div>
          </div>

          {/* Recipients Selection */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
                Destinataires ({recipients?.length}/{parents?.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {recipients?.length === parents?.length ? 'Désélectionner tout' : 'Sélectionner tout'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parents?.map((parent) => (
                <div key={parent?.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                  <Checkbox
                    checked={recipients?.includes(parent?.id)}
                    onChange={() => handleRecipientToggle(parent?.id)}
                  />
                  <div className="flex-1">
                    <p className="font-body font-body-semibold text-sm text-text-primary">
                      {parent?.name}
                    </p>
                    <p className="font-caption font-caption-normal text-xs text-text-secondary">
                      {parent?.studentName} ({parent?.class})
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="font-caption font-caption-normal text-xs text-text-secondary">
                        📱 {parent?.phone}
                      </span>
                      <span className="font-caption font-caption-normal text-xs text-text-secondary">
                        ✉️ {parent?.email}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Send Button */}
          <div className="flex justify-end">
            <Button
              variant="default"
              iconName="Send"
              iconPosition="left"
              onClick={handleSendMessage}
              disabled={recipients?.length === 0 || !message?.trim()}
            >
              Envoyer le message
            </Button>
          </div>
        </div>
      )}
      {/* History Tab */}
      {selectedTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-card rounded-lg border border-border">
            <div className="p-4 border-b border-border">
              <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
                Messages envoyés
              </h3>
            </div>

            <div className="divide-y divide-border">
              {sentMessages?.map((msg) => {
                const statusConfig = getStatusIcon(msg?.status);
                
                return (
                  <div key={msg?.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon name={getTypeIcon(msg?.type)} size={20} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-body font-body-semibold text-sm text-text-primary">
                            {msg?.subject}
                          </p>
                          <p className="font-caption font-caption-normal text-xs text-text-secondary mt-1">
                            Destinataires: {msg?.recipients?.join(', ')}
                          </p>
                          <p className="font-caption font-caption-normal text-xs text-text-secondary">
                            Envoyé le {msg?.sentDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className={`flex items-center space-x-1 ${statusConfig?.className}`}>
                            <Icon name={statusConfig?.icon} size={16} />
                            <span className="font-caption font-caption-normal text-xs">
                              {msg?.status === 'delivered' ? 'Livré' : 
                               msg?.status === 'failed' ? 'Échec' : 'En cours'}
                            </span>
                          </div>
                          <p className="font-caption font-caption-normal text-xs text-text-secondary mt-1">
                            {msg?.deliveryCount} message(s)
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Voir les détails"
                        >
                          <Icon name="Eye" size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {sentMessages?.length === 0 && (
              <div className="p-8 text-center">
                <Icon name="MessageSquare" size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="font-body font-body-normal text-text-secondary">
                  Aucun message envoyé pour le moment
                </p>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Send" size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-heading font-heading-semibold text-lg text-text-primary">
                    {sentMessages?.length}
                  </p>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary">
                    Messages envoyés
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} className="text-success" />
                </div>
                <div>
                  <p className="font-heading font-heading-semibold text-lg text-text-primary">
                    {sentMessages?.filter(m => m?.status === 'delivered')?.length}
                  </p>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary">
                    Livrés avec succès
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                  <Icon name="XCircle" size={20} className="text-error" />
                </div>
                <div>
                  <p className="font-heading font-heading-semibold text-lg text-text-primary">
                    {sentMessages?.filter(m => m?.status === 'failed')?.length}
                  </p>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary">
                    Échecs de livraison
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;