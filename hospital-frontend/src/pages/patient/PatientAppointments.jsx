import React, { useState, useEffect } from 'react';
import { patientAPI } from '../../services/api';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight, Stethoscope } from 'lucide-react';

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

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [editingApp, setEditingApp] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      const apps = await patientAPI.getAppointments();
      setAppointments(apps || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (app) => {
    setEditingApp(app);
    setEditDate(app.appointmentDate || '');
    setEditTime(app.timeSlot || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await patientAPI.updateAppointment(editingApp.id, { appointmentDate: editDate, timeSlot: editTime });
      setEditingApp(null);
      fetchAppointments();
    } catch { alert('Failed to update appointment'); }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await patientAPI.updateAppointmentStatus(id, 'CANCELLED');
        fetchAppointments();
      } catch { alert('Failed to cancel appointment'); }
    }
  };

  const filters = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  const filtered = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* Header */}
      <div className="glass-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-indigo-500/5" />
        <div className="relative z-10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-content">My Appointments</h2>
            <p className="text-content-muted text-sm mt-1">Track and manage all your healthcare visits</p>
          </div>
          <div className="flex gap-3">
            {['PENDING', 'CONFIRMED', 'COMPLETED'].map(s => {
              const cnt = appointments.filter(a => a.status === s).length;
              const sc = statusConfig[s];
              return (
                <div key={s} className="text-center px-4 py-2 bg-surface border border-border rounded-xl">
                  <p className="text-xl font-bold text-content">{cnt}</p>
                  <p className={`text-xs font-semibold ${sc.cls.replace('badge-','text-')}`}>{sc.label}</p>
                </div>
              );
            })}
          </div>
        </div>
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
                : 'bg-surface border-border text-content-muted hover:text-content hover:border-primary/50'
            }`}
          >
            {f === 'ALL' ? `All (${appointments.length})` : `${statusConfig[f]?.label} (${appointments.filter(a=>a.status===f).length})`}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="glass-card overflow-hidden">
        {sorted.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-border/40 flex items-center justify-center mx-auto mb-4">
              <Calendar size={28} className="text-content-muted/50" />
            </div>
            <p className="text-content font-semibold">No appointments found</p>
            <p className="text-content-muted text-sm mt-1">
              {filter === 'ALL' ? 'Book your first appointment from the dashboard.' : `No ${statusConfig[filter]?.label} appointments.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-head">
                <tr>
                  <th>Date & Time</th>
                  <th>Doctor</th>
                  <th>Department</th>
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
                        <p className="text-xs text-content-muted flex items-center gap-1 mt-0.5">
                          <Clock size={11}/>{app.timeSlot || 'TBD'}
                        </p>
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-xs">
                            {app.doctor?.name?.charAt(0) || '?'}
                          </div>
                          <span className="font-medium text-content">Dr. {app.doctor?.name}</span>
                        </div>
                      </td>
                      <td className="text-content-muted">{app.doctor?.specialization || '—'}</td>
                      <td>
                        <p className="text-content-muted max-w-[160px] truncate">{app.symptoms || '—'}</p>
                      </td>
                      <td>
                        <span className={`badge ${sc.cls} flex items-center gap-1 w-fit`}>
                          {sc.icon}{sc.label}
                        </span>
                      </td>
                      <td className="text-right">
                        {app.status !== 'CANCELLED' && app.status !== 'COMPLETED' && (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEdit(app)} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                              Reschedule
                            </button>
                            <span className="text-border">|</span>
                            <button onClick={() => handleCancel(app.id)} className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors">
                              Cancel
                            </button>
                          </div>
                        )}
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
              <div className="icon-box bg-indigo-500/10 text-indigo-500"><Calendar size={18}/></div>
              <div>
                <h3 className="font-bold text-content">Reschedule Appointment</h3>
                <p className="text-xs text-content-muted">Dr. {editingApp.doctor?.name}</p>
              </div>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="form-label">New Date</label>
                <input type="date" className="form-control" value={editDate} onChange={e => setEditDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required/>
              </div>
              <div>
                <label className="form-label">New Time Slot</label>
                <select className="form-control" value={editTime} onChange={e => setEditTime(e.target.value)} required>
                  <option value="">-- Select Time --</option>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingApp(null)} className="btn btn-outline flex-1">Close</button>
                <button type="submit" className="btn btn-primary flex-1">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
