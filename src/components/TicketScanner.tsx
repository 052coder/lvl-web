import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AttendeeTicket, ScanResult } from '../types';
import { 
  ScanLine, 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Volume2, 
  VolumeX, 
  Search, 
  Sparkles, 
  Users, 
  Crown, 
  Clock, 
  History, 
  Check, 
  RefreshCw, 
  ShieldAlert, 
  ShieldCheck, 
  SwitchCamera
} from 'lucide-react';
import jsQR from 'jsqr';
import { playScanSound } from '../lib/qrHelper';

interface TicketScannerProps {
  tickets: AttendeeTicket[];
  onCheckInTicket: (ticketId: string) => AttendeeTicket | null;
  onViewTicket: (ticket: AttendeeTicket) => void;
  prefillCode?: string;
}

export const TicketScanner: React.FC<TicketScannerProps> = ({
  tickets,
  onCheckInTicket,
  onViewTicket,
  prefillCode
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Manual search code
  const [manualCode, setManualCode] = useState(prefillCode || '');

  // Current Scan Result
  const [scanResult, setScanResult] = useState<ScanResult>({
    status: 'idle',
    message: 'Ready to scan attendee QR passes',
    timestamp: ''
  });

  // Recent Scans History
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);

  // Video & Canvas Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScannedCodeRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);

  // Process and verify raw code (from QR or manual input)
  const verifyAndCheckIn = useCallback((rawCode: string) => {
    if (!rawCode) return;
    const cleanCode = rawCode.trim();

    // Parse if JSON QR code
    let parsedTicketId = cleanCode;
    try {
      if (cleanCode.startsWith('{') && cleanCode.endsWith('}')) {
        const obj = JSON.parse(cleanCode);
        if (obj.id) parsedTicketId = obj.id;
      }
    } catch (e) {
      // not JSON, use raw
    }

    // Lookup ticket by ID, M-Pesa code, or Phone
    const matchedTicket = tickets.find(
      t => t.id.toLowerCase() === parsedTicketId.toLowerCase() ||
           t.mpesaCode.toLowerCase() === cleanCode.toLowerCase() ||
           t.customerPhone.replace(/\D/g, '') === cleanCode.replace(/\D/g, '')
    );

    const nowStr = new Date().toLocaleTimeString();

    if (!matchedTicket) {
      if (soundEnabled) playScanSound('error');
      const res: ScanResult = {
        status: 'invalid',
        message: `Invalid Pass: "${cleanCode}" not found in guest database.`,
        timestamp: nowStr
      };
      setScanResult(res);
      setRecentScans(prev => [res, ...prev.slice(0, 9)]);
      return;
    }

    if (matchedTicket.checkedIn) {
      if (soundEnabled) playScanSound('warning');
      const res: ScanResult = {
        status: 'already_used',
        message: `ALREADY USED: Ticket was admitted at ${matchedTicket.checkedInAt ? new Date(matchedTicket.checkedInAt).toLocaleTimeString() : 'earlier'}.`,
        ticket: matchedTicket,
        timestamp: nowStr
      };
      setScanResult(res);
      setRecentScans(prev => [res, ...prev.slice(0, 9)]);
      return;
    }

    // Valid ticket - admit!
    const updated = onCheckInTicket(matchedTicket.id);
    if (soundEnabled) playScanSound('success');

    const res: ScanResult = {
      status: 'success',
      message: `PASS VALID: Welcome ${matchedTicket.customerName}! Admits ${matchedTicket.admitCount} guests.`,
      ticket: updated || { ...matchedTicket, checkedIn: true, checkedInAt: new Date().toISOString() },
      timestamp: nowStr
    };
    setScanResult(res);
    setRecentScans(prev => [res, ...prev.slice(0, 9)]);
  }, [tickets, onCheckInTicket, soundEnabled]);

  // Frame processing loop for Camera Feed
  const tick = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          const now = Date.now();
          // Debounce same QR scan within 2.5 seconds
          if (code.data !== lastScannedCodeRef.current || now - lastScanTimeRef.current > 2500) {
            lastScannedCodeRef.current = code.data;
            lastScanTimeRef.current = now;
            verifyAndCheckIn(code.data);
          }
        }
      }
    }
    if (cameraActive) {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  }, [cameraActive, verifyAndCheckIn]);

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in browser settings.'
          : 'Unable to open camera stream. You can also use the manual lookup code box below.'
      );
      setCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (cameraActive) {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraActive, tick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // If prefill code is passed, verify immediately
  useEffect(() => {
    if (prefillCode) {
      setManualCode(prefillCode);
      verifyAndCheckIn(prefillCode);
    }
  }, [prefillCode, verifyAndCheckIn]);

  const toggleCameraFacing = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    if (cameraActive) {
      stopCamera();
      setTimeout(() => startCamera(), 200);
    }
  };

  return (
    <section id="ticket-scanner-section" className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <ScanLine className="w-3.5 h-3.5" />
            Gate Control & Entry
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase font-display">
            LVL Gate Scanner Area
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Real-time QR barcode verification with duplicate prevention and audio feedback.
          </p>
        </div>

        {/* Audio feedback & quick controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-neutral-900 border-neutral-700 text-amber-400'
                : 'bg-neutral-950 border-neutral-800 text-neutral-500'
            }`}
            title={soundEnabled ? 'Audio Chimes Enabled' : 'Audio Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {!cameraActive ? (
            <button
              id="btn-start-camera"
              onClick={startCamera}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Start Camera Scanner</span>
            </button>
          ) : (
            <button
              id="btn-stop-camera"
              onClick={stopCamera}
              className="px-4 py-2.5 rounded-xl bg-red-950 text-red-300 border border-red-800 hover:bg-red-900 font-bold text-xs flex items-center gap-2"
            >
              <CameraOff className="w-4 h-4" />
              <span>Stop Camera</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Scanner Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Viewfinder & Live Status Card (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Camera Viewfinder Box */}
          <div className="relative rounded-3xl overflow-hidden bg-neutral-950 border-2 border-neutral-800 min-h-[320px] sm:min-h-[380px] flex items-center justify-center shadow-2xl">
            
            {/* Hidden Canvas for QR Analysis */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Video Feed */}
            <video
              ref={videoRef}
              className={`w-full h-[320px] sm:h-[380px] object-cover ${cameraActive ? 'block' : 'hidden'}`}
            />

            {/* Camera Overlay when Active */}
            {cameraActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6">
                
                {/* Top Status */}
                <div className="bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-neutral-700/80 text-xs font-semibold text-emerald-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Scanning Viewport Active</span>
                </div>

                {/* Target Reticle & Laser Beam */}
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-amber-400/70 rounded-2xl">
                  {/* Corner Targets */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400" />
                  
                  {/* Animated Laser Bar */}
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-lg shadow-amber-400 animate-bounce mt-24" />
                </div>

                {/* Switch Camera Button */}
                <div className="pointer-events-auto">
                  <button
                    onClick={toggleCameraFacing}
                    className="p-2 rounded-full bg-black/70 border border-neutral-700 text-white hover:bg-neutral-800 text-xs flex items-center gap-1.5 px-3"
                  >
                    <SwitchCamera className="w-3.5 h-3.5" />
                    <span>Switch Lens</span>
                  </button>
                </div>
              </div>
            )}

            {/* Standby State if camera is off */}
            {!cameraActive && (
              <div className="text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 mx-auto">
                  <ScanLine className="w-8 h-8 text-amber-400/80" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Camera Viewfinder Ready</h3>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                    Click "Start Camera Scanner" to scan physical or phone screens, or use the manual code validator below.
                  </p>
                </div>
                <button
                  onClick={startCamera}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Camera className="w-4 h-4" />
                  <span>Activate Camera</span>
                </button>
              </div>
            )}

            {/* Camera Permission / Access Error */}
            {cameraError && (
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-950/90 border border-red-800 rounded-xl text-xs text-red-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

          </div>

          {/* Verification Result Card */}
          <div className={`rounded-2xl p-5 border-2 transition-all duration-300 ${
            scanResult.status === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200 shadow-xl shadow-emerald-500/10'
              : scanResult.status === 'already_used'
              ? 'bg-amber-950/40 border-amber-500/80 text-amber-200 shadow-xl shadow-amber-500/10'
              : scanResult.status === 'invalid'
              ? 'bg-red-950/40 border-red-500/80 text-red-200 shadow-xl shadow-red-500/10'
              : 'bg-neutral-900/60 border-neutral-800 text-neutral-300'
          }`}>
            
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  scanResult.status === 'success'
                    ? 'bg-emerald-500 text-neutral-950'
                    : scanResult.status === 'already_used'
                    ? 'bg-amber-500 text-neutral-950'
                    : scanResult.status === 'invalid'
                    ? 'bg-red-500 text-white'
                    : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {scanResult.status === 'success' && <CheckCircle2 className="w-6 h-6" />}
                  {scanResult.status === 'already_used' && <AlertTriangle className="w-6 h-6" />}
                  {scanResult.status === 'invalid' && <XCircle className="w-6 h-6" />}
                  {scanResult.status === 'idle' && <ScanLine className="w-6 h-6" />}
                </div>

                <div>
                  <div className="text-xs uppercase font-extrabold tracking-wider opacity-80">
                    {scanResult.status === 'success' && '🟢 ENTRY GRANTED'}
                    {scanResult.status === 'already_used' && '🟡 PASS ALREADY USED'}
                    {scanResult.status === 'invalid' && '🔴 REJECTED / FRAUDULENT'}
                    {scanResult.status === 'idle' && 'GATE SCAN STATUS'}
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {scanResult.message}
                  </div>
                </div>
              </div>

              {scanResult.timestamp && (
                <span className="text-[11px] font-mono opacity-60">
                  {scanResult.timestamp}
                </span>
              )}
            </div>

            {/* If Ticket Data Exists in Scan Result */}
            {scanResult.ticket && (
              <div className="mt-4 pt-4 border-t border-neutral-800/80 space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-neutral-950/70 p-3 rounded-xl border border-neutral-800">
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">Attendee</span>
                    <strong className="text-white text-xs truncate block">{scanResult.ticket.customerName}</strong>
                  </div>

                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">Tier</span>
                    <strong className="text-amber-400 text-xs block">{scanResult.ticket.tierName}</strong>
                  </div>

                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">Guests Admitted</span>
                    <strong className="text-purple-300 text-xs block font-mono">{scanResult.ticket.admitCount} Person(s)</strong>
                  </div>

                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">M-Pesa Pochi</span>
                    <strong className="text-emerald-400 text-xs block font-mono">{scanResult.ticket.mpesaCode}</strong>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => onViewTicket(scanResult.ticket!)}
                    className="text-xs text-amber-400 hover:underline font-semibold"
                  >
                    View Full Digital Pass Details &rarr;
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Manual Code Lookup & Test Samples (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Manual Input Box */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-display">
                Manual Code & ID Lookup
              </h3>
              <p className="text-xs text-neutral-400">
                Type or paste Ticket ID (e.g. LVL-VIP-8492), M-Pesa code, or phone.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                verifyAndCheckIn(manualCode);
              }}
              className="space-y-3"
            >
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  placeholder="e.g. LVL-VIP-8492 or SL74KG89P1"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-mono uppercase"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verify & Admit Guest</span>
              </button>
            </form>

            {/* Quick Test Demo Badges */}
            <div className="pt-2 border-t border-neutral-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                Quick One-Click Test Codes:
              </span>
              <div className="flex flex-col gap-1.5">
                {tickets.slice(0, 4).map(ticket => (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => {
                      setManualCode(ticket.id);
                      verifyAndCheckIn(ticket.id);
                    }}
                    className="w-full text-left p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800/80 text-xs flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-white mr-2">{ticket.id}</span>
                      <span className="text-neutral-400 text-[11px]">{ticket.customerName}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      ticket.checkedIn ? 'bg-neutral-800 text-neutral-500' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {ticket.checkedIn ? 'Used' : 'Ready'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Recent Gate Scan Activity Log */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-bold text-neutral-400 tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-amber-400" />
                Recent Gate Scans ({recentScans.length})
              </h3>
              {recentScans.length > 0 && (
                <button
                  onClick={() => setRecentScans([])}
                  className="text-[10px] text-neutral-500 hover:text-neutral-300"
                >
                  Clear Log
                </button>
              )}
            </div>

            {recentScans.length === 0 ? (
              <p className="text-xs text-neutral-500 text-center py-4">
                No tickets scanned this session yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {recentScans.map((scan, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        scan.status === 'success' ? 'bg-emerald-400' : scan.status === 'already_used' ? 'bg-amber-400' : 'bg-red-400'
                      }`} />
                      <div className="truncate max-w-[180px]">
                        <div className="font-semibold text-white truncate">
                          {scan.ticket ? scan.ticket.customerName : scan.message}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono">
                          {scan.ticket ? `${scan.ticket.id} (${scan.ticket.tierName})` : 'Scan Attempt'}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                      {scan.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </section>
  );
};
