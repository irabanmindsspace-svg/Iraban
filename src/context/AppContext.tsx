import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole, IndianLanguage, Doctor, Hospital, Appointment } from '../types';
import { TRANSLATIONS, LocaleStrings } from '../locales/translations';
import { api } from '../services/api';

export type NavigationTab = 
  | 'home'
  | 'doctors'
  | 'hospitals'
  | 'appointments'
  | 'telemedicine'
  | 'pharmacy'
  | 'labs'
  | 'blood'
  | 'records'
  | 'insurance'
  | 'reminders'
  | 'schemes'
  | 'healthguide'
  | 'doctor_portal'
  | 'hospital_portal'
  | 'pharmacy_portal'
  | 'admin_portal';

export type TextSize = 'normal' | 'large' | 'xlarge';

interface AppContextType {
  user: UserProfile | null;
  activeRole: UserRole;
  language: IndianLanguage;
  t: LocaleStrings;
  activeTab: NavigationTab;
  lowBandwidth: boolean;
  highContrast: boolean;
  textSize: TextSize;
  isEmergencyModalOpen: boolean;
  selectedDoctorForBooking: Doctor | null;
  activeTeleconsultationAppointment: Appointment | null;
  notificationMessage: string | null;
  isLoginModalOpen: boolean;
  loginTargetRole: UserRole;
  isQrScannerOpen: boolean;
  qrScannerScope: 'all' | 'prescription' | 'patient_records';
  
