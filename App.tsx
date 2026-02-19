
import React, { useState, useEffect } from 'react';
import { Voter, ViewState } from './types';
import { MALE_CANDIDATES, FEMALE_CANDIDATES, APP_LOGO } from './constants';
import VoterPortal from './components/VoterPortal';
import Ballot from './components/Ballot';
import AdminDashboard from './components/AdminDashboard';
import QRSheet from './components/QRSheet';
import VoterListSheet from './components/VoterListSheet';
import { CheckCircle2, ShieldCheck, LogOut, Loader2, Wifi, WifiOff } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase only if config is complete
const isSupabaseEnabled = !!supabaseUrl && !!supabaseAnonKey;
const supabase = isSupabaseEnabled ? createClient(supabaseUrl, supabaseAnonKey) : null;

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('voter-portal');
  const [voters, setVoters] = useState<Voter[]>([]);
  const [activeVoter, setActiveVoter] = useState<Voter | null>(null);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [loading, setLoading] = useState(isSupabaseEnabled);

  // Initial Fetch and Real-time Subscription
  useEffect(() => {
    if (!supabase) {
      const stored = localStorage.getItem('ipsa_voters');
      if (stored) setVoters(JSON.parse(stored));
      setLoading(false);
      setDbConnected(false);
      return;
    }

    const fetchInitialData = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('voters').select('*');
      if (error) {
        console.error("Supabase Error:", error);
        setDbConnected(false);
      } else {
        setVoters(data || []);
        setDbConnected(true);
      }
      setLoading(false);
    };

    fetchInitialData();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('voter-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'voters' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setVoters(prev => {
               if (prev.some(v => v.id === payload.new.id)) return prev;
               return [...prev, payload.new as Voter];
            });
          } else if (payload.eventType === 'UPDATE') {
            setVoters(prev => prev.map(v => v.id === payload.new.id ? payload.new as Voter : v));
          } else if (payload.eventType === 'DELETE') {
            setVoters(prev => prev.filter(v => v.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        setDbConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Offline persistence fallback
  useEffect(() => {
    if (voters.length > 0) {
      localStorage.setItem('ipsa_voters', JSON.stringify(voters));
    }
  }, [voters]);

  const handleVoterAuth = (token: string) => {
    const voter = voters.find(v => v.token === token);
    if (!voter) return { success: false, error: 'Invalid token. Please check again.' };
    if (voter.used) return { success: false, error: 'This token has already been used to vote.' };
    
    setActiveVoter(voter);
    setView('ballot');
    return { success: true };
  };

  const handleVoteSubmit = async (maleId: string | null, femaleId: string | null) => {
    if (!activeVoter) return;

    try {
      if (supabase) {
        const { error } = await supabase
          .from('voters')
          .update({
            used: true,
            maleVote: maleId,
            femaleVote: femaleId
          })
          .eq('id', activeVoter.id);
        
        if (error) throw error;
      } else {
        const updatedVoters = voters.map(v => 
          v.id === activeVoter.id ? { ...v, used: true, maleVote: maleId, femaleVote: femaleId } : v
        );
        setVoters(updatedVoters);
      }

      setView('success');
      setActiveVoter(null);

      setTimeout(() => {
        setView('voter-portal');
      }, 5000);
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to submit vote. Check your connection.");
    }
  };

  const handleAdminLogin = (key: string) => {
    const expected = import.meta.env.VITE_ADMIN_PASSPHRASE || 'admin123';
    if (key === expected) {
      setAdminAuthenticated(true);
      setView('admin-dashboard');
      return true;
    }
    return false;
  };

  const syncVotersToDb = async (newVoters: Voter[]) => {
    if (supabase) {
      const { error } = await supabase.from('voters').upsert(newVoters, { onConflict: 'id' });
      if (error) throw error;
    } else {
      setVoters(prev => [...prev, ...newVoters]);
    }
  };

  const clearAllData = async () => {
    if (confirm('Permanently wipe ALL data?')) {
      if (supabase) {
        const { error } = await supabase.from('voters').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) throw error;
        setVoters([]);
      } else {
        setVoters([]);
      }
    }
  };

  if (loading && isSupabaseEnabled) {
    return (
      <div className="min-h-screen bg-[#7b2b2a] flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin mb-4" size={48} />
        <h2 className="text-xl font-bold">Connecting to IPSA Database...</h2>
      </div>
    );
  }

  // Determine if we should show standard layout or full-screen "sheet" layout
  const isSheetView = view === 'qr-sheet' || view === 'voter-list-sheet';

  return (
    <div className={`min-h-screen flex flex-col text-slate-800 ${isSheetView ? 'bg-white' : 'bg-[#fdfbf7]'}`}>
      <header className={`bg-[#7b2b2a] text-white p-4 shadow-xl border-b-4 border-[#c5a059] flex justify-between items-center no-print ${isSheetView ? 'hidden' : ''}`}>
        <div 
          className="flex items-center gap-3 cursor-pointer min-w-0 flex-1" 
          onClick={() => !adminAuthenticated && setView('voter-portal')}
        >
          <div className="shrink-0 bg-white p-1 rounded-lg border-2 border-[#c5a059] shadow-sm">
            <img src={APP_LOGO} alt="IPSA Logo" className="w-10 h-10 rounded-sm object-contain" />
          </div>
          <h1 className="text-sm sm:text-lg md:text-xl font-extrabold tracking-tight uppercase leading-tight">
            International Program Student Association
          </h1>
        </div>

        <div className="flex gap-4 items-center shrink-0 ml-4">
          {adminAuthenticated && (
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${dbConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {dbConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {dbConnected ? 'Live' : 'Offline'}
            </div>
          )}
          
          {view === 'admin-dashboard' ? (
            <button 
              onClick={() => { setAdminAuthenticated(false); setView('voter-portal'); }}
              className="flex items-center gap-1 text-sm bg-[#5a1f1e] hover:bg-[#4a1918] px-3 py-1.5 rounded-lg transition-colors border border-[#c5a059]/30"
            >
              <LogOut size={16} />
              <span className="hidden xs:inline">Logout</span>
            </button>
          ) : (
            <button 
              onClick={() => adminAuthenticated ? setView('admin-dashboard') : setView('admin-login')}
              className="flex items-center gap-1 text-sm text-amber-200 hover:text-white transition-colors"
            >
              <ShieldCheck size={18} />
              <span className="hidden xs:inline">Admin</span>
            </button>
          )}
        </div>
      </header>

      <main className={`flex-1 relative ${isSheetView ? '' : 'container mx-auto px-4 py-8'}`}>
        {!dbConnected && view !== 'admin-login' && !adminAuthenticated && !isSheetView && (
          <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-800 p-4 mb-6 rounded-r-xl text-sm font-medium animate-in fade-in duration-500 shadow-sm">
            ⚠️ {isSupabaseEnabled ? 'Synchronizing with cloud services...' : 'System running in local offline mode.'}
          </div>
        )}

        {view === 'voter-portal' && (
          <VoterPortal onAuth={handleVoterAuth} />
        )}

        {view === 'ballot' && activeVoter && (
          <Ballot 
            voter={activeVoter} 
            maleCandidates={MALE_CANDIDATES}
            femaleCandidates={FEMALE_CANDIDATES}
            onSubmit={handleVoteSubmit}
            onCancel={() => { setView('voter-portal'); setActiveVoter(null); }}
          />
        )}

        {view === 'success' && (
          <div className="max-w-md mx-auto mt-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="bg-white p-10 rounded-3xl shadow-2xl border-t-8 border-[#7b2b2a]">
              <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} className="text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tight">Vote Received!</h2>
              <p className="text-slate-500 mb-8 font-medium">Your selection has been securely recorded for the 2026 IPSA Presidential Election.</p>
              <button 
                onClick={() => setView('voter-portal')}
                className="w-full bg-[#7b2b2a] hover:bg-[#5a1f1e] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-red-900/20 active:scale-[0.98]"
              >
                Return to Home
              </button>
            </div>
          </div>
        )}

        {view === 'admin-login' && (
          <div className="max-w-md mx-auto mt-20">
            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
              <div className="flex justify-center mb-6">
                <div className="bg-[#fdfbf7] p-5 rounded-full border-2 border-[#c5a059]">
                  <ShieldCheck size={40} className="text-[#7b2b2a]" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-[#7b2b2a] mb-6 text-center uppercase tracking-wider">Staff Access</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const key = (e.currentTarget.elements.namedItem('adminKey') as HTMLInputElement).value;
                if (!handleAdminLogin(key)) {
                  alert('Invalid Passphrase');
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Passphrase</label>
                    <input 
                      name="adminKey"
                      type="password" 
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#7b2b2a] focus:border-transparent outline-none transition-all"
                      autoFocus
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-[#7b2b2a] hover:bg-[#5a1f1e] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-900/10"
                  >
                    Authenticate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {view === 'admin-dashboard' && adminAuthenticated && (
          <AdminDashboard 
            voters={voters} 
            setVoters={syncVotersToDb} 
            onOpenQRSheet={() => setView('qr-sheet')}
            onOpenVoterListSheet={() => setView('voter-list-sheet')}
            onClearAll={clearAllData}
          />
        )}

        {view === 'qr-sheet' && adminAuthenticated && (
          <QRSheet 
            voters={voters} 
            onBack={() => setView('admin-dashboard')}
          />
        )}

        {view === 'voter-list-sheet' && adminAuthenticated && (
          <VoterListSheet 
            voters={voters} 
            onBack={() => setView('admin-dashboard')}
          />
        )}
      </main>

      {!isSheetView && (
        <footer className="bg-[#fdfbf7] border-t border-slate-200 py-10 no-print">
          <div className="container mx-auto text-center px-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px bg-slate-200 w-12"></div>
              <div className="text-[#7b2b2a] font-bold text-xs uppercase tracking-[0.3em]">Official Portal</div>
              <div className="h-px bg-slate-200 w-12"></div>
            </div>
            <p className="text-slate-500 text-sm font-medium">
              &copy; 2026 Hisyam 
              <br className="sm:hidden" />
              <span className="mx-2 hidden sm:inline">•</span>
              4EVER
              <br className="sm:hidden" />
              <span className="mx-2 hidden sm:inline">•</span>
              International Program Student Association Executive Board
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
