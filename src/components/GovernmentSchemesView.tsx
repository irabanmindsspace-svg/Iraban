import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { GovernmentHealthScheme } from '../types';
import { 
  Building, 
  CheckCircle, 
  ExternalLink, 
  Phone, 
  ShieldCheck, 
  Calendar, 
  HelpCircle,
  Award
} from 'lucide-react';

export const GovernmentSchemesView: React.FC = () => {
  const [schemes, setSchemes] = useState<GovernmentHealthScheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getGovernmentSchemes().then(res => {
      if (res.success) setSchemes(res.schemes);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-lg p-5 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Government Healthcare Schemes & Welfare
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                Verified Govt Portals
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Authoritative eligibility guidelines, benefits coverage, and verified national helplines.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Verified against official MoHFW directives</span>
          </div>
        </div>
      </div>

      {/* Schemes List */}
      <div className="space-y-3">
        {schemes.map(scheme => (
          <div
            key={scheme.id}
            className="bg-white rounded-lg p-5 border border-slate-200 hover:border-slate-300 transition space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 text-[11px] font-bold bg-sky-50 text-sky-900 rounded border border-sky-200">
                    {scheme.shortCode}
                  </span>
                  <h2 className="text-base font-bold text-slate-900">{scheme.title}</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">{scheme.ministry}</p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Financial Coverage</span>
                <span className="font-bold text-base text-emerald-800">
                  {scheme.coverageAmount}
                </span>
              </div>
            </div>

            {/* Eligibility & How to Apply Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-100">
              <div className="bg-slate-50 p-3.5 rounded border border-slate-200">
                <p className="font-semibold text-slate-900 mb-1">Eligibility Criteria:</p>
                <p className="text-slate-600 leading-relaxed">{scheme.eligibilityDescription}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded border border-slate-200">
                <p className="font-semibold text-slate-900 mb-1">How to Access & Enroll:</p>
                <p className="text-slate-600 leading-relaxed">{scheme.howToApply}</p>
              </div>
            </div>

            {/* Key Benefits List */}
            <div className="text-xs space-y-1.5">
              <p className="font-semibold text-slate-900">Key Welfare Entitlements:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                {scheme.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer with Helpline & Official Portal */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3 text-slate-500">
                <span className="flex items-center gap-1 font-medium text-slate-800">
                  <Phone className="w-3.5 h-3.5 text-sky-800" />
                  <span>Helpline: {scheme.helpline}</span>
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Verified: {scheme.lastVerifiedDate}</span>
                </span>
              </div>

              <a
                href={scheme.officialPortal}
                target="_blank"
                rel="noreferrer noopener"
                className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs flex items-center gap-1.5 transition btn-press border border-slate-200"
              >
                <span>Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
