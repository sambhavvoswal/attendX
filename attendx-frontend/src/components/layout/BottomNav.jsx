import { NavLink } from 'react-router-dom';

const base =
  'flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs transition-colors';

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-3">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${base} ${isActive ? 'text-accent' : 'text-text-secondary'}`
          }
        >
          <span className="font-medium">Dashboard</span>
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${base} ${isActive ? 'text-accent' : 'text-text-secondary'}`
          }
        >
          <span className="font-medium">Analytics</span>
        </NavLink>
        <NavLink
          to="/qr-generator"
          className={({ isActive }) =>
            `${base} ${isActive ? 'text-accent' : 'text-text-secondary'}`
          }
        >
          <span className="font-medium">QR</span>
        </NavLink>
      </div>
    </nav>
  );
}

