import React, { useState, useMemo } from 'react';
import { Voter, UserRole } from '../types';
import { MALE_CANDIDATES, FEMALE_CANDIDATES } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Ticket, BarChart3, Upload, Download, Trash2, Printer, Search, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AdminDashboardProps {
  voters: Voter[];
  setVoters: React.Dispatch<React.SetStateAction<Voter[]>>;
  onOpenQRSheet: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ voters, setVoters, onOpenQRSheet }) => {
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

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newVoters: Voter[] = [...voters];
      
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length < 2) continue; // Skip empty lines

        const [no, name, roleStr] = parts;
        const role = roleStr?.toLowerCase() as UserRole;
        
        if (Object.values(UserRole).includes(role)) {
          newVoters.push({
            id: crypto.randomUUID(),
            name: name || `Voter ${no}`,
            role: role,
            token: generateToken(),
            used: false,
            maleVote: null,
            femaleVote: null
          });
        }
      }
      setVoters(newVoters);
    };
    reader.readAsText(file);
  };

  const exportCSV = () => {
    const header = "No,Name,Role,Token,Used,Male Vote,Female Vote\n";
    const rows = voters.map((v, i) => {
      const maleCand = MALE_CANDIDATES.find(c => c.id === v.maleVote)?.name || '';
      const femaleCand = FEMALE_CANDIDATES.find(c => c.id === v.femaleVote)?.name || '';
      return `${i+1},${v.name},${v.role},${v.token},${v.used ? 'Yes' : 'No'},${maleCand},${femaleCand}`;
    }).join('\n');
    
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ipsa_election_data_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const clearAllData = () => {
    if (confirm('CRITICAL: Are you sure you want to permanently delete all election data, tokens, and votes?')) {
      setVoters([]);
      localStorage.removeItem('ipsa_voters');
    }
  };

  const filteredVoters = voters.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.token.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Admin Control Center</h2>
          <p className="text-slate-500">Monitor results and manage voter credentials.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${activeTab === 'stats' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
          >
            <BarChart3 size={18} /> Stats
          </button>
          <button 
            onClick={() => setActiveTab('voters')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${activeTab === 'voters' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
          >
            <Users size={18} /> Voters
          </button>
          <button 
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${activeTab === 'manage' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
          >
            <Ticket size={18} /> Manage
          </button>
        </div>
      </div>

      {activeTab === 'stats' && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Quick Summary Cards */}
          <div className="md:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Voters', val: voters.length, icon: Users, color: 'bg-blue-500' },
              { label: 'Votes Cast', val: voters.filter(v => v.used).length, icon: CheckCircle2, color: 'bg-emerald-500' },
              { label: 'Unused Tokens', val: voters.filter(v => !v.used).length, icon: Ticket, color: 'bg-amber-500' },
              { label: 'Turnout', val: `${voters.length ? Math.round((voters.filter(v => v.used).length / voters.length) * 100) : 0}%`, icon: BarChart3, color: 'bg-indigo-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className={`${stat.color} p-3 rounded-xl text-white`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{stat.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Male Election Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="w-2 h-6 bg-indigo-600 rounded-full" />
              Male Election Standings
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maleElectionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="votes" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Female Election Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="w-2 h-6 bg-rose-500 rounded-full" />
              Female Election Standings
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={femaleElectionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="votes" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'voters' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-xl font-bold text-slate-800">Voter Registry</h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Search name or token..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Voter Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Token</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Selections</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVoters.map((voter) => (
                  <tr key={voter.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-700">{voter.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide
                        ${voter.role === UserRole.MALE ? 'bg-blue-100 text-blue-600' : 
                          voter.role === UserRole.FEMALE ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                        {voter.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{voter.token}</td>
                    <td className="px-6 py-4">
                      {voter.used ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs uppercase">
                          <CheckCircle2 size={14} /> Voted
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold text-xs uppercase">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {voter.used ? (
                        <>
                          {voter.maleVote && <div>M: {MALE_CANDIDATES.find(c => c.id === voter.maleVote)?.name}</div>}
                          {voter.femaleVote && <div>F: {FEMALE_CANDIDATES.find(c => c.id === voter.femaleVote)?.name}</div>}
                        </>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredVoters.length === 0 && (
              <div className="py-20 text-center text-slate-400">
                No voters found matching your search.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Import/Export */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-xl font-bold text-slate-800">Bulk Data Management</h3>
            <div className="space-y-4">
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center text-center">
                <Upload className="text-slate-400 mb-4" size={32} />
                <p className="text-sm font-medium text-slate-600 mb-4">Upload CSV of student names and roles (male/female/teacher) to auto-generate tokens.</p>
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleCSVUpload}
                  className="hidden" 
                  id="csv-upload"
                />
                <label 
                  htmlFor="csv-upload"
                  className="bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all shadow-sm"
                >
                  Choose File
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={exportCSV}
                  className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-md shadow-indigo-100"
                >
                  <Download size={18} /> Export Data
                </button>
                <button 
                  onClick={onOpenQRSheet}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-md shadow-emerald-100"
                >
                  <Printer size={18} /> Print QR Sheet
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-xl font-bold text-slate-800">System Controls</h3>
            <div className="space-y-4">
              <button 
                onClick={clearAllData}
                className="w-full flex items-center justify-center gap-2 border-2 border-rose-100 text-rose-600 hover:bg-rose-50 px-4 py-4 rounded-2xl font-bold transition-all"
              >
                <Trash2 size={20} /> Reset All Election Data
              </button>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                <AlertTriangle className="text-amber-500 shrink-0" />
                <p className="text-xs text-amber-800">
                  Resetting will wipe all voters, generated tokens, and vote history. This action cannot be undone. Always export a CSV backup before performing a reset.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;