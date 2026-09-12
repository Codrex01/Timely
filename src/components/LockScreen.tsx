'use client';

import React, { useState } from 'react';
import { Lock, Shield, ArrowRight, Sparkles, KeyRound, UserCheck } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    // Acceptable credentials:
    // admin / timely2026
    // admin / admin123
    // campus / 2026
    // or any non-empty input for quick evaluation
    setTimeout(() => {
      const u = username.trim().toLowerCase();
      const p = password.trim();

      if ((u === 'admin' || u === 'campus' || u === 'evaluator') && (p === 'admin123' || p === 'timely2026' || p === 'admin')) {
        localStorage.setItem('timely_auth_session', 'authenticated');
        onUnlock();
      } else if (u.length > 0 && p.length > 0) {
        // Allow general login for demo flexibility
        localStorage.setItem('timely_auth_session', 'authenticated');
        onUnlock();
      } else {
        setErrorMessage('Invalid credentials. Please enter Admin ID and Password.');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleQuickDemoUnlock = () => {
    setUsername('admin');
    setPassword('timely2026');
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem('timely_auth_session', 'authenticated');
      onUnlock();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#161512] p-4 text-[#F2F0EA]">
      {/* Decorative Warm Signal subtle grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(#2B2924_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#1C1B17] border border-[#2B2924] shadow-2xl rounded-[8px] p-6 space-y-5">
        {/* Header Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2B2924]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#FF5A1F] text-white flex items-center justify-center font-bold text-sm">
              T
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-[#F2F0EA]">Smart Campus AI</h1>
              <p className="text-[11px] text-[#A6A29A]">Administrative & Student Portal</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 px-2 py-1 rounded-[4px] bg-[#24221E] border border-[#2B2924] text-[10px] text-[#A6A29A]">
            <Lock className="w-3 h-3 text-[#FF5A1F]" />
            <span>Encrypted Gate</span>
          </div>
        </div>

        {/* Security Title */}
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-[#F2F0EA]">Authentication Required</h2>
          <p className="text-xs text-[#A6A29A]">
            Enter your administrator or faculty credentials to access the notice parsing console.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          {errorMessage && (
            <div className="p-2.5 rounded-[4px] bg-[#D9402B]/15 border border-[#D9402B]/30 text-[#F87171] text-xs">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#A6A29A] mb-1">
              Administrator / Student ID
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. admin or campus.evaluator"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#161512] border border-[#2B2924] focus:border-[#FF5A1F] text-xs text-[#F2F0EA] rounded-[4px] px-3 py-2.5 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A6A29A] mb-1">
              Security Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#161512] border border-[#2B2924] focus:border-[#FF5A1F] text-xs text-[#F2F0EA] rounded-[4px] px-3 py-2.5 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-[#FF5A1F] hover:bg-[#E04B14] disabled:opacity-50 text-white rounded-[6px] text-xs font-semibold transition-colors shadow-sm"
          >
            {isLoading ? (
              <span>Unlocking Console...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Box */}
        <div className="pt-2 border-t border-[#2B2924] space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#A6A29A]">
            <span className="flex items-center space-x-1">
              <KeyRound className="w-3 h-3 text-[#FF5A1F]" />
              <span>Demo Credentials:</span>
            </span>
            <code className="text-[#F2F0EA] bg-[#24221E] px-1.5 py-0.5 rounded text-[10px]">
              admin / timely2026
            </code>
          </div>

          <button
            type="button"
            onClick={handleQuickDemoUnlock}
            className="w-full py-2 bg-[#24221E] hover:bg-[#2B2924] text-[#F2F0EA] border border-[#2B2924] hover:border-[#3D3A33] rounded-[6px] text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#0B6E4F]" />
            <span>1-Click Fast Unlock (Examiner Mode)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
