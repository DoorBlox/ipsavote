
import React from 'react';
import { Voter } from '../types';
import { APP_LOGO } from '../constants';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, Printer, FileText } from 'lucide-react';

interface QRSheetProps {
  voters: Voter[];
  onBack: () => void;
}

const QRSheet: React.FC<QRSheetProps> = ({ voters, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

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
              <h2 className="text-xl font-bold text-slate-900">Ballot Credentials</h2>
              <p className="text-sm text-slate-500">{voters.length} individual tokens ready</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#7b2b2a] text-white rounded-xl font-bold hover:bg-[#5a1f1e] transition-all shadow-lg shadow-red-900/20"
            >
              <Printer size={18} />
              Print / Save as PDF
            </button>
          </div>
        </div>
      </div>

      {/* Print Instructions - Hidden on Print */}
      <div className="no-print max-w-[210mm] mx-auto mt-6 mb-6">
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 items-start">
          <div className="bg-amber-200 p-1.5 rounded-lg text-amber-700">
            <FileText size={20} />
          </div>
          <div className="text-sm text-amber-800">
            <p className="font-bold mb-1 uppercase tracking-tight text-[10px]">Optimal PDF Settings:</p>
            <ul className="list-disc list-inside space-y-0.5 opacity-80 text-[10px]">
              <li>Set <strong>Margins</strong> to "None".</li>
              <li>Enable <strong>Background Graphics</strong>.</li>
              <li>Paper Size: <strong>A4</strong>.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Unified A4 Container */}
      <div className="a4-page-container mx-auto bg-white shadow-2xl print:shadow-none print:m-0">
        <div className="token-grid">
          {voters.map((voter) => (
            <div key={voter.id} className="ballot-card">
              {/* Header: Logo & Role */}
              <div className="card-header">
                <div className="logo-section">
                  <img src={APP_LOGO} alt="IPSA" className="mini-logo" />
                  <span className="org-name">IPSA 2026</span>
                </div>
                <div className={`role-badge ${voter.role}`}>
                  {voter.role}
                </div>
              </div>

              {/* Center: QR Code */}
              <div className="qr-section">
                <div className="qr-wrapper">
                  <QRCodeCanvas 
                    value={voter.token} 
                    size={130} 
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>

              {/* Footer: Name & Token - Height increased to prevent cutoff */}
              <div className="card-footer">
                <div className="voter-name-container">
                  <h4 className="voter-name">{voter.name || 'UNREGISTERED'}</h4>
                </div>
                <div className="token-display">
                  <span className="token-label">TOKEN ID</span>
                  <span className="token-value">{voter.token}</span>
                </div>
              </div>
              
              <div className="security-mark">OFFICIAL BALLOT • 2026</div>
            </div>
          ))}
          
          {voters.length === 0 && (
            <div className="col-span-3 py-40 text-center text-slate-300 font-bold uppercase tracking-[0.3em]">
              No voter records found
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* PDF/Print Calibration */
        :root {
          --ipsa-red: #7b2b2a;
          --ipsa-gold: #c5a059;
        }

        @page {
          size: A4 portrait;
          margin: 0;
        }

        .a4-page-container {
          width: 210mm;
          min-height: 297mm;
          padding: 10mm;
          box-sizing: border-box;
          background: white;
        }

        .token-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          border-top: 0.5pt dashed #cbd5e1;
          border-left: 0.5pt dashed #cbd5e1;
        }

        .ballot-card {
          width: 63.3mm;
          height: 68mm; /* INCREASED HEIGHT: fits 4 rows per page perfectly */
          padding: 4.5mm;
          box-sizing: border-box;
          border-right: 0.5pt dashed #cbd5e1;
          border-bottom: 0.5pt dashed #cbd5e1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          page-break-inside: avoid;
          background: white;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 8mm;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 1.5mm;
        }

        .mini-logo {
          width: 6mm;
          height: 6mm;
          object-fit: contain;
        }

        .org-name {
          font-size: 8pt;
          font-weight: 900;
          color: var(--ipsa-red);
          letter-spacing: 0.2pt;
        }

        .role-badge {
          font-size: 6pt;
          font-weight: 900;
          text-transform: uppercase;
          padding: 0.8mm 1.8mm;
          border-radius: 0.8mm;
          line-height: 1;
        }

        .role-badge.male { background: #eff6ff; color: #1e40af; }
        .role-badge.female { background: #fff1f2; color: #9f1239; }
        .role-badge.teacher { background: #fef3c7; color: #92400e; }

        .qr-section {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-grow: 1;
        }

        .qr-wrapper {
          padding: 1.5mm;
          background: white;
          border: 0.5pt solid #f1f5f9;
          border-radius: 1mm;
          line-height: 0;
        }

        .card-footer {
          margin-top: 2mm;
          display: flex;
          flex-direction: column;
          gap: 1.5mm;
        }

        .voter-name-container {
          border-bottom: 0.5pt solid #f1f5f9;
          padding-bottom: 0.8mm;
        }

        .voter-name {
          font-size: 9pt;
          font-weight: 900;
          color: black;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.1;
          text-transform: uppercase;
          text-align: center;
        }

        .token-display {
          background: #f8fafc;
          padding: 1.2mm 2.5mm;
          border-radius: 1mm;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 0.5pt solid #e2e8f0;
        }

        .token-label {
          font-size: 5.5pt;
          font-weight: 900;
          color: #94a3b8;
          letter-spacing: 0.5pt;
        }

        .token-value {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 10pt;
          font-weight: 900;
          color: var(--ipsa-red);
          letter-spacing: 0.8pt;
        }

        .security-mark {
          position: absolute;
          bottom: 0.8mm;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 4pt;
          font-weight: 700;
          color: #cbd5e1;
          text-transform: uppercase;
          letter-spacing: 1pt;
          pointer-events: none;
          opacity: 0.5;
        }

        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .no-print {
            display: none !important;
          }

          .a4-page-container {
            width: 210mm !important;
            padding: 10mm !important;
            box-shadow: none !important;
            margin: 0 !important;
          }

          .ballot-card {
            border-color: #cbd5e1 !important;
            -webkit-print-color-adjust: exact;
          }
          
          .token-display {
            background-color: #f8fafc !important;
            -webkit-print-color-adjust: exact;
          }

          .role-badge {
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default QRSheet;
