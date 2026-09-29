import { 
  UserProfile, 
  Doctor, 
  Hospital, 
  Appointment, 
  PersonalHealthRecord, 
  DigitalPrescription, 
  Pharmacy, 
  MedicineItem, 
  DiagnosticLab, 
  DiagnosticTest, 
  BloodInventory, 
  GovernmentHealthScheme, 
  EmergencyGuide, 
  MedicationReminder,
  UserRole
} from '../types';

const BASE_URL = '/api';

export const api = {
  // Auth & Profile
  async getMe(): Promise<{ success: boolean; user: UserProfile }> {
    const res = await fetch(`${BASE_URL}/auth/me`);
    return res.json();
  },

  async switchRole(role: UserRole): Promise<{ success: boolean; user: UserProfile }> {
    const res = await fetch(`${BASE_URL}/auth/switch-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    return res.json();
  },

  async updateLocation(locationData: Partial<UserProfile['location']>): Promise<any> {
    const res = await fetch(`${BASE_URL}/auth/update-location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(locationData),
    });
    return res.json();
  },

  async addDependent(dependent: any): Promise<any> {
    const res = await fetch(`${BASE_URL}/auth/dependents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dependent),
    });
    return res.json();
  },

  // Doctors
  async getDoctors(params?: { query?: string; specialty?: string; city?: string; teleconsultation?: boolean; verified?: boolean }): Promise<{ success: boolean; doctors: Doctor[] }> {
    const query = new URLSearchParams();
    if (params?.query) query.append('query', params.query);
    if (params?.specialty) query.append('specialty', params.specialty);
    if (params?.city) query.append('city', params.city);
    if (params?.teleconsultation) query.append('teleconsultation', 'true');
    if (params?.verified) query.append('verified', 'true');
    
    const res = await fetch(`${BASE_URL}/doctors?${query.toString()}`);
    return res.json();
  },

  async getDoctorById(id: string): Promise<{ success: boolean; doctor: Doctor }> {
    const res = await fetch(`${BASE_URL}/doctors/${id}`);
    return res.json();
  },

  // Hospitals
  async getHospitals(params?: { query?: string; city?: string; emergencyOnly?: boolean; type?: string }): Promise<{ success: boolean; hospitals: Hospital[] }> {
    const query = new URLSearchParams();
    if (params?.query) query.append('query', params.query);
    if (params?.city) query.append('city', params.city);
    if (params?.emergencyOnly) query.append('emergencyOnly', 'true');
    if (params?.type) query.append('type', params.type);

    const res = await fetch(`${BASE_URL}/hospitals?${query.toString()}`);
    return res.json();
  },

  // Appointments
  async getAppointments(role?: string): Promise<{ success: boolean; appointments: Appointment[] }> {
    const q = role ? `?role=${role}` : '';
    const res = await fetch(`${BASE_URL}/appointments${q}`);
    return res.json();
  },

  async bookAppointment(data: Partial<Appointment>): Promise<{ success: boolean; appointment?: Appointment; message?: string }> {
    const res = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateAppointmentStatus(id: string, status: string, clinicalNotes?: string): Promise<{ success: boolean; appointment: Appointment }> {
    const res = await fetch(`${BASE_URL}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, clinicalNotes }),
    });
    return res.json();
  },

  // Digital Prescriptions
  async getPrescriptions(): Promise<{ success: boolean; prescriptions: DigitalPrescription[] }> {
    const res = await fetch(`${BASE_URL}/prescriptions`);
    return res.json();
  },

  async createPrescription(data: Partial<DigitalPrescription>): Promise<{ success: boolean; prescription: DigitalPrescription }> {
    const res = await fetch(`${BASE_URL}/prescriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Personal Health Records (PHR)
  async getRecords(): Promise<{ success: boolean; records: PersonalHealthRecord[] }> {
    const res = await fetch(`${BASE_URL}/records`);
    return res.json();
  },

  async uploadRecord(recordData: Partial<PersonalHealthRecord> & { consentType?: string }): Promise<{ success: boolean; record: PersonalHealthRecord }> {
    const res = await fetch(`${BASE_URL}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recordData),
    });
    return res.json();
  },

  async updateRecordConsent(id: string, consentData: { revoked?: boolean; accessType?: string }): Promise<{ success: boolean; record: PersonalHealthRecord }> {
    const res = await fetch(`${BASE_URL}/records/${id}/consent`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consentData),
    });
    return res.json();
  },

  // Emergency Assistance
  async broadcastEmergency(data: { coordinates?: { lat: number; lng: number }; address?: string; emergencyType?: string; bloodGroup?: string }): Promise<any> {
    const res = await fetch(`${BASE_URL}/emergency/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getEmergencyGuides(): Promise<{ success: boolean; guides: EmergencyGuide[] }> {
    const res = await fetch(`${BASE_URL}/emergency/guides`);
    return res.json();
  },

  // Pharmacies & Medicines
  async getPharmacies(params?: { city?: string; janAushadhiOnly?: boolean }): Promise<{ success: boolean; pharmacies: Pharmacy[] }> {
    const query = new URLSearchParams();
    if (params?.city) query.append('city', params.city);
    if (params?.janAushadhiOnly) query.append('janAushadhiOnly', 'true');
    const res = await fetch(`${BASE_URL}/pharmacies?${query.toString()}`);
    return res.json();
  },

  async getMedicines(params?: { search?: string; category?: string }): Promise<{ success: boolean; medicines: MedicineItem[] }> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    const res = await fetch(`${BASE_URL}/medicines?${query.toString()}`);
    return res.json();
  },

  // Labs & Diagnostics
  async getLabs(): Promise<{ success: boolean; labs: DiagnosticLab[]; tests: DiagnosticTest[] }> {
    const res = await fetch(`${BASE_URL}/labs`);
    return res.json();
  },

  // Blood Banks
  async getBloodBanks(params?: { city?: string; group?: string }): Promise<{ success: boolean; bloodBanks: BloodInventory[] }> {
    const query = new URLSearchParams();
    if (params?.city) query.append('city', params.city);
    if (params?.group) query.append('group', params.group);
    const res = await fetch(`${BASE_URL}/blood-banks?${query.toString()}`);
    return res.json();
  },

  // Government Schemes
  async getGovernmentSchemes(): Promise<{ success: boolean; schemes: GovernmentHealthScheme[] }> {
    const res = await fetch(`${BASE_URL}/government-schemes`);
    return res.json();
  },

  // Medication Reminders
  async getReminders(): Promise<{ success: boolean; reminders: MedicationReminder[] }> {
    const res = await fetch(`${BASE_URL}/reminders`);
    return res.json();
  },

  async addReminder(data: { medicineName: string; dosage: string; scheduledTimes: string[]; instructions: string }): Promise<{ success: boolean; reminder: MedicationReminder }> {
    const res = await fetch(`${BASE_URL}/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async toggleReminderTaken(id: string, timeSlotKey: string): Promise<{ success: boolean; reminder: MedicationReminder }> {
    const res = await fetch(`${BASE_URL}/reminders/${id}/toggle-taken`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeSlotKey }),
    });
    return res.json();
  },

  // Admin
  async getAdminOverview(): Promise<{ success: boolean; metrics: any; auditLogs: any[] }> {
    const res = await fetch(`${BASE_URL}/admin/overview`);
    return res.json();
  },

  async verifyDoctor(doctorId: string, verified: boolean): Promise<any> {
    const res = await fetch(`${BASE_URL}/admin/verify-doctor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorId, verified }),
    });
    return res.json();
  },

  // AI HealthGuide
  async askHealthGuide(message: string, history?: { role: 'user' | 'model'; text: string }[]): Promise<{
    success: boolean;
    response: string;
    isUrgentWarning: boolean;
    recommendedSpecialty: string;
    emergencyNumbers: string[];
  }> {
    const res = await fetch(`${BASE_URL}/ai/healthguide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    return res.json();
  },
};
