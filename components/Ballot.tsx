
import React, { useState } from 'react';
import { Voter, Candidate, UserRole } from '../types';
import { Check, AlertTriangle, ShieldCheck } from 'lucide-react';

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
      case UserRole.MALE: return "Male Student Representative";
      case UserRole.FEMALE: return "Female Student Representative";
      case UserRole.TEACHER: return "Faculty Representative";
      default: return voter.role;
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-right-4 duration-500">
      <div className="bg-[#7b2b2a] rounded-t-[2.5rem] p-8 md:p-12 text-white border-b-4 border-[#c5a059]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
               <ShieldCheck size={32} className="text-amber-200" />
             </div>
             <div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Official Ballot</h2>
              <div className="flex items-center gap-2 text-amber-100 font-bold text-sm md:text-base uppercase tracking-wider">
                <span>{getRoleDisplay()}</span>
                <span className="opacity-50">•</span>
                <span>{voter.name}</span>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl px-5 py-3 rounded-2xl text-xs md:text-sm font-black border border-white/20 tracking-[0.2em]">
            TOKEN: {voter.token}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-b-[2.5rem] shadow-2xl p-8 md:p-12 space-y-16">
        {/* Male Election Section */}
        {(voter.role === UserRole.MALE || voter.role === UserRole.TEACHER) && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-100 pb-6">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Male Presidential Ticket</h3>
              <div className="bg-amber-50 text-[#7b2b2a] text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest border border-[#7b2b2a]/10">1 Seat Available</div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-8">
              {maleCandidates.map((candidate) => (
                <div 
                  key={candidate.id}
                  onClick={() => setSelectedMale(candidate.id)}
                  className={`
                    relative cursor-pointer group rounded-[2rem] border-4 transition-all p-6
                    ${selectedMale === candidate.id 
                      ? 'border-[#7b2b2a] bg-[#fdfbf7] shadow-xl' 
                      : 'border-slate-50 bg-[#fdfbf7]/50 hover:border-slate-200'}
                  `}
                >
                  <div className="flex items-center gap-6 mb-6">
                    <div className="relative shrink-0">
                      <img 
                        src={candidate.imageUrl} 
                        alt={candidate.name} 
                        className={`w-28 h-28 rounded-3xl object-cover shadow-lg transition-all ${selectedMale === candidate.id ? 'ring-4 ring-[#7b2b2a]/20 scale-105' : ''}`}
                      />
                      {selectedMale === candidate.id && (
                        <div className="absolute -top-3 -right-3 bg-[#7b2b2a] text-[#c5a059] p-2 rounded-full border-4 border-white shadow-xl">
                          <Check size={20} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-[#7b2b2a] font-black uppercase tracking-[0.2em] mb-2">Primary Nominee</p>
                      <h4 className="text-2xl font-black text-slate-900 leading-none mb-1">{candidate.name}</h4>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#c5a059] font-black text-[10px] uppercase">&</span>
                        <h4 className="text-lg font-bold text-slate-700 leading-none">{candidate.viceName}</h4>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-100 pb-6">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Female Presidential Ticket</h3>
              <div className="bg-amber-50 text-[#7b2b2a] text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest border border-[#7b2b2a]/10">1 Seat Available</div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-8">
              {femaleCandidates.map((candidate) => (
                <div 
                  key={candidate.id}
                  onClick={() => setSelectedFemale(candidate.id)}
                  className={`
                    relative cursor-pointer group rounded-[2rem] border-4 transition-all p-6
                    ${selectedFemale === candidate.id 
                      ? 'border-[#7b2b2a] bg-[#fdfbf7] shadow-xl' 
                      : 'border-slate-50 bg-[#fdfbf7]/50 hover:border-slate-200'}
                  `}
                >
                  <div className="flex items-center gap-6 mb-6">
                    <div className="relative shrink-0">
                      <img 
                        src={candidate.imageUrl} 
                        alt={candidate.name} 
                        className={`w-28 h-28 rounded-3xl object-cover shadow-lg transition-all ${selectedFemale === candidate.id ? 'ring-4 ring-[#7b2b2a]/20 scale-105' : ''}`}
                      />
                      {selectedFemale === candidate.id && (
                        <div className="absolute -top-3 -right-3 bg-[#7b2b2a] text-[#c5a059] p-2 rounded-full border-4 border-white shadow-xl">
                          <Check size={20} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-[#7b2b2a] font-black uppercase tracking-[0.2em] mb-2">Primary Nominee</p>
                      <h4 className="text-2xl font-black text-slate-900 leading-none mb-1">{candidate.name}</h4>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#c5a059] font-black text-[10px] uppercase">&</span>
                        <h4 className="text-lg font-bold text-slate-700 leading-none">{candidate.viceName}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#fdfbf7] p-6 rounded-3xl border-2 border-amber-100 flex items-start gap-4">
          <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={24} />
          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            <strong className="text-[#7b2b2a] uppercase tracking-wider block mb-1">Confirmation Required</strong>
            Review your selections. By casting this ballot, you confirm these are your chosen representatives. This action is final and cannot be undone once submitted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
          <button 
            disabled={!canSubmit()}
            onClick={() => onSubmit(selectedMale, selectedFemale)}
            className={`
              w-full sm:flex-1 py-5 px-10 rounded-2xl font-black text-xl uppercase tracking-widest transition-all shadow-xl
              ${canSubmit() 
                ? 'bg-[#7b2b2a] hover:bg-[#5a1f1e] text-white shadow-red-900/20 active:scale-[0.98]' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}
            `}
          >
            Submit Final Ballot
          </button>
          <button 
            onClick={onCancel}
            className="w-full sm:w-auto py-5 px-12 text-slate-400 hover:text-[#7b2b2a] font-black uppercase tracking-widest text-sm transition-all"
          >
            Abort Vote
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ballot;
