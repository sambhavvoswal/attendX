import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { auth, signInWithEmailAndPassword, signInWithGoogle } from '../services/firebase';

export function Login() {
  const navigate = useNavigate();
  const setProfile = useAuthStore((s) => s.setProfile);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onGoogle = async () => {
    setBusy(true);
    try {
      await signInWithGoogle();
      try {
        const res = await api.get('/api/auth/me');
        setProfile(res.data);
        navigate('/dashboard');
      } catch (e) {
        if (e?.response?.status === 404) {
          navigate('/google-setup');
        } else if (e?.response?.status === 403 && e?.response?.data?.detail?.code === 'account_disabled') {
          navigate('/disabled');
        } else {
          toast.error('Could not finish Google sign-in. Please try again.');
        }
      }
    } catch (err) {
      toast.error(err?.message || 'Google sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  const onEmailLogin = async () => {
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Mirror the Google flow by fetching profile before navigating
      try {
        const res = await api.get('/api/auth/me');
        setProfile(res.data);
        navigate('/dashboard');
      } catch (e) {
        if (e?.response?.status === 403 && e?.response?.data?.detail?.code === 'account_disabled') {
          navigate('/disabled');
        } else {
          toast.error('Sign in partially completed, but could not fetch your profile. Refreshing...');
          // Let the global listener try to recover
          navigate('/dashboard');
        }
      }
    } catch (err) {
      const code = err?.code;
      if (code === 'auth/wrong-password') toast.error('Incorrect password');
      else if (code === 'auth/user-not-found') toast.error('No account with this email');
      else if (code === 'auth/too-many-requests')
        toast.error('Too many attempts. Try again later.');
      else toast.error(err?.message || 'Sign in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg px-4 py-10 text-text-primary">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h1 className="font-[Fraunces] text-3xl tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Use email/password or Google.
          </p>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm font-semibold text-text-primary hover:bg-surface-raised disabled:opacity-50"
              onClick={onGoogle}
              disabled={busy}
            >
              {busy ? 'Connecting to Google…' : 'Sign in with Google'}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <div className="text-xs text-text-secondary">or</div>
              <div className="h-px flex-1 bg-border" />
            </div>

            <label className="block text-sm">
              <div className="mb-1 text-xs text-text-secondary">Email</div>
              <input
                className="w-full rounded-xl border border-border bg-bg px-3 py-3 text-sm text-text-primary outline-none focus:border-accent/60"
                placeholder="you@org.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="block text-sm">
              <div className="mb-1 text-xs text-text-secondary">Password</div>
              <input
                type="password"
                className="w-full rounded-xl border border-border bg-bg px-3 py-3 text-sm text-text-primary outline-none focus:border-accent/60"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <button
              type="button"
              className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-bg hover:bg-accent-hover disabled:opacity-50"
              onClick={onEmailLogin}
              disabled={busy}
            >
              {busy ? 'Verifying Account…' : 'Sign in'}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-text-secondary">
            New here?{' '}
            <Link to="/register" className="font-semibold text-accent">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

