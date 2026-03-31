import React, { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, RefreshCw, Search, Filter, Clock, Download, ChevronDown } from 'lucide-react';

interface TransactionHistoryProps {
  onBack: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onBack }) => {
  const { transactions, refreshTransactions, loading } = useWallet();
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    refreshTransactions(typeFilter);
  }, [typeFilter]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.description?.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        t.amount.toString().includes(q) ||
        t.otp_code?.includes(q) ||
        t.token_key?.toLowerCase().includes(q)
      );
    }

    switch (sortOrder) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => Number(b.amount) - Number(a.amount));
        break;
      case 'lowest':
        filtered.sort((a, b) => Number(a.amount) - Number(b.amount));
        break;
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  }, [transactions, searchQuery, sortOrder]);

  const formatTokens = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <ArrowDownLeft className="w-4 h-4" />;
      case 'payment': return <ArrowUpRight className="w-4 h-4" />;
      case 'received': return <ArrowDownLeft className="w-4 h-4" />;
      default: return <RefreshCw className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'text-green-400 bg-green-400/10';
      case 'payment': return 'text-orange-400 bg-orange-400/10';
      case 'received': return 'text-pink-400 bg-pink-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'expired': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const typeFilters = [
    { value: 'all', label: 'All' },
    { value: 'purchase', label: 'Purchases' },
    { value: 'payment', label: 'Payments' },
    { value: 'received', label: 'Received' },
    { value: 'refund', label: 'Refunds' },
  ];

  const totalIn = filteredTransactions
    .filter(t => (t.type === 'purchase' || t.type === 'received') && t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalOut = filteredTransactions
    .filter(t => t.type === 'payment' && t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white/70" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Transaction History</h2>
          <p className="text-sm text-white/40">{filteredTransactions.length} transactions</p>
        </div>
        <button
          onClick={() => refreshTransactions(typeFilter)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-white/50 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4">
          <p className="text-xs text-green-400/60 uppercase tracking-wider mb-1">Total In</p>
          <p className="text-xl font-bold text-green-400">{formatTokens(totalIn)}</p>
        </div>
        <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-4">
          <p className="text-xs text-orange-400/60 uppercase tracking-wider mb-1">Total Out</p>
          <p className="text-xl font-bold text-orange-400">{formatTokens(totalOut)}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-pink-500/50 transition-all"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${showFilters ? 'bg-pink-500/20 text-pink-400' : 'text-white/30 hover:text-white/50'}`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {showFilters && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Type</label>
              <div className="flex flex-wrap gap-2">
                {typeFilters.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setTypeFilter(f.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      typeFilter === f.value
                        ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                        : 'bg-white/5 text-white/40 border border-white/10 hover:text-white/60'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Sort By</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'newest', label: 'Newest' },
                  { value: 'oldest', label: 'Oldest' },
                  { value: 'highest', label: 'Highest' },
                  { value: 'lowest', label: 'Lowest' },
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSortOrder(s.value as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      sortOrder === s.value
                        ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                        : 'bg-white/5 text-white/40 border border-white/10 hover:text-white/60'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No transactions found</p>
            <p className="text-white/15 text-xs mt-1">
              {searchQuery ? 'Try a different search term' : 'Your transactions will appear here'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
                <div className={`p-2.5 rounded-xl ${getTypeColor(tx.type)}`}>
                  {getTypeIcon(tx.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white/90 truncate">{tx.description}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-white/30">{formatDate(tx.created_at)}</p>
                    {tx.otp_code && (
                      <span className="text-[10px] font-mono text-white/20 bg-white/5 px-1.5 py-0.5 rounded">OTP: {tx.otp_code}</span>
                    )}
                    {tx.token_key && (
                      <span className="text-[10px] font-mono text-rose-300/70 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
                        Key: {tx.token_key}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-semibold ${
                    tx.type === 'purchase' || tx.type === 'received' ? 'text-green-400' : 'text-white/70'
                  }`}>
                    {formatTokens(Number(tx.amount))}
                  </p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${getStatusStyle(tx.status)}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
