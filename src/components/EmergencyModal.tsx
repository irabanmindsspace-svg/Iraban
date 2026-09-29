import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { EmergencyGuide, Hospital } from '../types';
import { 
  X, 
  Phone, 
  Radio, 
  AlertTriangle, 
  CheckCircle, 
  MapPin, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  HeartHandshake,
  Activity,
  Bed,
  Ambulance,
  LifeBuoy
} from 'lucide-react';

export const EmergencyModal: React.FC = () => {
  const { isEmergencyModalOpen, setIsEmergencyModalOpen, user, t } = useApp();
  const [guides, setGuides] = useState<EmergencyGuide[]>([]);
  const [activeGuideId, setActiveGuideId] = useState<string>('emg_heart');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [broadcasting, setBroadcasting] = useState(false);
  const [dispatchInfo, setDispatchInfo] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (isEmergencyModalOpen) {
      api.getEmergencyGuides().then(res => {
        if (res.success) setGuides(res.guides);
      });
      api.getHospitals({ emergencyOnly: true }).then(res => {
        if (res.success) setHospitals(res.hospitals);
      });
    } else {
      // Stop speech if closing
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    }
  }, [isEmergencyModalOpen]);

  const handleBroadcastSOS = async () => {
    setBroadcasting(true);
    try {
      const res = await api.broadcastEmergency({
        address: user?.location.address || 'Connaught Place, New Delhi',
        coordinates: { lat: user?.location.lat || 28.6289, lng: user?.location.lng || 77.2065 },
        emergencyType: 'Critical Medical Alert',
        bloodGroup: 'B+',
      });
      if (res.success) {
        setDispatchInfo(res.dispatch);
      }
    } catch (e) {
      console.error('Failed to broadcast SOS:', e);
    } finally {
      setBroadcasting(false);
    }
  };

  const handleReadAloud = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!isEmergencyModalOpen) return null;

  const currentGuide = guides.find(g => g.id === activeGuideId) || guides[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-rose-300 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Urgent Header Banner */}
        <div className="bg-rose-600 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-white/20 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">EMERGENCY ASSISTANCE / आपातकालीन सहायता</h2>
              <p className="text-xs text-rose-100 font-normal">Direct Emergency Dispatch & Verified Casualty Centers</p>
            </div>
          </div>
          <button
            onClick={() => setIsEmergencyModalOpen(false)}
            className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close emergency modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Dial Emergency Numbers Grid */}
        <div className="bg-rose-50 border-b border-rose-200 p-4 sm:p-5">
          <p className="text-xs font-bold text-rose-900 mb-2.5 uppercase tracking-wide">
            Tap to Call Verified National Hotlines (Free 24x7)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <a
              href="tel:108"
              className="flex flex-col items-center justify-center p-3 bg-white hover:bg-rose-100 rounded-xl border border-rose-300 text-center shadow-xs transition active:scale-95 min-h-[58px]"
            >
              <div className="flex items-center gap-1.5 text-rose-700 font-extrabold text-base">
                <Phone className="w-4 h-4 fill-rose-600" />
                <span>108</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-700">Ambulance</span>
            </a>

            <a
              href="tel:112"
              className="flex flex-col items-center justify-center p-3 bg-white hover:bg-rose-100 rounded-xl border border-rose-300 text-center shadow-xs transition active:scale-95 min-h-[58px]"
            >
              <div className="flex items-center gap-1.5 text-rose-700 font-extrabold text-base">
                <Phone className="w-4 h-4 fill-rose-600" />
                <span>112</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-700">National Emergency</span>
            </a>

            <a
              href="tel:102"
              className="flex flex-col items-center justify-center p-3 bg-white hover:bg-rose-100 rounded-xl border border-rose-300 text-center shadow-xs transition active:scale-95 min-h-[58px]"
            >
              <div className="flex items-center gap-1.5 text-slate-800 font-extrabold text-base">
                <Phone className="w-4 h-4 text-slate-600" />
                <span>102</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-700">Maternity / Infant</span>
            </a>

            <a
              href="tel:14416"
              className="flex flex-col items-center justify-center p-3 bg-white hover:bg-rose-100 rounded-xl border border-rose-300 text-center shadow-xs transition active:scale-95 min-h-[58px]"
            >
              <div className="flex items-center gap-1.5 text-slate-800 font-extrabold text-base">
                <Phone className="w-4 h-4 text-slate-600" />
                <span>14416</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-700">Tele-MANAS Mental</span>
            </a>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">

          {/* SOS Dispatch Action Card */}
          <div className="p-4 rounded-xl bg-slate-900 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-rose-400 animate-pulse" />
                  <h3 className="font-bold text-sm text-white">1-Tap Location & SOS Broadcast</h3>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Transmits GPS coordinates to nearest 108 ambulance dispatch and sends SMS alerts to your emergency contacts:
                  {user?.dependents.map(d => d.fullName).join(', ')}.
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{user?.location.address || 'Connaught Place, New Delhi'}</span>
                </div>
              </div>

              <button
                onClick={handleBroadcastSOS}
                disabled={broadcasting || !!dispatchInfo}
                className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 whitespace-nowrap min-h-[48px] cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-900/50"
              >
                {broadcasting ? (
                  <span>Broadcasting SOS...</span>
                ) : dispatchInfo ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Dispatched</span>
                  </>
                ) : (
                  <span>Broadcast SOS Alert</span>
                )}
              </button>
            </div>

            {/* If Dispatched Status */}
            {dispatchInfo && (
              <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs bg-slate-800/80 p-3 rounded-lg">
                <div className="flex items-center justify-between font-semibold text-emerald-400 mb-1">
                  <span>Ambulance En Route (ETA: {dispatchInfo.dispatchedAmbulance.etaMinutes} mins)</span>
                  <span>Vehicle: {dispatchInfo.dispatchedAmbulance.vehicleNumber}</span>
                </div>
                <p className="text-slate-300">
                  Driver: {dispatchInfo.dispatchedAmbulance.driverName} ({dispatchInfo.dispatchedAmbulance.driverPhone}) · {dispatchInfo.dispatchedAmbulance.type}
                </p>
                <p className="text-slate-400 text-[11px] mt-1">
                  ✓ SMS notifications sent with your location link to {dispatchInfo.notifiedContacts.length} emergency contacts.
                </p>
              </div>
            )}
          </div>

          {/* First Aid Instructions & Protocol Tabs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-sky-600" />
                <span>Instant First-Aid & Emergency Action Protocols</span>
              </h3>

              {currentGuide && (
                <button
                  onClick={() => handleReadAloud(`${currentGuide.title}. Urgent warning signs: ${currentGuide.urgentSigns.join('. ')}. Action steps: ${currentGuide.firstAidSteps.join('. ')}`)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
                  title="Read aloud first aid instructions"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSpeaking ? 'Stop Audio' : 'Listen Instructions'}</span>
                </button>
              )}
            </div>

            {/* Guide selection chips */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl mb-3">
              {guides.map(g => (
                <button
                  key={g.id}
                  onClick={() => setActiveGuideId(g.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${activeGuideId === g.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {g.title.split('/')[0].trim()}
                </button>
              ))}
            </div>

            {/* Guide Details Card */}
            {currentGuide && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{currentGuide.title}</h4>
                  <p className="text-rose-700 font-semibold mb-1">Warning Signs:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                    {currentGuide.urgentSigns.map((sign, idx) => (
                      <li key={idx}>{sign}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <p className="text-emerald-800 font-bold mb-1">Immediate First-Aid Steps:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-800">
                    {currentGuide.firstAidSteps.map((step, idx) => (
                      <li key={idx} className="font-medium">{step}</li>
                    ))}
                  </ol>
                </div>

                {currentGuide.whatNotToDo.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 text-rose-800">
                    <p className="font-bold mb-1">What NOT To Do:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {currentGuide.whatNotToDo.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nearest Emergency-Capable Hospitals with Real Availability */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Nearby Emergency Casualty Centers (Verified Real-Time Status)</span>
            </h3>

            <div className="space-y-2.5">
              {hospitals.slice(0, 3).map(h => (
                <div key={h.id} className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{h.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                          24x7 Casualty Open
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{h.address}, {h.city}</p>
                    </div>

                    <a
                      href={`tel:${h.emergencyPhone}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs whitespace-nowrap min-h-[38px]"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call {h.emergencyPhone}</span>
                    </a>
                  </div>

                  {/* Bed and ICU Status */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-4 text-[11px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-sky-600" />
                      <strong>{h.beds.availableGeneral}</strong> General Beds Free
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-rose-600" />
                      <strong>{h.beds.availableIcu}</strong> ICU Beds Ready
                    </span>
                    <span className="flex items-center gap-1">
                      <Ambulance className="w-3.5 h-3.5 text-emerald-600" />
                      <strong>{h.ambulanceStandbyCount}</strong> Ambulances on Standby
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Disclaimer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <p>
            *Sanjeevani emergency assistance directs users to certified government and accredited trauma infrastructure. Never ignore emergency symptoms.
          </p>
          <button
            onClick={() => setIsEmergencyModalOpen(false)}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-200 rounded-lg border border-slate-300 cursor-pointer min-h-[36px]"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
