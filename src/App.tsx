import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import LandingPage from './views/marketing/LandingPage';
import UserDashboard from './views/user/Dashboard';
import MerchantDashboard from './views/merchant/MerchantDashboard';
import AdminDashboard from './views/admin/AdminDashboard';
import SignupPage from './views/auth/SignupPage';
import LoginPage from './views/auth/LoginPage';
import React from 'react';

import { getAuthToken } from './lib/api';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getAuthToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Marketing / Public Routes */}
        <Route path="/" element={<LandingPage />} />
        
        {/* User Portal */}
        <Route 
          path="/dashboard/*" 
          element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} 
        />

        {/* Merchant Portal */}
        <Route 
          path="/merchant/*" 
          element={<ProtectedRoute><MerchantDashboard /></ProtectedRoute>} 
        />

        {/* Admin Portal */}
        <Route 
          path="/admin/*" 
          element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} 
        />

        {/* Auth Routes */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Demo Portal Switcher (For Preview Only) */}
      <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-2">
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 p-2 rounded-2xl shadow-2xl flex flex-col gap-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase px-2 py-1">Demo Switcher</p>
          <Link to="/" className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">Marketing</Link>
          <Link to="/login" className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">Login</Link>
          <Link to="/signup" className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">Signup</Link>
          <Link to="/dashboard" className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">User Portal</Link>
          <Link to="/merchant" className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">Merchant Portal</Link>
          <Link to="/admin" className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">Admin Portal</Link>
        </div>
      </div>
    </Router>
  );
}
