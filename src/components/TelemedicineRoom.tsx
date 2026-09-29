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
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Session Header Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold">Encrypted Telemedicine OPD Room</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30">
                DISHA / ABDM WebRTC
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Dr. Priya Venkatesh (MCI-2012-44192) · Patient: {user?.fullName || 'Rajesh Sharma'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>{formatCallTime(callDuration)}</span>
          </div>

          <button
            onClick={() => setShowPrescriptionModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer min-h-[38px]"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Digital Rx</span>
          </button>

          <button
            onClick={() => {
              showNotification('Telemedicine consultation ended. Summary saved to health profile.');
              window.location.hash = '#home';
            }}
            className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer min-h-[38px]"
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
          <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-lg border border-slate-800 flex items-center justify-center">
            {videoEnabled ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-radial from-slate-800 to-slate-950 text-white">
                <div className="w-24 h-24 rounded-full bg-sky-600/30 border-2 border-sky-400 flex items-center justify-center mb-3">
                  <User className="w-12 h-12 text-sky-200" />
                </div>
                <p className="text-base font-bold">Dr. Priya Venkatesh</p>
                <p className="text-xs text-slate-400">General Physician & Internal Medicine · AIIMS New Delhi</p>
                
                <span className="mt-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live 1080p WebRTC Session (Audio & Video Encrypted)
                </span>
              </div>
            ) : (
              <div className="text-center text-slate-500 text-xs">
                <VideoOff className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p>Doctor video paused</p>
              </div>
            )}

            {/* Small Patient Picture-in-Picture view */}
            <div className="absolute bottom-4 right-4 w-36 sm:w-48 aspect-video bg-slate-900/90 rounded-xl border border-slate-700 overflow-hidden shadow-xl flex items-center justify-center text-white text-[11px]">
              <div className="text-center p-2">
                <User className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                <p className="truncate font-semibold">{user?.fullName || 'You'}</p>
                <p className="text-[9px] text-emerald-400">Connected</p>
              </div>
            </div>

            {/* Video Controls overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700/80">
              <button
                onClick={() => setMicEnabled(!micEnabled)}
                className={`p-2.5 rounded-xl transition min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer ${micEnabled ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'}`}
                title={micEnabled ? 'Mute Mic' : 'Unmute Mic'}
              >
                {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`p-2.5 rounded-xl transition min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer ${videoEnabled ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'}`}
                title={videoEnabled ? 'Stop Video' : 'Start Video'}
              >
                {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Dynamic Animated ECG & Live Telemetry Bar */}
          <div className="bg-slate-950 text-white rounded-2xl p-4 border border-slate-800 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Live Patient Clinical Telemetry Feed
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">
                Lead II Real-Time Waveform
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* ECG Canvas Waveform */}
              <div className="md:col-span-6 bg-slate-900/80 rounded-xl p-2 border border-slate-800 flex items-center justify-center">
                <canvas 
                  ref={canvasRef} 
                  width={340} 
                  height={60} 
                  className="w-full h-15 rounded-lg"
                />
              </div>

              {/* Numerical vitals metrics */}
              <div className="md:col-span-6 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-rose-400 text-[10px] font-bold">
                    <Heart className="w-3 h-3 fill-rose-500 animate-pulse" />
                    <span>PULSE</span>
                  </div>
                  <span className="text-lg font-extrabold text-white tabular-nums block mt-0.5">
                    {heartRate} <span className="text-[10px] font-normal text-slate-400">bpm</span>
                  </span>
                </div>

                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-sky-400 text-[10px] font-bold block">SpO2</span>
                  <span className="text-lg font-extrabold text-white tabular-nums block mt-0.5">
                    {spO2}%
                  </span>
                </div>

                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 text-[10px] font-bold block">BP</span>
                  <span className="text-base font-extrabold text-white tabular-nums block mt-0.5">
                    {bp}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: In-Call Clinical Chat & Notes */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[520px] overflow-hidden">
          
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-600" />
              <h3 className="font-bold text-xs text-slate-900">Clinical Consultation Chat</h3>
            </div>
            <span className="text-[10px] text-slate-400">Doctor & Patient Only</span>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
            {chatMessages.map((msg, i) => (
              <div 
                key={i}
                className={`p-3 rounded-xl ${msg.sender === (user?.fullName || 'Patient') ? 'bg-sky-50 text-sky-950 ml-6' : 'bg-slate-50 text-slate-800 mr-6 border border-slate-100'}`}
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
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
                <span>Dr. Priya Venkatesh is typing reply...</span>
              </div>
            )}
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendChat} className="p-3 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask doctor about medicines, reports..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-slate-900 min-h-[40px]"
            />
            <button
              type="submit"
              className="p-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

      </div>

      {/* Modal: Live Digital Prescription */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-sm text-slate-900">Digital Prescription (Rx)</h3>
              </div>
              <button 
                onClick={() => setShowPrescriptionModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-700 font-sans">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <div>
                  <p className="font-bold text-slate-900">Dr. Priya Venkatesh, MD</p>
                  <p className="text-slate-500 text-[11px]">NMC Reg: MCI-2012-44192</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-[11px]">Date: {new Date().toISOString().split('T')[0]}</p>
                  <p className="font-mono text-emerald-700 text-[10px]">VERIFIED DIGITAL Rx</p>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-900 mb-1">Prescribed Medicines:</p>
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between font-semibold">
                    <span>1. Metformin SR 500mg</span>
                    <span>1 Tablet (After Dinner) · 30 Days</span>
                  </div>
                  <div className="flex justify-between font-semibold">
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
              className="mt-5 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Close Prescription View
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
