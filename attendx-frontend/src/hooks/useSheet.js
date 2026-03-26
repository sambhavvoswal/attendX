/**
 * AttendX — useSheet Hook
 * Sheet CRUD operations + data fetching.
 */
import { useCallback } from 'react';
import useSheetStore from '../store/sheetStore';
import * as sheetsApi from '../services/sheetsService';
import toast from 'react-hot-toast';

export default function useSheet() {
  const store = useSheetStore();

  const loadSheets = useCallback(async () => {
    store.setLoadingSheets(true);
    try {
      const [all, recent] = await Promise.all([
        sheetsApi.fetchSheets(),
        sheetsApi.fetchRecentSheets(),
      ]);
      store.setSheets(all);
      store.setRecentSheets(recent);
    } catch (err) {
      toast.error('Failed to load sheets');
    } finally {
      store.setLoadingSheets(false);
    }
  }, []);

  const loadSheet = useCallback(async (sheetId) => {
    try {
      const sheet = await sheetsApi.fetchSheet(sheetId);
      store.setActiveSheet(sheet);
      return sheet;
    } catch (err) {
      toast.error('Failed to load sheet');
      return null;
    }
  }, []);

  const loadStudents = useCallback(async (sheetId) => {
    store.setLoadingStudents(true);
    try {
      const students = await sheetsApi.fetchStudents(sheetId);
      store.setStudents(students);
      return students;
    } catch (err) {
      toast.error('Failed to load students');
      return [];
    } finally {
      store.setLoadingStudents(false);
    }
  }, []);

  const loadColumns = useCallback(async (sheetId) => {
    try {
      const cols = await sheetsApi.fetchColumns(sheetId);
      store.setColumns({
        columns: cols.columns,
        dateColumns: cols.date_columns,
        nonDateColumns: cols.non_date_columns,
      });
      return cols;
    } catch (err) {
      toast.error('Failed to load columns');
      return null;
    }
  }, []);

  const handleCreateSheet = useCallback(async (data) => {
    try {
      const sheet = await sheetsApi.createSheet(data);
      toast.success('Sheet registered!');
      await loadSheets();
      return sheet;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create sheet');
      return null;
    }
  }, [loadSheets]);

  const handleDeleteSheet = useCallback(async (sheetId) => {
    try {
      await sheetsApi.deleteSheet(sheetId);
      store.removeSheet(sheetId);
      toast.success('Sheet removed');
    } catch (err) {
      toast.error('Failed to delete sheet');
    }
  }, []);

  const handleUpdateSheet = useCallback(async (sheetId, data) => {
    try {
      const updated = await sheetsApi.updateSheet(sheetId, data);
      store.setActiveSheet(updated);
      toast.success('Sheet updated');
      return updated;
    } catch (err) {
      toast.error('Failed to update sheet');
      return null;
    }
  }, []);

  return {
    ...store,
    loadSheets,
    loadSheet,
    loadStudents,
    loadColumns,
    handleCreateSheet,
    handleDeleteSheet,
    handleUpdateSheet,
  };
}