  // Actions
  setLanguage: (lang: IndianLanguage) => void;
  setActiveTab: (tab: NavigationTab) => void;
  setLowBandwidth: (val: boolean) => void;
  setHighContrast: (val: boolean) => void;
  setTextSize: (size: TextSize) => void;
  setIsEmergencyModalOpen: (open: boolean) => void;
  setIsLoginModalOpen: (open: boolean) => void;
  setLoginTargetRole: (role: UserRole) => void;
  openLoginForRole: (role: UserRole) => void;
  setIsQrScannerOpen: (open: boolean) => void;
  openQrScanner: (scope?: 'all' | 'prescription' | 'patient_records') => void;
  setSelectedDoctorForBooking: (doc: Doctor | null) => void;
  setActiveTeleconsultationAppointment: (apt: Appointment | null) => void;
  login: (credentials: { role: UserRole; identifier?: string; password?: string; extraCredentials?: Record<string, string> }) => Promise<{ success: boolean; message?: string }>;
  biometricLogin: (role: UserRole, biometricType?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  updateLocation: (loc: Partial<UserProfile['location']>) => Promise<void>;
  showNotification: (msg: string) => void;
  refreshUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('patient');
  const [language, setLanguageState] = useState<IndianLanguage>('en');
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [lowBandwidth, setLowBandwidthState] = useState<boolean>(false);
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [textSize, setTextSizeState] = useState<TextSize>('normal');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginTargetRole, setLoginTargetRole] = useState<UserRole>('doctor');
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);
  const [qrScannerScope, setQrScannerScope] = useState<'all' | 'prescription' | 'patient_records'>('all');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);
  const [activeTeleconsultationAppointment, setActiveTeleconsultationAppointment] = useState<Appointment | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  // Initialize
  useEffect(() => {
    // Load saved preferences if any
    const savedLang = localStorage.getItem('sanjeevani_lang') as IndianLanguage;
    if (savedLang && TRANSLATIONS[savedLang]) {
      setLanguageState(savedLang);
    }
    const savedLowBW = localStorage.getItem('sanjeevani_lowbw');
    if (savedLowBW) setLowBandwidthState(savedLowBW === 'true');

    const savedHC = localStorage.getItem('sanjeevani_hc');
    if (savedHC) setHighContrastState(savedHC === 'true');

    const savedTextSize = localStorage.getItem('sanjeevani_textsize') as TextSize;
    if (savedTextSize) setTextSizeState(savedTextSize);

    // Fetch current user from backend
    api.getMe().then(res => {
      if (res.success && res.user) {
        setUser(res.user);
        setActiveRole(res.user.role);
      }
    }).catch(err => console.error('Error fetching user profile:', err));
  }, []);

  const setLanguage = (lang: IndianLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('sanjeevani_lang', lang);
  };

  const setLowBandwidth = (val: boolean) => {
    setLowBandwidthState(val);
    localStorage.setItem('sanjeevani_lowbw', String(val));
    showNotification(val ? 'Low-Bandwidth (2G Data Saver) Mode Activated' : 'Standard High-Speed Mode Restored');
  };

  const setHighContrast = (val: boolean) => {
    setHighContrastState(val);
    localStorage.setItem('sanjeevani_hc', String(val));
  };

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
    localStorage.setItem('sanjeevani_textsize', size);
  };

  const openLoginForRole = (role: UserRole) => {
    setLoginTargetRole(role);
    setIsLoginModalOpen(true);
  };

  const openQrScanner = (scope: 'all' | 'prescription' | 'patient_records' = 'all') => {
    setQrScannerScope(scope);
    setIsQrScannerOpen(true);
  };

  const login = async (credentials: {
    role: UserRole;
    identifier?: string;
    password?: string;
    extraCredentials?: Record<string, string>;
  }) => {
    try {
      const res = await api.login(credentials);
      if (res.success && res.user) {
        setUser(res.user);
        setActiveRole(credentials.role);
        setIsLoginModalOpen(false);

        // Route to respective role portal
        if (credentials.role === 'doctor') setActiveTab('doctor_portal');
        else if (credentials.role === 'pharmacy') setActiveTab('pharmacy_portal');
        else if (credentials.role === 'admin') setActiveTab('admin_portal');
        else if (credentials.role === 'hospital') setActiveTab('hospital_portal');
        else setActiveTab('home');

        showNotification(res.message || `Welcome, ${res.user.fullName}!`);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, message: err.message || 'Network error during login' };
    }
  };

  const biometricLogin = async (role: UserRole, biometricType: string = 'Touch ID / Face ID') => {
    try {
      const res = await api.biometricLogin({ 
        role, 
        biometricType, 
        credentialId: `fido2_${role}_${Date.now()}` 
      });
      if (res.success && res.user) {
        setUser(res.user);
        setActiveRole(role);
        setIsLoginModalOpen(false);

        if (role === 'doctor') setActiveTab('doctor_portal');
        else if (role === 'patient') setActiveTab('home');

        showNotification(res.message || `Biometric authentication verified for ${res.user.fullName}.`);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Biometric authentication failed' };
    } catch (err: any) {
      console.error('Biometric authentication error:', err);
      return { success: false, message: err.message || 'Biometric sensor error' };
    }
  };

  const logout = async () => {
    try {
      const res = await api.logout();
      if (res.success && res.user) {
        setUser(res.user);
        setActiveRole('patient');
        setActiveTab('home');
        showNotification('You have logged out. Returned to Public Patient Portal.');
      }
    } catch (err) {
      console.error('Logout error:', err);
      // Fallback reset
      setActiveRole('patient');
      setActiveTab('home');
    }
  };

  const switchRole = async (role: UserRole) => {
    try {
      const res = await api.switchRole(role);
      if (res.success) {
        setUser(res.user);
        setActiveRole(role);
        // Route to respective portal if not patient
        if (role === 'doctor') setActiveTab('doctor_portal');
        else if (role === 'hospital') setActiveTab('hospital_portal');
        else if (role === 'pharmacy') setActiveTab('pharmacy_portal');
        else if (role === 'admin') setActiveTab('admin_portal');
        else setActiveTab('home');

        showNotification(`Switched to ${role.toUpperCase()} Portal View`);
      }
    } catch (e) {
      console.error('Role switch failed:', e);
    }
  };

  const updateLocation = async (loc: Partial<UserProfile['location']>) => {
    try {
      const res = await api.updateLocation(loc);
      if (res.success) {
        setUser(prev => prev ? { ...prev, location: { ...prev.location, ...loc } } : prev);
        showNotification(`Location updated to ${loc.city || loc.state}`);
      }
    } catch (e) {
      console.error('Location update error:', e);
    }
  };

  const showNotification = (msg: string) => {
    setNotificationMessage(msg);
    setTimeout(() => {
      setNotificationMessage(null);
    }, 4000);
  };

  const refreshUser = async () => {
    const res = await api.getMe();
    if (res.success && res.user) {
      setUser(res.user);
    }
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <AppContext.Provider value={{
      user,
      activeRole,
      language,
      t,
      activeTab,
      lowBandwidth,
      highContrast,
      textSize,
      isEmergencyModalOpen,
      isLoginModalOpen,
      loginTargetRole,
      isQrScannerOpen,
      qrScannerScope,
      selectedDoctorForBooking,
      activeTeleconsultationAppointment,
      notificationMessage,
      setLanguage,
      setActiveTab,
      setLowBandwidth,
      setHighContrast,
      setTextSize,
      setIsEmergencyModalOpen,
      setIsLoginModalOpen,
      setLoginTargetRole,
      openLoginForRole,
      setIsQrScannerOpen,
      openQrScanner,
      setSelectedDoctorForBooking,
      setActiveTeleconsultationAppointment,
      login,
      biometricLogin,
      logout,
      switchRole,
      updateLocation,
      showNotification,
      refreshUser,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
