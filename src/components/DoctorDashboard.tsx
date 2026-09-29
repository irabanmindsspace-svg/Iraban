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
  FileCheck
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user, showNotification, setActiveTeleconsultationAppointment, setActiveTab } = useApp();
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
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Doctor Professional Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-lg">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">Dr. Priya Venkatesh, MD</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  NMC Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Reg: MCI-2012-44192 (Delhi Medical Council) · General Physician & Internal Medicine · AIIMS Affiliated
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">OPD Timings:</span>
            <span className="text-slate-500">09:00 AM - 01:00 PM, 05:00 PM - 08:00 PM</span>
          </div>
        </div>
      </div>

      {/* OPD Queue & Patient Appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>Today&apos;s OPD Consultation Queue ({appointments.length})</span>
          </h2>
        </div>

        <div className="space-y-3">
          {appointments.map(apt => (
            <div
              key={apt.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{apt.patientName}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    apt.status === 'confirmed' 
                      ? 'bg-sky-50 text-sky-800' 
                      : apt.status === 'completed' 
                        ? 'bg-emerald-50 text-emerald-800' 
                        : 'bg-slate-100 text-slate-700'
                  }`}>
                    {apt.status.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                    {apt.type.toUpperCase()}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{apt.patientAge} Yrs · {apt.patientGender}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-slate-800">{apt.timeSlot} ({apt.date})</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[11px] text-sky-700">{apt.qrVerificationCode}</span>
                </div>

                <p className="mt-2 text-xs text-slate-600">
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
                    className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Start Video OPD</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveAppointment(apt);
                    setShowRxModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Issue Digital Rx</span>
                </button>

                {apt.status === 'confirmed' && (
                  <button
                    onClick={() => handleUpdateStatus(apt.id, 'completed')}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
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
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Author Digital Prescription (Rx)</span>
              <span className="text-xs text-slate-400 font-normal">Patient: {activeAppointment.patientName}</span>
            </h3>

            <form onSubmit={handleCreatePrescription} className="mt-4 space-y-4 text-xs">
              {/* Vitals */}
              <div>
                <p className="font-bold text-slate-900 mb-1.5">1. Clinical Vitals</p>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={bp}
                    onChange={e => setBp(e.target.value)}
                    placeholder="BP (e.g. 120/80)"
                    className="px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                  <input
                    type="text"
                    value={pulse}
                    onChange={e => setPulse(e.target.value)}
                    placeholder="Pulse (e.g. 74 bpm)"
                    className="px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                  <input
                    type="text"
                    value={spO2}
                    onChange={e => setSpO2(e.target.value)}
                    placeholder="SpO2 (e.g. 99%)"
                    className="px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block font-bold text-slate-900 mb-1">2. Clinical Diagnosis</label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  placeholder="e.g. Type 2 Diabetes Mellitus with Essential Stage 1 Hypertension"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>

              {/* Medicines Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-900">3. Prescribed Medicines (Rx)</label>
                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    className="text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medicine</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {medicines.map((med, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
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
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
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
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
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
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                          />
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                          {medicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMedicineRow(index)}
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="w-4 h-4" />
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
                <label className="block font-bold text-slate-900 mb-1">4. Dietary & Recovery Advice</label>
                <textarea
                  rows={2}
                  value={lifestyleAdvice}
                  onChange={e => setLifestyleAdvice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRxModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
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
