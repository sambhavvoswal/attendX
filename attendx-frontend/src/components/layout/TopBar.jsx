/**
 * AttendX — TopBar Component
 */
import { logOut } from '../../services/firebase';
import useAuthStore from '../../store/authStore';

export default function TopBar() {
  const { user } = useAuthStore();

  const handleLogout = async () => {
    await logOut();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        {/* Logo */}
        <h1 className="text-lg font-bold tracking-tight">
          <span className="text-coral-500">Attend</span>
          <span className="text-slate-100">X</span>
        </h1>

        {/* Right */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              <span className="text-xs text-slate-400 hidden sm:inline">
                {user.name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-slate-400 hover:text-coral-400 transition-default"
                id="btn-logout"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
