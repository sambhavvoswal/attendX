import { useQRGenerator } from '../../hooks/useQRGenerator';

export function QRCard({ pk, data, options, primaryValue }) {
  const { containerRef, download } = useQRGenerator(data, options);

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col items-center justify-between gap-4 relative group">
      {/* Title */}
      <h3 className="font-bold text-text-primary text-center truncate w-full px-2" title={primaryValue}>
        {primaryValue || pk}
      </h3>
      
      {/* QR Container */}
      <div 
        ref={containerRef} 
        className="w-full aspect-square bg-white rounded-lg flex items-center justify-center p-2"
        style={{ maxWidth: '250px', maxHeight: '250px' }}
      >
        {/* qr-code-styling canvas will be injected here */}
      </div>

      {/* Download Action (hover only on desktop, always visible on mobile) */}
      <div className="w-full mt-2">
        <button 
          onClick={download}
          className="w-full py-2 bg-surface-header hover:bg-accent/20 hover:text-accent font-semibold text-sm rounded transition-colors"
        >
          Download PNG
        </button>
      </div>
    </div>
  );
}
