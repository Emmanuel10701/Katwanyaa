'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck,
  Key,
  Cpu,
  Database,
  Shield,
  Users,
  Building,
  Server,
  Network,
  Smartphone,
  CheckCircle,
  Globe,
  X,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner'; // Changed to sonner

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Verification Modal States
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationReason, setVerificationReason] = useState('');

  const router = useRouter();



  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Device Fingerprint Generator
  class DeviceFingerprint {
    static generate() {
      const fingerprint = {
        userAgent: navigator.userAgent,
        screen: {
          width: screen.width,
          height: screen.height,
          colorDepth: screen.colorDepth,
          pixelRatio: window.devicePixelRatio
        },
        language: navigator.language || navigator.userLanguage,
        platform: navigator.platform,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        languages: navigator.languages
      };

      return {
        raw: fingerprint,
        hash: this.hashFingerprint(fingerprint)
      };
    }

    static hashFingerprint(fingerprint) {
      const str = JSON.stringify(fingerprint);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36);
    }
  }

  // LocalStorage Manager
  class LocalStorageManager {
    static KEYS = {
      DEVICE_FINGERPRINT: 'device_fingerprint',
      DEVICE_TOKEN: 'device_token',
      LOGIN_COUNT: 'login_count',
      LAST_LOGIN: 'last_login'
    };

    static checkVerificationRequirement() {
      try {
        const deviceToken = localStorage.getItem(this.KEYS.DEVICE_TOKEN);
        if (!deviceToken) {
          return { requiresVerification: true, reason: 'no_device_token' };
        }

        const tokenValid = this.validateDeviceToken(deviceToken);
        if (!tokenValid.valid) {
          return { 
            requiresVerification: true, 
            reason: tokenValid.reason,
            deviceToken: deviceToken 
          };
        }

        if (tokenValid.payload.loginCount >= 15) {
          return { requiresVerification: true, reason: 'max_logins_reached' };
        }

        const currentFingerprint = DeviceFingerprint.generate();
        const storedFingerprint = localStorage.getItem(this.KEYS.DEVICE_FINGERPRINT);
        
        if (storedFingerprint !== currentFingerprint.hash) {
          return { requiresVerification: true, reason: 'device_mismatch' };
        }

        return { 
          requiresVerification: false, 
          deviceToken, 
          loginCount: tokenValid.payload.loginCount || 0,
          deviceHash: currentFingerprint.hash 
        };
      } catch (error) {
        console.error('LocalStorage check error:', error);
        return { requiresVerification: true, reason: 'storage_error' };
      }
    }

    static validateDeviceToken(token) {
      try {
        const payloadStr = decodeURIComponent(escape(atob(token)));
        const payload = JSON.parse(payloadStr);
        
        if (payload.exp * 1000 <= Date.now()) {
          return { valid: false, reason: 'expired' };
        }
        
        return { valid: true, payload };
      } catch (error) {
        return { valid: false, reason: 'invalid_token' };
      }
    }

    static storeDeviceData(deviceToken, deviceHash) {
      try {
        localStorage.setItem(this.KEYS.DEVICE_TOKEN, deviceToken);
        localStorage.setItem(this.KEYS.DEVICE_FINGERPRINT, deviceHash);
        localStorage.setItem(this.KEYS.LAST_LOGIN, new Date().toISOString());
        
        const payload = JSON.parse(decodeURIComponent(escape(atob(deviceToken))));
        localStorage.setItem(this.KEYS.LOGIN_COUNT, payload.loginCount || '1');
      } catch (error) {
        console.error('Error storing device data:', error);
      }
    }

    static clearLoginData() {
      try {
        localStorage.removeItem(this.KEYS.DEVICE_TOKEN);
        localStorage.removeItem(this.KEYS.LOGIN_COUNT);
        localStorage.removeItem(this.KEYS.LAST_LOGIN);
      } catch (error) {
        console.error('Error clearing login data:', error);
      }
    }
  }

  // Handle verification code input
  const handleVerificationCodeChange = (index, value) => {
    if (value.length > 1) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value.replace(/\D/g, '');
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`verification-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
    
    setVerificationCode(newCode);
  };

  // Handle backspace
  const handleVerificationKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`verification-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Verify the code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    const code = verificationCode.join('');
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit code'); // Changed to sonner
      return;
    }

    setVerificationLoading(true);

    try {
      const localStorageCheck = LocalStorageManager.checkVerificationRequirement();
      const deviceFingerprint = DeviceFingerprint.generate();
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: verificationEmail,
          verificationCode: code,
          action: 'verify',
          clientLoginCount: localStorageCheck.loginCount,
          clientDeviceHash: deviceFingerprint.hash
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.deviceToken) {
          LocalStorageManager.storeDeviceData(data.deviceToken, deviceFingerprint.hash);
        }
        
        if (data.token) {
          localStorage.setItem('admin_token', data.token);
          localStorage.setItem('admin_user', JSON.stringify(data.user));
        }

        toast.success('Verification successful! Welcome back.'); // Changed to sonner

        setShowVerificationModal(false);
        setVerificationCode(['', '', '', '', '', '']);
        
        setTimeout(() => {
          router.push('/MainDashboard');
        }, 1000);
      } else {
        toast.error(data.error || 'Invalid verification code'); // Changed to sonner
        setVerificationCode(['', '', '', '', '', '']);
        document.getElementById('verification-input-0').focus();
      }
    } catch (error) {
      toast.error('Network error. Please try again.'); // Changed to sonner
      console.error('Verification error:', error);
    } finally {
      setVerificationLoading(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);

    try {
      const deviceFingerprint = DeviceFingerprint.generate();
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: verificationEmail,
          action: 'resend',
          clientDeviceHash: deviceFingerprint.hash
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('New verification code sent! Check your email.'); // Changed to sonner
        setCountdown(60);
        setVerificationCode(['', '', '', '', '', '']);
        document.getElementById('verification-input-0').focus();
      } else {
        toast.error(data.error || 'Failed to resend code'); // Changed to sonner
      }
    } catch (error) {
      toast.error('Network error. Please try again.'); // Changed to sonner
    } finally {
      setResendLoading(false);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  e.stopPropagation(); // Prevent any auto-submit behavior
  
  if (!isForgotMode) {
    if (!agreedToTerms) {
      toast.error("Verification Required: Please accept the Terms of Access before proceeding.");
      return;
    }

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }
  } else {
    if (!formData.email) {
      toast.error("Please enter your email address");
      return;
    }
    
    const loadingToast = toast.loading("Sending recovery instructions...");
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success("Recovery email sent! Check your inbox.");
      setIsForgotMode(false);
    }, 2000);
    return;
  }

  // NO automatic checks here - wait for button click
  setIsLoading(true);
  
  const loadingToast = toast.loading('Authenticating...');

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        // Don't send any device info that might auto-trigger verification
      }),
    });

    const data = await response.json();

    toast.dismiss(loadingToast);

    if (response.ok && data.success) {
      // VERIFICATION WILL ONLY HAPPEN IF SERVER EXPLICITLY SAYS SO
      if (data.requiresVerification === true) {
        // Show verification modal ONLY when server requires it
        setVerificationEmail(data.email || formData.email);
        setVerificationReason(data.reason || 'security_check');
        setShowVerificationModal(true);
        setCountdown(60);
        
        toast.info('Security verification required. Check your email.');
      } else {
        // Direct login - no verification needed
        if (data.token) {
          localStorage.setItem('admin_token', data.token);
          localStorage.setItem('admin_user', JSON.stringify(data.user));
        }

        toast.success(`Welcome back, ${data.user.name || 'Admin'}! 🎉`);

        setTimeout(() => {
          router.push('/MainDashboard');
        }, 1500);
      }
    } else {
      // Login failed - only show verification if server explicitly says to
      if (data.requiresVerification === true) {
        setVerificationEmail(formData.email);
        setVerificationReason(data.reason || 'suspicious_activity');
        setShowVerificationModal(true);
        setCountdown(60);
        
        toast.info('Security verification required. Check your email.');
      } else {
        // Regular login error
        toast.error(data.error || 'Login failed. Please try again.');
      }
    }
  } catch (error) {
    toast.dismiss(loadingToast);
    toast.error('Network error. Please check your connection.');
    console.error('Login error:', error);
  } finally {
    setIsLoading(false);
  }
};
  // Close verification modal
  const closeVerificationModal = () => {
    setShowVerificationModal(false);
    setVerificationCode(['', '', '', '', '', '']);
    setVerificationLoading(false);
  };

  // Security features and system metrics
  const securityFeatures = [
    { icon: <Shield className="w-4 h-4" />, label: "Secure Student Data", color: "emerald" },
    { icon: <Cpu className="w-4 h-4" />, label: "Automated Fee Tracking", color: "blue" },
    { icon: <Database className="w-4 h-4" />, label: "Daily Cloud Backups", color: "purple" },
    { icon: <Network className="w-4 h-4" />, label: "Portal Access Control", color: "orange" },
  ];

  const systemMetrics = [
    { label: "Manage Students", value: "1000+", icon: <Users className="w-4 h-4" /> },
    { label: "School Status", value: "Online", icon: <Server className="w-4 h-4" /> },
    { label: "Manage Events", value: "12", icon: <Shield className="w-4 h-4" /> },
  ];

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {/* Sonner Toaster */}
      <Toaster
        position={isMobile ? "top-center" : "top-right"}
        expand={false}
        richColors
        closeButton
      />

      {/* ============================ */}
      {/* VERIFICATION MODAL */}
{/* ============================ */}
{/* VERIFICATION MODAL - RESPONSIVE */}
{/* ============================ */}
{showVerificationModal && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[9999] animate-fade-in">
    <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md bg-gradient-to-br from-white to-slate-50 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl sm:shadow-2xl border border-white/30 overflow-hidden mx-2 sm:mx-4">
      
      {/* Modal Header */}
      <div className="relative p-4 sm:p-6 md:p-8 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <button
          onClick={closeVerificationModal}
          className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 p-1.5 sm:p-2 hover:bg-white/10 rounded-lg sm:rounded-xl transition-colors"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-xl flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-black">Security Verification</h3>
            <p className="text-blue-100 text-xs sm:text-sm md:text-sm mt-0.5 sm:mt-1">Verify your identity to continue</p>
          </div>
        </div>
        
        <div className="mt-2 sm:mt-3 md:mt-4 inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-xs font-bold">
            {verificationReason === 'new_device' 
              ? 'New Device Detected' 
              : verificationReason === 'max_logins_reached'
              ? 'Max Login Attempts Reached'
              : verificationReason === 'expired'
              ? 'Token Expired'
              : verificationReason === 'device_mismatch'
              ? 'Device Changed'
              : 'Verification Required'}
          </span>
        </div>
      </div>
      
      {/* Modal Content */}
      <div className="p-4 sm:p-6 md:p-8">
        <div className="mb-4 sm:mb-5 md:mb-6">
          <p className="text-slate-600 text-xs sm:text-sm mb-2 sm:mb-3 md:mb-4">
            A 6-digit verification code has been sent to:
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4">
            <p className="text-blue-800 font-bold text-center text-sm sm:text-base">{verificationEmail}</p>
          </div>
          <p className="text-slate-500 text-xs mt-2 sm:mt-3 text-center">
            Enter the code below to verify your identity
          </p>
        </div>
        
        <form onSubmit={handleVerifyCode}>
          <div className="mb-4 sm:mb-6 md:mb-8">
            <div className="flex justify-center gap-1.5 sm:gap-2 md:gap-3 mb-3 sm:mb-4">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  id={`verification-input-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleVerificationKeyDown(index, e)}
                  className="w-8 h-10 sm:w-10 sm:h-12 md:w-12 md:h-14 text-center text-lg sm:text-xl md:text-2xl font-bold bg-white border-2 border-slate-300 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  autoFocus={index === 0}
                />
              ))}
            </div>
            
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 mb-4 sm:mb-5 md:mb-6">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Code expires in: </span>
              <span className="font-bold text-blue-600">
                {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendLoading || countdown > 0}
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading ? (
                <>
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  <span className="hidden xs:inline">Sending...</span>
                  <span className="xs:hidden">Sending...</span>
                </>
              ) : countdown > 0 ? (
                <>
                  <span className="hidden xs:inline">Resend in {countdown}s</span>
                  <span className="xs:hidden">{countdown}s</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Resend Code</span>
                  <span className="xs:hidden">Resend</span>
                </>
              )}
            </button>
            
            <button
              type="submit"
              disabled={verificationLoading || verificationCode.join('').length !== 6}
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verificationLoading ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="hidden xs:inline">Verifying...</span>
                  <span className="xs:hidden">Checking...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Verify & Continue</span>
                  <span className="xs:hidden">Verify</span>
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-4 sm:mt-6 md:mt-8 pt-3 sm:pt-4 md:pt-6 border-t border-slate-200">
          <div className="flex items-start gap-2 sm:gap-3">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800">Security Notice</p>
              <p className="text-xs text-slate-600 mt-0.5 sm:mt-1">
                This extra step ensures your account stays secure. Never share verification codes with anyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

      {/* ============================ */}
      {/* MAIN LOGIN PAGE */}
      {/* ============================ */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-3 sm:p-4 md:p-6 font-sans">
        <div className="max-w-6xl w-full bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] shadow-xl sm:shadow-2xl shadow-slate-900/10 border border-white/40 overflow-hidden flex flex-col md:flex-row min-h-[500px] sm:min-h-[600px] md:min-h-[720px]">
          
          {/* Left Panel */}
          <div className="hidden md:flex md:w-[45%] bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 relative overflow-hidden p-8 md:p-10 flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 animate-pulse"></div>
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
            
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `linear-gradient(90deg, #fff 1px, transparent 1px),
                                linear-gradient(180deg, #fff 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}></div>

            <div className="relative z-10">
              <h1 className="text-2xl sm:text-2xl lg:text-2xl font-black text-white mb-6 sm:mb-8 tracking-tighter leading-[0.95]">
                Katz  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-white">Admin Portal</span>
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10">
                {securityFeatures.map((feature, index) => (
                  <div 
                    key={index}
                    className="group p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-${feature.color}-500/20 mb-2 sm:mb-3`}>
                      <div className={`text-${feature.color}-400 scale-75 sm:scale-100`}>
                        {feature.icon}
                      </div>
                    </div>
                    <p className="text-[10px] sm:text-xs font-bold text-white tracking-tight leading-tight">{feature.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 mt-[14%]">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full "></div>
                  <h3 className="text-lg font-bold text-white">Live System Metrics</h3>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-4">
                  {systemMetrics.map((metric, index) => (
                    <div key={index} className="text-center p-2 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl">
                      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <div className="text-blue-300 scale-75 sm:scale-100">{metric.icon}</div>
                        <div className="text-lg sm:text-2xl font-black text-white">{metric.value}</div>
                      </div>
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-bold leading-tight">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-bold text-slate-300">System Status</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
                  All Systems Operational
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel: Login Interface */}
          <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 flex flex-col justify-center bg-white relative">
            <div className="md:hidden flex flex-col items-center mb-6 sm:mb-8">
              <div className="relative mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg sm:shadow-xl shadow-blue-500/30">
                  <ShieldCheck className="text-white w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 rounded-full flex items-center justify-center border-3 sm:border-4 border-white">
                  <Key className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                </div>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 text-center">Katz Admin Portal</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2 text-center">Secure Admin Access</p>
            </div>

            <div className="max-w-md mx-auto w-full px-2 sm:px-0">
              <div className="mb-8 sm:mb-10 md:mb-12 text-center md:text-left">
                <div className="flex items-center gap-3 mb-3 sm:mb-4 justify-center md:justify-start">
                  <div className="w-2 h-4 sm:h-6 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full"></div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                    {isForgotMode ? "Access Recovery" : "Secure Authentication"}
                  </h2>
                </div>
                <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed text-center md:text-left">
                  {isForgotMode 
                    ? "Provide your registered email to receive recovery instructions." 
                    : "Authenticate with your administrative credentials to access the control dashboard."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                <div className="group">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Workstation Email
                    </label>
                  </div>
                  <div className="relative">
                    <input 
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="admin@katwanyaahighschool.sc.ke"
                      className="w-full pl-10 sm:pl-12 pr-4 sm:pr-6 py-3 sm:py-4 bg-slate-50 border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 font-medium text-slate-900 placeholder-slate-400 text-sm sm:text-base"
                    />
                    <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>

                {!isForgotMode && (
                  <div className="group">
                    <div className="flex justify-between items-center mb-2 sm:mb-3">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Password
                        </label>
                      </div>
                      <button 
                        type="button"
                        onClick={() => (router.push("/pages/forgotpassword"))}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
                      >
                        <Key className="w-2 h-2 sm:w-3 sm:h-3" />
                        <span className="hidden xs:inline">Forgot password</span>
                        <span className="xs:hidden">Forgot password</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your password"
                        className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 bg-slate-50 border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 font-medium text-slate-900 placeholder-slate-400 text-sm sm:text-base"
                      />
                      <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg"
                      >
                        {showPassword ? 
                          <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : 
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                        }
                      </button>
                    </div>
                  </div>
                )}

                {!isForgotMode && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="p-3 sm:p-4 md:p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl border border-blue-100">
                      <label className="flex items-start gap-3 sm:gap-4 cursor-pointer group">
                        <div className="relative flex-shrink-0 mt-0.5">
                          <input 
                            type="checkbox" 
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer rounded border-2 border-blue-300 bg-white checked:border-blue-600 checked:bg-blue-600 focus:outline-none transition-all"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 mb-1">
                            Terms and Agreement
                          </p>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            I understand this session is monitored, encrypted, and recorded for security auditing in compliance with institutional policies.
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-slate-800">Remember me on this device</p>
                          <p className="text-xs text-slate-500 hidden sm:block">Stay signed in without entering a code</p>
                          <p className="text-xs text-slate-500 sm:hidden">Stay signed in</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRememberDevice(!rememberDevice)}
                        className={`relative inline-flex h-5 w-10 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                          rememberDevice ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                            rememberDevice ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-lg sm:shadow-xl shadow-blue-500/30 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                    {agreedToTerms ? (
                      isLoading ? (
                        <>
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span className="text-sm sm:text-base">Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm sm:text-base">{isForgotMode ? "Request Access" : "Access Dashboard"}</span>
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </>
                      )
                    ) : (
                      <span className="text-sm sm:text-base text-slate-300">Please agree to Terms</span>
                    )}
                  </div>
                </button>

                {isForgotMode && (
                  <button 
                    type="button"
                    onClick={() => setIsForgotMode(false)}
                    className="w-full text-center text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors py-2 sm:py-3"
                  >
                    ← Return to authentication
                  </button>
                )}
              </form>

              <div className="mt-8 sm:mt-12 md:mt-16 pt-4 sm:pt-6 md:pt-8 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
                    <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
                      Data Center: Matungulu, Machakos
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6">
                    <a href="/pages/TermsandPrivacy" className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors whitespace-nowrap">
                      Privacy Policy
                    </a>
                    <a href="#" className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors whitespace-nowrap">
                      Security Protocol
                    </a>
                    <a href="#" className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors whitespace-nowrap">
                      Compliance
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 animate-pulse z-50"></div>
        <div className={`fixed ${isMobile ? 'bottom-2 right-2' : 'bottom-4 right-4'} z-50`}>
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-slate-900/90 backdrop-blur-md rounded-full border border-white/10">
            <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
            <span className="text-base font-bold text-white  inline">Prayer, Discipline and Hardwork</span>
          </div>
        </div>
      </div>
    </>
  );
}