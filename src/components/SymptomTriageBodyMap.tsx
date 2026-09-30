import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Activity, 
  AlertTriangle, 
  ArrowRight, 
  ShieldAlert, 
  Stethoscope, 
  CheckCircle2,
  Heart,
  Brain,
  Wind,
  Bone,
  Baby,
  Thermometer
} from 'lucide-react';

interface BodyArea {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  symptoms: string[];
  redFlagWarning?: string;
  recommendedSpecialty: string;
  suggestedTests: string[];
}

const BODY_AREAS: BodyArea[] = [
  {
    id: 'head',
    name: 'Neurological & Head',
    subtitle: 'Headache, Dizziness, Vision blur, Sleep disturbance',
    icon: Brain,
    symptoms: [
      'Persistent throbbing headache / migraine',
      'Sudden severe "thunderclap" headache',
      'Dizziness or vertigo when standing up',
      'Blurry vision or temporary eye strain',
      'Difficulty sleeping or daytime fatigue'
    ],
    redFlagWarning: 'Sudden weakness on one side of face or body, slurred speech, or loss of balance requires immediate 108 emergency stroke evaluation.',
    recommendedSpecialty: 'Neurologist / General Physician',
    suggestedTests: ['Blood Pressure Check', 'Eye Fundus Exam', 'Brain MRI/CT if sudden'],
  },
  {
    id: 'chest',
    name: 'Cardio & Respiratory',
    subtitle: 'Chest tightness, Breathing, Cough, Palpitations',
    icon: Heart,
    symptoms: [
      'Central chest heaviness radiating to left arm or jaw',
      'Shortness of breath on mild exertion or lying flat',
      'Persistent dry or productive cough exceeding 2 weeks',
      'Rapid heart palpitations or irregular fluttering',
      'Seasonal wheezing or asthma flare'
    ],
    redFlagWarning: 'Severe central chest heaviness, cold sweating, or acute breathlessness is a medical emergency. Call 108 immediately.',
    recommendedSpecialty: 'Cardiologist / Pulmonologist',
    suggestedTests: ['ECG (12 Lead)', 'Chest X-Ray Digital', 'Lipid Profile', 'Cardiac Troponin'],
  },
  {
    id: 'abdomen',
    name: 'Gastrointestinal',
    subtitle: 'Stomach pain, Acid reflux, Nausea, Digestion',
    icon: Wind,
    symptoms: [
      'Burning sensation in upper chest (Acid reflux / GERD)',
      'Sharp pain in lower right abdomen (Appendix evaluation)',
      'Bloating, irregular bowel habits, or persistent indigestion',
      'Yellowing of eyes or urine (Suspected jaundice)',
      'Frequent nausea or inability to retain fluids'
    ],
    redFlagWarning: 'Severe sudden abdominal rigidity, vomiting blood, or black stools requires urgent hospital casualty evaluation.',
    recommendedSpecialty: 'Gastroenterologist / General Surgeon',
    suggestedTests: ['Liver Function Test (LFT)', 'Abdominal Ultrasound (USG)', 'CBC with ESR'],
  },
  {
    id: 'joints',
    name: 'Musculoskeletal',
    subtitle: 'Joint pain, Spine stiffness, Arthritis, Sprains',
    icon: Bone,
    symptoms: [
      'Knee joint pain & clicking sound on stairs (Osteoarthritis)',
      'Lower back pain radiating down one leg (Sciatica)',
      'Morning finger joint stiffness lasting >30 minutes',
      'Sprained ankle or acute post-fall swelling',
      'Neck stiffness from ergonomic computer posture'
    ],
    recommendedSpecialty: 'Orthopedic & Joint Specialist',
    suggestedTests: ['Joint X-Ray PA View', 'Serum Uric Acid', 'Vitamin D3 & Calcium', 'Bone Density'],
  },
  {
    id: 'child',
    name: 'Pediatrics & Infant',
    subtitle: 'Child fever, Cough, Rash, Immunization',
    icon: Baby,
    symptoms: [
      'High fever above 101°F in infant under 6 months',
      'Persistent night barking cough with stridor',
      'Refusal to feed, lethargy, or reduced wet diapers',
      'Skin rashes accompanied by high fever',
      'Delayed immunization schedule catch-up'
    ],
    redFlagWarning: 'Infant with sunken fontanelle, no wet diaper for 8 hours, or rapid labored breathing requires immediate pediatric emergency care.',
    recommendedSpecialty: 'Pediatrician',
    suggestedTests: ['Pediatric CBC', 'Urine Routine Examination', 'Growth & Immunization Tracking'],
  },
  {
    id: 'general',
    name: 'General & Metabolic',
    subtitle: 'Diabetes, Thyroid, High BP, Viral fever',
    icon: Thermometer,
    symptoms: [
      'Frequent thirst, excessive urination & unexplained weight loss',
      'Continuous unexplained fatigue and cold intolerance (Thyroid)',
      'High blood pressure reading (>140/90 mmHg)',
      'Intermittent seasonal viral fever with body ache'
    ],
    recommendedSpecialty: 'General Physician & Internal Medicine',
    suggestedTests: ['HbA1c Blood Sugar', 'Thyroid Profile (TSH)', 'Complete Blood Count (CBC)'],
  }
];

