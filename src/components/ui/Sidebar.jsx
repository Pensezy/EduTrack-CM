import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Sidebar = ({ userRole = 'student', isCollapsed = false, onToggle }) => {
  const location = useLocation();

  const navigationItems = {
    student: [
      { label: 'Dashboard', path: '/student-dashboard', icon: 'Home', description: 'Overview and quick actions' },
      { label: 'My Profile', path: '/student-profile-management', icon: 'User', description: 'Personal information' },
      { label: 'My Grades', path: '/grade-management-system', icon: 'BookOpen', description: 'Academic performance' },
    ],
    secretary: [
      { label: 'Dashboard', path: '/secretary-dashboard', icon: 'Home', description: 'Administrative overview' },
      { label: 'Student Management', path: '/student-profile-management', icon: 'Users', description: 'Manage student records' },
      { label: 'Grade Management', path: '/grade-management-system', icon: 'BookOpen', description: 'Academic records' },
    ],
    principal: [
      { label: 'Dashboard', path: '/principal-dashboard', icon: 'Home', description: 'Executive overview' },
      { label: 'Student Analytics', path: '/student-profile-management', icon: 'Users', description: 'Student insights' },
      { label: 'Academic Analytics', path: '/grade-management-system', icon: 'BarChart3', description: 'Performance metrics' },
    ]
  };

  const quickActions = {
    student: [
      { label: 'View Assignments', icon: 'FileText', action: () => console.log('View assignments') },
      { label: 'Check Attendance', icon: 'Calendar', action: () => console.log('Check attendance') },
    ],
    secretary: [
      { label: 'Add Student', icon: 'UserPlus', action: () => console.log('Add student') },
      { label: 'Generate Report', icon: 'FileBarChart', action: () => console.log('Generate report') },
      { label: 'Send Notice', icon: 'Mail', action: () => console.log('Send notice') },
    ],
    principal: [
      { label: 'View Reports', icon: 'FileBarChart', action: () => console.log('View reports') },
      { label: 'School Analytics', icon: 'TrendingUp', action: () => console.log('School analytics') },
    ]
  };

  const currentNavItems = navigationItems?.[userRole] || navigationItems?.student;
  const currentQuickActions = quickActions?.[userRole] || quickActions?.student;

  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r border-border z-navigation transition-all duration-state ${
      isCollapsed ? 'w-16' : 'w-64'
    } lg:fixed`}>
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isCollapsed && (
            <h2 className="font-heading font-heading-semibold text-lg text-card-foreground">
              Navigation
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="hidden lg:flex"
          >
            <Icon name={isCollapsed ? "ChevronRight" : "ChevronLeft"} size={20} />
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="space-y-1">
            {!isCollapsed && (
              <h3 className="font-caption font-caption-normal text-xs text-muted-foreground uppercase tracking-wider mb-3">
                Main Menu
              </h3>
            )}
            {currentNavItems?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-body font-body-normal transition-micro group ${
                  location?.pathname === item?.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-card-foreground hover:bg-muted hover:text-primary'
                }`}
                title={isCollapsed ? item?.label : ''}
              >
                <Icon 
                  name={item?.icon} 
                  size={20} 
                  className={`flex-shrink-0 ${
                    location?.pathname === item?.path ? 'text-primary-foreground' : ''
                  }`}
                />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-body font-body-semibold">{item?.label}</div>
                    <div className="font-caption font-caption-normal text-xs text-muted-foreground group-hover:text-primary/70">
                      {item?.description}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="pt-6">
            {!isCollapsed && (
              <h3 className="font-caption font-caption-normal text-xs text-muted-foreground uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
            )}
            <div className="space-y-1">
              {currentQuickActions?.map((action, index) => (
                <button
                  key={index}
                  onClick={action?.action}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-body font-body-normal text-card-foreground hover:bg-muted hover:text-primary transition-micro w-full text-left"
                  title={isCollapsed ? action?.label : ''}
                >
                  <Icon name={action?.icon} size={20} className="flex-shrink-0" />
                  {!isCollapsed && <span>{action?.label}</span>}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-border">
          {!isCollapsed ? (
            <div className="bg-muted rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Lightbulb" size={16} className="text-accent" />
                <span className="font-caption font-caption-normal text-xs text-muted-foreground">
                  Tip
                </span>
              </div>
              <p className="font-body font-body-normal text-xs text-card-foreground">
                Use keyboard shortcuts to navigate faster. Press '?' for help.
              </p>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="w-full"
              title="Help & Tips"
            >
              <Icon name="Lightbulb" size={20} />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;