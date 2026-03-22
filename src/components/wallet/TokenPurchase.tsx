import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { CreditCard, Plus, Check, ArrowLeft, Coins, AlertCircle, X } from 'lucide-react';

interface TokenPurchaseProps {
  onBack: () => void;
}

const TokenPurchase: React.FC<TokenPurchaseProps> = ({ onBack }) => {
  const { purchaseTokens, addCard, cards, balance, loading, refreshCards } = useWallet();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [processing, setProcessing] = useState(false);

  const presetAmounts = [5, 10, 20, 50, 100, 250];

  const getAmount = () => {
    if (selectedAmount) return selectedAmount;
    const custom = parseFloat(customAmount);
    return isNaN(custom) ? 0 : custom;
  };

  const handlePurchase = async () => {
    const amount = getAmount();
    if (amount <= 0) { setError('Please select or enter an amount'); return; }
    if (amount > 10000) { setError('Maximum purchase is 10,000 tokens'); return; }

    setError('');
    setSuccess('');
    setProcessing(true);

    // Simulate processing delay
    await new Promise(r => setTimeout(r, 1500));

    const result = await purchaseTokens(amount, cards[0]?.id);
    setProcessing(false);

    if (result.success) {
      setSuccess(`Successfully purchased ${amount.toFixed(2)} tokens!`);
      setSelectedAmount(null);
      setCustomAmount('');
    } else {
      setError(result.error || 'Purchase failed');
    }
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
      setCardNumber('');
      setCardHolder('');
      setCardExpiry('');
      setCardCvv('');
      await refreshCards();
    } else {
      setError(result.error || 'Failed to add card');
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s/g, '').replace(/\D/g, '').slice(0, 16);
    return v.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 2) return v.slice(0, 2) + '/' + v.slice(2);
    return v;
  };

  const getCardIcon = (type: string) => {
    const colors: Record<string, string> = {
      visa: 'from-blue-600 to-blue-800',
      mastercard: 'from-red-500 to-orange-500',
      amex: 'from-slate-600 to-slate-800',
      discover: 'from-orange-500 to-yellow-500'
    };
    return colors[type] || 'from-gray-600 to-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white/70" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">Buy Tokens</h2>
          <p className="text-sm text-white/40">Purchase digital tokens with your card</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4 text-red-400/50" /></button>
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
          <p className="text-green-400 text-sm">{success}</p>
          <button onClick={() => setSuccess('')} className="ml-auto"><X className="w-4 h-4 text-green-400/50" /></button>
        </div>
      )}

      {/* Preset Amounts */}
      <div>
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Select Amount</h3>
        <div className="grid grid-cols-3 gap-3">
          {presetAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }}
              className={`relative p-4 rounded-xl border transition-all text-center group ${
                selectedAmount === amount
                  ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/10'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {selectedAmount === amount && (
                <div className="absolute top-2 right-2">
                  <Check className="w-3.5 h-3.5 text-blue-400" />
                </div>
              )}
              <Coins className={`w-5 h-5 mx-auto mb-1.5 ${selectedAmount === amount ? 'text-blue-400' : 'text-white/30 group-hover:text-white/50'} transition-colors`} />
              <p className={`text-lg font-bold ${selectedAmount === amount ? 'text-blue-400' : 'text-white/80'}`}>{amount} tokens</p>
              <p className="text-[10px] text-white/30 mt-0.5">{amount} tokens</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Amount */}
      <div>
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Or Enter Custom Amount</h3>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-semibold">TOK</span>
          <input
            type="number"
            value={customAmount}
            onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
            placeholder="0.00"
            min="1"
            max="10000"
            step="0.01"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-14 pr-4 py-4 text-white text-lg font-semibold placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all"
          />
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Payment Method</h3>
          <button
            onClick={() => setShowAddCard(true)}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Card
          </button>
        </div>

        {cards.length === 0 ? (
          <button
            onClick={() => setShowAddCard(true)}
            className="w-full bg-white/5 border border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/10 hover:border-white/30 transition-all group"
          >
            <CreditCard className="w-8 h-8 text-white/20 mx-auto mb-2 group-hover:text-white/40 transition-colors" />
            <p className="text-sm text-white/40 group-hover:text-white/60 transition-colors">Add a payment card to continue</p>
          </button>
        ) : (
          <div className="space-y-2">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  card.is_default ? 'bg-white/10 border-blue-500/30' : 'bg-white/5 border-white/10'
                }`}
              >
                <div className={`w-10 h-7 rounded bg-gradient-to-r ${getCardIcon(card.card_type)} flex items-center justify-center`}>
                  <CreditCard className="w-4 h-4 text-white/80" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/90 capitalize">{card.card_type} •••• {card.card_last_four}</p>
                  <p className="text-xs text-white/30">{card.card_holder} · {card.expiry_month}/{card.expiry_year}</p>
                </div>
                {card.is_default && (
                  <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">Default</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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
            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5 block">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 text-sm tracking-wider"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5 block">Card Holder</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={e => setCardHolder(e.target.value.toUpperCase())}
                  placeholder="JOHN DOE"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 text-sm uppercase"
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5 block">CVV</label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="•••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-semibold text-sm hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? 'Adding...' : 'Add Card'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Summary & Button */}
      {getAmount() > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/50">Token Amount</span>
            <span className="text-sm font-semibold text-white">{getAmount().toFixed(2)} tokens</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/50">Processing Fee</span>
            <span className="text-sm font-semibold text-green-400">0 tokens</span>
          </div>
          <div className="border-t border-white/10 pt-2 mt-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-white/70">Total</span>
            <span className="text-lg font-bold text-white">{getAmount().toFixed(2)} tokens</span>
          </div>
        </div>
      )}

      <button
        onClick={handlePurchase}
        disabled={getAmount() <= 0 || processing || (cards.length === 0)}
        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            {cards.length === 0 ? 'Add a Card First' : `Purchase ${getAmount().toFixed(2)} Tokens`}
          </>
        )}
      </button>
    </div>
  );
};

export default TokenPurchase;
