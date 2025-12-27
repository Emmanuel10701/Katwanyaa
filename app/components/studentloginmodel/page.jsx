'use client';

import { useState } from 'react';
import { 
  FiUser, FiLock, FiAlertCircle, FiX, 
  FiHelpCircle, FiBook, FiShield, FiClock,
  FiLogIn
} from 'react-icons/fi';
import { IoSchool } from 'react-icons/io5';

export default function StudentLoginModal({ 
  isOpen, 
  onClose, 
  onLogin,
  isLoading = false,
  error = null,
  requiresContact = false
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    admissionNumber: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.fullName.trim() && formData.admissionNumber.trim()) {
      onLogin(formData.fullName.trim(), formData.admissionNumber.trim());
    }
  };

  const handleClear = () => {
    setFormData({ fullName: '', admissionNumber: '' });
  };

  const handleClose = () => {
    handleClear();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl w-full max-w-md border-2 border-blue-200 overflow-hidden transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <IoSchool className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Student Login</h2>
                <p className="text-blue-100/90 text-sm mt-1">Access Learning Resources & Assignments</p>
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-2xl transition-colors"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {requiresContact ? (
            // Student not found view
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-200">
                <FiAlertCircle className="text-red-600 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Student Record Not Found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find your student record. This may be because:
              </p>
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border-2 border-red-200 mb-6">
                <ul className="text-left space-y-3 text-gray-700 text-sm">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Your details are not in the school database yet</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>There's a mismatch in your name or admission number</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Your admission number may have changed</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center justify-center gap-2">
                  <FiHelpCircle /> What to Do Next
                </h4>
                <p className="text-blue-800 text-sm mb-3">
                  Please contact your <strong>class teacher</strong> or the <strong>school administrator/secretary</strong> to:
                </p>
                <ol className="text-left text-blue-800 text-sm space-y-2 pl-4">
                  <li>1. Add your records to the system</li>
                  <li>2. Confirm your correct admission number</li>
                  <li>3. Verify your full name as per school records</li>
                </ol>
              </div>
            </div>
          ) : (
            // Login form view
            <>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl">
                    <FiShield className="text-blue-700 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Secure Student Access</h3>
                    <p className="text-gray-600 text-sm">Enter your details to continue</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200 mb-4">
                  <div className="flex items-center gap-2 text-blue-800 text-sm mb-2">
                    <FiClock className="text-blue-600" />
                    <span className="font-semibold">Session Duration: 15 minutes</span>
                  </div>
                  <p className="text-blue-700 text-xs">
                    For security, your session will automatically expire after 15 minutes of inactivity.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FiUser className="text-blue-600" />
                    Full Name (As in School Records)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Enter your full name exactly as in school records"
                    className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base placeholder:text-gray-400"
                    disabled={isLoading}
                    autoComplete="name"
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    Example: James Kimani Odhiambo
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FiLock className="text-blue-600" />
                    Admission Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.admissionNumber}
                    onChange={(e) => setFormData({...formData, admissionNumber: e.target.value})}
                    placeholder="Enter your admission number"
                    className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base placeholder:text-gray-400"
                    disabled={isLoading}
                    autoComplete="off"
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    Your unique 4-10 digit admission number (e.g., 6409)
                  </p>
                </div>

                {error && !requiresContact && (
                  <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-4 animate-shake">
                    <div className="flex items-center gap-3">
                      <FiAlertCircle className="text-red-600 text-xl flex-shrink-0" />
                      <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !formData.fullName.trim() || !formData.admissionNumber.trim()}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <FiLogIn className="text-xl" />
                      <span>Login to Student Portal</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                    <FiBook className="text-blue-600 text-xl mx-auto mb-2" />
                    <p className="text-xs font-semibold text-blue-800">View Resources</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl">
                    <FiShield className="text-emerald-600 text-xl mx-auto mb-2" />
                    <p className="text-xs font-semibold text-emerald-800">Secure Access</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            Need help? Contact your class teacher or school office
          </p>
        </div>
      </div>
    </div>
  );
}