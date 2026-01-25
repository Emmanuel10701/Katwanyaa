'use client';
import { useState, useEffect, useRef } from 'react'; // Added useRef import
import { Toaster, toast } from 'sonner';
import { 
  FaSchool, FaEdit, FaTrash, FaPlus, FaChartBar,
  FaGraduationCap, FaVideo, FaMapMarkerAlt, FaPhone, 
  FaEnvelope, FaGlobe, FaClock, FaChevronRight, 
  FaChevronLeft, FaExclamationTriangle, FaCheckCircle, 
  FaTimesCircle, FaSave, FaTimes, FaEye, FaCalendar, 
  FaUsers, FaChalkboardTeacher, FaBook, FaRocket,
  FaArrowRight, FaBuilding, FaQuoteLeft, FaPlay,
  FaShieldAlt, FaAward, FaUserCheck, FaHourglassHalf,
  FaBookOpen, FaUsersCog, FaFileAlt, FaCalendarAlt,
  FaBriefcase, FaStethoscope, FaLaptopCode, FaCalculator,
  FaFlask, FaTools
} from 'react-icons/fa';

import { CircularProgress, Modal, Box, TextField, TextareaAutosize } from '@mui/material';

// Modern Loading Spinner Component
function ModernLoadingSpinner({ message = "Loading school information...", size = "medium" }) {
  const sizes = {
    small: { outer: 48, inner: 24 },
    medium: { outer: 64, inner: 32 },
    large: { outer: 80, inner: 40 }
  };

  const { outer, inner } = sizes[size];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/20 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="relative">
            <CircularProgress 
              size={outer} 
              thickness={5}
              className="text-indigo-600"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full animate-ping opacity-25"
                   style={{ width: inner, height: inner }}></div>
            </div>
          </div>
          <div className="absolute -inset-6 bg-gradient-to-r from-indigo-100 to-violet-100 rounded-full blur-xl opacity-30 animate-pulse"></div>
        </div>
        
        <div className="mt-6 space-y-3">
          <span className="block text-lg font-bold text-gray-800">
            {message}
          </span>
          
          <div className="flex justify-center space-x-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" 
                   style={{ animationDelay: `${i * 0.15}s` }}></div>
            ))}
          </div>
          
          <p className="text-gray-500 text-sm mt-2">
            Please wait while we fetch school information
          </p>
        </div>
      </div>
    </div>
  );
}

