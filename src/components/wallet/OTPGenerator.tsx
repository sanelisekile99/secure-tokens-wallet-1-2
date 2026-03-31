import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Zap, ArrowLeft, Copy, Check, AlertCircle, X, Clock, Shield, RefreshCw, QrCode } from 'lucide-react';

interface OTPGeneratorProps {
  onBack: () => void;
}

/* ───────── QR Code Display (uses goqr.me public API) ───────── */
const QRCodeDisplay: React.FC<{ code: string; amount: number }> = ({ code, amount }) => {
  const qrData = JSON.stringify({ type: 'nguni_wallet_otp', code, amount, ts: Date.now() });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&bgcolor=0f172a&color=22d3ee&format=svg`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative p-3 bg-white rounded-2xl shadow-lg shadow-rose-500/10">
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
            <Shield className="w-5 h-5 text-rose-600" />
          </div>
        </div>
      </div>
      <p className="text-white/30 text-xs flex items-center gap-1.5">
        <QrCode className="w-3.5 h-3.5" /> Scan to pay <span className="font-bold text-white/50">{amount.toFixed(2)} tokens</span>
      </p>
    </div>
  );
};


/* ───────── Main OTP Generator Component ───────── */
const OTPGenerator: React.FC<OTPGeneratorProps> = ({ onBack }) => {
  const { generateOTP, balance, loading, otps, refreshOTPs } = useWallet();
  const [amount, setAmount] = useState('');
  const [activeOTP, setActiveOTP] = useState<{ code: string; amount: number; expires_at: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
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
          <p className="text-sm text-white/40">Generate payment codes to share with merchants</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4 text-red-400/50" /></button>
        </div>
      )}

      {/* Generate OTP Mode */}
        <>
          {activeOTP && timeLeft > 0 ? (
            <div className="bg-gradient-to-br from-rose-900/30 to-pink-900/30 border border-rose-500/20 rounded-2xl p-6 text-center">
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
                  className="inline-flex items-center gap-2 text-xs text-rose-400/70 hover:text-rose-400 transition-colors mb-3"
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-14 pr-4 py-4 text-white text-lg font-semibold placeholder-white/20 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/25 transition-all" />
                </div>
                <p className="text-xs text-white/30 mt-2">Available: {balance.toFixed(2)} tokens</p>
              </div>

              {/* Quick Amounts */}
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map(amt => (
                  <button key={amt} onClick={() => setAmount(amt.toString())} disabled={amt > balance}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${parseFloat(amount) === amt ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400' : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70 disabled:opacity-30'}`}>
                    {amt} tokens
                  </button>
                ))}
              </div>

              {/* Generate Button */}
              <button onClick={handleGenerate} disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance || loading}
                className="w-full bg-gradient-to-r from-rose-500 to-rose-500 text-white py-4 rounded-xl font-semibold hover:from-rose-600 hover:to-rose-600 transition-all shadow-lg shadow-rose-500/25 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Zap className="w-5 h-5" /> Generate OTP + QR Code</>}
              </button>

              {/* Info */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-semibold text-white/60 flex items-center gap-2"><Shield className="w-4 h-4 text-rose-400" /> How it works</h4>
                <ul className="space-y-1.5 text-xs text-white/40">
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />A 4-digit code + QR code are generated for the payment amount</li>
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />The merchant scans the QR or enters the code manually</li>
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />Code expires after 60 seconds and can only be used once</li>
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />If expired unused, tokens are refunded to your balance</li>
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
                    <div className={`p-2 rounded-lg ${otp.status === 'active' ? 'bg-green-400/10' : otp.status === 'used' ? 'bg-pink-400/10' : 'bg-red-400/10'}`}>
                      <Zap className={`w-3.5 h-3.5 ${otp.status === 'active' ? 'text-green-400' : otp.status === 'used' ? 'text-pink-400' : 'text-red-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-white/70">{otp.code}</p>
                      <p className="text-xs text-white/30">{Number(otp.amount).toFixed(2)} tokens</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${otp.status === 'active' ? 'bg-green-500/10 text-green-400' : otp.status === 'used' ? 'bg-pink-500/10 text-pink-400' : 'bg-red-500/10 text-red-400'}`}>{otp.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
    </div>
  );
};

export default OTPGenerator;
