/**
 * AttendX — Dashboard Page (Phase 1 placeholder)
 * Will be expanded in Phase 2 with sheet management.
 * Per PRD §7.2 — shows recent sheets hero + all sheets list.
 */
import PageShell from '../components/layout/PageShell';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <PageShell>
      <div className="py-6 animate-fadeIn">
        {/* Welcome */}
        <div className="mb-8">
          <p className="text-sm text-slate-400 mb-1">Welcome back,</p>
          <h1 className="text-2xl font-bold text-slate-100">
            {user?.name || 'User'} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {user?.org_name || 'Your Organization'}
          </p>
        </div>

        {/* Empty State — will be replaced in Phase 2 */}
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/30 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-coral-500/10 flex items-center justify-center">
            <span className="text-3xl">📋</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-200 mb-2">
            No sheets yet
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Create your first attendance sheet to get started
          </p>
          <Button id="btn-new-sheet" disabled>
            + New Sheet
          </Button>
          <p className="text-xs text-slate-600 mt-3">
            Coming in Phase 2
          </p>
        </div>

        {/* Quick Stats Placeholder */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {[
            { label: 'Total Sheets', value: '—', icon: '📊' },
            { label: 'Total Sessions', value: '—', icon: '📅' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/20"
            >
              <span className="text-lg">{stat.icon}</span>
              <p className="text-2xl font-bold text-slate-100 mt-1">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
