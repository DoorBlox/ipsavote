
import React from 'react';
import { Voter } from '../types';
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

      <div className="a4-container bg-white shadow-2xl mx-auto overflow-hidden">
        <div className="grid grid-cols-3 gap-0 border-t-2 border-l-2 border-slate-100">
          {voters.map((voter) => (
            <div 
              key={voter.id} 
              className="token-card border-r-2 border-b-2 border-slate-200 border-dashed p-6 flex flex-col items-center justify-between text-center relative overflow-hidden"
            >
              <div className="absolute -bottom-2 -right-2 opacity-[0.04] rotate-[-15deg] text-[#7b2b2a]">
                <ShieldCheck size={64} />
              </div>

              <div className="w-full flex justify-between items-start mb-3">
                <span className="text-[8px] font-black text-[#7b2b2a]/40 tracking-[0.3em] uppercase">IPSA 2026</span>
                <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border-2
                    ${voter.role === 'male' ? 'border-blue-100 text-blue-700 bg-blue-50' : 
                      voter.role === 'female' ? 'border-rose-100 text-rose-700 bg-rose-50' : 'border-[#c5a059]/30 text-[#7b2b2a] bg-amber-50'}`}>
                    {voter.role}
                  </div>
              </div>

              <div className="mb-4 bg-white p-2 border-2 border-slate-50 rounded-2xl shadow-sm">
                <QRCodeCanvas 
                  value={voter.token} 
                  size={100}
                  level="H"
                  includeMargin={false}
                  fgColor="#7b2b2a"
                />
              </div>

              <div className="w-full">
                <h4 className="font-black text-slate-800 text-[11px] uppercase truncate leading-tight mb-2 tracking-tight">{voter.name}</h4>
                <div className="w-full bg-[#7b2b2a] text-white py-1.5 rounded-lg font-mono text-[13px] font-black tracking-[0.25em] shadow-md">
                  {voter.token}
                </div>
              </div>
            </div>
          ))}
          
          {voters.length === 0 && (
            <div className="col-span-3 py-40 text-center text-slate-300 no-print font-black uppercase tracking-[0.4em] italic text-sm">
              Registry is empty
            </div>
          )}
        </div>
      </div>

      <style>{`
        .a4-container {
          width: 210mm;
          min-height: 297mm;
          padding: 12mm;
          background: white;
        }

        .token-card {
          width: 62mm; 
          height: 48mm;
          page-break-inside: avoid;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          
          body {
            margin: 0;
            padding: 0;
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .a4-container {
            width: 210mm;
            height: 297mm;
            padding: 8mm;
            border: none;
            box-shadow: none !important;
            margin: 0 !important;
          }

          .token-card {
            border: 1px solid #ddd !important;
            border-style: dashed !important;
            -webkit-print-color-adjust: exact;
          }

          .bg-[#7b2b2a] {
            background-color: #7b2b2a !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
          }
          
          .bg-amber-50, .bg-blue-50, .bg-rose-50 {
             background-color: #fdfbf7 !important;
             -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default QRSheet;
