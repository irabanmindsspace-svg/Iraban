import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Activity, 
  AlertTriangle, 
  ArrowRight, 
  ShieldAlert, 
  Stethoscope, 
  Bot, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface BodyArea {
  id: string;
  name: string;
  subtitle: string;
  iconName: string;
  symptoms: string[];
  redFlagWarning?: string;
  recommendedSpecialty: string;
  suggestedTests: string[];
}

const BODY_AREAS: BodyArea[] = [
  {
    id: 'head',
    name: 'Head & Neurological',
    subtitle: 'Headache, Dizziness, Vision blur, Memory, Sleep',
    iconName: '🧠',
    symptoms: [
      'Persistent throbbing headache / migraine',
      'Sudden severe "thunderclap" headache',
      'Dizziness or vertigo when standing up',
      'Blurry vision or temporary eye strain',
      'Difficulty sleeping or daytime fatigue'
    ],
    redFlagWarning: 'Sudden weakness on one side of face/body, slurred speech, or loss of balance requires immediate 108 emergency stroke evaluation!',
    recommendedSpecialty: 'Neurologist / General Physician',
    suggestedTests: ['Blood Pressure Check', 'Eye Fundus Exam', 'Brain MRI/CT if sudden'],
  },
  {
    id: 'chest',
    name: 'Chest & Respiratory',
    subtitle: 'Heartbeat, Breathing, Cough, Throat, Palpitations',
    iconName: '🫁',
    symptoms: [
      'Crushing central chest heaviness spreading to jaw/arm',
      'Shortness of breath on walking or lying flat',
      'Persistent dry or wet cough exceeding 2 weeks',
      'Rapid heart palpitations or fluttering sensation',
      'Seasonal wheezing or asthma flare'
    ],
    redFlagWarning: 'Severe chest heaviness, cold sweating, or acute breathlessness is a medical emergency. Call 108 immediately!',
    recommendedSpecialty: 'Cardiologist / Pulmonologist',
    suggestedTests: ['ECG (12 Lead)', 'Chest X-Ray Digital', 'Lipid Profile', 'Cardiac Troponin'],
  },
  {
    id: 'abdomen',
    name: 'Abdomen & Digestion',
    subtitle: 'Stomach pain, Acidity, Nausea, Liver, Bowel',
    iconName: '🩺',
    symptoms: [
      'Burning sensation in upper chest (Acid reflux / GERD)',
      'Sharp pain in lower right abdomen (Appendix check)',
      'Bloating, irregular bowel habits, or indigestion',
      'Yellowing of eyes/urine (Suspected jaundice)',
      'Frequent vomiting or unable to retain water'
    ],
    redFlagWarning: 'Severe sudden abdominal rigidity, vomiting blood, or black stools requires urgent hospital casualty evaluation.',
    recommendedSpecialty: 'Gastroenterologist / General Surgeon',
    suggestedTests: ['Liver Function Test (LFT Complete)', 'Abdominal Ultrasound (USG)', 'CBC with ESR'],
  },
  {
    id: 'joints',
    name: 'Bones, Joints & Spine',
    subtitle: 'Back pain, Knee swelling, Arthritis, Fractures',
    iconName: '🦴',
    symptoms: [
      'Knee joint pain & clicking sound on stairs (Osteoarthritis)',
      'Lower back pain radiating down one leg (Sciatica)',
      'Morning finger joint stiffness lasting >30 minutes',
      'Sprained ankle or acute post-fall swelling',
      'Neck stiffness from ergonomic computer posture'
    ],
    recommendedSpecialty: 'Orthopedic & Joint Specialist',
    suggestedTests: ['Joint X-Ray PA View', 'Serum Uric Acid (Gout)', 'Vitamin D3 & Calcium', 'Bone Mineral Density'],
  },
  {
    id: 'child',
    name: 'Pediatric & Child Health',
    subtitle: 'Infant fever, Cough, Vaccines, Rash, Colic',
    iconName: '👶',
    symptoms: [
      'High fever above 101°F in infant under 6 months',
      'Persistent night barking cough with stridor',
      'Refusal to feed, lethargy, or dry crying (Dehydration)',
      'Skin rashes with high temperature',
      'Delayed immunization schedule'
    ],
    redFlagWarning: 'Infant with sunken eyes, no wet diaper for 8 hours, or breathing rapidly requires emergency pediatric assessment.',
    recommendedSpecialty: 'Pediatrician',
    suggestedTests: ['Pediatric CBC', 'Urine Routine Examination', 'Growth & Immunization Tracking'],
  },
  {
    id: 'general',
    name: 'Metabolic & Preventive',
    subtitle: 'Diabetes, Thyroid, High BP, Weakness, Fever',
    iconName: '🔬',
    symptoms: [
      'Frequent thirst, excessive urination & unexplained weight loss',
      'Continuous unexplained fatigue, chill sensitivity, hair fall (Thyroid)',
      'High blood pressure reading (>140/90 mmHg)',
      'Intermittent seasonal viral fever with body ache'
    ],
    recommendedSpecialty: 'General Physician & Internal Medicine',
    suggestedTests: ['HbA1c Glycosylated Hemoglobin', 'Thyroid Profile (T3, T4, TSH)', 'Complete Blood Count (CBC)'],
  }
];

