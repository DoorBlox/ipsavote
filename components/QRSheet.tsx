import React from 'react';
import { Voter } from '../types';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, ShieldCheck, Download } from 'lucide-react';

interface QRSheetProps {
  voters: Voter[];
  onBack: () => void;
}

const QRSheet: React.FC<QRSheetProps> = ({ voters, onBack }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Controls - Hidden during print */}
      <div className="flex items-center justify-between no-print bg-white p-6 rounded-3xl border border-[#c5a059]/20 shadow-xl">
        <div className="flex gap-4 items-center">
           <button 
            onClick={onBack}
            className="p-3 bg-[#faf7f2] border border-[#c5a059]/20 rounded-full text-[#7b2b2a] hover:bg-[#c5a059]/10 transition-colors"
            title="Return to Command"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-[#7b2b2a] uppercase tracking-tight">Voter Token Foundry</h2>
            <p className="text-slate-500 text-xs font-medium">Export batch as high-resolution PDF for distribution.</p>
          </div>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-8 py-3 bg-[#7b2b2a] text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#5a1f1e] shadow-2xl shadow-[#7b2b2a]/30 transition-all scale-105"
        >
          <Download size={16} /> Generate Print PDF
        </button>
      </div>

      {/* A4 Content Container */}
      <div className="a4-container bg-white shadow-2xl mx-auto overflow-hidden">
        <div className="grid grid-cols-3 gap-0 border-t border-l border-slate-100">
          {voters.map((voter) => (
            <div 
              key={voter.id} 
              className="token-card border-r border-b border-[#c5a059]/20 border-dashed p-4 flex flex-col items-center justify-between text-center relative overflow-hidden"
            >
              {/* Card Watermark */}
              <div className="absolute -bottom-2 -right-2 opacity-[0.05] rotate-[-15deg] text-[#7b2b2a]">
                <ShieldCheck size={64} />
              </div>

              <div className="w-full flex justify-between items-start mb-2">
                <span className="text-[6px] font-black text-[#7b2b2a]/40 tracking-[0.2em] uppercase italic">IPSA ELECTION 2026</span>
                <div className={`px-1.5 py-0.5 rounded-[3px] text-[5px] font-black uppercase tracking-widest border
                    ${voter.role === 'male' ? 'border-[#7b2b2a]/20 text-[#7b2b2a] bg-[#7b2b2a]/5' : 
                      voter.role === 'female' ? 'border-[#c5a059]/20 text-[#c5a059] bg-[#c5a059]/5' : 'border-slate-300 text-slate-500 bg-slate-50'}`}>
                    {voter.role}
                  </div>
              </div>

              <div className="mb-2 bg-white p-1 border border-slate-50 rounded-lg shadow-sm">
                <QRCodeCanvas 
                  value={voter.token} 
                  size={75}
                  level="H"
                  fgColor="#7b2b2a"
                  includeMargin={false}
                />
              </div>

              <div className="w-full">
                <h4 className="font-black text-slate-900 text-[9px] uppercase tracking-tight truncate leading-tight mb-1">{voter.name}</h4>
                <div className="w-full bg-[#7b2b2a] text-[#fdfaf6] py-1 rounded-[6px] font-mono text-[10px] font-black tracking-[0.25em]">
                  {voter.token}
                </div>
              </div>
            </div>
          ))}
          
          {voters.length === 0 && (
            <div className="col-span-3 py-40 text-center text-slate-400 no-print font-black uppercase tracking-widest opacity-20 italic">
              Foundry empty. Feed registry to generate.
            </div>
          )}
        </div>
      </div>

      <style>{`
        .a4-container {
          width: 210mm;
          min-height: 297mm;
          padding: 10mm;
          border: 1px solid #c5a05933;
        }

        .token-card {
          width: 63.3mm;
          height: 45mm;
          page-break-inside: avoid;
          background: white;
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
            padding: 5mm;
            border: none;
            box-shadow: none !important;
            margin: 0 !important;
          }

          .token-card {
            border: 1px solid #7b2b2a1a !important;
            border-style: dashed !important;
            -webkit-print-color-adjust: exact;
          }

          .bg-[#7b2b2a] {
            background-color: #7b2b2a !important;
            color: #fdfaf6 !important;
            -webkit-print-color-adjust: exact;
          }
          
          .text-[#7b2b2a] {
            color: #7b2b2a !important;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default QRSheet;