import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../../services/api';
import { FileText, Edit, Search, User, Clock, CheckCircle2 } from 'lucide-react';

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [viewingPrescription, setViewingPrescription] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState('');
  const [instructions, setInstructions] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => { fetchPrescriptions(); }, []);

  const fetchPrescriptions = async () => {
    try {
      const data = await doctorAPI.getPrescriptions();
      setPrescriptions(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p) => {
    setEditingPrescription(p);
    setDiagnosis(p.diagnosis || '');
    setMedicines(p.medicines || '');
    setInstructions(p.instructions || '');
    setSaveSuccess(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await doctorAPI.updatePrescription(editingPrescription.id, { diagnosis, medicines, instructions });
      setSaveSuccess(true);
      fetchPrescriptions();
      setTimeout(() => { setEditingPrescription(null); setSaveSuccess(false); }, 1500);
    } catch {
      alert('Failed to update prescription');
    }
  };

  const sorted = [...prescriptions]
    .sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt))
    .filter(p =>
      p.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.diagnosis?.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="glass-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-violet-500/5" />
        <div className="relative z-10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-content">Prescriptions Written</h2>
            <p className="text-content-muted text-sm mt-1">Review and edit all prescriptions you've issued</p>
          </div>
          <div className="text-center px-5 py-2.5 bg-surface border border-border rounded-xl">
            <p className="text-2xl font-bold text-content">{prescriptions.length}</p>
            <p className="text-xs text-content-muted">Total Issued</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-content-muted">
          <Search size={16}/>
        </div>
        <input
          type="text"
          className="form-control pl-10 py-3"
          placeholder="Search by patient name or diagnosis..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Prescriptions Grid */}
      {sorted.length === 0 ? (
        <div className="glass-card py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-border/40 flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-content-muted/50"/>
          </div>
          <p className="text-content font-semibold">{search ? 'No results found' : 'No prescriptions yet'}</p>
          <p className="text-content-muted text-sm mt-1">{search ? 'Try a different search.' : 'Write prescriptions from the Appointments page.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {sorted.map((p, i) => (
            <div key={`${p.id}-${i}`} className={`glass-card p-5 flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-200 animate-fade-in-up delay-${Math.min(i*50,300)}`}>
              {/* Card Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                  {p.patient?.name?.charAt(0) || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-content truncate">{p.patient?.name}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock size={11} className="text-content-muted"/>
                    <span className="text-xs text-content-muted">{new Date(p.issuedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-3 mb-4">
                <div className="bg-background border border-border rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted mb-1">Diagnosis</p>
                  <p className="text-sm text-content font-medium line-clamp-2">{p.diagnosis || '—'}</p>
                </div>
                <div className="bg-background border border-border rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted mb-1">Medicines</p>
                  <p className="text-sm text-content-muted line-clamp-3">{p.medicines || '—'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-border">
                <button onClick={() => setViewingPrescription(p)} className="btn btn-outline flex-1 text-xs py-1.5">
                  View
                </button>
                <button onClick={() => handleEdit(p)} className="btn btn-primary flex-1 text-xs py-1.5 gap-1">
                  <Edit size={12}/> Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {viewingPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setViewingPrescription(null)}>
          <div className="glass-card w-full max-w-md overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="section-header border-b border-border">
              <div className="icon-box bg-indigo-500/10 text-indigo-500"><FileText size={18}/></div>
              <div className="flex-1">
                <h3 className="font-bold text-content">Prescription Details</h3>
                <p className="text-xs text-content-muted">Patient: {viewingPrescription.patient?.name}</p>
              </div>
              <span className="text-xs text-content-muted">{new Date(viewingPrescription.issuedAt).toLocaleDateString()}</span>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Diagnosis', value: viewingPrescription.diagnosis },
                { label: 'Medicines', value: viewingPrescription.medicines, pre: true },
                ...(viewingPrescription.instructions ? [{ label: 'Special Instructions', value: viewingPrescription.instructions }] : []),
              ].map(({ label, value, pre }) => (
                <div key={label}>
                  <p className="form-label">{label}</p>
                  <div className={`bg-background border border-border rounded-xl p-3 text-sm text-content ${pre ? 'whitespace-pre-wrap' : ''}`}>{value || '—'}</div>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setViewingPrescription(null)} className="btn btn-outline flex-1">Close</button>
                <button onClick={() => { handleEdit(viewingPrescription); setViewingPrescription(null); }} className="btn btn-primary flex-1">
                  <Edit size={14}/> Edit This
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md overflow-hidden animate-scale-in">
            <div className="section-header border-b border-border">
              <div className="icon-box bg-indigo-500/10 text-indigo-500"><Edit size={18}/></div>
              <div>
                <h3 className="font-bold text-content">Edit Prescription</h3>
                <p className="text-xs text-content-muted">Patient: {editingPrescription.patient?.name}</p>
              </div>
            </div>
            {saveSuccess ? (
              <div className="p-10 text-center">
                <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-3" />
                <p className="text-content font-bold text-lg">Saved Successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div>
                  <label className="form-label">Diagnosis</label>
                  <input type="text" className="form-control" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} required/>
                </div>
                <div>
                  <label className="form-label">Medicines</label>
                  <textarea className="form-control" rows="3" value={medicines} onChange={e => setMedicines(e.target.value)} required/>
                </div>
                <div>
                  <label className="form-label">Special Instructions</label>
                  <textarea className="form-control" rows="2" value={instructions} onChange={e => setInstructions(e.target.value)}/>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditingPrescription(null)} className="btn btn-outline flex-1">Cancel</button>
                  <button type="submit" className="btn btn-primary flex-1">Save Changes</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptions;
