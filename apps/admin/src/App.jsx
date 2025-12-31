import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@edutrack/api';
import AdminLayout from './components/Layout/AdminLayout';
import Login from './pages/Auth/Login';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import SchoolsPage from './pages/Schools/SchoolsPage';
import UsersPage from './pages/Users/UsersPage';
import ClassesPage from './pages/Classes/ClassesPage';
import EnrollmentPage from './pages/Enrollment/EnrollmentPage';
import PersonnelPage from './pages/Personnel/PersonnelPage';
import SettingsPage from './pages/Settings/SettingsPage';

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

  // Check if user has admin or principal role
  if (user.role !== 'admin' && user.role !== 'principal') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès Refusé</h1>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires.</p>
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
        <Route index element={<AdminDashboard />} />
        <Route path="schools" element={<SchoolsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="enrollment" element={<EnrollmentPage />} />
        <Route path="personnel" element={<PersonnelPage />} />
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
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
