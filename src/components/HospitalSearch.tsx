import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Hospital } from '../types';
import { 
  Building2, 
  Search, 
  Phone, 
  MapPin, 
  Activity, 
  Bed, 
  Wind, 
  Ambulance, 
  ShieldCheck, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const HospitalSearch: React.FC = () => {
  const { user } = useApp();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  const CITIES = ['New Delhi', 'Mumbai', 'Chennai', 'Bengaluru', 'Lucknow', 'Kolkata'];

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await api.getHospitals({
        query: searchQuery || undefined,
        city: selectedCity !== 'all' ? selectedCity : undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        emergencyOnly: emergencyOnly ? true : undefined,
      });
      if (res.success) {
        setHospitals(res.hospitals);
      }
    } catch (e) {
      console.error('Failed to load hospitals:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [selectedCity, selectedType, emergencyOnly]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Search Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Hospital Directory & Real-Time Capacity
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Locate government hospitals, AIIMS, community health centers, and private trauma facilities.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Verified Bed & Oxygen Plant Metrics</span>
          </div>
        </div>

        {/* Search controls */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchHospitals()}
              placeholder="Search by hospital name, department (e.g. Cardiology, Trauma), city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 min-h-[44px]"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm text-slate-700 bg-white min-h-[44px]"
            >
              <option value="all">All Cities</option>
              {CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm text-slate-700 bg-white min-h-[44px]"
            >
              <option value="all">All Facility Types</option>
              <option value="Government">Government / Public</option>
              <option value="Trust / Non-Profit">Trust / Non-Profit</option>
              <option value="Private">Private Hospital</option>
            </select>
            <button
              onClick={fetchHospitals}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer min-h-[44px]"
            >
              Search
            </button>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
          <button
            onClick={() => setEmergencyOnly(!emergencyOnly)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${emergencyOnly ? 'bg-rose-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>24x7 Emergency Casualty Only</span>
          </button>
        </div>
      </div>

      {/* Hospitals List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Showing <strong className="text-slate-900 font-bold tabular-nums">{hospitals.length}</strong> healthcare facilities
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
            Loading verified hospitals and bed statuses...
          </div>
        ) : hospitals.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            No healthcare facilities found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {hospitals.map(hosp => (
              <div
                key={hosp.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition-all shadow-xs"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Column: Hospital Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">{hosp.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        hosp.type === 'Government' 
                          ? 'bg-emerald-50 text-emerald-800' 
                          : hosp.type === 'Trust / Non-Profit' 
                            ? 'bg-amber-50 text-amber-800' 
                            : 'bg-sky-50 text-sky-800'
                      }`}>
                        {hosp.type}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {hosp.accreditation}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{hosp.address}, {hosp.city} - {hosp.pincode}, {hosp.state}</span>
                    </div>

                    {/* Departments Unboxed text */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">Departments:</span>
                      {hosp.departments.map((dept, i) => (
                        <React.Fragment key={dept}>
                          <span>{dept}</span>
                          {i < hosp.departments.length - 1 && <span aria-hidden="true" className="text-slate-300">·</span>}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Empanelled Schemes */}
                    <div className="mt-2 text-xs text-slate-500 flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-700">Empanelled Schemes:</span>
                      {hosp.empanelledSchemes.join(', ')}
                    </div>
                  </div>

                  {/* Right Column: Contact & Quick Call */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                    <a
                      href={`tel:${hosp.emergencyPhone}`}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Emergency: {hosp.emergencyPhone}</span>
                    </a>
                    <a
                      href={`tel:${hosp.phone}`}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>General: {hosp.phone}</span>
                    </a>
                  </div>
                </div>

                {/* Real-time Verified Capacity Bar */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50/70 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-sky-600" />
                    <div>
                      <p className="text-[10px] text-slate-400">Available General</p>
                      <p className="font-bold text-slate-900 tabular-nums">
                        {hosp.beds.availableGeneral} <span className="text-slate-400 font-normal">/ {hosp.beds.total}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-600" />
                    <div>
                      <p className="text-[10px] text-slate-400">ICU Beds Ready</p>
                      <p className="font-bold text-slate-900 tabular-nums">
                        {hosp.beds.availableIcu} Beds
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-[10px] text-slate-400">Oxygen Plant</p>
                      <p className="font-semibold text-slate-800 text-[11px] truncate max-w-[140px]">
                        {hosp.oxygenPlantCapacity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Ambulance className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="text-[10px] text-slate-400">Ambulances</p>
                      <p className="font-bold text-slate-900 tabular-nums">
                        {hosp.ambulanceStandbyCount} on Standby
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
