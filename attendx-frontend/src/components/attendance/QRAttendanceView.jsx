import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRScanner } from './QRScanner';
import { ScannerOverlay } from './ScannerOverlay';
import { groupStudentsBy } from '../../utils/groupBy';

export function QRAttendanceView({
  students,
  pkColumn,
  attendanceValues,
  markedValues,
  scannedIds,
  onScan,
  onManualMark,
  scanMessage,
  isProcessing
}) {
  const [showPanel, setShowPanel] = useState(false);
  const [groupKey, setGroupKey] = useState('');
  const [search, setSearch] = useState('');
  const [quickPK, setQuickPK] = useState('');
  const [quickValue, setQuickValue] = useState(attendanceValues[0]?.value || 'P');

  const defaultPositiveValue = attendanceValues.find(v => v.is_positive)?.value || 'P';

  const markedCount = Object.keys(markedValues).length;
  const totalCount = students.length;

  // Split students into marked/unmarked
  const { unmarked, marked } = useMemo(() => {
    let filtered = students;
    if (search) {
      const s = search.toLowerCase();
      filtered = students.filter(st =>
        String(st[pkColumn] || '').toLowerCase().includes(s) ||
        (st.Name || st.name || '').toLowerCase().includes(s)
      );
    }

    const um = [], mk = [];
    filtered.forEach(st => {
      const pk = String(st[pkColumn] || '');
      if (markedValues[pk]) mk.push(st);
      else um.push(st);
    });
    return { unmarked: um, marked: mk };
  }, [students, markedValues, search, pkColumn]);

  // Group the unmarked students
  const groupedUnmarked = useMemo(() => groupStudentsBy(unmarked, groupKey), [unmarked, groupKey]);

  const groupableColumns = useMemo(() => {
    if (students.length === 0) return [];
    return Object.keys(students[0] || {}).filter(k => k !== pkColumn && k !== 'Name' && k !== 'name');
  }, [students, pkColumn]);

  const handleQuickAdd = () => {
    if (!quickPK.trim()) return;
    onManualMark(quickPK.trim(), quickValue);
    setQuickPK('');
  };

  return (
    <div className="flex flex-col md:flex-row h-full relative">
      {/* Scanner Area */}
      <div className="flex-1 relative min-h-[50vh] md:min-h-0">
        <QRScanner onScan={onScan} active={!showPanel || window.innerWidth >= 768}>
          <ScannerOverlay message={scanMessage.text} type={scanMessage.type} />

          {/* Stats badge */}
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10 flex items-center gap-2 pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-white text-xs font-bold">
              {markedCount}/{totalCount}
            </span>
          </div>
        </QRScanner>

        {/* Mobile toggle button */}
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-surface/90 backdrop-blur-md border border-border rounded-full px-6 py-2.5 text-xs font-bold text-text-primary shadow-lg active:scale-95 transition-transform flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          {showPanel ? 'Hide Roster' : 'Show Roster'}
        </button>
      </div>

      {/* Sidebar (desktop) / Bottom sheet (mobile) */}
      <AnimatePresence>
        {(showPanel || typeof window !== 'undefined') && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`
              ${showPanel ? 'flex' : 'hidden'} md:flex
              fixed md:relative bottom-0 left-0 right-0 md:inset-auto
              z-30 md:z-auto
              h-[65vh] md:h-full w-full md:w-[340px] lg:w-[380px]
              flex-col bg-surface border-t md:border-t-0 md:border-l border-border
              rounded-t-2xl md:rounded-none shadow-2xl md:shadow-none
            `}
          >
            {/* Drag handle (mobile) */}
            <div className="md:hidden flex justify-center py-2">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Quick Manual Input */}
            <div className="px-3 py-3 border-b border-border bg-surface-header/50">
              <div className="text-[10px] uppercase tracking-widest font-bold text-text-secondary mb-2">Quick Manual Entry</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Student ID..."
                  className="flex-1 min-w-0 bg-bg border border-border rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:ring-1 focus:ring-accent"
                  value={quickPK}
                  onChange={(e) => setQuickPK(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                />
                <select
                  className="bg-bg border border-border rounded-lg px-2 py-2 text-xs text-text-primary outline-none w-16"
                  value={quickValue}
                  onChange={(e) => setQuickValue(e.target.value)}
                >
                  {attendanceValues.map(v => (
                    <option key={v.value} value={v.value}>{v.value}</option>
                  ))}
                </select>
                <button
                  onClick={handleQuickAdd}
                  disabled={!quickPK.trim() || isProcessing}
                  className="bg-accent text-black font-bold text-xs px-3 rounded-lg hover:shadow-md active:scale-95 transition-all disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            {/* Search + Filters */}
            <div className="px-3 py-2 border-b border-border space-y-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-xs text-text-primary outline-none pl-8 focus:ring-1 focus:ring-accent"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <svg className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {groupableColumns.length > 0 && (
                <select
                  className="w-full bg-bg border border-border rounded-lg px-2 py-1.5 text-[10px] text-text-primary outline-none"
                  value={groupKey}
                  onChange={(e) => setGroupKey(e.target.value)}
                >
                  <option value="">No grouping</option>
                  {groupableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>

            {/* Student Lists */}
            <div className="flex-1 overflow-y-auto">
              {/* Unmarked Section */}
              <div className="px-3 pt-3">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-red-400 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  Unmarked ({unmarked.length})
                </h4>
                {Object.entries(groupedUnmarked).map(([group, people]) => (
                  <div key={group} className="mb-3">
                    {groupKey && (
                      <div className="text-[9px] uppercase font-black tracking-widest text-text-secondary mb-1 px-1">{group}</div>
                    )}
                    {people.map(st => {
                      const pk = String(st[pkColumn] || '');
                      const name = st.Name || st.name || pk;
                      return (
                        <div key={pk} className="flex items-center gap-2 py-1.5 px-1 text-xs hover:bg-surface-header/50 rounded-lg transition-colors">
                          <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
                            {name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-text-primary font-medium truncate text-xs">{name}</div>
                            <div className="text-[9px] text-text-secondary font-mono">{pk}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Marked Section */}
              {marked.length > 0 && (
                <div className="px-3 pt-2 pb-4 border-t border-border mt-2">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-green-400 mb-2 flex items-center gap-2 pt-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Marked ({marked.length})
                  </h4>
                  {marked.map(st => {
                    const pk = String(st[pkColumn] || '');
                    const name = st.Name || st.name || pk;
                    const val = markedValues[pk];
                    return (
                      <div key={pk} className="flex items-center gap-2 py-1.5 px-1 text-xs rounded-lg">
                        <div className="w-7 h-7 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
                          {name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-text-primary font-medium truncate text-xs">{name}</div>
                          <div className="text-[9px] text-text-secondary font-mono">{pk}</div>
                        </div>
                        <div className="shrink-0 w-6 h-6 rounded-md bg-green-500/20 text-green-400 flex items-center justify-center text-[10px] font-black">
                          {val}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
