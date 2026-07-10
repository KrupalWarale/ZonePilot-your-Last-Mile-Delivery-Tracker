import React, { useState } from 'react';
import { useDemo } from '../store/DemoStore';
import { Role, Zone } from '../types';
import { Package2, ArrowRight, Lock, Mail, User, Shield, Info, Eye, EyeOff, Truck } from 'lucide-react';
import { motion } from 'motion/react';

export function LoginScreen() {
  const { login, register } = useDemo();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('customer');
  const [zone, setZone] = useState<Zone>('North');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!name || !email) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        const res = await register(name, email, role, role === 'agent' ? zone : undefined);
        if (res.success) {
          setSuccess(res.message);
          setIsRegister(false);
          setEmail(email); // preserve registered email
          setPassword('demo123'); // fill default pass
        } else {
          setError(res.message);
        }
      } else {
        if (!email || !password) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        const res = await login(email, password);
        if (!res.success) {
          setError(res.message);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (emailVal: string, passVal: string) => {
    setEmail(emailVal);
    setPassword(passVal);
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await login(emailVal, passVal);
      if (!res.success) {
        setError(res.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-zinc-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-zinc-900 text-white p-3 rounded-2xl shadow-md border border-zinc-800">
            <Package2 size={32} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900">
          {isRegister ? 'Create your account' : 'Sign in to ZonePilot'}
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Last-Mile Delivery Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-zinc-200/80 shadow-md rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg flex items-center gap-2">
              <Info size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-3 rounded-lg flex items-center gap-2">
              <Info size={16} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-lg text-sm bg-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-lg text-sm bg-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {!isRegister && (
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 border border-zinc-200 rounded-lg text-sm bg-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {isRegister && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Role Type
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="block w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all"
                  >
                    <option value="customer">Customer</option>
                    <option value="agent">Delivery Agent</option>
                  </select>
                </div>

                {role === 'agent' && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                      Hub / Zone
                    </label>
                    <select
                      value={zone}
                      onChange={(e) => setZone(e.target.value as Zone)}
                      className="block w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all"
                    >
                      <option value="North">North Hub</option>
                      <option value="South">South Hub</option>
                      <option value="East">East Hub</option>
                      <option value="West">West Hub</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{isRegister ? 'Register Account' : 'Sign In'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-zinc-150 pt-5">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
                setSuccess(null);
              }}
              className="w-full text-center text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Quick Access Roles */}
          <div className="mt-8 pt-6 border-t border-zinc-200">
            <div className="text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-4 text-center">
              Quick Select Account
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleQuickLogin('customer@zonepilot.app', 'demo123')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 transition-all cursor-pointer group text-center"
              >
                <div className="p-2 rounded-lg bg-zinc-100 text-zinc-700 group-hover:bg-zinc-200/80 transition-colors mb-2">
                  <User size={18} />
                </div>
                <span className="text-xs font-bold text-zinc-800">Customer</span>
                <span className="text-[10px] text-zinc-400 mt-0.5 leading-none">Order Hub</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('agent@zonepilot.app', 'demo123')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 transition-all cursor-pointer group text-center"
              >
                <div className="p-2 rounded-lg bg-zinc-100 text-zinc-700 group-hover:bg-zinc-200/80 transition-colors mb-2">
                  <Truck size={18} />
                </div>
                <span className="text-xs font-bold text-zinc-800">Agent</span>
                <span className="text-[10px] text-zinc-400 mt-0.5 leading-none">Deliveries</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@zonepilot.app', 'admin123')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 transition-all cursor-pointer group text-center"
              >
                <div className="p-2 rounded-lg bg-zinc-100 text-zinc-700 group-hover:bg-zinc-200/80 transition-colors mb-2">
                  <Shield size={18} />
                </div>
                <span className="text-xs font-bold text-zinc-800">Admin</span>
                <span className="text-[10px] text-zinc-400 mt-0.5 leading-none">Control</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
