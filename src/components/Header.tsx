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
  UserCheck
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
    showNotification
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
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

            {/* Portal View Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="text-slate-300 hover:text-white flex items-center gap-1 py-0.5 cursor-pointer"
                title="Switch portal perspective"
              >
                <UserCheck className="w-3 h-3 text-slate-400" />
                <span className="capitalize font-medium">{activeRole} Portal</span>
                <ChevronDown className="w-2.5 h-2.5 opacity-60" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white text-slate-900 rounded-md shadow-lg border border-slate-200 py-1 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-100">
                    PORTAL VIEW
                  </div>
                  {[
                    { role: 'patient' as UserRole, label: 'Citizen / Patient', desc: 'Appointments & health vault' },
                    { role: 'doctor' as UserRole, label: 'Doctor / Physician', desc: 'OPD queue & digital Rx' },
                    { role: 'hospital' as UserRole, label: 'Hospital Administration', desc: 'Beds, ICU & oxygen monitor' },
                    { role: 'pharmacy' as UserRole, label: 'Pharmacy Staff', desc: 'Jan Aushadhi & Rx verify' },
                    { role: 'admin' as UserRole, label: 'Platform Administrator', desc: 'Practitioner verification & audit' },
                  ].map(r => (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchRole(r.role);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer ${
                        activeRole === r.role ? 'bg-sky-50 font-semibold text-sky-800' : 'text-slate-700'
                      }`}
                    >
                      <p className="font-medium">{r.label}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{r.desc}</p>
                    </button>
                  ))}
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

          {/* Right Action: PWA + High Visibility Emergency Help */}
          <div className="flex items-center gap-2.5">
            <div className="hidden md:block">
              <PWAInstallButton />
            </div>

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
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-3">
              <PWAInstallButton />
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
