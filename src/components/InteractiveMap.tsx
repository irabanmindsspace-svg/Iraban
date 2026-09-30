import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Hospital } from '../types';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Activity, 
  Bed, 
  Ambulance, 
  Layers, 
  Compass, 
  CheckCircle,
  LocateFixed,
  Filter
} from 'lucide-react';

interface FacilityPin {
  id: string;
  name: string;
  type: 'Hospital' | 'Ambulance' | 'Pharmacy' | 'BloodBank';
  lat: number;
  lng: number;
  x: number; // percentage on map canvas
  y: number;
  address: string;
  emergencyPhone: string;
  distanceKm: number;
  bedsAvailable?: number;
  icuAvailable?: number;
  ambulanceEtaMins?: number;
}

export const InteractiveMap: React.FC = () => {
  const { user, showNotification, setIsEmergencyModalOpen } = useApp();
  const [selectedRadius, setSelectedRadius] = useState<number>(10);
  const [activeFilter, setActiveFilter] = useState<'all' | 'hospital' | 'ambulance' | 'pharmacy'>('all');
  const [selectedPin, setSelectedPin] = useState<FacilityPin | null>(null);
  const [ambulancePos, setAmbulancePos] = useState({ x: 52, y: 44 });

  // Facility Pins around user location
  const [facilities, setFacilities] = useState<FacilityPin[]>([
    {
      id: 'pin_1',
      name: 'AIIMS Apex Emergency Trauma Center',
      type: 'Hospital',
      lat: 28.5672,
      lng: 77.2100,
      x: 48,
      y: 52,
      address: 'Ansari Nagar, New Delhi',
      emergencyPhone: '011-26588700',
      distanceKm: 3.2,
      bedsAvailable: 184,
      icuAvailable: 18,
    },
    {
      id: 'pin_2',
      name: 'Safdarjung Hospital Emergency Care',
      type: 'Hospital',
      lat: 28.5700,
      lng: 77.2070,
      x: 44,
      y: 55,
      address: 'Ring Road, Opposite AIIMS, New Delhi',
      emergencyPhone: '011-26165060',
      distanceKm: 3.8,
      bedsAvailable: 92,
      icuAvailable: 12,
    },
    {
      id: 'pin_3',
      name: 'Jan Aushadhi Kendra - Connaught Place',
      type: 'Pharmacy',
      lat: 28.6315,
      lng: 77.2167,
      x: 55,
      y: 38,
      address: 'Super Market, Outer Circle, Connaught Place',
      emergencyPhone: '+91 11 2334 1122',
      distanceKm: 1.1,
    },
    {
      id: 'pin_4',
      name: 'Red Cross Transfusion Blood Center',
      type: 'BloodBank',
      lat: 28.6200,
      lng: 77.2100,
      x: 50,
      y: 45,
      address: 'Red Cross Road, New Delhi',
      emergencyPhone: '011-23716441',
      distanceKm: 2.1,
    },
    {
      id: 'pin_5',
      name: '108 Advanced Life Support Ambulance #1088',
      type: 'Ambulance',
      lat: 28.6250,
      lng: 77.2050,
      x: 52,
      y: 44,
      address: 'En-route patrol near Barakhamba Road',
      emergencyPhone: '108',
      distanceKm: 1.4,
      ambulanceEtaMins: 6,
    }
  ]);

  // Live simulation of moving ambulance patrol
  useEffect(() => {
    const interval = setInterval(() => {
      setAmbulancePos(prev => {
        const nextX = prev.x + (Math.random() * 1.2 - 0.6);
        const nextY = prev.y + (Math.random() * 1.2 - 0.6);
        return {
          x: Math.max(30, Math.min(70, nextX)),
          y: Math.max(30, Math.min(70, nextY)),
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredPins = facilities.filter(f => {
    if (activeFilter === 'hospital' && f.type !== 'Hospital') return false;
    if (activeFilter === 'ambulance' && f.type !== 'Ambulance') return false;
    if (activeFilter === 'pharmacy' && f.type !== 'Pharmacy' && f.type !== 'BloodBank') return false;
    return f.distanceKm <= selectedRadius;
  });

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Map Control Header */}
      <div className="p-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-sky-700" />
          <div>
            <h3 className="text-xs font-bold text-slate-900">Healthcare Facility Map</h3>
            <p className="text-[11px] text-slate-500">
              Coverage: {user?.location.city || 'New Delhi'} ({user?.location.pincode || '110001'})
            </p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-white p-0.5 rounded border border-slate-200">
            {(['all', 'hospital', 'ambulance', 'pharmacy'] as const).map(type => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-2 py-1 rounded font-medium capitalize transition cursor-pointer text-[11px] btn-press ${
                  activeFilter === type ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Radius selector */}
          <select
            value={selectedRadius}
            onChange={e => setSelectedRadius(parseInt(e.target.value, 10))}
            className="px-2 py-1 rounded border border-slate-200 bg-white text-[11px] font-medium text-slate-700"
          >
            <option value={2}>Within 2 km</option>
            <option value={5}>Within 5 km</option>
            <option value={10}>Within 10 km</option>
            <option value={25}>Within 25 km</option>
          </select>
        </div>
      </div>

      {/* Dynamic Interactive SVG Canvas Map */}
      <div className="relative w-full h-80 sm:h-96 bg-slate-900 overflow-hidden select-none">
        
        {/* Stylized Indian City Grid Background Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="city-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#city-grid)" />
          {/* Simulated arterial ring roads */}
          <circle cx="50%" cy="50%" r="90" fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="50%" cy="50%" r="160" fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="6 6" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#0369a1" strokeWidth="1.5" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#0369a1" strokeWidth="1.5" />
        </svg>

        {/* User Centered GPS Pulse Point */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-8 h-8 rounded-full bg-sky-400 opacity-60 animate-ping" />
            <span className="w-4 h-4 rounded-full bg-sky-500 border-2 border-white shadow-lg" />
          </div>
          <span className="mt-1 px-2 py-0.5 bg-slate-900/90 text-sky-300 font-bold text-[10px] rounded-md border border-sky-500/40 shadow-xs whitespace-nowrap">
            You ({user?.location.city || 'New Delhi'})
          </span>
        </div>

        {/* Live Moving Ambulance Pin */}
        {(activeFilter === 'all' || activeFilter === 'ambulance') && (
          <div
            style={{ top: `${ambulancePos.y}%`, left: `${ambulancePos.x}%` }}
            onClick={() => {
              const amb = facilities.find(f => f.type === 'Ambulance');
              if (amb) setSelectedPin(amb);
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 transition-all duration-1000 group"
          >
            <div className="p-1.5 rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/40 group-hover:scale-125 transition-transform animate-pulse">
              <Ambulance className="w-4 h-4" />
            </div>
            <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-900 text-white text-[10px] rounded-md shadow-md whitespace-nowrap">
              108 ALS Ambulance (ETA: 6 min)
            </span>
          </div>
        )}

        {/* Static Facility Markers */}
        {filteredPins.filter(p => p.type !== 'Ambulance').map(pin => (
          <button
            key={pin.id}
            style={{ top: `${pin.y}%`, left: `${pin.x}%` }}
            onClick={() => setSelectedPin(pin)}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group transition-transform hover:scale-125 focus:outline-hidden"
          >
            <div className={`p-1.5 rounded-full shadow-lg ${
              pin.type === 'Hospital' 
                ? 'bg-emerald-600 text-white' 
                : pin.type === 'BloodBank' 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-sky-600 text-white'
            }`}>
              {pin.type === 'Hospital' ? (
                <Activity className="w-3.5 h-3.5" />
              ) : (
                <MapPin className="w-3.5 h-3.5" />
              )}
            </div>

            <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 bg-slate-900 text-white text-[10px] font-semibold rounded-md whitespace-nowrap shadow-md pointer-events-none">
              {pin.name} ({pin.distanceKm} km)
            </span>
          </button>
        ))}

        {/* Radar scanning beam effect */}
        <div className="absolute top-1/2 left-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-400/20 pointer-events-none animate-pulse" />

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Hospital
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> 108 Ambulance
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-500" /> Jan Aushadhi
          </span>
        </div>
      </div>

      {/* Selected Facility Details Card */}
      {selectedPin && (
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fade-in">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">{selectedPin.name}</span>
              <span className="px-2 py-0.5 bg-sky-100 text-sky-800 font-bold text-[10px] rounded-md">
                {selectedPin.distanceKm} km away
              </span>
            </div>
            <p className="text-slate-500 mt-0.5">{selectedPin.address}</p>

            {selectedPin.bedsAvailable !== undefined && (
              <p className="mt-1 text-emerald-700 font-semibold">
                ✓ {selectedPin.bedsAvailable} General Beds · {selectedPin.icuAvailable} ICU Beds Available
              </p>
            )}

            {selectedPin.ambulanceEtaMins && (
              <p className="mt-1 text-rose-700 font-bold">
                🚨 Fastest Ambulance ETA to your GPS coordinates: {selectedPin.ambulanceEtaMins} minutes
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`tel:${selectedPin.emergencyPhone}`}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call ({selectedPin.emergencyPhone})</span>
            </a>

            <button
              onClick={() => showNotification(`Simulated GPS Turn-by-Turn navigation to ${selectedPin.name}. Estimated travel time: ${Math.round(selectedPin.distanceKm * 3.5)} mins.`)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-sky-400" />
              <span>Get Directions</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
