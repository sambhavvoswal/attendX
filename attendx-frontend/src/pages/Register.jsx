import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { auth, createUserWithEmailAndPassword } from '../services/firebase';

export function Register() {
  const navigate = useNavigate();
  const setProfile = useAuthStore((s) => s.setProfile);
  const [name, setName] = useState('');
  const [action, setAction] = useState('join');
  const [orgName, setOrgName] = useState('');
  const [orgId, setOrgId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const validate = () => {
    if (!name.trim() || !email.trim() || !password || !confirm) {
      toast.error('Standard profile fields are required');
      return false;
    }
    if (action === 'create' && !orgName.trim()) {
      toast.error('Organization Name is required to create a workspace');
      return false;
    }
    if (action === 'join' && !orgId.trim()) {
      toast.error('Organization ID is required to join an existing workspace');
      return false;
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      toast.error('Password must be 8+ chars, include 1 uppercase and 1 number');
      return false;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const onRegister = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await api.post('/api/auth/register', {
        name: name.trim(),
        action,
        org_name: action === 'create' ? orgName.trim() : "",
        org_id: action === 'join' ? orgId.trim() : "",
        email: email.trim(),
      });

      // Fetch fresh profile now that DB entry exists
      const res = await api.get('/api/auth/me');
      setProfile(res.data);

      toast.success('Registration successful. Your account is pending administrator approval.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg px-4 py-10 text-text-primary">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h1 className="font-[Fraunces] text-3xl tracking-tight">Create account</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Join an existing workspace or create a new one.
          </p>

          <div className="mt-6 space-y-3">
            <label className="block text-sm">
              <div className="mb-1 text-xs text-text-secondary">Full name</div>
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

            <label className="block text-sm">
              <div className="mb-1 text-xs text-text-secondary">Email</div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3 py-3 text-sm outline-none focus:border-accent/60"
              />
            </label>

            <label className="block text-sm">
              <div className="mb-1 text-xs text-text-secondary">Password</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3 py-3 text-sm outline-none focus:border-accent/60"
              />
              <div className="mt-2 text-xs text-text-secondary">
                Password must be at least 8 characters, include 1 uppercase letter and 1
                number.
              </div>
            </label>

            <label className="block text-sm">
              <div className="mb-1 text-xs text-text-secondary">Confirm password</div>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3 py-3 text-sm outline-none focus:border-accent/60"
              />
            </label>

            <button
              type="button"
              className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-bg hover:bg-accent-hover"
              onClick={onRegister}
              disabled={busy}
            >
              {busy ? 'Creating…' : 'Create account'}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-accent">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

