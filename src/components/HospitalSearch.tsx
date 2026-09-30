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
  Filter
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
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-5">
      
      {/* Search Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Hospital Directory & Verified Bed Capacity
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified general beds, critical ICU availability, and oxygen facilities across government and private centers.
            </p>
          </div>

          <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1 rounded border border-slate-200">
            NABH / NABL Accredited Facilities
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchHospitals()}
              placeholder="Search by hospital name or department (e.g. Trauma, Cardiology)..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:border-sky-600 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs bg-white text-slate-800 focus:border-sky-600 focus:outline-hidden"
            >
              <option value="all">All Cities</option>
              {CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4 flex items-center gap-2">
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs bg-white text-slate-800 focus:border-sky-600 focus:outline-hidden"
            >
              <option value="all">All Facility Types</option>
              <option value="Government">Government / Public</option>
              <option value="Trust / Non-Profit">Trust / Non-Profit</option>
              <option value="Private">Private Hospital</option>
            </select>
            <button
              onClick={fetchHospitals}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded transition cursor-pointer shrink-0"
            >
              Search
            </button>
          </div>
        </div>

        {/* 24x7 Emergency check */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-700">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={emergencyOnly}
              onChange={e => setEmergencyOnly(e.target.checked)}
              className="rounded border-slate-300 text-red-600 focus:ring-0"
            />
            <span>24x7 Emergency / Trauma Casualty Only</span>
          </label>
        </div>
      </div>

      {/* Hospitals List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
          <span>
            Showing <strong className="text-slate-900 font-semibold">{hospitals.length}</strong> verified facilities
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 animate-pulse space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 w-2/3">
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                    <div className="h-3 bg-slate-100 rounded w-3/4" />
                  </div>
                  <div className="h-8 bg-slate-100 rounded w-32" />
                </div>
                <div className="h-14 bg-slate-50 rounded border border-slate-100" />
              </div>
            ))}
          </div>
        ) : hospitals.length === 0 ? (
          <div className="p-10 text-center bg-white border border-slate-200 rounded-lg text-slate-500 text-xs space-y-2">
            <p className="font-semibold text-slate-800 text-sm">No healthcare facilities found matching your criteria.</p>
            <p className="text-xs text-slate-500">Try selecting another city or clearing the 24x7 trauma casualty filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {hospitals.map(hosp => (
              <div
                key={hosp.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-5 transition space-y-3"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Hospital Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">{hosp.name}</h2>
                      <span className="text-[11px] font-medium text-slate-600 border border-slate-200 px-2 py-0.5 rounded">
                        {hosp.type}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 border border-slate-200 px-2 py-0.5 rounded">
                        {hosp.accreditation}
                      </span>
                      {hosp.has24x7Emergency && (
                        <span className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          24x7 Casualty Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{hosp.address}, {hosp.city} - {hosp.pincode}, {hosp.state}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 pt-0.5">
                      <span className="font-semibold text-slate-700">Departments:</span>
                      {hosp.departments.join(', ')}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">Empanelled Schemes:</span>
                      {hosp.empanelledSchemes.join(', ')}
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                    <a
                      href={`tel:${hosp.emergencyPhone}`}
                      className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white font-semibold text-xs rounded transition flex items-center justify-center gap-1.5 btn-press"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Emergency: {hosp.emergencyPhone}</span>
                    </a>
                    <a
                      href={`tel:${hosp.phone}`}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs rounded transition flex items-center justify-center gap-1.5 btn-press"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>OPD: {hosp.phone}</span>
                    </a>
                  </div>
                </div>

                {/* Structured Bed & Capacity Row */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div>
                    <span className="text-[11px] text-slate-500 block">General Beds Available</span>
                    <strong className="text-slate-900 font-mono text-sm">
                      {hosp.beds.availableGeneral} <span className="text-slate-400 font-normal text-xs">/ {hosp.beds.total}</span>
                    </strong>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block">ICU Beds Ready</span>
                    <strong className="text-slate-900 font-mono text-sm">
                      {hosp.beds.availableIcu} Beds
                    </strong>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block">Oxygen Plant Status</span>
                    <span className="text-slate-700 font-medium text-[11px] truncate block mt-0.5">
                      {hosp.oxygenPlantCapacity}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block">Standby Ambulances</span>
                    <strong className="text-slate-900 font-mono text-sm">
                      {hosp.ambulanceStandbyCount} Vehicles
                    </strong>
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
