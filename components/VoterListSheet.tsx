
import React, { useState } from 'react';
import { Voter, UserRole } from '../types';
import { APP_LOGO } from '../constants';
import { ArrowLeft, Printer, CheckSquare, Square } from 'lucide-react';

interface VoterListSheetProps {
  voters: Voter[];
  onBack: () => void;
}

const VoterListSheet: React.FC<VoterListSheetProps> = ({ voters, onBack }) => {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([UserRole.TEACHER, UserRole.MALE, UserRole.FEMALE]);

  const toggleRole = (role: UserRole) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const containsNumber = (name: string) => /\d/.test(name);

  const processedVoters = voters
    .filter(v => selectedRoles.includes(v.role))
    .sort((a, b) => {
      const roleOrder = { [UserRole.TEACHER]: 1, [UserRole.MALE]: 2, [UserRole.FEMALE]: 3 };
      if (roleOrder[a.role] !== roleOrder[b.role]) {
        return (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99);
      }
      const aHasNum = containsNumber(a.name);
      const bHasNum = containsNumber(b.name);
      if (aHasNum && !bHasNum) return 1;
      if (!aHasNum && bHasNum) return -1;
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white pb-20 print:pb-0">
      {/* UI Controls - Hidden on Print */}
      <div className="no-print bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Printable Registry</h2>
              <p className="text-sm text-slate-500">{processedVoters.length} voters selected</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Include:</span>
              {[UserRole.TEACHER, UserRole.MALE, UserRole.FEMALE].map(role => (
                <button 
                  key={role}
                  onClick={() => toggleRole(role)}
                  className="flex items-center gap-1.5 group"
                >
                  {selectedRoles.includes(role) ? (
                    <CheckSquare size={16} className="text-[#7b2b2a]" />
                  ) : (
                    <Square size={16} className="text-slate-300 group-hover:text-slate-400" />
                  )}
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${selectedRoles.includes(role) ? 'text-slate-900' : 'text-slate-400'}`}>
                    {role}s
                  </span>
                </button>
              ))}
            </div>
            
            <button 
              onClick={handlePrint}
              disabled={selectedRoles.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#7b2b2a] disabled:bg-slate-300 text-white rounded-xl font-bold hover:bg-[#5a1f1e] transition-all shadow-lg"
            >
              <Printer size={18} />
              Print List
            </button>
          </div>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="a4-container mx-auto bg-white shadow-2xl print:shadow-none print:m-0 mt-8 print:mt-0">
        <div className="p-8 print:p-[8mm] min-h-screen flex flex-col">
          
          <table className="w-full text-left border-collapse flex-grow">
            {/* Thead repeats on every page by default in most browsers */}
            <thead className="table-header-group">
              <tr>
                <td colSpan={4} className="border-none">
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pt-6 pb-6 mb-8">
                    <div className="flex items-center gap-4">
                      <img src={APP_LOGO} alt="Logo" className="w-16 h-16 object-contain" />
                      <div>
                        <h1 className="text-2xl font-black text-[#7b2b2a] uppercase tracking-tight leading-none">Voter Registry List</h1>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-[0.1em]">IPSA Council Election • 2026 Session</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Election Date</p>
                      <p className="text-sm font-black text-slate-800 uppercase">MARCH 12, 2026</p>
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="bg-slate-50 print:bg-white border-y border-slate-200">
                <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest w-12 text-center">No.</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Registered Name</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Role</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Token ID</th>
              </tr>
            </thead>

            <tbody className="table-row-group">
              {processedVoters.map((voter, idx) => (
                <tr key={voter.id} className="border-b border-slate-100">
                  <td className="px-3 py-3 text-[10px] font-bold text-slate-400 text-center">{idx + 1}</td>
                  <td className="px-4 py-3 text-[11px] font-black text-slate-800 uppercase tracking-tight">{voter.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border
                      ${voter.role === UserRole.MALE ? 'border-blue-100 text-blue-600' : 
                        voter.role === UserRole.FEMALE ? 'border-rose-100 text-rose-600' : 
                        'border-amber-100 text-amber-700'}`}>
                      {voter.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-[10px] font-black text-[#7b2b2a] tracking-widest">{voter.token}</span>
                  </td>
                </tr>
              ))}
              
              {/* Signature Row: Positions itself naturally after the list, above the page footer */}
              {processedVoters.length > 0 && (
                <tr className="signature-row">
                  <td colSpan={4} className="pt-20 pb-12">
                    <div className="flex justify-around items-start">
                      <div className="flex flex-col items-center">
                        <div className="w-56 border-b border-slate-900 mb-3 h-20"></div>
                        <p className="text-[9px] font-black text-slate-900 uppercase">Election Chair</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-56 border-b border-slate-900 mb-3 h-20"></div>
                        <p className="text-[9px] font-black text-slate-900 uppercase">Head Supervisor</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

            {/* Tfoot repeats on every page at the bottom */}
            <tfoot className="table-footer-group">
              <tr>
                <td colSpan={4} className="pt-6 pb-2">
                  <div className="flex justify-between items-center border-t border-slate-200 pt-4 opacity-50">
                    <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                      Generated by IPSA Executive Portal • 2026 Session
                    </div>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Confidential Election Document
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>

          {processedVoters.length === 0 && (
            <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
              No voter records found
            </div>
          )}
        </div>
      </div>

      <style>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }
        
        .a4-container {
          width: 210mm;
          min-height: 297mm;
          box-sizing: border-box;
          background: white;
          display: flex;
          flex-direction: column;
        }
        
        @media print {
          /* Force browser to remove its own backgrounds/shadows */
          html, body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Hide non-print UI completely */
          .no-print { display: none !important; }
          
          /* Make container fill the sheet perfectly without shadows or gaps */
          .a4-container { 
            width: 100% !important; 
            min-height: 100% !important;
            box-shadow: none !important; 
            margin: 0 !important;
            background: white !important;
            padding: 0 !important;
          }
          
          table { 
            width: 100% !important; 
            border-collapse: collapse; 
            table-layout: fixed;
          }
          
          /* Key for multi-page headers/footers */
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          tbody { display: table-row-group; }
          
          tr { 
            page-break-inside: avoid; 
          }
          
          /* Ensure signature row doesn't break poorly */
          .signature-row {
            page-break-inside: avoid;
          }

          /* Force colors to print */
          .bg-slate-50, .bg-blue-50, .bg-rose-50, .bg-amber-50 {
            background-color: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default VoterListSheet;
