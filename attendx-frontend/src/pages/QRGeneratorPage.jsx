import { useState, useEffect, useCallback } from 'react';
import { ExcelUpload } from '../components/qr/ExcelUpload';
import { ColumnMapper } from '../components/qr/ColumnMapper';
import { LogoUpload } from '../components/qr/LogoUpload';
import { QRGrid } from '../components/qr/QRGrid';
import { sheetsService } from '../services/sheetsService';
import { parseExcelFile } from '../utils/excelParser';
import { useSheet } from '../hooks/useSheet';
import toast from 'react-hot-toast';

export default function QRGeneratorPage() {
  const { sheets, fetchSheets } = useSheet();
  
  const [sourceType, setSourceType] = useState('sheet'); // 'sheet' | 'file'
  const [selectedSheetId, setSelectedSheetId] = useState("");
  
  const [rawHeaders, setRawHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [sheetDefaults, setSheetDefaults] = useState({ mapping: {}, primaryKey: "" });
  
  // Customization state
  const [qrOptions, setQrOptions] = useState({
    logo: null,
    logoSize: 0.4,
    fgColor: "#000000",
    bgColor: "#ffffff",
    margin: 10
  });

  // Final resulting items mapped for QR generator
  const [qrItems, setQrItems] = useState([]);
  const [sheetName, setSheetName] = useState("QR_Codes");

  // Fetch sheets on mount if none exist
  useEffect(() => {
    if (sheets.length === 0) fetchSheets();
  }, [sheets, fetchSheets]);

  const handleSourceChange = (type) => {
    setSourceType(type);
    setRawHeaders([]);
    setRawRows([]);
    setQrItems([]);
    setSheetDefaults({ mapping: {}, primaryKey: "" });
  };

  const handleSheetSelect = async (e) => {
    const id = e.target.value;
    setSelectedSheetId(id);
    if (!id) return;

    const sheet = sheets.find(s => s.sheet_id === id);
    if (sheet) setSheetName(sheet.display_name);

    toast.loading("Fetching sheet data...", { id: "fetch_sheet" });
    try {
      const students = await sheetsService.getStudents(id);
      if (!students || students.length === 0) {
        toast.error("No students found in this sheet.", { id: "fetch_sheet" });
        return;
      }
      
      // Instead of auto-generating, always let the user see and verify the mapping.
      // If we have qr_key_mapping from the backend, we pass it as defaults.
      const headers = Object.keys(students[0] || {});
      setRawHeaders(headers);
      setRawRows(students);
      
      if (sheet && sheet.qr_key_mapping && Object.keys(sheet.qr_key_mapping).length > 0) {
        setSheetDefaults({
            mapping: sheet.qr_key_mapping,
            primaryKey: sheet.primary_key || ""
        });
        toast.success("Review your mappings and generate.", { id: "fetch_sheet" });
      } else {
        setSheetDefaults({ mapping: {}, primaryKey: "" });
        toast.success("Select fields to encode.", { id: "fetch_sheet" });
      }
    } catch (err) {
      toast.error(err.message || "Failed to fetch sheet data", { id: "fetch_sheet" });
    }
  };

  const handleFileUpload = async (file) => {
    setSheetName(file.name.replace(/\.[^/.]+$/, "")); // remove extension
    toast.loading("Reading file...", { id: "file_upload" });
    try {
      // First try frontend parsing (zero latency)
      const data = await parseExcelFile(file);
      setRawHeaders(data.headers);
      setRawRows(data.rows);
      setSheetDefaults({ mapping: {}, primaryKey: "" });
      toast.success("File imported. Map columns next.", { id: "file_upload" });
    } catch (err) {
      toast.error(err.message, { id: "file_upload" });
    }
  };



  const handleGenerateCustom = ({ mapping: finalMapping, titleField }) => {
    // This runs when column mapper is done
    const items = rawRows.map((row, idx) => {
      const qrData = {};
      let primaryValue = row[titleField] || "Item " + (idx + 1);
      
      Object.entries(finalMapping).forEach(([sheetHeader, jsonKey]) => {
        qrData[jsonKey] = row[sheetHeader] || "";
      });
      
      return {
        primaryKey: idx.toString(),
        primaryValue,
        qrData
      };
    });
    setQrItems(items);
    toast.success(`Generated ${items.length} QR payloads!`);
  };

  const handleLogoChange = useCallback((logoBase64) => setQrOptions(prev => ({ ...prev, logo: logoBase64 })), []);
  const handleOpacityChange = useCallback(({ opacity, size }) => setQrOptions(prev => ({ ...prev, logoSize: size })), []); 
  const handleColorChange = useCallback(({ fgColor, bgColor }) => setQrOptions(prev => ({ ...prev, fgColor, bgColor })), []);
  const handleMarginChange = useCallback((margin) => setQrOptions(prev => ({ ...prev, margin })), []);

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-8">
        <h1 className="text-3xl font-[Fraunces] font-bold text-text-primary">QR Generator</h1>
        <p className="text-text-secondary text-sm">Create printable QR codes for students instantly.</p>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 pb-24 space-y-12">
        
        {/* TOP CONFIGURATION STACK */}
        <div className="max-w-3xl mx-auto w-full space-y-6">
            
            {/* SOURCE SELECTOR */}
            <div className="bg-surface border border-border p-5 rounded-xl">
              <h3 className="text-sm font-bold text-text-primary mb-4">Source Data</h3>
              
              <div className="flex bg-bg rounded-lg p-1 border border-border mb-4">
                <button 
                  onClick={() => handleSourceChange('sheet')}
                  className={`flex-1 text-xs py-2 font-bold rounded-md transition-colors ${sourceType === 'sheet' ? 'bg-surface border border-border shadow-sm text-accent' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  My Sheets
                </button>
                <button 
                  onClick={() => handleSourceChange('file')}
                  className={`flex-1 text-xs py-2 font-bold rounded-md transition-colors ${sourceType === 'file' ? 'bg-surface border border-border shadow-sm text-accent' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  Upload File
                </button>
              </div>

              {sourceType === 'sheet' ? (
                <div>
                  <select 
                    value={selectedSheetId} 
                    onChange={handleSheetSelect}
                    className="w-full bg-bg border border-border text-sm p-3 rounded-lg text-text-primary focus:ring-1 focus:ring-accent outline-none"
                  >
                    <option value="" disabled>Select a sheet...</option>
                    {sheets.map(sheet => (
                      <option key={sheet.sheet_id} value={sheet.sheet_id}>{sheet.display_name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <ExcelUpload onUpload={handleFileUpload} />
              )}
            </div>

            {/* MAPPING COMPONENT (Only shown if data exists but not parsed) */}
            {rawHeaders.length > 0 && qrItems.length === 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                 <ColumnMapper 
                   headers={rawHeaders} 
                   defaultMappings={sheetDefaults.mapping}
                   defaultTitleField={sheetDefaults.primaryKey}
                   onComplete={handleGenerateCustom}
                 />
              </div>
            )}

            {/* CUSTOMIZATION TOOLBAR */}
            {(qrItems.length > 0 || Object.keys(rawHeaders).length > 0) && (
              <LogoUpload 
                onLogoChange={handleLogoChange}
                onOpacityChange={handleOpacityChange}
                onColorChange={handleColorChange}
                onMarginChange={handleMarginChange}
              />
            )}
          </div>

          {/* MAIN CANVAS / GRID */}
          <div className="w-full">
            {qrItems.length > 0 ? (
              <QRGrid 
                items={qrItems} 
                qrOptions={qrOptions}
                sheetName={sheetName}
              />
            ) : (
              <div className="border-2 border-dashed border-border rounded-xl p-16 flex flex-col items-center justify-center text-center h-full bg-surface">
                <div className="w-16 h-16 bg-surface-header flex items-center justify-center rounded-full mb-4">
                  <svg className="w-8 h-8 text-accent opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">No QR Codes Generated</h3>
                <p className="text-sm text-text-secondary max-w-sm">
                  Select a Google Sheet or upload an Excel file to begin generating your batch of QR codes.
                </p>
              </div>
            )}
          </div>

      </div>
    </div>
  );
}
