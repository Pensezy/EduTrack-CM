import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import useDashboardData from '../../../hooks/useDashboardData';

const AttendanceChart = () => {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  
  // Hook pour les données avec switch automatique démo/production
  const { data, loading, isDemo, loadAttendance } = useDashboardData();

  // Recharger les données quand la période change
  useEffect(() => {
    loadAttendance(selectedPeriod);
  }, [selectedPeriod]);

  // Utiliser les données du hook - format converti pour le graphique
  const convertAttendanceData = (rawData) => {
    if (!rawData || rawData.length === 0) return [];
    
    if (isDemo) {
      // Mode démo : utiliser les données mock
      return rawData.map((item, index) => ({
        period: item.day,
        overall: Math.round((item.present / (item.present + item.absent + item.late + item.excused)) * 100),
        '6ème': Math.round(Math.random() * 10 + 90),
        '5ème': Math.round(Math.random() * 10 + 90),
        '4ème': Math.round(Math.random() * 10 + 90),
        '3ème': Math.round(Math.random() * 10 + 90)
      }));
    } else {
      // Mode production : données réelles ou vides
      return rawData.map((item, index) => ({
        period: item.day || `Jour ${index + 1}`,
        overall: item.present && (item.present + item.absent + item.late + item.excused) > 0 
          ? Math.round((item.present / (item.present + item.absent + item.late + item.excused)) * 100)
          : 0,
        '6ème': 0, // Sera calculé avec vraies données par classe
        '5ème': 0,
        '4ème': 0,
        '3ème': 0
      }));
    }
  };

  const chartData = convertAttendanceData(data.attendance || []);

  const classOptions = [
    { value: 'all', label: 'Toutes les classes' },
    { value: '6ème', label: '6ème' },
    { value: '5ème', label: '5ème' },
    { value: '4ème', label: '4ème' },
    { value: '3ème', label: '3ème' }
  ];

  const periodOptions = [
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'term', label: 'Ce trimestre' }
  ];

  const getData = () => {
    return chartData;
  };

  const getDisplayLines = () => {
    if (selectedClass === 'all') {
      return [
        { key: 'overall', color: 'var(--color-primary)', name: 'Moyenne générale' },
        { key: '6ème', color: 'var(--color-success)', name: '6ème' },
        { key: '5ème', color: 'var(--color-warning)', name: '5ème' },
        { key: '4ème', color: 'var(--color-accent)', name: '4ème' },
        { key: '3ème', color: 'var(--color-secondary)', name: '3ème' }
      ];
    } else {
      return [
        { key: selectedClass, color: 'var(--color-primary)', name: selectedClass },
        { key: 'overall', color: 'var(--color-muted-foreground)', name: 'Moyenne école' }
      ];
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-modal">
          <p className="font-heading font-heading-semibold text-sm text-popover-foreground mb-2">
            {label}
          </p>
          <div className="space-y-1">
            {payload?.map((entry, index) => (
              <p key={index} className="font-body font-body-normal text-sm text-muted-foreground">
                <span style={{ color: entry?.color }}>●</span> {entry?.name}: {entry?.value}%
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
            <Icon name="Users" size={20} className="text-success" />
          </div>
          <div>
            <h2 className="font-heading font-heading-semibold text-lg text-card-foreground">
              Taux de présence
            </h2>
            <p className="font-caption font-caption-normal text-sm text-muted-foreground">
              Suivi de l'assiduité par niveau
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Icon name="Download" size={16} />
          </Button>
          <Button variant="ghost" size="icon">
            <Icon name="RefreshCw" size={16} />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Select
          label="Classe"
          options={classOptions}
          value={selectedClass}
          onChange={setSelectedClass}
        />
        <Select
          label="Période"
          options={periodOptions}
          value={selectedPeriod}
          onChange={setSelectedPeriod}
        />
      </div>
      <div className="w-full h-80" aria-label="Graphique du taux de présence">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={getData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="period" 
              stroke="var(--color-text-secondary)"
              fontSize={12}
              fontFamily="Inter, sans-serif"
            />
            <YAxis 
              stroke="var(--color-text-secondary)"
              fontSize={12}
              fontFamily="Inter, sans-serif"
              domain={[80, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                fontSize: '12px', 
                fontFamily: 'Inter, sans-serif',
                color: 'var(--color-text-secondary)'
              }}
            />
            {getDisplayLines()?.map((line) => (
              <Line
                key={line?.key}
                type="monotone"
                dataKey={line?.key}
                stroke={line?.color}
                strokeWidth={2}
                dot={{ fill: line?.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: line?.color, strokeWidth: 2 }}
                name={line?.name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-6">
          {isDemo ? (
            <>
              <div className="flex items-center space-x-2">
                <Icon name="TrendingUp" size={14} className="text-success" />
                <span className="font-caption font-caption-normal text-xs text-muted-foreground">
                  Tendance positive cette semaine
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={14} className="text-warning" />
                <span className="font-caption font-caption-normal text-xs text-muted-foreground">
                  3 alertes d'absentéisme
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Icon name="Info" size={14} className="text-muted-foreground" />
              <span className="font-caption font-caption-normal text-xs text-muted-foreground">
                Aucune donnée d'assiduité disponible
              </span>
            </div>
          )}
        </div>
        <p className="font-caption font-caption-normal text-xs text-muted-foreground">
          Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')} {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default AttendanceChart;