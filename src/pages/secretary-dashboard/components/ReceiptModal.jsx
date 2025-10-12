import React, { useState, useRef, useEffect } from 'react';
import { X, Printer, Download, Eye } from 'lucide-react';
import Button from '../../../components/ui/Button';
import paymentService from '../../../services/paymentService';

export const ReceiptModal = ({ isOpen, onClose, paymentId, studentData }) => {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const printRef = useRef();

  useEffect(() => {
    if (isOpen && paymentId) {
      loadReceiptData();
    }
  }, [isOpen, paymentId]);

  const loadReceiptData = async () => {
    setLoading(true);
    setError('');
    try {
      const receiptData = await paymentService.generateReceipt(paymentId);
      setReceipt(receiptData);
    } catch (err) {
      setError('Erreur lors du chargement du reçu');
      console.error('Erreur chargement reçu:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  const handleDownload = () => {
    if (receipt) {
      // Créer un blob avec le contenu HTML du reçu
      const htmlContent = printRef.current.innerHTML;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `recu_${receipt.receiptNumber}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Reçu de Paiement
          </h2>
          <div className="flex items-center gap-2">
            {receipt && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </Button>
              </>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Chargement du reçu...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {receipt && (
            <div ref={printRef} className="bg-white">
              {/* Receipt Header */}
              <div className="text-center mb-8 border-b pb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  ÉTABLISSEMENT SCOLAIRE
                </h1>
                <p className="text-gray-600">EduTrack-CM - Système de Gestion Scolaire</p>
                <p className="text-sm text-gray-500 mt-2">
                  Adresse de l'établissement • Téléphone • Email
                </p>
              </div>

              {/* Receipt Info */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Informations du Reçu</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">N° Reçu:</span>
                      <span className="font-medium">{receipt.receiptNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(receipt.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reçu par:</span>
                      <span className="font-medium">{receipt.receivedBy}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Informations Élève</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nom:</span>
                      <span className="font-medium">{receipt.student.firstName} {receipt.student.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Matricule:</span>
                      <span className="font-medium">{receipt.student.studentId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Classe:</span>
                      <span className="font-medium">{receipt.student.class}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Parent:</span>
                      <span className="font-medium">{receipt.student.parentName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Détails du Paiement</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600">Type de frais:</span>
                      <p className="font-medium">{receipt.payment.feeType}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Période:</span>
                      <p className="font-medium">{receipt.payment.period}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Mode de paiement:</span>
                      <p className="font-medium">{receipt.payment.paymentMethod}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Référence:</span>
                      <p className="font-medium">{receipt.payment.reference || 'N/A'}</p>
                    </div>
                  </div>

                  {receipt.payment.description && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-600">Description:</span>
                      <p className="font-medium">{receipt.payment.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Détail des Montants</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Description
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                          Montant
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm">Montant dû</td>
                        <td className="px-4 py-3 text-sm text-right">
                          {formatCurrency(receipt.payment.totalAmount)}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">Montant payé</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                          {formatCurrency(receipt.payment.amountPaid)}
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">Solde restant</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          {formatCurrency(receipt.payment.remainingBalance)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Status */}
              <div className="mb-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-green-800">Statut du Paiement</h4>
                      <p className="text-sm text-green-600 mt-1">
                        {receipt.payment.status === 'completed' 
                          ? 'Paiement complet' 
                          : 'Paiement partiel'}
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(receipt.payment.amountPaid)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-6 mt-8">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Signature de l'élève/Parent:</p>
                    <div className="border-b border-gray-300 h-12"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Signature du Secrétaire:</p>
                    <div className="border-b border-gray-300 h-12"></div>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500">
                    Ce reçu est généré automatiquement par EduTrack-CM • 
                    Conservez ce reçu comme preuve de paiement
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Généré le {formatDate(new Date().toISOString())}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;