
import React, { useState, useEffect } from 'react';
import { Voter, ViewState } from './types';
import { MALE_CANDIDATES, FEMALE_CANDIDATES } from './constants';
import VoterPortal from './components/VoterPortal';
import Ballot from './components/Ballot';
import AdminDashboard from './components/AdminDashboard';
import QRSheet from './components/QRSheet';
import { CheckCircle2, ShieldCheck, LogOut, Loader2, Wifi, WifiOff } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';

// Configuration - Use VITE_ prefix for Vite environment variables
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || ""
};

// Initialize Firebase only if config exists
const isFirebaseEnabled = !!firebaseConfig.apiKey;
const app = isFirebaseEnabled ? initializeApp(firebaseConfig) : null;
const db = app ? getFirestore(app) : null;

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('voter-portal');
  const [voters, setVoters] = useState<Voter[]>([]);
  const [activeVoter, setActiveVoter] = useState<Voter | null>(null);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [dbConnected, setDbConnected] = useState(isFirebaseEnabled);
  const [loading, setLoading] = useState(isFirebaseEnabled);

  // Sync with Firestore in real-time
  useEffect(() => {
    if (!db) {
      // Fallback to localStorage if Firebase isn't configured
      const stored = localStorage.getItem('ipsa_voters');
      if (stored) setVoters(JSON.parse(stored));
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(collection(db, 'voters'), 
      (snapshot) => {
        const voterData: Voter[] = [];
        snapshot.forEach((doc) => voterData.push({ ...doc.data() } as Voter));
        setVoters(voterData);
        setDbConnected(true);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore sync error:", error);
        setDbConnected(false);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // Sync to local storage for extra safety/offline support
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
      if (db) {
        // Update specific document in Firestore
        const voterRef = doc(db, 'voters', activeVoter.id);
        await updateDoc(voterRef, {
          used: true,
          maleVote: maleId,
          femaleVote: femaleId
        });
      } else {
        // Local fallback
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
      alert("Failed to submit vote. Please check your internet connection.");
    }
  };

  const handleAdminLogin = (key: string) => {
    const expected = (import.meta as any).env.VITE_ADMIN_PASSPHRASE || 'admin123';
    if (key === expected) {
      setAdminAuthenticated(true);
      setView('admin-dashboard');
      return true;
    }
    return false;
  };

  const setVotersInDb = async (newVoters: Voter[]) => {
    if (db) {
      const batch = writeBatch(db);
      // Clear existing (optional, but for new lists it's common)
      // For this simple version, we'll just add/overwrite
      newVoters.forEach(v => {
        const ref = doc(db, 'voters', v.id);
        batch.set(ref, v);
      });
      await batch.commit();
    } else {
      setVoters(newVoters);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-indigo-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin mb-4" size={48} />
        <h2 className="text-xl font-bold">Connecting to IPSA Cloud...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-900 text-white p-4 shadow-lg flex justify-between items-center no-print">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => !adminAuthenticated && setView('voter-portal')}
        >
          <div className="bg-white p-1 rounded">
            <img src="https://picsum.photos/40/40" alt="Logo" className="w-8 h-8 rounded-sm" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">IPSA Student Council</h1>
        </div>

        <div className="flex gap-4 items-center">
          {adminAuthenticated && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${dbConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {dbConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {dbConnected ? 'Cloud Active' : 'Offline Mode'}
            </div>
          )}
          
          {view === 'admin-dashboard' ? (
            <button 
              onClick={() => { setAdminAuthenticated(false); setView('voter-portal'); }}
              className="flex items-center gap-1 text-sm bg-indigo-800 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <button 
              onClick={() => adminAuthenticated ? setView('admin-dashboard') : setView('admin-login')}
              className="flex items-center gap-1 text-sm text-indigo-200 hover:text-white transition-colors"
            >
              <ShieldCheck size={18} />
              Admin
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 relative">
        {!dbConnected && view !== 'admin-login' && !adminAuthenticated && (
          <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-6 rounded-r-xl text-sm font-medium animate-in fade-in duration-500">
            ⚠️ The system is currently in offline fallback mode. Database synchronization is disabled.
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
            <div className="bg-white p-10 rounded-2xl shadow-xl border border-indigo-50">
              <CheckCircle2 size={80} className="text-emerald-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Vote Submitted!</h2>
              <p className="text-slate-500 mb-8">Thank you for participating in the 2025 IPSA Student Council Election. Your voice has been shared across all devices.</p>
              <button 
                onClick={() => setView('voter-portal')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md active:scale-[0.98]"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

        {view === 'admin-login' && (
          <div className="max-w-md mx-auto mt-20">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
              <div className="flex justify-center mb-6">
                <div className="bg-indigo-100 p-4 rounded-full">
                  <ShieldCheck size={40} className="text-indigo-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Admin Access</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const key = (e.currentTarget.elements.namedItem('adminKey') as HTMLInputElement).value;
                if (!handleAdminLogin(key)) {
                  alert('Invalid Admin Key');
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Passphrase</label>
                    <input 
                      name="adminKey"
                      type="password" 
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      autoFocus
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-indigo-100"
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
            setVoters={setVotersInDb} 
            onOpenQRSheet={() => setView('qr-sheet')}
          />
        )}

        {view === 'qr-sheet' && adminAuthenticated && (
          <QRSheet 
            voters={voters} 
            onBack={() => setView('admin-dashboard')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 p-6 no-print">
        <div className="container mx-auto text-center">
          <p className="text-slate-400 text-sm">
            &copy; 2025 IPSA Student Council Presidential Election Portal. 
            <br className="sm:hidden" />
            Designed for secure and transparent global voting.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
