import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const TasksTab = ({ isDemo = false }) => {
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showUrgentCallsModal, setShowUrgentCallsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    dueTime: '',
    category: 'general',
    contact: '',
    studentRelated: ''
  });

  const priorityOptions = [
    { value: '', label: 'Toutes les priorités' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'Important' },
    { value: 'medium', label: 'Normal' },
    { value: 'low', label: 'Faible' }
  ];

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'pending', label: 'À faire' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'completed', label: 'Terminé' },
    { value: 'cancelled', label: 'Annulé' }
  ];

  // Données démo
  const demoTasks = [
    {
      id: 1,
      title: "Appeler Mme Mbarga pour justificatif d'absence",
      description: "Junior Mbarga absent hier sans justification",
      priority: "urgent",
      status: "pending",
      dueDate: "2025-10-18",
      dueTime: "09:00",
      category: "appels",
      assignedTo: "Secrétariat",
      studentRelated: "Junior Mbarga - CM1",
      contact: "+237 6 89 01 23 45",
      estimatedDuration: "15 min"
    },
    {
      id: 2,
      title: "Préparer certificats de scolarité",
      description: "3 certificats à imprimer pour les familles Nkomo, Biya et Atangana",
      priority: "high",
      status: "pending",
      dueDate: "2025-10-18",
      dueTime: "14:00",
      category: "documents",
      assignedTo: "Secrétariat",
      studentRelated: "Amina Nkomo, Kevin Biya, Sarah Atangana",
      contact: "",
      estimatedDuration: "30 min"
    },
    {
      id: 3,
      title: "Relance paiement frais de cantine",
      description: "Envoyer rappel pour les familles avec paiements en retard",
      priority: "medium",
      status: "in_progress",
      dueDate: "2025-10-19",
      dueTime: "10:00",
      category: "paiements",
      assignedTo: "Secrétariat",
      studentRelated: "5 familles concernées",
      contact: "",
      estimatedDuration: "45 min"
    },
    {
      id: 4,
      title: "Mettre à jour planning rendez-vous",
      description: "Confirmer RDV parents pour la semaine prochaine",
      priority: "medium",
      status: "pending",
      dueDate: "2024-11-18",
      dueTime: "16:00",
      category: "planning",
      assignedTo: "Secrétariat",
      studentRelated: "",
      contact: "",
      estimatedDuration: "20 min"
    },
    {
      id: 5,
      title: "Vérifier dossiers d'inscription",
      description: "Contrôler les pièces manquantes pour 3 nouveaux élèves",
      priority: "high",
      status: "pending",
      dueDate: "2024-11-20",
      dueTime: "11:00",
      category: "inscriptions",
      assignedTo: "Secrétariat",
      studentRelated: "3 nouveaux élèves",
      contact: "",
      estimatedDuration: "1 heure"
    },
    {
      id: 6,
      title: "Impression bulletins 1er trimestre",
      description: "Préparer et imprimer tous les bulletins scolaires",
      priority: "low",
      status: "completed",
      dueDate: "2024-11-15",
      dueTime: "15:00",
      category: "documents",
      assignedTo: "Secrétariat",
      studentRelated: "Toutes les classes",
      contact: "",
      estimatedDuration: "2 heures"
    }
  ];

  const [tasks, setTasks] = useState([]);

  // Charger les tâches au montage
  useEffect(() => {
    loadTasks();
  }, [isDemo]);

  const loadTasks = async () => {
    if (isDemo) {
      // Mode démo : utiliser les données statiques
      setTasks(demoTasks);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const savedUser = localStorage.getItem('edutrack-user');
      const userData = savedUser ? JSON.parse(savedUser) : null;
      const schoolId = userData?.current_school_id;

      if (!schoolId) {
        console.warn('⚠️ Pas d\'école associée');
        setTasks([]);
        setLoading(false);
        return;
      }

      // Charger les tâches depuis Supabase
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('school_id', schoolId)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Erreur chargement tâches:', error);
        // Si la table n'existe pas encore, utiliser un tableau vide
        setTasks([]);
      } else {
        // Transformer les données Supabase au format attendu
        const formattedTasks = data.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          dueDate: task.due_date,
          dueTime: task.due_time,
          category: task.category,
          assignedTo: "Secrétariat",
          studentRelated: task.student_related || "",
          contact: task.contact || "",
          estimatedDuration: task.estimated_duration || ""
        }));
        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error('Exception chargement tâches:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      urgent: {
        label: 'Urgent',
        className: 'bg-red-100 text-red-600 border-red-200',
        icon: 'AlertTriangle'
      },
      high: {
        label: 'Important',
        className: 'bg-orange-100 text-orange-600 border-orange-200',
        icon: 'ArrowUp'
      },
      medium: {
        label: 'Normal',
        className: 'bg-blue-100 text-blue-600 border-blue-200',
        icon: 'Circle'
      },
      low: {
        label: 'Faible',
        className: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: 'ArrowDown'
      }
    };
    return configs?.[priority] || configs?.medium;
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: 'À faire',
        className: 'bg-yellow-100 text-yellow-600 border-yellow-200',
        icon: 'Clock'
      },
      in_progress: {
        label: 'En cours',
        className: 'bg-blue-100 text-blue-600 border-blue-200',
        icon: 'Play'
      },
      completed: {
        label: 'Terminé',
        className: 'bg-green-100 text-green-600 border-green-200',
        icon: 'CheckCircle'
      },
      cancelled: {
        label: 'Annulé',
        className: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: 'XCircle'
      }
    };
    return configs?.[status] || configs?.pending;
  };

  const getCategoryConfig = (category) => {
    const configs = {
      appels: {
        label: 'Appels',
        className: 'bg-purple-100 text-purple-600',
        icon: 'Phone'
      },
      documents: {
        label: 'Documents',
        className: 'bg-blue-100 text-blue-600',
        icon: 'FileText'
      },
      paiements: {
        label: 'Paiements',
        className: 'bg-green-100 text-green-600',
        icon: 'CreditCard'
      },
      planning: {
        label: 'Planning',
        className: 'bg-orange-100 text-orange-600',
        icon: 'Calendar'
      },
      inscriptions: {
        label: 'Inscriptions',
        className: 'bg-pink-100 text-pink-600',
        icon: 'UserPlus'
      }
    };
    return configs?.[category] || configs?.documents;
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === '' || task.priority === filterPriority;
    const matchesStatus = filterStatus === '' || task.status === filterStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleTaskStatusChange = async (taskId, newStatus) => {
    if (isDemo) {
      // Mode démo : modification locale uniquement
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      return;
    }

    // Mode production : mettre à jour dans Supabase
    try {
      const updateData = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Si le statut est "completed", enregistrer la date de complétion
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) {
        console.error('Erreur mise à jour statut:', error);
        alert('Erreur lors de la mise à jour du statut');
        return;
      }

      // Mettre à jour l'état local
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));

      console.log('✅ Statut de la tâche mis à jour');
    } catch (error) {
      console.error('Exception mise à jour statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleAddTask = () => {
    setShowAddTaskModal(true);
  };

  const handleSaveNewTask = async () => {
    if (!newTask.title || !newTask.description) {
      alert('Veuillez remplir le titre et la description');
      return;
    }

    if (isDemo) {
      // Mode démo : ajouter localement uniquement
      const task = {
        id: tasks.length + 1,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        status: 'pending',
        dueDate: newTask.dueDate,
        dueTime: newTask.dueTime,
        category: newTask.category,
        assignedTo: 'Secrétariat',
        studentRelated: newTask.studentRelated,
        contact: newTask.contact,
        estimatedDuration: '30 min'
      };
      setTasks([...tasks, task]);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        dueTime: '',
        category: 'general',
        contact: '',
        studentRelated: ''
      });
      setShowAddTaskModal(false);
      return;
    }

    // Mode production : sauvegarder dans Supabase
    try {
      const savedUser = localStorage.getItem('edutrack-user');
      const userData = savedUser ? JSON.parse(savedUser) : null;
      const schoolId = userData?.current_school_id;
      const userId = userData?.id;

      if (!schoolId) {
        alert('Erreur: Pas d\'école associée');
        return;
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          status: 'pending',
          due_date: newTask.dueDate || null,
          due_time: newTask.dueTime || null,
          category: newTask.category,
          school_id: schoolId,
          assigned_to_user_id: userId,
          student_related: newTask.studentRelated || null,
          contact: newTask.contact || null,
          estimated_duration: '30 min',
          created_by_user_id: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur création tâche:', error);
        alert('Erreur lors de la création de la tâche: ' + error.message);
        return;
      }

      // Recharger les tâches
      await loadTasks();

      // Réinitialiser le formulaire
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        dueTime: '',
        category: 'general',
        contact: '',
        studentRelated: ''
      });
      setShowAddTaskModal(false);
      
      console.log('✅ Tâche créée avec succès:', data);
    } catch (error) {
      console.error('Exception création tâche:', error);
      alert('Erreur lors de la création de la tâche');
    }
  };

  const handleShowUrgentCalls = () => {
    setShowUrgentCallsModal(true);
  };

  const handleEditTask = (taskId) => {
    console.log('Edit task:', taskId);
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }

    if (isDemo) {
      // Mode démo : suppression locale uniquement
      setTasks(tasks.filter(task => task.id !== taskId));
      return;
    }

    // Mode production : supprimer de Supabase
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Erreur suppression tâche:', error);
        alert('Erreur lors de la suppression de la tâche');
        return;
      }

      // Supprimer de l'état local
      setTasks(tasks.filter(task => task.id !== taskId));
      console.log('✅ Tâche supprimée avec succès');
    } catch (error) {
      console.error('Exception suppression tâche:', error);
      alert('Erreur lors de la suppression de la tâche');
    }
  };

  const handleCallContact = (contact) => {
    // Simulation d'un appel
    window.open(`tel:${contact}`, '_self');
  };

  const stats = {
    pending: tasks.filter(t => t.status === 'pending').length,
    urgent: tasks.filter(t => t.priority === 'urgent').length,
    today: tasks.filter(t => t.dueDate === new Date().toISOString().split('T')[0]).length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  // Indicateur de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Chargement des tâches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mode indicator */}
      {!isDemo && tasks.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-body font-body-semibold text-blue-900 mb-1">
                Mode Production - Aucune tâche
              </h4>
              <p className="text-sm text-blue-700">
                Vous êtes en mode production mais aucune tâche n'a encore été créée. 
                Cliquez sur "Nouvelle tâche" pour commencer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="font-heading font-heading-bold text-2xl text-text-primary">
            Tâches Quotidiennes {!isDemo && <span className="text-sm text-success">(Production)</span>}
          </h2>
          <p className="font-body font-body-normal text-text-secondary mt-1">
            Gestion des tâches administratives et suivi des actions prioritaires
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            iconName="Phone"
            iconPosition="left"
            onClick={handleShowUrgentCalls}
          >
            Appels urgents
          </Button>
          <Button
            variant="default"
            iconName="Plus"
            iconPosition="left"
            onClick={handleAddTask}
          >
            Nouvelle tâche
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={24} className="text-warning" />
            </div>
            <div>
              <p className="font-heading font-heading-bold text-2xl text-text-primary">
                {stats.pending}
              </p>
              <p className="font-caption font-caption-normal text-sm text-text-secondary">
                Tâches en attente
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center">
              <Icon name="AlertTriangle" size={24} className="text-error" />
            </div>
            <div>
              <p className="font-heading font-heading-bold text-2xl text-text-primary">
                {stats.urgent}
              </p>
              <p className="font-caption font-caption-normal text-sm text-text-secondary">
                Tâches urgentes
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Calendar" size={24} className="text-primary" />
            </div>
            <div>
              <p className="font-heading font-heading-bold text-2xl text-text-primary">
                {stats.today}
              </p>
              <p className="font-caption font-caption-normal text-sm text-text-secondary">
                Échues aujourd'hui
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle" size={24} className="text-success" />
            </div>
            <div>
              <p className="font-heading font-heading-bold text-2xl text-text-primary">
                {stats.completed}
              </p>
              <p className="font-caption font-caption-normal text-sm text-text-secondary">
                Terminées
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Rechercher une tâche..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            options={priorityOptions}
            value={filterPriority}
            onChange={setFilterPriority}
            placeholder="Filtrer par priorité"
          />
          <Select
            options={statusOptions}
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder="Filtrer par statut"
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
            Liste des tâches ({filteredTasks.length})
          </h3>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Icon name="Download" size={16} className="mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const priorityConfig = getPriorityConfig(task.priority);
            const statusConfig = getStatusConfig(task.status);
            const categoryConfig = getCategoryConfig(task.category);
            
            return (
              <div key={task.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-micro">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Checkbox
                        checked={task.status === 'completed'}
                        onChange={(checked) => handleTaskStatusChange(task.id, checked ? 'completed' : 'pending')}
                      />
                      <h4 className={`font-body font-body-semibold text-lg ${task.status === 'completed' ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                        {task.title}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryConfig.className}`}>
                        <Icon name={categoryConfig.icon} size={12} className="mr-1" />
                        {categoryConfig.label}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${priorityConfig.className}`}>
                        <Icon name={priorityConfig.icon} size={12} className="mr-1" />
                        {priorityConfig.label}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.className}`}>
                        <Icon name={statusConfig.icon} size={12} className="mr-1" />
                        {statusConfig.label}
                      </span>
                    </div>
                    
                    <p className="text-text-secondary mb-3">{task.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-text-secondary">
                          <Icon name="Calendar" size={16} />
                          <span>Échéance: {task.dueDate} à {task.dueTime}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-text-secondary">
                          <Icon name="Clock" size={16} />
                          <span>Durée estimée: {task.estimatedDuration}</span>
                        </div>
                        {task.contact && (
                          <div className="flex items-center space-x-2 text-text-secondary">
                            <Icon name="Phone" size={16} />
                            <span>{task.contact}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCallContact(task.contact)}
                              className="p-1 h-6 w-6"
                            >
                              <Icon name="ExternalLink" size={12} />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-text-secondary">
                          <Icon name="User" size={16} />
                          <span>Assigné à: {task.assignedTo}</span>
                        </div>
                        {task.studentRelated && (
                          <div className="flex items-center space-x-2 text-text-secondary">
                            <Icon name="Users" size={16} />
                            <span>Concerné: {task.studentRelated}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTask(task.id)}
                      title="Modifier"
                    >
                      <Icon name="Edit" size={16} />
                    </Button>
                    {task.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTaskStatusChange(task.id, 'in_progress')}
                        title="Commencer"
                      >
                        <Icon name="Play" size={16} />
                      </Button>
                    )}
                    {task.status === 'in_progress' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTaskStatusChange(task.id, 'completed')}
                        title="Terminer"
                      >
                        <Icon name="CheckCircle" size={16} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                      title="Supprimer"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <Icon name="CheckCircle" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-2">
              Aucune tâche trouvée
            </h3>
            <p className="font-body font-body-normal text-text-secondary">
              Aucune tâche ne correspond à vos critères de recherche.
            </p>
          </div>
        )}
      </div>

      {/* Modal Nouvelle Tâche */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
                Créer une nouvelle tâche
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddTaskModal(false)}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Titre de la tâche"
                    placeholder="Ex: Appeler les parents de..."
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="Description"
                    placeholder="Détails de la tâche à effectuer"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>
                <Select
                  label="Priorité"
                  options={[
                    { value: 'urgent', label: 'Urgent' },
                    { value: 'high', label: 'Important' },
                    { value: 'medium', label: 'Normal' },
                    { value: 'low', label: 'Faible' }
                  ]}
                  value={newTask.priority}
                  onChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}
                />
                <Select
                  label="Catégorie"
                  options={[
                    { value: 'appels', label: 'Appels' },
                    { value: 'documents', label: 'Documents' },
                    { value: 'paiements', label: 'Paiements' },
                    { value: 'inscriptions', label: 'Inscriptions' },
                    { value: 'planning', label: 'Planning' },
                    { value: 'general', label: 'Général' }
                  ]}
                  value={newTask.category}
                  onChange={(value) => setNewTask(prev => ({ ...prev, category: value }))}
                />
                <Input
                  label="Date d'échéance"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                />
                <Input
                  label="Heure d'échéance"
                  type="time"
                  value={newTask.dueTime}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueTime: e.target.value }))}
                />
                <Input
                  label="Élève concerné (optionnel)"
                  placeholder="Ex: Marie Dubois - CM2"
                  value={newTask.studentRelated}
                  onChange={(e) => setNewTask(prev => ({ ...prev, studentRelated: e.target.value }))}
                />
                <Input
                  label="Contact (optionnel)"
                  placeholder="+237 6XX XX XX XX"
                  value={newTask.contact}
                  onChange={(e) => setNewTask(prev => ({ ...prev, contact: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-border">
              <Button variant="default" onClick={handleSaveNewTask}>
                Créer la tâche
              </Button>
              <Button variant="outline" onClick={() => setShowAddTaskModal(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Appels Urgents */}
      {showUrgentCallsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
                Appels Urgents
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowUrgentCallsModal(false)}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {tasks
                  .filter(task => task.priority === 'urgent' && task.contact && task.status === 'pending')
                  .map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1">
                        <p className="font-body font-body-medium text-sm text-text-primary">
                          {task.title}
                        </p>
                        <p className="font-caption font-caption-normal text-xs text-text-secondary">
                          {task.contact}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        iconName="Phone"
                        onClick={() => handleCallContact(task.contact)}
                      >
                        Appeler
                      </Button>
                    </div>
                  ))}
                
                {tasks.filter(task => task.priority === 'urgent' && task.contact && task.status === 'pending').length === 0 && (
                  <div className="text-center py-8">
                    <Icon name="Phone" size={32} className="text-muted-foreground mx-auto mb-3" />
                    <p className="font-body font-body-normal text-text-secondary">
                      Aucun appel urgent en cours
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-border">
              <Button variant="outline" onClick={() => setShowUrgentCallsModal(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksTab;