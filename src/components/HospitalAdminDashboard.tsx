import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Hospital } from '../types';
import { 
  Building2, 
  Bed, 
  Activity, 
  Wind, 
  Ambulance, 
  CheckCircle, 
  Save,
  Plus
} from 'lucide-react';

export const HospitalAdminDashboard: React.FC = () => {
  const { showNotification } = useApp();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableBeds, setAvailableBeds] = useState(184);
  const [icuBeds, setIcuBeds] = useState(18);
  const [ambulances, setAmbulances] = useState(14);
  const [oxygenPlant, setOxygenPlant] = useState('PSA Plant 4500 LPM (100% Operational)');

  useEffect(() => {
    setLoading(true);
    api.getHospitals().then(res => {
      if (res.success && res.hospitals.length > 0) {
        const aiims = res.hospitals[0];
        setHospital(aiims);
        setAvailableBeds(aiims.beds.availableGeneral);
        setIcuBeds(aiims.beds.availableIcu);
        setAmbulances(aiims.ambulanceStandbyCount);
        setOxygenPlant(aiims.oxygenPlantCapacity);
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSaveCapacity = (e: React.FormEvent) => {
    e.preventDefault();
    showNotification('Hospital bed and emergency capacity status updated live on Sanjeevani network.');
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-5">
      
      {/* Title */}
      <div className="bg-white rounded-lg p-5 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Hospital Administration & Capacity Monitor
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-900 text-white rounded">
                Hospital Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {hospital?.name || 'All India Institute of Medical Sciences (AIIMS)'} · Ansari Nagar, New Delhi
            </p>
          </div>

          <span className="text-xs font-medium px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
            NABH Accredited & Ayushman Bharat Empanelled
          </span>
        </div>
      </div>

      {/* Real-time Capacity Update Form */}
      <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-sky-800" />
          <span>Facility Live Capacity (Broadcast to 108 Emergency Network)</span>
        </h2>

        <form onSubmit={handleSaveCapacity} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-sky-800" />
                <span>Available General Beds</span>
              </label>
              <input
                type="number"
                value={availableBeds}
                onChange={e => setAvailableBeds(parseInt(e.target.value, 10))}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-slate-900 focus:border-sky-600 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Total Sanctioned: 2,478 Beds</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-red-700" />
                <span>Available ICU / Ventilator Beds</span>
              </label>
              <input
                type="number"
                value={icuBeds}
                onChange={e => setIcuBeds(parseInt(e.target.value, 10))}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-slate-900 focus:border-sky-600 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Critical Care ICU Units</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                <Ambulance className="w-4 h-4 text-amber-700" />
                <span>Ambulances on Standby</span>
              </label>
              <input
                type="number"
                value={ambulances}
                onChange={e => setAmbulances(parseInt(e.target.value, 10))}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-slate-900 focus:border-sky-600 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">ALS & BLS Emergency Fleet</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-emerald-700" />
              <span>Oxygen Generation Plant Status</span>
            </label>
            <input
              type="text"
              value={oxygenPlant}
              onChange={e => setOxygenPlant(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-slate-900 focus:border-sky-600 focus:outline-hidden"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded flex items-center gap-1.5 transition cursor-pointer btn-press"
            >
              <Save className="w-4 h-4" />
              <span>Broadcast Capacity Status</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
