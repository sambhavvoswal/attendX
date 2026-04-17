import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

export function LogoUpload({ onLogoChange, onOpacityChange, onColorChange, onMarginChange }) {
  const [originalLogo, setOriginalLogo] = useState(null);
  const [logoSize, setLogoSize] = useState(0.4); 
  const [opacity, setOpacity] = useState(1);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [margin, setMargin] = useState(10);
  
  const fileInputRef = useRef(null);

  // Handle Logo Opacity via Canvas Compositing
  useEffect(() => {
    if (!originalLogo) {
      onLogoChange(null);
      return;
    }
    if (opacity === 1) {
      onLogoChange(originalLogo);
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.globalAlpha = opacity;
      ctx.drawImage(img, 0, 0);
      onLogoChange(canvas.toDataURL("image/png"));
    };
    img.src = originalLogo;
  }, [originalLogo, opacity, onLogoChange]);

  useEffect(() => {
    // onOpacityChange expects { opacity, size } payload for legacy mapping purposes
    onOpacityChange({ opacity: 1, size: logoSize });
  }, [logoSize, onOpacityChange]);

  useEffect(() => {
    onColorChange({ fgColor, bgColor });
  }, [fgColor, bgColor, onColorChange]);

  useEffect(() => {
    if (onMarginChange) onMarginChange(margin);
  }, [margin, onMarginChange]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalLogo(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearLogo = () => {
    setOriginalLogo(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-5 space-y-5">
      <h3 className="text-sm font-bold text-text-primary">Customization</h3>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-text-secondary block mb-2">QR Color</label>
          <div className="flex gap-2">
            <input 
              type="color" 
              value={fgColor} 
              onChange={e => setFgColor(e.target.value)}
              className="w-8 h-8 rounded border-none p-0 cursor-pointer bg-transparent"
            />
            <input 
              type="text" 
              value={fgColor}
              onChange={e => setFgColor(e.target.value)}
              className="flex-1 bg-bg border border-border rounded px-2 text-xs uppercase"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-text-secondary block mb-2">Background</label>
          <div className="flex gap-2">
            <input 
              type="color" 
              value={bgColor} 
              onChange={e => setBgColor(e.target.value)}
              className="w-8 h-8 rounded border-none p-0 cursor-pointer bg-transparent"
            />
            <input 
              type="text" 
              value={bgColor}
              onChange={e => setBgColor(e.target.value)}
              className="flex-1 bg-bg border border-border rounded px-2 text-xs uppercase"
            />
          </div>
        </div>
      </div>

      {/* Margin / Border */}
      <div>
        <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-text-secondary">Border Width</label>
            <span className="text-[10px] text-text-secondary font-mono">{margin}px</span>
        </div>
        <input 
            type="range" 
            min="0" 
            max="30" 
            step="1"
            value={margin}
            onChange={e => setMargin(parseInt(e.target.value))}
            className="w-full accent-accent bg-bg h-1 rounded-full appearance-none"
        />
      </div>

      <div className="border-t border-border pt-4">
        <label className="text-sm font-medium text-text-primary mb-3 block">Center Logo</label>

        {!originalLogo ? (
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border py-6 rounded-lg text-text-secondary hover:text-accent hover:border-accent hover:bg-accent/5 transition-all outline-none"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-sm font-bold">Upload a Logo Image</span>
            </button>
        ) : (
          <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-4">
              <div 
                className="w-16 h-16 shrink-0 border border-border rounded bg-bg flex items-center justify-center overflow-hidden cursor-pointer cursor-crosshair hover:border-accent"
                onClick={() => fileInputRef.current?.click()}
              >
                  <img src={originalLogo} alt="QR Logo" className="max-w-full max-h-full object-contain" style={{ opacity }} />
              </div>
              
              <div className="flex-1 space-y-4">
                 <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-text-secondary font-bold">Logo Size</label>
                        <span className="text-[10px] text-text-accent font-mono">{Math.round(logoSize * 100)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0.1" 
                        max="0.8" 
                        step="0.05"
                        value={logoSize}
                        onChange={e => setLogoSize(parseFloat(e.target.value))}
                        className="w-full accent-accent bg-bg h-1 rounded-full appearance-none"
                    />
                 </div>
                 
                 <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-text-secondary font-bold">Logo Opacity</label>
                        <span className="text-[10px] text-text-accent font-mono">{Math.round(opacity * 100)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0.1" 
                        max="1" 
                        step="0.05"
                        value={opacity}
                        onChange={e => setOpacity(parseFloat(e.target.value))}
                        className="w-full accent-accent bg-bg h-1 rounded-full appearance-none"
                    />
                 </div>
                 
                 {logoSize >= 0.70 && (
                     <div className="bg-red-500/10 border border-red-500/50 rounded p-2 flex items-start gap-2 mt-2">
                         <span className="text-xs">⚠️</span>
                         <p className="text-[10px] text-red-400 font-bold leading-tight uppercase">High sizes (&gt;70%) reduce scannability!</p>
                     </div>
                 )}
              </div>
            </div>

            <button 
              onClick={handleClearLogo}
              className="text-xs text-red-500 hover:text-red-400 underline decoration-red-500/30 font-medium"
            >
              Remove Logo
            </button>
          </div>
        )}
      </div>

      <input 
        type="file" 
        accept="image/png, image/jpeg, image/svg+xml" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
    </div>
  );
}
