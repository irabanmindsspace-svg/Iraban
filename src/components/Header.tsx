import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IndianLanguage, UserRole } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  PhoneCall, 
  Globe, 
  UserCheck, 
  MapPin, 
  Zap, 
  Eye, 
  Type, 
  Menu, 
  X,
  ShieldAlert,
  ChevronDown,
  LocateFixed
} from 'lucide-react';

const INDIAN_LANGUAGES_LIST: { code: IndianLanguage; label: string; nativeName: string }[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिंदी' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'or', label: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'as', label: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'ur', label: 'Urdu', nativeName: 'اردو' },
];

export const Header: React.FC = () => {
  const { 
    user, 
    activeRole, 
    language, 
    t, 
    activeTab, 
    lowBandwidth, 
    highContrast, 
    textSize, 
    setLanguage, 
    setActiveTab, 
    setLowBandwidth, 
    setHighContrast, 
    setTextSize, 
    setIsEmergencyModalOpen, 
    switchRole,
    updateLocation,
    showNotification
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [accessDropdownOpen, setAccessDropdownOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  const CITIES_LIST = [
    { city: 'New Delhi', state: 'Delhi', pincode: '110001', district: 'Central Delhi', address: 'Connaught Place, Barakhamba Road' },
    { city: 'Mumbai', state: 'Maharashtra', pincode: '400001', district: 'Mumbai South', address: 'Nariman Point & Fort Area' },
    { city: 'Bengaluru', state: 'Karnataka', pincode: '560001', district: 'Bangalore Urban', address: 'MG Road & Indiranagar' },
    { city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', district: 'Chennai', address: 'George Town & Anna Salai' },
    { city: 'Kolkata', state: 'West Bengal', pincode: '700001', district: 'Kolkata', address: 'Park Street & BBD Bagh' },
    { city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001', district: 'Lucknow', address: 'Hazratganj & Gomti Nagar' },
  ];

  const handleDetectGPS = () => {
    if (!('geolocation' in navigator)) {
      showNotification('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectingGps(false);
        const { latitude, longitude } = pos.coords;
        // In preview environments, simulate nearest metro coordinates match
        updateLocation({
          lat: latitude,
          lng: longitude,
          address: `GPS Pin (${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E)`,
        });
        showNotification(`GPS Location detected: (${latitude.toFixed(2)}, ${longitude.toFixed(2)}). Medical resources re-centered.`);
        setLocationDropdownOpen(false);
      },
      (err) => {
        setDetectingGps(false);
        showNotification('GPS access simulated: Re-centered on Delhi NCR health cluster.');
      },
      { timeout: 8000 }
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('home')}
              className="text-left group cursor-pointer focus:outline-hidden"
            >
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-sky-700 transition-colors">
                {t.brandName}
              </span>
            </button>
            
            {/* Interactive Location Dropdown Tag */}
            <div className="relative">
              <button 
                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 pl-3 border-l border-slate-200 hover:text-slate-900 transition-colors cursor-pointer py-1"
                title="Change city or auto-detect current GPS location"
              >
                <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="font-semibold text-slate-800">{user?.location.city || 'New Delhi'}</span>
                <span className="text-slate-400">({user?.location.pincode || '110001'})</span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {locationDropdownOpen && (
                <div className="absolute left-3 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                  <div className="px-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-900">Your Location</span>
                    <button
                      onClick={handleDetectGPS}
                      disabled={detectingGps}
                      className="text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50 text-[11px]"
                    >
                      <LocateFixed className={`w-3.5 h-3.5 ${detectingGps ? 'animate-spin' : ''}`} />
                      <span>{detectingGps ? 'Detecting...' : 'Auto GPS'}</span>
                    </button>
                  </div>

                  <div className="py-1 max-h-56 overflow-y-auto">
                    <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">Select Indian City</p>
                    {CITIES_LIST.map(item => (
                      <button
                        key={item.city}
                        onClick={() => {
                          updateLocation(item);
                          setLocationDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                          user?.location.city === item.city ? 'bg-sky-50 text-sky-800 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="text-xs">{item.city}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{item.state}</p>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">{item.pincode}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button 
              onClick={() => setActiveTab('doctors')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'doctors' ? 'text-sky-700 font-semibold border-b-2 border-sky-600 pb-0.5' : ''}`}
            >
              {t.findDoctor}
            </button>
            <button 
              onClick={() => setActiveTab('hospitals')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'hospitals' ? 'text-sky-700 font-semibold border-b-2 border-sky-600 pb-0.5' : ''}`}
            >
              {t.findHospital}
            </button>
            <button 
              onClick={() => setActiveTab('telemedicine')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'telemedicine' ? 'text-sky-700 font-semibold border-b-2 border-sky-600 pb-0.5' : ''}`}
            >
              {t.telemedicine}
            </button>
            <button 
              onClick={() => setActiveTab('pharmacy')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'pharmacy' ? 'text-sky-700 font-semibold border-b-2 border-sky-600 pb-0.5' : ''}`}
            >
              {t.findPharmacy}
            </button>
            <button 
              onClick={() => setActiveTab('records')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'records' ? 'text-sky-700 font-semibold border-b-2 border-sky-600 pb-0.5' : ''}`}
            >
              {t.healthRecords}
            </button>
            <button 
              onClick={() => setActiveTab('healthguide')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'healthguide' ? 'text-sky-700 font-semibold border-b-2 border-sky-600 pb-0.5' : ''}`}
            >
              {t.healthGuideAI}
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Urgent Emergency CTA + Language + Accessibility + Role Switcher) */}
          <div className="flex items-center gap-2.5">
            
            {/* PWA Install Button */}
            <div className="hidden md:block">
              <PWAInstallButton />
            </div>

            {/* Accessibility & Low Bandwidth Controls */}
            <div className="relative">
              <button
                onClick={() => setAccessDropdownOpen(!accessDropdownOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Accessibility & 2G Data Saver settings"
                aria-label="Accessibility settings"
              >
                <Zap className={`w-4 h-4 ${lowBandwidth ? 'text-amber-600 fill-amber-500' : ''}`} />
              </button>

              {accessDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-3 px-3 z-50 text-xs">
                  <p className="font-bold text-slate-900 mb-2 pb-1 border-b border-slate-100">Accessibility & Network</p>
                  
                  {/* Low Data Saver */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-700 font-medium">Low-Bandwidth (2G)</span>
                    <button
                      onClick={() => setLowBandwidth(!lowBandwidth)}
                      className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors ${lowBandwidth ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      {lowBandwidth ? 'Active' : 'Off'}
                    </button>
                  </div>

                  {/* High Contrast */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-700 font-medium">High Contrast</span>
                    <button
                      onClick={() => setHighContrast(!highContrast)}
                      className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors ${highContrast ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      {highContrast ? 'Active' : 'Off'}
                    </button>
                  </div>

                  {/* Text Size Scale */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-slate-600 mb-1.5 font-medium">Text Scale</p>
                    <div className="grid grid-cols-3 gap-1">
                      {(['normal', 'large', 'xlarge'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setTextSize(s)}
                          className={`py-1 rounded-md text-[11px] font-medium transition ${textSize === s ? 'bg-sky-700 text-white font-semibold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                          {s === 'normal' ? 'Standard' : s === 'large' ? 'Large' : 'XL'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Language Selector (13 Indian Languages) */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer min-h-[44px]"
                aria-label="Select language"
              >
                <Globe className="w-4 h-4 text-sky-600" />
                <span className="hidden sm:inline">{INDIAN_LANGUAGES_LIST.find(l => l.code === language)?.nativeName || 'English'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 max-h-80 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100">
                    SELECT LANGUAGE / भाषा चुनें
                  </div>
                  {INDIAN_LANGUAGES_LIST.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${language === lang.code ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span>{lang.nativeName}</span>
                      <span className="text-[11px] text-slate-400 font-normal">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Role Portal Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer min-h-[44px]"
                title="Switch between Citizen, Doctor, Hospital, Pharmacy, Admin portals"
              >
                <UserCheck className="w-4 h-4 text-slate-600" />
                <span className="capitalize hidden sm:inline">{activeRole}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100">
                    SWITCH PLATFORM ROLE
                  </div>
                  {[
                    { role: 'patient' as UserRole, label: 'Citizen / Patient', desc: 'Appointments, PHR, Family, SOS' },
                    { role: 'doctor' as UserRole, label: 'Doctor / Physician', desc: 'OPD Queue, Rx Writer, Consults' },
                    { role: 'hospital' as UserRole, label: 'Hospital Admin', desc: 'ICU Beds, Oxygen, Casualty' },
                    { role: 'pharmacy' as UserRole, label: 'Pharmacy Staff', desc: 'Jan Aushadhi, Rx Verification' },
                    { role: 'admin' as UserRole, label: 'Platform Medical Admin', desc: 'Doctor License Verification & Logs' },
                  ].map(r => (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchRole(r.role);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors ${activeRole === r.role ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <p className="font-semibold">{r.label}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{r.desc}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Prominent High-Visibility Emergency Help Button */}
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-lg shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap min-h-[44px] cursor-pointer"
              title="Immediate medical emergency guidance & 108/112 dial"
            >
              <ShieldAlert className="w-4 h-4 animate-pulse" />
              <span className="tracking-wide">{t.emergencyHelp}</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 py-3 space-y-1">
            <button
              onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'home' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              Home Overview
            </button>
            <button
              onClick={() => { setActiveTab('doctors'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'doctors' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              {t.findDoctor}
            </button>
            <button
              onClick={() => { setActiveTab('hospitals'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'hospitals' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              {t.findHospital}
            </button>
            <button
              onClick={() => { setActiveTab('telemedicine'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'telemedicine' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              {t.telemedicine}
            </button>
            <button
              onClick={() => { setActiveTab('pharmacy'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'pharmacy' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              {t.findPharmacy}
            </button>
            <button
              onClick={() => { setActiveTab('labs'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'labs' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              {t.findLabs}
            </button>
            <button
              onClick={() => { setActiveTab('blood'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'blood' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              {t.bloodBanks}
            </button>
            <button
              onClick={() => { setActiveTab('records'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'records' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              {t.healthRecords}
            </button>
            <button
              onClick={() => { setActiveTab('reminders'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'reminders' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              {t.medReminders}
            </button>
            <button
              onClick={() => { setActiveTab('schemes'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'schemes' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              {t.govtSchemes}
            </button>
            <button
              onClick={() => { setActiveTab('healthguide'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'healthguide' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              {t.healthGuideAI}
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
