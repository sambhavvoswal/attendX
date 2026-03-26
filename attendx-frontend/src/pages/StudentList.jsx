/**
 * AttendX — StudentList Page
 * Per-sheet student view with attendance badges.
 * Per PRD §7.4 — shows all students, search, generate QRs button.
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import StudentCard from '../components/sheets/StudentCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import useSheet from '../hooks/useSheet';

export default function StudentList() {
  const { sheetId } = useParams();
  const navigate = useNavigate();
  const {
    activeSheet,
    students,
    isLoadingStudents,
    loadSheet,
    loadStudents,
  } = useSheet();

  const [search, setSearch] = useState('');

  useEffect(() => {
    if (sheetId) {
      loadSheet(sheetId);
      loadStudents(sheetId);
    }
  }, [sheetId]);

  const pkField = activeSheet?.primary_key_column || '';

  // Filter students by search
  const filtered = students.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return Object.values(s.data || {}).some((val) =>
      String(val).toLowerCase().includes(q)
    );
  });

  return (
    <PageShell>
      <div className="py-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-slate-400 hover:text-slate-200 transition-default"
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-100 truncate">
              {activeSheet?.name || 'Students'}
            </h1>
            <p className="text-xs text-slate-500">
              {students.length} students
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 mb-4">
          <Button
            id="btn-generate-qrs"
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/qr-generator?sheet=${sheetId}`)}
          >
            📱 Generate QRs
          </Button>
          <Button
            id="btn-take-attendance"
            size="sm"
            onClick={() => navigate(`/sheets/${sheetId}/attendance`)}
          >
            📋 Take Attendance
          </Button>
        </div>

        {/* Search */}
        <Input
          id="input-search-students"
          placeholder="Search by name, ID, batch..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />

        {/* Student List */}
        {isLoadingStudents ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">
              {search ? 'No students match your search' : 'No students in this sheet'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((student, idx) => (
              <StudentCard
                key={student.data?.[pkField] || idx}
                student={student}
                pkField={pkField}
              />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
