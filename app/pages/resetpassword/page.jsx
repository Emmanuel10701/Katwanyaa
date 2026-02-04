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
 * Mobile optimized with better spacing and text size
 */
const ConditionItem = ({ condition, text }) => (
  <li className="flex items-center gap-2 py-1.5">
    {condition ? (
      <CheckCircle size={14} className="text-green-500 shrink-0" />
    ) : (
      <XCircle size={14} className="text-white/30 shrink-0" />
    )}
    <span className={`text-xs sm:text-sm transition-colors duration-300 ${
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm sm:max-w-md p-6 sm:p-8 backdrop-blur-xl bg-white/5 rounded-3xl sm:rounded-[2.5rem] border border-white/10 shadow-2xl text-center mx-2">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4 sm:mb-6" />
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Expired Link</h2>
          <p className="text-gray-400 text-xs sm:text-sm mb-6 sm:mb-8 px-2">
            This password reset link is invalid or has expired.
          </p>
          <button 
            onClick={() => router.push("/forgot-password")}
            className="w-full py-3 sm:py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl sm:rounded-2xl font-semibold transition-all shadow-lg shadow-indigo-500/20 text-sm sm:text-base"
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white flex items-center justify-center px-4 py-6 sm:py-8">
      <motion.div 
        className="w-full max-w-sm sm:max-w-md lg:max-w-xl mx-auto p-5 sm:p-8 lg:p-10 backdrop-blur-2xl bg-white/5 rounded-3xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ maxWidth: "95vw" }}
      >
        {/* Animated Background Accents - Reduced size for mobile */}
        <div className="absolute -top-10 -left-10 w-24 h-24 sm:w-32 sm:h-32 bg-indigo-500/20 rounded-full blur-[40px] sm:blur-[60px] animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-24 h-24 sm:w-32 sm:h-32 bg-purple-500/20 rounded-full blur-[40px] sm:blur-[60px] animate-pulse" style={{ animationDelay: '2s' }} />

        <AnimatePresence mode="wait">
          {resetSuccess ? (
            <motion.div 
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-6 sm:py-8 px-2"
            >
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">All Set!</h2>
              <p className="text-gray-400 text-xs sm:text-sm mb-6 px-2">
                Your password has been reset. Sending you to login now...
              </p>
              <div className="flex justify-center items-center gap-2">
                <LoaderCircle className="animate-spin text-indigo-400" size={20} />
                <span className="text-xs font-medium uppercase tracking-widest text-indigo-400">
                  Redirecting
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" className="relative z-10">
              <div className="text-center mb-6 sm:mb-8">
                <div className="bg-white/10 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <KeyRound className="text-white w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight mb-2 px-2">
                  Reset Password
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 px-2">
                  Choose a strong password to protect your account.
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-xl sm:rounded-2xl flex items-start gap-2 sm:gap-3"
                >
                  <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-200 text-xs sm:text-sm font-medium text-left flex-1">
                    {error}
                  </p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full h-12 sm:h-14 pl-10 sm:pl-12 pr-10 sm:pr-12 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-sm"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Requirements Grid - Stack on mobile */}
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-black/20 border border-white/5">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-indigo-400 mb-2 sm:mb-3">
                      Password Requirements
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                      <ConditionItem condition={validity.min} text="8+ characters" />
                      <ConditionItem condition={validity.num} text="Contains a number" />
                      <ConditionItem condition={validity.let} text="Contains a letter" />
                      <ConditionItem condition={validity.match} text="Passwords match" />
                    </ul>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full h-12 sm:h-14 pl-10 sm:pl-12 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !Object.values(validity).every(Boolean)}
                  className={`w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl font-semibold uppercase tracking-wider text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                    loading || !Object.values(validity).every(Boolean)
                      ? "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
                      : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 active:scale-[0.98]"
                  }`}
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin w-4 h-4" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>

                {/* Progress indicator - Only show on mobile */}
                <div className="sm:hidden mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Password strength</span>
                    <span>{Object.values(validity).filter(Boolean).length}/4</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${(Object.values(validity).filter(Boolean).length / 4) * 100}%` }}
                    />
                  </div>
                </div>
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
        <LoaderCircle className="animate-spin text-indigo-500 w-10 h-10 sm:w-12 sm:h-12" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPasswordPage;