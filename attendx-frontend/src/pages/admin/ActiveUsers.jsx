import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useAuthStore } from '../../store/authStore';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export function ActiveUsers() {
  const { role, user: currentUser } = useAuthStore(s => ({ role: s.role, user: s.user }));
  const [users, setUsers] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [busy, setBusy] = useState(false);

  // Modal state
  const [manageUser, setManageUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('');
  
  // Confirmation state
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, data: null });

  useEffect(() => {
    fetchUsers();
    if (role === 'super_admin') {
      adminService.getOrgs().then(setOrgs).catch(console.error);
    }
  }, [role]);

  const fetchUsers = async () => {
    try {
      setBusy(true);
      const dataActive = await adminService.getUsers(null, 'active');
      const dataDisabled = await adminService.getUsers(null, 'disabled');
      setUsers([...dataActive, ...dataDisabled]);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setBusy(false);
    }
  };

  const toggleDisable = async (targetUser) => {
    setBusy(true);
    try {
      if (targetUser.status === 'active') {
        await adminService.disableUser(targetUser.uid);
        toast.success('User disabled');
      } else {
        await adminService.enableUser(targetUser.uid);
        toast.success('User enabled');
      }
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to update user status');
    } finally {
      setBusy(false);
    }
  };

  const openManageModal = (targetUser) => {
    setManageUser(targetUser);
    setSelectedRole(targetUser.role);
    setSelectedOrg(targetUser.org_id);
  };

  const handleSaveManageClick = () => {
    if (!selectedRole || !selectedOrg) return toast.error('Role and Organization are required');
    
    // User requested verification step
    setConfirmDialog({
      isOpen: true,
      data: {
        uid: manageUser.uid,
        role: selectedRole,
        orgId: selectedOrg,
        name: manageUser.name
      }
    });
  };

  const executeRoleUpdate = async () => {
    const { uid, role: newRole, orgId } = confirmDialog.data;
    setBusy(true);
    try {
      await adminService.updateUserRole(uid, newRole, orgId);
      toast.success('User updated successfully');
      setManageUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-[Fraunces] font-bold mb-6">User Management</h1>
      
      {users.length === 0 ? (
        <div className="bg-surface border border-border p-12 rounded-2xl text-center text-text-secondary">
          No users found.
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-header border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Organization</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(u => (
                <tr key={u.uid} className="hover:bg-bg/30">
                  <td className="px-6 py-4 font-bold">{u.name}</td>
                  <td className="px-6 py-4 text-text-secondary">{u.email}</td>
                  <td className="px-6 py-4 text-accent">{u.org_name}</td>
                  <td className="px-6 py-4">
                     <span className="px-2 py-1 uppercase tracking-wider bg-bg border border-border rounded text-[10px] font-bold">
                        {u.role}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 uppercase tracking-wider border rounded text-[10px] font-bold ${u.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {u.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <button 
                      onClick={() => toggleDisable(u)}
                      disabled={busy || u.uid === currentUser.uid || u.role === 'super_admin'}
                      className={`px-3 py-1 text-xs font-bold rounded disabled:opacity-50 transition-colors ${u.status === 'active' ? 'text-red-500 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20' : 'text-green-500 border border-green-500/30 bg-green-500/10 hover:bg-green-500/20'}`}
                    >
                      {u.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                    {role === 'super_admin' && (
                      <button 
                        onClick={() => openManageModal(u)}
                        disabled={busy}
                        className="px-3 py-1 text-xs font-bold text-text-primary bg-bg border border-border hover:bg-surface-raised rounded disabled:opacity-50 transition-colors"
                      >
                        Manage
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Manage Role/Org Modal for Super Admins */}
      <Modal isOpen={!!manageUser} onClose={() => setManageUser(null)} title="Manage User Access">
        {manageUser && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary mb-4">Update organizational boundaries and permissions for <span className="font-bold text-text-primary">{manageUser.name}</span>.</p>
            
            <label className="block text-sm">
              <div className="mb-1 text-xs text-text-secondary">Role</div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3 py-3 text-sm text-text-primary outline-none focus:border-accent/60"
              >
                <option value="user">Standard User</option>
                <option value="org_admin">Organization Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </label>

            <label className="block text-sm">
              <div className="mb-1 text-xs text-text-secondary">Organization</div>
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3 py-3 text-sm text-text-primary outline-none focus:border-accent/60"
              >
                <option value="" disabled>Select an Organization...</option>
                {orgs.map(org => (
                  <option key={org.org_id} value={org.org_id}>{org.name}</option>
                ))}
              </select>
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setManageUser(null)} disabled={busy}>Cancel</Button>
              <Button onClick={handleSaveManageClick} disabled={busy}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, data: null })}
        onConfirm={executeRoleUpdate}
        title="Confirm Security Changes"
        message={confirmDialog.data ? `Are you sure you want to change ${confirmDialog.data.name}'s role to "${confirmDialog.data.role}"? They will be immediately reassigned to their new organizational boundaries.` : ''}
        confirmText="Confirm & Update"
      />
    </div>
  );
}
