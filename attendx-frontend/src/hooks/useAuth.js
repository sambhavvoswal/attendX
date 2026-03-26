/**
 * AttendX — useAuth Hook
 * Manages Firebase auth state + Firestore status check.
 * Per SRD §10.2: on any login, calls GET /api/auth/me and routes by status.
 */
import { useEffect } from 'react';
import { onAuthStateChanged, auth } from '../services/firebase';
import api from '../services/api';
import useAuthStore from '../store/authStore';

export default function useAuth() {
  const {
    firebaseUser,
    user,
    role,
    status,
    isLoading,
    isNewGoogleUser,
    setFirebaseUser,
    setUser,
    setLoading,
    clearUser,
  } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);

      if (fbUser) {
        setFirebaseUser(fbUser);

        try {
          const response = await api.get('/api/auth/me');
          setUser(response.data);
        } catch (error) {
          if (error.response?.status === 403) {
            // Account is inactive — set the status from error detail
            const detail = error.response.data?.detail;
            setUser({
              uid: fbUser.uid,
              email: fbUser.email,
              name: fbUser.displayName || '',
              org_name: '',
              role: 'user',
              status: detail?.status || 'pending',
              auth_provider: fbUser.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'email',
              is_new_google_user: false,
            });
          } else if (error.response?.status === 404) {
            // No Firestore doc — new Google user
            setUser({
              uid: fbUser.uid,
              email: fbUser.email,
              name: fbUser.displayName || '',
              org_name: '',
              role: 'user',
              status: 'new',
              auth_provider: 'google',
              is_new_google_user: true,
            });
          } else {
            clearUser();
          }
        }
      } else {
        clearUser();
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    firebaseUser,
    user,
    role,
    status,
    isLoading,
    isNewGoogleUser,
    isAuthenticated: !!firebaseUser,
  };
}
