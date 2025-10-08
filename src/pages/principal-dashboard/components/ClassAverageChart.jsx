import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import useDashboardData from '../../../hooks/useDashboardData';

const ClassAverageChart = () => {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  
  // Hook pour les données avec switch automatique démo/production
  const { data, loading, isDemo, loadClassAverages } = useDashboardData();

  // Récupérer les classes dynamiquement
  const availableClasses = data.classes || [];

  // Recharger les données quand les filtres changent
  useEffect(() => {
    loadClassAverages({
      subject: selectedSubject,
      grade: selectedGrade,
      period: selectedPeriod
    });
  }, [selectedSubject, selectedGrade, selectedPeriod]);

  // Utiliser les données du hook
  const chartData = data.classAverages || [];

  const subjectOptions = [
    { value: 'all', label: 'Toutes les matières' },
    { value: 'mathematics', label: 'Mathématiques' },
    { value: 'french', label: 'Français' },
    { value: 'science', label: 'Sciences' },
    { value: 'history', label: 'Histoire' }
  ];

  // Générer dynamiquement les options de niveaux selon les classes réelles
  const gradeOptions = [
    { value: 'all', label: 'Tous les niveaux' },
    ...availableClasses.map(classe => ({
      value: classe.level || classe.name,
      label: classe.name || `${classe.level}${classe.section ? ' ' + classe.section : ''}`
    }))
  ];

  const periodOptions = [
    { value: 'current', label: 'Trimestre actuel' },
    { value: 'previous', label: 'Trimestre précédent' },
    { value: 'year', label: 'Année scolaire' }
  ];

  const getFilteredData = () => {
    let filteredData = chartData;
    
    if (selectedGrade !== 'all') {
      filteredData = filteredData?.filter(item => item?.class?.includes(selectedGrade + 'ème'));
    }
    
    return filteredData?.map(item => ({
      ...item,
      displayValue: selectedSubject === 'all' ? item?.average : item?.[selectedSubject]
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-modal">
          <p className="font-heading font-heading-semibold text-sm text-popover-foreground mb-2">
            {label}
          </p>
          {selectedSubject === 'all' ? (
            <div className="space-y-1">
              <p className="font-body font-body-normal text-sm text-muted-foreground">
                Mathématiques: <span className="text-popover-foreground font-body-semibold">{data?.mathematics}/100</span>
              </p>
              <p className="font-body font-body-normal text-sm text-muted-foreground">
                Français: <span className="text-popover-foreground font-body-semibold">{data?.french}/100</span>
              </p>
              <p className="font-body font-body-normal text-sm text-muted-foreground">
                Sciences: <span className="text-popover-foreground font-body-semibold">{data?.science}/100</span>
              </p>
              <p className="font-body font-body-normal text-sm text-muted-foreground">
                Histoire: <span className="text-popover-foreground font-body-semibold">{data?.history}/100</span>
              </p>
              <div className="border-t border-border pt-1 mt-2">
                <p className="font-body font-body-semibold text-sm text-popover-foreground">
                  Moyenne: {data?.average}/100
                </p>
              </div>
            </div>
          ) : (
            <p className="font-body font-body-semibold text-sm text-popover-foreground">
              {subjectOptions?.find(s => s?.value === selectedSubject)?.label}: {data?.[selectedSubject]}/100
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="BarChart3" size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="font-heading font-heading-semibold text-lg text-card-foreground">
              Moyennes par classe
            </h2>
            <p className="font-caption font-caption-normal text-sm text-muted-foreground">
              Performance académique détaillée
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
          label="Matière"
          options={subjectOptions}
          value={selectedSubject}
          onChange={setSelectedSubject}
        />
        <Select
          label="Niveau"
          options={gradeOptions}
          value={selectedGrade}
          onChange={setSelectedGrade}
        />
        <Select
          label="Période"
          options={periodOptions}
          value={selectedPeriod}
          onChange={setSelectedPeriod}
        />
      </div>
      <div className="w-full h-80" aria-label="Graphique des moyennes par classe">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={getFilteredData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="displayValue" 
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
              name={selectedSubject === 'all' ? 'Moyenne générale' : subjectOptions?.find(s => s?.value === selectedSubject)?.label}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-sm" />
            <span className="font-caption font-caption-normal text-xs text-muted-foreground">
              {selectedSubject === 'all' ? 'Moyenne générale' : subjectOptions?.find(s => s?.value === selectedSubject)?.label}
            </span>
          </div>
        </div>
        <p className="font-caption font-caption-normal text-xs text-muted-foreground">
          Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')} {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default ClassAverageChart;