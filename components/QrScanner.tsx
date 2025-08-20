
import React, { useEffect, useState } from 'react';

interface QrScannerProps {
  onScanSuccess: () => void;
  onCancel: () => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScanSuccess, onCancel }) => {
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (scanning) {
      const timer = setTimeout(() => {
        onScanSuccess();
      }, 2000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  return (
    <div className="fixed inset-0 bg-gray-900/90 flex flex-col items-center justify-center z-40 text-white animate-fade-in">
      <div className="relative w-72 h-72">
        <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-brand-green rounded-tl-lg"></div>
        <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-brand-green rounded-tr-lg"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-brand-green rounded-bl-lg"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-brand-green rounded-br-lg"></div>
        {scanning && (
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-green shadow-[0_0_15px_#00B894] animate-scan-line"></div>
        )}
      </div>

      <p className="mt-8 text-lg">{scanning ? 'Scanning...' : 'Position QR code inside the frame'}</p>

      {!scanning && (
          <button
              onClick={() => setScanning(true)}
              className="mt-8 bg-brand-green font-bold py-3 px-8 rounded-lg text-lg hover:bg-green-500 transition-colors duration-300"
          >
              Simulate Scan
          </button>
      )}

      <button
        onClick={onCancel}
        className="absolute bottom-10 bg-white/20 font-semibold py-2 px-6 rounded-lg hover:bg-white/30 transition-colors"
      >
        Cancel
      </button>

      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        
        @keyframes scan-line {
            0% { transform: translateY(0); }
            100% { transform: translateY(18rem); } /* 288px */
        }
        .animate-scan-line { animation: scan-line 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default QrScanner;
