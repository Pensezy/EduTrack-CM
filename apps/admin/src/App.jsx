import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AppsProvider, useAuth } from '@edutrack/api';
import AdminLayout from './components/Layout/AdminLayout';
import Login from './pages/Auth/Login';
// Dashboards par rôle
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import PrincipalDashboard from './pages/Dashboard/PrincipalDashboard';
import SecretaryDashboard from './pages/Dashboard/SecretaryDashboard';
import TeacherDashboard from './pages/Dashboard/TeacherDashboard';
import ParentDashboard from './pages/Dashboard/ParentDashboard';
import StudentDashboard from './pages/Dashboard/StudentDashboard';
// Pages Admin/Principal
import SchoolsPage from './pages/Schools/SchoolsPage';
import SchoolRequestsPage from './pages/SchoolRequests';
import UsersPage from './pages/Users/UsersPage';
import ClassesPage from './pages/Classes/ClassesPage';
import EnrollmentPage from './pages/Enrollment/EnrollmentPage';
import PersonnelPage from './pages/Personnel/PersonnelPage';
import SettingsPage from './pages/Settings/SettingsPage';
import AppStorePage from './pages/AppStore/AppStorePage';
import MyAppsPage from './pages/MyApps/MyAppsPage';
import AppsCatalogPage from './pages/AppsCatalog/AppsCatalogPage';
import AppAccessRequestsPage from './pages/AppAccessRequests/AppAccessRequestsPage';
import BundlesCatalogPage from './pages/Bundles/BundlesCatalogPage';
import BundleRequestsPage from './pages/Bundles/BundleRequestsPage';
import ManageBundlesPage from './pages/Bundles/ManageBundlesPage';
// Pages Secrétaire
import SecretaryStudentsPage from './pages/Secretary/StudentsPage';
import SecretaryEnrollmentPage from './pages/Secretary/EnrollmentPage';
import SecretaryPaymentsPage from './pages/Secretary/PaymentsPage';
// Pages Enseignant
import TeacherClassesPage from './pages/Teacher/ClassesPage';
import TeacherAttendancePage from './pages/Teacher/AttendancePage';
import TeacherStudentsPage from './pages/Teacher/StudentsPage';
// Pages Parent
import ParentChildrenPage from './pages/Parent/ChildrenPage';
import ParentAttendancePage from './pages/Parent/AttendancePage';
import ParentPaymentsPage from './pages/Parent/PaymentsPage';
// Pages Élève
import StudentSchedulePage from './pages/Student/SchedulePage';
import StudentAttendancePage from './pages/Student/AttendancePage';
import StudentProfilePage from './pages/Student/ProfilePage';

// Dashboard Router - Render correct dashboard based on role
function DashboardRouter() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'principal':
      return <PrincipalDashboard />;
    case 'secretary':
      return <SecretaryDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'parent':
      return <ParentDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}

// Rôles autorisés pour accéder à l'application
const ALLOWED_ROLES = ['admin', 'principal', 'secretary', 'teacher', 'parent', 'student'];

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Vérifier si l'utilisateur a un rôle autorisé
  if (!ALLOWED_ROLES.includes(user.role)) {
    console.error('❌ Accès refusé - Rôle actuel:', user.role, '| Email:', user.email);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto text-center p-8">
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-red-200">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès Refusé</h1>
            <p className="text-gray-600 mb-4">Votre rôle ne vous permet pas d'accéder à cette application.</p>
            <div className="bg-gray-50 rounded-lg p-4 text-left mb-4">
              <p className="text-sm text-gray-700">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Rôle actuel:</strong> <span className="font-mono text-red-600">{user.role || 'non défini'}</span>
              </p>
            </div>
            <p className="text-xs text-gray-500">
              Contactez un administrateur pour obtenir les autorisations nécessaires.
            </p>
            <button
              onClick={() => {
                window.location.href = '/login';
              }}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Route */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard - Adapté selon le rôle */}
        <Route index element={<DashboardRouter />} />

        {/* Routes Admin & Principal */}
        <Route path="schools" element={<SchoolsPage />} />
        <Route path="schools/requests" element={<SchoolRequestsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="enrollment" element={<EnrollmentPage />} />
        <Route path="personnel" element={<PersonnelPage />} />
        <Route path="apps-catalog" element={<AppsCatalogPage />} />
        <Route path="app-requests" element={<AppAccessRequestsPage />} />
        <Route path="bundles-catalog" element={<BundlesCatalogPage />} />
        <Route path="bundle-requests" element={<BundleRequestsPage />} />
        <Route path="manage-bundles" element={<ManageBundlesPage />} />
        <Route path="app-store" element={<AppStorePage />} />
        <Route path="my-apps" element={<MyAppsPage />} />

        {/* Routes Secrétaire */}
        <Route path="secretary/students" element={<SecretaryStudentsPage />} />
        <Route path="secretary/enrollment" element={<SecretaryEnrollmentPage />} />
        <Route path="secretary/payments" element={<SecretaryPaymentsPage />} />

        {/* Routes Enseignant */}
        <Route path="teacher/classes" element={<TeacherClassesPage />} />
        <Route path="teacher/attendance" element={<TeacherAttendancePage />} />
        <Route path="teacher/students" element={<TeacherStudentsPage />} />

        {/* Routes Parent */}
        <Route path="parent/children" element={<ParentChildrenPage />} />
        <Route path="parent/attendance" element={<ParentAttendancePage />} />
        <Route path="parent/payments" element={<ParentPaymentsPage />} />

        {/* Routes Élève */}
        <Route path="student/schedule" element={<StudentSchedulePage />} />
        <Route path="student/attendance" element={<StudentAttendancePage />} />
        <Route path="student/profile" element={<StudentProfilePage />} />

        {/* Paramètres - Commun à tous */}
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppsProvider includeCatalog={true}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppsProvider>
    </AuthProvider>
  );
}
