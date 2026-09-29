import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Pharmacy, MedicineItem } from '../types';
import { 
  Pill, 
  Search, 
  MapPin, 
  Phone, 
  CheckCircle, 
  ShieldCheck, 
  Clock, 
  Truck, 
  TrendingDown, 
  ShoppingBag,
  FileCheck,
  Building
} from 'lucide-react';

export const PharmacyDirectory: React.FC = () => {
  const { user, showNotification } = useApp();
  const [activeTab, setActiveTab] = useState<'medicines' | 'stores'>('medicines');
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getMedicines({ search: searchQuery || undefined }),
      api.getPharmacies()
    ]).then(([medRes, pharmRes]) => {
      if (medRes.success) setMedicines(medRes.medicines);
      if (pharmRes.success) setPharmacies(pharmRes.pharmacies);
    }).finally(() => setLoading(false));
  }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Pharmacies & Generic Medicines Cost-Saver
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Compare commercial brand medicines with Jan Aushadhi (PMBJP) generic equivalents and locate verified chemists.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            <span>50% to 90% Savings on Generic Equivalents</span>
          </div>
        </div>

        {/* Tab switchers & search */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('medicines')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${activeTab === 'medicines' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Essential Generic Medicines ({medicines.length})
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${activeTab === 'stores' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Jan Aushadhi & 24x7 Pharmacies ({pharmacies.length})
            </button>
          </div>

          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search medicine (e.g. Paracetamol, Metformin)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Content depending on active tab */}
      {activeTab === 'medicines' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medicines.map(med => (
            <div
              key={med.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wide">
                      {med.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{med.brandName}</h3>
                    <p className="text-xs text-slate-600 font-medium">{med.genericName}</p>
                    <p className="text-[11px] text-slate-400">{med.dosageForm} · {med.strength}</p>
                  </div>

                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200 tabular-nums">
                    Save {med.savingsPercentage}%
                  </span>
                </div>

                {/* Price Comparison Matrix */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Commercial Brand MRP</span>
                    <span className="text-sm font-bold text-slate-400 line-through tabular-nums">
                      ₹{med.brandPrice}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-800 font-bold block">Jan Aushadhi Subsidized</span>
                    <span className="text-base font-extrabold text-emerald-700 tabular-nums">
                      ₹{med.janAushadhiPrice}
                    </span>
                  </div>
                </div>

                {med.prescriptionRequired && (
                  <p className="mt-2 text-[10px] text-amber-700 flex items-center gap-1 font-medium">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Requires valid doctor prescription (Schedule H drug)</span>
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> In Stock across Jan Aushadhi Kendras
                </span>

                <button
                  onClick={() => showNotification(`Added ${med.genericName} to medicine order inquiry.`)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Locate Store
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Pharmacy Outlets List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pharmacies.map(pharm => (
            <div
              key={pharm.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-slate-900">{pharm.name}</h3>
                      {pharm.isVerified && (
                        <CheckCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                      )}
                    </div>
                    {pharm.isJanAushadhiKendra && (
                      <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 mt-1 inline-block">
                        PMBJP Government Outlet
                      </span>
                    )}
                  </div>

                  <span className="text-slate-400 font-mono text-[10px]">
                    Lic: {pharm.licenseNumber}
                  </span>
                </div>

                <div className="mt-3 flex items-start gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{pharm.address}, {pharm.city} - {pharm.pincode}</span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  {pharm.open24Hours ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> 24x7 Open
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> 09:00 AM - 09:00 PM
                    </span>
                  )}

                  {pharm.homeDelivery && (
                    <span className="text-sky-700 font-semibold flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> Home Delivery Available
                    </span>
                  )}

                  <span className="text-slate-400">
                    {pharm.catalogsCount}+ Medicines Available
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`tel:${pharm.phone}`}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{pharm.phone}</span>
                </a>

                <button
                  onClick={() => showNotification(`Contacting ${pharm.name} for prescription fulfillment.`)}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Send Prescription
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
