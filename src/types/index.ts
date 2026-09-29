export type UserRole = 'patient' | 'doctor' | 'hospital' | 'pharmacy' | 'laboratory' | 'admin';

export type IndianLanguage = 
  | 'en' // English
  | 'hi' // Hindi (हिंदी)
  | 'bn' // Bengali (বাংলা)
  | 'ta' // Tamil (தமிழ்)
  | 'te' // Telugu (తెలుగు)
  | 'mr' // Marathi (मराठी)
  | 'gu' // Gujarati (ગુજરાતી)
  | 'kn' // Kannada (ಕನ್ನಡ)
  | 'ml' // Malayalam (മലയാളം)
  | 'pa' // Punjabi (ਪੰਜਾਬੀ)
  | 'or' // Odia (ଓଡ଼ିଆ)
  | 'as' // Assamese (অসমীয়া)
  | 'ur'; // Urdu (اردو)

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface FamilyMember {
  id: string;
  fullName: string;
  relation: 'Self' | 'Spouse' | 'Parent' | 'Child' | 'Elderly Dependent' | 'Sibling';
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: BloodGroup;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: UserRole;
  location: {
    state: string;
    district: string;
    city: string;
    pincode: string;
    address: string;
    lat?: number;
    lng?: number;
  };
  abhaId?: string; // Ayushman Bharat Health Account ID (ABHA)
  dependents: FamilyMember[];
}

export interface Doctor {
  id: string;
  fullName: string;
  registrationNumber: string; // e.g. MCI-2015-99238
  medicalCouncil: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  languages: string[];
  consultationFee: number;
  rating: number;
  reviewsCount: number;
  hospitalAffiliation: string;
  city: string;
  state: string;
  pincode: string;
  isVerified: boolean;
  availableDays: string[];
  opdTimings: string;
  teleconsultationAvailable: boolean;
  inPersonAvailable: boolean;
  profileImage?: string;
  about: string;
}

export interface Hospital {
  id: string;
  name: string;
  type: 'Government' | 'Private' | 'Trust / Non-Profit';
  departments: string[];
  city: string;
  state: string;
  pincode: string;
  address: string;
  phone: string;
  emergencyPhone: string;
  isVerified: boolean;
  accreditation: 'NABH' | 'NABL' | 'JCI' | 'State Certified';
  beds: {
    total: number;
    availableGeneral: number;
    availableIcu: number;
    availableVentilators: number;
  };
  oxygenPlantCapacity: string;
  has24x7Emergency: boolean;
  ambulanceStandbyCount: number;
  empanelledSchemes: string[]; // e.g. PM-JAY, CGHS, ECHS
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  hospitalName: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  date: string;
  timeSlot: string;
  type: 'in-person' | 'telemedicine';
  status: 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  symptoms: string;
  fee: number;
  paymentStatus: 'paid' | 'pay_at_clinic';
  paymentMethod?: 'UPI' | 'Card' | 'Cash at OPD';
  qrVerificationCode: string;
  clinicalNotes?: string;
  createdDate: string;
}

export interface MedicineItem {
  id: string;
  brandName: string;
  genericName: string;
  dosageForm: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Inhaler' | 'Ointment';
  strength: string;
  brandPrice: number;
  janAushadhiPrice: number; // Generic subsidized price
  savingsPercentage: number;
  category: string;
  prescriptionRequired: boolean;
  inStock: boolean;
}

export interface Pharmacy {
  id: string;
  name: string;
  licenseNumber: string;
  isJanAushadhiKendra: boolean; // PMBJP government outlet
  isVerified: boolean;
  city: string;
  state: string;
  pincode: string;
  address: string;
  phone: string;
  open24Hours: boolean;
  homeDelivery: boolean;
  catalogsCount: number;
}

export interface DiagnosticTest {
  id: string;
  name: string;
  category: 'Pathology' | 'Radiology' | 'Cardiology' | 'Diabetes' | 'Preventive Packages';
  marketPrice: number;
  subsidizedPrice: number;
  fastingHoursRequired: number;
  turnaroundTime: string;
  sampleType: string;
  description: string;
}

export interface DiagnosticLab {
  id: string;
  name: string;
  accreditation: 'NABL Certified' | 'ISO Certified' | 'Government Approved';
  isVerified: boolean;
  city: string;
  state: string;
  pincode: string;
  address: string;
  phone: string;
  homeSampleCollection: boolean;
  availableTests: string[];
}

export interface BloodInventory {
  id: string;
  bloodBankName: string;
  hospitalAffiliation: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  units: Record<BloodGroup, number>;
  lastUpdated: string;
  componentAvailable: ('Whole Blood' | 'Platelets' | 'Fresh Frozen Plasma' | 'PRBC')[];
}

export interface DigitalPrescription {
  id: string;
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  registrationNumber: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  date: string;
  vitals: {
    bp?: string;
    pulse?: string;
    temperature?: string;
    spO2?: string;
    weight?: string;
  };
  diagnosis: string;
  medicines: {
    medicineName: string;
    genericName: string;
    dosage: string;
    frequency: string; // e.g. 1-0-1
    timing: 'Before Food' | 'After Food' | 'At Bedtime';
    duration: string;
    instructions: string;
  }[];
  testsRecommended?: string[];
  lifestyleAdvice: string;
  followUpDate?: string;
  digitalSignature: string;
}

export interface PersonalHealthRecord {
  id: string;
  patientId: string;
  title: string;
  category: 'prescription' | 'lab_report' | 'scan_imaging' | 'discharge_summary' | 'vaccination';
  date: string;
  doctorOrLab: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  tags: string[];
  consent: {
    sharedWithDoctorId?: string;
    accessType: 'view_once' | 'during_appointment' | '30_days' | 'permanent';
    revoked: boolean;
    expiresAt?: string;
  };
  accessLogs: {
    actorName: string;
    actorRole: string;
    accessedAt: string;
    action: string;
  }[];
}

export interface MedicationReminder {
  id: string;
  userId: string;
  medicineName: string;
  dosage: string;
  scheduledTimes: string[]; // e.g. ["08:00", "20:00"]
  instructions: string;
  active: boolean;
  takenHistory: Record<string, boolean>; // e.g. "2026-09-29-08:00": true
}

export interface GovernmentHealthScheme {
  id: string;
  title: string;
  shortCode: string;
  ministry: string;
  coverageAmount: string;
  eligibilityDescription: string;
  benefits: string[];
  howToApply: string;
  helpline: string;
  officialPortal: string;
  lastVerifiedDate: string;
  sourceAuthority: string;
}

export interface EmergencyGuide {
  id: string;
  title: string;
  urgentSigns: string[];
  firstAidSteps: string[];
  whatNotToDo: string[];
  callHotline: string;
}
