import React, { useEffect, useMemo, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { ArrowLeft, Building2, ArrowRightLeft, Landmark, CheckCircle2, AlertCircle, Lock, LogIn, Mail } from 'lucide-react';

interface StorePortalProps {
  onBack: () => void;
}

const TOKEN_TO_CASH_RATE = 1;
const STORE_LOGIN_EMAIL = 'store@nguni-wallet.local';
const STORE_LOGIN_PIN = '2468';
const STORE_DUMMY_RECEIVED_TOKENS = 4650;

const StorePortal: React.FC<StorePortalProps> = ({ onBack }) => {
  const { transactions } = useWallet();
  const [storeEmail, setStoreEmail] = useState('');
  const [storePin, setStorePin] = useState('');
  const [storeLoggedIn, setStoreLoggedIn] = useState(false);

  const [convertInput, setConvertInput] = useState('');
  const [convertedTokens, setConvertedTokens] = useState(0);
  const [cashAvailable, setCashAvailable] = useState(0);
  const [cashTransferred, setCashTransferred] = useState(0);

  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [transferInput, setTransferInput] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleStoreLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (storeEmail.trim().toLowerCase() !== STORE_LOGIN_EMAIL || storePin !== STORE_LOGIN_PIN) {
      setError('Invalid store login details.');
      return;
    }

    setStoreLoggedIn(true);
    setStorePin('');
    setSuccess('Store login successful.');
  };

  const handleStoreLogout = () => {
    setStoreLoggedIn(false);
    setStoreEmail('');
    setStorePin('');
    setSuccess('');
    setError('');
  };

  useEffect(() => {
    const saved = localStorage.getItem('store_wallet_state');
    
    // If no saved state, initialize with dummy data
    if (!saved) {
      const dummyData = {
        convertedTokens: 1250,
        cashAvailable: 3400,
        cashTransferred: 2500,
        bankName: 'First National Bank',
        accountName: 'Nguni-wallet Store',
        accountNumber: '6234891234567',
      };
      localStorage.setItem('store_wallet_state', JSON.stringify(dummyData));
      setConvertedTokens(dummyData.convertedTokens);
      setCashAvailable(dummyData.cashAvailable);
      setCashTransferred(dummyData.cashTransferred);
      setBankName(dummyData.bankName);
      setAccountName(dummyData.accountName);
      setAccountNumber(dummyData.accountNumber);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      setConvertedTokens(Number(parsed.convertedTokens || 0));
      setCashAvailable(Number(parsed.cashAvailable || 0));
      setCashTransferred(Number(parsed.cashTransferred || 0));
      setBankName(parsed.bankName || '');
      setAccountName(parsed.accountName || '');
      setAccountNumber(parsed.accountNumber || '');
    } catch {
      localStorage.removeItem('store_wallet_state');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'store_wallet_state',
      JSON.stringify({
        convertedTokens,
        cashAvailable,
        cashTransferred,
        bankName,
        accountName,
        accountNumber,
      })
    );
  }, [convertedTokens, cashAvailable, cashTransferred, bankName, accountName, accountNumber]);

  const receivedTokens = useMemo(() => {
    const liveReceivedTokens = transactions
      .filter((tx) => tx.type === 'received' && tx.status === 'completed')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    return liveReceivedTokens > 0 ? liveReceivedTokens : STORE_DUMMY_RECEIVED_TOKENS;
  }, [transactions]);

  const availableToConvert = Math.max(0, receivedTokens - convertedTokens);

  const formatTokens = (amount: number) =>
    `${new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 2 }).format(amount)} tokens`;

  const formatCash = (amount: number) =>
    `R${new Intl.NumberFormat('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;

  const handleConvert = () => {
    setError('');
    setSuccess('');

    const amount = Number(convertInput);
    if (!amount || amount <= 0) {
      setError('Enter a valid token amount to convert.');
      return;
    }
    if (amount > availableToConvert) {
      setError('You cannot convert more than your received tokens.');
      return;
    }

    const cashValue = amount * TOKEN_TO_CASH_RATE;
    setConvertedTokens((prev) => prev + amount);
    setCashAvailable((prev) => prev + cashValue);
    setConvertInput('');
    setSuccess(`Converted ${formatTokens(amount)} to ${formatCash(cashValue)}.`);
  };

  const handleTransfer = () => {
    setError('');
    setSuccess('');

    const amount = Number(transferInput);
    if (!bankName || !accountName || !accountNumber) {
      setError('Fill in bank name, account name, and account number.');
      return;
    }
    if (!amount || amount <= 0) {
      setError('Enter a valid cash amount to transfer.');
      return;
    }
    if (amount > cashAvailable) {
      setError('Transfer amount exceeds available cash.');
      return;
    }

    setCashAvailable((prev) => prev - amount);
    setCashTransferred((prev) => prev + amount);
    setTransferInput('');
    setSuccess(`Transfer request submitted: ${formatCash(amount)} to ${bankName}.`);
  };

  if (!storeLoggedIn) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">Store Side Login</h2>
            <p className="text-sm text-white/40">Use static store credentials to continue</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 max-w-xl">
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-200/80 space-y-1">
            <p>Static login details:</p>
            <p>Email: {STORE_LOGIN_EMAIL}</p>
            <p>PIN: {STORE_LOGIN_PIN}</p>
          </div>

          <form onSubmit={handleStoreLogin} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                placeholder="Store email"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-rose-500/50"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="password"
                value={storePin}
                onChange={(e) => setStorePin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Store PIN"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-rose-500/50"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-xl py-3 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Enter Store Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white/70" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">Store Side</h2>
          <p className="text-sm text-white/40">Convert received tokens and transfer to your bank</p>
          <p className="text-xs text-white/30 mt-1">Signed in with static store credentials</p>
        </div>
        <button
          onClick={handleStoreLogout}
          className="ml-auto bg-white/5 hover:bg-white/10 text-white/70 px-3 py-2 rounded-lg text-xs transition-colors"
        >
          Store Logout
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Received Tokens</p>
          <p className="text-lg font-bold text-white">{formatTokens(receivedTokens)}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Available to Convert</p>
          <p className="text-lg font-bold text-white">{formatTokens(availableToConvert)}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Cash Ready</p>
          <p className="text-lg font-bold text-white">{formatCash(cashAvailable)}</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Convert Tokens to Money</h3>
        </div>

        <p className="text-xs text-white/40">Rate: 1 token = {formatCash(TOKEN_TO_CASH_RATE)}</p>

        <div className="flex gap-2">
          <input
            type="number"
            value={convertInput}
            onChange={(e) => setConvertInput(e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-rose-500/50"
          />
          <button
            onClick={handleConvert}
            className="bg-rose-500 hover:bg-rose-600 text-white px-5 rounded-xl text-sm font-semibold transition-colors"
          >
            Convert
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-pink-400" />
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Transfer to Bank</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="Bank name"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-pink-500/50"
          />
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Account holder"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-pink-500/50"
          />
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
            placeholder="Account number"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-pink-500/50"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={transferInput}
              onChange={(e) => setTransferInput(e.target.value)}
              placeholder="Cash amount"
              min="0"
              step="0.01"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-pink-500/50"
            />
            <button
              onClick={handleTransfer}
              className="bg-pink-500 hover:bg-pink-600 text-white px-5 rounded-xl text-sm font-semibold transition-colors"
            >
              Transfer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Transferred to Bank</p>
            <p className="text-base font-bold text-white">{formatCash(cashTransferred)}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-white/40" />
            <p className="text-xs text-white/40">Use this panel to process merchant withdrawals from received tokens.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorePortal;