// Tag Input Component
function TagInput({ label, tags, onTagsChange, placeholder = "Type and press Enter..." }) {
  const [inputValue, setInputValue] = useState('');

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTags = [...tags, inputValue.trim()];
      onTagsChange(newTags);
      setInputValue('');
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    onTagsChange(newTags);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-sm font-bold"
        />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
          Press Enter to add
        </span>
      </div>
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-3 py-2 rounded-lg border border-blue-200 text-sm font-bold"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(index)}
                className="ml-1 text-blue-500 hover:text-blue-700 transition-colors"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Modern Video Upload Component
function ModernVideoUpload({ 
  videoType, 
  videoPath, 
  youtubeLink, 
  onVideoChange, 
  onYoutubeLinkChange, 
  onRemove, 
  label = "Video Tour"
}) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localYoutubeLink, setLocalYoutubeLink] = useState(youtubeLink || '');
  const fileInputRef = useRef(null);

  const isValidYouTubeUrl = (url) => {
    if (!url || url.trim() === '') return false;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return youtubeRegex.test(url.trim());
  };

  const handleYoutubeLinkChange = (e) => {
    const url = e.target.value;
    setLocalYoutubeLink(url);
    if (onYoutubeLinkChange) {
      onYoutubeLinkChange(url);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const file = files[0];
    
    // Client-side validation for video file size
    const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
    
    if (file.size > MAX_VIDEO_SIZE) {
      toast.error(`Video file too large. Maximum size: 100MB. Your file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file type
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/x-m4v', 'video/quicktime'];
    if (!allowedVideoTypes.includes(file.type)) {
      toast.error('Invalid video format. Only MP4, WebM, and OGG files are allowed');
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 20;
      });
    }, 100);

    // Set the file and trigger the parent callback
    if (onVideoChange) {
      onVideoChange(file);
    }
    
    // Clear YouTube link when uploading local video
    setLocalYoutubeLink('');
    if (onYoutubeLinkChange) {
      onYoutubeLinkChange('');
    }
    
    setTimeout(() => setUploadProgress(0), 1000);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileChange({ target: { files: [file] } });
    }
  };

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (onRemove) {
      onRemove();
    }
    
    if (onYoutubeLinkChange) {
      onYoutubeLinkChange('');
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
        <FaVideo className="text-purple-500" />
        <span>{label}</span>
      </label>
      
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">YouTube URL</label>
          <div className="relative">
            <FaVideo className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-500" />
            <input
              type="url"
              value={localYoutubeLink}
              onChange={handleYoutubeLinkChange}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white text-sm font-bold"
            />
          </div>
          {localYoutubeLink && !isValidYouTubeUrl(localYoutubeLink) && (
            <p className="text-red-500 text-[10px] mt-1 font-bold italic">Please enter a valid YouTube URL</p>
          )}
        </div>

        <div className="text-center text-gray-300 text-[10px] font-bold">OR</div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Local Video File (MP4)</label>
          
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer group ${
              dragOver 
                ? 'border-blue-400 bg-blue-50 ring-4 ring-blue-50' 
                : 'border-gray-200 hover:border-blue-300 bg-gray-50/50'
            } ${localYoutubeLink ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDrop={!localYoutubeLink ? handleDrop : undefined}
            onDragOver={!localYoutubeLink ? (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); } : undefined}
            onDragLeave={!localYoutubeLink ? () => setDragOver(false) : undefined}
            onClick={!localYoutubeLink ? () => fileInputRef.current?.click() : undefined}
          >
            <div className="relative">
              <FaVideo className={`mx-auto text-2xl mb-2 transition-all duration-300 ${
                dragOver ? 'text-blue-500 scale-110' : 'text-gray-400 group-hover:text-blue-500'
              }`} />
            </div>
            <p className="text-gray-700 mb-1 font-bold text-xs uppercase">
              {localYoutubeLink ? 'YouTube link selected' : dragOver ? 'Drop Video Now' : 'Click to Upload Video'}
            </p>
            <p className="text-[10px] text-gray-500">MP4, WebM, MOV, M4V (Max 100MB)</p>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="video/mp4,video/x-m4v,video/*,video/quicktime" 
              onChange={handleFileChange} 
              className="hidden" 
              id="video-upload"
              disabled={localYoutubeLink}
            />
          </div>
        </div>
      </div>
      
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Uploading...</span>
            <span className="text-xs font-black text-purple-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-500"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

// Video Modal Component
function VideoModal({ open, onClose, videoType, videoPath }) {
  const extractYouTubeId = (url) => {
    if (!url || typeof url !== 'string') return null;
    
    const patterns = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const videoId = videoType === 'youtube' ? extractYouTubeId(videoPath) : null;

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl bg-black rounded-lg overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-black bg-opacity-70 text-white rounded-full w-8 h-8 flex items-center justify-center z-10 hover:bg-opacity-100 transition"
        >
          ✕
        </button>
        
        {videoType === 'youtube' && videoId && (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              className="absolute top-0 left-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="School Video Tour"
            />
          </div>
        )}
        
        {videoType === 'file' && videoPath && (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <video
              controls
              autoPlay
              className="absolute top-0 left-0 w-full h-full"
              src={videoPath}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}
        
        {(!videoPath || !videoId) && videoType === 'youtube' && (
          <div className="p-8 text-center text-white">
            <FaVideo className="text-4xl mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400">No video available</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Modern Delete Confirmation Modal
function ModernDeleteModal({ onClose, onConfirm, loading }) {
  const [confirmText, setConfirmText] = useState('');

  const handleConfirm = () => {
    if (confirmText === "DELETE SCHOOL INFO") {
      onConfirm();
    } else {
      toast.error('Please type "DELETE SCHOOL INFO" exactly to confirm deletion');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-xl">
              <FaExclamationTriangle className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Confirm Deletion</h2>
              <p className="text-red-100 opacity-90 text-xs mt-0.5">This action cannot be undone</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="text-center">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2 border border-red-200">
              <FaTrash className="text-red-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete All School Information?</h3>
            <p className="text-gray-600 text-xs">This will permanently delete ALL school information.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Type <span className="font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs">"DELETE SCHOOL INFO"</span> to confirm:
            </label>
            <input 
              type="text" 
              value={confirmText} 
              onChange={(e) => setConfirmText(e.target.value)} 
              placeholder='Type "DELETE SCHOOL INFO" here'
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 text-sm font-bold"
            />
          </div>
        </div>

        <div className="flex gap-2 p-3 border-t border-gray-200 bg-gray-50">
          <button 
            onClick={onClose} 
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg transition-all duration-300 font-bold disabled:opacity-50 cursor-pointer text-sm"
          >
            <FaTimesCircle className="text-sm" /> Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            disabled={loading || confirmText !== "DELETE SCHOOL INFO"}
            className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-3 rounded-lg transition-all duration-300 font-bold shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
          >
            {loading ? (
              <>
                <CircularProgress size={12} className="text-white" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <FaTrash /> Delete Forever
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Video Thumbnail Component
function VideoThumbnail({ videoType, videoPath, onClick }) {
  const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    
    const patterns = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
      }
    }
    return null;
  };

  const thumbnail = videoType === 'youtube' 
    ? getYouTubeThumbnail(videoPath) 
    : '/cumpus.jpg';

  return (
    <div 
      className="relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow max-w-md"
      onClick={onClick}
    >
      <div className="relative pb-[56.25%]">
        {thumbnail ? (
          <img 
            src={thumbnail}
            alt="Video Thumbnail" 
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <FaVideo className={`text-4xl ${videoType === 'youtube' ? 'text-red-500' : 'text-blue-500'}`} />
          </div>
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center hover:bg-opacity-20 transition">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${videoType === 'youtube' ? 'bg-red-600' : 'bg-blue-600'}`}>
            <FaPlay className="text-white ml-1" />
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          {videoType === 'youtube' ? (
            <>
              <FaVideo className="text-red-500" />
              <span className="text-sm font-bold text-gray-700">YouTube Video</span>
            </>
          ) : (
            <>
              <FaVideo className="text-blue-500" />
              <span className="text-sm font-bold text-gray-700">School Video</span>
            </>
          )}
        </div>
        <span className="text-sm text-blue-600 font-bold hover:text-blue-800 transition">
          Watch Now
        </span>
      </div>
    </div>
  );
}

// School Info Modal Component (MODERNIZED)
function ModernSchoolModal({ onClose, onSave, school, loading: parentLoading }) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const [formData, setFormData] = useState(() => ({
    name: school?.name || '',
    description: school?.description || '',
    motto: school?.motto || '',
    vision: school?.vision || '',
    mission: school?.mission || '',
    studentCount: school?.studentCount?.toString() || '',
    staffCount: school?.staffCount?.toString() || '',
    openDate: school?.openDate ? new Date(school.openDate).toISOString().split('T')[0] : '',
    closeDate: school?.closeDate ? new Date(school.closeDate).toISOString().split('T')[0] : '',
    subjects: school?.subjects || [],
    departments: school?.departments || [],
    youtubeLink: school?.videoType === 'youtube' ? school.videoTour : '',
    feesDay: school?.feesDay?.toString() || '',
    feesBoarding: school?.feesBoarding?.toString() || '',
    admissionOpenDate: school?.admissionOpenDate ? new Date(school.admissionOpenDate).toISOString().split('T')[0] : '',
    admissionCloseDate: school?.admissionCloseDate ? new Date(school.admissionCloseDate).toISOString().split('T')[0] : '',
    admissionRequirements: school?.admissionRequirements || '',
    admissionFee: school?.admissionFee?.toString() || '',
    admissionCapacity: school?.admissionCapacity?.toString() || '',
    admissionContactEmail: school?.admissionContactEmail || '',
    admissionContactPhone: school?.admissionContactPhone || '',
    admissionWebsite: school?.admissionWebsite || '',
    admissionLocation: school?.admissionLocation || '',
    admissionOfficeHours: school?.admissionOfficeHours || '',
    admissionDocumentsRequired: school?.admissionDocumentsRequired || []
  }));

  const [videoFile, setVideoFile] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const steps = [
    { 
      id: 'basic', 
      label: 'Basic Info', 
      icon: FaBuilding, 
      description: 'School identity and values' 
    },
    { 
      id: 'academic', 
      label: 'Academic', 
      icon: FaGraduationCap, 
      description: 'Academic calendar and media' 
    },
    { 
      id: 'admission', 
      label: 'Admission', 
      icon: FaUserCheck, 
      description: 'Admission details' 
    }
  ];

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setActionLoading(true);
      
      // Prepare form data
      const data = new FormData();
      
      // Add basic info
      Object.keys(formData).forEach(key => {
        if (Array.isArray(formData[key])) {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key] || '');
        }
      });
      
      // Add video file if present
      if (videoFile) {
        data.append('videoTour', videoFile);
      }
      
      // Call API
      const response = await fetch('/api/school-info', {
        method: school ? 'PUT' : 'POST',
        body: data
      });

      if (!response.ok) {
        throw new Error('Failed to save school information');
      }

      const result = await response.json();
      
      toast.success(result.message || (school ? 'Updated successfully!' : 'Created successfully!'));
      onSave(result.school);
      onClose();
      
    } catch (error) {
      console.error('Save failed:', error);
      toast.error(error.message || 'Failed to save school information');
    } finally {
      setActionLoading(false);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = (e) => {
    e.preventDefault();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (field, tags) => {
    setFormData(prev => ({ ...prev, [field]: tags }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim() && formData.studentCount.trim() && formData.staffCount.trim();
      case 1:
        return formData.openDate.trim() && formData.closeDate.trim();
      case 2:
        return true;
      default:
        return true;
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '95vw',
        maxWidth: '1080px',
        maxHeight: '95vh',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        {/* MODERN HEADER */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                <FaSchool className="text-lg" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold">{school ? 'Update School Information' : 'Create School Information'}</h2>
                <p className="text-blue-100 opacity-90 text-xs mt-0.5">
                  Step {currentStep + 1} of {steps.length}: {steps[currentStep].description}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 cursor-pointer">
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        {/* MODERN STEP INDICATOR */}
        <div className="bg-white border-b border-gray-200 p-3">
          <div className="flex flex-wrap justify-center items-center gap-2 md:space-x-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(index)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-sm font-bold ${
                    index === currentStep 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : index < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <step.icon className="text-xs" />
                  <span className="font-bold">{step.label}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-4 h-0.5 mx-1.5 md:w-6 ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-h-[calc(95vh-160px)] overflow-y-auto scrollbar-custom p-4 md:p-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <FaBuilding className="text-blue-600" /> School Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Enter school name..."
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-bold"
                        required
                      />
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <FaUsers className="text-green-600" /> Student Count <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.studentCount}
                        onChange={(e) => handleChange('studentCount', e.target.value)}
                        placeholder="Enter number of students..."
                        className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm font-bold"
                        required
                      />
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <FaChalkboardTeacher className="text-orange-600" /> Staff Count <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.staffCount}
                        onChange={(e) => handleChange('staffCount', e.target.value)}
                        placeholder="Enter number of staff..."
                        className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-sm font-bold"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <FaQuoteLeft className="text-purple-600" /> School Motto
                      </label>
                      <input
                        type="text"
                        value={formData.motto}
                        onChange={(e) => handleChange('motto', e.target.value)}
                        placeholder="Enter school motto..."
                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm font-bold"
                      />
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-5 border border-indigo-200">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <FaEye className="text-indigo-600" /> Vision Statement
                      </label>
                      <TextareaAutosize
                        minRows={3}
                        value={formData.vision}
                        onChange={(e) => handleChange('vision', e.target.value)}
                        placeholder="Enter vision statement..."
                        className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none bg-white text-sm font-bold"
                      />
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-5 border border-emerald-200">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <FaRocket className="text-emerald-600" /> Mission Statement
                      </label>
                      <TextareaAutosize
                        minRows={3}
                        value={formData.mission}
                        onChange={(e) => handleChange('mission', e.target.value)}
                        placeholder="Enter mission statement..."
                        className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none bg-white text-sm font-bold"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200">
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FaFileAlt className="text-gray-600" /> School Description
                  </label>
                  <TextareaAutosize
                    minRows={4}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe your school..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-none bg-white text-sm font-bold"
                  />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
                      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FaCalendar className="text-blue-600" />
                        Academic Calendar
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-2">
                            Opening Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={formData.openDate}
                            onChange={(e) => handleChange('openDate', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-bold"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-2">
                            Closing Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={formData.closeDate}
                            onChange={(e) => handleChange('closeDate', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-bold"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200">
                      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FaBook className="text-purple-600" />
                        Academic Programs
                      </h3>
                      
                      <div className="space-y-4">
                        <TagInput 
                          label="Subjects"
                          tags={formData.subjects}
                          onTagsChange={(tags) => handleTagsChange('subjects', tags)}
                          placeholder="Type subject and press Enter..."
                        />
                        
                        <TagInput 
                          label="Departments"
                          tags={formData.departments}
                          onTagsChange={(tags) => handleTagsChange('departments', tags)}
                          placeholder="Type department and press Enter..."
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <ModernVideoUpload 
                      videoType={school?.videoType}
                      videoPath={school?.videoTour}
                      youtubeLink={formData.youtubeLink}
                      onVideoChange={setVideoFile}
                      onYoutubeLinkChange={(link) => handleChange('youtubeLink', link)}
                      onRemove={() => setVideoFile(null)}
                      label="School Video Tour"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <FaCalendarAlt className="text-blue-600" /> Admission Opening Date
                      </label>
                      <input
                        type="date"
                        value={formData.admissionOpenDate}
                        onChange={(e) => handleChange('admissionOpenDate', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-bold"
                      />
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 border border-red-200">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <FaHourglassHalf className="text-red-600" /> Admission Closing Date
                      </label>
                      <input
                        type="date"
                        value={formData.admissionCloseDate}
                        onChange={(e) => handleChange('admissionCloseDate', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-sm font-bold"
                      />
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <FaCheckCircle className="text-green-600" /> Admission Fee (KES)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.admissionFee}
                        onChange={(e) => handleChange('admissionFee', e.target.value)}
                        placeholder="Enter admission fee"
                        className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm font-bold"
                      />
                    </div>
                    
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-5 border border-cyan-200">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <FaUsers className="text-cyan-600" /> Admission Capacity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.admissionCapacity}
                        onChange={(e) => handleChange('admissionCapacity', e.target.value)}
                        placeholder="Number of available slots"
                        className="w-full px-4 py-3 border-2 border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-sm font-bold"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-5 border border-indigo-200">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <FaEnvelope className="text-indigo-600" /> Admission Contact Email
                      </label>
                      <input
                        type="email"
                        value={formData.admissionContactEmail}
                        onChange={(e) => handleChange('admissionContactEmail', e.target.value)}
                        placeholder="admissions@school.edu"
                        className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm font-bold"
                      />
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <FaPhone className="text-purple-600" /> Admission Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.admissionContactPhone}
                        onChange={(e) => handleChange('admissionContactPhone', e.target.value)}
                        placeholder="+254 XXX XXX XXX"
                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm font-bold"
                      />
                    </div>
                    
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-5 border border-teal-200">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <FaGlobe className="text-teal-600" /> Admission Website
                      </label>
                      <input
                        type="url"
                        value={formData.admissionWebsite}
                        onChange={(e) => handleChange('admissionWebsite', e.target.value)}
                        placeholder="https://school.edu/admissions"
                        className="w-full px-4 py-3 border-2 border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-sm font-bold"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-orange-600" /> Admission Location
                    </label>
                    <input
                      type="text"
                      value={formData.admissionLocation}
                      onChange={(e) => handleChange('admissionLocation', e.target.value)}
                      placeholder="Admission office location"
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-sm font-bold"
                    />
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-5 border border-pink-200">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <FaClock className="text-pink-600" /> Admission Office Hours
                    </label>
                    <input
                      type="text"
                      value={formData.admissionOfficeHours}
                      onChange={(e) => handleChange('admissionOfficeHours', e.target.value)}
                      placeholder="e.g., 8:00 AM - 5:00 PM"
                      className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white text-sm font-bold"
                    />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-5 border border-yellow-200">
                  <TagInput 
                    label="Required Documents for Admission"
                    tags={formData.admissionDocumentsRequired}
                    onTagsChange={(tags) => handleTagsChange('admissionDocumentsRequired', tags)}
                    placeholder="Type document name and press Enter..."
                  />
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200">
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FaFileAlt className="text-gray-600" /> Admission Requirements
                  </label>
                  <TextareaAutosize
                    minRows={4}
                    value={formData.admissionRequirements}
                    onChange={(e) => handleChange('admissionRequirements', e.target.value)}
                    placeholder="Describe admission requirements..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-none bg-white text-sm font-bold"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 font-bold">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-bold">Step {currentStep + 1} of {steps.length}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {currentStep > 0 && (
                  <button 
                    type="button"
                    onClick={handlePrevStep}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition duration-200 font-bold disabled:opacity-50 cursor-pointer text-sm w-full sm:w-auto"
                  >
                    ← Previous
                  </button>
                )}
                
                {currentStep < steps.length - 1 ? (
                  <button 
                    type="button"
                    onClick={handleNextStep}
                    disabled={!isStepValid()}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition duration-200 font-bold shadow disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                  >
                    Continue →
                  </button>
                ) : (
                  <button 
                    type="submit"
                    disabled={actionLoading || !isStepValid()}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition duration-200 font-bold shadow disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                  >
                    {actionLoading ? (
                      <>
                        <CircularProgress size={16} className="text-white" />
                        <span>{school ? 'Updating...' : 'Creating...'}</span>
                      </>
                    ) : (
                      <>
                        <FaSave className="text-sm" />
                        <span>{school ? 'Update School Info' : 'Create School Info'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </Box>
    </Modal>
  );
}

// API Service for School Info
const schoolApiService = {
  async getSchoolInfo() {
    try {
      const response = await fetch('/api/school-info');
      if (!response.ok) {
        throw new Error('Failed to fetch school information');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async deleteSchoolInfo() {
    try {
      const response = await fetch('/api/school-info', {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete school information');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

export default function SchoolInfoPage() {
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    loadSchoolInfo();
  }, []);

  const loadSchoolInfo = async () => {
    try {
      setLoading(true);
      const data = await schoolApiService.getSchoolInfo();
      setSchoolInfo(data.school || data);
    } catch (error) {
      console.error('Error loading school info:', error);
      setSchoolInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchool = async (schoolData) => {
    try {
      setActionLoading(true);
      const isUpdate = schoolInfo !== null;
      
      const response = await fetch('/api/school-info', {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schoolData)
      });

      if (!response.ok) {
        throw new Error('Failed to save school information');
      }

      const result = await response.json();
      setSchoolInfo(result.school);
      toast.success(result.message || (isUpdate ? 'Updated successfully!' : 'Created successfully!'));
      setShowModal(false);
      
      await loadSchoolInfo();
      
    } catch (error) {
      console.error('Save failed:', error);
      toast.error(error.message || 'Failed to save school information');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSchool = async () => {
    try {
      setActionLoading(true);
      await schoolApiService.deleteSchoolInfo();
      setSchoolInfo(null);
      setShowDeleteModal(false);
      toast.success('School information deleted successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to delete school information!');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !schoolInfo) {
    return <ModernLoadingSpinner message="Loading school information..." size="medium" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4 md:p-6">
      <Toaster position="top-right" richColors />

      <style jsx global>{`
        .scrollbar-custom {
          scrollbar-width: thin;
          scrollbar-color: #4f46e5 #e5e7eb;
        }
        
        .scrollbar-custom::-webkit-scrollbar {
          width: 8px;
        }
        
        .scrollbar-custom::-webkit-scrollbar-track {
          background: #e5e7eb;
          border-radius: 4px;
        }
        
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #4f46e5;
          border-radius: 4px;
        }
        
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #4338ca;
        }
      `}</style>

      {schoolInfo?.videoTour && (
        <VideoModal
          open={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          videoType={schoolInfo.videoType}
          videoPath={schoolInfo.videoTour}
        />
      )}

      {/* MODERN HEADER */}
      <div className="relative bg-gradient-to-br from-[#1e40af] via-[#7c3aed] to-[#2563eb] rounded-[2.5rem] shadow-[0_20px_50px_rgba(31,38,135,0.37)] p-6 md:p-10 mb-10 border border-white/20 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-5%] w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md ring-1 ring-white/40 shadow-inner group transition-all duration-500 hover:bg-white/20">
                <FaSchool className="text-white text-3xl group-hover:scale-100 transition-transform" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md border border-emerald-400/30 backdrop-blur-md">
                    Verified Institution
                  </span>
                  <FaShieldAlt className="text-blue-300 text-[10px]" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter drop-shadow-sm">
                  {schoolInfo?.name || 'School Information'}
                </h1>
              </div>
            </div>
            
            <p className="text-blue-50/80 text-sm md:text-lg font-bold max-w-2xl leading-relaxed">
              Manage school identity, academic calendar, admission details, and institutional information.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full xl:w-auto bg-white/10 backdrop-blur-lg sm:bg-transparent p-4 sm:p-0 rounded-[2rem] sm:rounded-none shadow-lg sm:shadow-none border border-white/20 sm:border-none">
            
            <button 
              onClick={loadSchoolInfo} 
              disabled={loading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 sm:py-2.5 rounded-xl hover:bg-white/90 transition-all duration-200 font-bold text-sm shadow-lg active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <CircularProgress size={16} color="inherit" thickness={6} />
              ) : (
                <FaChartBar className="text-sm" /> 
              )}
              <span className="whitespace-nowrap font-bold">
                {loading ? 'Syncing...' : 'Refresh Info'}
              </span>
            </button>
            
            {schoolInfo && (
              <button 
                onClick={() => setShowDeleteModal(true)} 
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/30 px-6 py-3 sm:py-2.5 rounded-xl hover:bg-white/20 transition-all duration-200 font-bold text-sm active:scale-[0.98]"
              >
                <FaTrash className="text-sm" /> 
                <span className="whitespace-nowrap font-bold">Delete</span>
              </button>
            )}
            
            <button 
              onClick={() => setShowModal(true)} 
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-xl hover:bg-white/90 transition-all duration-200 font-bold text-sm shadow-lg active:scale-[0.98]"
            >
              {schoolInfo ? (
                <>
                  <FaEdit className="text-sm" />
                  <span className="whitespace-nowrap font-bold">Update Profile</span>
                </>
              ) : (
                <>
                  <FaPlus className="text-sm" />
                  <span className="whitespace-nowrap font-bold">Initialize</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {schoolInfo ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5 px-4 py-3 bg-white border-2 border-blue-50 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaGraduationCap className="text-blue-600 text-lg" />
                    </div>
                    <span className="text-slate-800 text-[15px] font-bold tracking-tight">
                      {schoolInfo.studentCount?.toLocaleString()} <span className="text-slate-500 font-bold">Students</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 px-4 py-3 bg-white border-2 border-green-50 rounded-xl shadow-sm hover:border-green-200 transition-colors">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaChalkboardTeacher className="text-green-600 text-lg" />
                    </div>
                    <span className="text-slate-800 text-[15px] font-bold tracking-tight">
                      {schoolInfo.staffCount?.toLocaleString()} <span className="text-slate-500 font-bold">Staff</span>
                    </span>
                  </div>

                  {schoolInfo.motto && (
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-50/40 border-2 border-amber-100/50 rounded-xl shadow-sm">
                      <FaQuoteLeft className="text-amber-500 text-sm" />
                      <span className="text-amber-900 text-[15px] font-bold italic tracking-wide">
                        "{schoolInfo.motto}"
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {schoolInfo.description && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                  <h3 className="text-base font-bold text-gray-900">School Overview</h3>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                  <p className="text-gray-700 text-base leading-relaxed tracking-tight font-bold">{schoolInfo.description}</p>
                </div>
              </div>
            )}

            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                <h3 className="text-base font-bold text-gray-900">Our Guiding Principles</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {schoolInfo.vision && (
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-blue-50/50 p-6 border border-blue-100/80 shadow-[0_4px_20px_rgba(59,130,246,0.08)]">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full"></div>
                    
                    <div className="relative flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                        <FaEye className="text-white text-lg" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-base font-bold text-gray-900">Our Vision</h4>
                          <div className="w-8 h-0.5 bg-blue-200 rounded-full"></div>
                        </div>
                        <p className="text-gray-700 text-base leading-relaxed pl-0.5 font-bold">{schoolInfo.vision}</p>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-4 left-4 w-8 h-1 bg-gradient-to-r from-blue-500/30 to-blue-400/10 rounded-full"></div>
                  </div>
                )}
                
                {schoolInfo.mission && (
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-emerald-50/50 p-6 border border-emerald-100/80 shadow-[0_4px_20px_rgba(16,185,129,0.08)]">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full"></div>
                    
                    <div className="relative flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
                        <FaRocket className="text-white text-lg" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-base font-bold text-gray-900">Our Mission</h4>
                          <div className="w-8 h-0.5 bg-emerald-200 rounded-full"></div>
                        </div>
                        <p className="text-gray-700 text-base leading-relaxed pl-0.5 font-bold">{schoolInfo.mission}</p>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-4 left-4 w-8 h-1 bg-gradient-to-r from-emerald-500/30 to-emerald-400/10 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>

            {schoolInfo.videoTour && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <FaVideo className="text-red-500" />
                  Video Tour
                </h3>
                <div className="max-w-md">
                  <VideoThumbnail
                    videoType={schoolInfo.videoType}
                    videoPath={schoolInfo.videoTour}
                    onClick={() => setShowVideoModal(true)}
                  />
                </div>
              </div>
            )}

            <div className="mb-10 space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 shadow-sm transition-transform hover:scale-100">
                  <FaGraduationCap className="text-purple-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Academic Information</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Institutional Milestones & Curriculum</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50/50 rounded-bl-[60px] -z-0 group-hover:bg-blue-100/60 transition-colors" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-5">
                      <FaCalendarAlt className="text-blue-500" />
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tighter">Academic Calendar</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <FaClock className="text-[10px] text-emerald-500" />
                          <span className="text-[11px] font-bold text-slate-400 uppercase">Opening</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          {new Date(schoolInfo.openDate).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <FaClock className="text-[10px] text-rose-500" />
                          <span className="text-[11px] font-bold text-slate-400 uppercase">Closing</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          {new Date(schoolInfo.closeDate).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {Array.isArray(schoolInfo.subjects) && schoolInfo.subjects.length > 0 && (
                  <div className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50/50 rounded-bl-[60px] -z-0 group-hover:bg-purple-100/60 transition-colors" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-5">
                        <FaBookOpen className="text-purple-500" />
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tighter">Subjects Offered</h4>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {schoolInfo.subjects.map((subject, index) => (
                          <span 
                            key={index} 
                            className="bg-white hover:bg-purple-600 hover:text-white border border-purple-100 text-purple-700 px-3 py-2 rounded-xl text-[11px] font-bold transition-all cursor-default shadow-sm"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {Array.isArray(schoolInfo.departments) && schoolInfo.departments.length > 0 && (
                  <div className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50/50 rounded-bl-[60px] -z-0 group-hover:bg-orange-100/60 transition-colors" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-5">
                        <FaUsersCog className="text-orange-500" />
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tighter">Departments</h4>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {schoolInfo.departments.map((dept, index) => (
                          <span 
                            key={index} 
                            className="bg-slate-900 text-white px-3 py-2 rounded-xl text-[11px] font-bold hover:bg-orange-500 transition-colors shadow-lg shadow-slate-200"
                          >
                            {dept}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(schoolInfo.admissionOpenDate || schoolInfo.admissionContactEmail) && (
              <div className="mb-10 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-200">
                      <FaUserCheck className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Admission Details</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enrolment & Direct Inquiry</p>
                    </div>
                  </div>
                  
                  {schoolInfo.admissionCloseDate && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-tighter">Admissions Active</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-2 group bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-100 transition-transform duration-500">
                      <FaCalendarAlt size={120} className="text-white" />
                    </div>
                    
                    <div className="relative z-10">
                      <h4 className="text-xs font-bold text-orange-400 uppercase tracking-[0.2em] mb-6">Timeline</h4>
                      
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                            <FaArrowRight className="text-white text-xs rotate-[-45deg]" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Registration Opens</p>
                            <p className="text-lg font-bold text-white">
                              {new Date(schoolInfo.admissionOpenDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                            <FaHourglassHalf className="text-orange-400 text-xs" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Closing Deadline</p>
                            <p className="text-lg font-bold text-white">
                              {new Date(schoolInfo.admissionCloseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-3 bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Inquiry Suite</h4>
                        {schoolInfo.admissionCapacity && (
                          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                            <FaUsers className="text-slate-400 text-xs" />
                            <span className="text-[11px] font-bold text-slate-700">{schoolInfo.admissionCapacity.toLocaleString()} Slots</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {schoolInfo.admissionContactEmail && (
                          <a href={`mailto:${schoolInfo.admissionContactEmail}`} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:text-blue-600 transition-colors">
                              <FaEnvelope size={12} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Email Registry</p>
                              <p className="text-xs font-bold text-slate-700 truncate">{schoolInfo.admissionContactEmail}</p>
                            </div>
                          </a>
                        )}

                        {schoolInfo.admissionContactPhone && (
                          <a href={`tel:${schoolInfo.admissionContactPhone}`} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:text-emerald-600 transition-colors">
                              <FaPhone size={12} />
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Direct Line</p>
                              <p className="text-xs font-bold text-slate-700">{schoolInfo.admissionContactPhone}</p>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>

                    {schoolInfo.admissionWebsite && (
                      <div className="mt-6">
                        <a 
                          href={schoolInfo.admissionWebsite} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-between bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-2xl transition-all group shadow-lg shadow-slate-200"
                        >
                          <div className="flex items-center gap-3">
                            <FaGlobe className="text-blue-400" />
                            <span className="text-xs font-bold uppercase tracking-widest">Portal Access</span>
                          </div>
                          <FaArrowRight className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-100">
            <FaSchool className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No School Information Found</h3>
          <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto font-bold">
            Set up your school information to showcase your institution to students and parents.
          </p>
          <button 
            onClick={() => setShowModal(true)} 
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition duration-200 font-bold shadow flex items-center gap-2 mx-auto text-sm cursor-pointer"
          >
            <FaPlus /> Create School Information
          </button>
        </div>
      )}

      {showModal && (
        <ModernSchoolModal 
          onClose={() => setShowModal(false)} 
          onSave={handleSaveSchool}
          school={schoolInfo}
          loading={actionLoading}
        />
      )}

      {showDeleteModal && (
        <ModernDeleteModal 
          onClose={() => setShowDeleteModal(false)} 
          onConfirm={handleDeleteSchool} 
          loading={actionLoading} 
        />
      )}
    </div>
  );
}