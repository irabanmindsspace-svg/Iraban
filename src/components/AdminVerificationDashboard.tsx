import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Doctor } from '../types';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Users, 
  Building2, 
  Activity, 
  Calendar, 
  History,
  AlertTriangle
} from 'lucide-react';

export const AdminVerificationDashboard: React.FC = () => {
  const { showNotification } = useApp();
  const [overview, setOverview] = useState<any>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminRes, docRes] = await Promise.all([
        api.getAdminOverview(),
        api.getDoctors()
      ]);
      if (adminRes.success) setOverview(adminRes);
      if (docRes.success) setDoctors(docRes.doctors);
    } catch (e) {
      console.error('Admin overview load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleDoctorVerify = async (doctorId: string, currentStatus: boolean) => {
    try {
      const res = await api.verifyDoctor(doctorId, !currentStatus);
      if (res.success) {
        setDoctors(prev => prev.map(d => d.id === doctorId ? res.doctor : d));
        showNotification(`${res.doctor.fullName} verification status set to ${res.doctor.isVerified ? 'VERIFIED' : 'UNVERIFIED'}.`);
        loadData();
      }
    } catch (err) {
      console.error('Failed to update verification:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-5">
      
      {/* Header */}
      <div className="bg-white rounded-lg p-5 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Medical Platform Administration & Verification
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-900 text-white rounded">
                Admin Console
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              National Medical Commission (NMC) credential verification, audit logs, and provider oversight.
            </p>
          </div>

          <div className="text-xs text-slate-600 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Anti-Fraud & Practitioner Registry Protection</span>
          </div>
        </div>

        {/* Analytics Top Cards */}
        {overview?.metrics && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block uppercase">Practitioners</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {overview.metrics.totalDoctors}
              </span>
              <span className="text-[10px] text-emerald-800 block mt-0.5 font-semibold">
                {overview.metrics.verifiedDoctors} NMC Verified
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block uppercase">Empanelled Hospitals</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {overview.metrics.totalHospitals}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                NABH / NABL Accredited
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block uppercase">Appointments</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {overview.metrics.totalAppointments}
              </span>
              <span className="text-[10px] text-slate-600 block mt-0.5 font-semibold">
                {overview.metrics.completedAppointments} Completed
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block uppercase">Emergency Alerts</span>
              <span className="text-lg font-bold text-red-700 tabular-nums">
                {overview.metrics.emergencyAlertsHandled}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                108 Dispatches Handled
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Practitioner Verification Queue */}
      <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-3.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-sky-800" />
          <span>Healthcare Practitioner Credential Verification</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] bg-slate-50/70">
                <th className="py-2.5 px-3">Doctor</th>
                <th className="py-2.5 px-3">Registration Number</th>
                <th className="py-2.5 px-3">Hospital</th>
                <th className="py-2.5 px-3">Council</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {doctors.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-2.5 px-3">
                    <p className="font-bold text-slate-900">{doc.fullName}</p>
                    <p className="text-[11px] text-slate-500">{doc.specialization}</p>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                    {doc.registrationNumber}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {doc.hospitalAffiliation}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {doc.medicalCouncil}
                  </td>
                  <td className="py-2.5 px-3">
                    {doc.isVerified ? (
                      <span className="font-medium text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        VERIFIED
                      </span>
                    ) : (
                      <span className="font-medium text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        PENDING
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleToggleDoctorVerify(doc.id, doc.isVerified)}
                      className={`px-2.5 py-1 rounded font-medium text-xs transition cursor-pointer btn-press ${
                        doc.isVerified 
                          ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700 border border-slate-200' 
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      }`}
                    >
                      {doc.isVerified ? 'Revoke' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DISHA / ABDM Audit Logs */}
      {overview?.auditLogs && (
        <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <History className="w-4 h-4 text-slate-700" />
            <span>Healthcare Governance Audit Trail (DISHA & ABDM Compliant)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Immutable log of role access, credential checks, emergency triggers, and health record consents.
          </p>

          <div className="space-y-2">
            {overview.auditLogs.map((log: any) => (
              <div key={log.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{log.action}</span>
                    <span className="text-[10px] text-slate-500">by {log.actor}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5 text-[11px]">{log.details}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-200 text-slate-800 rounded">
                    {log.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">{log.timestamp.slice(0, 19).replace('T', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
