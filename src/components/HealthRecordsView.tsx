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
  Users
} from 'lucide-react';

export const HealthRecordsView: React.FC = () => {
  const { user, showNotification } = useApp();
  const [records, setRecords] = useState<PersonalHealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDependent, setSelectedDependent] = useState<string>('self');
  const [showUploadModal, setShowUploadModal] = useState(false);
  
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
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Title & Vault Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Personal Health Records (PHR)
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md">
                ABHA / DISHA Compliant
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Encrypted vault for lab tests, digital prescriptions, CT/MRI scans, and granular sharing consents.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer min-h-[44px]"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* Family Member Vault Switcher */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Viewing records for:
          </span>

          <button
            onClick={() => setSelectedDependent('self')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${selectedDependent === 'self' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            {user?.fullName || 'Rajesh Sharma'} (Self)
          </button>

          {user?.dependents.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDependent(d.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${selectedDependent === d.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {d.fullName} ({d.relation})
            </button>
          ))}
        </div>
      </div>

      {/* Records List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Vault contains <strong className="text-slate-900 font-bold tabular-nums">{records.length}</strong> encrypted documents
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
            Loading encrypted personal health records...
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            No medical documents stored yet. Click &quot;Upload Document&quot; above to store your first report.
          </div>
        ) : (
          <div className="space-y-4">
            {records.map(record => (
              <div
                key={record.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition-all shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left details */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{record.title}</h3>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                          {record.category.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>Issued by: {record.doctorOrLab}</span>
                        <span aria-hidden="true">·</span>
                        <span>Date: {record.date}</span>
                        <span aria-hidden="true">·</span>
                        <span>{record.fileSize}</span>
                      </div>

                      {/* Tags */}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {record.tags.map((t, idx) => (
                          <span key={idx} className="text-[11px] font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right actions: Consent Manager */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleRevoke(record)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                          record.consent.revoked 
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' 
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
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
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </a>
                    </div>

                    <span className="text-[10px] text-slate-400">
                      {record.consent.revoked ? '🔒 Private (Only you can view)' : '🔓 Visible to treating doctors'}
                    </span>
                  </div>
                </div>

                {/* Audit trail */}
                {record.accessLogs.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 font-medium text-slate-600 mb-1">
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <span>Access Audit Trail (DISHA Compliance):</span>
                    </div>
                    {record.accessLogs.map((log, i) => (
                      <p key={i} className="text-slate-400">
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Upload Medical Health Document
            </h3>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-900 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Thyroid Profile, Ultrasound Abdomen, Discharge Summary..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white"
                >
                  <option value="lab_report">Lab Test / Blood Report</option>
                  <option value="prescription">Doctor Prescription (Rx)</option>
                  <option value="scan_imaging">Scan / X-Ray / MRI / CT</option>
                  <option value="discharge_summary">Hospital Discharge Summary</option>
                  <option value="vaccination">Vaccination Certificate</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Doctor / Lab Name</label>
                <input
                  type="text"
                  value={newDoctorLab}
                  onChange={e => setNewDoctorLab(e.target.value)}
                  placeholder="e.g. Dr. Priya Venkatesh / National Reference Lab"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Sharing Consent Default</label>
                <select
                  value={newConsentType}
                  onChange={e => setNewConsentType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white"
                >
                  <option value="during_appointment">Share during active appointment only</option>
                  <option value="view_once">View once (single consultation review)</option>
                  <option value="30_days">Share for 30 days</option>
                  <option value="permanent">Always visible to my authorized doctors</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Tags (Comma-separated values)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  placeholder="e.g. TSH: 2.4, Normal Liver, Routine 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
