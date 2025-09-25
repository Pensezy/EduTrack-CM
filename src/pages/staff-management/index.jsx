import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const StaffManagement = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const staffStats = [
    {
      title: 'Total Personnel',
      value: '45',
      change: '+2',
      changeType: 'positive',
      icon: 'Users',
      description: 'Actifs'
    },
    {
      title: 'Enseignants',
      value: '32',
      change: '+1',
      changeType: 'positive',
      icon: 'GraduationCap',
      description: 'Titulaires et contractuels'
    },
    {
      title: 'Personnel Admin',
      value: '8',
      change: '0',
      changeType: 'neutral',
      icon: 'Briefcase',
      description: 'Secrétaires et encadrement'
    },
    {
      title: 'Personnel Technique',
      value: '5',
      change: '+1',
      changeType: 'positive',
      icon: 'Wrench',
      description: 'Maintenance et sécurité'
    }
  ];

  const staffMembers = [
    {
      id: 1,
      name: 'Marie Dubois',
      role: 'Professeur de Mathématiques',
      department: 'Sciences',
      status: 'active',
      phone: '237 6XX XXX XXX',
      email: 'marie.dubois@edutrack.cm',
      joinDate: '2020-09-01',
      evaluation: 4.8
    },
    {
      id: 2,
      name: 'Jean Kamto',
      role: 'Professeur de Français',
      department: 'Littéraire',
      status: 'active',
      phone: '237 6XX XXX XXX',
      email: 'jean.kamto@edutrack.cm',
      joinDate: '2019-02-15',
      evaluation: 4.6
    },
    {
      id: 3,
      name: 'Fatima Ngo',
      role: 'Secrétaire Principale',
      department: 'Administration',
      status: 'active',
      phone: '237 6XX XXX XXX',
      email: 'fatima.ngo@edutrack.cm',
      joinDate: '2018-08-20',
      evaluation: 4.9
    },
    {
      id: 4,
      name: 'Paul Essomba',
      role: 'Professeur d\'Histoire',
      department: 'Sciences Sociales',
      status: 'on_leave',
      phone: '237 6XX XXX XXX',
      email: 'paul.essomba@edutrack.cm',
      joinDate: '2021-01-10',
      evaluation: 4.4
    },
    {
      id: 5,
      name: 'Grace Mballa',
      role: 'Professeur d\'Anglais',
      department: 'Langues',
      status: 'active',
      phone: '237 6XX XXX XXX',
      email: 'grace.mballa@edutrack.cm',
      joinDate: '2022-03-05',
      evaluation: 4.7
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Actif</span>;
      case 'on_leave':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">En congé</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Inactif</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Inconnu</span>;
    }
  };

  const getEvaluationStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={i} name="Star" size={14} className="text-yellow-400 fill-current" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Icon key="half" name="Star" size={14} className="text-yellow-400 fill-current opacity-50" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Icon key={`empty-${i}`} name="Star" size={14} className="text-gray-300" />);
    }

    return stars;
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'BarChart3' },
    { id: 'list', label: 'Liste du Personnel', icon: 'Users' },
    { id: 'evaluations', label: 'Évaluations', icon: 'Star' },
    { id: 'schedules', label: 'Emplois du Temps', icon: 'Calendar' }
  ];

  return (
    <>
      <Helmet>
        <title>Gestion du Personnel - EduTrack CM</title>
        <meta name="description" content="Gérer le personnel de l'école" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header 
          userRole="principal" 
          userName="Principal Admin"
          isCollapsed={isSidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />
        
        <div className="flex pt-16">
          <Sidebar 
            userRole="principal"
            isCollapsed={isSidebarCollapsed}
            onToggle={toggleSidebar}
          />
          
          <main className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          } p-6`}>
            
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Users" size={20} className="text-primary" />
                </div>
                <h1 className="text-2xl font-heading font-heading-bold text-foreground">
                  Gestion du Personnel
                </h1>
              </div>
              <p className="text-muted-foreground">
                Gérer les informations et évaluations du personnel
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-md transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm font-medium' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {staffStats.map((stat, index) => (
                    <div key={index} className="bg-card border border-border rounded-lg p-6 shadow-card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon name={stat.icon} size={20} className="text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{stat.title}</p>
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${
                          stat.changeType === 'positive' ? 'text-green-600' : 
                          stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {stat.change}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-card">
                  <h3 className="text-lg font-heading font-heading-semibold text-card-foreground mb-4">
                    Actions Rapides
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="justify-start h-12">
                      <Icon name="UserPlus" size={16} className="mr-2" />
                      Ajouter Personnel
                    </Button>
                    <Button variant="outline" className="justify-start h-12">
                      <Icon name="FileText" size={16} className="mr-2" />
                      Rapport Mensuel
                    </Button>
                    <Button variant="outline" className="justify-start h-12">
                      <Icon name="Calendar" size={16} className="mr-2" />
                      Planifier Évaluation
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'list' && (
              <div className="bg-card border border-border rounded-lg shadow-card">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-heading font-heading-semibold text-card-foreground">
                      Liste du Personnel
                    </h3>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Icon name="Filter" size={14} className="mr-2" />
                        Filtrer
                      </Button>
                      <Button size="sm">
                        <Icon name="UserPlus" size={14} className="mr-2" />
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left py-3 px-6 font-medium text-foreground">Nom</th>
                        <th className="text-left py-3 px-6 font-medium text-foreground">Poste</th>
                        <th className="text-left py-3 px-6 font-medium text-foreground">Département</th>
                        <th className="text-left py-3 px-6 font-medium text-foreground">Statut</th>
                        <th className="text-left py-3 px-6 font-medium text-foreground">Évaluation</th>
                        <th className="text-left py-3 px-6 font-medium text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffMembers.map((member) => (
                        <tr key={member.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {member.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{member.name}</p>
                                <p className="text-sm text-muted-foreground">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-foreground">{member.role}</td>
                          <td className="py-4 px-6 text-muted-foreground">{member.department}</td>
                          <td className="py-4 px-6">{getStatusBadge(member.status)}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-1">
                              {getEvaluationStars(member.evaluation)}
                              <span className="text-sm text-muted-foreground ml-2">
                                {member.evaluation}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Icon name="Eye" size={14} />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Icon name="Edit" size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(activeTab === 'evaluations' || activeTab === 'schedules') && (
              <div className="bg-card border border-border rounded-lg p-6 shadow-card">
                <div className="text-center py-12">
                  <Icon name="Construction" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Section en cours de développement
                  </h3>
                  <p className="text-muted-foreground">
                    Cette fonctionnalité sera bientôt disponible
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default StaffManagement;