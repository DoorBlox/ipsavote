import React, { useState, useEffect } from 'react';
import { Voter, ViewState } from './types';
import { MALE_CANDIDATES, FEMALE_CANDIDATES } from './constants';
import VoterPortal from './components/VoterPortal';
import Ballot from './components/Ballot';
import AdminDashboard from './components/AdminDashboard';
import QRSheet from './components/QRSheet';
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
    if (supabase) {
      const { error } = await supabase.from('voters').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      setVoters([]);
    } else {
      setVoters([]);
    }
  };

  if (loading && isSupabaseEnabled) {
    return (
      <div className="min-h-screen bg-[#7b2b2a] flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin mb-4" size={48} />
        <h2 className="text-xl font-bold">Connecting to IPSA Supabase...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col">
      <header className="bg-[#7b2b2a] text-[#fdfaf6] p-4 shadow-xl flex justify-between items-center no-print border-b-4 border-[#c5a059]">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => !adminAuthenticated && setView('voter-portal')}
        >
          <div className="bg-white p-1 rounded-lg border border-[#c5a059]">
            <img src="https://picsum.photos/40/40" alt="Logo" className="w-8 h-8 rounded-sm" />
          </div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight uppercase">International Program Student Association</h1>
        </div>

        <div className="flex gap-4 items-center">
          {adminAuthenticated && (
            <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${dbConnected ? 'bg-[#c5a059]/20 text-[#c5a059]' : 'bg-rose-500/20 text-rose-400'}`}>
              {dbConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {dbConnected ? 'Sync Active' : 'Offline Mode'}
            </div>
          )}
          
          {view === 'admin-dashboard' ? (
            <button 
              onClick={() => { setAdminAuthenticated(false); setView('voter-portal'); }}
              className="flex items-center gap-1 text-sm bg-[#5a1f1e] hover:bg-[#c5a059] hover:text-[#7b2b2a] px-3 py-1.5 rounded-lg transition-all font-bold"
            >
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <button 
              onClick={() => adminAuthenticated ? setView('admin-dashboard') : setView('admin-login')}
              className="flex items-center gap-1 text-sm text-[#c5a059] hover:text-white transition-colors"
            >
              <ShieldCheck size={18} />
              Admin
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 relative">
        {!dbConnected && view !== 'admin-login' && !adminAuthenticated && (
          <div className="bg-[#c5a059]/10 border-l-4 border-[#c5a059] text-[#7b2b2a] p-4 mb-6 rounded-r-xl text-sm font-medium animate-in fade-in duration-500">
            ⚠️ Synchronizing with election database...
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
            <div className="bg-white p-10 rounded-2xl shadow-2xl border-t-8 border-[#7b2b2a]">
              <CheckCircle2 size={80} className="text-[#c5a059] mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Vote Submitted!</h2>
              <p className="text-slate-500 mb-8">Thank you for participating. Your voice has been recorded in the IPSA secure cloud.</p>
              <button 
                onClick={() => setView('voter-portal')}
                className="w-full bg-[#7b2b2a] hover:bg-[#5a1f1e] text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-[0.98]"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

        {view === 'admin-login' && (
          <div className="max-w-md mx-auto mt-20">
            <div className="bg-white p-8 rounded-2xl shadow-xl border-t-8 border-[#c5a059]">
              <div className="flex justify-center mb-6">
                <div className="bg-[#faf7f2] p-4 rounded-full border border-[#c5a059]">
                  <ShieldCheck size={40} className="text-[#7b2b2a]" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center uppercase tracking-tight">Admin Gate</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const key = (e.currentTarget.elements.namedItem('adminKey') as HTMLInputElement).value;
                if (!handleAdminLogin(key)) {
                  alert('Invalid Admin Key');
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Authentication Passphrase</label>
                    <input 
                      name="adminKey"
                      type="password" 
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#faf7f2] focus:border-[#c5a059] outline-none transition-all"
                      autoFocus
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-[#7b2b2a] hover:bg-[#5a1f1e] text-white font-bold py-3 rounded-xl transition-all shadow-md"
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
            onClearAll={clearAllData}
          />
        )}

        {view === 'qr-sheet' && adminAuthenticated && (
          <QRSheet 
            voters={voters} 
            onBack={() => setView('admin-dashboard')}
          />
        )}
      </main>

      <footer className="bg-[#faf7f2] border-t border-[#c5a059]/20 p-6 no-print">
        <div className="container mx-auto text-center">
          <p className="text-[#7b2b2a]/60 text-sm font-medium">
            &copy; 2026 Hisyam. 
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> | </span>
            Secured for IPSA Global Elections.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;