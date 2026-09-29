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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Pradhan Mantri Jan Aushadhi (PMBJP) Medicine Cost Calculator
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
              Live Price Comparison
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculate your family&apos;s monthly & annual prescription drug savings with WHO-GMP compliant generic medicines.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl">
          <TrendingDown className="w-4 h-4" />
          <span>Average {savingsPercent}% Cost Reduction</span>
        </div>
      </div>

      {/* Dynamic Big Numbers Display */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium block">Commercial Brand Monthly Cost</span>
          <span className="text-2xl font-extrabold text-slate-400 line-through tabular-nums block mt-1">
            ₹{totalBrandMonthly.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-400">for {basket.length} chronic medicines</span>
        </div>

        <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200">
          <span className="text-xs text-sky-800 font-bold block">Jan Aushadhi Subsidized Cost</span>
          <span className="text-2xl font-extrabold text-sky-900 tabular-nums block mt-1">
            ₹{totalJanAushadhiMonthly.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-sky-700">Subsidized generic price</span>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300">
          <span className="text-xs text-emerald-800 font-bold block">Your Annual Family Savings</span>
          <span className="text-2xl font-extrabold text-emerald-700 tabular-nums block mt-1">
            ₹{annualSavings.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-emerald-800 font-semibold">
            ₹{monthlySavings.toLocaleString('en-IN')} saved every month!
          </span>
        </div>
      </div>

      {/* Basket Table */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between font-bold text-slate-700 pb-1 border-b border-slate-100">
          <span>Active Medicine Basket</span>
          <span>Monthly Quantity (Strips of 10)</span>
        </div>

        {basket.map(item => (
          <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <span className="font-bold text-slate-900">{item.name}</span>
              <p className="text-[11px] text-slate-500">{item.genericName}</p>
              <div className="mt-1 flex items-center gap-3 text-[11px]">
                <span className="text-slate-400 line-through">Brand: ₹{item.brandPricePerStrip}</span>
                <span className="font-bold text-emerald-700">Jan Aushadhi: ₹{item.janAushadhiPricePerStrip}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 text-[11px]">Strips/month:</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={item.monthlyStrips}
                  onChange={e => handleUpdateStrips(item.id, parseInt(e.target.value, 10) || 1)}
                  className="w-14 px-2 py-1 rounded-lg border border-slate-300 text-center font-bold text-slate-900 bg-white"
                />
              </div>

              <button
                onClick={() => handleRemove(item.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                title="Remove from calculation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Preset Pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
        <span className="text-slate-400 font-medium">Add Common Prescriptions:</span>
        {COMMON_PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => handleAddPreset(preset)}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium flex items-center gap-1 transition cursor-pointer"
          >
            <Plus className="w-3 h-3 text-sky-600" />
            <span>{preset.name.split('(')[0].trim()}</span>
          </button>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <span className="text-slate-500">
          Jan Aushadhi medicines meet Indian Pharmacopoeia (IP) and WHO-GMP therapeutic equivalence standards.
        </span>

        <button
          onClick={() => setActiveTab('pharmacy')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Locate Nearest Jan Aushadhi Kendra</span>
        </button>
      </div>
    </div>
  );
};
