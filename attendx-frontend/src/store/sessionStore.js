import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useSessionStore = create(
  persist(
    (set, get) => ({
      sessionId: null,
      sheetId: null,
      date: null,
      mode: null,              // 'qr' | 'manual'
      scannedIds: [],          // Raw array of PK values from camera scans
      markedValues: {},        // { pk_value: "A", pk_value2: "L" }
      hasUnsavedChanges: false,
      
      initSession: (sessionId, sheetId, date, mode) => set({
        sessionId,
        sheetId,
        date,
        mode,
        scannedIds: [],
        markedValues: {},
        hasUnsavedChanges: false
      }),

      addScannedId: (pkValue) => {
        const state = get();
        if (!state.scannedIds.includes(pkValue)) {
          set({ 
            scannedIds: [...state.scannedIds, pkValue],
            hasUnsavedChanges: true
          });
        }
      },

      setMarkedValue: (pkValue, attendanceValue) => {
        set((state) => ({
          markedValues: { ...state.markedValues, [pkValue]: attendanceValue },
          hasUnsavedChanges: true
        }));
      },
      
      clearUnsavedChanges: () => set({ hasUnsavedChanges: false }),

      clearSession: () => set({
        sessionId: null,
        sheetId: null,
        date: null,
        mode: null,
        scannedIds: [],
        markedValues: {},
        hasUnsavedChanges: false
      })
    }),
    {
      name: 'attendx-active-session',
      storage: createJSONStorage(() => sessionStorage), // Survives refreshes, dies on tab close
    }
  )
);

export default useSessionStore;
