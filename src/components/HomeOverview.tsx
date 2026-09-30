import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { InteractiveMap } from './InteractiveMap';
import { SymptomTriageBodyMap } from './SymptomTriageBodyMap';
import { SavingsCalculator } from './SavingsCalculator';
import { api } from '../services/api';
import { Doctor } from '../types';
import { 
  ShieldAlert, 
  Stethoscope, 
  Building2, 
  Video, 
  Pill, 
  TestTube2, 
  FileText, 
  Users, 
  Award, 
  Heart, 
  ArrowRight, 
  Clock, 
  MapPin, 
  CheckCircle,
  Search,
  Bed,
  Activity,
  Ambulance,
  Calendar,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Flame,
  Check,
  CheckCircle2,
  Sparkles,
  Thermometer,
  QrCode,
  Droplet,
  HeartPulse,
  Share2,
  Download,
  X,
  Plus,
  Minus,
  Sliders,
  Radio
} from 'lucide-react';

interface CityStats {
  generalBeds: number;
  icuBeds: number;
  ambulances: number;
  kendras: number;
  state: string;
  district: string;
  bloodUnits: Record<string, number>;
}

const REGIONAL_STATS: Record<string, CityStats> = {
  'New Delhi': { 
    generalBeds: 379, 
    icuBeds: 42, 
    ambulances: 35, 
    kendras: 48, 
    state: 'Delhi', 
    district: 'Central Delhi',
    bloodUnits: { 'A+': 34, 'B+': 52, 'O+': 46, 'AB+': 18, 'O-': 8, 'B-': 6 }
  },
  'Mumbai': { 
    generalBeds: 412, 
    icuBeds: 58, 
    ambulances: 40, 
    kendras: 62, 
    state: 'Maharashtra', 
    district: 'Mumbai Suburban',
    bloodUnits: { 'A+': 41, 'B+': 64, 'O+': 38, 'AB+': 22, 'O-': 11, 'B-': 9 }
  },
  'Bengaluru': { 
    generalBeds: 295, 
    icuBeds: 34, 
    ambulances: 28, 
    kendras: 39, 
    state: 'Karnataka', 
    district: 'Bangalore Urban',
    bloodUnits: { 'A+': 29, 'B+': 39, 'O+': 31, 'AB+': 14, 'O-': 6, 'B-': 4 }
  },
  'Chennai': { 
    generalBeds: 340, 
    icuBeds: 46, 
    ambulances: 31, 
    kendras: 44, 
    state: 'Tamil Nadu', 
    district: 'Chennai',
    bloodUnits: { 'A+': 36, 'B+': 48, 'O+': 42, 'AB+': 17, 'O-': 7, 'B-': 5 }
  },
  'Kolkata': { 
    generalBeds: 260, 
    icuBeds: 29, 
    ambulances: 24, 
    kendras: 36, 
    state: 'West Bengal', 
    district: 'Kolkata',
    bloodUnits: { 'A+': 25, 'B+': 36, 'O+': 28, 'AB+': 12, 'O-': 5, 'B-': 3 }
  },
};

const TICKER_ITEMS = [
  { tag: 'MoHFW Notice', text: 'Seasonal viral & dengue surveillance drive active across 14 state public health grids.' },
  { tag: 'Jan Aushadhi', text: '1,900+ essential generic salts restocked at 50-85% savings across certified PMBJP kendras.' },
  { tag: 'Emergency 108', text: 'Real-time casualty dispatch network operational with 42 ICU beds ready in active trauma wards.' },
  { tag: 'PM-JAY Welfare', text: 'Cashless ₹5 Lakh coverage expansion live for all citizens aged 70+ without income restrictions.' },
];

export const HomeOverview: React.FC = () => {
  const { 
    user, 
    t, 
    setActiveTab, 
    setIsEmergencyModalOpen, 
    setSelectedDoctorForBooking,
    updateLocation,
    showNotification 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTool, setActiveTool] = useState<'map' | 'triage' | 'calculator'>('map');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [currentCity, setCurrentCity] = useState(user?.location.city || 'New Delhi');
  const [refreshingStats, setRefreshingStats] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Live Ticker State
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerPaused, setTickerPaused] = useState(false);

  // Interactive Health Mood / Quick Triage
  const [selectedMood, setSelectedMood] = useState<'well' | 'fever' | 'chest' | 'cough' | 'meds'>('well');

  // Today's Medication Adherence State (Interactive)
  const [medsTaken, setMedsTaken] = useState<{ metformin: boolean; telmisartan: boolean }>({
    metformin: false,
    telmisartan: true,
  });
  const [streakDays, setStreakDays] = useState(7);

  // Doctors for instant booking preview
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // Selected Family Member in profile widget
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('self');

  // Interactive ABHA Digital Card Modal
  const [showAbhaModal, setShowAbhaModal] = useState(false);

  // Interactive Blood Group Filter for live blood units
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('O+');

  // Interactive Daily Vitals Logger state
  const [vitalsSystolic, setVitalsSystolic] = useState<number>(118);
  const [vitalsDiastolic, setVitalsDiastolic] = useState<number>(78);
  const [vitalsGlucose, setVitalsGlucose] = useState<number>(104);
  const [glucoseType, setGlucoseType] = useState<'fasting' | 'postMeal'>('fasting');
  const [waterGlasses, setWaterGlasses] = useState<number>(5);
  const [vitalsLoggedTime, setVitalsLoggedTime] = useState<string>('Today at 08:30 AM');

  // Real-time IST clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }) + ' IST'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-rotating ticker
  useEffect(() => {
    if (tickerPaused) return;
    const interval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % TICKER_ITEMS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [tickerPaused]);

  // Fetch verified doctors for the instant booking preview
  useEffect(() => {
    setLoadingDoctors(true);
    api.getDoctors({ verified: true }).then(res => {
      if (res.success && res.doctors.length > 0) {
        setDoctors(res.doctors.slice(0, 3));
      }
    }).catch(err => {
      console.error('Error fetching doctors:', err);
    }).finally(() => {
      setLoadingDoctors(false);
    });
  }, [currentCity]);

  // Handle City Change
  const handleCityChange = async (newCity: string) => {
    setCurrentCity(newCity);
    const stats = REGIONAL_STATS[newCity] || REGIONAL_STATS['New Delhi'];
    await updateLocation({
      city: newCity,
      state: stats.state,
      district: stats.district,
    });
    showNotification(`Healthcare region switched to ${newCity}. Facilities and bed inventory updated.`);
  };

  // Handle Refresh Stats
  const handleRefreshStats = () => {
    setRefreshingStats(true);
    setTimeout(() => {
      setRefreshingStats(false);
      showNotification(`Live bed count verified with ${currentCity} regional casualty registry.`);
    }, 700);
  };

  // Handle Search Submission
  const handleSearchSubmit = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = (customQuery !== undefined ? customQuery : searchQuery).trim().toLowerCase();
    if (!query) return;

    if (query.includes('hosp') || query.includes('bed') || query.includes('icu') || query.includes('aiims') || query.includes('trauma')) {
      setActiveTab('hospitals');
    } else if (query.includes('med') || query.includes('pharm') || query.includes('dolo') || query.includes('metformin') || query.includes('jan aushadhi')) {
      setActiveTab('pharmacy');
    } else if (query.includes('lab') || query.includes('test') || query.includes('blood test') || query.includes('cbc') || query.includes('thyroid')) {
      setActiveTab('labs');
    } else if (query.includes('blood') || query.includes('donor') || query.includes('platelet')) {
      setActiveTab('blood');
    } else if (query.includes('scheme') || query.includes('ayushman') || query.includes('pm-jay')) {
      setActiveTab('schemes');
    } else if (query.includes('record') || query.includes('abha') || query.includes('prescription')) {
      setActiveTab('records');
    } else {
      setActiveTab('doctors');
    }
  };

  // Toggle Medication Dose
  const handleToggleMed = (key: 'metformin' | 'telmisartan') => {
    setMedsTaken(prev => {
      const next = { ...prev, [key]: !prev[key] };
      const allCompleted = next.metformin && next.telmisartan;
      if (allCompleted && !prev[key]) {
        setStreakDays(s => s + 1);
        showNotification('All daily medication doses completed! 100% adherence streak maintained.');
      } else {
        showNotification(`${key === 'metformin' ? 'Metformin SR' : 'Telmisartan'} status updated.`);
      }
      return next;
    });
  };

  // Log vitals to health vault
  const handleSaveVitals = () => {
    const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    setVitalsLoggedTime(`Today at ${nowStr}`);
    showNotification(`Vitals (${vitalsSystolic}/${vitalsDiastolic} mmHg, Glucose ${vitalsGlucose} mg/dL) synced to ABHA record.`);
  };

  // Blood pressure status helper
  const getBpCategory = (sys: number, dia: number) => {
    if (sys < 120 && dia < 80) return { label: 'Optimal Normal', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (sys <= 129 && dia < 80) return { label: 'Elevated BP', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (sys <= 139 || dia <= 89) return { label: 'Stage 1 Hypertension', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { label: 'Stage 2 Hypertension', color: 'text-red-700 bg-red-50 border-red-200' };
  };

  const currentStats = REGIONAL_STATS[currentCity] || REGIONAL_STATS['New Delhi'];
  const bpStatus = getBpCategory(vitalsSystolic, vitalsDiastolic);

  // Real-time suggested search matches
  const sampleSuggestions = [
    { label: 'Dr. Priya Venkatesh (Cardiology)', type: 'Doctor', tab: 'doctors' as const },
    { label: 'Metformin SR 500mg (Jan Aushadhi ₹12)', type: 'Medicine', tab: 'pharmacy' as const },
    { label: 'AIIMS Apex Emergency Trauma Center', type: 'Hospital', tab: 'hospitals' as const },
    { label: 'HbA1c & Fasting Glucose Profile', type: 'Lab Test', tab: 'labs' as const },
  ].filter(item => !searchQuery || item.label.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8 space-y-5">
      
      {/* 1. Interactive Live Ticker / News Bulletin with pause/resume controls */}
      <div 
        onMouseEnter={() => setTickerPaused(true)}
        onMouseLeave={() => setTickerPaused(false)}
        className="bg-slate-900 text-white rounded-lg px-4 py-2.5 flex items-center justify-between text-xs border border-slate-800 shadow-xs"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {TICKER_ITEMS[tickerIndex].tag}
          </span>
          <p className="text-slate-300 truncate text-[11px] sm:text-xs">
            {TICKER_ITEMS[tickerIndex].text}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-3">
          <button
            onClick={() => setTickerIndex(prev => (prev - 1 + TICKER_ITEMS.length) % TICKER_ITEMS.length)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer btn-press"
            title="Previous Bulletin"
            aria-label="Previous announcement"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-slate-500 font-mono">
            {tickerIndex + 1}/{TICKER_ITEMS.length}
          </span>
          <button
            onClick={() => setTickerIndex(prev => (prev + 1) % TICKER_ITEMS.length)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer btn-press"
            title="Next Bulletin"
            aria-label="Next announcement"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Top Banner: Patient Welcome, Live IST Clock, ABHA Digital Card, & Interactive City Switcher */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Namaste, {user?.fullName || 'Rajesh Sharma'}
              </h1>
              
              {/* Interactive ABHA Verification Badge / Card Button */}
              <button
                onClick={() => setShowAbhaModal(true)}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded border border-emerald-300 transition cursor-pointer btn-press"
                title="Click to view digital ABHA Smart Card & QR code"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                ABDM Verified · {user?.abhaId || '91-8842-1209-7712'}
                <QrCode className="w-3 h-3 text-emerald-800 ml-0.5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Find verified doctors, track emergency bed availability, and compare generic medicines with zero markup.
            </p>
          </div>

          {/* Live Region & Time Indicator */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Interactive City Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-sky-800 shrink-0" />
              <span className="text-[11px] text-slate-500 font-medium">City:</span>
              <select
                value={currentCity}
                onChange={e => handleCityChange(e.target.value)}
                className="bg-transparent font-semibold text-slate-900 focus:outline-hidden cursor-pointer text-xs"
              >
                {Object.keys(REGIONAL_STATS).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Live Clock IST */}
            <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentTimeStr || 'IST Live'}</span>
            </div>
          </div>
        </div>

        {/* Search Bar with Interactive Auto-Suggest Dropdown */}
        <div className="mt-4 relative">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by doctor name, specialty, hospital, symptom, or generic salt..."
                className="w-full pl-9 pr-8 py-2.5 text-xs border border-slate-300 rounded focus:border-sky-700 focus:outline-hidden bg-white text-slate-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded cursor-pointer transition btn-press min-h-[40px]"
            >
              Search Care
            </button>
          </form>

          {/* Dynamic Suggestion Dropdown when focused or typing */}
          {isSearchFocused && searchQuery.length > 0 && sampleSuggestions.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-xl overflow-hidden">
              <div className="p-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span>Matching Care & Directory:</span>
                <button 
                  onClick={() => setIsSearchFocused(false)} 
                  className="hover:text-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {sampleSuggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setIsSearchFocused(false);
                      setSearchQuery(sug.label);
                      setActiveTab(sug.tab);
                    }}
                    className="p-2.5 hover:bg-sky-50 flex items-center justify-between cursor-pointer transition text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-900">{sug.label}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {sug.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick clinical shortcut links */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-medium text-slate-400">Popular:</span>
            {[
              { label: 'General Physician', q: 'general' },
              { label: 'Cardiology OPD', q: 'cardiology' },
              { label: 'Metformin 500mg (Jan Aushadhi)', q: 'metformin' },
              { label: 'AIIMS ICU Beds', q: 'hospitals' },
              { label: 'Full Body Blood Test', q: 'labs' },
              { label: 'O+ Blood Availability', q: 'blood' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => {
                  setSearchQuery(item.label);
                  handleSearchSubmit(undefined, item.q);
                }}
                className="text-sky-800 hover:text-sky-950 hover:underline text-[11px] bg-slate-50 hover:bg-sky-50 px-2 py-0.5 rounded border border-slate-200 transition cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Interactive "How are you feeling right now?" Quick Triage & Symptom Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Instant Symptom Check & Clinical Guidance
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Select how you are feeling right now to view real-time triage steps, recommended specialists, and generic medicine options.
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Click a symptom to view immediate care guidance</span>
        </div>

        {/* 5 Interactive Mood / Symptom Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            onClick={() => setSelectedMood('well')}
            className={`p-3 rounded border text-left transition cursor-pointer btn-press ${
              selectedMood === 'well'
                ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Healthy / Routine</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-normal">Wellness & Preventive OPD</p>
          </button>

          <button
            onClick={() => setSelectedMood('fever')}
            className={`p-3 rounded border text-left transition cursor-pointer btn-press ${
              selectedMood === 'fever'
                ? 'border-amber-600 bg-amber-50/70 text-amber-950 font-bold shadow-xs'
                : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
              <Thermometer className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Fever / Body Ache</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-normal">Temperature & Flu Check</p>
          </button>

          <button
            onClick={() => setSelectedMood('chest')}
            className={`p-3 rounded border text-left transition cursor-pointer btn-press ${
              selectedMood === 'chest'
                ? 'border-red-600 bg-red-50/80 text-red-950 font-bold shadow-xs'
                : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-800">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>Chest / Breath</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-normal">Emergency Triage Alert</p>
          </button>

          <button
            onClick={() => setSelectedMood('cough')}
            className={`p-3 rounded border text-left transition cursor-pointer btn-press ${
              selectedMood === 'cough'
                ? 'border-sky-600 bg-sky-50/70 text-sky-950 font-bold shadow-xs'
                : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800">
              <Activity className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Cough / Cold</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-normal">Respiratory & Throat</p>
          </button>

          <button
            onClick={() => setSelectedMood('meds')}
            className={`p-3 rounded border text-left transition cursor-pointer btn-press ${
              selectedMood === 'meds'
                ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-xs'
                : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
              <Pill className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Refill Medicine</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-normal">Jan Aushadhi Pricing</p>
          </button>
        </div>

        {/* Dynamic Symptom Guidance Panel */}
        <div className="p-4 rounded border border-slate-200 bg-slate-50/80 text-xs">
          {selectedMood === 'well' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Recommended Routine Wellness Focus</h3>
                <p className="text-slate-600 mt-0.5">
                  Great! Maintain daily hydration (2.5L+), 30 minutes of brisk walking, and check blood pressure monthly.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span>• Annual HbA1c & Lipid Profile recommended for adults 40+</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>• Next routine appointment: Dr. Priya Venkatesh (Oct 2)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('labs')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-xs transition cursor-pointer btn-press"
                >
                  Book Routine Lab Package
                </button>
              </div>
            </div>
          )}

          {selectedMood === 'fever' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-900 text-sm">Clinical Triage: Moderate Temperature Protocol</span>
                  <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-amber-100 text-amber-900 rounded">OPD Consult Recommended</span>
                </div>
                <p className="text-slate-700 mt-0.5">
                  Record oral temperature every 4 hours. Stay hydrated with ORS/coconut water. Avoid aspirin or ibuprofen in suspected dengue.
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  <strong>Generic Jan Aushadhi Salt:</strong> Paracetamol IP 650mg is ₹10 for 10 tablets (vs commercial MRP ₹42).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('doctors')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-xs transition cursor-pointer btn-press"
                >
                  Consult General Physician
                </button>
                <button
                  onClick={() => setActiveTab('pharmacy')}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded font-medium text-xs transition cursor-pointer btn-press"
                >
                  Locate Kendra
                </button>
              </div>
            </div>
          )}

          {selectedMood === 'chest' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-50 p-3 rounded border border-red-200">
              <div>
                <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                  <ShieldAlert className="w-4 h-4 text-red-700" />
                  <span>URGENT CLINICAL WARNING: Chest Heaviness or Radiating Pain</span>
                </div>
                <p className="text-red-900 mt-0.5 text-xs leading-relaxed">
                  Do not drive yourself. Sit upright, loosen tight clothing, and call for emergency ambulance dispatch or proceed immediately to nearest cardiac casualty.
                </p>
                <p className="text-[11px] text-red-800 font-semibold mt-1">
                  Verified Status: {currentStats.icuBeds} ICU beds and {currentStats.ambulances} ambulances active in {currentCity}.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsEmergencyModalOpen(true)}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded text-xs transition cursor-pointer btn-press shadow-xs"
                >
                  Call 108 Ambulance Now
                </button>
              </div>
            </div>
          )}

          {selectedMood === 'cough' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Upper Respiratory Symptoms Protocol</h3>
                <p className="text-slate-600 mt-0.5">
                  Warm saline gargles twice daily and warm steam inhalation. If symptoms persist beyond 5 days with fever, consult a pulmonologist.
                </p>
                <div className="mt-1 text-[11px] text-slate-500">
                  <span>Available specialists in {currentCity}: 14 Pulmonologists & ENT doctors accepting OPD tokens today.</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('doctors')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-xs transition cursor-pointer btn-press"
                >
                  Find ENT / Chest Specialist
                </button>
              </div>
            </div>
          )}

          {selectedMood === 'meds' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Jan Aushadhi Generic Medicine Savings</h3>
                <p className="text-slate-600 mt-0.5">
                  Compare your commercial brand prescription against identical chemical salts manufactured under WHO-GMP standards.
                </p>
                <p className="text-[11px] text-emerald-800 font-semibold mt-1">
                  Average savings across 1,900+ essential molecules: 50% to 85% lower than brand MRP.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTool('calculator')}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-medium text-xs transition cursor-pointer btn-press"
                >
                  Open Medicine Cost Calculator
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Interactive Daily Vitals & Wellness Quick-Log (New Tactile Human Feature) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Daily Vitals & Wellness Quick-Log
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${bpStatus.color}`}>
                {bpStatus.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Record today&apos;s blood pressure, glucose, and hydration directly into your ABDM personal health vault.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Last synced: {vitalsLoggedTime}</span>
            <button
              onClick={handleSaveVitals}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded transition cursor-pointer btn-press flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Save to ABHA Vault
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
          {/* BP Controls */}
          <div className="p-3.5 bg-slate-50 rounded border border-slate-200 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Blood Pressure (mmHg)</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {vitalsSystolic} / {vitalsDiastolic}
              </span>
            </div>
            
            {/* Steppers for Systolic & Diastolic */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Sys</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setVitalsSystolic(s => Math.max(80, s - 2))} 
                    className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono font-bold w-7 text-center">{vitalsSystolic}</span>
                  <button 
                    onClick={() => setVitalsSystolic(s => Math.min(220, s + 2))} 
                    className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Dia</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setVitalsDiastolic(d => Math.max(50, d - 2))} 
                    className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono font-bold w-7 text-center">{vitalsDiastolic}</span>
                  <button 
                    onClick={() => setVitalsDiastolic(d => Math.min(140, d + 2))} 
                    className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Blood Glucose Controls */}
          <div className="p-3.5 bg-slate-50 rounded border border-slate-200 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Blood Glucose (mg/dL)</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {vitalsGlucose} mg/dL
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex rounded border border-slate-300 bg-white p-0.5 text-[10px]">
                <button
                  onClick={() => setGlucoseType('fasting')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition ${glucoseType === 'fasting' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
                >
                  Fasting
                </button>
                <button
                  onClick={() => setGlucoseType('postMeal')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition ${glucoseType === 'postMeal' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
                >
                  Post-Meal
                </button>
              </div>

              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200">
                <button 
                  onClick={() => setVitalsGlucose(g => Math.max(60, g - 5))} 
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-mono font-bold w-8 text-center text-xs">{vitalsGlucose}</span>
                <button 
                  onClick={() => setVitalsGlucose(g => Math.min(350, g + 5))} 
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Hydration Tracker */}
          <div className="p-3.5 bg-slate-50 rounded border border-slate-200 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-cyan-600 fill-cyan-500" />
                Hydration Today
              </span>
              <span className="font-mono font-bold text-cyan-900 text-xs">
                {waterGlasses} / 8 Glasses ({(waterGlasses * 0.25).toFixed(2)}L)
              </span>
            </div>

            <div className="flex items-center justify-between gap-1 pt-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(glassNum => (
                <button
                  key={glassNum}
                  onClick={() => {
                    setWaterGlasses(glassNum);
                    showNotification(`Hydration logged: ${glassNum} glasses (${(glassNum * 0.25).toFixed(2)} Liters)`);
                  }}
                  className={`w-7 h-7 rounded flex items-center justify-center text-xs transition cursor-pointer btn-press ${
                    glassNum <= waterGlasses
                      ? 'bg-cyan-600 text-white font-bold shadow-xs'
                      : 'bg-white border border-slate-300 text-slate-400 hover:border-cyan-400'
                  }`}
                  title={`Log glass ${glassNum}`}
                >
                  <Droplet className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Main 2-Column Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 cols): Primary Care Navigation & Active Tools */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Direct OPD Slot Booking Today with Clickable Time Slots */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-sky-800" />
                  <span>Available OPD Slots Today in {currentCity}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirmed clinical timings with instant token booking. Click any slot to reserve.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('doctors')}
                className="text-sky-800 hover:text-sky-950 font-semibold text-xs hover:underline cursor-pointer"
              >
                View all doctors →
              </button>
            </div>

            {loadingDoctors ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded border border-slate-200">
                Loading available doctor timings in {currentCity}...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {doctors.map(doc => {
                  const slots = ['10:30 AM', '11:45 AM', '02:15 PM'];
                  return (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded border border-slate-200 hover:border-slate-300 bg-white transition flex flex-col justify-between space-y-2.5"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <h3 className="font-bold text-xs text-slate-900">{doc.fullName}</h3>
                            <p className="text-[11px] font-semibold text-sky-900 mt-0.5">{doc.specialization}</p>
                          </div>
                          <span className="text-[10px] font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                            ₹{doc.consultationFee}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 truncate">{doc.hospitalAffiliation}</p>
                        
                        {/* Interactive Clickable Time Slots */}
                        <div className="mt-2.5 space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Select Slot Today:</span>
                          <div className="grid grid-cols-3 gap-1">
                            {slots.map(slot => (
                              <button
                                key={slot}
                                onClick={() => setSelectedDoctorForBooking(doc)}
                                className="py-1 text-[10px] font-bold rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition cursor-pointer btn-press text-center"
                                title={`Book ${slot} slot with ${doc.fullName}`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedDoctorForBooking(doc)}
                        className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-xs transition cursor-pointer btn-press text-center mt-1"
                      >
                        Book OPD Token
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Primary Care Navigation Grid (8 Services) */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Healthcare Services & Directory
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">8 Verified Services</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => setActiveTab('doctors')}
                className="p-3 border border-slate-200 hover:border-slate-300 rounded text-left transition cursor-pointer flex items-start gap-3 bg-white hover:bg-slate-50/70 btn-press"
              >
                <div className="w-8 h-8 rounded bg-sky-50 flex items-center justify-center text-sky-800 shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{t.findDoctor}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    NMC verified doctors, OPD schedules, fees & verified reviews.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('hospitals')}
                className="p-3 border border-slate-200 hover:border-slate-300 rounded text-left transition cursor-pointer flex items-start gap-3 bg-white hover:bg-slate-50/70 btn-press"
              >
                <div className="w-8 h-8 rounded bg-sky-50 flex items-center justify-center text-sky-800 shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{t.findHospital}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Live bed availability, ICU capacity, oxygen & emergency casualty.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('telemedicine')}
                className="p-3 border border-slate-200 hover:border-slate-300 rounded text-left transition cursor-pointer flex items-start gap-3 bg-white hover:bg-slate-50/70 btn-press"
              >
                <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-800 shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{t.telemedicine}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Encrypted video consultations, live vitals, and verified digital Rx.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('pharmacy')}
                className="p-3 border border-slate-200 hover:border-slate-300 rounded text-left transition cursor-pointer flex items-start gap-3 bg-white hover:bg-slate-50/70 btn-press"
              >
                <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center text-emerald-800 shrink-0">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{t.findPharmacy}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Save 50-85% with Jan Aushadhi Kendras & verified local chemists.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('labs')}
                className="p-3 border border-slate-200 hover:border-slate-300 rounded text-left transition cursor-pointer flex items-start gap-3 bg-white hover:bg-slate-50/70 btn-press"
              >
                <div className="w-8 h-8 rounded bg-cyan-50 flex items-center justify-center text-cyan-800 shrink-0">
                  <TestTube2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{t.findLabs}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    NABL accredited pathology tests, CBC, HbA1c with home collection.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('blood')}
                className="p-3 border border-slate-200 hover:border-slate-300 rounded text-left transition cursor-pointer flex items-start gap-3 bg-white hover:bg-slate-50/70 btn-press"
              >
                <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center text-red-800 shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{t.bloodBanks}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Real-time units for all blood groups (A+, B+, O+) & emergency requests.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('records')}
                className="p-3 border border-slate-200 hover:border-slate-300 rounded text-left transition cursor-pointer flex items-start gap-3 bg-white hover:bg-slate-50/70 btn-press"
              >
                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                  <FileText className="w-4 h-4 text-sky-800" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{t.healthRecords}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    ABHA linked personal health vault, prescriptions & consent manager.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('healthguide')}
                className="p-3 border border-slate-200 hover:border-slate-300 rounded text-left transition cursor-pointer flex items-start gap-3 bg-white hover:bg-slate-50/70 btn-press"
              >
                <div className="w-8 h-8 rounded bg-purple-50 flex items-center justify-center text-purple-800 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{t.healthGuideAI}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Triage symptoms, understand test reports & prepare doctor questions.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Interactive Tools Container with clean tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 bg-white px-3 py-2 rounded-t-lg">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Healthcare Visual Tools
              </h2>

              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setActiveTool('map')}
                  className={`px-3 py-1 font-medium transition cursor-pointer ${
                    activeTool === 'map'
                      ? 'border-b-2 border-sky-800 text-sky-900 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Healthcare Map
                </button>
                <button
                  onClick={() => setActiveTool('triage')}
                  className={`px-3 py-1 font-medium transition cursor-pointer ${
                    activeTool === 'triage'
                      ? 'border-b-2 border-sky-800 text-sky-900 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Symptom Body Map
                </button>
                <button
                  onClick={() => setActiveTool('calculator')}
                  className={`px-3 py-1 font-medium transition cursor-pointer ${
                    activeTool === 'calculator'
                      ? 'border-b-2 border-sky-800 text-sky-900 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Medicine Cost Calculator
                </button>
              </div>
            </div>

            {/* Selected Tool Content */}
            {activeTool === 'map' && <InteractiveMap />}
            {activeTool === 'triage' && <SymptomTriageBodyMap />}
            {activeTool === 'calculator' && <SavingsCalculator />}
          </div>

        </div>

        {/* Right Sidebar Column (4 cols): Live Facility Stats, Interactive Meds, Profile */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Emergency Alert & Dial Panel */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between text-red-900 font-bold text-xs">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-700 shrink-0" />
                <span>EMERGENCY ASSISTANCE</span>
              </div>
              <span className="text-[10px] bg-red-100 text-red-900 px-1.5 py-0.5 rounded font-mono">
                108 / 112
              </span>
            </div>
            <p className="text-[11px] text-red-900 leading-relaxed">
              If someone is experiencing severe chest pain, loss of consciousness, or acute trauma, dial emergency hotlines immediately.
            </p>

            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="w-full py-2 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded transition text-center cursor-pointer btn-press"
            >
              Open Emergency Protocol (108 / 112)
            </button>
          </div>

          {/* Live Hospital Capacity Monitor (Dynamic by City) */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <h3 className="text-xs font-bold text-slate-900">Hospital Availability</h3>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <span>{currentCity}</span>
                <button
                  onClick={handleRefreshStats}
                  className={`p-1 hover:text-slate-800 rounded transition cursor-pointer ${refreshingStats ? 'animate-spin' : ''}`}
                  title="Refresh live beds"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5 text-sky-700" />
                  <span>General Beds</span>
                </span>
                <strong className="text-slate-900 font-mono font-bold">{currentStats.generalBeds} Free</strong>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-red-700" />
                  <span>ICU / Ventilators</span>
                </span>
                <strong className="text-slate-900 font-mono font-bold">{currentStats.icuBeds} Ready</strong>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Ambulance className="w-3.5 h-3.5 text-emerald-700" />
                  <span>108 Ambulances</span>
                </span>
                <strong className="text-slate-900 font-mono font-bold">{currentStats.ambulances} On Duty</strong>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Jan Aushadhi Stores</span>
                </span>
                <strong className="text-slate-900 font-mono font-bold">{currentStats.kendras} Open</strong>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('hospitals')}
              className="w-full pt-1.5 text-sky-800 hover:text-sky-950 hover:underline text-xs font-semibold text-center block cursor-pointer"
            >
              View detailed hospital bed list →
            </button>
          </div>

          {/* Interactive Live Blood Reserve Explorer */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                <h3 className="text-xs font-bold text-slate-900">Blood Bank Reserve ({currentCity})</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Live Units</span>
            </div>

            {/* Blood group selector pills */}
            <div className="grid grid-cols-6 gap-1">
              {['A+', 'B+', 'O+', 'AB+', 'O-', 'B-'].map(bg => (
                <button
                  key={bg}
                  onClick={() => setSelectedBloodGroup(bg)}
                  className={`py-1 text-[10px] font-bold rounded transition cursor-pointer text-center ${
                    selectedBloodGroup === bg
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>

            <div className="p-2.5 bg-red-50/70 rounded border border-red-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-red-900">{selectedBloodGroup} Compatible Blood</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Available at Red Cross & District Casualty
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-base font-extrabold text-red-700">
                  {currentStats.bloodUnits[selectedBloodGroup] || 25}
                </span>
                <span className="block text-[10px] text-slate-500">Units Ready</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('blood')}
              className="w-full text-sky-800 hover:text-sky-950 hover:underline text-xs font-semibold text-center block cursor-pointer"
            >
              Locate Donor & Request Blood →
            </button>
          </div>

          {/* Today's Prescribed Medicine Check-in (Interactive Dosage Toggle) */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <h3 className="text-xs font-bold text-slate-900">Today&apos;s Prescriptions</h3>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                <Flame className="w-3 h-3 fill-amber-600" />
                <span>{streakDays}-Day Streak</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {/* Medicine 1: Metformin */}
              <div
                onClick={() => handleToggleMed('metformin')}
                className={`p-2.5 rounded border transition flex items-center justify-between cursor-pointer btn-press ${
                  medsTaken.metformin
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                }`}
              >
                <div>
                  <p className="font-semibold text-xs">Metformin SR 500mg</p>
                  <p className="text-[11px] text-slate-500">After Dinner (20:30) · 1 Tablet</p>
                </div>
                <div className={`w-5 h-5 rounded flex items-center justify-center text-xs ${
                  medsTaken.metformin ? 'bg-emerald-700 text-white font-bold' : 'border border-slate-300 bg-white'
                }`}>
                  {medsTaken.metformin ? <Check className="w-3.5 h-3.5" /> : null}
                </div>
              </div>

              {/* Medicine 2: Telmisartan */}
              <div
                onClick={() => handleToggleMed('telmisartan')}
                className={`p-2.5 rounded border transition flex items-center justify-between cursor-pointer btn-press ${
                  medsTaken.telmisartan
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                }`}
              >
                <div>
                  <p className="font-semibold text-xs">Telmisartan 40mg</p>
                  <p className="text-[11px] text-slate-500">Morning (09:00) · 1 Tablet</p>
                </div>
                <div className={`w-5 h-5 rounded flex items-center justify-center text-xs ${
                  medsTaken.telmisartan ? 'bg-emerald-700 text-white font-bold' : 'border border-slate-300 bg-white'
                }`}>
                  {medsTaken.telmisartan ? <Check className="w-3.5 h-3.5" /> : null}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Tap dose to mark as taken</span>
              <button
                onClick={() => setActiveTab('reminders')}
                className="text-sky-800 hover:text-sky-950 hover:underline font-semibold cursor-pointer"
              >
                Manage Reminders →
              </button>
            </div>
          </div>

          {/* Family ABHA Profile Snapshot (Interactive Family Switcher) */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <h3 className="text-xs font-bold text-slate-900">Family Health Profile</h3>
              </div>
              <span className="font-mono text-[10px] text-slate-500">{user?.abhaId || '91-8842-1209-7712'}</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedFamilyId('self')}
                className={`px-2 py-1 rounded text-xs font-medium transition cursor-pointer btn-press ${
                  selectedFamilyId === 'self' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Self (Rajesh)
              </button>
              {user?.dependents.map(dep => (
                <button
                  key={dep.id}
                  onClick={() => setSelectedFamilyId(dep.id)}
                  className={`px-2 py-1 rounded text-xs font-medium transition cursor-pointer btn-press ${
                    selectedFamilyId === dep.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {dep.fullName.split(' ')[0]} ({dep.relation})
                </button>
              ))}
            </div>

            {/* Selected Family Details Card */}
            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
              {selectedFamilyId === 'self' ? (
                <>
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{user?.fullName || 'Rajesh Sharma'}</span>
                    <span className="text-red-700 font-bold">Blood Group: B+</span>
                  </div>
                  <p className="text-[11px] text-slate-500">48 Yrs · Male · Routine OPD Slot Sep 30</p>
                  <p className="text-[11px] text-slate-600">Allergies: None reported · Controlled BP</p>
                </>
              ) : (
                (() => {
                  const currentDep = user?.dependents.find(d => d.id === selectedFamilyId);
                  if (!currentDep) return null;
                  return (
                    <>
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{currentDep.fullName}</span>
                        <span className="text-red-700 font-bold">{currentDep.bloodGroup}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{currentDep.relation} · {currentDep.age} Yrs · {currentDep.gender}</p>
                      <p className="text-[11px] text-slate-600">
                        Allergies: {currentDep.allergies.join(', ') || 'None'} · Conditions: {currentDep.chronicConditions.join(', ') || 'Healthy'}
                      </p>
                    </>
                  );
                })()
              )}
            </div>

            <button
              onClick={() => setActiveTab('records')}
              className="w-full pt-1 text-sky-800 hover:text-sky-950 hover:underline text-xs font-semibold text-center block cursor-pointer"
            >
              Open Health Records & Vault →
            </button>
          </div>

          {/* Government Health Schemes Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Award className="w-3.5 h-3.5 text-sky-800" />
              <span>Ayushman Bharat (PM-JAY)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Provides ₹5,00,000 cashless hospitalization coverage for eligible families & senior citizens 70+ across empanelled hospitals.
            </p>
            <button
              onClick={() => setActiveTab('schemes')}
              className="text-sky-800 hover:text-sky-950 hover:underline text-[11px] font-semibold block cursor-pointer"
            >
              Check eligibility & empanelled hospitals →
            </button>
          </div>

        </div>

      </div>

      {/* 6. Interactive ABHA Digital Smart Card Modal */}
      {showAbhaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-2xl border border-slate-300 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs">Digital Ayushman Bharat Health Account (ABHA)</span>
              </div>
              <button
                onClick={() => setShowAbhaModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Official Indian Health Card Visual Design */}
            <div className="p-5 space-y-4">
              <div className="border-2 border-slate-800 rounded-lg p-4 bg-gradient-to-br from-slate-50 via-white to-sky-50 shadow-sm relative overflow-hidden">
                {/* Tiranga Accent Top Strip */}
                <div className="absolute top-0 left-0 right-0 h-1 flex">
                  <div className="flex-1 bg-amber-500" />
                  <div className="flex-1 bg-white" />
                  <div className="flex-1 bg-emerald-600" />
                </div>

                <div className="flex items-start justify-between gap-2 pt-1 border-b border-slate-200 pb-2.5">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Government of India</span>
                    <h3 className="text-xs font-bold text-slate-900">National Health Authority</h3>
                    <p className="text-[10px] text-emerald-800 font-semibold">Ayushman Bharat Digital Mission (ABDM)</p>
                  </div>
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">
                    ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 py-3 items-center">
                  <div className="col-span-2 space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Cardholder Name:</span>
                      <strong className="text-slate-900 text-sm">{user?.fullName || 'Rajesh Sharma'}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">ABHA Number:</span>
                      <strong className="font-mono text-xs font-bold text-sky-950 tracking-wider">
                        {user?.abhaId || '91-8842-1209-7712'}
                      </strong>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Blood Group:</span>
                        <strong className="text-red-700 font-bold">B+ Positive</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Gender / YOB:</span>
                        <span className="font-medium text-slate-800">Male / 1976</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Container */}
                  <div className="flex flex-col items-center justify-center p-2 bg-white rounded border border-slate-300 shadow-xs">
                    <QrCode className="w-16 h-16 text-slate-900" />
                    <span className="text-[8px] font-mono text-slate-400 mt-1 uppercase">Scan for OPD</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                  <span>ABHA Address: <strong>rajesh.sharma@abdm</strong></span>
                  <span>Issued: MoHFW</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(user?.abhaId || '91-8842-1209-7712');
                    showNotification('ABHA ID copied to clipboard!');
                  }}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded transition text-center cursor-pointer btn-press flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Copy ABHA ID
                </button>
                <button
                  onClick={() => {
                    showNotification('ABHA card digital slip downloaded as PDF.');
                    setShowAbhaModal(false);
                  }}
                  className="flex-1 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-medium rounded transition text-center cursor-pointer btn-press flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Card PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
