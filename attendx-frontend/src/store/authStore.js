/**
 * AttendX — Auth Store (Zustand)
 * Stores: user, role, org, status, isLoading
 * Per SRD §2.1 folder structure.
 */
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  // Firebase user object
  firebaseUser: null,

  // Firestore user profile from GET /api/auth/me
  user: null,
  role: null,
  org: null,
  orgId: null,
  status: null,
  authProvider: null,

  // Loading state
  isLoading: true,
  isNewGoogleUser: false,

  // Actions
  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),

  setUser: (userData) =>
    set({
      user: userData,
      role: userData?.role || null,
      org: userData?.org_name || null,
      orgId: userData?.org_id || null,
      status: userData?.status || null,
      authProvider: userData?.auth_provider || null,
      isNewGoogleUser: userData?.is_new_google_user || false,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  clearUser: () =>
    set({
      firebaseUser: null,
      user: null,
      role: null,
      org: null,
      orgId: null,
      status: null,
      authProvider: null,
      isLoading: false,
      isNewGoogleUser: false,
    }),
}));

export default useAuthStore;
