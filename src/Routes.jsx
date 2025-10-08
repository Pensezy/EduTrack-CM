import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from "./pages/NotFound";
// Dashboard pages
import LoginAuthentication from "./pages/login-authentication";
import StudentDashboard from "./pages/student-dashboard";
import PrincipalDashboard from "./pages/principal-dashboard";
import SecretaryDashboard from "./pages/secretary-dashboard";
import StudentProfileManagement from "./pages/student-profile-management";
import GradeManagementSystem from "./pages/grade-management-system";
import DocumentManagementHub from "./pages/document-management-hub";
import DocumentManagementCenter from "./pages/document-management-center";
import ParentDashboard from "./pages/parent-dashboard";
import TeacherDashboard from "./pages/teacher-dashboard";
import AdminDashboard from "./pages/admin-dashboard";
import SchoolManagement from "./pages/school-management";
import StaffLogin from "./pages/staff-login";
import NotificationManagement from "./pages/notification-management";
import ReportGeneration from "./pages/report-generation";
import StaffManagement from "./pages/staff-management";
import SchoolSettings from "./pages/school-settings";
import SchoolCalendar from "./pages/school-calendar";
import DataBackup from "./pages/data-backup";
import ProfileSettings from "./pages/profile-settings";
import PasswordRecovery from "./pages/password-recovery";
import PasswordReset from "./pages/password-reset";
import ProductionLogin from "./pages/production-login";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          <Route path="/" element={<SchoolManagement />} />
          <Route path="/demo" element={<LoginAuthentication />} />
          <Route path="/login-authentication" element={<LoginAuthentication />} />
          <Route path="/staff-login" element={<StaffLogin />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/principal-dashboard" element={<PrincipalDashboard />} />
          <Route path="/secretary-dashboard" element={<SecretaryDashboard />} />
          <Route path="/student-profile-management" element={<StudentProfileManagement />} />
          <Route path="/grade-management-system" element={<GradeManagementSystem />} />
          <Route path="/document-management-hub" element={<DocumentManagementHub />} />
          <Route path="/document-management-center" element={<DocumentManagementCenter />} />
          <Route path="/school-management" element={<SchoolManagement />} />
          <Route path="/notification-management" element={<NotificationManagement />} />
          <Route path="/report-generation" element={<ReportGeneration />} />
          <Route path="/staff-management" element={<StaffManagement />} />
          <Route path="/school-settings" element={<SchoolSettings />} />
          <Route path="/school-calendar" element={<SchoolCalendar />} />
          <Route path="/data-backup" element={<DataBackup />} />
          <Route path="/profile-settings" element={<ProfileSettings />} />
          <Route path="/password-recovery" element={<PasswordRecovery />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/production-login" element={<ProductionLogin />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;