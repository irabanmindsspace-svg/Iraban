import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DigitalPrescription, PersonalHealthRecord, Appointment } from '../types';
import jsQR from 'jsqr';
import {
  Camera,
  X,
  RefreshCw,
  Zap,
  ZapOff,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  ShieldCheck,
  Pill,
  User,
  Calendar,
  Clock,
  Printer,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  Check,
  Stethoscope,
  Heart,
  QrCode
} from 'lucide-react';
import { addMedicineItemToBasket } from '../utils/medicineBasket';

interface VerificationResult {
  type: 'prescription' | 'patient_record' | 'appointment' | 'custom_qr';
  prescription?: DigitalPrescription;
  patient?: {
    id: string;
    fullName: string;
    phone: string;
    abhaId: string;
    bloodGroup: string;
    allergies: string[];
    chronicConditions: string[];
    emergencyContact: string;
  };
  records?: PersonalHealthRecord[];
  singleRecord?: PersonalHealthRecord | null;
  appointment?: Appointment;
  verification?: {
    isValid: boolean;
    authority?: string;
    digitalSignature?: string;
    verifiedAt?: string;
    verifier?: string;
    doctorRegistration?: string;
    dispensedStatus?: string;
  };
  rawData?: string;
  message?: string;
}

export const QRScannerModal: React.FC = () => {
  const { 
    isQrScannerOpen, 
    setIsQrScannerOpen, 
    qrScannerScope, 
    setActiveTab, 
    showNotification,
    user 
  } = useApp();

  const [activeScope, setActiveScope] = useState<'all' | 'prescription' | 'patient_records'>('all');
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [torchSupported, setTorchSupported] = useState<boolean>(false);
  
  // Verification states
  const [verifying, setVerifying] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<VerificationResult | null>(null);
  const [manualCodeInput, setManualCodeInput] = useState<string>('');
  const [dispensingInProgress, setDispensingInProgress] = useState<boolean>(false);
  const [activeRecordDocPreview, setActiveRecordDocPreview] = useState<PersonalHealthRecord | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastScannedCodeRef = useRef<string | null>(null);

  // Sync initial scope from AppContext
  useEffect(() => {
    if (qrScannerScope) {
      setActiveScope(qrScannerScope);
    }
  }, [qrScannerScope]);

  // Audio confirmation chime using Web Audio API
  const playSuccessChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.12); // A6

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, now + 0.08); // E6
      osc2.frequency.exponentialRampToValueAtTime(2640, now + 0.22); // E7

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.15);
      osc2.stop(now + 0.28);

      if ('vibrate' in navigator) {
        navigator.vibrate([40, 50, 40]);
      }
    } catch (e) {
      // AudioContext muted/unsupported, ignore
    }
  }, []);

  // Stop camera media tracks cleanly
  const stopCameraStream = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          // ignore
        }
      });
      streamRef.current = null;
    }
    setTorchOn(false);
  }, []);

  // Initialize camera stream
  const startCameraStream = useCallback(async () => {
    stopCameraStream();
    setCameraError(null);
    lastScannedCodeRef.current = null;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCamera(false);
      setCameraError('Camera API is not supported in this browser environment. You can upload a QR image or use sample test QRs below.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasCamera(true);

      // Check torch capability on primary video track
      const track = stream.getVideoTracks()[0];
      if (track && typeof track.getCapabilities === 'function') {
        const capabilities: any = track.getCapabilities();
        setTorchSupported(!!capabilities.torch);
      } else {
        setTorchSupported(false);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setHasCamera(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera permissions in your browser or use the image upload & demo simulators below.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No video camera hardware detected. You can upload an image file or test with sample QRs.');
      } else {
        setCameraError(`Camera unavailable (${err.message || 'Stream error'}). You can upload a photo or use instant test QRs.`);
      }
    }
  }, [facingMode, stopCameraStream]);

  // QR verification processor
  const processScannedCode = useCallback(async (codeData: string) => {
    if (!codeData || codeData.trim() === '') return;
    if (lastScannedCodeRef.current === codeData.trim()) return;

    lastScannedCodeRef.current = codeData.trim();
    setIsScanning(false);
    setVerifying(true);
    playSuccessChime();

    try {
      const response = await api.verifyQrCode(codeData.trim());
      if (response && response.success) {
        setScanResult(response as VerificationResult);
      } else {
        setScanResult({
          type: 'custom_qr',
          rawData: codeData.trim(),
          message: 'QR code detected, but could not be mapped to an ABDM record.'
        });
      }
    } catch (err) {
      console.error('Error verifying QR code:', err);
      setScanResult({
        type: 'custom_qr',
        rawData: codeData.trim(),
        message: 'Could not connect to verification server. Please try again.'
      });
    } finally {
      setVerifying(false);
    }
  }, [playSuccessChime]);

  // Real-time canvas scanner loop
  useEffect(() => {
    if (!isQrScannerOpen || !isScanning || scanResult) return;

    const scanFrame = () => {
      if (!isScanning) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= video.HAVE_CURRENT_DATA) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          if (canvas.width > 0 && canvas.height > 0) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (code && code.data) {
              processScannedCode(code.data);
              return;
            }
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isQrScannerOpen, isScanning, scanResult, processScannedCode]);

  // Lifecycle when modal opens/closes
  useEffect(() => {
    if (isQrScannerOpen) {
      setScanResult(null);
      setManualCodeInput('');
      lastScannedCodeRef.current = null;
      startCameraStream();
    } else {
      stopCameraStream();
      setScanResult(null);
    }

    return () => {
      stopCameraStream();
    };
  }, [isQrScannerOpen, startCameraStream, stopCameraStream]);

  // Toggle Torch/Flashlight
  const handleToggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }]
        });
        setTorchOn(nextState);
      } catch (err) {
        console.warn('Torch constraint error:', err);
      }
    }
  };

  // Switch between back/front camera
  const handleToggleCameraFacing = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Upload QR Image fallback decoder
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = img.width;
        offCanvas.height = img.height;
        const ctx = offCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imgData = ctx.getImageData(0, 0, img.width, img.height);
          const decoded = jsQR(imgData.data, imgData.width, imgData.height);
          if (decoded && decoded.data) {
            processScannedCode(decoded.data);
          } else {
            showNotification('No readable QR code found in uploaded image. Please try a clearer picture.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input
    e.target.value = '';
  };

  // Quick Test Simulator buttons for instant verification
  const handleTriggerSampleCode = (code: string) => {
    processScannedCode(code);
  };

  // Resume camera scanning for another code
  const handleScanAgain = () => {
    setScanResult(null);
    lastScannedCodeRef.current = null;
    setIsScanning(true);
    startCameraStream();
  };

  // Pharmacy staff dispensing action
  const handleDispensePrescription = async (prescriptionId: string) => {
    setDispensingInProgress(true);
    try {
      const res = await api.dispensePrescription(prescriptionId, {
        pharmacyName: user?.pharmacyName || 'PMBJP Jan Aushadhi Kendra (Connaught Place)',
        pharmacyLicense: user?.pharmacyLicenseNumber || 'DL-DLH-2021-99881',
      });
      if (res.success && res.prescription) {
        if (scanResult && scanResult.prescription) {
          setScanResult({
            ...scanResult,
            prescription: res.prescription,
            verification: {
              ...scanResult.verification,
              isValid: true,
              dispensedStatus: 'dispensed'
            }
          });
        }
        showNotification('Prescription marked as FULFILLED and DISPENSED at Jan Aushadhi Kendra.');
      }
    } catch (err) {
      console.error('Dispensing error:', err);
      showNotification('Failed to update dispensing status. Please try again.');
    } finally {
      setDispensingInProgress(false);
    }
  };

  // Add all medicines from verified prescription into the medicine bill calculator
  const handleAddPrescriptionToCalculator = (prescription: DigitalPrescription) => {
    let addedCount = 0;
    prescription.medicines.forEach((med, idx) => {
      addMedicineItemToBasket({
        id: `med_rx_${prescription.id}_${idx}`,
        brandName: med.medicineName,
        genericName: med.genericName,
        dosageForm: 'Tablet',
        strength: med.dosage,
        brandPrice: 120, // default benchmark
        janAushadhiPrice: 24, // generic benchmark (~80% savings)
        savingsPercentage: 80,
        category: 'Prescription Item',
        prescriptionRequired: true,
        inStock: true,
      }, 1);
      addedCount++;
    });

    showNotification(`${addedCount} medicines added to your Medicine Bill Calculator.`);
    setIsQrScannerOpen(false);
    setActiveTab('pharmacy');
  };

  if (!isQrScannerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shadow-xs">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-white">
                  ABDM Verified Medical QR Scanner
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-500 text-slate-950 rounded">
                  Live Camera
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Point camera at Patient ABHA Card or Doctor's Digital Prescription QR
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsQrScannerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scope Selector Tabs */}
        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">Verification Scope:</span>
            <button
              onClick={() => setActiveScope('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                activeScope === 'all'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              All Medical QRs
            </button>
            <button
              onClick={() => setActiveScope('prescription')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${
                activeScope === 'prescription'
                  ? 'bg-teal-700 text-white font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Pill className="w-3 h-3 text-teal-400" />
              <span>Pharmacy Rx</span>
            </button>
            <button
              onClick={() => setActiveScope('patient_records')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${
                activeScope === 'patient_records'
                  ? 'bg-sky-800 text-white font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <User className="w-3 h-3 text-sky-400" />
              <span>Patient ABHA Vault</span>
            </button>
          </div>

          <label className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded border border-slate-200 text-[11px] font-medium transition cursor-pointer shadow-2xs">
            <Upload className="w-3 h-3 text-slate-500" />
            <span>Upload QR Image</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="hidden" 
            />
          </label>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* STATE 1: Live Camera View or Verifying Loading */}
          {!scanResult && (
            <div className="space-y-4">
              {/* Camera Container */}
              <div className="relative aspect-4/3 w-full max-w-lg mx-auto bg-black rounded-xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
                
                {/* Real Video Element */}
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${cameraError ? 'hidden' : 'block'}`}
                  autoPlay
                  muted
                  playsInline
                />

                {/* Off-screen Canvas for QR Decoding */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Camera Viewfinder Reticle & Laser Beam Overlay */}
                {!cameraError && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    
                    {/* Darkened mask with clear center aperture */}
                    <div className="relative w-64 h-64 border-2 border-emerald-400/80 rounded-lg shadow-lg">
                      
                      {/* Corner Target Brackets */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-3 border-l-3 border-emerald-400" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-3 border-r-3 border-emerald-400" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-3 border-l-3 border-emerald-400" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-3 border-r-3 border-emerald-400" />

                      {/* Animated Laser Scanning Line */}
                      {isScanning && (
                        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.9)] animate-bounce duration-1000" />
                      )}

                      {/* Reticle center crosshair */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <div className="w-8 h-8 border border-dashed border-white rounded-full" />
                      </div>

                      {/* Status text inside reticle */}
                      <div className="absolute bottom-2 inset-x-0 text-center">
                        <span className="text-[10px] font-mono text-emerald-300 bg-black/60 px-2 py-0.5 rounded border border-emerald-500/30">
                          {activeScope === 'prescription' 
                            ? 'ALIGN PRESCRIPTION QR' 
                            : activeScope === 'patient_records'
                              ? 'ALIGN ABHA ID QR'
                              : 'ALIGN ANY MEDICAL QR'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verifying Indicator Overlay */}
                {verifying && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20 space-y-3">
                    <div className="w-12 h-12 rounded-full border-3 border-emerald-400 border-t-transparent animate-spin" />
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">Cryptographically Verifying ABDM Record...</p>
                      <p className="text-xs text-slate-400 mt-0.5">Checking National Medical Commission Signature & Vault</p>
                    </div>
                  </div>
                )}

                {/* Fallback Display if Camera has Error / Not Allowed */}
                {cameraError && (
                  <div className="p-6 text-center text-white max-w-sm space-y-3 z-10">
                    <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-300">Camera Access Notice</p>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {cameraError}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 pt-2">
                      <label className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-xs cursor-pointer transition shadow-xs">
                        Select Photo or Screenshot with QR
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                      <button
                        onClick={startCameraStream}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition cursor-pointer"
                      >
                        Retry Camera Permission
                      </button>
                    </div>
                  </div>
                )}

                {/* Floating Quick Camera Controls (Torch & Camera Switch) */}
                {!cameraError && (
                  <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                    {torchSupported && (
                      <button
                        onClick={handleToggleTorch}
                        className={`p-2 rounded-full transition cursor-pointer shadow-md ${
                          torchOn 
                            ? 'bg-amber-400 text-slate-950 font-bold' 
                            : 'bg-black/60 text-white hover:bg-black/80'
                        }`}
                        title="Toggle Flashlight / Torch"
                      >
                        {torchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
                      </button>
                    )}

                    <button
                      onClick={handleToggleCameraFacing}
                      className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer shadow-md"
                      title="Flip Camera (Front/Rear)"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Sample QR Simulator Chips (Ensures immediate 1-click testability) */}
              <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Quick Test Simulator (Click any sample QR code to test instant verification):</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleTriggerSampleCode('SNJ-RX-301')}
                    className="p-2 rounded bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 transition cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 group-hover:text-teal-900 truncate">
                        Jan Aushadhi Rx (SNJ-RX-301)
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                      Diabetes & BP · Dr. Priya (MCI-44192)
                    </p>
                  </button>

                  <button
                    onClick={() => handleTriggerSampleCode('91-8842-1209-7712')}
                    className="p-2 rounded bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 transition cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 group-hover:text-sky-900 truncate">
                        Patient ABHA Vault (Rajesh Sharma)
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                      ABHA ID: 91-8842-1209-7712 · 3 Records
                    </p>
                  </button>

                  <button
                    onClick={() => handleTriggerSampleCode('SNJ-APT-202609-1001')}
                    className="p-2 rounded bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-900 truncate">
                        OPD Appointment QR
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                      Apex Clinic Kiosk Check-In
                    </p>
                  </button>
                </div>
              </div>

              {/* Manual Alphanumeric Code Input Option */}
              <div className="border-t border-slate-200 pt-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (manualCodeInput.trim()) {
                      processScannedCode(manualCodeInput.trim());
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value)}
                    placeholder="Or enter verification code manually (e.g. SNJ-RX-301, ABHA ID...)"
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={!manualCodeInput.trim()}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded text-xs font-medium transition cursor-pointer shrink-0"
                  >
                    Verify Code
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* STATE 2: Scanned Result View */}
          {scanResult && (
            <div className="space-y-4">
              
              {/* RESULT TYPE A: Prescription Verification */}
              {scanResult.type === 'prescription' && scanResult.prescription && (
                <div className="space-y-4">
                  {/* Verified Header Banner */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-400">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-950 text-sm">
                              Valid Digitally Signed Prescription
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-600 text-white rounded-full uppercase tracking-wider">
                              ABDM Verified
                            </span>
                          </div>
                          <p className="text-xs text-emerald-800 font-mono mt-0.5">
                            Rx Code: {scanResult.prescription.qrVerificationCode || scanResult.prescription.id} · Issued {scanResult.prescription.date}
                          </p>
                        </div>
                      </div>

                      <div className="text-right sm:border-l sm:border-emerald-200 sm:pl-4">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Dispensing Status</span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded inline-block mt-0.5 ${
                          scanResult.prescription.dispensedStatus === 'dispensed'
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}>
                          {scanResult.prescription.dispensedStatus === 'dispensed' ? 'Already Dispensed' : 'Ready to Dispense'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Doctor & Patient Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] uppercase tracking-wide">
                        <Stethoscope className="w-3.5 h-3.5 text-sky-700" />
                        <span>Prescribing Practitioner</span>
                      </div>
                      <p className="font-bold text-sm text-slate-900">{scanResult.prescription.doctorName}</p>
                      <p className="text-slate-600">Reg No: <span className="font-mono font-semibold text-sky-900">{scanResult.prescription.registrationNumber}</span></p>
                      <p className="text-[11px] text-slate-500">Apex City Health Center · NMC Licensed</p>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] uppercase tracking-wide">
                        <User className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Patient Details</span>
                      </div>
                      <p className="font-bold text-sm text-slate-900">{scanResult.prescription.patientName}</p>
                      <p className="text-slate-600">Age: {scanResult.prescription.patientAge} Years · ABHA: <span className="font-mono font-semibold text-slate-800">91-8842-1209-7712</span></p>
                      <p className="text-[11px] text-slate-500">Diagnosis: <span className="font-semibold text-slate-700">{scanResult.prescription.diagnosis}</span></p>
                    </div>
                  </div>

                  {/* Recorded Vitals */}
                  {scanResult.prescription.vitals && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Recorded OPD Vitals
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-[10px] text-slate-400 block">Blood Pressure</span>
                          <span className="font-bold text-slate-900">{scanResult.prescription.vitals.bp || '120/80 mmHg'}</span>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-[10px] text-slate-400 block">Pulse Rate</span>
                          <span className="font-bold text-slate-900">{scanResult.prescription.vitals.pulse || '74 bpm'}</span>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-[10px] text-slate-400 block">Oxygen (SpO2)</span>
                          <span className="font-bold text-slate-900">{scanResult.prescription.vitals.spO2 || '99%'}</span>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-[10px] text-slate-400 block">Patient Weight</span>
                          <span className="font-bold text-slate-900">{scanResult.prescription.vitals.weight || '74 kg'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Prescribed Medicines & Jan Aushadhi Generic Substitutes */}
                  <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-emerald-700" />
                        <span>Prescribed Medicines & Jan Aushadhi Generic Equivalents</span>
                      </h3>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {scanResult.prescription.medicines.length} Medicines Prescribed
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {scanResult.prescription.medicines.map((med, idx) => (
                        <div key={idx} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div>
                              <span className="font-bold text-sm text-slate-900">{med.medicineName}</span>
                              <span className="text-xs font-mono text-slate-500 ml-2">({med.dosage})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold px-2 py-0.5 bg-sky-50 text-sky-800 rounded border border-sky-200">
                                {med.frequency}
                              </span>
                              <span className="text-[11px] text-slate-600 font-medium">
                                {med.timing} · {med.duration}
                              </span>
                            </div>
                          </div>

                          <div className="p-2 bg-emerald-50/60 rounded border border-emerald-100 flex items-center justify-between text-xs">
                            <div>
                              <span className="text-[10px] font-bold text-emerald-900 uppercase block">Generic Active Ingredient (PMBJP Subsidized):</span>
                              <span className="text-emerald-950 font-medium">{med.genericName}</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                              ~80% PMBJP Savings
                            </span>
                          </div>

                          {med.instructions && (
                            <p className="text-[11px] text-slate-500 italic pl-1">
                              Note: {med.instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {scanResult.prescription.lifestyleAdvice && (
                      <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                        <span className="font-bold text-slate-700 block mb-0.5">Doctor's Lifestyle & Dietary Advice:</span>
                        <p className="text-slate-600">{scanResult.prescription.lifestyleAdvice}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar for Prescription */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={handleScanAgain}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Scan Another Code</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAddPrescriptionToCalculator(scanResult.prescription!)}
                        className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Add to Bill Calculator</span>
                      </button>

                      {scanResult.prescription.dispensedStatus !== 'dispensed' && (
                        <button
                          onClick={() => handleDispensePrescription(scanResult.prescription!.id)}
                          disabled={dispensingInProgress}
                          className="px-4 py-2 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-300" />
                          <span>{dispensingInProgress ? 'Dispensing...' : 'Dispense at Jan Aushadhi Kendra'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* RESULT TYPE B: Patient Medical Records Vault */}
              {scanResult.type === 'patient_record' && scanResult.patient && (
                <div className="space-y-4">
                  {/* Verified Patient Header Banner */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50 via-indigo-50 to-sky-50 border-2 border-sky-400">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-700 text-white flex items-center justify-center shrink-0 shadow-md">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sky-950 text-base">
                              {scanResult.patient.fullName}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-700 text-white rounded-full uppercase tracking-wider">
                              ABHA Verified
                            </span>
                          </div>
                          <p className="text-xs text-sky-800 font-mono mt-0.5">
                            ABHA ID: <span className="font-bold">{scanResult.patient.abhaId}</span> · Phone: {scanResult.patient.phone}
                          </p>
                        </div>
                      </div>

                      <div className="text-right sm:border-l sm:border-sky-200 sm:pl-4">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">ABDM Consent</span>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                          Active OPD Consent
                        </span>
                      </div>
                    </div>

                    {/* Patient Health Indicators */}
                    <div className="mt-3 pt-3 border-t border-sky-200/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-white/80 p-2 rounded">
                        <span className="text-[10px] text-slate-500 block">Blood Group</span>
                        <span className="font-bold text-red-700">{scanResult.patient.bloodGroup || 'B+'}</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded">
                        <span className="text-[10px] text-slate-500 block">Known Allergies</span>
                        <span className="font-semibold text-slate-800">{scanResult.patient.allergies?.join(', ') || 'None recorded'}</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded sm:col-span-2">
                        <span className="text-[10px] text-slate-500 block">Chronic Conditions</span>
                        <span className="font-semibold text-slate-800">{scanResult.patient.chronicConditions?.join(' · ') || 'None'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Medical Records List in Vault */}
                  <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-sky-700" />
                        <span>Linked Health Documents & Diagnostic Vault ({scanResult.records?.length || 0})</span>
                      </h3>
                      <button
                        onClick={() => {
                          setIsQrScannerOpen(false);
                          setActiveTab('records');
                        }}
                        className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Full Vault</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {scanResult.records && scanResult.records.length > 0 ? (
                        scanResult.records.map(rec => (
                          <div
                            key={rec.id}
                            className="p-3 rounded-lg border border-slate-200 hover:border-sky-300 transition bg-white flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4 text-sky-700" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">{rec.title}</p>
                                <p className="text-[11px] text-slate-500">
                                  {rec.doctorOrLab} · {rec.date} · <span className="font-mono text-slate-400">{rec.fileSize}</span>
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => setActiveRecordDocPreview(rec)}
                              className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold rounded border border-sky-200 text-xs shrink-0 cursor-pointer transition"
                            >
                              View Record
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 text-center py-4">No records stored yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar for Patient Records */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={handleScanAgain}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Scan Another Code</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsQrScannerOpen(false);
                        setActiveTab('records');
                      }}
                      className="px-4 py-2 bg-sky-800 hover:bg-sky-900 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Manage Patient Health Records</span>
                    </button>
                  </div>
                </div>
              )}

              {/* RESULT TYPE C: Appointment Verification */}
              {scanResult.type === 'appointment' && scanResult.appointment && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-indigo-50 to-emerald-50 border-2 border-emerald-400">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-base">
                            Confirmed OPD Appointment
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-600 text-white rounded-full uppercase tracking-wider">
                            Verified
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-mono mt-0.5">
                          Pass Code: {scanResult.appointment.qrVerificationCode}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Patient Name</span>
                        <span className="font-bold text-slate-900 text-sm">{scanResult.appointment.patientName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Doctor</span>
                        <span className="font-bold text-slate-900 text-sm">{scanResult.appointment.doctorName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Date & Time Slot</span>
                        <span className="font-bold text-slate-900">{scanResult.appointment.date} ({scanResult.appointment.timeSlot})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Consultation Type</span>
                        <span className="font-bold text-sky-800 uppercase">{scanResult.appointment.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={handleScanAgain}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Scan Another Code</span>
                    </button>

                    <button
                      onClick={() => {
                        showNotification(`Checked in ${scanResult.appointment?.patientName} at OPD desk.`);
                        setIsQrScannerOpen(false);
                      }}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
                    >
                      Approve Clinic Entry
                    </button>
                  </div>
                </div>
              )}

              {/* RESULT TYPE D: Generic / Custom QR Scanned */}
              {scanResult.type === 'custom_qr' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-slate-700" />
                      <span className="font-bold text-slate-900">Scanned QR Code Payload:</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 font-mono text-xs break-all text-slate-800 select-all">
                      {scanResult.rawData}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {scanResult.message || 'QR code was read, but is not associated with an existing hospital or pharmacy entity in this mock cluster.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2">
                    <button
                      onClick={handleScanAgain}
                      className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Scan Another Code</span>
                    </button>

                    <button
                      onClick={() => setIsQrScannerOpen(false)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
                    >
                      Close Scanner
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>National Digital Health Mission (NDHM) & ABDM Certified Scanner</span>
          </div>

          <button
            onClick={() => setIsQrScannerOpen(false)}
            className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>

      {/* Record Document Preview Modal */}
      {activeRecordDocPreview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-sm truncate">{activeRecordDocPreview.title}</span>
              </div>
              <button
                onClick={() => setActiveRecordDocPreview(null)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">{activeRecordDocPreview.fileName}</p>
                  <p className="text-[11px] text-slate-500">Issued by {activeRecordDocPreview.doctorOrLab} on {activeRecordDocPreview.date}</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded text-[10px]">
                  Verified Digital Document
                </span>
              </div>

              <div className="p-8 border-2 border-dashed border-slate-200 rounded-lg text-center space-y-2 bg-slate-50/50">
                <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="font-bold text-slate-700">Mock Document Preview</p>
                <p className="text-slate-500 text-[11px]">
                  This encrypted PDF has been verified against the National Health Authority consent architecture.
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                  {activeRecordDocPreview.tags?.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-sky-50 text-sky-800 rounded font-semibold text-[10px]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    showNotification(`Downloaded ${activeRecordDocPreview.fileName}`);
                    setActiveRecordDocPreview(null);
                  }}
                  className="px-3 py-1.5 bg-sky-800 hover:bg-sky-900 text-white rounded text-xs font-bold transition cursor-pointer"
                >
                  Download File
                </button>
                <button
                  onClick={() => setActiveRecordDocPreview(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
