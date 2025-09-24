import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Admin Dashboard Components

const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock admin data
  const adminData = {
    id: "admin-001",
    name: "Administrateur Système", 
    email: "admin@edutrack.cm",
    role: "super_admin",
    permissions: ["system_admin", "user_management", "security_monitoring", "analytics_access"]
  };

  // Mock system metrics
  const systemMetrics = {
    totalUsers: 2847,
    totalStudents: 1856,
    totalTeachers: 234,
    totalParents: 1234,
    activeSchools: 15,
    systemUptime: 99.8,
    databaseHealth: 100,
    storageUsage: 68.5,
    dailyActiveUsers: 1456,
    weeklySignups: 87,
    criticalAlerts: 3,
    pendingApprovals: 12
  };

  // Mock analytics data
  const analyticsData = {
    userGrowth: [
      { month: 'Jan', users: 1200, students: 800, teachers: 45, parents: 355 },
      { month: 'Feb', users: 1350, students: 890, teachers: 52, parents: 408 },
      { month: 'Mar', users: 1580, students: 1020, students: 1020, teachers: 68, parents: 492 },
      { month: 'Apr', users: 1820, students: 1180, teachers: 85, parents: 555 },
      { month: 'May', users: 2100, students: 1350, teachers: 102, parents: 648 },
      { month: 'Jun', users: 2380, students: 1520, teachers: 125, parents: 735 },
      { month: 'Jul', users: 2650, students: 1690, teachers: 148, parents: 812 },
      { month: 'Aug', users: 2847, students: 1856, teachers: 234, parents: 1234 }
    ],
    schoolActivity: [
      { name: 'Lycée Bilingue Biyem-Assi', students: 456, teachers: 28, activity: 95 },
      { name: 'Collège La Rochelle Douala', students: 387, teachers: 24, activity: 92 },
      { name: 'Lycée de Bonamoussadi', students: 298, teachers: 19, activity: 87 },
      { name: 'Collège Vogt Yaoundé', students: 234, teachers: 15, activity: 84 },
      { name: 'Lycée Général Leclerc', students: 187, teachers: 12, activity: 78 }
    ],
    platformUsage: [
      { feature: 'Grades Management', usage: 89, users: 1245 },
      { feature: 'Attendance Tracking', usage: 76, users: 987 },
      { feature: 'Payment Processing', usage: 65, users: 756 },
      { feature: 'Document Sharing', usage: 58, users: 623 },
      { feature: 'Communication', usage: 72, users: 834 },
      { feature: 'Analytics', usage: 34, users: 298 }
    ]
  };

  // Mock security data
  const securityData = {
    recentAlerts: [
      { id: 1, type: 'failed_login', severity: 'medium', message: 'Multiple failed login attempts', user: 'unknown', time: '2 min ago', location: 'Douala' },
      { id: 2, type: 'suspicious_activity', severity: 'high', message: 'Unusual grade modification pattern', user: 'teacher.math@demo.cm', time: '15 min ago', location: 'Yaoundé' },
      { id: 3, type: 'data_access', severity: 'low', message: 'Bulk student data export', user: 'admin@demo.cm', time: '1 hour ago', location: 'Bafoussam' }
    ],
    systemStatus: {
      firewall: 'active',
      authentication: 'secure',
      dataEncryption: 'enabled',
      backupStatus: 'completed',
      lastSecurityScan: '2024-11-19T02:30:00Z'
    }
  };

  // Mock audit trail
  const auditTrail = [
    { id: 1, action: 'User Created', actor: 'admin@demo.cm', target: 'student.new@demo.cm', timestamp: '2024-11-19T10:30:00Z', details: 'New student account created' },
    { id: 2, action: 'Grade Modified', actor: 'teacher.math@demo.cm', target: 'Paul Kamga', timestamp: '2024-11-19T09:45:00Z', details: 'Mathematics grade updated: 15/20' },
    { id: 3, action: 'Payment Processed', actor: 'system', target: 'Payment #PAY-001', timestamp: '2024-11-19T08:20:00Z', details: 'MTN Mobile Money - 150,000 FCFA' },
    { id: 4, action: 'User Login', actor: 'parent@demo.cm', target: 'System', timestamp: '2024-11-19T07:15:00Z', details: 'Successful login from mobile app' },
    { id: 5, action: 'Settings Updated', actor: 'admin@demo.cm', target: 'System Configuration', timestamp: '2024-11-18T16:30:00Z', details: 'Notification settings modified' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime?.getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR')?.format(num);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    })?.format(amount);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-error bg-error/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'low': return 'text-primary bg-primary/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const renderSystemOverview = () => (
    <div className="space-y-6">
      {/* System Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg shadow-card border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-caption font-caption-normal text-sm text-muted-foreground">Total Users</p>
              <p className="font-heading font-heading-bold text-2xl text-card-foreground mt-1">
                {formatNumber(systemMetrics?.totalUsers)}
              </p>
              <p className="font-caption font-caption-normal text-xs text-success mt-1">
                +{formatNumber(87)} this week
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="Users" size={24} className="text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-card border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-caption font-caption-normal text-sm text-muted-foreground">Active Schools</p>
              <p className="font-heading font-heading-bold text-2xl text-card-foreground mt-1">
                {systemMetrics?.activeSchools}
              </p>
              <p className="font-caption font-caption-normal text-xs text-primary mt-1">
                100% operational
              </p>
            </div>
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
              <Icon name="School" size={24} className="text-secondary" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-card border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-caption font-caption-normal text-sm text-muted-foreground">System Uptime</p>
              <p className="font-heading font-heading-bold text-2xl text-card-foreground mt-1">
                {systemMetrics?.systemUptime}%
              </p>
              <p className="font-caption font-caption-normal text-xs text-success mt-1">
                30 days avg
              </p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
              <Icon name="Activity" size={24} className="text-success" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-card border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-caption font-caption-normal text-sm text-muted-foreground">Critical Alerts</p>
              <p className="font-heading font-heading-bold text-2xl text-card-foreground mt-1">
                {systemMetrics?.criticalAlerts}
              </p>
              <p className="font-caption font-caption-normal text-xs text-warning mt-1">
                Require attention
              </p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
              <Icon name="AlertTriangle" size={24} className="text-warning" />
            </div>
          </div>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-card rounded-lg shadow-card border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">User Growth Trends</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="font-caption font-caption-normal text-xs text-muted-foreground">Students</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-secondary rounded-full"></div>
              <span className="font-caption font-caption-normal text-xs text-muted-foreground">Teachers</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <span className="font-caption font-caption-normal text-xs text-muted-foreground">Parents</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData?.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="students" stroke="#2A5CAA" strokeWidth={2} />
              <Line type="monotone" dataKey="teachers" stroke="#F4C430" strokeWidth={2} />
              <Line type="monotone" dataKey="parents" stroke="#1B3B5F" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* School Activity and Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg shadow-card border border-border p-6">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">School Activity</h3>
          <div className="space-y-4">
            {analyticsData?.schoolActivity?.slice(0, 5)?.map((school, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-body font-body-semibold text-sm text-card-foreground">
                    {school?.name}
                  </p>
                  <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                    {school?.students} étudiants • {school?.teachers} professeurs
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-body font-body-semibold text-sm text-primary">
                    {school?.activity}%
                  </p>
                  <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                    activity
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-card border border-border p-6">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">Security Alerts</h3>
          <div className="space-y-3">
            {securityData?.recentAlerts?.map((alert) => (
              <div key={alert?.id} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  alert?.severity === 'high' ? 'bg-error' :
                  alert?.severity === 'medium' ? 'bg-warning' : 'bg-primary'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-body font-body-semibold text-sm text-card-foreground">
                    {alert?.message}
                  </p>
                  <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                    {alert?.user} • {alert?.location} • {alert?.time}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-caption font-caption-semibold ${getSeverityColor(alert?.severity)}`}>
                  {alert?.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      {/* User Type Distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg shadow-card border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="GraduationCap" size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-body font-body-semibold text-lg text-card-foreground">
                {formatNumber(systemMetrics?.totalStudents)}
              </p>
              <p className="font-caption font-caption-normal text-xs text-muted-foreground">Students</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-card border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
              <Icon name="BookOpen" size={20} className="text-secondary" />
            </div>
            <div>
              <p className="font-body font-body-semibold text-lg text-card-foreground">
                {formatNumber(systemMetrics?.totalTeachers)}
              </p>
              <p className="font-caption font-caption-normal text-xs text-muted-foreground">Teachers</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-card border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
              <Icon name="Users" size={20} className="text-accent-foreground" />
            </div>
            <div>
              <p className="font-body font-body-semibold text-lg text-card-foreground">
                {formatNumber(systemMetrics?.totalParents)}
              </p>
              <p className="font-caption font-caption-normal text-xs text-muted-foreground">Parents</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-card border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
              <Icon name="UserCheck" size={20} className="text-success" />
            </div>
            <div>
              <p className="font-body font-body-semibold text-lg text-card-foreground">
                {formatNumber(systemMetrics?.dailyActiveUsers)}
              </p>
              <p className="font-caption font-caption-normal text-xs text-muted-foreground">Active Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Actions */}
      <div className="bg-card rounded-lg shadow-card border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">User Management</h3>
          <div className="flex space-x-2">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-body font-body-normal hover:bg-primary/90 transition-micro">
              Create User
            </button>
            <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-body font-body-normal hover:bg-secondary/90 transition-micro">
              Bulk Import
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-micro cursor-pointer">
            <div className="flex items-center space-x-3">
              <Icon name="UserPlus" size={20} className="text-primary" />
              <div>
                <p className="font-body font-body-semibold text-sm text-card-foreground">Add New User</p>
                <p className="font-caption font-caption-normal text-xs text-muted-foreground">Create individual accounts</p>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-micro cursor-pointer">
            <div className="flex items-center space-x-3">
              <Icon name="Settings" size={20} className="text-secondary" />
              <div>
                <p className="font-body font-body-semibold text-sm text-card-foreground">Manage Roles</p>
                <p className="font-caption font-caption-normal text-xs text-muted-foreground">Configure permissions</p>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-micro cursor-pointer">
            <div className="flex items-center space-x-3">
              <Icon name="Shield" size={20} className="text-accent-foreground" />
              <div>
                <p className="font-body font-body-semibold text-sm text-card-foreground">Security Settings</p>
                <p className="font-caption font-caption-normal text-xs text-muted-foreground">Password & authentication</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Platform Usage Metrics */}
      <div className="bg-card rounded-lg shadow-card border border-border p-6">
        <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">Platform Usage Analytics</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData?.platformUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="feature" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="usage" fill="#2A5CAA" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg shadow-card border border-border p-6">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">Feature Adoption</h3>
          <div className="space-y-3">
            {analyticsData?.platformUsage?.map((feature, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="font-body font-body-normal text-sm text-card-foreground">
                  {feature?.feature}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div 
                      className="h-2 bg-primary rounded-full" 
                      style={{ width: `${feature?.usage}%` }}
                    />
                  </div>
                  <span className="font-caption font-caption-semibold text-xs text-muted-foreground w-8">
                    {feature?.usage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-card border border-border p-6">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">System Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-body font-body-normal text-sm text-card-foreground">Database Response</span>
              <span className="font-body font-body-semibold text-sm text-success">45ms avg</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body font-body-normal text-sm text-card-foreground">API Latency</span>
              <span className="font-body font-body-semibold text-sm text-success">120ms avg</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body font-body-normal text-sm text-card-foreground">Page Load Time</span>
              <span className="font-body font-body-semibold text-sm text-primary">2.1s avg</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body font-body-normal text-sm text-card-foreground">Storage Usage</span>
              <span className="font-body font-body-semibold text-sm text-warning">{systemMetrics?.storageUsage}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAuditTrail = () => (
    <div className="bg-card rounded-lg shadow-card border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">System Audit Trail</h3>
        <div className="flex space-x-2">
          <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-body font-body-normal hover:bg-secondary/90 transition-micro">
            Export Logs
          </button>
          <button className="bg-muted text-muted-foreground px-4 py-2 rounded-lg text-sm font-body font-body-normal hover:bg-muted/80 transition-micro">
            Filter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Action</th>
              <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Actor</th>
              <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Target</th>
              <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Timestamp</th>
              <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Details</th>
            </tr>
          </thead>
          <tbody>
            {auditTrail?.map((entry) => (
              <tr key={entry?.id} className="border-b border-border hover:bg-muted/20 transition-micro">
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-caption font-caption-semibold bg-primary/10 text-primary">
                    {entry?.action}
                  </span>
                </td>
                <td className="py-3 px-4 font-body font-body-normal text-sm text-card-foreground">
                  {entry?.actor}
                </td>
                <td className="py-3 px-4 font-body font-body-normal text-sm text-muted-foreground">
                  {entry?.target}
                </td>
                <td className="py-3 px-4 font-caption font-caption-normal text-xs text-muted-foreground">
                  {new Date(entry?.timestamp)?.toLocaleString('fr-FR')}
                </td>
                <td className="py-3 px-4 font-body font-body-normal text-sm text-muted-foreground">
                  {entry?.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'BarChart3' },
    { id: 'users', label: 'Utilisateurs', icon: 'Users' },
    { id: 'analytics', label: 'Analytics', icon: 'TrendingUp' },
    { id: 'audit', label: 'Journal d\'audit', icon: 'FileText' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userRole="admin" 
        userName={adminData?.name}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Sidebar 
        userRole="admin"
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className={`pt-16 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        <div className="p-4 lg:p-6 space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="font-heading font-heading-bold text-2xl lg:text-3xl mb-2">
                  {getGreeting()}, {adminData?.name?.split(' ')?.[0]} ! 🔧
                </h1>
                <p className="font-body font-body-normal text-white/90 mb-4 lg:mb-0">
                  Surveillance et gestion globale de la plateforme EduTrack CM. Toutes les écoles, tous les utilisateurs.
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="bg-white/20 rounded-lg px-3 py-1">
                    <span className="font-caption font-caption-semibold text-sm">
                      {formatNumber(systemMetrics?.totalUsers)} utilisateurs
                    </span>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-1">
                    <span className="font-caption font-caption-semibold text-sm">
                      {systemMetrics?.activeSchools} écoles actives
                    </span>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-1">
                    <span className="font-caption font-caption-semibold text-sm">
                      Uptime {systemMetrics?.systemUptime}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="font-heading font-heading-bold text-xl">
                    {currentTime?.toLocaleDateString('fr-FR', { 
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                  <div className="font-caption font-caption-normal text-sm text-white/80">
                    {currentTime?.toLocaleTimeString('fr-FR', { 
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-card rounded-lg shadow-card border border-border p-1">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-body font-body-normal whitespace-nowrap transition-micro ${
                    activeTab === tab?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  <span>{tab?.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="min-h-[600px]">
            {activeTab === 'overview' && renderSystemOverview()}
            {activeTab === 'users' && renderUserManagement()}
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'audit' && renderAuditTrail()}
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-lg shadow-card border border-border p-6">
            <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
              Actions Rapides Administrateur
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <Link
                to="/teacher-account-management"
                className="flex flex-col items-center p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-micro group"
              >
                <Icon name="UserPlus" size={24} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Gestion Enseignants
                </span>
              </Link>
              
              <Link
                to="/teacher-assignment-system"
                className="flex flex-col items-center p-4 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-micro group"
              >
                <Icon name="Users" size={24} className="text-secondary mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Affectations
                </span>
              </Link>

              <Link
                to="/admin-dashboard?tab=system"
                className="flex flex-col items-center p-4 rounded-lg bg-success/5 hover:bg-success/10 transition-micro group"
              >
                <Icon name="Database" size={24} className="text-success mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Base de Données
                </span>
              </Link>

              <Link
                to="/admin-dashboard?tab=security"
                className="flex flex-col items-center p-4 rounded-lg bg-warning/5 hover:bg-warning/10 transition-micro group"
              >
                <Icon name="Shield" size={24} className="text-warning mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Sécurité
                </span>
              </Link>

              <Link
                to="/admin-dashboard?tab=settings"
                className="flex flex-col items-center p-4 rounded-lg bg-accent/5 hover:bg-accent/10 transition-micro group"
              >
                <Icon name="Settings" size={24} className="text-accent-foreground mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Configuration
                </span>
              </Link>

              <Link
                to="/admin-dashboard?tab=alerts"
                className="flex flex-col items-center p-4 rounded-lg bg-error/5 hover:bg-error/10 transition-micro group"
              >
                <Icon name="AlertTriangle" size={24} className="text-error mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Alertes Système
                </span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;