import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from './components/ErrorBoundary';
import LoadingFallback from './components/LoadingFallback';
import NotFound from "./pages/NotFound";

// Critical pages - loaded immediately (auth & landing)
import SchoolManagement from "./pages/school-management";
import LoginAuthentication from "./pages/login-authentication";
import StaffLogin from "./pages/staff-login";
import AuthCallback from "./pages/AuthCallback";

// Lazy-loaded Dashboard pages - loaded on demand
const StudentDashboard = lazy(() => import("./pages/student-dashboard"));
const ParentDashboard = lazy(() => import("./pages/parent-dashboard"));
const TeacherDashboard = lazy(() => import("./pages/teacher-dashboard"));
const AdminDashboard = lazy(() => import("./pages/admin-dashboard"));
const PrincipalDashboard = lazy(() => import("./pages/principal-dashboard"));
const SecretaryDashboard = lazy(() => import("./pages/secretary-dashboard"));

// Lazy-loaded Feature pages - loaded on demand
const StudentProfileManagement = lazy(() => import("./pages/student-profile-management"));
const GradeManagementSystem = lazy(() => import("./pages/grade-management-system"));
const DocumentManagementHub = lazy(() => import("./pages/document-management-hub"));
const DocumentManagementCenter = lazy(() => import("./pages/document-management-center"));
const NotificationManagement = lazy(() => import("./pages/notification-management"));
const ReportGeneration = lazy(() => import("./pages/report-generation"));
const StaffManagement = lazy(() => import("./pages/staff-management"));
const SchoolSettings = lazy(() => import("./pages/school-settings"));
const SchoolCalendar = lazy(() => import("./pages/school-calendar"));
const DataBackup = lazy(() => import("./pages/data-backup"));
const ProfileSettings = lazy(() => import("./pages/profile-settings"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));

// Lazy-loaded Auth pages - rarely used
const PasswordRecovery = lazy(() => import("./pages/password-recovery"));
const PasswordReset = lazy(() => import("./pages/password-reset"));
const ProductionLogin = lazy(() => import("./pages/production-login"));

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <Suspense fallback={<LoadingFallback />}>
          <RouterRoutes>
            {/* Critical routes - loaded immediately */}
            <Route path="/" element={<SchoolManagement />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/demo" element={<LoginAuthentication />} />
            <Route path="/login-authentication" element={<LoginAuthentication />} />
            <Route path="/staff-login" element={<StaffLogin />} />
            <Route path="/school-management" element={<SchoolManagement />} />

            {/* Dashboard routes - lazy loaded */}
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/parent-dashboard" element={<ParentDashboard />} />
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/principal-dashboard" element={<PrincipalDashboard />} />
            <Route path="/secretary-dashboard" element={<SecretaryDashboard />} />

            {/* Feature routes - lazy loaded */}
            <Route path="/student-profile-management" element={<StudentProfileManagement />} />
            <Route path="/grade-management-system" element={<GradeManagementSystem />} />
            <Route path="/document-management-hub" element={<DocumentManagementHub />} />
            <Route path="/document-management-center" element={<DocumentManagementCenter />} />
            <Route path="/notification-management" element={<NotificationManagement />} />
            <Route path="/report-generation" element={<ReportGeneration />} />
            <Route path="/staff-management" element={<StaffManagement />} />
            <Route path="/school-settings" element={<SchoolSettings />} />
            <Route path="/school-calendar" element={<SchoolCalendar />} />
            <Route path="/data-backup" element={<DataBackup />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
            <Route path="/help" element={<HelpCenter />} />

            {/* Auth routes - lazy loaded */}
            <Route path="/password-recovery" element={<PasswordRecovery />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/production-login" element={<ProductionLogin />} />

            {/* 404 - loaded immediately */}
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;