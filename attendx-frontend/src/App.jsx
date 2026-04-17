import { Navigate, Route, Routes } from 'react-router-dom';
import { PageShell } from './components/layout/PageShell.jsx';
import { ProtectedRoute } from './components/layout/ProtectedRoute.jsx';
import { Landing } from './pages/Landing.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { GoogleSetup } from './pages/GoogleSetup.jsx';
import { Disabled } from './pages/Disabled.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { SheetSetup } from './pages/SheetSetup.jsx';
import { StudentList } from './pages/StudentList.jsx';
import { SheetSettings } from './pages/SheetSettings.jsx';
import TakeAttendance from './pages/TakeAttendance.jsx';
import QRGeneratorPage from './pages/QRGeneratorPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/google-setup" element={<GoogleSetup />} />
      <Route path="/disabled" element={<Disabled />} />

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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
