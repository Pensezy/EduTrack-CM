import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const AttendanceChart = () => {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const mockWeeklyData = [
    { period: 'Lun 04/09', overall: 94, '6ème': 96, '5ème': 93, '4ème': 92, '3ème': 95 },
    { period: 'Mar 05/09', overall: 92, '6ème': 94, '5ème': 91, '4ème': 90, '3ème': 93 },
    { period: 'Mer 06/09', overall: 96, '6ème': 98, '5ème': 95, '4ème': 94, '3ème': 97 },
    { period: 'Jeu 07/09', overall: 93, '6ème': 95, '5ème': 92, '4ème': 91, '3ème': 94 },
    { period: 'Ven 08/09', overall: 89, '6ème': 91, '5ème': 88, '4ème': 87, '3ème': 90 },
    { period: 'Lun 11/09', overall: 95, '6ème': 97, '5ème': 94, '4ème': 93, '3ème': 96 }
  ];

  const mockMonthlyData = [
    { period: 'Semaine 1', overall: 93, '6ème': 95, '5ème': 92, '4ème': 91, '3ème': 94 },
    { period: 'Semaine 2', overall: 94, '6ème': 96, '5ème': 93, '4ème': 92, '3ème': 95 },
    { period: 'Semaine 3', overall: 92, '6ème': 94, '5ème': 91, '4ème': 90, '3ème': 93 },
    { period: 'Semaine 4', overall: 95, '6ème': 97, '5ème': 94, '4ème': 93, '3ème': 96 }
  ];

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
    return selectedPeriod === 'week' ? mockWeeklyData : mockMonthlyData;
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
        </div>
        <p className="font-caption font-caption-normal text-xs text-muted-foreground">
          Dernière mise à jour: 11/09/2025 04:40
        </p>
      </div>
    </div>
  );
};

export default AttendanceChart;