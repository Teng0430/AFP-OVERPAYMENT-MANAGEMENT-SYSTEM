import { lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import AuthLayout from '@/components/layout/AuthLayout';
import AppShell from '@/components/layout/AppShell';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { Toaster } from '@/components/ui/toaster';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const PensionersPage = lazy(() => import('@/pages/PensionersPage'));
const AddPensionerPage = lazy(() => import('@/pages/AddPensionerPage'));
const EditPensionerPage = lazy(() => import('@/pages/EditPensionerPage'));
const UploadPage = lazy(() => import('@/pages/UploadPage'));
const RecoveryLedgerPage = lazy(() => import('@/pages/RecoveryLedgerPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const AlertsPage = lazy(() => import('@/pages/AlertsPage'));
const ActivityLogsPage = lazy(() => import('@/pages/ActivityLogsPage'));
const UserManagementPage = lazy(() => import('@/pages/UserManagementPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const PensionerPrintViewPage = lazy(() => import('@/pages/PensionerPrintViewPage'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<><AppShell /><Toaster /></>}>
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="pensioners" element={<PensionersPage />} />
              <Route path="pensioners/add" element={<AddPensionerPage />} />
              <Route path="pensioners/:id/edit" element={<EditPensionerPage />} />
<<<<<<< HEAD
=======
              <Route path="pensioners/:id/print" element={<PensionerPrintViewPage />} />
>>>>>>> 885f6e46fde5ccc3d66d67570c482cdded90d7da
              <Route path="upload" element={<UploadPage />} />
              <Route path="monitoring" element={<ActivityLogsPage />} />
              <Route path="recovery-ledger" element={<RecoveryLedgerPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="activity-logs" element={<ActivityLogsPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
