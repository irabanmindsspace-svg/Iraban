import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { MedicineItem } from '../types';
import { useMedicineBasket, BasketItem } from '../utils/medicineBasket';
import { 
  TrendingDown, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  MapPin, 
  CheckCircle,
  FileSpreadsheet,
  Coins,
  Search,
  Printer,
  Sparkles,
  Minus,
  AlertCircle,
  X,
  RefreshCw,
  FileCheck,
  Check
} from 'lucide-react';

const CHRONIC_PACKS: { name: string; tag: string; description: string; items: BasketItem[] }[] = [
  {
    name: 'Diabetes Care Pack',
    tag: 'Diabetes',
    description: 'Metformin SR 500mg, Glimepiride 1mg, & Sitagliptin 50mg',
    items: [
      { id: 'pack_dia_1', name: 'Glycomet 500 SR', genericName: 'Metformin SR 500mg', brandPricePerStrip: 48, janAushadhiPricePerStrip: 11, monthlyStrips: 2, category: 'Diabetes' },
      { id: 'pack_dia_2', name: 'Amaryl 1mg', genericName: 'Glimepiride 1mg', brandPricePerStrip: 85, janAushadhiPricePerStrip: 14, monthlyStrips: 2, category: 'Diabetes' },
      { id: 'pack_dia_3', name: 'Januvia 50mg', genericName: 'Sitagliptin 50mg', brandPricePerStrip: 260, janAushadhiPricePerStrip: 48, monthlyStrips: 1, category: 'Diabetes' }
    ]
  },
  {
    name: 'Hypertension & Heart Pack',
    tag: 'Cardiac',
    description: 'Telmisartan 40mg, Amlodipine 5mg, & Atorvastatin 10mg',
    items: [
      { id: 'pack_card_1', name: 'Telma 40', genericName: 'Telmisartan 40mg', brandPricePerStrip: 112, janAushadhiPricePerStrip: 22, monthlyStrips: 2, category: 'Hypertension' },
      { id: 'pack_card_2', name: 'Amlong 5mg', genericName: 'Amlodipine 5mg', brandPricePerStrip: 52, janAushadhiPricePerStrip: 9, monthlyStrips: 2, category: 'Hypertension' },
      { id: 'pack_card_3', name: 'Atorva 10', genericName: 'Atorvastatin 10mg', brandPricePerStrip: 135, janAushadhiPricePerStrip: 25, monthlyStrips: 2, category: 'Cholesterol' }
    ]
  },
  {
    name: 'Asthma & Respiratory Pack',
    tag: 'Respiratory',
    description: 'Salbutamol Inhaler & Montelukast 10mg',
    items: [
      { id: 'pack_resp_1', name: 'Asthalin Inhaler', genericName: 'Salbutamol Inhaler 100mcg', brandPricePerStrip: 175, janAushadhiPricePerStrip: 60, monthlyStrips: 1, category: 'Asthma' },
      { id: 'pack_resp_2', name: 'Montair 10mg', genericName: 'Montelukast 10mg', brandPricePerStrip: 148, janAushadhiPricePerStrip: 32, monthlyStrips: 2, category: 'Allergy' }
    ]
  },
  {
    name: 'Senior Bone & Digestion Pack',
    tag: 'Senior Health',
    description: 'Calcium + Vit D3 & Pantoprazole 40mg',
    items: [
      { id: 'pack_snr_1', name: 'Shelcal 500', genericName: 'Calcium Carbonate & Vit D3', brandPricePerStrip: 130, janAushadhiPricePerStrip: 32, monthlyStrips: 2, category: 'Bone Health' },
      { id: 'pack_snr_2', name: 'Pan 40', genericName: 'Pantoprazole 40mg', brandPricePerStrip: 145, janAushadhiPricePerStrip: 28, monthlyStrips: 2, category: 'Gastric' }
    ]
  }
];

