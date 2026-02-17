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
      case UserRole.TEACHER: return "IPSA Faculty Registry";
      default: return voter.role;
    }
  };

  const renderCandidateCard = (candidate: Candidate, isSelected: boolean, onSelect: () => void) => (
    <div 
      key={candidate.id}
      onClick={onSelect}
      className={`
        relative cursor-pointer group rounded-[2.5rem] border-4 transition-all p-8
        ${isSelected 
          ? 'border-[#7b2b2a] bg-[#7b2b2a]/5 ring-8 ring-[#7b2b2a]/5 shadow-2xl scale-[1.02]' 
          : 'border-[#faf7f2] bg-[#faf7f2]/40 hover:border-[#c5a059]/40'}
      `}
    >
      <div className="flex flex-col items-center gap-8">
        <div className="relative shrink-0">
          <img 
            src={candidate.imageUrl} 
            alt={candidate.name} 
            className={`w-44 h-44 sm:w-56 sm:h-56 rounded-3xl object-cover shadow-2xl transition-all duration-500 ${isSelected ? 'ring-8 ring-white' : 'grayscale-[15%] group-hover:grayscale-0'}`}
          />
          {isSelected && (
            <div className="absolute -top-4 -right-4 bg-[#7b2b2a] text-white p-3 rounded-full border-4 border-white shadow-2xl scale-110 z-10 animate-in zoom-in">
              <Check size={28} strokeWidth={4} />
            </div>
          )}
        </div>
        <div className="text-center min-w-0">
          <p className="text-[10px] text-[#c5a059] font-black uppercase tracking-[0.4em] mb-3">IPSA Presidential Ticket</p>
          <h4 className="text-2xl font-black text-slate-900 leading-tight mb-2 truncate">{candidate.name}</h4>
          <div className="flex items-center justify-center gap-2 py-1">
            <span className="text-[#c5a059] font-black text-xs uppercase tracking-widest">&</span>
            <h4 className="text-2xl font-black text-slate-900 leading-tight truncate">{candidate.viceName}</h4>
          </div>
        </div>
      </div>
      <div className="mt-8 bg-white/60 p-4 rounded-2xl border border-[#c5a059]/10 space-y-2">
        <div className="flex items-center justify-between text-[9px] font-black text-slate-500 uppercase tracking-wider">
          <span>Candidate</span>
          <span className="text-slate-900">{candidate.name}</span>
        </div>
        <div className="flex items-center justify-between text-[9px] font-black text-slate-500 uppercase tracking-wider">
          <span>Vice Candidate</span>
          <span className="text-slate-900">{candidate.viceName}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto animate-in slide-in-from-right-4 duration-500">
      <div className="bg-[#7b2b2a] rounded-t-[2.5rem] p-10 text-white border-b-8 border-[#c5a059]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h2 className="text-4xl font-black mb-1 uppercase tracking-tighter">Official Ballot</h2>
            <div className="flex items-center gap-3 text-[#c5a059] text-sm font-black uppercase tracking-widest">
              <span>{getRoleDisplay()}</span>
              <span className="opacity-30">|</span>
              <span className="text-[#fdfaf6]">{voter.name}</span>
            </div>
          </div>
          <div className="bg-[#fdfaf6]/10 backdrop-blur-md px-6 py-3 rounded-full text-xs font-black tracking-[0.2em] border border-white/20 uppercase">
            Token ID: {voter.token}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-b-[2.5rem] shadow-2xl p-10 sm:p-16 space-y-20">
        {/* Male Election Section */}
        {(voter.role === UserRole.MALE || voter.role === UserRole.TEACHER) && (
          <div className="space-y-10">
            <div className="flex items-center justify-between border-b-4 border-[#faf7f2] pb-6">
              <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Male Wing Election</h3>
              <div className="bg-[#7b2b2a]/5 text-[#7b2b2a] text-[10px] px-5 py-2 rounded-full font-black uppercase tracking-widest border border-[#7b2b2a]/10">Ticket 1 of 1</div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-10">
              {maleCandidates.map((candidate) => renderCandidateCard(candidate, selectedMale === candidate.id, () => setSelectedMale(candidate.id)))}
            </div>
          </div>
        )}

        {/* Female Election Section */}
        {(voter.role === UserRole.FEMALE || voter.role === UserRole.TEACHER) && (
          <div className="space-y-10">
            <div className="flex items-center justify-between border-b-4 border-[#faf7f2] pb-6">
              <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Female Wing Election</h3>
              <div className="bg-[#c5a059]/10 text-[#7b2b2a] text-[10px] px-5 py-2 rounded-full font-black uppercase tracking-widest border border-[#c5a059]/20">Ticket 1 of 1</div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-10">
              {femaleCandidates.map((candidate) => renderCandidateCard(candidate, selectedFemale === candidate.id, () => setSelectedFemale(candidate.id)))}
            </div>
          </div>
        )}

        <div className="bg-[#faf7f2] p-8 rounded-[2rem] border-2 border-dashed border-[#c5a059]/40 flex items-start gap-6">
          <AlertTriangle className="text-[#c5a059] shrink-0 mt-1" size={28} />
          <p className="text-xs text-[#7b2b2a] font-bold leading-relaxed tracking-wider uppercase">
            Review your selections. By casting this ballot, you authorize IPSA to record your choices. 
            This action is final and will invalidate your unique authentication token immediately.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
          <button 
            disabled={!canSubmit()}
            onClick={() => onSubmit(selectedMale, selectedFemale)}
            className={`
              w-full sm:flex-1 py-6 px-12 rounded-3xl font-black text-xl uppercase tracking-[0.2em] transition-all shadow-2xl
              ${canSubmit() 
                ? 'bg-[#7b2b2a] hover:bg-[#5a1f1e] text-white shadow-[#7b2b2a]/30 active:scale-[0.98]' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}
            `}
          >
            Cast Official Ballot
          </button>
          <button 
            onClick={onCancel}
            className="w-full sm:w-auto py-6 px-12 text-[#7b2b2a]/60 hover:text-[#7b2b2a] font-black uppercase tracking-widest transition-all"
          >
            Cancel and Return
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ballot;