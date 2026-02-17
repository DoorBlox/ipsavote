import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Keyboard, ArrowRight, Loader2, Info, CameraOff } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface VoterPortalProps {
  onAuth: (token: string) => { success: boolean; error?: string };
}

const VoterPortal: React.FC<VoterPortalProps> = ({ onAuth }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    const startScanner = async () => {
      try {
        const scanner = new Html5QrcodeScanner("reader", { 
          fps: 15, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          rememberLastUsedCamera: true
        }, false);
        
        scanner.render((decodedText: string) => {
          setToken(decodedText);
          handleManualSubmit(decodedText);
        }, () => {
          // Continuous scanning...
        });
        
        scannerRef.current = scanner;
      } catch (err) {
        console.error("Scanner init error:", err);
        setScannerError("Could not access camera. Please use manual entry.");
      }
    };

    const timer = setTimeout(startScanner, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, []);

  const handleManualSubmit = (inputToken: string) => {
    if (!inputToken.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
      const result = onAuth(inputToken.trim());
      if (!result.success) {
        setError(result.error || 'Unknown error');
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">IPSA Student Election</h2>
        <p className="text-slate-500 text-lg">Position your QR code in front of the camera to begin.</p>
      </div>

      <div className="grid md:grid-cols-5 gap-8 items-start">
        <div className="md:col-span-3 bg-white p-6 rounded-3xl shadow-xl border border-indigo-50 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
                <QrCode size={24} />
              </div>
              <h3 className="font-bold text-xl text-slate-800">Direct Scan</h3>
            </div>
            {isLoading && <Loader2 className="animate-spin text-indigo-600" size={24} />}
          </div>
          
          <div className="relative group">
            <div id="reader" className="overflow-hidden rounded-2xl bg-slate-900 border-4 border-slate-100 shadow-inner aspect-square">
              {scannerError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-800 p-8 text-center">
                  <CameraOff size={48} className="mb-4 text-slate-500" />
                  <p className="font-medium">{scannerError}</p>
                </div>
              )}
            </div>
            
            {!scannerError && !isLoading && (
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-1 bg-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-pulse pointer-events-none rounded-full" />
            )}
          </div>
          
          <p className="mt-6 text-center text-sm text-slate-400 font-medium">
            Keep the QR code steady and centered within the frame.
          </p>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-slate-100 p-2 rounded-xl text-slate-600">
                <Keyboard size={20} />
              </div>
              <h3 className="font-bold text-slate-800">Manual Entry</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Voter Token</label>
                <input 
                  type="text" 
                  value={token}
                  onChange={(e) => setToken(e.target.value.toUpperCase())}
                  placeholder="ABC-1234"
                  className="w-full px-4 py-4 text-2xl tracking-widest font-mono text-center uppercase rounded-2xl border-2 border-slate-100 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none transition-all bg-white text-slate-900 shadow-sm"
                />
              </div>

              {error && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-semibold border border-rose-100 animate-in fade-in slide-in-from-top-2">
                  ⚠️ {error}
                </div>
              )}

              <button 
                onClick={() => handleManualSubmit(token)}
                disabled={isLoading || token.length < 3}
                className="w-full bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <>Continue to Vote <ArrowRight size={20} /></>}
              </button>
            </div>
          </div>

          <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100/50">
            <div className="flex items-start gap-3">
              <Info className="text-indigo-400 shrink-0 mt-0.5" size={18} />
              <div className="text-xs text-indigo-900/60 leading-relaxed">
                <p className="font-bold text-indigo-900/80 mb-1">Voting Privacy</p>
                Your vote is completely anonymous. The system only tracks that your token has been used.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterPortal;