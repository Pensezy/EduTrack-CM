import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const StudentCommunication = ({ classData, students }) => {
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [messageForm, setMessageForm] = useState({
    type: 'note',
    title: '',
    message: '',
    priority: 'medium'
  });
  const [showComposeForm, setShowComposeForm] = useState(false);

  const messageTypes = [
    { value: 'note', label: 'Nouvelle note', icon: 'BookOpen', color: 'text-success' },
    { value: 'absence', label: 'Absence', icon: 'Calendar', color: 'text-error' },
    { value: 'behavior', label: 'Comportement', icon: 'User', color: 'text-warning' },
    { value: 'reminder', label: 'Rappel', icon: 'Bell', color: 'text-primary' },
    { value: 'general', label: 'Information générale', icon: 'MessageSquare', color: 'text-accent-foreground' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Faible', color: 'text-success' },
    { value: 'medium', label: 'Moyenne', color: 'text-warning' },
    { value: 'high', label: 'Haute', color: 'text-error' }
  ];

  const handleRecipientToggle = (studentId) => {
    setSelectedRecipients(prev => 
      prev?.includes(studentId) 
        ? prev?.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAll = () => {
    if (selectedRecipients?.length === students?.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(students?.map(s => s?.id) || []);
    }
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    
    if (selectedRecipients?.length === 0) {
      alert('Veuillez sélectionner au moins un destinataire');
      return;
    }

    console.log('Sending message:', {
      recipients: selectedRecipients,
      message: messageForm,
      class: classData?.name
    });
    
    // Reset form
    setMessageForm({
      type: 'note',
      title: '',
      message: '',
      priority: 'medium'
    });
    setSelectedRecipients([]);
    setShowComposeForm(false);
    
    alert(`Message envoyé à ${selectedRecipients?.length} parent(s) !`);
  };

  const sendQuickNotification = (type, student) => {
    const templates = {
      good_behavior: {
        title: 'Comportement exemplaire',
        message: `${student?.name} a fait preuve d'un comportement exemplaire aujourd'hui en cours de ${classData?.subject}.`
      },
      homework_missing: {
        title: 'Devoir manquant',
        message: `${student?.name} n'a pas rendu le devoir de ${classData?.subject} qui était attendu aujourd'hui.`
      },
      excellent_work: {
        title: 'Excellent travail',
        message: `${student?.name} a fourni un excellent travail en ${classData?.subject}. Félicitations !`
      }
    };

    const template = templates?.[type];
    console.log('Sending quick notification:', {
      recipient: student?.id,
      ...template,
      class: classData?.name
    });
    
    alert(`Message "${template?.title}" envoyé au parent de ${student?.name} !`);
  };

  const getTypeConfig = (type) => {
    return messageTypes?.find(t => t?.value === type) || messageTypes?.[0];
  };

  const getPriorityConfig = (priority) => {
    return priorityLevels?.find(p => p?.value === priority) || priorityLevels?.[1];
  };

  return (
    <div className="bg-card rounded-lg shadow-card border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-heading-semibold text-xl text-card-foreground">
          Communication Parentale
        </h3>
        <button
          onClick={() => setShowComposeForm(!showComposeForm)}
          className="px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-2"
        >
          <Icon name="MessageSquare" size={16} />
          <span className="font-caption font-caption-semibold text-sm">
            Nouveau message
          </span>
        </button>
      </div>
      {/* Message Compose Form */}
      {showComposeForm && (
        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-body font-body-semibold text-sm text-card-foreground mb-2">
                  Type de message *
                </label>
                <select
                  value={messageForm?.type}
                  onChange={(e) => setMessageForm({...messageForm, type: e?.target?.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  required
                >
                  {messageTypes?.map(type => (
                    <option key={type?.value} value={type?.value}>
                      {type?.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-body font-body-semibold text-sm text-card-foreground mb-2">
                  Priorité
                </label>
                <select
                  value={messageForm?.priority}
                  onChange={(e) => setMessageForm({...messageForm, priority: e?.target?.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                >
                  {priorityLevels?.map(priority => (
                    <option key={priority?.value} value={priority?.value}>
                      {priority?.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-body font-body-semibold text-sm text-card-foreground mb-2">
                Objet *
              </label>
              <input
                type="text"
                value={messageForm?.title}
                onChange={(e) => setMessageForm({...messageForm, title: e?.target?.value})}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                placeholder="Objet du message..."
                required
              />
            </div>

            <div>
              <label className="block font-body font-body-semibold text-sm text-card-foreground mb-2">
                Message *
              </label>
              <textarea
                value={messageForm?.message}
                onChange={(e) => setMessageForm({...messageForm, message: e?.target?.value})}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background h-24 resize-none"
                placeholder="Votre message aux parents..."
                required
              />
            </div>

            {/* Recipients Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="font-body font-body-semibold text-sm text-card-foreground">
                  Destinataires * ({selectedRecipients?.length} sélectionné{selectedRecipients?.length > 1 ? 's' : ''})
                </label>
                <button
                  type="button"
                  onClick={selectAll}
                  className="px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 rounded transition-colors"
                >
                  {selectedRecipients?.length === students?.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                </button>
              </div>
              
              <div className="max-h-48 overflow-y-auto border border-border rounded-lg">
                {students?.map(student => (
                  <label key={student?.id} className="flex items-center gap-3 p-3 hover:bg-muted/20 cursor-pointer border-b border-border last:border-b-0">
                    <input
                      type="checkbox"
                      checked={selectedRecipients?.includes(student?.id)}
                      onChange={() => handleRecipientToggle(student?.id)}
                      className="text-primary focus:ring-primary"
                    />
                    <img
                      src={student?.photo}
                      alt={student?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-body font-body-semibold text-sm text-card-foreground">
                        {student?.name}
                      </div>
                      <div className="font-caption font-caption-normal text-xs text-muted-foreground">
                        {student?.matricule}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 bg-primary text-white font-body font-body-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Icon name="Send" size={16} />
                Envoyer le Message
              </button>
              <button
                type="button"
                onClick={() => setShowComposeForm(false)}
                className="px-4 py-3 border border-border text-muted-foreground hover:bg-muted/20 rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Student List with Quick Actions */}
      <div className="space-y-3">
        <h4 className="font-heading font-heading-semibold text-lg text-card-foreground">
          Actions Rapides par Élève
        </h4>

        {students?.map(student => (
          <div key={student?.id} className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-4 mb-3">
              <img
                src={student?.photo}
                alt={student?.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-border"
              />
              
              <div className="flex-1">
                <h5 className="font-heading font-heading-semibold text-lg text-card-foreground">
                  {student?.name}
                </h5>
                <p className="font-body font-body-normal text-sm text-muted-foreground">
                  {student?.matricule}
                </p>
              </div>

              {/* Student Stats */}
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <div className="text-center">
                  <div className="font-heading font-heading-bold text-success">
                    {student?.recentGrades?.[0]?.grade || 0}/20
                  </div>
                  <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                    Dernière note
                  </p>
                </div>
                <div className="text-center">
                  <div className="font-heading font-heading-bold text-primary">
                    {student?.attendance?.present || 0}
                  </div>
                  <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                    Présences
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => sendQuickNotification('good_behavior', student)}
                className="px-3 py-2 bg-success/10 text-success hover:bg-success/20 rounded-lg transition-colors flex items-center gap-2"
              >
                <Icon name="ThumbsUp" size={14} />
                <span className="font-caption font-caption-semibold text-xs">
                  Féliciter
                </span>
              </button>

              <button
                onClick={() => sendQuickNotification('homework_missing', student)}
                className="px-3 py-2 bg-warning/10 text-warning hover:bg-warning/20 rounded-lg transition-colors flex items-center gap-2"
              >
                <Icon name="AlertCircle" size={14} />
                <span className="font-caption font-caption-semibold text-xs">
                  Devoir manquant
                </span>
              </button>

              <button
                onClick={() => sendQuickNotification('excellent_work', student)}
                className="px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors flex items-center gap-2"
              >
                <Icon name="Award" size={14} />
                <span className="font-caption font-caption-semibold text-xs">
                  Excellent travail
                </span>
              </button>

              <button
                onClick={() => {
                  setSelectedRecipients([student?.id]);
                  setShowComposeForm(true);
                }}
                className="px-3 py-2 bg-accent/10 text-accent-foreground hover:bg-accent/20 rounded-lg transition-colors flex items-center gap-2"
              >
                <Icon name="MessageSquare" size={14} />
                <span className="font-caption font-caption-semibold text-xs">
                  Message perso
                </span>
              </button>
            </div>
          </div>
        ))}

        {students?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="font-body font-body-normal text-muted-foreground">
              Aucun élève dans cette classe
            </p>
          </div>
        )}
      </div>
      {/* SMS Information */}
      <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="MessageSquare" size={16} className="text-accent-foreground mt-0.5" />
          <div className="text-sm">
            <p className="font-body font-body-semibold text-accent-foreground mb-1">
              Notifications SMS automatiques
            </p>
            <p className="font-body font-body-normal text-muted-foreground">
              Tous les messages envoyés via cette interface sont également transmis 
              aux parents par SMS. Les accusés de réception sont trackés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCommunication;