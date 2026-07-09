import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  Eye,
  Bell,
  X,
  FileText,
  RefreshCw,
  Check,
  ShieldAlert,
  Sliders,
  Sparkles
} from 'lucide-react';
import { apiRequest } from '../../lib/api';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'kyc' | 'aml' | 'system'>('stats');
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({
    maintenanceMode: false,
    sandboxMode: true,
    autoSettlement: true,
    manualReview: false,
  });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // KYC modal state
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [selectedUserKyc, setSelectedUserKyc] = useState<any>(null);
  const [reviewingKyc, setReviewingKyc] = useState(false);

  // SAR modal state
  const [sarModalOpen, setSarModalOpen] = useState(false);
  const [selectedUserForSar, setSelectedUserForSar] = useState('');
  const [sarNotes, setSarNotes] = useState('');
  const [generatedSar, setGeneratedSar] = useState<any>(null);
  const [generatingSar, setGeneratingSar] = useState(false);

  // Promotion state
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [meData, usersData, configData, logsData] = await Promise.all([
        apiRequest('/api/v1/accounts/me').catch(() => null),
        apiRequest('/api/v1/admin/users').catch(() => []),
        apiRequest('/api/v1/admin/system/config').catch(() => ({
          maintenanceMode: false,
          sandboxMode: true,
          autoSettlement: true,
          manualReview: false,
        })),
        apiRequest('/api/v1/admin/logs?limit=50').catch(() => []),
      ]);
      setCurrentUser(meData?.user || null);
      setUsers(usersData);
      setConfig(configData);
      setLogs(logsData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Poll logs every 5 seconds for a real-time system audit experience
    const interval = setInterval(async () => {
      try {
        const logsData = await apiRequest('/api/v1/admin/logs?limit=50').catch(() => []);
        setLogs(logsData);
      } catch (err) {
        // Silently capture
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleConfig = async (key: string, currentValue: boolean) => {
    try {
      const updated = await apiRequest('/api/v1/admin/system/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: !currentValue }),
      });
      setConfig(updated);
      // Fetch fresh audit logs to reflect setting changes immediately
      const logsData = await apiRequest('/api/v1/admin/logs?limit=50').catch(() => []);
      setLogs(logsData);
    } catch (err) {
      console.error('Failed to update system config:', err);
    }
  };

  const handleOpenKycReview = async (userId: string) => {
    try {
      const data = await apiRequest(`/api/v1/admin/kyc/${userId}/documents`);
      setSelectedUserKyc(data);
      setKycModalOpen(true);
    } catch (err) {
      console.error('Failed to load KYC details:', err);
    }
  };

  const handleActionKyc = async (userId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      setReviewingKyc(true);
      await apiRequest(`/api/v1/admin/kyc/${userId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setKycModalOpen(false);
      setSelectedUserKyc(null);
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to update KYC status:', err);
    } finally {
      setReviewingKyc(false);
    }
  };

  const handleGenerateSar = async () => {
    if (!selectedUserForSar) return;
    try {
      setGeneratingSar(true);
      setGeneratedSar(null);
      const res = await apiRequest('/api/v1/admin/aml/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserForSar, notes: sarNotes }),
      });
      setGeneratedSar(res);
      // Refresh audit logs
      const logsData = await apiRequest('/api/v1/admin/logs?limit=50').catch(() => []);
      setLogs(logsData);
    } catch (err: any) {
      console.error('Failed to generate AI report:', err);
    } finally {
      setGeneratingSar(false);
    }
  };

  const handlePromoteUser = async (userId: string, role: string) => {
    try {
      setPromotingUserId(userId);
      await apiRequest('/api/v1/users/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to promote user:', err);
    } finally {
      setPromotingUserId(null);
    }
  };

  // Filter users pending review
  const pendingKycUsers = users.filter(u => u.kyc_status === 'PENDING' || u.kyc_status === 'PENDING_REVIEW');

  const renderContent = () => {
    if (loading && users.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Syncing Ledger & Core Database...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'users':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold font-sans text-gray-900">User Directory</h2>
                <p className="text-sm text-gray-500 font-medium">Manage and promote accounts within the DinarFlow PSP network.</p>
              </div>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">{users.length} Registered Users</span>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User Details</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">KYC Status</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined Date</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white text-[10px] font-bold font-mono">
                              {user.id.substring(0, 4).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
                              <p className="text-[10px] font-mono text-gray-400 tracking-tighter">@{user.payment_tag}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-sm text-gray-600">{user.email}</span>
                        </td>
                        <td className="px-8 py-4">
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-lg uppercase">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            user.kyc_status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                            user.kyc_status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {user.kyc_status} (L{user.kyc_level})
                          </span>
                        </td>
                        <td className="px-8 py-4 text-xs text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-4 text-right space-x-2">
                          {user.role !== 'ADMIN' && (
                            <button
                              disabled={promotingUserId === user.id}
                              onClick={() => handlePromoteUser(user.id, 'ADMIN')}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                            >
                              Make Admin
                            </button>
                          )}
                          {user.role !== 'MERCHANT' && (
                            <button
                              disabled={promotingUserId === user.id}
                              onClick={() => handlePromoteUser(user.id, 'MERCHANT')}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                            >
                              Make Merchant
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        );
      case 'kyc':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold font-sans">KYC Review Queue</h2>
                <p className="text-sm text-gray-500 font-medium">Verify official credentials and process account validation requests.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider">
                  {pendingKycUsers.length} Pending
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">
                  {users.filter(u => u.kyc_status === 'VERIFIED').length} Verified
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User Details</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Created At</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Level Target</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pendingKycUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-sm text-gray-400 font-bold uppercase">
                        All clear! No pending KYC requests.
                      </td>
                    </tr>
                  ) : (
                    pendingKycUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white text-[10px] font-bold font-mono">
                              {u.id.substring(0, 4).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{u.full_name}</p>
                              <p className="text-[10px] font-mono text-gray-400 tracking-tighter">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            {u.kyc_status}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(u.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-sm font-bold text-gray-700">Level {u.kyc_level === 1 ? '2' : '3'} Upgrade</span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <button
                            onClick={() => handleOpenKycReview(u.id)}
                            className="p-2 bg-gray-100 text-gray-400 hover:bg-gray-900 hover:text-white rounded-lg transition-all group-hover:scale-110"
                            title="Open KYC Viewer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        );
      case 'aml':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">AML Monitoring Engine</h2>
                <p className="text-sm text-gray-500 font-medium">Verify system alerts and generate AI-powered Suspicious Activity Reports (SAR).</p>
              </div>
              <button
                onClick={() => {
                  setSarNotes('');
                  setGeneratedSar(null);
                  setSarModalOpen(true);
                }}
                className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Generate SAR
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm border-l-4 border-l-red-500 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <h3 className="font-bold">Suspicious System Alerts</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Multiple high-value transfers detected in system activity logs requiring compliance review. Run SAR summaries to verify.
                </p>
                <div className="space-y-3">
                  {users.slice(0, 3).map((alertUser, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{alertUser.full_name}</p>
                          <p className="text-[10px] font-mono text-gray-400">@{alertUser.payment_tag}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-full uppercase">Review Tier</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
                <h3 className="font-bold">Global Watchlist Integrations</h3>
                <div className="space-y-4">
                  {[
                    { list: 'UN Financial Sanctions List', status: 'Synced', date: '5m ago' },
                    { list: 'US OFAC SDN Watchlist', status: 'Synced', date: '10m ago' },
                    { list: 'Algerian Central Bank Directives', status: 'Synced', date: 'Just now' },
                    { list: 'EU PEP Consolidated Watchlist', status: 'Synced', date: '30m ago' },
                  ].map((list, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                          <Database className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">{list.list}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-green-600">{list.status}</p>
                        <p className="text-[10px] text-gray-400">{list.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'system':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold font-sans">System Controls & Compliance Logs</h2>
                <p className="text-sm text-gray-500 font-medium">Update operational parameters and browse structured logger output directly from the database.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Configuration Toggles */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-6">
                <h3 className="font-bold flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600" /> Operational Toggles
                </h3>
                <div className="space-y-4">
                  {[
                    { key: 'maintenanceMode', label: 'Maintenance Mode', description: 'Suspend public platform access' },
                    { key: 'sandboxMode', label: 'Sandbox Mode', description: 'Enable mock financial simulations' },
                    { key: 'autoSettlement', label: 'Auto-Settlement', description: 'Process daily batches immediately' },
                    { key: 'manualReview', label: 'Manual Review', description: 'Force review on all withdrawals' },
                  ].map((item) => (
                    <div 
                      key={item.key} 
                      onClick={() => handleToggleConfig(item.key, config[item.key])}
                      className="flex items-start justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="text-sm font-bold text-gray-800">{item.label}</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">{item.description}</p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        config[item.key] ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {config[item.key] ? 'ON' : 'OFF'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Audit log viewer */}
              <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm flex flex-col">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-gray-600" />
                    <h3 className="font-bold text-base">Structured Database Logs</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded uppercase tracking-widest">
                    Live Stream
                  </span>
                </div>
                <div className="p-6 bg-gray-950 font-mono text-[11px] text-gray-300 h-[380px] overflow-y-auto space-y-2.5">
                  {logs.length === 0 ? (
                    <p className="text-gray-500 italic">No logs recorded in the database yet.</p>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2 border-b border-gray-900 pb-1.5 last:border-b-0">
                        <span className="text-gray-500 font-medium">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className={`font-bold ${
                          log.level === 'ERROR' ? 'text-red-500' : 
                          log.level === 'WARN' ? 'text-amber-500' : 'text-emerald-400'
                        }`}>
                          {log.level}:
                        </span>
                        <span className="text-indigo-300">[{log.context}]</span>
                        <span className="text-gray-200 flex-1 break-all">{log.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      default:
        // stats view (default / Overview)
        return (
          <div className="space-y-8">
            {/* System Status Banner */}
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white flex items-center justify-between relative overflow-hidden shadow-2xl shadow-indigo-100">
              <div className="relative z-10">
                <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-2">System Health: Operational</p>
                <h2 className="text-3xl font-bold tracking-tight">Cantonnement Check: <span className="text-green-300">Reconciled</span></h2>
                <div className="mt-4 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
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
                <button 
                  onClick={() => setActiveTab('system')}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-bold transition-all border border-white/20 backdrop-blur-md"
                >
                  Audit Controls
                </button>
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl" />
            </div>

            {/* Admin Stats Bento */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Network Accounts', value: users.length.toString(), icon: Users, color: 'bg-indigo-50 text-indigo-600' },
                { label: 'Sandbox Mode', value: config.sandboxMode ? 'Enabled' : 'Disabled', icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Auto-Settlement', value: config.autoSettlement ? 'Active' : 'Paused', icon: Sliders, color: 'bg-indigo-50 text-indigo-600' },
                { label: 'KYC Reviews Pending', value: pendingKycUsers.length.toString(), icon: AlertTriangle, color: 'bg-orange-50 text-orange-600' },
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
              <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm flex flex-col">
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50">
                  <h3 className="font-bold text-lg">System Audit Feed</h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-time Stream</span>
                </div>
                <div className="p-4 bg-gray-950 font-mono text-[10px] text-emerald-400 h-64 overflow-y-auto space-y-2">
                  {logs.slice(0, 15).map((log) => (
                    <p key={log.id}>
                      <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span> <span className="text-indigo-400">[{log.context}]</span> {log.message}
                    </p>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                  <h3 className="font-bold mb-6 flex items-center justify-between">
                    Quick Controls
                    <Settings className="w-4 h-4 text-gray-400" />
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: 'maintenanceMode', label: 'Maintenance Mode' },
                      { key: 'sandboxMode', label: 'Sandbox Mode' },
                      { key: 'autoSettlement', label: 'Auto-Settlement' },
                      { key: 'manualReview', label: 'Manual Review' },
                    ].map((item) => (
                      <div 
                        key={item.key} 
                        onClick={() => handleToggleConfig(item.key, config[item.key])}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-sm font-bold text-gray-700">{item.label}</span>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          config[item.key] ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {config[item.key] ? 'Active' : 'Inactive'}
                        </span>
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

  if (!loading && (!currentUser || currentUser.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center w-full">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 max-w-md mb-8">
          You do not have Administrator privileges. This portal is restricted to compliance officers and platform administrators.
        </p>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm max-w-md w-full mb-8 text-left">
          <h3 className="font-bold text-gray-950 mb-2">How to test the Admin Portal:</h3>
          <p className="text-sm text-gray-600 leading-relaxed space-y-1">
            1. Go to the <a href="/signup" className="text-indigo-600 font-bold hover:underline">Sign-Up Page</a>.<br />
            2. Choose <strong className="text-gray-900">Administrator</strong> as the account type.<br />
            3. Log in with the newly created administrator account.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/15"
          >
            Go to User Portal
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('df_token');
              window.location.href = '/login';
            }}
            className="px-6 py-3 bg-white text-gray-700 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
          >
            Log Out & Sign Up
          </button>
        </div>
      </div>
    );
  }

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
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white">
              A
            </div>
            <div>
              <p className="text-sm font-bold">Admin Officer</p>
              <p className="text-[10px] text-gray-500 font-mono tracking-tighter">ID: AO_9921_X</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="w-full py-4 bg-white/5 text-gray-400 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
          >
            User Portal
          </button>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 p-12 max-w-7xl mx-auto relative">
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
              <p className="text-xs font-bold text-gray-900">July 07, 2026</p>
              <p className="text-[10px] text-gray-400 font-mono">Compliance Gateway</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {renderContent()}

        {/* 1. KYC DOCUMENT REVIEW MODAL */}
        {kycModalOpen && selectedUserKyc && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[150] flex items-center justify-center p-6">
            <div className="bg-white rounded-[2.5rem] max-w-2xl w-full p-8 shadow-2xl border border-gray-100 flex flex-col gap-6 max-h-[90vh] overflow-y-auto relative">
              <button 
                onClick={() => setKycModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div>
                <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                  KYC Verification Portal
                </span>
                <h3 className="text-2xl font-bold font-sans mt-2">{selectedUserKyc.fullName}</h3>
                <p className="text-sm text-gray-500 font-medium">Review and verify the submitted papers for Level {selectedUserKyc.kycLevel === 1 ? '2' : '3'} upgrade.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl text-xs font-mono">
                <div>
                  <p className="text-gray-400 font-bold">EMAIL ADDRESS</p>
                  <p className="text-gray-900 mt-1 font-bold">{selectedUserKyc.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold">USER UNIQUE ID</p>
                  <p className="text-gray-900 mt-1 font-bold text-xs">{selectedUserKyc.userId}</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Submitted Credentials ({selectedUserKyc.documents.length})</p>
                {selectedUserKyc.documents.map((doc: any, i: number) => (
                  <div key={i} className="border border-gray-100 rounded-3xl p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{doc.type}</p>
                          <p className="text-[10px] font-mono text-gray-400">Doc No: {doc.number}</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        {doc.status}
                      </span>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-gray-100 h-40 bg-gray-100 relative">
                      <img 
                        src={doc.fileUrl} 
                        alt={doc.type} 
                        className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  disabled={reviewingKyc}
                  onClick={() => handleActionKyc(selectedUserKyc.userId, 'REJECTED')}
                  className="flex-1 py-4 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-2xl text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                  Reject Submission
                </button>
                <button
                  disabled={reviewingKyc}
                  onClick={() => handleActionKyc(selectedUserKyc.userId, 'VERIFIED')}
                  className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-colors shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Approve Upgrade
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. GENERATE SAR MODAL */}
        {sarModalOpen && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[150] flex items-center justify-center p-6">
            <div className="bg-white rounded-[2.5rem] max-w-2xl w-full p-8 shadow-2xl border border-gray-100 flex flex-col gap-6 max-h-[90vh] overflow-y-auto relative">
              <button 
                onClick={() => setSarModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1.5 w-max">
                  <ShieldAlert className="w-3.5 h-3.5" /> AML Intelligence
                </span>
                <h3 className="text-2xl font-bold font-sans mt-2">Generate Suspicious Activity Report (SAR)</h3>
                <p className="text-sm text-gray-500 font-medium">Trigger AI compliance agent to summarize transaction histories and potential banking violations.</p>
              </div>

              {!generatedSar ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Select Subject User</label>
                    <select
                      value={selectedUserForSar}
                      onChange={(e) => setSelectedUserForSar(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-gray-900/5 outline-none transition-all shadow-sm font-bold"
                    >
                      <option value="">-- Choose suspicious user --</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Compliance Notes / Observations</label>
                    <textarea
                      placeholder="e.g. Multiple large-value transactions in short sequences from shared IPs, approaching daily velocity limits..."
                      rows={4}
                      value={sarNotes}
                      onChange={(e) => setSarNotes(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-gray-900/5 outline-none transition-all shadow-sm font-medium resize-none"
                    />
                  </div>

                  <button
                    disabled={generatingSar || !selectedUserForSar}
                    onClick={handleGenerateSar}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {generatingSar ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Transactions with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Trigger Compliance Summary
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-bold text-green-900">AI Report Generated Successfully</p>
                      <p className="text-xs text-green-700">Ready for submission to CTR (Financial Intelligence Unit).</p>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-3xl p-6 bg-gray-50 h-96 overflow-y-auto">
                    <div className="prose prose-sm text-gray-700 leading-relaxed font-sans whitespace-pre-wrap">
                      {generatedSar.generatedReport}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setGeneratedSar(null)}
                      className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-xs uppercase tracking-widest transition-colors"
                    >
                      Audit Another User
                    </button>
                    <button
                      onClick={() => setSarModalOpen(false)}
                      className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-colors shadow-lg shadow-indigo-100"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
