import { NavLink, useNavigate } from 'react-router-dom';
import { auth, signOut } from '../../services/firebase';
function Item({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition-colors',
          isActive
            ? 'border-accent/40 bg-accent-dim/20 text-text-primary'
            : 'border-border bg-surface text-text-secondary hover:text-text-primary',
        ].join(' ')
      }
    >
      <span className="font-medium">{label}</span>
      <span className="text-xs text-text-secondary">→</span>
    </NavLink>
  );
}

export function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        await signOut(auth);
        navigate('/');
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };

  return (
    <div className="sticky top-0 h-screen border-r border-border bg-bg px-4 py-8 flex flex-col">
      <div>
        <div className="mb-8">
          <div className="font-[Fraunces] text-xl tracking-tight text-text-primary">
            AttendX
          </div>
          <div className="text-xs text-text-secondary">QR attendance, done right</div>
        </div>

        <div className="flex flex-col gap-2">
          <Item to="/dashboard" label="Dashboard" />
          <Item to="/dashboard" label="Analytics" />
          <Item to="/qr-generator" label="QR Generator" />
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-surface p-3 text-xs text-text-secondary">
          Theme locked: charcoal + amber. No blue/purple UI.
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg transition-colors"
        >
          <span className="font-medium text-red-500 hover:text-red-600">Log Out</span>
        </button>
      </div>
    </div>
  );
}
