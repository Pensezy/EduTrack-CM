import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const AlternativeAuth = ({ onQRScan, onBiometric, className = '' }) => {
  const [isQRActive, setIsQRActive] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  React.useEffect(() => {
    // Check if biometric authentication is supported
    if (window.PublicKeyCredential && window.navigator?.credentials) {
      setIsBiometricSupported(true);
    }
  }, []);

  const handleQRScan = async () => {
    setIsQRActive(true);
    try {
      // Mock QR code scanning
      await new Promise(resolve => setTimeout(resolve, 2000));
      onQRScan();
    } catch (error) {
      console.error('QR scan failed:', error);
    } finally {
      setIsQRActive(false);
    }
  };

  const handleBiometric = async () => {
    try {
      if (isBiometricSupported) {
        // Mock biometric authentication
        const credential = await navigator.credentials?.create({
          publicKey: {
            challenge: new Uint8Array(32),
            rp: { name: "EduTrack CM" },
            user: {
              id: new Uint8Array(16),
              name: "user@edutrack.fr",
              displayName: "Utilisateur"
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              userVerification: "required"
            }
          }
        });
        
        if (credential) {
          onBiometric();
        }
      }
    } catch (error) {
      console.error('Biometric authentication failed:', error);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-2">
          Autres méthodes de connexion
        </h3>
        <p className="font-body font-body-normal text-sm text-text-secondary">
          Choisissez une méthode alternative pour vous connecter
        </p>
      </div>

      <div className="space-y-4">
        {/* QR Code Authentication */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="QrCode" size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-body font-body-semibold text-sm text-card-foreground">
                Scanner le code QR
              </h4>
              <p className="font-body font-body-normal text-xs text-muted-foreground">
                Utilisez votre appareil mobile pour scanner
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleQRScan}
              loading={isQRActive}
              iconName="Camera"
              iconPosition="left"
            >
              {isQRActive ? 'Scan en cours...' : 'Scanner'}
            </Button>
          </div>
        </div>

        {/* Biometric Authentication */}
        {isBiometricSupported && (
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Icon name="Fingerprint" size={24} className="text-accent" />
              </div>
              <div className="flex-1">
                <h4 className="font-body font-body-semibold text-sm text-card-foreground">
                  Authentification biométrique
                </h4>
                <p className="font-body font-body-normal text-xs text-muted-foreground">
                  Utilisez votre empreinte ou reconnaissance faciale
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBiometric}
                iconName="Shield"
                iconPosition="left"
              >
                Authentifier
              </Button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="HelpCircle" size={16} className="text-primary mt-1" />
            <div>
              <h5 className="font-body font-body-semibold text-xs text-card-foreground">
                Besoin d'aide ?
              </h5>
              <p className="font-body font-body-normal text-xs text-muted-foreground mt-1">
                Contactez l'administration de votre école pour obtenir vos identifiants de connexion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlternativeAuth;