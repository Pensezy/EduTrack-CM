import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import useDashboardData from '../../../hooks/useDashboardData';

const PersonnelManagement = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const { data, loading, loadPersonnel } = useDashboardData();

  const personnelData = data.personnel || [];
  const teachers = personnelData.filter(p => p.type === 'teacher');
  const secretaries = personnelData.filter(p => p.type === 'secretary');
  const allPersonnel = personnelData;

  const sectionTabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'BarChart3' },
    { id: 'teachers', label: 'Enseignants', icon: 'GraduationCap' },
    { id: 'secretaries', label: 'Secrétaires', icon: 'UserCheck' }
  ];

  const generatePersonnelReportHTML = (personnel) => {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const totalPersonnel = personnel.length;
    const activePersonnel = personnel.filter(p => p.status === 'active').length;
    
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport Personnel - EduTrack CM</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
        .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
        .subtitle { color: #666; font-size: 16px; }
        .summary { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .summary h2 { color: #2563eb; margin-top: 0; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-number { font-size: 24px; font-weight: bold; color: #2563eb; }
        .stat-label { color: #666; font-size: 14px; }
        .personnel-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .personnel-table th, .personnel-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .personnel-table th { background: #f1f5f9; font-weight: 600; color: #475569; }
        .personnel-table tr:hover { background: #f8fafc; }
        .status-badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
        .status-active { background: #dcfce7; color: #166534; }
        .status-inactive { background: #fee2e2; color: #dc2626; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #666; font-size: 14px; }
        @media print { body { margin: 0; } .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">EduTrack CM</div>
        <div class="subtitle">Rapport du Personnel</div>
        <div style="margin-top: 10px; color: #666;">Généré le ${currentDate}</div>
    </div>

    <div class="summary">
        <h2>Résumé Exécutif</h2>
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${totalPersonnel}</div>
                <div class="stat-label">Total Personnel</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${activePersonnel}</div>
                <div class="stat-label">Personnel Actif</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${personnel.filter(p => p.type === 'teacher').length}</div>
                <div class="stat-label">Enseignants</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${personnel.filter(p => p.type === 'secretary').length}</div>
                <div class="stat-label">Secrétaires</div>
            </div>
        </div>
    </div>

    <h2>Détails du Personnel</h2>
    <table class="personnel-table">
        <thead>
            <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Fonction/Matière</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Expérience</th>
                <th>Statut</th>
            </tr>
        </thead>
        <tbody>
            ${personnel.map(person => `
                <tr>
                    <td><strong>${person.name}</strong></td>
                    <td>${person.type === 'teacher' ? 'Enseignant' : 'Secrétaire'}</td>
                    <td>${person.type === 'teacher' ? person.subject : person.role}</td>
                    <td>${person.email}</td>
                    <td>${person.phone}</td>
                    <td>${person.experience}</td>
                    <td><span class="status-badge status-${person.status}">${person.status === 'active' ? 'Actif' : 'Inactif'}</span></td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="footer">
        <p>Ce rapport a été généré automatiquement par EduTrack CM</p>
        <p>Pour plus d'informations, contactez l'administration de l'établissement</p>
    </div>
</body>
</html>`;
  };

  const generateScheduleHTML = (teachers) => {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    
    // Données d'exemple pour les emplois du temps
    const sampleSchedules = {
      'Marie Dubois': {
        'Lundi': [
          { time: '08:00-09:00', class: '6èmeA', subject: 'Mathématiques' },
          { time: '10:00-11:00', class: '5èmeB', subject: 'Mathématiques' }
        ],
        'Mardi': [
          { time: '09:00-10:00', class: '6èmeA', subject: 'Mathématiques' },
          { time: '14:00-15:00', class: '5èmeB', subject: 'Mathématiques' }
        ],
        'Mercredi': [
          { time: '08:00-09:00', class: '6èmeA', subject: 'Mathématiques' }
        ],
        'Jeudi': [
          { time: '10:00-11:00', class: '5èmeB', subject: 'Mathématiques' },
          { time: '15:00-16:00', class: '6èmeA', subject: 'Mathématiques' }
        ],
        'Vendredi': [
          { time: '09:00-10:00', class: '6èmeA', subject: 'Mathématiques' },
          { time: '11:00-12:00', class: '5èmeB', subject: 'Mathématiques' }
        ]
      },
      'Jean Kamto': {
        'Lundi': [
          { time: '09:00-10:00', class: '4èmeA', subject: 'Français' },
          { time: '14:00-15:00', class: '3èmeB', subject: 'Français' }
        ],
        'Mardi': [
          { time: '08:00-09:00', class: '4èmeA', subject: 'Français' },
          { time: '15:00-16:00', class: '3èmeB', subject: 'Français' }
        ],
        'Mercredi': [
          { time: '10:00-11:00', class: '4èmeA', subject: 'Français' }
        ],
        'Jeudi': [
          { time: '09:00-10:00', class: '3èmeB', subject: 'Français' },
          { time: '11:00-12:00', class: '4èmeA', subject: 'Français' }
        ],
        'Vendredi': [
          { time: '08:00-09:00', class: '3èmeB', subject: 'Français' },
          { time: '10:00-11:00', class: '4èmeA', subject: 'Français' }
        ]
      }
    };

    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Emplois du Temps - EduTrack CM</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
        .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
        .subtitle { color: #666; font-size: 16px; }
        .teacher-schedule { margin-bottom: 40px; page-break-inside: avoid; }
        .teacher-name { font-size: 20px; font-weight: bold; color: #2563eb; margin-bottom: 15px; padding: 10px; background: #f1f5f9; border-radius: 8px; }
        .schedule-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .schedule-table th, .schedule-table td { padding: 8px 12px; border: 1px solid #e2e8f0; text-align: center; }
        .schedule-table th { background: #2563eb; color: white; font-weight: 600; }
        .schedule-table td { background: white; vertical-align: top; height: 60px; }
        .class-slot { background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; margin: 2px 0; font-size: 12px; }
        .time-slot { font-weight: bold; color: #374151; }
        .subject { font-style: italic; color: #6b7280; }
        .empty-slot { color: #9ca3af; font-style: italic; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #666; font-size: 14px; }
        @media print { body { margin: 0; } .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">EduTrack CM</div>
        <div class="subtitle">Emplois du Temps du Personnel</div>
        <div style="margin-top: 10px; color: #666;">Généré le ${currentDate}</div>
    </div>

    ${teachers.map(teacher => {
      const schedule = sampleSchedules[teacher.name] || {};
      return `
        <div class="teacher-schedule">
            <div class="teacher-name">${teacher.name} - ${teacher.subject}</div>
            <table class="schedule-table">
                <thead>
                    <tr>
                        <th style="width: 100px;">Horaires</th>
                        ${days.map(day => `<th>${day}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="time-slot">08:00-09:00</td>
                        ${days.map(day => {
                          const slot = schedule[day]?.find(s => s.time === '08:00-09:00');
                          return `<td>${slot ? `<div class="class-slot">${slot.class}<br><span class="subject">${slot.subject}</span></div>` : '<span class="empty-slot">Libre</span>'}</td>`;
                        }).join('')}
                    </tr>
                    <tr>
                        <td class="time-slot">09:00-10:00</td>
                        ${days.map(day => {
                          const slot = schedule[day]?.find(s => s.time === '09:00-10:00');
                          return `<td>${slot ? `<div class="class-slot">${slot.class}<br><span class="subject">${slot.subject}</span></div>` : '<span class="empty-slot">Libre</span>'}</td>`;
                        }).join('')}
                    </tr>
                    <tr>
                        <td class="time-slot">10:00-11:00</td>
                        ${days.map(day => {
                          const slot = schedule[day]?.find(s => s.time === '10:00-11:00');
                          return `<td>${slot ? `<div class="class-slot">${slot.class}<br><span class="subject">${slot.subject}</span></div>` : '<span class="empty-slot">Libre</span>'}</td>`;
                        }).join('')}
                    </tr>
                    <tr>
                        <td class="time-slot">11:00-12:00</td>
                        ${days.map(day => {
                          const slot = schedule[day]?.find(s => s.time === '11:00-12:00');
                          return `<td>${slot ? `<div class="class-slot">${slot.class}<br><span class="subject">${slot.subject}</span></div>` : '<span class="empty-slot">Libre</span>'}</td>`;
                        }).join('')}
                    </tr>
                    <tr>
                        <td class="time-slot">14:00-15:00</td>
                        ${days.map(day => {
                          const slot = schedule[day]?.find(s => s.time === '14:00-15:00');
                          return `<td>${slot ? `<div class="class-slot">${slot.class}<br><span class="subject">${slot.subject}</span></div>` : '<span class="empty-slot">Libre</span>'}</td>`;
                        }).join('')}
                    </tr>
                    <tr>
                        <td class="time-slot">15:00-16:00</td>
                        ${days.map(day => {
                          const slot = schedule[day]?.find(s => s.time === '15:00-16:00');
                          return `<td>${slot ? `<div class="class-slot">${slot.class}<br><span class="subject">${slot.subject}</span></div>` : '<span class="empty-slot">Libre</span>'}</td>`;
                        }).join('')}
                    </tr>
                </tbody>
            </table>
        </div>
      `;
    }).join('')}

    <div class="footer">
        <p>Emplois du temps générés automatiquement par EduTrack CM</p>
        <p>Pour toute modification, contactez l'administration</p>
    </div>
</body>
</html>`;
  };

  const handleGeneratePersonnelReport = () => {
    const reportHTML = generatePersonnelReportHTML(allPersonnel);
    const newWindow = window.open('', '_blank');
    newWindow.document.write(reportHTML);
    newWindow.document.close();
    newWindow.focus();
  };

  const handleViewSchedules = () => {
    const scheduleHTML = generateScheduleHTML(teachers);
    const newWindow = window.open('', '_blank');
    newWindow.document.write(scheduleHTML);
    newWindow.document.close();
    newWindow.focus();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Actif</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Inactif</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Inconnu</span>;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" className="justify-start h-12" onClick={handleGeneratePersonnelReport}>
            <Icon name="FileText" size={16} className="mr-2" />
            Rapport Personnel
          </Button>
          <Button variant="outline" className="justify-start h-12" onClick={handleViewSchedules}>
            <Icon name="Calendar" size={16} className="mr-2" />
            Emplois du Temps
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Personnel</h3>
        <div className="space-y-3">
          {allPersonnel.length > 0 ? (
            allPersonnel.slice(0, 3).map((person) => (
              <div key={person.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{person.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {person.type === 'teacher' ? person.subject : person.role}
                    </p>
                  </div>
                </div>
                {getStatusBadge(person.status)}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun personnel enregistré</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPersonnelList = (type) => {
    const personnel = type === 'teachers' ? teachers : secretaries;
    const title = type === 'teachers' ? 'Enseignants' : 'Secrétaires';
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-card-foreground">Liste des {title}</h3>
        <div className="space-y-4">
          {personnel.length > 0 ? (
            personnel.map((person) => (
              <div key={person.id} className="bg-card border border-border rounded-lg p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{person.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {person.type === 'teacher' ? person.subject : person.role}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                        <span>{person.email}</span>
                        <span>{person.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(person.status)}
                    <p className="text-xs text-muted-foreground mt-1">
                      Expérience: {person.experience}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Icon name={type === 'teachers' ? 'GraduationCap' : 'UserCheck'} size={64} className="text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-medium text-foreground mb-2">
                Aucun {type === 'teachers' ? 'enseignant' : 'secrétaire'} enregistré
              </h4>
              <p className="text-muted-foreground">La gestion du personnel s'effectue depuis l'onglet "Comptes"</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {sectionTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-all ${
              activeSection === tab.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon name={tab.icon} size={16} />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="transition-all duration-200">
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'teachers' && renderPersonnelList('teachers')}
        {activeSection === 'secretaries' && renderPersonnelList('secretaries')}
      </div>
    </div>
  );
};

export default PersonnelManagement;
