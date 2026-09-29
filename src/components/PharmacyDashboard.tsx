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
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Pharmacy Staff & Prescription Verification Portal
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-900 text-white rounded-md">
                Chemist Portal
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pradhan Mantri Bhartiya Janaushadhi Kendra · Connaught Place Outlet (DL-WZ-2021-9988)
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
            Licensed PMBJP Distributor
          </span>
        </div>
      </div>

      {/* Prescription Review & Order Fulfillment Queue */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-emerald-600" />
          <span>Incoming Prescription Verification & Fulfillment Queue ({orders.length})</span>
        </h2>

        <div className="space-y-3">
          {orders.map(order => (
            <div
              key={order.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{order.patientName}</span>
                  <span className="font-mono text-slate-500 font-semibold">{order.id}</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold rounded-md text-[10px]">
                    {order.type}
                  </span>
                </div>

                <p className="text-slate-700 font-medium mt-1">
                  <strong>Items:</strong> {order.medicines}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-slate-500 text-[11px]">
                  <span>Phone: {order.phone}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 font-semibold">✓ {order.rxStatus}</span>
                  <span aria-hidden="true">·</span>
                  <span>Received: {order.time}</span>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  {order.orderStatus}
                </span>

                {order.orderStatus !== 'Dispatched' && (
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, 'Dispatched')}
                    className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition cursor-pointer"
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
