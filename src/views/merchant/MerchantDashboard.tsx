import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  Bell
} from 'lucide-react';

const MerchantDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'links' | 'customers' | 'settlements' | 'settings'>('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'links':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Payment Links</h2>
                <p className="text-sm text-gray-500">Create and manage links to accept payments instantly.</p>
              </div>
              <button className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
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
                {[
                  { name: 'Standard Subscription', amount: '2,500.00 DA', status: 'Active', used: 12, revenue: '30,000 DA' },
                  { name: 'One-time Consultation', amount: '5,000.00 DA', status: 'Active', used: 4, revenue: '20,000 DA' },
                  { name: 'Late Fee Payment', amount: '500.00 DA', status: 'Disabled', used: 0, revenue: '0 DA' },
                ].map((link, i) => (
                  <div key={i} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <LinkIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{link.name}</p>
                        <p className="text-xs text-gray-500">{link.amount} • {link.used} payments</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{link.revenue}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${link.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {link.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 'settlements':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Settlements</h2>
              <button className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900">
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
      default:
        return (
          <div className="space-y-8">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Settlement Balance</p>
                  <p className="text-4xl font-bold mb-8">450,200 <span className="text-lg opacity-40">DA</span></p>
                  <div className="flex items-center gap-2 text-green-400 text-xs font-bold bg-green-400/10 w-fit px-2 py-1 rounded-full">
                    <ArrowUpRight className="w-3 h-3" /> +12.4% vs last week
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              </motion.div>
              
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Sales (MTD)</p>
                  <p className="text-3xl font-bold">1.2M <span className="text-lg text-gray-300">DA</span></p>
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
                  <p className="text-3xl font-bold">12</p>
                </div>
                <button className="w-full py-3 bg-gray-50 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
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
                    <button className="text-xs font-bold text-indigo-600 hover:underline">View All Activity</button>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {[
                      { customer: 'Ahmed Benali', email: 'ahmed@gmail.com', amount: '12,500 DA', date: '5 mins ago', status: 'Paid' },
                      { customer: 'Sarah Mansouri', email: 'sarah.m@outlook.fr', amount: '8,000 DA', date: '2 hours ago', status: 'Paid' },
                      { customer: 'Karim Brahimi', email: 'karim@tech.dz', amount: '25,000 DA', date: 'Yesterday', status: 'Refunded' },
                    ].map((tx, i) => (
                      <div key={i} className="px-8 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-bold group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            {tx.customer.charAt(0)}
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
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Actions */}
              <div className="space-y-8">
                <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
                  <h3 className="font-bold mb-2">Merchant Verification</h3>
                  <p className="text-sm text-indigo-100 mb-6 leading-relaxed">
                    Upgrade to <strong>Tier 2</strong> to accept unlimited payments and settle in 24h.
                  </p>
                  <button className="w-full bg-white text-indigo-600 py-3 rounded-2xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
                    Verify Business
                  </button>
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                  <h3 className="font-bold mb-6">Quick Links</h3>
                  <div className="space-y-4">
                    {[
                      { icon: CreditCard, label: 'Manage Cards', desc: 'Add settlement bank' },
                      { icon: Users, label: 'Team', desc: 'Manage permissions' },
                      { icon: Settings, label: 'API Keys', desc: 'Integrate website' },
                      { icon: Building2, label: 'Business Profile', desc: 'Update details' },
                    ].map((item, i) => (
                      <button key={i} className="w-full flex items-center gap-4 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group text-left">
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col p-8 sticky top-0 h-screen">
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
            { id: 'customers', icon: Users, label: 'Customers' },
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
              <p className="text-sm font-bold text-gray-900">TechDZ Store</p>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Merchant ID: 49201</p>
            </div>
          </div>
          <button className="w-full py-3 bg-red-50 text-red-600 rounded-2xl text-sm font-bold hover:bg-red-100 transition-colors">
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-12">
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

        {renderContent()}
      </main>
    </div>
  );
};

export default MerchantDashboard;
