
import React from 'react';
import { Voter } from '../types';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, Printer, ShieldCheck, Download } from 'lucide-react';

interface QRSheetProps {
  voters: Voter[];
  onBack: () => void;
}

const QRSheet: React.FC<QRSheetProps> = ({ voters, onBack }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Controls - Hidden during print */}
      <div className="flex items-center justify-between no-print bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex gap-4 items-center">
           <button 
            onClick={onBack}
            className="p-3 bg-slate-50 border border-slate-200 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Voter Token Management</h2>
            <p className="text-slate-500 text-sm">Download as PDF using the system print dialog (Save as PDF).</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all scale-105"
          >
            <Download size={18} /> Download PDF / Print
          </button>
        </div>
      </div>

      {/* A4 Content Container */}
      <div className="a4-container bg-white shadow-2xl mx-auto overflow-hidden">
        <div className="grid grid-cols-3 gap-0 border-t border-l border-slate-200">
          {voters.map((voter) => (
            <div 
              key={voter.id} 
              className="token-card border-r border-b border-slate-300 border-dashed p-4 flex flex-col items-center justify-between text-center relative overflow-hidden"
            >
              {/* Card Watermark */}
              <div className="absolute -bottom-1 -right-1 opacity-[0.03] rotate-[-15deg]">
                <ShieldCheck size={48} />
              </div>

              <div className="w-full flex justify-between items-start mb-2">
                <span className="text-[7px] font-black text-slate-400 tracking-widest uppercase">IPSA VOTE 2025</span>
                <div className={`px-1 rounded-[2px] text-[6px] font-black uppercase tracking-tighter border
                    ${voter.role === 'male' ? 'border-blue-200 text-blue-600 bg-blue-50' : 
                      voter.role === 'female' ? 'border-rose-200 text-rose-600 bg-rose-50' : 'border-indigo-200 text-indigo-600 bg-indigo-50'}`}>
                    {voter.role}
                  </div>
              </div>

              <div className="mb-2 bg-white p-1 border border-slate-100 rounded">
                <QRCodeCanvas 
                  value={voter.token} 
                  size={80}
                  level="M"
                  includeMargin={false}
                />
              </div>

              <div className="w-full">
                <h4 className="font-bold text-slate-900 text-[10px] truncate leading-tight mb-1">{voter.name}</h4>
                <div className="w-full bg-slate-900 text-white py-1 rounded-[4px] font-mono text-[11px] font-black tracking-[0.2em]">
                  {voter.token}
                </div>
              </div>
            </div>
          ))}
          
          {voters.length === 0 && (
            <div className="col-span-3 py-40 text-center text-slate-400 no-print font-medium italic">
              Voter registry is empty. Upload a CSV to generate tokens.
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* Screen preview styling */
        .a4-container {
          width: 210mm;
          min-height: 297mm;
          padding: 10mm;
          border: 1px solid #edf2f7;
        }

        .token-card {
          width: 63.3mm; /* Precisely 1/3 of usable A4 width minus padding */
          height: 40mm;
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
            border: 1px solid #ddd !important;
            border-style: dashed !important;
            -webkit-print-color-adjust: exact;
          }

          .bg-slate-900 {
            background-color: #0f172a !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
          }
          
          .bg-blue-50, .bg-rose-50, .bg-indigo-50 {
             -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default QRSheet;
