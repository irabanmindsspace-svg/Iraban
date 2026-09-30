import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { OfflineIndicator } from './components/OfflineIndicator';
import { EmergencyModal } from './components/EmergencyModal';
import { HomeOverview } from './components/HomeOverview';
import { DoctorSearch } from './components/DoctorSearch';
import { HospitalSearch } from './components/HospitalSearch';
import { AppointmentBookingModal } from './components/AppointmentBookingModal';
import { TelemedicineRoom } from './components/TelemedicineRoom';
import { HealthRecordsView } from './components/HealthRecordsView';
import { PharmacyDirectory } from './components/PharmacyDirectory';
import { LabTestsDirectory } from './components/LabTestsDirectory';
import { BloodBankDirectory } from './components/BloodBankDirectory';
import { GovernmentSchemesView } from './components/GovernmentSchemesView';
import { MedicationReminders } from './components/MedicationReminders';
import { HealthGuideAI } from './components/HealthGuideAI';
import { DoctorDashboard } from './components/DoctorDashboard';
import { HospitalAdminDashboard } from './components/HospitalAdminDashboard';
import { PharmacyDashboard } from './components/PharmacyDashboard';
import { AdminVerificationDashboard } from './components/AdminVerificationDashboard';
import { Doctor, Appointment } from './types';
import { 
  Home, 
  Stethoscope, 
  Building2, 
  Video, 
  Pill, 
  FileText, 
  ShieldAlert, 
  Bot, 
  Heart,
  Phone,
  CheckCircle2,
  Clock
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    activeRole, 
    lowBandwidth, 
    highContrast, 
    textSize, 
    notificationMessage,
    setIsEmergencyModalOpen,
    selectedDoctorForBooking,
    setSelectedDoctorForBooking,
    t
  } = useApp();

  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [activeTelemedicineSession, setActiveTelemedicineSession] = useState<Appointment | null>(null);

  const activeDoctorForBooking = bookingDoctor || selectedDoctorForBooking;

  // Dynamic font sizing classes
  const textSizeClass = textSize === 'xlarge' 
    ? 'text-lg' 
    : textSize === 'large' 
      ? 'text-base' 
      : 'text-sm';

  const contrastClass = highContrast 
    ? 'contrast-125 saturate-150' 
    : '';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${highContrast ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'} ${contrastClass}`}>
      
      {/* Toast Notification */}
      {notificationMessage && (
        <div className="fixed top-16 right-4 z-50 bg-slate-900 text-white text-xs font-medium px-3.5 py-2.5 rounded-md shadow-lg border border-slate-700 flex items-center gap-2 max-w-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="leading-snug">{notificationMessage}</span>
        </div>
      )}

      {/* Offline Connectivity Warning */}
      <OfflineIndicator />

      {/* Emergency Modal */}
      <EmergencyModal />

      {/* Booking Modal */}
      {activeDoctorForBooking && (
        <AppointmentBookingModal
          doctor={activeDoctorForBooking}
          onClose={() => {
            setBookingDoctor(null);
            setSelectedDoctorForBooking(null);
          }}
          onSuccess={(apt) => {
            setBookingDoctor(null);
            setSelectedDoctorForBooking(null);
            if (apt.type === 'telemedicine') {
              setActiveTelemedicineSession(apt);
            }
          }}
        />
      )}

      {/* Universal Top Bar */}
      <Header />

      {/* Main Viewport Container */}
      <main className={`flex-1 pb-20 lg:pb-10 ${textSizeClass}`}>
        {activeTab === 'home' && <HomeOverview />}
        {activeTab === 'doctors' && (
          <DoctorSearch 
            onSelectDoctorForBooking={(doc) => setBookingDoctor(doc)} 
          />
        )}
        {activeTab === 'hospitals' && <HospitalSearch />}
        {activeTab === 'telemedicine' && (
          <TelemedicineRoom 
            appointment={activeTelemedicineSession || undefined}
            onEndCall={() => setActiveTab('home')}
          />
        )}
        {activeTab === 'pharmacy' && <PharmacyDirectory />}
        {activeTab === 'labs' && <LabTestsDirectory />}
        {activeTab === 'blood' && <BloodBankDirectory />}
        {activeTab === 'records' && <HealthRecordsView />}
        {activeTab === 'reminders' && <MedicationReminders />}
        {activeTab === 'schemes' && <GovernmentSchemesView />}
        {activeTab === 'healthguide' && <HealthGuideAI />}
        
        {/* Role Specific Portals */}
        {activeTab === 'doctor_portal' && <DoctorDashboard />}
        {activeTab === 'hospital_portal' && <HospitalAdminDashboard />}
        {activeTab === 'pharmacy_portal' && <PharmacyDashboard />}
        {activeTab === 'admin_portal' && <AdminVerificationDashboard />}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (Natural Thumb Zone) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-xs">
        <div className="grid grid-cols-5 items-center h-14 px-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition ${activeTab === 'home' ? 'text-sky-800 font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('doctors')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition ${activeTab === 'doctors' ? 'text-sky-800 font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Stethoscope className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">Doctors</span>
          </button>

          {/* Center SOS Button */}
          <button
            onClick={() => setIsEmergencyModalOpen(true)}
            className="flex flex-col items-center justify-center h-full cursor-pointer"
          >
            <div className="px-2.5 py-1 rounded bg-red-700 hover:bg-red-800 active:bg-red-900 text-white font-bold flex items-center gap-1 shadow-xs">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="text-[11px] tracking-tight">108 SOS</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('telemedicine')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition ${activeTab === 'telemedicine' ? 'text-sky-800 font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Video className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">Video OPD</span>
          </button>

          <button
            onClick={() => setActiveTab('healthguide')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition ${activeTab === 'healthguide' ? 'text-sky-800 font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Bot className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">Care Guide</span>
          </button>
        </div>
      </nav>

      {/* Accessible Footer */}
      <footer className="hidden lg:block bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-base">{t.brandName}</span>
              <span className="text-slate-400">·</span>
              <span>National Medical Assistance & Emergency Network</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 font-semibold text-slate-700">
              <a href="tel:108" className="hover:text-rose-600 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-rose-600" /> Ambulance: 108
              </a>
              <a href="tel:112" className="hover:text-rose-600 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-rose-600" /> National Emergency: 112
              </a>
              <a href="tel:14416" className="hover:text-sky-600 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-sky-600" /> Tele-MANAS: 14416
              </a>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-100">
            {t.disclaimer} Digital health records and teleconsultations adhere to the Indian Telemedicine Practice Guidelines (2020), Ayushman Bharat Digital Mission (ABDM), and DISHA standards.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
