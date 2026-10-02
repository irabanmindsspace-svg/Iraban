import { useState, useEffect } from 'react';
import { MedicineItem } from '../types';

export interface BasketItem {
  id: string;
  name: string;
  genericName: string;
  brandPricePerStrip: number;
  janAushadhiPricePerStrip: number;
  monthlyStrips: number;
  category?: string;
}

const STORAGE_KEY = 'sanjeevani_medicine_basket_v2';

export const INITIAL_BASKET_PRESETS: BasketItem[] = [
  {
    id: 'm1',
    name: 'Glycomet 500 SR',
    genericName: 'Metformin Sustained Release Tablets IP 500mg',
    brandPricePerStrip: 48,
    janAushadhiPricePerStrip: 11,
    monthlyStrips: 2,
    category: 'Diabetes Care'
  },
  {
    id: 'm2',
    name: 'Telma 40',
    genericName: 'Telmisartan Tablets IP 40mg',
    brandPricePerStrip: 112,
    janAushadhiPricePerStrip: 22,
    monthlyStrips: 2,
    category: 'Blood Pressure / Hypertension'
  },
  {
    id: 'm3',
    name: 'Atorva 10',
    genericName: 'Atorvastatin Calcium Tablets IP 10mg',
    brandPricePerStrip: 135,
    janAushadhiPricePerStrip: 25,
    monthlyStrips: 2,
    category: 'Cholesterol & Heart Care'
  }
];

export function getSavedBasket(): BasketItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed reading medicine basket from storage:', err);
  }
  return INITIAL_BASKET_PRESETS;
}

export function saveBasket(basket: BasketItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(basket));
    window.dispatchEvent(new CustomEvent('medicine-basket-updated', { detail: basket }));
  } catch (err) {
    console.error('Failed saving medicine basket to storage:', err);
  }
}

export function addMedicineItemToBasket(med: MedicineItem | BasketItem, strips = 1): { success: boolean; isNew: boolean } {
  const current = getSavedBasket();
  const existing = current.find(item => item.id === med.id || item.name.toLowerCase() === (('brandName' in med ? med.brandName : med.name).toLowerCase()));
  
  if (existing) {
    const updated = current.map(item => 
      item.id === existing.id ? { ...item, monthlyStrips: item.monthlyStrips + strips } : item
    );
    saveBasket(updated);
    return { success: true, isNew: false };
  }

  const newItem: BasketItem = {
    id: med.id,
    name: 'brandName' in med ? med.brandName : med.name,
    genericName: med.genericName,
    brandPricePerStrip: 'brandPrice' in med ? med.brandPrice : med.brandPricePerStrip,
    janAushadhiPricePerStrip: 'janAushadhiPrice' in med ? med.janAushadhiPrice : med.janAushadhiPricePerStrip,
    monthlyStrips: strips,
    category: med.category
  };

  saveBasket([...current, newItem]);
  return { success: true, isNew: true };
}

export function useMedicineBasket() {
  const [basket, setBasket] = useState<BasketItem[]>(getSavedBasket);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<BasketItem[]>;
      if (customEvent.detail) {
        setBasket(customEvent.detail);
      } else {
        setBasket(getSavedBasket());
      }
    };

    window.addEventListener('medicine-basket-updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('medicine-basket-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const updateStrips = (id: string, strips: number) => {
    const validStrips = Math.max(1, strips);
    const next = basket.map(item => item.id === id ? { ...item, monthlyStrips: validStrips } : item);
    setBasket(next);
    saveBasket(next);
  };

  const removeItem = (id: string) => {
    const next = basket.filter(item => item.id !== id);
    setBasket(next);
    saveBasket(next);
  };

  const addItem = (item: MedicineItem | BasketItem, strips = 1) => {
    return addMedicineItemToBasket(item, strips);
  };

  const clearBasket = () => {
    setBasket([]);
    saveBasket([]);
  };

  const resetToDefaults = () => {
    setBasket(INITIAL_BASKET_PRESETS);
    saveBasket(INITIAL_BASKET_PRESETS);
  };

  const totalBrandMonthly = basket.reduce((acc, item) => acc + item.brandPricePerStrip * item.monthlyStrips, 0);
  const totalJanAushadhiMonthly = basket.reduce((acc, item) => acc + item.janAushadhiPricePerStrip * item.monthlyStrips, 0);
  const monthlySavings = Math.max(0, totalBrandMonthly - totalJanAushadhiMonthly);
  const annualSavings = monthlySavings * 12;
  const savingsPercent = totalBrandMonthly > 0 ? Math.round((monthlySavings / totalBrandMonthly) * 100) : 0;

  return {
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
    itemCount: basket.length,
  };
}
