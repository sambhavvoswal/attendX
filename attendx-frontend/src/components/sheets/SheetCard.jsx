/**
 * AttendX — SheetCard Component
 * Pill-style card per PRD §7.2 wireframe:
 * Sheet name (large), inline view/add+ actions, dates, trash icon.
 */
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function SheetCard({ sheet, onDelete }) {
  const navigate = useNavigate();

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    try {
      return format(new Date(isoStr), 'dd/MM/yy');
    } catch {
      return '—';
    }
  };

  return (
    <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/30 hover:border-slate-600/50 transition-default group">
      {/* Top Row: Name + Actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-100 truncate">
            {sheet.name}
          </h3>
        </div>

        {/* Trash */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(sheet.sheet_id);
          }}
          className="text-slate-600 hover:text-coral-400 transition-default p-1 opacity-0 group-hover:opacity-100"
          title="Remove sheet"
          id={`btn-delete-${sheet.sheet_id}`}
        >
          🗑️
        </button>
      </div>

      {/* Action Links */}
      <div className="flex items-center gap-4 mt-2">
        <button
          onClick={() => navigate(`/sheets/${sheet.sheet_id}/students`)}
          className="text-xs font-medium text-coral-400 hover:text-coral-300 transition-default"
          id={`btn-view-${sheet.sheet_id}`}
        >
          view
        </button>
        <button
          onClick={() => navigate(`/sheets/${sheet.sheet_id}/attendance`)}
          className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-default"
          id={`btn-attend-${sheet.sheet_id}`}
        >
          add+
        </button>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-500">
        <span>created: {formatDate(sheet.created_at)}</span>
        <span>modified: {formatDate(sheet.last_accessed)}</span>
      </div>

      {/* Access method badge */}
      <div className="mt-2">
        <span className={`
          text-[10px] px-2 py-0.5 rounded-full font-medium
          ${sheet.access_method === 'oauth'
            ? 'bg-emerald-500/10 text-emerald-400'
            : 'bg-slate-700 text-slate-400'
          }
        `}>
          {sheet.access_method === 'oauth' ? '🔗 Google Connected' : '📎 Manual Link'}
        </span>
      </div>
    </div>
  );
}
