import { useState, useCallback } from 'react';
import useSessionStore from '../store/sessionStore';
import { attendanceService } from '../services/attendanceService';
import { parseQRData } from '../utils/qrParser';
import toast from 'react-hot-toast';

export function useAttendance(sheetId) {
  const [isProcessing, setIsProcessing] = useState(false);
  const {
    sessionId,
    date,
    mode,
    scannedIds,
    markedValues,
    addScannedId,
    setMarkedValue,
    initSession,
    clearSession,
    hasUnsavedChanges,
    clearUnsavedChanges
  } = useSessionStore();

  const handleStartSession = useCallback(async (selectedDate, selectedMode) => {
    setIsProcessing(true);
    try {
      const session = await attendanceService.startSession(sheetId, selectedDate);
      initSession(session.session_id, sheetId, selectedDate, selectedMode);
      toast.success('Attendance session started');
      return session;
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to start session');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [sheetId, initSession]);

  const validateAndMark = useCallback(async (rawQR) => {
    const { valid, data, error } = parseQRData(rawQR);
    if (!valid) return { success: false, error };

    // Check for duplicate scan
    const pkValue = data[Object.keys(data)[0]]; // Simple assumption for now
    if (scannedIds.includes(pkValue)) {
      return { success: false, error: 'Already scanned', pkValue };
    }

    try {
      const validation = await attendanceService.validateQR(sheetId, data);
      if (!validation.valid) return { success: false, error: validation.error };

      const actualPk = validation.pk_value;
      
      // Default to "Present" or first positive value
      const markRes = await attendanceService.markAttendance(sheetId, actualPk, date, 'P');
      
      addScannedId(actualPk);
      setMarkedValue(actualPk, 'P');
      
      return { success: true, pkValue: actualPk, studentData: data };
    } catch (err) {
      return { success: false, error: err.message || 'Server error' };
    }
  }, [sheetId, date, scannedIds, addScannedId, setMarkedValue]);

  const markManually = useCallback(async (pkValue, value) => {
    try {
      await attendanceService.markAttendance(sheetId, pkValue, date, value);
      setMarkedValue(pkValue, value);
      if (!scannedIds.includes(pkValue)) addScannedId(pkValue);
      toast.success(`Marked ${pkValue} as ${value}`);
    } catch (err) {
      toast.error(`Failed to mark ${pkValue}`);
    }
  }, [sheetId, date, setMarkedValue, scannedIds, addScannedId]);

  const handleEndSession = useCallback(async (unmarkedDefault = 'empty', absentValue = 'A') => {
    setIsProcessing(true);
    try {
      const payload = {
        session_id: sessionId,
        sheet_id: sheetId,
        date_column: date,
        scanned_ids: scannedIds,
        manually_marked_ids: [],
        value_counts: Object.values(markedValues).reduce((acc, val) => {
          acc[val] = (acc[val] || 0) + 1;
          return acc;
        }, {}),
        unmarked_default: unmarkedDefault,
        absent_value: absentValue
      };

      await attendanceService.endSession(payload);
      clearUnsavedChanges();
      toast.success('Session ended and saved');
    } catch (err) {
      toast.error('Failed to close session');
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId, sheetId, date, scannedIds, markedValues, clearSession, clearUnsavedChanges]);

  const addNewStudent = useCallback(async (studentData) => {
    setIsProcessing(true);
    try {
      await attendanceService.addStudent(sheetId, studentData);
      toast.success('Student added to roster');
      return true;
    } catch (err) {
      toast.error('Failed to add student');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [sheetId]);

  return {
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
  };
}
