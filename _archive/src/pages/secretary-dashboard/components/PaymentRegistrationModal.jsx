import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import paymentService from '../../../services/paymentService';

const PaymentRegistrationModal = ({ isOpen, onClose, onPaymentRecorded, selectedPayment = null }) => {
  const [step, setStep] = useState(1); // 1: Sélection étudiant, 2: Détails paiement
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentData, setPaymentData] = useState({
    feeType: '',
    period: '',
    amount: '',
    totalAmount: '',
    paymentMethod: '',
    reference: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const paymentMethods = [
    { value: 'cash', label: 'Espèces' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'bank_transfer', label: 'Virement bancaire' },
    { value: 'check', label: 'Chèque' },
    { value: 'card', label: 'Carte bancaire' }
  ];

  const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const periodOptions = [
    { value: currentMonth, label: currentMonth },
    { value: 'Octobre 2024', label: 'Octobre 2024' },
    { value: 'Septembre 2024', label: 'Septembre 2024' },
    { value: 'Août 2024', label: 'Août 2024' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      if (selectedPayment) {
        // Mode modification d'un paiement existant
        initializeWithExistingPayment();
      }
    }
  }, [isOpen, selectedPayment]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [studentsResult, feeTypesResult] = await Promise.all([
        paymentService.searchStudents(searchTerm),
        paymentService.getFeeTypes()
      ]);
      setStudents(studentsResult);
      setFeeTypes(feeTypesResult);
    } catch (err) {
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeWithExistingPayment = () => {
    if (selectedPayment) {
      setSelectedStudent({
        id: selectedPayment.studentId,
        name: selectedPayment.studentName,
        class: selectedPayment.class,
        parentName: selectedPayment.parentName,
        parentPhone: selectedPayment.parentPhone
      });
      setPaymentData({
        feeType: selectedPayment.feeType,
        period: selectedPayment.period,
        amount: (selectedPayment.amount - selectedPayment.paidAmount).toString(),
        totalAmount: selectedPayment.amount.toString(),
        paymentMethod: '',
        reference: '',
        description: selectedPayment.description,
        dueDate: selectedPayment.dueDate.split('/').reverse().join('-')
      });
      setStep(2);
    }
  };

  useEffect(() => {
    if (step === 1 && searchTerm !== '') {
      const timer = setTimeout(() => {
        loadStudents();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const studentsResult = await paymentService.searchStudents(searchTerm);
      setStudents(studentsResult);
    } catch (err) {
      setError('Erreur lors de la recherche');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setStep(2);
  };

  const handlePaymentDataChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-remplir le montant total si un type de frais est sélectionné
    if (field === 'feeType' && value) {
      const selectedFeeType = feeTypes.find(f => f.id === value);
      if (selectedFeeType && !paymentData.totalAmount) {
        setPaymentData(prev => ({
          ...prev,
          totalAmount: selectedFeeType.amount.toString(),
          amount: selectedFeeType.amount.toString(),
          description: selectedFeeType.name
        }));
      }
    }
  };

  const validatePaymentData = () => {
    if (!selectedStudent) {
      setError('Veuillez sélectionner un étudiant');
      return false;
    }

    if (!paymentData.feeType) {
      setError('Veuillez sélectionner le type de frais');
      return false;
    }

    if (!paymentData.period) {
      setError('Veuillez sélectionner la période');
      return false;
    }

    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      setError('Veuillez saisir un montant valide');
      return false;
    }

    if (!paymentData.paymentMethod) {
      setError('Veuillez sélectionner le mode de paiement');
      return false;
    }

    if (parseFloat(paymentData.amount) > parseFloat(paymentData.totalAmount || paymentData.amount)) {
      setError('Le montant payé ne peut pas dépasser le montant total');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePaymentData()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const paymentSubmissionData = {
        studentId: selectedStudent.id,
        feeType: paymentData.feeType,
        period: paymentData.period,
        amount: parseFloat(paymentData.amount),
        totalAmount: parseFloat(paymentData.totalAmount || paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        reference: paymentData.reference.trim(),
        description: paymentData.description.trim(),
        dueDate: new Date(paymentData.dueDate).toLocaleDateString('fr-FR')
      };

      const result = await paymentService.recordPayment(paymentSubmissionData);
      
      if (onPaymentRecorded) {
        onPaymentRecorded(result);
      }
      
      handleClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement du paiement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSearchTerm('');
    setSelectedStudent(null);
    setPaymentData({
      feeType: '',
      period: '',
      amount: '',
      totalAmount: '',
      paymentMethod: '',
      reference: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0]
    });
    setError('');
    setIsLoading(false);
    setIsSubmitting(false);
    onClose();
  };

  const handleBackToSearch = () => {
    setStep(1);
    setSelectedStudent(null);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
              {selectedPayment ? 'Compléter le Paiement' : 
               step === 1 ? 'Sélectionner un Étudiant' : 'Enregistrer un Paiement'}
            </h3>
            <p className="font-body font-body-normal text-sm text-text-secondary mt-1">
              {selectedPayment ? `Paiement pour ${selectedPayment.studentName}` :
               step === 1 ? 'Choisissez l\'étudiant pour lequel enregistrer un paiement'
               : 'Saisissez les détails du paiement reçu'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-error/10 border border-error/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon name="AlertCircle" size={16} className="text-error" />
              <p className="font-body font-body-normal text-sm text-error">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Recherche et sélection d'étudiant */}
        {step === 1 && !selectedPayment && (
          <div className="p-6">
            <div className="mb-6">
              <Input
                type="search"
                placeholder="Rechercher par nom, ID ou classe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                iconName="Search"
                iconPosition="left"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-body font-body-normal text-sm text-text-secondary">
                      Recherche en cours...
                    </span>
                  </div>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <p className="font-body font-body-normal text-text-secondary">
                    {searchTerm 
                      ? 'Aucun étudiant trouvé avec ces critères'
                      : 'Saisissez un nom pour rechercher un étudiant'
                    }
                  </p>
                </div>
              ) : (
                students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => handleStudentSelect(student)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon name="User" size={20} className="text-primary" />
                      </div>
                      <div>
                        <h4 className="font-body font-body-medium text-sm text-text-primary">
                          {student.name}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="font-caption font-caption-normal text-xs text-text-secondary">
                            ID: {student.id}
                          </p>
                          <p className="font-caption font-caption-normal text-xs text-text-secondary">
                            Classe: {student.class}
                          </p>
                        </div>
                        <p className="font-caption font-caption-normal text-xs text-text-secondary">
                          Parent: {student.parentName}
                        </p>
                      </div>
                    </div>
                    <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 2: Détails du paiement */}
        {(step === 2 || selectedPayment) && selectedStudent && (
          <div className="p-6">
            {/* Informations de l'étudiant */}
            <div className="bg-muted/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="User" size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-heading font-heading-semibold text-sm text-text-primary">
                    {selectedStudent.name}
                  </h4>
                  <p className="font-body font-body-normal text-xs text-text-secondary">
                    {selectedStudent.id} • Classe {selectedStudent.class}
                  </p>
                </div>
              </div>
            </div>

            {/* Formulaire de paiement */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type de frais */}
                <div>
                  <label className="block font-body font-body-medium text-sm text-text-primary mb-2">
                    Type de frais *
                  </label>
                  <Select
                    options={feeTypes.map(fee => ({ value: fee.id, label: fee.name }))}
                    value={paymentData.feeType}
                    onChange={(value) => handlePaymentDataChange('feeType', value)}
                    placeholder="Sélectionnez le type de frais"
                    disabled={!!selectedPayment}
                  />
                </div>

                {/* Période */}
                <div>
                  <label className="block font-body font-body-medium text-sm text-text-primary mb-2">
                    Période *
                  </label>
                  <Select
                    options={periodOptions}
                    value={paymentData.period}
                    onChange={(value) => handlePaymentDataChange('period', value)}
                    placeholder="Sélectionnez la période"
                    disabled={!!selectedPayment}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Montant total */}
                <div>
                  <label className="block font-body font-body-medium text-sm text-text-primary mb-2">
                    Montant total (FCFA) *
                  </label>
                  <Input
                    type="number"
                    value={paymentData.totalAmount}
                    onChange={(e) => handlePaymentDataChange('totalAmount', e.target.value)}
                    placeholder="0"
                    disabled={!!selectedPayment}
                  />
                </div>

                {/* Montant payé */}
                <div>
                  <label className="block font-body font-body-medium text-sm text-text-primary mb-2">
                    Montant payé (FCFA) *
                  </label>
                  <Input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => handlePaymentDataChange('amount', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mode de paiement */}
                <div>
                  <label className="block font-body font-body-medium text-sm text-text-primary mb-2">
                    Mode de paiement *
                  </label>
                  <Select
                    options={paymentMethods}
                    value={paymentData.paymentMethod}
                    onChange={(value) => handlePaymentDataChange('paymentMethod', value)}
                    placeholder="Sélectionnez le mode"
                  />
                </div>

                {/* Référence */}
                <div>
                  <label className="block font-body font-body-medium text-sm text-text-primary mb-2">
                    Référence (optionnel)
                  </label>
                  <Input
                    value={paymentData.reference}
                    onChange={(e) => handlePaymentDataChange('reference', e.target.value)}
                    placeholder="Numéro de transaction, chèque..."
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-body font-body-medium text-sm text-text-primary mb-2">
                  Description
                </label>
                <Input
                  value={paymentData.description}
                  onChange={(e) => handlePaymentDataChange('description', e.target.value)}
                  placeholder="Description du paiement"
                />
              </div>

              {/* Résumé du paiement */}
              {paymentData.amount && paymentData.totalAmount && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h5 className="font-heading font-heading-semibold text-sm text-primary mb-2">
                    Résumé du paiement
                  </h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-text-secondary">Montant payé:</p>
                      <p className="font-semibold text-text-primary">
                        {parseInt(paymentData.amount).toLocaleString()} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Solde restant:</p>
                      <p className="font-semibold text-text-primary">
                        {Math.max(0, parseInt(paymentData.totalAmount || paymentData.amount) - parseInt(paymentData.amount)).toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border">
          {step === 1 && !selectedPayment ? (
            <Button variant="outline" onClick={handleClose}>
              Annuler
            </Button>
          ) : (
            <>
              {!selectedPayment && (
                <Button variant="outline" onClick={handleBackToSearch}>
                  Retour
                </Button>
              )}
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button 
                variant="default" 
                onClick={handleSubmit}
                disabled={isSubmitting}
                iconName={isSubmitting ? undefined : "DollarSign"}
                iconPosition="left"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Enregistrement...</span>
                  </div>
                ) : (
                  'Enregistrer le Paiement'
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentRegistrationModal;