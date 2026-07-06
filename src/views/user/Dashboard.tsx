import React, { useEffect, useState } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { apiRequest } from '../../lib/api';
import KYCForm from '../../components/KYCForm';

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

const UserDashboard: React.FC = () => {
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cards' | 'invest' | 'activity' | 'settings' | 'documents'>('dashboard');
  const [transferAmount, setTransferAmount] = useState('');
  const [addAmount, setAddAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const fetchAccount = async () => {
    try {
      const data = await apiRequest('/api/v1/accounts/me');
      setData(data);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

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
          receiverAccountId: recipient, // In a real app, this might be looked up from an email/username
          amountCentimes: Math.round(Number(transferAmount)), // Assuming transferAmount is DA
          reference: 'DinarFlow Transfer',
        }),
      });

      setMessage({ text: `Successfully sent ${transferAmount} DA!`, type: 'success' });
      
      // Refresh balance
      await fetchAccount();

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

  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addAmount) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      if (data) {
        setData({ ...data, balance: data.balance + Number(addAmount) });
        setMessage({ text: `Successfully added ${addAmount} DA to your account!`, type: 'success' });
        setTimeout(() => {
          setIsAddFundsModalOpen(false);
          setAddAmount('');
          setMessage(null);
        }, 2000);
      }
      setIsProcessing(false);
    }, 1000);
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
              <h2 className="text-2xl font-bold">My Cards</h2>
              <button className="text-sm font-bold text-gray-900 flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Card
              </button>
            </div>
            <div className="aspect-[1.586/1] w-full max-w-sm bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <Wallet className="w-8 h-8 opacity-80" />
                  <span className="font-mono text-lg tracking-widest">VISA</span>
                </div>
                <div>
                  <p className="text-xs opacity-60 mb-1">Card Holder</p>
                  <p className="font-medium tracking-wide uppercase">{data?.user?.full_name}</p>
                  <p className="mt-4 font-mono text-xl tracking-widest">**** **** **** 4242</p>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-2xl" />
            </div>
          </motion.div>
        );
      case 'invest':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold">Investments</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Bitcoin', symbol: 'BTC', price: '$64,231', change: '+2.4%' },
                { name: 'Ethereum', symbol: 'ETH', price: '$3,412', change: '-1.2%' },
                { name: 'Nvidia Corp', symbol: 'NVDA', price: '$821.50', change: '+5.7%' },
                { name: 'Apple Inc', symbol: 'AAPL', price: '$172.10', change: '+0.3%' },
              ].map((stock) => (
                <div key={stock.symbol} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold">{stock.symbol}</span>
                    <span className={`text-xs font-bold ${stock.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.change}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{stock.name}</p>
                  <p className="font-mono font-bold mt-1">{stock.price}</p>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 'activity':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold">All Activity</h2>
            <div className="space-y-3">
              {[
                { name: 'Apple Store', type: 'Purchase', amount: -1299, date: 'Today', icon: ArrowDownLeft },
                { name: 'Salary Deposit', type: 'Income', amount: 320000, date: 'Yesterday', icon: ArrowUpRight },
                { name: 'Starbucks', type: 'Coffee', amount: -545, date: '2 days ago', icon: ArrowDownLeft },
                { name: 'Netflix', type: 'Subscription', amount: -1999, date: '3 days ago', icon: ArrowDownLeft },
                { name: 'Amazon', type: 'Shopping', amount: -4250, date: '4 days ago', icon: ArrowDownLeft },
              ].map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-50 hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${tx.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'} rounded-full flex items-center justify-center`}>
                      <tx.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{tx.name}</p>
                      <p className="text-xs text-gray-500">{tx.type} • {tx.date}</p>
                    </div>
                  </div>
                  <p className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('en-US')} DA
                  </p>
                </div>
              ))}
            </div>
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
                  { label: 'Level 2', status: 'pending', desc: 'National ID' },
                  { label: 'Level 3', status: 'locked', desc: 'Video Interview' },
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
            <KYCForm />

            {/* Document History */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <h3 className="font-bold">Submission History</h3>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">3 Files Total</span>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { name: 'national_id_front.jpg', type: 'Proof of ID', date: '2 hours ago', status: 'In Review', color: 'text-orange-500 bg-orange-50' },
                  { name: 'utility_bill_june.pdf', type: 'Proof of Residence', date: 'June 12, 2026', status: 'Approved', color: 'text-green-500 bg-green-50' },
                  { name: 'registration_form.pdf', type: 'PSP Agreement', date: 'May 01, 2026', status: 'Approved', color: 'text-green-500 bg-green-50' },
                ].map((doc, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                        <History className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.type} • {doc.date}</p>
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
                <h3 className="text-lg font-bold">Recent Activity</h3>
                <button 
                  onClick={() => setActiveTab('activity')}
                  className="text-sm font-semibold text-gray-500 hover:text-gray-900 underline decoration-gray-200"
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'Apple Store', type: 'Purchase', amount: -12.99, date: 'Today', icon: ArrowDownLeft },
                  { name: 'Salary Deposit', type: 'Income', amount: 3200.00, date: 'Yesterday', icon: ArrowUpRight },
                  { name: 'Starbucks', type: 'Coffee', amount: -5.45, date: '2 days ago', icon: ArrowDownLeft },
                ].map((tx, i) => (
                  <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 ${tx.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'} rounded-full flex items-center justify-center`}>
                        <tx.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{tx.name}</p>
                        <p className="text-xs text-gray-500">{tx.type} • {tx.date}</p>
                      </div>
                    </div>
                    <p className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('en-US')} DA
                    </p>
                  </div>
                ))}
              </div>
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
                className="w-full py-3 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                Upgrade to Level {Number(data?.tier) + 1}
              </button>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="font-bold mb-2">Upgrade to Pro</h3>
                <p className="text-sm text-indigo-100 mb-6 leading-relaxed">
                  Unlock advanced analytics and higher transaction limits with DinarFlow Pro.
                </p>
                <button 
                  onClick={() => alert('DinarFlow Pro upgrade is not available in demo.')}
                  className="w-full bg-white text-indigo-600 h-11 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95 text-sm"
                >
                  Learn More
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email or Username</label>
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
                  {[500, 1000, 5000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAddAmount(amt.toString())}
                      className="h-10 rounded-lg bg-gray-50 text-gray-900 font-bold border border-gray-100 hover:bg-gray-100 transition-colors"
                    >
                      +{amt}
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
    </div>
  );
};

export default UserDashboard;
