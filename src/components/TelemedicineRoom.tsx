import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Appointment } from '../types';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MessageSquare, 
  Send, 
  FileText, 
  ShieldCheck, 
  User, 
  Clock, 
  CheckCircle,
  FileCheck,
  Activity,
  Heart,
  Thermometer,
  Zap
} from 'lucide-react';

interface Props {
  appointment?: Appointment;
  onEndCall: () => void;
}

export const TelemedicineRoom: React.FC<Props> = ({ appointment, onEndCall }) => {
  const { user, showNotification } = useApp();
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(148); // in seconds
  const [heartRate, setHeartRate] = useState(74);
  const [spO2, setSpO2] = useState(99);
  const [bp, setBp] = useState('122/80');

  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: 'Dr. Priya Venkatesh',
      text: 'Namaste Rajesh ji. I have reviewed your previous HbA1c and lipid reports. How have your morning energy levels and fasting readings been this week?',
      time: '10:31 AM',
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [doctorIsTyping, setDoctorIsTyping] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live heart rate subtle fluctuation simulation
  useEffect(() => {
    const hrTimer = setInterval(() => {
      setHeartRate(prev => Math.floor(72 + Math.random() * 5));
    }, 3000);
    return () => clearInterval(hrTimer);
  }, []);

  // Dynamic Animated ECG Monitor Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;
    const width = canvas.width;
    const height = canvas.height;

    const render = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; // trail fade
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#10b981'; // emerald green
      ctx.lineWidth = 2;
      ctx.beginPath();

      const midY = height / 2;
      const x = (step * 2) % width;

      // Clear slice ahead of scan head
      ctx.clearRect(x, 0, 8, height);

      // Draw standard P-Q-R-S-T wave pulse
      let y = midY;
      const wavePhase = (step % 60);
      if (wavePhase === 15) y = midY - 6; // P wave
      else if (wavePhase === 20) y = midY + 4; // Q wave
      else if (wavePhase === 22) y = midY - 32; // R spike
      else if (wavePhase === 25) y = midY + 12; // S dip
      else if (wavePhase === 32) y = midY - 10; // T wave

      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#34d399';
      ctx.fill();

      step++;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const currentText = chatInput.trim();
    setChatMessages(prev => [
      ...prev,
      {
        sender: user?.fullName || 'Patient',
        text: currentText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
    setChatInput('');
    setDoctorIsTyping(true);

    // Contextual simulated doctor response based on query
    setTimeout(() => {
      setDoctorIsTyping(false);
      let reply = 'Understood. We will keep your current dosage stable and review after 3 weeks.';
      const lower = currentText.toLowerCase();
      if (lower.includes('sugar') || lower.includes('fasting') || lower.includes('diabetes')) {
        reply = 'Good observation. Keep recording the fasting readings daily. Your 6.8% HbA1c shows good control, so continue Metformin 500mg SR after dinner.';
      } else if (lower.includes('bp') || lower.includes('pressure') || lower.includes('headache')) {
        reply = 'Your BP monitor reads 122/80 mmHg today which is optimal. Continue Telmisartan 40mg in the morning, and avoid added table salt.';
      } else if (lower.includes('pain') || lower.includes('cough') || lower.includes('fever')) {
        reply = 'Please continue warm hydration. I am adding a note in your digital prescription right now.';
      }

      setChatMessages(prev => [
        ...prev,
        {
          sender: 'Dr. Priya Venkatesh',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }, 1400);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-4">
      {/* Session Header Bar */}
      <div className="bg-slate-900 text-white rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold tracking-tight">Telemedicine Consultation</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-800">
                ABDM Encrypted WebRTC
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Dr. Priya Venkatesh (MCI-2012-44192) · Patient: {user?.fullName || 'Rajesh Sharma'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-300 bg-slate-800 px-3 py-1.5 rounded border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>{formatCallTime(callDuration)}</span>
          </div>

          <button
            onClick={() => setShowPrescriptionModal(true)}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-700 min-h-[36px] btn-press"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>Digital Rx</span>
          </button>

          <button
            onClick={() => {
              showNotification('Telemedicine consultation ended. Summary saved to health profile.');
              window.location.hash = '#home';
            }}
            className="px-3.5 py-1.5 rounded bg-red-700 hover:bg-red-800 text-white font-medium text-xs flex items-center gap-1.5 transition cursor-pointer min-h-[36px] btn-press"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End Call</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Doctor Video & Patient Self View + Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Doctor Video & Live Vitals */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Main Doctor Video Feed Simulation */}
          <div className="relative aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
            {videoEnabled ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-slate-900 text-white">
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-sky-600 flex items-center justify-center mb-3">
                  <User className="w-10 h-10 text-sky-400" />
                </div>
                <p className="text-base font-bold">Dr. Priya Venkatesh</p>
                <p className="text-xs text-slate-400 mt-0.5">Internal Medicine Specialist · AIIMS New Delhi</p>
                
                <span className="mt-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Encrypted High-Definition Feed (24-bit PCM Audio)
                </span>
              </div>
            ) : (
              <div className="text-center text-slate-500 text-xs">
                <VideoOff className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p>Doctor video paused</p>
              </div>
            )}

            {/* Small Patient Picture-in-Picture view */}
            <div className="absolute bottom-3 right-3 w-32 sm:w-44 aspect-video bg-slate-900 rounded border border-slate-700 overflow-hidden shadow-lg flex items-center justify-center text-white text-[11px]">
              <div className="text-center p-2">
                <User className="w-4 h-4 mx-auto mb-0.5 text-slate-400" />
                <p className="truncate font-medium">{user?.fullName || 'You'}</p>
                <p className="text-[9px] text-emerald-400">Audio/Video Active</p>
              </div>
            </div>

            {/* Video Controls overlay */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded border border-slate-700">
              <button
                onClick={() => setMicEnabled(!micEnabled)}
                className={`p-2 rounded transition min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer btn-press ${micEnabled ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-700 text-white'}`}
                title={micEnabled ? 'Mute Mic' : 'Unmute Mic'}
              >
                {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`p-2 rounded transition min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer btn-press ${videoEnabled ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-700 text-white'}`}
                title={videoEnabled ? 'Stop Video' : 'Start Video'}
              >
                {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Dynamic Animated ECG & Live Telemetry Bar */}
          <div className="bg-slate-950 text-white rounded-lg p-3.5 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Patient Clinical Telemetry Stream
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Lead II Real-Time Monitor
              </span>
            </div>

            <div className="mt-2.5 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* ECG Canvas Waveform */}
              <div className="md:col-span-6 bg-slate-900 rounded p-1.5 border border-slate-800 flex items-center justify-center">
                <canvas 
                  ref={canvasRef} 
                  width={340} 
                  height={56} 
                  className="w-full h-14 rounded"
                />
              </div>

              {/* Numerical vitals metrics */}
              <div className="md:col-span-6 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-red-400 text-[10px] font-bold">
                    <Heart className="w-3 h-3 fill-red-500" />
                    <span>PULSE</span>
                  </div>
                  <span className="text-base font-bold text-white tabular-nums block mt-0.5">
                    {heartRate} <span className="text-[10px] font-normal text-slate-400">bpm</span>
                  </span>
                </div>

                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-sky-400 text-[10px] font-bold block">SpO2</span>
                  <span className="text-base font-bold text-white tabular-nums block mt-0.5">
                    {spO2}%
                  </span>
                </div>

                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-emerald-400 text-[10px] font-bold block">BP</span>
                  <span className="text-base font-bold text-white tabular-nums block mt-0.5">
                    {bp}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: In-Call Clinical Chat & Notes */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 flex flex-col h-[520px] overflow-hidden">
          
          <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-800" />
              <h3 className="font-bold text-xs text-slate-900">Consultation Chat</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Doctor & Patient Only</span>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
            {chatMessages.map((msg, i) => (
              <div 
                key={i}
                className={`p-2.5 rounded ${msg.sender === (user?.fullName || 'Patient') ? 'bg-sky-50 text-slate-900 ml-6 border border-sky-100' : 'bg-slate-50 text-slate-800 mr-6 border border-slate-200'}`}
              >
                <div className="flex items-center justify-between font-bold text-[10px] mb-1">
                  <span>{msg.sender}</span>
                  <span className="text-slate-400 font-normal">{msg.time}</span>
                </div>
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            ))}

            {doctorIsTyping && (
              <div className="p-2 text-[11px] text-slate-400 italic flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>Dr. Priya Venkatesh is replying...</span>
              </div>
            )}
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendChat} className="p-2.5 border-t border-slate-200 flex items-center gap-2 bg-slate-50">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask doctor about medicines, diet, reports..."
              className="flex-1 px-3 py-1.5 text-xs rounded border border-slate-300 focus:outline-hidden focus:border-sky-600 text-slate-900 bg-white min-h-[38px]"
            />
            <button
              type="submit"
              className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded transition cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center btn-press"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

      </div>

      {/* Modal: Live Digital Prescription */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 shadow-2xl border border-slate-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-sky-800" />
                <h3 className="font-bold text-sm text-slate-900">Digital Prescription (Rx)</h3>
              </div>
              <button 
                onClick={() => setShowPrescriptionModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-3.5 space-y-3 text-xs text-slate-700 font-sans">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <div>
                  <p className="font-bold text-slate-900">Dr. Priya Venkatesh, MD</p>
                  <p className="text-slate-500 text-[11px]">NMC Reg: MCI-2012-44192</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-[11px]">Date: {new Date().toISOString().split('T')[0]}</p>
                  <p className="font-mono text-emerald-800 text-[10px] font-semibold">VERIFIED DIGITAL Rx</p>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-900 mb-1">Prescribed Medicines:</p>
                <div className="space-y-1.5 bg-slate-50 p-3 rounded border border-slate-200">
                  <div className="flex justify-between font-medium">
                    <span>1. Metformin SR 500mg</span>
                    <span>1 Tablet (After Dinner) · 30 Days</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>2. Telmisartan 40mg</span>
                    <span>1 Tablet (Morning) · 30 Days</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-500">
                <p><strong>Advice:</strong> Daily brisk walking 30 minutes, restrict added salt. Repeat fasting sugar after 4 weeks.</p>
                <p className="mt-1 font-mono text-[10px] text-slate-400">Cryptographically signed under Indian Telemedicine Practice Guidelines 2020.</p>
              </div>
            </div>

            <button
              onClick={() => setShowPrescriptionModal(false)}
              className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded transition cursor-pointer btn-press"
            >
              Close Prescription
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
