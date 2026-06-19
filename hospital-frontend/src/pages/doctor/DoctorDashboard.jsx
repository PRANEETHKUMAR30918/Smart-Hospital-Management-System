import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../../services/api';
import { Calendar, CheckCircle2, Clock, FilePlus, Stethoscope, Users, FileText, XCircle, AlertCircle, Edit2, X } from 'lucide-react';

const TIME_SLOTS = [
  "09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "12:00 PM","12:30 PM","01:00 PM","01:30 PM","02:00 PM","02:30 PM",
  "03:00 PM","03:30 PM","04:00 PM","04:30 PM","05:00 PM"
];

const statusConfig = {
  PENDING:   { label: 'Pending',   cls: 'badge-amber',   icon: <AlertCircle size={12}/> },
  CONFIRMED: { label: 'Confirmed', cls: 'badge-sky',     icon: <Clock size={12}/> },
  COMPLETED: { label: 'Completed', cls: 'badge-emerald', icon: <CheckCircle2 size={12}/> },
  CANCELLED: { label: 'Cancelled', cls: 'badge-red',     icon: <XCircle size={12}/> },
};

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const [editingApp, setEditingApp] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');

  const [viewingPatient, setViewingPatient] = useState(null);
  const [prescribingApp, setPrescribingApp] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState('');
  const [instructions, setInstructions] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [prescribeSuccess, setPrescribeSuccess] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [apps, pData] = await Promise.all([
        doctorAPI.getAppointments().catch(() => []),
        doctorAPI.getPrescriptions().catch(() => []),
      ]);
      setAppointments(apps || []);
      setPrescriptions(pData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try { await doctorAPI.updateAppointmentStatus(id, status); fetchAll(); }
    catch (e) { console.error(e); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await doctorAPI.updateAppointment(editingApp.id, { appointmentDate: editDate, timeSlot: editTime });
      setEditingApp(null);
      fetchAll();
    } catch { alert('Failed to reschedule'); }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Cancel this appointment?')) {
      try { await doctorAPI.updateAppointmentStatus(id, 'CANCELLED'); fetchAll(); }
      catch { alert('Failed to cancel'); }
    }
  };

  const handleOpenPrescribe = (app) => {
    setDiagnosis(''); setMedicines(''); setInstructions(''); setFollowUpDate('');
    setPrescribeSuccess(false);
    setPrescribingApp(app);
  };

  const handlePrescribe = async (e) => {
    e.preventDefault();
    try {
      await doctorAPI.createPrescription({
        appointmentId: prescribingApp.id,
        patientId: prescribingApp.patient?.id,
        diagnosis, medicines, instructions, followUpDate
      });
      setPrescribeSuccess(true);
      fetchAll();
      setTimeout(() => { setPrescribingApp(null); setPrescribeSuccess(false); }, 1800);
    } catch { alert('Failed to save prescription'); }
  };

  const pending = appointments.filter(a => a.status === 'PENDING');
  const confirmed = appointments.filter(a => a.status === 'CONFIRMED');
  const completed = appointments.filter(a => a.status === 'COMPLETED');

  const filters = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  const filtered = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center animate-pulse">
          <Stethoscope size={24} className="text-indigo-500"/>
        </div>
        <p className="text-content-muted text-sm">Loading your appointments...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* Hero */}
      <div className="glass-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-transparent to-violet-500/10" />
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-indigo-400/10 rounded-full blur-2xl" />
        <div className="relative z-10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"/>
              <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">On Duty</span>
            </div>
            <h2 className="text-2xl font-bold text-content">Welcome, Doctor! 👨‍⚕️</h2>
            <p className="text-content-muted text-sm mt-1">Manage your appointments, write prescriptions, and track patient history.</p>
          </div>
          <div className="flex gap-3">
            {[
              { label: 'Pending',   value: pending.length,   color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
              { label: 'Confirmed', value: confirmed.length, color: 'text-sky-500',    bg: 'bg-sky-500/10 border-sky-500/20' },
              { label: 'Completed', value: completed.length, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            ].map(s => (
              <div key={s.label} className={`text-center px-4 py-2.5 border rounded-xl ${s.bg}`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className={`text-xs font-semibold ${s.color}/80`}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats mini row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Patients', value: new Set(appointments.map(a => a.patient?.id)).size, icon: <Users size={18}/>, color: 'bg-cyan-500/10 text-cyan-500' },
          { label: 'Prescriptions', value: prescriptions.length, icon: <FileText size={18}/>, color: 'bg-emerald-500/10 text-emerald-500' },
          { label: 'Total Appointments', value: appointments.length, icon: <Calendar size={18}/>, color: 'bg-indigo-500/10 text-indigo-500' },
        ].map((s, i) => (
          <div key={i} className="stat-card animate-fade-in-up" style={{animationDelay: `${i*80}ms`}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-content-muted uppercase tracking-wider">{s.label}</p>
                <p className="text-3xl font-bold text-content mt-1">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filter === f
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25'
                : 'bg-surface border-border text-content-muted hover:text-content'
            }`}
          >
            {f === 'ALL' ? `All (${appointments.length})` : `${statusConfig[f]?.label} (${appointments.filter(a=>a.status===f).length})`}
          </button>
        ))}
      </div>

      {/* Appointments Table */}
      <div className="glass-card overflow-hidden">
        <div className="section-header border-b border-border">
          <div className="icon-box bg-indigo-500/10 text-indigo-500"><Calendar size={18}/></div>
          <div>
            <h3 className="font-bold text-content text-sm">Appointments</h3>
            <p className="text-xs text-content-muted">Click "View History" to see a patient's full prescription timeline</p>
          </div>
        </div>
        {sorted.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-border/40 flex items-center justify-center mx-auto mb-4">
              <Calendar size={28} className="text-content-muted/50"/>
            </div>
            <p className="text-content font-semibold">No appointments found</p>
            <p className="text-content-muted text-sm mt-1">Patients will appear here once they book appointments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-head">
                <tr>
                  <th>Date & Time</th>
                  <th>Patient</th>
                  <th>Symptoms</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {sorted.map(app => {
                  const sc = statusConfig[app.status] || statusConfig.PENDING;
                  return (
                    <tr key={app.id}>
                      <td>
                        <p className="font-semibold text-content">{app.appointmentDate}</p>
                        <p className="text-xs text-content-muted flex items-center gap-1">
                          <Clock size={11}/>{app.timeSlot || 'TBD'}
                        </p>
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-xs">
                            {app.patient?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-content text-sm">{app.patient?.name}</p>
                            <button onClick={() => setViewingPatient(app.patient)} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                              View History
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="text-content-muted text-sm max-w-[160px] truncate">{app.symptoms || '—'}</p>
                      </td>
                      <td>
                        <span className={`badge ${sc.cls} flex items-center gap-1 w-fit`}>
                          {sc.icon}{sc.label}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {app.status === 'PENDING' && (
                            <button onClick={() => handleStatusChange(app.id, 'CONFIRMED')} className="btn bg-sky-500/10 text-sky-500 border border-sky-500/20 hover:bg-sky-500/20 text-xs py-1 px-3">
                              Confirm
                            </button>
                          )}
                          {app.status === 'CONFIRMED' && (
                            <button onClick={() => handleStatusChange(app.id, 'COMPLETED')} className="btn bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs py-1 px-3 gap-1">
                              <CheckCircle2 size={12}/> Complete
                            </button>
                          )}
                          {(app.status === 'CONFIRMED' || app.status === 'COMPLETED') && (
                            <button onClick={() => handleOpenPrescribe(app)} className="btn btn-primary text-xs py-1 px-3 gap-1">
                              <FilePlus size={12}/> Prescribe
                            </button>
                          )}
                          {app.status !== 'CANCELLED' && app.status !== 'COMPLETED' && (
                            <>
                              <button onClick={() => { setEditingApp(app); setEditDate(app.appointmentDate); setEditTime(app.timeSlot); }} className="p-1.5 rounded-lg text-content-muted hover:text-sky-400 hover:bg-sky-400/10 transition-colors" title="Reschedule">
                                <Edit2 size={14}/>
                              </button>
                              <button onClick={() => handleCancel(app.id)} className="p-1.5 rounded-lg text-content-muted hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Cancel">
                                <X size={14}/>
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

      {/* Reschedule Modal */}
      {editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md overflow-hidden animate-scale-in">
            <div className="section-header border-b border-border">
              <div className="icon-box bg-sky-500/10 text-sky-500"><Calendar size={18}/></div>
              <div>
                <h3 className="font-bold text-content">Reschedule Appointment</h3>
                <p className="text-xs text-content-muted">{editingApp.patient?.name}</p>
              </div>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
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
                <button type="submit" className="btn btn-primary flex-1">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {prescribingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="section-header border-b border-border">
              <div className="icon-box bg-emerald-500/10 text-emerald-500"><FilePlus size={18}/></div>
              <div>
                <h3 className="font-bold text-content">Write Prescription</h3>
                <p className="text-xs text-content-muted">For: {prescribingApp.patient?.name} · {prescribingApp.appointmentDate}</p>
              </div>
            </div>
            {prescribeSuccess ? (
              <div className="p-12 text-center">
                <CheckCircle2 size={56} className="mx-auto text-emerald-500 mb-3"/>
                <p className="text-content font-bold text-xl">Prescription Saved!</p>
                <p className="text-content-muted text-sm mt-1">The patient will see it immediately.</p>
              </div>
            ) : (
              <form onSubmit={handlePrescribe} className="p-6 space-y-4">
                <div>
                  <label className="form-label">Diagnosis</label>
                  <input type="text" className="form-control" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Primary diagnosis" required/>
                </div>
                <div>
                  <label className="form-label">Medicines & Dosage</label>
                  <textarea className="form-control" rows="4" value={medicines} onChange={e => setMedicines(e.target.value)} placeholder="e.g. Paracetamol 500mg - 1 tab thrice daily for 5 days" required/>
                </div>
                <div>
                  <label className="form-label">Special Instructions</label>
                  <textarea className="form-control" rows="2" value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="e.g. Take after food, Avoid alcohol..."/>
                </div>
                <div>
                  <label className="form-label">Follow-up Date (Optional)</label>
                  <input type="date" className="form-control" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} min={new Date().toISOString().split('T')[0]}/>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setPrescribingApp(null)} className="btn btn-outline flex-1">Cancel</button>
                  <button type="submit" className="btn btn-primary flex-1">Save Prescription</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Patient History Modal */}
      {viewingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setViewingPatient(null)}>
          <div className="glass-card w-full max-w-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="section-header border-b border-border flex-shrink-0">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                {viewingPatient.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-content">{viewingPatient.name}</h3>
                <p className="text-xs text-content-muted">Blood: {viewingPatient.bloodGroup || 'N/A'} · {viewingPatient.gender || 'N/A'} · DOB: {viewingPatient.dob || 'N/A'}</p>
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-content-muted mb-4">
                Prescription History ({prescriptions.filter(p => p.patient?.id === viewingPatient.id).length} records)
              </p>
              {prescriptions.filter(p => p.patient?.id === viewingPatient.id).length === 0 ? (
                <div className="py-8 text-center">
                  <FileText size={32} className="mx-auto text-content-muted/30 mb-2"/>
                  <p className="text-content-muted text-sm">No prescriptions for this patient yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[...prescriptions]
                    .filter(p => p.patient?.id === viewingPatient.id)
                    .sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt))
                    .map((p, index) => (
                      <div key={`${p.id}-${index}`} className="bg-background border border-border rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3 pb-2 border-b border-border">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"/>
                            <span className="text-sm font-bold text-content">{new Date(p.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-content-muted">{new Date(p.issuedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                          </div>
                        </div>
                        <div className="space-y-2.5">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted">Diagnosis</p>
                            <p className="text-sm font-semibold text-content">{p.diagnosis}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted">Medicines</p>
                            <p className="text-sm text-content whitespace-pre-wrap bg-surface border border-border rounded-lg px-3 py-2 mt-1">{p.medicines}</p>
                          </div>
                          {p.instructions && (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted">Instructions</p>
                              <p className="text-sm text-content-muted">{p.instructions}</p>
                            </div>
                          )}
                        </div>
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
    </div>
  );
};

export default DoctorDashboard;
