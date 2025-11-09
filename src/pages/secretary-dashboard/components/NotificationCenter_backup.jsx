import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { useDataMode } from '../../../hooks/useEduTrackData';
import communicationService from '../../../services/communicationService';

const NotificationCenter = () => {
  const [selectedTab, setSelectedTab] = useState('send');
  const [messageType, setMessageType] = useState('sms');
  const [recipients, setRecipients] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [loading, setLoading] = useState(true);

  // États pour les données réelles
  const [parents, setParents] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [sending, setSending] = useState(false);

  const { dataMode } = useDataMode();

  // Chargement des données au montage du composant
  useEffect(() => {
    const loadCommunicationData = async () => {
      try {
        setLoading(true);
        
        console.log('NotificationCenter: Chargement des données en mode production forcé');
        
        const [parentsRes, historyRes, templatesRes] = await Promise.all([
          communicationService.getParentsBySchool(),
          communicationService.getCommunicationsHistory(),
          communicationService.getMessageTemplates()
        ]);

        setParents(parentsRes);
        setSentMessages(historyRes);
        
        // Transformer les templates pour le Select + ajouter les templates par défaut
        const defaultTemplates = [
          { value: '', label: 'Message personnalisé', category: 'custom', content: '', variables: [] },
          { value: 'absence_default', label: 'Notification d\'absence', category: 'absence', 
            content: `Bonjour,\n\nNous vous informons que votre enfant {STUDENT_NAME} a été absent(e) aujourd'hui.\n\nSi cette absence était prévue, merci de nous en informer.\n\nCordialement,\nL'équipe pédagogique`,
            variables: ['STUDENT_NAME'] },
          { value: 'payment_default', label: 'Rappel de paiement', category: 'payment',
            content: `Bonjour,\n\nNous vous rappelons que le paiement des frais de scolarité pour {STUDENT_NAME} est dû le {DUE_DATE}.\n\nMontant: {AMOUNT} FCFA\n\nMerci de régulariser votre situation.\n\nCordialement,\nLe secrétariat`,
            variables: ['STUDENT_NAME', 'DUE_DATE', 'AMOUNT'] },
          { value: 'meeting_default', label: 'Convocation réunion', category: 'meeting',
            content: `Bonjour,\n\nVous êtes convié(e) à une réunion concernant {STUDENT_NAME}.\n\nDate: {DATE}\nHeure: {TIME}\nLieu: {LOCATION}\n\nMerci de confirmer votre présence.\n\nCordialement,\nL'équipe pédagogique`,
            variables: ['STUDENT_NAME', 'DATE', 'TIME', 'LOCATION'] },
          { value: 'grades_default', label: 'Nouvelles notes disponibles', category: 'grades',
            content: `Bonjour,\n\nDe nouvelles notes sont disponibles pour {STUDENT_NAME} dans votre espace parent.\n\nConnectez-vous pour les consulter.\n\nCordialement,\nL'équipe pédagogique`,
            variables: ['STUDENT_NAME'] },
          { value: 'event_default', label: 'Événement scolaire', category: 'event',
            content: `Bonjour,\n\nNous vous informons qu'un événement scolaire aura lieu:\n\n{EVENT_NAME}\nDate: {DATE}\nHeure: {TIME}\n\nPlus d'informations à suivre.\n\nCordialement,\nL'équipe pédagogique`,
            variables: ['EVENT_NAME', 'DATE', 'TIME'] }
        ];

        // Combiner les templates par défaut avec ceux de la base
        const allTemplates = [...defaultTemplates, ...templatesRes];
        setTemplates(allTemplates);

        console.log('NotificationCenter: Données chargées:', {
          parents: parentsRes.length,
          history: historyRes.length,
          templates: allTemplates.length
        });

        // Si aucune donnée trouvée, afficher un message informatif
        if (parentsRes.length === 0) {
          console.log('NotificationCenter: Aucun parent trouvé - affichage des états vides');
        }
      } catch (error) {
        console.error('NotificationCenter: Erreur lors du chargement des données:', error);
        // En cas d'erreur, utiliser des données vides
        setParents([]);
        setSentMessages([]);
        setTemplates([
          { value: '', label: 'Message personnalisé', category: 'custom', content: '', variables: [] }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadCommunicationData();
  }, [dataMode]);

  const messageTypeOptions = [
    { value: 'sms', label: 'SMS' },
    { value: 'email', label: 'Email' },
    { value: 'both', label: 'SMS + Email' }
  ];

  // Gestionnaire de changement de template
  const handleTemplateChange = (templateValue) => {
    setSelectedTemplate(templateValue);
    
    // Trouver le template sélectionné
    const template = templates.find(t => t.value === templateValue);
    if (template && template.content) {
      setMessage(template.content);
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

  const handleSendMessage = async () => {
    if (recipients?.length === 0 || !message?.trim()) {
      alert('Veuillez sélectionner des destinataires et saisir un message');
      return;
    }
    
    setSending(true);
    
    try {
      // Préparer les données des destinataires
      const selectedParents = parents.filter(p => recipients.includes(p.id));
      const recipientsData = selectedParents.map(parent => ({
        id: parent.id,
        name: parent.name,
        phone: parent.phone,
        email: parent.email,
        student_name: parent.studentName
      }));

      // Envoyer le message via le service
      const result = await communicationService.sendMessage({
        type: messageType,
        subject: selectedTemplate ? templates.find(t => t.value === selectedTemplate)?.label : 'Message personnalisé',
        content: message,
        recipients: recipientsData,
        templateUsed: selectedTemplate
      });

      if (result.success) {
        alert(`Message envoyé avec succès à ${result.deliveredCount} destinataire(s)`);
        
        // Reset form
        setRecipients([]);
        setMessage('');
        setSelectedTemplate('');
        
        // Recharger l'historique
        const newHistory = await communicationService.getCommunicationsHistory();
        setSentMessages(newHistory);
      } else {
        alert(`Erreur lors de l'envoi: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-text-secondary">
          <Icon name="Loader2" size={20} className="animate-spin" />
          <span>Chargement des données de communication...</span>
        </div>
      </div>
    );
  }

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
                options={templates.map(t => ({ value: t.value, label: t.label }))}
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
              {parents?.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Icon name="Users" size={32} className="text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-heading font-heading-medium text-base text-text-primary mb-2">
                    Aucun parent trouvé
                  </h4>
                  <p className="text-text-secondary">
                    Les parents seront affichés une fois qu'ils seront ajoutés au système avec leurs enfants.
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
                ))
              )}
            </div>
          </div>

          {/* Send Button */}
          <div className="flex justify-end">
            <Button
              variant="default"
              iconName={sending ? "Loader2" : "Send"}
              iconPosition="left"
              onClick={handleSendMessage}
              disabled={recipients?.length === 0 || !message?.trim() || sending || parents?.length === 0}
              className={sending ? "animate-pulse" : ""}
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