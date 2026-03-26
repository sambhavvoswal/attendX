/**
 * AttendX — PendingApproval Page
 * Shown when user status is "pending".
 * Per PRD §7.1 status gate.
 */
import { logOut } from '../services/firebase';
import Button from '../components/ui/Button';

export default function PendingApproval() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center animate-fadeIn">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/10 flex items-center justify-center">
          <span className="text-4xl">⏳</span>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-slate-100 mb-3">
          Pending Approval
        </h1>
        <p className="text-sm text-slate-400 mb-2">
          Your account is waiting for admin approval.
        </p>
        <p className="text-xs text-slate-500 mb-8">
          You&apos;ll receive an email once your account is approved. This usually happens within 24 hours.
        </p>

        {/* Refresh hint */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700/50">
          <p className="text-xs text-slate-400">
            💡 <strong className="text-slate-300">Tip:</strong> Refresh this page after receiving your approval email.
          </p>
        </div>

        <Button
          id="btn-logout-pending"
          variant="ghost"
          fullWidth
          onClick={() => logOut()}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
