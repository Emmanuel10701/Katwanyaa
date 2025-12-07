'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiUser, FiMail, FiPhone, FiHome, FiMapPin, 
  FiCalendar, FiBook, FiAward, FiHeart, 
  FiActivity, FiGlobe, FiBriefcase, FiUsers,
  FiCheckCircle, FiUpload, FiArrowRight, FiSearch,
  FiChevronDown, FiChevronUp, FiDownload, FiPrinter,
  FiShare2, FiCopy, FiExternalLink, FiEye, FiX
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';
import { useDebounce } from 'use-debounce';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Kenya administrative data
import kenyaData from '../../../public/data.json';

const KatwanyaaAdmission = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    nationality: 'Kenyan',
    county: '',
    constituency: '',
    ward: '',
    village: '',
    
    // Contact Information
    email: '',
    phone: '',
    alternativePhone: '',
    postalAddress: '',
    postalCode: '',
    
    // Parent/Guardian Information
    fatherName: '',
    fatherPhone: '',
    fatherEmail: '',
    fatherOccupation: '',
    motherName: '',
    motherPhone: '',
    motherEmail: '',
    motherOccupation: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianOccupation: '',
    
    // Academic Information
    previousSchool: '',
    previousClass: '',
    kcpeYear: '',
    kcpeIndex: '',
    kcpeMarks: '',
    meanGrade: '',
    
    // Stream Selection
    preferredStream: 'SCIENCE',
    
    // Medical Information
    medicalCondition: '',
    allergies: '',
    bloodGroup: '',
    
    // Extracurricular
    sportsInterests: '',
    clubsInterests: '',
    talents: ''
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [applicationNumber, setApplicationNumber] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  
  // Location search states
  const [countySearch, setCountySearch] = useState('');
  const [constituencySearch, setConstituencySearch] = useState('');
  const [wardSearch, setWardSearch] = useState('');
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);
  const [showConstituencyDropdown, setShowConstituencyDropdown] = useState(false);
  const [showWardDropdown, setShowWardDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Get filtered data based on search
  const filteredCounties = kenyaData.filter(county =>
    county.name.toLowerCase().includes(countySearch.toLowerCase())
  );

  const filteredConstituencies = formData.county 
    ? kenyaData
        .find(c => c.name === formData.county)
        ?.constituencies?.filter(constituency =>
          constituency.name.toLowerCase().includes(constituencySearch.toLowerCase())
        ) || []
    : [];

  const filteredWards = formData.constituency 
    ? filteredConstituencies
        .find(c => c.name === formData.constituency)
        ?.wards?.filter(ward =>
          ward.toLowerCase().includes(wardSearch.toLowerCase())
        ) || []
    : [];

  // Update API endpoint
  const API_ENDPOINT = '/api/applyadmission';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear dependent fields when parent changes
    if (name === 'county' && value !== formData.county) {
      setFormData(prev => ({
        ...prev,
        constituency: '',
        ward: '',
        village: ''
      }));
    }
    if (name === 'constituency' && value !== formData.constituency) {
      setFormData(prev => ({
        ...prev,
        ward: '',
        village: ''
      }));
    }
  };

  const validateStep = (step) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(07|01)\d{8}$/;

    switch(step) {
      case 1:
        if (!formData.firstName?.trim() || 
            !formData.lastName?.trim() || 
            !formData.gender || 
            !formData.dateOfBirth || 
            !formData.nationality?.trim() || 
            !formData.county) {
          toast.error('Please fill all required personal information fields');
          return false;
        }
        return true;
      case 2:
        if (!formData.email?.trim() || 
            !formData.phone?.trim() || 
            !formData.postalAddress?.trim()) {
          toast.error('Please fill all required contact information fields');
          return false;
        }
        if (!emailRegex.test(formData.email)) {
          toast.error('Please enter a valid email address');
          return false;
        }
        if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
          toast.error('Please enter a valid Kenyan phone number (07XXXXXXXX or 01XXXXXXXX)');
          return false;
        }
        return true;
      case 3:
        if (!formData.previousSchool?.trim() || 
            !formData.previousClass?.trim() || 
            !formData.preferredStream) {
          toast.error('Please fill all required academic information fields');
          return false;
        }
        if (formData.kcpeMarks && (parseInt(formData.kcpeMarks) < 0 || parseInt(formData.kcpeMarks) > 500)) {
          toast.error('KCPE marks must be between 0 and 500');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setLoading(true);
    
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setApplicationNumber(data.applicationNumber);
        setSubmittedData({
          ...formData,
          applicationNumber: data.applicationNumber,
          submissionDate: new Date().toLocaleDateString(),
          submissionTime: new Date().toLocaleTimeString()
        });
        toast.success('Application submitted successfully!');
        
        // Reset form
        setFormData({
          firstName: '', middleName: '', lastName: '', gender: '', dateOfBirth: '',
          nationality: 'Kenyan', county: '', constituency: '', ward: '', village: '',
          email: '', phone: '', alternativePhone: '', postalAddress: '', postalCode: '',
          fatherName: '', fatherPhone: '', fatherEmail: '', fatherOccupation: '',
          motherName: '', motherPhone: '', motherEmail: '', motherOccupation: '',
          guardianName: '', guardianPhone: '', guardianEmail: '', guardianOccupation: '',
          previousSchool: '', previousClass: '', kcpeYear: '', kcpeIndex: '',
          kcpeMarks: '', meanGrade: '', preferredStream: 'SCIENCE',
          medicalCondition: '', allergies: '', bloodGroup: '',
          sportsInterests: '', clubsInterests: '', talents: ''
        });
        setStep(5);
        setShowSuccess(true);
        // Auto-scroll to top when submitted
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        toast.error(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const streams = [
    { value: 'SCIENCE', label: 'Science', icon: '🔬', color: 'from-blue-500 to-cyan-500' },
    { value: 'ARTS', label: 'Arts', icon: '🎨', color: 'from-purple-500 to-pink-500' },
    { value: 'BUSINESS', label: 'Business', icon: '💼', color: 'from-green-500 to-emerald-500' },
    { value: 'TECHNICAL', label: 'Technical', icon: '⚙️', color: 'from-orange-500 to-red-500' }
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const meanGrades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const printApplication = () => {
    window.print();
  };

  const shareApplication = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Katwanyaa High School Admission - ${applicationNumber}`,
          text: `I've submitted my admission application to Katwanyaa High School. Application Number: ${applicationNumber}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard(`${window.location.href}?app=${applicationNumber}`);
    }
  };

  // Handle dropdown click outside with higher z-index
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.location-dropdown-container')) {
        setShowCountyDropdown(false);
        setShowConstituencyDropdown(false);
        setShowWardDropdown(false);
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns when clicking escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowCountyDropdown(false);
        setShowConstituencyDropdown(false);
        setShowWardDropdown(false);
        setActiveDropdown(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/30 to-emerald-50/30 relative overflow-hidden">
      {/* Modern background with student image */}
      <div className="absolute inset-0 z-0">
        {/* Fallback gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50"></div>
        
        {/* Student background image with low opacity */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{
            backgroundImage: `url('/student.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
           filter: 'grayscale(30%) blur(1px)'

          }}
        ></div>
        
        {/* Overlay pattern */}
      </div>
      
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* Modern Header with Glass Effect */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="text-center lg:text-left mb-4 lg:mb-0">
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                KATZ  Application portal
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Excellence in Education Since 1995
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
<span className="text-sm text-gray-600">
  {new Date().getFullYear()} Intake Open
</span>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-emerald-50 px-6 py-3 rounded-xl border border-blue-100 shadow-sm">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800 mb-1">Step {step}/5</div>
                  <div className="text-xs text-gray-500">Admission Process</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="relative mb-8">
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
          <div 
            className="absolute top-5 left-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 -z-10 transition-all duration-500"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          ></div>
          
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <motion.div 
                key={stepNum}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: stepNum * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                  step >= stepNum 
                    ? 'bg-gradient-to-br from-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-200' 
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}>
                  {step > stepNum ? (
                    <FiCheckCircle className="text-lg" />
                  ) : stepNum === 5 ? (
                    <span className="text-lg">✓</span>
                  ) : (
                    <span className="font-bold">{stepNum}</span>
                  )}
                </div>
                <span className={`text-xs font-medium transition-colors ${
                  step >= stepNum ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  {stepNum === 1 && 'Personal'}
                  {stepNum === 2 && 'Contact'}
                  {stepNum === 3 && 'Academic'}
                  {stepNum === 4 && 'Review'}
                  {stepNum === 5 && 'Complete'}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <AnimatePresence mode="wait">
            {step === 5 ? (
              /* Enhanced Success Screen */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-100 relative z-10"
              >
                <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 p-8 text-white">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <FiCheckCircle className="text-5xl" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-center mb-2">
                    🎉 Application Submitted Successfully!
                  </h2>
                  <p className="text-center text-green-100 text-lg">
                    Your journey to excellence begins here
                  </p>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Application Details Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl p-6 border border-blue-100 shadow-sm">
                      <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center">
                        <FiCheckCircle className="mr-2 text-blue-600" /> Application Details
                      </h3>
                      {applicationNumber && (
                        <div className="mb-6">
                          <div className="text-sm text-gray-600 mb-2 flex items-center">
                            <FiCopy className="mr-2" /> Application Number
                          </div>
                          <div className="flex items-center">
                            <div className="text-2xl font-bold text-blue-800 font-mono bg-white px-4 py-2 rounded-lg border border-blue-200 flex-grow shadow-inner">
                              {applicationNumber}
                            </div>
                            <button
                              onClick={() => copyToClipboard(applicationNumber)}
                              className="ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <FiCopy />
                            </button>
                          </div>
                        </div>
                      )}

                      {submittedData && (
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Applicant Name</div>
                            <div className="font-semibold text-gray-800">
                              {submittedData.firstName} {submittedData.lastName}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Preferred Stream</div>
                            <div className="font-semibold text-gray-800">
                              {streams.find(s => s.value === submittedData.preferredStream)?.label}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Submitted On</div>
                            <div className="font-semibold text-gray-800">
                              {submittedData.submissionDate} at {submittedData.submissionTime}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Next Steps Card */}
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-100 shadow-sm">
                      <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center">
                        📋 Next Steps
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 mt-1">
                            1
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">Email Confirmation</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Check your email ({formData.email}) for application confirmation and details.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3 mt-1">
                            2
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">Interview Schedule</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Interview dates will be sent via SMS to {formData.phone} within 7 working days.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-3 mt-1">
                            3
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">Document Verification</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Bring original documents during the interview for verification.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                          📞 Need Help?
                        </h4>
                        <div className="text-sm text-gray-600 space-y-2">
                          <p>Admissions Office: <strong>0712 345 678</strong></p>
                          <p>Email: <strong>admissions@katwanyaa.ac.ke</strong></p>
                          <p>Office Hours: Mon-Fri, 8:00 AM - 5:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 flex flex-wrap gap-4 justify-center">
                    <button
                      onClick={() => {
                        setStep(1);
                        setShowSuccess(false);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all hover:shadow-lg flex items-center shadow-md"
                    >
                      <FiUser className="mr-2" /> Submit Another Application
                    </button>
                    
                    <button
                      onClick={printApplication}
                      className="px-6 py-3 bg-white text-gray-700 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 transition-all hover:shadow-lg flex items-center shadow-md"
                    >
                      <FiPrinter className="mr-2" /> Print Summary
                    </button>
                    
                    <button
                      onClick={shareApplication}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all hover:shadow-lg flex items-center shadow-md"
                    >
                      <FiShare2 className="mr-2" /> Share Application
                    </button>
                    
                    <button
                      onClick={() => window.open('/admission-status', '_blank')}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all hover:shadow-lg flex items-center shadow-md"
                    >
                      <FiExternalLink className="mr-2" /> Check Status
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Enhanced Form with Modern Design - 85% width on large screens */
              <motion.form
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                className="lg:w-[85%] mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-100 relative z-10"
              >
                {/* Form Header with Step Indicator */}
                <div className="bg-gradient-to-r from-blue-50 via-emerald-50 to-blue-50 p-8 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {step === 1 && '👤 Personal Information'}
                        {step === 2 && '📱 Contact Details'}
                        {step === 3 && '🎓 Academic Information'}
                        {step === 4 && '📝 Review & Submit'}
                      </h2>
                      <p className="text-gray-600">
                        {step === 1 && 'Tell us about the prospective student'}
                        {step === 2 && 'How can we reach you? Provide contact details'}
                        {step === 3 && 'Educational background and academic preferences'}
                        {step === 4 && 'Final review before submission'}
                      </p>
                    </div>
                    <div className="hidden lg:block">
                      <div className="text-sm font-medium text-gray-500">Progress</div>
                      <div className="text-2xl font-bold text-blue-600">{step}/4</div>
                    </div>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-8">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-8"
                      >
                        {/* Personal Information Section */}
                        <motion.div variants={itemVariants} className="space-y-6">
                          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                            <FiUser className="mr-2 text-blue-600" /> Personal Details
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {['firstName', 'middleName', 'lastName'].map((field) => (
                              <div key={field} className="space-y-2">
                                <label className="block text-base font-semibold text-gray-800">
                                  {field === 'firstName' && 'First Name *'}
                                  {field === 'middleName' && 'Middle Name'}
                                  {field === 'lastName' && 'Last Name *'}
                                </label>
                                <div className="relative">
                                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                  <input
                                    type="text"
                                    name={field}
                                    value={formData[field]}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-base"
                                    placeholder={
                                      field === 'firstName' ? 'John' :
                                      field === 'middleName' ? 'Kamau' : 'Doe'
                                    }
                                    required={field !== 'middleName'}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="block text-base font-semibold text-gray-800">
                                Gender *
                              </label>
                              <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-base"
                                required
                              >
                                <option value="" className="text-gray-400">Select Gender</option>
                                <option value="MALE" className="text-gray-800">Male</option>
                                <option value="FEMALE" className="text-gray-800">Female</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="block text-base font-semibold text-gray-800">
                                Date of Birth *
                              </label>
                              <div className="relative">
                                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                  type="date"
                                  name="dateOfBirth"
                                  value={formData.dateOfBirth}
                                  onChange={handleChange}
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-base"
                                  required
                                  max={new Date().toISOString().split('T')[0]}
                                />
                              </div>
                              {formData.dateOfBirth && (
                                <p className="text-sm text-gray-600 mt-1 font-medium">
                                  Age: {calculateAge(formData.dateOfBirth)} years
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>

                        {/* Location Information Section at TOP */}
                        <motion.div variants={itemVariants} className="space-y-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                              <FiMapPin className="mr-2 text-green-600" /> Location Information
                            </h3>
                            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                              Select from dropdowns ↓
                            </div>
                          </div>
                          
                          {/* Location Selection Cards - Horizontal Layout */}
                          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                              <div className="flex items-center mb-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                  <FiMapPin className="text-blue-600" />
                                </div>
                                <span className="font-semibold text-blue-800">County</span>
                              </div>
                              <div className="text-sm text-gray-600">Required field</div>
                            </div>
                            
                            <div className={`bg-gradient-to-br ${formData.county ? 'from-emerald-50 to-emerald-100 border-emerald-200' : 'from-gray-50 to-gray-100 border-gray-200'} rounded-xl p-4 border`}>
                              <div className="flex items-center mb-2">
                                <div className={`w-8 h-8 ${formData.county ? 'bg-emerald-100' : 'bg-gray-100'} rounded-lg flex items-center justify-center mr-3`}>
                                  <FiMapPin className={`${formData.county ? 'text-emerald-600' : 'text-gray-400'}`} />
                                </div>
                                <span className={`font-semibold ${formData.county ? 'text-emerald-800' : 'text-gray-400'}`}>Constituency</span>
                              </div>
                              <div className="text-sm text-gray-500">{formData.county ? 'Now select' : 'Select county first'}</div>
                            </div>
                            
                            <div className={`bg-gradient-to-br ${formData.constituency ? 'from-purple-50 to-purple-100 border-purple-200' : 'from-gray-50 to-gray-100 border-gray-200'} rounded-xl p-4 border`}>
                              <div className="flex items-center mb-2">
                                <div className={`w-8 h-8 ${formData.constituency ? 'bg-purple-100' : 'bg-gray-100'} rounded-lg flex items-center justify-center mr-3`}>
                                  <FiMapPin className={`${formData.constituency ? 'text-purple-600' : 'text-gray-400'}`} />
                                </div>
                                <span className={`font-semibold ${formData.constituency ? 'text-purple-800' : 'text-gray-400'}`}>Ward</span>
                              </div>
                              <div className="text-sm text-gray-500">{formData.constituency ? 'Now select' : 'Select constituency first'}</div>
                            </div>
                            
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                              <div className="flex items-center mb-2">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                  <FiHome className="text-gray-400" />
                                </div>
                                <span className="font-semibold text-gray-400">Village</span>
                              </div>
                              <div className="text-sm text-gray-500">Optional field</div>
                            </div>
                          </div>

                          {/* Location Inputs in Grid */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="block text-base font-semibold text-gray-800">
                                Nationality *
                              </label>
                              <input
                                type="text"
                                name="nationality"
                                value={formData.nationality}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-base"
                                required
                              />
                            </div>

                            {/* County with Searchable Dropdown - HIGH Z-INDEX */}
                            <div className="space-y-2 relative location-dropdown-container">
                              <label className="block text-base font-semibold text-gray-800">
                                County *
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={formData.county}
                                  onChange={(e) => {
                                    handleChange(e);
                                    setCountySearch(e.target.value);
                                  }}
                                  onFocus={() => {
                                    setShowCountyDropdown(true);
                                    setShowConstituencyDropdown(false);
                                    setShowWardDropdown(false);
                                    setActiveDropdown('county');
                                  }}
                                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-base cursor-pointer"
                                  placeholder="Click to search county..."
                                  required
                                  readOnly
                                />
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowCountyDropdown(!showCountyDropdown);
                                    setActiveDropdown(showCountyDropdown ? null : 'county');
                                  }}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  {showCountyDropdown ? <FiChevronUp /> : <FiChevronDown />}
                                </button>
                              </div>
                              
                              {showCountyDropdown && (
                                <div className="absolute z-[100] mt-1 w-full bg-white border-2 border-blue-300 rounded-xl shadow-2xl max-h-[500px] overflow-hidden flex flex-col">
                                  {/* Search input at top - ALWAYS VISIBLE */}
                                  <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-blue-100 sticky top-0">
                                    <div className="relative">
                                      <input
                                        type="text"
                                        value={countySearch}
                                        onChange={(e) => setCountySearch(e.target.value)}
                                        className="w-full px-4 py-3 pl-10 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                                        placeholder="Type to search counties..."
                                        autoFocus
                                      />
                                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                                      <button
                                        onClick={() => {
                                          setCountySearch('');
                                          setShowCountyDropdown(false);
                                          setActiveDropdown(null);
                                        }}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                      >
                                        <FiX className="w-5 h-5" />
                                      </button>
                                    </div>
                                    <div className="text-xs text-blue-600 mt-2 font-medium">
                                      {filteredCounties.length} counties found
                                    </div>
                                  </div>
                                  
                                  {/* Scrollable list - scrollbar at top */}
                                  <div className="overflow-y-auto flex-1 max-h-[400px] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-blue-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                                    {filteredCounties.length > 0 ? (
                                      filteredCounties.map((county) => (
                                        <button
                                          key={county.name}
                                          type="button"
                                          onClick={() => {
                                            setFormData(prev => ({ ...prev, county: county.name }));
                                            setCountySearch('');
                                            setShowCountyDropdown(false);
                                            setActiveDropdown(null);
                                          }}
                                          className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-b-0 group"
                                        >
                                          <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                              <FiMapPin className="text-blue-600" />
                                            </div>
                                            <span className="font-medium text-gray-800 group-hover:text-blue-700">{county.name}</span>
                                          </div>
                                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {county.constituencies?.length || 0} constituencies
                                          </span>
                                        </button>
                                      ))
                                    ) : (
                                      <div className="px-4 py-8 text-center text-gray-500">
                                        <FiSearch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <div className="font-medium">No counties found</div>
                                        <div className="text-sm mt-1">Try a different search term</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Constituency with Searchable Dropdown - HIGH Z-INDEX */}
                          {formData.county && (
                            <div className="space-y-2 relative location-dropdown-container">
                              <label className="block text-base font-semibold text-emerald-800">
                                Constituency *
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={formData.constituency}
                                  onChange={(e) => {
                                    handleChange(e);
                                    setConstituencySearch(e.target.value);
                                  }}
                                  onFocus={() => {
                                    setShowConstituencyDropdown(true);
                                    setShowCountyDropdown(false);
                                    setShowWardDropdown(false);
                                    setActiveDropdown('constituency');
                                  }}
                                  className="w-full pl-10 pr-10 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800 text-base cursor-pointer"
                                  placeholder="Click to search constituency..."
                                  required
                                  readOnly
                                />
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowConstituencyDropdown(!showConstituencyDropdown);
                                    setActiveDropdown(showConstituencyDropdown ? null : 'constituency');
                                  }}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400 hover:text-emerald-600"
                                >
                                  {showConstituencyDropdown ? <FiChevronUp /> : <FiChevronDown />}
                                </button>
                              </div>
                              
                              {showConstituencyDropdown && (
                                <div className="absolute z-[99] mt-1 w-full bg-white border-2 border-emerald-300 rounded-xl shadow-2xl max-h-[500px] overflow-hidden flex flex-col">
                                  {/* Search input at top - ALWAYS VISIBLE */}
                                  <div className="p-3 border-b bg-gradient-to-r from-emerald-50 to-emerald-100 sticky top-0">
                                    <div className="relative">
                                      <input
                                        type="text"
                                        value={constituencySearch}
                                        onChange={(e) => setConstituencySearch(e.target.value)}
                                        className="w-full px-4 py-3 pl-10 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base"
                                        placeholder={`Type to search constituencies in ${formData.county}...`}
                                        autoFocus
                                      />
                                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500" />
                                      <button
                                        onClick={() => {
                                          setConstituencySearch('');
                                          setShowConstituencyDropdown(false);
                                          setActiveDropdown(null);
                                        }}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                      >
                                        <FiX className="w-5 h-5" />
                                      </button>
                                    </div>
                                    <div className="text-xs text-emerald-600 mt-2 font-medium">
                                      {filteredConstituencies.length} constituencies found in {formData.county}
                                    </div>
                                  </div>
                                  
                                  {/* Scrollable list - scrollbar at top */}
                                  <div className="overflow-y-auto flex-1 max-h-[400px] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-emerald-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                                    {filteredConstituencies.length > 0 ? (
                                      filteredConstituencies.map((constituency) => (
                                        <button
                                          key={constituency.name}
                                          type="button"
                                          onClick={() => {
                                            setFormData(prev => ({ ...prev, constituency: constituency.name }));
                                            setConstituencySearch('');
                                            setShowConstituencyDropdown(false);
                                            setActiveDropdown(null);
                                          }}
                                          className="w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-b-0 group"
                                        >
                                          <div className="flex items-center">
                                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                                              <FiMapPin className="text-emerald-600" />
                                            </div>
                                            <span className="font-medium text-gray-800 group-hover:text-emerald-700">{constituency.name}</span>
                                          </div>
                                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {constituency.wards?.length || 0} wards
                                          </span>
                                        </button>
                                      ))
                                    ) : (
                                      <div className="px-4 py-8 text-center text-gray-500">
                                        <FiSearch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <div className="font-medium">No constituencies found</div>
                                        <div className="text-sm mt-1">Try a different search term</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Ward with Searchable Dropdown - HIGH Z-INDEX */}
                          {formData.constituency && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-2 relative location-dropdown-container">
                                <label className="block text-base font-semibold text-purple-800">
                                  Ward *
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={formData.ward}
                                    onChange={(e) => {
                                      handleChange(e);
                                      setWardSearch(e.target.value);
                                    }}
                                    onFocus={() => {
                                      setShowWardDropdown(true);
                                      setShowCountyDropdown(false);
                                      setShowConstituencyDropdown(false);
                                      setActiveDropdown('ward');
                                    }}
                                    className="w-full pl-10 pr-10 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-800 text-base cursor-pointer"
                                    placeholder="Click to search ward..."
                                    required
                                    readOnly
                                  />
                                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowWardDropdown(!showWardDropdown);
                                      setActiveDropdown(showWardDropdown ? null : 'ward');
                                    }}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600"
                                  >
                                    {showWardDropdown ? <FiChevronUp /> : <FiChevronDown />}
                                  </button>
                                </div>
                                
                                {showWardDropdown && (
                                  <div className="absolute z-[98] mt-1 w-full bg-white border-2 border-purple-300 rounded-xl shadow-2xl max-h-[500px] overflow-hidden flex flex-col">
                                    {/* Search input at top - ALWAYS VISIBLE */}
                                    <div className="p-3 border-b bg-gradient-to-r from-purple-50 to-purple-100 sticky top-0">
                                      <div className="relative">
                                        <input
                                          type="text"
                                          value={wardSearch}
                                          onChange={(e) => setWardSearch(e.target.value)}
                                          className="w-full px-4 py-3 pl-10 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base"
                                          placeholder={`Type to search wards in ${formData.constituency}...`}
                                          autoFocus
                                        />
                                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
                                        <button
                                          onClick={() => {
                                            setWardSearch('');
                                            setShowWardDropdown(false);
                                            setActiveDropdown(null);
                                          }}
                                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                          <FiX className="w-5 h-5" />
                                        </button>
                                      </div>
                                      <div className="text-xs text-purple-600 mt-2 font-medium">
                                        {filteredWards.length} wards found in {formData.constituency}
                                      </div>
                                    </div>
                                    
                                    {/* Scrollable list - scrollbar at top */}
                                    <div className="overflow-y-auto flex-1 max-h-[400px] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-purple-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                                      {filteredWards.length > 0 ? (
                                        filteredWards.map((ward) => (
                                          <button
                                            key={ward}
                                            type="button"
                                            onClick={() => {
                                              setFormData(prev => ({ ...prev, ward }));
                                              setWardSearch('');
                                              setShowWardDropdown(false);
                                              setActiveDropdown(null);
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0 group"
                                          >
                                            <div className="flex items-center">
                                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                                <FiMapPin className="text-purple-600" />
                                              </div>
                                              <span className="font-medium text-gray-800 group-hover:text-purple-700">{ward}</span>
                                            </div>
                                          </button>
                                        ))
                                      ) : (
                                        <div className="px-4 py-8 text-center text-gray-500">
                                          <FiSearch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                          <div className="font-medium">No wards found</div>
                                          <div className="text-sm mt-1">Try a different search term</div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2">
                                <label className="block text-base font-semibold text-gray-800">
                                  Village / Estate
                                </label>
                                <input
                                  type="text"
                                  name="village"
                                  value={formData.village}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all text-gray-800 text-base"
                                  placeholder="Enter village or estate name"
                                />
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-8"
                      >
                        {/* Contact Information */}
                        <motion.div variants={itemVariants} className="space-y-6">
                          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                            <FiMail className="mr-2 text-blue-600" /> Contact Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="block text-base font-semibold text-gray-800">
                                Email Address *
                              </label>
                              <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                  type="email"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-base"
                                  placeholder="student@example.com"
                                  required
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="block text-base font-semibold text-gray-800">
                                Phone Number *
                              </label>
                              <div className="relative">
                                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                  type="tel"
                                  name="phone"
                                  value={formData.phone}
                                  onChange={handleChange}
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-base"
                                  placeholder="0712 345 678"
                                  required
                                />
                              </div>
                              <p className="text-sm text-gray-600 mt-1">Format: 07XXXXXXXX or 01XXXXXXXX</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-base font-semibold text-gray-800">
                              Alternative Phone
                            </label>
                            <input
                              type="tel"
                              name="alternativePhone"
                              value={formData.alternativePhone}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-base"
                              placeholder="Optional alternative number"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="block text-base font-semibold text-gray-800">
                                Postal Address *
                              </label>
                              <div className="relative">
                                <FiHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                  type="text"
                                  name="postalAddress"
                                  value={formData.postalAddress}
                                  onChange={handleChange}
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-base"
                                  placeholder="P.O. Box 123-10100, Nairobi"
                                  required
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="block text-base font-semibold text-gray-800">
                                Postal Code
                              </label>
                              <input
                                type="text"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-base"
                                placeholder="10100"
                              />
                            </div>
                          </div>
                        </motion.div>

                        {/* Parent/Guardian Information */}
                        <motion.div variants={itemVariants} className="space-y-6">
                          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                            <FiUsers className="mr-2 text-blue-600" /> Parent/Guardian Information
                          </h3>
                          
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                            <h4 className="font-semibold text-blue-800 mb-4 flex items-center text-lg">
                              <FiUser className="mr-2" /> Father's Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="block text-base font-semibold text-gray-800">
                                  Full Name
                                </label>
                                <input
                                  type="text"
                                  name="fatherName"
                                  value={formData.fatherName}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-base"
                                  placeholder="Father's full name"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-base font-semibold text-gray-800">
                                  Phone Number
                                </label>
                                <input
                                  type="tel"
                                  name="fatherPhone"
                                  value={formData.fatherPhone}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-base"
                                  placeholder="Father's phone"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-base font-semibold text-gray-800">
                                  Email
                                </label>
                                <input
                                  type="email"
                                  name="fatherEmail"
                                  value={formData.fatherEmail}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-base"
                                  placeholder="father@example.com"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-base font-semibold text-gray-800">
                                  Occupation
                                </label>
                                <input
                                  type="text"
                                  name="fatherOccupation"
                                  value={formData.fatherOccupation}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-base"
                                  placeholder="Father's occupation"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200">
                            <h4 className="font-semibold text-pink-800 mb-4 flex items-center text-lg">
                              <FiUser className="mr-2" /> Mother's Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {['motherName', 'motherPhone', 'motherEmail', 'motherOccupation'].map((field) => (
                                <div key={field} className="space-y-2">
                                  <label className="block text-base font-semibold text-gray-800">
                                    {field === 'motherName' && 'Full Name'}
                                    {field === 'motherPhone' && 'Phone Number'}
                                    {field === 'motherEmail' && 'Email'}
                                    {field === 'motherOccupation' && 'Occupation'}
                                  </label>
                                  <input
                                    type={field.includes('Email') ? 'email' : field.includes('Phone') ? 'tel' : 'text'}
                                    name={field}
                                    value={formData[field]}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-gray-800 text-base"
                                    placeholder={
                                      field === 'motherName' ? "Mother's full name" :
                                      field === 'motherPhone' ? "Mother's phone" :
                                      field === 'motherEmail' ? "mother@example.com" :
                                      "Mother's occupation"
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                            <h4 className="font-semibold text-emerald-800 mb-4 flex items-center text-lg">
                              <FiUser className="mr-2" /> Guardian Information (If applicable)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {['guardianName', 'guardianPhone', 'guardianEmail', 'guardianOccupation'].map((field) => (
                                <div key={field} className="space-y-2">
                                  <label className="block text-base font-semibold text-gray-800">
                                    {field === 'guardianName' && 'Full Name'}
                                    {field === 'guardianPhone' && 'Phone Number'}
                                    {field === 'guardianEmail' && 'Email'}
                                    {field === 'guardianOccupation' && 'Occupation'}
                                  </label>
                                  <input
                                    type={field.includes('Email') ? 'email' : field.includes('Phone') ? 'tel' : 'text'}
                                    name={field}
                                    value={formData[field]}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800 text-base"
                                    placeholder="Optional"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-8"
                      >
                        {/* Academic Information */}
                        <motion.div variants={itemVariants} className="space-y-6">
                          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                            <FiBook className="mr-2 text-blue-600" /> Academic Background
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="block text-base font-semibold text-gray-800">
                                Previous School *
                              </label>
                              <div className="relative">
                                <FiBook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                  type="text"
                                  name="previousSchool"
                                  value={formData.previousSchool}
                                  onChange={handleChange}
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-base"
                                  placeholder="Name of previous school"
                                  required
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="block text-base font-semibold text-gray-800">
                                Previous Class *
                              </label>
                              <input
                                type="text"
                                name="previousClass"
                                value={formData.previousClass}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-base"
                                placeholder="e.g., Class 8, Form 2"
                                required
                              />
                            </div>
                          </div>
                        </motion.div>

                        {/* KCPE Results */}
                        <motion.div variants={itemVariants} className="space-y-6">
                          <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl p-6 border border-yellow-200">
                            <h3 className="text-xl font-semibold text-yellow-800 mb-4 flex items-center">
                              <FiAward className="mr-2" /> KCPE Results (If Applicable)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-2">
                                <label className="block text-base font-semibold text-gray-800">
                                  KCPE Year
                                </label>
                                <input
                                  type="number"
                                  name="kcpeYear"
                                  value={formData.kcpeYear}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all text-gray-800 text-base"
                                  placeholder="2024"
                                  min="2000"
                                  max="2025"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="block text-base font-semibold text-gray-800">
                                  KCPE Index
                                </label>
                                <input
                                  type="text"
                                  name="kcpeIndex"
                                  value={formData.kcpeIndex}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all text-gray-800 text-base"
                                  placeholder="12345678901"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="block text-base font-semibold text-gray-800">
                                  KCPE Marks
                                </label>
                                <input
                                  type="number"
                                  name="kcpeMarks"
                                  value={formData.kcpeMarks}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all text-gray-800 text-base"
                                  placeholder="0-500"
                                  min="0"
                                  max="500"
                                />
                                {formData.kcpeMarks && (
                                  <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                                        style={{ width: `${(formData.kcpeMarks / 500) * 100}%` }}
                                      ></div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 text-right font-medium">
                                      {formData.kcpeMarks}/500 ({((formData.kcpeMarks / 500) * 100).toFixed(1)}%)
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="block text-base font-semibold text-gray-800">
                                  Mean Grade
                                </label>
                                <select
                                  name="meanGrade"
                                  value={formData.meanGrade}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all text-gray-800 text-base"
                                >
                                  <option value="" className="text-gray-400">Select Grade</option>
                                  {meanGrades.map(grade => (
                                    <option key={grade} value={grade} className="text-gray-800">{grade}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        {/* Stream Selection with Visual Cards */}
                        <motion.div variants={itemVariants} className="space-y-6">
                          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                            🎯 Preferred Stream *
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {streams.map(stream => (
                              <motion.label
                                key={stream.value}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all duration-300 ${
                                  formData.preferredStream === stream.value
                                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-lg'
                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="preferredStream"
                                  value={stream.value}
                                  checked={formData.preferredStream === stream.value}
                                  onChange={handleChange}
                                  className="sr-only"
                                  required
                                />
                                <div className="flex flex-col items-center">
                                  <span className="text-3xl mb-2">{stream.icon}</span>
                                  <div className="font-bold text-gray-800 mb-1 text-lg">{stream.label}</div>
                                  <div className="text-xs text-gray-600 text-center">
                                    {stream.value === 'SCIENCE' && 'Physics, Chemistry, Biology, Math'}
                                    {stream.value === 'ARTS' && 'Languages, Humanities, Arts'}
                                    {stream.value === 'BUSINESS' && 'Commerce, Accounting, Economics'}
                                    {stream.value === 'TECHNICAL' && 'Technical Drawing, Computer, Metalwork'}
                                  </div>
                                </div>
                                {formData.preferredStream === stream.value && (
                                  <div className="absolute top-3 right-3">
                                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                                      <FiCheckCircle className="text-white text-sm" />
                                    </div>
                                  </div>
                                )}
                              </motion.label>
                            ))}
                          </div>
                        </motion.div>

                        {/* Medical and Interests - 3 columns or 2 columns based on screen */}
                        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          <div className="space-y-6 lg:col-span-2">
                            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                              <FiActivity className="mr-2 text-blue-600" /> Medical Information
                            </h3>
                            
                            <div className="space-y-2">
                              <label className="block text-base font-semibold text-gray-800">
                                Medical Conditions
                              </label>
                              <textarea
                                name="medicalCondition"
                                value={formData.medicalCondition}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-base min-h-[120px]"
                                placeholder="Any medical conditions we should be aware of..."
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="block text-base font-semibold text-gray-800">
                                  Allergies
                                </label>
                                <textarea
                                  name="allergies"
                                  value={formData.allergies}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-base min-h-[80px]"
                                  placeholder="Food, drug allergies..."
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="block text-base font-semibold text-gray-800">
                                  Blood Group
                                </label>
                                <select
                                  name="bloodGroup"
                                  value={formData.bloodGroup}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-base"
                                >
                                  <option value="" className="text-gray-400">Select Blood Group</option>
                                  {bloodGroups.map(group => (
                                    <option key={group} value={group} className="text-gray-800">{group}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                              <FiHeart className="mr-2 text-red-600" /> Talents & Interests
                            </h3>
                            
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="block text-base font-semibold text-gray-800">
                                  Sports Interests
                                </label>
                                <textarea
                                  name="sportsInterests"
                                  value={formData.sportsInterests}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-gray-800 text-base min-h-[80px]"
                                  placeholder="Football, Basketball, Athletics..."
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="block text-base font-semibold text-gray-800">
                                  Club Interests
                                </label>
                                <textarea
                                  name="clubsInterests"
                                  value={formData.clubsInterests}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-gray-800 text-base min-h-[80px]"
                                  placeholder="Debate, Science Club, Drama..."
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="block text-base font-semibold text-gray-800">
                                  Special Talents
                                </label>
                                <textarea
                                  name="talents"
                                  value={formData.talents}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-gray-800 text-base min-h-[80px]"
                                  placeholder="Music, Art, Public Speaking..."
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}

                    {step === 4 && (
                      <motion.div
                        key="step4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-8"
                      >
                        {/* Review Header */}
                        <motion.div variants={itemVariants} className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl p-8 border border-green-200">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                              <FiEye className="text-2xl text-green-600" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-green-800 mb-2">
                                Review Your Application
                              </h3>
                              <p className="text-green-700 font-medium">
                                Please verify all information carefully. Once submitted, changes cannot be made.
                              </p>
                            </div>
                          </div>
                        </motion.div>

                        {/* Review Sections */}
                        {[
                          {
                            title: '👤 Personal Information',
                            icon: FiUser,
                            color: 'blue',
                            fields: [
                              { label: 'Full Name', value: `${formData.firstName} ${formData.middleName || ''} ${formData.lastName}`.trim() },
                              { label: 'Gender', value: formData.gender },
                              { label: 'Date of Birth', value: formData.dateOfBirth, extra: formData.dateOfBirth ? `(Age: ${calculateAge(formData.dateOfBirth)} years)` : '' },
                              { label: 'Nationality', value: formData.nationality },
                              { label: 'County', value: formData.county },
                              { label: 'Constituency', value: formData.constituency },
                              { label: 'Ward', value: formData.ward },
                              { label: 'Village', value: formData.village || 'Not provided' },
                            ]
                          },
                          {
                            title: '📱 Contact Information',
                            icon: FiPhone,
                            color: 'purple',
                            fields: [
                              { label: 'Email', value: formData.email },
                              { label: 'Phone', value: formData.phone },
                              { label: 'Alternative Phone', value: formData.alternativePhone || 'Not provided' },
                              { label: 'Postal Address', value: formData.postalAddress },
                              { label: 'Postal Code', value: formData.postalCode || 'Not provided' },
                            ]
                          },
                          {
                            title: '👨‍👩‍👧‍👦 Parent/Guardian Information',
                            icon: FiUsers,
                            color: 'pink',
                            fields: [
                              { label: "Father's Name", value: formData.fatherName || 'Not provided' },
                              { label: "Father's Phone", value: formData.fatherPhone || 'Not provided' },
                              { label: "Mother's Name", value: formData.motherName || 'Not provided' },
                              { label: "Mother's Phone", value: formData.motherPhone || 'Not provided' },
                            ]
                          },
                          {
                            title: '🎓 Academic Information',
                            icon: FiBook,
                            color: 'yellow',
                            fields: [
                              { label: 'Previous School', value: formData.previousSchool },
                              { label: 'Previous Class', value: formData.previousClass },
                              { label: 'Preferred Stream', value: streams.find(s => s.value === formData.preferredStream)?.label },
                              ...(formData.kcpeYear ? [{ label: 'KCPE Year', value: formData.kcpeYear }] : []),
                              ...(formData.kcpeMarks ? [{ label: 'KCPE Marks', value: formData.kcpeMarks }] : []),
                              ...(formData.meanGrade ? [{ label: 'Mean Grade', value: formData.meanGrade }] : []),
                            ]
                          },
                          {
                            title: '⚕️ Health & Interests',
                            icon: FiActivity,
                            color: 'green',
                            fields: [
                              { label: 'Medical Conditions', value: formData.medicalCondition || 'None reported' },
                              { label: 'Allergies', value: formData.allergies || 'None reported' },
                              { label: 'Blood Group', value: formData.bloodGroup || 'Not specified' },
                              { label: 'Sports Interests', value: formData.sportsInterests || 'Not specified' },
                              { label: 'Clubs Interests', value: formData.clubsInterests || 'Not specified' },
                              { label: 'Special Talents', value: formData.talents || 'Not specified' },
                            ]
                          }
                        ].map((section, sectionIndex) => (
                          <motion.div 
                            key={section.title}
                            variants={itemVariants}
                            className="border-2 border-gray-200 rounded-2xl overflow-hidden"
                          >
                            <div className={`bg-gradient-to-r from-${section.color}-50 to-${section.color}-100 px-6 py-4 border-b border-${section.color}-200`}>
                              <h4 className="font-bold text-gray-800 text-lg flex items-center">
                                <section.icon className={`mr-3 text-${section.color}-600`} />
                                {section.title}
                              </h4>
                            </div>
                            <div className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {section.fields.map((field, fieldIndex) => (
                                  <div key={fieldIndex} className="space-y-1">
                                    <div className="text-sm text-gray-700 font-semibold">{field.label}</div>
                                    <div className="font-semibold text-gray-900 text-lg">
                                      {field.value}
                                      {field.extra && (
                                        <span className="text-sm text-gray-600 ml-2">{field.extra}</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        ))}

                        {/* Terms and Conditions */}
                        <motion.div variants={itemVariants} className="space-y-6">
                          <h3 className="text-xl font-semibold text-gray-800">📜 Terms & Conditions</h3>
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 space-y-4 border border-gray-200">
                            <label className="flex items-start space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                required
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-1"
                              />
                              <span className="text-gray-800 font-medium">
                                I certify that all information provided is accurate to the best of my knowledge and belief.
                              </span>
                            </label>
                            <label className="flex items-start space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                required
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-1"
                              />
                              <span className="text-gray-800 font-medium">
                                I agree to the terms and conditions of Katwanyaa High School's admission process and understand that providing false information may lead to disqualification.
                              </span>
                            </label>
                            <label className="flex items-start space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                required
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-1"
                              />
                              <span className="text-gray-800 font-medium">
                                I consent to the school processing my personal data for admission purposes in accordance with the Data Protection Act.
                              </span>
                            </label>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Form Footer with Navigation - 3 buttons for Preview/Submit */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-100 px-8 py-6 border-t border-gray-200">
                  <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="text-sm text-gray-700 font-medium">
                      {step === 4 ? 'Ready to submit?' : `Step ${step} of 4`}
                    </div>
                    
                    <div className="flex space-x-4">
                      {step > 1 && step < 5 && (
                        <motion.button
                          type="button"
                          onClick={prevStep}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all hover:shadow-md flex items-center shadow-sm"
                        >
                          <FiArrowRight className="mr-2 rotate-180" /> Back
                        </motion.button>
                      )}
                      
                      {step < 4 ? (
                        <motion.button
                          type="button"
                          onClick={nextStep}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all hover:shadow-lg flex items-center shadow-md"
                        >
                          Continue <FiArrowRight className="ml-2" />
                        </motion.button>
                      ) : step === 4 && (
                        <div className="flex space-x-4">
                          <motion.button
                            type="button"
                            onClick={prevStep}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all hover:shadow-md flex items-center shadow-sm"
                          >
                            <FiEye className="mr-2" /> Preview
                          </motion.button>
                          
                          <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.05 }}
                            whileTap={{ scale: loading ? 1 : 0.95 }}
                            className="px-10 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all hover:shadow-lg flex items-center disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                          >
                            {loading ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Submitting Application...
                              </>
                            ) : (
                              <>
                                <FiCheckCircle className="mr-2 text-lg" /> 
                                Submit Application
                              </>
                            )}
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Modern Footer */}
        <div className="mt-12 text-center relative z-10">
          <div className="bg-gradient-to-r from-blue-50/80 to-emerald-50/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-100 mb-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-3">📞 Need Assistance?</h3>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-700">
              <div className="flex items-center">
                <FiPhone className="mr-2 text-blue-600" />
                <span>Admissions: <strong className="text-gray-900">0712 345 678</strong></span>
              </div>
              <div className="flex items-center">
                <FiMail className="mr-2 text-green-600" />
                <span>Email: <strong className="text-gray-900">admissions@katwanyaa.ac.ke</strong></span>
              </div>
              <div className="flex items-center">
                <FiHome className="mr-2 text-purple-600" />
                <span>Office Hours: <strong className="text-gray-900">Mon-Fri, 8:00 AM - 5:00 PM</strong></span>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm font-medium">
            © {new Date().getFullYear()} Katwanyaa High School. Excellence Through Discipline and Diligence.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            All applications are processed in accordance with our privacy policy and data protection regulations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KatwanyaaAdmission;