/**
 * AttendX — App Root
 * Route definitions + ProtectedRoute wrapper (status gate).
 * Per SRD §10.2 frontend auth flow.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuth from './hooks/useAuth';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import GoogleSetup from './pages/GoogleSetup';
import PendingApproval from './pages/PendingApproval';
import Dashboard from './pages/Dashboard';

/**
 * ProtectedRoute — status gate per PRD §7.1
 *  - Not authenticated → /login
 *  - New Google user (no Firestore doc) → /google-setup
 *  - Status: pending → /pending-approval
 *  - Status: disabled → disabled screen
 *  - Status: active → render children
 */
function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, status, role, isLoading, isNewGoogleUser } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isNewGoogleUser || status === 'new') {
    return <Navigate to="/google-setup" replace />;
  }

  if (status === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (status === 'disabled') {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-coral-500/10 flex items-center justify-center">
            <span className="text-3xl">🚫</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mb-2">Account Disabled</h1>
          <p className="text-sm text-slate-400">
            Your account has been disabled. Contact your admin for help.
          </p>
        </div>
      </div>
    );
  }

  if (requireAdmin && role !== 'admin' && role !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * PublicRoute — redirect to dashboard if already authenticated + active
 */
function PublicRoute({ children }) {
  const { isAuthenticated, status, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && status === 'active') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  // Initialize the auth listener
  useAuth();

  return (
    <BrowserRouter>
      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#f97066', secondary: '#fff' },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Semi-protected (need auth but not active status) */}
        <Route path="/google-setup" element={<GoogleSetup />} />
        <Route path="/pending-approval" element={<PendingApproval />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes (Phase 5) */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requireAdmin>
              <div className="min-h-dvh flex items-center justify-center text-slate-400">
                Admin Dashboard — Coming in Phase 5
              </div>
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
