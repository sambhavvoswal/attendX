/**
 * AttendX — PageShell Component
 * Wrapper with TopBar, BottomNav, and proper padding.
 */
import TopBar from './TopBar';
import BottomNav from './BottomNav';

export default function PageShell({ children, showBottomNav = true }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar />
      <main className="flex-1 pt-14 pb-20 px-4 max-w-lg mx-auto w-full">
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
