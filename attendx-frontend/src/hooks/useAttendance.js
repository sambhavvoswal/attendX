import { useState, useCallback } from 'react';
import useSessionStore from '../store/sessionStore';
import { attendanceService } from '../services/attendanceService';
import { parseQRData } from '../utils/qrParser';
import toast from 'react-hot-toast';

export function useAttendance(sheetId, activeSheet, students) {
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
    if (!activeSheet || !students) return { success: false, error: 'Data not loaded yet' };
    
    const { valid, data, error } = parseQRData(rawQR);
    if (!valid) return { success: false, error };

    const mapping = activeSheet.qr_key_mapping || {};
    const pkColName = activeSheet.primary_key_column;
    
    // Find matching QR key (case-insensitive)
    let pkKey = null;
    for (const [jsonKey, colHeader] of Object.entries(mapping)) {
        if (colHeader === pkColName) {
            pkKey = jsonKey;
            break;
        }
    }
    
    if (!pkKey) return { success: false, error: 'Primary key missing in mapping' };

    // Get value from QR data
    const lowerMap = Object.keys(data).reduce((acc, k) => {
        acc[k.toLowerCase()] = data[k];
        return acc;
    }, {});
    
    const scannedPkValue = String(lowerMap[pkKey.toLowerCase()] || '').trim();
    if (!scannedPkValue) return { success: false, error: 'Primary key empty' };

    if (scannedIds.includes(scannedPkValue)) {
      return { success: false, error: 'Already scanned', pkValue: scannedPkValue };
    }
    
    // Validate if student exists
    const studentExists = students.some(st => String(st[pkColName] || '').trim() === scannedPkValue);
    if (!studentExists) {
        return { success: false, error: 'Student not found in roster' };
    }

    // Default to 'P' or first positive
    const attVals = activeSheet.attendance_values || [];
    const defaultVal = attVals.find(v => v.is_positive)?.value || 'P';

    addScannedId(scannedPkValue);
    setMarkedValue(scannedPkValue, defaultVal);
    
    return { success: true, pkValue: scannedPkValue, studentData: data };
  }, [activeSheet, students, scannedIds, addScannedId, setMarkedValue]);

  const markManually = useCallback((pkValue, value) => {
    setMarkedValue(pkValue, value);
    if (!scannedIds.includes(pkValue)) addScannedId(pkValue);
    toast.success(`Marked ${pkValue} as ${value}`);
  }, [setMarkedValue, scannedIds, addScannedId]);

  const handleEndSession = useCallback(async (unmarkedDefault = 'empty', absentValue = 'A') => {
    setIsProcessing(true);
    try {
      const payload = {
        session_id: sessionId,
        sheet_id: sheetId,
        date_column: date,
        marked_values: markedValues,
        value_counts: Object.values(markedValues).reduce((acc, val) => {
          acc[val] = (acc[val] || 0) + 1;
          return acc;
        }, {}),
        unmarked_default: unmarkedDefault,
        absent_value: absentValue
      };

      await attendanceService.endSession(payload);
      clearUnsavedChanges();
      toast.success('Wait, checking data...', { duration: 1000 });
      setTimeout(() => toast.success('Data successfully uploaded to Google Sheets! ✨', { duration: 4000 }), 1000);
    } catch (err) {
      toast.error('Failed to close session');
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId, sheetId, date, markedValues, clearUnsavedChanges]);

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
