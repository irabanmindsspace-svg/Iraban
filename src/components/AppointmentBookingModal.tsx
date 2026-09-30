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
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-slate-300 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold">
              {step === 'details' ? 'Schedule Doctor Consultation' : 'OPD Appointment Confirmed'}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {doctor.fullName} · {doctor.specialization}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded transition min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer btn-press"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'details' ? (
            <>
              {/* Doctor Summary Header Card */}
              <div className="p-3.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{doctor.hospitalAffiliation}</p>
                  <p className="text-slate-500 mt-0.5">{doctor.city} · State Medical Council Reg: {doctor.registrationNumber}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-medium block">Consultation Fee</span>
                  <span className="font-bold text-sm text-slate-900 tabular-nums">₹{doctor.consultationFee}</span>
                </div>
              </div>

              {/* Consultation Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wide">
                  1. Consultation Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConsultType('in-person')}
                    className={`p-3 rounded border text-left flex items-start gap-2.5 transition cursor-pointer btn-press ${consultType === 'in-person' ? 'border-sky-600 bg-sky-50 text-slate-900 font-semibold' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}
                  >
                    <Building2 className="w-4 h-4 text-sky-800 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold">In-Person OPD Clinic</p>
                      <p className="text-[11px] text-slate-500 font-normal">Physical examination at clinic</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultType('telemedicine')}
                    className={`p-3 rounded border text-left flex items-start gap-2.5 transition cursor-pointer btn-press ${consultType === 'telemedicine' ? 'border-sky-600 bg-sky-50 text-slate-900 font-semibold' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}
                  >
                    <Video className="w-4 h-4 text-sky-800 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold">Video Teleconsultation</p>
                      <p className="text-[11px] text-slate-500 font-normal">Encrypted digital call & Rx</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Patient Selector (Self or Family Dependents) */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wide">
                  2. Patient
                </label>
                <select
                  value={patientTarget}
                  onChange={e => setPatientTarget(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-hidden focus:border-sky-600 text-xs text-slate-900 bg-white min-h-[40px]"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1 uppercase tracking-wide">
                    3. Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 rounded border border-slate-300 text-xs text-slate-900 min-h-[40px] focus:outline-hidden focus:border-sky-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1 uppercase tracking-wide">
                    4. Available OPD Slots
                  </label>
                  <select
                    value={selectedSlot}
                    onChange={e => setSelectedSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 text-xs text-slate-900 bg-white min-h-[40px] focus:outline-hidden focus:border-sky-600"
                  >
                    {AVAILABLE_SLOTS.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Symptoms / Reason for Consultation */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1 uppercase tracking-wide">
                  5. Brief Symptoms / Chief Complaint
                </label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value)}
                  placeholder="e.g. Mild chest heaviness post-walk, periodic fever since 2 days, routine diabetes checkup..."
                  className="w-full px-3 py-2 rounded border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-sky-600"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wide">
                  6. Payment Mode (₹{doctor.consultationFee})
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Card', 'Cash at OPD'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2.5 rounded border text-center text-xs font-semibold transition cursor-pointer btn-press ${paymentMethod === m ? 'border-sky-600 bg-sky-50 text-sky-950 font-bold' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
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
                <div className="p-3.5 bg-emerald-50 rounded border border-emerald-200 text-center">
                  <CheckCircle className="w-6 h-6 text-emerald-700 mx-auto mb-1.5" />
                  <h3 className="text-sm font-bold text-emerald-950">Appointment Successfully Confirmed</h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Your appointment token and hospital slip has been generated.
                  </p>
                </div>

                {/* Digital Verification Slip */}
                <div className="p-5 rounded border border-slate-300 bg-white space-y-4 text-xs font-sans">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <p className="font-bold text-sm text-slate-900 tracking-tight">SANJEEVANI OPD APPOINTMENT SLIP</p>
                      <p className="text-slate-500 text-[11px] font-mono mt-0.5">Token ID: {confirmedAppointment.id}</p>
                    </div>

                    {/* SVG Scannable QR Code */}
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-white rounded border border-slate-300">
                        <svg width="44" height="44" viewBox="0 0 29 29" className="shape-rendering-crispEdges">
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
                          <rect x="13" y="11" width="3" height="3" fill="#0369a1" />
                          <rect x="18" y="11" width="2" height="2" fill="#0f172a" />
                          <rect x="11" y="15" width="2" height="2" fill="#0f172a" />
                          <rect x="15" y="16" width="3" height="3" fill="#0f172a" />
                          <rect x="20" y="18" width="2" height="2" fill="#0f172a" />
                          <rect x="11" y="22" width="2" height="2" fill="#0f172a" />
                          <rect x="15" y="23" width="2" height="2" fill="#0f172a" />
                          <rect x="22" y="22" width="3" height="3" fill="#0369a1" />
                        </svg>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[10px] font-bold text-sky-900 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded block">
                          {confirmedAppointment.qrVerificationCode}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Scan at OPD kiosk</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-400 text-[11px] font-medium">Patient</p>
                      <p className="font-bold text-slate-900">{confirmedAppointment.patientName}</p>
                      <p className="text-slate-500">{confirmedAppointment.patientAge} Yrs · {confirmedAppointment.patientGender}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[11px] font-medium">Consulting Doctor</p>
                      <p className="font-bold text-slate-900">{confirmedAppointment.doctorName}</p>
                      <p className="text-slate-500">{confirmedAppointment.doctorSpecialty}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[11px] font-medium">Date & Time Slot</p>
                      <p className="font-bold text-slate-900">{confirmedAppointment.date}</p>
                      <p className="text-sky-800 font-semibold">{confirmedAppointment.timeSlot}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[11px] font-medium">Type & Payment</p>
                      <p className="font-bold text-slate-900 uppercase">{confirmedAppointment.type}</p>
                      <p className="text-emerald-800 font-semibold">
                        ₹{confirmedAppointment.fee} ({confirmedAppointment.paymentMethod})
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                    <p><strong>Hospital / Clinic:</strong> {confirmedAppointment.hospitalName}</p>
                    <p className="mt-1">
                      Please arrive 15 minutes before slot or join the telemedicine room on this platform at scheduled time.
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          {step === 'details' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded text-xs font-medium text-slate-700 hover:bg-slate-200 transition cursor-pointer min-h-[38px] btn-press"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleBook}
                disabled={submitting}
                className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-1.5 transition cursor-pointer min-h-[38px] btn-press"
              >
                {submitting ? 'Confirming Slot...' : `Confirm & Pay ₹${doctor.consultationFee}`}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs text-center transition cursor-pointer min-h-[38px] btn-press"
            >
              Return to Platform
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
