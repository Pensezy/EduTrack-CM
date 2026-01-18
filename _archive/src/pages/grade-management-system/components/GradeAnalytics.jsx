import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';

import Select from '../../../components/ui/Select';

const GradeAnalytics = ({ students, assignments }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewType, setViewType] = useState('overview');

  const periodOptions = [
    { value: 'all', label: 'Toute l\'année' },
    { value: 'current', label: 'Période actuelle' },
    { value: 'last30', label: '30 derniers jours' },
    { value: 'last7', label: '7 derniers jours' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'Toutes catégories' },
    { value: 'test', label: 'Contrôles' },
    { value: 'homework', label: 'Devoirs' },
    { value: 'project', label: 'Projets' },
    { value: 'participation', label: 'Participation' }
  ];

  const viewTypeOptions = [
    { value: 'overview', label: 'Vue d\'ensemble' },
    { value: 'trends', label: 'Tendances' },
    { value: 'distribution', label: 'Distribution' }
  ];

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const filteredAssignments = assignments?.filter(assignment => {
      if (selectedCategory !== 'all' && assignment?.category !== selectedCategory) {
        return false;
      }

      if (selectedPeriod !== 'all') {
        const assignmentDate = new Date(assignment.dueDate);
        const now = new Date();
        
        switch (selectedPeriod) {
          case 'current':
            return assignmentDate?.getMonth() === now?.getMonth();
          case 'last30':
            return (now - assignmentDate) <= (30 * 24 * 60 * 60 * 1000);
          case 'last7':
            return (now - assignmentDate) <= (7 * 24 * 60 * 60 * 1000);
          default:
            return true;
        }
      }

      return true;
    });

    // Class average by assignment
    const classAverages = filteredAssignments?.map(assignment => {
      const grades = students?.map(student => assignment?.currentGrade?.percentage)?.filter(grade => grade !== undefined);
      
      const average = grades?.length > 0 
        ? grades?.reduce((sum, grade) => sum + parseFloat(grade), 0) / grades?.length
        : 0;

      return {
        name: assignment?.title?.substring(0, 15) + (assignment?.title?.length > 15 ? '...' : ''),
        average: parseFloat(average?.toFixed(1)),
        category: assignment?.category,
        totalStudents: students?.length,
        gradedStudents: grades?.length
      };
    });

    // Grade distribution
    const gradeRanges = [
      { range: 'A (90-100%)', min: 90, max: 100, count: 0, color: '#27AE60' },
      { range: 'B (80-89%)', min: 80, max: 89, count: 0, color: '#2A5CAA' },
      { range: 'C (70-79%)', min: 70, max: 79, count: 0, color: '#F4C430' },
      { range: 'D (60-69%)', min: 60, max: 69, count: 0, color: '#F39C12' },
      { range: 'F (<60%)', min: 0, max: 59, count: 0, color: '#E74C3C' }
    ];

    filteredAssignments?.forEach(assignment => {
      students?.forEach(student => {
        const grade = assignment?.currentGrade?.percentage;
        if (grade !== undefined) {
          const percentage = parseFloat(grade);
          gradeRanges?.forEach(range => {
            if (percentage >= range?.min && percentage <= range?.max) {
              range.count++;
            }
          });
        }
      });
    });

    // Student performance trends
    const studentTrends = students?.map(student => {
      const studentGrades = filteredAssignments?.filter(assignment => assignment?.currentGrade?.percentage)?.map(assignment => ({
          assignment: assignment?.title,
          grade: parseFloat(assignment?.currentGrade?.percentage),
          date: assignment?.dueDate
        }))?.sort((a, b) => new Date(a.date) - new Date(b.date));

      const average = studentGrades?.length > 0
        ? studentGrades?.reduce((sum, g) => sum + g?.grade, 0) / studentGrades?.length
        : 0;

      return {
        name: student?.name,
        average: parseFloat(average?.toFixed(1)),
        trend: studentGrades?.length >= 2 
          ? studentGrades?.[studentGrades?.length - 1]?.grade - studentGrades?.[0]?.grade
          : 0,
        totalAssignments: filteredAssignments?.length,
        completedAssignments: studentGrades?.length
      };
    })?.sort((a, b) => b?.average - a?.average);

    return {
      classAverages,
      gradeDistribution: gradeRanges,
      studentTrends,
      totalAssignments: filteredAssignments?.length,
      overallClassAverage: classAverages?.length > 0 
        ? classAverages?.reduce((sum, item) => sum + item?.average, 0) / classAverages?.length
        : 0
    };
  }, [students, assignments, selectedPeriod, selectedCategory]);

  const renderOverviewCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Class Averages by Assignment */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
          Moyennes par évaluation
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData?.classAverages}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="name" 
                stroke="var(--color-text-secondary)"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="var(--color-text-secondary)"
                fontSize={12}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="average" 
                fill="var(--color-primary)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
          Distribution des notes
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analyticsData?.gradeDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="count"
                label={({ range, count }) => count > 0 ? `${range}: ${count}` : ''}
              >
                {analyticsData?.gradeDistribution?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderTrendsChart = () => (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
        Évolution des moyennes de classe
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={analyticsData?.classAverages}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="name" 
              stroke="var(--color-text-secondary)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-text-secondary)"
              fontSize={12}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--color-popover)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="average" 
              stroke="var(--color-primary)"
              strokeWidth={3}
              dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderStudentRanking = () => (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
        Classement des élèves
      </h3>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {analyticsData?.studentTrends?.map((student, index) => (
          <div key={student?.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-heading font-heading-semibold text-sm ${
                index === 0 ? 'bg-success text-white' :
                index === 1 ? 'bg-primary text-white' :
                index === 2 ? 'bg-warning text-white': 'bg-muted-foreground text-white'
              }`}>
                {index + 1}
              </div>
              <div>
                <h4 className="font-body font-body-semibold text-sm text-card-foreground">
                  {student?.name}
                </h4>
                <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                  {student?.completedAssignments}/{student?.totalAssignments} évaluations
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-heading font-heading-semibold text-lg text-primary">
                {student?.average}%
              </div>
              <div className={`flex items-center space-x-1 font-caption font-caption-normal text-xs ${
                student?.trend > 0 ? 'text-success' : student?.trend < 0 ? 'text-error' : 'text-muted-foreground'
              }`}>
                <Icon 
                  name={student?.trend > 0 ? 'TrendingUp' : student?.trend < 0 ? 'TrendingDown' : 'Minus'} 
                  size={12} 
                />
                <span>{Math.abs(student?.trend)?.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="font-heading font-heading-semibold text-xl text-text-primary">
            Analyses des notes
          </h2>
          <p className="font-body font-body-normal text-sm text-text-secondary mt-1">
            Moyenne générale: {analyticsData?.overallClassAverage?.toFixed(1)}% • {analyticsData?.totalAssignments} évaluations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            options={viewTypeOptions}
            value={viewType}
            onChange={setViewType}
            className="w-40"
          />
          <Select
            options={periodOptions}
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            className="w-40"
          />
          <Select
            options={categoryOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
            className="w-40"
          />
        </div>
      </div>
      {/* Analytics Content */}
      {viewType === 'overview' && (
        <div className="space-y-6">
          {renderOverviewCharts()}
          {renderStudentRanking()}
        </div>
      )}
      {viewType === 'trends' && (
        <div className="space-y-6">
          {renderTrendsChart()}
          {renderStudentRanking()}
        </div>
      )}
      {viewType === 'distribution' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {renderOverviewCharts()}
          </div>
          <div>
            {renderStudentRanking()}
          </div>
        </div>
      )}
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="font-heading font-heading-semibold text-2xl text-success">
            {analyticsData?.gradeDistribution?.find(g => g?.range?.includes('A'))?.count || 0}
          </div>
          <div className="font-body font-body-normal text-sm text-muted-foreground">
            Notes A (90-100%)
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="font-heading font-heading-semibold text-2xl text-primary">
            {analyticsData?.overallClassAverage?.toFixed(1)}%
          </div>
          <div className="font-body font-body-normal text-sm text-muted-foreground">
            Moyenne générale
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="font-heading font-heading-semibold text-2xl text-warning">
            {analyticsData?.studentTrends?.filter(s => s?.completedAssignments < s?.totalAssignments)?.length}
          </div>
          <div className="font-body font-body-normal text-sm text-muted-foreground">
            Évaluations manquantes
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="font-heading font-heading-semibold text-2xl text-accent">
            {analyticsData?.totalAssignments}
          </div>
          <div className="font-body font-body-normal text-sm text-muted-foreground">
            Total évaluations
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeAnalytics;