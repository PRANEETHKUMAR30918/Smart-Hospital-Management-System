import React, { useState, useEffect } from 'react';
import { patientAPI } from '../../services/api';
import { FileText, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewingPrescription, setViewingPrescription] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pData, profile] = await Promise.all([
        patientAPI.getPrescriptions().catch(() => []),
        patientAPI.getProfile().catch(() => null)
      ]);
      setPrescriptions(pData || []);
      setPatientProfile(profile);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching prescriptions", error);
      setLoading(false);
    }
  };

  const handleDownloadPDF = (prescriptionToDownload) => {
    try {
      const p = prescriptionToDownload || viewingPrescription;
      if (!p) return;
      
      const doc = new jsPDF();
      
      // Constants
      const primaryColor = [16, 185, 129]; // Emerald 500
      const secondaryColor = [99, 102, 241]; // Indigo 500
      const textColor = [51, 65, 85]; // Slate 700
      const lightGray = [241, 245, 249]; // Slate 100
      
      // 1. Header Area with Background
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 45, 'F'); // Top banner
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(255, 255, 255);
      doc.text("MEDICARE HOSPITAL", 20, 25);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(230, 255, 240);
      doc.text("Excellence in Healthcare", 20, 33);
      
      // Right side of Header
      doc.setFontSize(10);
      doc.text("Date:", 140, 25);
      doc.text(new Date(p.issuedAt || Date.now()).toLocaleDateString(), 155, 25);
      doc.text("Time:", 140, 31);
      doc.text(new Date(p.issuedAt || Date.now()).toLocaleTimeString(), 155, 31);
      
      // 2. Patient & Doctor Info Blocks
      let startY = 55;
      
      // Doctor Box
      doc.setFillColor(...lightGray);
      doc.roundedRect(20, startY, 80, 40, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.text("CONSULTANT", 25, startY + 8);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text(`Dr. ${p.doctor?.name || 'Unknown'}`, 25, startY + 16);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...textColor);
      doc.text(`${p.doctor?.specialization || 'General Physician'}`, 25, startY + 23);
      doc.text(`Ph: ${p.doctor?.phone || 'N/A'}`, 25, startY + 30);
      
      // Patient Box
      doc.setFillColor(...lightGray);
      doc.roundedRect(110, startY, 80, 40, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...secondaryColor);
      doc.text("PATIENT", 115, startY + 8);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text(`${patientProfile?.name || p.patient?.name || 'Unknown'}`, 115, startY + 16);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...textColor);
      const age = patientProfile?.dob ? (new Date().getFullYear() - new Date(patientProfile.dob).getFullYear()) : '-';
      doc.text(`Age/Sex: ${age} / ${patientProfile?.gender || '-'}`, 115, startY + 23);
      doc.text(`Blood: ${patientProfile?.bloodGroup || '-'} | Ph: ${patientProfile?.phone || '-'}`, 115, startY + 30);
      
      startY = 105;
      
      // 3. Clinical Details
      // Diagnosis Section
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(20, startY, 170, 30, 2, 2, 'FD');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("DIAGNOSIS", 25, startY + 8);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(...textColor);
      const diagLines = doc.splitTextToSize(p.diagnosis || 'None specified', 160);
      doc.text(diagLines, 25, startY + 16);
      
      startY += 30 + 10;
      
      // Medicines Section (The "Rx")
      doc.setFont('helvetica', 'bolditalic');
      doc.setFontSize(28);
      doc.setTextColor(...primaryColor);
      doc.text("Rx", 20, startY);
      
      startY += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(...textColor);
      const medLines = doc.splitTextToSize(p.medicines || 'No medicines prescribed', 170);
      
      // Draw background for medicines
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(20, startY - 4, 170, (medLines.length * 6) + 8, 2, 2, 'F');
      
      doc.text(medLines, 25, startY + 2);
      
      startY += (medLines.length * 6) + 15;
      
      // Special Instructions
      if (p.instructions) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...secondaryColor);
        doc.text("SPECIAL INSTRUCTIONS / ADVICE", 20, startY);
        
        startY += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(...textColor);
        const instLines = doc.splitTextToSize(p.instructions, 170);
        doc.text(instLines, 20, startY);
      }
      
      // 4. Footer
      const pageHeight = doc.internal.pageSize.height || 297;
      
      doc.setDrawColor(226, 232, 240);
      doc.line(20, pageHeight - 35, 190, pageHeight - 35);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Dr. ${p.doctor?.name || ''}`, 150, pageHeight - 25);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...textColor);
      doc.text("Authorized Signature", 155, pageHeight - 20);
      
      // Branding
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("This is an electronically generated prescription.", 20, pageHeight - 25);
      doc.text(`Ref ID: PRE-${p.id || Math.floor(Math.random() * 1000)} | Hosp ID: MED-${patientProfile?.id || p.patient?.id || 'XX'}`, 20, pageHeight - 20);
      
      doc.save(`Prescription_Dr${p.doctor?.name?.replace(/\s+/g, '')}_${new Date(p.issuedAt || Date.now()).toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("PDF Generation Error", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-border bg-surface/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-content">My Prescriptions</h3>
            <p className="text-sm text-content-muted">View and download your past and present prescriptions</p>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prescriptions.length === 0 ? (
            <div className="col-span-full text-center py-10 text-content-muted">
              <FileText className="mx-auto h-12 w-12 text-content-muted mb-3 opacity-50" />
              No prescriptions found in your medical history.
            </div>
          ) : (
            [...prescriptions].sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt)).map((p, index) => (
              <div key={`${p.id}-${index}`} className="bg-surface border border-border rounded-2xl p-5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-content text-sm">{new Date(p.issuedAt).toLocaleString()}</h4>
                    <p className="text-xs text-content-muted mt-0.5">Dr. {p.doctor?.name}</p>
                  </div>
                  <span className="text-xs font-bold bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-md border border-emerald-500/20 text-center">
                    {p.doctor?.specialization}
                  </span>
                </div>
                <div className="mb-4 flex-1">
                  <p className="text-xs text-content-muted uppercase font-bold mb-1">Diagnosis</p>
                  <p className="text-sm text-content line-clamp-2">{p.diagnosis}</p>
                </div>
                <div className="flex gap-3 mt-auto pt-4 border-t border-border">
                  <button 
                    onClick={() => setViewingPrescription(p)} 
                    className="btn btn-outline flex-1 text-xs py-2 px-0"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleDownloadPDF(p)} 
                    className="btn btn-primary flex-1 text-xs py-2 px-0 flex items-center justify-center gap-1.5"
                  >
                    <Download size={14} /> Download PDF
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* View Prescription Modal */}
      {viewingPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-border bg-surface/50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-content">Prescription Details</h3>
                <p className="text-sm text-content-muted">Dr. {viewingPrescription.doctor?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-content-muted">Issued On</p>
                <p className="text-sm font-medium text-content">{new Date(viewingPrescription.issuedAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-xs text-content-muted uppercase font-bold mb-1">Diagnosis</h4>
                <p className="text-content font-medium bg-border/30 p-3 rounded-lg border border-border">{viewingPrescription.diagnosis || 'None specified'}</p>
              </div>
              <div>
                <h4 className="text-xs text-content-muted uppercase font-bold mb-1">Medicines</h4>
                <div className="text-content bg-border/30 p-3 rounded-lg border border-border whitespace-pre-wrap">
                  {viewingPrescription.medicines || 'No medicines prescribed'}
                </div>
              </div>
              {viewingPrescription.instructions && (
                <div>
                  <h4 className="text-xs text-content-muted uppercase font-bold mb-1">Special Instructions</h4>
                  <p className="text-content text-sm bg-indigo-500/10 text-indigo-400 p-3 rounded-lg border border-indigo-500/20">
                    {viewingPrescription.instructions}
                  </p>
                </div>
              )}
              <div className="pt-4 border-t border-border flex gap-3">
                <button type="button" onClick={() => setViewingPrescription(null)} className="btn btn-outline flex-1">Close</button>
                <button type="button" onClick={() => handleDownloadPDF(viewingPrescription)} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                  <Download size={16} /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;
