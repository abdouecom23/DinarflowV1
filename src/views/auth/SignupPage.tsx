import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Lock, 
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

type AccountType = 'individual' | 'merchant';

const SignupPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    businessName: '',
    agreedToTerms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: accountType === 'merchant' ? formData.businessName : formData.fullName,
          role: accountType === 'merchant' ? 'MERCHANT' : 'USER',
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Signup failed');
      }

      const { access_token } = await response.json();
      localStorage.setItem('df_token', access_token);

      setStep(5);
      setTimeout(() => {
        navigate(accountType === 'merchant' ? '/merchant' : '/dashboard');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Choose your account</h2>
              <p className="text-gray-500">Select the type of account you want to open.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => { setAccountType('individual'); handleNext(); }}
                className={`p-6 rounded-3xl border-2 text-left transition-all group ${
                  accountType === 'individual' ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Individual</h3>
                    <p className="text-xs text-gray-500">Send, receive and spend money locally.</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => { setAccountType('merchant'); handleNext(); }}
                className={`p-6 rounded-3xl border-2 text-left transition-all group ${
                  accountType === 'merchant' ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Merchant</h3>
                    <p className="text-xs text-gray-500">Accept payments and grow your business.</p>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Basic Info</h2>
              <p className="text-gray-500">Tell us a bit about {accountType === 'merchant' ? 'your business' : 'yourself'}.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  {accountType === 'merchant' ? 'Business Legal Name' : 'Full Name (as per ID)'}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={accountType === 'merchant' ? formData.businessName : formData.fullName}
                    onChange={(e) => setFormData({ ...formData, [accountType === 'merchant' ? 'businessName' : 'fullName']: e.target.value })}
                    className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gray-900/10 outline-none"
                    placeholder={accountType === 'merchant' ? 'e.g. TechDZ Solutions' : 'e.g. Ahmed Benali'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gray-900/10 outline-none"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!(accountType === 'merchant' ? formData.businessName : formData.fullName) || !formData.email}
              className="w-full h-14 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition-all"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Phone Number</h2>
              <p className="text-gray-500">Used for 2FA and secure transactions.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-4">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <p className="text-xs text-blue-700 font-medium">We'll send a code to verify this number.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Algerian Mobile Number</label>
                <div className="flex gap-2">
                  <div className="h-14 px-4 bg-gray-100 rounded-2xl flex items-center justify-center font-bold text-gray-500">
                    +213
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gray-900/10 outline-none"
                      placeholder="555 00 00 00"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!formData.phone}
              className="w-full h-14 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition-all"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Set Password</h2>
              <p className="text-gray-500">Make sure it's secure and memorable.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Create Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gray-900/10 outline-none"
                    placeholder="Min 8 characters"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  checked={formData.agreedToTerms}
                  onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded-lg border-gray-200 text-gray-900 focus:ring-gray-900"
                />
                <label htmlFor="terms" className="text-sm text-gray-500 leading-relaxed">
                  I agree to DinarFlow's <Link to="/terms" className="text-gray-900 font-bold underline decoration-gray-200">Terms of Service</Link> and <Link to="/privacy" className="text-gray-900 font-bold underline decoration-gray-200">Privacy Policy</Link>.
                </label>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm animate-shake"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={!formData.password || !formData.agreedToTerms || isSubmitting}
                className="w-full h-14 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition-all shadow-xl shadow-gray-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Welcome to DinarFlow!</h2>
            <p className="text-gray-500 mb-8">Account created successfully. Redirecting to your dashboard...</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200" />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left Column: Branding & Info */}
      <div className="hidden md:flex w-1/3 bg-gray-900 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white text-gray-900 rounded-xl flex items-center justify-center shadow-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">DinarFlow</span>
          </div>

          <div className="space-y-12">
            <div>
              <h3 className="text-3xl font-bold leading-tight mb-4">Start moving money faster.</h3>
              <p className="text-gray-400 leading-relaxed">
                Join thousands of Algerians managing their finances with modern tools.
              </p>
            </div>

            <div className="space-y-6">
              {[
                'Instant Dinar transfers',
                'Business payment links',
                'Compliant with Bank of Algeria',
                'Advanced fraud protection'
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-12 border-t border-white/10">
          <p className="text-xs text-gray-500">© 2026 DinarFlow PSP. Licensed by the Bank of Algeria.</p>
        </div>

        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full -ml-32 -mb-32 blur-3xl" />
      </div>

      {/* Right Column: Signup Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-md">
          {/* Progress Indicator */}
          {step < 5 && (
            <div className="flex items-center justify-between mb-12">
              {step > 1 ? (
                <button 
                  onClick={handleBack}
                  className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div className="w-4 h-4" />
              )}
              
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <div 
                    key={s} 
                    className={`h-1.5 w-8 rounded-full transition-all ${
                      s <= step ? 'bg-gray-900' : 'bg-gray-200'
                    }`} 
                  />
                ))}
              </div>
              
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Step {step}/4
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {step < 5 && (
            <p className="mt-8 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-gray-900 font-bold hover:underline">Log in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
