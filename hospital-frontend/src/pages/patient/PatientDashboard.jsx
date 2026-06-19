import React, { useState, useEffect } from 'react';
import { patientAPI } from '../../services/api';
import { PlusCircle, Calendar, FileText, Activity, HeartPulse, Clock, CheckCircle2, XCircle, Stethoscope, TrendingUp } from 'lucide-react';

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

const PatientDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [time, setTime] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [docs, apps, pData] = await Promise.all([
        patientAPI.getAvailableDoctors().catch(() => []),
        patientAPI.getAppointments().catch(() => []),
        patientAPI.getPrescriptions().catch(() => [])
      ]);
      setDoctors(docs || []);
      setAppointments(apps || []);
      setPrescriptions(pData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      await patientAPI.bookAppointment({ doctorId, appointmentDate: date, timeSlot: time, symptoms });
      setDoctorId(''); setDate(''); setTime(''); setSymptoms('');
      setSuccess('Appointment booked successfully!');
      setTimeout(() => setSuccess(''), 4000);
      fetchData();
    } catch {
      alert('Failed to book appointment. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const upcoming = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING');
  const completed = appointments.filter(a => a.status === 'COMPLETED');
  const recentPrescriptions = [...prescriptions].sort((a,b) => new Date(b.issuedAt) - new Date(a.issuedAt)).slice(0, 3);
  const recentAppointments = [...appointments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
          <HeartPulse size={24} className="text-primary" />
        </div>
        <p className="text-content-muted text-sm">Loading your health dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* Hero */}
      <div className="glass-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-transparent to-cyan-500/10" />
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl" />
        <div className="relative z-10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Active Patient</span>
            </div>
            <h2 className="text-2xl font-bold text-content">Hello, welcome back! 👋</h2>
            <p className="text-content-muted text-sm mt-1">Your health dashboard is up to date. Book appointments or review your medical history below.</p>
          </div>
          <div className="flex gap-3">
            <div className="text-center px-4 py-2.5 bg-surface border border-border rounded-xl">
              <p className="text-2xl font-bold text-content">{upcoming.length}</p>
              <p className="text-xs text-content-muted">Upcoming</p>
            </div>
            <div className="text-center px-4 py-2.5 bg-surface border border-border rounded-xl">
              <p className="text-2xl font-bold text-content">{prescriptions.length}</p>
              <p className="text-xs text-content-muted">Prescriptions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Appointments', value: appointments.length, icon: <Calendar size={20}/>, color: 'bg-cyan-500/10 text-cyan-500', ring: 'group-hover:shadow-cyan-500/10' },
          { label: 'Upcoming Visits',    value: upcoming.length,      icon: <Clock size={20}/>,    color: 'bg-indigo-500/10 text-indigo-500', ring: 'group-hover:shadow-indigo-500/10' },
          { label: 'Completed',          value: completed.length,     icon: <CheckCircle2 size={20}/>, color: 'bg-emerald-500/10 text-emerald-500', ring: 'group-hover:shadow-emerald-500/10' },
          { label: 'Prescriptions',      value: prescriptions.length, icon: <FileText size={20}/>, color: 'bg-violet-500/10 text-violet-500', ring: 'group-hover:shadow-violet-500/10' },
        ].map((s, i) => (
          <div key={i} className={`stat-card hover:shadow-xl ${s.ring} animate-fade-in-up delay-${(i+1)*50}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-content-muted uppercase tracking-wider">{s.label}</p>
                <p className="text-3xl font-bold text-content mt-1">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Book Appointment */}
        <div className="xl:col-span-2 glass-card overflow-hidden animate-fade-in-up delay-100">
          <div className="section-header">
            <div className="icon-box bg-primary/10 text-primary"><PlusCircle size={18}/></div>
            <div>
              <h3 className="font-bold text-content text-sm">Book Appointment</h3>
              <p className="text-xs text-content-muted">Schedule a new visit</p>
            </div>
          </div>
          <div className="p-5">
            {success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm flex items-center gap-2">
                <CheckCircle2 size={16}/> {success}
              </div>
            )}
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="form-label">Select Doctor</label>
                <select className="form-control" value={doctorId} onChange={e => setDoctorId(e.target.value)} required>
                  <option value="">-- Choose a Doctor --</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>Dr. {doc.name} ({doc.specialization})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required/>
                </div>
                <div>
                  <label className="form-label">Time</label>
                  <select className="form-control" value={time} onChange={e => setTime(e.target.value)} required>
                    <option value="">-- Time --</option>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Symptoms / Reason</label>
                <textarea className="form-control" rows="3" value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="Briefly describe your symptoms..." required/>
              </div>
              <button type="submit" className="btn btn-primary w-full py-2.5" disabled={bookingLoading}>
                {bookingLoading ? 'Booking...' : 'Book Appointment'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column */}
        <div className="xl:col-span-3 space-y-6">

          {/* Recent Appointments */}
          <div className="glass-card overflow-hidden animate-fade-in-up delay-150">
            <div className="section-header">
              <div className="icon-box bg-cyan-500/10 text-cyan-500"><Calendar size={18}/></div>
              <div className="flex-1">
                <h3 className="font-bold text-content text-sm">Recent Appointments</h3>
                <p className="text-xs text-content-muted">Your latest visits and bookings</p>
              </div>
            </div>
            <div className="divide-y divide-border/50">
              {recentAppointments.length === 0 ? (
                <div className="py-10 text-center">
                  <Calendar size={32} className="mx-auto text-content-muted/30 mb-2"/>
                  <p className="text-content-muted text-sm">No appointments yet. Book your first visit!</p>
                </div>
              ) : recentAppointments.map(app => {
                const sc = statusConfig[app.status] || statusConfig.PENDING;
                return (
                  <div key={app.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-primary/5 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-sm flex-shrink-0">
                      {app.doctor?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-content truncate">Dr. {app.doctor?.name}</p>
                      <p className="text-xs text-content-muted">{app.doctor?.specialization} · {app.appointmentDate}</p>
                    </div>
                    <span className={`badge ${sc.cls} whitespace-nowrap`}>{sc.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Prescriptions */}
          <div className="glass-card overflow-hidden animate-fade-in-up delay-200">
            <div className="section-header">
              <div className="icon-box bg-emerald-500/10 text-emerald-500"><FileText size={18}/></div>
              <div className="flex-1">
                <h3 className="font-bold text-content text-sm">Recent Prescriptions</h3>
                <p className="text-xs text-content-muted">Your latest medication records</p>
              </div>
            </div>
            {recentPrescriptions.length === 0 ? (
              <div className="py-10 text-center">
                <FileText size={32} className="mx-auto text-content-muted/30 mb-2"/>
                <p className="text-content-muted text-sm">No prescriptions found yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {recentPrescriptions.map((p, i) => (
                  <div key={`${p.id}-${i}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-primary/5 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                      <FileText size={16}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-content truncate">{p.diagnosis}</p>
                      <p className="text-xs text-content-muted">Dr. {p.doctor?.name} · {new Date(p.issuedAt).toLocaleDateString()}</p>
                    </div>
                    <span className="badge badge-emerald">View</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Health Tips */}
          <div className="glass-card overflow-hidden animate-fade-in-up delay-300">
            <div className="section-header">
              <div className="icon-box bg-violet-500/10 text-violet-500"><HeartPulse size={18}/></div>
              <div><h3 className="font-bold text-content text-sm">Health Tips</h3></div>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { emoji: '⏰', title: 'Arrive Early', tip: 'Come 15 minutes before your appointment for smooth check-in.' },
                { emoji: '📋', title: 'Bring Records', tip: 'Carry any previous medical reports or test results.' },
                { emoji: '💊', title: 'Take Medicines', tip: 'Follow prescriptions strictly. Download them from the Prescriptions page.' },
              ].map((tip, i) => (
                <div key={i} className="bg-background border border-border rounded-xl p-3.5">
                  <p className="text-2xl mb-2">{tip.emoji}</p>
                  <p className="text-sm font-semibold text-content mb-1">{tip.title}</p>
                  <p className="text-xs text-content-muted leading-relaxed">{tip.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
