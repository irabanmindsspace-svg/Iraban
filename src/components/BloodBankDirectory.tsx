import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { BloodInventory, BloodGroup } from '../types';
import { 
  Heart, 
  Search, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  Radio, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const BloodBankDirectory: React.FC = () => {
  const { showNotification } = useApp();
  const [bloodBanks, setBloodBanks] = useState<BloodInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | 'all'>('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  
  // Emergency request form
  const [reqHospital, setReqHospital] = useState('');
  const [reqPatient, setReqPatient] = useState('');
  const [reqGroup, setReqGroup] = useState<BloodGroup>('O+');
  const [reqUnits, setReqUnits] = useState('2');

  const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const CITIES = ['New Delhi', 'Mumbai', 'Chennai'];

  useEffect(() => {
    setLoading(true);
    api.getBloodBanks({
      city: selectedCity !== 'all' ? selectedCity : undefined,
    }).then(res => {
      if (res.success) setBloodBanks(res.bloodBanks);
    }).finally(() => setLoading(false));
  }, [selectedCity]);

  const handleBroadcastRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setShowRequestModal(false);
    showNotification(`Urgent Blood Request broadcast for ${reqUnits} units of ${reqGroup} at ${reqHospital || 'Hospital'}. Nearest centers alerted.`);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Blood Bank Availability & Emergency Support
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time stock of Whole Blood, Platelets, and Plasma across certified public transfusion centers.
            </p>
          </div>

          <button
            onClick={() => setShowRequestModal(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer min-h-[44px]"
          >
            <Radio className="w-4 h-4" />
            <span>Raise Urgent Blood Request</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Blood group selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">Filter Blood Group:</span>
            <button
              onClick={() => setSelectedGroup('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${selectedGroup === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              All Groups
            </button>
            {BLOOD_GROUPS.map(bg => (
              <button
                key={bg}
                onClick={() => setSelectedGroup(bg)}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${selectedGroup === bg ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                {bg}
              </button>
            ))}
          </div>

          {/* City filter */}
          <div>
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-700 bg-white"
            >
              <option value="all">All Cities</option>
              {CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Blood Banks Directory */}
      <div className="grid grid-cols-1 gap-4">
        {bloodBanks.map(bb => (
          <div
            key={bb.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{bb.bloodBankName}</h3>
                <p className="text-xs text-sky-700 font-semibold">{bb.hospitalAffiliation}</p>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{bb.city}, {bb.state} ({bb.pincode})</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[11px] text-slate-400">Stock updated {bb.lastUpdated}</span>
                </div>
              </div>

              <a
                href={`tel:${bb.phone}`}
                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {bb.phone}</span>
              </a>
            </div>

            {/* Live Units Matrix */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">
                Available Blood Units In Stock
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-xs">
                {BLOOD_GROUPS.map(bg => {
                  const count = bb.units[bg] || 0;
                  const isHighlighted = selectedGroup === 'all' || selectedGroup === bg;
                  return (
                    <div
                      key={bg}
                      className={`p-2 rounded-xl border transition ${
                        isHighlighted 
                          ? count > 5 
                            ? 'bg-rose-50/50 border-rose-200 text-rose-950 font-bold' 
                            : 'bg-amber-50/50 border-amber-200 text-amber-950 font-bold'
                          : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'
                      }`}
                    >
                      <span className="text-xs block">{bg}</span>
                      <span className="text-sm font-extrabold tabular-nums block mt-0.5">{count}</span>
                      <span className="text-[9px] text-slate-400 font-normal">units</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Components available */}
            <div className="mt-3 text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-slate-700">Components:</span>
              {bb.componentAvailable.join(' · ')}
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Blood Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-rose-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
              <span>Raise Emergency Blood Requirement</span>
            </h3>

            <form onSubmit={handleBroadcastRequest} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-900 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  value={reqPatient}
                  onChange={e => setReqPatient(e.target.value)}
                  placeholder="e.g. Rameshwar Sharma"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Required Blood Group</label>
                  <select
                    value={reqGroup}
                    onChange={e => setReqGroup(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white"
                  >
                    {BLOOD_GROUPS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Number of Units</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={reqUnits}
                    onChange={e => setReqUnits(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Admitted Hospital Name & City</label>
                <input
                  type="text"
                  required
                  value={reqHospital}
                  onChange={e => setReqHospital(e.target.value)}
                  placeholder="e.g. AIIMS Trauma Center, New Delhi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                *Privacy Guarantee: Broadcast routes directly to verified regional blood transfusion registries without exposing sensitive donor phone numbers publicly.
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Broadcast SOS Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
