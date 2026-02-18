
import React from 'react';
import { Voter } from '../types';
import { APP_LOGO } from '../constants';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, ShieldCheck, Printer, Info } from 'lucide-react';

interface QRSheetProps {
  voters: Voter[];
  onBack: () => void;
}

const QRSheet: React.FC<QRSheetProps> = ({ voters, onBack }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between no-print bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl gap-6">
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
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">A4 Layout Optimized for Printing</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-amber-50 px-4 py-3 rounded-2xl border border-amber-100">
           <Info className="text-amber-500" size={20} />
           <p className="text-[10px] font-bold text-amber-800 uppercase leading-tight">
             Printing Tip: Use 'No Margins' and<br/>enable 'Background Graphics'.
           </p>
        </div>

        <button 
          onClick={() => window.print()}
          className="flex items-center gap-3 px-10 py-4 bg-[#7b2b2a] text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-[#5a1f1e] shadow-2xl shadow-red-900/20 transition-all scale-105 text-sm"
        >
          <Printer size={20} /> Print Credentials
        </button>
      </div>

      <div className="a4-container-wrapper flex justify-center bg-slate-100 py-8 no-print min-h-screen">
         <div className="a4-container bg-white shadow-2xl overflow-hidden">
          <div className="grid grid-cols-3 gap-0 border-t border-l border-slate-200">
            {voters.map((voter) => (
              <div 
                key={voter.id} 
                className="token-card border-r border-b border-slate-200 border-dashed p-6 flex flex-col items-center justify-between text-center relative overflow-hidden"
              >
                <div className="absolute -bottom-2 -right-2 opacity-[0.04] rotate-[-15deg] text-[#7b2b2a]">
                  <ShieldCheck size={64} />
                </div>

                <div className="w-full flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1.5">
                    <img src={APP_LOGO} alt="Logo" className="w-6 h-6 rounded-sm object-contain" />
                    <span className="text-[9px] font-black text-[#7b2b2a] tracking-[0.1em] uppercase">IPSA 2026</span>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border
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

                <div className="w-full space-y-2 z-10">
                  <h4 className="font-black text-slate-900 text-[11px] uppercase leading-tight tracking-tight px-1 break-words">
                    {voter.name}
                  </h4>
                  <div className="w-full bg-[#7b2b2a] text-white py-1.5 rounded-lg font-mono text-[13px] font-black tracking-[0.2em] shadow-md uppercase">
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

      {/* Actual Print Media Layout - High Visibility */}
      <div className="hidden print:block bg-white w-full">
        <div className="a4-print-layout mx-auto">
          <div className="grid grid-cols-3 gap-0 border-t border-l border-black">
            {voters.map((voter) => (
              <div 
                key={voter.id} 
                className="token-card-print border-r border-b border-black border-dashed p-6 flex flex-col items-center justify-between text-center relative"
              >
                <div className="w-full flex justify-between items-center mb-4">
                  <div className="flex items-center gap-1.5">
                    <img src={APP_LOGO} alt="L" className="w-6 h-6 rounded-sm object-contain" />
                    <span className="text-[10px] font-bold text-black tracking-[0.1em] uppercase">IPSA 2026</span>
                  </div>
                  <div className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border border-black text-black">
                    {voter.role}
                  </div>
                </div>

                <div className="mb-4 bg-white p-1 border border-black rounded">
                  <QRCodeCanvas 
                    value={voter.token} 
                    size={100}
                    level="H"
                    includeMargin={false}
                    fgColor="#000000"
                  />
                </div>

                <div className="w-full space-y-2">
                  <h4 className="font-bold text-black text-[12px] uppercase leading-tight tracking-tight px-1">
                    {voter.name}
                  </h4>
                  <div className="w-full bg-black text-white py-2 rounded-md font-mono text-[14px] font-bold tracking-[0.3em] uppercase">
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
          height: 52mm;
          page-break-inside: avoid;
          box-sizing: border-box;
        }

        .a4-print-layout {
          width: 210mm;
          padding: 8mm;
          background: white;
          box-sizing: border-box;
        }

        .token-card-print {
          width: 64.6mm; 
          height: 55mm;
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
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .no-print, .a4-container-wrapper {
            display: none !important;
          }

          .hidden.print\\:block {
            display: block !important;
          }

          .a4-print-layout {
            display: block !important;
            border: none !important;
            box-shadow: none !important;
          }

          .token-card-print {
            border-right: 1px dashed black !important;
            border-bottom: 1px dashed black !important;
          }

          .bg-black {
            background-color: black !important;
            color: white !important;
          }
          
          .text-white {
            color: white !important;
          }

          .text-black {
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
};

export default QRSheet;
