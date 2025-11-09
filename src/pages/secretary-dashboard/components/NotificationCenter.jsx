import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { communicationService } from '../../../services/communicationService';
import { useDataMode } from '../../../hooks/useDataMode';

const NotificationCenter = () => {
  const [selectedTab, setSelectedTab] = useState('send');
  const [messageType, setMessageType] = useState('both');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [recipients, setRecipients] = useState([]);
  const [sending, setSending] = useState(false);

  // Real data state
  const [parents, setParents] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { dataMode } = useDataMode();

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [parentsRes, historyRes, templatesRes] = await Promise.all([
          communicationService.getParentsBySchool(),
          communicationService.getCommunicationsHistory(),
          communicationService.getMessageTemplates()
        ]);

        setParents(parentsRes || []);
        setSentMessages(historyRes || []);
        setTemplates(templatesRes || []);
      } catch (error) {
        console.error('Error loading communication data:', error);
        setParents([]);
        setSentMessages([]);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSelectAll = () => {
    if (recipients.length === parents.length) {
      setRecipients([]);
    } else {
      setRecipients(parents?.map(p => p?.id));
    }
  };

  const handleRecipientToggle = (parentId) => {
    if (recipients.includes(parentId)) {
      setRecipients(recipients.filter(id => id !== parentId));
    } else {
      setRecipients([...recipients, parentId]);
    }
  };

  const handleSendMessage = async () => {
    if (!message || recipients.length === 0) {
      alert('Veuillez saisir un message et sélectionner au moins un destinataire.');
      return;
    }

    try {
      setSending(true);
      const selectedParents = parents.filter(parent => recipients.includes(parent?.id));
      const recipientsData = selectedParents.map(parent => ({
        id: parent?.id,
        name: parent?.name || `${parent?.first_name} ${parent?.last_name}`,
        phone: parent?.phone,
        email: parent?.email,
        studentName: parent?.studentName || (parent?.students && parent?.students?.first_name + ' ' + parent?.students?.last_name)
      }));

      await communicationService.sendMessage({
        type: messageType,
        subject: subject || 'Message important',
        message,
        recipients: recipientsData
      });

      // Reset form
      setMessage('');
      setSubject('');
      setRecipients([]);
      setSelectedTemplate('custom');
      
      alert('Message envoyé avec succès !');
      
      // Reload history
      const historyRes = await communicationService.getCommunicationsHistory();
      setSentMessages(historyRes || []);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erreur lors de l\'envoi du message.');
    } finally {
      setSending(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return { icon: 'CheckCircle', className: 'text-success' };
      case 'failed':
        return { icon: 'XCircle', className: 'text-error' };
      default:
        return { icon: 'Clock', className: 'text-warning' };
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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-text-secondary">
          <Icon name="Loader2" size={20} className="animate-spin" />
          <span>Chargement des communications...</span>
        </div>
      </div>
    );
  }

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
              selectedTab === 'send' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-secondary hover:text-text-primary'
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
              selectedTab === 'history' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-secondary hover:text-text-primary'
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
                value={messageType}
                onChange={setMessageType}
                options={[
                  { value: 'sms', label: 'SMS uniquement' },
                  { value: 'email', label: 'Email uniquement' },
                  { value: 'both', label: 'SMS + Email' }
                ]}
              />
              
              <Select
                label="Modèle"
                value={selectedTemplate}
                onChange={setSelectedTemplate}
                options={templates.map(t => ({ value: t.value, label: t.label }))}
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <Input
                  label="Sujet (optionnel)"
                  value={subject}
                  onChange={setSubject}
                  placeholder="Sujet du message"
                />
              </div>
              
              <div>
                <label className="block font-body font-body-medium text-sm text-text-primary mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tapez votre message ici..."
                  className="w-full h-32 p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Recipients Selection */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
                Destinataires ({parents?.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {recipients.length === parents.length ? 'Désélectionner tout' : 'Sélectionner tout'}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parents?.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Icon name="Users" size={32} className="text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-heading font-heading-medium text-base text-text-primary mb-2">
                    Aucun parent trouvé
                  </h4>
                  <p className="text-text-secondary">
                    Aucun parent n'est enregistré dans la base de données pour cette école.
                  </p>
                </div>
              ) : (
                parents?.map((parent) => (
                  <div key={parent?.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                    <Checkbox
                      checked={recipients?.includes(parent?.id)}
                      onChange={() => handleRecipientToggle(parent?.id)}
                    />
                    <div className="flex-1">
                      <p className="font-body font-body-semibold text-sm text-text-primary">
                        {parent?.name || `${parent?.first_name} ${parent?.last_name}`}
                      </p>
                      <p className="font-caption font-caption-normal text-xs text-text-secondary">
                        {parent?.studentName || (parent?.students && `${parent?.students?.first_name} ${parent?.students?.last_name}`)} ({parent?.class || parent?.students?.current_class})
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
                ))
              )}
            </div>
          </div>

          {/* Send Button */}
          <div className="flex justify-end">
            <Button
              variant="default"
              iconName={sending ? "Loader2" : "Send"}
              iconClassName={sending ? "animate-spin" : ""}
              onClick={handleSendMessage}
              disabled={sending || !message || recipients.length === 0}
            >
              {sending ? 'Envoi en cours...' : 'Envoyer le message'}
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
              {sentMessages?.length === 0 ? (
                <div className="p-8 text-center">
                  <Icon name="MessageCircle" size={32} className="text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-heading font-heading-medium text-base text-text-primary mb-2">
                    Aucun message envoyé
                  </h4>
                  <p className="text-text-secondary">
                    L'historique de vos communications apparaîtra ici une fois que vous aurez envoyé des messages.
                  </p>
                </div>
              ) : (
                sentMessages?.map((msg) => {
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
                })
              )}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-background/50">
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="Send" size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-heading-semibold text-lg text-text-primary">
                      {sentMessages?.length || 0}
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
                      {sentMessages?.filter(m => m?.status === 'delivered')?.length || 0}
                    </p>
                    <p className="font-caption font-caption-normal text-xs text-text-secondary">
                      Messages livrés
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
                      {sentMessages?.filter(m => m?.status === 'failed')?.length || 0}
                    </p>
                    <p className="font-caption font-caption-normal text-xs text-text-secondary">
                      Échecs de livraison
                    </p>
                  </div>
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