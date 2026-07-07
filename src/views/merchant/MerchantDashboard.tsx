import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Link as LinkIcon, 
  Plus, 
  Users, 
  Settings, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search,
  Filter,
  Download,
  CreditCard,
  Building2,
  FileText,
  Bell,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { apiRequest, getAuthToken } from '../../lib/api';
import { v4 as uuidv4 } from 'uuid';

const MerchantDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'links' | 'customers' | 'settlements' | 'settings'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dynamic States
  const [links, setLinks] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [settings, setSettings] = useState<any | null>(null);
  const [account, setAccount] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Link Creation Modal States
  const [isCreateLinkOpen, setIsCreateLinkOpen] = useState(false);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkAmount, setNewLinkAmount] = useState('');
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  // Business Verification Modal States
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [rcNumber, setRcNumber] = useState('');
  const [nifNumber, setNifNumber] = useState('');
  const [isSubmittingKYC, setIsSubmittingKYC] = useState(false);

  // Settings State Message
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [settingsData, linksData, txData, accountData] = await Promise.all([
        apiRequest('/api/v1/merchant/settings'),
        apiRequest('/api/v1/merchant/links'),
        apiRequest('/api/v1/merchant/transactions'),
        apiRequest('/api/v1/accounts/me'),
      ]);
      setSettings(settingsData);
      setLinks(linksData);
      setTransactions(txData);
      setAccount(accountData);
    } catch (err) {
      console.error('Error fetching merchant data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkName || !newLinkAmount) {
      alert('Please fill out all fields');
      return;
    }
    setIsCreatingLink(true);
    try {
      const amountCentimes = Math.round(Number(newLinkAmount) * 100);
      await apiRequest('/api/v1/merchant/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': uuidv4(),
        },
        body: JSON.stringify({
          name: newLinkName,
          amountCentimes,
        }),
      });
      setIsCreateLinkOpen(false);
      setNewLinkName('');
      setNewLinkAmount('');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create payment link');
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleVerifyBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rcNumber || !nifNumber) {
      alert('Please enter RC and NIF numbers');
      return;
    }
    setIsSubmittingKYC(true);
    try {
      await apiRequest('/api/v1/merchant/kyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': uuidv4(),
        },
        body: JSON.stringify({
          rcDocument: rcNumber,
          nifDocument: nifNumber,
        }),
      });
      setIsVerifyModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Verification submission failed');
    } finally {
      setIsSubmittingKYC(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      await apiRequest('/api/v1/merchant/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': uuidv4(),
        },
        body: JSON.stringify({
          businessName: settings.businessName,
          bankAccount: settings.bankAccount,
          apiKeysEnabled: settings.apiKeysEnabled,
        }),
      });
      setUpdateMessage('Settings updated successfully!');
      setTimeout(() => setUpdateMessage(null), 3000);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/v1/merchant/reports/download', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Report download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'settlement_report.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(err.message || 'Failed to download report');
    }
  };

  const totalSalesCentimes = transactions
    .filter(tx => tx.status === 'Paid')
    .reduce((sum, tx) => sum + (tx.amountCentimes || 0), 0);

  const totalSalesFormatted = `${(totalSalesCentimes / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA`;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
          <p className="text-sm font-bold">Loading merchant portfolio details...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'links':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Payment Links</h2>
                <p className="text-sm text-gray-500">Create and manage links to accept payments instantly.</p>
              </div>
              <button 
                onClick={() => setIsCreateLinkOpen(true)}
                className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
              >
                <Plus className="w-4 h-4" /> Create Link
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-50 flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search links..." 
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-gray-900/10 outline-none"
                  />
                </div>
                <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {links.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <p className="font-bold">No Payment Links found</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Create Link" to create your very first PSP billing link.</p>
                  </div>
                ) : (
                  links.map((link, i) => (
                    <div 
                      key={link.id || i} 
                      onClick={() => {
                        const absUrl = `${window.location.origin}${link.url}`;
                        navigator.clipboard.writeText(absUrl);
                        alert(`Copied link to clipboard:\n${absUrl}`);
                      }}
                      className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                          <LinkIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{link.name}</p>
                          <p className="text-xs text-gray-500">
                            {(link.amountCentimes / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} DA • {link.used} payments
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {((link.revenue || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} DA
                        </p>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${link.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {link.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        );

      case 'settlements':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Settlements</h2>
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
            
            <div className="bg-white rounded-3xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 text-gray-400">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-1">Weekly Settlement Reports</h3>
              <p className="text-sm text-gray-500 max-w-xs mb-6">Reports are automatically generated every Sunday at 23:59 GMT+1.</p>
              <div className="w-full max-w-md space-y-3">
                {[
                  { date: 'June 28 - July 04, 2026', amount: '450,000 DA', status: 'Pending' },
                  { date: 'June 21 - June 27, 2026', amount: '520,000 DA', status: 'Paid' },
                  { date: 'June 14 - June 20, 2026', amount: '380,000 DA', status: 'Paid' },
                ].map((report, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="text-left">
                      <p className="font-bold text-sm">{report.date}</p>
                      <p className="text-xs text-gray-500">{report.amount}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${report.status === 'Paid' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                      {report.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'settings':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-2xl font-bold">Merchant Settings</h2>
              <p className="text-sm text-gray-500">Configure your business profile, bank accounts, and developer keys.</p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Business Name</label>
                  <input
                    type="text"
                    value={settings?.businessName || ''}
                    onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                    className="w-full mt-1.5 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-gray-900/10 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Settlement Bank Account (RIB)</label>
                  <input
                    type="text"
                    value={settings?.bankAccount || ''}
                    onChange={(e) => setSettings({ ...settings, bankAccount: e.target.value })}
                    placeholder="e.g. 00799999000001234567"
                    className="w-full mt-1.5 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-gray-900/10 outline-none font-mono"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-bold">Developer API Keys</p>
                    <p className="text-xs text-gray-400">Enable API keys to integrate payment processing on your website.</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, apiKeysEnabled: !settings?.apiKeysEnabled })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${settings?.apiKeysEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${settings?.apiKeysEnabled ? 'translate-x-6' : ''}`} />
                  </button>
                </div>

                {settings?.apiKeysEnabled && (
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2">
                    <p className="text-xs font-mono text-indigo-700 font-bold uppercase tracking-wider">Live API Secret Key</p>
                    <p className="text-xs font-mono bg-white p-2 rounded border select-all border-indigo-100 text-gray-600">
                      df_live_sec_78fa92b347fd0c9b{settings?.userId?.replace(/-/g, '')?.substring(0, 8)}
                    </p>
                  </div>
                )}
              </div>

              {updateMessage && (
                <div className="p-4 bg-green-50 text-green-700 text-sm font-bold rounded-2xl">
                  {updateMessage}
                </div>
              )}

              <button
                onClick={handleSaveSettings}
                className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-bold transition-all shadow-lg"
              >
                Save Settings
              </button>
            </div>
          </motion.div>
        );

      default:
        return (
          <div className="space-y-8">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Settlement Balance</p>
                  <p className="text-4xl font-bold mb-8">
                    {account ? (Number(account.balance) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'} 
                    <span className="text-lg opacity-40 ml-1">DA</span>
                  </p>
                  <div className="flex items-center gap-2 text-green-400 text-xs font-bold bg-green-400/10 w-fit px-2 py-1 rounded-full">
                    <ArrowUpRight className="w-3 h-3" /> +12.4% vs last week
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              </motion.div>
              
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Sales (MTD)</p>
                  <p className="text-3xl font-bold">{totalSalesFormatted}</p>
                </div>
                <div className="h-10 w-full flex items-end gap-1 mt-6">
                  {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                    <div key={i} className="flex-1 bg-indigo-50 rounded-t-sm relative group">
                      <div style={{ height: `${h}%` }} className="w-full bg-indigo-500 rounded-t-sm group-hover:bg-indigo-600 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Active Links</p>
                  <p className="text-3xl font-bold">{links.length}</p>
                </div>
                <button 
                  onClick={() => setIsCreateLinkOpen(true)}
                  className="w-full py-3 bg-gray-50 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Create New
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Recent Payments */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                  <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="text-lg font-bold">Recent Payments</h3>
                    <button onClick={() => handleExportCSV()} className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {transactions.length === 0 ? (
                      <div className="p-8 text-center text-gray-400">No transactions recorded yet.</div>
                    ) : (
                      transactions.map((tx, i) => (
                        <div key={tx.id || i} className="px-8 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-bold group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                              {tx.customer?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-gray-900">{tx.customer}</p>
                              <p className="text-[10px] text-gray-400 uppercase font-medium">{tx.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">{tx.amount}</p>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${tx.status === 'Paid' ? 'text-green-500' : 'text-red-500'}`}>
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Actions */}
              <div className="space-y-8">
                <div className={`${settings?.kycStatus === 'VERIFIED' ? 'bg-emerald-600 shadow-emerald-100' : 'bg-indigo-600 shadow-indigo-100'} rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl transition-colors`}>
                  <h3 className="font-bold mb-2">Merchant Verification</h3>
                  {settings?.kycStatus === 'VERIFIED' ? (
                    <>
                      <p className="text-sm text-emerald-100 mb-6 leading-relaxed">
                        Your business is verified! You are on <strong>Tier 2</strong> with unlimited payments enabled.
                      </p>
                      <div className="w-full bg-white/20 text-white text-center py-3 rounded-2xl font-bold text-sm">
                        Verified & Active
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-indigo-100 mb-6 leading-relaxed">
                        Upgrade to <strong>Tier 2</strong> to accept unlimited payments and settle in 24h.
                      </p>
                      <button 
                        onClick={() => setIsVerifyModalOpen(true)}
                        className="w-full bg-white text-indigo-600 py-3 rounded-2xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        Verify Business
                      </button>
                    </>
                  )}
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                  <h3 className="font-bold mb-6">Quick Links</h3>
                  <div className="space-y-4">
                    {[
                      { icon: CreditCard, label: 'Manage Cards', desc: 'Add settlement bank', tab: 'settings' },
                      { icon: Users, label: 'Team', desc: 'Manage permissions', tab: 'settings' },
                      { icon: Settings, label: 'API Keys', desc: 'Integrate website', tab: 'settings' },
                      { icon: Building2, label: 'Business Profile', desc: 'Update details', tab: 'settings' },
                    ].map((item, i) => (
                      <button 
                        key={i} 
                        onClick={() => setActiveTab(item.tab as any)}
                        className="w-full flex items-center gap-4 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group text-left"
                      >
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{item.label}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-medium">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-950">Merchant</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 hover:bg-gray-100 text-gray-700 rounded-xl transition-all"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Navigation Side Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop with fade-in effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
            />

            {/* Slide-out Sidebar Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="relative w-80 max-w-[85vw] bg-white h-full flex flex-col p-8 shadow-2xl z-10 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-gray-950">Merchant</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1.5">
                {[
                  { id: 'overview', icon: BarChart3, label: 'Overview' },
                  { id: 'links', icon: LinkIcon, label: 'Payment Links' },
                  { id: 'settlements', icon: FileText, label: 'Settlements' },
                  { id: 'settings', icon: Settings, label: 'Settings' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                      activeTab === item.id 
                        ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="mt-auto pt-6 border-t border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                    M
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{settings?.businessName || 'TechDZ Store'}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                      Merchant ID: {settings?.userId ? `M-${settings.userId.split('-')[0].toUpperCase()}` : 'M-49201'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Persistent Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-gray-100 flex-col p-8 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Merchant</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', icon: BarChart3, label: 'Overview' },
            { id: 'links', icon: LinkIcon, label: 'Payment Links' },
            { id: 'settlements', icon: FileText, label: 'Settlements' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-gray-50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
              M
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{settings?.businessName || 'TechDZ Store'}</p>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                Merchant ID: {settings?.userId ? `M-${settings.userId.split('-')[0].toUpperCase()}` : 'M-49201'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
        <header className="hidden lg:flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 capitalize">{activeTab}</h1>
            <p className="text-sm text-gray-500">Welcome back, here's your business performance.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 hover:shadow-sm transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* Mobile-only page title/description */}
        <div className="lg:hidden mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1 capitalize text-gray-900">{activeTab}</h1>
          <p className="text-xs text-gray-500">Here's your business performance overview.</p>
        </div>

        {renderContent()}
      </main>

      {/* Create Link Modal */}
      <AnimatePresence>
        {isCreateLinkOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateLinkOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 max-w-md w-full relative z-10 shadow-2xl mx-4"
            >
              <h3 className="text-xl font-bold mb-2">Create Payment Link</h3>
              <p className="text-sm text-gray-500 mb-6">Generate a simple link to accept online payments instantly.</p>
              
              <form onSubmit={handleCreateLink}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Link Name / Description</label>
                    <input
                      type="text"
                      required
                      value={newLinkName}
                      onChange={(e) => setNewLinkName(e.target.value)}
                      placeholder="e.g. Standard Consultation"
                      className="w-full mt-1.5 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-gray-900/10 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Amount (in DA)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={newLinkAmount}
                      onChange={(e) => setNewLinkAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full mt-1.5 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-gray-900/10 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateLinkOpen(false)}
                    className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingLink}
                    className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isCreatingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Link'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Verify Business KYC Modal */}
      <AnimatePresence>
        {isVerifyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVerifyModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 max-w-md w-full relative z-10 shadow-2xl mx-4"
            >
              <h3 className="text-xl font-bold mb-2">Verify Your Business</h3>
              <p className="text-sm text-gray-500 mb-6">Upload your Register of Commerce (RC) and NIF documents to unlock Tier 2.</p>
              
              <form onSubmit={handleVerifyBusiness}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Registre du Commerce (RC)</label>
                    <input
                      type="text"
                      required
                      value={rcNumber}
                      onChange={(e) => setRcNumber(e.target.value)}
                      placeholder="Enter RC Number or upload path..."
                      className="w-full mt-1.5 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-gray-900/10 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Numéro d'Identification Fiscale (NIF)</label>
                    <input
                      type="text"
                      required
                      value={nifNumber}
                      onChange={(e) => setNifNumber(e.target.value)}
                      placeholder="Enter NIF Number..."
                      className="w-full mt-1.5 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-gray-900/10 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsVerifyModalOpen(false)}
                    disabled={isSubmittingKYC}
                    className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingKYC || !rcNumber || !nifNumber}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmittingKYC ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Now'}
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

export default MerchantDashboard;
