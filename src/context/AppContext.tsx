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
  
  // Actions
  setLanguage: (lang: IndianLanguage) => void;
  setActiveTab: (tab: NavigationTab) => void;
  setLowBandwidth: (val: boolean) => void;
  setHighContrast: (val: boolean) => void;
  setTextSize: (size: TextSize) => void;
  setIsEmergencyModalOpen: (open: boolean) => void;
  setSelectedDoctorForBooking: (doc: Doctor | null) => void;
  setActiveTeleconsultationAppointment: (apt: Appointment | null) => void;
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
      selectedDoctorForBooking,
      activeTeleconsultationAppointment,
      notificationMessage,
      setLanguage,
      setActiveTab,
      setLowBandwidth,
      setHighContrast,
      setTextSize,
      setIsEmergencyModalOpen,
      setSelectedDoctorForBooking,
      setActiveTeleconsultationAppointment,
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
