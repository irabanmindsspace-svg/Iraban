import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  Bot, 
  Send, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  HelpCircle, 
  FileText, 
  Stethoscope, 
  ShieldAlert, 
  User, 
  PhoneCall,
  Calendar
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  isUrgent?: boolean;
  recommendedSpecialty?: string;
  emergencyNumbers?: string[];
  timestamp: string;
}

export const HealthGuideAI: React.FC = () => {
  const { setActiveTab, setSelectedDoctorForBooking, setIsEmergencyModalOpen, t } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      sender: 'assistant',
      text: `Hello! I am **HealthGuide**, an AI healthcare navigation assistant. 
I can help you:
• Determine which medical specialist to consult
• Understand medical terminology and routine lab test values
• Prepare focused questions for your doctor's appointment
• Find affordable government programs and generic medicine equivalents

**Safety Notice**: I am an AI, **not a doctor**. I cannot provide definitive diagnoses or prescribe prescription medicines. If you or someone with you experiences chest pain, breathlessness, or severe trauma, call **108 / 112** immediately.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-5).map(m => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        text: m.text
      }));

      const res = await api.askHealthGuide(query.trim(), historyPayload);

      if (res.success) {
        const assistantMsg: ChatMessage = {
          id: `msg_res_${Date.now()}`,
          sender: 'assistant',
          text: res.response,
          isUrgent: res.isUrgentWarning,
          recommendedSpecialty: res.recommendedSpecialty,
          emergencyNumbers: res.emergencyNumbers,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch (err) {
      console.error('HealthGuide Error:', err);
      setMessages(prev => [...prev, {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: 'I apologize, but I encountered a momentary connection issue. If this is an emergency, please dial 108 or 112 directly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const PRESET_QUERIES = [
    { title: 'Fever & chills for 3 days', query: 'I have had fever, body aches and chills for 3 days. What specialist should I see and what tests might they ask for?' },
    { title: 'Questions for Cardiologist', query: 'I have an upcoming appointment with a cardiologist for high blood pressure. What questions should I prepare?' },
    { title: 'Explain HbA1c result', query: 'My lab test shows HbA1c of 7.1%. Can you explain what this means in simple terms?' },
    { title: 'Child night cough', query: 'My 8 year old child has a persistent dry cough mainly at night. What precautions and pediatric advice apply?' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-4">
      
      {/* Header Info Banner */}
      <div className="bg-white rounded-lg p-5 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-sky-800 shrink-0 mt-0.5">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">Clinical & Health Guide</h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                  Triage & Consultation Prep
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Preliminary symptom triage, specialist recommendation, and preparation for doctor appointments.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEmergencyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition cursor-pointer shrink-0 btn-press"
          >
            <ShieldAlert className="w-4 h-4 text-red-700" />
            <span>Emergency 108</span>
          </button>
        </div>

        {/* Clear Disclaimer */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-500">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            This guide is an informational triage aid, not an autonomous clinician. It does not replace clinical consultation with a qualified doctor.
          </p>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-lg border border-slate-200 flex flex-col h-[520px] overflow-hidden">
        
        {/* Messages Feed */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 text-xs font-bold ${m.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-sky-800 text-white'}`}>
                {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Stethoscope className="w-3.5 h-3.5" />}
              </div>

              {/* Message Body */}
              <div className={`max-w-[85%] rounded p-3.5 text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user' 
                  ? 'bg-slate-900 text-white' 
                  : m.isUrgent 
                    ? 'bg-red-50 border border-red-200 text-slate-900' 
                    : 'bg-slate-50 border border-slate-200 text-slate-800'
              }`}>
                {m.isUrgent && (
                  <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-red-200 text-red-800 font-bold text-xs uppercase tracking-wide">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-700" />
                    <span>Urgent Medical Warning</span>
                  </div>
                )}

                {/* Formatted Markdown-like Text Output */}
                <div className="space-y-1.5 whitespace-pre-line text-xs sm:text-sm">
                  {m.text}
                </div>

                {/* Quick Action If Specialty Recommended */}
                {m.recommendedSpecialty && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Recommended: <strong className="text-sky-800">{m.recommendedSpecialty}</strong>
                    </span>
                    <button
                      onClick={() => setActiveTab('doctors')}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded transition cursor-pointer btn-press"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Find {m.recommendedSpecialty}</span>
                    </button>
                  </div>
                )}

                <div className={`mt-2 text-[10px] text-right ${m.sender === 'user' ? 'text-slate-400' : 'text-slate-400'}`}>
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded bg-sky-800 text-white flex items-center justify-center shrink-0">
                <Stethoscope className="w-3.5 h-3.5" />
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-700 animate-pulse" />
                <span>Evaluating clinical guidance...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-500 text-[11px] font-medium whitespace-nowrap">Suggested:</span>
          {PRESET_QUERIES.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.query)}
              className="px-2.5 py-1 rounded bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium whitespace-nowrap hover:bg-slate-50 transition cursor-pointer btn-press"
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Chat Input Field */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about symptoms, medical reports, or preparation for doctor visit..."
              className="flex-1 px-3.5 py-2 rounded border border-slate-300 focus:border-sky-600 focus:outline-hidden text-xs text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded font-medium text-xs flex items-center gap-1.5 transition cursor-pointer btn-press"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
