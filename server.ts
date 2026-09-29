import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { 
  INITIAL_USER, 
  INITIAL_DOCTORS, 
  INITIAL_HOSPITALS, 
  INITIAL_MEDICINES, 
  INITIAL_PHARMACIES, 
  INITIAL_DIAGNOSTIC_TESTS, 
  INITIAL_DIAGNOSTIC_LABS, 
  INITIAL_BLOOD_BANKS, 
  INITIAL_GOVERNMENT_SCHEMES, 
  INITIAL_EMERGENCY_GUIDES,
  INITIAL_APPOINTMENTS,
  INITIAL_HEALTH_RECORDS,
  INITIAL_REMINDERS
} from './src/data/seedData';
import { 
  Appointment, 
  Doctor, 
  Hospital, 
  PersonalHealthRecord, 
  DigitalPrescription,
  MedicationReminder,
  UserProfile,
  UserRole
} from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server-side State
let currentUser: UserProfile = { ...INITIAL_USER };
let doctors: Doctor[] = [...INITIAL_DOCTORS];
let hospitals: Hospital[] = [...INITIAL_HOSPITALS];
let appointments: Appointment[] = [...INITIAL_APPOINTMENTS];
let healthRecords: PersonalHealthRecord[] = [...INITIAL_HEALTH_RECORDS];
let reminders: MedicationReminder[] = [...INITIAL_REMINDERS];
let digitalPrescriptions: DigitalPrescription[] = [];
let emergencyDispatches: any[] = [];
let auditLogs: any[] = [
  {
    id: 'aud_1',
    actor: 'Dr. Priya Venkatesh (Doctor)',
    action: 'RECORD_VIEW',
    details: 'Viewed Lipid & HbA1c Lab Report for Rajesh Sharma',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    status: 'AUTHORIZED'
  },
  {
    id: 'aud_2',
    actor: 'Platform Administrator',
    action: 'PROVIDER_VERIFICATION',
    details: 'Verified NMC license MCI-2012-44192 for Dr. Priya Venkatesh',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    status: 'COMPLETED'
  }
];

