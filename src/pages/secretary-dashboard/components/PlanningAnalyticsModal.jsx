import React, { useState, useEffect } from 'react';
import { X, BarChart3, Calendar, Users, Clock, TrendingUp, Download } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import planningService from '../../../services/planningService';

export const PlanningAnalyticsModal = ({ isOpen, onClose }) => {
  const [events, setEvents] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
    }
  }, [isOpen, period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const periodDate = new Date();
      
      switch(period) {
        case 'week':
          periodDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          periodDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          periodDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          periodDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          periodDate.setMonth(now.getMonth() - 1);
      }

      const filters = {
        startDate: periodDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
      };

      const data = await planningService.getAllEvents(filters);
      setEvents(data.events || []);
      setStatistics(data.statistics || {});
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = () => {
    const labels = {
      'week': 'Dernière semaine',
      'month': 'Dernier mois', 
      'quarter': 'Dernier trimestre',
      'year': 'Dernière année'
    };
    return labels[period] || 'Dernier mois';
  };

  const periodOptions = [
    { value: 'week', label: 'Dernière semaine' },
    { value: 'month', label: 'Dernier mois' },
    { value: 'quarter', label: 'Dernier trimestre' },
    { value: 'year', label: 'Dernière année' }
  ];

  const exportReport = () => {
    if (!events.length) return;

    const reportData = [
      ['RAPPORT D\'ANALYSE DU PLANNING'],
      [''],
      ['Période:', getPeriodLabel()],
      ['Date de génération:', new Date().toLocaleDateString('fr-FR')],
      [''],
      ['RÉSUMÉ GÉNÉRAL'],
      ['Nombre total d\'événements:', statistics.total || 0],
      ['Événements aujourd\'hui:', statistics.today || 0],
      ['Événements cette semaine:', statistics.thisWeek || 0],
      ['Confirmations en attente:', statistics.pendingConfirmations || 0],
      [''],
      ['RÉPARTITION PAR TYPE'],
      ['Rendez-vous parents:', statistics.byType?.parent_meeting || 0],
      ['Réunions pédagogiques:', statistics.byType?.meeting || 0],
      ['Événements scolaires:', statistics.byType?.school_event || 0],
      ['Formations:', statistics.byType?.training || 0],
      ['Conseils officiels:', statistics.byType?.official_meeting || 0],
      ['Inscriptions:', statistics.byType?.inscription || 0],
      ['Entretiens:', statistics.byType?.interview || 0],
      [''],
      ['RÉPARTITION PAR STATUT'],
      ['Confirmés:', statistics.byStatus?.confirmed || 0],
      ['Programmés:', statistics.byStatus?.scheduled || 0],
      ['En attente:', statistics.byStatus?.pending || 0],
      ['Annulés:', statistics.byStatus?.cancelled || 0]
    ];

    const csvContent = reportData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analyse_planning_${period}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const calculateTrendData = () => {
    if (!events.length) return { trend: 0, message: 'Aucune donnée' };

    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    const thisWeekEvents = events.filter(e => new Date(e.date) >= weekAgo).length;
    const previousWeekEvents = events.filter(e => {
      const eventDate = new Date(e.date);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(now.getDate() - 14);
      return eventDate >= twoWeeksAgo && eventDate < weekAgo;
    }).length;

    if (previousWeekEvents === 0) {
      return { trend: thisWeekEvents > 0 ? 100 : 0, message: 'Nouvelle activité' };
    }

    const trend = ((thisWeekEvents - previousWeekEvents) / previousWeekEvents) * 100;
    const message = trend > 0 ? 'En hausse' : trend < 0 ? 'En baisse' : 'Stable';
    
    return { trend: Math.round(trend), message };
  };

  const getTypeColor = (type) => {
    const colors = {
      parent_meeting: 'bg-blue-100 text-blue-800',
      meeting: 'bg-purple-100 text-purple-800',
      school_event: 'bg-green-100 text-green-800',
      training: 'bg-orange-100 text-orange-800',
      official_meeting: 'bg-red-100 text-red-800',
      inscription: 'bg-yellow-100 text-yellow-800',
      interview: 'bg-indigo-100 text-indigo-800',
      holiday: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.parent_meeting;
  };

  if (!isOpen) return null;

  const trendData = calculateTrendData();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analyses du Planning
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Statistiques et tendances des événements
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportReport}
              disabled={!events.length}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Période d'analyse:
            </label>
            <Select
              value={period}
              onChange={setPeriod}
              options={periodOptions}
              className="w-48"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Calcul des analyses...</span>
            </div>
          )}

          {!loading && (
            <div className="space-y-6">
              {/* Métriques principales */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Résumé - {getPeriodLabel()}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Total Événements</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {statistics.total || 0}
                        </p>
                      </div>
                      <Calendar className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600">Cette Semaine</p>
                        <p className="text-2xl font-bold text-green-900">
                          {statistics.thisWeek || 0}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-600">À Confirmer</p>
                        <p className="text-2xl font-bold text-yellow-900">
                          {statistics.pendingConfirmations || 0}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-yellow-500" />
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600">Tendance</p>
                        <p className="text-lg font-bold text-purple-900 flex items-center gap-1">
                          {trendData.trend > 0 && <TrendingUp className="w-4 h-4" />}
                          {trendData.trend === 0 && <span className="w-4 h-4 text-center">-</span>}
                          {trendData.trend < 0 && <TrendingUp className="w-4 h-4 rotate-180" />}
                          {Math.abs(trendData.trend)}%
                        </p>
                        <p className="text-xs text-purple-600">{trendData.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Répartition par type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Répartition par Type</h4>
                  <div className="space-y-2">
                    {Object.entries(statistics.byType || {}).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${getTypeColor(type)}`}>
                            {planningService.getTypeLabel(type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${((count / (statistics.total || 1)) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Répartition par statut */}
                <div className="bg-white rounded-lg border p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Répartition par Statut</h4>
                  <div className="space-y-2">
                    {Object.entries(statistics.byStatus || {}).map(([status, count]) => {
                      const statusColors = {
                        confirmed: 'bg-green-500',
                        scheduled: 'bg-blue-500',
                        pending: 'bg-yellow-500',
                        cancelled: 'bg-red-500'
                      };
                      const statusLabels = {
                        confirmed: 'Confirmés',
                        scheduled: 'Programmés',
                        pending: 'En attente',
                        cancelled: 'Annulés'
                      };
                      
                      return (
                        <div key={status} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{statusLabels[status]}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${statusColors[status]} h-2 rounded-full`}
                                style={{ width: `${((count / (statistics.total || 1)) * 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-8 text-right">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Planning de la semaine */}
              {statistics.thisWeek > 0 && (
                <div className="bg-white rounded-lg border p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Événements Cette Semaine</h4>
                  <div className="space-y-2">
                    {events
                      .filter(e => {
                        const eventDate = new Date(e.date);
                        const now = new Date();
                        const weekStart = new Date(now);
                        weekStart.setDate(now.getDate() - now.getDay() + 1);
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekStart.getDate() + 6);
                        return eventDate >= weekStart && eventDate <= weekEnd;
                      })
                      .sort((a, b) => new Date(a.date) - new Date(b.date))
                      .slice(0, 10)
                      .map(event => (
                        <div key={event.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-sm text-gray-600">{event.startTime}</div>
                            <div className="text-sm text-gray-900">{event.title}</div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${getTypeColor(event.type)}`}>
                            {planningService.getTypeLabel(event.type)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanningAnalyticsModal;