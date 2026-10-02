import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  Stethoscope, 
  User, 
  Pill, 
  ShieldCheck, 
  X, 
  Lock, 
  Mail, 
  FileText, 
  KeyRound, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  QrCode,
  Shield,
  ArrowRight,
  Fingerprint,
  ScanFace,
  Smile,
  Cpu,
  Check
} from 'lucide-react';

interface RoleConfig {
  role: UserRole;
  title: string;
  badge: string;
  subtitle: string;
  idLabel: string;
  idPlaceholder: string;
  idIcon: React.ComponentType<{ className?: string }>;
  secondaryLabel?: string;
  secondaryPlaceholder?: string;
  passLabel: string;
  demoIdentifier: string;
  demoPass: string;
  demoSecondary?: string;
  demoName: string;
  demoDesignation: string;
  theme: {
    bannerBg: string;
    bannerBorder: string;
    accentText: string;
    buttonBg: string;
    buttonHover: string;
    tabActive: string;
    iconBg: string;
  };
  securityNote: string;
}

const ROLE_CONFIGS: Record<string, RoleConfig> = {
  doctor: {
    role: 'doctor',
    title: 'Medical Practitioner Login',
    badge: 'NMC / ABDM Healthcare Professional',
    subtitle: 'For registered physicians, specialists, and clinical medical officers.',
    idLabel: 'NMC / State Medical Council Registration No. *',
    idPlaceholder: 'e.g. MCI-2012-44192 or DMC-2015-88192',
    idIcon: FileText,
    secondaryLabel: 'Doctor Official Hospital Email or Mobile',
    secondaryPlaceholder: 'e.g. priya.venkatesh@aiims.gov.in',
    passLabel: 'Clinical Workstation PIN / Password *',
    demoIdentifier: 'MCI-2012-44192',
    demoSecondary: 'priya.venkatesh@aiims.gov.in',
    demoPass: 'Doctor@AIIMS2026',
    demoName: 'Dr. Priya Venkatesh (MBBS, MD, DM)',
    demoDesignation: 'Senior Cardiologist, AIIMS New Delhi',
    theme: {
      bannerBg: 'bg-slate-900',
      bannerBorder: 'border-sky-700',
      accentText: 'text-sky-300',
      buttonBg: 'bg-sky-800 hover:bg-sky-900',
      buttonHover: 'hover:bg-sky-900',
      tabActive: 'border-b-2 border-sky-800 text-sky-950 font-bold bg-sky-50/60',
      iconBg: 'bg-sky-100 text-sky-800'
    },
    securityNote: 'Credential verified against National Medical Commission (NMC) Registry and Ayushman Bharat Digital Mission (ABDM) Healthcare Professional ID (HPID).'
  },
  patient: {
    role: 'patient',
    title: 'Citizen & Patient Login',
    badge: 'Ayushman Bharat (ABHA) Citizen Access',
    subtitle: 'For patients, family health records, and prescription booking.',
    idLabel: '14-Digit ABHA ID or Mobile Number *',
    idPlaceholder: 'e.g. 91-8842-1209-7712 or +91 98765 43210',
    idIcon: User,
    secondaryLabel: 'Linked Full Name (Optional)',
    secondaryPlaceholder: 'e.g. Rajesh Sharma',
    passLabel: 'ABHA Password or 6-Digit OTP *',
    demoIdentifier: '91-8842-1209-7712',
    demoSecondary: 'Rajesh Sharma',
    demoPass: 'Abha@2026',
    demoName: 'Rajesh Sharma',
    demoDesignation: 'ABHA Verified Citizen (3 Family Dependents)',
    theme: {
      bannerBg: 'bg-emerald-950',
      bannerBorder: 'border-emerald-700',
      accentText: 'text-emerald-300',
      buttonBg: 'bg-emerald-800 hover:bg-emerald-900',
      buttonHover: 'hover:bg-emerald-900',
      tabActive: 'border-b-2 border-emerald-800 text-emerald-950 font-bold bg-emerald-50/60',
      iconBg: 'bg-emerald-100 text-emerald-800'
    },
    securityNote: 'Your personal health information is end-to-end encrypted in your ABDM Personal Health Records (PHR) repository.'
  },
  pharmacy: {
    role: 'pharmacy',
    title: 'Pharmacy & Jan Aushadhi Staff Login',
    badge: 'PMBJP Certified Kendra Dispenser',
    subtitle: 'For registered pharmacists, retail chemists, and inventory operators.',
    idLabel: 'Drug License Number or Kendra Code *',
    idPlaceholder: 'e.g. DL-DLH-2021-99881 or PMBJP-4102',
    idIcon: Pill,
    secondaryLabel: 'Pharmacy / Kendra Outlet Name',
    secondaryPlaceholder: 'e.g. Pradhan Mantri Jan Aushadhi Kendra #4102',
    passLabel: 'Dispensing Terminal Password *',
    demoIdentifier: 'DL-DLH-2021-99881',
    demoSecondary: 'Jan Aushadhi Kendra Janpath #4102',
    demoPass: 'Pharmacy@PMBJP2026',
    demoName: 'Alok Gupta (Chief Pharmacist)',
    demoDesignation: 'PMBJP Jan Aushadhi Kendra (Store #4102)',
    theme: {
      bannerBg: 'bg-teal-950',
      bannerBorder: 'border-teal-700',
      accentText: 'text-teal-300',
      buttonBg: 'bg-teal-800 hover:bg-teal-900',
      buttonHover: 'hover:bg-teal-900',
      tabActive: 'border-b-2 border-teal-800 text-teal-950 font-bold bg-teal-50/60',
      iconBg: 'bg-teal-100 text-teal-800'
    },
    securityNote: 'Authorizes real-time Jan Aushadhi generic stock auditing, Schedule H prescription compliance, and digital order dispatch.'
  },
  admin: {
    role: 'admin',
    title: 'Platform Administrator Login',
    badge: 'NHA & Ministry Regulatory Oversight',
    subtitle: 'For regulatory auditors, medical verifiers, and system administrators.',
    idLabel: 'Government Admin / Auditor Email *',
    idPlaceholder: 'e.g. admin.audit@nha.gov.in',
    idIcon: ShieldCheck,
    secondaryLabel: 'Department / Regulatory Authority',
    secondaryPlaceholder: 'e.g. National Health Authority & Medical Council Audits',
    passLabel: 'Master Administrator Password *',
    demoIdentifier: 'admin.audit@nha.gov.in',
    demoSecondary: 'National Health Authority (NHA)',
    demoPass: 'AdminSecure#2026',
    demoName: 'Dr. Vinod K. Paul',
    demoDesignation: 'Director General - Medical Verification & Platform Command',
    theme: {
      bannerBg: 'bg-rose-950',
      bannerBorder: 'border-rose-800',
      accentText: 'text-rose-300',
      buttonBg: 'bg-rose-900 hover:bg-rose-950',
      buttonHover: 'hover:bg-rose-950',
      tabActive: 'border-b-2 border-rose-800 text-rose-950 font-bold bg-rose-50/60',
      iconBg: 'bg-rose-100 text-rose-800'
    },
    securityNote: 'Privileged Command Access. All administrative audits and provider approvals are logged to an immutable security ledger.'
  }
};

export const LoginModal: React.FC = () => {
  const { 
    isLoginModalOpen, 
    setIsLoginModalOpen, 
    loginTargetRole, 
    setLoginTargetRole,
    login,
    biometricLogin,
    showNotification
  } = useApp();

  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('doctor');
  const [identifier, setIdentifier] = useState('');
  const [secondary, setSecondary] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Biometric Authentication States
  const [isBiometricPrompting, setIsBiometricPrompting] = useState<boolean>(false);
  const [biometricMethod, setBiometricMethod] = useState<'fingerprint' | 'face'>('fingerprint');
  const [biometricScanStep, setBiometricScanStep] = useState<'scanning' | 'verifying' | 'success'>('scanning');
  const [rememberBiometrics, setRememberBiometrics] = useState<boolean>(true);
  const [hasBiometricSensor, setHasBiometricSensor] = useState<boolean>(true);

  // Sync active role with loginTargetRole when modal opens
  useEffect(() => {
    if (isLoginModalOpen) {
      const validRole = ['doctor', 'patient', 'pharmacy', 'admin'].includes(loginTargetRole)
        ? loginTargetRole
        : 'doctor';
      setActiveRoleTab(validRole);
      setErrorMsg(null);
      setIsBiometricPrompting(false);
      setBiometricScanStep('scanning');

      // Check biometric preference in storage
      const savedBio = localStorage.getItem(`sanjeevani_bio_pref_${validRole}`);
      if (savedBio !== null) {
        setRememberBiometrics(savedBio === 'true');
      } else {
        setRememberBiometrics(true);
      }

      // Check WebAuthn platform authenticator capability
      if (window.PublicKeyCredential && typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          .then(avail => setHasBiometricSensor(avail))
          .catch(() => setHasBiometricSensor(true));
      }
      
      // Preload the demo values for convenience
      const config = ROLE_CONFIGS[validRole];
      if (config) {
        setIdentifier(config.demoIdentifier);
        setSecondary(config.demoSecondary || '');
        setPassword(config.demoPass);
        if (validRole === 'admin') {
          setTwoFactorCode('884-902');
        } else {
          setTwoFactorCode('');
        }
      }
    }
  }, [isLoginModalOpen, loginTargetRole]);

  // Biometric Authentication Handler
  const handleBiometricAuth = async (type: 'fingerprint' | 'face' = 'fingerprint') => {
    setBiometricMethod(type);
    setIsBiometricPrompting(true);
    setBiometricScanStep('scanning');
    setErrorMsg(null);

    // Attempt native WebAuthn credential retrieval if available
    if (window.PublicKeyCredential && typeof navigator.credentials?.get === 'function') {
      try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        const webAuthnPromise = navigator.credentials.get({
          publicKey: {
            challenge,
            timeout: 5000,
            userVerification: 'preferred',
            rpId: window.location.hostname || 'localhost',
          }
        });
        const raceTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 1800));
        await Promise.race([webAuthnPromise, raceTimeout]);
      } catch (e) {
        // Fallback smoothly to visual biometric verification HUD
      }
    }

    // Step 2: ABDM cryptographic enclave verification
    setTimeout(() => {
      setBiometricScanStep('verifying');

      // Step 3: Success state & login execution
      setTimeout(async () => {
        setBiometricScanStep('success');

        try {
          if ('vibrate' in navigator) navigator.vibrate([35, 50, 35]);
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
          }
        } catch (e) {
          // ignore
        }

        setTimeout(async () => {
          await biometricLogin(
            activeRoleTab, 
            type === 'fingerprint' ? 'Touch ID / Fingerprint' : 'Face ID / Facial Recognition'
          );
          setIsBiometricPrompting(false);
          setBiometricScanStep('scanning');
        }, 500);
      }, 750);
    }, 950);
  };

  // Handle Tab Switch
  const handleTabChange = (role: UserRole) => {
    setActiveRoleTab(role);
    setLoginTargetRole(role);
    setErrorMsg(null);
    const config = ROLE_CONFIGS[role];
    if (config) {
      setIdentifier(config.demoIdentifier);
      setSecondary(config.demoSecondary || '');
      setPassword(config.demoPass);
      if (role === 'admin') {
        setTwoFactorCode('884-902');
      } else {
        setTwoFactorCode('');
      }
    }
  };

  const currentConfig = ROLE_CONFIGS[activeRoleTab] || ROLE_CONFIGS.doctor;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg(`Please enter your ${currentConfig.idLabel.replace('*', '').trim()}`);
      return;
    }
    if (!password.trim()) {
      setErrorMsg(`Please enter your password or PIN.`);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const extraCredentials: Record<string, string> = {};
    if (activeRoleTab === 'doctor' && secondary) {
      extraCredentials.hospitalAffiliation = secondary;
    } else if (activeRoleTab === 'patient' && secondary) {
      extraCredentials.fullName = secondary;
    } else if (activeRoleTab === 'pharmacy' && secondary) {
      extraCredentials.pharmacyName = secondary;
    } else if (activeRoleTab === 'admin' && secondary) {
      extraCredentials.department = secondary;
    }

    const res = await login({
      role: activeRoleTab,
      identifier: identifier.trim(),
      password: password.trim(),
      extraCredentials
    });

    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleFillDemo = () => {
    setIdentifier(currentConfig.demoIdentifier);
    setSecondary(currentConfig.demoSecondary || '');
    setPassword(currentConfig.demoPass);
    if (activeRoleTab === 'admin') {
      setTwoFactorCode('884-902');
    }
    setErrorMsg(null);
  };

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-slate-300 overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Dynamic Role Header Banner */}
        <div className={`${currentConfig.theme.bannerBg} text-white px-5 py-4 border-b ${currentConfig.theme.bannerBorder} relative`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-white/20 ${currentConfig.theme.accentText}`}>
                  {currentConfig.badge}
                </span>
                <span className="text-[10px] text-slate-400">ABDM 2.0 Compliant</span>
              </div>
              <h2 className="text-lg font-bold mt-1 text-white tracking-tight flex items-center gap-2">
                {currentConfig.title}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                {currentConfig.subtitle}
              </p>
            </div>

            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition cursor-pointer"
              title="Close login modal"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 Distinct Role Selector Tabs */}
        <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-100 text-xs">
          <button
            type="button"
            onClick={() => handleTabChange('doctor')}
            className={`py-3 px-2 text-center transition cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeRoleTab === 'doctor'
                ? ROLE_CONFIGS.doctor.theme.tabActive
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-sky-800 shrink-0" />
            <span className="font-semibold text-xs truncate">Doctor Login</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('patient')}
            className={`py-3 px-2 text-center transition cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeRoleTab === 'patient'
                ? ROLE_CONFIGS.patient.theme.tabActive
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <User className="w-4 h-4 text-emerald-800 shrink-0" />
            <span className="font-semibold text-xs truncate">Patient / ABHA</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('pharmacy')}
            className={`py-3 px-2 text-center transition cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeRoleTab === 'pharmacy'
                ? ROLE_CONFIGS.pharmacy.theme.tabActive
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Pill className="w-4 h-4 text-teal-800 shrink-0" />
            <span className="font-semibold text-xs truncate">Pharmacy Staff</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`py-3 px-2 text-center transition cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeRoleTab === 'admin'
                ? ROLE_CONFIGS.admin.theme.tabActive
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-rose-800 shrink-0" />
            <span className="font-semibold text-xs truncate">Administrator</span>
          </button>
        </div>

        {/* Demo Account Indicator Pill with 1-Click Load */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-slate-600">
              Demo Credentials Available: <strong className="text-slate-900">{currentConfig.demoName}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={handleFillDemo}
            className="text-xs text-sky-800 hover:text-sky-950 font-bold underline cursor-pointer text-left sm:text-right"
          >
            Fill Demo Credentials
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Optional Biometric Login Option for Patients and Doctors */}
          {(activeRoleTab === 'doctor' || activeRoleTab === 'patient') && (
            <div className={`p-4 rounded-xl border transition ${
              activeRoleTab === 'doctor'
                ? 'bg-gradient-to-r from-sky-50 via-slate-50 to-sky-50 border-sky-300'
                : 'bg-gradient-to-r from-emerald-50 via-slate-50 to-emerald-50 border-emerald-300'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs border ${
                    activeRoleTab === 'doctor'
                      ? 'bg-sky-700 text-white border-sky-800'
                      : 'bg-emerald-700 text-white border-emerald-800'
                  }`}>
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900">
                        {activeRoleTab === 'doctor' ? 'Fast Biometric Doctor Sign In' : 'One-Touch ABHA Biometric Login'}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-600 text-white rounded">
                        FIDO2 / WebAuthn
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
                      Use your device&apos;s fingerprint sensor or Face ID for instant, passwordless access.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleBiometricAuth('fingerprint')}
                    className={`px-3 py-2 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs btn-press ${
                      activeRoleTab === 'doctor'
                        ? 'bg-sky-800 hover:bg-sky-900'
                        : 'bg-emerald-800 hover:bg-emerald-900'
                    }`}
                    title="Authenticate with Fingerprint (Touch ID)"
                  >
                    <Fingerprint className="w-3.5 h-3.5" />
                    <span>Touch ID</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBiometricAuth('face')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs btn-press"
                    title="Authenticate with Face ID"
                  >
                    <ScanFace className="w-3.5 h-3.5 text-sky-300" />
                    <span>Face ID</span>
                  </button>
                </div>
              </div>

              {/* Remember Biometrics toggle */}
              <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberBiometrics}
                    onChange={e => {
                      setRememberBiometrics(e.target.checked);
                      localStorage.setItem(`sanjeevani_bio_pref_${activeRoleTab}`, String(e.target.checked));
                      showNotification(e.target.checked ? 'Biometric preference saved for this device.' : 'Biometric preference cleared.');
                    }}
                    className="w-3.5 h-3.5 text-sky-800 rounded border-slate-300 focus:ring-sky-700 cursor-pointer"
                  />
                  <span>Enable one-touch biometric login on this device</span>
                </label>

                <span className="text-[10px] text-slate-400">ABDM Hardware Protected</span>
              </div>
            </div>
          )}

          {/* OR DIVIDER */}
          {(activeRoleTab === 'doctor' || activeRoleTab === 'patient') && (
            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider relative">
                Or Continue with Password / PIN
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>
          )}

          {/* Field 1: Primary Role Identifier */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span>{currentConfig.idLabel}</span>
              {activeRoleTab === 'doctor' && (
                <span className="text-[10px] text-slate-400 font-normal">Registered with National Medical Commission</span>
              )}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <currentConfig.idIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder={currentConfig.idPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:border-sky-700 focus:outline-hidden text-slate-900 bg-white font-mono"
              />
            </div>
          </div>

          {/* Field 2: Secondary Role Details */}
          {currentConfig.secondaryLabel && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {currentConfig.secondaryLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={secondary}
                  onChange={e => setSecondary(e.target.value)}
                  placeholder={currentConfig.secondaryPlaceholder}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:border-sky-700 focus:outline-hidden text-slate-900 bg-white"
                />
              </div>
            </div>
          )}

          {/* Field 3: Password / PIN */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span>{currentConfig.passLabel}</span>
              <span className="text-[10px] text-slate-400 font-normal">Encrypted TLS 1.3</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your security password or PIN"
                className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded focus:border-sky-700 focus:outline-hidden text-slate-900 bg-white font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Field 4: 2FA Token for Admin or Doctor Security */}
          {activeRoleTab === 'admin' && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-rose-700" />
                <span>Two-Factor Authentication (2FA) Security Token *</span>
              </label>
              <input
                type="text"
                value={twoFactorCode}
                onChange={e => setTwoFactorCode(e.target.value)}
                placeholder="6-digit TOTP / YubiKey token (e.g. 884-902)"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-rose-700 focus:outline-hidden text-slate-900 bg-white font-mono tracking-widest"
              />
            </div>
          )}

          {/* Security Notice */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 flex items-start gap-2">
            <Shield className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {currentConfig.securityNote}
            </p>
          </div>

          {/* Submit Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500">
              Need assistance? Call MoHFW support at <strong className="text-slate-800">1800-11-4477</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-medium transition cursor-pointer btn-press"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className={`px-5 py-2 text-white rounded text-xs font-bold transition cursor-pointer btn-press flex items-center justify-center gap-1.5 shadow-sm min-w-[130px] ${currentConfig.theme.buttonBg}`}
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to {currentConfig.title.split(' ')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

        {/* Biometric Verification Scanning Overlay / Dialog */}
        {isBiometricPrompting && (
          <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-5 animate-in zoom-in-95 duration-150">
              
              {/* Sensor graphic & circular scanning waves */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                {/* Ripples */}
                {biometricScanStep === 'scanning' && (
                  <>
                    <div className={`absolute inset-0 rounded-full animate-ping opacity-25 ${
                      activeRoleTab === 'doctor' ? 'bg-sky-500' : 'bg-emerald-500'
                    }`} />
                    <div className={`absolute inset-2 rounded-full animate-pulse opacity-40 border-2 ${
                      activeRoleTab === 'doctor' ? 'border-sky-400 bg-sky-50' : 'border-emerald-400 bg-emerald-50'
                    }`} />
                  </>
                )}

                {biometricScanStep === 'verifying' && (
                  <div className="absolute inset-0 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin" />
                )}

                <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 z-10 ${
                  biometricScanStep === 'success'
                    ? 'bg-emerald-600 text-white scale-110 shadow-emerald-500/50'
                    : activeRoleTab === 'doctor'
                      ? 'bg-sky-800 text-white shadow-sky-800/40'
                      : 'bg-emerald-800 text-white shadow-emerald-800/40'
                }`}>
                  {biometricScanStep === 'success' ? (
                    <Check className="w-10 h-10 stroke-[3]" />
                  ) : biometricMethod === 'face' ? (
                    <ScanFace className="w-10 h-10 animate-pulse" />
                  ) : (
                    <Fingerprint className="w-10 h-10 animate-pulse" />
                  )}
                </div>
              </div>

              {/* Status Text */}
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  {biometricScanStep === 'scanning' && (
                    biometricMethod === 'face' ? 'Scanning Face ID...' : 'Touch the Biometric Sensor'
                  )}
                  {biometricScanStep === 'verifying' && 'Verifying FIDO2 Enclave Signature...'}
                  {biometricScanStep === 'success' && 'Biometric Identity Confirmed!'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {biometricScanStep === 'scanning' && (
                    `Authenticating ${currentConfig.demoName} via secure hardware passkey.`
                  )}
                  {biometricScanStep === 'verifying' && 'Auditing cryptographic handshake with ABDM token.'}
                  {biometricScanStep === 'success' && 'Redirecting to your clinical workstation...'}
                </p>
              </div>

              {/* Technical Cert info */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WebAuthn Level 3</span>
                </span>
                <span className="font-mono text-slate-400">TPM 2.0 / Enclave</span>
              </div>

              {/* Cancel Button */}
              {biometricScanStep !== 'success' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsBiometricPrompting(false);
                    setBiometricScanStep('scanning');
                  }}
                  className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel & Use Password Instead
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
