import api from './api';

export const adminService = {
  getUsers: async (orgId = null, status = null) => {
    const params = new URLSearchParams();
    if (orgId) params.append('org_id', orgId);
    if (status) params.append('status', status);
    
    const res = await api.get(`/api/admin/users?${params.toString()}`);
    return res.data;
  },

  approveUser: async (uid) => {
    const res = await api.put(`/api/admin/users/${uid}/approve`);
    return res.data;
  },

  rejectUser: async (uid) => {
    const res = await api.put(`/api/admin/users/${uid}/reject`);
    return res.data;
  },

  disableUser: async (uid) => {
    const res = await api.put(`/api/admin/users/${uid}/disable`);
    return res.data;
  },

  enableUser: async (uid) => {
    const res = await api.put(`/api/admin/users/${uid}/enable`);
    return res.data;
  },

  updateUserRole: async (uid, role, orgId) => {
    const res = await api.put(`/api/admin/users/${uid}/update-role`, { role, org_id: orgId });
    return res.data;
  },

  getOrgs: async () => {
    const res = await api.get('/api/admin/orgs');
    return res.data;
  },

  createOrg: async (name, description) => {
    const res = await api.post('/api/admin/orgs', { name, description });
    return res.data;
  }
};
