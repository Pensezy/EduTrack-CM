import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const TransferWorkflowSection = ({ student }) => {
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [transferData, setTransferData] = useState({
    receivingSchool: '',
    transferReason: '',
    effectiveDate: '',
    parentConsent: false,
    documentsComplete: false
  });

  const schoolOptions = [
    { value: 'lycee-voltaire', label: 'Lycée Voltaire - Paris 11ème' },
    { value: 'college-pasteur', label: 'Collège Pasteur - Neuilly-sur-Seine' },
    { value: 'lycee-henri-iv', label: 'Lycée Henri IV - Paris 5ème' },
    { value: 'college-marie-curie', label: 'Collège Marie Curie - Sceaux' },
    { value: 'autre', label: 'Autre établissement' }
  ];

  const transferReasons = [
    { value: 'demenagement', label: 'Déménagement' },
    { value: 'orientation', label: 'Réorientation scolaire' },
    { value: 'familial', label: 'Raisons familiales' },
    { value: 'medical', label: 'Raisons médicales' },
    { value: 'disciplinaire', label: 'Raisons disciplinaires' },
    { value: 'autre', label: 'Autre' }
  ];

  const handleGenerateQR = async () => {
    setIsGeneratingQR(true);
    // Simulate QR generation and SMS sending
    setTimeout(() => {
      setQrGenerated(true);
      setIsGeneratingQR(false);
      // Simulate SMS notification
      console.log('SMS envoyé aux parents et à l\'école de destination');
    }, 2000);
  };

  const handleInputChange = (field, value) => {
    setTransferData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const transferHistory = [
    {
      id: 1,
      date: '15/09/2023',
      fromSchool: 'École Primaire Saint-Exupéry',
      toSchool: 'Collège Jean Moulin (Actuel)',
      reason: 'Passage en 6ème',
      status: 'Terminé',
      qrCode: 'QR-2023-001'
    }
  ];

  const isFormValid = transferData?.receivingSchool && 
                     transferData?.transferReason && 
                     transferData?.effectiveDate &&
                     transferData?.parentConsent &&
                     transferData?.documentsComplete;

  return (
    <div className="bg-card rounded-lg shadow-card p-6 mb-6">
      <h2 className="font-heading font-heading-semibold text-xl text-card-foreground flex items-center mb-6">
        <Icon name="ArrowRightLeft" size={20} className="mr-2 text-primary" />
        Gestion des transferts
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transfer Form */}
        <div className="space-y-4">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground border-b border-border pb-2">
            Nouveau transfert
          </h3>

          <Select
            label="École de destination"
            options={schoolOptions}
            value={transferData?.receivingSchool}
            onChange={(value) => handleInputChange('receivingSchool', value)}
            placeholder="Sélectionner l'école"
            required
          />

          <Select
            label="Motif du transfert"
            options={transferReasons}
            value={transferData?.transferReason}
            onChange={(value) => handleInputChange('transferReason', value)}
            placeholder="Sélectionner le motif"
            required
          />

          <Input
            label="Date d'effet"
            type="date"
            value={transferData?.effectiveDate}
            onChange={(e) => handleInputChange('effectiveDate', e?.target?.value)}
            required
          />

          {/* Checkboxes for consent and documents */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="parentConsent"
                checked={transferData?.parentConsent}
                onChange={(e) => handleInputChange('parentConsent', e?.target?.checked)}
                className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-primary focus:ring-2"
              />
              <label htmlFor="parentConsent" className="font-body font-body-normal text-sm text-card-foreground">
                Consentement parental obtenu
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="documentsComplete"
                checked={transferData?.documentsComplete}
                onChange={(e) => handleInputChange('documentsComplete', e?.target?.checked)}
                className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-primary focus:ring-2"
              />
              <label htmlFor="documentsComplete" className="font-body font-body-normal text-sm text-card-foreground">
                Dossier scolaire complet
              </label>
            </div>
          </div>

          <Button
            variant="default"
            onClick={handleGenerateQR}
            loading={isGeneratingQR}
            disabled={!isFormValid}
            iconName="QrCode"
            iconPosition="left"
            fullWidth
          >
            {isGeneratingQR ? 'Génération en cours...' : 'Générer le QR de transfert'}
          </Button>
        </div>

        {/* QR Code Display */}
        <div className="space-y-4">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground border-b border-border pb-2">
            Code QR de transfert
          </h3>

          {qrGenerated ? (
            <div className="bg-muted rounded-lg p-6 text-center">
              <div className="w-48 h-48 bg-white border-2 border-border rounded-lg mx-auto mb-4 flex items-center justify-center">
                <div className="w-40 h-40 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Icon name="QrCode" size={80} color="white" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-body font-body-semibold text-sm text-card-foreground">
                  Code QR généré avec succès
                </p>
                <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                  ID: QR-{new Date()?.getFullYear()}-{String(Math.floor(Math.random() * 1000))?.padStart(3, '0')}
                </p>
                <div className="flex items-center justify-center space-x-2 text-xs text-success">
                  <Icon name="CheckCircle" size={14} />
                  <span>SMS envoyé aux parents et à l'école</span>
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button variant="outline" size="sm" iconName="Download">
                  Télécharger
                </Button>
                <Button variant="outline" size="sm" iconName="Printer">
                  Imprimer
                </Button>
                <Button variant="outline" size="sm" iconName="Share">
                  Partager
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-muted rounded-lg p-6 text-center">
              <Icon name="QrCode" size={64} className="text-muted-foreground mx-auto mb-4" />
              <p className="font-body font-body-normal text-sm text-muted-foreground">
                Remplissez le formulaire pour générer le code QR de transfert
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Transfer History */}
      <div className="mt-8">
        <h3 className="font-heading font-heading-semibold text-lg text-card-foreground border-b border-border pb-2 mb-4">
          Historique des transferts
        </h3>

        <div className="space-y-4">
          {transferHistory?.map((transfer) => (
            <div key={transfer?.id} className="bg-muted rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Icon name="ArrowRight" size={16} className="text-primary" />
                  <span className="font-body font-body-semibold text-sm text-card-foreground">
                    {transfer?.date}
                  </span>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-caption font-caption-normal bg-success/10 text-success">
                  <Icon name="CheckCircle" size={12} className="mr-1" />
                  {transfer?.status}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">De: </span>
                  <span className="font-body font-body-semibold text-card-foreground">
                    {transfer?.fromSchool}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Vers: </span>
                  <span className="font-body font-body-semibold text-card-foreground">
                    {transfer?.toSchool}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Motif: </span>
                  <span className="font-body font-body-normal text-card-foreground">
                    {transfer?.reason}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Code QR: </span>
                  <span className="font-mono text-primary">
                    {transfer?.qrCode}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransferWorkflowSection;