import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  User, 
  Bell, 
  Settings, 
  Plus,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Lock,
  Sparkles
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import KYCForm from '../../components/KYCForm';
import { PCIHostedFields } from '../../components/PCIHostedFields';

interface AccountData {
  id: string;
  balance: number;
  tier: number;
  daily_debit_sum: number;
  status: string;
  user: {
    full_name: string;
    kyc_level: number;
    kyc_status: string;
  };
}

interface LedgerEntryData {
  id: string;
  transactionId: string;
  direction: 'CREDIT' | 'DEBIT';
  amount: number;
  balanceAfter: number;
  ts: string;
}

interface MarketAsset {
  name: string;
  symbol: string;
  price: number; // Price in DA
  change: string;
}

interface InvestmentHolding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  averagePrice: number;
  totalCost: number;
}

const UserDashboard: React.FC = () => {
  const queryClient = useQueryClient();

  // Unified Server State Query with TanStack Query
  const { data, isLoading: loading } = useQuery<AccountData>({
    queryKey: ['account_me'],
    queryFn: () => apiRequest('/api/v1/accounts/me'),
    refetchInterval: 5000, // Background real-time transaction and balance synchronization every 5 seconds
  });

  // Query real ledger history
  const { data: historyData, isLoading: loadingHistory } = useQuery<LedgerEntryData[]>({
    queryKey: ['ledger_history'],
    queryFn: () => apiRequest('/api/v1/ledger/history'),
    refetchInterval: 5000,
  });

  // Query investment market assets
  const { data: marketData } = useQuery<MarketAsset[]>({
    queryKey: ['investment_market'],
    queryFn: () => apiRequest('/api/v1/investments/market'),
  });

  // Query current investment holdings
  const { data: holdingsData } = useQuery<InvestmentHolding[]>({
    queryKey: ['investment_holdings'],
    queryFn: () => apiRequest('/api/v1/investments/holdings'),
  });

  const [cards, setCards] = useState<Array<{ id: string; brand: string; last4: string }>>([
    { id: '1', brand: 'VISA', last4: '4242' },
  ]);
  const [isAddingCard, setIsAddingCard] = useState(false);

  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedBuyAsset, setSelectedBuyAsset] = useState<MarketAsset | null>(null);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cards' | 'invest' | 'activity' | 'settings' | 'documents'>('dashboard');
  const [transferAmount, setTransferAmount] = useState('');
  const [addAmount, setAddAmount] = useState('');
  const [buyShares, setBuyShares] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [buyMessage, setBuyMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleSendMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAmount || !recipient) return;
    
    setIsProcessing(true);
    setMessage(null);

    try {
      await apiRequest('/api/v1/transfers/p2p', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': uuidv4(),
        },
        body: JSON.stringify({
          receiverAccountId: recipient,
          amountCentimes: Math.round(Number(transferAmount)),
          reference: 'DinarFlow Transfer',
        }),
      });

      setMessage({ text: `Successfully sent ${transferAmount} DA!`, type: 'success' });
      
      // Invalidate queries to refresh balance and history instantaneously
      queryClient.invalidateQueries({ queryKey: ['account_me'] });
      queryClient.invalidateQueries({ queryKey: ['ledger_history'] });

      setTimeout(() => {
        setIsSendModalOpen(false);
        setTransferAmount('');
        setRecipient('');
        setMessage(null);
      }, 2000);
    } catch (err: any) {
      setMessage({ text: err.message || 'Transfer failed.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addAmount) return;
    
    setIsProcessing(true);
    setMessage(null);
    try {
      await apiRequest('/api/v1/accounts/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': uuidv4(),
        },
        body: JSON.stringify({
          amount: Number(addAmount),
        }),
      });

      setMessage({ text: `Successfully added ${Number(addAmount).toLocaleString()} DA to your account!`, type: 'success' });
      
      queryClient.invalidateQueries({ queryKey: ['account_me'] });
      queryClient.invalidateQueries({ queryKey: ['ledger_history'] });

      setTimeout(() => {
        setIsAddFundsModalOpen(false);
        setAddAmount('');
        setMessage(null);
      }, 2000);
    } catch (err: any) {
      setMessage({ text: err.message || 'Deposit failed.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBuyAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuyAsset || !buyShares) return;

    setIsProcessing(true);
    setBuyMessage(null);

    try {
      await apiRequest('/api/v1/investments/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': uuidv4(),
        },
        body: JSON.stringify({
          symbol: selectedBuyAsset.symbol,
          shares: Number(buyShares),
        }),
      });

      setBuyMessage({ text: `Successfully purchased ${buyShares} shares of ${selectedBuyAsset.name}!`, type: 'success' });
      
      queryClient.invalidateQueries({ queryKey: ['account_me'] });
      queryClient.invalidateQueries({ queryKey: ['investment_holdings'] });
      queryClient.invalidateQueries({ queryKey: ['ledger_history'] });

      setTimeout(() => {
        setSelectedBuyAsset(null);
        setBuyShares('');
        setBuyMessage(null);
      }, 2000);
    } catch (err: any) {
      setBuyMessage({ text: err.message || 'Asset purchase failed.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpgradeToPro = async () => {
    setIsProcessing(true);
    setMessage(null);

    try {
      await apiRequest('/api/v1/accounts/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': uuidv4(),
        },
      });

      setMessage({ text: 'Congratulations! Your account has been upgraded to Pro membership (Level 3)!', type: 'success' });
      
      queryClient.invalidateQueries({ queryKey: ['account_me'] });
      queryClient.invalidateQueries({ queryKey: ['ledger_history'] });

      setTimeout(() => {
        setIsUpgradeModalOpen(false);
        setMessage(null);
      }, 2000);
    } catch (err: any) {
      setMessage({ text: err.message || 'Upgrade failed.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const getEntryMeta = (entry: LedgerEntryData) => {
    const isCredit = entry.direction === 'CREDIT';
    return {
      title: isCredit ? 'Funds Credited' : 'Funds Debited',
      subtitle: isCredit ? 'Deposit / Received P2P' : 'Transfer / Investment / Fee',
      icon: isCredit ? ArrowUpRight : ArrowDownLeft,
      colorClass: isCredit ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600',
      sign: isCredit ? '+' : '-',
    };
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 border-4 border-gray-900 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'cards':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">My Cards</h2>
                <p className="text-xs text-gray-500">Securely linked funding sources for DinarFlow.</p>
              </div>
              {!isAddingCard && (
                <button 
                  onClick={() => setIsAddingCard(true)}
                  className="text-sm font-bold text-gray-900 flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Card
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {isAddingCard ? (
                <motion.div
                  key="add-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <PCIHostedFields 
                    onSuccess={(newCard) => {
                      setCards([...cards, { id: uuidv4(), ...newCard }]);
                      setIsAddingCard(false);
                    }}
                    onCancel={() => setIsAddingCard(false)}
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="cards-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {cards.map((card) => (
                    <div 
                      key={card.id}
                      className="aspect-[1.586/1] w-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl flex flex-col justify-between"
                    >
                      <div className="relative z-10 flex justify-between items-start">
                        <Wallet className="w-8 h-8 opacity-80" />
                        <span className="font-mono text-lg tracking-widest">{card.brand}</span>
                      </div>
                      <div className="relative z-10 mt-auto">
                        <p className="text-[10px] uppercase tracking-wider opacity-60 mb-1">Card Holder</p>
                        <p className="font-semibold tracking-wide uppercase text-sm truncate">{data?.user?.full_name}</p>
                        <p className="mt-2 font-mono text-lg tracking-widest">**** **** **** {card.last4}</p>
                      </div>
                      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-2xl pointer-events-none" />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      case 'invest':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Investments Market</h2>
              <p className="text-xs text-gray-500">Buy primary stocks and crypto assets with your DinarFlow balance.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(marketData || []).map((stock) => (
                <div key={stock.symbol} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-900 text-lg">{stock.symbol}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stock.change.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                        {stock.change}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{stock.name}</p>
                    <p className="font-mono font-bold mt-2 text-gray-900 text-base">{(stock.price).toLocaleString()} DA <span className="text-[10px] text-gray-400 font-normal">/ Share</span></p>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedBuyAsset(stock)}
                    className="mt-4 w-full h-10 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Buy Asset
                  </button>
                </div>
              ))}
            </div>

            {/* My Holdings */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                My Portfolio Holdings
              </h3>
              
              {!holdingsData || holdingsData.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No active holdings. Buy assets to build your investment portfolio.
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {holdingsData.map((holding) => (
                    <div key={holding.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                      <div>
                        <p className="font-bold text-gray-900">{holding.name} ({holding.symbol})</p>
                        <p className="text-xs text-gray-500">{holding.shares.toFixed(4)} Shares @ {Math.round(holding.averagePrice).toLocaleString()} DA avg</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{Math.round(holding.totalCost).toLocaleString()} DA</p>
                        <p className="text-[10px] text-gray-400">Total Invested</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'activity':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold">All Activity</h2>
            
            {loadingHistory ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-6 w-6 border-2 border-gray-900 border-t-transparent rounded-full" />
              </div>
            ) : !historyData || historyData.length === 0 ? (
              <div className="text-center bg-white border border-gray-100 rounded-3xl py-12 text-gray-400 text-sm">
                No transactions detected in ledger_entries.
              </div>
            ) : (
              <div className="space-y-3">
                {historyData.map((entry) => {
                  const meta = getEntryMeta(entry);
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 ${meta.colorClass} rounded-full flex items-center justify-center`}>
                          <meta.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{meta.title}</p>
                          <p className="text-xs text-gray-500">{meta.subtitle} • {formatDate(entry.ts)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${entry.direction === 'CREDIT' ? 'text-green-600' : 'text-gray-900'}`}>
                          {meta.sign}{Number(entry.amount).toLocaleString()} DA
                        </p>
                        <p className="text-[10px] text-gray-400">Bal: {Number(entry.balanceAfter).toLocaleString()} DA</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold">Settings</h2>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {['Profile', 'Documents', 'Security', 'Notifications', 'Linked Accounts', 'Help & Support'].map((item) => (
                <button 
                  key={item} 
                  onClick={() => {
                    if (item === 'Documents') setActiveTab('documents');
                    else alert(`${item} settings coming soon!`);
                  }}
                  className="w-full px-6 py-4 text-left font-medium text-gray-700 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors flex justify-between items-center group"
                >
                  <span>{item}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity" />
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 'documents':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="flex items-center gap-2 text-gray-500 cursor-pointer hover:text-gray-900 transition-colors" onClick={() => setActiveTab('settings')}>
              <ArrowDownLeft className="w-4 h-4 rotate-45" />
              <span className="text-sm font-bold">Back to Settings</span>
            </div>
            
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-bold">Verification Documents</h2>
              <p className="text-gray-500">Manage your KYC documents and upgrade your account limits.</p>
            </div>

            {/* KYC Progress Tracker */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold mb-6">Verification Progress</h3>
              <div className="flex items-start gap-4">
                {[
                  { label: 'Level 1', status: 'verified', desc: 'Phone & Email' },
                  { label: 'Level 2', status: data?.user?.kyc_status === 'VERIFIED' ? 'verified' : 'pending', desc: 'National ID' },
                  { label: 'Level 3', status: data?.tier && data.tier >= 3 ? 'verified' : 'locked', desc: 'Video Interview' },
                ].map((step, i) => (
                  <div key={step.label} className="flex-1 flex flex-col items-center relative">
                    {i < 2 && <div className={`absolute top-5 left-1/2 w-full h-[2px] ${step.status === 'verified' ? 'bg-green-500' : 'bg-gray-100'}`} />}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 mb-2 ${
                      step.status === 'verified' ? 'bg-green-500 text-white' : 
                      step.status === 'pending' ? 'bg-orange-100 text-orange-600 border-2 border-orange-200' : 
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {step.status === 'verified' ? <Plus className="w-5 h-5 rotate-45" /> : i + 1}
                    </div>
                    <p className="text-sm font-bold">{step.label}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload Area */}
            <KYCForm onSuccess={() => queryClient.invalidateQueries({ queryKey: ['account_me'] })} />

            {/* Document History */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <h3 className="font-bold">Submission History</h3>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Documents Verified</span>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { name: 'national_id_front.jpg', type: 'Proof of ID', status: data?.user?.kyc_status === 'VERIFIED' ? 'Approved' : 'In Review', color: data?.user?.kyc_status === 'VERIFIED' ? 'text-green-500 bg-green-50' : 'text-orange-500 bg-orange-50' },
                  { name: 'registration_form.pdf', type: 'PSP Agreement', status: 'Approved', color: 'text-green-500 bg-green-50' },
                ].map((doc, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                        <History className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.type}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${doc.color}`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      default:
        return (
          <div className="space-y-8">
            {/* Balance Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-gray-200"
            >
              <div className="relative z-10">
                <p className="text-gray-400 font-medium mb-1">Total Balance</p>
                <div className="flex items-end justify-between mb-8">
                  <h2 className="text-5xl font-bold">
                    {data?.balance?.toLocaleString('en-US') || '0'} <span className="text-2xl opacity-60">DA</span>
                  </h2>
                  <div className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                    <span className="text-xs font-bold uppercase tracking-wider">Level {data?.tier}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Daily Limit</p>
                    <div className="flex justify-between items-end">
                      <p className="font-bold text-lg">{data?.daily_debit_sum?.toLocaleString()} <span className="text-xs opacity-60 font-normal">DA</span></p>
                      <p className="text-[10px] opacity-40">/ {data?.tier === 1 ? '20k' : data?.tier === 2 ? '100k' : '500k'}</p>
                    </div>
                    <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(Number(data?.daily_debit_sum) / (data?.tier === 1 ? 20000 : data?.tier === 2 ? 100000 : 500000)) * 100}%` }}
                        className="h-full bg-indigo-400"
                      />
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">KYC Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${data?.user?.kyc_status === 'VERIFIED' ? 'bg-green-400' : 'bg-orange-400'}`} />
                      <p className="font-bold text-sm tracking-wide">{data?.user?.kyc_status || 'PENDING'}</p>
                    </div>
                    <p className="text-[10px] opacity-40 mt-1">Algeria PSP Standard</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsSendModalOpen(true)}
                    className="flex-1 bg-white text-gray-900 h-12 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                  >
                    <ArrowUpRight className="w-5 h-5" />
                    Send Money
                  </button>
                  <button 
                    onClick={() => setIsAddFundsModalOpen(true)}
                    className="flex-1 bg-gray-800 text-white h-12 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add Funds
                  </button>
                </div>
              </div>
              
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-2xl" />
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: CreditCard, label: 'Cards', color: 'bg-blue-50 text-blue-600', id: 'cards' },
                { icon: TrendingUp, label: 'Invest', color: 'bg-green-50 text-green-600', id: 'invest' },
                { icon: ShieldCheck, label: 'Verify', color: 'bg-indigo-50 text-indigo-600', id: 'documents' },
                { icon: Settings, label: 'Config', color: 'bg-purple-50 text-purple-600', id: 'settings' },
              ].map((action, i) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setActiveTab(action.id as any)}
                  className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all flex flex-col items-center gap-2 group"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">{action.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Recent Ledger Activity</h3>
                <button 
                  onClick={() => setActiveTab('activity')}
                  className="text-sm font-semibold text-gray-500 hover:text-gray-900 underline decoration-gray-200"
                >
                  View All
                </button>
              </div>
              
              {loadingHistory ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin h-5 w-5 border-2 border-gray-900 border-t-transparent rounded-full" />
                </div>
              ) : !historyData || historyData.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm">
                  No transaction ledger entries.
                </div>
              ) : (
                <div className="space-y-4">
                  {historyData.slice(0, 4).map((entry) => {
                    const meta = getEntryMeta(entry);
                    return (
                      <div key={entry.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 ${meta.colorClass} rounded-full flex items-center justify-center`}>
                            <meta.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{meta.title}</p>
                            <p className="text-xs text-gray-500">{meta.subtitle} • {formatDate(entry.ts)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${entry.direction === 'CREDIT' ? 'text-green-600' : 'text-gray-900'}`}>
                            {meta.sign}{Number(entry.amount).toLocaleString()} DA
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">DinarFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('settings')}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Bell className="w-5 h-5" />
            </button>
            <div 
              onClick={() => setActiveTab('settings')}
              className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 border border-gray-200 cursor-pointer"
            >
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Dashboard Column */}
          <div className="md:col-span-2">
            {renderContent()}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Account Holder</h3>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl mb-4">
                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold">
                  {data?.user?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{data?.user?.full_name || 'Valued User'}</p>
                  <p className="text-xs text-gray-500">Tier {data?.tier} Account</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('documents')}
                disabled={data?.tier && data.tier >= 3}
                className="w-full py-3 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {data?.tier && data.tier >= 3 ? 'Fully Upgraded' : `Upgrade to Level ${Number(data?.tier) + 1}`}
              </button>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="font-bold mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5" />
                  Upgrade to Pro
                </h3>
                <p className="text-sm text-indigo-100 mb-6 leading-relaxed">
                  Unlock advanced investment options, unlimited limits, and Level 3 privileges with DinarFlow Pro.
                </p>
                <button 
                  onClick={() => setIsUpgradeModalOpen(true)}
                  disabled={data?.tier && data.tier >= 3}
                  className="w-full bg-white text-indigo-600 h-11 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95 text-sm disabled:opacity-50 disabled:pointer-events-none"
                >
                  {data?.tier && data.tier >= 3 ? 'You Are Pro' : 'Upgrade for 1,500 DA'}
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-colors" />
            </div>
          </div>
        </div>
      </main>

      {/* Send Money Modal */}
      <AnimatePresence>
        {isSendModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isProcessing) setIsSendModalOpen(false);
              }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6">Send Money</h3>
              
              <form onSubmit={handleSendMoney} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient IBAN, Email, or Username</label>
                  <input
                    type="text"
                    required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Enter recipient"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (DA)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 focus:outline-none transition-all"
                  />
                </div>

                {message && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {message.text}
                  </motion.p>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsSendModalOpen(false)}
                    disabled={isProcessing}
                    className="flex-1 h-12 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 h-12 rounded-xl font-semibold text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Funds Modal */}
      <AnimatePresence>
        {isAddFundsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isProcessing) setIsAddFundsModalOpen(false);
              }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6">Add Funds</h3>
              
              <form onSubmit={handleAddFunds} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Add (DA)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    placeholder="0"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[5000, 20000, 100000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAddAmount(amt.toString())}
                      className="h-10 rounded-lg bg-gray-50 text-gray-900 font-bold border border-gray-100 hover:bg-gray-100 transition-colors text-xs"
                    >
                      +{amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                {message && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {message.text}
                  </motion.p>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddFundsModalOpen(false)}
                    disabled={isProcessing}
                    className="flex-1 h-12 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 h-12 rounded-xl font-semibold text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                    {isProcessing ? 'Adding...' : 'Add Now'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upgrade to Pro Modal */}
      <AnimatePresence>
        {isUpgradeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isProcessing) setIsUpgradeModalOpen(false);
              }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-3">Upgrade to DinarFlow Pro</h3>
              <p className="text-sm text-gray-500 mb-6">
                Elevate your account to the professional standard of banking with exclusive Level 3 benefits.
              </p>

              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-6 space-y-2.5">
                <p className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Included with Pro Membership:</p>
                <ul className="text-xs text-indigo-950 space-y-1.5 list-disc pl-4 font-medium">
                  <li>Unlock Level 3 daily limits (up to 500,000 DA)</li>
                  <li>Unlock primary stock/crypto investments panel</li>
                  <li>Dedicated video interview routing for verification compliance</li>
                  <li>Waived fees on high-frequency P2P transfers</li>
                </ul>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl mb-6">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">One-Time Upgrade Fee</p>
                  <p className="text-xl font-bold text-gray-900">1,500 DA</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Current Balance</p>
                  <p className="text-sm font-bold text-indigo-600">{(data?.balance || 0).toLocaleString()} DA</p>
                </div>
              </div>

              {message && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-sm font-medium mb-4 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
                >
                  {message.text}
                </motion.p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsUpgradeModalOpen(false)}
                  disabled={isProcessing}
                  className="flex-1 h-12 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpgradeToPro}
                  disabled={isProcessing || !data || data.balance < 1500}
                  className="flex-1 h-12 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Upgrade'}
                </button>
              </div>
              
              {data && data.balance < 1500 && (
                <p className="text-center text-xs text-red-500 font-semibold mt-3">
                  Insufficient funds. Please add more funds to upgrade.
                </p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Buy Asset Modal */}
      <AnimatePresence>
        {selectedBuyAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isProcessing) setSelectedBuyAsset(null);
              }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-1">Buy {selectedBuyAsset.name}</h3>
              <p className="text-xs text-gray-400 mb-6 font-mono">Asset Symbol: {selectedBuyAsset.symbol}</p>
              
              <form onSubmit={handleBuyAsset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Shares to Purchase</label>
                  <input
                    type="number"
                    required
                    min="0.0001"
                    step="any"
                    value={buyShares}
                    onChange={(e) => setBuyShares(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 focus:outline-none transition-all"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Price per Share</span>
                    <span className="font-mono text-gray-900 font-bold">{(selectedBuyAsset.price).toLocaleString()} DA</span>
                  </div>
                  <div className="flex justify-between text-gray-500 border-t border-gray-100 pt-2">
                    <span>Total Cost</span>
                    <span className="font-mono text-gray-900 font-bold">
                      {buyShares ? Math.round(selectedBuyAsset.price * Number(buyShares)).toLocaleString() : '0'} DA
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500 border-t border-gray-100 pt-2 text-xs">
                    <span>Available Balance</span>
                    <span className="font-mono text-indigo-600 font-bold">{(data?.balance || 0).toLocaleString()} DA</span>
                  </div>
                </div>

                {buyMessage && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-sm font-medium ${buyMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {buyMessage.text}
                  </motion.p>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedBuyAsset(null)}
                    disabled={isProcessing}
                    className="flex-1 h-12 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || !buyShares || (data && data.balance < Math.round(selectedBuyAsset.price * Number(buyShares)))}
                    className="flex-1 h-12 rounded-xl font-semibold text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Buy'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDashboard;
