import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser, getCurrentUser } from '../services/authService';
import { UserType } from '../types';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDemoCredentials, setShowDemoCredentials] = useState(true);

  // Check if already logged in
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!emailOrPhone.trim() || !password.trim()) {
      setError('অনুগ্রহ করে আপনার ইমেইল/ফোন নম্বর এবং পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    const user = loginUser(emailOrPhone, password);
    if (user) {
      setSuccess('লগইন সফল হয়েছে! ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে...');
      setTimeout(() => {
        navigate('/dashboard');
        // Refresh page so header state updates
        window.location.reload();
      }, 1000);
    } else {
      setError('ভুল ইমেইল/ফোন নম্বর অথবা পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  const fillDemoCredentials = (email: string) => {
    setEmailOrPhone(email);
    setPassword('password123');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-md">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Title Block */}
        <div className="bg-slate-900 text-white p-6 text-center">
          <h2 className="text-2xl font-bold">লগইন করুন (Login)</h2>
          <p className="text-xs text-slate-400 mt-2">
            আপনার ড্যাশবোর্ডে প্রবেশ করতে নিচে লগইন করুন
          </p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                ইমেইল অথবা ফোন নম্বর <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="যেমন: student@gmail.com বা 017xxxxxxxx"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                পাসওয়ার্ড <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="আপনার পাসওয়ার্ড লিখুন"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-md text-sm mt-6"
            >
              লগইন করুন
            </button>
          </form>

          {/* Bottom links */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            আপনার কি কোনো একাউন্ট নেই?{' '}
            <Link to="/register" className="text-emerald-600 font-bold hover:underline">
              নতুন নিবন্ধন করুন
            </Link>
          </div>
        </div>
      </div>

      {/* Demo Credentials Box */}
      {showDemoCredentials && (
        <div className="mt-6 bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-md">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              টেস্ট ডেমো ক্রেডেনশিয়াল (সহজ টেস্টিং এর জন্য):
            </h4>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-bold text-slate-700 mb-1">👨‍🎓 ছাত্র-ছাত্রী একাউন্ট (Student Account):</p>
              <button
                onClick={() => fillDemoCredentials('student@gmail.com')}
                className="w-full text-left p-2 bg-white rounded border border-amber-100 text-[10px] text-slate-600 hover:bg-amber-100/50 transition-colors flex justify-between items-center"
              >
                <span>ইমেইল: <span className="font-semibold text-slate-900">student@gmail.com</span> | পাস: <span className="font-semibold text-slate-900">password123</span></span>
                <span className="bg-amber-600 text-white px-1.5 py-0.5 rounded text-[8px] font-bold shrink-0">অটো ফিল</span>
              </button>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-700 mb-1">👩‍🏫 শিক্ষক একাউন্ট (Teacher Account):</p>
              <button
                onClick={() => fillDemoCredentials('nusrat@gmail.com')}
                className="w-full text-left p-2 bg-white rounded border border-amber-100 text-[10px] text-slate-600 hover:bg-amber-100/50 transition-colors flex justify-between items-center"
              >
                <span>ইমেইল: <span className="font-semibold text-slate-900">nusrat@gmail.com</span> | পাস: <span className="font-semibold text-slate-900">password123</span></span>
                <span className="bg-amber-600 text-white px-1.5 py-0.5 rounded text-[8px] font-bold shrink-0">অটো ফিল</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
