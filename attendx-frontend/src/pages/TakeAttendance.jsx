import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudents } from '../hooks/useStudents';
import { useAttendance } from '../hooks/useAttendance';
import { useSheetStore } from '../store/sheetStore';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

import { QRAttendanceView } from '../components/attendance/QRAttendanceView';
import { ManualAttendanceView } from '../components/attendance/ManualAttendanceView';
import { NewStudentModal } from '../components/attendance/NewStudentModal';
import { ConfirmLeaveModal } from '../components/attendance/ConfirmLeaveModal';
import { SessionStats } from '../components/attendance/SessionStats';

export default function TakeAttendance() {
  const { sheetId } = useParams();
  const navigate = useNavigate();
  const { sheets } = useSheetStore();
  const activeSheet = sheets.find(s => s.sheet_id === sheetId);

  const { students, columns, fetchData, loading: studentsLoading } = useStudents(sheetId);

  const {
    sessionId,
    date,
    mode,
    scannedIds,
    markedValues,
    isProcessing,
    hasUnsavedChanges,
    handleStartSession,
    validateAndMark,
    markManually,
    handleEndSession,
    addNewStudent,
    clearSession
  } = useAttendance(sheetId, activeSheet, students);

  // Local state
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [scanMessage, setScanMessage] = useState({ text: '', type: 'info' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Warn on browser refresh/close if session active
  useEffect(() => {
    const handler = (e) => {
      if (sessionId) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [sessionId]);

  // Load students on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // QR scan handler
  const onScan = useCallback(async (rawString) => {
    const result = await validateAndMark(rawString);
    if (!result.success) {
      setScanMessage({ text: result.error, type: 'error' });
      setTimeout(() => setScanMessage({ text: '', type: 'info' }), 3000);
      return;
    }
    setScanMessage({ text: `✓ ${result.pkValue}`, type: 'success' });
    setTimeout(() => setScanMessage({ text: '', type: 'info' }), 3000);
  }, [validateAndMark]);

  // Back button handler
  const handleBack = () => {
    if (sessionId) {
      setShowLeaveModal(true);
    } else {
      navigate('/dashboard');
    }
  };

  // Leave confirmed
  const handleLeaveConfirmed = () => {
    clearSession();
    setShowLeaveModal(false);
    navigate('/dashboard');
  };

  // End session and show stats
  const handleEnd = async () => {
    await handleEndSession();
    setShowStats(true);
  };

  // Start session with chosen mode
  const handleGoLive = async (chosenMode) => {
    await handleStartSession(selectedDate, chosenMode);
  };

  if (!activeSheet) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <div className="text-text-secondary text-sm">Sheet not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-bg overflow-hidden">
      {/* ─── Header ─── */}
      <div className="px-4 py-3 border-b border-border bg-surface/50 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-surface-header rounded-full text-text-secondary transition-colors shrink-0 active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="font-bold text-text-primary leading-tight text-sm md:text-base truncate">{activeSheet.display_name}</h1>
            <p className="text-[10px] text-accent font-black uppercase tracking-widest italic">
              {sessionId
                ? `${mode === 'qr' ? '📷 QR' : '✏️ Manual'} · ${date}`
                : 'Setup'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {sessionId && (
            <>
              <button
                onClick={() => setShowAddModal(true)}
                className="p-2 rounded-xl border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-header transition-all active:scale-90"
                title="Add Student"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </button>
              <button
                onClick={handleEnd}
                disabled={isProcessing}
                className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 md:px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95"
              >
                {isProcessing ? 'Saving...' : 'End Session'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {!sessionId && !showStats ? (
            /* ─── Pre-Session: Mode Selection ─── */
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-center h-full p-4"
            >
              <div className="w-full max-w-sm space-y-6">
                {/* Date picker */}
                <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl mx-auto flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold text-text-primary">Start Session</h2>
                    <p className="text-xs text-text-secondary mt-1">Choose date and mode</p>
                  </div>

                  <input
                    type="date"
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:ring-1 focus:ring-accent"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                {/* Mode Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleGoLive('qr')}
                    disabled={isProcessing}
                    className="group bg-surface border border-border rounded-2xl p-5 text-center hover:border-accent hover:shadow-lg hover:shadow-accent/5 transition-all active:scale-[0.97] disabled:opacity-50"
                  >
                    <div className="text-3xl mb-3">📷</div>
                    <h3 className="font-bold text-text-primary text-sm mb-1">QR Scan</h3>
                    <p className="text-[10px] text-text-secondary leading-tight">Scan student QR codes with camera</p>
                  </button>

                  <button
                    onClick={() => handleGoLive('manual')}
                    disabled={isProcessing}
                    className="group bg-surface border border-border rounded-2xl p-5 text-center hover:border-accent hover:shadow-lg hover:shadow-accent/5 transition-all active:scale-[0.97] disabled:opacity-50"
                  >
                    <div className="text-3xl mb-3">✏️</div>
                    <h3 className="font-bold text-text-primary text-sm mb-1">Manual</h3>
                    <p className="text-[10px] text-text-secondary leading-tight">Mark attendance from the roster list</p>
                  </button>
                </div>

                {isProcessing && (
                  <div className="text-center text-xs text-accent animate-pulse font-semibold">Starting session...</div>
                )}
              </div>
            </motion.div>

          ) : sessionId && mode === 'qr' ? (
            /* ─── QR Mode ─── */
            <motion.div
              key="qr"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <QRAttendanceView
                students={students}
                pkColumn={activeSheet.primary_key_column}
                attendanceValues={activeSheet.attendance_values || []}
                markedValues={markedValues}
                scannedIds={scannedIds}
                onScan={onScan}
                onManualMark={markManually}
                scanMessage={scanMessage}
                isProcessing={isProcessing}
              />
            </motion.div>

          ) : sessionId && mode === 'manual' ? (
            /* ─── Manual Mode ─── */
            <motion.div
              key="manual"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <ManualAttendanceView
                students={students}
                pkColumn={activeSheet.primary_key_column}
                attendanceValues={activeSheet.attendance_values || []}
                markedValues={markedValues}
                onMark={markManually}
                isProcessing={isProcessing}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* ─── Modals ─── */}
      <ConfirmLeaveModal
        isOpen={showLeaveModal}
        onStay={() => setShowLeaveModal(false)}
        onLeave={handleLeaveConfirmed}
      />

      <AnimatePresence>
        {showAddModal && (
          <NewStudentModal
            columns={columns.non_attendance}
            isProcessing={isProcessing}
            onCancel={() => setShowAddModal(false)}
            onSubmit={async (data) => {
              const success = await addNewStudent(data);
              if (success) {
                setShowAddModal(false);
                fetchData();
              }
            }}
          />
        )}
      </AnimatePresence>

      {showStats && (
        <SessionStats
          students={students}
          markedValues={markedValues}
          attendanceValues={activeSheet.attendance_values || []}
          pkColumn={activeSheet.primary_key_column}
          onClose={() => {
            clearSession();
            setShowStats(false);
            navigate('/dashboard');
          }}
        />
      )}

      {/* Loading overlay */}
      {studentsLoading && (
        <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
            <span className="text-xs font-bold text-text-secondary uppercase tracking-widest italic">Loading Roster</span>
          </div>
        </div>
      )}
    </div>
  );
}
