import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import {
  ArrowLeft, User, Shield, CreditCard, Bell, Lock, Fingerprint,
  ChevronRight, LogOut, Trash2, Plus, X, Eye, EyeOff, Check, AlertCircle,
  Smartphone, Globe, Moon, HelpCircle
} from 'lucide-react';

interface SettingsProps {
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { user, cards, logout, addCard, refreshCards, loading } = useWallet();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Toggle states for settings
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [offlineMode, setOfflineMode] = useState(true);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s/g, '').replace(/\D/g, '').slice(0, 16);
    return v.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 2) return v.slice(0, 2) + '/' + v.slice(2);
    return v;
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.length < 13) { setError('Invalid card number'); return; }
    if (!cardHolder) { setError('Card holder name required'); return; }
    if (!cardExpiry || !cardExpiry.includes('/')) { setError('Invalid expiry date'); return; }
    const [month, year] = cardExpiry.split('/');
    const result = await addCard(cleanNumber, cardHolder, parseInt(month), 2000 + parseInt(year));
    if (result.success) {
      setShowAddCard(false);
      setCardNumber(''); setCardHolder(''); setCardExpiry(''); setCardCvv('');
      setSuccess('Card added successfully');
      setTimeout(() => setSuccess(''), 3000);
      await refreshCards();
    } else {
      setError(result.error || 'Failed to add card');
    }
  };

  const getCardGradient = (type: string) => {
    const gradients: Record<string, string> = {
      visa: 'from-pink-600 via-pink-700 to-fuchsia-800',
      mastercard: 'from-red-600 via-orange-600 to-yellow-600',
      amex: 'from-slate-600 via-slate-700 to-slate-800',
      discover: 'from-orange-500 via-orange-600 to-amber-600'
    };
    return gradients[type] || 'from-gray-600 via-gray-700 to-gray-800';
  };

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-pink-500' : 'bg-white/10'}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${enabled ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white/70" />
        </button>
        <h2 className="text-xl font-bold text-white">Settings</h2>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-400" />
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg"
            style={{ backgroundColor: user?.avatar_color || '#0EA5E9' }}
          >
            {initials}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{user?.full_name}</h3>
            <p className="text-sm text-white/40">{user?.email}</p>
            {user?.phone && <p className="text-sm text-white/30">{user.phone}</p>}
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div>
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-1">Security</h3>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
          <div className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-pink-400/10">
              <Lock className="w-4 h-4 text-pink-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white/90">PIN Authentication</p>
              <p className="text-xs text-white/30">Required for login</p>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-400">Active</span>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-purple-400/10">
              <Fingerprint className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white/90">Biometric Login</p>
              <p className="text-xs text-white/30">Use fingerprint or face ID</p>
            </div>
            <ToggleSwitch enabled={biometricEnabled} onToggle={() => setBiometricEnabled(!biometricEnabled)} />
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-rose-400/10">
              <Shield className="w-4 h-4 text-rose-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white/90">Encrypted Storage</p>
              <p className="text-xs text-white/30">AES-256 encryption enabled</p>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-400">Active</span>
          </div>
        </div>
      </div>

      {/* Linked Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Linked Cards</h3>
          <button
            onClick={() => setShowAddCard(true)}
            className="text-xs text-pink-400 hover:text-pink-300 font-medium flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add Card
          </button>
        </div>

        {cards.length === 0 ? (
          <button
            onClick={() => setShowAddCard(true)}
            className="w-full bg-white/5 border border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/10 transition-all"
          >
            <CreditCard className="w-8 h-8 text-white/15 mx-auto mb-2" />
            <p className="text-sm text-white/30">No cards linked yet</p>
          </button>
        ) : (
          <div className="space-y-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`relative overflow-hidden rounded-xl p-5 bg-gradient-to-r ${getCardGradient(card.card_type)}`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <CreditCard className="w-6 h-6 text-white/60" />
                    <span className="text-xs font-medium text-white/60 uppercase">{card.card_type}</span>
                  </div>
                  <p className="text-lg font-mono text-white/90 tracking-wider mb-3">
                    •••• •••• •••• {card.card_last_four}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase">Card Holder</p>
                      <p className="text-xs font-medium text-white/80">{card.card_holder}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase">Expires</p>
                      <p className="text-xs font-medium text-white/80">{card.expiry_month}/{card.expiry_year}</p>
                    </div>
                    {card.is_default && (
                      <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-white/20 text-white">Default</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preferences */}
      <div>
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-1">Preferences</h3>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
          <div className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-yellow-400/10">
              <Bell className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white/90">Notifications</p>
              <p className="text-xs text-white/30">Transaction alerts & updates</p>
            </div>
            <ToggleSwitch enabled={notificationsEnabled} onToggle={() => setNotificationsEnabled(!notificationsEnabled)} />
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-fuchsia-400/10">
              <Moon className="w-4 h-4 text-fuchsia-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white/90">Dark Mode</p>
              <p className="text-xs text-white/30">Optimized for low light</p>
            </div>
            <ToggleSwitch enabled={darkMode} onToggle={() => setDarkMode(!darkMode)} />
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-green-400/10">
              <Globe className="w-4 h-4 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white/90">Offline Mode</p>
              <p className="text-xs text-white/30">Cache data & sync when online</p>
            </div>
            <ToggleSwitch enabled={offlineMode} onToggle={() => setOfflineMode(!offlineMode)} />
          </div>
        </div>
      </div>

      {/* About & Support */}
      <div>
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-1">About</h3>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
          <div className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-slate-400/10">
              <HelpCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white/90">Help & Support</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/20" />
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-slate-400/10">
              <Smartphone className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white/90">App Version</p>
            </div>
            <span className="text-xs text-white/30">v1.0.0</span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 py-3.5 rounded-xl font-semibold text-sm hover:bg-red-500/20 transition-all"
      >
        <LogOut className="w-4 h-4" /> Sign Out
      </button>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Sign Out?</h3>
            <p className="text-sm text-white/40 mb-6">You'll need your email and PIN to sign back in.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-white/5 border border-white/10 text-white/70 py-3 rounded-xl font-medium text-sm hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={logout}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium text-sm hover:bg-red-600 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Add Payment Card</h3>
              <button onClick={() => setShowAddCard(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5 block">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-pink-500/50 text-sm tracking-wider"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5 block">Card Holder</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={e => setCardHolder(e.target.value.toUpperCase())}
                  placeholder="JOHN DOE"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-pink-500/50 text-sm uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5 block">Expiry</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-pink-500/50 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5 block">CVV</label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="•••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-pink-500/50 text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-semibold text-sm hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? 'Adding...' : 'Add Card'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="pb-4" />
    </div>
  );
};

export default Settings;
