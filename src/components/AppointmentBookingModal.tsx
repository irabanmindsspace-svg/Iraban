import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Doctor, Appointment } from '../types';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  CreditCard, 
  CheckCircle, 
  Video, 
  Building2, 
  QrCode, 
  Printer, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface Props {
  doctor: Doctor;
  onClose: () => void;
  onSuccess: (appointment: Appointment) => void;
}

export const AppointmentBookingModal: React.FC<Props> = ({ doctor, onClose, onSuccess }) => {
  const { user, showNotification } = useApp();
  
  const [step, setStep] = useState<'details' | 'confirmation'>('details');
  const [patientTarget, setPatientTarget] = useState<string>('self');
  const [consultType, setConsultType] = useState<'in-person' | 'telemedicine'>('in-person');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00 AM - 10:30 AM');
  const [symptoms, setSymptoms] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Cash at OPD'>('UPI');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  const AVAILABLE_SLOTS = [
    '09:30 AM - 10:00 AM',
    '10:00 AM - 10:30 AM',
    '10:30 AM - 11:00 AM',
    '11:30 AM - 12:00 PM',
    '05:00 PM - 05:30 PM',
    '05:30 PM - 06:00 PM',
    '06:30 PM - 07:00 PM',
  ];

  // Resolve target patient
  const selectedDependent = patientTarget === 'self' 
    ? null 
    : user?.dependents.find(d => d.id === patientTarget);

  const targetName = selectedDependent ? `${selectedDependent.fullName} (${selectedDependent.relation})` : (user?.fullName || 'Patient');
  const targetAge = selectedDependent ? selectedDependent.age : 48;
  const targetGender = selectedDependent ? selectedDependent.gender : 'Male';

  const handleBook = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const res = await api.bookAppointment({
        doctorId: doctor.id,
        patientId: patientTarget === 'self' ? user?.id : patientTarget,
        patientName: targetName,
        patientAge: targetAge,
        patientGender: targetGender,
        date: selectedDate,
        timeSlot: selectedSlot,
        type: consultType,
        symptoms: symptoms.trim() || 'General Medical Consultation',
        fee: doctor.consultationFee,
        paymentMethod,
      });

      if (res.success && res.appointment) {
        setConfirmedAppointment(res.appointment);
        setStep('confirmation');
        onSuccess(res.appointment);
        showNotification('Appointment successfully confirmed!');
      } else {
        setErrorMsg(res.message || 'Slot unavailable. Please pick another timing.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete appointment booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">
              {step === 'details' ? 'Schedule Doctor Appointment' : 'Appointment Confirmed'}
            </h2>
            <p className="text-xs text-slate-300">
              {doctor.fullName} · {doctor.specialization}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'details' ? (
            <>
              {/* Doctor Summary Header Card */}
              <div className="p-3.5 bg-sky-50/60 rounded-xl border border-sky-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{doctor.hospitalAffiliation}</p>
                  <p className="text-slate-500 mt-0.5">{doctor.city} · Council Reg: {doctor.registrationNumber}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Consultation Fee</span>
                  <span className="font-bold text-sm text-slate-900 tabular-nums">₹{doctor.consultationFee}</span>
                </div>
              </div>

              {/* Consultation Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2">1. Consultation Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConsultType('in-person')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${consultType === 'in-person' ? 'border-sky-600 bg-sky-50 text-sky-950 font-semibold shadow-xs' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}
                  >
                    <Building2 className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold">In-Person OPD Clinic</p>
                      <p className="text-[11px] text-slate-500 font-normal">Physical examination at clinic</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultType('telemedicine')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${consultType === 'telemedicine' ? 'border-sky-600 bg-sky-50 text-sky-950 font-semibold shadow-xs' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}
                  >
                    <Video className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold">Video Teleconsultation</p>
                      <p className="text-[11px] text-slate-500 font-normal">Encrypted digital call & Rx</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Patient Selector (Self or Family Dependents) */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2">2. Who is this consultation for?</label>
                <select
                  value={patientTarget}
                  onChange={e => setPatientTarget(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-xs text-slate-900 bg-white min-h-[44px]"
                >
                  <option value="self">Self ({user?.fullName || 'Rajesh Sharma'}) - 48 yrs, Male</option>
                  {user?.dependents.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} ({d.relation}) - {d.age} yrs, {d.gender}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Slot Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">3. Select Appointment Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">4. Available OPD Slots</label>
                  <select
                    value={selectedSlot}
                    onChange={e => setSelectedSlot(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white min-h-[44px]"
                  >
                    {AVAILABLE_SLOTS.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Symptoms / Reason for Consultation */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">5. Brief Symptoms / Medical Concern</label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value)}
                  placeholder="e.g. Mild chest heaviness post-walk, periodic fever since 2 days, routine diabetes checkup..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2">6. Payment Mode (₹{doctor.consultationFee})</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Card', 'Cash at OPD'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition cursor-pointer ${paymentMethod === m ? 'border-sky-600 bg-sky-50 text-sky-900 shadow-xs' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Step 2: Digital Appointment Confirmation Slip with QR Verification */
            confirmedAppointment && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-emerald-950">Appointment Successfully Confirmed!</h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Your appointment token and hospital slip has been generated.
                  </p>
                </div>

                {/* Digital Verification Slip */}
                <div className="p-5 rounded-2xl border border-slate-300 bg-slate-50/50 space-y-4 text-xs font-sans">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <p className="font-extrabold text-sm text-slate-900">SANJEEVANI OPD APPOINTMENT SLIP</p>
                      <p className="text-slate-500 text-[11px]">Token ID: {confirmedAppointment.id}</p>
                    </div>

                    {/* SVG Scannable QR Code */}
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-white rounded-lg border border-slate-300 shadow-xs">
                        <svg width="48" height="48" viewBox="0 0 29 29" className="shape-rendering-crispEdges">
                          {/* Corner Markers */}
                          <rect x="2" y="2" width="7" height="7" fill="#0f172a" />
                          <rect x="3" y="3" width="5" height="5" fill="#ffffff" />
                          <rect x="4" y="4" width="3" height="3" fill="#0f172a" />

                          <rect x="20" y="2" width="7" height="7" fill="#0f172a" />
                          <rect x="21" y="3" width="5" height="5" fill="#ffffff" />
                          <rect x="22" y="4" width="3" height="3" fill="#0f172a" />

                          <rect x="2" y="20" width="7" height="7" fill="#0f172a" />
                          <rect x="3" y="21" width="5" height="5" fill="#ffffff" />
                          <rect x="4" y="22" width="3" height="3" fill="#0f172a" />

                          {/* Data Matrix Dots */}
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
                      <div className="text-right">
                        <span className="font-mono text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md block">
                          {confirmedAppointment.qrVerificationCode}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Scan at OPD kiosk</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-400 text-[11px]">Patient Name</p>
                      <p className="font-bold text-slate-900">{confirmedAppointment.patientName}</p>
                      <p className="text-slate-500">{confirmedAppointment.patientAge} Yrs · {confirmedAppointment.patientGender}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[11px]">Doctor</p>
                      <p className="font-bold text-slate-900">{confirmedAppointment.doctorName}</p>
                      <p className="text-slate-500">{confirmedAppointment.doctorSpecialty}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[11px]">Date & Time Slot</p>
                      <p className="font-bold text-slate-900">{confirmedAppointment.date}</p>
                      <p className="text-sky-700 font-semibold">{confirmedAppointment.timeSlot}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[11px]">Consultation Type</p>
                      <p className="font-bold text-slate-900 uppercase">{confirmedAppointment.type}</p>
                      <p className="text-emerald-700 font-semibold">
                        ₹{confirmedAppointment.fee} ({confirmedAppointment.paymentMethod})
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                    <p><strong>Location:</strong> {confirmedAppointment.hospitalName}</p>
                    <p className="mt-1">
                      *Please arrive 15 minutes before slot or join the telemedicine room on this platform at the scheduled time.
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-between">
          {step === 'details' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleBook}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer min-h-[44px]"
              >
                {submitting ? 'Confirming Slot...' : `Confirm & Pay ₹${doctor.consultationFee}`}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center transition cursor-pointer min-h-[44px]"
            >
              Done / Return to Platform
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
