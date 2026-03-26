/**
 * AttendX — Dashboard Page
 * Hero (recent sheets) + all sheets list + FAB for new sheet.
 * Per PRD §7.2.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import SheetCard from '../components/sheets/SheetCard';
import useAuthStore from '../store/authStore';
import useSheet from '../hooks/useSheet';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const {
    sheets,
    recentSheets,
    isLoadingSheets,
    loadSheets,
    handleDeleteSheet,
  } = useSheet();

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadSheets();

    // Check for OAuth callback
    if (searchParams.get('google_connected') === 'true') {
      toast.success('Google Sheets connected!');
    }
  }, []);

  const onDelete = (sheetId) => {
    setDeleteConfirm(sheetId);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await handleDeleteSheet(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  return (
    <PageShell>
      <div className="py-6 animate-fadeIn">
        {/* Welcome */}
        <div className="mb-6">
          <p className="text-sm text-slate-400 mb-1">Welcome back,</p>
          <h1 className="text-2xl font-bold text-slate-100">
            {user?.name || 'User'} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {user?.org_name || 'Your Organization'}
          </p>
        </div>

        {/* FAB — New Sheet */}
        <button
          onClick={() => navigate('/sheets/new')}
          id="btn-new-sheet"
          className="
            fixed bottom-20 right-4 z-40
            w-14 h-14 rounded-full
            bg-coral-500 hover:bg-coral-600
            text-white text-2xl font-light
            shadow-elevated
            transition-default active:scale-95
            flex items-center justify-center
          "
        >
          +
        </button>

        {/* Recent Sheets */}
        {recentSheets.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Recent Sheets
            </h2>
            <div className="flex flex-col gap-3">
              {recentSheets.map((sheet) => (
                <SheetCard
                  key={sheet.sheet_id}
                  sheet={sheet}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Sheets */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {recentSheets.length > 0 ? 'All Sheets' : 'My Sheets'}
          </h2>

          {isLoadingSheets ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sheets.length === 0 ? (
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/30 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-coral-500/10 flex items-center justify-center">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">
                No sheets yet
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Create your first attendance sheet to get started
              </p>
              <Button
                id="btn-new-sheet-empty"
                onClick={() => navigate('/sheets/new')}
              >
                + New Sheet
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sheets.map((sheet) => (
                <SheetCard
                  key={sheet.sheet_id}
                  sheet={sheet}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </section>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          {[
            { label: 'Total Sheets', value: sheets.length, icon: '📊' },
            { label: 'Recent Activity', value: recentSheets.length, icon: '📅' },
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Remove Sheet"
        size="sm"
      >
        <p className="text-sm text-slate-400 mb-1">
          This will remove the sheet from AttendX.
        </p>
        <p className="text-xs text-slate-500 mb-6">
          The actual Google Sheet will not be deleted.
        </p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => setDeleteConfirm(null)}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            fullWidth
            id="btn-confirm-delete"
          >
            Remove
          </Button>
        </div>
      </Modal>
    </PageShell>
  );
}
