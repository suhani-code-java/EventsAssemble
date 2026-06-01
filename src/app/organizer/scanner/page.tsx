'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckCircle, Camera, User, XCircle, AlertCircle, List, RefreshCw } from 'lucide-react';

interface ScanResult {
  name: string;
  rollNumber: string;
  eventId: string;
  eventName?: string;
  alreadyAttended?: boolean;
}

interface AttendanceRecord {
  _id: string;
  userName?: string;
  rollNumber?: string;
  eventId: string;
  attended: boolean;
  registeredAt: string;
}

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error' | 'duplicate'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [attendanceLog, setAttendanceLog] = useState<AttendanceRecord[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [events, setEvents] = useState<{ _id: string; title: string }[]>([]);
  const scannerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html5QrRef = useRef<any>(null);
  const isScanning = useRef(false);

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(d => setEvents(d.events || []))
      .catch(() => {});
  }, []);

  const fetchAttendance = (eventId: string) => {
    if (!eventId) return;
    fetch(`/api/attendance?eventId=${eventId}`)
      .then(r => r.json())
      .then(d => setAttendanceLog(d.attended || []))
      .catch(() => {});
  };

  const startScanner = async () => {
    if (isScanning.current) return;

    try {
      // Dynamically import html5-qrcode (client-side only)
      const { Html5Qrcode } = await import('html5-qrcode');

      const scannerId = 'qr-reader-container';
      const html5Qr = new Html5Qrcode(scannerId);
      html5QrRef.current = html5Qr;
      isScanning.current = true;
      setScanStatus('scanning');

      await html5Qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText: string) => {
          // Stop scanning immediately on success
          try {
            await html5Qr.stop();
            isScanning.current = false;
          } catch { /* ignore */ }

          await handleQrResult(decodedText);
        },
        () => { /* scan failure — ignore per-frame errors */ }
      );
    } catch (err) {
      isScanning.current = false;
      setScanStatus('error');
      setErrorMsg('Camera access denied or not available. Please allow camera permissions.');
      console.error('Scanner error:', err);
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current && isScanning.current) {
      try {
        await html5QrRef.current.stop();
      } catch { /* ignore */ }
      isScanning.current = false;
    }
  };

  const handleQrResult = async (decodedText: string) => {
    try {
      let payload: { userId: string; eventId: string; name: string; rollNumber: string; eventName?: string };

      try {
        payload = JSON.parse(decodedText);
      } catch {
        setScanStatus('error');
        setErrorMsg('Invalid QR code format — not a Connect event QR code.');
        return;
      }

      if (!payload.userId || !payload.eventId) {
        setScanStatus('error');
        setErrorMsg('QR code is missing required student/event information.');
        return;
      }

      // Call attendance API
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setScanStatus('error');
        setErrorMsg(data.error || 'Failed to mark attendance.');
        return;
      }

      setScanResult({
        name: data.student?.name || payload.name || 'Unknown',
        rollNumber: data.student?.rollNumber || payload.rollNumber || '',
        eventId: payload.eventId,
        eventName: data.event?.title || payload.eventName || '',
        alreadyAttended: data.alreadyAttended,
      });

      if (data.alreadyAttended) {
        setScanStatus('duplicate');
      } else {
        setScanStatus('success');
        // Refresh attendance log
        fetchAttendance(selectedEventId || payload.eventId);
      }
    } catch {
      setScanStatus('error');
      setErrorMsg('Network error. Please check your connection.');
    }
  };

  const resetScanner = async () => {
    await stopScanner();
    setScanResult(null);
    setScanStatus('idle');
    setErrorMsg('');
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedEventId) fetchAttendance(selectedEventId);
  }, [selectedEventId]);

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-serif text-headline text-charcoal-800">QR Scanner</h1>
        <button
          onClick={() => { setShowLog(!showLog); if (!showLog && selectedEventId) fetchAttendance(selectedEventId); }}
          className="flex items-center gap-1.5 text-sm text-charcoal-500 border border-cream-300 rounded-lg px-3 py-1.5 hover:bg-cream-100 transition-colors"
        >
          <List className="w-4 h-4" />
          {showLog ? 'Hide Log' : 'Show Log'}
        </button>
      </div>
      <p className="text-charcoal-400 mb-6">Scan student QR codes to mark event attendance</p>

      {/* Event Selector */}
      <div className="glass-card p-4 mb-4">
        <label className="text-xs text-charcoal-400 uppercase tracking-wider mb-2 block">Filter by Event</label>
        <select
          value={selectedEventId}
          onChange={e => setSelectedEventId(e.target.value)}
          className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-sm text-charcoal-800 focus:outline-none focus:border-accent-red"
        >
          <option value="">All events</option>
          {events.map(ev => (
            <option key={ev._id} value={ev._id}>{ev.title}</option>
          ))}
        </select>
      </div>

      {/* Scanner Card */}
      <div className="glass-card p-6">
        {/* Camera viewport */}
        <div className="relative bg-charcoal-900 rounded-2xl overflow-hidden mb-6" style={{ minHeight: 320 }}>
          {/* html5-qrcode mounts here */}
          <div id="qr-reader-container" ref={scannerRef} className="w-full" />

          {/* Overlay states */}
          {scanStatus === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <Camera className="w-16 h-16 text-charcoal-500 mb-4" />
              <p className="text-charcoal-400 text-sm mb-6">Point your device camera at a student&apos;s QR code</p>
              <button onClick={startScanner} className="btn-primary">
                Start Camera
              </button>
            </div>
          )}

          {scanStatus === 'scanning' && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
              <span className="bg-accent-red/90 text-white text-xs px-3 py-1 rounded-full animate-pulse">
                Scanning...
              </span>
            </div>
          )}

          {scanStatus === 'success' && (
            <div className="absolute inset-0 bg-charcoal-900 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mb-4 animate-scale-in">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-white text-xl font-bold mb-1">Attendance Recorded!</h3>
              <p className="text-charcoal-300 text-sm">Successfully marked as present</p>
            </div>
          )}

          {scanStatus === 'duplicate' && (
            <div className="absolute inset-0 bg-charcoal-900 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 bg-warning rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-white text-xl font-bold mb-1">Already Attended</h3>
              <p className="text-charcoal-300 text-sm">This student was already marked present</p>
            </div>
          )}

          {scanStatus === 'error' && (
            <div className="absolute inset-0 bg-charcoal-900 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 bg-accent-red rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Error</h3>
              <p className="text-charcoal-300 text-sm">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Scan Result Details */}
        {scanResult && (scanStatus === 'success' || scanStatus === 'duplicate') && (
          <div className={`mb-6 border rounded-xl p-4 ${scanStatus === 'duplicate' ? 'bg-warning/5 border-warning/20' : 'bg-success/5 border-success/10'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${scanStatus === 'duplicate' ? 'bg-warning/10' : 'bg-success/10'}`}>
                <User className={`w-6 h-6 ${scanStatus === 'duplicate' ? 'text-warning' : 'text-success'}`} />
              </div>
              <div>
                <p className="font-semibold text-charcoal-800">{scanResult.name}</p>
                {scanResult.rollNumber && (
                  <p className="text-sm text-charcoal-400">Roll: {scanResult.rollNumber}</p>
                )}
                {scanResult.eventName && (
                  <p className="text-sm text-charcoal-400">Event: {scanResult.eventName}</p>
                )}
              </div>
              <div className="ml-auto">
                {scanStatus === 'duplicate' ? (
                  <span className="badge-elegant bg-warning/10 text-warning text-xs">Duplicate</span>
                ) : (
                  <span className="badge-elegant bg-success/10 text-success text-xs">✓ Marked</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          {scanStatus !== 'idle' && (
            <button onClick={resetScanner} className="btn-primary text-sm">
              Scan Next Student
            </button>
          )}
          {scanStatus === 'scanning' && (
            <button onClick={resetScanner} className="btn-outline text-sm">
              Stop Camera
            </button>
          )}
        </div>
      </div>

      {/* Attendance Log */}
      {showLog && (
        <div className="glass-card p-6 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-charcoal-800">
              Attendance Log
              <span className="ml-2 text-xs font-normal text-charcoal-400">({attendanceLog.length} attended)</span>
            </h3>
            <button
              onClick={() => fetchAttendance(selectedEventId)}
              className="flex items-center gap-1 text-xs text-charcoal-400 hover:text-accent-red transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {!selectedEventId && (
            <p className="text-sm text-charcoal-400 text-center py-4">Select an event above to view attendance log.</p>
          )}

          {selectedEventId && attendanceLog.length === 0 && (
            <p className="text-sm text-charcoal-400 text-center py-4">No attendance recorded yet for this event.</p>
          )}

          {attendanceLog.map((rec, i) => (
            <div key={rec._id} className={`flex items-center gap-3 py-3 ${i < attendanceLog.length - 1 ? 'border-b border-cream-200' : ''}`}>
              <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal-800">{rec.userName || 'Unknown'}</p>
                {rec.rollNumber && <p className="text-xs text-charcoal-400">{rec.rollNumber}</p>}
              </div>
              <span className="ml-auto text-xs text-charcoal-400">
                {new Date(rec.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        #qr-reader-container video {
          border-radius: 0 !important;
          width: 100% !important;
        }
        #qr-reader-container > div {
          border: none !important;
        }
        #qr-reader__scan_region {
          background: transparent !important;
        }
      `}</style>
    </div>
  );
}
