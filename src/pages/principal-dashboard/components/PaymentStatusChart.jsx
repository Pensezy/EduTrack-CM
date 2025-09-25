import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const PaymentStatusChart = () => {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [viewType, setViewType] = useState('pie');

  const mockPaymentData = [
    { name: 'Payé', value: 342, percentage: 85.5, color: 'var(--color-success)' },
    { name: 'En retard', value: 38, percentage: 9.5, color: 'var(--color-warning)' },
    { name: 'Impayé', value: 20, percentage: 5.0, color: 'var(--color-error)' }
  ];

  const mockClassPaymentData = [
    { class: '6ème A', paid: 28, late: 2, unpaid: 1, total: 31, rate: 90.3 },
    { class: '6ème B', paid: 26, late: 3, unpaid: 2, total: 31, rate: 83.9 },
    { class: '5ème A', paid: 29, late: 1, unpaid: 0, total: 30, rate: 96.7 },
    { class: '5ème B', paid: 27, late: 2, unpaid: 1, total: 30, rate: 90.0 },
    { class: '4ème A', paid: 25, late: 3, unpaid: 1, total: 29, rate: 86.2 },
    { class: '4ème B', paid: 28, late: 1, unpaid: 0, total: 29, rate: 96.6 },
    { class: '3ème A', paid: 24, late: 2, unpaid: 2, total: 28, rate: 85.7 },
    { class: '3ème B', paid: 26, late: 1, unpaid: 1, total: 28, rate: 92.9 }
  ];

  const classOptions = [
    { value: 'all', label: 'Toutes les classes' },
    { value: '6ème', label: '6ème' },
    { value: '5ème', label: '5ème' },
    { value: '4ème', label: '4ème' },
    { value: '3ème', label: '3ème' }
  ];

  const periodOptions = [
    { value: 'current', label: 'Trimestre actuel' },
    { value: 'previous', label: 'Trimestre précédent' },
    { value: 'year', label: 'Année scolaire' }
  ];

  const viewOptions = [
    { value: 'pie', label: 'Vue circulaire' },
    { value: 'bar', label: 'Vue par classe' }
  ];

  const getFilteredClassData = () => {
    if (selectedClass === 'all') return mockClassPaymentData;
    return mockClassPaymentData?.filter(item => item?.class?.includes(selectedClass));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      if (viewType === 'pie') {
        const data = payload?.[0];
        return (
          <div className="bg-popover border border-border rounded-lg p-3 shadow-modal">
            <p className="font-heading font-heading-semibold text-sm text-popover-foreground mb-1">
              {data?.name}
            </p>
            <p className="font-body font-body-normal text-sm text-muted-foreground">
              Nombre: <span className="text-popover-foreground font-body-semibold">{data?.value}</span>
            </p>
            <p className="font-body font-body-normal text-sm text-muted-foreground">
              Pourcentage: <span className="text-popover-foreground font-body-semibold">{data?.payload?.percentage}%</span>
            </p>
          </div>
        );
      } else {
        const data = payload?.[0]?.payload;
        return (
          <div className="bg-popover border border-border rounded-lg p-3 shadow-modal">
            <p className="font-heading font-heading-semibold text-sm text-popover-foreground mb-2">
              {label}
            </p>
            <div className="space-y-1">
              <p className="font-body font-body-normal text-sm text-muted-foreground">
                Payé: <span className="text-success font-body-semibold">{data?.paid}</span>
              </p>
              <p className="font-body font-body-normal text-sm text-muted-foreground">
                En retard: <span className="text-warning font-body-semibold">{data?.late}</span>
              </p>
              <p className="font-body font-body-normal text-sm text-muted-foreground">
                Impayé: <span className="text-error font-body-semibold">{data?.unpaid}</span>
              </p>
              <div className="border-t border-border pt-1 mt-2">
                <p className="font-body font-body-semibold text-sm text-popover-foreground">
                  Taux de paiement: {data?.rate}%
                </p>
              </div>
            </div>
          </div>
        );
      }
    }
    return null;
  };

  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex justify-center space-x-6 mt-4">
        {payload?.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: entry?.color }}
            />
            <span className="font-caption font-caption-normal text-xs text-muted-foreground">
              {entry?.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
            <Icon name="CreditCard" size={20} className="text-warning" />
          </div>
          <div>
            <h2 className="font-heading font-heading-semibold text-lg text-card-foreground">
              Statut des paiements
            </h2>
            <p className="font-caption font-caption-normal text-sm text-muted-foreground">
              Suivi des frais de scolarité
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select
          label="Vue"
          options={viewOptions}
          value={viewType}
          onChange={setViewType}
        />
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
      <div className="w-full h-80" aria-label="Graphique du statut des paiements">
        <ResponsiveContainer width="100%" height="100%">
          {viewType === 'pie' ? (
            <PieChart>
              <Pie
                data={mockPaymentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {mockPaymentData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend} />
            </PieChart>
          ) : (
            <BarChart data={getFilteredClassData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="class" 
                stroke="var(--color-text-secondary)"
                fontSize={12}
                fontFamily="Inter, sans-serif"
              />
              <YAxis 
                stroke="var(--color-text-secondary)"
                fontSize={12}
                fontFamily="Inter, sans-serif"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="paid" fill="var(--color-success)" name="Payé" radius={[2, 2, 0, 0]} />
              <Bar dataKey="late" fill="var(--color-warning)" name="En retard" radius={[2, 2, 0, 0]} />
              <Bar dataKey="unpaid" fill="var(--color-error)" name="Impayé" radius={[2, 2, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <div className="w-3 h-3 bg-success rounded-sm" />
            <span className="font-heading font-heading-semibold text-lg text-card-foreground">
              342
            </span>
          </div>
          <p className="font-caption font-caption-normal text-xs text-muted-foreground">
            Paiements à jour (85.5%)
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <div className="w-3 h-3 bg-warning rounded-sm" />
            <span className="font-heading font-heading-semibold text-lg text-card-foreground">
              38
            </span>
          </div>
          <p className="font-caption font-caption-normal text-xs text-muted-foreground">
            Paiements en retard (9.5%)
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <div className="w-3 h-3 bg-error rounded-sm" />
            <span className="font-heading font-heading-semibold text-lg text-card-foreground">
              20
            </span>
          </div>
          <p className="font-caption font-caption-normal text-xs text-muted-foreground">
            Paiements impayés (5.0%)
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="Euro" size={14} className="text-success" />
            <span className="font-caption font-caption-normal text-xs text-muted-foreground">
              Montant collecté: 680 400FCFA
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={14} className="text-error" />
            <span className="font-caption font-caption-normal text-xs text-muted-foreground">
              Montant en attente: 110 600FCFA
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

export default PaymentStatusChart;