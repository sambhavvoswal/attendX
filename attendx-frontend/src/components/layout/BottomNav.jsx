/**
 * AttendX — BottomNav Component
 * Mobile tab bar as per PRD mobile-first design.
 */
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Home', icon: '🏠' },
  { path: '/qr-generator', label: 'QR Gen', icon: '📱' },
  { path: '/analytics', label: 'Analytics', icon: '📊' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-slate-700/50">
      <div className="flex items-center justify-around max-w-lg mx-auto py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              id={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              className={`
                flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-default
                ${isActive
                  ? 'text-coral-500'
                  : 'text-slate-500 hover:text-slate-300'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
