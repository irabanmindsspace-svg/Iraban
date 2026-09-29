import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Doctor } from '../types';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Video, 
  CheckCircle, 
  Star, 
  Languages, 
  Clock, 
  Building2, 
  Stethoscope,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface DoctorSearchProps {
  onSelectDoctorForBooking: (doctor: Doctor) => void;
  onStartTelemedicine?: (doctor: Doctor) => void;
}

export const DoctorSearch: React.FC<DoctorSearchProps> = ({ 
  onSelectDoctorForBooking,
  onStartTelemedicine 
}) => {
  const { user, t } = useApp();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [teleconsultOnly, setTeleconsultOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

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
        setDoctors(res.doctors);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, selectedCity, teleconsultOnly, verifiedOnly]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Title & Search Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Find Verified Doctors & Specialists
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              National Medical Commission (NMC) verified practitioners across Indian cities and rural districts.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% Verified Credentials & Council Badges</span>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchDoctors()}
              placeholder="Search by doctor name, specialty, condition, or hospital..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 min-h-[44px]"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm text-slate-700 bg-white min-h-[44px]"
            >
              <option value="all">All Specialties ({SPECIALTIES.length})</option>
              {SPECIALTIES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
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
            <button
              onClick={fetchDoctors}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer min-h-[44px]"
            >
              Search
            </button>
          </div>
        </div>

        {/* Filter Toggle Badges (Zero-Pill interactive segmented controls) */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium mr-1">Filter by:</span>
          
          <button
            onClick={() => setTeleconsultOnly(!teleconsultOnly)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${teleconsultOnly ? 'bg-sky-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Consultation Available</span>
          </button>

          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${verifiedOnly ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>NMC Verified Only</span>
          </button>
        </div>
      </div>

      {/* Results Count & Providers Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Showing <strong className="text-slate-900 font-bold tabular-nums">{doctors.length}</strong> available healthcare professionals
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
            Loading doctors and clinic slots across India...
          </div>
        ) : doctors.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            <p className="font-semibold text-slate-700">No doctors match your search filters.</p>
            <p className="text-xs mt-1">Try resetting the specialty or city filter to see practitioners.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map(doc => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Top Doctor Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-slate-900">{doc.fullName}</h3>
                        {doc.isVerified && (
                          <span className="text-emerald-600" title="Verified by State Medical Council / NMC">
                            <CheckCircle className="w-4 h-4 fill-emerald-100" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-sky-700 mt-0.5">{doc.specialization}</p>
                      <p className="text-[11px] text-slate-500">{doc.qualification}</p>
                    </div>

                    {/* Fee & Rating */}
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600 justify-end">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span className="tabular-nums">{doc.rating}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({doc.reviewsCount})</span>
                      </div>
                      <p className="text-sm font-extrabold text-slate-900 mt-1 tabular-nums">
                        ₹{doc.consultationFee}
                      </p>
                      <p className="text-[10px] text-slate-400">per consult</p>
                    </div>
                  </div>

                  {/* Metadata Row (Unboxed metadata with subtle separators) */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 border-t border-slate-100 pt-2.5">
                    <span>{doc.experienceYears} Years Exp</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Languages className="w-3 h-3 text-slate-400" />
                      {doc.languages.join(', ')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      Reg: {doc.registrationNumber}
                    </span>
                  </div>

                  {/* Hospital & OPD Timing */}
                  <div className="mt-2.5 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.hospitalAffiliation} · {doc.city} ({doc.pincode})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>OPD: {doc.opdTimings} ({doc.availableDays.join(', ')})</span>
                    </div>
                  </div>

                  {/* About bio snippet */}
                  <p className="mt-2.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {doc.about}
                  </p>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    {doc.teleconsultationAvailable && (
                      <span className="text-sky-700 flex items-center gap-1">
                        <Video className="w-3.5 h-3.5" /> Video OPD
                      </span>
                    )}
                    {doc.inPersonAvailable && (
                      <span className="text-slate-600 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" /> Clinic OPD
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectDoctorForBooking(doc)}
                      className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer min-h-[40px]"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Slot</span>
                    </button>
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
