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
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-5">
      
      {/* Header Info */}
      <div className="bg-white rounded-lg p-5 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Pharmacies & Generic Medicines (PMBJP)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare commercial brands with Jan Aushadhi generic equivalents and locate verified local chemists.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-700" />
            <span>50% to 85% Savings on Generics</span>
          </div>
        </div>

        {/* Tab switchers & search */}
        <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded text-xs">
            <button
              onClick={() => setActiveTab('medicines')}
              className={`px-3 py-1.5 rounded font-medium transition cursor-pointer btn-press ${activeTab === 'medicines' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Generic Medicines Catalog ({medicines.length})
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`px-3 py-1.5 rounded font-medium transition cursor-pointer btn-press ${activeTab === 'stores' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Jan Aushadhi & Local Chemists ({pharmacies.length})
            </button>
          </div>

          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by salt or brand (e.g. Paracetamol, Metformin)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded border border-slate-300 focus:border-sky-600 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Content depending on active tab */}
      {activeTab === 'medicines' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {medicines.map(med => (
            <div
              key={med.id}
              className="bg-white rounded-lg p-4 border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-semibold text-sky-800 uppercase tracking-wide">
                      {med.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{med.brandName}</h3>
                    <p className="text-xs text-slate-600 font-medium">{med.genericName}</p>
                    <p className="text-[11px] text-slate-400">{med.dosageForm} · {med.strength}</p>
                  </div>

                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-semibold text-xs rounded border border-emerald-200 tabular-nums">
                    Save {med.savingsPercentage}%
                  </span>
                </div>

                {/* Price Comparison Matrix */}
                <div className="mt-3 p-2.5 rounded bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Commercial Brand MRP</span>
                    <span className="text-xs font-semibold text-slate-400 line-through tabular-nums">
                      ₹{med.brandPrice}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-800 font-semibold block">Jan Aushadhi Price</span>
                    <span className="text-sm font-bold text-emerald-700 tabular-nums">
                      ₹{med.janAushadhiPrice}
                    </span>
                  </div>
                </div>

                {med.prescriptionRequired && (
                  <p className="mt-2 text-[10px] text-amber-700 flex items-center gap-1 font-medium">
                    <FileCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Requires valid doctor prescription (Schedule H)</span>
                  </p>
                )}
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
                  <CheckCircle className="w-3 h-3 text-emerald-600" /> In Stock at PMBJP Kendras
                </span>

                <button
                  onClick={() => showNotification(`Added ${med.genericName} to medicine order inquiry.`)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded transition cursor-pointer btn-press"
                >
                  Locate Store
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Pharmacy Outlets List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pharmacies.map(pharm => (
            <div
              key={pharm.id}
              className="bg-white rounded-lg p-4 border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900">{pharm.name}</h3>
                      {pharm.isVerified && (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                      )}
                    </div>
                    {pharm.isJanAushadhiKendra && (
                      <span className="text-[10px] font-semibold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 mt-1 inline-block">
                        PMBJP Jan Aushadhi Outlet
                      </span>
                    )}
                  </div>

                  <span className="text-slate-400 font-mono text-[10px]">
                    Lic: {pharm.licenseNumber}
                  </span>
                </div>

                <div className="mt-2.5 flex items-start gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{pharm.address}, {pharm.city} - {pharm.pincode}</span>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-600">
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
                    <span className="text-sky-800 font-medium flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> Home Delivery
                    </span>
                  )}

                  <span className="text-slate-400">
                    {pharm.catalogsCount}+ Medicines
                  </span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <a
                  href={`tel:${pharm.phone}`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-medium transition flex items-center gap-1.5 btn-press"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{pharm.phone}</span>
                </a>

                <button
                  onClick={() => showNotification(`Contacting ${pharm.name} for prescription fulfillment.`)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition cursor-pointer btn-press"
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
