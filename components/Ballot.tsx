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
    <div className="max-w-6xl mx-auto animate-in slide-in-from-right-4 duration-500">
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

      <div className="bg-white rounded-b-3xl shadow-2xl p-8 sm:p-12 space-y-16">
        {/* Male Election Section */}
        {(voter.role === UserRole.MALE || voter.role === UserRole.TEACHER) && (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b-2 border-[#faf7f2] pb-4">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Male Presidential Ticket</h3>
              <div className="bg-[#c5a059]/10 text-[#7b2b2a] text-xs px-4 py-1.5 rounded-full font-black uppercase tracking-widest border border-[#c5a059]/20">Single Choice</div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-10">
              {maleCandidates.map((candidate) => (
                <div 
                  key={candidate.id}
                  onClick={() => setSelectedMale(candidate.id)}
                  className={`
                    relative cursor-pointer group rounded-[2.5rem] border-2 transition-all p-8
                    ${selectedMale === candidate.id 
                      ? 'border-[#7b2b2a] bg-[#7b2b2a]/5 ring-8 ring-[#7b2b2a]/5 shadow-2xl' 
                      : 'border-[#faf7f2] bg-[#faf7f2]/30 hover:border-[#c5a059]/30'}
                  `}
                >
                  <div className="flex flex-col items-center gap-8">
                    <div className="relative shrink-0">
                      <img 
                        src={candidate.imageUrl} 
                        alt={candidate.name} 
                        className={`w-64 h-64 sm:w-72 sm:h-72 rounded-[2rem] object-cover shadow-2xl transition-all duration-500 ${selectedMale === candidate.id ? 'ring-8 ring-white scale-105' : 'grayscale-[15%] group-hover:grayscale-0'}`}
                      />
                      {selectedMale === candidate.id && (
                        <div className="absolute -top-4 -right-4 bg-[#7b2b2a] text-white p-3 rounded-full border-4 border-white shadow-2xl scale-110">
                          <Check size={32} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                    <div className="text-center min-w-0">
                      <p className="text-xs text-[#c5a059] font-black uppercase tracking-[0.3em] mb-4">IPSA Elite Ticket</p>
                      <h4 className="text-3xl font-black text-slate-900 leading-tight mb-2">{candidate.name}</h4>
                      <div className="flex items-center justify-center gap-3 py-2">
                        <span className="text-[#c5a059] font-black text-lg uppercase tracking-widest">&</span>
                        <h4 className="text-3xl font-black text-slate-900 leading-tight">{candidate.viceName}</h4>
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
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b-2 border-[#faf7f2] pb-4">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Female Presidential Ticket</h3>
              <div className="bg-[#c5a059]/10 text-[#7b2b2a] text-xs px-4 py-1.5 rounded-full font-black uppercase tracking-widest border border-[#c5a059]/20">Single Choice</div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-10">
              {femaleCandidates.map((candidate) => (
                <div 
                  key={candidate.id}
                  onClick={() => setSelectedFemale(candidate.id)}
                  className={`
                    relative cursor-pointer group rounded-[2.5rem] border-2 transition-all p-8
                    ${selectedFemale === candidate.id 
                      ? 'border-[#7b2b2a] bg-[#7b2b2a]/5 ring-8 ring-[#7b2b2a]/5 shadow-2xl' 
                      : 'border-[#faf7f2] bg-[#faf7f2]/30 hover:border-[#c5a059]/30'}
                  `}
                >
                  <div className="flex flex-col items-center gap-8">
                    <div className="relative shrink-0">
                      <img 
                        src={candidate.imageUrl} 
                        alt={candidate.name} 
                        className={`w-64 h-64 sm:w-72 sm:h-72 rounded-[2rem] object-cover shadow-2xl transition-all duration-500 ${selectedFemale === candidate.id ? 'ring-8 ring-white scale-105' : 'grayscale-[15%] group-hover:grayscale-0'}`}
                      />
                      {selectedFemale === candidate.id && (
                        <div className="absolute -top-4 -right-4 bg-[#7b2b2a] text-white p-3 rounded-full border-4 border-white shadow-2xl scale-110">
                          <Check size={32} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                    <div className="text-center min-w-0">
                      <p className="text-xs text-[#c5a059] font-black uppercase tracking-[0.3em] mb-4">IPSA Elite Ticket</p>
                      <h4 className="text-3xl font-black text-slate-900 leading-tight mb-2">{candidate.name}</h4>
                      <div className="flex items-center justify-center gap-3 py-2">
                        <span className="text-[#c5a059] font-black text-lg uppercase tracking-widest">&</span>
                        <h4 className="text-3xl font-black text-slate-900 leading-tight">{candidate.viceName}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#faf7f2] p-8 rounded-[2rem] border-2 border-dashed border-[#c5a059]/40 flex items-start gap-5">
          <AlertTriangle className="text-[#c5a059] shrink-0 mt-1" size={32} />
          <p className="text-sm text-[#7b2b2a] font-bold leading-relaxed">
            <strong className="uppercase tracking-[0.1em] block mb-2 text-base">Final Authorization Check:</strong> 
            Verify your chosen candidates match the tickets above. By clicking "Cast Official Ballot", you are submitting your one-time digital signature to the IPSA secure database. This action is irreversible and permanent.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
          <button 
            disabled={!canSubmit()}
            onClick={() => onSubmit(selectedMale, selectedFemale)}
            className={`
              w-full sm:flex-1 py-6 px-12 rounded-2xl font-black text-2xl uppercase tracking-[0.2em] transition-all shadow-2xl
              ${canSubmit() 
                ? 'bg-[#7b2b2a] hover:bg-[#5a1f1e] text-white shadow-[#7b2b2a]/40 active:scale-[0.98]' 
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