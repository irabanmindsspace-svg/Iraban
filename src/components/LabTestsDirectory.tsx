import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DiagnosticLab, DiagnosticTest } from '../types';
import { 
  TestTube2, 
  Search, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle, 
  Home, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

export const LabTestsDirectory: React.FC = () => {
  const { showNotification } = useApp();
  const [labs, setLabs] = useState<DiagnosticLab[]>([]);
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    setLoading(true);
    api.getLabs().then(res => {
      if (res.success) {
        setLabs(res.labs);
        setTests(res.tests);
      }
    }).finally(() => setLoading(false));
  }, []);

  const filteredTests = selectedCategory === 'all' 
    ? tests 
    : tests.filter(t => t.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-5">
      
      {/* Header */}
      <div className="bg-white rounded-lg p-5 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Diagnostic Laboratories & Health Packages
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              NABL accredited diagnostic centers, home sample collection, and subsidized lab test pricing.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>NABL Certified Quality Standards</span>
          </div>
        </div>

        {/* Filter categories */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-medium mr-1 text-[11px]">Category:</span>
          {['all', 'Pathology', 'Diabetes', 'Cardiology', 'Radiology'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded font-medium transition cursor-pointer capitalize text-xs btn-press ${selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tests Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
          <span>
            Standard Pathology & Radiology Tests (<strong className="text-slate-900 font-semibold">{filteredTests.length}</strong>)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTests.map(test => (
            <div
              key={test.id}
              className="bg-white rounded-lg p-4 border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-sky-800 uppercase tracking-wide">
                      {test.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{test.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-semibold text-xs rounded border border-emerald-200 shrink-0 tabular-nums">
                    ₹{test.subsidizedPrice}
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  {test.description}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Sample Type:</span>
                    <span className="font-medium text-slate-800">{test.sampleType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Fasting Needed:</span>
                    <span className="font-medium text-slate-800">
                      {test.fastingHoursRequired > 0 ? `${test.fastingHoursRequired} Hours Fasting` : 'No Fasting'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Turnaround:</span>
                    <span className="font-semibold text-sky-800">{test.turnaroundTime}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 line-through text-[11px]">MRP: ₹{test.marketPrice}</span>
                <button
                  onClick={() => showNotification(`Home collection request placed for ${test.name}. Technician will contact shortly.`)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-xs flex items-center gap-1.5 transition cursor-pointer btn-press"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Book Home Sample</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
