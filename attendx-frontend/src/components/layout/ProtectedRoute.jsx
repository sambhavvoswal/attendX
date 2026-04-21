import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function ProtectedRoute({
  children,
  allowedRoles = ['user', 'org_admin', 'super_admin'],
}) {
  const { user, role, status, isLoading, loadingMessage } = useAuthStore((s) => ({
    user: s.user,
    role: s.role,
    status: s.status,
    isLoading: s.isLoading,
    loadingMessage: s.loadingMessage,
  }));

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg text-text-primary gap-4">
        <div className="w-12 h-12 border-4 border-accent-dim border-t-accent rounded-full animate-spin" />
        <div className="rounded-2xl border border-border bg-surface px-6 py-3 text-xs font-medium uppercase tracking-widest text-text-secondary animate-pulse">
          {loadingMessage || 'Authenticating...'}
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (status === 'disabled') return <Navigate to="/disabled" replace />;
  if (status === 'pending_approval') return <Navigate to="/pending-approval" replace />;
  
  if (role && !allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;

  return children;
}

