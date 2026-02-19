
import React from 'react';
import { Voter, UserRole } from '../types';
import { APP_LOGO } from '../constants';
import { ArrowLeft, Printer } from 'lucide-react';

interface VoterListSheetProps {
  voters: Voter[];
  onBack: () => void;
}

const VoterListSheet: React.FC<VoterListSheetProps> = ({ voters, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  // Sort: Teacher -> Male -> Female
  const sortedVoters = [...voters].sort((a, b) => {
    const order = { [UserRole.TEACHER]: 1, [UserRole.MALE]: 2, [UserRole.FEMALE]: 3 };
    return (order[a.role] || 99) - (order[b.role] || 99);
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* UI Header - Hidden on Print */}
      <div className="no-print bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Voter Registry</h2>
              <p className="text-sm text-slate-500">{voters.length} registered voters sorted by designation</p>
            </div>
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#7b2b2a] text-white rounded-xl font-bold hover:bg-[#5a1f1e] transition-all shadow-lg shadow-red-900/20"
          >
            <Printer size={18} />
            Print Registry
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="a4-container mx-auto bg-white shadow-2xl print:shadow-none print:m-0 mt-8">
        <div className="p-12">
          {/* Sheet Header */}
          <div className="flex items-center justify-between border-b-4 border-[#7b2b2a] pb-6 mb-10">
            <div className="flex items-center gap-4">
              <img src={APP_LOGO} alt="IPSA" className="w-16 h-16 object-contain" />
              <div>
                <h1 className="text-2xl font-black text-[#7b2b2a] uppercase tracking-tighter leading-none">Voter Registry List</h1>
                <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">IPSA Council Election • 2026</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Election Date</p>
              <p className="text-sm font-black text-slate-800 uppercase tracking-tight">March 12, 2026</p>
            </div>
          </div>

          {/* Registry Table */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="border-b border-slate-200 px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-12 text-center">No.</th>
                <th className="border-b border-slate-200 px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Name</th>
                <th className="border-b border-slate-200 px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Designation</th>
                <th className="border-b border-slate-200 px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Access Token</th>
              </tr>
            </thead>
            <tbody>
              {sortedVoters.map((voter, idx) => (
                <tr key={voter.id} className="hover:bg-slate-50 transition-colors even:bg-slate-50/30">
                  <td className="border-b border-slate-100 px-4 py-4 text-xs font-bold text-slate-400 text-center">{idx + 1}</td>
                  <td className="border-b border-slate-100 px-4 py-4 text-sm font-black text-slate-800 uppercase">{voter.name}</td>
                  <td className="border-b border-slate-100 px-4 py-4">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border
                      ${voter.role === UserRole.MALE ? 'border-blue-200 text-blue-600 bg-blue-50' : 
                        voter.role === UserRole.FEMALE ? 'border-rose-200 text-rose-600 bg-rose-50' : 
                        'border-amber-200 text-amber-700 bg-amber-50'}`}>
                      {voter.role}
                    </span>
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4 text-right">
                    <span className="font-mono text-sm font-black text-[#7b2b2a] tracking-widest bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{voter.token}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sortedVoters.length === 0 && (
            <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-[0.3em]">
              No voter records found
            </div>
          )}

          {/* Footer for print */}
          <div className="mt-20 flex justify-between items-end border-t border-slate-100 pt-8">
            <div className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">
              Generated by IPSA Executive Portal • Internal Use Only
            </div>
            <div className="flex gap-12">
              <div className="w-32 text-center border-t border-slate-300 pt-2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Election Chair</p>
              </div>
              <div className="w-32 text-center border-t border-slate-300 pt-2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Head Supervisor</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @page {
          size: A4 portrait;
          margin: 15mm;
        }
        .a4-container {
          width: 210mm;
          min-height: 297mm;
          box-sizing: border-box;
          background: white;
        }
        @media print {
          body { background: white; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .a4-container { width: auto; height: auto; shadow: none; margin: 0; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
        }
      `}</style>
    </div>
  );
};

export default VoterListSheet;
