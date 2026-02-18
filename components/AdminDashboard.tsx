
import React, { useState, useMemo } from 'react';
import { Voter, UserRole } from '../types';
import { MALE_CANDIDATES, FEMALE_CANDIDATES } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Ticket, BarChart3, Upload, Download, Trash2, Printer, Search, CheckCircle2, AlertTriangle, Loader2, XCircle, FileText, Filter, RotateCcw } from 'lucide-react';

interface AdminDashboardProps {
  voters: Voter[];
  setVoters: (newVoters: Voter[]) => Promise<void>;
  onOpenQRSheet: () => void;
  onClearAll: () => Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ voters, setVoters, onOpenQRSheet, onClearAll }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'stats' | 'voters' | 'manage'>('stats');
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

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

    setIsSyncing(true);
    setUploadStatus(null);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
        if (lines.length < 2) throw new Error("CSV file is empty or missing data rows.");

        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        const nameIdx = headers.indexOf('name');
        const roleIdx = headers.indexOf('role');

        if (nameIdx === -1 || roleIdx === -1) {
          throw new Error("CSV must have 'Name' and 'Role' columns.");
        }

        const newVoters: Voter[] = [];
        const validRoles = Object.values(UserRole) as string[];
        
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map(p => p.trim());
          if (parts.length <= Math.max(nameIdx, roleIdx)) continue;

          const name = parts[nameIdx];
          const roleRaw = parts[roleIdx].toLowerCase();
          
          if (validRoles.includes(roleRaw)) {
            newVoters.push({
              id: crypto.randomUUID(),
              name: name || `Voter ${i}`,
              role: roleRaw as UserRole,
              token: generateToken(),
              used: false,
              maleVote: null,
              femaleVote: null
            });
          }
        }
        
        if (newVoters.length === 0) {
          throw new Error("No valid voters found.");
        }

        await setVoters(newVoters);
        setUploadStatus({ type: 'success', message: `Successfully synced ${newVoters.length} voters!` });
      } catch (err: any) {
        setUploadStatus({ type: 'error', message: err.message || "Upload failed." });
      } finally {
        setIsSyncing(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const exportCSV = () => {
    const header = "Name,Role,Token,Used,Male Vote,Female Vote\n";
    const rows = voters.map((v) => {
      const maleCand = MALE_CANDIDATES.find(c => c.id === v.maleVote)?.name || '';
      const femaleCand = FEMALE_CANDIDATES.find(c => c.id === v.femaleVote)?.name || '';
      return `${v.name},${v.role},${v.token},${v.used ? 'Yes' : 'No'},${maleCand},${femaleCand}`;
    }).join('\n');
    
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ipsa_results_2026.csv`;
    a.click();
  };

  const handleClearAll = async () => {
    if (confirm('Permanently wipe ALL data?')) {
      setIsSyncing(true);
      try {
        await onClearAll();
        localStorage.removeItem('ipsa_voters');
        setUploadStatus({ type: 'success', message: "Database cleared." });
      } catch (err) {
        setUploadStatus({ type: 'error', message: "Clear failed." });
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const filteredVoters = useMemo(() => {
    return voters.filter(v => {
      const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            v.token.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || v.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'voted' && v.used) || 
                            (statusFilter === 'awaiting' && !v.used);
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [voters, searchTerm, roleFilter, statusFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Executive Dashboard</h2>
          <p className="text-slate-500 font-medium">Monitoring International Program Election Status</p>
        </div>
        <div className="flex bg-[#fdfbf7] p-1 rounded-2xl border-2 border-slate-100 shadow-sm">
          {[
            { id: 'stats', label: 'Metrics', icon: BarChart3 },
            { id: 'voters', label: 'Registry', icon: Users },
            { id: 'manage', label: 'Tools', icon: Ticket }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#7b2b2a] text-white shadow-lg' : 'text-slate-500 hover:text-[#7b2b2a]'}`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {uploadStatus && (
        <div className={`p-5 rounded-2xl border-2 flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 ${uploadStatus.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
          <div className={`p-2 rounded-full ${uploadStatus.type === 'success' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
            {uploadStatus.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          </div>
          <span className="font-black text-xs uppercase tracking-wider">{uploadStatus.message}</span>
          <button onClick={() => setUploadStatus(null)} className="ml-auto opacity-30 hover:opacity-100">
            <XCircle size={20} />
          </button>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="md:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Voters', val: voters.length, icon: Users, color: 'bg-[#7b2b2a]' },
              { label: 'Votes Cast', val: voters.filter(v => v.used).length, icon: CheckCircle2, color: 'bg-emerald-600' },
              { label: 'Unused', val: voters.filter(v => !v.used).length, icon: Ticket, color: 'bg-amber-500' },
              { label: 'Turnout', val: `${voters.length ? Math.round((voters.filter(v => v.used).length / voters.length) * 100) : 0}%`, icon: BarChart3, color: 'bg-[#c5a059]' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
                <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                  <stat.icon size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-800 leading-none">{stat.val}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3 uppercase tracking-tight">
              <div className="w-2.5 h-8 bg-[#7b2b2a] rounded-full" />
              Male Nominees
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maleElectionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#fdfbf7'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}}
                  />
                  <Bar dataKey="votes" fill="#7b2b2a" radius={[12, 12, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3 uppercase tracking-tight">
              <div className="w-2.5 h-8 bg-[#c5a059] rounded-full" />
              Female Nominees
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={femaleElectionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#fdfbf7'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}}
                  />
                  <Bar dataKey="votes" fill="#c5a059" radius={[12, 12, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'voters' && (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Registry</h3>
                <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Showing {filteredVoters.length} of {voters.length}
                </span>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text"
                  placeholder="Search name or token..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-[#fdfbf7] border-2 border-slate-50 focus:border-[#7b2b2a] focus:ring-0 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mr-2">
                <Filter size={14} /> Filter By:
              </div>
              
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-[#fdfbf7] border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none focus:border-[#7b2b2a] transition-all"
              >
                <option value="all">All Roles</option>
                <option value={UserRole.MALE}>Males</option>
                <option value={UserRole.FEMALE}>Females</option>
                <option value={UserRole.TEACHER}>Teachers</option>
              </select>

              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#fdfbf7] border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none focus:border-[#7b2b2a] transition-all"
              >
                <option value="all">All Status</option>
                <option value="voted">Voted</option>
                <option value="awaiting">Awaiting</option>
              </select>

              {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
                <button 
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-[#7b2b2a] hover:text-[#5a1f1e] text-[10px] font-black uppercase tracking-widest ml-auto transition-colors"
                >
                  <RotateCcw size={14} /> Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#fdfbf7] text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-5">Full Name</th>
                  <th className="px-8 py-5">Designation</th>
                  <th className="px-8 py-5">Token ID</th>
                  <th className="px-8 py-5">Participation</th>
                  <th className="px-8 py-5">Logs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredVoters.map((voter) => (
                  <tr key={voter.id} className="hover:bg-[#fdfbf7]/50 transition-colors">
                    <td className="px-8 py-5 font-black text-slate-700">{voter.name}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border
                        ${voter.role === UserRole.MALE ? 'bg-blue-50 border-blue-100 text-blue-600' : 
                          voter.role === UserRole.FEMALE ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                        {voter.role}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-mono text-xs font-bold text-slate-400">{voter.token}</td>
                    <td className="px-8 py-5">
                      {voter.used ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full">
                          <CheckCircle2 size={12} /> Confirmed
                        </span>
                      ) : (
                        <span className="text-slate-300 font-black text-[10px] uppercase tracking-wider">Awaiting</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-[10px] font-medium text-slate-400">
                      {voter.used ? 'Ballot Sealed' : 'No Activity'}
                    </td>
                  </tr>
                ))}
                {filteredVoters.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Search size={40} className="text-slate-200" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No matches found for your criteria</p>
                        <button onClick={clearFilters} className="text-[#7b2b2a] font-bold text-xs underline uppercase tracking-widest">Reset Filters</button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 uppercase tracking-tight">
              <div className="p-2 bg-amber-50 rounded-xl">
                <Upload size={24} className="text-[#7b2b2a]" />
              </div>
              Bulk Provisioning
            </h3>
            <div className="space-y-6">
              <div className="p-10 border-4 border-dashed border-[#fdfbf7] rounded-[2rem] bg-[#fdfbf7]/30 flex flex-col items-center text-center group hover:border-[#7b2b2a]/20 transition-all">
                <FileText className="text-slate-200 group-hover:text-[#7b2b2a]/30 transition-colors mb-4" size={48} />
                <p className="text-sm font-black text-slate-600 mb-2 uppercase tracking-wide">Import Voter CSV</p>
                <p className="text-[10px] text-slate-400 mb-6 font-mono tracking-tighter">Columns Required: Name, Role</p>
                
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleCSVUpload}
                  className="hidden" 
                  id="csv-upload"
                  disabled={isSyncing}
                />
                <label 
                  htmlFor="csv-upload"
                  className={`bg-[#7b2b2a] hover:bg-[#5a1f1e] text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] cursor-pointer transition-all shadow-xl shadow-red-900/10 flex items-center gap-3 ${isSyncing ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {isSyncing ? 'Processing...' : 'Select CSV File'}
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={exportCSV}
                  className="flex items-center justify-center gap-3 bg-white border-2 border-slate-100 hover:border-[#c5a059] text-slate-700 px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  <Download size={18} /> Export Results
                </button>
                <button 
                  onClick={onOpenQRSheet}
                  className="flex items-center justify-center gap-3 bg-[#c5a059] hover:bg-[#b08d48] text-white px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-amber-900/10"
                >
                  <Printer size={18} /> Print Tokens
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 uppercase tracking-tight">
              <div className="p-2 bg-rose-50 rounded-xl">
                <Trash2 size={24} className="text-rose-600" />
              </div>
              System Hard Reset
            </h3>
            <div className="space-y-6">
              <button 
                onClick={handleClearAll}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-3 border-4 border-rose-50 text-rose-600 hover:bg-rose-50 hover:border-rose-100 px-6 py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all disabled:opacity-50"
              >
                <Trash2 size={20} /> Purge All Database Records
              </button>
              <div className="p-6 bg-amber-50 rounded-3xl border-2 border-amber-100 flex gap-4">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={24} />
                <p className="text-xs font-bold text-amber-900 leading-relaxed uppercase tracking-tighter">
                  Caution: This action is irreversible. All current tokens, audit logs, and election results will be permanently removed from the primary server and all secondary sync points.
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
