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

  const renderCandidateCard = (candidate: Candidate, isSelected: boolean, onSelect: () => void) => (
    <div 
      key={candidate.id}
      onClick={onSelect}
      className={`
        relative cursor-pointer group rounded-[3rem] border-4 transition-all p-10
        ${isSelected 
          ? 'border-[#7b2b2a] bg-[#7b2b2a]/5 ring-12 ring-[#7b2b2a]/5 shadow-2xl scale-[1.02]' 
          : 'border-[#faf7f2] bg-[#faf7f2]/30 hover:border-[#c5a059]/40'}
      `}
    >
      <div className="flex flex-col items-center gap-10">
        <div className="relative shrink-0">
          <img 
            src={candidate.imageUrl} 
            alt={candidate.name} 
            className={`w-72 h-72 sm:w-80 sm:h-80 xl:w-96 xl:h-96 rounded-[2.5rem] object-cover shadow-2xl transition-all duration-700 ${isSelected ? 'ring-8 ring-white' : 'grayscale-[10%] group-hover:grayscale-0'}`}
          />
          {isSelected && (
            <div className="absolute -top-6 -right-6 bg-[#7b2b2a] text-white p-4 rounded-full border-8 border-white shadow-2xl scale-110 z-10 animate-in zoom-in duration-300">
              <Check size={48} strokeWidth={4} />
            </div>
          )}
        </div>
        <div className="text-center min-w-0">
          <p className="text-sm text-[#c5a059] font-black uppercase tracking-[0.4em] mb-4">Official Election Ticket</p>
          <h4 className="text-4xl font-black text-slate-900 leading-tight mb-2">{candidate.name}</h4>
          <div className="flex items-center justify-center gap-4 py-2">
            <span className="text-[#c5a059] font-black text-2xl uppercase tracking-widest">&</span>
            <h4 className="text-4xl font-black text-slate-900 leading-tight">{candidate.viceName}</h4>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto animate-in slide-in-from-right-4 duration-500">
      <div className="bg-[#7b2b2a] rounded-t-[3rem] p-10 text-white border-b-[10px] border-[#c5a059]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h2 className="text-4xl font-black mb-1 uppercase tracking-tight">Official Ballot 2026</h2>
            <div className="flex items-center gap-4 text-[#c5a059] text-lg font-bold uppercase tracking-widest">
              <span>{getRoleDisplay()}</span>
              <span className="opacity-30">|</span>
              <span className="text-[#fdfaf6]">{voter.name}</span>
            </div>
          </div>
          <div className="bg-[#fdfaf6]/10 backdrop-blur-md px-6 py-3 rounded-full text-xs font-black tracking-widest border border-white/20 uppercase">
            ID Token: {voter.token}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-b-[3rem] shadow-2xl p-10 sm:p-16 space-y-24">
        {/* Male Election Section */}
        {(voter.role === UserRole.MALE || voter.role === UserRole.TEACHER) && (
          <div className="space-y-12">
            <div className="flex items-center justify-between border-b-4 border-[#faf7f2] pb-6">
              <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Male Presidential Ticket</h3>
              <div className="bg-[#7b2b2a]/5 text-[#7b2b2a] text-sm px-6 py-2 rounded-full font-black uppercase tracking-widest border border-[#7b2b2a]/10">Candidate List</div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-16">
              {maleCandidates.map((candidate) => renderCandidateCard(candidate, selectedMale === candidate.id, () => setSelectedMale(candidate.id)))}
            </div>
          </div>
        )}

        {/* Female Election Section */}
        {(voter.role === UserRole.FEMALE || voter.role === UserRole.TEACHER) && (
          <div className="space-y-12">
            <div className="flex items-center justify-between border-b-4 border-[#faf7f2] pb-6">
              <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Female Presidential Ticket</h3>
              <div className="bg-[#c5a059]/10 text-[#7b2b2a] text-sm px-6 py-2 rounded-full font-black uppercase tracking-widest border border-[#c5a059]/20">Candidate List</div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-16">
              {femaleCandidates.map((candidate) => renderCandidateCard(candidate, selectedFemale === candidate.id, () => setSelectedFemale(candidate.id)))}
            </div>
          </div>
        )}

        <div className="bg-[#faf7f2] p-10 rounded-[3rem] border-4 border-dashed border-[#c5a059]/40 flex items-start gap-8">
          <AlertTriangle className="text-[#c5a059] shrink-0 mt-1" size={48} />
          <div className="space-y-2">
            <h5 className="text-xl font-black text-[#7b2b2a] uppercase tracking-widest">Election Integrity Warning</h5>
            <p className="text-base text-[#7b2b2a]/80 font-bold leading-relaxed">
              Verify your chosen candidates match the tickets above. By clicking "Cast Official Ballot", you are submitting your one-time digital signature to the IPSA secure database. This action is final, irreversible, and permanent.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-8 pt-6">
          <button 
            disabled={!canSubmit()}
            onClick={() => onSubmit(selectedMale, selectedFemale)}
            className={`
              w-full sm:flex-1 py-8 px-16 rounded-[2rem] font-black text-3xl uppercase tracking-[0.2em] transition-all shadow-2xl
              ${canSubmit() 
                ? 'bg-[#7b2b2a] hover:bg-[#5a1f1e] text-white shadow-[#7b2b2a]/40 active:scale-[0.98]' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}
            `}
          >
            Cast Official Ballot
          </button>
          <button 
            onClick={onCancel}
            className="w-full sm:w-auto py-8 px-16 text-[#7b2b2a]/60 hover:text-[#7b2b2a] font-black uppercase tracking-widest transition-all text-xl"
          >
            Cancel and Return
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ballot;