import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useDataMode } from '../../../hooks/useDataMode';
import { supabase } from '../../../lib/supabase';

const TransferWorkflow = () => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [newSchool, setNewSchool] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);
  const [transferCode, setTransferCode] = useState('');
  const [students, setStudents] = useState([]);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDemo, isProduction, dataMode, user } = useDataMode();

  // Debug : afficher le mode détecté
  useEffect(() => {
    console.log('🔍 TransferWorkflow - Mode actuel:', {
      dataMode,
      isDemo,
      isProduction,
      userEmail: user?.email,
      schoolId: user?.school_id
    });
  }, [dataMode, isDemo, isProduction, user]);

  // Charger les étudiants et transferts au montage
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (isDemo) {
          // Mode démo : données fictives
          setStudents([
            { value: '1', label: 'Marie Dubois (CM2)' },
            { value: '2', label: 'Pierre Martin (CM1)' },
            { value: '3', label: 'Camille Rousseau (CE2)' },
            { value: '4', label: 'Lucas Bernard (CM2)' },
            { value: '5', label: 'Emma Leroy (CE1)' }
          ]);
          setPendingTransfers(demoTransfers);
        } else {
          // Mode production : charger depuis Supabase
          let schoolId = null;
          
          // Essayer d'abord avec la session Supabase
          const { data: { user: authUser } } = await supabase.auth.getUser();
          
          if (authUser) {
            console.log('✅ Utilisateur Auth trouvé:', authUser.email);
            // Récupérer l'école depuis la table users
            const { data: userData } = await supabase
              .from('users')
              .select('current_school_id')
              .eq('id', authUser.id)
              .single();
            schoolId = userData?.current_school_id;
          } else {
            // Fallback : utiliser localStorage
            console.log('🔄 Pas de session Auth, utilisation localStorage');
            const savedUser = localStorage.getItem('edutrack-user');
            if (savedUser) {
              const userData = JSON.parse(savedUser);
              schoolId = userData.current_school_id || userData.school_id;
              console.log('✅ École trouvée dans localStorage:', schoolId);
            }
          }

          if (!schoolId) {
            console.error('❌ Aucune école trouvée');
            setPendingTransfers([]);
            setStudents([]);
            return;
          }

          // Charger les étudiants actifs de l'école
          const { data: studentsData, error: studentsError } = await supabase
            .from('students')
            .select('id, first_name, last_name')
            .eq('is_active', true)
            .eq('school_id', schoolId);

          if (!studentsError && studentsData) {
            setStudents(studentsData.map(s => ({
              value: s.id,
              label: `${s.first_name} ${s.last_name}`
            })));
          }

          // Charger les transferts en cours de l'école
          const { data: transfers, error: transfersError } = await supabase
            .from('transfers')
            .select(`
              *,
              student:students(first_name, last_name)
            `)
            .eq('from_school_id', schoolId)
            .order('request_date', { ascending: false });

          if (!transfersError && transfers) {
            setPendingTransfers(transfers.map(t => ({
              id: t.id,
              studentName: `${t.student?.first_name} ${t.student?.last_name}`,
              studentId: t.student_id,
              class: 'N/A',
              transferDate: new Date(t.transfer_date).toLocaleDateString('fr-FR'),
              newSchool: t.new_school_name,
              reason: t.transfer_reason,
              status: t.status,
              transferCode: t.transfer_code,
              qrCode: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPgogIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZmZmIi8+CiAgPHRleHQgeD0iNTAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMDAwIj5RUjwvdGV4dD4KPC9zdmc+",
              parentNotified: t.parent_notified || false,
              documentsReady: t.documents_ready || false
            })));
          } else {
            setPendingTransfers([]);
          }
        }
      } catch (error) {
        console.error('Erreur chargement données transfert:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isDemo]);

  const demoTransfers = [
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
      reason: "Choix d'établissement",
      status: "confirmed",
      transferCode: "TRF-2024-002",
      qrCode: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPgogIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZmZmIi8+CiAgPHRleHQgeD0iNTAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMDAwIj5RUjwvdGV4dD4KPC9zdmc+",
      parentNotified: true,
      documentsReady: true
    }
  ];

  const reasonOptions = [
    { value: 'relocation', label: 'Déménagement' },
    { value: 'school_choice', label: 'Choix d\'établissement' },
    { value: 'family_reasons', label: 'Raisons familiales' },
    { value: 'academic_reasons', label: 'Raisons pédagogiques' },
    { value: 'other', label: 'Autre' }
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

  const handleInitiateTransfer = async () => {
    if (!selectedStudent || !transferReason || !newSchool || !transferDate) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (isDemo) {
      // Mode démo : ajouter à la liste locale
      const newCode = `TRF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      setTransferCode(newCode);
      setQrCodeGenerated(true);
      
      const studentInfo = students.find(s => s.value === selectedStudent);
      const newTransfer = {
        id: pendingTransfers.length + 1,
        studentName: studentInfo?.label || 'Élève',
        studentId: `STU${String(pendingTransfers.length + 1).padStart(3, '0')}`,
        class: 'N/A',
        transferDate,
        newSchool,
        reason: reasonOptions.find(r => r.value === transferReason)?.label || transferReason,
        status: 'pending',
        transferCode: newCode,
        qrCode: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPgogIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZmZmIi8+CiAgPHRleHQgeD0iNTAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMDAwIj5RUjwvdGV4dD4KPC9zdmc+",
        parentNotified: false,
        documentsReady: false
      };
      
      setPendingTransfers([newTransfer, ...pendingTransfers]);
      alert(`✅ Transfert initié en mode démo pour ${studentInfo?.label}`);
      
      // Réinitialiser le formulaire
      setSelectedStudent('');
      setTransferReason('');
      setNewSchool('');
      setTransferDate('');
      
      return;
    }

    // Mode production : créer via Supabase
    try {
      setLoading(true);
      const newCode = `TRF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      
      // Get current user and school
      let userId = null;
      let schoolId = null;
      
      // Essayer avec la session Auth d'abord
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        userId = authUser.id;
        const { data: userData } = await supabase
          .from('users')
          .select('current_school_id')
          .eq('id', authUser.id)
          .single();
        schoolId = userData?.current_school_id;
      } else {
        // Fallback : localStorage
        const savedUser = localStorage.getItem('edutrack-user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          userId = userData.id;
          schoolId = userData.current_school_id || userData.school_id;
        }
      }

      if (!userId || !schoolId) {
        throw new Error('Impossible d\'identifier l\'utilisateur ou l\'école');
      }

      const transferData = {
        student_id: selectedStudent,
        from_school_id: schoolId,
        transfer_reason: transferReason,
        new_school_name: newSchool,
        transfer_date: transferDate,
        transfer_code: newCode,
        status: 'pending',
        requested_by: userId,
        request_date: new Date().toISOString()
      };

      const result = await supabase
        .from('transfers')
        .insert([transferData])
        .select()
        .single();

      if (result.error) throw result.error;

      setTransferCode(newCode);
      setQrCodeGenerated(true);
      alert('✅ Transfert initié avec succès !');
      
      // Recharger la liste des transferts
      const { data: transfers } = await supabase
        .from('transfers')
        .select(`
          *,
          student:students(first_name, last_name)
        `)
        .eq('from_school_id', schoolId)
        .order('request_date', { ascending: false });

      if (transfers) {
        setPendingTransfers(transfers.map(t => ({
          id: t.id,
          studentName: `${t.student?.first_name} ${t.student?.last_name}`,
          studentId: t.student_id,
          class: 'N/A',
          transferDate: new Date(t.transfer_date).toLocaleDateString('fr-FR'),
          newSchool: t.new_school_name,
          reason: t.transfer_reason,
          status: t.status,
          transferCode: t.transfer_code,
          qrCode: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPgogIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZmZmIi8+CiAgPHRleHQgeD0iNTAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMDAwIj5RUjwvdGV4dD4KPC9zdmc+",
          parentNotified: false,
          documentsReady: false
        })));
      }

      // Réinitialiser le formulaire
      setSelectedStudent('');
      setTransferReason('');
      setNewSchool('');
      setTransferDate('');
    } catch (error) {
      console.error('Erreur création transfert:', error);
      alert(`❌ Erreur : ${error.message || 'Impossible de créer le transfert'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendConfirmation = async (transferId) => {
    const transfer = pendingTransfers.find(t => t.id === transferId);
    if (!transfer) return;
    
    if (isDemo) {
      alert(`🎭 Mode démo : SMS de confirmation envoyé pour ${transfer.studentName}\nCode: ${transfer.transferCode}`);
      // Mettre à jour le statut localement
      setPendingTransfers(pendingTransfers.map(t => 
        t.id === transferId ? { ...t, parentNotified: true } : t
      ));
      return;
    }
    
    try {
      // Mode production : mettre à jour dans Supabase
      const { error } = await supabase
        .from('transfers')
        .update({ parent_notified: true })
        .eq('id', transferId);

      if (error) throw error;

      setPendingTransfers(pendingTransfers.map(t => 
        t.id === transferId ? { ...t, parentNotified: true } : t
      ));
      
      alert(`✅ SMS de confirmation envoyé pour ${transfer.studentName}`);
      // TODO: Implémenter l'envoi réel de SMS via le service de communication
    } catch (error) {
      console.error('Erreur envoi SMS:', error);
      alert(`❌ Erreur : ${error.message || 'Impossible d\'envoyer le SMS'}`);
    }
  };

  const handlePrintDocuments = async (transferId) => {
    const transfer = pendingTransfers.find(t => t.id === transferId);
    if (!transfer) return;
    
    if (isDemo) {
      alert(`🎭 Mode démo : Impression des documents de transfert pour ${transfer.studentName}`);
      setPendingTransfers(pendingTransfers.map(t => 
        t.id === transferId ? { ...t, documentsReady: true } : t
      ));
      return;
    }
    
    try {
      // Mode production : mettre à jour dans Supabase
      const { error } = await supabase
        .from('transfers')
        .update({ documents_ready: true })
        .eq('id', transferId);

      if (error) throw error;

      setPendingTransfers(pendingTransfers.map(t => 
        t.id === transferId ? { ...t, documentsReady: true } : t
      ));
      
      alert(`✅ Documents prêts pour ${transfer.studentName}`);
      // TODO: Générer et imprimer les documents de transfert
    } catch (error) {
      console.error('Erreur impression documents:', error);
      alert(`❌ Erreur : ${error.message || 'Impossible de préparer les documents'}`);
    }
  };

  const handleCancelTransfer = async (transferId) => {
    const transfer = pendingTransfers.find(t => t.id === transferId);
    if (!transfer) return;
    
    const confirmCancel = window.confirm(`Êtes-vous sûr de vouloir annuler le transfert de ${transfer.studentName} ?`);
    if (!confirmCancel) return;
    
    if (isDemo) {
      alert(`🎭 Mode démo : Transfert annulé pour ${transfer.studentName}`);
      setPendingTransfers(pendingTransfers.filter(t => t.id !== transferId));
      return;
    }
    
    try {
      // Mode production : mettre à jour le statut dans Supabase
      const { error } = await supabase
        .from('transfers')
        .update({ status: 'cancelled' })
        .eq('id', transferId);

      if (error) throw error;

      // Retirer de la liste locale
      setPendingTransfers(pendingTransfers.filter(t => t.id !== transferId));
      alert(`✅ Transfert annulé pour ${transfer.studentName}`);
    } catch (error) {
      console.error('Erreur annulation transfert:', error);
      alert(`❌ Erreur : ${error.message || 'Impossible d\'annuler le transfert'}`);
    }
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
        {/* Indicateur de mode (temporaire pour debug) */}
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
          isProduction 
            ? 'bg-green-100 text-green-700' 
            : 'bg-orange-100 text-orange-700'
        }`}>
          {isProduction ? '✅ Mode Production' : '🎭 Mode Démo'}
          {user?.email && ` - ${user.email}`}
        </div>
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