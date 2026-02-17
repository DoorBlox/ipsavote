import React, { useState } from 'react';
import { Voter, Candidate, UserRole } from '../types';
import { Check, AlertTriangle } from 'lucide-react';

interface BallotProps {
  voter: Voter;
  maleCandidates: Candidate[];
  femaleCandidates: Candidate[];
  onSubmit: (maleId: string | null, femaleId: string | null) => void;
  onCancel: () => void;
}

const Ballot: React.FC<BallotProps> = ({ voter, maleCandidates, femaleCandidates, onSubmit, onCancel }) => {
  const [selectedMale, setSelectedMale] = useState<string | null>(null);
  const [selectedFemale, setSelectedFemale] = useState<string | null>(null);

  const canSubmit = () => {
    if (voter.role === UserRole.MALE) return !!selectedMale;
    if (voter.role === UserRole.FEMALE) return !!selectedFemale;
    if (voter.role === UserRole.TEACHER) return !!selectedMale && !!selectedFemale;
    return false;
  };

  const getRoleDisplay = () => {
    switch (voter.role) {
      case UserRole.MALE: return "Male Student Wing";
      case UserRole.FEMALE: return "Female Student Wing";
      case UserRole.TEACHER: return "IPSA Faculty Member";
      default: return voter.role;
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-right-4 duration-500">
      <div className="bg-[#7b2b2a] rounded-t-3xl p-8 text-white border-b-8 border-[#c5a059]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black mb-1 uppercase tracking-tight">Official Ballot 2026</h2>
            <div className="flex items-center gap-3 text-[#c5a059] text-sm font-bold uppercase tracking-widest">
              <span>{getRoleDisplay()}</span>
              <span className="opacity-50">•</span>
              <span className="text-[#fdfaf6]">{voter.name}</span>
            </div>
          </div>
          <div className="bg-[#fdfaf6]/10 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black tracking-widest border border-white/20 uppercase">
            Token: {voter.token}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-b-3xl shadow-2xl p-8 space-y-12">
        {/* Male Election Section */}
        {(voter.role === UserRole.MALE || voter.role === UserRole.TEACHER) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-[#faf7f2] pb-4">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Male Presidential Ticket</h3>
              <div className="bg-[#c5a059]/10 text-[#7b2b2a] text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-[#c5a059]/20">Single Choice</div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {maleCandidates.map((candidate) => (
                <div 
                  key={candidate.id}
                  onClick={() => setSelectedMale(candidate.id)}
                  className={`
                    relative cursor-pointer group rounded-2xl border-2 transition-all p-5
                    ${selectedMale === candidate.id 
                      ? 'border-[#7b2b2a] bg-[#7b2b2a]/5 ring-8 ring-[#7b2b2a]/5 shadow-lg' 
                      : 'border-[#faf7f2] bg-[#faf7f2]/30 hover:border-[#c5a059]/30'}
                  `}
                >
                  <div className="flex items-center gap-5 mb-5">
                    <div className="relative shrink-0">
                      <img 
                        src={candidate.imageUrl} 
                        alt={candidate.name} 
                        className={`w-24 h-24 rounded-2xl object-cover shadow-lg transition-all ${selectedMale === candidate.id ? 'ring-4 ring-white' : ''}`}
                      />
                      {selectedMale === candidate.id && (
                        <div className="absolute -top-2 -right-2 bg-[#7b2b2a] text-white p-1 rounded-full border-2 border-white shadow-xl">
                          <Check size={18} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-[#c5a059] font-black uppercase tracking-widest mb-1">Elite Candidates</p>
                      <h4 className="text-lg font-black text-slate-900 leading-none truncate">{candidate.name}</h4>
                      <div className="flex items-center gap-1.5 py-1">
                        <span className="text-[#c5a059] font-black text-[10px] uppercase">&</span>
                        <h4 className="text-lg font-black text-slate-900 leading-none truncate">{candidate.viceName}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Female Election Section */}
        {(voter.role === UserRole.FEMALE || voter.role === UserRole.TEACHER) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-[#faf7f2] pb-4">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Female Presidential Ticket</h3>
              <div className="bg-[#c5a059]/10 text-[#7b2b2a] text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-[#c5a059]/20">Single Choice</div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {femaleCandidates.map((candidate) => (
                <div 
                  key={candidate.id}
                  onClick={() => setSelectedFemale(candidate.id)}
                  className={`
                    relative cursor-pointer group rounded-2xl border-2 transition-all p-5
                    ${selectedFemale === candidate.id 
                      ? 'border-[#7b2b2a] bg-[#7b2b2a]/5 ring-8 ring-[#7b2b2a]/5 shadow-lg' 
                      : 'border-[#faf7f2] bg-[#faf7f2]/30 hover:border-[#c5a059]/30'}
                  `}
                >
                  <div className="flex items-center gap-5 mb-5">
                    <div className="relative shrink-0">
                      <img 
                        src={candidate.imageUrl} 
                        alt={candidate.name} 
                        className={`w-24 h-24 rounded-2xl object-cover shadow-lg transition-all ${selectedFemale === candidate.id ? 'ring-4 ring-white' : ''}`}
                      />
                      {selectedFemale === candidate.id && (
                        <div className="absolute -top-2 -right-2 bg-[#7b2b2a] text-white p-1 rounded-full border-2 border-white shadow-xl">
                          <Check size={18} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-[#c5a059] font-black uppercase tracking-widest mb-1">Elite Candidates</p>
                      <h4 className="text-lg font-black text-slate-900 leading-none truncate">{candidate.name}</h4>
                      <div className="flex items-center gap-1.5 py-1">
                        <span className="text-[#c5a059] font-black text-[10px] uppercase">&</span>
                        <h4 className="text-lg font-black text-slate-900 leading-none truncate">{candidate.viceName}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#faf7f2] p-4 rounded-2xl border border-[#c5a059]/20 flex items-start gap-3">
          <AlertTriangle className="text-[#c5a059] shrink-0 mt-0.5" />
          <p className="text-xs text-[#7b2b2a] font-medium leading-relaxed">
            <strong className="uppercase tracking-wider">Finality Notice:</strong> Review your selection carefully. After clicking "Cast Official Ballot", the transaction is permanent and your token is consumed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <button 
            disabled={!canSubmit()}
            onClick={() => onSubmit(selectedMale, selectedFemale)}
            className={`
              w-full sm:flex-1 py-4 px-8 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-xl
              ${canSubmit() 
                ? 'bg-[#7b2b2a] hover:bg-[#5a1f1e] text-white shadow-[#7b2b2a]/20 active:scale-[0.98]' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}
            `}
          >
            Cast Official Ballot
          </button>
          <button 
            onClick={onCancel}
            className="w-full sm:w-auto py-4 px-10 text-[#7b2b2a]/60 hover:text-[#7b2b2a] font-black uppercase tracking-widest transition-all"
          >
            Exit Ballot
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ballot;