// Initialize Google GenAI
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = geminiApiKey ? new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // CORS Middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'healthy', 
      service: 'Sanjeevani Medical Assistance Platform',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // Auth & Profile
  app.get('/api/auth/me', (req: Request, res: Response) => {
    res.json({ success: true, user: currentUser });
  });

  app.post('/api/auth/switch-role', (req: Request, res: Response) => {
    const { role } = req.body as { role: UserRole };
    if (!['patient', 'doctor', 'hospital', 'pharmacy', 'laboratory', 'admin'].includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role provided' });
      return;
    }
    currentUser.role = role;
    auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actor: currentUser.fullName,
      action: 'ROLE_SWITCH',
      details: `Switched view mode to ${role.toUpperCase()}`,
      timestamp: new Date().toISOString(),
      status: 'SUCCESS'
    });
    res.json({ success: true, user: currentUser });
  });

  app.post('/api/auth/update-location', (req: Request, res: Response) => {
    const { state, district, city, pincode, address, lat, lng } = req.body;
    currentUser.location = {
      state: state || currentUser.location.state,
      district: district || currentUser.location.district,
      city: city || currentUser.location.city,
      pincode: pincode || currentUser.location.pincode,
      address: address || currentUser.location.address,
      lat: lat || currentUser.location.lat,
      lng: lng || currentUser.location.lng,
    };
    res.json({ success: true, location: currentUser.location });
  });

  app.post('/api/auth/dependents', (req: Request, res: Response) => {
    const newDependent = {
      id: `dep_${Date.now()}`,
      ...req.body,
    };
    currentUser.dependents.push(newDependent);
    res.json({ success: true, dependents: currentUser.dependents });
  });

  // Doctors API
  app.get('/api/doctors', (req: Request, res: Response) => {
    const { query, specialty, city, teleconsultation, verified } = req.query;
    let filtered = [...doctors];

    if (query && typeof query === 'string') {
      const q = query.toLowerCase();
      filtered = filtered.filter(d => 
        d.fullName.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        d.hospitalAffiliation.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q)
      );
    }

    if (specialty && typeof specialty === 'string' && specialty !== 'all') {
      filtered = filtered.filter(d => d.specialization.toLowerCase().includes(specialty.toLowerCase()));
    }

    if (city && typeof city === 'string' && city !== 'all') {
      filtered = filtered.filter(d => d.city.toLowerCase().includes(city.toLowerCase()));
    }

    if (teleconsultation === 'true') {
      filtered = filtered.filter(d => d.teleconsultationAvailable);
    }

    if (verified === 'true') {
      filtered = filtered.filter(d => d.isVerified);
    }

    res.json({ success: true, count: filtered.length, doctors: filtered });
  });

  app.get('/api/doctors/:id', (req: Request, res: Response) => {
    const doctor = doctors.find(d => d.id === req.params.id);
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }
    res.json({ success: true, doctor });
  });

  // Hospitals API
  app.get('/api/hospitals', (req: Request, res: Response) => {
    const { query, city, emergencyOnly, type } = req.query;
    let filtered = [...hospitals];

    if (query && typeof query === 'string') {
      const q = query.toLowerCase();
      filtered = filtered.filter(h => 
        h.name.toLowerCase().includes(q) ||
        h.departments.some(dep => dep.toLowerCase().includes(q)) ||
        h.city.toLowerCase().includes(q)
      );
    }

    if (city && typeof city === 'string' && city !== 'all') {
      filtered = filtered.filter(h => h.city.toLowerCase().includes(city.toLowerCase()));
    }

    if (emergencyOnly === 'true') {
      filtered = filtered.filter(h => h.has24x7Emergency);
    }

    if (type && typeof type === 'string' && type !== 'all') {
      filtered = filtered.filter(h => h.type.toLowerCase() === type.toLowerCase());
    }

    res.json({ success: true, count: filtered.length, hospitals: filtered });
  });

  // Appointments API
  app.get('/api/appointments', (req: Request, res: Response) => {
    const { role } = req.query;
    let result = [...appointments];
    if (role === 'doctor') {
      // Return appointments assigned to doctor
      result = appointments.filter(a => a.doctorId === 'doc_1');
    }
    res.json({ success: true, count: result.length, appointments: result });
  });

  app.post('/api/appointments', (req: Request, res: Response) => {
    const { 
      doctorId, 
      patientId, 
      patientName, 
      patientAge, 
      patientGender, 
      date, 
      timeSlot, 
      type, 
      symptoms, 
      fee, 
      paymentMethod 
    } = req.body;

    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }

    // Check for double booking
    const conflict = appointments.find(a => 
      a.doctorId === doctorId && 
      a.date === date && 
      a.timeSlot === timeSlot && 
      a.status !== 'cancelled'
    );

    if (conflict) {
      res.status(409).json({ 
        success: false, 
        code: 'APPOINTMENT_SLOT_UNAVAILABLE',
        message: 'This appointment slot was just reserved by another patient. Please choose an adjacent slot.' 
      });
      return;
    }

    const appointmentId = `apt_${Date.now()}`;
    const newAppointment: Appointment = {
      id: appointmentId,
      doctorId,
      doctorName: doctor.fullName,
      doctorSpecialty: doctor.specialization,
      hospitalName: doctor.hospitalAffiliation,
      patientId: patientId || currentUser.id,
      patientName: patientName || currentUser.fullName,
      patientAge: patientAge || 35,
      patientGender: patientGender || 'Unspecified',
      date,
      timeSlot,
      type: type || 'in-person',
      status: 'confirmed',
      symptoms: symptoms || 'General Medical Consultation',
      fee: fee || doctor.consultationFee,
      paymentStatus: paymentMethod === 'Cash at OPD' ? 'pay_at_clinic' : 'paid',
      paymentMethod: paymentMethod || 'UPI',
      qrVerificationCode: `SNJ-VERIFY-${appointmentId.toUpperCase()}`,
      createdDate: new Date().toISOString().split('T')[0],
    };

    appointments.unshift(newAppointment);

    auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actor: newAppointment.patientName,
      action: 'APPOINTMENT_BOOKED',
      details: `Booked ${newAppointment.type} slot on ${date} with ${doctor.fullName}`,
      timestamp: new Date().toISOString(),
      status: 'CONFIRMED'
    });

    res.status(201).json({ success: true, appointment: newAppointment });
  });

  app.patch('/api/appointments/:id/status', (req: Request, res: Response) => {
    const { status, clinicalNotes } = req.body;
    const apt = appointments.find(a => a.id === req.params.id);
    if (!apt) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    if (status) apt.status = status;
    if (clinicalNotes) apt.clinicalNotes = clinicalNotes;

    auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actor: currentUser.fullName,
      action: 'APPOINTMENT_STATUS_UPDATE',
      details: `Appointment ${apt.id} updated to ${status}`,
      timestamp: new Date().toISOString(),
      status: 'UPDATED'
    });

    res.json({ success: true, appointment: apt });
  });

  // Digital Prescriptions API
  app.post('/api/prescriptions', (req: Request, res: Response) => {
    const { appointmentId, patientId, patientName, patientAge, diagnosis, medicines, vitals, lifestyleAdvice, testsRecommended } = req.body;
    
    const prescription: DigitalPrescription = {
      id: `rx_${Date.now()}`,
      appointmentId,
      doctorId: 'doc_1',
      doctorName: 'Dr. Priya Venkatesh',
      registrationNumber: 'MCI-2012-44192',
      patientId: patientId || currentUser.id,
      patientName: patientName || currentUser.fullName,
      patientAge: patientAge || 48,
      date: new Date().toISOString().split('T')[0],
      vitals: vitals || { bp: '120/80 mmHg', pulse: '74 bpm', spO2: '99%' },
      diagnosis: diagnosis || 'Clinical evaluation and supportive care',
      medicines: medicines || [],
      lifestyleAdvice: lifestyleAdvice || 'Adequate hydration, salt restriction, regular walking 30 mins.',
      testsRecommended: testsRecommended || [],
      digitalSignature: 'Verified Digital Cryptographic Signature (NMC Token #MCI-44192)',
    };

    digitalPrescriptions.unshift(prescription);

    // Also add to patient's personal health records automatically
    healthRecords.unshift({
      id: `rec_${Date.now()}`,
      patientId: prescription.patientId,
      title: `Rx by ${prescription.doctorName} - ${prescription.diagnosis}`,
      category: 'prescription',
      date: prescription.date,
      doctorOrLab: prescription.doctorName,
      fileUrl: '/mock_docs/digital_rx.pdf',
      fileName: `Prescription_${prescription.id}.pdf`,
      fileSize: '185 KB',
      tags: [prescription.diagnosis, `${prescription.medicines.length} Medicines Prescribed`],
      consent: {
        accessType: 'permanent',
        revoked: false,
      },
      accessLogs: [
        {
          actorName: prescription.doctorName,
          actorRole: 'Doctor',
          accessedAt: new Date().toISOString(),
          action: 'Authored and digitally signed prescription'
        }
      ]
    });

    res.status(201).json({ success: true, prescription });
  });

  app.get('/api/prescriptions', (req: Request, res: Response) => {
    res.json({ success: true, prescriptions: digitalPrescriptions });
  });

  // Personal Health Records (PHR) API
  app.get('/api/records', (req: Request, res: Response) => {
    res.json({ success: true, records: healthRecords });
  });

  app.post('/api/records', (req: Request, res: Response) => {
    const { title, category, doctorOrLab, fileName, tags, consentType } = req.body;
    const newRecord: PersonalHealthRecord = {
      id: `rec_${Date.now()}`,
      patientId: currentUser.id,
      title: title || 'Medical Health Record',
      category: category || 'lab_report',
      date: new Date().toISOString().split('T')[0],
      doctorOrLab: doctorOrLab || 'Self Uploaded',
      fileUrl: '/mock_docs/uploaded_record.pdf',
      fileName: fileName || 'health_document.pdf',
      fileSize: '350 KB',
      tags: tags || ['Personal Health Record'],
      consent: {
        accessType: consentType || 'permanent',
        revoked: false,
      },
      accessLogs: [
        {
          actorName: currentUser.fullName,
          actorRole: 'Patient',
          accessedAt: new Date().toISOString(),
          action: 'Uploaded new health record document'
        }
      ]
    };

    healthRecords.unshift(newRecord);
    res.status(201).json({ success: true, record: newRecord });
  });

  app.patch('/api/records/:id/consent', (req: Request, res: Response) => {
    const { revoked, accessType } = req.body;
    const record = healthRecords.find(r => r.id === req.params.id);
    if (!record) {
      res.status(404).json({ success: false, message: 'Record not found' });
      return;
    }

    if (revoked !== undefined) record.consent.revoked = revoked;
    if (accessType) record.consent.accessType = accessType;

    record.accessLogs.unshift({
      actorName: currentUser.fullName,
      actorRole: 'Patient (Owner)',
      accessedAt: new Date().toISOString(),
      action: revoked ? 'REVOKED sharing consent' : `Updated sharing access to ${accessType}`
    });

    res.json({ success: true, record });
  });

  // Emergency Assistance API
  app.post('/api/emergency/broadcast', (req: Request, res: Response) => {
    const { coordinates, address, emergencyType, bloodGroup } = req.body;
    
    const alertId = `emg_${Date.now()}`;
    const dispatch = {
      id: alertId,
      patientName: currentUser.fullName,
      phone: currentUser.phone,
      coordinates: coordinates || { lat: 28.6289, lng: 77.2065 },
      address: address || currentUser.location.address,
      emergencyType: emergencyType || 'Urgent Medical Situation',
      bloodGroup: bloodGroup || 'B+',
      timestamp: new Date().toISOString(),
      dispatchedAmbulance: {
        vehicleNumber: 'DL 01 EM 1088',
        driverName: 'Satish Kumar',
        driverPhone: '+91 98110 22334',
        type: 'Advanced Life Support (ALS) with Oxygen & Defibrillator',
        etaMinutes: 8,
      },
      notifiedContacts: currentUser.dependents.map(d => ({
        name: d.fullName,
        phone: d.emergencyContact,
        smsStatus: 'SENT - Location coordinates shared via SMS'
      }))
    };

    emergencyDispatches.unshift(dispatch);

    auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actor: currentUser.fullName,
      action: 'EMERGENCY_BROADCAST_TRIGGERED',
      details: `108 Ambulance dispatched to ${dispatch.address} (ETA: 8 mins)`,
      timestamp: new Date().toISOString(),
      status: 'PRIORITY_CRITICAL'
    });

    res.status(201).json({ 
      success: true, 
      dispatch,
      emergencyFacilities: hospitals.filter(h => h.has24x7Emergency)
    });
  });

  app.get('/api/emergency/guides', (req: Request, res: Response) => {
    res.json({ success: true, guides: INITIAL_EMERGENCY_GUIDES });
  });

  // Pharmacies & Essential Medicines API
  app.get('/api/pharmacies', (req: Request, res: Response) => {
    const { city, janAushadhiOnly } = req.query;
    let list = [...INITIAL_PHARMACIES];
    if (city && typeof city === 'string' && city !== 'all') {
      list = list.filter(p => p.city.toLowerCase().includes(city.toLowerCase()));
    }
    if (janAushadhiOnly === 'true') {
      list = list.filter(p => p.isJanAushadhiKendra);
    }
    res.json({ success: true, count: list.length, pharmacies: list });
  });

  app.get('/api/medicines', (req: Request, res: Response) => {
    const { search, category } = req.query;
    let list = [...INITIAL_MEDICINES];
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(m => 
        m.brandName.toLowerCase().includes(q) || 
        m.genericName.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      );
    }
    if (category && typeof category === 'string' && category !== 'all') {
      list = list.filter(m => m.category.toLowerCase().includes(category.toLowerCase()));
    }
    res.json({ success: true, count: list.length, medicines: list });
  });

  // Diagnostic Labs & Tests API
  app.get('/api/labs', (req: Request, res: Response) => {
    res.json({ success: true, labs: INITIAL_DIAGNOSTIC_LABS, tests: INITIAL_DIAGNOSTIC_TESTS });
  });

  // Blood Banks API
  app.get('/api/blood-banks', (req: Request, res: Response) => {
    const { group, city } = req.query;
    let list = [...INITIAL_BLOOD_BANKS];
    if (city && typeof city === 'string' && city !== 'all') {
      list = list.filter(b => b.city.toLowerCase().includes(city.toLowerCase()));
    }
    res.json({ success: true, count: list.length, bloodBanks: list });
  });

  // Government Healthcare Schemes API
  app.get('/api/government-schemes', (req: Request, res: Response) => {
    res.json({ success: true, schemes: INITIAL_GOVERNMENT_SCHEMES });
  });

  // Medication Reminders API
  app.get('/api/reminders', (req: Request, res: Response) => {
    res.json({ success: true, reminders });
  });

  app.post('/api/reminders', (req: Request, res: Response) => {
    const { medicineName, dosage, scheduledTimes, instructions } = req.body;
    const newReminder: MedicationReminder = {
      id: `rem_${Date.now()}`,
      userId: currentUser.id,
      medicineName,
      dosage,
      scheduledTimes: scheduledTimes || ['09:00', '21:00'],
      instructions: instructions || 'Take with water after meals.',
      active: true,
      takenHistory: {},
    };
    reminders.push(newReminder);
    res.status(201).json({ success: true, reminder: newReminder });
  });

  app.patch('/api/reminders/:id/toggle-taken', (req: Request, res: Response) => {
    const { timeSlotKey } = req.body; // e.g. "2026-09-29-08:30"
    const reminder = reminders.find(r => r.id === req.params.id);
    if (!reminder) {
      res.status(404).json({ success: false, message: 'Reminder not found' });
      return;
    }
    reminder.takenHistory[timeSlotKey] = !reminder.takenHistory[timeSlotKey];
    res.json({ success: true, reminder });
  });

  // Platform Admin Verification API
  app.get('/api/admin/overview', (req: Request, res: Response) => {
    res.json({
      success: true,
      metrics: {
        totalDoctors: doctors.length,
        verifiedDoctors: doctors.filter(d => d.isVerified).length,
        totalHospitals: hospitals.length,
        totalAppointments: appointments.length,
        completedAppointments: appointments.filter(a => a.status === 'completed').length,
        emergencyAlertsHandled: emergencyDispatches.length,
      },
      auditLogs: auditLogs.slice(0, 20),
    });
  });

  app.post('/api/admin/verify-doctor', (req: Request, res: Response) => {
    const { doctorId, verified } = req.body;
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }
    doctor.isVerified = verified !== undefined ? verified : true;
    auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actor: 'Platform Medical Administrator',
      action: 'CREDENTIAL_VERIFICATION_STATUS',
      details: `${doctor.fullName} (${doctor.registrationNumber}) status set to ${doctor.isVerified ? 'VERIFIED' : 'UNVERIFIED'}`,
      timestamp: new Date().toISOString(),
      status: 'SUCCESS'
    });
    res.json({ success: true, doctor });
  });

  // AI HealthGuide API (Gemini Integration with strict medical safety guardrails)
  app.post('/api/ai/healthguide', async (req: Request, res: Response) => {
    const { message, history } = req.body as { message: string, history?: { role: 'user' | 'model', text: string }[] };

    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, message: 'Prompt message is required' });
      return;
    }

    const lower = message.toLowerCase();
    // Urgent Red Flag Keyword Screening
    const urgentKeywords = [
      'chest pain', 'heart attack', 'cannot breathe', 'difficulty breathing', 
      'breathless', 'stroke', 'slurred speech', 'paralysis', 'unconscious', 
      'heavy bleeding', 'severe trauma', 'poisoning', 'seizure', 'fits', 'suicide'
    ];

    const hasEmergencySymptom = urgentKeywords.some(keyword => lower.includes(keyword));

    // System instruction enforcing medical safety principles
    const systemInstruction = `You are "HealthGuide", an AI healthcare navigation and triage assistant for the Sanjeevani platform in India.
CRITICAL MEDICAL SAFETY BOUNDARIES:
1. You are NOT a doctor. You must clearly state that you provide general educational health information and triage guidance, NEVER definitive diagnoses or autonomous prescriptions.
2. If any life-threatening or red-flag warning signs are mentioned (e.g. chest pressure, severe breathing difficulty, sudden weakness/numbness, acute trauma, heavy bleeding), you MUST immediately advise calling 108 or 112 emergency services and going to the nearest emergency room.
3. Suggest appropriate medical specializations (e.g. General Physician, Cardiologist, ENT, Orthopedic, Pediatrician, Gynecologist, Pulmonologist) to consult.
4. Provide structured, empathetic, calm assistance.
5. Offer 3-4 specific questions the user can ask their doctor during their appointment.
6. Mention relevant Indian healthcare resources where appropriate (e.g. Ayushman Bharat PM-JAY, Jan Aushadhi generic medicines, Tele-MANAS 14416).
7. Keep responses scannable with bullet points and bold headers.`;

    if (ai) {
      try {
        const contents: any[] = [];
        if (history && Array.isArray(history)) {
          history.slice(-6).forEach(h => {
            contents.push({
              role: h.role,
              parts: [{ text: h.text }]
            });
          });
        }
        contents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        const geminiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.3,
          }
        });

        const responseText = geminiResponse.text || '';

        res.json({
          success: true,
          response: responseText,
          isUrgentWarning: hasEmergencySymptom,
          recommendedSpecialty: getRecommendedSpecialty(message),
          emergencyNumbers: ['108 (Ambulance)', '112 (National Emergency)', '104 (Health Advice)', '14416 (Tele-MANAS)']
        });
        return;
      } catch (err: any) {
        console.error('Gemini API Error in HealthGuide:', err);
        // Fall through to safe clinical triage fallback
      }
    }

    // High quality clinical rule-based triage fallback when API key is unavailable or fails
    const fallbackResponse = generateClinicalTriageResponse(message, hasEmergencySymptom);
    res.json({
      success: true,
      response: fallbackResponse,
      isUrgentWarning: hasEmergencySymptom,
      recommendedSpecialty: getRecommendedSpecialty(message),
      emergencyNumbers: ['108 (Ambulance)', '112 (National Emergency)', '104 (Health Advice)', '14416 (Tele-MANAS)']
    });
  });

  // Start Vite or serve static files
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Mount Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sanjeevani] Full-stack Medical Assistance Platform running on http://0.0.0.0:${PORT}`);
  });
}