export const SymptomTriageBodyMap: React.FC = () => {
  const { setActiveTab, setIsEmergencyModalOpen } = useApp();
  const [selectedAreaId, setSelectedAreaId] = useState<string>('chest');

  const activeArea = BODY_AREAS.find(b => b.id === selectedAreaId) || BODY_AREAS[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-600" />
            <span>Interactive Visual Symptom Triage</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select an anatomical area to see triage warnings, recommended doctors, and suggested diagnostic tests.
          </p>
        </div>

        <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          Not a definitive diagnosis · Triage navigation only
        </span>
      </div>

      {/* Anatomy Selector Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {BODY_AREAS.map(area => (
          <button
            key={area.id}
            onClick={() => setSelectedAreaId(area.id)}
            className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center min-h-[76px] ${
              selectedAreaId === area.id
                ? 'bg-sky-50 border-sky-500 text-sky-950 font-bold shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="text-2xl mb-1">{area.iconName}</span>
            <span className="text-xs leading-tight font-semibold">{area.name.split('&')[0].trim()}</span>
          </button>
        ))}
      </div>

      {/* Dynamic Detail Card for selected area */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <span className="text-2xl mr-2">{activeArea.iconName}</span>
            <span className="font-extrabold text-sm text-slate-900">{activeArea.name} Area</span>
            <p className="text-slate-500 mt-0.5">{activeArea.subtitle}</p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-slate-400 text-[10px] block">Recommended Specialist</span>
            <span className="font-bold text-sky-800 text-xs sm:text-sm">{activeArea.recommendedSpecialty}</span>
          </div>
        </div>

        {/* Urgent Warning Box if present */}
        {activeArea.redFlagWarning && (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <span className="font-bold block uppercase text-[10px] tracking-wide text-rose-700">Red-Flag Warning</span>
              <p className="text-xs leading-relaxed">{activeArea.redFlagWarning}</p>
              <button
                onClick={() => setIsEmergencyModalOpen(true)}
                className="mt-2 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg transition"
              >
                Open Emergency SOS (108)
              </button>
            </div>
          </div>
        )}

        {/* Symptoms checklist */}
        <div>
          <p className="font-bold text-slate-900 mb-2">Common Symptoms in this Category:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
            {activeArea.symptoms.map((s, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Tests */}
        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
            <span className="font-bold text-slate-800">Standard Tests:</span>
            {activeArea.suggestedTests.map((t, i) => (
              <span key={i} className="bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {t}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('doctors')}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl flex items-center gap-1 transition cursor-pointer"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Find {activeArea.recommendedSpecialty.split('/')[0]}</span>
            </button>

            <button
              onClick={() => setActiveTab('healthguide')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl flex items-center gap-1 transition cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-sky-400" />
              <span>Ask AI Guide</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
