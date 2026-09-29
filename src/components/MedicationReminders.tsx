import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { MedicationReminder } from '../types';
import { 
  Bell, 
  Plus, 
  Check, 
  Clock, 
  Pill, 
  CheckCircle2, 
  XCircle,
  Calendar,
  Sparkles
} from 'lucide-react';

export const MedicationReminders: React.FC = () => {
  const { user, showNotification } = useApp();
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New reminder form
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time1, setTime1] = useState('08:30');
  const [time2, setTime2] = useState('20:30');
  const [instructions, setInstructions] = useState('');

  const todayDateKey = new Date().toISOString().split('T')[0];

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await api.getReminders();
      if (res.success) {
        setReminders(res.reminders);
      }
    } catch (e) {
      console.error('Failed to fetch reminders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleToggleTaken = async (reminderId: string, time: string) => {
    const key = `${todayDateKey}-${time}`;
    try {
      const res = await api.toggleReminderTaken(reminderId, key);
      if (res.success) {
        setReminders(prev => prev.map(r => r.id === reminderId ? res.reminder : r));
        showNotification('Medication adherence status updated.');
      }
    } catch (e) {
      console.error('Failed to toggle reminder status:', e);
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;

    try {
      const res = await api.addReminder({
        medicineName: medName.trim(),
        dosage: dosage.trim() || '1 Tablet',
        scheduledTimes: [time1, time2].filter(Boolean),
        instructions: instructions.trim() || 'Take after meals with water.',
      });

      if (res.success) {
        setReminders(prev => [...prev, res.reminder]);
        setShowAddModal(false);
        setMedName('');
        setDosage('');
        setInstructions('');
        showNotification('New medication schedule reminder created.');
      }
    } catch (e) {
      console.error('Failed to create reminder:', e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Medication & Dosage Reminders
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track daily prescription doses, timings, and adherence records.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medication</span>
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Today: <strong>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
        </div>
      </div>

      {/* Reminder Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reminders.map(rem => (
          <div
            key={rem.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{rem.medicineName}</h3>
                    <p className="text-xs text-slate-500">{rem.dosage}</p>
                  </div>
                </div>

                <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md">
                  Active Schedule
                </span>
              </div>

              <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {rem.instructions}
              </p>

              {/* Time Slots & Checkboxes */}
              <div className="mt-4 space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  Today&apos;s Dosage Check-In:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {rem.scheduledTimes.map(time => {
                    const key = `${todayDateKey}-${time}`;
                    const isTaken = rem.takenHistory[key];

                    return (
                      <button
                        key={time}
                        onClick={() => handleToggleTaken(rem.id, time)}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition cursor-pointer ${
                          isTaken 
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{time}</span>
                        </div>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          isTaken ? 'bg-emerald-600 text-white font-bold' : 'border border-slate-300'
                        }`}>
                          {isTaken ? <Check className="w-3 h-3" /> : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Add New Medicine Reminder
            </h3>

            <form onSubmit={handleCreateReminder} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-900 mb-1">Medicine Name</label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={e => setMedName(e.target.value)}
                  placeholder="e.g. Metformin 500mg SR, Telmisartan 40mg..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Dosage Instructions</label>
                <input
                  type="text"
                  value={dosage}
                  onChange={e => setDosage(e.target.value)}
                  placeholder="e.g. 1 Tablet after food"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Morning Dose</label>
                  <input
                    type="time"
                    value={time1}
                    onChange={e => setTime1(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Night Dose</label>
                  <input
                    type="time"
                    value={time2}
                    onChange={e => setTime2(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Special Precautions / Meal Relation</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder="e.g. Take immediately after breakfast with full glass of water."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
