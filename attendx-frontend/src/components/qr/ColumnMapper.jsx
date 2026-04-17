import { useState } from 'react';

export function ColumnMapper({ headers, onComplete, defaultMappings = {}, defaultTitleField = "" }) {
  // We need to reverse lookup if defaultMappings stores { "jsonKey": "OriginalHeader" }
  // Wait, defaultMappings passed from backend is: { "jsonKey": "HeaderInSheet" }
  // Let's create a set of selected original headers.
  const initialSelected = {};
  const initialCustomKeys = {};
  
  headers.forEach(h => {
    // Find if this header was mapped
    const jsonKeyEntry = Object.entries(defaultMappings).find(([k, v]) => v === h);
    if (jsonKeyEntry) {
        initialSelected[h] = true;
        initialCustomKeys[h] = jsonKeyEntry[0]; // The custom JSON key
    } else {
        initialSelected[h] = false;
        initialCustomKeys[h] = h;
    }
  });

  const [selectedHeaders, setSelectedHeaders] = useState(initialSelected);
  const [customKeys, setCustomKeys] = useState(initialCustomKeys);
  const [primaryTitle, setPrimaryTitle] = useState(defaultTitleField || headers[0] || "");

  const toggleHeader = (header) => {
    setSelectedHeaders(prev => ({
      ...prev,
      [header]: !prev[header]
    }));
  };

  const handleKeyChange = (header, value) => {
    setCustomKeys(prev => ({
      ...prev,
      [header]: value
    }));
  };

  const handleConfirm = () => {
    const finalMapping = {};
    headers.forEach(h => {
      if (selectedHeaders[h]) {
        // use lower case for the final json key or custom key if defined
        finalMapping[h] = customKeys[h] ? customKeys[h].toLowerCase() : h.toLowerCase();
      }
    });
    onComplete({ mapping: finalMapping, titleField: primaryTitle });
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <h3 className="text-sm font-bold text-text-primary mb-1">Map Data Fields</h3>
      <p className="text-xs text-text-secondary mb-4">
        Select which columns to encode in the QR code and customize their JSON keys.
      </p>

      <div className="mb-6">
        <label className="text-xs font-bold text-text-secondary block mb-2">Display Title Column (Used for naming / ZIP exports):</label>
        <select 
           value={primaryTitle}
           onChange={(e) => setPrimaryTitle(e.target.value)}
           className="w-full bg-bg border border-border text-sm p-2 rounded-lg text-text-primary focus:ring-1 focus:ring-accent outline-none"
        >
           {headers.map(h => (
               <option key={h} value={h}>{h}</option>
           ))}
        </select>
      </div>

      <div className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-2">
        {headers.map(header => (
          <div key={header} className="flex gap-3 items-center">
            <label className="flex items-center gap-3 cursor-pointer select-none min-w-[40%] flex-shrink-0 text-white font-medium text-sm">
              <input 
                type="checkbox" 
                checked={selectedHeaders[header]}
                onChange={() => toggleHeader(header)}
                className="w-4 h-4 rounded appearance-none border border-border bg-bg checked:bg-accent focus:ring-accent checked:border-transparent transition-all cursor-pointer relative checked:before:content-['✓'] checked:before:absolute checked:before:text-[10px] checked:before:text-bg checked:before:left-[3px] checked:before:top-[1px] checked:before:font-black"
              />
              <span className="truncate">{header}</span>
            </label>
            
            {selectedHeaders[header] && (
              <div className="flex-1 flex items-center gap-2">
                <span className="text-text-secondary text-xs">→</span>
                <input 
                  type="text" 
                  value={customKeys[header]}
                  onChange={(e) => handleKeyChange(header, e.target.value)}
                  className="flex-1 bg-bg border border-border rounded px-2 py-1 text-xs text-text-primary outline-none focus:ring-1 focus:ring-accent"
                  placeholder="JSON key"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleConfirm}
          disabled={!Object.values(selectedHeaders).some(Boolean)}
          className="bg-accent text-bg px-5 py-2 flex items-center gap-2 font-bold text-sm rounded-lg hover:brightness-110 transition disabled:opacity-40"
        >
          Generate QR Codes
        </button>
      </div>
    </div>
  );
}
