/**
 * AttendX — SheetSetup Page
 * New sheet wizard — link existing sheet (manual) or connect via OAuth.
 * Per PRD §7.2 sheet setup flow.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import useSheet from '../hooks/useSheet';
import { verifyUrl } from '../services/sheetsService';
import toast from 'react-hot-toast';

export default function SheetSetup() {
  const navigate = useNavigate();
  const { handleCreateSheet } = useSheet();

  // Steps: 'link' | 'configure'
  const [step, setStep] = useState('link');

  // Link step state
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [sheetId, setSheetId] = useState('');

  // Configure step state
  const [pkColumn, setPkColumn] = useState('');
  const [columns, setColumns] = useState([]);
  const [creating, setCreating] = useState(false);

  // Extract sheet ID from URL
  const extractSheetId = (url) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const handleVerify = async () => {
    if (!sheetUrl.trim()) {
      toast.error('Please paste a Google Sheet URL');
      return;
    }

    const id = extractSheetId(sheetUrl);
    if (!id) {
      toast.error('Invalid Google Sheets URL');
      return;
    }

    setVerifying(true);
    setVerifyResult(null);
    setSheetId(id);

    try {
      const result = await verifyUrl(sheetUrl);
      setVerifyResult(result);

      if (result.writable) {
        toast.success('Sheet access verified!');
      } else {
        toast.error(result.error_message || 'Cannot access sheet');
      }
    } catch (err) {
      toast.error('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleProceed = () => {
    if (!sheetName.trim()) {
      toast.error('Please give your sheet a name');
      return;
    }
    setStep('configure');
  };

  const handleCreate = async () => {
    if (!pkColumn.trim()) {
      toast.error('Please enter the Primary Key column name');
      return;
    }

    setCreating(true);
    const sheet = await handleCreateSheet({
      name: sheetName,
      google_sheet_id: sheetId,
      sheet_url: sheetUrl,
      access_method: 'manual_link',
      primary_key_column: pkColumn,
      qr_key_mapping: { [pkColumn.toLowerCase().replace(/\s+/g, '_')]: pkColumn },
    });

    setCreating(false);
    if (sheet) {
      navigate('/dashboard');
    }
  };

  return (
    <PageShell showBottomNav={false}>
      <div className="py-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => step === 'configure' ? setStep('link') : navigate('/dashboard')}
            className="text-slate-400 hover:text-slate-200 transition-default"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-slate-100">New Sheet</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {['Link Sheet', 'Configure'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${(i === 0 && step === 'link') || (i === 1 && step === 'configure')
                    ? 'bg-coral-500 text-white'
                    : i === 0 && step === 'configure'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }
                `}
              >
                {i === 0 && step === 'configure' ? '✓' : i + 1}
              </div>
              <span className="text-xs text-slate-400">{label}</span>
              {i === 0 && <div className="w-8 h-px bg-slate-700" />}
            </div>
          ))}
        </div>

        {/* Step 1: Link Sheet */}
        {step === 'link' && (
          <div className="flex flex-col gap-5">
            {/* Guide */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
              <h3 className="text-sm font-semibold text-slate-200 mb-3">
                📋 How to share your Google Sheet:
              </h3>
              <ol className="flex flex-col gap-2 text-xs text-slate-400">
                <li className="flex gap-2">
                  <span className="text-coral-400 font-bold">1.</span>
                  Open your Google Sheet
                </li>
                <li className="flex gap-2">
                  <span className="text-coral-400 font-bold">2.</span>
                  Click <strong className="text-slate-300">File → Share → Share with others</strong>
                </li>
                <li className="flex gap-2">
                  <span className="text-coral-400 font-bold">3.</span>
                  Change to <strong className="text-slate-300">&quot;Anyone with the link — Editor&quot;</strong>
                </li>
                <li className="flex gap-2">
                  <span className="text-coral-400 font-bold">4.</span>
                  Copy the link and paste it below
                </li>
              </ol>
            </div>

            <Input
              id="input-sheet-url"
              label="Google Sheet URL"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={sheetUrl}
              onChange={(e) => {
                setSheetUrl(e.target.value);
                setVerifyResult(null);
              }}
              required
            />

            <Button
              id="btn-verify"
              variant="secondary"
              onClick={handleVerify}
              loading={verifying}
              fullWidth
            >
              Verify Access
            </Button>

            {/* Verify result */}
            {verifyResult && (
              <div
                className={`
                  rounded-lg p-3 text-xs border
                  ${verifyResult.writable
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-coral-500/10 text-coral-400 border-coral-500/20'
                  }
                `}
              >
                {verifyResult.writable
                  ? '✅ Sheet has Editor access — ready to go!'
                  : `❌ ${verifyResult.error_message}`
                }
              </div>
            )}

            {/* Sheet name */}
            {verifyResult?.writable && (
              <>
                <Input
                  id="input-sheet-name"
                  label="Sheet Name (in AttendX)"
                  placeholder="e.g., Morning Batch 2026"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  required
                />
                <Button
                  id="btn-proceed"
                  onClick={handleProceed}
                  fullWidth
                  disabled={!sheetName.trim()}
                >
                  Next: Configure →
                </Button>
              </>
            )}
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 'configure' && (
          <div className="flex flex-col gap-5">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
              <p className="text-xs text-slate-400">
                The <strong className="text-slate-200">Primary Key</strong> is the column that
                uniquely identifies each person (e.g., &quot;Roll No&quot;, &quot;Employee ID&quot;).
                This must match the QR code data.
              </p>
            </div>

            <Input
              id="input-pk-column"
              label="Primary Key Column Name"
              placeholder="e.g., Roll No"
              value={pkColumn}
              onChange={(e) => setPkColumn(e.target.value)}
              required
            />

            <p className="text-xs text-slate-500">
              💡 This must match the <strong>exact column header</strong> in your Google Sheet
              (case-sensitive).
            </p>

            <Button
              id="btn-create-sheet"
              onClick={handleCreate}
              loading={creating}
              fullWidth
            >
              Register Sheet
            </Button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
