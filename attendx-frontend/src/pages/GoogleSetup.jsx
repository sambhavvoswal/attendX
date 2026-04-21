import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { auth } from '../services/firebase';

export function GoogleSetup() {
  const navigate = useNavigate();
  const setProfile = useAuthStore((s) => s.setProfile);
  const defaultName = useMemo(() => auth.currentUser?.displayName || '', []);
  const [name, setName] = useState(defaultName);
  const [action, setAction] = useState('join'); // 'join' or 'create'
  const [orgName, setOrgName] = useState('');
  const [orgId, setOrgId] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (action === 'create' && !orgName.trim()) {
      toast.error('Organization name is required to create a formal workspace');
      return;
    }
    if (action === 'join' && !orgId.trim()) {
      toast.error('Please enter the specific Organization ID you wish to join');
      return;
    }
    setBusy(true);
    try {
      await api.post('/api/auth/google-setup', {
        name: name.trim(),
        action,
        org_name: action === 'create' ? orgName.trim() : "",
        org_id: action === 'join' ? orgId.trim() : "",
      });

      // Fetch fresh profile now that DB entry exists
      const res = await api.get('/api/auth/me');
      setProfile(res.data);

      toast.success('Onboarding complete! Your account is pending admin approval.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.detail || err?.message || 'Setup failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg px-4 py-10 text-text-primary">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h1 className="font-[Fraunces] text-3xl tracking-tight">Finish setup</h1>
          <p className="mt-2 text-sm text-text-secondary">
            One-time step for Google sign-in users.
          </p>

          <div className="mt-6 space-y-3">
            <label className="block text-sm">
              <div className="mb-1 text-xs text-text-secondary">Your name</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3 py-3 text-sm outline-none focus:border-accent/60"
              />
            </label>

            <div className="flex bg-bg rounded-lg p-1 border border-border">
               <button 
                 type="button"
                 onClick={() => setAction('join')}
                 className={`flex-1 text-xs font-bold py-2 rounded-md transition-colors ${action === 'join' ? 'bg-surface border border-border shadow text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
               >
                 Join Existing
               </button>
               <button 
                 type="button"
                 onClick={() => setAction('create')}
                 className={`flex-1 text-xs font-bold py-2 rounded-md transition-colors ${action === 'create' ? 'bg-surface border border-border shadow text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
               >
                 Create New
               </button>
            </div>

            {action === 'join' ? (
              <label className="block text-sm">
                <div className="mb-1 text-xs text-text-secondary">Join Code / Organization ID</div>
                <input
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                  placeholder="e.g. org_XYZ123"
                  className="w-full rounded-xl border border-border bg-bg px-3 py-3 text-sm outline-none focus:border-accent/60"
                />
              </label>
            ) : (
              <label className="block text-sm">
                <div className="mb-1 text-xs text-text-secondary">New Organization Name</div>
                <input
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Global High School"
                  className="w-full rounded-xl border border-border bg-bg px-3 py-3 text-sm outline-none focus:border-accent/60"
                />
              </label>
            )}

            <button
              type="button"
              className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-bg hover:bg-accent-hover"
              onClick={onSubmit}
              disabled={busy}
            >
              {busy ? 'Saving…' : 'Get started'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

