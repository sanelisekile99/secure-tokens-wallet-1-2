import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, Clock, TrendingUp, Shield, Zap, RefreshCw } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, balance, transactions, refreshBalance, loading } = useWallet();

  const recentTransactions = transactions.slice(0, 5);

  const totalPurchased = transactions
    .filter(t => t.type === 'purchase' && t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalPayments = transactions
    .filter(t => t.type === 'payment' && t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const pendingPayments = transactions
    .filter(t => t.status === 'pending')
    .length;

  const formatTokens = (amount: number) => {
    return `${new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 2 }).format(amount)} tokens`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
      case 'received': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-400';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400';
      case 'expired': return 'bg-red-500/10 text-red-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 lg:p-8 shadow-2xl shadow-blue-900/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-200/70" />
              <span className="text-blue-200/70 text-sm font-medium">Available Balance</span>
            </div>
            <button
              onClick={refreshBalance}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="Refresh balance"
            >
              <RefreshCw className={`w-4 h-4 text-white/70 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="mb-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">{formatTokens(balance)}</h2>
            <p className="text-blue-200/50 text-sm mt-1">Digital Token Balance</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('purchase')}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all backdrop-blur-sm"
            >
              <CreditCard className="w-4 h-4" /> Buy Tokens
            </button>
            <button
              onClick={() => onNavigate('otp')}
              className="flex items-center gap-2 bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-100 px-5 py-2.5 rounded-xl text-sm font-medium transition-all backdrop-blur-sm"
            >
              <Zap className="w-4 h-4" /> Generate OTP
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-green-400/10">
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
            </div>
            <span className="text-xs text-white/40">Purchased</span>
          </div>
          <p className="text-lg font-bold text-white">{formatTokens(totalPurchased)}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-orange-400/10">
              <ArrowUpRight className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <span className="text-xs text-white/40">Spent</span>
          </div>
          <p className="text-lg font-bold text-white">{formatTokens(totalPayments)}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-yellow-400/10">
              <Clock className="w-3.5 h-3.5 text-yellow-400" />
            </div>
            <span className="text-xs text-white/40">Pending</span>
          </div>
          <p className="text-lg font-bold text-white">{pendingPayments}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-400/10">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-xs text-white/40">Transactions</span>
          </div>
          <p className="text-lg font-bold text-white">{transactions.length}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Buy Tokens', icon: CreditCard, color: 'from-blue-500 to-blue-600', view: 'purchase' },
            { label: 'Pay with OTP', icon: Zap, color: 'from-cyan-500 to-teal-500', view: 'otp' },
            { label: 'History', icon: Clock, color: 'from-purple-500 to-indigo-500', view: 'history' },
            { label: 'Settings', icon: Shield, color: 'from-slate-500 to-slate-600', view: 'settings' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => onNavigate(action.view)}
              className="flex flex-col items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all group"
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} shadow-lg group-hover:scale-110 transition-transform`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-white/60 group-hover:text-white/90 transition-colors">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Recent Activity</h3>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            View All
          </button>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {recentTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-8 h-8 text-white/10 mx-auto mb-2" />
              <p className="text-white/30 text-sm">No transactions yet</p>
              <p className="text-white/15 text-xs mt-1">Purchase tokens to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
                  <div className={`p-2 rounded-lg ${getTypeColor(tx.type)}`}>
                    {getTypeIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90 truncate">{tx.description}</p>
                    <p className="text-xs text-white/30">{formatDate(tx.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${tx.type === 'purchase' || tx.type === 'received' ? 'text-green-400' : 'text-white/70'}`}>
                      {tx.type === 'purchase' || tx.type === 'received' ? '+' : '-'}{formatTokens(Number(tx.amount))}
                    </p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${getStatusBadge(tx.status)}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
