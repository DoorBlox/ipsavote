import React, { useState, useMemo } from 'react';
import { Voter, UserRole } from '../types';
import { MALE_CANDIDATES, FEMALE_CANDIDATES } from '../constants';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Ticket, BarChart3, Upload, Trash2, Printer, Search, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface AdminDashboardProps {
  voters: Voter[];
  setVoters: (newVoters: Voter[]) => Promise<void>;
  onOpenQRSheet: () => void;
  onClearAll: () => Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ voters, setVoters, onOpenQRSheet, onClearAll }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'voters' | 'manage'>('stats');

  const maleElectionData = useMemo(() => {
    return MALE_CANDIDATES.map(c => ({
      name: c.name.split(' ')[0],
      fullName: c.name,
      votes: voters.filter(v => v.maleVote === c.id).length
    }));
  }, [voters]);

  const femaleElectionData = useMemo(() => {
    return FEMALE_CANDIDATES.map(c => ({
      name: c.name.split(' ')[0],
      fullName: c.name,
      votes: voters.filter(v => v.femaleVote === c.id).length
    }));
  }, [voters]);

  const generateToken = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
        if (lines.length < 2) return;
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        const nameIdx = headers.indexOf('name');
        const roleIdx = headers.indexOf('role');
        if (nameIdx === -1 || roleIdx === -1) return;
        
        const newVoters: Voter[] = [];
        const validRoles = Object.values(UserRole) as string[];
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map(p => p.trim());
          if (parts.length <= Math.max(nameIdx, roleIdx)) continue;
          const name = parts[nameIdx];
          const roleRaw = parts[roleIdx].toLowerCase();
          if (validRoles.includes(roleRaw)) {
            newVoters.push({ id: crypto.randomUUID(), name: name || `Voter ${i}`, role: roleRaw as UserRole, token: generateToken(), used: false, maleVote: null, femaleVote: null });
          }
        }
        await setVoters(newVoters);
      } catch (err) {
        console.error("CSV Import Error:", err);
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const filteredVoters = voters.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.token.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#7b2b2a] uppercase tracking-tighter">Association Console</h2>
          <p className="text-slate-500 font-medium">Monitoring live registration and voting metrics.</p>
        </div>
        <div className="flex gap-2">
          {['stats', 'voters', 'manage'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-5 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === tab ? 'bg-[#7b2b2a] text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:bg-[#faf7f2]'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'stats' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="md:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Registered', val: voters.length, icon: Users, color: 'bg-[#7b2b2a]' },
              { label: 'Votes Cast', val: voters.filter(v => v.used).length, icon: CheckCircle2, color: 'bg-[#c5a059]' },
              { label: 'Outstanding', val: voters.filter(v => !v.used).length, icon: Ticket, color: 'bg-slate-800' },
              { label: 'Participation', val: `${voters.length ? Math.round((voters.filter(v => v.used).length / voters.length) * 100) : 0}%`, icon: BarChart3, color: 'bg-[#7b2b2a]' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-[#7b2b2a] leading-tight">{stat.val}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-[#7b2b2a] mb-8 flex items-center gap-2 uppercase tracking-widest">
              <div className="w-1.5 h-4 bg-[#c5a059] rounded-full" />
              Male Wing Results
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maleElectionData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: '#faf7f2'}} contentStyle={{borderRadius: '16px', border: 'none', fontWeight: 'bold'}} />
                  <Bar dataKey="votes" fill="#7b2b2a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-[#7b2b2a] mb-8 flex items-center gap-2 uppercase tracking-widest">
              <div className="w-1.5 h-4 bg-[#c5a059] rounded-full" />
              Female Wing Results
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={femaleElectionData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: '#faf7f2'}} contentStyle={{borderRadius: '16px', border: 'none', fontWeight: 'bold'}} />
                  <Bar dataKey="votes" fill="#c5a059" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'voters' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-[#faf7f2] flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-sm font-black text-[#7b2b2a] uppercase tracking-widest">Master List</h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search Identity..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#faf7f2] bg-[#faf7f2]/50 focus:border-[#c5a059] outline-none text-xs font-bold" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#faf7f2]/50 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Auth Token</th><th className="px-6 py-4">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-[#faf7f2]">
                {filteredVoters.map((voter) => (
                  <tr key={voter.id} className="hover:bg-[#faf7f2]/30 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-slate-700">{voter.name}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${voter.role === UserRole.MALE ? 'border-[#7b2b2a]/20 text-[#7b2b2a]' : 'border-[#c5a059]/30 text-[#c5a059]'}`}>{voter.role}</span></td>
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{voter.token}</td>
                    <td className="px-6 py-4">{voter.used ? <span className="text-[#c5a059] font-black text-[9px] uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={12} /> Confirmed</span> : <span className="text-slate-300 font-black text-[9px] uppercase tracking-widest">Eligible</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8">
            <h3 className="text-sm font-black text-[#7b2b2a] uppercase tracking-widest flex items-center gap-2"><Upload size={18} className="text-[#c5a059]" /> Registration Sync</h3>
            <div className="p-10 border-4 border-dashed border-[#faf7f2] rounded-3xl bg-[#faf7f2]/40 flex flex-col items-center text-center">
              <FileText className="text-slate-200 mb-4" size={48} />
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Import Voter CSV (Name, Role)</p>
              <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" id="csv-upload" />
              <label htmlFor="csv-upload" className="bg-[#7b2b2a] text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-[#5a1f1e] shadow-xl transition-all">Select Master List</label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={onOpenQRSheet} className="flex items-center justify-center gap-2 bg-[#c5a059] text-white px-4 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#c5a059]/20 transition-all hover:brightness-105"><Printer size={16} /> Print Passes</button>
              <button onClick={() => window.location.reload()} className="bg-slate-800 text-white px-4 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Refresh Sync</button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8">
            <h3 className="text-sm font-black text-[#7b2b2a] uppercase tracking-widest flex items-center gap-2"><Trash2 size={18} className="text-rose-600" /> Maintenance</h3>
            <div className="space-y-4">
              <button onClick={() => onClearAll()} className="w-full flex items-center justify-center gap-2 border-2 border-rose-100 text-rose-600 hover:bg-rose-50 px-4 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all"><Trash2 size={16} /> Wipe Cloud Data</button>
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex gap-3">
                <AlertTriangle className="text-rose-400 shrink-0" size={18} />
                <p className="text-[9px] text-rose-800 font-bold uppercase tracking-wider leading-relaxed">Danger: This wipes all distributed tokens permanently.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;