import React, { useState, useEffect, useMemo } from 'react';
import { adminAPI } from '../../services/api';
import { Users, Activity, FileText, Edit2, XCircle, X, Eye, Calendar as CalendarIcon, Stethoscope, TrendingUp, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';

const TIME_SLOTS = [
  "09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "12:00 PM","12:30 PM","01:00 PM","01:30 PM","02:00 PM","02:30 PM",
  "03:00 PM","03:30 PM","04:00 PM","04:30 PM","05:00 PM"
];

const statusConfig = {
  PENDING:   { label: 'Pending',   cls: 'badge-amber' },
  CONFIRMED: { label: 'Confirmed', cls: 'badge-sky' },
  COMPLETED: { label: 'Completed', cls: 'badge-emerald' },
  CANCELLED: { label: 'Cancelled', cls: 'badge-red' },
};

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'];

const AdminDashboard = () => {
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0 });
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingApp, setEditingApp] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [viewingPatient, setViewingPatient] = useState(null);
  const [viewingDoctor, setViewingDoctor] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [docs, pats, apps, pData] = await Promise.all([
        adminAPI.getDoctors().catch(() => []),
        adminAPI.getPatients().catch(() => []),
        adminAPI.getAppointments().catch(() => []),
        adminAPI.getPrescriptions().catch(() => []),
      ]);
      setStats({ doctors: docs?.length || 0, patients: pats?.length || 0, appointments: apps?.length || 0 });
      setAppointments(apps || []);
      setPatients(pats || []);
      setPrescriptions(pData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthly = {};
    months.forEach(m => monthly[m] = { name: m, appointments: 0 });

    appointments.forEach(app => {
      if (app.appointmentDate) {
        const m = months[new Date(app.appointmentDate).getMonth()];
        if (monthly[m]) monthly[m].appointments++;
      }
    });

    const genderStats = {};
    patients.forEach(p => {
      const g = p.gender || 'Unknown';
      genderStats[g] = (genderStats[g] || 0) + 1;
    });
    const genderData = Object.entries(genderStats).map(([name, value]) => ({ name, value }));

    const isMock = appointments.length === 0 && patients.length === 0;
    return {
      isMock,
      monthlyData: isMock
        ? [{ name: 'Jan', appointments: 12 }, { name: 'Feb', appointments: 19 }, { name: 'Mar', appointments: 15 },
           { name: 'Apr', appointments: 25 }, { name: 'May', appointments: 22 }, { name: 'Jun', appointments: 30 }]
        : Object.values(monthly),
      genderData: isMock
        ? [{ name: 'Male', value: 45 }, { name: 'Female', value: 50 }, { name: 'Other', value: 5 }]
        : genderData,
    };
  }, [appointments, patients]);

  const sparklines = [
    [{ v:10 },{ v:25 },{ v:15 },{ v:40 },{ v:30 },{ v:50 }],
    [{ v:5  },{ v:15 },{ v:25 },{ v:20 },{ v:45 },{ v:35 }],
    [{ v:20 },{ v:10 },{ v:35 },{ v:25 },{ v:55 },{ v:60 }],
    [{ v:8  },{ v:18 },{ v:30 },{ v:22 },{ v:40 },{ v:55 }],
  ];

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try { await adminAPI.updateAppointmentStatus(id, 'CANCELLED'); fetchAll(); }
    catch { alert('Failed to cancel'); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateAppointment(editingApp.id, { appointmentDate: editDate, timeSlot: editTime });
      setEditingApp(null); fetchAll();
    } catch { alert('Failed to update'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
          <Activity size={24} className="text-primary"/>
        </div>
        <p className="text-content-muted text-sm">Loading hospital data...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* Hero Banner */}
      <div className="glass-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-secondary/10" />
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative z-10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">System Online</span>
            </div>
            <h2 className="text-2xl font-bold text-content">Hospital Overview</h2>
            <p className="text-content-muted text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-surface border border-border px-4 py-2 rounded-xl text-sm font-medium text-content">
            <CalendarIcon size={16} className="text-primary"/>
            Admin Dashboard
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Doctors',   value: stats.doctors,      color: 'text-indigo-500', spark: sparklines[0], scolor: '#6366f1' },
          { label: 'Total Patients',  value: stats.patients,     color: 'text-cyan-500',   spark: sparklines[1], scolor: '#0ea5e9' },
          { label: 'Appointments',    value: stats.appointments, color: 'text-emerald-500', spark: sparklines[2], scolor: '#10b981' },
          { label: 'Prescriptions',   value: prescriptions.length, color: 'text-violet-500', spark: sparklines[3], scolor: '#7c3aed' },
        ].map((s, i) => (
          <div key={i} className={`stat-card animate-fade-in-up delay-${i*50}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-content-muted uppercase tracking-wider">{s.label}</p>
                <p className={`text-4xl font-bold ${s.color} mt-1`}>{s.value}</p>
              </div>
            </div>
            <div className="h-10 -mx-1 opacity-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={s.spark}>
                  <Area type="monotone" dataKey="v" stroke={s.scolor} fill={s.scolor} fillOpacity={0.15} strokeWidth={2} dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-bold text-content">Appointments Trend</h3>
              <p className="text-xs text-content-muted mt-0.5">Monthly appointment volume</p>
            </div>
            {chartData.isMock && <span className="badge badge-amber text-[10px]">Sample</span>}
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.monthlyData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false}/>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false}/>
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false}/>
                <RechartsTooltip
                  contentStyle={{ backgroundColor:'var(--bg-surface)', border:'1px solid var(--border-color)', borderRadius:'12px', fontSize:'12px', color:'var(--text-main)' }}
                  cursor={{ fill: 'rgba(99,102,241,0.05)' }}
                />
                <Bar dataKey="appointments" fill="#6366f1" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-bold text-content">Patient Demographics</h3>
              <p className="text-xs text-content-muted mt-0.5">Gender distribution</p>
            </div>
            {chartData.isMock && <span className="badge badge-amber text-[10px]">Sample</span>}
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData.genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                  {chartData.genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor:'var(--bg-surface)', border:'1px solid var(--border-color)', borderRadius:'12px', fontSize:'12px', color:'var(--text-main)' }}/>
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(v) => <span style={{fontSize:'11px', color:'var(--text-muted)'}}>{v}</span>}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="glass-card overflow-hidden">
        <div className="section-header border-b border-border">
          <div className="icon-box bg-indigo-500/10 text-indigo-500"><CalendarIcon size={18}/></div>
          <div className="flex-1">
            <h3 className="font-bold text-content text-sm">Manage Appointments</h3>
            <p className="text-xs text-content-muted">Click the eye icon to view patient prescriptions</p>
          </div>
          <span className="badge badge-indigo">{appointments.length} total</span>
        </div>
        {appointments.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-border/40 flex items-center justify-center mx-auto mb-4">
              <CalendarIcon size={28} className="text-content-muted/50"/>
            </div>
            <p className="text-content font-semibold">No appointments yet</p>
            <p className="text-content-muted text-sm mt-1">Wait for patients to book appointments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-head">
                <tr>
                  <th>ID</th><th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Status</th><th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {[...appointments].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(app => {
                  const sc = statusConfig[app.status] || statusConfig.PENDING;
                  return (
                    <tr key={app.id}>
                      <td className="text-content-muted text-xs">#{app.id}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-content">{app.patient?.name || 'Unknown'}</span>
                          {app.patient && (
                            <button onClick={() => setViewingPatient(app.patient)} className="text-indigo-400 hover:text-indigo-300 transition-colors" title="View Patient">
                              <Eye size={14}/>
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="text-content">{app.doctor?.name || 'Unknown'}</span>
                          {app.doctor && (
                            <button onClick={() => setViewingDoctor(app.doctor)} className="text-emerald-400 hover:text-emerald-300 transition-colors" title="View Doctor">
                              <Eye size={14}/>
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <p className="font-medium text-content">{app.appointmentDate}</p>
                        <p className="text-xs text-content-muted">{app.timeSlot || 'TBD'}</p>
                      </td>
                      <td><span className={`badge ${sc.cls}`}>{sc.label}</span></td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          {app.status !== 'CANCELLED' && app.status !== 'COMPLETED' && (
                            <>
                              <button onClick={() => { setEditingApp(app); setEditDate(app.appointmentDate); setEditTime(app.timeSlot); }} className="p-1.5 rounded-lg text-content-muted hover:text-sky-400 hover:bg-sky-400/10 transition-colors" title="Reschedule">
                                <Edit2 size={14}/>
                              </button>
                              <button onClick={() => handleCancel(app.id)} className="p-1.5 rounded-lg text-content-muted hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Cancel">
                                <XCircle size={14}/>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md overflow-hidden animate-scale-in">
            <div className="section-header border-b border-border">
              <div className="icon-box bg-sky-500/10 text-sky-500"><CalendarIcon size={18}/></div>
              <div className="flex-1">
                <h3 className="font-bold text-content">Reschedule Appointment</h3>
                <p className="text-xs text-content-muted">#{editingApp.id} · {editingApp.patient?.name}</p>
              </div>
              <button onClick={() => setEditingApp(null)} className="text-content-muted hover:text-content p-1.5 rounded-lg hover:bg-border/40"><X size={16}/></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="form-label">New Date</label>
                <input type="date" className="form-control" value={editDate} min={new Date().toISOString().split('T')[0]} onChange={e => setEditDate(e.target.value)} required/>
              </div>
              <div>
                <label className="form-label">New Time</label>
                <select className="form-control" value={editTime} onChange={e => setEditTime(e.target.value)} required>
                  <option value="">-- Select Time --</option>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingApp(null)} className="btn btn-outline flex-1">Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Modal */}
      {viewingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setViewingPatient(null)}>
          <div className="glass-card w-full max-w-lg overflow-hidden animate-scale-in max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="h-20 bg-gradient-to-r from-indigo-500/70 to-violet-600/70 relative flex-shrink-0">
              <div className="absolute -bottom-6 left-6 w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl border-4 border-surface shadow-xl">
                {viewingPatient.name?.charAt(0)}
              </div>
            </div>
            <div className="pt-10 px-6 pb-2 flex-shrink-0">
              <h3 className="text-xl font-bold text-content">{viewingPatient.name}</h3>
              <p className="text-content-muted text-sm">Patient ID #{viewingPatient.id}</p>
            </div>
            <div className="px-6 pb-4 flex-shrink-0">
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { label: 'Blood Group', value: viewingPatient.bloodGroup || 'N/A' },
                  { label: 'Date of Birth', value: viewingPatient.dob || 'N/A' },
                  { label: 'Gender', value: viewingPatient.gender || 'N/A' },
                  { label: 'Phone', value: viewingPatient.phone || 'N/A' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-background border border-border rounded-xl p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted">{label}</p>
                    <p className="text-sm font-semibold text-content mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border flex-1 overflow-y-auto px-6 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-content-muted mb-3">
                Prescription History ({prescriptions.filter(p => p.patient?.id === viewingPatient.id).length})
              </p>
              {prescriptions.filter(p => p.patient?.id === viewingPatient.id).length === 0 ? (
                <p className="text-content-muted text-sm text-center py-6">No prescriptions found for this patient.</p>
              ) : (
                <div className="space-y-3">
                  {[...prescriptions].filter(p => p.patient?.id === viewingPatient.id)
                    .sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt))
                    .map((p, idx) => (
                      <div key={`${p.id}-${idx}`} className="bg-background border border-border rounded-xl p-3.5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-content">{new Date(p.issuedAt).toLocaleDateString()}</span>
                          <span className="text-xs text-content-muted">Dr. {p.doctor?.name}</span>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted">Diagnosis</p>
                        <p className="text-sm font-semibold text-content mb-1.5">{p.diagnosis}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted">Medicines</p>
                        <p className="text-xs text-content-muted whitespace-pre-wrap">{p.medicines}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border flex-shrink-0">
              <button onClick={() => setViewingPatient(null)} className="btn btn-primary w-full">Close Window</button>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Modal */}
      {viewingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setViewingDoctor(null)}>
          <div className="glass-card w-full max-w-md overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="h-16 bg-gradient-to-r from-emerald-500/70 to-teal-600/70 flex items-center px-6 gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold">
                {viewingDoctor.name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-white">Dr. {viewingDoctor.name}</h3>
                <p className="text-emerald-100 text-xs">{viewingDoctor.specialization}</p>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Experience', value: viewingDoctor.experience || 'N/A' },
                  { label: 'Qualification', value: viewingDoctor.qualification || 'N/A' },
                  { label: 'Phone', value: viewingDoctor.phone || 'N/A' },
                  { label: 'Available', value: viewingDoctor.isAvailable ? '✓ Yes' : '✗ No' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-background border border-border rounded-xl p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted">{label}</p>
                    <p className="text-sm font-semibold text-content mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setViewingDoctor(null)} className="btn btn-primary w-full">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