function getRecommendedSpecialty(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('chest') || lower.includes('heart') || lower.includes('palpitation') || lower.includes('bp') || lower.includes('hypertension')) return 'Cardiologist';
  if (lower.includes('child') || lower.includes('baby') || lower.includes('infant') || lower.includes('pediatric') || lower.includes('vaccination')) return 'Pediatrician';
  if (lower.includes('bone') || lower.includes('joint') || lower.includes('knee') || lower.includes('fracture') || lower.includes('back pain')) return 'Orthopedic Specialist';
  if (lower.includes('period') || lower.includes('pregnancy') || lower.includes('pcos') || lower.includes('gynec') || lower.includes('uterus')) return 'Gynecologist & Obstetrician';
  if (lower.includes('cough') || lower.includes('breath') || lower.includes('asthma') || lower.includes('lung') || lower.includes('phlegm')) return 'Pulmonologist';
  if (lower.includes('skin') || lower.includes('rash') || lower.includes('itching') || lower.includes('acne')) return 'Dermatologist';
  if (lower.includes('mind') || lower.includes('stress') || lower.includes('depression') || lower.includes('anxiety') || lower.includes('sleep')) return 'Psychiatrist / Tele-MANAS Counselor';
  return 'General Physician & Internal Medicine';
}

function generateClinicalTriageResponse(prompt: string, isUrgent: boolean): string {
  const lower = prompt.toLowerCase();
  
  if (isUrgent) {
    return `🚨 **URGENT EMERGENCY ADVICE**:
The symptoms you have described may indicate a potentially time-sensitive or critical medical condition. 

**Immediate Recommended Actions**:
1. **Call 108 (Ambulance) or 112 (National Emergency) immediately.**
2. Do not attempt to drive or walk alone. Have someone stay with you.
3. If experiencing crushing chest pressure or difficulty breathing, rest in a comfortable seated position with knees slightly bent.
4. Keep all existing medical reports and ID cards ready for emergency medical staff.

*Disclaimer: HealthGuide is an AI navigation assistant, not a doctor. Immediate physical evaluation by emergency medical professionals is critical.*`;
  }

  const specialty = getRecommendedSpecialty(prompt);

  return `### HealthGuide Triage & Guidance

Thank you for reaching out. Based on the information provided, here is general healthcare guidance to help you take the right next steps:

**1. Recommended Healthcare Provider**:
* You should consult a **${specialty}** or an experienced **General Physician**.
* You can book either an in-person clinic visit or a secure video teleconsultation directly through the Sanjeevani directory.

**2. Important Warning Signs to Watch Out For**:
If you experience any of the following, seek urgent medical care right away:
* Rapidly worsening symptoms or shortness of breath
* High persistent fever exceeding 102°F unresponsive to paracetamol
* Inability to retain fluids, signs of severe dehydration, or sudden confusion

**3. Questions to Ask Your Doctor**:
* *"What are the most likely causes for these symptoms?"*
* *"Are there any diagnostic tests (like CBC or ultrasound) needed to confirm?"*
* *"Are there affordable generic alternatives (e.g. from Jan Aushadhi Kendras) for any prescribed medicines?"*
* *"What lifestyle or dietary modifications should I follow during recovery?"*

*Safety Notice: HealthGuide provides educational guidance and is not a substitute for clinical diagnosis. Please have a qualified doctor evaluate your symptoms.*`;
}

startServer().catch(err => {
  console.error('Failed to start Sanjeevani server:', err);
});
