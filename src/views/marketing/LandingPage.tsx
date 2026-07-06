import React from 'react';
import { motion } from 'motion/react';
import { Wallet, Shield, Globe, ArrowRight, CheckCircle2, ChevronRight, Zap, Users, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-indigo-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">DinarFlow</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#solutions" className="hover:text-gray-900 transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#developers" className="hover:text-gray-900 transition-colors">Developers</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">Log in</Link>
            <Link to="/signup" className="px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gray-200">
              Open Account
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                Licensed Algerian PSP
              </div>
              <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
                Send money like <span className="text-indigo-600">Wise</span>, built for <span className="underline decoration-indigo-200 decoration-8 underline-offset-8">Algeria</span>.
              </h1>
              <p className="text-xl text-gray-500 leading-relaxed mb-10 max-w-lg">
                The modern payment platform for Algeria. Manage Dinars, pay bills, and scale your business with zero hidden fees and real-time security.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all hover:shadow-xl group">
                  Get Started Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/contact" className="px-8 py-4 bg-gray-50 text-gray-900 rounded-2xl font-bold flex items-center justify-center hover:bg-gray-100 transition-all">
                  Talk to Sales
                </Link>
              </div>
              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-400 font-medium">
                  Trusted by <span className="text-gray-900 font-bold">10,000+</span> users in Algiers & Oran.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square w-full max-w-lg mx-auto bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-[3rem] p-8 relative">
                {/* Floating UI Elements */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-6 -right-6 w-56 bg-white rounded-3xl shadow-2xl p-6 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-green-600 uppercase">Received</span>
                  </div>
                  <p className="text-2xl font-bold mb-1">+45,000.00 DA</p>
                  <p className="text-xs text-gray-400">From Freelance Payment</p>
                </motion.div>

                <motion.div 
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-10 -left-10 w-64 bg-white rounded-3xl shadow-2xl p-6 border border-gray-100"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Encrypted</p>
                      <p className="text-[10px] text-gray-400">Biometric Verified</p>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-green-500 rounded-full" />
                  </div>
                </motion.div>

                {/* Main Mockup */}
                <div className="w-full h-full bg-gray-900 rounded-[2.5rem] shadow-3xl overflow-hidden relative border border-gray-800">
                  <div className="p-8 text-white">
                    <p className="text-xs opacity-60 mb-2">Total Balance</p>
                    <p className="text-4xl font-bold mb-8">12.4M <span className="text-lg opacity-40">DA</span></p>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] opacity-40 uppercase tracking-widest mb-1">Incoming</p>
                        <p className="text-lg font-bold">+120k</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] opacity-40 uppercase tracking-widest mb-1">Expenses</p>
                        <p className="text-lg font-bold">-45k</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/10 rounded-full" />
                            <div className="h-2 w-20 bg-white/20 rounded-full" />
                          </div>
                          <div className="h-2 w-12 bg-white/10 rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <p className="text-4xl font-bold text-gray-900 mb-2">10k+</p>
              <p className="text-sm text-gray-500 font-medium">Active Users</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-gray-900 mb-2">50M+</p>
              <p className="text-sm text-gray-500 font-medium">Monthly Vol (DA)</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-gray-900 mb-2">100%</p>
              <p className="text-sm text-gray-500 font-medium">Local Compliance</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-gray-900 mb-2">24/7</p>
              <p className="text-sm text-gray-500 font-medium">Arabic Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Everything you need to move money.</h2>
            <p className="text-lg text-gray-500">Built specifically for the Algerian market, compliant with Central Bank regulations.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Shield, 
                title: 'Regulatory Compliant', 
                desc: 'Full "Cantonnement" logic ensuring user funds are always protected in separate bank accounts.',
                color: 'bg-blue-50 text-blue-600'
              },
              { 
                icon: Users, 
                title: 'Multi-Tier KYC', 
                desc: 'Digital onboarding from Level 1 (Basic) to Level 3 (Premium) with automated document verification.',
                color: 'bg-indigo-50 text-indigo-600'
              },
              { 
                icon: Zap, 
                title: 'Instant P2P', 
                desc: 'Send money to any DinarFlow user instantly using just their phone number or payment handle.',
                color: 'bg-yellow-50 text-yellow-600'
              },
              { 
                icon: Globe, 
                title: 'Merchant Gateway', 
                desc: 'The best-in-class API for Algerian e-commerce businesses to accept payments online.',
                color: 'bg-green-50 text-green-600'
              },
              { 
                icon: BarChart3, 
                title: 'Business Analytics', 
                desc: 'Real-time reporting for settlements, refunds, and daily reconciliation for commercial accounts.',
                color: 'bg-purple-50 text-purple-600'
              },
              { 
                icon: CheckCircle2, 
                title: 'Fraud Detection', 
                desc: 'AI-driven monitoring systems identifying suspicious patterns to protect your assets.',
                color: 'bg-red-50 text-red-600'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:shadow-xl transition-all group"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-white text-gray-900 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight">DinarFlow</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Empowering the digital economy in Algeria. Fast, secure, and compliant payments for everyone.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-gray-500">Product</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Individual Portal</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Business Portal</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-gray-500">Resources</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-gray-500">Legal</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">License Information</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-gray-500">© 2026 DinarFlow PSP. All rights reserved. Licensed by Bank of Algeria.</p>
            <div className="flex gap-6">
              {['Twitter', 'LinkedIn', 'Instagram'].map((social) => (
                <a key={social} href="#" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
