import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Pill, 
  FileCheck, 
  CheckCircle, 
  Clock, 
  Truck, 
  AlertTriangle,
  Search,
  Building
} from 'lucide-react';

export const PharmacyDashboard: React.FC = () => {
  const { showNotification } = useApp();
  const [orders, setOrders] = useState([
    {
      id: 'ord_301',
      patientName: 'Rajesh Sharma',
      phone: '+91 98765 43210',
      medicines: 'Metformin SR 500mg (30 Tabs), Telmisartan 40mg (30 Tabs)',
      hasPrescription: true,
      rxStatus: 'Verified (Dr. Priya Venkatesh, MCI-44192)',
      orderStatus: 'Ready for Dispatch',
      time: '11:20 AM',
      type: 'Jan Aushadhi Subsidized (Total: ₹99)'
    },
    {
      id: 'ord_302',
      patientName: 'Sunita Sharma',
      phone: '+91 98765 43210',
      medicines: 'Paracetamol IP 650mg (20 Tabs), Shelcal 500 (30 Tabs)',
      hasPrescription: false,
      rxStatus: 'OTC (No Rx Required)',
      orderStatus: 'Packed',
      time: '09:45 AM',
      type: 'Retail (Total: ₹110)'
    }
  ]);

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
    showNotification(`Order ${orderId} status set to ${newStatus}.`);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-5">
      
      {/* Header */}
      <div className="bg-white rounded-lg p-5 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Pharmacy Staff & Prescription Verification Portal
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-900 text-white rounded">
                Chemist Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pradhan Mantri Bhartiya Janaushadhi Kendra · Connaught Place Outlet (DL-WZ-2021-9988)
            </p>
          </div>

          <span className="text-xs font-medium px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
            Licensed PMBJP Distributor
          </span>
        </div>
      </div>

      {/* Prescription Review & Order Fulfillment Queue */}
      <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-3.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <FileCheck className="w-4 h-4 text-emerald-700" />
          <span>Prescription Verification & Fulfillment Queue ({orders.length})</span>
        </h2>

        <div className="space-y-2.5">
          {orders.map(order => (
            <div
              key={order.id}
              className="p-3.5 rounded border border-slate-200 hover:border-slate-300 transition bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{order.patientName}</span>
                  <span className="font-mono text-slate-500 font-semibold">{order.id}</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-semibold rounded text-[10px] border border-emerald-200">
                    {order.type}
                  </span>
                </div>

                <p className="text-slate-700 font-medium mt-1">
                  <strong>Items:</strong> {order.medicines}
                </p>

                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-slate-500 text-[11px]">
                  <span>Phone: {order.phone}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-emerald-800 font-semibold">✓ {order.rxStatus}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>Received: {order.time}</span>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded border border-slate-200 text-xs">
                  {order.orderStatus}
                </span>

                {order.orderStatus !== 'Dispatched' && (
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, 'Dispatched')}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded transition cursor-pointer btn-press text-xs"
                  >
                    Dispatch Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
