/**
 * AttendX — Sheet Store (Zustand)
 * Stores: active sheet, sheets list, students, sessions.
 */
import { create } from 'zustand';

const useSheetStore = create((set, get) => ({
  // All sheets for current user
  sheets: [],
  recentSheets: [],

  // Currently active/selected sheet
  activeSheet: null,

  // Students for active sheet
  students: [],

  // Columns for active sheet
  columns: [],
  dateColumns: [],
  nonDateColumns: [],

  // Loading states
  isLoadingSheets: false,
  isLoadingStudents: false,

  // Actions
  setSheets: (sheets) => set({ sheets }),
  setRecentSheets: (recentSheets) => set({ recentSheets }),
  setActiveSheet: (sheet) => set({ activeSheet: sheet }),
  setStudents: (students) => set({ students }),
  setColumns: ({ columns, dateColumns, nonDateColumns }) =>
    set({ columns, dateColumns, nonDateColumns }),
  setLoadingSheets: (isLoadingSheets) => set({ isLoadingSheets }),
  setLoadingStudents: (isLoadingStudents) => set({ isLoadingStudents }),

  // Remove a sheet from local state
  removeSheet: (sheetId) =>
    set((state) => ({
      sheets: state.sheets.filter((s) => s.sheet_id !== sheetId),
      recentSheets: state.recentSheets.filter((s) => s.sheet_id !== sheetId),
    })),

  clearSheetData: () =>
    set({
      activeSheet: null,
      students: [],
      columns: [],
      dateColumns: [],
      nonDateColumns: [],
    }),
}));

export default useSheetStore;
