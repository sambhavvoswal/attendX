/**
 * AttendX — GoogleSetup Page
 * One-time org name collection for first-time Google Sign-In users.
 * Per PRD §7.1 — shown when backend returns is_new_google_user: true.
 */
import { useState } from 'react';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

export default function GoogleSetup() {
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orgName.trim()) {
      toast.error('Please enter your organization name');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/auth/google-setup', {
        org_name: orgName.trim(),
      });
      setUser(response.data);
      toast.success('Setup complete! Waiting for admin approval.');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Setup failed');
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
            <span className="text-coral-500">Welcome</span>
            <span className="text-slate-100"> to AttendX</span>
          </h1>
          <p className="text-sm text-slate-400">
            One last step — tell us about your organization
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="input-org-name"
            label="Organization Name"
            placeholder="ABC Coaching Centre"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
          />
          <p className="text-xs text-slate-500">
            This is the name of your school, coaching center, or company.
          </p>
          <Button
            id="btn-complete-setup"
            type="submit"
            fullWidth
            loading={loading}
          >
            Complete Setup
          </Button>
        </form>
      </div>
    </div>
  );
}
