/**
 * AttendX — Constants
 * Central config values used across the frontend.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7860';

// Attendance badge thresholds (PRD §7.4)
export const BADGE_THRESHOLDS = {
  GREEN: 75,   // >= 75%
  YELLOW: 50,  // >= 50%
  // < 50% = RED
};

// Attendance values written to Google Sheet
export const ATTENDANCE_VALUES = {
  PRESENT: 'P',
  ABSENT: 'A',
};

// Auth status values (SRD §3.1)
export const USER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
};

// User roles (SRD §3.1)
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
};
