import { useState } from 'react';
import { QRCard } from './QRCard';
import QRCodeStyling from 'qr-code-styling';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

export function QRGrid({ items, qrOptions, sheetName = "QRCodes" }) {
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const handleBulkDownload = async () => {
    if (!items || items.length === 0) return;
    
    setIsZipping(true);
    setZipProgress(0);
    const zip = new JSZip();
    const folder = zip.folder(`${sheetName}_QRs`);

    const generateImage = (data) => {
      return new Promise((resolve) => {
        const qr = new QRCodeStyling({
          width: 500, // Higher res for printed downloads
          height: 500,
          margin: qrOptions.margin !== undefined ? qrOptions.margin : 10,
          type: "svg",
          data: typeof data === 'object' ? JSON.stringify(data) : data,
          image: qrOptions.logo || "",
          dotsOptions: {
            color: qrOptions.fgColor || "#000000",
            type: "rounded"
          },
          backgroundOptions: {
            color: qrOptions.bgColor || "#ffffff",
          },
          imageOptions: {
            crossOrigin: "anonymous",
            margin: 10,
            imageSize: qrOptions.logoSize !== undefined ? qrOptions.logoSize : 0.4
          },
          qrOptions: {
            errorCorrectionLevel: 'H'
          }
        });
        
        qr.getRawData("png").then(blob => resolve(blob));
      });
    };

    try {
      let count = 0;
      for (const item of items) {
        const blob = await generateImage(item.qrData);
        // Fallback name if formatting is missing. Append count to guarantee uniqueness in zip!
        const safeName = (item.primaryValue || `qr_${count}`).toString().replace(/[^a-z0-9]/gi, '_');
        folder.file(`${safeName}_${count}.png`, blob);
        
        count++;
        // Update every 10 items or at the end to prevent state thrashing
        if (count % 10 === 0 || count === items.length) {
          setZipProgress(Math.round((count / items.length) * 100));
        }
      }

      toast.loading("Zipping files...", { id: "zip-toast" });
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${sheetName}_QRCodes_${new Date().toISOString().split('T')[0]}.zip`);
      toast.success("Ready for Download!", { id: "zip-toast" });
    } catch (e) {
      toast.error("Failed to generate ZIP", { id: "zip-toast" });
    } finally {
      setIsZipping(false);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-surface border border-dashed border-border rounded-xl">
        <p className="text-text-secondary font-bold">No valid items to generate QR codes for.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">
          Generated QR Codes <span className="text-accent ml-2 text-sm">({items.length})</span>
        </h2>
        
        <button 
          onClick={handleBulkDownload}
          disabled={isZipping}
          className="bg-accent text-bg px-5 py-2 flex items-center gap-2 font-bold text-sm rounded-lg hover:brightness-110 transition disabled:opacity-40"
        >
          {isZipping ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin"></div>
              Processing {zipProgress}%
            </span>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download ZIP
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item, idx) => (
          <QRCard 
            key={idx} 
            pk={item.primaryKey} 
            primaryValue={item.primaryValue}
            data={item.qrData} 
            options={qrOptions} 
          />
        ))}
      </div>
    </div>
  );
}
