import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { groupStudentsBy } from '../../utils/groupBy';

export function SessionStats({ 
  students, 
  markedValues, 
  attendanceValues, 
  pkColumn,
  onClose 
}) {
  const [showGroupStats, setShowGroupStats] = useState(false);
  const [groupKey, setGroupKey] = useState('');

  const totalStudents = students.length;

  // Overall stats: count each attendance value
  const overallStats = useMemo(() => {
    const counts = {};
    attendanceValues.forEach(v => { counts[v.value] = 0; });
    counts['_unmarked'] = 0;

    students.forEach(s => {
      const pk = String(s[pkColumn] || '');
      const val = markedValues[pk];
      if (val && counts[val] !== undefined) {
        counts[val]++;
      } else {
        counts['_unmarked']++;
      }
    });
    return counts;
  }, [students, markedValues, attendanceValues, pkColumn]);

  // Group-wise stats
  const groupStats = useMemo(() => {
    if (!groupKey) return {};
    const groups = groupStudentsBy(students, groupKey);
    const result = {};

    Object.entries(groups).forEach(([gName, gStudents]) => {
      const gCounts = {};
      attendanceValues.forEach(v => { gCounts[v.value] = 0; });
      gCounts['_unmarked'] = 0;

      gStudents.forEach(s => {
        const pk = String(s[pkColumn] || '');
        const val = markedValues[pk];
        if (val && gCounts[val] !== undefined) {
          gCounts[val]++;
        } else {
          gCounts['_unmarked']++;
        }
      });
      result[gName] = { counts: gCounts, total: gStudents.length };
    });
    return result;
  }, [students, groupKey, markedValues, attendanceValues, pkColumn]);

  // Groupable columns
  const groupableColumns = useMemo(() => {
    if (students.length === 0) return [];
    return Object.keys(students[0] || {}).filter(k => k !== pkColumn && k !== 'Name' && k !== 'name');
  }, [students, pkColumn]);

  const pct = (count, total) => total === 0 ? '0' : ((count / total) * 100).toFixed(1);

  const getColor = (value) => {
    const av = attendanceValues.find(v => v.value === value);
    if (!av) return 'text-text-secondary';
    return av.is_positive ? 'text-green-400' : 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[90] bg-bg/95 backdrop-blur-md flex items-start justify-center overflow-y-auto p-4 pt-8 md:pt-16"
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', damping: 25 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-1">Session Complete</h2>
          <p className="text-sm text-text-secondary">{totalStudents} students in roster</p>
        </div>

        {/* Overall Stats */}
        <div className="bg-surface border border-border rounded-2xl p-5 mb-4 space-y-3">
          <h3 className="text-xs uppercase tracking-widest font-bold text-text-secondary mb-3">Overall Summary</h3>
          
          {attendanceValues.map(av => {
            const count = overallStats[av.value] || 0;
            return (
              <div key={av.value} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${av.is_positive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                    {av.value}
                  </div>
                  <span className="text-sm text-text-primary font-medium">{av.label}</span>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${getColor(av.value)}`}>{count}</span>
                  <span className="text-xs text-text-secondary ml-2">({pct(count, totalStudents)}%)</span>
                </div>
              </div>
            );
          })}

          {/* Unmarked */}
          {overallStats['_unmarked'] > 0 && (
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black bg-gray-500/15 text-gray-400">—</div>
                <span className="text-sm text-text-primary font-medium">Unmarked</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-text-secondary">{overallStats['_unmarked']}</span>
                <span className="text-xs text-text-secondary ml-2">({pct(overallStats['_unmarked'], totalStudents)}%)</span>
              </div>
            </div>
          )}
        </div>

        {/* Group-wise Toggle */}
        {groupableColumns.length > 0 && (
          <div className="bg-surface border border-border rounded-2xl p-5 mb-4">
            <button
              onClick={() => setShowGroupStats(!showGroupStats)}
              className="w-full flex items-center justify-between text-sm font-semibold text-text-primary"
            >
              <span>Group-wise Breakdown</span>
              <svg className={`w-4 h-4 transition-transform ${showGroupStats ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showGroupStats && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 space-y-4">
                <select
                  className="w-full bg-surface-header border border-border rounded-xl px-3 py-2 text-xs text-text-primary outline-none"
                  value={groupKey}
                  onChange={(e) => setGroupKey(e.target.value)}
                >
                  <option value="">Select grouping column...</option>
                  {groupableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {groupKey && Object.entries(groupStats).map(([gName, { counts, total }]) => (
                  <div key={gName} className="border border-border/50 rounded-xl p-3">
                    <h4 className="text-xs font-bold text-accent mb-2">{gName} ({total} students)</h4>
                    <div className="space-y-1">
                      {attendanceValues.map(av => {
                        const count = counts[av.value] || 0;
                        return (
                          <div key={av.value} className="flex justify-between text-xs">
                            <span className="text-text-secondary">{av.label}</span>
                            <span className={getColor(av.value)}>{count} ({pct(count, total)}%)</span>
                          </div>
                        );
                      })}
                      {counts['_unmarked'] > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-text-secondary">Unmarked</span>
                          <span className="text-text-secondary">{counts['_unmarked']} ({pct(counts['_unmarked'], total)}%)</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-accent text-black font-black text-sm uppercase tracking-wide hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] transition-all"
        >
          Back to Dashboard
        </button>
      </motion.div>
    </motion.div>
  );
}
