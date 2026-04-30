import { useRef, useEffect } from 'react';
import { useQRScanner } from '../../hooks/useQRScanner';

// Overlay can be passed as children
export function QRScanner({ onScan, active = true, children }) {
  const videoRef = useRef(null);
  
  // Custom hook that binds qr-scanner to our video element
  const { error } = useQRScanner({ videoRef, onScan, active });

  if (error) {
    return (
      <div className="relative flex flex-col items-center justify-center h-full w-full bg-black rounded-2xl border border-border p-6 text-center">
        <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
        <h3 className="text-white font-bold mb-2">Camera Access Denied</h3>
        <p className="text-sm text-text-secondary max-w-xs mx-auto">Please allow camera permissions in your browser settings and refresh the page to scan QR codes.</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-black rounded-2xl border border-border">
      <video 
        ref={videoRef} 
        className="h-full w-full object-cover" 
        disablePictureInPicture
        playsInline 
        muted 
      />
      {/* Overlay contents, e.g., corners, toasts */}
      {children}
      
      {/* Simple viewfinder corners */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 border-2 border-white/20 rounded-3xl relative">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl"></div>
        </div>
      </div>
    </div>
  );
}
