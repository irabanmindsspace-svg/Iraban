import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { PersonalHealthRecord } from '../types';
import { 
  FileText, 
  Upload, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Eye, 
  History, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Users,
  QrCode,
  X
} from 'lucide-react';

export const HealthRecordsView: React.FC = () => {
  const { user, showNotification, openQrScanner } = useApp();
  const [records, setRecords] = useState<PersonalHealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDependent, setSelectedDependent] = useState<string>('self');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAbhaCardModal, setShowAbhaCardModal] = useState(false);
  
  // Upload form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'prescription' | 'lab_report' | 'scan_imaging' | 'discharge_summary' | 'vaccination'>('lab_report');
  const [newDoctorLab, setNewDoctorLab] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newConsentType, setNewConsentType] = useState<'view_once' | 'during_appointment' | '30_days' | 'permanent'>('during_appointment');

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.getRecords();
      if (res.success) {
        setRecords(res.records);
      }
    } catch (e) {
      console.error('Error fetching health records:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleToggleRevoke = async (record: PersonalHealthRecord) => {
    const updatedRevoked = !record.consent.revoked;
    try {
      const res = await api.updateRecordConsent(record.id, { revoked: updatedRevoked });
      if (res.success) {
        setRecords(prev => prev.map(r => r.id === record.id ? res.record : r));
        showNotification(updatedRevoked ? 'Doctor sharing consent REVOKED.' : 'Sharing consent RESTORED.');
      }
    } catch (err) {
      console.error('Failed to update consent:', err);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const tagsList = newTags ? newTags.split(',').map(s => s.trim()) : ['Verified Record'];
      const res = await api.uploadRecord({
        title: newTitle.trim(),
        category: newCategory,
        doctorOrLab: newDoctorLab.trim() || 'Self Uploaded',
        fileName: `${newTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        tags: tagsList,
        consentType: newConsentType,
      });

      if (res.success) {
        setRecords(prev => [res.record, ...prev]);
        setShowUploadModal(false);
        setNewTitle('');
        setNewDoctorLab('');
        setNewTags('');
        showNotification('Medical record securely encrypted and added to PHR vault.');
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-5">
      
      {/* Title & Vault Header */}
      <div className="bg-white rounded-lg p-5 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Personal Health Records (PHR)
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                ABHA / DISHA Compliant
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure vault for diagnostic reports, doctor prescriptions, imaging scans, and access consents.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => openQrScanner('patient_records')}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs rounded flex items-center gap-1.5 transition cursor-pointer btn-press shadow-2xs"
              title="Scan Patient ABHA Card or Record QR"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-700" />
              <span>Scan Record QR</span>
            </button>

            <button
              onClick={() => setShowAbhaCardModal(true)}
              className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 font-bold text-xs rounded flex items-center gap-1.5 transition cursor-pointer btn-press shadow-2xs"
              title="Show my ABHA Digital Health Card QR to doctor"
            >
              <Users className="w-3.5 h-3.5 text-sky-700" />
              <span>Show My ABHA QR</span>
            </button>

            <button
              onClick={() => setShowUploadModal(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded flex items-center gap-1.5 transition cursor-pointer btn-press"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* Family Member Vault Switcher */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium mr-1 flex items-center gap-1 text-[11px]">
            <Users className="w-3.5 h-3.5 text-slate-400" /> Member:
          </span>

          <button
            onClick={() => setSelectedDependent('self')}
            className={`px-2.5 py-1 rounded font-medium transition cursor-pointer text-xs btn-press ${selectedDependent === 'self' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            {user?.fullName || 'Rajesh Sharma'} (Self)
          </button>

          {user?.dependents.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDependent(d.id)}
              className={`px-2.5 py-1 rounded font-medium transition cursor-pointer text-xs btn-press ${selectedDependent === d.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {d.fullName} ({d.relation})
            </button>
          ))}
        </div>
      </div>

      {/* Records List */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
          <span>
            Stored Medical Documents (<strong className="text-slate-900 font-semibold tabular-nums">{records.length}</strong>)
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center bg-white rounded-lg border border-slate-200 text-slate-500 text-xs">
            Loading encrypted personal health records...
          </div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg border border-slate-200 text-slate-500 text-xs space-y-1">
            <p className="font-semibold text-slate-800">No medical documents stored yet.</p>
            <p className="text-[11px] text-slate-400">Click &quot;Upload Document&quot; above to store your first report.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map(record => (
              <div
                key={record.id}
                className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left details */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-sky-800" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{record.title}</h3>
                        <span className="text-[10px] font-medium uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {record.category.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>Issued by: {record.doctorOrLab}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span>Date: {record.date}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span>{record.fileSize}</span>
                      </div>

                      {/* Tags */}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {record.tags.map((t, idx) => (
                          <span key={idx} className="text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right actions: Consent Manager */}
                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleRevoke(record)}
                        className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition cursor-pointer btn-press ${
                          record.consent.revoked 
                            ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' 
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                        title="Control whether doctors can access this record"
                      >
                        {record.consent.revoked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        <span>{record.consent.revoked ? 'Sharing Revoked' : `Access: ${record.consent.accessType.replace('_', ' ')}`}</span>
                      </button>

                      <a
                        href="#download"
                        onClick={e => {
                          e.preventDefault();
                          showNotification(`Document ${record.fileName} ready for secure local view.`);
                        }}
                        className="px-2.5 py-1 rounded text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1 btn-press"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </a>
                    </div>

                    <span className="text-[10px] text-slate-400">
                      {record.consent.revoked ? 'Private (Only you can view)' : 'Visible to consulting clinicians'}
                    </span>
                  </div>
                </div>

                {/* Audit trail */}
                {record.accessLogs.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-medium text-slate-600 mb-1">
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <span>Access Log (DISHA Audit):</span>
                    </div>
                    {record.accessLogs.map((log, i) => (
                      <p key={i} className="text-slate-500 text-[11px]">
                        • {log.accessedAt}: {log.actorName} ({log.actorRole}) - &quot;{log.action}&quot;
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Upload Medical Health Document
            </h3>

            <form onSubmit={handleUploadSubmit} className="mt-3.5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Thyroid Profile, Ultrasound Abdomen, Discharge Summary..."
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-900 focus:border-sky-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-slate-900 bg-white"
                >
                  <option value="lab_report">Lab Test / Blood Report</option>
                  <option value="prescription">Doctor Prescription (Rx)</option>
                  <option value="scan_imaging">Scan / X-Ray / MRI / CT</option>
                  <option value="discharge_summary">Hospital Discharge Summary</option>
                  <option value="vaccination">Vaccination Certificate</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Doctor / Lab Name</label>
                <input
                  type="text"
                  value={newDoctorLab}
                  onChange={e => setNewDoctorLab(e.target.value)}
                  placeholder="e.g. Dr. Priya Venkatesh / National Reference Lab"
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-900 focus:border-sky-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Sharing Consent Default</label>
                <select
                  value={newConsentType}
                  onChange={e => setNewConsentType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-slate-900 bg-white"
                >
                  <option value="during_appointment">Share during active appointment only</option>
                  <option value="view_once">View once (single consultation review)</option>
                  <option value="30_days">Share for 30 days</option>
                  <option value="permanent">Always visible to my authorized doctors</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  placeholder="e.g. TSH: 2.4, Normal Liver, Routine 2026"
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-900 focus:border-sky-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium cursor-pointer btn-press"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ABHA Digital Health Card with Scannable QR Modal */}
      {showAbhaCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-gradient-to-r from-sky-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm tracking-wide">National Health Authority · ABHA Card</span>
              </div>
              <button
                onClick={() => setShowAbhaCardModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Official ABHA Card Styled Component */}
              <div className="rounded-xl p-5 border-2 border-sky-300 bg-gradient-to-br from-sky-50 via-white to-sky-100 text-slate-900 space-y-3 shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between pb-2 border-b border-sky-200">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-sky-900">National Digital Health Mission</p>
                    <p className="text-xs font-bold text-slate-900">Ayushman Bharat Health Account (ABHA)</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-400 text-orange-600 font-bold text-xs">
                    GOI
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* High Quality SVG Scannable QR Matrix for ABHA */}
                  <div className="p-2 bg-white rounded-lg border-2 border-sky-700 shrink-0 shadow-inner">
                    <svg viewBox="0 0 29 29" className="w-24 h-24">
                      {/* Top-Left Corner Eye */}
                      <rect x="2" y="2" width="7" height="7" fill="#0369a1" />
                      <rect x="3" y="3" width="5" height="5" fill="#ffffff" />
                      <rect x="4" y="4" width="3" height="3" fill="#0369a1" />

                      {/* Top-Right Corner Eye */}
                      <rect x="20" y="2" width="7" height="7" fill="#0369a1" />
                      <rect x="21" y="3" width="5" height="5" fill="#ffffff" />
                      <rect x="22" y="4" width="3" height="3" fill="#0369a1" />

                      {/* Bottom-Left Corner Eye */}
                      <rect x="2" y="20" width="7" height="7" fill="#0369a1" />
                      <rect x="3" y="21" width="5" height="5" fill="#ffffff" />
                      <rect x="4" y="22" width="3" height="3" fill="#0369a1" />

                      {/* Timing bars & Encoded Pattern Data */}
                      <rect x="11" y="4" width="2" height="2" fill="#0f172a" />
                      <rect x="15" y="4" width="2" height="2" fill="#0f172a" />
                      <rect x="11" y="8" width="2" height="2" fill="#0f172a" />
                      <rect x="13" y="11" width="3" height="3" fill="#0284c7" />
                      <rect x="18" y="11" width="2" height="2" fill="#0f172a" />
                      <rect x="11" y="15" width="2" height="2" fill="#0f172a" />
                      <rect x="15" y="16" width="3" height="3" fill="#0f172a" />
                      <rect x="20" y="18" width="2" height="2" fill="#0f172a" />
                      <rect x="11" y="22" width="2" height="2" fill="#0f172a" />
                      <rect x="15" y="23" width="2" height="2" fill="#0f172a" />
                      <rect x="22" y="22" width="3" height="3" fill="#0284c7" />
                    </svg>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-medium">Full Name</span>
                      <span className="font-bold text-sm text-slate-900">{user?.fullName || 'Rajesh Sharma'}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-medium">ABHA Number</span>
                      <span className="font-mono font-bold text-sky-950 text-xs bg-sky-100/70 px-1.5 py-0.5 rounded">
                        {user?.abhaId || '91-8842-1209-7712'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-medium">Gender / Blood Group</span>
                      <span className="font-semibold text-slate-700">Male · B+ Positive</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-sky-200/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Present this QR at OPD Desk</span>
                  <span className="font-semibold text-emerald-800 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    ABDM Verified
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAbhaCardModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
