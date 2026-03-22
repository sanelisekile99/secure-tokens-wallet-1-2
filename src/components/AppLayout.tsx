import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import LandingPage from '@/components/wallet/LandingPage';
import LoginRegister from '@/components/wallet/LoginRegister';
import Dashboard from '@/components/wallet/Dashboard';
import TokenPurchase from '@/components/wallet/TokenPurchase';
import OTPGenerator from '@/components/wallet/OTPGenerator';
import TransactionHistory from '@/components/wallet/TransactionHistory';
import Settings from '@/components/wallet/Settings';
import StorePortal from '@/components/wallet/StorePortal';
import {
  LayoutDashboard, CreditCard, Zap, Clock, Settings as SettingsIcon,
  Shield, Bell, LogOut, Menu, X, Wallet
} from 'lucide-react';

type ViewType = 'dashboard' | 'purchase' | 'otp' | 'history' | 'store' | 'settings';

const AppLayout: React.FC = () => {
  const { isAuthenticated, user, balance, logout } = useWallet();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showStore, setShowStore] = useState(false);

  // Show landing page if not authenticated and not showing auth
  if (!isAuthenticated && showStore) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-4 lg:p-8">
        <main className="max-w-5xl mx-auto">
          <StorePortal onBack={() => setShowStore(false)} />
        </main>
      </div>
    );
  }

  if (!isAuthenticated && !showAuth) {
    return (
      <div className="relative">
        <LandingPage onGetStarted={() => setShowAuth(true)} />
        <button
          onClick={() => setShowStore(true)}
          className="fixed bottom-6 right-6 z-50 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 transition-colors"
        >
          Store Portal
        </button>
      </div>
    );
  }

  // Show login/register if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="relative">
        <LoginRegister />
        <button
          onClick={() => setShowAuth(false)}
          className="fixed top-6 left-6 z-50 flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
        >
          <X className="w-4 h-4" /> Back
        </button>
      </div>
    );
  }

  const navItems: { id: ViewType; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'purchase', label: 'Buy Tokens', icon: CreditCard },
    { id: 'otp', label: 'Pay with OTP', icon: Zap },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'store', label: 'Store Side', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const formatTokens = (amount: number) => {
    return `${new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 2 }).format(amount)} tokens`;
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view as ViewType);
    setSidebarOpen(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'purchase':
        return <TokenPurchase onBack={() => setCurrentView('dashboard')} />;
      case 'otp':
        return <OTPGenerator onBack={() => setCurrentView('dashboard')} />;
      case 'history':
        return <TransactionHistory onBack={() => setCurrentView('dashboard')} />;
      case 'store':
        return <StorePortal onBack={() => setCurrentView('dashboard')} />;
      case 'settings':
        return <Settings onBack={() => setCurrentView('dashboard')} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-slate-900/95 backdrop-blur-xl border-r border-white/5 z-50 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight">TokenVault</h1>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest">Secure Wallet</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>
          </div>

          {/* User Card */}
          <div className="p-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: user?.avatar_color || '#0EA5E9' }}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.full_name}</p>
                  <p className="text-xs text-white/30 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-[10px] text-white/30 uppercase tracking-wider">Balance</p>
                <p className="text-xl font-bold text-white">{formatTokens(balance)}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-2">
            <p className="text-[10px] text-white/20 uppercase tracking-widest font-semibold mb-2 px-3">Menu</p>
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    currentView === item.id
                      ? 'bg-blue-500/15 text-blue-400 shadow-lg shadow-blue-500/5'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  <span>{item.label}</span>
                  {currentView === item.id && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/5">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-[18px] h-[18px]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Menu className="w-5 h-5 text-white/70" />
              </button>
              <div className="lg:hidden flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-white text-sm">TokenVault</span>
              </div>
              <div className="hidden lg:block">
                <h2 className="text-lg font-bold text-white capitalize">
                  {currentView === 'otp'
                    ? 'Payment OTP'
                    : currentView === 'purchase'
                    ? 'Buy Tokens'
                    : currentView === 'store'
                    ? 'Store Side'
                    : currentView}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2">
                <Wallet className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold text-white">{formatTokens(balance)}</span>
              </div>
              <button className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Bell className="w-5 h-5 text-white/50" />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
              </button>
              <button
                onClick={() => handleNavigate('settings')}
                className="flex items-center gap-2"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: user?.avatar_color || '#0EA5E9' }}
                >
                  {initials}
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8 max-w-5xl mx-auto">
          {renderView()}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 mt-12">
          <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-white">TokenVault</span>
                </div>
                <p className="text-xs text-white/30 leading-relaxed">
                  Secure digital payment platform with encrypted token storage and one-time payment codes.
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Product</h4>
                <ul className="space-y-2">
                  {['Digital Tokens', 'OTP Payments', 'Card Linking', 'Transaction History'].map(item => (
                    <li key={item}>
                      <button onClick={() => handleNavigate(item === 'Digital Tokens' ? 'purchase' : item === 'OTP Payments' ? 'otp' : item === 'Transaction History' ? 'history' : 'dashboard')} className="text-xs text-white/30 hover:text-white/60 transition-colors">{item}</button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Security</h4>
                <ul className="space-y-2">
                  {['Encryption', 'PIN Protection', 'Biometric Auth', 'Zero Knowledge'].map(item => (
                    <li key={item}>
                      <button onClick={() => handleNavigate('settings')} className="text-xs text-white/30 hover:text-white/60 transition-colors">{item}</button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Support</h4>
                <ul className="space-y-2">
                  {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map(item => (
                    <li key={item}>
                      <button className="text-xs text-white/30 hover:text-white/60 transition-colors">{item}</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="border-t border-white/5 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-white/20">2026 TokenVault. All rights reserved.</p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-white/20">All systems operational</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;
