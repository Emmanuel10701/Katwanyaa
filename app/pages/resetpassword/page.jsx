"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LoaderCircle,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

/**
 * ConditionItem Component
 * Modernized for mobile responsiveness with a compact layout.
 */
const ConditionItem = ({ condition, text }) => (
  <li className="flex items-center gap-2 py-1 sm:py-0.5">
    {condition ? (
      <CheckCircle size={16} className="text-green-500 shrink-0" />
    ) : (
      <XCircle size={16} className="text-white/20 shrink-0" />
    )}
    <span className={`text-[11px] sm:text-xs transition-colors duration-300 ${
      condition ? "text-green-300 font-medium" : "text-gray-400"
    }`}>
      {text}
    </span>
  </li>
);

const ResetPasswordContent = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Real-time validation states
  const [validity, setValidity] = useState({
    min: false,
    num: false,
    let: false,
    match: false
  });

  useEffect(() => {
    setValidity({
      min: newPassword.length >= 8,
      num: /[0-9]/.test(newPassword),
      let: /[a-zA-Z]/.test(newPassword),
      match: newPassword === confirmPassword && newPassword !== ""
    });
  }, [newPassword, confirmPassword]);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new link.");
    }
  }, [token]);

  useEffect(() => {
    if (resetSuccess) {
      const timer = setTimeout(() => router.push("/pages/login"), 3000);
      return () => clearTimeout(timer);
    }
  }, [resetSuccess, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/resetpassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Reset failed');
      
      setResetSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } },
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 backdrop-blur-xl bg-white/5 rounded-[2.5rem] border border-white/10 shadow-2xl text-center">
          <AlertCircle size={64} className="text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-white mb-2">Expired Link</h2>
          <p className="text-gray-400 text-sm mb-8">This password reset link is invalid or has expired.</p>
          <button 
            onClick={() => router.push("/forgot-password")}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white flex items-center justify-center p-4 sm:p-8 font-sans">
      <motion.div 
        className="max-w-md lg:max-w-xl w-full mx-auto p-6 sm:p-10 backdrop-blur-2xl bg-white/5 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated Background Accents */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[60px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '2s' }} />

        <AnimatePresence mode="wait">
          {resetSuccess ? (
            <motion.div 
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-white mb-2">All Set!</h2>
              <p className="text-gray-400 text-sm mb-8">Your password has been reset. Sending you to login now...</p>
              <div className="flex justify-center items-center gap-3">
                <LoaderCircle className="animate-spin text-indigo-400" size={24} />
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Redirecting</span>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" className="relative z-10">
              <div className="text-center mb-8">
                <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <KeyRound className="text-white" size={32} />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Reset Password</h1>
                <p className="text-sm text-gray-400 px-4">Choose a strong password to protect your account.</p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3"
                >
                  <AlertCircle size={18} className="text-red-400 shrink-0" />
                  <p className="text-red-200 text-xs font-medium">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New Password"
                      className="w-full h-14 pl-12 pr-12 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-sm"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Requirements Grid - Mobile Optimized */}
                  <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-3">Requirements</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                      <ConditionItem condition={validity.min} text="8+ Characters" />
                      <ConditionItem condition={validity.num} text="Contain Number" />
                      <ConditionItem condition={validity.let} text="Contain Letter" />
                      <ConditionItem condition={validity.match} text="Passwords Match" />
                    </ul>
                  </div>

                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm New Password"
                      className="w-full h-14 pl-12 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !Object.values(validity).every(Boolean)}
                  className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 ${
                    loading || !Object.values(validity).every(Boolean)
                      ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                      : "bg-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-700"
                  }`}
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin" size={18} />
                      Updating...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Main Page Wrapper with Suspense
const ResetPasswordPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoaderCircle className="animate-spin text-indigo-500" size={48} />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPasswordPage;