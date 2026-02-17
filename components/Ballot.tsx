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
      case UserRole.MALE: return "Male Student Representative";
      case UserRole.FEMALE: return "Female Student Representative";
      case UserRole.TEACHER: return "Faculty Representative";
      default: return voter.role;
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-right-4 duration-500">
      <div className="bg-indigo-600 rounded-t-3xl p-8 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-1">Official Ballot</h2>
            <div className="flex items-center gap-2 text-indigo-100">
              <span className="capitalize font-medium">{getRoleDisplay()}</span>
              <span>•</span>
              <span>{voter.name}</span>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold border border-white/30">
            Token: {voter.token}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-b-3xl shadow-2xl p-8 border-x border-b border-indigo-50 space-y-12">
        {/* Male Election Section */}
        {(voter.role === UserRole.MALE || voter.role === UserRole.TEACHER) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-2xl font-bold text-slate-800">Male President & Vice Election</h3>
              <div className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Choice 1 of 1</div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {maleCandidates.map((candidate) => (
                <div 
                  key={candidate.id}
                  onClick={() => setSelectedMale(candidate.id)}
                  className={`
                    relative cursor-pointer group rounded-2xl border-2 transition-all p-5
                    ${selectedMale === candidate.id 
                      ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50' 
                      : 'border-slate-100 bg-slate-50 hover:border-slate-200'}
                  `}
                >
                  <div className="flex items-center gap-5 mb-5">
                    <div className="relative shrink-0">
                      <img 
                        src={candidate.imageUrl} 
                        alt={candidate.name} 
                        className={`w-24 h-24 rounded-2xl object-cover shadow-md transition-all ${selectedMale === candidate.id ? 'ring-4 ring-white' : ''}`}
                      />
                      {selectedMale === candidate.id && (
                        <div className="absolute -top-2 -right-2 bg-indigo-600 text-white p-1 rounded-full border-2 border-white shadow-lg">
                          <Check size={18} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Presidential Ticket</p>
                      <h4 className="text-xl font-bold text-slate-900 leading-tight truncate">{candidate.name}</h4>
                      <div className="flex items-center gap-1.5 py-0.5">
                        <span className="text-slate-400 font-bold text-[10px] uppercase">&</span>
                        <h4 className="text-xl font-bold text-slate-900 leading-tight truncate">{candidate.viceName}</h4>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/50 p-3 rounded-xl space-y-1 border border-indigo-100/30">
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="font-bold opacity-70">President</span>
                      <span className="font-medium">{candidate.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="font-bold opacity-70">Vice President</span>
                      <span className="font-medium">{candidate.viceName}</span>
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
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-2xl font-bold text-slate-800">Female President & Vice Election</h3>
              <div className="bg-rose-50 text-rose-600 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Choice 1 of 1</div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {femaleCandidates.map((candidate) => (
                <div 
                  key={candidate.id}
                  onClick={() => setSelectedFemale(candidate.id)}
                  className={`
                    relative cursor-pointer group rounded-2xl border-2 transition-all p-5
                    ${selectedFemale === candidate.id 
                      ? 'border-rose-500 bg-rose-50 ring-4 ring-rose-50' 
                      : 'border-slate-100 bg-slate-50 hover:border-slate-200'}
                  `}
                >
                  <div className="flex items-center gap-5 mb-5">
                    <div className="relative shrink-0">
                      <img 
                        src={candidate.imageUrl} 
                        alt={candidate.name} 
                        className={`w-24 h-24 rounded-2xl object-cover shadow-md transition-all ${selectedFemale === candidate.id ? 'ring-4 ring-white' : ''}`}
                      />
                      {selectedFemale === candidate.id && (
                        <div className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full border-2 border-white shadow-lg">
                          <Check size={18} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest mb-1">Presidential Ticket</p>
                      <h4 className="text-xl font-bold text-slate-900 leading-tight truncate">{candidate.name}</h4>
                      <div className="flex items-center gap-1.5 py-0.5">
                        <span className="text-slate-400 font-bold text-[10px] uppercase">&</span>
                        <h4 className="text-xl font-bold text-slate-900 leading-tight truncate">{candidate.viceName}</h4>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/50 p-3 rounded-xl space-y-1 border border-rose-100/30">
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="font-bold opacity-70">President</span>
                      <span className="font-medium">{candidate.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="font-bold opacity-70">Vice President</span>
                      <span className="font-medium">{candidate.viceName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600">
            <strong>Important:</strong> Review your choices carefully. Once you click "Cast Ballot", your decision is final and your token will be invalidated. Multiple votes are not permitted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <button 
            disabled={!canSubmit()}
            onClick={() => onSubmit(selectedMale, selectedFemale)}
            className={`
              w-full sm:flex-1 py-4 px-8 rounded-2xl font-bold text-lg transition-all shadow-lg
              ${canSubmit() 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 active:scale-[0.98]' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}
            `}
          >
            Cast Official Ballot
          </button>
          <button 
            onClick={onCancel}
            className="w-full sm:w-auto py-4 px-10 text-slate-500 hover:text-slate-700 font-bold transition-all"
          >
            Cancel & Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ballot;