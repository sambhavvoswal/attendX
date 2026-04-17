import { useEffect, useRef, useState, useCallback } from 'react';
import QRCodeStyling from 'qr-code-styling';

export function useQRGenerator(data, options = {}) {
  const [qrCode, setQrCode] = useState(null);
  const containerRef = useRef(null);

  const mergedOptions = {
    width: 300,
    height: 300,
    margin: options.margin !== undefined ? options.margin : 10,
    type: "svg",
    data: typeof data === 'object' ? JSON.stringify(data) : data,
    image: options.logo || "",
    dotsOptions: {
      color: options.fgColor || "#000000",
      type: "rounded"
    },
    backgroundOptions: {
      color: options.bgColor || "#ffffff",
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 10,
      imageSize: options.logoSize !== undefined ? options.logoSize : 0.4
    },
    qrOptions: {
      errorCorrectionLevel: 'H' // High to sustain logo
    }
  };

  useEffect(() => {
    const qr = new QRCodeStyling(mergedOptions);
    setQrCode(qr);
  }, [data, options.logo, options.fgColor, options.bgColor, options.margin, options.logoSize]);

  useEffect(() => {
    if (qrCode && containerRef.current) {
        containerRef.current.innerHTML = "";
        qrCode.append(containerRef.current);
        const child = containerRef.current.firstChild;
        if (child) {
            child.style.width = '100%';
            child.style.height = '100%';
            child.style.objectFit = 'contain';
        }
    }
  }, [qrCode, containerRef]);

  const download = useCallback(() => {
    if (qrCode) {
      qrCode.download({ extension: "png" });
    }
  }, [qrCode]);

  // For bulk zip, we might need access to it
  return { containerRef, download, qrCode };
}
