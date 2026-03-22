import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Zap, ArrowLeft, Copy, Check, AlertCircle, X, Clock, Shield, RefreshCw, QrCode, Camera, CameraOff, ScanLine } from 'lucide-react';

interface OTPGeneratorProps {
  onBack: () => void;
}

/* ───────── QR Code Display (uses goqr.me public API) ───────── */
const QRCodeDisplay: React.FC<{ code: string; amount: number }> = ({ code, amount }) => {
  const qrData = JSON.stringify({ type: 'tokenvault_otp', code, amount, ts: Date.now() });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&bgcolor=0f172a&color=22d3ee&format=svg`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative p-3 bg-white rounded-2xl shadow-lg shadow-cyan-500/10">
        <img
          src={qrUrl}
          alt="Payment QR Code"
          width={180}
          height={180}
          className="rounded-lg"
          style={{ imageRendering: 'pixelated' }}
        />
        {/* Overlay logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow">
            <Shield className="w-5 h-5 text-cyan-600" />
          </div>
        </div>
      </div>
      <p className="text-white/30 text-xs flex items-center gap-1.5">
        <QrCode className="w-3.5 h-3.5" /> Scan to pay <span className="font-bold text-white/50">{amount.toFixed(2)} tokens</span>
      </p>
    </div>
  );
};

/* ───────── QR Scanner (uses native BarcodeDetector or manual fallback) ───────── */
const QRScanner: React.FC<{ onScan: (data: string) => void; onClose: () => void }> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const [cameraError, setCameraError] = useState('');
  const [scanning, setScanning] = useState(true);

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) { clearInterval(scanIntervalRef.current); scanIntervalRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Try native BarcodeDetector first
        if ('BarcodeDetector' in window) {
          const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
          scanIntervalRef.current = window.setInterval(async () => {
            if (!videoRef.current || videoRef.current.readyState < 2) return;
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const raw = barcodes[0].rawValue;
                if (raw) { setScanning(false); onScan(raw); stopCamera(); }
              }
            } catch { /* ignore detection errors */ }
          }, 300);
        } else {
          // Fallback: capture frames to canvas for manual processing hint
          // Since we can't decode without a library, show manual entry prompt
          setCameraError('QR scanning requires a supported browser (Chrome 83+). Please enter the code manually.');
        }
      } catch (err: any) {
        if (!cancelled) setCameraError(err.message || 'Camera access denied. Please allow camera permissions.');
      }
    };

    startCamera();
    return () => { cancelled = true; stopCamera(); };
  }, [onScan, stopCamera]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Scan QR Code</h3>
          </div>
          <button onClick={() => { stopCamera(); onClose(); }} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        {/* Camera View */}
        <div className="relative aspect-square bg-black">
          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <CameraOff className="w-12 h-12 text-white/20 mb-3" />
              <p className="text-white/50 text-sm">{cameraError}</p>
            </div>
          ) : (
            <>
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <canvas ref={canvasRef} className="hidden" />
              {/* Scan overlay */}
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-56 h-56 relative">
                    {/* Corner brackets */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />
                    {/* Scanning line animation */}
                    <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce" style={{ top: '50%' }} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="p-4 text-center">
          <p className="text-white/30 text-xs">Point your camera at a TokenVault payment QR code</p>
        </div>
      </div>
    </div>
  );
};

/* ───────── Main OTP Generator Component ───────── */
const OTPGenerator: React.FC<OTPGeneratorProps> = ({ onBack }) => {
  const { generateOTP, validateOTP, balance, loading, otps, refreshOTPs } = useWallet();
  const [amount, setAmount] = useState('');
  const [activeOTP, setActiveOTP] = useState<{ code: string; amount: number; expires_at: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'generate' | 'validate' | 'scan'>('generate');
  const [validateCode, setValidateCode] = useState('');
  const [validateResult, setValidateResult] = useState<{ valid: boolean; amount?: number; error?: string } | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showQR, setShowQR] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const quickAmounts = [5, 10, 15, 20, 25, 50];

  useEffect(() => {
    if (activeOTP) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const expiry = new Date(activeOTP.expires_at).getTime();
        const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          setActiveOTP(null);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      };
      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [activeOTP]);

  const handleGenerate = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setError('Enter a valid amount'); return; }
    if (amt > balance) { setError('Insufficient balance'); return; }
    setError('');
    const result = await generateOTP(amt);
    if (result.success && result.otp) {
      setActiveOTP(result.otp);
      setAmount('');
      setShowQR(true);
    } else {
      setError(result.error || 'Failed to generate OTP');
    }
  };

  const handleValidate = async (code?: string) => {
    const codeToValidate = code || validateCode;
    if (codeToValidate.length !== 6) { setError('Enter a 6-digit OTP code'); return; }
    setError('');
    setValidateResult(null);
    const result = await validateOTP(codeToValidate);
    if (result.success) {
      setValidateResult({ valid: true, amount: result.amount });
      setValidateCode('');
    } else {
      setValidateResult({ valid: false, error: result.error });
    }
  };

  const handleQRScan = (rawData: string) => {
    setShowScanner(false);
    try {
      const parsed = JSON.parse(rawData);
      if (parsed.type === 'tokenvault_otp' && parsed.code) {
        setValidateCode(parsed.code);
        setMode('validate');
        // Auto-validate
        setTimeout(() => handleValidate(parsed.code), 300);
      } else {
        setError('Invalid QR code format');
      }
    } catch {
      // Try as plain 6-digit code
      const cleaned = rawData.replace(/\D/g, '').slice(0, 6);
      if (cleaned.length === 6) {
        setValidateCode(cleaned);
        setMode('validate');
        setTimeout(() => handleValidate(cleaned), 300);
      } else {
        setError('Could not read payment data from QR code');
      }
    }
  };

  const copyToClipboard = async () => {
    if (activeOTP) {
      try {
        await navigator.clipboard.writeText(activeOTP.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { /* ignore */ }
    }
  };

  const getTimerColor = () => {
    if (timeLeft > 30) return 'text-green-400';
    if (timeLeft > 10) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTimerBg = () => {
    if (timeLeft > 30) return 'from-green-500';
    if (timeLeft > 10) return 'from-yellow-500';
    return 'from-red-500';
  };

  const formatOTPCode = (code: string) =>
    code.split('').map((digit, i) => (
      <span key={i} className="inline-flex items-center justify-center w-11 h-14 lg:w-12 lg:h-16 bg-white/10 border border-white/20 rounded-xl text-2xl lg:text-3xl font-mono font-bold text-white">
        {digit}
      </span>
    ));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white/70" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">Payment OTP</h2>
          <p className="text-sm text-white/40">Generate codes or scan to pay</p>
        </div>
      </div>

      {/* Mode Toggle — 3 tabs */}
      <div className="flex bg-white/5 rounded-xl p-1 gap-1">
        <button
          onClick={() => { setMode('generate'); setError(''); setValidateResult(null); }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
            mode === 'generate' ? 'bg-cyan-500 text-white shadow-lg' : 'text-white/40 hover:text-white/70'
          }`}
        >
          <Zap className="w-4 h-4" /> Generate
        </button>
        <button
          onClick={() => { setMode('scan'); setError(''); setValidateResult(null); setShowScanner(true); }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
            mode === 'scan' ? 'bg-cyan-500 text-white shadow-lg' : 'text-white/40 hover:text-white/70'
          }`}
        >
          <ScanLine className="w-4 h-4" /> Scan
        </button>
        <button
          onClick={() => { setMode('validate'); setError(''); setActiveOTP(null); }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
            mode === 'validate' ? 'bg-cyan-500 text-white shadow-lg' : 'text-white/40 hover:text-white/70'
          }`}
        >
          <Shield className="w-4 h-4" /> Validate
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4 text-red-400/50" /></button>
        </div>
      )}

      {/* ─── GENERATE MODE ─── */}
      {mode === 'generate' && (
        <>
          {activeOTP && timeLeft > 0 ? (
            <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/20 rounded-2xl p-6 text-center">
              {/* Timer */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className={`w-5 h-5 ${getTimerColor()}`} />
                <span className={`text-lg font-bold font-mono ${getTimerColor()}`}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 mb-5">
                <div className={`h-full rounded-full bg-gradient-to-r ${getTimerBg()} to-transparent transition-all duration-1000`} style={{ width: `${(timeLeft / 60) * 100}%` }} />
              </div>

              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">One-Time Payment Code</p>
              <div className="flex items-center justify-center gap-1.5 mb-4">
                {formatOTPCode(activeOTP.code)}
              </div>

              {/* QR Code Toggle & Display */}
              <div className="my-5">
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="inline-flex items-center gap-2 text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors mb-3"
                >
                  <QrCode className="w-4 h-4" />
                  {showQR ? 'Hide QR Code' : 'Show QR Code'}
                </button>
                {showQR && <QRCodeDisplay code={activeOTP.code} amount={activeOTP.amount} />}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-3">
                <button onClick={copyToClipboard} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-white/50 text-sm">Amount: <span className="text-white font-bold">{activeOTP.amount.toFixed(2)} tokens</span></p>
                <p className="text-white/30 text-xs mt-1">Single-use · Expires in {timeLeft}s · Non-reusable</p>
              </div>
            </div>
          ) : (
            <>
              {/* Amount Input */}
              <div>
                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Payment Amount</h3>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-semibold">TOK</span>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" min="0.01" max={balance} step="0.01"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-14 pr-4 py-4 text-white text-lg font-semibold placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all" />
                </div>
                <p className="text-xs text-white/30 mt-2">Available: {balance.toFixed(2)} tokens</p>
              </div>

              {/* Quick Amounts */}
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map(amt => (
                  <button key={amt} onClick={() => setAmount(amt.toString())} disabled={amt > balance}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${parseFloat(amount) === amt ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400' : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70 disabled:opacity-30'}`}>
                    {amt} tokens
                  </button>
                ))}
              </div>

              {/* Generate Button */}
              <button onClick={handleGenerate} disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance || loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-4 rounded-xl font-semibold hover:from-cyan-600 hover:to-teal-600 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Zap className="w-5 h-5" /> Generate OTP + QR Code</>}
              </button>

              {/* Info */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-semibold text-white/60 flex items-center gap-2"><Shield className="w-4 h-4 text-cyan-400" /> How it works</h4>
                <ul className="space-y-1.5 text-xs text-white/40">
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />A 6-digit code + QR code are generated for the payment amount</li>
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />The merchant scans the QR or enters the code manually</li>
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />Code expires after 60 seconds and can only be used once</li>
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />If expired unused, tokens are refunded to your balance</li>
                </ul>
              </div>
            </>
          )}

          {/* Recent OTPs */}
          {otps.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Recent OTPs</h3>
                <button onClick={refreshOTPs} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"><RefreshCw className="w-3.5 h-3.5 text-white/30" /></button>
              </div>
              <div className="space-y-2">
                {otps.slice(0, 5).map(otp => (
                  <div key={otp.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className={`p-2 rounded-lg ${otp.status === 'active' ? 'bg-green-400/10' : otp.status === 'used' ? 'bg-blue-400/10' : 'bg-red-400/10'}`}>
                      <Zap className={`w-3.5 h-3.5 ${otp.status === 'active' ? 'text-green-400' : otp.status === 'used' ? 'text-blue-400' : 'text-red-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-white/70">{otp.code}</p>
                      <p className="text-xs text-white/30">{Number(otp.amount).toFixed(2)} tokens</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${otp.status === 'active' ? 'bg-green-500/10 text-green-400' : otp.status === 'used' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}>{otp.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── SCAN MODE ─── */}
      {mode === 'scan' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
              <ScanLine className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Scan to Pay</h3>
            <p className="text-sm text-white/40 mb-6">Point your camera at a TokenVault payment QR code to instantly validate and complete the payment.</p>
            <button
              onClick={() => setShowScanner(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-8 py-3.5 rounded-xl font-semibold hover:from-cyan-600 hover:to-teal-600 transition-all shadow-lg shadow-cyan-500/25"
            >
              <Camera className="w-5 h-5" /> Open Camera
            </button>
          </div>

          {/* Manual fallback */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs text-white/40 mb-3">Or enter the 6-digit code manually:</p>
            <div className="flex gap-2">
              <input type="text" value={validateCode} onChange={e => setValidateCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-mono font-bold text-center placeholder-white/10 focus:outline-none focus:border-cyan-500/50 tracking-[0.4em]" />
              <button onClick={() => handleValidate()} disabled={validateCode.length !== 6 || loading}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-30">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify'}
              </button>
            </div>
          </div>

          {validateResult && (
            <div className={`rounded-xl p-5 text-center ${validateResult.valid ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              {validateResult.valid ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3"><Check className="w-6 h-6 text-green-400" /></div>
                  <h4 className="text-lg font-bold text-green-400">Payment Verified</h4>
                  <p className="text-green-300/70 text-sm mt-1">Amount: {validateResult.amount?.toFixed(2)} tokens</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3"><X className="w-6 h-6 text-red-400" /></div>
                  <h4 className="text-lg font-bold text-red-400">Invalid OTP</h4>
                  <p className="text-red-300/70 text-sm mt-1">{validateResult.error || 'Code is invalid or expired'}</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── VALIDATE MODE ─── */}
      {mode === 'validate' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-1">Validate Payment OTP</h3>
            <p className="text-sm text-white/40 mb-5">Enter the 6-digit code or scan a QR code</p>

            <div className="relative mb-4">
              <input type="text" value={validateCode} onChange={e => setValidateCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-2xl font-mono font-bold text-center placeholder-white/10 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 transition-all tracking-[0.5em]" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => handleValidate()} disabled={validateCode.length !== 6 || loading}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3.5 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-30 flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Shield className="w-5 h-5" /> Validate</>}
              </button>
              <button onClick={() => setShowScanner(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-3.5 rounded-xl font-semibold transition-all flex items-center gap-2">
                <ScanLine className="w-5 h-5" />
              </button>
            </div>
          </div>

          {validateResult && (
            <div className={`rounded-xl p-5 text-center ${validateResult.valid ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              {validateResult.valid ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3"><Check className="w-6 h-6 text-green-400" /></div>
                  <h4 className="text-lg font-bold text-green-400">Payment Verified</h4>
                  <p className="text-green-300/70 text-sm mt-1">Amount: {validateResult.amount?.toFixed(2)} tokens</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3"><X className="w-6 h-6 text-red-400" /></div>
                  <h4 className="text-lg font-bold text-red-400">Invalid OTP</h4>
                  <p className="text-red-300/70 text-sm mt-1">{validateResult.error || 'Code is invalid or expired'}</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* QR Scanner Modal */}
      {showScanner && <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />}
    </div>
  );
};

export default OTPGenerator;
