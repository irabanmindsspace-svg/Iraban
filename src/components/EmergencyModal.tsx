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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-2xl border border-slate-300 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Urgent Header Banner */}
        <div className="bg-red-700 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-1.5 bg-red-800 rounded">
              <AlertTriangle className="w-5 h-5 text-white" />
            </span>
            <div>
              <h2 className="text-base font-bold tracking-tight">Emergency Assistance & Triage</h2>
              <p className="text-xs text-red-100">National Ambulance Dispatch & 24x7 Casualty Centers</p>
            </div>
          </div>
          <button
            onClick={() => setIsEmergencyModalOpen(false)}
            className="p-1.5 text-white/80 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center btn-press"
            aria-label="Close emergency modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Dial Emergency Numbers Grid */}
        <div className="bg-red-50/60 border-b border-red-200 p-4 sm:p-5">
          <p className="text-[11px] font-bold text-red-900 mb-2 uppercase tracking-wider">
            Verified National Helplines (Toll-Free 24x7)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <a
              href="tel:108"
              className="flex flex-col items-center justify-center p-2.5 bg-white hover:bg-red-50 rounded border border-red-200 text-center transition btn-press min-h-[56px]"
            >
              <div className="flex items-center gap-1.5 text-red-700 font-bold text-base">
                <Phone className="w-4 h-4 fill-red-700" />
                <span>108</span>
              </div>
              <span className="text-[11px] font-medium text-slate-700">Ambulance</span>
            </a>

            <a
              href="tel:112"
              className="flex flex-col items-center justify-center p-2.5 bg-white hover:bg-red-50 rounded border border-red-200 text-center transition btn-press min-h-[56px]"
            >
              <div className="flex items-center gap-1.5 text-red-700 font-bold text-base">
                <Phone className="w-4 h-4 fill-red-700" />
                <span>112</span>
              </div>
              <span className="text-[11px] font-medium text-slate-700">National Emergency</span>
            </a>

            <a
              href="tel:102"
              className="flex flex-col items-center justify-center p-2.5 bg-white hover:bg-red-50 rounded border border-slate-200 text-center transition btn-press min-h-[56px]"
            >
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-base">
                <Phone className="w-4 h-4 text-slate-600" />
                <span>102</span>
              </div>
              <span className="text-[11px] font-medium text-slate-700">Maternity / Infant</span>
            </a>

            <a
              href="tel:14416"
              className="flex flex-col items-center justify-center p-2.5 bg-white hover:bg-red-50 rounded border border-slate-200 text-center transition btn-press min-h-[56px]"
            >
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-base">
                <Phone className="w-4 h-4 text-slate-600" />
                <span>14416</span>
              </div>
              <span className="text-[11px] font-medium text-slate-700">Tele-MANAS Mental</span>
            </a>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">

          {/* SOS Dispatch Action Card */}
          <div className="p-4 rounded-lg bg-slate-900 text-white border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-red-400" />
                  <h3 className="font-bold text-sm text-white">Direct Location & SOS Broadcast</h3>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Transmits GPS coordinates to nearest 108 ambulance dispatch and notifies emergency contacts:
                  {' '}{user?.dependents.map(d => d.fullName).join(', ')}.
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>{user?.location.address || 'Connaught Place, New Delhi'}</span>
                </div>
              </div>

              <button
                onClick={handleBroadcastSOS}
                disabled={broadcasting || !!dispatchInfo}
                className="px-4 py-2.5 rounded bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition whitespace-nowrap min-h-[44px] cursor-pointer flex items-center justify-center gap-2 btn-press"
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

            {/* If Dispatched Status with Live Stepper */}
            {dispatchInfo && (
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs bg-slate-800/80 p-3.5 rounded space-y-3">
                {/* Stepper */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                  <div className="p-2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    <span className="block text-emerald-400">Step 1</span>
                    SOS Acknowledged
                  </div>
                  <div className="p-2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    <span className="block text-emerald-400">Step 2</span>
                    Ambulance Assigned
                  </div>
                  <div className="p-2 rounded bg-sky-950 text-sky-300 border border-sky-800">
                    <span className="block text-sky-400">Step 3</span>
                    En-Route (Live Dispatch)
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between font-semibold text-emerald-400 gap-1">
                  <span className="text-xs">Ambulance ETA: ~6 mins (Dispatched towards you)</span>
                  <span className="text-[11px] text-slate-300 font-mono">Vehicle: {dispatchInfo.dispatchedAmbulance.vehicleNumber}</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Driver: {dispatchInfo.dispatchedAmbulance.driverName} ({dispatchInfo.dispatchedAmbulance.driverPhone}) · {dispatchInfo.dispatchedAmbulance.type}
                </p>

                {/* Web Share Button */}
                <div className="pt-2 border-t border-slate-700 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    SMS location broadcast sent to {dispatchInfo.notifiedContacts.length} emergency contacts.
                  </span>
                  
                  <button
                    onClick={() => {
                      const alertText = `URGENT: Medical emergency SOS raised on Sanjeevani Platform for ${user?.fullName}. Location: ${user?.location.address || 'Connaught Place, New Delhi'}. 108 Ambulance dispatched.`;
                      const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
                      if (nav && nav.share) {
                        nav.share({
                          title: 'MEDICAL EMERGENCY SOS',
                          text: alertText,
                          url: window.location.href,
                        }).catch(() => {});
                      } else if (nav && nav.clipboard) {
                        nav.clipboard.writeText(alertText);
                        alert('Emergency broadcast message copied to clipboard. Paste into WhatsApp or SMS.');
                      }
                    }}
                    className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-medium text-[11px] rounded transition cursor-pointer btn-press"
                  >
                    Share SOS with Family
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* First Aid Instructions & Protocol Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                <LifeBuoy className="w-4 h-4 text-sky-800" />
                <span>Immediate First-Aid Protocols</span>
              </h3>

              {currentGuide && (
                <button
                  onClick={() => handleReadAloud(`${currentGuide.title}. Warning signs: ${currentGuide.urgentSigns.join('. ')}. Action steps: ${currentGuide.firstAidSteps.join('. ')}`)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition cursor-pointer btn-press border border-slate-200"
                  title="Read aloud first aid instructions"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
                </button>
              )}
            </div>

            {/* Guide selection tabs */}
            <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded mb-2.5">
              {guides.map(g => (
                <button
                  key={g.id}
                  onClick={() => setActiveGuideId(g.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition cursor-pointer btn-press ${activeGuideId === g.id ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {g.title.split('/')[0].trim()}
                </button>
              ))}
            </div>

            {/* Guide Details Card */}
            {currentGuide && (
              <div className="p-4 rounded border border-slate-200 bg-slate-50/70 space-y-2.5 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{currentGuide.title}</h4>
                  <p className="text-red-700 font-semibold mb-1">Warning Signs:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                    {currentGuide.urgentSigns.map((sign, idx) => (
                      <li key={idx}>{sign}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <p className="text-emerald-800 font-bold mb-1">Action Steps:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-800">
                    {currentGuide.firstAidSteps.map((step, idx) => (
                      <li key={idx} className="font-medium">{step}</li>
                    ))}
                  </ol>
                </div>

                {currentGuide.whatNotToDo.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 text-red-800">
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
            <h3 className="text-xs font-bold text-slate-900 mb-2.5 flex items-center gap-1.5 uppercase tracking-wide">
              <Activity className="w-4 h-4 text-emerald-700" />
              <span>Nearby Emergency Casualty Centers (Live Status)</span>
            </h3>

            <div className="space-y-2">
              {hospitals.slice(0, 3).map(h => (
                <div key={h.id} className="p-3 rounded border border-slate-200 hover:border-slate-300 bg-white transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{h.name}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                          24x7 Casualty Open
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{h.address}, {h.city}</p>
                    </div>

                    <a
                      href={`tel:${h.emergencyPhone}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs whitespace-nowrap min-h-[36px] btn-press"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call {h.emergencyPhone}</span>
                    </a>
                  </div>

                  {/* Bed and ICU Status */}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-4 text-[11px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-sky-700" />
                      <strong className="text-slate-900">{h.beds.availableGeneral}</strong> General Beds
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-red-700" />
                      <strong className="text-slate-900">{h.beds.availableIcu}</strong> ICU Ready
                    </span>
                    <span className="flex items-center gap-1">
                      <Ambulance className="w-3.5 h-3.5 text-emerald-700" />
                      <strong className="text-slate-900">{h.ambulanceStandbyCount}</strong> Ambulances on Standby
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Disclaimer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <p>
            Emergency assistance directs to accredited government & trauma infrastructure.
          </p>
          <button
            onClick={() => setIsEmergencyModalOpen(false)}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded border border-slate-300 cursor-pointer min-h-[34px] btn-press"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
