/**
 * AttendX — Attendance Badge Component
 * Color-coded badge per PRD §7.4: 🟢 ≥75%, 🟡 50–74%, 🔴 <50%
 */
import { BADGE_THRESHOLDS } from '../../constants';

export default function Badge({ percentage, className = '' }) {
  const pct = Math.round(percentage ?? 0);

  let colorClass, emoji;
  if (pct >= BADGE_THRESHOLDS.GREEN) {
    colorClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
    emoji = '🟢';
  } else if (pct >= BADGE_THRESHOLDS.YELLOW) {
    colorClass = 'bg-amber-500/15 text-amber-400 border-amber-500/20';
    emoji = '🟡';
  } else {
    colorClass = 'bg-coral-500/15 text-coral-400 border-coral-500/20';
    emoji = '🔴';
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full
        text-xs font-semibold border
        ${colorClass} ${className}
      `}
    >
      {emoji} {pct}%
    </span>
  );
}
