/**
 * AttendX — Register Page
 * Email/password registration form.
 * Per PRD §7.1 — creates Firebase Auth account then POST /api/auth/register.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerWithEmail } from '../services/firebase';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create Firebase Auth account
      const user = await registerWithEmail(email, password);

      // Step 2: Create Firestore user doc via backend
      await api.post('/api/auth/register', {
        uid: user.uid,
        email: user.email,
        name: name,
        org_name: orgName,
      });

      toast.success('Account created! Waiting for admin approval.');
      // useAuth hook will detect the auth state change and route to /pending-approval
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'This email is already registered'
        : err.response?.data?.detail || err.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            <span className="text-coral-500">Attend</span>
            <span className="text-slate-100">X</span>
          </h1>
          <p className="text-sm text-slate-400">
            Create your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <Input
            id="input-name"
            label="Full Name"
            placeholder="Riya Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            id="input-org"
            label="Organization Name"
            placeholder="ABC Coaching Centre"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
          />
          <Input
            id="input-email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="input-password"
            label="Password"
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            id="btn-register"
            type="submit"
            fullWidth
            loading={loading}
          >
            Create Account
          </Button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-coral-400 hover:text-coral-300 font-medium transition-default"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
