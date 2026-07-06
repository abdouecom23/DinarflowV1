import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Fingerprint,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Invalid email or password');
      }

      const { access_token, user } = await response.json();
      
      // Store token (TODO: migrate to httpOnly cookies for production)
      localStorage.setItem('df_token', access_token);

      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'MERCHANT') {
        navigate('/merchant');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-[2rem] shadow-xl mb-6">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500 font-medium">Log in to manage your DinarFlow account.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-gray-200/50 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gray-900/10 outline-none transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="block text-sm font-bold text-gray-700">Password</label>
                  <button type="button" className="text-xs font-bold text-indigo-600 hover:underline">Forgot?</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gray-900/10 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative w-5 h-5">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  />
                  <div className="w-5 h-5 bg-gray-100 rounded-lg border border-gray-200 peer-checked:bg-gray-900 peer-checked:border-gray-900 transition-all" />
                  <ShieldCheck className="absolute top-0 left-0 w-5 h-5 text-white scale-0 peer-checked:scale-75 transition-transform" />
                </div>
                <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700">Remember me</span>
              </label>
              
              <button type="button" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors">
                <Fingerprint className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Biometric</span>
              </button>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition-all shadow-xl shadow-gray-200 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Log In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-50 text-center">
            <p className="text-sm text-gray-500 font-medium">
              New to DinarFlow?{' '}
              <Link to="/signup" className="text-gray-900 font-bold hover:underline">Create an account</Link>
            </p>
          </div>
        </div>

        {/* Info Pill */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm border border-white rounded-full shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Secure Server: Algiers-DC-01</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
