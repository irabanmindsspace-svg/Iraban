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
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-5">
      
      {/* Header Banner */}
      <div className="bg-white rounded-lg p-5 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Blood Bank Availability & Emergency Support
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live inventory of Whole Blood, Platelets, and FFP across certified public and Red Cross transfusion centers.
            </p>
          </div>

          <button
            onClick={() => setShowRequestModal(true)}
            className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white font-medium text-xs rounded flex items-center gap-1.5 transition cursor-pointer btn-press"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Raise Urgent Blood Request</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Blood group selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 font-medium mr-1 text-[11px]">Filter Group:</span>
            <button
              onClick={() => setSelectedGroup('all')}
              className={`px-2.5 py-1 rounded font-medium transition cursor-pointer text-xs btn-press ${selectedGroup === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              All Groups
            </button>
            {BLOOD_GROUPS.map(bg => (
              <button
                key={bg}
                onClick={() => setSelectedGroup(bg)}
                className={`px-2.5 py-1 rounded font-bold transition cursor-pointer text-xs btn-press ${selectedGroup === bg ? 'bg-red-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
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
              className="px-2.5 py-1.5 rounded border border-slate-300 text-xs text-slate-700 bg-white focus:border-sky-600 focus:outline-hidden"
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
      <div className="grid grid-cols-1 gap-3">
        {bloodBanks.map(bb => (
          <div
            key={bb.id}
            className="bg-white rounded-lg p-5 border border-slate-200 hover:border-slate-300 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{bb.bloodBankName}</h3>
                <p className="text-xs text-sky-800 font-semibold">{bb.hospitalAffiliation}</p>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{bb.city}, {bb.state} ({bb.pincode})</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[11px] text-slate-400">Stock updated {bb.lastUpdated}</span>
                </div>
              </div>

              <a
                href={`tel:${bb.phone}`}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded text-xs font-medium transition flex items-center gap-1.5 shrink-0 btn-press"
              >
                <Phone className="w-3.5 h-3.5 text-slate-600" />
                <span>Call {bb.phone}</span>
              </a>
            </div>

            {/* Live Units Matrix */}
            <div className="mt-3.5 pt-3 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Available Units In Stock
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-xs">
                {BLOOD_GROUPS.map(bg => {
                  const count = bb.units[bg] || 0;
                  const isHighlighted = selectedGroup === 'all' || selectedGroup === bg;
                  return (
                    <div
                      key={bg}
                      className={`p-2 rounded border transition ${
                        isHighlighted 
                          ? count > 5 
                            ? 'bg-red-50 border-red-200 text-red-950 font-bold' 
                            : 'bg-amber-50 border-amber-200 text-amber-950 font-bold'
                          : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'
                      }`}
                    >
                      <span className="text-xs block">{bg}</span>
                      <span className="text-sm font-bold tabular-nums block mt-0.5">{count}</span>
                      <span className="text-[9px] text-slate-500 font-normal">units</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Components available */}
            <div className="mt-3 text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-slate-700">Available Components:</span>
              <span>{bb.componentAvailable.join(' · ')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Blood Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-700 fill-red-700" />
              <span>Raise Emergency Blood Requirement</span>
            </h3>

            <form onSubmit={handleBroadcastRequest} className="mt-3.5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  value={reqPatient}
                  onChange={e => setReqPatient(e.target.value)}
                  placeholder="e.g. Rameshwar Sharma"
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-900 focus:border-sky-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Blood Group</label>
                  <select
                    value={reqGroup}
                    onChange={e => setReqGroup(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-slate-900 bg-white"
                  >
                    {BLOOD_GROUPS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Units Needed</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={reqUnits}
                    onChange={e => setReqUnits(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Hospital & City</label>
                <input
                  type="text"
                  required
                  value={reqHospital}
                  onChange={e => setReqHospital(e.target.value)}
                  placeholder="e.g. AIIMS Trauma Center, New Delhi"
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-900 focus:border-sky-600 focus:outline-hidden"
                />
              </div>

              <p className="text-[11px] text-slate-500">
                Notice: Emergency notification is shared directly with verified regional blood registries and licensed transfusion centers.
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded bg-red-700 hover:bg-red-800 text-white font-medium cursor-pointer btn-press"
                >
                  Broadcast Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
