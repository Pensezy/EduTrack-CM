import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppIcon from '../AppIcon';
import Button from './Button';

const Header = ({ userRole = 'student', userName = 'User', isCollapsed = false, onToggleSidebar }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();

  const navigationItems = {
    student: [
      { label: 'Dashboard', path: '/student-dashboard', icon: 'Home' },
      { label: 'Profile', path: '/student-profile-management', icon: 'User' },
      { label: 'Grades', path: '/grade-management-system', icon: 'BookOpen' },
    ],
    teacher: [
      { label: 'Dashboard', path: '/teacher-dashboard', icon: 'Home' },
      { label: 'Assignments', path: '/teacher-assignment-system', icon: 'FileText' },
      { label: 'Account', path: '/teacher-account-management', icon: 'User' },
    ],
    secretary: [
      { label: 'Dashboard', path: '/secretary-dashboard', icon: 'Home' },
      { label: 'Document Center', path: '/document-management-center', icon: 'FileText' },
      { label: 'Students', path: '/student-profile-management', icon: 'Users' },
      { label: 'Grade Reports', path: '/grade-management-system', icon: 'BookOpen' },
    ],
    principal: [
      { label: 'Dashboard', path: '/principal-dashboard', icon: 'Home' },
      { label: 'School Analytics', path: '/grade-management-system', icon: 'BarChart3' },
      { label: 'Documents', path: '/document-management-hub', icon: 'FileText' },
      { label: 'Teacher Management', path: '/teacher-account-management', icon: 'Users' },
    ],
    admin: [
      { label: 'Dashboard', path: '/admin-dashboard', icon: 'Home' },
      { label: 'System Management', path: '/admin-dashboard', icon: 'Settings' },
      { label: 'User Management', path: '/admin-dashboard', icon: 'Users' },
      { label: 'Analytics', path: '/admin-dashboard', icon: 'BarChart3' },
    ]
  };

  const currentNavItems = navigationItems?.[userRole] || navigationItems?.student;

  const notifications = [
    { id: 1, title: 'New grade posted', message: 'Mathematics - Assignment 3', time: '2 min ago', type: 'success' },
    { id: 2, title: 'Parent meeting scheduled', message: 'Tomorrow at 2:00 PM', time: '1 hour ago', type: 'warning' },
    { id: 3, title: 'System maintenance', message: 'Scheduled for tonight', time: '3 hours ago', type: 'info' },
  ];

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsProfileOpen(false);
  };

  const handleProfileClick = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationOpen(false);
  };

  const handleLogout = () => {
    // Handle logout logic
    window.location.href = '/login-authentication';
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-surface border-b border-border z-navigation">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left Section - Logo and Navigation */}
        <div className="flex items-center space-x-6">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <AppIcon name="Menu" size={20} />
          </Button>

          {/* Logo */}
          <Link to={currentNavItems?.[0]?.path || '/'} className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-transparent">
              <img
                src="/assets/images/mon_logo.png"
                alt="Logo EduTrack CM"
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="font-heading font-heading-bold text-xl text-primary hidden sm:block">
              EduTrack CM
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {currentNavItems?.slice(0, 4)?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-body font-body-normal transition-micro ${
                  location?.pathname === item?.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-text-primary hover:bg-muted hover:text-primary'
                }`}
              >
                <AppIcon name={item?.icon} size={16} />
                <span>{item?.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Section - Actions and Profile */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNotificationClick}
              className="relative"
            >
              <AppIcon name="Bell" size={20} />
              {notifications?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-caption font-caption-normal">
                  {notifications?.length}
                </span>
              )}
            </Button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 top-12 w-80 bg-popover border border-border rounded-lg shadow-modal z-notification">
                <div className="p-4 border-b border-border">
                  <h3 className="font-heading font-heading-semibold text-sm text-popover-foreground">
                    Notifications
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications?.map((notification) => (
                    <div
                      key={notification?.id}
                      className="p-4 border-b border-border last:border-b-0 hover:bg-muted transition-micro cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification?.type === 'success' ? 'bg-success' :
                          notification?.type === 'warning' ? 'bg-warning' : 'bg-primary'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-body font-body-semibold text-sm text-popover-foreground">
                            {notification?.title}
                          </p>
                          <p className="font-body font-body-normal text-sm text-muted-foreground mt-1">
                            {notification?.message}
                          </p>
                          <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-1">
                            {notification?.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-border">
                  <Button variant="ghost" size="sm" className="w-full">
                    View all notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={handleProfileClick}
              className="flex items-center space-x-2 px-3 py-2"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <AppIcon name="User" size={16} color="white" />
              </div>
              <span className="font-body font-body-normal text-sm text-text-primary hidden md:block">
                {userName}
              </span>
              <AppIcon name="ChevronDown" size={16} className="hidden md:block" />
            </Button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 top-12 w-48 bg-popover border border-border rounded-lg shadow-modal z-notification">
                <div className="p-2">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="font-body font-body-semibold text-sm text-popover-foreground">
                      {userName}
                    </p>
                    <p className="font-caption font-caption-normal text-xs text-muted-foreground capitalize">
                      {userRole}
                    </p>
                  </div>
                  <Link
                    to="/student-profile-management"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-popover-foreground hover:bg-muted rounded-md transition-micro"
                  >
                    <AppIcon name="Settings" size={16} />
                    <span>Settings</span>
                  </Link>
                  <Link
                    to="/help"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-popover-foreground hover:bg-muted rounded-md transition-micro"
                  >
                    <AppIcon name="HelpCircle" size={16} />
                    <span>Help</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-error hover:bg-muted rounded-md transition-micro w-full text-left"
                  >
                    <AppIcon name="LogOut" size={16} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;