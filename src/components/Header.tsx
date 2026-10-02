import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IndianLanguage, UserRole } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  Globe, 
  MapPin, 
  Zap, 
  Eye, 
  Type, 
  Menu, 
  X,
  Phone,
  ShieldAlert,
  ChevronDown,
  LocateFixed,
  UserCheck,
  LogIn,
  LogOut,
  Stethoscope,
  Pill,
  ShieldCheck,
  User,
  Lock,
  Sparkles,
  QrCode,
  Camera
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

const CITIES_LIST = [
  { city: 'New Delhi', state: 'Delhi', pincode: '110001', district: 'Central Delhi', address: 'Connaught Place, Barakhamba Road' },
  { city: 'Mumbai', state: 'Maharashtra', pincode: '400001', district: 'Mumbai South', address: 'Nariman Point & Fort Area' },
  { city: 'Bengaluru', state: 'Karnataka', pincode: '560001', district: 'Bangalore Urban', address: 'MG Road & Indiranagar' },
  { city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', district: 'Chennai', address: 'George Town & Anna Salai' },
  { city: 'Kolkata', state: 'West Bengal', pincode: '700001', district: 'Kolkata', address: 'Park Street & BBD Bagh' },
  { city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001', district: 'Lucknow', address: 'Hazratganj & Gomti Nagar' },
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
    showNotification,
    openLoginForRole,
    setIsLoginModalOpen,
    openQrScanner,
    logout
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [accessDropdownOpen, setAccessDropdownOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

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
        updateLocation({
          lat: latitude,
          lng: longitude,
          address: `GPS Pin (${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E)`,
        });
        showNotification(`GPS detected (${latitude.toFixed(2)}, ${longitude.toFixed(2)}). Medical resources updated.`);
        setLocationDropdownOpen(false);
      },
      () => {
        setDetectingGps(false);
        showNotification('GPS unavailable. Defaulting to Delhi NCR health cluster.');
      },
      { timeout: 8000 }
    );
  };

  const navItems = [
    { id: 'doctors', label: t.findDoctor },
    { id: 'hospitals', label: t.findHospital },
    { id: 'telemedicine', label: t.telemedicine },
    { id: 'pharmacy', label: t.findPharmacy },
    { id: 'records', label: t.healthRecords },
    { id: 'healthguide', label: t.healthGuideAI },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Top Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-9">
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hidden sm:inline text-slate-400">
              National Emergency Helplines:
            </span>
            <div className="flex items-center gap-3 font-medium text-slate-200">
              <a href="tel:108" className="hover:text-white transition flex items-center gap-1">
                <span className="text-red-400 font-bold">108</span> Ambulance
              </a>
              <span className="text-slate-600">|</span>
              <a href="tel:112" className="hover:text-white transition flex items-center gap-1">
                <span className="text-red-400 font-bold">112</span> All Emergencies
              </a>
              <span className="text-slate-600 hidden md:inline">|</span>
              <a href="tel:14416" className="hidden md:inline hover:text-white transition">
                <span className="text-sky-400 font-bold">14416</span> Tele-MANAS
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            {/* Camera Medical QR Scanner Button */}
            <button
              onClick={() => openQrScanner('all')}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded transition cursor-pointer bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white border border-emerald-700/80 shadow-2xs font-medium"
              title="Scan Patient ABHA Card or Doctor Prescription QR code using camera"
            >
              <QrCode className="w-3 h-3 text-emerald-400" />
              <span>Scan QR</span>
            </button>

            {/* Low Bandwidth 2G Toggle */}
            <button
              onClick={() => setLowBandwidth(!lowBandwidth)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition cursor-pointer ${
                lowBandwidth 
                  ? 'bg-amber-600 text-white font-semibold' 
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Toggle low data usage mode for 2G / slow connections"
            >
              <Zap className="w-3 h-3" />
              <span>{lowBandwidth ? '2G Mode Active' : '2G Mode'}</span>
            </button>

            {/* Accessibility dropdown trigger */}
            <div className="relative">
              <button
                onClick={() => setAccessDropdownOpen(!accessDropdownOpen)}
                className="text-slate-300 hover:text-white flex items-center gap-1 py-0.5 cursor-pointer"
                title="Display settings"
              >
                <Type className="w-3 h-3" />
                <span className="hidden sm:inline">Text & Contrast</span>
                <ChevronDown className="w-2.5 h-2.5 opacity-60" />
              </button>

              {accessDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white text-slate-900 rounded-md shadow-lg border border-slate-200 p-2.5 z-50 text-xs">
                  <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-700">High Contrast</span>
                    <button
                      onClick={() => setHighContrast(!highContrast)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        highContrast ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {highContrast ? 'On' : 'Off'}
                    </button>
                  </div>
                  <div className="pt-2">
                    <span className="font-semibold text-slate-700 block mb-1.5">Text Size</span>
                    <div className="grid grid-cols-3 gap-1">
                      {(['normal', 'large', 'xlarge'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setTextSize(s)}
                          className={`py-1 rounded text-[11px] font-medium ${
                            textSize === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {s === 'normal' ? 'Default' : s === 'large' ? 'Large' : 'XL'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="text-slate-300 hover:text-white flex items-center gap-1 py-0.5 cursor-pointer"
                title="Change language"
              >
                <Globe className="w-3 h-3" />
                <span>{INDIAN_LANGUAGES_LIST.find(l => l.code === language)?.nativeName || 'English'}</span>
                <ChevronDown className="w-2.5 h-2.5 opacity-60" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-44 max-h-72 overflow-y-auto bg-white text-slate-900 rounded-md shadow-lg border border-slate-200 py-1 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-100">
                    SELECT LANGUAGE
                  </div>
                  {INDIAN_LANGUAGES_LIST.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-xs hover:bg-slate-50 cursor-pointer ${
                        language === lang.code ? 'font-bold text-sky-700 bg-sky-50' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      <span className="text-[10px] text-slate-400">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Separate Role Portal Login & Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition cursor-pointer text-[11px] ${
                  user?.role && user.role !== 'patient'
                    ? 'bg-sky-950 text-sky-200 border border-sky-800 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Select role to login separately"
              >
                {user?.role === 'doctor' ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <Stethoscope className="w-3 h-3 text-sky-400" />
                    <span className="truncate max-w-[130px]">{user.fullName} (Doctor)</span>
                  </>
                ) : user?.role === 'pharmacy' ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <Pill className="w-3 h-3 text-teal-400" />
                    <span className="truncate max-w-[130px]">Pharmacy Staff</span>
                  </>
                ) : user?.role === 'admin' ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <ShieldCheck className="w-3 h-3 text-rose-400" />
                    <span>Administrator</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-3 h-3 text-emerald-400" />
                    <span>Portal Login / Sign In</span>
                  </>
                )}
                <ChevronDown className="w-2.5 h-2.5 opacity-70" />
              </button>

              {loginDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white text-slate-900 rounded-md shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-100 flex items-center justify-between">
                    <span>SEPARATE ROLE LOGINS</span>
                    <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-semibold">NMC / ABDM</span>
                  </div>

                  <button
                    onClick={() => {
                      openLoginForRole('doctor');
                      setLoginDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-sky-50 transition cursor-pointer flex items-start gap-2.5 ${activeRole === 'doctor' ? 'bg-sky-50/70 border-l-2 border-sky-800' : ''}`}
                  >
                    <div className="w-6 h-6 rounded bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Stethoscope className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">Doctor Login</span>
                      <span className="text-[10px] text-slate-500 block leading-tight">NMC Practitioner / OPD Consultation Console</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      openLoginForRole('patient');
                      setLoginDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-emerald-50 transition cursor-pointer flex items-start gap-2.5 ${activeRole === 'patient' ? 'bg-emerald-50/70 border-l-2 border-emerald-800' : ''}`}
                  >
                    <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">Patient / Citizen Login</span>
                      <span className="text-[10px] text-slate-500 block leading-tight">ABHA ID · Health Records & Bookings</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      openLoginForRole('pharmacy');
                      setLoginDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-teal-50 transition cursor-pointer flex items-start gap-2.5 ${activeRole === 'pharmacy' ? 'bg-teal-50/70 border-l-2 border-teal-800' : ''}`}
                  >
                    <div className="w-6 h-6 rounded bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Pill className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">Pharmacy Staff Login</span>
                      <span className="text-[10px] text-slate-500 block leading-tight">PMBJP Jan Aushadhi Dispenser & Inventory</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      openLoginForRole('admin');
                      setLoginDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-rose-50 transition cursor-pointer flex items-start gap-2.5 ${activeRole === 'admin' ? 'bg-rose-50/70 border-l-2 border-rose-800' : ''}`}
                  >
                    <div className="w-6 h-6 rounded bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">Platform Administrator</span>
                      <span className="text-[10px] text-slate-500 block leading-tight">NHA Medical Audits & Provider Verification</span>
                    </div>
                  </button>

                  {user?.role && user.role !== 'patient' && (
                    <div className="pt-1 mt-1 border-t border-slate-100 px-2">
                      <button
                        onClick={() => {
                          logout();
                          setLoginDropdownOpen(false);
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs text-red-700 hover:bg-red-50 rounded flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of {activeRole.toUpperCase()} Portal</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Brand & Location */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('home')}
              className="text-left cursor-pointer focus:outline-hidden"
            >
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  {t.brandName}
                </span>
                <span className="text-[10px] font-semibold text-sky-800 uppercase tracking-wider hidden sm:inline">
                  National Health
                </span>
              </div>
            </button>

            {/* Location selector button */}
            <div className="relative">
              <button 
                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                className="flex items-center gap-1.5 text-xs text-slate-600 pl-3 border-l border-slate-200 hover:text-slate-900 py-1 transition cursor-pointer"
                title="Change city or auto-detect GPS location"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-800">{user?.location.city || 'New Delhi'}</span>
                <span className="text-slate-400 font-mono text-[11px]">({user?.location.pincode || '110001'})</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {locationDropdownOpen && (
                <div className="absolute left-3 mt-2 w-64 bg-white text-slate-900 rounded-md shadow-lg border border-slate-200 py-2 z-50 text-xs">
                  <div className="px-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Your Location</span>
                    <button
                      onClick={handleDetectGPS}
                      disabled={detectingGps}
                      className="text-sky-700 hover:text-sky-900 font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50 text-[11px]"
                    >
                      <LocateFixed className={`w-3 h-3 ${detectingGps ? 'animate-spin' : ''}`} />
                      <span>{detectingGps ? 'Locating...' : 'Use GPS'}</span>
                    </button>
                  </div>

                  <div className="py-1 max-h-56 overflow-y-auto">
                    <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                      Select City
                    </p>
                    {CITIES_LIST.map(item => (
                      <button
                        key={item.city}
                        onClick={() => {
                          updateLocation(item);
                          setLocationDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                          user?.location.city === item.city ? 'bg-sky-50 text-sky-800 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="text-xs">{item.city}</p>
                          <p className="text-[10px] text-slate-400">{item.state}</p>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">{item.pincode}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Primary Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-slate-600">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`py-1 hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === item.id 
                    ? 'text-sky-800 font-semibold border-b-2 border-sky-800' 
                    : 'text-slate-600'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* More Services Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`py-1 hover:text-slate-900 transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  ['labs', 'blood', 'reminders', 'schemes'].includes(activeTab)
                    ? 'text-sky-800 font-semibold border-b-2 border-sky-800'
                    : 'text-slate-600'
                }`}
              >
                <span>More</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {moreDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                  {[
                    { id: 'labs', label: t.findLabs },
                    { id: 'blood', label: t.bloodBanks },
                    { id: 'reminders', label: t.medReminders },
                    { id: 'schemes', label: t.govtSchemes },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setActiveTab(m.id as any);
                        setMoreDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 hover:bg-slate-50 cursor-pointer ${
                        activeTab === m.id ? 'bg-sky-50 text-sky-800 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right Action: PWA + Login + High Visibility Emergency Help */}
          <div className="flex items-center gap-2.5">
            <div className="hidden md:block">
              <PWAInstallButton />
            </div>

            {/* Live Camera QR Scanner Trigger */}
            <button
              onClick={() => openQrScanner('all')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition cursor-pointer shadow-2xs btn-press"
              title="Open camera to scan Patient Medical Record or Pharmacy Prescription QR"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Scan Medical QR</span>
              <span className="sm:hidden">Scan QR</span>
            </button>

            {/* Direct Role Login Button in Main Navbar */}
            {user?.role && user.role !== 'patient' ? (
              <button
                onClick={() => {
                  if (user.role === 'doctor') setActiveTab('doctor_portal');
                  else if (user.role === 'pharmacy') setActiveTab('pharmacy_portal');
                  else if (user.role === 'admin') setActiveTab('admin_portal');
                  else setActiveTab('hospital_portal');
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-900 transition cursor-pointer btn-press"
                title="Go to my active portal workstation"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {user.role === 'doctor' ? (
                  <>
                    <Stethoscope className="w-3.5 h-3.5 text-sky-800" />
                    <span>Doctor Workstation</span>
                  </>
                ) : user.role === 'pharmacy' ? (
                  <>
                    <Pill className="w-3.5 h-3.5 text-teal-800" />
                    <span>Pharmacy Console</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-800" />
                    <span>Admin Command</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => openLoginForRole('doctor')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition cursor-pointer btn-press shadow-xs"
                title="Sign in separately as Doctor, Patient, Pharmacy Staff, or Platform Administrator"
              >
                <LogIn className="w-3.5 h-3.5 text-sky-800" />
                <span>Doctor / Staff Login</span>
              </button>
            )}

            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 active:bg-red-900 rounded transition cursor-pointer flex items-center gap-1.5 tracking-tight btn-press"
            >
              <Phone className="w-3.5 h-3.5 fill-white shrink-0" />
              <span>EMERGENCY 108</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-2 space-y-1">
            <button
              onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs font-medium rounded ${
                activeTab === 'home' ? 'bg-sky-50 text-sky-800 font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Home Overview
            </button>
            <button
              onClick={() => { openQrScanner('all'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-bold rounded bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Scan Medical QR / Prescription</span>
            </button>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs font-medium rounded ${
                  activeTab === item.id ? 'bg-sky-50 text-sky-800 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            {[
              { id: 'labs', label: t.findLabs },
              { id: 'blood', label: t.bloodBanks },
              { id: 'reminders', label: t.medReminders },
              { id: 'schemes', label: t.govtSchemes },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs font-medium rounded ${
                  activeTab === item.id ? 'bg-sky-50 text-sky-800 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Separate Role Portals Login on Mobile */}
            <div className="pt-2 pb-1 border-t border-slate-200 mt-2">
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Separate Role Portal Logins
              </span>
              <div className="grid grid-cols-2 gap-1.5 px-2">
                <button
                  onClick={() => { openLoginForRole('doctor'); setMobileMenuOpen(false); }}
                  className="p-2 rounded bg-sky-50 hover:bg-sky-100 text-sky-900 text-xs font-bold flex items-center gap-1.5 text-left transition cursor-pointer"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                  <span>Doctor Login</span>
                </button>
                <button
                  onClick={() => { openLoginForRole('patient'); setMobileMenuOpen(false); }}
                  className="p-2 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5 text-left transition cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Patient Login</span>
                </button>
                <button
                  onClick={() => { openLoginForRole('pharmacy'); setMobileMenuOpen(false); }}
                  className="p-2 rounded bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold flex items-center gap-1.5 text-left transition cursor-pointer"
                >
                  <Pill className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span>Pharmacy Login</span>
                </button>
                <button
                  onClick={() => { openLoginForRole('admin'); setMobileMenuOpen(false); }}
                  className="p-2 rounded bg-rose-50 hover:bg-rose-100 text-rose-900 text-xs font-bold flex items-center gap-1.5 text-left transition cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                  <span>Admin Login</span>
                </button>
              </div>

              {user?.role && user.role !== 'patient' && (
                <div className="px-2 pt-2">
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full p-2 rounded bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out of {user.role.toUpperCase()} Portal</span>
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-3">
              <PWAInstallButton />
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
