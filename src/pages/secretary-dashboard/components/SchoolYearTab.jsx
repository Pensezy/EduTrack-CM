import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const SchoolYearTab = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [currentSchoolYear] = useState('2024-2025');
  const [nextSchoolYear] = useState('2025-2026');

  // Données simulées pour l'année en cours
  const [studentsData] = useState({
    ce1: [
      { id: 1, name: 'Amina Nkomo', status: 'passe', nextClass: 'CE2' },
      { id: 2, name: 'Kevin Atangana', status: 'redouble', nextClass: 'CE1' }
    ],
    ce2: [
      { id: 3, name: 'Grace Fouda', status: 'passe', nextClass: 'CM1' },
      { id: 4, name: 'Junior Mbarga', status: 'passe', nextClass: 'CM1' }
    ],
    cm1: [
      { id: 5, name: 'Sarah Biya', status: 'passe', nextClass: 'CM2' }
    ],
    cm2: [
      { id: 6, name: 'Paul Nguema', status: 'sortant', nextClass: 'Fin primaire' }
    ]
  });

  const [reinscriptions, setReinscriptions] = useState([
    { id: 1, studentName: 'Amina Nkomo', parentName: 'Paul Nkomo', status: 'en_attente', phone: '+237 6 78 90 12 34' },
    { id: 2, studentName: 'Grace Fouda', parentName: 'Jean Fouda', status: 'confirme', phone: '+237 6 90 12 34 56' },
    { id: 3, studentName: 'Junior Mbarga', parentName: 'Marie Mbarga', status: 'en_attente', phone: '+237 6 89 01 23 45' }
  ]);

  const [newInscriptions, setNewInscriptions] = useState([
    { id: 1, studentName: 'Marie Talla', parentName: 'Joseph Talla', class: 'CE1', status: 'en_preparation', phone: '+237 6 55 44 33 22' },
    { id: 2, studentName: 'Daniel Mbella', parentName: 'Agnes Mbella', class: 'CM1', status: 'soumis_validation', phone: '+237 6 77 88 99 00' }
  ]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'en_preparation': { label: 'En préparation', className: 'bg-blue/10 text-blue' },
      'en_attente': { label: 'En attente', className: 'bg-warning/10 text-warning' },
      'soumis_validation': { label: 'Soumis validation', className: 'bg-orange/10 text-orange' },
      'confirme': { label: 'Confirmé', className: 'bg-success/10 text-success' },
      'valide': { label: 'Validé', className: 'bg-success/10 text-success' },
      'passe': { label: 'Passe', className: 'bg-success/10 text-success' },
      'redouble': { label: 'Redouble', className: 'bg-warning/10 text-warning' },
      'sortant': { label: 'Sortant', className: 'bg-muted text-muted-foreground' }
    };
    
    const config = statusConfig[status] || statusConfig['en_preparation'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-caption font-caption-normal ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const sections = [
    { id: 'dashboard', label: 'Vue d\'ensemble', icon: 'BarChart3' },
    { id: 'reinscriptions', label: 'Réinscriptions', icon: 'RotateCcw' },
    { id: 'nouvelles', label: 'Nouvelles inscriptions', icon: 'UserPlus' },
    { id: 'passages', label: 'Passages de classe', icon: 'TrendingUp' },
    { id: 'preparation', label: 'Préparation année', icon: 'Calendar' }
  ];

  return (
    <div className="space-y-6">
      {/* Header avec année scolaire */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading font-heading-bold text-xl text-text-primary">
            Transition d'Année Scolaire
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {currentSchoolYear} → {nextSchoolYear}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 px-3 py-2 rounded-lg">
            <span className="text-sm font-medium text-primary">
              📅 Période de transition active
            </span>
          </div>
        </div>
      </div>

      {/* Navigation sections */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeSection === section.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              }`}
            >
              <Icon name={section.icon} size={16} />
              <span>{section.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Overview */}
      {activeSection === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} className="text-success" />
                </div>
                <div>
                  <p className="font-heading font-heading-semibold text-lg text-text-primary">
                    {reinscriptions.filter(r => r.status === 'confirme').length}
                  </p>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary">
                    Réinscriptions confirmées
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
                    {reinscriptions.filter(r => r.status === 'en_attente').length}
                  </p>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary">
                    En attente de réponse
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="UserPlus" size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-heading font-heading-semibold text-lg text-text-primary">
                    {newInscriptions.length}
                  </p>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary">
                    Nouvelles demandes
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue/10 rounded-lg flex items-center justify-center">
                  <Icon name="TrendingUp" size={20} className="text-blue" />
                </div>
                <div>
                  <p className="font-heading font-heading-semibold text-lg text-text-primary">
                    {Object.values(studentsData).flat().filter(s => s.status === 'passe').length}
                  </p>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary">
                    Passages de classe
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Status */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-4">
              État du Processus de Transition
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-success/5 border border-success/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="CheckCircle" size={20} className="text-success" />
                  <div>
                    <p className="font-medium text-text-primary">Collecte des réinscriptions</p>
                    <p className="text-sm text-text-secondary">Phase en cours</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-success">En cours</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="Clock" size={20} className="text-muted-foreground" />
                  <div>
                    <p className="font-medium text-text-primary">Validation par le Principal</p>
                    <p className="text-sm text-text-secondary">En attente de soumission</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-muted-foreground">En attente</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="Calendar" size={20} className="text-muted-foreground" />
                  <div>
                    <p className="font-medium text-text-primary">Préparation nouvelle année</p>
                    <p className="text-sm text-text-secondary">Démarrera après validation</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-muted-foreground">À venir</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section Réinscriptions */}
      {activeSection === 'reinscriptions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
              Suivi des Réinscriptions
            </h3>
            <Button>
              <Icon name="Send" size={16} className="mr-2" />
              Envoyer rappels
            </Button>
          </div>

          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Élève
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Parent
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reinscriptions.map((reinscription) => (
                    <tr key={reinscription.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Icon name="User" size={14} className="text-primary" />
                          </div>
                          <span className="font-medium text-text-primary">
                            {reinscription.studentName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {reinscription.parentName}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {reinscription.phone}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(reinscription.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {reinscription.status === 'en_attente' && (
                            <Button variant="outline" size="sm">
                              <Icon name="Phone" size={14} className="mr-1" />
                              Relancer
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Icon name="Eye" size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Section Nouvelles Inscriptions */}
      {activeSection === 'nouvelles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
              Nouvelles Inscriptions
            </h3>
            <Button>
              <Icon name="Send" size={16} className="mr-2" />
              Soumettre au Principal
            </Button>
          </div>

          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Élève
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Parent
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Classe demandée
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {newInscriptions.map((inscription) => (
                    <tr key={inscription.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                            <Icon name="UserPlus" size={14} className="text-success" />
                          </div>
                          <span className="font-medium text-text-primary">
                            {inscription.studentName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {inscription.parentName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                          {inscription.class}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(inscription.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Icon name="Edit" size={14} className="mr-1" />
                            Modifier
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Icon name="Eye" size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Section Passages de classe */}
      {activeSection === 'passages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
              Préparation Passages de Classe
            </h3>
            <div className="text-sm text-text-secondary">
              En attente de validation du Principal
            </div>
          </div>

          {Object.entries(studentsData).map(([classe, students]) => (
            <div key={classe} className="bg-card rounded-lg border border-border p-4">
              <h4 className="font-heading font-heading-medium text-base text-text-primary mb-4">
                Classe {classe.toUpperCase()} - {students.length} élève{students.length > 1 ? 's' : ''}
              </h4>
              <div className="space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon name="User" size={14} className="text-primary" />
                      </div>
                      <span className="font-medium text-text-primary">
                        {student.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-text-secondary">
                        → {student.nextClass}
                      </span>
                      {getStatusBadge(student.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section Préparation */}
      {activeSection === 'preparation' && (
        <div className="space-y-6">
          <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
            Préparation Année {nextSchoolYear}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg border border-border p-4">
              <h4 className="font-heading font-heading-medium text-base text-text-primary mb-4">
                Documents à préparer
              </h4>
              <div className="space-y-3">
                {[
                  'Listes de classe provisoires',
                  'Certificats de scolarité',
                  'Attestations de fin d\'année',
                  'Dossiers de passage'
                ].map((doc, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Icon name="FileText" size={16} className="text-muted-foreground" />
                    <span className="text-sm text-text-secondary">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <h4 className="font-heading font-heading-medium text-base text-text-primary mb-4">
                Prochaines étapes
              </h4>
              <div className="space-y-3">
                {[
                  'Finaliser les réinscriptions',
                  'Soumettre au Principal',
                  'Attendre la validation',
                  'Exécuter les changements'
                ].map((etape, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
                    </div>
                    <span className="text-sm text-text-secondary">{etape}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolYearTab;