import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Stethoscope, Search, Phone, Award, Calendar, CheckCircle2, XCircle } from 'lucide-react';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    try {
      const data = await adminAPI.getDoctors();
      setDoctors(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = doctors.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const specColors = ['bg-indigo-500/10 text-indigo-500', 'bg-emerald-500/10 text-emerald-500',
    'bg-cyan-500/10 text-cyan-500', 'bg-violet-500/10 text-violet-500', 'bg-amber-500/10 text-amber-500'];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"/>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="glass-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-transparent to-emerald-500/5"/>
        <div className="relative z-10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-content">Manage Doctors</h2>
            <p className="text-content-muted text-sm mt-1">All registered doctors in Medicare Hospital</p>
          </div>
          <div className="flex gap-3">
            <div className="text-center px-5 py-2.5 bg-surface border border-border rounded-xl">
              <p className="text-2xl font-bold text-content">{doctors.length}</p>
              <p className="text-xs text-content-muted">Total</p>
            </div>
            <div className="text-center px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-2xl font-bold text-emerald-500">{doctors.filter(d => d.isAvailable).length}</p>
              <p className="text-xs text-emerald-500/70">Available</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-content-muted">
          <Search size={16}/>
        </div>
        <input type="text" className="form-control pl-10 py-3" placeholder="Search by name or specialization..." value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-border/40 flex items-center justify-center mx-auto mb-4">
            <Stethoscope size={28} className="text-content-muted/50"/>
          </div>
          <p className="text-content font-semibold">{search ? 'No results found' : 'No doctors registered'}</p>
          <p className="text-content-muted text-sm mt-1">{search ? 'Try a different term.' : 'Doctors will appear after they register.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((doctor, i) => (
            <div
              key={doctor.id}
              onClick={() => setSelected(doctor)}
              className={`glass-card p-5 cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-200 animate-fade-in-up delay-${Math.min(i*50,300)}`}
            >
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {doctor.name?.charAt(0) || '?'}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-content">Dr. {doctor.name}</h4>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${specColors[i % specColors.length]}`}>
                    {doctor.specialization}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-background border border-border rounded-xl p-2.5 text-center">
                  <Award size={14} className="mx-auto text-amber-400 mb-1"/>
                  <p className="text-xs font-bold text-content">{doctor.qualification || 'N/A'}</p>
                  <p className="text-[10px] text-content-muted">Qualification</p>
                </div>
                <div className="bg-background border border-border rounded-xl p-2.5 text-center">
                  <Calendar size={14} className="mx-auto text-indigo-400 mb-1"/>
                  <p className="text-xs font-bold text-content">{doctor.experience || 'N/A'}</p>
                  <p className="text-[10px] text-content-muted">Experience</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-1.5 text-xs text-content-muted">
                  <Phone size={12} className="text-indigo-400"/>
                  {doctor.phone || 'N/A'}
                </div>
                <span className={`badge text-xs gap-1 ${doctor.isAvailable ? 'badge-emerald' : 'badge-red'}`}>
                  {doctor.isAvailable ? <CheckCircle2 size={11}/> : <XCircle size={11}/>}
                  {doctor.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelected(null)}>
          <div className="glass-card w-full max-w-md overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="h-24 bg-gradient-to-r from-sky-500/80 to-indigo-600/80 relative">
              <div className="absolute -bottom-7 left-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl border-4 border-surface shadow-xl">
                {selected.name?.charAt(0)}
              </div>
            </div>
            <div className="pt-12 px-6 pb-6">
              <h3 className="text-xl font-bold text-content">Dr. {selected.name}</h3>
              <p className="text-content-muted text-sm">{selected.specialization}</p>
              <div className="grid grid-cols-2 gap-3 mt-4 mb-5">
                {[
                  { label: 'Experience', value: selected.experience || 'N/A' },
                  { label: 'Qualification', value: selected.qualification || 'N/A' },
                  { label: 'Phone', value: selected.phone || 'N/A' },
                  { label: 'Available Days', value: selected.availableDays || 'Not set' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-background border border-border rounded-xl p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted">{label}</p>
                    <p className="text-sm font-semibold text-content mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mb-5">
                <div className={`w-3 h-3 rounded-full ${selected.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}/>
                <span className={`text-sm font-semibold ${selected.isAvailable ? 'text-emerald-500' : 'text-red-500'}`}>
                  {selected.isAvailable ? 'Currently Accepting Patients' : 'Not Available'}
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="btn btn-primary w-full">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
