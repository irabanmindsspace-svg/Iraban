import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Doctor } from '../types';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Video, 
  CheckCircle, 
  Star, 
  Languages, 
  Clock, 
  Building2, 
  ShieldCheck,
  ChevronRight,
  Filter,
  RotateCcw
} from 'lucide-react';

interface DoctorSearchProps {
  onSelectDoctorForBooking: (doctor: Doctor) => void;
  onStartTelemedicine?: (doctor: Doctor) => void;
}

export const DoctorSearch: React.FC<DoctorSearchProps> = ({ 
  onSelectDoctorForBooking,
  onStartTelemedicine 
}) => {
  const { user } = useApp();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [teleconsultOnly, setTeleconsultOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxFee, setMaxFee] = useState<number>(1000);

  const SPECIALTIES = [
    'General Physician & Internal Medicine',
    'Cardiologist',
    'Pediatrician',
    'Orthopedic & Joint Specialist',
    'Gynecologist & Obstetrician',
    'Pulmonologist & Chest Specialist',
  ];

  const CITIES = ['New Delhi', 'Mumbai', 'Chennai', 'Bengaluru', 'Lucknow', 'Kolkata'];

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.getDoctors({
        query: searchQuery || undefined,
        specialty: selectedSpecialty !== 'all' ? selectedSpecialty : undefined,
        city: selectedCity !== 'all' ? selectedCity : undefined,
        teleconsultation: teleconsultOnly ? true : undefined,
        verified: verifiedOnly ? true : undefined,
      });
      if (res.success) {
        setDoctors(res.doctors.filter(d => d.consultationFee <= maxFee));
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, selectedCity, teleconsultOnly, verifiedOnly, maxFee]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty('all');
    setSelectedCity('all');
    setTeleconsultOnly(false);
    setVerifiedOnly(false);
    setMaxFee(1000);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-5">
      
      {/* Search Header Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Verified Doctors & Medical Specialists
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified practitioners with National Medical Commission (NMC) registration.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>NMC / State Medical Council Verified</span>
          </div>
        </div>

        {/* Search input field */}
        <div className="mt-3.5 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchDoctors()}
              placeholder="Search by doctor name, qualification, hospital, or medical condition..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:border-sky-600 focus:outline-hidden"
            />
          </div>
          <button
            onClick={fetchDoctors}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded transition cursor-pointer"
          >
            Search
          </button>
        </div>
      </div>

      {/* Main Filter & Results Layout (Sidebar + Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Filter Sidebar (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filters</span>
            </span>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-sky-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Specialty Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Medical Specialty</label>
            <select
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-800 focus:border-sky-600 focus:outline-hidden"
            >
              <option value="all">All Specialties</option>
              {SPECIALTIES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* City / Location */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">City</label>
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-800 focus:border-sky-600 focus:outline-hidden"
            >
              <option value="all">All Cities</option>
              {CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Consultation Fee Max Range Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-800">Max Fee:</span>
              <span className="font-mono font-semibold text-slate-900">Up to ₹{maxFee}</span>
            </div>
            <input
              type="range"
              min="200"
              max="1000"
              step="50"
              value={maxFee}
              onChange={e => setMaxFee(parseInt(e.target.value, 10))}
              className="w-full accent-sky-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>₹200</span>
              <span>₹1,000</span>
            </div>
          </div>

          {/* Checkbox Options */}
          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
              <input
                type="checkbox"
                checked={teleconsultOnly}
                onChange={e => setTeleconsultOnly(e.target.checked)}
                className="rounded border-slate-300 text-sky-700 focus:ring-0"
              />
              <span>Video Consultation Available</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={e => setVerifiedOnly(e.target.checked)}
                className="rounded border-slate-300 text-sky-700 focus:ring-0"
              />
              <span>NMC License Verified Only</span>
            </label>
          </div>
        </div>

        {/* Right Doctor Results List (9 cols) */}
        <div className="lg:col-span-9 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span>
              Showing <strong className="text-slate-900 font-semibold">{doctors.length}</strong> verified practitioners
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 animate-pulse space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 w-2/3">
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                      <div className="h-3 bg-slate-100 rounded w-1/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                    <div className="h-8 bg-slate-100 rounded w-24" />
                  </div>
                  <div className="h-3 bg-slate-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="p-10 text-center bg-white border border-slate-200 rounded-lg text-slate-500 text-xs space-y-2">
              <p className="font-semibold text-slate-800 text-sm">No doctors match your current criteria.</p>
              <p className="text-xs text-slate-500">Adjust the fee limit, clear the specialty filter, or select another city.</p>
              <button
                onClick={handleResetFilters}
                className="mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded transition inline-block cursor-pointer btn-press"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {doctors.map(doc => (
                <div
                  key={doc.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-4 sm:p-5 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    
                    {/* Doctor Details */}
                    <div className="space-y-2 flex-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900">{doc.fullName}</h2>
                          {doc.isVerified && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              <CheckCircle className="w-3 h-3 text-emerald-700" />
                              <span>NMC Verified</span>
                            </span>
                          )}
                          {doc.teleconsultationAvailable && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                              <Video className="w-3 h-3 text-sky-700" />
                              <span>Video OPD</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-sky-900">{doc.specialization}</p>
                        <p className="text-[11px] text-slate-500">{doc.qualification}</p>
                      </div>

                      {/* Metadata row with natural dividers */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <span>{doc.experienceYears} Years Experience</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-slate-500">
                          Languages: {doc.languages.join(', ')}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="font-mono text-[11px] text-slate-500">
                          Reg: {doc.registrationNumber}
                        </span>
                      </div>

                      {/* Hospital location & OPD timings */}
                      <div className="space-y-1 text-xs text-slate-600 pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{doc.hospitalAffiliation} · {doc.city} ({doc.pincode})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>OPD: {doc.opdTimings} ({doc.availableDays.join(', ')})</span>
                        </div>
                      </div>

                      {/* Clinical Bio */}
                      <p className="text-xs text-slate-600 leading-relaxed pt-1">
                        {doc.about}
                      </p>
                    </div>

                    {/* Right column: Fee, Rating & Booking CTAs */}
                    <div className="sm:text-right shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex flex-col justify-between h-full space-y-3">
                      <div>
                        <div className="flex items-center sm:justify-end gap-1 text-xs font-semibold text-slate-800">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{doc.rating}</span>
                          <span className="text-slate-400 font-normal">({doc.reviewsCount} reviews)</span>
                        </div>
                        <div className="mt-1">
                          <span className="text-lg font-bold text-slate-900 tabular-nums">
                            ₹{doc.consultationFee}
                          </span>
                          <span className="text-[11px] text-slate-400 block">consultation fee</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => onSelectDoctorForBooking(doc)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded transition cursor-pointer text-center btn-press"
                        >
                          Book OPD Slot
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
