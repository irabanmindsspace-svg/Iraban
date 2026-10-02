import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Pharmacy, MedicineItem } from '../types';
import { useMedicineBasket } from '../utils/medicineBasket';
import { SavingsCalculator } from './SavingsCalculator';
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
  Building,
  FileSpreadsheet,
  Plus,
  ArrowRight,
  Sparkles,
  QrCode
} from 'lucide-react';

export const PharmacyDirectory: React.FC = () => {
  const { user, showNotification, openQrScanner } = useApp();
  const [activeTab, setActiveTab] = useState<'medicines' | 'stores' | 'calculator'>('medicines');
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const {
    basket,
    addItem,
    itemCount,
    monthlySavings,
    totalJanAushadhiMonthly,
    savingsPercent
  } = useMedicineBasket();

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

  const handleAddMedicineToBill = (med: MedicineItem) => {
    const res = addItem(med, 1);
    if (res.isNew) {
      showNotification(`Added ${med.brandName} to your Medicine Bill Calculator! Save ₹${med.brandPrice - med.janAushadhiPrice} per strip.`);
    } else {
      showNotification(`Added another strip of ${med.brandName} to your Bill Calculator.`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-5">
      
      {/* Header Info */}
      <div className="bg-white rounded-lg p-5 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-700" />
              Pharmacies, Generic Medicines & Bill Calculator (PMBJP)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare commercial brands with Jan Aushadhi generic equivalents, calculate monthly prescription bills, and locate certified chemists.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => openQrScanner('prescription')}
              className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded transition cursor-pointer shadow-xs btn-press"
              title="Scan digital prescription QR code with camera"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Verify Prescription QR</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-700" />
              <span>50% to 85% Savings on Generics</span>
            </div>

            {itemCount > 0 && (
              <button
                onClick={() => setActiveTab('calculator')}
                className="flex items-center gap-1 text-xs bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 rounded transition cursor-pointer btn-press"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>View Bill ({itemCount} meds · Save ₹{monthlySavings})</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab switchers & search */}
        <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-0.5 rounded text-xs">
            <button
              onClick={() => setActiveTab('medicines')}
              className={`px-3 py-1.5 rounded font-medium transition cursor-pointer btn-press ${activeTab === 'medicines' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Generic Medicines Catalog ({medicines.length})
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`px-3 py-1.5 rounded font-medium transition cursor-pointer btn-press ${activeTab === 'stores' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Jan Aushadhi & Local Chemists ({pharmacies.length})
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3 py-1.5 rounded font-medium transition cursor-pointer btn-press flex items-center gap-1.5 ${activeTab === 'calculator' ? 'bg-emerald-700 text-white shadow-xs font-bold' : 'text-emerald-800 hover:bg-emerald-50'}`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Medicine Bill Calculator</span>
              {itemCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'calculator' ? 'bg-emerald-900 text-emerald-100' : 'bg-emerald-200 text-emerald-900'}`}>
                  {itemCount}
                </span>
              )}
            </button>
          </div>

          {activeTab !== 'calculator' && (
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by salt or brand (e.g. Paracetamol, Metformin)..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded border border-slate-300 focus:border-sky-600 focus:outline-hidden bg-white text-slate-900"
              />
            </div>
          )}
        </div>
      </div>

      {/* Floating/Banner alert if medicines are added to Bill */}
      {itemCount > 0 && activeTab !== 'calculator' && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>
              <strong>{itemCount} medicines</strong> currently in your Prescription Bill Calculator.
              Monthly generic cost: <strong>₹{totalJanAushadhiMonthly}</strong> (You save <strong>₹{monthlySavings}/month · {savingsPercent}% off</strong>).
            </span>
          </div>

          <button
            onClick={() => setActiveTab('calculator')}
            className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded transition cursor-pointer text-xs btn-press flex items-center justify-center gap-1 shrink-0"
          >
            <span>Open Bill Calculator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Content depending on active tab */}
      {activeTab === 'calculator' ? (
        <SavingsCalculator />
      ) : activeTab === 'medicines' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {medicines.map(med => {
            const inBill = basket.some(b => b.id === med.id || b.name.toLowerCase() === med.brandName.toLowerCase());
            return (
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

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                  <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px] truncate">
                    <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" /> In Stock at PMBJP Kendras
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleAddMedicineToBill(med)}
                      className={`px-3 py-1.5 rounded font-medium text-xs transition cursor-pointer btn-press flex items-center gap-1 ${
                        inBill 
                          ? 'bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold hover:bg-emerald-100' 
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      }`}
                      title="Add to Medicine Bill & Savings Calculator"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{inBill ? 'Add Another Strip' : '+ Add to Bill'}</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('stores')}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs rounded transition cursor-pointer"
                    >
                      Locate
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
