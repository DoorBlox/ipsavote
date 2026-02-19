
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

  // Helper to determine if a name contains any digits (e.g., class names like "AL-KARAJI 2")
  const containsNumber = (name: string) => /\d/.test(name);

  const processedVoters = voters
    .filter(v => selectedRoles.includes(v.role))
    .sort((a, b) => {
      const roleOrder = { [UserRole.TEACHER]: 1, [UserRole.MALE]: 2, [UserRole.FEMALE]: 3 };
      
      // 1. Role Priority
      if (roleOrder[a.role] !== roleOrder[b.role]) {
        return (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99);
      }

      // 2. Class Names (containing numbers) go to the very end of the role group
      const aHasNum = containsNumber(a.name);
      const bHasNum = containsNumber(b.name);

      if (aHasNum && !bHasNum) return 1;
      if (!aHasNum && bHasNum) return -1;

      // 3. Alphabetical within their respective sub-groups (Individuals vs Classes)
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white pb-20 print:pb-0">
      {/* UI Header - Hidden on Print */}
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
              <p className="text-sm text-slate-500">{processedVoters.length} voters selected for printing</p>
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
              className="flex items-center gap-2 px-6 py-2.5 bg-[#7b2b2a] disabled:bg-slate-300 text-white rounded-xl font-bold hover:bg-[#5a1f1e] transition-all shadow-lg shadow-red-900/20"
            >
              <Printer size={18} />
              Print Selected
            </button>
          </div>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="a4-container mx-auto bg-white shadow-2xl print:shadow-none print:m-0 mt-8 print:mt-0 overflow-visible">
        <div className="p-12 print:p-[15mm] min-h-screen flex flex-col">
          
          <table className="w-full text-left border-collapse flex-grow">
            {/* Table Header: Repeats on every page */}
            <thead className="table-header-group">
              <tr>
                <td colSpan={4}>
                  {/* Added substantial top padding specifically for the printed header */}
                  <div className="flex items-center justify-between border-b-4 border-[#7b2b2a] pt-12 pb-12 mb-12">
                    <div className="flex items-center gap-6">
                      <img src={APP_LOGO} alt="IPSA" className="w-24 h-24 object-contain" />
                      <div>
                        <h1 className="text-4xl font-black text-[#7b2b2a] uppercase tracking-tighter leading-none">Voter Registry List</h1>
                        <p className="text-base font-bold text-slate-500 mt-2 uppercase tracking-[0.25em]">IPSA Council Election • 2026 Session</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Official Election Date</p>
                      <p className="text-xl font-black text-slate-800 uppercase tracking-tight border-b-2 border-slate-100 pb-1">MARCH 12, 2026</p>
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="bg-slate-50 border-y border-slate-200">
                <th className="px-4 py-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] w-16 text-center">No.</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Full Registered Name</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Designation</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-right">Access Token</th>
              </tr>
            </thead>

            {/* Table Body: Registry Data */}
            <tbody className="table-row-group">
              {processedVoters.map((voter, idx) => (
                <tr key={voter.id} className="hover:bg-slate-50 transition-colors even:bg-slate-50/30">
                  <td className="border-b border-slate-100 px-4 py-6 text-xs font-bold text-slate-400 text-center">{idx + 1}</td>
                  <td className="border-b border-slate-100 px-6 py-6 text-[14px] font-black text-slate-800 uppercase tracking-tight">{voter.name}</td>
                  <td className="border-b border-slate-100 px-6 py-6">
                    <span className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider border
                      ${voter.role === UserRole.MALE ? 'border-blue-200 text-blue-700 bg-blue-50' : 
                        voter.role === UserRole.FEMALE ? 'border-rose-200 text-rose-700 bg-rose-50' : 
                        'border-amber-200 text-amber-800 bg-amber-50'}`}>
                      {voter.role}
                    </span>
                  </td>
                  <td className="border-b border-slate-100 px-6 py-6 text-right">
                    <span className="font-mono text-[14px] font-black text-[#7b2b2a] tracking-[0.18em] bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">{voter.token}</span>
                  </td>
                </tr>
              ))}
              
              {/* Signature Row: Appears only once at the end of the body, so it sits above the footer on the last page */}
              {processedVoters.length > 0 && (
                <tr className="signature-row border-none">
                  <td colSpan={4} className="pt-24 pb-8">
                    <div className="flex justify-between items-start px-8">
                      <div className="flex flex-col items-center">
                        <div className="w-80 border-b-2 border-slate-900 mb-6 h-32"></div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-[0.25em]">Election Chair Signature</p>
                        <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-widest">Official Executive Authorization</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-80 border-b-2 border-slate-900 mb-6 h-32"></div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-[0.25em]">Head Supervisor Signature</p>
                        <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-widest">External Verification Control</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

            {/* Table Footer: Branding repeats on every page at the bottom */}
            <tfoot className="table-footer-group">
              <tr>
                <td colSpan={4} className="pt-8 pb-4">
                  <div className="flex justify-between items-end border-t border-slate-200 pt-8">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                      Generated by IPSA Executive Portal • Confidential Election Document
                      <div className="mt-2 text-slate-300">&copy; 2026 HISYAM • INTERNATIONAL PROGRAM STUDENT ASSOCIATION</div>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pb-1">
                      VALIDATION STAMP REQUIRED
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>

          {processedVoters.length === 0 && (
            <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-[0.3em]">
              No voter records found for current selection
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
          /* Absolute reset for browser-generated margins/borders */
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            height: 100%;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .no-print { display: none !important; }
          
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
          
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          tbody { display: table-row-group; }
          
          tr { 
            page-break-inside: avoid; 
          }
          
          /* Prevent signature row from splitting across pages */
          .signature-row {
            page-break-inside: avoid;
            background: white !important;
          }

          /* Ensure designations and tokens keep their background colors if requested */
          .bg-slate-50, .bg-blue-50, .bg-rose-50, .bg-amber-50 {
            background-color: inherit !important;
          }
          
          /* Force white background on everything else */
          * {
            border-color: rgba(0,0,0,0.1) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default VoterListSheet;
