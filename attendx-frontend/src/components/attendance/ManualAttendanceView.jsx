import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { groupStudentsBy } from '../../utils/groupBy';
import { AttendanceValueButtons } from './AttendanceValueButtons';

export function ManualAttendanceView({
  students,
  pkColumn,
  attendanceValues,
  markedValues,
  onMark,
  isProcessing
}) {
  const [groupKey, setGroupKey] = useState('');
  const [search, setSearch] = useState('');
  const [openGroup, setOpenGroup] = useState(null); // only one group open at a time

  const markedCount = Object.keys(markedValues).length;
  const totalCount = students.length;

  // Filter by search
  const filteredStudents = useMemo(() => {
    if (!search) return students;
    const s = search.toLowerCase();
    return students.filter(st =>
      String(st[pkColumn] || '').toLowerCase().includes(s) ||
      (st.Name || st.name || '').toLowerCase().includes(s)
    );
  }, [students, search, pkColumn]);

  // Group
  const grouped = useMemo(() => groupStudentsBy(filteredStudents, groupKey), [filteredStudents, groupKey]);

  // Groupable columns
  const groupableColumns = useMemo(() => {
    if (students.length === 0) return [];
    return Object.keys(students[0] || {}).filter(k => k !== pkColumn && k !== 'Name' && k !== 'name');
  }, [students, pkColumn]);

  const isGrouped = !!groupKey;

  // Count marked in a group
  const groupMarkedCount = (people) => {
    return people.filter(st => markedValues[String(st[pkColumn] || '')]).length;
  };

  const toggleGroup = (groupName) => {
    setOpenGroup(prev => prev === groupName ? null : groupName);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header: Search + Counter + Group */}
      <div className="px-4 py-3 border-b border-border bg-surface/50 backdrop-blur-md space-y-2 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name or ID..."
              className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none pl-9 focus:ring-1 focus:ring-accent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg className="w-4 h-4 text-text-secondary absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Counter Badge */}
          <div className="shrink-0 bg-accent/10 border border-accent/30 rounded-xl px-3 py-2.5 text-center">
            <span className="text-accent font-black text-sm">{markedCount}</span>
            <span className="text-text-secondary text-xs">/{totalCount}</span>
          </div>
        </div>

        {/* Group selector */}
        {groupableColumns.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">Group:</span>
            <select
              className="flex-1 bg-bg border border-border rounded-lg px-2 py-1.5 text-xs text-text-primary outline-none"
              value={groupKey}
              onChange={(e) => { setGroupKey(e.target.value); setOpenGroup(null); }}
            >
              <option value="">No grouping (flat list)</option>
              {groupableColumns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Student List */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {Object.entries(grouped).map(([groupName, people]) => {
          const isOpen = !isGrouped || openGroup === groupName;
          const gMarked = groupMarkedCount(people);

          return (
            <div key={groupName} className="mb-2">
              {/* Group Header (clickable accordion) */}
              {isGrouped && (
                <button
                  onClick={() => toggleGroup(groupName)}
                  className="w-full flex items-center justify-between px-3 py-3 bg-surface-header/50 border border-border rounded-xl mb-1 hover:bg-surface-header transition-colors active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? 'rotate-90' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="font-semibold text-sm text-text-primary">{groupName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gMarked === people.length ? 'bg-green-500/15 text-green-400' : 'bg-surface text-text-secondary'}`}>
                      {gMarked}/{people.length}
                    </span>
                  </div>
                </button>
              )}

              {/* Students (animated) */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={isGrouped ? { height: 0, opacity: 0 } : false}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {people.map(student => {
                      const pk = String(student[pkColumn] || '');
                      const name = student.Name || student.name || 'Unknown';
                      const currentVal = markedValues[pk];

                      return (
                        <div
                          key={pk}
                          className={`flex items-center gap-3 py-3 px-3 border-b border-border/30 last:border-0 transition-colors ${currentVal ? 'bg-green-500/5' : 'hover:bg-surface-header/30'}`}
                        >
                          {/* Avatar */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold uppercase shrink-0 ${currentVal ? 'bg-green-500/15 text-green-400' : 'bg-accent/10 text-accent'}`}>
                            {name.charAt(0)}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-text-primary truncate">{name}</div>
                            <div className="text-[10px] text-text-secondary font-mono uppercase">{pk}</div>
                          </div>

                          {/* Attendance Buttons */}
                          <div className="shrink-0 flex items-center gap-1.5">
                            <AttendanceValueButtons
                              values={attendanceValues}
                              currentValue={currentVal}
                              onSelect={(val) => onMark(pk, val)}
                              disabled={isProcessing}
                            />
                            {currentVal && (
                              <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center ml-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filteredStudents.length === 0 && (
          <div className="text-center py-16 text-text-secondary text-sm italic">
            {search ? 'No students match your search.' : 'No students in roster.'}
          </div>
        )}
      </div>
    </div>
  );
}
