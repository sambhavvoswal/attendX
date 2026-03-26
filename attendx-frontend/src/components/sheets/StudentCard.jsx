/**
 * AttendX — StudentCard Component
 * Student list item with attendance badge.
 * Per PRD §7.4 wireframe.
 */
import Badge from '../ui/Badge';

export default function StudentCard({ student, pkField, onDownloadQR }) {
  const data = student.data || {};
  const pkValue = data[pkField] || '—';

  // Get the name field — try common names
  const name = data['Name'] || data['name'] || data['Student Name'] || '';

  // All other fields (excluding PK and name)
  const otherFields = Object.entries(data)
    .filter(([key]) => key !== pkField && key.toLowerCase() !== 'name' && key !== 'Student Name')
    .slice(0, 3); // Show max 3 extra fields

  return (
    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/20 hover:border-slate-600/40 transition-default">
      {/* Top: PK + Name */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-coral-400 bg-coral-500/10 px-1.5 py-0.5 rounded">
              {pkValue}
            </span>
            <span className="text-sm font-medium text-slate-200 truncate">
              {name}
            </span>
          </div>

          {/* Extra fields */}
          {otherFields.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
              {otherFields.map(([key, val]) => (
                <span key={key} className="text-xs text-slate-500">
                  {String(val)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Badge + QR Download */}
        <div className="flex flex-col items-end gap-2">
          <Badge percentage={student.attendance_pct} />
          {onDownloadQR && (
            <button
              onClick={() => onDownloadQR(data)}
              className="text-[10px] text-slate-500 hover:text-coral-400 transition-default"
            >
              Download QR
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
