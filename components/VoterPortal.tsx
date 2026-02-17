import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Keyboard, ArrowRight, Loader2, Info, CameraOff } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface VoterPortalProps {
  onAuth: (token: string) => { success: boolean; error?: string };
}

const VoterPortal: React.FC<VoterPortalProps> = ({ onAuth }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        html5QrCodeRef.current = html5QrCode;

        const config = { fps: 20, qrbox: { width: 280, height: 280 } };

        // Attempt to start camera instantly
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            setToken(decodedText);
            handleManualSubmit(decodedText);
          },
          () => {} // Silently ignore scan errors (polling)
        );
        setIsCameraReady(true);
      } catch (err) {
        console.error("Camera start failed:", err);
        setScannerError("Camera blocked or unavailable. Please enter token manually.");
      }
    };

    const timer = setTimeout(initializeScanner, 100);

    return () => {
      clearTimeout(timer);
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(e => console.error("Scanner stop error", e));
      }
    };
  }, []);

  const handleManualSubmit = (inputToken: string) => {
    if (!inputToken.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      const result = onAuth(inputToken.trim());
      if (!result.success) {
        setError(result.error || 'Invalid token');
        setIsLoading(false);
      }
    }, 400);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-4xl font-black text-[#7b2b2a] mb-2 tracking-tight uppercase">Election Portal</h2>
        <p className="text-slate-500 text-lg font-medium">Position your QR code within the frame for instant access.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl shadow-2xl border-2 border-[#faf7f2] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059] opacity-5 -translate-y-1/2 translate-x-1/2 rotate-45"></div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#7b2b2a] p-2.5 rounded-xl text-white shadow-lg shadow-[#7b2b2a]/20">
                <QrCode size={24} />
              </div>
              <h3 className="font-black text-xl text-slate-800 uppercase tracking-tight">Direct Scanner</h3>
            </div>
            {isLoading && <Loader2 className="animate-spin text-[#7b2b2a]" size={24} />}
          </div>
          
          <div className="relative group">
            <div id="reader" className="overflow-hidden rounded-2xl bg-slate-900 border-4 border-[#faf7f2] shadow-inner aspect-square">
              {!isCameraReady && !scannerError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900 z-10">
                  <Loader2 className="animate-spin mb-4 text-[#c5a059]" size={40} />
                  <p className="font-black text-[10px] uppercase tracking-[0.2em]">Activating Secure Lens...</p>
                </div>
              )}
              {scannerError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-800 p-8 text-center">
                  <CameraOff size={48} className="mb-4 text-[#7b2b2a]" />
                  <p className="font-bold text-sm uppercase tracking-tight leading-relaxed">{scannerError}</p>
                </div>
              )}
            </div>
            {isCameraReady && !isLoading && (
              <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 h-0.5 bg-[#c5a059] shadow-[0_0_20px_#c5a059] animate-bounce pointer-events-none rounded-full" />
            )}
          </div>
          
          <p className="mt-6 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
            Secure Encryption Active • IPSA Global
          </p>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#faf7f2] p-2 rounded-xl text-[#7b2b2a]">
                <Keyboard size={20} />
              </div>
              <h3 className="font-black text-slate-800 uppercase tracking-tight">Manual Key</h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Voter Token</label>
                <input 
                  type="text" 
                  value={token}
                  onChange={(e) => setToken(e.target.value.toUpperCase())}
                  placeholder="CODE-0000"
                  className="w-full px-4 py-4 text-2xl tracking-widest font-mono text-center uppercase rounded-2xl border-2 border-[#faf7f2] focus:border-[#c5a059] outline-none transition-all bg-white text-slate-900 shadow-sm"
                />
              </div>

              {error && (
                <div className="bg-rose-50 text-[#7b2b2a] p-4 rounded-xl text-xs font-black border border-rose-100 uppercase tracking-wider">
                  {error}
                </div>
              )}

              <button 
                onClick={() => handleManualSubmit(token)}
                disabled={isLoading || token.length < 3}
                className="w-full bg-[#7b2b2a] disabled:bg-slate-200 disabled:text-slate-400 hover:bg-[#5a1f1e] text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-xl shadow-[#7b2b2a]/20 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <>Enter Ballot <ArrowRight size={20} /></>}
              </button>
            </div>
          </div>

          <div className="bg-[#c5a059]/5 p-6 rounded-3xl border border-[#c5a059]/20">
            <div className="flex items-start gap-3">
              <Info className="text-[#c5a059] shrink-0 mt-0.5" size={18} />
              <div className="text-[11px] text-[#7b2b2a]/70 leading-relaxed font-bold">
                <p className="font-black text-[#7b2b2a] mb-1 uppercase tracking-wider">Privacy Protocol</p>
                Tokens are used for authentication only. Your specific choice remains cryptographically anonymous.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterPortal;