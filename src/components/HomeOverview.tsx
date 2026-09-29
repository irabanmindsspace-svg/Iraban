import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InteractiveMap } from './InteractiveMap';
import { SymptomTriageBodyMap } from './SymptomTriageBodyMap';
import { SavingsCalculator } from './SavingsCalculator';
import { 
  ShieldAlert, 
  Stethoscope, 
  Building2, 
  Calendar, 
  Video, 
  Pill, 
  TestTube2, 
  FileText, 
  Users, 
  Award, 
  Bot, 
  Heart, 
  PhoneCall, 
  ArrowRight, 
  Clock, 
  MapPin, 
  CheckCircle,
  AlertCircle,
  Search,
  Sparkles,
  Bed,
  Activity,
  Ambulance,
  Mic
} from 'lucide-react';

export const HomeOverview: React.FC = () => {
  const { 
    user, 
    t, 
    setActiveTab, 
    setIsEmergencyModalOpen, 
    showNotification 
  } = useApp();

  const [quickSearch, setQuickSearch] = useState('');
  const [activeInteractiveTab, setActiveInteractiveTab] = useState<'map' | 'triage' | 'calculator'>('map');

  const PRIMARY_ACTIONS = [
    {
      id: 'emergency',
      title: '🚨 Emergency SOS (108 / 112)',
      description: 'Immediate ambulance dispatch, urgent first aid & nearest casualty beds',
      icon: ShieldAlert,
      color: 'bg-rose-600 text-white hover:bg-rose-700',
      action: () => setIsEmergencyModalOpen(true),
      isUrgent: true,
    },
    {
      id: 'doctors',
      title: t.findDoctor,
      description: 'NMC verified general physicians and specialists across Indian cities',
      icon: Stethoscope,
      color: 'bg-white hover:border-sky-300 text-slate-900',
      action: () => setActiveTab('doctors'),
    },
    {
      id: 'hospitals',
      title: t.findHospital,
      description: 'Live general beds, ICU availability, oxygen plant status & casualty',
      icon: Building2,
      color: 'bg-white hover:border-sky-300 text-slate-900',
      action: () => setActiveTab('hospitals'),
    },
    {
      id: 'telemedicine',
      title: t.telemedicine,
      description: 'Encrypted video consultations with instant verified digital prescriptions',
      icon: Video,
      color: 'bg-white hover:border-sky-300 text-slate-900',
      action: () => setActiveTab('telemedicine'),
    },
    {
      id: 'pharmacy',
      title: t.findPharmacy,
      description: 'Generic medicine price comparison & Jan Aushadhi Kendras (50-80% off)',
      icon: Pill,
      color: 'bg-white hover:border-sky-300 text-slate-900',
      action: () => setActiveTab('pharmacy'),
    },
    {
      id: 'labs',
      title: t.findLabs,
      description: 'NABL accredited pathology labs, CBC/HbA1c & home sample collection',
      icon: TestTube2,
      color: 'bg-white hover:border-sky-300 text-slate-900',
      action: () => setActiveTab('labs'),
    },
    {
      id: 'blood',
      title: t.bloodBanks,
      description: 'Real-time blood bank units by group (A, B, O, AB) & emergency requests',
      icon: Heart,
      color: 'bg-white hover:border-sky-300 text-slate-900',
      action: () => setActiveTab('blood'),
    },
    {
      id: 'records',
      title: t.healthRecords,
      description: 'ABHA compliant encrypted document storage & doctor sharing consents',
      icon: FileText,
      color: 'bg-white hover:border-sky-300 text-slate-900',
      action: () => setActiveTab('records'),
    },
    {
      id: 'reminders',
      title: t.medReminders,
      description: 'Daily dosage adherence tracker with morning & evening alarm alerts',
      icon: Clock,
      color: 'bg-white hover:border-sky-300 text-slate-900',
      action: () => setActiveTab('reminders'),
    },
    {
      id: 'schemes',
      title: t.govtSchemes,
      description: 'Ayushman Bharat PM-JAY ₹5L cover, Tele-MANAS & PMBJP portals',
      icon: Award,
      color: 'bg-white hover:border-sky-300 text-slate-900',
      action: () => setActiveTab('schemes'),
    },
    {
      id: 'healthguide',
      title: t.healthGuideAI,
      description: 'Safe clinical triage, doctor preparation, and lab report explanations',
      icon: Bot,
      color: 'bg-sky-50/70 border-sky-200 hover:bg-sky-100 text-sky-950',
      action: () => setActiveTab('healthguide'),
    }
  ];

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearch.trim()) return;
    const lower = quickSearch.toLowerCase();
    if (lower.includes('hosp') || lower.includes('bed') || lower.includes('icu') || lower.includes('aiims')) {
      setActiveTab('hospitals');
    } else if (lower.includes('medicine') || lower.includes('pharm') || lower.includes('dolo') || lower.includes('metformin')) {
      setActiveTab('pharmacy');
    } else if (lower.includes('lab') || lower.includes('test') || lower.includes('blood test') || lower.includes('cbc')) {
      setActiveTab('labs');
    } else if (lower.includes('blood') || lower.includes('o+') || lower.includes('donor')) {
      setActiveTab('blood');
    } else {
      setActiveTab('doctors');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Hero Welcome & Priority Emergency Callout */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">
              National Digital Health & Medical Assistance Network · India
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            How can we help your health today?
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Accessible, multilingual healthcare coordination for every citizen across metropolitan cities, small towns, and rural districts.
          </p>

          {/* Quick Voice / Text Search input */}
          <form onSubmit={handleQuickSearchSubmit} className="mt-5 flex items-center gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={quickSearch}
                onChange={e => setQuickSearch(e.target.value)}
                placeholder="Search doctors, hospitals, medicines, PIN code..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 text-white placeholder:text-slate-400 border border-slate-700 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-400 min-h-[44px]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer min-h-[44px]"
            >
              Search
            </button>
          </form>

          {/* Emergency SOS & HealthGuide CTAs */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition active:scale-95 cursor-pointer min-h-[48px]"
            >
              <ShieldAlert className="w-4 h-4 animate-bounce" />
              <span>🚨 1-Tap Emergency Help (108 / 112)</span>
            </button>

            <button
              onClick={() => setActiveTab('healthguide')}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2 transition cursor-pointer min-h-[48px]"
            >
              <Bot className="w-4 h-4 text-sky-400" />
              <span>Ask HealthGuide AI</span>
            </button>
          </div>
        </div>

        {/* Quiet Location trust badge */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>Serving {user?.location.city || 'New Delhi'}, {user?.location.state || 'Delhi'} ({user?.location.pincode || '110001'})</span>
          </div>
          <span>Ayushman Bharat (PM-JAY) & NMC Empanelled · 24x7 Active</span>
        </div>
      </div>

      {/* Dynamic Real-Time Ticker: Casualty Beds & Emergency Fleet Monitor */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-bold text-slate-900">Live Hospital Network Status in {user?.location.city || 'New Delhi'}:</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-slate-600">
          <span className="flex items-center gap-1 font-semibold">
            <Bed className="w-3.5 h-3.5 text-sky-600" />
            <strong className="text-slate-900 tabular-nums">379</strong> General Beds Ready
          </span>
          <span className="flex items-center gap-1 font-semibold">
            <Activity className="w-3.5 h-3.5 text-rose-600" />
            <strong className="text-slate-900 tabular-nums">42</strong> ICU Beds Ready
          </span>
          <span className="flex items-center gap-1 font-semibold">
            <Ambulance className="w-3.5 h-3.5 text-emerald-600" />
            <strong className="text-slate-900 tabular-nums">35</strong> Ambulances Patrol
          </span>
        </div>

        <button
          onClick={() => setActiveTab('hospitals')}
          className="text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>View All Facilities</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Interactive Tool Switcher (Geo-Locator Map / Symptom Triage / Medicine Calculator) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Interactive Healthcare Tools
          </h2>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveInteractiveTab('map')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeInteractiveTab === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Radar Map
            </button>
            <button
              onClick={() => setActiveInteractiveTab('triage')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeInteractiveTab === 'triage' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visual Symptom Triage
            </button>
            <button
              onClick={() => setActiveInteractiveTab('calculator')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeInteractiveTab === 'calculator' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Medicine Savings Calculator
            </button>
          </div>
        </div>

        {/* Render Selected Interactive Tool */}
        {activeInteractiveTab === 'map' && <InteractiveMap />}
        {activeInteractiveTab === 'triage' && <SymptomTriageBodyMap />}
        {activeInteractiveTab === 'calculator' && <SavingsCalculator />}
      </div>

      {/* Primary Action Matrix (Grid) */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3.5">
          Essential Healthcare Services
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {PRIMARY_ACTIONS.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`p-4 rounded-2xl border border-slate-200 text-left transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[110px] ${item.color}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm tracking-tight">{item.title}</span>
                    <Icon className="w-4 h-4 opacity-80" />
                  </div>
                  <p className={`text-xs mt-1.5 line-clamp-2 ${item.isUrgent ? 'text-rose-100' : 'text-slate-500'}`}>
                    {item.description}
                  </p>
                </div>

                <div className={`mt-3 flex items-center gap-1 text-[11px] font-bold ${item.isUrgent ? 'text-white' : 'text-sky-700'}`}>
                  <span>Access Service</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Health Profile & Dependents Summary Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Family Health Profile</h3>
              <p className="text-xs text-slate-500">
                ABHA ID: <strong className="font-mono text-slate-700">{user?.abhaId || '91-8842-1209-7712'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('records')}
            className="text-xs font-semibold text-sky-700 hover:text-sky-900 cursor-pointer"
          >
            Manage Health Vault & Sharing Consents →
          </button>
        </div>

        {/* Dependents list */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          {user?.dependents.map(dep => (
            <div key={dep.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>{dep.fullName}</span>
                <span className="text-rose-600 font-extrabold">{dep.bloodGroup}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{dep.relation} · {dep.age} Yrs · {dep.gender}</p>
              {dep.allergies.length > 0 && (
                <p className="text-[10px] text-amber-700 mt-1">Allergy: {dep.allergies.join(', ')}</p>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
