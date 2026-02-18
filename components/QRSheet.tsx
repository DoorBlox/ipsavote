
import React from 'react';
import { Voter } from '../types';
import { APP_LOGO } from '../constants';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, ShieldCheck, Printer } from 'lucide-react';

interface QRSheetProps {
  voters: Voter[];
  onBack: () => void;
}

const QRSheet: React.FC<QRSheetProps> = ({ voters, onBack }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between no-print bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl">
        <div className="flex gap-6 items-center">
           <button 
            onClick={onBack}
            className="p-4 bg-[#fdfbf7] border-2 border-slate-50 rounded-2xl text-[#7b2b2a] hover:bg-white hover:border-[#7b2b2a] transition-all shadow-sm"
            title="Return"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Token Management</h2>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Generate high-fidelity ballot credentials</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-3 px-10 py-4 bg-[#7b2b2a] text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-[#5a1f1e] shadow-2xl shadow-red-900/20 transition-all scale-105 text-sm"
          >
            <Printer size={20} /> Print Credentials
          </button>
        </div>
      </div>

      <div className="a4-container-wrapper flex justify-center bg-slate-100 py-8 no-print">
         <div className="a4-container bg-white shadow-2xl overflow-hidden">
          <div className="grid grid-cols-3 gap-0 border-t-2 border-l-2 border-slate-100">
            {voters.map((voter) => (
              <div 
                key={voter.id} 
                className="token-card border-r-2 border-b-2 border-slate-200 border-dashed p-6 flex flex-col items-center justify-between text-center relative overflow-hidden"
              >
                <div className="absolute -bottom-2 -right-2 opacity-[0.04] rotate-[-15deg] text-[#7b2b2a]">
                  <ShieldCheck size={64} />
                </div>

                <div className="w-full flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1.5">
                    <img src={APP_LOGO} alt="L" className="w-5 h-5 rounded-sm object-contain" />
                    <span className="text-[8px] font-black text-[#7b2b2a] tracking-[0.1em] uppercase">IPSA 2026</span>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border-2
                      ${voter.role === 'male' ? 'border-blue-100 text-blue-700 bg-blue-50' : 
                        voter.role === 'female' ? 'border-rose-100 text-rose-700 bg-rose-50' : 'border-[#c5a059]/30 text-[#7b2b2a] bg-amber-50'}`}>
                      {voter.role}
                    </div>
                </div>

                <div className="mb-4 bg-white p-2 border-2 border-slate-50 rounded-2xl shadow-sm">
                  <QRCodeCanvas 
                    value={voter.token} 
                    size={90}
                    level="H"
                    includeMargin={false}
                    fgColor="#000000"
                  />
                </div>

                <div className="w-full">
                  <h4 className="font-bold text-black text-[11px] uppercase leading-tight mb-2 tracking-tight">
                    {voter.name || 'Unknown Voter'}
                  </h4>
                  <div className="w-full bg-[#7b2b2a] text-white py-1.5 rounded-lg font-mono text-[13px] font-black tracking-[0.2em] shadow-md">
                    {voter.token}
                  </div>
                </div>
              </div>
            ))}
            
            {voters.length === 0 && (
              <div className="col-span-3 py-40 text-center text-slate-300 font-black uppercase tracking-[0.4em] italic text-sm">
                Registry is empty
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print-only View (Hidden on web) */}
      <div className="hidden print:block bg-white">
        <div className="a4-container mx-auto">
          <div className="grid grid-cols-3 gap-0 border-t-2 border-l-2 border-slate-100">
            {voters.map((voter) => (
              <div 
                key={voter.id} 
                className="token-card border-r-2 border-b-2 border-slate-200 border-dashed p-6 flex flex-col items-center justify-between text-center relative overflow-hidden"
              >
                <div className="w-full flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1.5">
                    <img src={APP_LOGO} alt="L" className="w-5 h-5 rounded-sm object-contain" />
                    <span className="text-[8px] font-black text-black tracking-[0.1em] uppercase">IPSA 2026</span>
                  </div>
                  <div className="px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border border-black">
                    {voter.role}
                  </div>
                </div>

                <div className="mb-4 bg-white p-2 border border-black rounded-lg">
                  <QRCodeCanvas 
                    value={voter.token} 
                    size={90}
                    level="H"
                    includeMargin={false}
                    fgColor="#000000"
                  />
                </div>

                <div className="w-full">
                  <h4 className="font-bold text-black text-[11px] uppercase leading-tight mb-2 tracking-tight">
                    {voter.name}
                  </h4>
                  <div className="w-full bg-black text-white py-1.5 rounded-lg font-mono text-[13px] font-bold tracking-[0.2em]">
                    {voter.token}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .a4-container {
          width: 210mm;
          min-height: 297mm;
          padding: 10mm;
          background: white;
          box-sizing: border-box;
        }

        .token-card {
          width: 63.3mm; 
          height: 47mm;
          page-break-inside: avoid;
          box-sizing: border-box;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .no-print, .a4-container-wrapper {
            display: none !important;
          }

          .a4-container {
            width: 210mm !important;
            height: 297mm !important;
            padding: 8mm !important;
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            display: block !important;
          }

          .token-card {
            border: 0.5pt dashed #000 !important;
            -webkit-print-color-adjust: exact;
          }

          .bg-black {
            background-color: #000 !important;
            color: #fff !important;
          }
          
          .text-black {
            color: #000 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default QRSheet;
