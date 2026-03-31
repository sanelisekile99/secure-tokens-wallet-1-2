import React from 'react';
import { Shield, Zap, Lock, CreditCard, ArrowRight, Coins, Globe, Clock, Fingerprint, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-pink-950 to-slate-900 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-rose-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-fuchsia-500/5 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Nguni-wallet</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-white/50 hover:text-white/80 transition-colors">Features</a>
          <a href="#security" className="text-sm text-white/50 hover:text-white/80 transition-colors">Security</a>
          <a href="#how-it-works" className="text-sm text-white/50 hover:text-white/80 transition-colors">How It Works</a>
        </div>
        <button
          onClick={onGetStarted}
          className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all border border-white/10 hover:border-white/20"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 pt-16 lg:pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium text-pink-300">Secure Digital Payments</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Pay Anywhere with
              <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent"> One-Time </span>
              Tokens
            </h1>
            <p className="text-lg text-white/40 leading-relaxed mb-8 max-w-lg">
              Purchase digital tokens, generate secure one-time payment codes, and pay at any POS device. 
              Bank-grade encryption keeps your money safe.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={onGetStarted}
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/25"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                Learn More
              </a>
            </div>
            <div className="flex items-center gap-6 mt-10">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-green-400" />
                <span className="text-xs text-white/40">AES-256 Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-pink-400" />
                <span className="text-xs text-white/40">PIN Protected</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-rose-400" />
                <span className="text-xs text-white/40">Instant Payments</span>
              </div>
            </div>
          </div>

          {/* Hero Visual - Wallet Card */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-3xl blur-2xl" />
            <div className="relative bg-gradient-to-br from-pink-600 via-pink-700 to-fuchsia-800 rounded-3xl p-8 shadow-2xl border border-white/10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-white/60" />
                    <span className="text-white/60 font-medium">Nguni-wallet</span>
                  </div>
                  <span className="text-xs text-white/30">DIGITAL WALLET</span>
                </div>
                <p className="text-white/40 text-sm mb-1">Available Balance</p>
                <p className="text-5xl font-bold text-white mb-8">1,250 tokens</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <CreditCard className="w-5 h-5 text-pink-300 mx-auto mb-1" />
                    <p className="text-[10px] text-white/50">Buy</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <Zap className="w-5 h-5 text-rose-300 mx-auto mb-1" />
                    <p className="text-[10px] text-white/50">Pay</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <Clock className="w-5 h-5 text-purple-300 mx-auto mb-1" />
                    <p className="text-[10px] text-white/50">History</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                    <div className="p-2 rounded-lg bg-rose-400/10">
                      <Zap className="w-4 h-4 text-rose-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white/80">OTP Generated</p>
                      <p className="text-xs text-white/30">847 291 · Expires in 45s</p>
                    </div>
                    <span className="text-xs text-green-400 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Everything You Need</h2>
          <p className="text-white/40 max-w-xl mx-auto">A complete digital payment ecosystem built for speed, security, and simplicity.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Coins, title: 'Digital Tokens', desc: 'Purchase prepaid tokens with your bank card. Each token represents real monetary value stored securely.', color: 'from-pink-500 to-pink-600' },
            { icon: Zap, title: 'One-Time OTP', desc: 'Generate 6-digit payment codes that expire in 60 seconds. Each code can only be used once.', color: 'from-rose-500 to-rose-500' },
            { icon: Lock, title: 'Bank-Grade Security', desc: 'AES-256 encryption, PIN authentication, and biometric login keep your funds protected.', color: 'from-fuchsia-500 to-purple-500' },
            { icon: CreditCard, title: 'Card Linking', desc: 'Securely link your bank cards for instant token purchases. Supports Visa, Mastercard, and more.', color: 'from-orange-500 to-red-500' },
            { icon: Clock, title: 'Transaction History', desc: 'Complete audit trail of every purchase, payment, and OTP with filtering and search.', color: 'from-purple-500 to-pink-500' },
            { icon: Globe, title: 'Offline Support', desc: 'Works offline with encrypted local storage. Syncs automatically when connectivity returns.', color: 'from-green-500 to-emerald-500' },
          ].map((feature, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-white/40 max-w-xl mx-auto">Three simple steps to start making secure payments.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Create Account', desc: 'Register with your email and set a secure PIN. Get 50 free welcome tokens instantly.' },
            { step: '02', title: 'Buy Tokens', desc: 'Link your bank card and purchase digital tokens in any amount from 5 to 10,000 tokens.' },
            { step: '03', title: 'Pay with OTP', desc: 'Generate a one-time 6-digit code, share it with the merchant, and the payment is complete.' },
          ].map((item, i) => (
            <div key={i} className="relative">
              <div className="text-6xl font-bold text-white/5 mb-4">{item.step}</div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
              {i < 2 && (
                <div className="hidden md:block absolute top-8 right-0 translate-x-1/2">
                  <ArrowRight className="w-6 h-6 text-white/10" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 py-20">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Security First</h2>
              <p className="text-white/40 mb-8 leading-relaxed">
                Every layer of Nguni-wallet is built with security at its core. From encrypted storage to zero-knowledge authentication, your funds are always protected.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Lock, text: 'AES-256 encrypted token storage' },
                  { icon: Fingerprint, text: 'PIN and biometric authentication' },
                  { icon: Zap, text: '60-second OTP expiration' },
                  { icon: Shield, text: 'Single-use payment codes' },
                  { icon: Globe, text: 'Secure backend synchronization' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-pink-500/10">
                      <item.icon className="w-4 h-4 text-pink-400" />
                    </div>
                    <span className="text-sm text-white/70">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-full blur-3xl" />
                <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-white/10 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-white/10 flex items-center justify-center">
                    <Shield className="w-16 h-16 text-pink-400/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12 py-20 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
        <p className="text-white/40 mb-8 max-w-lg mx-auto">Create your account in seconds and receive 50 free welcome tokens.</p>
        <button
          onClick={onGetStarted}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/25"
        >
          Create Free Account <ArrowRight className="w-5 h-5" />
        </button>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-pink-400" />
                <span className="font-bold text-white">Nguni-wallet</span>
              </div>
              <p className="text-xs text-white/30 leading-relaxed">Secure digital payments for the modern world.</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Product</h4>
              <ul className="space-y-2">
                {['Digital Tokens', 'OTP Payments', 'Card Linking', 'History'].map(item => (
                  <li key={item}><span className="text-xs text-white/30 hover:text-white/60 cursor-pointer transition-colors">{item}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Security</h4>
              <ul className="space-y-2">
                {['Encryption', 'PIN Auth', 'Biometric', 'Compliance'].map(item => (
                  <li key={item}><span className="text-xs text-white/30 hover:text-white/60 cursor-pointer transition-colors">{item}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Company</h4>
              <ul className="space-y-2">
                {['About', 'Contact', 'Privacy', 'Terms'].map(item => (
                  <li key={item}><span className="text-xs text-white/30 hover:text-white/60 cursor-pointer transition-colors">{item}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/20">2026 Nguni-wallet. All rights reserved.</p>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-white/20">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
