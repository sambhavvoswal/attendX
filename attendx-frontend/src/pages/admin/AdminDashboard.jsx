import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export function AdminDashboard() {
  const { role } = useAuthStore(s => ({ role: s.role }));
  const [stats, setStats] = useState({ users: 0, pending: 0, orgs: 0 });

  const [busy, setBusy] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setBusy(true);
        // Fetch users based on role limits (adminService handles org isolation inherently)
        const allUsers = await adminService.getUsers();
        const pendingUsers = await adminService.getUsers(null, 'pending_approval');
        
        let orgsCount = 0;
        if (role === 'super_admin') {
          const orgs = await adminService.getOrgs();
          orgsCount = orgs.length;
        }

        setStats({
          users: allUsers.length,
          pending: pendingUsers.length,
          orgs: orgsCount
        });
      } catch (err) {
        toast.error('Failed to load dashboard statistics.');
      } finally {
        setBusy(false);
      }
    }
    loadStats();
  }, [role]);
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-[Fraunces] font-bold mb-6">Admin Dashboard</h1>
      <p className="text-sm text-text-secondary mb-8">Access Level: {role === 'super_admin' ? 'Global Super Administrator' : 'Organization Administrator'}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/users" className="bg-surface border border-border p-6 rounded-2xl hover:border-accent/50 transition-colors block cursor-pointer">
          <h3 className="text-sm font-bold text-text-secondary mb-2">Total Users</h3>
          <p className="text-4xl font-bold">{busy ? '-' : stats.users}</p>
        </Link>
        <Link to="/admin/pending" className="bg-surface border border-border p-6 rounded-2xl hover:border-accent/50 transition-colors block cursor-pointer">
          <h3 className="text-sm font-bold text-text-secondary mb-2">Pending Approvals</h3>
          <p className="text-4xl font-bold text-accent">{busy ? '-' : stats.pending}</p>
        </Link>
        {role === 'super_admin' && (
          <Link to="/admin/orgs" className="bg-surface border border-border p-6 rounded-2xl hover:border-accent/50 transition-colors block cursor-pointer">
            <h3 className="text-sm font-bold text-text-secondary mb-2">Total Organizations</h3>
            <p className="text-4xl font-bold text-accent">{busy ? '-' : stats.orgs}</p>
          </Link>
        )}
      </div>
    </div>
  );
}
