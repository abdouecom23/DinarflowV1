import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Activity, 
  Settings, 
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Database,
  ExternalLink,
  ChevronRight,
  Eye,
  Bell
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'kyc' | 'aml' | 'system'>('stats');

  const renderContent = () => {
    switch (activeTab) {
      case 'kyc':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold font-sans">KYC Review Queue</h2>
                <p className="text-sm text-gray-500 font-medium">Review and approve user verification documents.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider">12 Pending</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">45 Today</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User ID / Name</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submitted</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Risk Level</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { id: 'usr_812', name: 'Zinedine Zidane', type: 'Level 2 Upgrade', date: '12 mins ago', risk: 'Low', riskColor: 'bg-green-100 text-green-700' },
                    { id: 'usr_943', name: 'Djamila Bouhired', type: 'Merchant Verification', date: '1 hour ago', risk: 'Medium', riskColor: 'bg-orange-100 text-orange-700' },
                    { id: 'usr_105', name: 'Slimane Azem', type: 'Level 3 Upgrade', date: '3 hours ago', risk: 'High', riskColor: 'bg-red-100 text-red-700' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white text-[10px] font-bold font-mono">
                            {row.id.split('_')[1]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{row.name}</p>
                            <p className="text-[10px] font-mono text-gray-400 tracking-tighter">{row.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-sm font-medium text-gray-600">{row.type}</span>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {row.date}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${row.riskColor}`}>
                          {row.risk}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <button className="p-2 bg-gray-100 text-gray-400 hover:bg-gray-900 hover:text-white rounded-lg transition-all group-hover:scale-110">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        );
      case 'aml':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">AML Monitoring</h2>
              <button className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-100">
                Generate SAR
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm border-l-4 border-l-red-500">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <h3 className="font-bold">Suspicious Activity Detected</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  Multiple high-value transfers (500k+ DA) detected across 3 accounts linked to the same IP range in the last 24 hours.
                </p>
                <div className="space-y-3">
                  {[
                    { user: 'ID_9901', amount: '850,000 DA', status: 'Blocked' },
                    { user: 'ID_9902', amount: '620,000 DA', status: 'Investigation' },
                  ].map((alert, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-sm font-mono font-bold">{alert.user}</span>
                      </div>
                      <span className="text-sm font-bold">{alert.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold mb-6">Global Sanctions Sync</h3>
                <div className="space-y-4">
                  {[
                    { list: 'UN Sanctions List', status: 'Synced', date: '2m ago' },
                    { list: 'OFAC SDN List', status: 'Synced', date: '5m ago' },
                    { list: 'EU Consolidated List', status: 'Pending', date: '12h ago' },
                    { list: 'Central Bank Watchlist', status: 'Synced', date: '1m ago' },
                  ].map((list, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${list.status === 'Synced' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          <Database className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">{list.list}</span>
                      </div>
                      <div className="text-right">
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${list.status === 'Synced' ? 'text-green-600' : 'text-orange-500'}`}>{list.status}</p>
                        <p className="text-[10px] text-gray-400">{list.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );
      default:
        return (
          <div className="space-y-8">
            {/* System Status Banner */}
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white flex items-center justify-between relative overflow-hidden shadow-2xl shadow-indigo-100">
              <div className="relative z-10">
                <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-2">System Health: Operational</p>
                <h2 className="text-3xl font-bold tracking-tight">Cantonnement Check: <span className="text-green-300">Reconciled</span></h2>
                <div className="mt-4 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-xs font-bold text-indigo-100 uppercase tracking-tighter">Gateway: 12ms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-xs font-bold text-indigo-100 uppercase tracking-tighter">Database: 4ms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-xs font-bold text-indigo-100 uppercase tracking-tighter">Ledger: 8ms</span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-3 relative z-10">
                <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-bold transition-all border border-white/20 backdrop-blur-md">
                  Audit Logs
                </button>
                <button className="px-6 py-3 bg-white text-indigo-600 rounded-2xl text-sm font-bold shadow-xl hover:scale-105 transition-transform">
                  Full Report
                </button>
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl" />
            </div>

            {/* Admin Stats Bento */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Volume', value: '450.2M DA', icon: Activity, color: 'bg-blue-50 text-blue-600' },
                { label: 'Active Users', value: '12,402', icon: Users, color: 'bg-indigo-50 text-indigo-600' },
                { label: 'Merchant Sales', value: '89.4M DA', icon: ArrowUpRight, color: 'bg-green-50 text-green-600' },
                { label: 'AML Flags', value: '14', icon: ShieldCheck, color: 'bg-red-50 text-red-600' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                  <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold font-sans text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Quick Management Rails */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="font-bold text-lg">System Audit Feed</h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-time Stream</span>
                </div>
                <div className="p-4 bg-gray-900 font-mono text-[10px] text-green-400 h-64 overflow-y-auto space-y-1">
                  <p className="opacity-40">[09:12:01] INF: System heartbeat successful</p>
                  <p>[09:12:04] TRN: User (usr_812) requested transfer 5,000 DA</p>
                  <p>[09:12:04] LGR: Atomic balance decrement successful (usr_812)</p>
                  <p className="text-indigo-400">[09:12:12] KYC: New document submission (usr_105) - national_id.jpg</p>
                  <p className="text-yellow-400">[09:12:15] WRN: Velocity limit approaching (usr_943)</p>
                  <p>[09:12:20] INF: Settlement batch #492 completed (Total: 1.2M DA)</p>
                  <p className="opacity-40">[09:13:01] INF: System heartbeat successful</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                  <h3 className="font-bold mb-6 flex items-center justify-between">
                    System Controls
                    <Settings className="w-4 h-4 text-gray-400" />
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Maintenance Mode', status: 'Inactive', color: 'bg-gray-100 text-gray-500' },
                      { label: 'Sandbox Mode', status: 'Active', color: 'bg-green-100 text-green-700' },
                      { label: 'Auto-Settlement', status: 'Active', color: 'bg-green-100 text-green-700' },
                      { label: 'Manual Review', status: 'Required', color: 'bg-orange-100 text-orange-700' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group cursor-pointer hover:bg-gray-100 transition-colors">
                        <span className="text-sm font-bold text-gray-700">{item.label}</span>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.color}`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                  <h3 className="font-bold mb-6">Admin Team</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Admin One', role: 'Super Admin', online: true },
                      { name: 'Compliance Dev', role: 'Security', online: true },
                      { name: 'Support Mod', role: 'Moderator', online: false },
                    ].map((admin, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400">
                              {admin.name.charAt(0)}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${admin.online ? 'bg-green-500' : 'bg-gray-300'}`} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{admin.name}</p>
                            <p className="text-[10px] text-gray-500 font-medium uppercase">{admin.role}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </div>
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
      {/* Admin Sidebar */}
      <aside className="w-80 bg-gray-900 text-white flex flex-col p-8 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-16">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100/20">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight block">DinarFlow</span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Admin Control</span>
          </div>
        </div>

        <nav className="flex-1 space-y-4">
          {[
            { id: 'stats', icon: LayoutDashboard, label: 'Overview' },
            { id: 'users', icon: Users, label: 'User Directory' },
            { id: 'kyc', icon: ShieldCheck, label: 'KYC Reviews' },
            { id: 'aml', icon: Activity, label: 'AML Monitoring' },
            { id: 'system', icon: Settings, label: 'System Config' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-white text-gray-900 shadow-xl shadow-black/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold text-white">
              A
            </div>
            <div>
              <p className="text-sm font-bold">Admin Officer</p>
              <p className="text-[10px] text-gray-500 font-mono tracking-tighter">ID: AO_9921_X</p>
            </div>
          </div>
          <button className="w-full py-4 bg-white/5 text-gray-400 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all">
            Lock System
          </button>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 p-12 max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
            <input 
              type="text" 
              placeholder="Search global database (IDs, names, hashes)..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-gray-900/5 outline-none transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs font-bold text-gray-900">July 04, 2026</p>
              <p className="text-[10px] text-gray-400 font-mono">09:35:12 UTC</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
