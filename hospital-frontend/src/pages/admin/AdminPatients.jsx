import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Users, Search, Phone, MapPin, Droplets, UserCheck } from 'lucide-react';

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    try {
      const data = await adminAPI.getPatients();
      setPatients(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search) ||
    p.bloodGroup?.toLowerCase().includes(search.toLowerCase())
  );

  const bloodColor = (bg) => {
    if (!bg) return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    if (bg.includes('A')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (bg.includes('B')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    if (bg.includes('O')) return 'text-red-400 bg-red-500/10 border-red-500/20';
    return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"/>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="glass-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/5"/>
        <div className="relative z-10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-content">Manage Patients</h2>
            <p className="text-content-muted text-sm mt-1">All registered patients in Medicare Hospital</p>
          </div>
          <div className="flex gap-3">
            <div className="text-center px-5 py-2.5 bg-surface border border-border rounded-xl">
              <p className="text-2xl font-bold text-content">{patients.length}</p>
              <p className="text-xs text-content-muted">Total</p>
            </div>
            <div className="text-center px-5 py-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
              <p className="text-2xl font-bold text-cyan-500">{filtered.length}</p>
              <p className="text-xs text-cyan-500/70">Shown</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-content-muted">
          <Search size={16}/>
        </div>
        <input type="text" className="form-control pl-10 py-3" placeholder="Search by name, phone, or blood group..." value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-border/40 flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-content-muted/50"/>
          </div>
          <p className="text-content font-semibold">{search ? 'No results found' : 'No patients registered'}</p>
          <p className="text-content-muted text-sm mt-1">{search ? 'Try a different search term.' : 'Patients will appear after they register.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((patient, i) => (
            <div
              key={patient.id}
              onClick={() => setSelected(patient)}
              className={`glass-card p-5 cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-200 animate-fade-in-up delay-${Math.min(i*50,300)}`}
            >
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {patient.name?.charAt(0) || '?'}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-content truncate">{patient.name}</h4>
                  <p className="text-xs text-content-muted">Patient #{patient.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-background border border-border rounded-xl p-2.5 text-center">
                  <Droplets size={14} className="mx-auto text-red-400 mb-1"/>
                  <p className="text-xs font-bold text-content">{patient.bloodGroup || 'N/A'}</p>
                  <p className="text-[10px] text-content-muted">Blood</p>
                </div>
                <div className="bg-background border border-border rounded-xl p-2.5 text-center">
                  <UserCheck size={14} className="mx-auto text-emerald-400 mb-1"/>
                  <p className="text-xs font-bold text-content">{patient.gender || 'N/A'}</p>
                  <p className="text-[10px] text-content-muted">Gender</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-border pt-3">
                <div className="flex items-center gap-2 text-xs text-content-muted">
                  <Phone size={12} className="text-indigo-400 flex-shrink-0"/>
                  {patient.phone || 'No phone on file'}
                </div>
                <div className="flex items-center gap-2 text-xs text-content-muted">
                  <MapPin size={12} className="text-emerald-400 flex-shrink-0"/>
                  <span className="truncate">{patient.address || 'No address provided'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelected(null)}>
          <div className="glass-card w-full max-w-md overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="h-24 bg-gradient-to-r from-cyan-500/80 to-indigo-600/80 relative">
              <div className="absolute -bottom-7 left-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl border-4 border-surface shadow-xl">
                {selected.name?.charAt(0)}
              </div>
            </div>
            <div className="pt-12 px-6 pb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-content">{selected.name}</h3>
                  <p className="text-content-muted text-sm">Patient #{selected.id}</p>
                </div>
                <span className={`badge border ${bloodColor(selected.bloodGroup)}`}>
                  <Droplets size={11}/> {selected.bloodGroup || 'N/A'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Date of Birth', value: selected.dob || 'N/A' },
                  { label: 'Gender', value: selected.gender || 'N/A' },
                  { label: 'Phone', value: selected.phone || 'N/A' },
                  { label: 'Emergency', value: selected.emergencyContact || 'N/A' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-background border border-border rounded-xl p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted">{label}</p>
                    <p className="text-sm font-semibold text-content mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-background border border-border rounded-xl p-3 mb-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted mb-0.5">Address</p>
                <p className="text-sm text-content">{selected.address || 'No address provided'}</p>
              </div>
              <button onClick={() => setSelected(null)} className="btn btn-primary w-full">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPatients;
