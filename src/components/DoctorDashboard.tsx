import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Appointment, Doctor } from '../types';
import { 
  Stethoscope, 
  Users, 
  Calendar, 
  Clock, 
  FileText, 
  Video, 
  CheckCircle, 
  Plus, 
  ShieldCheck, 
  Send, 
  Trash2,
  FileCheck,
  QrCode
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user, showNotification, setActiveTeleconsultationAppointment, setActiveTab, openLoginForRole, openQrScanner } = useApp();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [showRxModal, setShowRxModal] = useState(false);

  // Digital Prescription form state
  const [diagnosis, setDiagnosis] = useState('');
  const [bp, setBp] = useState('120/80 mmHg');
  const [pulse, setPulse] = useState('74 bpm');
  const [spO2, setSpO2] = useState('99%');
  const [lifestyleAdvice, setLifestyleAdvice] = useState('Adequate hydration, restrict sodium, brisk walking.');
  const [medicines, setMedicines] = useState([
    {
      medicineName: 'Metformin SR 500mg',
      genericName: 'Metformin Sustained Release IP 500mg',
      dosage: '1 Tablet',
      frequency: '1-0-1',
      timing: 'After Food' as const,
      duration: '30 Days',
      instructions: 'Take after meals with water'
    }
  ]);

  const fetchDoctorAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.getAppointments('doctor');
      if (res.success) {
        setAppointments(res.appointments);
      }
    } catch (e) {
      console.error('Failed to fetch doctor appointments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await api.updateAppointmentStatus(id, status);
      if (res.success) {
        setAppointments(prev => prev.map(a => a.id === id ? res.appointment : a));
        showNotification(`Appointment status set to ${status}.`);
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handleAddMedicineRow = () => {
    setMedicines(prev => [
      ...prev,
      {
        medicineName: '',
        genericName: '',
        dosage: '1 Tablet',
        frequency: '1-0-1',
        timing: 'After Food',
        duration: '14 Days',
        instructions: ''
      }
    ]);
  };

  const handleRemoveMedicineRow = (index: number) => {
    setMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAppointment || !diagnosis.trim()) return;

    try {
      const res = await api.createPrescription({
        appointmentId: activeAppointment.id,
        patientId: activeAppointment.patientId,
        patientName: activeAppointment.patientName,
        patientAge: activeAppointment.patientAge,
        diagnosis: diagnosis.trim(),
        vitals: { bp, pulse, spO2 },
        lifestyleAdvice,
        medicines: medicines.filter(m => m.medicineName.trim()),
      });

      if (res.success) {
        setShowRxModal(false);
        await handleUpdateStatus(activeAppointment.id, 'completed');
        showNotification('Digital Prescription cryptographically signed and saved to patient PHR vault.');
      }
    } catch (err) {
      console.error('Prescription generation failed:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-5">
      
      {/* Doctor Professional Header Banner */}
      <div className="bg-white rounded-lg p-5 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded bg-slate-100 text-sky-800 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">
                  {user?.role === 'doctor' ? user.fullName : 'Dr. Priya Venkatesh, MD'}
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-700" />
                  NMC Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Reg: {user?.doctorRegistrationNumber || 'MCI-2012-44192'} ({user?.medicalCouncil || 'Delhi Medical Council'}) · {user?.specialization || 'Internal Medicine'} · {user?.hospitalAffiliation || 'AIIMS Affiliated'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => openQrScanner('patient_records')}
              className="px-3.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs btn-press"
              title="Scan patient's ABHA card or appointment pass with camera"
            >
              <QrCode className="w-3.5 h-3.5 text-sky-200" />
              <span>Scan Patient ABHA QR</span>
            </button>

            <button
              onClick={() => openLoginForRole('doctor')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition cursor-pointer btn-press"
            >
              {user?.role === 'doctor' ? 'Switch Doctor' : 'Doctor Sign In'}
            </button>
          </div>
        </div>
      </div>

      {/* OPD Queue & Patient Appointments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-sky-800" />
            <span>Today&apos;s OPD Consultation Queue ({appointments.length})</span>
          </h2>
        </div>

        <div className="space-y-3">
          {appointments.map(apt => (
            <div
              key={apt.id}
              className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{apt.patientName}</h3>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                    apt.status === 'confirmed' 
                      ? 'bg-sky-50 text-sky-900 border-sky-200' 
                      : apt.status === 'completed' 
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {apt.status}
                  </span>
                  <span className="text-[10px] font-medium uppercase px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                    {apt.type}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{apt.patientAge} Yrs · {apt.patientGender}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="font-medium text-slate-800">{apt.timeSlot} ({apt.date})</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="font-mono text-[11px] text-sky-900">{apt.qrVerificationCode}</span>
                </div>

                <p className="mt-1.5 text-xs text-slate-600">
                  <strong className="text-slate-800">Chief Symptoms:</strong> {apt.symptoms}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {apt.type === 'telemedicine' && (
                  <button
                    onClick={() => {
                      setActiveTeleconsultationAppointment(apt);
                      setActiveTab('telemedicine');
                    }}
                    className="px-3 py-1.5 rounded bg-sky-800 hover:bg-sky-900 text-white font-medium text-xs flex items-center gap-1.5 transition cursor-pointer btn-press"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Video OPD</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveAppointment(apt);
                    setShowRxModal(true);
                  }}
                  className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center gap-1.5 transition cursor-pointer btn-press"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Issue Digital Rx</span>
                </button>

                {apt.status === 'confirmed' && (
                  <button
                    onClick={() => handleUpdateStatus(apt.id, 'completed')}
                    className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition cursor-pointer btn-press border border-slate-200"
                  >
                    Mark Done
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Write Digital Prescription */}
      {showRxModal && activeAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-5 shadow-2xl border border-slate-300 my-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Author Digital Prescription (Rx)</span>
              <span className="text-xs text-slate-500 font-normal">Patient: {activeAppointment.patientName}</span>
            </h3>

            <form onSubmit={handleCreatePrescription} className="mt-3.5 space-y-3.5 text-xs">
              {/* Vitals */}
              <div>
                <p className="font-semibold text-slate-900 mb-1">1. Clinical Vitals</p>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={bp}
                    onChange={e => setBp(e.target.value)}
                    placeholder="BP (e.g. 120/80)"
                    className="px-2.5 py-1.5 rounded border border-slate-300 text-slate-900 focus:border-sky-600 focus:outline-hidden"
                  />
                  <input
                    type="text"
                    value={pulse}
                    onChange={e => setPulse(e.target.value)}
                    placeholder="Pulse (e.g. 74 bpm)"
                    className="px-2.5 py-1.5 rounded border border-slate-300 text-slate-900 focus:border-sky-600 focus:outline-hidden"
                  />
                  <input
                    type="text"
                    value={spO2}
                    onChange={e => setSpO2(e.target.value)}
                    placeholder="SpO2 (e.g. 99%)"
                    className="px-2.5 py-1.5 rounded border border-slate-300 text-slate-900 focus:border-sky-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block font-semibold text-slate-900 mb-1">2. Clinical Diagnosis</label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  placeholder="e.g. Type 2 Diabetes Mellitus with Essential Stage 1 Hypertension"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-slate-900 focus:border-sky-600 focus:outline-hidden"
                />
              </div>

              {/* Medicines Table */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-900">3. Prescribed Medicines (Rx)</label>
                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    className="text-sky-800 hover:text-sky-950 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medicine</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {medicines.map((med, index) => (
                    <div key={index} className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-2">
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-6">
                          <input
                            type="text"
                            placeholder="Medicine Name (e.g. Metformin SR 500mg)"
                            value={med.medicineName}
                            onChange={e => {
                              const updated = [...medicines];
                              updated[index].medicineName = e.target.value;
                              setMedicines(updated);
                            }}
                            className="w-full px-2 py-1 rounded border border-slate-300 bg-white focus:border-sky-600 focus:outline-hidden"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            placeholder="Frequency (1-0-1)"
                            value={med.frequency}
                            onChange={e => {
                              const updated = [...medicines];
                              updated[index].frequency = e.target.value;
                              setMedicines(updated);
                            }}
                            className="w-full px-2 py-1 rounded border border-slate-300 bg-white focus:border-sky-600 focus:outline-hidden"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="Duration (30 Days)"
                            value={med.duration}
                            onChange={e => {
                              const updated = [...medicines];
                              updated[index].duration = e.target.value;
                              setMedicines(updated);
                            }}
                            className="w-full px-2 py-1 rounded border border-slate-300 bg-white focus:border-sky-600 focus:outline-hidden"
                          />
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                          {medicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMedicineRow(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lifestyle Advice */}
              <div>
                <label className="block font-semibold text-slate-900 mb-1">4. Dietary & Recovery Advice</label>
                <textarea
                  rows={2}
                  value={lifestyleAdvice}
                  onChange={e => setLifestyleAdvice(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-slate-900 focus:border-sky-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRxModal(false)}
                  className="px-3.5 py-1.5 rounded text-slate-700 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-medium cursor-pointer btn-press"
                >
                  Sign & Issue Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
