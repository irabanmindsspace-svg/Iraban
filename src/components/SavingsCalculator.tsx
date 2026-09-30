import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingDown, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  MapPin, 
  CheckCircle,
  FileSpreadsheet,
  Coins
} from 'lucide-react';

interface MedicineRow {
  id: string;
  name: string;
  genericName: string;
  brandPricePerStrip: number;
  janAushadhiPricePerStrip: number;
  monthlyStrips: number;
}

const COMMON_PRESETS: MedicineRow[] = [
  {
    id: 'm1',
    name: 'Glycomet 500 SR (Metformin)',
    genericName: 'Metformin Sustained Release 500mg',
    brandPricePerStrip: 48,
    janAushadhiPricePerStrip: 11,
    monthlyStrips: 2,
  },
  {
    id: 'm2',
    name: 'Telma 40 (Telmisartan)',
    genericName: 'Telmisartan Tablets IP 40mg',
    brandPricePerStrip: 112,
    janAushadhiPricePerStrip: 22,
    monthlyStrips: 2,
  },
  {
    id: 'm3',
    name: 'Atorva 10 (Atorvastatin)',
    genericName: 'Atorvastatin Calcium 10mg',
    brandPricePerStrip: 135,
    janAushadhiPricePerStrip: 25,
    monthlyStrips: 2,
  },
  {
    id: 'm4',
    name: 'Pan 40 (Pantoprazole)',
    genericName: 'Pantoprazole Gastro-Resistant 40mg',
    brandPricePerStrip: 145,
    janAushadhiPricePerStrip: 28,
    monthlyStrips: 2,
  },
  {
    id: 'm5',
    name: 'Shelcal 500 (Calcium + Vit D3)',
    genericName: 'Calcium Carbonate & Vitamin D3',
    brandPricePerStrip: 130,
    janAushadhiPricePerStrip: 32,
    monthlyStrips: 1,
  }
];

export const SavingsCalculator: React.FC = () => {
  const { setActiveTab, showNotification } = useApp();
  const [basket, setBasket] = useState<MedicineRow[]>(COMMON_PRESETS.slice(0, 3));

  const totalBrandMonthly = basket.reduce((acc, item) => acc + item.brandPricePerStrip * item.monthlyStrips, 0);
  const totalJanAushadhiMonthly = basket.reduce((acc, item) => acc + item.janAushadhiPricePerStrip * item.monthlyStrips, 0);
  const monthlySavings = totalBrandMonthly - totalJanAushadhiMonthly;
  const annualSavings = monthlySavings * 12;
  const savingsPercent = totalBrandMonthly > 0 ? Math.round((monthlySavings / totalBrandMonthly) * 100) : 0;

  const handleAddPreset = (med: MedicineRow) => {
    if (basket.some(b => b.id === med.id)) {
      showNotification(`${med.name} is already in your calculation basket.`);
      return;
    }
    setBasket(prev => [...prev, med]);
  };

  const handleRemove = (id: string) => {
    setBasket(prev => prev.filter(b => b.id !== id));
  };

  const handleUpdateStrips = (id: string, strips: number) => {
    setBasket(prev => prev.map(b => b.id === id ? { ...b, monthlyStrips: Math.max(1, strips) } : b));
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Generic Medicine Cost Calculator (PMBJP)
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
              Generic Equivalent Pricing
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare monthly and annual expenses between branded drugs and Jan Aushadhi generic formulations.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
          <TrendingDown className="w-3.5 h-3.5 text-emerald-700" />
          <span>Approx. {savingsPercent}% Price Reduction</span>
        </div>
      </div>

      {/* Summary KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-slate-50 rounded border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium block">Branded Monthly Cost</span>
          <span className="text-xl font-bold text-slate-400 line-through tabular-nums mt-0.5 block">
            ₹{totalBrandMonthly.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400">for {basket.length} selected medicines</span>
        </div>

        <div className="p-3 bg-sky-50 rounded border border-sky-200">
          <span className="text-[11px] text-sky-800 font-medium block">Jan Aushadhi Generic Cost</span>
          <span className="text-xl font-bold text-sky-950 tabular-nums mt-0.5 block">
            ₹{totalJanAushadhiMonthly.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-sky-700">Subsidized monthly price</span>
        </div>

        <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
          <span className="text-[11px] text-emerald-800 font-medium block">Annual Savings</span>
          <span className="text-xl font-bold text-emerald-800 tabular-nums mt-0.5 block">
            ₹{annualSavings.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-emerald-700 font-medium">
            ₹{monthlySavings.toLocaleString('en-IN')} saved per month
          </span>
        </div>
      </div>

      {/* Basket Table */}
      <div className="border border-slate-200 rounded overflow-hidden">
        <div className="bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-600 grid grid-cols-12 gap-2 border-b border-slate-200">
          <span className="col-span-5">Prescription Formulation</span>
          <span className="col-span-2 text-right">Brand MRP</span>
          <span className="col-span-2 text-right">Jan Aushadhi</span>
          <span className="col-span-2 text-center">Strips/Mo</span>
          <span className="col-span-1 text-center">Action</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {basket.map(item => (
            <div key={item.id} className="p-3 grid grid-cols-12 gap-2 items-center hover:bg-slate-50/50 transition">
              <div className="col-span-5">
                <span className="font-semibold text-slate-900 block">{item.name}</span>
                <span className="text-[11px] text-slate-500 block truncate">{item.genericName}</span>
              </div>

              <div className="col-span-2 text-right">
                <span className="text-slate-400 line-through font-mono">₹{item.brandPricePerStrip}</span>
              </div>

              <div className="col-span-2 text-right">
                <span className="font-bold text-emerald-700 font-mono">₹{item.janAushadhiPricePerStrip}</span>
              </div>

              <div className="col-span-2 flex justify-center">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={item.monthlyStrips}
                  onChange={e => handleUpdateStrips(item.id, parseInt(e.target.value, 10) || 1)}
                  className="w-12 px-1.5 py-1 rounded border border-slate-300 text-center font-semibold text-slate-900 bg-white"
                />
              </div>

              <div className="col-span-1 text-center">
                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                  title="Remove from list"
                  aria-label="Remove medicine"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Preset Pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
        <span className="text-slate-500 font-medium text-[11px]">Add standard chronic medicines:</span>
        {COMMON_PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => handleAddPreset(preset)}
            className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded text-slate-700 text-xs font-medium flex items-center gap-1 transition cursor-pointer btn-press"
          >
            <Plus className="w-3 h-3 text-sky-700" />
            <span>{preset.name.split('(')[0].trim()}</span>
          </button>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <span className="text-slate-500 text-[11px]">
          Jan Aushadhi pharmaceuticals comply with Indian Pharmacopoeia (IP) and WHO-GMP therapeutic standards.
        </span>

        <button
          onClick={() => setActiveTab('pharmacy')}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 text-xs btn-press"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Find Jan Aushadhi Stores</span>
        </button>
      </div>
    </div>
  );
};