export const SymptomTriageBodyMap: React.FC = () => {
  const { setActiveTab, setIsEmergencyModalOpen } = useApp();
  const [selectedAreaId, setSelectedAreaId] = useState<string>('chest');

  const activeArea = BODY_AREAS.find(b => b.id === selectedAreaId) || BODY_AREAS[0];
  const ActiveIcon = activeArea.icon;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-700" />
            <span>Clinical Symptom Triage</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a physiological system to review common indicators, specialist recommendations, and red flags.
          </p>
        </div>

        <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
          Preliminary triage aid · Not a diagnosis
        </span>
      </div>

      {/* Anatomy Selector Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {BODY_AREAS.map(area => {
          const Icon = area.icon;
          const isSelected = selectedAreaId === area.id;
          return (
            <button
              key={area.id}
              onClick={() => setSelectedAreaId(area.id)}
              className={`p-3 rounded border text-left transition cursor-pointer flex flex-col justify-between min-h-[72px] btn-press ${
                isSelected
                  ? 'bg-sky-50 border-sky-600 text-sky-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-sky-700' : 'text-slate-500'}`} />
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-sky-700" />}
              </div>
              <span className="text-xs font-semibold leading-tight mt-2">{area.name}</span>
            </button>
          );
        })}
      </div>

      {/* Detail Area for selected body system */}
      <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-3.5 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded bg-white border border-slate-200 text-slate-700">
              <ActiveIcon className="w-5 h-5 text-sky-700" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">{activeArea.name}</h4>
              <p className="text-slate-500 text-[11px] mt-0.5">{activeArea.subtitle}</p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-slate-400 text-[10px] block uppercase tracking-wide font-medium">Recommended Specialist</span>
            <span className="font-semibold text-slate-900 text-xs sm:text-sm">{activeArea.recommendedSpecialty}</span>
          </div>
        </div>

        {/* Urgent Warning Box if present */}
        {activeArea.redFlagWarning && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-950 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold uppercase text-[10px] tracking-wide text-red-800 block">Critical Red Flag</span>
              <p className="text-xs leading-relaxed text-red-900">{activeArea.redFlagWarning}</p>
              <button
                onClick={() => setIsEmergencyModalOpen(true)}
                className="mt-2 px-3 py-1 bg-red-700 hover:bg-red-800 text-white font-semibold text-[11px] rounded transition cursor-pointer btn-press"
              >
                Emergency Dispatch (108)
              </button>
            </div>
          </div>
        )}

        {/* Symptoms checklist */}
        <div>
          <p className="font-semibold text-slate-800 mb-2">Common clinical presentations:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
            {activeArea.symptoms.map((s, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded border border-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-700 shrink-0 mt-0.5" />
                <span className="leading-snug">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Tests & Actions */}
        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
            <span className="font-semibold text-slate-800">Diagnostic Tests:</span>
            {activeArea.suggestedTests.map((t, i) => (
              <span key={i} className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                {t}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('doctors')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded flex items-center gap-1.5 transition cursor-pointer text-xs btn-press"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Find {activeArea.recommendedSpecialty.split('/')[0].trim()}</span>
            </button>

            <button
              onClick={() => setActiveTab('healthguide')}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-medium rounded flex items-center gap-1.5 transition cursor-pointer text-xs btn-press"
            >
              <span>Consult Clinical Guide</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
