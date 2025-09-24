import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const TransferWorkflow = () => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [newSchool, setNewSchool] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);
  const [transferCode, setTransferCode] = useState('');

  const students = [
    { value: '1', label: 'Marie Dubois (CM2)' },
    { value: '2', label: 'Pierre Martin (CM1)' },
    { value: '3', label: 'Camille Rousseau (CE2)' },
    { value: '4', label: 'Lucas Bernard (CM2)' },
    { value: '5', label: 'Emma Leroy (CE1)' }
  ];

  const reasonOptions = [
    { value: 'relocation', label: 'Déménagement' },
    { value: 'school_choice', label: 'Choix d\'établissement' },
    { value: 'family_reasons', label: 'Raisons familiales' },
    { value: 'academic_reasons', label: 'Raisons pédagogiques' },
    { value: 'other', label: 'Autre' }
  ];

  const pendingTransfers = [
    {
      id: 1,
      studentName: "Camille Rousseau",
      studentId: "STU003",
      class: "CE2",
      transferDate: "20/12/2024",
      newSchool: "École Primaire Saint-Martin",
      reason: "Déménagement",
      status: "pending",
      transferCode: "TRF-2024-001",
      qrCode: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPgogIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZmZmIi8+CiAgPHRleHQgeD0iNTAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMDAwIj5RUjwvdGV4dD4KPC9zdmc+",
      parentNotified: true,
      documentsReady: false
    },
    {
      id: 2,
      studentName: "Emma Leroy",
      studentId: "STU005",
      class: "CE1",
      transferDate: "15/01/2025",
      newSchool: "École Élémentaire Victor Hugo",
      reason: "Choix d\'établissement",
      status: "confirmed",
      transferCode: "TRF-2024-002",
      qrCode: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPgogIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZmZmIi8+CiAgPHRleHQgeD0iNTAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMDAwIj5RUjwvdGV4dD4KPC9zdmc+",
      parentNotified: true,
      documentsReady: true
    }
  ];

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: 'En attente',
        className: 'bg-warning/10 text-warning',
        icon: 'Clock'
      },
      confirmed: {
        label: 'Confirmé',
        className: 'bg-success/10 text-success',
        icon: 'CheckCircle'
      },
      cancelled: {
        label: 'Annulé',
        className: 'bg-error/10 text-error',
        icon: 'XCircle'
      }
    };
    return configs?.[status] || configs?.pending;
  };

  const generateTransferCode = () => {
    const code = `TRF-${new Date()?.getFullYear()}-${String(Math.floor(Math.random() * 1000))?.padStart(3, '0')}`;
    setTransferCode(code);
    setQrCodeGenerated(true);
  };

  const handleInitiateTransfer = () => {
    if (!selectedStudent || !transferReason || !newSchool || !transferDate) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    generateTransferCode();
    console.log('Initiate transfer:', {
      student: selectedStudent,
      reason: transferReason,
      newSchool: newSchool,
      date: transferDate,
      code: transferCode
    });
  };

  const handleSendConfirmation = (transferId) => {
    console.log('Send confirmation SMS for transfer:', transferId);
  };

  const handlePrintDocuments = (transferId) => {
    console.log('Print transfer documents for:', transferId);
  };

  const handleCancelTransfer = (transferId) => {
    console.log('Cancel transfer:', transferId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading font-heading-bold text-xl text-text-primary">
          Gestion des Transferts
        </h2>
        <p className="font-body font-body-normal text-sm text-text-secondary mt-1">
          Processus de transfert d'élèves avec génération de QR codes
        </p>
      </div>
      {/* New Transfer Form */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-4">
          Nouveau transfert d'élève
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Select
            label="Élève à transférer"
            placeholder="Sélectionner un élève"
            options={students}
            value={selectedStudent}
            onChange={setSelectedStudent}
            required
          />
          <Select
            label="Motif du transfert"
            placeholder="Sélectionner un motif"
            options={reasonOptions}
            value={transferReason}
            onChange={setTransferReason}
            required
          />
          <Input
            label="Nouvel établissement"
            type="text"
            placeholder="Nom de la nouvelle école"
            value={newSchool}
            onChange={(e) => setNewSchool(e?.target?.value)}
            required
          />
          <Input
            label="Date de transfert"
            type="date"
            value={transferDate}
            onChange={(e) => setTransferDate(e?.target?.value)}
            required
          />
        </div>

        {qrCodeGenerated && (
          <div className="bg-accent/5 rounded-lg border border-accent/20 p-4 mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white border border-border rounded-lg flex items-center justify-center">
                <img 
                  src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMDAwIi8+CiAgPHJlY3QgeD0iNSIgeT0iNSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZmZmIi8+CiAgPHRleHQgeD0iMzAiIHk9IjM1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjgiIGZpbGw9IiMwMDAiPlFSPC90ZXh0Pgo8L3N2Zz4K"
                  alt="QR Code"
                  className="w-16 h-16"
                />
              </div>
              <div>
                <p className="font-heading font-heading-semibold text-sm text-text-primary">
                  Code de transfert généré
                </p>
                <p className="font-mono text-lg text-primary font-bold">
                  {transferCode}
                </p>
                <p className="font-caption font-caption-normal text-xs text-text-secondary">
                  Ce QR code sera envoyé aux parents par SMS
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            variant="default"
            iconName="Send"
            iconPosition="left"
            onClick={handleInitiateTransfer}
          >
            Initier le transfert
          </Button>
        </div>
      </div>
      {/* Pending Transfers */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
            Transferts en cours ({pendingTransfers?.length})
          </h3>
        </div>

        <div className="divide-y divide-border">
          {pendingTransfers?.map((transfer) => {
            const statusConfig = getStatusConfig(transfer?.status);

            return (
              <div key={transfer?.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <img 
                        src={transfer?.qrCode}
                        alt="QR Code"
                        className="w-12 h-12"
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-body font-body-semibold text-lg text-text-primary">
                          {transfer?.studentName}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-caption font-caption-normal ${statusConfig?.className}`}>
                          {statusConfig?.label}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="font-caption font-caption-normal text-sm text-text-secondary">
                          <span className="font-semibold">ID:</span> {transfer?.studentId} • 
                          <span className="font-semibold"> Classe:</span> {transfer?.class}
                        </p>
                        <p className="font-caption font-caption-normal text-sm text-text-secondary">
                          <span className="font-semibold">Vers:</span> {transfer?.newSchool}
                        </p>
                        <p className="font-caption font-caption-normal text-sm text-text-secondary">
                          <span className="font-semibold">Date:</span> {transfer?.transferDate} • 
                          <span className="font-semibold"> Motif:</span> {transfer?.reason}
                        </p>
                        <p className="font-mono text-sm text-primary">
                          Code: {transfer?.transferCode}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSendConfirmation(transfer?.id)}
                      title="Envoyer confirmation SMS"
                      disabled={!transfer?.parentNotified}
                    >
                      <Icon name="MessageSquare" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePrintDocuments(transfer?.id)}
                      title="Imprimer les documents"
                    >
                      <Icon name="Printer" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCancelTransfer(transfer?.id)}
                      title="Annuler le transfert"
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                </div>
                {/* Transfer Status Indicators */}
                <div className="mt-4 flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name={transfer?.parentNotified ? "CheckCircle" : "Clock"} 
                      size={16} 
                      className={transfer?.parentNotified ? "text-success" : "text-warning"}
                    />
                    <span className="font-caption font-caption-normal text-xs text-text-secondary">
                      Parents notifiés
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name={transfer?.documentsReady ? "CheckCircle" : "Clock"} 
                      size={16} 
                      className={transfer?.documentsReady ? "text-success" : "text-warning"}
                    />
                    <span className="font-caption font-caption-normal text-xs text-text-secondary">
                      Documents prêts
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name={transfer?.status === 'confirmed' ? "CheckCircle" : "Clock"} 
                      size={16} 
                      className={transfer?.status === 'confirmed' ? "text-success" : "text-warning"}
                    />
                    <span className="font-caption font-caption-normal text-xs text-text-secondary">
                      Transfert confirmé
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {pendingTransfers?.length === 0 && (
          <div className="p-8 text-center">
            <Icon name="ArrowRightLeft" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="font-body font-body-normal text-text-secondary">
              Aucun transfert en cours
            </p>
          </div>
        )}
      </div>
      {/* Transfer Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="ArrowRightLeft" size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-lg text-text-primary">
                {pendingTransfers?.length}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Transferts en cours
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
                {pendingTransfers?.filter(t => t?.status === 'confirmed')?.length}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Confirmés
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={20} className="text-warning" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-lg text-text-primary">
                {pendingTransfers?.filter(t => t?.status === 'pending')?.length}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                En attente
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferWorkflow;