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
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Diagnostic Laboratories & Health Packages
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              NABL accredited diagnostic centers, home sample collection, and subsidized blood test pricing.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-sky-800 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>NABL Certified Quality Standards</span>
          </div>
        </div>

        {/* Filter categories */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium mr-1">Category:</span>
          {['all', 'Pathology', 'Diabetes', 'Cardiology', 'Radiology'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer capitalize ${selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tests Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900">
            Standard Pathology & Radiology Tests ({filteredTests.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests.map(test => (
            <div
              key={test.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wide">
                      {test.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{test.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-md border border-emerald-100 shrink-0">
                    ₹{test.subsidizedPrice}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  {test.description}
                </p>

                <div className="mt-3.5 pt-2.5 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sample Type:</span>
                    <span className="font-semibold text-slate-800">{test.sampleType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Fasting Needed:</span>
                    <span className="font-semibold text-slate-800">
                      {test.fastingHoursRequired > 0 ? `${test.fastingHoursRequired} Hours Fasting` : 'No Fasting Required'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Report Turnaround:</span>
                    <span className="font-semibold text-sky-700">{test.turnaroundTime}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 line-through">MRP: ₹{test.marketPrice}</span>
                <button
                  onClick={() => showNotification(`Home collection request placed for ${test.name}. Technician will contact shortly.`)}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
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
