/**
 * AttendX — Sheets API Service
 * Axios wrappers for all sheet-related API calls.
 */
import api from './api';

// ── Sheet CRUD ──

export async function fetchSheets() {
  const res = await api.get('/api/sheets');
  return res.data;
}

export async function fetchRecentSheets() {
  const res = await api.get('/api/sheets/recent');
  return res.data;
}

export async function fetchSheet(sheetId) {
  const res = await api.get(`/api/sheets/${sheetId}`);
  return res.data;
}

export async function createSheet(data) {
  const res = await api.post('/api/sheets', data);
  return res.data;
}

export async function updateSheet(sheetId, data) {
  const res = await api.put(`/api/sheets/${sheetId}`, data);
  return res.data;
}

export async function deleteSheet(sheetId) {
  const res = await api.delete(`/api/sheets/${sheetId}`);
  return res.data;
}

// ── Sheet Data ──

export async function fetchStudents(sheetId) {
  const res = await api.get(`/api/sheets/${sheetId}/students`);
  return res.data;
}

export async function addStudent(sheetId, rowData, markPresent = false, previousDefault = 'absent') {
  const res = await api.post(
    `/api/sheets/${sheetId}/students`,
    rowData,
    { params: { mark_present_today: markPresent, previous_default: previousDefault } }
  );
  return res.data;
}

export async function fetchColumns(sheetId) {
  const res = await api.get(`/api/sheets/${sheetId}/columns`);
  return res.data;
}

// ── Access Verification ──

export async function verifyAccess(sheetId) {
  const res = await api.post(`/api/sheets/${sheetId}/verify-access`);
  return res.data;
}

export async function verifyUrl(sheetUrl) {
  const res = await api.post('/api/sheets/verify-url', null, {
    params: { sheet_url: sheetUrl },
  });
  return res.data;
}

// ── Google OAuth ──

export async function connectGoogle() {
  const res = await api.post('/api/sheets/connect-google');
  return res.data;
}
