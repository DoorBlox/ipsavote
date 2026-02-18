
import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Keyboard, ArrowRight, Loader2, Info, CameraOff, Scan } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface VoterPortalProps {
  onAuth: (token: string) => { success: boolean; error?: string };
}

const VoterPortal: React.FC<VoterPortalProps> = ({ onAuth }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isCameraStarting, setIsCameraStarting] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;
        
        const config = { fps: 20, qrbox: { width: 250, height: 250 } };
        
        // Use standard environment (back) camera
        await html5QrCode.start(
          { facingMode: "environment" }, 
          config, 
          (decodedText) => {
            setToken(decodedText);
            handleManualSubmit(decodedText);
          },
          () => {} // silent on frame scan failure
        );
        setIsCameraStarting(false);
      } catch (err) {
        console.error("Camera direct start failed:", err);
        setScannerError("Camera could not be started automatically. Check permissions.");
        setIsCameraStarting(false);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
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
        setError(result.error || 'Invalid token');
        setIsLoading(false);
      } else {
        // Stop camera if successful login
        if (scannerRef.current && scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(console.error);
        }
      }
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7b2b2a]/10 text-[#7b2b2a] font-black text-[10px] uppercase tracking-widest mb-4 border border-[#7b2b2a]/20">
          <Scan size={12} /> Live Election System
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-[#7b2b2a] mb-2 tracking-tighter uppercase">Cast Your Vote</h2>
        <p className="text-slate-500 text-lg font-medium">Please present your official QR token to the camera.</p>
      </div>

      <div className="grid md:grid-cols-5 gap-8 items-start">
        <div className="md:col-span-3 bg-white p-6 rounded-[2.5rem] shadow-2xl border-2 border-[#fdfbf7] overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#7b2b2a] p-3 rounded-2xl text-[#c5a059] shadow-lg shadow-red-900/20">
                <QrCode size={24} />
              </div>
              <h3 className="font-black text-xl text-slate-800 uppercase tracking-tight">Auto-Scanner</h3>
            </div>
            {(isLoading || isCameraStarting) && <Loader2 className="animate-spin text-[#7b2b2a]" size={24} />}
          </div>
          
          <div className="relative group">
            <div id="reader" className="overflow-hidden rounded-3xl bg-slate-900 border-8 border-[#fdfbf7] shadow-inner aspect-square flex items-center justify-center">
              {isCameraStarting && !scannerError && (
                <div className="text-white flex flex-col items-center">
                   <Loader2 className="animate-spin mb-4" size={40} />
                   <p className="font-black uppercase tracking-widest text-[10px]">Initializing Camera...</p>
                </div>
              )}
              {scannerError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-800 p-8 text-center">
                  <CameraOff size={48} className="mb-4 text-amber-500" />
                  <p className="font-bold text-lg mb-2">{scannerError}</p>
                  <p className="text-xs opacity-60">Try allowing camera permissions in your browser or refresh the page.</p>
                </div>
              )}
            </div>
            
            {!scannerError && !isLoading && !isCameraStarting && (
              <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 h-1 bg-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.8)] animate-pulse pointer-events-none rounded-full" />
            )}
          </div>
          
          <p className="mt-6 text-center text-xs text-slate-400 font-black uppercase tracking-[0.2em]">
            Align QR Code within the frame to authenticate
          </p>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-50 p-2.5 rounded-xl text-[#7b2b2a]">
                <Keyboard size={20} />
              </div>
              <h3 className="font-black text-slate-800 uppercase tracking-tight">Manual Entry</h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Voter Token Code</label>
                <input 
                  type="text" 
                  value={token}
                  onChange={(e) => setToken(e.target.value.toUpperCase())}
                  placeholder="CODE-2026"
                  className="w-full px-4 py-4 text-2xl tracking-widest font-mono text-center uppercase rounded-2xl border-2 border-slate-100 focus:border-[#7b2b2a] focus:ring-4 focus:ring-[#7b2b2a]/5 outline-none transition-all bg-[#fdfbf7] text-slate-900 shadow-sm"
                />
              </div>

              {error && (
                <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-xs font-black border-2 border-rose-100 animate-in fade-in slide-in-from-top-2 uppercase tracking-wide">
                  Error: {error}
                </div>
              )}

              <button 
                onClick={() => handleManualSubmit(token)}
                disabled={isLoading || token.length < 3}
                className="w-full bg-[#7b2b2a] disabled:bg-slate-200 disabled:text-slate-400 hover:bg-[#5a1f1e] text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-red-900/10 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <>Access Ballot <ArrowRight size={20} /></>}
              </button>
            </div>
          </div>

          <div className="bg-[#7b2b2a] p-6 rounded-[2.5rem] border-2 border-[#c5a059]/30 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-white/10 p-2 rounded-full">
                <Info className="text-amber-200 shrink-0" size={20} />
              </div>
              <div className="text-[11px] leading-relaxed">
                <p className="font-black uppercase tracking-widest mb-1 text-amber-200">Security & Privacy</p>
                Each token is single-use and non-reversible. Your identity remains strictly decoupled from the specific candidate you select.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterPortal;
