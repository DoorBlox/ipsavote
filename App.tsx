import React, { useState, useEffect } from 'react';
import { Voter, ViewState } from './types';
import { MALE_CANDIDATES, FEMALE_CANDIDATES } from './constants';
import VoterPortal from './components/VoterPortal';
import Ballot from './components/Ballot';
import AdminDashboard from './components/AdminDashboard';
import QRSheet from './components/QRSheet';
import { CheckCircle, ShieldCheck, LogOut, Loader2, Wifi, WifiOff } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isSupabaseEnabled = !!supabaseUrl && !!supabaseAnonKey;
const supabase = isSupabaseEnabled ? createClient(supabaseUrl, supabaseAnonKey) : null;

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('voter-portal');
  const [voters, setVoters] = useState<Voter[]>([]);
  const [activeVoter, setActiveVoter] = useState<Voter | null>(null);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [loading, setLoading] = useState(isSupabaseEnabled);

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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'voters' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setVoters(prev => prev.some(v => v.id === payload.new.id) ? prev : [...prev, payload.new as Voter]);
        } else if (payload.eventType === 'UPDATE') {
          setVoters(prev => prev.map(v => v.id === payload.new.id ? payload.new as Voter : v));
        } else if (payload.eventType === 'DELETE') {
          setVoters(prev => prev.filter(v => v.id !== payload.old.id));
        }
      })
      .subscribe((status) => setDbConnected(status === 'SUBSCRIBED'));

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (voters.length > 0) localStorage.setItem('ipsa_voters', JSON.stringify(voters));
  }, [voters]);

  const handleVoterAuth = (token: string) => {
    const voter = voters.find(v => v.token === token);
    if (!voter) return { success: false, error: 'Invalid token. Please check again.' };
    if (voter.used) return { success: false, error: 'This token has already been used.' };
    setActiveVoter(voter);
    setView('ballot');
    return { success: true };
  };

  const handleVoteSubmit = async (maleId: string | null, femaleId: string | null) => {
    if (!activeVoter) return;
    try {
      if (supabase) {
        const { error } = await supabase.from('voters').update({ used: true, maleVote: maleId, femaleVote: femaleId }).eq('id', activeVoter.id);
        if (error) throw error;
      } else {
        setVoters(voters.map(v => v.id === activeVoter.id ? { ...v, used: true, maleVote: maleId, femaleVote: femaleId } : v));
      }
      setView('success');
      setActiveVoter(null);
      setTimeout(() => setView('voter-portal'), 5000);
    } catch (error) {
      alert("Submission failed. Check connection.");
    }
  };

  const handleAdminLogin = (key: string) => {
    if (key === (import.meta.env.VITE_ADMIN_PASSPHRASE || 'admin123')) {
      setAdminAuthenticated(true);
      setView('admin-dashboard');
      return true;
    }
    return false;
  };

  if (loading && isSupabaseEnabled) {
    return (
      <div className="min-h-screen bg-[#7b2b2a] flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin mb-4" size={48} />
        <h2 className="text-xl font-bold tracking-tight">Accessing IPSA Secure Cloud...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col">
      <header className="bg-[#7b2b2a] text-[#fdfaf6] p-4 shadow-xl flex justify-between items-center no-print border-b-4 border-[#c5a059]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => !adminAuthenticated && setView('voter-portal')}>
          <div className="bg-white p-1 rounded-lg">
            <img src="https://picsum.photos/40/40" alt="Logo" className="w-8 h-8 rounded-sm" />
          </div>
          <h1 className="text-lg md:text-xl font-black tracking-tight uppercase">International Program Student Association</h1>
        </div>

        <div className="flex gap-4 items-center">
          {adminAuthenticated && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${dbConnected ? 'bg-[#c5a059]/20 text-[#c5a059]' : 'bg-rose-500/20 text-rose-400'}`}>
              {dbConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {dbConnected ? 'Sync Active' : 'Offline Mode'}
            </div>
          )}
          
          <button 
            onClick={() => adminAuthenticated ? (view === 'admin-dashboard' ? (setAdminAuthenticated(false), setView('voter-portal')) : setView('admin-dashboard')) : setView('admin-login')}
            className="flex items-center gap-1 text-sm text-[#c5a059] hover:text-white transition-all font-bold uppercase tracking-widest"
          >
            {adminAuthenticated && view === 'admin-dashboard' ? <LogOut size={18} /> : <ShieldCheck size={18} />}
            {adminAuthenticated && view === 'admin-dashboard' ? 'Logout' : 'Admin'}
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 relative">
        {view === 'voter-portal' && <VoterPortal onAuth={handleVoterAuth} />}
        {view === 'ballot' && activeVoter && <Ballot voter={activeVoter} maleCandidates={MALE_CANDIDATES} femaleCandidates={FEMALE_CANDIDATES} onSubmit={handleVoteSubmit} onCancel={() => { setView('voter-portal'); setActiveVoter(null); }} />}
        
        {view === 'success' && (
          <div className="max-w-md mx-auto mt-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="bg-white p-10 rounded-3xl shadow-2xl border-t-8 border-[#c5a059]">
              <CheckCircle size={80} className="text-[#7b2b2a] mx-auto mb-6" />
              <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tight">Ballot Cast</h2>
              <p className="text-slate-500 mb-8 font-medium">Thank you. Your vote has been securely transmitted to the Association records.</p>
              <button onClick={() => setView('voter-portal')} className="w-full bg-[#7b2b2a] hover:bg-[#5a1f1e] text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl">Return to Portal</button>
            </div>
          </div>
        )}

        {view === 'admin-login' && (
          <div className="max-w-md mx-auto mt-20">
            <div className="bg-white p-8 rounded-3xl shadow-2xl border-t-8 border-[#c5a059]">
              <h2 className="text-2xl font-black text-slate-800 mb-6 text-center uppercase tracking-tight">Admin Gate</h2>
              <form onSubmit={(e) => { e.preventDefault(); if (!handleAdminLogin((e.currentTarget.elements.namedItem('adminKey') as HTMLInputElement).value)) alert('Invalid Key'); }}>
                <div className="space-y-4">
                  <input name="adminKey" type="password" placeholder="AUTHENTICATION KEY" className="w-full px-4 py-4 rounded-2xl border-2 border-[#faf7f2] focus:border-[#c5a059] outline-none text-center font-black tracking-widest uppercase" autoFocus />
                  <button type="submit" className="w-full bg-[#7b2b2a] hover:bg-[#5a1f1e] text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all">Authorize Access</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {view === 'admin-dashboard' && adminAuthenticated && (
          <AdminDashboard voters={voters} setVoters={async (v) => { if (supabase) await supabase.from('voters').upsert(v); else setVoters(prev => [...prev, ...v]); }} onOpenQRSheet={() => setView('qr-sheet')} onClearAll={async () => { if (supabase) await supabase.from('voters').delete().neq('id', '0'); setVoters([]); }} />
        )}

        {view === 'qr-sheet' && adminAuthenticated && <QRSheet voters={voters} onBack={() => setView('admin-dashboard')} />}
      </main>

      <footer className="bg-[#faf7f2] border-t border-[#c5a059]/30 p-8 no-print">
        <div className="container mx-auto text-center">
          <p className="text-[#7b2b2a] text-sm font-black tracking-widest uppercase">
            Ⓒ 2026 Hisyam.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;