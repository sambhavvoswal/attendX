import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import api from './services/api';
import { PageShell } from './components/layout/PageShell.jsx';
import { ProtectedRoute } from './components/layout/ProtectedRoute.jsx';
import { Landing } from './pages/Landing.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { GoogleSetup } from './pages/GoogleSetup.jsx';
import { Disabled } from './pages/Disabled.jsx';
import { PendingApproval } from './pages/PendingApproval.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { SheetSetup } from './pages/SheetSetup.jsx';
import { StudentList } from './pages/StudentList.jsx';
import { SheetSettings } from './pages/SheetSettings.jsx';
import TakeAttendance from './pages/TakeAttendance.jsx';
import Analytics from './pages/Analytics.jsx';
import QRGeneratorPage from './pages/QRGeneratorPage.jsx';

// Admin Layer
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { OrgList } from './pages/admin/OrgList.jsx';
import { PendingUsers } from './pages/admin/PendingUsers.jsx';
import { ActiveUsers } from './pages/admin/ActiveUsers.jsx';

export default function App() {
  useAuth();

  // Warm up the backend if hosted on cold-start environments
  useEffect(() => {
    api.get('/ping').catch(() => {});
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/google-setup" element={<GoogleSetup />} />
      <Route path="/disabled" element={<Disabled />} />
      <Route path="/pending-approval" element={<PendingApproval />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PageShell>
              <Dashboard />
            </PageShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sheets/new"
        element={
          <ProtectedRoute>
            <PageShell>
              <SheetSetup />
            </PageShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sheets/:sheetId/students"
        element={
          <ProtectedRoute>
            <PageShell>
              <StudentList />
            </PageShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sheets/:sheetId/attendance"
        element={
          <ProtectedRoute>
            <TakeAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sheets/:sheetId/settings"
        element={
          <ProtectedRoute>
            <PageShell>
              <SheetSettings />
            </PageShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/qr-generator"
        element={
          <ProtectedRoute>
            <PageShell>
              <QRGeneratorPage />
            </PageShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <PageShell>
              <Analytics />
            </PageShell>
          </ProtectedRoute>
        }
      />

      {/* Admin Topology */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['org_admin', 'super_admin']}>
            <PageShell>
              <AdminDashboard />
            </PageShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orgs"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <PageShell>
              <OrgList />
            </PageShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['org_admin', 'super_admin']}>
            <PageShell>
              <ActiveUsers />
            </PageShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pending"
        element={
          <ProtectedRoute allowedRoles={['org_admin', 'super_admin']}>
            <PageShell>
              <PendingUsers />
            </PageShell>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