export const SavingsCalculator: React.FC = () => {
  const { setActiveTab, showNotification } = useApp();
  const {
    basket,
    updateStrips,
    removeItem,
    addItem,
    clearBasket,
    resetToDefaults,
    totalBrandMonthly,
    totalJanAushadhiMonthly,
    monthlySavings,
    annualSavings,
    savingsPercent,
    itemCount
  } = useMedicineBasket();

  // Search and Catalog Integration
  const [catalogMedicines, setCatalogMedicines] = useState<MedicineItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MedicineItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Custom Medicine Form Modal
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customBrandName, setCustomBrandName] = useState('');
  const [customGenericName, setCustomGenericName] = useState('');
  const [customBrandPrice, setCustomBrandPrice] = useState<string>('120');
  const [customJanPrice, setCustomJanPrice] = useState<string>('25');
  const [customStrips, setCustomStrips] = useState<number>(2);

  // Fetch full medicine catalog for live search
  useEffect(() => {
    api.getMedicines().then(res => {
      if (res.success && res.medicines) {
        setCatalogMedicines(res.medicines);
      }
    }).catch(err => console.error('Error loading medicine catalog:', err));
  }, []);

  // Filter medicines when user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const q = searchQuery.toLowerCase().trim();
    const matches = catalogMedicines.filter(
      med => med.brandName.toLowerCase().includes(q) || 
             med.genericName.toLowerCase().includes(q) ||
             med.category.toLowerCase().includes(q)
    );
    setSearchResults(matches.slice(0, 6));
  }, [searchQuery, catalogMedicines]);

  // Handle adding from catalog search
  const handleAddFromCatalog = (med: MedicineItem) => {
    const res = addItem(med, 1);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    if (res.isNew) {
      showNotification(`Added ${med.brandName} (${med.genericName}) to your medicine bill.`);
    } else {
      showNotification(`Increased quantity for ${med.brandName} in your bill.`);
    }
  };

  // Auto calculate estimated Jan Aushadhi generic price (approx 75% cheaper)
  const handleAutoCalcJanPrice = () => {
    const bp = parseFloat(customBrandPrice);
    if (!isNaN(bp) && bp > 0) {
      const estimated = Math.max(5, Math.round(bp * 0.25));
      setCustomJanPrice(estimated.toString());
      showNotification(`Set estimated Jan Aushadhi price to ₹${estimated} (75% discount).`);
    }
  };

  // Add custom medicine from user prescription
  const handleAddCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBrandName.trim()) {
      showNotification('Please enter a medicine name from your prescription.');
      return;
    }
    const bp = parseFloat(customBrandPrice) || 100;
    const jp = parseFloat(customJanPrice) || Math.round(bp * 0.25);

    const customItem: BasketItem = {
      id: `custom_${Date.now()}`,
      name: customBrandName.trim(),
      genericName: customGenericName.trim() || `${customBrandName.trim()} (Generic Equivalent)`,
      brandPricePerStrip: bp,
      janAushadhiPricePerStrip: jp,
      monthlyStrips: Math.max(1, customStrips),
      category: 'Prescription Medicine'
    };

    addItem(customItem, customStrips);
    showNotification(`Added custom medicine ${customItem.name} to bill calculation.`);
    setShowCustomModal(false);
    setCustomBrandName('');
    setCustomGenericName('');
    setCustomBrandPrice('120');
    setCustomJanPrice('25');
    setCustomStrips(2);
  };

  // Load Chronic Disease Pack
  const handleLoadPack = (pack: typeof CHRONIC_PACKS[0]) => {
    pack.items.forEach(item => {
      addItem(item, item.monthlyStrips);
    });
    showNotification(`Loaded ${pack.name} with ${pack.items.length} essential generic medicines.`);
  };

  // Trigger Print / Export
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-5" id="savings-calculator-section">
      
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
              Generic Medicine Bill & Prescription Savings Calculator
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
              PMBJP Certified Rates
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Calculate your exact monthly and annual prescription cost reduction by replacing commercial brands with PMBJP Jan Aushadhi generic salts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1.5 btn-press"
            title="Print Prescription Bill Comparison"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Bill</span>
          </button>
          
          <button
            onClick={() => setShowCustomModal(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition cursor-pointer flex items-center gap-1.5 btn-press shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Add Prescription Medicine</span>
          </button>
        </div>
      </div>

      {/* 2. Summary KPI Cards with Big Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium block">Commercial Brand Bill</span>
          <span className="text-xl font-bold text-slate-400 line-through tabular-nums mt-0.5 block">
            ₹{totalBrandMonthly.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500">for {itemCount} prescribed medicines/mo</span>
        </div>

        <div className="p-3.5 bg-sky-50 rounded border border-sky-200">
          <span className="text-[11px] text-sky-800 font-medium block">Jan Aushadhi Generic Bill</span>
          <span className="text-xl font-bold text-sky-950 tabular-nums mt-0.5 block">
            ₹{totalJanAushadhiMonthly.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-sky-700">Subsidized monthly price</span>
        </div>

        <div className="p-3.5 bg-emerald-50 rounded border border-emerald-200">
          <span className="text-[11px] text-emerald-800 font-bold block flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-emerald-600" />
            Monthly Cash Saved
          </span>
          <span className="text-2xl font-black text-emerald-800 tabular-nums mt-0.5 block">
            ₹{monthlySavings.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold">
            {savingsPercent}% In-Hand Discount
          </span>
        </div>

        <div className="p-3.5 bg-emerald-900 text-white rounded border border-emerald-800">
          <span className="text-[11px] text-emerald-200 font-medium block">Annual Cumulative Savings</span>
          <span className="text-2xl font-black text-emerald-100 tabular-nums mt-0.5 block">
            ₹{annualSavings.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-emerald-300">Saved per year across family</span>
        </div>
      </div>

      {/* 3. Search & Add Any Medicine from Catalog */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Type to search and add any medicine from 1,900+ Jan Aushadhi catalog (e.g. Paracetamol, Dolo, Pantocid, Amlodipine)..."
            className="w-full pl-9 pr-10 py-2 text-xs rounded border border-slate-300 focus:border-emerald-600 focus:outline-hidden text-slate-900 bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchResults([]); }}
              className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {isSearching && searchResults.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-xl overflow-hidden divide-y divide-slate-100">
            <div className="p-2 bg-slate-50 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
              <span>Matching Generic Medicines in Catalog:</span>
              <span>Click any to add to bill</span>
            </div>
            {searchResults.map(med => (
              <div
                key={med.id}
                onClick={() => handleAddFromCatalog(med)}
                className="p-3 hover:bg-emerald-50/70 transition cursor-pointer flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900">{med.brandName}</strong>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {med.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{med.genericName} · {med.strength}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 line-through mr-1.5">₹{med.brandPrice}</span>
                    <strong className="text-sm font-bold text-emerald-700">₹{med.janAushadhiPrice}</strong>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded ml-1.5">
                      Save {med.savingsPercentage}%
                    </span>
                  </div>
                  <button className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-medium transition cursor-pointer">
                    + Add to Bill
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Medicine Basket Table */}
      <div className="border border-slate-200 rounded overflow-hidden">
        <div className="bg-slate-50 px-3.5 py-2.5 text-[11px] font-bold text-slate-700 grid grid-cols-12 gap-2 border-b border-slate-200 uppercase tracking-wider">
          <span className="col-span-5">Prescription Formulation</span>
          <span className="col-span-2 text-right">Brand MRP</span>
          <span className="col-span-2 text-right">Jan Aushadhi</span>
          <span className="col-span-2 text-center">Strips / Month</span>
          <span className="col-span-1 text-center">Action</span>
        </div>

        {basket.length === 0 ? (
          <div className="p-8 text-center bg-slate-50/50 space-y-2">
            <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-600 font-medium">Your medicine bill calculator is currently empty.</p>
            <p className="text-[11px] text-slate-400">Search above, pick a chronic illness pack below, or add custom medicines from your prescription slip.</p>
            <button
              onClick={resetToDefaults}
              className="mt-2 px-3 py-1.5 bg-slate-900 text-white text-xs rounded font-medium hover:bg-slate-800 transition cursor-pointer"
            >
              Load Standard Prescriptions
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {basket.map(item => (
              <div key={item.id} className="p-3 grid grid-cols-12 gap-2 items-center hover:bg-slate-50/60 transition">
                <div className="col-span-5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{item.name}</span>
                    {item.category && (
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1 py-0.2 rounded hidden sm:inline">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 block truncate mt-0.5">{item.genericName}</span>
                </div>

                <div className="col-span-2 text-right">
                  <span className="text-slate-400 line-through font-mono">₹{item.brandPricePerStrip}</span>
                  <span className="text-[10px] text-slate-400 block">/ strip</span>
                </div>

                <div className="col-span-2 text-right">
                  <span className="font-bold text-emerald-700 font-mono text-sm">₹{item.janAushadhiPricePerStrip}</span>
                  <span className="text-[10px] text-emerald-800 block font-medium">
                    Save {Math.round(((item.brandPricePerStrip - item.janAushadhiPricePerStrip) / item.brandPricePerStrip) * 100)}%
                  </span>
                </div>

                {/* Tactile Quantity Steppers (solves backspacing & editing bugs!) */}
                <div className="col-span-2 flex items-center justify-center gap-1">
                  <button
                    onClick={() => updateStrips(item.id, item.monthlyStrips - 1)}
                    className="w-6 h-6 rounded border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition cursor-pointer"
                    title="Decrease strips"
                    aria-label="Decrease strips"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={item.monthlyStrips}
                    onChange={e => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 1) {
                        updateStrips(item.id, val);
                      }
                    }}
                    className="w-10 px-1 py-1 rounded border border-slate-300 text-center font-bold text-slate-900 bg-white text-xs"
                  />

                  <button
                    onClick={() => updateStrips(item.id, item.monthlyStrips + 1)}
                    className="w-6 h-6 rounded border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition cursor-pointer"
                    title="Increase strips"
                    aria-label="Increase strips"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="col-span-1 text-center">
                  <button
                    onClick={() => {
                      removeItem(item.id);
                      showNotification(`Removed ${item.name} from bill calculator.`);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                    title="Remove from bill"
                    aria-label="Remove medicine"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bill Total Row */}
        {basket.length > 0 && (
          <div className="bg-slate-100 px-3.5 py-3 border-t border-slate-200 grid grid-cols-12 gap-2 items-center text-xs font-bold text-slate-900">
            <span className="col-span-5 text-slate-700 uppercase tracking-wider text-[11px]">
              Total Monthly Prescription Cost ({itemCount} medicines):
            </span>
            <span className="col-span-2 text-right font-mono text-slate-500 line-through text-xs">
              ₹{totalBrandMonthly.toLocaleString('en-IN')}
            </span>
            <span className="col-span-2 text-right font-mono text-emerald-800 text-sm">
              ₹{totalJanAushadhiMonthly.toLocaleString('en-IN')}
            </span>
            <div className="col-span-3 text-right">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded border border-emerald-300">
                You Save: ₹{monthlySavings.toLocaleString('en-IN')} / month
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Quick Chronic Disease Packs (One-Click Bill Setup) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 font-bold text-xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Quick Pre-loaded Chronic Disease Packs:
          </span>
          {basket.length > 0 && (
            <button
              onClick={() => {
                clearBasket();
                showNotification('Cleared all medicines from calculator.');
              }}
              className="text-[11px] text-slate-400 hover:text-red-600 cursor-pointer"
            >
              Clear Bill
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {CHRONIC_PACKS.map(pack => (
            <button
              key={pack.name}
              onClick={() => handleLoadPack(pack)}
              className="p-3 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded text-left transition cursor-pointer btn-press flex flex-col justify-between space-y-1.5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{pack.name}</span>
                  <span className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    {pack.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
                  {pack.description}
                </p>
              </div>

              <div className="pt-1 flex items-center justify-between text-[10px] text-emerald-800 font-bold">
                <span>+ Load Pack ({pack.items.length} meds)</span>
                <span>Save ~78%</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 6. Footer Actions & Store Locator */}
      <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <p className="text-slate-500 text-[11px] max-w-xl">
          All Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) products are lab-tested under WHO-GMP norms and legally equivalent to branded formulations under Drug & Cosmetics Rules.
        </p>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('pharmacy')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded flex items-center justify-center gap-1.5 transition cursor-pointer text-xs btn-press shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Locate Nearest Jan Aushadhi Stores</span>
          </button>
        </div>
      </div>

      {/* 7. Modal: Add Custom Prescription Medicine */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl border border-slate-300 overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-xs">Add Medicine from Your Prescription Slip</h4>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Brand Name (written on doctor&apos;s prescription) *
                </label>
                <input
                  type="text"
                  required
                  value={customBrandName}
                  onChange={e => setCustomBrandName(e.target.value)}
                  placeholder="e.g., Dolo 650, Ecosprin 75, Lipaglyn, Thyronorm..."
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Generic Salt Formulation (Optional)
                </label>
                <input
                  type="text"
                  value={customGenericName}
                  onChange={e => setCustomGenericName(e.target.value)}
                  placeholder="e.g., Paracetamol IP 650mg, Aspirin 75mg..."
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Branded MRP / Strip (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={customBrandPrice}
                    onChange={e => setCustomBrandPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800">
                      Jan Aushadhi Subsidized Price (₹)
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoCalcJanPrice}
                      className="text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      Auto 75%
                    </button>
                  </div>
                  <input
                    type="number"
                    min="1"
                    required
                    value={customJanPrice}
                    onChange={e => setCustomJanPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden font-mono text-emerald-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Monthly Consumption (Strips per month)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={customStrips}
                    onChange={e => setCustomStrips(parseInt(e.target.value, 10) || 1)}
                    className="w-20 px-3 py-2 border border-slate-300 rounded text-center font-bold"
                  />
                  <span className="text-slate-500">strips / boxes every 30 days</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  Estimated monthly savings for this medicine: ₹{((parseFloat(customBrandPrice) || 0) - (parseFloat(customJanPrice) || 0)) * customStrips} ({Math.round((((parseFloat(customBrandPrice) || 0) - (parseFloat(customJanPrice) || 0)) / (parseFloat(customBrandPrice) || 1)) * 100)}% cheaper).
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded transition cursor-pointer btn-press"
                >
                  Add to Medicine Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
